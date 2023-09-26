import { Calendar } from "./Calendar.js";

Deno.bench({
  name: "add should return a date in the future",
  fn: () => {
    new Calendar(new Date("1970-01-01")).add({
      days: 30,
    });
  },
});

Deno.bench({
  name: "add should return current date if no days",
  fn: () => {
    new Calendar(new Date("1970-01-01")).add();
  },
});

Deno.bench({
  name: "between should return true if date within range",
  fn: () => {
    new Calendar(new Date("1970-01-16")).between({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-31"),
    });
  },
});

Deno.bench({
  name: "between should return false if date before range",
  fn: () => {
    new Calendar(new Date("1970-01-01")).between({
      after: new Date("1970-01-16"),
      before: new Date("1970-01-31"),
    });
  },
});

Deno.bench({
  name: "between should return false if date after range",
  fn: () => {
    new Calendar(new Date("1970-01-31")).between({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-16"),
    });
  },
});

Deno.bench({
  name: "is should return true if date is before",
  fn: () => {
    new Calendar(new Date("1970-01-01")).is({
      before: new Date("1970-01-31"),
    });
  },
});

Deno.bench({
  name: "is should return true if date is after",
  fn: () => {
    new Calendar(new Date("1970-01-31")).is({
      after: new Date("1970-01-01"),
    });
  },
});

Deno.bench({
  name: "is should defer to between if before and after",
  fn: () => {
    new Calendar(new Date("1970-01-16")).is({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-31"),
    });
  },
});

Deno.bench({
  name: "subtract should return a date in the past",
  fn: () => {
    new Calendar(new Date("1970-01-31")).subtract({
      days: 30,
    });
  },
});

Deno.bench({
  name: "subtract should return current date if no days",
  fn: () => {
    new Calendar(new Date("1970-01-01")).subtract();
  },
});
