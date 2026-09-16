// @ts-ignore
import JSCPP from 'JSCPP';

self.onmessage = (e: MessageEvent) => {
  const { code, input } = e.data;
  let output = '';

  try {
    let currentInput = input || '';
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
      }
    };

    const exitCode = JSCPP.run(code, input || '', config);
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
