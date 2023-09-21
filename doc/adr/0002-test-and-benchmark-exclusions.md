# 2. test-and-benchmark-exclusions

Date: 2023-09-21

## Status

Accepted

## Context

The README.md states that all components, in both `Deno` and `browser`
environments should have benchmarks and unit tests. There are instances in which
exclusions are allowed, or indeed required. These need to be recorded so that
missing tests or benchmarks can be identified and if not recorded as exclusion
implementation as soon as possible.

## Decision

We will keep track of exclusions to either benchmarks or tests in the README.md.

## Consequences

By keeping tracking of the exclusions we will be able to identify invalid cases
of missing test and benchmark coverage.
