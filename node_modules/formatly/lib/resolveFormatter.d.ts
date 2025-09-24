import { Formatter } from './formatters.js';

declare function resolveFormatter(cwd?: string): Promise<Formatter | undefined>;

export { resolveFormatter };
