import { FormatterName, Formatter } from './formatters.js';

interface FormatlyOptions {
    cwd?: string;
    /**
     * Pass an explicitly formatter to use instead of automatically detecting
     */
    formatter?: FormatterName;
}
type FormatlyReport = FormatlyReportError | FormatlyReportResult;
interface FormatlyReportChildProcessResult {
    code: null | number;
    signal: NodeJS.Signals | null;
}
interface FormatlyReportError {
    message: string;
    ran: false;
}
interface FormatlyReportResult {
    formatter: Formatter;
    ran: true;
    result: FormatlyReportChildProcessResult;
}
declare function formatly(patterns: string[], options?: FormatlyOptions): Promise<FormatlyReport>;

export { type FormatlyOptions, type FormatlyReport, type FormatlyReportChildProcessResult, type FormatlyReportError, type FormatlyReportResult, formatly };
