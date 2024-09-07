import "@std/dotenv/load";
import * as log from "@std/log";
import { encodeHex } from "@std/encoding/hex";
import { resolve } from "@std/path";

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
        log.info("Source is unchanged");
      } else {
        log.info("Source changed");

        await this.#write();
        await this.#update();
      }

      await this.#prune();
    } catch (error) {
      log.error(error);

      throw error;
    }
  }

  async #fetch(source = this.#source) {
    log.info("Starting fetch");
    log.debug(`Source ${source}`);
    const response = await fetch(source);

    if (response.ok) {
      this.#data = await response.text();
      log.debug("Finished fetch");
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

      log.error(
        `Fetch failed with reason: ${
          JSON.stringify(json) || text || response.statusText
        }`,
      );

      throw new TypeError(JSON.stringify(json) || text || response.statusText);
    }
  }

  async #hash() {
    log.info("Digesting file");
    const encoder = new TextEncoder().encode(this.#data);
    const buffer = await crypto.subtle.digest("SHA-256", encoder);
    this.#digest = encodeHex(buffer);
    log.debug(`Calculated digest ${this.#digest}`);
    log.info("Finished digesting file");
  }

  async #prune() {
    log.info("Pruning manifest");
    const timestamp = new Calendar(new Date(Date.now()));
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug(`Pruning manifest at ${path}`);
    const end = timestamp.subtract({
      days: typeof this.#config.lifetime === "number"
        ? this.#config.lifetime
        : parseInt(this.#config.lifetime),
    });
    log.info(`End date for obsolete files ${end}`);

    const latest = this.#manifest.latest;
    log.debug(`Storing latest value ${JSON.stringify(latest)}`);

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    log.debug(
      `Storing list of existing entries ${JSON.stringify(existing)}`,
    );

    const { keep, remove } = Object.entries(existing).reduce(
      ({ keep, remove }, [key, value]) =>
        new Calendar(new Date(value.obsoleted)).is({ before: end })
          ? { keep, remove: { [key]: value, ...remove } }
          : { keep: { [key]: value, ...keep }, remove },
      { keep: [], remove: [] },
    );

    log.debug(
      `Storing list of existing entries to keep ${JSON.stringify(keep)}`,
    );
    log.debug(
      `Storing list of existing entries to remove ${JSON.stringify(remove)}`,
    );

    this.#manifest = {
      latest,
      ...keep,
    };
    log.debug(
      `Created new manifest contents ${JSON.stringify(this.#manifest)}`,
    );

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    log.info("Finished updating manifest");

    for (const file in remove) {
      try {
        await Deno.remove(resolve(this.#config.artifacts, `${file}.txt`));
      } catch {
        console.warn(`Failed to remove file ${file}`);
      }
    }
    log.info("Finished pruning");
  }

  async #read() {
    log.info("Reading manifest");
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug(`Reading manifest at ${path}`);
    const data = await Deno.readTextFile(path);
    this.#manifest = JSON.parse(data);
    log.info(`Finished reading manifest`);
  }

  async #update() {
    log.info("Updating manifest");
    const timestamp = new Date(Date.now());
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug(`Updating manifest at ${path}`);

    const previous = this.#manifest.latest;
    log.debug(
      `Storing previous value of latest ${JSON.stringify(previous)}`,
    );

    const latest = {
      created: timestamp,
      digest: this.#digest,
    };
    log.debug(`Created new value of latest ${JSON.stringify(latest)}`);

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    log.debug(
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
    log.debug(
      `Created new manifest contents ${JSON.stringify(this.#manifest)}`,
    );

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    log.info("Finished updating manifest");
  }

  async #write() {
    log.info("Writing artifact");
    const path = resolve(this.#config.artifacts, `${this.#digest}.txt`);
    log.debug(`Writing artifiact at ${path}`);
    await Deno.writeTextFile(path, this.#data);
    log.info("Finished writing artifact");
  }
}
