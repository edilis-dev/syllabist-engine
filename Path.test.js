import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertGreaterOrEqual,
  assertLessOrEqual,
} from "@std/assert";

import { Path } from "./Path.js";

Deno.test({
  name: "should not traverse an invalid path",
  fn: async () => {
    const path = ["ac", "com", "pa", "ni", "ment"];

    const actual = new Path({
      a: {
        bout: "bout",
      },
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
  name: "should traverse a valid path in a simple tree",
  fn: async () => {
    const path = ["ac", "com", "pa", "ni", "ment"];

    const actual = new Path({
      a: {
        bout: "bout",
      },
      ac: {
        com: {
          pa: {
            ni: {
              ment: "ment",
            },
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

    assert(actual);
  },
  ignore: false,
});

Deno.test({
  name: "should traverse a valid path in a complex tree",
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
  name: "should return a list of suggestions for a valid tree and path",
  fn: async () => {
    const path = ["un", "der"];

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
    }).suggestions(path);

    assertEquals(actual.length, 1);
  },
  ignore: false,
});

Deno.test({
  name: "should return an empty list of suggestions for an invalid path",
  fn: async () => {
    const path = [];

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
    }).suggestions(path);
    const expected = [];

    assertEquals(actual.length, expected.length);
    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return an empty list of suggestions for a leaf node",
  fn: async () => {
    const path = ["com"];

    const actual = new Path({
      com: {
        "": "",
      },
      in: {
        "": "",
      },
      re: {
        "": "",
      },
      un: {
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
  name: "should return a list of suggestions less than or equal to maximum",
  fn: async () => {
    const path = ["un", "der"];

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
    }).suggestions(path, { maximum: 3 });
    const expected = ["line", "stand", "stood"];

    assertArrayIncludes(actual, expected);
    assertLessOrEqual(actual.length, expected.length);
  },
  ignore: false,
});

Deno.test({
  name: "should return a list of suggestions greater than or equal to minimum",
  fn: async () => {
    const path = ["un", "der"];

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
    }).suggestions(path, { minimum: 3 });
    const expected = ["line", "stand", "stood"];

    assertArrayIncludes(actual, expected);
    assertGreaterOrEqual(actual.length, expected.length);
  },
  ignore: false,
});
