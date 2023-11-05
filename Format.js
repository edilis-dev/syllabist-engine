import { Standard } from "./Constants.js";

/**
 * @module Format
 * @public
 */

/**
 * Formats the input data consistently according to the specified type.
 *
 * @param {Object} properties
 * @param {string} properties.data Data to be formatted
 * @param {string} [properties.type=JSON] Type identifier
 * @public
 * @returns {string} The formatted input data.
 * @throws {TypeError} If data is mising or type is unrecognised.
 */
export function Standardise({ data, type = Standard.JSON }) {
  if (!data) {
    throw new TypeError("Empty data");
  }

  switch (type) {
    case Standard.JSON: {
      return JSON.stringify(JSON.parse(data), undefined, 2);
    }
    case Standard.Text: {
      return data.trim();
    }
    default:
      throw new TypeError(`Unhandled type ${type}`);
  }
}
