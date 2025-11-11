---
url: https://mediabunny.dev/api/canEncodeVideo
title: canEncodeVideo | Mediabunny
---

# canEncodeVideo | Mediabunny

# canEncodeVideo

```
canEncodeVideo(
	codec: VideoCodec,
	options: {
		width?: number;
		height?: number;
		bitrate?: number | Quality;
	} & VideoEncodingAdditionalOptions = {},
): Promise<boolean>;
```

Checks if the browser is able to encode the given video codec with the given parameters.

See `VideoCodec`, `Quality`, and `VideoEncodingAdditionalOptions`.