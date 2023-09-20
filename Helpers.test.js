import { assertEquals } from "https://deno.land/std@0.144.0/testing/asserts.ts";

import { reverseLookup } from "./Helpers.js";

Deno.test({
  name: "should return a key if found by value",
  fn: () => {
    const actual = reverseLookup(
      {
        key: "value",
      },
      "value",
    );

    const expected = "key";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return null if key not found by value",
  fn: () => {
    const actual = reverseLookup(
      {
        key: "other",
      },
      "value",
    );

    const expected = null;

    assertEquals(actual, expected);
  },
  ignore: false,
});
