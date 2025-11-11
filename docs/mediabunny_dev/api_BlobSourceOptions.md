---
url: https://mediabunny.dev/api/BlobSourceOptions
title: BlobSourceOptions | Mediabunny
---

# BlobSourceOptions | Mediabunny

# BlobSourceOptions

Options for `BlobSource`.

```
type BlobSourceOptions = {
	maxCacheSize?: number;
};
```

## Used by

- `new BlobSource()`
- `new FilePathSource()`

## Properties

### `maxCacheSize`

```
maxCacheSize?: number;
```

The maximum number of bytes the cache is allowed to hold in memory. Defaults to 8 MiB.