---
url: https://mediabunny.dev/api/AudioSampleInit
title: AudioSampleInit | Mediabunny
---

# AudioSampleInit | Mediabunny

# AudioSampleInit

Metadata used for AudioSample initialization.

```
type AudioSampleInit = {
	data: AllowSharedBufferSource;
	format: AudioSampleFormat;
	numberOfChannels: number;
	sampleRate: number;
	timestamp: number;
};
```

## Used by

- [`new AudioSample()`](./AudioSample#constructor)

## Properties

### `data`

```
data: AllowSharedBufferSource;
```

The audio data for this sample.

### `format`

```
format: AudioSampleFormat;
```

The audio sample format. [See sample formats](https://developer.mozilla.org/en-US/docs/Web/API/AudioData/format)

### `numberOfChannels`

```
numberOfChannels: number;
```

The number of audio channels.

### `sampleRate`

```
sampleRate: number;
```

The audio sample rate in hertz.

### `timestamp`

```
timestamp: number;
```

The presentation timestamp of the sample in seconds.