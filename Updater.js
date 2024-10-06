import "@std/dotenv/load";

import * as log from "./Log.js";

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

  constructor() {
    log.debug("Updating");
  }

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
      log.info("Finished");
    } catch (error) {
      log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  async #fetch(source = this.#source) {
    log.info("Fetch");
    log.debug("Source", {
      source,
    });
    const response = await fetch(source);

    if (response.ok) {
      this.#data = await response.text();
      log.info("Finished");
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

      log.error("Failed", {
        reason: JSON.stringify(json) || text || response.statusText,
      });

      throw new TypeError(JSON.stringify(json) || text || response.statusText);
    }
  }

  async #hash() {
    log.info("Calulating digest");
    const encoder = new TextEncoder().encode(this.#data);
    const buffer = await crypto.subtle.digest("SHA-256", encoder);
    this.#digest = encodeHex(buffer);
    log.debug("Digest", {
      digest: this.#digest,
    });
    log.info("Finished", {
      digest: this.#digest,
    });
  }

  async #prune() {
    log.info("Pruning manifest");
    const timestamp = new Calendar(new Date(Date.now()));

    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug("Pruning manifest", {
      path,
    });
    const end = timestamp.subtract({
      days: typeof this.#config.lifetime === "number"
        ? this.#config.lifetime
        : parseInt(this.#config.lifetime),
    });
    log.info("Date for obsolete files", {
      end,
    });

    const latest = this.#manifest.latest;
    log.debug("Storing latest value", {
      value: latest,
    });

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    log.debug("Storing list of existing entries", {
      entries: existing,
    });

    const { keep, remove } = Object.entries(existing).reduce(
      ({ keep, remove }, [key, value]) =>
        new Calendar(new Date(value.obsoleted)).is({ before: end })
          ? { keep, remove: { [key]: value, ...remove } }
          : { keep: { [key]: value, ...keep }, remove },
      { keep: [], remove: [] },
    );

    log.debug("List of entries to keep", {
      entries: keep,
    });
    log.debug("List of entries to remove", {
      entries: remove,
    });

    this.#manifest = {
      latest,
      ...keep,
    };
    log.debug("Created new manifest contents", {
      contents: this.#manifest,
    });

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    log.info("Finished updating manifest");

    for (const file in remove) {
      try {
        await Deno.remove(resolve(this.#config.artifacts, `${file}.txt`));
      } catch {
        log.warn("Failed to remove file", {
          file,
        });
      }
    }
    log.info("Finished");
  }

  async #read() {
    log.info("Reading manifest");
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug("Path", {
      path,
    });
    const data = await Deno.readTextFile(path);
    this.#manifest = JSON.parse(data);
    log.info("Finished");
  }

  async #update() {
    log.info("Updating manifest");
    const timestamp = new Date(Date.now());
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    log.debug("Path", {
      path,
    });

    const previous = this.#manifest.latest;
    log.debug("Storing previous value", {
      value: previous,
    });

    const latest = {
      created: timestamp,
      digest: this.#digest,
    };
    log.debug("Created new value", {
      value: latest,
    });

    const existing = Object.entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce(
        (previousValue, [key, value]) => ({
          [key]: value,
          ...previousValue,
        }),
        {},
      );
    log.debug("Storing list of existing entries", {
      entries: existing,
    });

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
    log.debug("Created new manifest contents", {
      contents: this.#manifest,
    });

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    log.info("Finished");
  }

  async #write() {
    log.info("Writing artifact");
    const path = resolve(this.#config.artifacts, `${this.#digest}.txt`);
    log.debug("Path", {
      path,
    });
    await Deno.writeTextFile(path, this.#data);
    log.info("Finished");
  }
}
