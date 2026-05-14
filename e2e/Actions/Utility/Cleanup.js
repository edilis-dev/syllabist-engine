/**
 * @fileoverview Provides the {@link Cleanup} function for tearing down the
 * e2e test environment created by {@link Setup}.
 */

/**
 * Tears down the e2e test environment by restoring faked time (if any) and
 * recursively removing the temporary directory.
 *
 * This is the symmetric counterpart to `Setup`. It should be called at the
 * end of every workflow regardless of whether the test passed or failed, so
 * that no temporary files are left on disk and the global clock is not left
 * in a faked state.
 *
 * @param {object} options - The teardown options, typically the object
 *   returned by {@link Setup}.
 * @param {import("@std/testing/time").FakeTime} [options.time] - The
 *   {@link import("@std/testing/time").FakeTime} instance to restore. When
 *   provided, {@link import("@std/testing/time").FakeTime#restore} is called
 *   to reinstate the real system clock. Omit or pass `undefined` for
 *   workflows that do not manipulate time.
 * @param {string} options.tmp - The path of the temporary directory to
 *   remove. This is the value returned by {@link Deno.makeTempDir} inside
 *   {@link Setup}.
 * @returns {Promise<void>} Resolves once the temporary directory has been
 *   removed successfully.
 * @throws {Error} Re-throws any error raised by {@link Deno.remove} after
 *   logging a descriptive message to `console.error`.
 *
 * @example <caption>Without time — workflows that do not fake the clock</caption>
 * const { tmp } = await Setup();
 * // … run workflow …
 * await Cleanup({ tmp });
 *
 * @example <caption>With time — workflows that manipulate the system clock</caption>
 * const { time, tmp } = await Setup();
 * // … run workflow …
 * await Cleanup({ time, tmp });
 */
export const Cleanup = async ({ time, tmp }) => {
  time?.restore();

  try {
    await Deno.remove(tmp, { recursive: true });
  } catch (error) {
    console.error(`Failed to remove temporary directory ${tmp}`);

    throw error;
  }
};
