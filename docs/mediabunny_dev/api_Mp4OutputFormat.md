---
url: https://mediabunny.dev/api/Mp4OutputFormat
title: Mp4OutputFormat | Mediabunny
---

# Mp4OutputFormat | Mediabunny

# Mp4OutputFormat

MPEG-4 Part 14 (MP4) file format. Supports most codecs.

**Extends:** `IsobmffOutputFormat`


## Constructor

ts
```
constructor(
	options?: IsobmffOutputFormatOptions,
): Mp4OutputFormat;
```

Creates a new `Mp4OutputFormat` configured with the specified `options`.

See `IsobmffOutputFormatOptions`.


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

See `MediaCodec`.


### `getSupportedTrackCounts()`

ts
```
getSupportedTrackCounts(): TrackCountLimits;
```

Returns the number of tracks that this output format supports.

See `TrackCountLimits`.