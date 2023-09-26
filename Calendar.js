export class Calendar {
  #date;

  /**
   * @param {Date} date to be wrapped and operated upon
   */
  constructor(date) {
    this.#date = date;
  }

  /**
   * The `add` function calculates a new `Date` by adding the `Number` value of `days`.
   * Throws an `Error` if `date` property is missing.
   *
   * @param {Object} [param0={ days: 0 }]
   * @param {number} [param0.days=0] days to add to the initial value
   *
   * @returns a `Date` with the value of `days` added in the future
   *
   * @throws if `date` is missing
   */
  add({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new Error("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() + days);
    return result;
  }

  /**
   * The `between` function compares a target with a date range specified with the `before` and `after` properties.
   * Throws an `Error` if `date` property is missing.
   *
   * @param {Object} [param0={}]
   * @param {Date} param0.after is a `Date` in the past representing the start of the range
   * @param {Date} param0.before is a `Date` in the future representing the end of the range
   *
   * @returns `true` if date is within date range created by `before` and `after`, otherwise `false`
   * @returns `false` if the `before` or `after` value are missing
   *
   * @throws if `date` is missing
   * @throws if `before` is missing
   * @throws if `after` is missing
   */
  between({ after, before } = {}) {
    if (!this.#date) {
      throw new Error("Empty date");
    } else if (!after) {
      throw new Error("Empty after");
    } else if (!before) {
      throw new Error("Empty before");
    } else {
      return this.#date.getTime() > after.getTime() &&
        this.#date.getTime() < before.getTime();
    }
  }

  /**
   * The `is` function compares a target `date` with either the `before` or `after` properties.
   *
   * If both `before` and `after` properties are passed it will defer to the `between` function.
   *
   * @param {Object} [param0={}]
   * @param {Date} param0.after is a `Date` in the past
   * @param {Date} param0.before is a `Date` in the future
   *
   * @returns true if `after` is provided and `date` is in the future, otherwise `false`
   * @returns true if `before` is provided and `date` is in the past, otherwise `false`
   *
   * @throws if `date` property is missing
   * @throws if both `before` and `after` are missing.
   */
  is({ after, before } = {}) {
    if (!this.#date) {
      throw new Error("Empty date");
    } else if (!after && !before) {
      throw new Error("Empty before and after");
    } else if (before && after) {
      return this.between({ after, before });
    } else if (after && !before) {
      return this.#date.getTime() > after.getTime();
    } else if (!after && before) {
      return this.#date.getTime() < before.getTime();
    }
  }

  /**
   * The `subtract` function calculates a new `Date` by subtracting the `Number` value of `days`
   * Throws an `Error` if `date` property is missing.
   *
   * @param {Object} [param0={ days: 0 }]
   * @param {Number} [param0.days=0] to subtract from the initial value
   *
   * @returns a `Date` with the value of `days` in the past
   *
   * @throws if `date` is missing
   */
  subtract({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new Error("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() - days);
    return result;
  }
}
