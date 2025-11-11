---
url: https://mediabunny.dev/api/VideoCodec
title: VideoCodec | Mediabunny
---

# VideoCodec | Mediabunny

# VideoCodec

Union type of known video codecs.

```
type VideoCodec =
	| 'avc'
	| 'hevc'
	| 'vp9'
	| 'av1'
	| 'vp8';
```

## Used by

-   canEncodeVideo()
-   ConversionVideoOptions.codec
-   CustomVideoDecoder.codec
-   CustomVideoDecoder.supports()
-   CustomVideoEncoder.codec
-   CustomVideoEncoder.supports()
-   getEncodableVideoCodecs()
-   getFirstEncodableVideoCodec()
-   InputVideoTrack.codec
-   MediaCodec
-   new EncodedVideoPacketSource()
-   VideoEncodingConfig.codec