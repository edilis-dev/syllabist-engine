export const Type = Object.freeze({
  Group: "group",
  Empty: "empty",
  Value: "value",
});

export const Standardise = {
  JSON: "json",
};

export const Symbol = Object.freeze({
  Combinator: "~",
  Concatenator: ">",
  GroupEnd: "]",
  GroupStart: "[",
  Sibling: "|",
});

export const Charset = new RegExp(`[${Object.values(Symbol).join("\\")}a-z-]`);
