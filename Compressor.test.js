import { assertEquals, assertThrows } from "@std/assert";

import { Compressor } from "./Compressor.js";

Deno.test({
  name: "should throw an error for invalid value",
  fn: () => {
    const compressor = new Compressor({ "": null });

    assertThrows(
      () => compressor.compress(),
      TypeError,
      "Cannot convert undefined or null to object",
    );
  },
  ignore: false,
});

Deno.test({
  name: "should ignores uncompressable types",
  fn: () => {
    const actual = new Compressor({
      a: {
        bout: -1,
        back: "back",
      },
    }).compress();

    const expected = "a>[back]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should compress multiple lines",
  fn: () => {
    const actual = new Compressor({
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
    }).compress();

    const expected =
      "a>[bout]\nac>[com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a stucture with a single syllable",
  fn: () => {
    const actual = new Compressor({ a: "a" }).compress();

    const expected = "a";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with concatenated syllables",
  fn: () => {
    const actual = new Compressor({
      a: {
        bout: "bout",
      },
    }).compress();

    const expected = "a>[bout]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with sibling syllables",
  fn: () => {
    const actual = new Compressor({
      a: {
        ble: "ble",
        bout: "bout",
      },
    }).compress();

    const expected = "a>[ble|bout]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with two combining syllables",
  fn: () => {
    const actual = new Compressor({
      wa: {
        ter: {
          "": "",
          borne: "borne",
        },
      },
    }).compress();

    const expected = "wa>[ter~[borne]]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name:
    "should return a structure with combining syllables within sibling syllables",
  fn: () => {
    const actual = new Compressor({
      a: {
        ban: {
          don: {
            "": "",
            ment: "ment",
          },
          doned: "doned",
        },
      },
    }).compress();

    const expected = "a>[ban>[don~[ment]|doned]]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with adjacent sibling syllables",
  fn: () => {
    const actual = new Compressor({
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
    }).compress();

    const expected = "a>[bra>[sion|sive]|bun>[dance|dant]]";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name:
    "should return a structure with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: () => {
    const actual = new Compressor({
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
    }).compress();

    const expected = "ac>[com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]]";

    assertEquals(actual, expected);
  },
  ignore: false,
});
