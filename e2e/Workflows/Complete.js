import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Standardise } from "../../Format.js";
import * as Separator from "../Actions/Separate.js";
import * as Compress from "../Actions/Compress.js";
import * as Expand from "../Actions/Expand.js";
import * as Transform from "../Actions/Transform.js";
import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";

const { tmp } = await Setup();

await Separator.separate({
  files: {
    input: resolve(Deno.cwd(), "Input/Separate.txt"),
    output: resolve(tmp, Separator.defaults.files.output),
  },
});

await Transform.transform({
  files: {
    input: resolve(tmp, Transform.defaults.files.input),
    output: resolve(tmp, Transform.defaults.files.output),
  },
});

await Compress.compress({
  files: {
    input: resolve(tmp, Compress.defaults.files.input),
    output: resolve(tmp, Compress.defaults.files.output),
  },
});

await Expand.expand({
  files: {
    input: resolve(tmp, Expand.defaults.files.input),
    output: resolve(tmp, Expand.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(
  resolve(tmp, Expand.defaults.files.output),
);

const expected = await Deno.readTextFile(
  resolve(Deno.cwd(), "Expected/Complete.json"),
);

assertEquals(Standardise({ data: actual }), Standardise({ data: expected }));

await Cleanup({ tmp });
