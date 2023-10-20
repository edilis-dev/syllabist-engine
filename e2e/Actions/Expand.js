import { readLines } from "https://deno.land/std@0.204.0/io/mod.ts";

import { Expander } from "../../Expander.js";

export const defaults = {
  files: {
    input: "flat.syb",
    output: "expand.json",
  },
};

export const expand = async ({
  files: {
    input = defaults.files.input,
    output = defaults.files.output,
  },
} = defaults) => {
  const fileReader = await Deno.open(input);
  const iter = readLines(fileReader);

  const data = await new Expander(iter).parse();

  await Deno.writeTextFile(output, JSON.stringify(data));
};
