import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertGreaterOrEqual,
  assertLessOrEqual,
  assertThrows,
} from "@std/assert";

import { Path } from "./Path.js";

Deno.test({
  name: "traverse should throw a TypeError for a missing tree",
  fn: () => {
    assertThrows(() => new Path().traverse([]), TypeError, "Empty tree");
  },
  ignore: false,
});

Deno.test({
  name: "traverse should return false when a path key is not found",
  fn: async () => {
    const path = ["ac", "com", "pa", "ni", "ment"];

    const actual = new Path({
      ac: {
        com: {
          pa: {
            ny: {
              "": "",
              ing: "ing",
            },
          },
          plice: "plice",
          plish: {
            "": "",
            ment: "ment",
          },
        },
      },
    }).traverse(path);

    assertFalse(actual);
  },
  ignore: false,
});

Deno.test({
  name: "traverse should return true for an empty path",
  fn: async () => {
    const path = [];

    const actual = new Path({}).traverse(path);

    assert(actual);
  },
  ignore: false,
});

Deno.test({
  name: "traverse should return true for a valid path in a simple tree",
  fn: async () => {
    const path = ["ac", "com", "pa", "ni", "ment"];

    const actual = new Path({
      ac: {
        com: {
          pa: {
            ni: {
              ment: "ment",
            },
          },
        },
      },
    }).traverse(path);

    assert(actual);
  },
  ignore: false,
});

Deno.test({
  name: "traverse should return true for a valid path in a complex tree",
  fn: async () => {
    const path = ["re", "con", "sid", "er", "a", "tion"];

    const actual = new Path({
      com: {
        pre: {
          hend: {
            "": "",
            ed: "ed",
          },
          hen: {
            sion: "sion",
            sive: {
              "": "",
              ly: "ly",
            },
          },
        },
      },
      in: {
        ter: {
          na: {
            tion: {
              al: {
                "": "",
                ly: "ly",
              },
            },
          },
          pret: {
            "": "",
            ed: "ed",
            er: "er",
          },
          rupt: {
            "": "",
            ed: "ed",
            ion: "ion",
          },
        },
      },
      re: {
        cord: {
          "": "",
          ed: "ed",
          ing: "ing",
        },
        con: {
          sid: {
            er: {
              "": "",
              a: {
                tion: "tion",
              },
            },
          },
        },
        mem: {
          ber: {
            "": "",
            ed: "ed",
          },
          brance: "brance",
        },
      },
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).traverse(path);

    assert(actual);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should throw a TypeError for a missing tree",
  fn: () => {
    assertThrows(() => new Path().suggestions([]), TypeError, "Empty tree");
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return results for a valid path",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path);

    assertEquals(actual.length, 1);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return an empty array for an empty path",
  fn: async () => {
    const path = [];

    const actual = new Path({}).suggestions(path);
    const expected = [];

    assertEquals(actual.length, expected.length);
    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return an empty array when the path leads to a combinator-only node",
  fn: async () => {
    const path = ["com"];

    const actual = new Path({
      com: {
        "": "",
      },
    }).suggestions(path);
    const expected = [];

    assertEquals(actual.length, expected.length);
    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return an empty array when the path leads to a string leaf node",
  fn: async () => {
    const path = ["com"];

    const actual = new Path({
      com: "com",
    }).suggestions(path);
    const expected = [];

    assertEquals(actual.length, expected.length);
    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return results that exclude the combinator marker",
  fn: async () => {
    const path = ["com", "pre", "hend"];

    const actual = new Path({
      com: {
        pre: {
          hend: {
            "": "",
            ed: "ed",
          },
        },
      },
    }).suggestions(path, { maximum: 2, minimum: 2 });
    const expected = ["ed"];

    assertEquals(actual.length, expected.length);
    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return at most maximum results",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path, { maximum: 3 });
    const expected = ["line", "stand", "stood"];

    assertArrayIncludes(actual, expected);
    assertLessOrEqual(actual.length, expected.length);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return at least minimum results",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path, { minimum: 3 });
    const expected = ["line", "stand", "stood"];

    assertArrayIncludes(actual, expected);
    assertGreaterOrEqual(actual.length, expected.length);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should return the same count when minimum and maximum are equal",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path, { minimum: 3, maximum: 3 });
    const expected = ["line", "stand", "stood"];

    assertArrayIncludes(actual, expected);
    assertEquals(actual.length, expected.length);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should normalise to the higher value when minimum exceeds maximum",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path, { minimum: 2, maximum: 1 });
    const expected = ["line", "stand"];

    assertArrayIncludes(actual, expected);
    assertGreaterOrEqual(actual.length, expected.length);
  },
  ignore: false,
});

Deno.test({
  name: "suggestions should cap results at the number of available keys",
  fn: async () => {
    const path = ["un", "der"];

    const actual = new Path({
      un: {
        der: {
          line: {
            "": "",
            d: "d",
          },
          stand: {
            "": "",
            ing: "ing",
          },
          stood: "stood",
          tak: {
            en: "en",
            er: "er",
            ing: "ing",
          },
        },
      },
    }).suggestions(path, { maximum: 6 });
    const expected = ["line", "stand", "stood", "tak"];

    assertArrayIncludes(actual, expected);
    assertLessOrEqual(actual.length, expected.length);
  },
  ignore: false,
});
