---
url: https://mediabunny.dev/api/AdtsOutputFormat
title: AdtsOutputFormat | Mediabunny
---

# AdtsOutputFormat | Mediabunny

# AdtsOutputFormat

ADTS file format.

**Extends:** [`OutputFormat`](./OutputFormat)

## Constructor

ts
```
constructor(
	options: AdtsOutputFormatOptions = {},
): AdtsOutputFormat;
```

Creates a new `AdtsOutputFormat` configured with the specified `options`.

See [`AdtsOutputFormatOptions`](./AdtsOutputFormatOptions).

## Properties

### `fileExtension`

ts
```
get fileExtension(): string;
```

The file extension used by this output format, beginning with a dot.

### `mimeType`

ts
```
get mimeType(): string;
```

The base MIME type of the output format.

### `supportsVideoRotationMetadata`

ts
```
get supportsVideoRotationMetadata(): boolean;
```

Whether this output format supports video rotation metadata.

## Methods

### `getSupportedTrackCounts()`

ts
```
getSupportedTrackCounts(): TrackCountLimits;
```

Returns the number of tracks that this output format supports.

See [`TrackCountLimits`](./TrackCountLimits).

### `getSupportedCodecs()`

ts
```
getSupportedCodecs(): MediaCodec[];
```

Returns a list of media codecs that this output format can contain.

See [`MediaCodec`](./MediaCodec).

### `getSupportedVideoCodecs()`

ts
```
getSupportedVideoCodecs(): "avc" | "hevc" | "vp9" | "av1" | "vp8"[];
```

Returns a list of video codecs that this output format can contain.

### `getSupportedAudioCodecs()`

ts
```
getSupportedAudioCodecs(): "aac" | "opus" | "mp3" | "vorbis" | "flac" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | "pcm-u8" | "pcm-s8" | "ulaw" | "alaw"[];
```

Returns a list of audio codecs that this output format can contain.

### `getSupportedSubtitleCodecs()`

ts
```
getSupportedSubtitleCodecs(): "webvtt"[];
```

Returns a list of subtitle codecs that this output format can contain.