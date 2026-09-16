// @ts-ignore
import CWorker from './cWorker?worker';

export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode?: number;
  durationMs: number;
}

export function runCCode(code: string, input: string = '', timeoutMs: number = 2500): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let accumulatedOutput = '';
    let isFinished = false;

    let worker: Worker | null = null;
    try {
      worker = new CWorker();
    } catch (workerInitErr: any) {
      // Fallback: try new Worker with URL
      try {
        worker = new Worker(new URL('./cWorker.ts', import.meta.url), { type: 'module' });
      } catch (fallbackErr: any) {
        return resolve({
          output: '',
          error: `Failed to initialize worker: ${workerInitErr?.message || workerInitErr}`,
          durationMs: 0
        });
      }
    }

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        if (worker) {
          worker.terminate();
          worker = null;
        }
        resolve({
          output: accumulatedOutput,
          error: `Execution timed out after ${timeoutMs}ms (infinite loop prevented).`,
          durationMs: Math.round(performance.now() - startTime),
        });
      }
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'stdout') {
        accumulatedOutput += msg.text;
      } else if (msg.type === 'done') {
        if (!isFinished) {
          isFinished = true;
          clearTimeout(timer);
          if (worker) {
            worker.terminate();
            worker = null;
          }
          resolve({
            output: msg.output ?? accumulatedOutput,
            exitCode: msg.exitCode,
            durationMs: Math.round(performance.now() - startTime),
          });
        }
      } else if (msg.type === 'error') {
        if (!isFinished) {
          isFinished = true;
          clearTimeout(timer);
          if (worker) {
            worker.terminate();
            worker = null;
          }
          resolve({
            output: msg.output ?? accumulatedOutput,
            error: msg.error,
            durationMs: Math.round(performance.now() - startTime),
          });
        }
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        if (worker) {
          worker.terminate();
          worker = null;
        }
        resolve({
          output: accumulatedOutput,
          error: err.message || 'Worker runtime error during execution.',
          durationMs: Math.round(performance.now() - startTime),
        });
      }
    };

    worker.postMessage({ code, input });
  });
}
