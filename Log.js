import "@std/dotenv/load";

import { ConsoleHandler, setup } from "@std/log";

const level = Deno.env.get("level") ?? "INFO";

setup({
  handlers: {
    console: new ConsoleHandler(level, {
      formatter: ({ args, datetime, levelName, msg }) =>
        JSON.stringify(
          {
            class: "Separator",
            level: levelName,
            datetime: datetime.toISOString(),
            message: msg,
            args: args.length
              ? args.reduce(
                  (previousValue, currentValue) => ({
                    ...previousValue,
                    ...currentValue,
                  }),
                  {},
                )
              : undefined,
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

export * from "@std/log";
