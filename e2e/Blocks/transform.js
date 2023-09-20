import { readLines } from "https://deno.land/std@0.201.0/io/mod.ts";
import { resolve } from "https://deno.land/std@0.201.0/path/mod.ts";

import { Transformer } from "../../Transformer.js";

export const defaults = {
  files: {
    input: "transform.txt",
    output: "transform.json",
  },
};

export const transform = async (
  { files: { input = defaults.files.input, output = defaults.files.output } } =
    defaults,
) => {
  const fileReader = await Deno.open(resolve(Deno.cwd(), input));
  const iter = readLines(fileReader);

  const data = await new Transformer(iter).transform();

  await Deno.writeTextFile(resolve(Deno.cwd(), output), JSON.stringify(data));
};
