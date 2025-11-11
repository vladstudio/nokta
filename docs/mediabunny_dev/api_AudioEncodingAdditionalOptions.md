---
url: https://mediabunny.dev/api/AudioEncodingAdditionalOptions
title: AudioEncodingAdditionalOptions | Mediabunny
---

# AudioEncodingAdditionalOptions | Mediabunny

# AudioEncodingAdditionalOptions

Additional options that control audio encoding.

```
type AudioEncodingAdditionalOptions = {
	bitrateMode?: 'constant' | 'variable';
	fullCodecString?: string;
};
```

## Used by

-   AudioEncodingConfig
-   canEncodeAudio()

## Properties

### `bitrateMode`

Configures the bitrate mode.

### `fullCodecString`

The full codec string as specified in the WebCodecs Codec Registry. This string must match the codec specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.