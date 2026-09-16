// @ts-ignore
import * as JSCPPModule from 'JSCPP';
// @ts-ignore
import JSCPPDefault from 'JSCPP';

/**
 * Robustly resolve the JSCPP execution function and namespace.
 * Handles differences across CommonJS, Vite dev, Rollup production bundles, and Vercel.
 */
function getJSCPPRuntime() {
  const candidates = [
    JSCPPDefault,
    (JSCPPDefault as any)?.default,
    (JSCPPDefault as any)?.default?.default,
    JSCPPModule,
    (JSCPPModule as any)?.default,
    (JSCPPModule as any)?.default?.default
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate.run === 'function') {
      return {
        run: candidate.run.bind(candidate),
        includes: candidate.includes
      };
    }
  }

  // If candidate itself is a callable function
  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return {
        run: candidate,
        includes: (candidate as any).includes
      };
    }
  }

  return null;
}

self.onmessage = (e: MessageEvent) => {
  const { code, input } = e.data;
  let output = '';

  try {
    const runtime = getJSCPPRuntime();
    if (!runtime || typeof runtime.run !== 'function') {
      throw new Error(
        `JSCPP execution engine could not be resolved. Please verify the build configuration.`
      );
    }

    let currentInput = input != null ? String(input) : '';
    const config = {
      stdio: {
        write: (s: string) => {
          output += s;
          self.postMessage({ type: 'stdout', text: s });
        },
        drain: () => {
          const buf = currentInput;
          currentInput = '';
          return buf;
        }
      },
      maxTimeout: 10000 // internal safety guard in addition to worker termination
    };

    const exitCode = runtime.run(code, input != null ? String(input) : '', config);
    self.postMessage({
      type: 'done',
      output,
      exitCode: typeof exitCode === 'number' ? exitCode : 0
    });
  } catch (err: any) {
    self.postMessage({
      type: 'error',
      output,
      error: err?.message || String(err)
    });
  }
};
