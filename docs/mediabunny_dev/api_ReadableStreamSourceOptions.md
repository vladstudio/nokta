---
url: https://mediabunny.dev/api/ReadableStreamSourceOptions
title: ReadableStreamSourceOptions | Mediabunny
---

# ReadableStreamSourceOptions | Mediabunny

# ReadableStreamSourceOptions

Options for `ReadableStreamSource`.

```
type ReadableStreamSourceOptions = {
	maxCacheSize?: number;
};
```

## Used by

-   `new ReadableStreamSource()`

## Properties

### `maxCacheSize`

```
maxCacheSize?: number;
```

The maximum number of bytes the cache is allowed to hold in memory. Defaults to 16 MiB.