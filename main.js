import { Separator } from "./Separator.js";

const iter = {
  async *[Symbol.asyncIterator]() {
    yield "ability";
    yield "accommodation";
    yield "allotment";
    yield "bankrupt";
    yield "basic";
    yield "basket";
    yield "beard";
    yield "blossom";
    yield "blubber";
    yield "cabin";
    yield "camel";
    yield "candle";
    yield "commandeer";
    yield "complex";
    yield "complimentary";
    yield "conflict";
    yield "conglomerate";
    yield "construct";
    yield "cradle";
    yield "creature";
    yield "dainty";
    yield "destabilising";
    yield "fairy";
    yield "football";
    yield "fudge";
    yield "gather";
    yield "giggle";
    yield "giraffe";
    yield "glare";
    yield "graphic";
    yield "handbag";
    yield "hatch";
    yield "laugh";
    yield "lazy";
    yield "lion";
    yield "milk";
    yield "moonlight";
    yield "programme";
    yield "pumpkin";
    yield "realtor";
    yield "reify";
    yield "reindeer";
    yield "rocket";
    yield "secret";
    yield "telephone";
    yield "through";
    yield "tiger";
    yield "vein";
    yield "weigh";
    yield "weight";
    yield "withstand";
  },
};

await new Separator(iter).separate();
