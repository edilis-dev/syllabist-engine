import "https://deno.land/std@0.205.0/dotenv/load.ts";
import { encodeHex } from "https://deno.land/std@0.205.0/encoding/hex.ts";
import { resolve } from "https://deno.land/std@0.205.0/path/mod.ts";

import { Calendar } from "./Calendar.js";

export class Updater {
  #config = {
    artifacts: null,
    latest: null,
    lifetime: null,
    manifest: null,
  };
  #data;
  #digest;
  #manifest;
  #source =
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

  constructor() {}

  async update(source) {
    try {
      this.#config = {
        artifacts: Deno.env.get("artifacts") ?? "artifacts",
        latest: Deno.env.get("latest") ?? "latest",
        lifetime: Deno.env.get("lifetime") ?? 90,
        manifest: Deno.env.get("manifest") ?? "manifest.json",
      };

      await this.#fetch(source);
      await this.#hash();
      await this.#read();

      if (this.#digest === this.#manifest.latest.digest) {
        console.info("Source is unchanged");
      } else {
        console.info("Source changed");

        await this.#write();
        await this.#update();
      }

      await this.#prune();
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  async #fetch(source = this.#source) {
    console.info("Starting fetch");
    console.trace(`Source ${source}`);
    const response = await fetch(source);

    if (response.ok) {
      this.#data = await response.text();
      console.trace("Finished fetch");
    } else {
      const json = await response
        .clone()
        .json()
        .then((json) => json)
        .catch(() => undefined);

      const text = await response
        .clone()
        .text()
        .then((text) => text)
        .catch(() => undefined);

      console.error(
        `Fetch failed with reason: ${
          JSON.stringify(json) || text || response.statusText
        }`,
      );

      throw new TypeError(JSON.stringify(json) || text || response.statusText);
    }
  }

  async #hash() {
    console.info("Digesting file");
    const encoder = new TextEncoder().encode(this.#data);
    const buffer = await crypto.subtle.digest("SHA-256", encoder);
    this.#digest = encodeHex(buffer);
    console.trace(`Calculated digest ${this.#digest}`);
    console.info("Finished digesting file");
  }

  async #prune() {
    console.info("Pruning manifest");
    const timestamp = new Calendar(new Date(Date.now()));
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    console.trace(`Pruning manifest at ${path}`);
    const end = timestamp.subtract({
      days: typeof this.#config.lifetime === "number"
        ? this.#config.lifetime
        : parseInt(this.#config.lifetime),
    });
    console.info(`End date for obsolete files ${end}`);

    const latest = this.#manifest.latest;
    console.trace(`Storing latest value ${JSON.stringify(latest)}`);

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    console.trace(
      `Storing list of existing entries ${JSON.stringify(existing)}`,
    );

    const { keep, remove } = Object.entries(existing).reduce(
      ({ keep, remove }, [key, value]) =>
        new Calendar(new Date(value.obsoleted)).is({ before: end })
          ? { keep, remove: { [key]: value, ...remove } }
          : { keep: { [key]: value, ...keep }, remove },
      { keep: [], remove: [] },
    );

    console.trace(
      `Storing list of existing entries to keep ${JSON.stringify(keep)}`,
    );
    console.trace(
      `Storing list of existing entries to remove ${JSON.stringify(remove)}`,
    );

    this.#manifest = {
      latest,
      ...keep,
    };
    console.trace(
      `Created new manifest contents ${JSON.stringify(this.#manifest)}`,
    );

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    console.info("Finished updating manifest");

    for (const file in remove) {
      try {
        await Deno.remove(resolve(this.#config.artifacts, `${file}.txt`));
      } catch {
        console.warn(`Failed to remove file ${file}`);
      }
    }
    console.info("Finished pruning");
  }

  async #read() {
    console.info("Reading manifest");
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    console.trace(`Reading manifest at ${path}`);
    const data = await Deno.readTextFile(path);
    this.#manifest = JSON.parse(data);
    console.info(`Finished reading manifest`);
  }

  async #update() {
    console.info("Updating manifest");
    const timestamp = new Date(Date.now());
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    console.trace(`Updating manifest at ${path}`);

    const previous = this.#manifest.latest;
    console.trace(
      `Storing previous value of latest ${JSON.stringify(previous)}`,
    );

    const latest = {
      created: timestamp,
      digest: this.#digest,
    };
    console.trace(`Created new value of latest ${JSON.stringify(latest)}`);

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    console.trace(
      `Storing list of existing entries ${JSON.stringify(existing)}`,
    );

    this.#manifest = previous.digest
      ? {
        latest,
        [previous.digest]: {
          created: previous.created,
          obsoleted: timestamp,
        },
        ...existing,
      }
      : { latest };
    console.trace(
      `Created new manifest contents ${JSON.stringify(this.#manifest)}`,
    );

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    console.info("Finished updating manifest");
  }

  async #write() {
    console.info("Writing artifact");
    const path = resolve(this.#config.artifacts, `${this.#digest}.txt`);
    console.trace(`Writing artifiact at ${path}`);
    await Deno.writeTextFile(path, this.#data);
    console.info("Finished writing artifact");
  }
}
