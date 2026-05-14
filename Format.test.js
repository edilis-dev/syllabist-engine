import { assertEquals, assertThrows } from "@std/assert";

import { Standard } from "./Format.constants.js";
import { Standardise } from "./Format.js";

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

    const expected = JSON.stringify({ a: { ble: "ble", bout: "bout" } }, null, 2);

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should Standardise Text",
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
