---
url: https://mediabunny.dev/api/AudioBufferSink
title: AudioBufferSink | Mediabunny
---

# AudioBufferSink | Mediabunny

# AudioBufferSink

A sink that retrieves decoded audio samples from an audio track and converts them to `AudioBuffer` instances. This is often more useful than directly retrieving audio samples, as audio buffers can be directly used with the Web Audio API.

## Constructor

Creates a new `AudioBufferSink` for the given `InputAudioTrack`.

## Methods

### `getBuffer()`

Retrieves the audio buffer corresponding to the given timestamp, in seconds. More specifically, returns the last audio buffer (in presentation order) with a start timestamp less than or equal to the given timestamp. Returns null if the timestamp is before the track's first timestamp.

**Parameters:**

-   **timestamp**: The timestamp used for retrieval, in seconds.

See `WrappedAudioBuffer`.

### `buffers()`

Creates an async iterator that yields audio buffers of this track in presentation order. This method will intelligently pre-decode a few buffers ahead to enable fast iteration.

**Parameters:**

-   **startTimestamp**: The timestamp in seconds at which to start yielding buffers (inclusive).
-   **endTimestamp**: The timestamp in seconds at which to stop yielding buffers (exclusive).

See `WrappedAudioBuffer`.

### `buffersAtTimestamps()`

Creates an async iterator that yields an audio buffer for each timestamp in the argument. This method uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is therefore more efficient than manually getting the buffer for every timestamp. The iterator may yield null if no buffer is available for a given timestamp.

**Parameters:**

-   **timestamps**: An iterable or async iterable of timestamps in seconds.

See `AnyIterable` and `WrappedAudioBuffer`.