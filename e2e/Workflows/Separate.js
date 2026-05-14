import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Standard } from "../../Format.constants.js";
import { Standardise } from "../../Format.js";
import * as Separate from "../Actions/Separate.js";
import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";

const { tmp } = await Setup();

await Separate.separate({
  files: {
    input: resolve(Deno.cwd(), "Expected", Separate.defaults.files.input),
    output: resolve(tmp, Separate.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(resolve(tmp, Separate.defaults.files.output));

const expected = await Deno.readTextFile(resolve(Deno.cwd(), "Expected", Separate.defaults.files.output));

assertEquals(Standardise({ data: actual, type: Standard.Text }), Standardise({ data: expected, type: Standard.Text }));

await Cleanup({ tmp });
