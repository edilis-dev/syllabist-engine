/**
 * @fileoverview Provides the {@link ReverseLookup} function, which looks up
 * an object key by its associated value.
 */

/**
 * Searches `data` for the first key whose value strictly equals `target`
 * and returns that key, or `null` if no match is found.
 *
 * > **Note:** If multiple keys share the same value, only the key of the
 * > first matching entry (in `Object.entries` insertion order) is returned.
 *
 * > **Note:** Comparison uses strict equality (`===`), so `1` and `"1"` are
 * > treated as distinct values.
 *
 * @param {object} data - The object to search through. Must be truthy;
 *   falsy values throw.
 * @param {*} target - The value to search for. Must be truthy; falsy
 *   values throw.
 * @returns {string|null} The key whose value equals `target`, or `null` if no
 *   such key exists.
 * @throws {TypeError} If `data` is falsy (`"Empty data"`).
 * @throws {TypeError} If `target` is falsy (`"Empty target"`).
 *
 * @example
 * ReverseLookup({ key: "value" }, "value");
 * // → "key"
 *
 * @example <caption>Returns null when the value is not found</caption>
 * ReverseLookup({ key: "other" }, "value");
 * // → null
 */
export function ReverseLookup(data, target) {
  if (!data) {
    throw new TypeError("Empty data");
  }

  if (!target) {
    throw new TypeError("Empty target");
  }

  return (
    Object.entries(data)
      .find(([_, value]) => value === target)
      ?.at(0) ?? null
  );
}
