import { assert, assertThrows } from "@std/assert";

import { Standardise } from "./Format.js";
import { Standard } from "./Constants.js";

Deno.test({
  name: "should throw an error for missing data",
  fn: () => {
    assertThrows(
      () =>
        Standardise({
          data: "",
        }),
      TypeError,
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
  name: "should Standardise JSON",
  fn: () => {
    const actual = Standardise({
      data: '{"a":{"ble":"ble","bout":"bout"}}',
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

Deno.test({
  name: "should Standardise JSON",
  fn: () => {
    const actual = Standardise({
      data: "    text  ",
      type: Standard.Text,
    });

    const expected = "test";

    assert(actual, expected);
  },
  ignore: false,
});
