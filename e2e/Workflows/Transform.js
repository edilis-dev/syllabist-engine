import { assertEquals } from "@std/assert";
import { resolve } from "@std/path";

import { Normalise } from "../../Format.js";
import * as Seperate from "../Actions/Separate.js";
import * as Transform from "../Actions/Transform.js";
import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";

const { tmp } = await Setup();

await Transform.transform({
  files: {
    input: resolve(Deno.cwd(), "Expected", Seperate.defaults.files.output),
    output: resolve(tmp, Transform.defaults.files.output),
  },
});

const actual = await Deno.readTextFile(resolve(tmp, Transform.defaults.files.output));

const expected = await Deno.readTextFile(resolve(Deno.cwd(), "Expected", Transform.defaults.files.output));

assertEquals(Normalise({ data: actual }), Normalise({ data: expected }));

await Cleanup({ tmp });
