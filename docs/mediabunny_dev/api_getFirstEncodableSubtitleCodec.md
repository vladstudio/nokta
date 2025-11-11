---
url: https://mediabunny.dev/api/getFirstEncodableSubtitleCodec
title: getFirstEncodableSubtitleCodec | Mediabunny
---

# getFirstEncodableSubtitleCodec | Mediabunny

# getFirstEncodableSubtitleCodec

ts
```
getFirstEncodableSubtitleCodec(
	checkedCodecs: SubtitleCodec[],
): Promise<"webvtt" | null>;
```

Returns the first subtitle codec from the given list that can be encoded by the browser.

See [`SubtitleCodec`](./SubtitleCodec).