import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';

export default function CodeEditor({ code, onChange, language = 'javascript' }) {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col h-full">
            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={language}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={(val) => onChange(val ?? '')}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        wordWrap: 'on',
                        tabSize: 4,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        scrollbar: { verticalScrollbarSize: 6 },
                    }}
                />
            </div>
        </div>
    );
}
