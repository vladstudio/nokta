---
url: https://mediabunny.dev/api/WavOutputFormat
title: WavOutputFormat | Mediabunny
---

# WavOutputFormat | Mediabunny

# WavOutputFormat

WAVE file format, based on RIFF.

**Extends:** `OutputFormat`

## Constructor

Creates a new `WavOutputFormat` configured with the specified `options`.

See `WavOutputFormatOptions`.

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

See `TrackCountLimits`.

### `getSupportedCodecs()`

Returns a list of media codecs that this output format can contain.

See `MediaCodec`.

### `getSupportedVideoCodecs()`

Returns a list of video codecs that this output format can contain.

### `getSupportedAudioCodecs()`

Returns a list of audio codecs that this output format can contain.

### `getSupportedSubtitleCodecs()`

Returns a list of subtitle codecs that this output format can contain.