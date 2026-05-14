/**
 * @fileoverview Provides {@link CreateLogger}, a factory that creates a
 * configured logger instance for a named class. Re-exports all symbols from
 * `@std/log` so callers that only need the standard log methods can import
 * from this module rather than from `@std/log` directly.
 */

import "@std/dotenv/load";
import { ConsoleHandler, getLogger, setup } from "@std/log";

const level = Deno.env.get("level") ?? "INFO";

console.log(level);

/**
 * Creates and returns a configured logger whose structured JSON output
 * includes the caller's class name in every log line.
 *
 * The active log level is read once from the `level` environment variable
 * (defaulting to `"INFO"`) when the module is first imported. A `.env` file
 * is loaded automatically via `@std/dotenv/load`.
 *
 * The JSON formatter writes the following fields on every log line:
 *
 * | Field      | Content |
 * |------------|---------|
 * | `class`    | The value of `options.name` |
 * | `level`    | The log level name (e.g. `"INFO"`, `"DEBUG"`) |
 * | `datetime` | ISO 8601 timestamp |
 * | `message`  | The log message string |
 * | `args`     | Merged object of any extra arguments, or `undefined` |
 *
 * @param {object} [options={}] - The logger options.
 * @param {string} [options.name] - The class name to embed in every log line
 *   produced by the returned logger.
 * @returns {import("@std/log").Logger} A configured `@std/log` logger instance.
 *
 * @example
 * const log = CreateLogger({ name: "MyClass" });
 * log.info("Starting");
 * // → { "class": "MyClass", "level": "INFO", "message": "Starting", ... }
 */
export function CreateLogger({ name } = {}) {
  setup({
    handlers: {
      console: new ConsoleHandler(level, {
        formatter: ({ args, datetime, levelName, msg }) =>
          JSON.stringify(
            {
              args: args.length
                ? args.reduce(
                    (previousValue, currentValue) => ({
                      ...previousValue,
                      ...currentValue,
                    }),
                    {},
                  )
                : undefined,
              class: name,
              datetime: datetime.toISOString(),
              level: levelName,
              message: msg,
            },
            null,
            " ",
          ),
      }),
    },
    loggers: {
      default: {
        level,
        handlers: ["console"],
      },
    },
  });

  return getLogger();
}

export * from "@std/log";
