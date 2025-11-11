---
url: https://mediabunny.dev/api/getEncodableVideoCodecs
title: getEncodableVideoCodecs | Mediabunny
---

# getEncodableVideoCodecs | Mediabunny

# getEncodableVideoCodecs

ts
```
getEncodableVideoCodecs(
	checkedCodecs: VideoCodec[] = VIDEO_CODECS as unknown as VideoCodec[],
	options?: {
		width?: number;
		height?: number;
		bitrate?: number | Quality;
	},
): Promise<("avc" | "hevc" | "vp9" | "av1" | "vp8")[]>;
```

Returns the list of all video codecs that can be encoded by the browser.

See [`VideoCodec`](./VideoCodec), [`VIDEO_CODECS`](./VIDEO_CODECS), and [`Quality`](./Quality).