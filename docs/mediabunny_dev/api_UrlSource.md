---
url: https://mediabunny.dev/api/UrlSource
title: UrlSource | Mediabunny
---

# UrlSource | Mediabunny

# UrlSource

A source backed by a URL. This is useful for reading data from the network. Requests will be made using an optimized reading and prefetching pattern to minimize request count and latency.

**Extends:** `Source`

## Constructor

Creates a new `UrlSource` backed by the resource at the specified URL.

See `UrlSourceOptions`.

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