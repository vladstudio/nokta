---
url: https://mediabunny.dev/api/getFirstEncodableVideoCodec
title: getFirstEncodableVideoCodec | Mediabunny
---

# getFirstEncodableVideoCodec | Mediabunny

# getFirstEncodableVideoCodec

ts
```
getFirstEncodableVideoCodec(
	checkedCodecs: VideoCodec[],
	options?: {
		width?: number;
		height?: number;
		bitrate?: number | Quality;
	},
): Promise<"avc" | "hevc" | "vp9" | "av1" | "vp8" | null>;
```

Returns the first video codec from the given list that can be encoded by the browser.

See [`VideoCodec`](./VideoCodec) and [`Quality`](./Quality).