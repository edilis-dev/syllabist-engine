import { resolve } from "https://deno.land/std@0.201.0/path/mod.ts";

import { Compressor } from "../../Compressor.js";

export const defaults = {
  files: {
    input: "transform.json",
    output: "flat.map",
  },
};

export const compress = async (
  { files: { input = defaults.files.input, output = defaults.files.output } } =
    defaults,
) => {
  const text = await Deno.readTextFile(resolve(Deno.cwd(), input));

  const data = new Compressor(JSON.parse(text)).parse();

  await Deno.writeTextFile(resolve(Deno.cwd(), output), data);
};
