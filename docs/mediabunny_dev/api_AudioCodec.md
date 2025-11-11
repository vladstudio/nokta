---
url: https://mediabunny.dev/api/AudioCodec
title: AudioCodec | Mediabunny
---

# AudioCodec | Mediabunny

# AudioCodec

Union type of known audio codecs.

```
type AudioCodec = 
	| 'aac'
	| 'opus'
	| 'mp3'
	| 'vorbis'
	| 'flac'
	| 'pcm-s16'
	| 'pcm-s16be'
	| 'pcm-s24'
	| 'pcm-s24be'
	| 'pcm-s32'
	| 'pcm-s32be'
	| 'pcm-f32'
	| 'pcm-f32be'
	| 'pcm-f64'
	| 'pcm-f64be'
	| 'pcm-u8'
	| 'pcm-s8'
	| 'ulaw'
	| 'alaw';
```

## Used by

-   AudioEncodingConfig.codec
-   canEncodeAudio()
-   ConversionAudioOptions.codec
-   CustomAudioDecoder.codec
-   CustomAudioDecoder.supports()
-   CustomAudioEncoder.codec
-   CustomAudioEncoder.supports()
-   getEncodableAudioCodecs()
-   getFirstEncodableAudioCodec()
-   InputAudioTrack.codec
-   MediaCodec
-   new EncodedAudioPacketSource()