import "https://deno.land/std@0.205.0/dotenv/load.ts";
import { encodeHex } from "https://deno.land/std@0.205.0/encoding/hex.ts";
import { resolve } from "https://deno.land/std@0.205.0/path/mod.ts";

import { Calendar } from "./Calendar.js";

/**
 * The Updater <code>class</code> is responsible for retrieving a source file which contains a plain text word list.
 * Depending on whether the hashed contents of the file has changed since the last retrieval the Updater may save the
 * file and update the <code><a href="##manifest">#manifest</a></code> file which a new entry. At which point older entries
 * will be marked as obsolete. Regardless of whether the file has changed existing content will be audited. Any contents
 * which is older than the limit defined by the <code><a href="##config.lifetime">#lifetime</a></code> will be purged.
 */
export class Updater {
  /**
   * Configuration for the manifest and content file loactions and obsolete contents lifetime.
   *
   * @alias &num;config
   * @memberof Updater
   * @private
   * @property {string | null} artifacts
   * @property {string | null} latest
   * @property {number | null} lifetime
   * @property {string | null} manifest
   * @type {Record<string, string | null>}
   */
  #config = {
    artifacts: null,
    latest: null,
    lifetime: null,
    manifest: null,
  };

  /**
   * Contents of the text file.
   *
   * @alias &num;data
   * @memberof Updater
   * @private
   * @type {string}
   */
  #data;

  /**
   * Base64 encoded contents of the text file.
   *
   * @alias &num;digest
   * @memberof Updater
   * @private
   * @type {string}
   */
  #digest;

  /**
   * Stored content of the manifest file.
   *
   * @alias &num;manifest
   * @memberof Updater
   * @private
   * @type {Record<string, unknown>}
   */
  #manifest;

  /**
   * Absolute URL which represents the location of the text file.
   *
   * @alias &num;source
   * @default <code><a href="https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt">words_alpha.txt</a></code>
   * @memberof Updater
   * @private
   * @type {string}
   */
  #source =
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

  /**
   * @public
   */
  constructor() {}

  /**
   * Fetches the file from the source. Compares the contents and updates manifest, if necessary. Then purges obsolete content.
   *
   * @async
   * @param {string} source Absolute URL of text file to be retrieved
   * @public
   * @returns {Promise<void>}
   */
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

  /**
   * Fetches the file from the source.
   *
   * @alias &num;fetch
   * @async
   * @memberof Updater
   * @param {string} [source=this.#source] Absolute URL of text file to be retrieved
   * @private
   * @returns {Promise<void>}
   * @see <code><a href="##source">#source</a></code>
   * @throws {TypeError} If request fails or file contents cannot be processed.
   */
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

  /**
   * Hashes the contents of the retrieved file.
   *
   * @alias &num;hash
   * @async
   * @memberof Updater
   * @private
   * @returns {Promise<void>}
   * @see <code><a href="##data">#data</a></code>
   */
  async #hash() {
    console.info("Digesting file");
    const encoder = new TextEncoder().encode(this.#data);
    const buffer = await crypto.subtle.digest("SHA-256", encoder);
    this.#digest = encodeHex(buffer);
    console.trace(`Calculated digest ${this.#digest}`);
    console.info("Finished digesting file");
  }

  /**
   * Removes obsolete content files from the filesystem and the manifest file. The determination if a file is obsolete is configured by the configuration lifetime.
   *
   * @alias &num;prune
   * @async
   * @memberof Updater
   * @private
   * @returns {Promise<void>}
   * @see <code><a href="##manifest">#manifest</a></code>
   * @see <code><a href="##config">#config.lifetime</a></code>
   */
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

    const existing = Object
      .entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce((previousValue, [key, value]) => ({
        [key]: value,
        ...previousValue,
      }), {});
    console.trace(
      `Storing list of existing entries ${JSON.stringify(existing)}`,
    );

    const { keep, remove } = Object
      .entries(existing)
      .reduce(
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

  /**
   * Reads the contents of the manifest file from the file system.
   *
   * @alias &num;read
   * @async
   * @memberof Updater
   * @private
   * @returns {Promise<void>}
   * @see <code><a href="##manifest">#manifest</a></code>
   */
  async #read() {
    console.info("Reading manifest");
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    console.trace(`Reading manifest at ${path}`);
    const data = await Deno.readTextFile(path);
    this.#manifest = JSON.parse(data);
    console.info(`Finished reading manifest`);
  }

  /**
   * Updates the contents of the manifest file and writes the update file to the file system.
   *
   * @alias &num;update
   * @async
   * @memberof Updater
   * @private
   * @returns {Promise<void>}
   * @see <code><a href="##manifest">#manifest</a></code>
   */
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

    const existing = Object
      .entries(this.#manifest)
      .filter(([key]) => key !== this.#config.latest)
      .reduce((previousValue, [key, value]) => ({
        [key]: value,
        ...previousValue,
      }), {});
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

  /**
   * Writes the contents of the retrieved file to the file system.
   *
   * @alias &num;write
   * @async
   * @memberof Updater
   * @private
   * @returns {Promise<void>}
   */
  async #write() {
    console.info("Writing artifact");
    const path = resolve(this.#config.artifacts, `${this.#digest}.txt`);
    console.trace(`Writing artifiact at ${path}`);
    await Deno.writeTextFile(path, this.#data);
    console.info("Finished writing artifact");
  }
}
