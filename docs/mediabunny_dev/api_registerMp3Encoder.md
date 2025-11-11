---
url: https://mediabunny.dev/api/registerMp3Encoder
title: registerMp3Encoder | Mediabunny
---

# registerMp3Encoder | Mediabunny

# registerMp3Encoder

ts
```
registerMp3Encoder(): void;
```

Registers the LAME MP3 encoder, which Mediabunny will then use automatically when applicable. Make sure to call this function before starting any encoding task.

Preferably, wrap the call in a condition to avoid overriding any native MP3 encoder:

ts
```
import { canEncodeAudio } from 'mediabunny';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';
if (!(await canEncodeAudio('mp3'))) {
    registerMp3Encoder();
}
```