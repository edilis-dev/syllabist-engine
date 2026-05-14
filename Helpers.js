/**
 * @fileoverview Provides the {@link ReverseLookup} function, which looks up
 * an object key by its associated value.
 */

/**
 * Searches `object` for the first key whose value strictly equals `target`
 * and returns that key, or `null` if no match is found.
 *
 * > **Note:** If multiple keys share the same value, only the key of the
 * > first matching entry (in `Object.entries` insertion order) is returned.
 *
 * > **Note:** Comparison uses strict equality (`===`), so `1` and `"1"` are
 * > treated as distinct values.
 *
 * @param {object} object - The object to search through.
 * @param {*} target - The value to search for.
 * @returns {string|null} The key whose value equals `target`, or `null` if no
 *   such key exists.
 * @throws {TypeError} If `object` is `null` or `undefined` (`Object.entries`
 *   throws `"Cannot convert undefined or null to object"`).
 *
 * @example
 * ReverseLookup({ key: "value" }, "value");
 * // → "key"
 *
 * @example <caption>Returns null when the value is not found</caption>
 * ReverseLookup({ key: "other" }, "value");
 * // → null
 */
export function ReverseLookup(object, target) {
  return (
    Object.entries(object)
      .find(([_, value]) => value === target)
      ?.at(0) ?? null
  );
}
