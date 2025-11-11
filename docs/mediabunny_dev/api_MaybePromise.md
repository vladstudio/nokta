---
url: https://mediabunny.dev/api/MaybePromise
title: MaybePromise | Mediabunny
---

# MaybePromise | Mediabunny

# MaybePromise

T or a promise that resolves to T.

```
type MaybePromise<T> = T | Promise<T>;
```

## Used by

- [`ConversionAudioOptions.process`](#)
- [`ConversionOptions.audio`](#)
- [`ConversionOptions.tags`](#)
- [`ConversionOptions.video`](#)
- [`ConversionVideoOptions.process`](#)
- [`CustomAudioDecoder.close()`](#)
- [`CustomAudioDecoder.decode()`](#)
- [`CustomAudioDecoder.flush()`](#)
- [`CustomAudioDecoder.init()`](#)
- [`CustomAudioEncoder.close()`](#)
- [`CustomAudioEncoder.encode()`](#)
- [`CustomAudioEncoder.flush()`](#)
- [`CustomAudioEncoder.init()`](#)
- [`CustomVideoDecoder.close()`](#)
- [`CustomVideoDecoder.decode()`](#)
- [`CustomVideoDecoder.flush()`](#)
- [`CustomVideoDecoder.init()`](#)
- [`CustomVideoEncoder.close()`](#)
- [`CustomVideoEncoder.encode()`](#)
- [`CustomVideoEncoder.flush()`](#)
- [`CustomVideoEncoder.init()`](#)
- [`StreamSourceOptions.getSize`](#)
- [`StreamSourceOptions.read`](#)