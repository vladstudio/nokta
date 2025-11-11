---
url: https://mediabunny.dev/api/VideoEncodingAdditionalOptions
title: VideoEncodingAdditionalOptions | Mediabunny
---

# VideoEncodingAdditionalOptions | Mediabunny

# VideoEncodingAdditionalOptions

Additional options that control audio encoding.

ts
```
type VideoEncodingAdditionalOptions = {
	alpha?: 'discard' | 'keep';
	bitrateMode?: 'constant' | 'variable';
	latencyMode?: 'quality' | 'realtime';
	fullCodecString?: string;
	hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
	scalabilityMode?: string;
	contentHint?: string;
};
```

## Used by

- canEncodeVideo()
- VideoEncodingConfig

## Properties

### `alpha`

ts
```
alpha?: 'discard' | 'keep';
```

What to do with alpha data contained in the video samples.

- `'discard'` (default): Only the samples' color data is kept; the video is opaque.
- `'keep'`: The samples' alpha data is also encoded as side data. Make sure to pair this mode with a container format that supports transparency (such as WebM or Matroska).

### `bitrateMode`

ts
```
bitrateMode?: 'constant' | 'variable';
```

Configures the bitrate mode.

### `latencyMode`

ts
```
latencyMode?: 'quality' | 'realtime';
```

The latency mode used by the encoder; controls the performance-quality tradeoff.

### `fullCodecString`

ts
```
fullCodecString?: string;
```

The full codec string as specified in the WebCodecs Codec Registry. This string must match the codec specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.

### `hardwareAcceleration`

ts
```
hardwareAcceleration?: 'no-preference' | 'prefer-hardware' | 'prefer-software';
```

A hint that configures the hardware acceleration method of this codec. This is best left on `'no-preference'`.

### `scalabilityMode`

ts
```
scalabilityMode?: string;
```

An encoding scalability mode identifier as defined by WebRTC-SVC.

### `contentHint`

ts
```
contentHint?: string;
```

An encoding video content hint as defined by mst-content-hint.