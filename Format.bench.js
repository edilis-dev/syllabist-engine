import { standardise } from "./Format.js";

Deno.bench({
  name: "should standardise JSON",
  fn: () => {
    standardise({
      data: '{"a":{"ble":"ble","bout":"bout"\}}',
    });
  },
});
