---
url: https://mediabunny.dev/api/VideoSampleSource
title: VideoSampleSource | Mediabunny
---

# VideoSampleSource | Mediabunny

# VideoSampleSource

This source can be used to add raw, unencoded video samples (frames) to an output video track. These frames will automatically be encoded and then piped into the output.

**Extends:** [`VideoSource`](./VideoSource)

## Constructor

Creates a new `VideoSampleSource` whose samples are encoded according to the specified [`VideoEncodingConfig`](./VideoEncodingConfig).

## Methods

### `add()`

Encodes a video sample (frame) and then adds it to the output.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.

See [`VideoSample`](./VideoSample).