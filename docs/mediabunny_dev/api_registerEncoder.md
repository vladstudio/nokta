---
url: https://mediabunny.dev/api/registerEncoder
title: registerEncoder | Mediabunny
---

# registerEncoder | Mediabunny

# registerEncoder

ts
```
registerEncoder(
	encoder: typeof CustomVideoEncoder | typeof CustomAudioEncoder,
): void;
```

Registers a custom video or audio encoder. Registered encoders will automatically be used for encoding whenever possible.

See CustomVideoEncoder and CustomAudioEncoder.