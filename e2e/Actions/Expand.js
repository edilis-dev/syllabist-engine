import { TextLineStream } from "@std/streams";

import { Expander } from "../../Expander.js";

export const defaults = {
  files: {
    input: "flat.syb",
    output: "expand.json",
  },
};

export const expand = async ({
  files: { input = defaults.files.input, output = defaults.files.output },
} = defaults) => {
  const file = await Deno.open(input);
  const iter = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const data = await new Expander(iter).expand();

  await Deno.writeTextFile(output, JSON.stringify(data));
};
