import { TextLineStream } from "@std/streams";

import { Separator } from "../../Separator.js";

export const defaults = {
  files: {
    input: "separate.txt",
    output: "separate.txt",
  },
};

export const separate = async ({
  files: { input = defaults.files.input, output = defaults.files.output },
} = defaults) => {
  const file = await Deno.open(input);
  const iter = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const data = await new Separator(iter).separate();

  await Deno.writeTextFile(output, data);
};
