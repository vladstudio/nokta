---
url: https://mediabunny.dev/api/MovOutputFormat
title: MovOutputFormat | Mediabunny
---

# MovOutputFormat | Mediabunny

# MovOutputFormat

QuickTime File Format (QTFF), often called MOV. Supports all video and audio codecs, but not subtitle codecs.

**Extends:** [`IsobmffOutputFormat`](./IsobmffOutputFormat)

## Constructor

ts
```
constructor(
	options?: IsobmffOutputFormatOptions,
): MovOutputFormat;
```

Creates a new `MovOutputFormat` configured with the specified `options`.

See [`IsobmffOutputFormatOptions`](./IsobmffOutputFormatOptions).

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