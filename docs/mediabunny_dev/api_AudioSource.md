---
url: https://mediabunny.dev/api/AudioSource
title: AudioSource | Mediabunny
---

# AudioSource | Mediabunny

# AudioSource

Base class for audio sources - sources for audio tracks.

**Extends:** [`MediaSource`](./MediaSource)

## Subclasses

-   [`AudioBufferSource`](./AudioBufferSource)
-   [`AudioSampleSource`](./AudioSampleSource)
-   [`EncodedAudioPacketSource`](./EncodedAudioPacketSource)
-   [`MediaStreamAudioTrackSource`](./MediaStreamAudioTrackSource)

## Used by

-   [`Output.addAudioTrack()`](./Output#addaudiotrack)

## Methods

### `close()`

Closes this source. This prevents future samples from being added and signals to the output file that no further samples will come in for this track. Calling `.close()` is optional but recommended after adding the last sample - for improved performance and reduced memory usage.