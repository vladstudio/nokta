---
url: https://mediabunny.dev/api/getFirstEncodableAudioCodec
title: getFirstEncodableAudioCodec | Mediabunny
---

# getFirstEncodableAudioCodec | Mediabunny

# getFirstEncodableAudioCodec

ts
```
getFirstEncodableAudioCodec(
	checkedCodecs: AudioCodec[],
	options?: {
		numberOfChannels?: number;
		sampleRate?: number;
		bitrate?: number | Quality;
	},
): Promise<"aac" | "opus" | "mp3" | "vorbis" | "flac" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | ... 4 more ... | null>;
```

Returns the first audio codec from the given list that can be encoded by the browser.

See AudioCodec and Quality.