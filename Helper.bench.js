import { ReverseLookup } from "./Helpers.js";

Deno.bench({
  name: "should return a key if found by value",
  fn: () =>
    ReverseLookup(
      {
        key: "value",
      },
      "value",
    ),
});

Deno.bench({
  name: "should return null if key not found by value",
  fn: () =>
    ReverseLookup(
      {
        key: "other",
      },
      "value",
    ),
});
