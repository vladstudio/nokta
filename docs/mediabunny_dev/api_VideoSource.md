---
url: https://mediabunny.dev/api/VideoSource
title: VideoSource | Mediabunny
---

# VideoSource | Mediabunny

# VideoSource

Base class for video sources - sources for video tracks.

**Extends:** [`MediaSource`](./MediaSource)

## Subclasses

-   [`CanvasSource`](./CanvasSource)
-   [`EncodedVideoPacketSource`](./EncodedVideoPacketSource)
-   [`MediaStreamVideoTrackSource`](./MediaStreamVideoTrackSource)
-   [`VideoSampleSource`](./VideoSampleSource)

## Used by

-   [`Output.addVideoTrack()`](./Output#addvideotrack)

## Methods

### `close()`

```
close(): void;
```

Closes this source. This prevents future samples from being added and signals to the output file that no further samples will come in for this track. Calling `.close()` is optional but recommended after adding the last sample - for improved performance and reduced memory usage.