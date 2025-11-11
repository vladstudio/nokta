---
url: https://mediabunny.dev/api/AudioBufferSource
title: AudioBufferSource | Mediabunny
---

# AudioBufferSource | Mediabunny

# AudioBufferSource

This source can be used to add audio data from an AudioBuffer to the output track. This is useful when working with the Web Audio API.

**Extends:** AudioSource

## Constructor

Creates a new `AudioBufferSource` whose `AudioBuffer` instances are encoded according to the specified `AudioEncodingConfig`.

## Methods

### `add()`

Converts an AudioBuffer to audio samples, encodes them and adds them to the output. The first AudioBuffer will be played at timestamp 0, and any subsequent AudioBuffer will have a timestamp equal to the total duration of all previous AudioBuffers.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.