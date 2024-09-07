import {
  Consonants,
  Digraphs,
  GluedSounds,
  LBlends,
  OtherBlends,
  Quadgraphs,
  RBlends,
  SBlends,
  Trigraphs,
  Vowels,
} from "./Separator.constants.js";

export function mergeRepeatedCharacters(str) {
  return [...str].reduce((previousValue, currentValue) => {
    const previousChar = previousValue.at(-1);

    if (currentValue === previousChar) {
      if (Groups.BlendSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousChar}${currentValue}`;
      } else if (Groups.Digraphs.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      } else if (Groups.GluedSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      }

      return previousValue;
    }

    return `${previousValue}${currentValue}`;
  });
}

export const Groups = {
  BlendSounds: {
    // prettier-ignore
    test: (str) => new RegExp(`${Array.from(LBlends).join("|")}|${Array.from(RBlends).join("|")}|${Array.from(SBlends).join("|")}|${Array.from(OtherBlends).join("|")}`).test(str),
  },
  Digraphs: {
    test: (str) => new RegExp(`${Array.from(Digraphs).join("|")}`).test(str),
  },
  GluedSounds: {
    // prettier-ignore
    test: (str) =>
      new RegExp(
        `${Array.from(GluedSounds)
          .join("|")}|${Array.from(Vowels)
          .map((v) => `${v}nk$`)
          .join("|")}|${Array.from(Vowels)
          .map((v) => `${v}ng$`)
          .join("|")}`,
      ).test(str),
  },
  Quadgraphs: {
    test: (str) => new RegExp(Array.from(Quadgraphs).join("|")).test(str),
  },
  Trigraphs: {
    test: (str) => new RegExp(Array.from(Trigraphs).join("|")).test(str),
  },
};

export const Patterns = {
  LE: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?)(?<end>[${Array.from(Consonants).join("")}]le$)`,
      ).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Consonants).join("")}]le$)`).test(
        str,
      ),
  },
  VV: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<end>[${Array.from(Vowels).join("")}][a-z]*)`,
      ).exec(str),
    test: (str) =>
      new RegExp(
        `(?:[a-z]*[${Array.from(Vowels).join("")}](?:[${Array.from(Vowels).join("")}][a-z]*))`,
      ).test(str),
  },
  VCV: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}])(?<end>[${Array.from(Vowels).join("")}][a-z]*)`,
      ).exec(str),
    test: (str) =>
      new RegExp(
        `(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}][${Array.from(Vowels).join("")}])(?:[a-z]*)`,
      ).test(str),
  },
  VCCV: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{2})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`,
      ).exec(str),
    test: (str) =>
      new RegExp(
        `(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{2}[${Array.from(Vowels).join("")}])(?:[a-z]*)`,
      ).test(str),
  },
  VCCCV: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{3})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`,
      ).exec(str),
    test: (str) =>
      new RegExp(
        `(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{3}[${Array.from(Vowels).join("")}])(?:[a-z]*)`,
      ).test(str),
  },
  VCCCCV: {
    exec: (str) =>
      new RegExp(
        `(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{4})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`,
      ).exec(str),
    test: (str) =>
      new RegExp(
        `(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{4}[${Array.from(Vowels).join("")}])(?:[a-z]*)`,
      ).test(str),
  },
};
