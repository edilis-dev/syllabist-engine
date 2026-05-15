import { assertEquals, assertThrows } from "@std/assert";

import { Standard } from "./Format.constants.js";
import { Normalise, Standardise } from "./Format.js";

Deno.test({
  name: "standardise should return pretty-printed JSON",
  fn: () => {
    const actual = Standardise({
      data: '{"a":{"ble":"ble","bout":"bout"}}',
    });

    const expected = JSON.stringify({ a: { ble: "ble", bout: "bout" } }, null, 2);

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "standardise should return trimmed text",
  fn: () => {
    const actual = Standardise({
      data: "    text  ",
      type: Standard.Text,
    });

    const expected = "text";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "standardise should return an empty string for whitespace-only data with Standard.Text",
  fn: () => {
    const actual = Standardise({
      data: "   ",
      type: Standard.Text,
    });

    const expected = "";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "standardise should throw an error for missing data",
  fn: () => {
    assertThrows(() => Standardise(), TypeError, "Empty data");
    assertThrows(() => Standardise({ data: "" }), TypeError, "Empty data");
  },
  ignore: false,
});

Deno.test({
  name: "standardise should throw an error for an unhandled type",
  fn: () => {
    assertThrows(
      () =>
        Standardise({
          data: '{"a":{"ble":"ble","bout":"bout"}}',
          type: null,
        }),
      TypeError,
      "Unhandled type null",
    );
  },
  ignore: false,
});

Deno.test({
  name: "standardise should throw a SyntaxError for whitespace-only data with Standard.JSON",
  fn: () => {
    assertThrows(
      () =>
        Standardise({
          data: "   ",
        }),
      SyntaxError,
    );
  },
  ignore: false,
});

Deno.test({
  name: "normalise should sort keys alphabetically",
  fn: () => {
    const actual = Normalise({ data: '{"b":"b","a":"a"}' });

    const expected = JSON.stringify({ a: "a", b: "b" }, null, 2);

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "normalise should sort the empty-string key before all other keys",
  fn: () => {
    const actual = Normalise({ data: '{"b":"b","":"","a":"a"}' });

    const expected = JSON.stringify({ "": "", a: "a", b: "b" }, null, 2);

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "normalise should sort keys recursively at every level",
  fn: () => {
    const actual = Normalise({ data: '{"b":{"d":"d","c":"c"},"a":"a"}' });

    const expected = JSON.stringify({ a: "a", b: { c: "c", d: "d" } }, null, 2);

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "normalise should throw a SyntaxError for invalid JSON",
  fn: () => {
    assertThrows(
      () =>
        Normalise({
          data: "not-json",
        }),
      SyntaxError,
    );
  },
  ignore: false,
});

Deno.test({
  name: "normalise should throw an error for missing data",
  fn: () => {
    assertThrows(() => Normalise(), TypeError, "Empty data");
    assertThrows(() => Normalise({ data: "" }), TypeError, "Empty data");
  },
  ignore: false,
});
