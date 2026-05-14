import { Compressor } from "../../Compressor.js";

export const defaults = {
  files: {
    input: "Transform.json",
    output: "Flat.syb",
  },
};

export const compress = async ({ files: { input = defaults.files.input, output = defaults.files.output } } = defaults) => {
  const text = await Deno.readTextFile(input);

  const data = new Compressor(JSON.parse(text)).compress();

  await Deno.writeTextFile(output, data);
};
