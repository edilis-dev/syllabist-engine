import { TextLineStream } from "@std/streams";

import { Transformer } from "../../Transformer.js";

export const defaults = {
  files: {
    input: "transform.txt",
    output: "transform.json",
  },
};

export const transform = async ({
  files: { input = defaults.files.input, output = defaults.files.output },
} = defaults) => {
  const file = await Deno.open(input);
  const iter = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const data = await new Transformer(iter).transform();

  await Deno.writeTextFile(output, JSON.stringify(data));
};
