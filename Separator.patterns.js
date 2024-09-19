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
  // prettier-ignore
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
          return new RegExp(`${Array.from(LBlends)
            .join("|")}|${Array.from(RBlends)
            .join("|")}|${Array.from(SBlends)
            .join("|")}|${Array.from(OtherBlends)
            .join("|")}`,
          ).test(str);
        }
      }
    },
  },
  // prettier-ignore
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
          return new RegExp(`${Array.from(ConsonantDigraphs)
            .join("|")}|${Array.from(FinalDigraphs)
            .join("|")}|${Array.from(InitialDigraphs)
            .join("|")}|${Array.from(VowelDigraphs)
            .join("|")}`
          ).test(str)
        }
      }
    },
  },
  // prettier-ignore
  GluedSounds: {
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
    // prettier-ignore
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?)(?<end>[${Array.from(Consonants).join("")}]le$)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Consonants).join("")}]le$)`).test(str),
  },
  // prettier-ignore
  VV: {
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<end>[${Array.from(Vowels).join("")}][a-z]*)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Vowels).join("")}](?:[${Array.from(Vowels).join("")}][a-z]*))`).test(str),
  },
  // prettier-ignore
  VCV: {
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}])(?<end>[${Array.from(Vowels).join("")}][a-z]*)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}][${Array.from(Vowels).join("")}])(?:[a-z]*)`).test(str),
  },
  // prettier-ignore
  VCCV: {
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{2})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{2}[${Array.from(Vowels).join("")}])(?:[a-z]*)`).test(str),
  },
  // prettier-ignore
  VCCCV: {
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{3})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{3}[${Array.from(Vowels).join("")}])(?:[a-z]*)`).test(str),
  },
  // prettier-ignore
  VCCCCV: {
    exec: (str) =>
      new RegExp(`(?<beginning>[a-z]*?[${Array.from(Vowels).join("")}])(?<middle>[${Array.from(Consonants).join("")}]{4})(?<end>[${Array.from(Vowels).join("")}][a-z]*)`).exec(str),
    test: (str) =>
      new RegExp(`(?:[a-z]*[${Array.from(Vowels).join("")}][${Array.from(Consonants).join("")}]{4}[${Array.from(Vowels).join("")}])(?:[a-z]*)`).test(str),
  },
};
