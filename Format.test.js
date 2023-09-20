import {
  assert,
  assertThrows,
} from "https://deno.land/std@0.144.0/testing/asserts.ts";

import { standardise } from "./Format.js";

Deno.test({
  name: "should throw an error for missing data",
  fn: () => {
    assertThrows(
      () =>
        standardise({
          data: "",
        }),
      Error,
      "Empty data",
    );
  },
  ignore: false,
});

Deno.test({
  name: "should throw an error for unhandled type",
  fn: () => {
    assertThrows(
      () =>
        standardise({
          data: '{"a":{"ble":"ble","bout":"bout"\}}',
          type: null,
        }),
      Error,
      "Unhandled type null",
    );
  },
  ignore: false,
});

Deno.test({
  name: "should standardise JSON",
  fn: () => {
    const actual = standardise({
      data: '{"a":{"ble":"ble","bout":"bout"\}}',
    });

    const expected = {
      a: {
        ble: "ble",
        bout: "bout",
      },
    };

    assert(actual, expected);
  },
  ignore: false,
});
