import { resolve } from "https://deno.land/std@0.205.0/path/mod.ts";

import { Updater } from "../../Updater.js";

export const defaults = {
  manifest: "manifest.json",
  source: "http://localhost:8000/source.txt",
};

export const setup = async ({ tmp, manifest = defaults.manifest }) => {
  Deno.env.set("artifacts", tmp);
  Deno.env.set("manifest", manifest);

  await Deno.writeTextFile(resolve(tmp, manifest), '{"latest":{}}');
};

export const update = async ({
  source = defaults.source,
} = defaults) => {
  await new Updater().update(source);
};
