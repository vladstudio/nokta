---
url: https://mediabunny.dev/api/StreamSourceOptions
title: StreamSourceOptions | Mediabunny
---

# StreamSourceOptions | Mediabunny

# StreamSourceOptions

Options for defining a [`StreamSource`](./StreamSource).

```ts
type StreamSourceOptions = {
	getSize: () => MaybePromise<number>;
	read: (start: number, end: number) => MaybePromise<Uint8Array | ReadableStream<Uint8Array>>;
	dispose?: () => unknown;
	maxCacheSize?: number;
	prefetchProfile?: 'none' | 'fileSystem' | 'network';
};
```

See [`MaybePromise`](./MaybePromise).

## Used by

-   [`new StreamSource()`](./StreamSource#constructor)

## Properties

### `getSize`

```ts
getSize: () => MaybePromise<number>;
```

Called when the size of the entire file is requested. Must return or resolve to the size in bytes. This function is guaranteed to be called before `read`.

See [`MaybePromise`](./MaybePromise).

### `read`

```ts
read: (start: number, end: number) => MaybePromise<Uint8Array<ArrayBufferLike> | ReadableStream<Uint8Array<ArrayBufferLike>>>;
```

Called when data is requested. Must return or resolve to the bytes from the specified byte range, or a stream that yields these bytes.

See [`MaybePromise`](./MaybePromise).

### `dispose`

```ts
dispose?: (() => unknown);
```

Called when the [`Input`](./Input) driven by this source is disposed.

### `maxCacheSize`

```ts
maxCacheSize?: number;
```

The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB.

### `prefetchProfile`

```ts
prefetchProfile?: 'none' | 'fileSystem' | 'network';
```

Specifies the prefetch profile that the reader should use with this source. A prefetch profile specifies the pattern with which bytes outside of the requested range are preloaded to reduce latency for future reads.

-   `'none'` (default): No prefetching; only the data needed in the moment is requested.
-   `'fileSystem'`: File system-optimized prefetching: a small amount of data is prefetched bidirectionally, aligned with page boundaries.
-   `'network'`: Network-optimized prefetching, or more generally, prefetching optimized for any high-latency environment: tries to minimize the amount of read calls and aggressively prefetches data when sequential access patterns are detected.