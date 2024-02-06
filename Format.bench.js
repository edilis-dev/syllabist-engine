import { Standard } from "./Constants.js";
import { Standardise } from "./Format.js";

Deno.bench({
  name: "should Standardise JSON",
  fn: () => {
    Standardise({
      data: '{"a":{"ble":"ble","bout":"bout"}}',
    });
  },
});

Deno.bench({
  name: "should Standardise Text",
  fn: () => {
    Standardise({
      data: "    text    ",
      type: Standard.Text,
    });
  },
});
