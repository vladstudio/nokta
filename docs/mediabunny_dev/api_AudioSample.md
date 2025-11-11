---
url: https://mediabunny.dev/api/AudioSample
title: AudioSample | Mediabunny
---

# AudioSample | Mediabunny

# AudioSample

Represents a raw, unencoded audio sample. Mainly used as an expressive wrapper around WebCodecs API's AudioData, but can also be used standalone.

**Implements:** `Disposable`

## Used by

- AudioSampleSink.getSample()
- AudioSampleSink.samples()
- AudioSampleSink.samplesAtTimestamps()
- AudioSampleSource.add()
- BaseMediaSampleSink
- ConversionAudioOptions.process
- CustomAudioDecoder.onSample
- CustomAudioEncoder.encode()

## Constructor

```
constructor(
	init: AudioData | AudioSampleInit,
): AudioSample;
```

Creates a new `AudioSample`, either from an existing AudioData or from raw bytes specified in AudioSampleInit.

## Static methods

### `fromAudioBuffer()`

```
static fromAudioBuffer(
	audioBuffer: AudioBuffer,
	timestamp: number,
): AudioSample[];
```

Creates AudioSamples from an AudioBuffer, starting at the given timestamp in seconds. Typically creates exactly one sample, but may create multiple if the AudioBuffer is exceedingly large.

## Properties

### `duration`

```
readonly duration: number;
```

The duration of the sample in seconds.

### `format`

```
readonly format: AudioSampleFormat;
```

The audio sample format. See sample formats

### `microsecondDuration`

```
get microsecondDuration(): number;
```

The duration of the sample in microseconds.

### `microsecondTimestamp`

```
get microsecondTimestamp(): number;
```

The presentation timestamp of the sample in microseconds.

### `numberOfChannels`

```
readonly numberOfChannels: number;
```

The number of audio channels.

### `numberOfFrames`

```
readonly numberOfFrames: number;
```

The number of audio frames in the sample, per channel. In other words, the length of this audio sample in frames.

### `sampleRate`

```
readonly sampleRate: number;
```

The audio sample rate in hertz.

### `timestamp`

```
readonly timestamp: number;
```

The presentation timestamp of the sample in seconds. May be negative. Samples with negative end timestamps should not be presented.

## Methods

### `allocationSize()`

```
allocationSize(
	options: AudioSampleCopyToOptions,
): number;
```

Returns the number of bytes required to hold the audio sample's data as specified by the given options.

See AudioSampleCopyToOptions.

### `copyTo()`

```
copyTo(
	destination: AllowSharedBufferSource,
	options: AudioSampleCopyToOptions,
): void;
```

Copies the audio sample's data to an ArrayBuffer or ArrayBufferView as specified by the given options.

See AudioSampleCopyToOptions.

### `clone()`

```
clone(): AudioSample;
```

Clones this audio sample.

### `close()`

```
close(): void;
```

Closes this audio sample, releasing held resources. Audio samples should be closed as soon as they are not needed anymore.

### `toAudioData()`

```
toAudioData(): AudioData;
```

Converts this audio sample to an AudioData for use with the WebCodecs API. The AudioData returned by this method *must* be closed separately from this audio sample.

### `toAudioBuffer()`

```
toAudioBuffer(): AudioBuffer;
```

Convert this audio sample to an AudioBuffer for use with the Web Audio API.

### `setTimestamp()`

```
setTimestamp(
	newTimestamp: number,
): void;
```

Sets the presentation timestamp of this audio sample, in seconds.

### `[Symbol.dispose]()`

```
[Symbol.dispose](): void;
```

Calls `.close()`.