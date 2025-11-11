---
url: https://mediabunny.dev/api/MediaSource
title: MediaSource | Mediabunny
---

# MediaSource | Mediabunny

# MediaSource

Base class for media sources. Media sources are used to add media samples to an output file.

## Subclasses

-   VideoSource
    -   CanvasSource
    -   EncodedVideoPacketSource
    -   MediaStreamVideoTrackSource
    -   VideoSampleSource
-   AudioSource
    -   AudioBufferSource
    -   AudioSampleSource
    -   EncodedAudioPacketSource
    -   MediaStreamAudioTrackSource
-   SubtitleSource
    -   TextSubtitleSource

## Used by

-   OggOutputFormatOptions.onPage

## Methods

### `close()`

Closes this source. This prevents future samples from being added and signals to the output file that no further samples will come in for this track. Calling `.close()` is optional but recommended after adding the last sample - for improved performance and reduced memory usage.