---
url: https://mediabunny.dev/api/CanvasSource
title: CanvasSource | Mediabunny
---

# CanvasSource | Mediabunny

# CanvasSource

This source can be used to add video frames to the output track from a fixed canvas element. Since canvases are often used for rendering, this source provides a convenient wrapper around VideoSampleSource.

**Extends:** VideoSource

## Constructor

Creates a new `CanvasSource` from a canvas element or `OffscreenCanvas` whose samples are encoded according to the specified `VideoEncodingConfig`.

## Methods

### `add()`

Captures the current canvas state as a video sample (frame), encodes it and adds it to the output.

**Parameters:**

-   **timestamp**: The timestamp of the sample, in seconds.
-   **duration**: The duration of the sample, in seconds.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.