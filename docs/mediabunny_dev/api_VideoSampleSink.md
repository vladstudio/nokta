---
url: https://mediabunny.dev/api/VideoSampleSink
title: VideoSampleSink | Mediabunny
---

# VideoSampleSink | Mediabunny

# VideoSampleSink

A sink that retrieves decoded video samples (video frames) from a video track.

**Extends:** [`BaseMediaSampleSink`](./BaseMediaSampleSink)

## Constructor

ts
```
constructor(
	videoTrack: InputVideoTrack,
): VideoSampleSink;
```

Creates a new `VideoSampleSink` for the given [`InputVideoTrack`](./InputVideoTrack).

## Methods

### `getSample()`

ts
```
getSample(
	timestamp: number,
): Promise<VideoSample | null>;
```

Retrieves the video sample (frame) corresponding to the given timestamp, in seconds. More specifically, returns the last video sample (in presentation order) with a start timestamp less than or equal to the given timestamp. Returns null if the timestamp is before the track's first timestamp.

**Parameters:**

-   **timestamp**: The timestamp used for retrieval, in seconds.

See [`VideoSample`](./VideoSample).

### `samples()`

ts
```
samples(
	startTimestamp: number = 0,
	endTimestamp: number = Infinity,
): AsyncGenerator<VideoSample, void, unknown>;
```

Creates an async iterator that yields the video samples (frames) of this track in presentation order. This method will intelligently pre-decode a few frames ahead to enable fast iteration.

**Parameters:**

-   **startTimestamp**: The timestamp in seconds at which to start yielding samples (inclusive).
-   **endTimestamp**: The timestamp in seconds at which to stop yielding samples (exclusive).

See [`VideoSample`](./VideoSample).

### `samplesAtTimestamps()`

ts
```
samplesAtTimestamps(
	timestamps: AnyIterable<number>,
): AsyncGenerator<VideoSample | null, void, unknown>;
```

Creates an async iterator that yields a video sample (frame) for each timestamp in the argument. This method uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may yield null if no frame is available for a given timestamp.

**Parameters:**

-   **timestamps**: An iterable or async iterable of timestamps in seconds.

See [`AnyIterable`](./AnyIterable) and [`VideoSample`](./VideoSample).