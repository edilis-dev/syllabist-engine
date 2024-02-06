import { Symbol } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

/**
 * The Compressor <code>class</code> is responsible for compressing a <code>JSON</code> structure into a Syllabist structure.
 */
export class Compressor {
  /**
   * <code>Record<string, unknown></code> to be compressed into a Syllabist structure.
   *
   * @alias &num;data
   * @memberof Compressor
   * @private
   * @type {Record<string, unknown>}
   */
  #data;

  /**
   * @param {JSON} data Data to be compressed
   * @public
   */
  constructor(data) {
    console.info("Constructing new instance");

    this.#data = data;
  }

  /**
   * Parses a <code>JSON</code> structure and compresses the contents into a Syllabist struture.
   *
   * @public
   * @returns {string} Parsed Syllabist structure.
   */
  parse() {
    console.info("Starting parse");

    let value = [];

    for (const key in this.#data) {
      console.trace(`Found key ${key} in ${JSON.stringify(this.#data)}`);

      if (typeof this.#data[key] === "object") {
        value = [
          ...value,
          this.#object({ key, value: this.#data }).join(""),
        ];
      } else {
        value = [
          ...value,
          this.#string({ key, value: this.#data }).join(""),
        ];
      }
    }

    console.info("Parse finished");
    console.trace(`Parse result ${JSON.stringify(value)}`);

    return value.join("\n");
  }

  /**
   * Determines if a <code>Record</code> is a concatenation group by inspecting its values.
   *
   * @alias &num;isConcatenator
   * @function
   * @memberof Compressor
   * @param {Record<"value", unknown>} target
   * @param {Record<string, unknown>} target.value Record to inspect
   * @private
   * @returns {Boolean}
   * @see [Symbols]{@linkcode module:Constants.Symbol}
   */
  #isConcatenator({ value }) {
    return Object.keys(value).every((value) => value !== "");
  }

  /**
   * Determines if a <code>Record</code> is a combinator group by inspecting its values.
   *
   * @alias &num;isCombinator
   * @function
   * @memberof Compressor
   * @param {Record<"value", unknown>} target
   * @param {Record<string, unknown>} target.value Record to inspect
   * @private
   * @returns {Boolean}
   * @see [Symbols]{@linkcode module:Constants.Symbol}
   */
  #isCombinator({ value }) {
    return Object.keys(value).some((value) => value === "");
  }

  /**
   * Determines if a provided key is the last entry in a <code>Record</code>.
   *
   * @alias &num;isLast
   * @function
   * @memberof Compressor
   * @param {Record<"key" | "value", unknown>} target
   * @param {Record<string, unknown>} target.value Record to inspect
   * @param {string} target.key Key to compare with last position
   * @private
   * @returns {Boolean}
   */
  #isLast({ key, value }) {
    return Object.keys(value).at(-1) === key;
  }

  /**
   * Determines if a <code>Record</code> has more than one none empty key-value pair.
   *
   * @alias &num;isSibling
   * @function
   * @memberof Compressor
   * @param {Record<"value", unknown>} target
   * @param {Record<string, unknown>} target.value Record to inspect
   * @private
   * @returns {Boolean}
   */
  #isSibling({ value }) {
    return Object.keys(value).filter((value) => value !== "").length > 1;
  }

  /**
   * Processes the value represented by the key in the <code>Record</code> value. This will always either be a concatenator group or a combinator group.
   *
   * @alias &num;object
   * @function
   * @memberof Compressor
   * @param {Record<"key" | "value", unknown>} target
   * @param {string} target.key Key to compare with last position
   * @param {Array<string>} [target.stack=[]] List of syllables and [Symbols]{@linkcode module:Constants.Symbol}.
   * @param {Record<string, unknown>} target.value Record to inspect
   * @private
   * @returns {Array<string>}
   * @see [Symbols]{@linkcode module:Constants.Symbol}
   */
  #object({ key, stack = [], value }) {
    if (this.#isCombinator({ value: value[key] })) {
      console.trace(
        `Identified relationship for key ${key} as ${
          ReverseLookup(
            Symbol,
            Symbol.Combinator,
          )
        }`,
      );
      stack.push(key, Symbol.Combinator);

      console.trace(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      console.trace(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
      console.trace(`Finished group of ${key}`);
    } else if (this.#isConcatenator({ value: value[key] })) {
      console.trace(
        `Identified relationship for ${key} as ${
          ReverseLookup(
            Symbol,
            Symbol.Concatenator,
          )
        }`,
      );
      stack.push(key, Symbol.Concatenator);

      console.trace(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      console.trace(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
    } else {
      console.trace(`Failed to identify relationship for key ${key}`);
    }

    return stack;
  }

  /**
   * Parses all keys of the <code>Record</code> value. Inserting all keys into the <a href="##stack"><code>#stack</code></a>.
   *
   * @alias &num;parse
   * @function
   * @memberof Compressor
   * @param {Record<"value", unknown>} target
   * @param {Array<string>} [target.stack=[]] List of syllables and [Symbols]{@linkcode module:Constants.Symbol}.
   * @param {Record<string, unknown>} target.value Record to parse
   * @private
   * @returns {Array<string>}
   */
  #parse({ stack = [], value }) {
    for (const key in value) {
      console.trace(`Starting iteration with key ${key}`);

      if (typeof value[key] === "object") {
        console.trace(`Identified ${key} as object`);
        this.#object({ key, stack, value });
      } else if (typeof value[key] === "string") {
        console.trace(`Identified ${key} as string`);
        this.#string({ key, stack, value });
      } else {
        console.warn(
          `Identified ${key} as unparseable type ${typeof value[key]}`,
        );
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        console.trace(`Identified ${key} as a sibling not in last place `);
        stack.push(Symbol.Sibling);
      }
    }

    return stack;
  }

  /**
   * Inserts the key into the <a href="##stack"><code>#stack</code></a>.
   *
   * @alias &num;string
   * @function
   * @memberof Compressor
   * @param {Record<"key", string>} target
   * @param {Record<string, unknown>} target.key Key to insert
   * @param {Array<string>} [target.stack=[]] List of syllables and [Symbols]{@linkcode module:Constants.Symbol}.
   * @private
   * @returns {Array<string>}
   */
  #string({ key, stack = [] }) {
    stack.push(key);

    return stack;
  }
}
