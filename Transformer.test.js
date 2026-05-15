import { assertEquals, assertRejects } from "@std/assert";

import { Transformer } from "./Transformer.js";

Deno.test({
  name: "transform should throw a TypeError for missing data",
  fn: async () => {
    await assertRejects(() => new Transformer().transform(), TypeError);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with a single syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: "a",
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with adjacent syllable groups",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;zal;ea";
        yield "aard;vark";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        zal: {
          ea: "ea",
        },
      },
      aard: {
        vark: "vark",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;ble";
        yield "a;bout";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        ble: "ble",
        bout: "bout",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with combining syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa;ter";
        yield "wa;ter;borne";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      wa: {
        ter: {
          "": "",
          borne: "borne",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with combining syllables within sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;bra;sion";
        yield "a;bra;sive";
        yield "a;bun;dance";
        yield "a;bun;dant";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        bra: {
          sion: "sion",
          sive: "sive",
        },
        bun: {
          dance: "dance",
          dant: "dant",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should add a combinator marker when a shorter word arrives after a longer one",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa;ter;borne";
        yield "wa;ter";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      wa: {
        ter: {
          "": "",
          borne: "borne",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should correctly insert remaining keys when extending a leaf by more than one level",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;cet";
        yield "a;cet;y;le;ne";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        cet: {
          "": "",
          y: {
            le: {
              ne: "ne",
            },
          },
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should produce the same tree regardless of whether shorter or longer words arrive first",
  fn: async () => {
    const iterLongerFirst = {
      async *[Symbol.asyncIterator]() {
        yield "a;ban;don;ment";
        yield "a;ban;don;ed";
        yield "a;ban;don";
      },
    };

    const iterShorterFirst = {
      async *[Symbol.asyncIterator]() {
        yield "a;ban;don";
        yield "a;ban;don;ed";
        yield "a;ban;don;ment";
      },
    };

    const expected = {
      a: {
        ban: {
          don: {
            "": "",
            ed: "ed",
            ment: "ment",
          },
        },
      },
    };

    assertEquals(await new Transformer(iterLongerFirst).transform(), expected);
    assertEquals(await new Transformer(iterShorterFirst).transform(), expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return a structure with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "ac;com;pa;ni;ment";
        yield "ac;com;pa;ny";
        yield "ac;com;pa;ny;ing";
        yield "ac;com;plice";
        yield "ac;com;plish";
        yield "ac;com;plish;ment";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
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
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should not insert duplicate words into the tree",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;ban;don";
        yield "a;ban;don;ed";
        yield "a;ban;don;ed";
        yield "a;ban;don;ment";
      },
    };

    const expected = {
      a: {
        ban: {
          don: {
            "": "",
            ed: "ed",
            ment: "ment",
          },
        },
      },
    };

    assertEquals(await new Transformer(iter).transform(), expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should insert a single-syllable line as a top-level leaf alongside multi-syllable lines",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "boat"; // no separator — exercises the warn path
        yield "a;board"; // normal multi-syllable line
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        board: "board",
      },
      boat: "boat",
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "transform should return the correct structure when using a custom separator",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a+zal+ea";
        yield "aard+vark";
      },
    };

    const actual = await new Transformer(iter).transform("+");

    const expected = {
      a: {
        zal: {
          ea: "ea",
        },
      },
      aard: {
        vark: "vark",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});
