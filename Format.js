import { Standard } from "./Format.constants.js";

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
