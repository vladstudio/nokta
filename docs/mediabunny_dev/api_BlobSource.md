---
url: https://mediabunny.dev/api/BlobSource
title: BlobSource | Mediabunny
---

# BlobSource | Mediabunny

# BlobSource

A source backed by a Blob. Since a File is also a Blob, this is the source to use when reading files off the disk.

**Extends:** Source

## Constructor

```
constructor(
	blob: Blob,
	options: BlobSourceOptions = {},
): BlobSource;
```

Creates a new BlobSource backed by the specified Blob.

See BlobSourceOptions.

## Events

### `onread`

```
onread: ((start: number, end: number) => unknown) | null;
```

Called each time data is retrieved from the source. Will be called with the retrieved range (end exclusive).

## Methods

### `getSizeOrNull()`

```
getSizeOrNull(): Promise<number | null>;
```

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Returns null if the source is unsized.

### `getSize()`

```
getSize(): Promise<number>;
```

Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call will retrieve the size.

Throws an error if the source is unsized.