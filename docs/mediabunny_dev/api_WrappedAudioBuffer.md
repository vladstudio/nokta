---
url: https://mediabunny.dev/api/WrappedAudioBuffer
title: WrappedAudioBuffer | Mediabunny
---

# WrappedAudioBuffer | Mediabunny

# WrappedAudioBuffer

An AudioBuffer with additional timing information (timestamp & duration).

```
type WrappedAudioBuffer = {
	buffer: AudioBuffer;
	timestamp: number;
	duration: number;
};
```

## Used by

- `AudioBufferSink.buffers()`
- `AudioBufferSink.buffersAtTimestamps()`
- `AudioBufferSink.getBuffer()`

## Properties

### `buffer`

```
buffer: AudioBuffer;
```

An AudioBuffer.

### `timestamp`

```
timestamp: number;
```

The timestamp of the corresponding audio sample, in seconds.

### `duration`

```
duration: number;
```

The duration of the corresponding audio sample, in seconds.