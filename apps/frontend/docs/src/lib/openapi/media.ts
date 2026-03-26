import type { MediaAdapter } from 'fumadocs-openapi';

export const mediaAdapters: Record<string, MediaAdapter> = {
  // example: custom `application/json
  'application/json': {
    encode(data) {
      return JSON.stringify(data.body);
    },
    // returns code that inits a `body` variable, used for request body
    generateExample(data, ctx) {
      if (ctx.lang === 'js') {
        return `const body = "hello world"`;
      }

      if (ctx.lang === 'python') {
        return `body = "hello world"`;
      }

      if (ctx.lang === 'go' && 'addImport' in ctx) {
        ctx.addImport('strings');

        return `body := strings.NewReader("hello world")`;
      }
    },
  },
};
