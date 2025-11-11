---
url: https://mediabunny.dev/api/registerDecoder
title: registerDecoder | Mediabunny
---

# registerDecoder | Mediabunny

# registerDecoder

ts
```
registerDecoder(
	decoder: typeof CustomVideoDecoder | typeof CustomAudioDecoder,
): void;
```

Registers a custom video or audio decoder. Registered decoders will automatically be used for decoding whenever possible.

See `CustomVideoDecoder` and `CustomAudioDecoder`.