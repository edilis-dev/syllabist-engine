import { assertEquals } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import { resolve } from "https://deno.land/std@0.201.0/path/mod.ts";

import { Cleanup } from "../Actions/Utility/Cleanup.js";
import { Setup } from "../Actions/Utility/Setup.js";
import { Standard } from "../../Constants.js";
import { Standardise } from "../../Format.js";
import * as Update from "../Actions/Update.js";

const { time, tmp } = await Setup();

await Update.setup({ tmp });
await Update.update();

const manifest = {
  actual: await Deno.readTextFile(
    resolve(tmp, Update.defaults.manifest),
  ),
  expected: await Deno.readTextFile(
    resolve(Deno.cwd(), "Expected/Manifest.json"),
  ),
};

const parsed = JSON.parse(manifest.actual);

const artifact = {
  actual: await Deno.readTextFile(
    resolve(tmp, `${parsed.latest.digest}.txt`),
  ),
  expected: await Deno.readTextFile(
    resolve(Deno.cwd(), "Expected/Source.txt"),
  ),
};

assertEquals(
  Standardise({ data: manifest.actual }),
  Standardise({ data: manifest.expected }),
);

assertEquals(
  Standardise({ data: artifact.actual, type: Standard.Text }),
  Standardise({ data: artifact.expected, type: Standard.Text }),
);

await Cleanup({ time, tmp });
