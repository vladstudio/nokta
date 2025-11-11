---
url: https://mediabunny.dev/api/StreamTargetChunk
title: StreamTargetChunk | Mediabunny
---

# StreamTargetChunk | Mediabunny

# StreamTargetChunk

A data chunk for `StreamTarget`.

```
type StreamTargetChunk = {
	type: 'write'; // This ensures automatic compatibility with FileSystemWritableFileStream
	data: Uint8Array;
	position: number;
};
```

## Used by

- `new StreamTarget()`

## Properties

### `type`

```
type: 'write';
```

The operation type.

### `data`

```
data: Uint8Array<ArrayBufferLike>;
```

The data to write.

### `position`

```
position: number;
```

The byte offset in the output file at which to write the data.