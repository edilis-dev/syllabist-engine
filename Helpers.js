/**
 * @module Helpers
 */

/**
 * Finds the key of a value within a provided <code>Record</code>.
 *
 * @param {Record<string, unknown>} object <code>Record</code> which may contain the value.
 * @param {string} target Value of the key.
 * @returns {string | null} Key name.
 */
export function ReverseLookup(object, target) {
  return Object.entries(object)
    .find(([_, value]) => value === target)
    ?.at(0) ?? null;
}
