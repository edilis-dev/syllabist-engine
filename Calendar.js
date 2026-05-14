/**
 * @fileoverview Provides the {@link Calendar} class for date arithmetic and
 * comparison operations.
 */

/**
 * A wrapper around a {@link Date} that exposes chainable helpers for common
 * calendar operations such as shifting a date forward/backward by a number of
 * days and checking whether a date falls inside a given range.
 *
 * @example
 * const cal = new Calendar(new Date("2024-06-01"));
 * cal.add({ days: 10 });      // → Date("2024-06-11")
 * cal.subtract({ days: 1 });  // → Date("2024-05-31")
 * cal.is({ before: new Date("2025-01-01") }); // → true
 */
export class Calendar {
  /** @type {Date} */
  #date;

  /**
   * Creates a new {@link Calendar} instance.
   *
   * The `date` argument is stored as-is; no defensive copy is made. Passing
   * `undefined`, `null`, or an invalid {@link Date} will not throw here — the
   * error is deferred to the first method call that needs the date. If you need
   * early validation, check `!isNaN(date?.getTime())` before constructing.
   *
   * @param {Date} date - The reference date for all subsequent operations.
   */
  constructor(date) {
    this.#date = date;
  }

  /**
   * Returns a **new** {@link Date} that is `days` calendar days after the
   * reference date. The reference date stored on the instance is never mutated.
   *
   * Month and year rollovers are handled automatically by the native
   * {@link Date} API (e.g. adding 31 days to January 31 yields March 3 in a
   * non-leap year).
   *
   * > **Note:** `days` defaults to `0` when the argument is `undefined`, but
   * > passing `null` explicitly bypasses the destructuring default and coerces
   * > to `0` via JavaScript's implicit type coercion — rely on this only
   * > intentionally.
   *
   * @param {object} [options={}] - Optional configuration.
   * @param {number} [options.days=0] - The number of calendar days to add.
   *   Fractional values are truncated by {@link Date.prototype.setDate}.
   *   Negative values shift the date backward (prefer {@link Calendar#subtract}
   *   for clarity).
   * @returns {Date} A new Date representing the reference date plus `days`.
   * @throws {TypeError} If no reference date was provided at construction, or
   *   if the stored date is invalid (i.e. `isNaN(date.getTime())`).
   *
   * @example
   * new Calendar(new Date("1970-01-01")).add({ days: 30 });
   * // → Date("1970-01-31")
   */
  add({ days = 0 } = {}) {
    if (!this.#date || isNaN(this.#date.getTime())) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Checks whether the reference date falls **strictly between** `after` and
   * `before` (both endpoints are excluded).
   *
   * > **Range order:** If `after` is chronologically later than or equal to
   * > `before`, the method silently returns `false` for every possible date
   * > rather than throwing. Callers are responsible for ensuring the range is
   * > ordered correctly.
   *
   * @param {object} [options={}] - The date range to test against.
   * @param {Date} options.after - The exclusive lower bound of the range.
   * @param {Date} options.before - The exclusive upper bound of the range.
   * @returns {boolean} `true` if the reference date is strictly after `after`
   *   **and** strictly before `before`; otherwise `false`.
   * @throws {TypeError} If no reference date was provided at construction, or
   *   if the stored date is invalid.
   * @throws {TypeError} If `after` is omitted or falsy.
   * @throws {TypeError} If `before` is omitted or falsy.
   *
   * @example
   * new Calendar(new Date("1970-01-16")).between({
   *   after:  new Date("1970-01-01"),
   *   before: new Date("1970-01-31"),
   * }); // → true
   *
   * @example <caption>Boundary dates are excluded</caption>
   * new Calendar(new Date("1970-01-01")).between({
   *   after:  new Date("1970-01-01"),
   *   before: new Date("1970-01-31"),
   * }); // → false
   */
  between({ after, before } = {}) {
    if (!this.#date || isNaN(this.#date.getTime())) {
      throw new TypeError("Empty date");
    } else if (!after) {
      throw new TypeError("Empty after");
    } else if (!before) {
      throw new TypeError("Empty before");
    } else {
      return this.#date.getTime() > after.getTime() && this.#date.getTime() < before.getTime();
    }
  }

  /**
   * Tests whether the reference date satisfies a directional constraint.
   *
   * - Supply only `before` → returns `true` if the date is strictly before it.
   * - Supply only `after`  → returns `true` if the date is strictly after it.
   * - Supply both          → delegates to {@link Calendar#between}, which
   *   requires the date to be strictly between the two bounds.
   *
   * @param {object} [options={}] - At least one of `after` or `before` must be
   *   provided.
   * @param {Date} [options.after] - The exclusive lower bound.
   * @param {Date} [options.before] - The exclusive upper bound.
   * @returns {boolean} The result of the comparison (see above).
   * @throws {TypeError} If no reference date was provided at construction, or
   *   if the stored date is invalid.
   * @throws {TypeError} If both `after` and `before` are omitted or falsy.
   *
   * @example <caption>Only before</caption>
   * new Calendar(new Date("1970-01-01")).is({
   *   before: new Date("1970-01-31"),
   * }); // → true
   *
   * @example <caption>Only after</caption>
   * new Calendar(new Date("1970-01-31")).is({
   *   after: new Date("1970-01-01"),
   * }); // → true
   *
   * @example <caption>Both — delegates to between()</caption>
   * new Calendar(new Date("1970-01-16")).is({
   *   after:  new Date("1970-01-01"),
   *   before: new Date("1970-01-31"),
   * }); // → true
   */
  is({ after, before } = {}) {
    if (!this.#date || isNaN(this.#date.getTime())) {
      throw new TypeError("Empty date");
    } else if (!after && !before) {
      throw new TypeError("Empty before and after");
    } else if (before && after) {
      return this.between({ after, before });
    } else if (after && !before) {
      return this.#date.getTime() > after.getTime();
    } else {
      return this.#date.getTime() < before.getTime();
    }
  }

  /**
   * Returns a **new** {@link Date} that is `days` calendar days before the
   * reference date. The reference date stored on the instance is never mutated.
   *
   * Month and year rollovers are handled automatically by the native
   * {@link Date} API (e.g. subtracting 1 day from February 1 yields January 31).
   *
   * > **Note:** `days` defaults to `0` when the argument is `undefined`, but
   * > passing `null` explicitly bypasses the destructuring default and coerces
   * > to `0` via JavaScript's implicit type coercion — rely on this only
   * > intentionally.
   *
   * @param {object} [options={}] - Optional configuration.
   * @param {number} [options.days=0] - The number of calendar days to subtract.
   *   Fractional values are truncated by {@link Date.prototype.setDate}.
   *   Negative values shift the date forward (prefer {@link Calendar#add} for
   *   clarity).
   * @returns {Date} A new Date representing the reference date minus `days`.
   * @throws {TypeError} If no reference date was provided at construction, or
   *   if the stored date is invalid (i.e. `isNaN(date.getTime())`).
   *
   * @example
   * new Calendar(new Date("1970-01-31")).subtract({ days: 30 });
   * // → Date("1970-01-01")
   */
  subtract({ days = 0 } = {}) {
    if (!this.#date || isNaN(this.#date.getTime())) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(result.getDate() - days);
    return result;
  }
}
