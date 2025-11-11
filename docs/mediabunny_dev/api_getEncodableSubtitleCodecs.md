---
url: https://mediabunny.dev/api/getEncodableSubtitleCodecs
title: getEncodableSubtitleCodecs | Mediabunny
---

# getEncodableSubtitleCodecs | Mediabunny

# getEncodableSubtitleCodecs

ts
```
getEncodableSubtitleCodecs(
	checkedCodecs: SubtitleCodec[] = SUBTITLE_CODECS as unknown as SubtitleCodec[],
): Promise<"webvtt"[]>;
```

Returns the list of all subtitle codecs that can be encoded by the browser.

See [`SubtitleCodec`](./SubtitleCodec) and [`SUBTITLE_CODECS`](./SUBTITLE_CODECS).