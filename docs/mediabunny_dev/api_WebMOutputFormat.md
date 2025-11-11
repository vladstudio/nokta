---
url: https://mediabunny.dev/api/WebMOutputFormat
title: WebMOutputFormat | Mediabunny
---

# WebMOutputFormat | Mediabunny

# WebMOutputFormat

WebM file format, based on Matroska.

Supports writing transparent video. For a video track to be marked as transparent, the first packet added must contain alpha side data.

**Extends:** [`MkvOutputFormat`](./MkvOutputFormat)

## Constructor

ts
```
constructor(
	options?: MkvOutputFormatOptions,
): WebMOutputFormat;
```

Creates a new `WebMOutputFormat` configured with the specified `options`.

See [`MkvOutputFormatOptions`](./MkvOutputFormatOptions).

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

### `getSupportedCodecs()`

ts
```
getSupportedCodecs(): MediaCodec[];
```

Returns a list of media codecs that this output format can contain.

See [`MediaCodec`](./MediaCodec).

### `getSupportedTrackCounts()`

ts
```
getSupportedTrackCounts(): TrackCountLimits;
```

Returns the number of tracks that this output format supports.

See [`TrackCountLimits`](./TrackCountLimits).