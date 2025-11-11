---
url: https://mediabunny.dev/api/getEncodableAudioCodecs
title: getEncodableAudioCodecs | Mediabunny
---

# getEncodableAudioCodecs | Mediabunny

# getEncodableAudioCodecs

ts
```
getEncodableAudioCodecs(
	checkedCodecs: AudioCodec[] = AUDIO_CODECS as unknown as AudioCodec[],
	options?: {
		numberOfChannels?: number;
		sampleRate?: number;
		bitrate?: number | Quality;
	},
): Promise<("aac" | "opus" | "mp3" | "vorbis" | "flac" | "pcm-s16" | "pcm-s16be" | "pcm-s24" | "pcm-s24be" | "pcm-s32" | "pcm-s32be" | "pcm-f32" | "pcm-f32be" | "pcm-f64" | "pcm-f64be" | "pcm-u8" | "pcm-s8" | "ulaw" | "alaw")[]>;
```

Returns the list of all audio codecs that can be encoded by the browser.

See [`AudioCodec`](./AudioCodec), [`AUDIO_CODECS`](./AUDIO_CODECS), and [`Quality`](./Quality).