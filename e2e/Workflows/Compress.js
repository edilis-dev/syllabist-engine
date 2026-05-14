import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Standard } from "../../Format.constants.js";
import { Standardise } from "../../Format.js";
import * as Compress from "../Actions/Compress.js";
import * as Transform from "../Actions/Transform.js";
import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";

const { tmp } = await Setup();

await Compress.compress({
  files: {
    input: resolve(Deno.cwd(), "Expected", Transform.defaults.files.output),
    output: resolve(tmp, Compress.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(resolve(tmp, Compress.defaults.files.output));

const expected = await Deno.readTextFile(resolve(Deno.cwd(), "Expected", Compress.defaults.files.output));

assertEquals(Standardise({ data: actual, type: Standard.Text }), Standardise({ data: expected, type: Standard.Text }));

await Cleanup({ tmp });
