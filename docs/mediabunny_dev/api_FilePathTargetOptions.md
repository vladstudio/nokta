---
url: https://mediabunny.dev/api/FilePathTargetOptions
title: FilePathTargetOptions | Mediabunny
---

# FilePathTargetOptions | Mediabunny

# FilePathTargetOptions

Options for `FilePathTarget`.

```
type FilePathTargetOptions = StreamTargetOptions;
```

See `StreamTargetOptions`.

## Used by

- `new FilePathTarget()`

## Properties

### `chunked`

```
chunked?: boolean;
```

When setting this to true, data created by the output will first be accumulated and only written out once it has reached sufficient size, using a default chunk size of 16 MiB. This is useful for reducing the total amount of writes, at the cost of latency.

### `chunkSize`

```
chunkSize?: number;
```

When using `chunked: true`, this specifies the maximum size of each chunk. Defaults to 16 MiB.