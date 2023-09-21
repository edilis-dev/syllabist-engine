# syllabist-engine

Syllabist Engine will provider the underlying logic for the
[Syllab.ist](https://syllab.ist) word game.

## Features

In it's first iteration Syllabist Engine will have the following features:

- Utility:
  - Sourcing Plain Text word files.
  - Syllabifying Plain Text word files into a separated Plain Text.
  - Transforming the separated Plain Text files into JSON format.
  - Compressing the JSON into syllabist format.

- Gameplay:
  - Comparing a list of selected syllables with the JSON structure to determine
    validity.
  - Suggesting alternative paths from the _last_ selected syllable.

At time of first commit, the utility functions are complete.

## Environments

Syllabist Engine will be built to run on [`Deno`](https://deno.land/) components
whch will be shared with the `brower` environment such as the `Expander`
component, `Matcher` component and `Suggestion` component should _not_ use any
Deno internals as these will not be availble in the `browser` environment and
polyfilling will increase the package size.

## Tools

Code coverage is monitored via the
[`codecov`](https://app.codecov.io/gh/edilis-dev/syllabist-engine) service and
should not drop below 98%, if possible.

Tests and formatting will be checked in Github Actions on commit and when a Pull
Request is created. All commits to `main` will be made via a Pull Request,
committing directly will not be allowed.

## Committing

All new components or new functionality should be covered as thoroughly as
possible by unit tests.

Significant workflows such as: sourcing a Plain Text file, converting a Plain
Text file and matching a syllable list to a data structure should be covered as
thoroughly as possible by e2e tests.

All `Deno` components should have benchmarks.

## Status

[![Syllabist Engine](https://github.com/edilis-dev/syllabist-engine/actions/workflows/commit.yml/badge.svg)](https://github.com/edilis-dev/syllabist-engine/actions/workflows/commit.yml)

[![codecov](https://codecov.io/gh/edilis-dev/syllabist-engine/graph/badge.svg?token=X6DGUNFS7S)](https://codecov.io/gh/edilis-dev/syllabist-engine)
