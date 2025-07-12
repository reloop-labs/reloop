import * as v from 'valibot';

const DEFAULT_SERVER_PORT = 3035;
const DEFAULT_SERVER_HOST = 'localhost';

const createPortSchema = ({ defaultPort }: { defaultPort: number }) =>
  v.pipe(
    v.optional(v.string(), `${defaultPort}`),
    v.transform((s) => parseInt(s, 10)),
    v.integer(),
    v.minValue(0),
    v.maxValue(65535),
  );

export const envSchema = v.object({
  SERVER_PORT: createPortSchema({ defaultPort: DEFAULT_SERVER_PORT }),
  SERVER_HOST: v.pipe(
    v.optional(v.string(), DEFAULT_SERVER_HOST),
    v.minLength(1),
  ),
  SERVER_AUTH_SECRET: v.pipe(v.string(), v.minLength(1)),
  SERVER_POSTGRES_URL: v.string(),

  // Frontend URL, used to configure trusted origin (CORS)
  PUBLIC_WEB_URL: v.pipe(v.string(), v.url()),
});

export const env = v.parse(envSchema, process.env);
