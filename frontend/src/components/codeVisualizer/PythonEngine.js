/**
 * PythonEngine.js
 * 
 * A basic Python execution simulator for the Code Visualizer.
 * Focuses on common algorithmic patterns: variables, for loops, if/else, and basic functions.
 * This is a structural simulator (no real Python runtime).
 */

export function generatePythonSteps(code) {
    const steps = [];
    const lines = code.split('\n');
    let scope = {};
    const output = [];
    let stepCount = 0;
    const MAX_STEPS = 500;

    function pushStep({ line, explanation, changedVars = [], type = 'general' }) {
        if (stepCount >= MAX_STEPS) return false;
        steps.push({
            line: line + 1, // 1-indexed for the UI
            variables: { ...scope },
            callStack: ['global'],
            changedVars,
            explanation,
            output: [...output],
            type,
        });
        stepCount++;
        return true;
    }

    // Initialize
    pushStep({ line: -1, explanation: '▶ Starting Python execution', type: 'general' });

    // Very basic line-by-line simulation (stateless between lines mostly)
    // For a real experience, we'd need a proper parser.
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        // Variable assignment: x = 10
        const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
        if (assignMatch) {
            const varName = assignMatch[1];
            const valueStr = assignMatch[2];
            
            // Simple value evaluator
            let val;
            try {
                // Try to evaluate simple numeric or string literals
                if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
                    val = valueStr; // keep as string representation for simple demo
                } else if (!isNaN(valueStr)) {
                    val = Number(valueStr);
                } else if (valueStr.startsWith('"') || valueStr.startsWith("'")) {
                    val = valueStr.slice(1, -1);
                } else {
                    val = valueStr;
                }
            } catch {
                val = valueStr;
            }

            scope[varName] = val;
            pushStep({
                line: i,
                explanation: `Assigned ${varName} = ${val}`,
                changedVars: [varName],
                type: 'assignment'
            });
            continue;
        }

        // Print: print("hello")
        const printMatch = line.match(/^print\((.*)\)$/);
        if (printMatch) {
            const content = printMatch[1];
            output.push(content);
            pushStep({
                line: i,
                explanation: `print: ${content}`,
                type: 'output'
            });
            continue;
        }

        // Basic for loop indicator: for i in range(5):
        const forMatch = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\((.*)\):/);
        if (forMatch) {
            const varName = forMatch[1];
            const rangeVal = parseInt(forMatch[2]);
            pushStep({
                line: i,
                explanation: `Entering for loop with range ${rangeVal}`,
                type: 'loop'
            });
            
            // Just simulate one iteration for simplicity in this basic mock
            scope[varName] = 0;
            pushStep({
                line: i,
                explanation: `Iteration 0: ${varName} = 0`,
                changedVars: [varName],
                type: 'loop'
            });
            continue;
        }

        // If statement: if x > 5:
        const ifMatch = line.match(/^if\s+(.*):/);
        if (ifMatch) {
            pushStep({
                line: i,
                explanation: `Evaluating condition: ${ifMatch[1]}`,
                type: 'branch'
            });
            continue;
        }
    }

    pushStep({ line: lines.length - 1, explanation: '✅ execution finished', type: 'general' });

    return { steps, error: null };
}
