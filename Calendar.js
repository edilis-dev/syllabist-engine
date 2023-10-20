/**
 * The Calendar <code>class</code> is a utility wrapper around a <code>Date</code> implementing minimal mathematical and logical functions required by Syllabist Engine.
 */
export class Calendar {
  /**
   * <code>Date</code> which all mathematical and logical functions will be applied.
   *
   * @alias &num;date
   * @memberof Calendar
   * @private
   * @type {Date}
   */
  #date;

  /**
   * @param {Date} date Which all mathematical and logical functions will be applied.
   * @public
   */
  constructor(date) {
    this.#date = date;
  }

  /**
   * Calculates a new <code>Date</code> by adding a <code>number</code> of days.
   *
   * @example
   * const today = Date(Date.now("06/10/2023"));
   * const tomorrow = new Calendar(today).add({ days: 1 });
   * // Returns 07/10/2023
   * @param {Record<"days", number>} [options={ days: 0 }]
   * @param {number} [options.days=0] Days to add to the initial value.
   * @public
   * @returns {Date} A <code>Date</code> with the value of days added in the future.
   * @throws {TypeError} If <code><a href="##date">#date</a></code> is missing.
   */
  add({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() + days);
    return result;
  }

  /**
   * Compares <code><a href="##date">#date</a></code> with a <code>Date</code> range specified by the before and after properties.
   *
   * @example
   * const today = new Calendar(new Date(Date.now("06/10/2023")));
   * const yesterday = new Calendar(today).subtract({ days: 1 });
   * const tomorrow = new Calendar(today).add({ days: 1 })
   * today.between({ after: yesterday, before: today })
   * // Returns true
   * @param {Record<"after" | "before", Date>} [options={}]
   * @param {Date} [options.after] A <code>Date</code> in the past representing the start of the range.
   * @param {Date} [options.before] A <code>Date</code> in the future representing the end of the range.
   * @public
   * @returns {Boolean} If <code><a href="##date">#date</a></code> is within the range created by before and after properties.
   * @throws {TypeError} If after or before properties are missing or if <code><a href="##date">#date</a></code> is missing.
   */
  between({ after, before } = {}) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    } else if (!after) {
      throw new TypeError("Empty after");
    } else if (!before) {
      throw new TypeError("Empty before");
    } else {
      return this.#date.getTime() > after.getTime() &&
        this.#date.getTime() < before.getTime();
    }
  }

  /**
   * Compares <code><a href="##date">#date</a></code> with either the before or before properties.
   *
   * @example
   * const today = new Calendar(new Date(Date.now("06/10/2023")));
   * const yesterday = new Calendar(today).subtract({ days: 1 });
   * today.is({ after: yesterday })
   * // Returns true
   * @example
   * const today = new Calendar(new Date(Date.now("06/10/2023")));
   * const tomorrow = new Calendar(today).add({ days: 1 });
   * today.is({ before: tomorrow })
   * // Returns true
   * @example
   * const today = new Calendar(new Date(Date.now("06/10/2023")));
   * const yesterday = new Calendar(today).subtract({ days: 1 });
   * const tomorrow = new Calendar(today).add({ days: 1 })
   * today.is({ after: yesterday, before: today })
   * // Returns true
   * @param {Record<"after" | "before", Date>} [options={}]
   * @param {Date} [options.after] A <code>Date</code> in the past.
   * @param {Date} [options.before] A <code>Date</code> in the future.
   * @public
   * @returns {Boolean} If before is provided and <code><a href="##date">#date</a></code> is in the future or if after is provided and <code><a href="##date">#date</a></code> is in the past.
   * @see The [between]{@link Calendar#between} function is used if both before and before properties are passed.
   * @throws {TypeError} If both before and before are missing or if <code><a href="##date">#date</a></code> is missing.
   */
  is({ after, before } = {}) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    } else if (!after && !before) {
      throw new TypeError("Empty before and after");
    } else if (before && after) {
      return this.between({ after, before });
    } else if (after && !before) {
      return this.#date.getTime() > after.getTime();
    } else if (!after && before) {
      return this.#date.getTime() < before.getTime();
    }
  }

  /**
   * Calculates a new <code>Date</code> by subtracting a <code>number</code> of days.
   *
   * @example
   * const today = Date(Date.now("06/10/2023"));
   * const yesterday = new Calendar(today).subtract({ days: 1 });
   * // Returns 05/10/2023
   * @param {Record<"days", number>} [options={ days: 0 }]
   * @param {number} [options.days=0] Days to subtract from the initial value.
   * @public
   * @returns {Date} A <code>Date</code> with the value of before subtracted in the past.
   * @throws {TypeError} If <code><a href="##date">#date</a></code> is missing.
   */
  subtract({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() - days);
    return result;
  }
}
