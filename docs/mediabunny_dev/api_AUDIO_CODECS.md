---
url: https://mediabunny.dev/api/AUDIO_CODECS
title: AUDIO_CODECS | Mediabunny
---

# AUDIO_CODECS | Mediabunny

# AUDIO_CODECS

List of known audio codecs, ordered by encoding preference.

```
const AUDIO_CODECS = [
	...NON_PCM_AUDIO_CODECS,
	...PCM_AUDIO_CODECS,
] as const;
```

See [NON_PCM_AUDIO_CODECS] and [PCM_AUDIO_CODECS].