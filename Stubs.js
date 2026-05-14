/**
 * @fileoverview Internal test helpers that stub and spy on global and Deno
 * platform functions. Not part of the public API — intended solely for use
 * in unit tests to control I/O behaviour without touching real resources.
 */

import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { spy, stub } from "@std/testing/mock";

/**
 * Stubs or spies on {@link globalThis.fetch}.
 *
 * Three modes are supported depending on which option is supplied:
 *
 * - **`success`** — replaces `fetch` with a stub that resolves to a `200 OK`
 *   response. Provide `success.json` for a JSON body, or `success.text` for a
 *   plain-text body; if `.text` is also omitted the body defaults to
 *   `"success"`. Override the default status with `success.status` and
 *   `success.statusText`. Pass `true` as shorthand to resolve with a
 *   plain-text `"success"` body.
 * - **`failure`** — replaces `fetch` with a stub that resolves to a
 *   `400 Bad Request` response. Accepts the same body and status options as
 *   `success`; if `.text` is also omitted the body defaults to `"failure"`.
 *   Pass `true` as shorthand to resolve with a plain-text `"failure"` body.
 * - **neither** — wraps `fetch` in a `Spy` so calls can be observed without
 *   changing behaviour.
 *
 * @param {object} [options={}] - The stub options.
 * @param {object | boolean} [options.success] - If provided, `fetch` resolves
 *   with a successful response. Supply `.json` for a JSON body, or `.text`
 *   for a plain-text body that defaults to `"success"` when omitted.
 *   Optionally supply `.status` and `.statusText` to override the `200 OK`
 *   defaults. Pass `true` to resolve with a plain-text `"success"` body and
 *   the default status.
 * @param {object | boolean} [options.failure] - If provided, `fetch` resolves
 *   with an error response. Accepts the same shape as `options.success`, with
 *   a plain-text body defaulting to `"failure"` and a default status of
 *   `400 Bad Request`. Pass `true` to resolve with a plain-text `"failure"`
 *   body and the default status.
 * @returns {import("@std/testing/mock").Stub | import("@std/testing/mock").Spy} A `Stub` that replaces `globalThis.fetch`, or a
 *   `Spy` that wraps it when neither option is supplied.
 *
 * @example
 * fetch({ success: { json: { ok: true } } });
 * // → Stub resolving to a 200 JSON response
 *
 * @example <caption>Boolean shorthand — resolves with the hardcoded default</caption>
 * fetch({ success: true });
 * // → Stub resolving to a 200 plain-text response with body "success"
 *
 * @example <caption>Spy passthrough — no behaviour change</caption>
 * fetch();
 * // → Spy wrapping globalThis.fetch
 */
export function fetch({ failure, success } = {}) {
  if (success) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        success.json
          ? Response.json(success.json, {
              status: success.status ?? STATUS_CODE.OK,
              statusText: success.statusText ?? STATUS_TEXT[STATUS_CODE.OK],
            })
          : new Response(success.text ?? "success", {
              status: success.status ?? STATUS_CODE.OK,
              statusText: success.statusText ?? STATUS_TEXT[STATUS_CODE.OK],
            }),
      ),
    );
  } else if (failure) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        failure.json
          ? Response.json(failure.json, {
              status: failure.status ?? STATUS_CODE.BadRequest,
              statusText: failure.statusText ?? STATUS_TEXT[STATUS_CODE.BadRequest],
            })
          : new Response(failure.text ?? "failure", {
              status: failure.status ?? STATUS_CODE.BadRequest,
              statusText: failure.statusText ?? STATUS_TEXT[STATUS_CODE.BadRequest],
            }),
      ),
    );
  } else {
    return spy(globalThis, "fetch");
  }
}

/**
 * Stubs or spies on {@link Deno.readTextFile}.
 *
 * - **`success`** — resolves with `success.contents`, defaulting to
 *   `"success"`. Pass `true` as shorthand to resolve with the default
 *   value without specifying `contents`.
 * - **`failure`** — rejects with an `Error` whose message is
 *   `failure.contents`, defaulting to `"failure"`. Pass `true` as
 *   shorthand to reject with the default message.
 * - **neither** — wraps `readTextFile` in a `Spy`.
 *
 * @param {object} [options={}] - The stub options.
 * @param {object | boolean} [options.success] - If provided, `readTextFile`
 *   resolves. Set `success.contents` to control the resolved string value,
 *   or pass `true` to resolve with the hardcoded default `"success"`.
 * @param {object | boolean} [options.failure] - If provided, `readTextFile`
 *   rejects. Set `failure.contents` to control the error message, or pass
 *   `true` to reject with `Error("failure")`.
 * @returns {import("@std/testing/mock").Stub | import("@std/testing/mock").Spy} A `Stub` that replaces `Deno.readTextFile`, or a
 *   `Spy` that wraps it when neither option is supplied.
 *
 * @example
 * readTextFile({ success: { contents: "file data" } });
 * // → Stub resolving to "file data"
 *
 * @example <caption>Boolean shorthand — resolves with the hardcoded default</caption>
 * readTextFile({ success: true });
 * // → Stub resolving to "success"
 */
export function readTextFile({ failure, success } = {}) {
  if (success) {
    return stub(Deno, "readTextFile", () => Promise.resolve(success.contents ?? "success"));
  } else if (failure) {
    return stub(Deno, "readTextFile", () => Promise.reject(new Error(failure.contents ?? "failure")));
  } else {
    return spy(Deno, "readTextFile");
  }
}

/**
 * Stubs or spies on {@link Deno.remove}.
 *
 * - **`success`** — resolves with `success.contents`, defaulting to
 *   `"success"`. Pass `true` as shorthand to resolve with the default
 *   value without specifying `contents`.
 * - **`failure`** — rejects with an `Error` whose message is
 *   `failure.contents`, defaulting to `"failure"`. Pass `true` as
 *   shorthand to reject with the default message.
 * - **neither** — wraps `remove` in a `Spy`.
 *
 * @param {object} [options={}] - The stub options.
 * @param {object | boolean} [options.success] - If provided, `remove`
 *   resolves. Set `success.contents` to control the resolved value, or
 *   pass `true` to resolve with the hardcoded default `"success"`.
 * @param {object | boolean} [options.failure] - If provided, `remove`
 *   rejects. Set `failure.contents` to control the error message, or pass
 *   `true` to reject with `Error("failure")`.
 * @returns {import("@std/testing/mock").Stub | import("@std/testing/mock").Spy} A `Stub` that replaces `Deno.remove`, or a `Spy`
 *   that wraps it when neither option is supplied.
 *
 * @example
 * remove({ failure: { contents: "permission denied" } });
 * // → Stub rejecting with Error("permission denied")
 *
 * @example <caption>Boolean shorthand — rejects with the hardcoded default</caption>
 * remove({ failure: true });
 * // → Stub rejecting with Error("failure")
 */
export function remove({ failure, success } = {}) {
  if (success) {
    return stub(Deno, "remove", () => Promise.resolve(success.contents ?? "success"));
  } else if (failure) {
    return stub(Deno, "remove", () => Promise.reject(new Error(failure.contents ?? "failure")));
  } else {
    return spy(Deno, "remove");
  }
}

/**
 * Stubs or spies on {@link Deno.writeTextFile}.
 *
 * - **`success`** — resolves with `success.contents`, defaulting to
 *   `"success"`. Pass `true` as shorthand to resolve with the default
 *   value without specifying `contents`.
 * - **`failure`** — rejects with an `Error` whose message is
 *   `failure.contents`, defaulting to `"failure"`. Pass `true` as
 *   shorthand to reject with the default message.
 * - **neither** — wraps `writeTextFile` in a `Spy`.
 *
 * @param {object} [options={}] - The stub options.
 * @param {object | boolean} [options.success] - If provided, `writeTextFile`
 *   resolves. Set `success.contents` to control the resolved value, or
 *   pass `true` to resolve with the hardcoded default `"success"`.
 * @param {object | boolean} [options.failure] - If provided, `writeTextFile`
 *   rejects. Set `failure.contents` to control the error message, or pass
 *   `true` to reject with `Error("failure")`.
 * @returns {import("@std/testing/mock").Stub | import("@std/testing/mock").Spy} A `Stub` that replaces `Deno.writeTextFile`, or a
 *   `Spy` that wraps it when neither option is supplied.
 *
 * @example <caption>Boolean shorthand — resolves with the hardcoded default</caption>
 * writeTextFile({ success: true });
 * // → Stub resolving to "success"
 *
 * @example
 * writeTextFile({ success: { contents: "file data" } });
 * // → Stub resolving to "file data"
 */
export function writeTextFile({ failure, success } = {}) {
  if (success) {
    return stub(Deno, "writeTextFile", () => Promise.resolve(success.contents ?? "success"));
  } else if (failure) {
    return stub(Deno, "writeTextFile", () => Promise.reject(new Error(failure.contents ?? "failure")));
  } else {
    return spy(Deno, "writeTextFile");
  }
}
