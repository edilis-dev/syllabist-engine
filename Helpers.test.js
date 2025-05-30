import { assertEquals } from "@std/assert";

import { ReverseLookup } from "./Helpers.js";

Deno.test({
  name: "should return a key if found by value",
  fn: () => {
    const actual = ReverseLookup(
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
    const actual = ReverseLookup(
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
