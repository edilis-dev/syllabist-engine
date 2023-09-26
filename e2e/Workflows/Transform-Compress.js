import { assertEquals } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import { resolve } from "https://deno.land/std@0.201.0/path/mod.ts";

import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";
import * as Compress from "../Actions/Compress.js";
import * as Transform from "../Actions/Transform.js";

const { tmp } = await Setup();

await Transform.transform({
  files: {
    input: resolve(Deno.cwd(), "Input/Transform.txt"),
    output: resolve(tmp, Transform.defaults.files.output),
  },
});
await Compress.compress({
  files: {
    input: resolve(tmp, Compress.defaults.files.input),
    output: resolve(tmp, Compress.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(
  resolve(tmp, Compress.defaults.files.output),
);
const expected = await Deno.readTextFile(
  resolve(Deno.cwd(), "Expected/Flat.syb"),
);

assertEquals(actual, expected);

await Cleanup({ tmp });
