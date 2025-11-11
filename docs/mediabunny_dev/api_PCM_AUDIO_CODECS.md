---
url: https://mediabunny.dev/api/PCM_AUDIO_CODECS
title: PCM_AUDIO_CODECS | Mediabunny
---

# PCM_AUDIO_CODECS | Mediabunny

# PCM\_AUDIO\_CODECS

List of known PCM (uncompressed) audio codecs, ordered by encoding preference.

```
const PCM_AUDIO_CODECS = [
	'pcm-s16',
	'pcm-s16be',
	'pcm-s24',
	'pcm-s24be',
	'pcm-s32',
	'pcm-s32be',
	'pcm-f32',
	'pcm-f32be',
	'pcm-f64',
	'pcm-f64be',
	'pcm-u8',
	'pcm-s8',
	'ulaw',
	'alaw',
] as const;
```