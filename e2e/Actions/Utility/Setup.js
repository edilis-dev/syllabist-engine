/**
 * @fileoverview Provides the {@link Setup} function for initialising the
 * e2e test environment.
 */

import { FakeTime } from "@std/testing/time";

/**
 * Initialises the e2e test environment by freezing the system clock at the
 * Unix epoch and creating a temporary working directory.
 *
 * The returned object should be passed directly to {@link Cleanup} at the end
 * of every workflow to restore the real clock and remove the temporary
 * directory, regardless of whether the workflow succeeded or failed.
 *
 * @returns {Promise<{ time: FakeTime, tmp: string }>} Resolves with an object
 *   containing:
 *   - `time` — a {@link FakeTime} instance with the clock frozen at
 *     `1970-01-01T00:00:00.000Z` (Unix timestamp `0`).
 *   - `tmp` — the absolute path of the newly created temporary directory,
 *     as returned by {@link Deno.makeTempDir}.
 * @throws {Error} Re-throws any error raised by {@link Deno.makeTempDir}
 *   after logging a descriptive message to `console.error`.
 *
 * @example <caption>With time — workflows that manipulate the system clock</caption>
 * const { time, tmp } = await Setup();
 * // … run workflow …
 * await Cleanup({ time, tmp });
 *
 * @example <caption>Without time — workflows that do not fake the clock</caption>
 * const { tmp } = await Setup();
 * // … run workflow …
 * await Cleanup({ tmp });
 */
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
