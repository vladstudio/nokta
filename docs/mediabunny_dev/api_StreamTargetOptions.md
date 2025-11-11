---
url: https://mediabunny.dev/api/StreamTargetOptions
title: StreamTargetOptions | Mediabunny
---

# StreamTargetOptions | Mediabunny

# StreamTargetOptions

Options for `StreamTarget`.

```
type StreamTargetOptions = {
	chunked?: boolean;
	chunkSize?: number;
};
```

## Used by

- `FilePathTargetOptions`
- `new StreamTarget()`

## Properties

### `chunked`

When setting this to true, data created by the output will first be accumulated and only written out once it has reached sufficient size, using a default chunk size of 16 MiB. This is useful for reducing the total amount of writes, at the cost of latency.

### `chunkSize`

When using `chunked: true`, this specifies the maximum size of each chunk. Defaults to 16 MiB.