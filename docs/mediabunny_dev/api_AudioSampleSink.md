---
url: https://mediabunny.dev/api/AudioSampleSink
title: AudioSampleSink | Mediabunny
---

# AudioSampleSink | Mediabunny

# AudioSampleSink

Sink for retrieving decoded audio samples from an audio track.

**Extends:** [`BaseMediaSampleSink`](./BaseMediaSampleSink)

## Constructor

ts
```
constructor(
	audioTrack: InputAudioTrack,
): AudioSampleSink;
```

Creates a new `AudioSampleSink` for the given [`InputAudioTrack`](./InputAudioTrack).

## Methods

### `getSample()`

ts
```
getSample(
	timestamp: number,
): Promise<AudioSample | null>;
```

Retrieves the audio sample corresponding to the given timestamp, in seconds. More specifically, returns the last audio sample (in presentation order) with a start timestamp less than or equal to the given timestamp. Returns null if the timestamp is before the track's first timestamp.

**Parameters:**

-   **timestamp**: The timestamp used for retrieval, in seconds.

See [`AudioSample`](./AudioSample).

### `samples()`

ts
```
samples(
	startTimestamp: number = 0,
	endTimestamp: number = Infinity,
): AsyncGenerator<AudioSample, void, unknown>;
```

Creates an async iterator that yields the audio samples of this track in presentation order. This method will intelligently pre-decode a few samples ahead to enable fast iteration.

**Parameters:**

-   **startTimestamp**: The timestamp in seconds at which to start yielding samples (inclusive).
-   **endTimestamp**: The timestamp in seconds at which to stop yielding samples (exclusive).

See [`AudioSample`](./AudioSample).

### `samplesAtTimestamps()`

ts
```
samplesAtTimestamps(
	timestamps: AnyIterable<number>,
): AsyncGenerator<AudioSample | null, void, unknown>;
```

Creates an async iterator that yields an audio sample for each timestamp in the argument. This method uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may yield null if no sample is available for a given timestamp.

**Parameters:**

-   **timestamps**: An iterable or async iterable of timestamps in seconds.

See [`AnyIterable`](./AnyIterable) and [`AudioSample`](./AudioSample).