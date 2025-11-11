---
url: https://mediabunny.dev/api/Mp3OutputFormatOptions
title: Mp3OutputFormatOptions | Mediabunny
---

# Mp3OutputFormatOptions | Mediabunny

# Mp3OutputFormatOptions

MP3-specific output options.

```
type Mp3OutputFormatOptions = {
	xingHeader?: boolean;
	onXingFrame?: (data: Uint8Array, position: number) => unknown;
};
```

## Used by

-   [`new Mp3OutputFormat()`](./Mp3OutputFormat#constructor)

## Properties

### `xingHeader`

```
xingHeader?: boolean;
```

Controls whether the Xing header, which contains additional metadata as well as an index, is written to the start of the MP3 file. When disabled, the writing process becomes append-only. Defaults to `true`.

## Events

### `onXingFrame`

```
onXingFrame?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called once the Xing metadata frame is finalized.