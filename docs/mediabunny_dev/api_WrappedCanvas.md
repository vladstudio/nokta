---
url: https://mediabunny.dev/api/WrappedCanvas
title: WrappedCanvas | Mediabunny
---

# WrappedCanvas | Mediabunny

# WrappedCanvas

A canvas with additional timing information (timestamp & duration).

```
type WrappedCanvas = {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	timestamp: number;
	duration: number;
};
```

## Used by

-   `CanvasSink.canvases()`
-   `CanvasSink.canvasesAtTimestamps()`
-   `CanvasSink.getCanvas()`

## Properties

### `canvas`

```
canvas: HTMLCanvasElement | OffscreenCanvas;
```

A canvas element or offscreen canvas.

### `timestamp`

```
timestamp: number;
```

The timestamp of the corresponding video sample, in seconds.

### `duration`

```
duration: number;
```

The duration of the corresponding video sample, in seconds.