import { Standardise } from "./Constants.js";

export const standardise = ({ data, type = Standardise.JSON }) => {
  if (!data) {
    throw new Error("Empty data");
  }

  switch (type) {
    case Standardise.JSON: {
      return JSON.stringify(JSON.parse(data), undefined, 2);
    }
    default:
      throw new Error(`Unhandled type ${type}`);
  }
};
