import { FakeTime } from "@std/testing/time";

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
