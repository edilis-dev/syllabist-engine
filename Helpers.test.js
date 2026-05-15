import { assertEquals, assertThrows } from "@std/assert";

import { ReverseLookup } from "./Helpers.js";

Deno.test({
  name: "ReverseLookup should throw a TypeError for null or undefined data",
  fn: () => {
    assertThrows(() => ReverseLookup(null, "value"), TypeError, "Empty data");
    assertThrows(() => ReverseLookup(undefined, "value"), TypeError, "Empty data");
  },
  ignore: false,
});

Deno.test({
  name: "ReverseLookup should throw a TypeError for null or undefined target",
  fn: () => {
    assertThrows(() => ReverseLookup({}, null), TypeError, "Empty target");
    assertThrows(() => ReverseLookup({}, undefined), TypeError, "Empty target");
  },
  ignore: false,
});

Deno.test({
  name: "ReverseLookup should return null for an empty object",
  fn: () => {
    const actual = ReverseLookup({}, "value");

    const expected = null;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "ReverseLookup should return null if no key matches the value",
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

Deno.test({
  name: "ReverseLookup should return null when the target type does not strictly match",
  fn: () => {
    const actual = ReverseLookup({ key: 1 }, "1");

    const expected = null;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "ReverseLookup should return the first matching key when multiple keys share the same value",
  fn: () => {
    const actual = ReverseLookup(
      {
        first: "value",
        second: "value",
      },
      "value",
    );

    const expected = "first";

    assertEquals(actual, expected);
  },
  ignore: false,
});
