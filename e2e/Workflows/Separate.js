import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Standard } from "../../Constants.js";
import { Standardise } from "../../Format.js";
import * as Separator from "../Actions/Separate.js";
import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";

const { tmp } = await Setup();

await Separator.separate({
  files: {
    input: resolve(Deno.cwd(), "Input/Separate.txt"),
    output: resolve(tmp, Separator.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(
  resolve(tmp, Separator.defaults.files.output),
);

console.log(resolve(tmp, Separator.defaults.files.output));

const expected = await Deno.readTextFile(
  resolve(Deno.cwd(), "Expected/Separate.txt"),
);

assertEquals(
  Standardise({ data: actual, type: Standard.Text }),
  Standardise({ data: expected, type: Standard.Text }),
);

await Cleanup({ tmp });
