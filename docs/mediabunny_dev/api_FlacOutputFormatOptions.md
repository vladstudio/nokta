---
url: https://mediabunny.dev/api/FlacOutputFormatOptions
title: FlacOutputFormatOptions | Mediabunny
---

# FlacOutputFormatOptions | Mediabunny

# FlacOutputFormatOptions

FLAC-specific output options.

```
type FlacOutputFormatOptions = {
	onFrame?: (data: Uint8Array, position: number) => unknown;
};
```

## Used by

- `new FlacOutputFormat()`

## Events

### `onFrame`

```
onFrame?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called for each FLAC frame that is written.