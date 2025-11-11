---
url: https://mediabunny.dev/api/MediaCodec
title: MediaCodec | Mediabunny
---

# MediaCodec | Mediabunny

# MediaCodec

Union type of known media codecs.

```
type MediaCodec = 
	| VideoCodec
	| AudioCodec
	| SubtitleCodec;
```

See VideoCodec, AudioCodec, and SubtitleCodec.

## Used by

- AdtsOutputFormat.getSupportedCodecs()
- canEncode()
- FlacOutputFormat.getSupportedCodecs()
- getEncodableCodecs()
- InputTrack.codec
- IsobmffOutputFormat.getSupportedCodecs()
- MkvOutputFormat.getSupportedCodecs()
- MovOutputFormat.getSupportedCodecs()
- Mp3OutputFormat.getSupportedCodecs()
- Mp4OutputFormat.getSupportedCodecs()
- OggOutputFormat.getSupportedCodecs()
- OutputFormat.getSupportedCodecs()
- WavOutputFormat.getSupportedCodecs()
- WebMOutputFormat.getSupportedCodecs()