import { spy, stub } from "https://deno.land/std@0.204.0/testing/mock.ts";
import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.204.0/http/http_status.ts";

/**
 * @module Stubs
 * @see <code><a href="https://github.com/denoland/deno_std/blob/52a3b301399c75784b4b5d07ba1e3b92c04d5b9f/testing/mock.ts#L305">spy</a></code>
 * @see <code><a href="https://github.com/denoland/deno_std/blob/52a3b301399c75784b4b5d07ba1e3b92c04d5b9f/testing/mock.ts#L612">stub</a></code>
 */

/**
 * @property {JSON} [json] JSON response
 * @property {STATUS_TEXT} [statusText] [HTTP Status text]{@link https://deno.land/x/oak@v12.2.0/mod.ts?s=Status}
 * @property {Status} [status] [HTTP Status code]{@link https://deno.land/std@0.204.0/http/mod.ts?s=STATUS_TEXT}
 * @property {string} [text] text response
 * @type {Record}
 * @typedef MockResponse
 */

/**
 * Mock fetch implementation.
 *
 * @param {Record<"failure" | "success", boolean | MockResponse>} [mock={}]
 * @param {boolean | MockResponse} [mock.failure] Failure status or response
 * @param {boolean | MockResponse} [mock.success] Success status or response
 * @returns {spy | stub}
 * @see <code><a href="#~MockResponse">MockResponse</a></code>
 */
export function fetch({ success, failure } = {}) {
  if (success) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        success.json
          ? Response.json(success.json, {
            status: success.status ?? Status.OK,
            statusText: success.statusText ?? STATUS_TEXT[Status.OK],
          })
          : new Response(success.text, {
            status: success.status ?? Status.OK,
            statusText: success.statusText ?? STATUS_TEXT[Status.OK],
          }),
      ));
  } else if (failure) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        failure.json
          ? Response.json(failure.json, {
            status: failure.status ?? Status.BadRequest,
            statusText: failure.statusText ?? STATUS_TEXT[Status.BadRequest],
          })
          : new Response(failure.text, {
            status: failure.status ?? Status.BadRequest,
            statusText: failure.statusText ?? STATUS_TEXT[Status.BadRequest],
          }),
      ));
  } else {
    return spy(globalThis, "fetch");
  }
}

/**
 * Mock readTextFile implementation.
 *
 * @param {Record<"failure" | "success", boolean | Record<"contents", string>>} [mock={}]
 * @param {boolean | Record<"contents", string>} [mock.failure] Failure status or response
 * @param {boolean | Record<"contents", string>} [mock.success] Success status or response
 * @returns {spy | stub}
 */
export function readTextFile({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "readTextFile",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "readTextFile",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "readTextFile");
  }
}

/**
 * Mock remove implementation.
 *
 * @param {Record<"failure" | "success", boolean | Record<"contents", string>>} [mock={}]
 * @param {boolean | Record<"contents", string>} [mock.failure] Failure status or response
 * @param {boolean | Record<"contents", string>} [mock.success] Success status or response
 * @returns {spy | stub}
 */
export function remove({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "remove",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "remove",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "remove");
  }
}

/**
 * Mock writeTextFile implementation.
 *
 * @param {Record<"failure" | "success", boolean | Record<"contents", string>>} [mock={}]
 * @param {boolean | Record<"contents", string>} [mock.failure] Failure status or response
 * @param {boolean | Record<"contents", string>} [mock.success] Success status or response
 * @returns {spy | stub}
 */
export function writeTextFile({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "writeTextFile",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "writeTextFile",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "writeTextFile");
  }
}
