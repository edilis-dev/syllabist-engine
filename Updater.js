/**
 * @fileoverview Provides the {@link Updater} class, which fetches a remote
 * word list, detects changes via SHA-256 digest comparison, and manages a
 * versioned local artifact store and manifest.
 */

import "@std/dotenv/load";
import { encodeHex } from "@std/encoding/hex";
import { resolve } from "@std/path";

import { Calendar } from "./Calendar.js";
import { CreateLogger } from "./Log.js";

/**
 * @typedef {{ created: Date, digest: string }} ManifestLatestEntry
 * @typedef {{ created: Date, obsoleted: Date }} ManifestArchivedEntry
 */

/**
 * Fetches a remote word-list file, compares its SHA-256 digest against the
 * locally stored manifest, and — when the source has changed — writes a new
 * artifact and updates the manifest accordingly. Old artifact entries whose
 * `obsoleted` date exceeds the configured `lifetime` are pruned on every run.
 *
 * ### Lifecycle
 * Each call to {@link Updater#update} executes the following steps:
 * 1. **Fetch** — retrieve the word-list text from the remote source.
 * 2. **Hash** — compute a SHA-256 digest of the fetched text.
 * 3. **Read** — load the local manifest JSON from the artifacts directory.
 * 4. **Compare** — if the digest matches the current-version entry's digest (under
 *    the key configured by `latest`), stop early.
 * 5. **Write** — save the new text as `<digest>.txt` in the artifacts directory.
 * 6. **Update** — write the new entry to the manifest and archive the previous one.
 * 7. **Prune** — remove manifest entries and files older than `lifetime` days.
 *
 * ### Manifest format
 * The manifest is a JSON object whose current-version entry is stored under the
 * key configured by the `latest` environment variable (default `"latest"`).
 * Every previous version is stored under its digest as a key:
 * ```json
 * {
 *   "<latest>": { "created": "<iso>", "digest": "<sha256hex>" },
 *   "<sha256hex>": { "created": "<iso>", "obsoleted": "<iso>" }
 * }
 * ```
 *
 * ### Configuration
 * All options are read from environment variables on each {@link Updater#update}
 * call. A `.env` file is loaded automatically via `@std/dotenv/load`.
 *
 * | Variable    | Default           | Meaning |
 * |-------------|-------------------|---------|
 * | `artifacts` | `"artifacts"`     | Directory that holds artifact files and the manifest |
 * | `latest`    | `"latest"`        | Key name used for the current-version entry in the manifest |
 * | `lifetime`  | `90`              | Days after which an obsoleted artifact is pruned |
 * | `manifest`  | `"manifest.json"` | Filename of the manifest JSON within the artifacts directory |
 *
 * @example
 * await new Updater().update();
 * // → fetches the default source, compares digest, updates manifest if changed
 *
 * @example <caption>Custom source URL</caption>
 * await new Updater().update("https://example.com/words.txt");
 * // → same but fetches from the provided URL
 */
export class Updater {
  /**
   * Runtime configuration populated at the start of each {@link Updater#update}
   * call. All fields are `null` until `update()` is invoked for the first time.
   *
   * @type {{ artifacts: string | null, latest: string | null, lifetime: number | null, manifest: string | null }}
   */
  #config = {
    artifacts: null,
    latest: null,
    lifetime: null,
    manifest: null,
  };

  /** @type {string | undefined} */
  #data;

  /** @type {string | undefined} */
  #digest;

  /** @type {Record<string, ManifestLatestEntry | ManifestArchivedEntry> | undefined} */
  #manifest;

  /** @type {import("@std/log").Logger} */
  #log;

  /**
   * Default remote source URL, used by {@link Updater.#fetch} when no explicit
   * source is passed to {@link Updater#update}.
   *
   * @type {string}
   */
  #source = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

  /**
   * Creates a new {@link Updater} instance.
   *
   * Configuration is not read at construction time — it is loaded from
   * environment variables on each call to {@link Updater#update}.
   */
  constructor() {
    this.#log = CreateLogger({ name: "Updater" });

    this.#log.info("Constructing");
  }

  /**
   * Runs a full update cycle against the given source URL.
   *
   * Fetches the remote word list, hashes it, reads the local manifest, and — if
   * the digest has changed — writes a new artifact and updates the manifest.
   * Pruning of expired entries is always performed at the end, regardless of
   * whether the source changed.
   *
   * @param {string} [source=this.#source] - URL to fetch the word list from.
   *   Defaults to the built-in `#source` URL when omitted.
   * @returns {Promise<void>}
   * @throws {TypeError} If the remote fetch fails.
   */
  async update(source = this.#source) {
    this.#log.info("Updating");

    try {
      this.#config = {
        artifacts: Deno.env.get("artifacts") ?? "artifacts",
        latest: Deno.env.get("latest") ?? "latest",
        lifetime: Number(Deno.env.get("lifetime") ?? 90),
        manifest: Deno.env.get("manifest") ?? "manifest.json",
      };

      await this.#fetch(source);
      await this.#hash();
      await this.#read();

      if (this.#digest === this.#manifest?.[this.#config.latest]?.digest) {
        this.#log.info("Source is unchanged");
      } else {
        this.#log.info("Source changed");

        await this.#write();
        await this.#update();
      }

      await this.#prune();
      this.#log.info("Finished");
    } catch (error) {
      this.#log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  /**
   * Fetches the word-list text from `source` and stores it in `#data`.
   *
   * On a non-OK response the method attempts to parse the body as JSON first,
   * falling back to plain text, and throws a `TypeError` with that body (or the
   * HTTP status text) as the message.
   *
   * @param {string} source - The URL to fetch.
   * @returns {Promise<void>}
   * @throws {TypeError} If the HTTP response status is not OK.
   */
  async #fetch(source) {
    this.#log.info("Fetch");
    this.#log.debug("Source", {
      source,
    });
    const response = await fetch(source);

    if (response.ok) {
      this.#data = await response.text();
      this.#log.info("Finished");
    } else {
      const json = await response
        .clone()
        .json()
        .catch(() => undefined);

      const text = await response
        .clone()
        .text()
        .catch(() => undefined);

      this.#log.error("Failed", {
        reason: JSON.stringify(json) || text || response.statusText,
      });

      throw new TypeError(JSON.stringify(json) || text || response.statusText);
    }
  }

  /**
   * Computes a SHA-256 digest of `#data` and stores the hex-encoded result in
   * `#digest`.
   *
   * @returns {Promise<void>}
   */
  async #hash() {
    this.#log.info("Calculating digest");
    const encoder = new TextEncoder().encode(this.#data);
    const buffer = await crypto.subtle.digest("SHA-256", encoder);
    this.#digest = encodeHex(buffer);
    this.#log.debug("Digest", {
      digest: this.#digest,
    });
    this.#log.info("Finished", {
      digest: this.#digest,
    });
  }

  /**
   * Reads the manifest JSON from the artifacts directory and stores the parsed
   * object in `#manifest`.
   *
   * @returns {Promise<void>}
   * @throws {Error} If the file cannot be read or the contents are not valid JSON.
   */
  async #read() {
    this.#log.info("Reading manifest");
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    this.#log.debug("Path", {
      path,
    });
    const data = await Deno.readTextFile(path);
    this.#manifest = JSON.parse(data);
    this.#log.info("Finished");
  }

  /**
   * Writes the fetched word-list text to a new artifact file named
   * `<digest>.txt` inside the artifacts directory.
   *
   * @returns {Promise<void>}
   */
  async #write() {
    this.#log.info("Writing artifact");
    const path = resolve(this.#config.artifacts, `${this.#digest}.txt`);
    this.#log.debug("Path", {
      path,
    });
    await Deno.writeTextFile(path, this.#data);
    this.#log.info("Finished");
  }

  /**
   * Adds the new digest to the manifest under the `latest` configuration key,
   * archives the previous current-version entry under its digest key with an
   * `obsoleted` timestamp, and persists the updated manifest to disk.
   *
   * If there is no previous current-version entry (first run), the manifest is
   * initialised with only the new entry.
   *
   * @returns {Promise<void>}
   */
  async #update() {
    this.#log.info("Updating manifest");
    const timestamp = new Date(Date.now());
    const path = resolve(this.#config.artifacts, this.#config.manifest);
    this.#log.debug("Path", {
      path,
    });

    const previous = this.#manifest[this.#config.latest];
    this.#log.debug("Storing previous value", {
      value: previous,
    });

    const latest = {
      created: timestamp,
      digest: this.#digest,
    };
    this.#log.debug("Created new value", {
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
    this.#log.debug("Storing list of existing entries", {
      entries: existing,
    });

    this.#manifest = previous?.digest
      ? {
          [this.#config.latest]: latest,
          [previous.digest]: {
            created: previous.created,
            obsoleted: timestamp,
          },
          ...existing,
        }
      : { [this.#config.latest]: latest };
    this.#log.debug("Created new manifest contents", {
      contents: this.#manifest,
    });

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    this.#log.info("Finished");
  }

  /**
   * Removes manifest entries and their corresponding artifact files whose
   * `obsoleted` date is earlier than `lifetime` days ago.
   *
   * The current-version entry (stored under the `latest` configuration key) is
   * always preserved. Archived entries whose `obsoleted` date is within the
   * retention window are kept. Entries that have no `obsoleted` field are also
   * kept rather than throwing. For each entry that falls outside the window,
   * the corresponding `<digest>.txt` file is deleted; a warning is logged if
   * the file cannot be removed (e.g. it was already deleted).
   *
   * @returns {Promise<void>}
   */
  async #prune() {
    this.#log.info("Pruning manifest");
    const timestamp = new Calendar(new Date(Date.now()));

    const path = resolve(this.#config.artifacts, this.#config.manifest);
    this.#log.debug("Pruning manifest", {
      path,
    });

    const end = timestamp.subtract({ days: this.#config.lifetime });
    this.#log.info("Date for obsolete files", {
      end,
    });

    const latest = this.#manifest[this.#config.latest];
    this.#log.debug("Storing latest value", {
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
    this.#log.debug("Storing list of existing entries", {
      entries: existing,
    });

    const { keep, remove } = Object.entries(existing).reduce(
      ({ keep, remove }, [key, value]) =>
        value.obsoleted && new Calendar(new Date(value.obsoleted)).is({ before: end })
          ? { keep, remove: { [key]: value, ...remove } }
          : { keep: { [key]: value, ...keep }, remove },
      { keep: {}, remove: {} },
    );

    this.#log.debug("List of entries to keep", {
      entries: keep,
    });
    this.#log.debug("List of entries to remove", {
      entries: remove,
    });

    this.#manifest = {
      [this.#config.latest]: latest,
      ...keep,
    };
    this.#log.debug("Created new manifest contents", {
      contents: this.#manifest,
    });

    await Deno.writeTextFile(path, JSON.stringify(this.#manifest));
    this.#log.info("Finished updating manifest");

    for (const file of Object.keys(remove)) {
      try {
        await Deno.remove(resolve(this.#config.artifacts, `${file}.txt`));
      } catch {
        this.#log.warn("Failed to remove file", {
          file,
        });
      }
    }
    this.#log.info("Finished");
  }
}
