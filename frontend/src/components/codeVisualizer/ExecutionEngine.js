/**
 * ExecutionEngine.js
 * 
 * A sandboxed JavaScript execution simulator.
 * Uses acorn to parse code → walks the AST → produces an ordered list of "steps".
 * NO eval, NO Function constructor. Pure structural simulation.
 */

import * as acorn from 'acorn';
import { generatePythonSteps } from './PythonEngine';
import { generateCppSteps } from './CppEngine';

const MAX_STEPS = 500;
const MAX_LOOP_ITERATIONS = 100;

// ─── Helpers ────────────────────────────────────────────────────────────────

function cloneVars(scope) {
    // Deep-clone a variables map for immutable snapshots
    const result = {};
    for (const [key, val] of Object.entries(scope)) {
        try {
            result[key] = JSON.parse(JSON.stringify(val));
        } catch {
            result[key] = String(val);
        }
    }
    return result;
}

function formatValue(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (Array.isArray(val)) return `[${val.map(formatValue).join(', ')}]`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

// --- Dispatcher ---
export function generateSteps(code, language = 'javascript') {
    if (language === 'python') {
        return generatePythonSteps(code);
    }
    if (['c', 'cpp', 'java'].includes(language)) {
        return generateCppSteps(code, language);
    }
    // Default to JS
    return generateJavascriptSteps(code);
}

function generateJavascriptSteps(code) {
    const steps = [];
    let ast;

    // ── Parse ──
    try {
        ast = acorn.parse(code, {
            ecmaVersion: 2020,
            sourceType: 'script',
            locations: true,
        });
    } catch (err) {
        return {
            error: `Syntax Error: ${err.message}`,
            steps: [],
        };
    }

    // ── Runtime state ──
    const scope = {};           // variable name → value
    const callStack = ['global'];
    const output = [];
    let stepCount = 0;

    function pushStep({ line, explanation, changedVars = [], type = 'general' }) {
        if (stepCount >= MAX_STEPS) return false;
        steps.push({
            line,
            variables: cloneVars(scope),
            callStack: [...callStack],
            changedVars,
            explanation,
            output: [...output],
            type,
        });
        stepCount++;
        return true;
    }

    // ── Expression evaluator ──
    function evalExpr(node) {
        if (!node) return undefined;
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return scope.hasOwnProperty(node.name) ? scope[node.name] : undefined;
            case 'UnaryExpression': {
                const arg = evalExpr(node.argument);
                switch (node.operator) {
                    case '-': return -arg;
                    case '+': return +arg;
                    case '!': return !arg;
                    case 'typeof': return typeof arg;
                    default: return undefined;
                }
            }
            case 'BinaryExpression': {
                const left = evalExpr(node.left);
                const right = evalExpr(node.right);
                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return right !== 0 ? left / right : NaN;
                    case '%': return left % right;
                    case '**': return Math.pow(left, right);
                    case '<': return left < right;
                    case '>': return left > right;
                    case '<=': return left <= right;
                    case '>=': return left >= right;
                    case '===': return left === right;
                    case '!==': return left !== right;
                    case '==': return left == right; // eslint-disable-line
                    case '!=': return left != right; // eslint-disable-line
                    case '&&': return left && right;
                    case '||': return left || right;
                    default: return undefined;
                }
            }
            case 'LogicalExpression': {
                const l = evalExpr(node.left);
                if (node.operator === '&&') return l ? evalExpr(node.right) : l;
                if (node.operator === '||') return l ? l : evalExpr(node.right);
                if (node.operator === '??') return l !== null && l !== undefined ? l : evalExpr(node.right);
                return undefined;
            }
            case 'UpdateExpression': {
                const name = node.argument.name;
                if (name && scope.hasOwnProperty(name)) {
                    const before = scope[name];
                    if (node.operator === '++') scope[name]++;
                    if (node.operator === '--') scope[name]--;
                    return node.prefix ? scope[name] : before;
                }
                return undefined;
            }
            case 'AssignmentExpression': {
                const val = evalExpr(node.right);
                if (node.left.type === 'Identifier') {
                    const name = node.left.name;
                    switch (node.operator) {
                        case '=': scope[name] = val; break;
                        case '+=': scope[name] = (scope[name] || 0) + val; break;
                        case '-=': scope[name] = (scope[name] || 0) - val; break;
                        case '*=': scope[name] = (scope[name] || 0) * val; break;
                        case '/=': scope[name] = (scope[name] || 0) / val; break;
                        default: scope[name] = val;
                    }
                    return scope[name];
                }
                return val;
            }
            case 'ConditionalExpression': {
                const test = evalExpr(node.test);
                return test ? evalExpr(node.consequent) : evalExpr(node.alternate);
            }
            case 'ArrayExpression':
                return node.elements.map(el => el ? evalExpr(el) : undefined);
            case 'ObjectExpression': {
                const obj = {};
                for (const prop of node.properties) {
                    obj[prop.key.name || prop.key.value] = evalExpr(prop.value);
                }
                return obj;
            }
            case 'TemplateLiteral': {
                let str = '';
                for (let i = 0; i < node.quasis.length; i++) {
                    str += node.quasis[i].value.cooked || '';
                    if (i < node.expressions.length) {
                        str += String(evalExpr(node.expressions[i]));
                    }
                }
                return str;
            }
            case 'CallExpression': {
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'console' &&
                    node.callee.property.name === 'log'
                ) {
                    const args = node.arguments.map(a => formatValue(evalExpr(a)));
                    return args.join(' ');
                }
                if (node.callee.name === 'Math') return undefined;
                // Math.* calls
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'Math'
                ) {
                    const fn = node.callee.property.name;
                    const args = node.arguments.map(a => evalExpr(a));
                    if (Math[fn]) return Math[fn](...args);
                }
                if (node.callee.name === 'String') return String(evalExpr(node.arguments[0]));
                if (node.callee.name === 'Number') return Number(evalExpr(node.arguments[0]));
                if (node.callee.name === 'parseInt') return parseInt(evalExpr(node.arguments[0]), 10);
                if (node.callee.name === 'parseFloat') return parseFloat(evalExpr(node.arguments[0]));
                return undefined;
            }
            default:
                return undefined;
        }
    }

    // ── Statement walker ──
    function execStatement(node) {
        if (!pushStep) return;
        const ln = node.loc?.start?.line ?? 0;

        switch (node.type) {
            case 'VariableDeclaration': {
                for (const decl of node.declarations) {
                    const name = decl.id.name;
                    const val = decl.init ? evalExpr(decl.init) : undefined;
                    scope[name] = val;
                    const ok = pushStep({
                        line: ln,
                        explanation: `${node.kind} ${name} = ${formatValue(val)}`,
                        changedVars: [name],
                        type: 'declaration',
                    });
                    if (!ok) return;
                }
                break;
            }

            case 'ExpressionStatement': {
                const expr = node.expression;
                if (expr.type === 'AssignmentExpression') {
                    const name = expr.left.name;
                    const oldVal = scope[name];
                    const newVal = evalExpr(expr);
                    const ok = pushStep({
                        line: ln,
                        explanation: `${name} = ${formatValue(newVal)} (was ${formatValue(oldVal)})`,
                        changedVars: [name],
                        type: 'assignment',
                    });
                    if (!ok) return;
                } else if (expr.type === 'UpdateExpression') {
                    const name = expr.argument.name;
                    const before = scope[name];
                    evalExpr(expr);
                    const ok = pushStep({
                        line: ln,
                        explanation: `${name}${expr.operator} → ${formatValue(scope[name])} (was ${formatValue(before)})`,
                        changedVars: [name],
                        type: 'assignment',
                    });
                    if (!ok) return;
                } else if (
                    expr.type === 'CallExpression' &&
                    expr.callee.type === 'MemberExpression' &&
                    expr.callee.object.name === 'console' &&
                    expr.callee.property.name === 'log'
                ) {
                    const args = expr.arguments.map(a => formatValue(evalExpr(a)));
                    const msg = args.join(' ');
                    output.push(msg);
                    const ok = pushStep({
                        line: ln,
                        explanation: `console.log(${msg})`,
                        changedVars: [],
                        type: 'output',
                    });
                    if (!ok) return;
                } else {
                    evalExpr(expr);
                    const ok = pushStep({
                        line: ln,
                        explanation: `Expression evaluated`,
                        changedVars: [],
                        type: 'general',
                    });
                    if (!ok) return;
                }
                break;
            }

            case 'IfStatement': {
                const condition = evalExpr(node.test);
                const ok = pushStep({
                    line: ln,
                    explanation: `if (${condition}) → ${condition ? 'true → entering block' : 'false → skipping block'}`,
                    changedVars: [],
                    type: 'branch',
                });
                if (!ok) return;
                if (condition) {
                    execBlock(node.consequent);
                } else if (node.alternate) {
                    const altLine = node.alternate.loc?.start?.line ?? ln;
                    pushStep({
                        line: altLine,
                        explanation: `else branch entered`,
                        changedVars: [],
                        type: 'branch',
                    });
                    execBlock(node.alternate);
                }
                break;
            }

            case 'ForStatement': {
                // Init
                if (node.init) execStatement(node.init);
                let iterations = 0;
                while (iterations < MAX_LOOP_ITERATIONS && stepCount < MAX_STEPS) {
                    const condition = node.test ? evalExpr(node.test) : true;
                    const condLine = node.test?.loc?.start?.line ?? ln;
                    pushStep({
                        line: condLine,
                        explanation: `for loop condition: ${condition ? 'true → continue' : 'false → exit loop'}`,
                        changedVars: [],
                        type: 'loop',
                    });
                    if (!condition) break;
                    execBlock(node.body);
                    if (node.update) execStatement({ ...node.update, type: 'ExpressionStatement', expression: node.update });
                    iterations++;
                }
                if (iterations >= MAX_LOOP_ITERATIONS) {
                    pushStep({ line: ln, explanation: `⚠️ Loop limit reached (${MAX_LOOP_ITERATIONS} iterations)`, changedVars: [], type: 'general' });
                }
                break;
            }

            case 'WhileStatement': {
                let iterations = 0;
                while (iterations < MAX_LOOP_ITERATIONS && stepCount < MAX_STEPS) {
                    const condition = evalExpr(node.test);
                    pushStep({
                        line: ln,
                        explanation: `while (${condition}) → ${condition ? 'continue' : 'exit'}`,
                        changedVars: [],
                        type: 'loop',
                    });
                    if (!condition) break;
                    execBlock(node.body);
                    iterations++;
                }
                if (iterations >= MAX_LOOP_ITERATIONS) {
                    pushStep({ line: ln, explanation: `⚠️ Loop limit reached (${MAX_LOOP_ITERATIONS} iterations)`, changedVars: [], type: 'general' });
                }
                break;
            }

            case 'FunctionDeclaration': {
                scope[node.id.name] = `[Function: ${node.id.name}]`;
                pushStep({
                    line: ln,
                    explanation: `Function "${node.id.name}" declared`,
                    changedVars: [node.id.name],
                    type: 'declaration',
                });
                break;
            }

            case 'ReturnStatement': {
                const val = node.argument ? evalExpr(node.argument) : undefined;
                pushStep({
                    line: ln,
                    explanation: `return ${formatValue(val)}`,
                    changedVars: [],
                    type: 'return',
                });
                break;
            }

            case 'BlockStatement':
                execBlock(node);
                break;

            default:
                break;
        }
    }

    function execBlock(node) {
        if (!node) return;
        const stmts = node.type === 'BlockStatement' ? node.body : [node];
        for (const stmt of stmts) {
            execStatement(stmt);
            if (stepCount >= MAX_STEPS) break;
        }
    }

    // ── Initial step ──
    pushStep({
        line: 0,
        explanation: '▶ Program starts',
        changedVars: [],
        type: 'general',
    });

    // ── Walk top-level body ──
    for (const node of ast.body) {
        execStatement(node);
        if (stepCount >= MAX_STEPS) break;
    }

    // ── Final step ──
    pushStep({
        line: 0,
        explanation: '✅ Program finished',
        changedVars: [],
        type: 'general',
    });

    return { steps, error: null };
}
