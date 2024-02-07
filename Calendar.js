export class Calendar {
  #date;

  constructor(date) {
    this.#date = date;
  }

  add({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() + days);
    return result;
  }

  between({ after, before } = {}) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    } else if (!after) {
      throw new TypeError("Empty after");
    } else if (!before) {
      throw new TypeError("Empty before");
    } else {
      return (
        this.#date.getTime() > after.getTime() &&
        this.#date.getTime() < before.getTime()
      );
    }
  }

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

  subtract({ days = 0 } = { days: 0 }) {
    if (!this.#date) {
      throw new TypeError("Empty date");
    }

    const result = new Date(this.#date);
    result.setDate(this.#date.getDate() - days);
    return result;
  }
}
