---
url: https://mediabunny.dev/api/FilePathSource
title: FilePathSource | Mediabunny
---

# FilePathSource | Mediabunny

# FilePathSource

A source backed by a path to a file. Intended for server-side usage in Node, Bun, or Deno.

Make sure to call `.dispose()` on the corresponding Input when done to explicitly free the internal file handle acquired by this source.

**Extends:** Source

## Constructor

Creates a new `FilePathSource` backed by the file at the specified file path.

See BlobSourceOptions.

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