---
url: https://mediabunny.dev/api/BufferSource
title: BufferSource | Mediabunny
---

# BufferSource | Mediabunny

# BufferSource

A source backed by an ArrayBuffer or ArrayBufferView, with the entire file held in memory.

**Extends:** Source

## Constructor

Creates a new `BufferSource` backed the specified `ArrayBuffer` or `ArrayBufferView`.

## Events

### `onread`

Called each time data is retrieved from the source. Will be called with the retrieved range (end exclusive).

## Methods

### `getSizeOrNull()`

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Returns null if the source is unsized.

### `getSize()`

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Throws an error if the source is unsized.