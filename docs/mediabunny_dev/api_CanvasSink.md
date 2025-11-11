---
url: https://mediabunny.dev/api/CanvasSink
title: CanvasSink | Mediabunny
---

# CanvasSink | Mediabunny

# CanvasSink

A sink that renders video samples (frames) of the given video track to canvases. This is often more useful than directly retrieving frames, as it comes with common preprocessing steps such as resizing or applying rotation metadata.

This sink will yield `HTMLCanvasElement`s when in a DOM context, and `OffscreenCanvas`es otherwise.

## Constructor

```typescript
constructor(
	videoTrack: InputVideoTrack,
	options: CanvasSinkOptions = {},
): CanvasSink;
```

Creates a new `CanvasSink` for the given `InputVideoTrack`.

See `CanvasSinkOptions`.

## Methods

### `getCanvas()`

```typescript
getCanvas(
	timestamp: number,
): Promise<WrappedCanvas | null>;
```

Retrieves a canvas with the video frame corresponding to the given timestamp, in seconds. More specifically, returns the last video frame (in presentation order) with a start timestamp less than or equal to the given timestamp. Returns null if the timestamp is before the track's first timestamp.

**Parameters:**

*   **timestamp**: The timestamp used for retrieval, in seconds.

See `WrappedCanvas`.

### `canvases()`

```typescript
canvases(
	startTimestamp: number = 0,
	endTimestamp: number = Infinity,
): AsyncGenerator<WrappedCanvas, void, unknown>;
```

Creates an async iterator that yields canvases with the video frames of this track in presentation order. This method will intelligently pre-decode a few frames ahead to enable fast iteration.

**Parameters:**

*   **startTimestamp**: The timestamp in seconds at which to start yielding canvases (inclusive).
*   **endTimestamp**: The timestamp in seconds at which to stop yielding canvases (exclusive).

See `WrappedCanvas`.

### `canvasesAtTimestamps()`

```typescript
canvasesAtTimestamps(
	timestamps: AnyIterable<number>,
): AsyncGenerator<WrappedCanvas | null, void, unknown>;
```

Creates an async iterator that yields a canvas for each timestamp in the argument. This method uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is therefore more efficient than manually getting the canvas for every timestamp. The iterator may yield null if no frame is available for a given timestamp.

**Parameters:**

*   **timestamps**: An iterable or async iterable of timestamps in seconds.

See `AnyIterable` and `WrappedCanvas`.