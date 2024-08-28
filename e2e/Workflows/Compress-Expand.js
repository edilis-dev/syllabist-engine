import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";
import { Standardise } from "../../Format.js";
import * as Compress from "../Actions/Compress.js";
import * as Expand from "../Actions/Expand.js";

const { tmp } = await Setup();

await Compress.compress({
  files: {
    input: resolve(Deno.cwd(), "Input/Transform.json"),
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

assertEquals(
  Standardise({ data: actual }),
  Standardise({ data: expected }),
);

await Cleanup({ tmp });
