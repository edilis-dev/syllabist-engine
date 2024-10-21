import {
  BlendTypes,
  ConsonantDigraphs,
  Consonants,
  DigraphTypes,
  FinalDigraphs,
  GluedSounds,
  InitialDigraphs,
  LBlends,
  OtherBlends,
  Quadgraphs,
  RBlends,
  SBlends,
  Trigraphs,
  VowelDigraphs,
  Vowels,
} from "./Separator.constants.js";

export function mergeRepeatedCharacters(str) {
  const Exceptions = new Set(["bb", "cc", "ll", "mm", "pp", "tt", "zz"]);

  return [...str].reduce((previousValue, currentValue) => {
    const previousChar = previousValue.at(-1);

    if (currentValue === previousChar) {
      if (Groups.BlendSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousChar}${currentValue}`;
      } else if (Groups.Digraphs.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      } else if (Groups.GluedSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      } else if (Exceptions.has(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      }

      return previousValue;
    }

    return `${previousValue}${currentValue}`;
  });
}

export const Groups = {
  BlendSounds: {
    test: (str, type) => {
      switch (type) {
        case BlendTypes.L: {
          return new RegExp(Array.from(LBlends).join("|")).test(str);
        }
        case BlendTypes.R: {
          return new RegExp(Array.from(RBlends).join("|")).test(str);
        }
        case BlendTypes.S: {
          return new RegExp(Array.from(SBlends).join("|")).test(str);
        }
        case BlendTypes.Other: {
          return new RegExp(Array.from(OtherBlends).join("|")).test(str);
        }
        default: {
          return new RegExp(
            `${Array.from(LBlends).join("|")}|${
              Array.from(RBlends).join(
                "|",
              )
            }|${Array.from(SBlends).join("|")}|${
              Array.from(OtherBlends).join(
                "|",
              )
            }`,
          ).test(str);
        }
      }
    },
  },

  Digraphs: {
    test: (str, position) => {
      switch (position) {
        case DigraphTypes.Consonant: {
          return new RegExp(Array.from(ConsonantDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Final: {
          return new RegExp(Array.from(FinalDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Initial: {
          return new RegExp(Array.from(InitialDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Vowel: {
          return new RegExp(Array.from(VowelDigraphs).join("|")).test(str);
        }
        default: {
          return new RegExp(
            `${Array.from(ConsonantDigraphs).join("|")}|${
              Array.from(
                FinalDigraphs,
              ).join("|")
            }|${Array.from(InitialDigraphs).join("|")}|${
              Array.from(
                VowelDigraphs,
              ).join("|")
            }`,
          ).test(str);
        }
      }
    },
  },

  GluedSounds: {
    test: (str) =>
      new RegExp(
        `${Array.from(GluedSounds).join("|")}|${
          Array.from(Vowels)
            .map((v) => `${v}nk`)
            .join("|")
        }|${
          Array.from(Vowels)
            .map((v) => `${v}ng`)
            .join("|")
        }`,
      ).test(str),
  },
  Quadgraphs: {
    test: (str) => new RegExp(Array.from(Quadgraphs).join("|")).test(str),
  },
  Trigraphs: {
    test: (str) => new RegExp(Array.from(Trigraphs).join("|")).test(str),
  },
};

export const PatternTypes = {
  LE: "le",
  VCCCCV: "vccccv",
  VCCCV: "vcccv",
  VCCV: "vccv",
  VCV: "vcv",
  VV: "vv",
};

export class LEPattern {
  #consonants = Array.from(Consonants).join("");

  exec(str) {
    return new RegExp(
      `(?<head>[a-z]*?)(?<pattern>[${this.#consonants}]le$)`,
    ).exec(str);
  }

  findIndex(str) {
    const match = new RegExp(`(?:[a-z]*?)(?:[${this.#consonants}]le$)`).exec(
      str,
    );

    return match ? match.index : null;
  }

  test(str) {
    return new RegExp(`(?:[a-z]*[${this.#consonants}]le$)`).test(str);
  }
}

export class VPattern {
  #consonantCount;
  #consonants = Array.from(Consonants).join("");
  #vowels = Array.from(Vowels).join("");

  constructor({ consonantCount } = { consonantCount: 0 }) {
    this.#consonantCount = consonantCount;
  }

  exec(str) {
    return new RegExp(
      `(?<head>[a-z]*?)(?<pattern>[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}])(?<tail>[a-z]*)`,
    ).exec(str);
  }

  findIndex(str) {
    const match = new RegExp(
      `[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}]`,
    ).exec(str);

    return match ? match.index : null;
  }

  test(str) {
    return new RegExp(
      `(?:[a-z]*?)(?:[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}])(?:[a-z]*)`,
    ).test(str);
  }
}
