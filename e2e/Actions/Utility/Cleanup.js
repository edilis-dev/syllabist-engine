export const Cleanup = async ({ time, tmp }) => {
  time?.restore();

  try {
    await Deno.remove(tmp, { recursive: true });
  } catch (error) {
    console.error(`Failed to remove temporary directory ${tmp}`);

    throw error;
  }
};
