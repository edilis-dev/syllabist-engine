import { Standard } from "./Constants.js";

export const Standardise = ({ data, type = Standard.JSON }) => {
  if (!data) {
    throw new Error("Empty data");
  }

  switch (type) {
    case Standard.JSON: {
      return JSON.stringify(JSON.parse(data), undefined, 2);
    }
    case Standard.Text: {
      return data.trim();
    }
    default:
      throw new Error(`Unhandled type ${type}`);
  }
};
