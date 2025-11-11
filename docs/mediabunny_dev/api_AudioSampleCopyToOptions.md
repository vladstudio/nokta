---
url: https://mediabunny.dev/api/AudioSampleCopyToOptions
title: AudioSampleCopyToOptions | Mediabunny
---

# AudioSampleCopyToOptions | Mediabunny

# AudioSampleCopyToOptions

Options used for copying audio sample data.

```ts
type AudioSampleCopyToOptions = {
	planeIndex: number;
	format?: AudioSampleFormat;
	frameOffset?: number;
	frameCount?: number;
};
```

## Used by

- AudioSample.allocationSize()
- AudioSample.copyTo()

## Properties

### `planeIndex`

```ts
planeIndex: number;
```

The index identifying the plane to copy from. This must be 0 if using a non-planar (interleaved) output format.

### `format`

```ts
format?: AudioSampleFormat;
```

The output format for the destination data. Defaults to the AudioSample's format. See sample formats

### `frameOffset`

```ts
frameOffset?: number;
```

An offset into the source plane data indicating which frame to begin copying from. Defaults to 0.

### `frameCount`

```ts
frameCount?: number;
```

The number of frames to copy. If not provided, the copy will include all frames in the plane beginning with frameOffset.