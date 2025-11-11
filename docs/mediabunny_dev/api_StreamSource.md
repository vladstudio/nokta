---
url: https://mediabunny.dev/api/StreamSource
title: StreamSource | Mediabunny
---

# StreamSource | Mediabunny

# StreamSource

A general-purpose, callback-driven source that can get its data from anywhere.

**Extends:** Source

## Constructor

```
constructor(
	options: StreamSourceOptions,
): StreamSource;
```

Creates a new `StreamSource` whose behavior is specified by `options`.

See StreamSourceOptions.

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