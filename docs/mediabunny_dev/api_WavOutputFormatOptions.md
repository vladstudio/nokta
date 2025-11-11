---
url: https://mediabunny.dev/api/WavOutputFormatOptions
title: WavOutputFormatOptions | Mediabunny
---

# WavOutputFormatOptions | Mediabunny

# WavOutputFormatOptions

WAVE-specific output options.

```
type WavOutputFormatOptions = {
	large?: boolean;
	metadataFormat?: 'info' | 'id3';
	onHeader?: (data: Uint8Array, position: number) => unknown;
};
```

## Used by

- [`new WavOutputFormat()`](./WavOutputFormat#constructor)

## Properties

### `large`

When enabled, an RF64 file will be written, allowing for file sizes to exceed 4 GiB, which is otherwise not possible for regular WAVE files.

```
large?: boolean;
```

### `metadataFormat`

The metadata format to use for writing metadata tags.

- `'info'` (default): Writes metadata into a RIFF INFO LIST chunk, the default way to contain metadata tags within WAVE. Only allows for a limited subset of tags to be written.
- `'id3'`: Writes metadata into an ID3 chunk. Non-default, but used by many taggers in practice. Allows for a much larger and richer set of tags to be written.

```
metadataFormat?: 'info' | 'id3';
```

## Events

### `onHeader`

Will be called once the file header is written. The header consists of the RIFF header, the format chunk, metadata chunks, and the start of the data chunk (with a placeholder size of 0).

```
onHeader?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```