---
url: https://mediabunny.dev/api/OggOutputFormat
title: OggOutputFormat | Mediabunny
---

# OggOutputFormat | Mediabunny

# OggOutputFormat

Ogg file format.

**Extends:** [`OutputFormat`](./OutputFormat)

## Constructor

Creates a new `OggOutputFormat` configured with the specified `options`.

See [`OggOutputFormatOptions`](./OggOutputFormatOptions).

## Properties

### `fileExtension`

The file extension used by this output format, beginning with a dot.

### `mimeType`

The base MIME type of the output format.

### `supportsVideoRotationMetadata`

Whether this output format supports video rotation metadata.

## Methods

### `getSupportedTrackCounts()`

Returns the number of tracks that this output format supports.

See [`TrackCountLimits`](./TrackCountLimits).

### `getSupportedCodecs()`

Returns a list of media codecs that this output format can contain.

See [`MediaCodec`](./MediaCodec).

### `getSupportedVideoCodecs()`

Returns a list of video codecs that this output format can contain.

### `getSupportedAudioCodecs()`

Returns a list of audio codecs that this output format can contain.

### `getSupportedSubtitleCodecs()`

Returns a list of subtitle codecs that this output format can contain.