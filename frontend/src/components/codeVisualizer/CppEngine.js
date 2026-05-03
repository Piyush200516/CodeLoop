/**
 * CppEngine.js
 * 
 * A generalized simulator for C-style syntax used by C, C++, and Java.
 * Focuses on common algorithmic patterns: variable declarations, loops, and output statements.
 * This is a structural simulator (not a real compiler).
 */

export function generateCppSteps(code, language = 'cpp') {
    const steps = [];
    const lines = code.split('\n');
    let scope = {};
    const output = [];
    let stepCount = 0;
    const MAX_STEPS = 500;

    function pushStep({ line, explanation, changedVars = [], type = 'general' }) {
        if (stepCount >= MAX_STEPS) return false;
        steps.push({
            line: line + 1,
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
    pushStep({ line: -1, explanation: `▶ Starting ${language.toUpperCase()} execution`, type: 'general' });

    for (let i = 0; i < lines.length; i++) {
        let rawLine = lines[i];
        let line = rawLine.trim();

        // Skip comments and empty lines
        if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

        // --- Variable Declaration/Assignment ---
        // Match: int x = 5; or double y = 1.2; or String s = "abc";
        const declMatch = line.match(/^(?:int|long|double|float|float|char|bool|auto|String)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/);
        // Match: x = 10;
        const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*([^;]+);/);

        const match = declMatch || assignMatch;
        if (match) {
            const varName = match[1];
            let value = match[2].trim();
            
            // Basic value cleanup
            if (value.startsWith('"')) value = value.replace(/"/g, '');
            if (!isNaN(value)) value = Number(value);

            scope[varName] = value;
            pushStep({
                line: i,
                explanation: `Assigned ${varName} = ${value}`,
                changedVars: [varName],
                type: 'assignment'
            });
            continue;
        }

        // --- Output Statements ---
        // cout << "hi";
        if (line.includes('cout <<')) {
            const parts = line.split('<<').slice(1).map(p => p.trim().replace(/;|endl/g, '').replace(/"/g, ''));
            const msg = parts.join('');
            output.push(msg);
            pushStep({ line: i, explanation: `Output: ${msg}`, type: 'output' });
            continue;
        }
        // printf("hi");
        if (line.includes('printf(')) {
            const msg = line.match(/printf\("(.*)"\)/)?.[1] || "printf";
            output.push(msg);
            pushStep({ line: i, explanation: `Output: ${msg}`, type: 'output' });
            continue;
        }
        // System.out.println("hi");
        if (line.includes('System.out.print')) {
            const msg = line.match(/print(?:ln)?\("(.*)"\)/)?.[1] || "println";
            output.push(msg);
            pushStep({ line: i, explanation: `Output: ${msg}`, type: 'output' });
            continue;
        }

        // --- Loops ---
        // for (int i = 0; i < 5; i++)
        const forMatch = line.match(/^for\s*\(([^;]+);([^;]+);([^)]+)\)/);
        if (forMatch) {
            pushStep({ line: i, explanation: `Entering for loop: ${forMatch[0]}`, type: 'loop' });
            continue;
        }
        // while (condition)
        const whileMatch = line.match(/^while\s*\(([^)]+)\)/);
        if (whileMatch) {
            pushStep({ line: i, explanation: `Checking while condition: ${whileMatch[1]}`, type: 'loop' });
            continue;
        }

        // --- Branching ---
        const ifMatch = line.match(/^if\s*\(([^)]+)\)/);
        if (ifMatch) {
            pushStep({ line: i, explanation: `Evaluating if (${ifMatch[1]})`, type: 'branch' });
            continue;
        }
    }

    pushStep({ line: lines.length - 1, explanation: '✅ execution finished', type: 'general' });

    return { steps, error: null };
}
