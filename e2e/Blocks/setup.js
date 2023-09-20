import { resolve } from "https://deno.land/std@0.201.0/path/resolve.ts";

export const cleanup = async (files) => {
  for (const file of files) {
    try {
      await Deno.remove(resolve(Deno.cwd(), file));
    } catch {
      console.warn(`Cleanup failed to remove file ${file}`);
    }
  }
};
