import React, { useState, useEffect, useRef } from 'react';
import { runCCode, ExecutionResult } from './cCompiler';
import { Play, Square, CheckCircle2, AlertTriangle, Clock, RefreshCw, Terminal, Code2, CornerDownLeft } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  code: string;
  input: string;
}

const TEST_PRESETS: TestCase[] = [
  {
    id: 'hello',
    name: '1. Hello World',
    description: 'Basic printf test',
    code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    input: ''
  },
  {
    id: 'scanf',
    name: '2. scanf() Input',
    description: 'Reads numbers from stdin and prints results',
    code: `#include <stdio.h>

int main() {
    int a, b;
    printf("Reading numbers from stdin...\\n");
    if (scanf("%d %d", &a, &b) == 2) {
        printf("Received: a = %d, b = %d\\n", a, b);
        printf("Sum = %d\\n", a + b);
        printf("Product = %d\\n", a * b);
    } else {
        printf("Failed to read two integers from stdin.\\n");
    }
    return 0;
}`,
    input: '15 25'
  },
  {
    id: 'invalid',
    name: '3. Invalid C Code',
    description: 'Syntax error detection',
    code: `#include <stdio.h>

int main() {
    int missing_semicolon = 42
    printf("Value: %d\\n", missing_semicolon);
    invalid_token ???
    return 0;
}`,
    input: ''
  },
  {
    id: 'infinite',
    name: '4. Infinite Loop Timeout',
    description: 'Worker termination safety test',
    code: `#include <stdio.h>

int main() {
    printf("Starting infinite loop test...\\n");
    int counter = 0;
    while (1) {
        counter++;
    }
    printf("This will never print.\\n");
    return 0;
}`,
    input: ''
  },
  {
    id: 'twosum',
    name: '5. Two Sum (10 20 -> 30)',
    description: 'scanf("%d %d", &a, &b) and printf("%d", a + b)',
    code: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}`,
    input: '10 20'
  }
];

export default function App() {
  const [activePreset, setActivePreset] = useState<string>('hello');
  const [code, setCode] = useState<string>(TEST_PRESETS[0].code);
  const [stdin, setStdin] = useState<string>(TEST_PRESETS[0].input);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [timeoutLimit, setTimeoutLimit] = useState<number>(2500);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadPreset = (preset: TestCase) => {
    setActivePreset(preset.id);
    setCode(preset.code);
    setStdin(preset.input);
    setResult(null);
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);

    try {
      const res = await runCCode(code, stdin, timeoutLimit);
      setResult(res);
    } catch (err: any) {
      setResult({
        output: '',
        error: err?.message || String(err),
        durationMs: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Shortcut: Cmd+Enter or Ctrl+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, stdin, isRunning, timeoutLimit]);

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800">
      {/* Top Header */}
      <header id="header" className="border-b border-neutral-800 bg-neutral-900/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-800 rounded-md text-amber-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-neutral-100 flex items-center gap-2">
              Browser C Compiler
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                100% In-Browser • Web Worker
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Client-side C execution engine with sandboxed timeout protection. No backend server required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded border border-neutral-800">
            <span>Timeout limit:</span>
            <select
              id="timeout-select"
              value={timeoutLimit}
              onChange={(e) => setTimeoutLimit(Number(e.target.value))}
              className="bg-neutral-800 text-neutral-200 rounded px-2 py-0.5 border border-neutral-700 text-xs focus:outline-none focus:border-neutral-500"
            >
              <option value={1000}>1.0s</option>
              <option value={2000}>2.0s</option>
              <option value={2500}>2.5s (Default)</option>
              <option value={5000}>5.0s</option>
            </select>
          </div>

          <button
            id="run-code-btn"
            onClick={handleRun}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md font-medium text-xs tracking-wide flex items-center gap-2 transition-colors ${
              isRunning
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Code
                <span className="text-[10px] opacity-70 ml-1">⌘↵</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Preset Test Case Bar */}
      <nav id="test-presets-bar" className="bg-neutral-900 border-b border-neutral-800 px-6 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-neutral-400 mr-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          Test Cases:
        </span>
        {TEST_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => loadPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                isSelected
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
              }`}
              title={preset.description}
            >
              {preset.name}
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Layout */}
      <main id="main-content" className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 overflow-hidden">
        {/* Left Column: Code Editor & stdin */}
        <section id="editor-section" className="flex flex-col h-full bg-neutral-950 min-h-[400px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-b border-neutral-800">
            <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-neutral-400" />
              main.c
            </span>
            <span className="text-[11px] text-neutral-500">
              C Standard (C99 / C11 syntax)
            </span>
          </div>

          {/* Code Textarea with line numbers */}
          <div className="flex-1 relative flex overflow-hidden font-mono text-xs bg-neutral-950">
            {/* Line Numbers */}
            <div className="select-none py-3 px-3 text-right bg-neutral-950 text-neutral-600 border-r border-neutral-900 w-12 shrink-0 leading-5">
              {lineNumbers.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            {/* Editor Area */}
            <textarea
              id="c-code-editor"
              ref={textareaRef}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setActivePreset('custom');
              }}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-neutral-200 resize-none outline-none leading-5 font-mono overflow-auto selection:bg-neutral-800"
              placeholder="#include <stdio.h>\n\nint main() {\n    return 0;\n}"
            />
          </div>

          {/* stdin Input Section */}
          <div id="stdin-container" className="border-t border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="stdin-input" className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <CornerDownLeft className="w-3.5 h-3.5 text-neutral-400" />
                Standard Input (stdin)
              </label>
              <span className="text-[11px] text-neutral-500">
                Provided to scanf() & getchar()
              </span>
            </div>
            <textarea
              id="stdin-input"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter inputs here (e.g. 15 25)..."
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-xs font-mono text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-700 resize-none"
            />
          </div>
        </section>

        {/* Right Column: Execution Output & Error Panel */}
        <section id="output-section" className="flex flex-col h-full bg-neutral-950 min-h-[400px]">
          {/* Output Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/50 border-b border-neutral-800">
            <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              Terminal Output & Diagnostics
            </span>
            {result && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  {result.durationMs}ms
                </span>
                {result.exitCode !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    result.exitCode === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    exit {result.exitCode}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Terminal Body */}
          <div id="terminal-body" className="flex-1 p-4 font-mono text-xs overflow-auto flex flex-col gap-3">
            {!result && !isRunning && (
              <div className="text-neutral-600 italic select-none py-8 text-center">
                Click <span className="text-neutral-400 font-medium">"Run Code"</span> or select one of the test presets above to execute C in your browser.
              </div>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 text-neutral-400 py-4 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Compiling and running in sandboxed Web Worker...
              </div>
            )}

            {result && (
              <>
                {/* Status Banner */}
                {result.error ? (
                  <div
                    id="status-error-banner"
                    className="p-3 rounded-md bg-red-950/40 border border-red-900/70 text-red-300 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-red-200">
                        {result.error.includes('timed out') ? 'Timeout Error' : 'Compilation / Runtime Error'}
                      </div>
                      <pre className="text-[11px] whitespace-pre-wrap font-mono text-red-300/90 overflow-x-auto">
                        {result.error}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div
                    id="status-success-banner"
                    className="p-2.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Program compiled and executed successfully (Exit Code {result.exitCode ?? 0})</span>
                  </div>
                )}

                {/* Standard Output (stdout) */}
                <div id="stdout-container" className="flex-1 flex flex-col mt-2">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Standard Output (stdout)</span>
                    {result.output ? (
                      <span className="text-[10px] text-neutral-500 font-normal">
                        {result.output.length} characters
                      </span>
                    ) : null}
                  </div>
                  <div
                    id="stdout-text"
                    className="w-full flex-1 p-3 rounded-md bg-neutral-900/80 border border-neutral-800/80 text-neutral-200 whitespace-pre-wrap font-mono min-h-[120px]"
                  >
                    {result.output || (
                      <span className="text-neutral-600 italic select-none">
                        (No standard output produced)
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer id="footer" className="border-t border-neutral-800 bg-neutral-900/50 px-6 py-2 text-xs text-neutral-500 flex items-center justify-between">
        <span>Runs synchronously or asynchronously in browser sandbox with zero external API calls.</span>
        <span className="font-mono text-[11px]">Vite + React + Web Worker</span>
      </footer>
    </div>
  );
}
