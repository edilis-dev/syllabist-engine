import { FakeTime } from "https://deno.land/std@0.202.0/testing/time.ts";

export const Setup = async () => {
  try {
    return {
      time: new FakeTime(0),
      tmp: await Deno.makeTempDir(),
    };
  } catch (error) {
    console.error("Failed to create temporary directory");

    throw error;
  }
};
