import { readLines } from "https://deno.land/std@0.201.0/io/mod.ts";
import { resolve } from "https://deno.land/std@0.201.0/path/mod.ts";

import { Expander } from "../../Expander.js";

export const defaults = {
  files: {
    input: "flat.map",
    output: "expand.json",
  },
};

export const expand = async (
  { files: { input = defaults.files.input, output = defaults.files.output } } =
    defaults,
) => {
  const fileReader = await Deno.open(resolve(Deno.cwd(), input));
  const iter = readLines(fileReader);

  const data = await new Expander(iter).parse();

  await Deno.writeTextFile(resolve(Deno.cwd(), output), JSON.stringify(data));
};
