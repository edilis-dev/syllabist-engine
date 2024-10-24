import { assertEquals, assertThrows } from "@std/assert";
import { assertSpyCalls, spy } from "@std/testing/mock";

import { Calendar } from "./Calendar.js";

Deno.test({
  name: "add should return a date in the future",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-01")).add({
      days: 30,
    });

    const expected = new Date("1970-01-31");

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "add should return current date if no days",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-01")).add();

    const expected = new Date("1970-01-01");

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "add should throw an error for missing date",
  fn: () => {
    assertThrows(
      () => new Calendar().add(),
      TypeError,
      "Empty date",
    );
  },
  ignore: false,
});

Deno.test({
  name: "between should return true if date within range",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-16")).between({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-31"),
    });

    const expected = true;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "between should return false if date before range",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-01")).between({
      after: new Date("1970-01-16"),
      before: new Date("1970-01-31"),
    });

    const expected = false;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "between should return false if date after range",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-31")).between({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-16"),
    });

    const expected = false;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "between should throw an error for missing after",
  fn: () => {
    assertThrows(
      () =>
        new Calendar(new Date("1970-01-31")).between({
          before: new Date("1970-01-16"),
        }),
      TypeError,
      "Empty after",
    );
  },
  ignore: false,
});

Deno.test({
  name: "between should throw an error for missing before",
  fn: () => {
    assertThrows(
      () =>
        new Calendar(new Date("1970-01-16")).between({
          after: new Date("1970-01-01"),
        }),
      TypeError,
      "Empty before",
    );
  },
  ignore: false,
});

Deno.test({
  name: "between should throw an error for missing date",
  fn: () => {
    assertThrows(
      () =>
        new Calendar().between({
          after: new Date("1970-01-01"),
          before: new Date("1970-01-16"),
        }),
      TypeError,
      "Empty date",
    );
  },
  ignore: false,
});

Deno.test({
  name: "is should return true if date is before",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-01")).is({
      before: new Date("1970-01-31"),
    });

    const expected = true;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "is should return true if date is after",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-31")).is({
      after: new Date("1970-01-01"),
    });

    const expected = true;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "is should defer to between if before and after",
  fn: () => {
    const date = new Calendar(new Date("1970-01-16"));

    const betweenSpy = spy(date, "between");

    date.is({
      after: new Date("1970-01-01"),
      before: new Date("1970-01-31"),
    });

    assertSpyCalls(betweenSpy, 1);
  },
  ignore: false,
});

Deno.test({
  name: "is should throw an error for missing before and after",
  fn: () => {
    assertThrows(
      () => new Calendar(new Date("1970-01-31")).is(),
      TypeError,
      "Empty before and after",
    );
  },
  ignore: false,
});

Deno.test({
  name: "is should throw an error for missing date",
  fn: () => {
    assertThrows(
      () => new Calendar().is(),
      TypeError,
      "Empty date",
    );
  },
  ignore: false,
});

Deno.test({
  name: "subtract should return a date in the past",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-31")).subtract({
      days: 30,
    });

    const expected = new Date("1970-01-01");

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "subtract should return current date if no days",
  fn: () => {
    const actual = new Calendar(new Date("1970-01-01")).subtract();

    const expected = new Date("1970-01-01");

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "subtract should throw an error for missing date",
  fn: () => {
    assertThrows(
      () => new Calendar().subtract(),
      TypeError,
      "Empty date",
    );
  },
  ignore: false,
});
