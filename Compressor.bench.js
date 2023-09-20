import { Compressor } from "./Compressor.js";

Deno.test({
  name: "should ignores unparseable types",
  fn: () => {
    new Compressor({
      a: {
        bout: -1,
        back: "back",
      },
    }).parse();
  },
});

Deno.bench({
  name: "should compress multiple lines",
  fn: () => {
    new Compressor({
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
    }).parse();
  },
});

Deno.bench({
  name: "should return a stucture with a single syllable",
  fn: () => {
    new Compressor({ a: "a" }).parse();
  },
});

Deno.bench({
  name: "should return a structure with concatenated syllables",
  fn: () => {
    new Compressor({
      a: {
        bout: "bout",
      },
    }).parse();
  },
});

Deno.bench({
  name: "should return a structure with sibling syllables",
  fn: () => {
    new Compressor({
      a: {
        ble: "ble",
        bout: "bout",
      },
    }).parse();
  },
});

Deno.bench({
  name: "should return a structure with two combining syllables",
  fn: () => {
    new Compressor({
      wa: {
        ter: {
          "": "",
          borne: "borne",
        },
      },
    }).parse();
  },
});

Deno.bench({
  name:
    "should return a structure with combining syllables within sibling syllables",
  fn: () => {
    new Compressor({
      a: {
        ban: {
          don: {
            "": "",
            ment: "ment",
          },
          doned: "doned",
        },
      },
    }).parse();
  },
});

Deno.bench({
  name: "should return a structure with adjacent sibling syllables",
  fn: () => {
    new Compressor({
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
    }).parse();
  },
});

Deno.bench({
  name:
    "should return a structure with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: () => {
    new Compressor({
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
    }).parse();
  },
});
