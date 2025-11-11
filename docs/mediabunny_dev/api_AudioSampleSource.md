---
url: https://mediabunny.dev/api/AudioSampleSource
title: AudioSampleSource | Mediabunny
---

# AudioSampleSource | Mediabunny

# AudioSampleSource

This source can be used to add raw, unencoded audio samples to an output audio track. These samples will automatically be encoded and then piped into the output.

**Extends:** [`AudioSource`](#)

## Constructor

Creates a new `AudioSampleSource` whose samples are encoded according to the specified [`AudioEncodingConfig`](#).

## Methods

### `add()`

Encodes an audio sample and then adds it to the output.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.

See [`AudioSample`](#).