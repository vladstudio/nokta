---
url: https://mediabunny.dev/api/Source
title: Source | Mediabunny
---

# Source | Mediabunny

# Source

The source base class, representing a resource from which bytes can be read.

## Subclasses

- BlobSource
- BufferSource
- FilePathSource
- StreamSource
- ReadableStreamSource
- UrlSource

## Used by

- Input
- InputOptions

## Events

### onread

Called each time data is retrieved from the source. Will be called with the retrieved range (end exclusive).

## Methods

### getSizeOrNull()

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Returns null if the source is unsized.

### getSize()

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Throws an error if the source is unsized.