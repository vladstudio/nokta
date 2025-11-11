---
url: https://mediabunny.dev/api/AudioEncodingConfig
title: AudioEncodingConfig | Mediabunny
---

# AudioEncodingConfig | Mediabunny

# AudioEncodingConfig

Configuration object that controls audio encoding. Can be used to set codec, quality, and more.

```
type AudioEncodingConfig = {
	codec: AudioCodec;
	bitrate?: number | Quality;
	onEncodedPacket?: (packet: EncodedPacket, meta: EncodedAudioChunkMetadata | undefined) => unknown;
	onEncoderConfig?: (config: AudioEncoderConfig) => unknown;
} & AudioEncodingAdditionalOptions;
```

See AudioCodec, Quality, EncodedPacket, and AudioEncodingAdditionalOptions.

## Used by

- new AudioBufferSource()
- new AudioSampleSource()
- new MediaStreamAudioTrackSource()

## Properties

### `codec`

The audio codec that should be used for encoding the audio samples.

See AudioCodec.

### `bitrate`

The target bitrate for the encoded audio, in bits per second. Alternatively, a subjective Quality can be provided. Required for compressed audio codecs, unused for PCM codecs.

See Quality.

### `bitrateMode`

Configures the bitrate mode.

### `fullCodecString`

The full codec string as specified in the WebCodecs Codec Registry. This string must match the codec specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.

## Events

### `onEncodedPacket`

Called for each successfully encoded packet. Both the packet and the encoding metadata are passed.

See EncodedPacket.

### `onEncoderConfig`

Called when the internal encoder config, as used by the WebCodecs API, is created.