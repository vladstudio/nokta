---
url: https://mediabunny.dev/api/OutputFormat
title: OutputFormat | Mediabunny
---

# OutputFormat | Mediabunny

# OutputFormat

Base class representing an output media file format.

## Subclasses

- [`AdtsOutputFormat`](AdtsOutputFormat)
- [`FlacOutputFormat`](FlacOutputFormat)
- [`IsobmffOutputFormat`](IsobmffOutputFormat)
    - [`MovOutputFormat`](MovOutputFormat)
    - [`Mp4OutputFormat`](Mp4OutputFormat)
- [`MkvOutputFormat`](MkvOutputFormat)
    - [`WebMOutputFormat`](WebMOutputFormat)
- [`Mp3OutputFormat`](Mp3OutputFormat)
- [`OggOutputFormat`](OggOutputFormat)
- [`WavOutputFormat`](WavOutputFormat)

## Used by

- [`Output`](Output)
- [`OutputOptions`](OutputOptions)

## Properties

### `fileExtension`

The file extension used by this output format, beginning with a dot.

### `mimeType`

The base MIME type of the output format.

### `supportsVideoRotationMetadata`

Whether this output format supports video rotation metadata.

## Methods

### `getSupportedCodecs()`

Returns a list of media codecs that this output format can contain.

See [`MediaCodec`](MediaCodec).

### `getSupportedTrackCounts()`

Returns the number of tracks that this output format supports.

See [`TrackCountLimits`](TrackCountLimits).

### `getSupportedVideoCodecs()`

Returns a list of video codecs that this output format can contain.

### `getSupportedAudioCodecs()`

Returns a list of audio codecs that this output format can contain.

### `getSupportedSubtitleCodecs()`

Returns a list of subtitle codecs that this output format can contain.