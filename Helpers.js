/**
 * @param {Record<string, unknown>} obj which might contain the desired key
 * @param {String} target is the value contained within the desired key
 * @returns {String | null} either `null` or a `String` containing the key
 */
export const reverseLookup = (obj, target) =>
  Object.entries(obj)
    .find(([_, value]) => value === target)
    ?.at(0) ?? null;
