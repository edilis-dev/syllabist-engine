import { assertEquals } from "https://deno.land/std@0.144.0/testing/asserts.ts";

import { cleanup } from "./Blocks/setup.js";
import { compress, defaults as defaultsCompress } from "./Blocks/compress.js";
import { defaults as defaultsExpand, expand } from "./Blocks/expand.js";
import {
  defaults as defaultsTransform,
  transform,
} from "./Blocks/transform.js";
import { standardise } from "../Format.js";

await cleanup(
  new Set([
    defaultsCompress.files.input,
    defaultsCompress.files.output,
    defaultsExpand.files.input,
    defaultsExpand.files.output,
    defaultsTransform.files.output,
  ]),
);
await transform({
  files: {
    input: "Data/Transform.txt",
  },
});
await compress();
await expand();

const actual = await Deno.readTextFile(defaultsExpand.files.output);
const expected = await Deno.readTextFile("Expected/Complete.json");

assertEquals(
  standardise({ data: actual }),
  standardise({ data: expected }),
);
