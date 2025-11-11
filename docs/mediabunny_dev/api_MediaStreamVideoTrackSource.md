---
url: https://mediabunny.dev/api/MediaStreamVideoTrackSource
title: MediaStreamVideoTrackSource | Mediabunny
---

# MediaStreamVideoTrackSource | Mediabunny

# MediaStreamVideoTrackSource

Video source that encodes the frames of a MediaStreamVideoTrack and pipes them into the output. This is useful for capturing live or real-time data such as webcams or screen captures. Frames will automatically start being captured once the connected Output is started, and will keep being captured until the Output is finalized or this source is closed.

**Extends:** VideoSource

## Constructor

```
constructor(
	track: MediaStreamVideoTrack,
	encodingConfig: VideoEncodingConfig,
): MediaStreamVideoTrackSource;
```

Creates a new `MediaStreamVideoTrackSource` from a `MediaStreamVideoTrack`, which will pull video samples from the stream in real time and encode them according to `VideoEncodingConfig`.

## Properties

### `errorPromise`

```
get errorPromise(): Promise<void>;
```

A promise that rejects upon any error within this source. This promise never resolves.