---
url: https://mediabunny.dev/api/ConversionAudioOptions
title: ConversionAudioOptions | Mediabunny
---

# ConversionAudioOptions | Mediabunny

# ConversionAudioOptions

Audio-specific options.

```
type ConversionAudioOptions = {
	discard?: boolean;
	numberOfChannels?: number;
	sampleRate?: number;
	codec?: AudioCodec;
	bitrate?: number | Quality;
	forceTranscode?: boolean;
	process?: (sample: AudioSample) => MaybePromise<
		AudioSample | AudioSample[] | null
	>;
	processedNumberOfChannels?: number;
	processedSampleRate?: number;
};
```

See `AudioCodec`, `Quality`, `AudioSample`, and `MaybePromise`.

## Used by

- `ConversionOptions.audio`

## Properties

### `discard`

```
discard?: boolean;
```

If `true`, all audio tracks will be discarded and will not be present in the output.

### `numberOfChannels`

```
numberOfChannels?: number;
```

The desired channel count of the output audio.

### `sampleRate`

```
sampleRate?: number;
```

The desired sample rate of the output audio, in hertz.

### `codec`

```
codec?: AudioCodec;
```

The desired output audio codec.

See `AudioCodec`.

### `bitrate`

```
bitrate?: number | Quality;
```

The desired bitrate of the output audio.

See `Quality`.

### `forceTranscode`

```
forceTranscode?: boolean;
```

When `true`, audio will always be re-encoded instead of directly copying over the encoded samples.

### `process`

```
process?: ((sample: AudioSample) => MaybePromise<AudioSample | AudioSample[] | null>);
```

Allows for custom user-defined processing of audio samples, e.g. for applying audio effects, transformations, or timestamp modifications. Will be called for each input audio sample after remixing and resampling.

Must return an `AudioSample`, an array of them, or `null` for dropping the sample.

This function can also be used to manually perform remixing or resampling. When doing so, you should signal the post-process parameters using the `processedNumberOfChannels` and `processedSampleRate` fields, which enables the encoder to better know what to expect. If these fields aren't set, Mediabunny will assume you won't perform remixing or resampling.

See `AudioSample` and `MaybePromise`.

### `processedNumberOfChannels`

```
processedNumberOfChannels?: number;
```

An optional hint specifying the channel count of audio samples returned by the `process` function, for better encoder configuration.

### `processedSampleRate`

```
processedSampleRate?: number;
```

An optional hint specifying the sample rate of audio samples returned by the `process` function, for better encoder configuration.