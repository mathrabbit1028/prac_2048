import { spawn } from "node:child_process";
import { formatters } from "./formatters.js";
import { resolveFormatter } from "./resolveFormatter.js";
async function formatly(patterns, options = {}) {
  if (!patterns.join("").trim()) {
    return {
      message: "No file patterns were provided to formatly.",
      ran: false
    };
  }
  const { cwd = process.cwd() } = options;
  const formatter = options.formatter ? formatters.find((f) => f.name === options.formatter) : await resolveFormatter(cwd);
  if (!formatter) {
    return { message: "Could not detect a reporter.", ran: false };
  }
  const [baseCommand, ...args] = formatter.runner.split(" ");
  return {
    formatter,
    ran: true,
    result: await new Promise((resolve, reject) => {
      const child = spawn(baseCommand, [...args, ...patterns], { cwd });
      child.on("error", reject);
      child.on("exit", (code, signal) => {
        resolve({ code, signal });
      });
    })
  };
}
export {
  formatly
};
