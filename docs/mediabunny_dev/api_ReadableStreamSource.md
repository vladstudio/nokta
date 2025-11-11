---
url: https://mediabunny.dev/api/ReadableStreamSource
title: ReadableStreamSource | Mediabunny
---

# ReadableStreamSource | Mediabunny

# ReadableStreamSource

A source backed by a [`ReadableStream`](#) of `Uint8Array`, representing an append-only byte stream of unknown length. This is the source to use for incrementally streaming in input files that are still being constructed and whose size we don't yet know, like for example the output chunks of [MediaRecorder](#).

This source is *unsized*, meaning calls to `.getSize()` will throw and readers are more limited due to the lack of random file access. You should only use this source with sequential access patterns, such as reading all packets from start to end. This source does not work well with random access patterns unless you increase its max cache size.

**Extends:** [`Source`](#)

## Constructor

```
constructor(
	stream: ReadableStream<Uint8Array>,
	options: ReadableStreamSourceOptions = {},
): ReadableStreamSource;
```

Creates a new `ReadableStreamSource` backed by the specified `ReadableStream<Uint8Array>`.

See [`ReadableStreamSourceOptions`](#).

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