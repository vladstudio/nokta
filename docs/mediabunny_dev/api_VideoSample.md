---
url: https://mediabunny.dev/api/VideoSample
title: VideoSample | Mediabunny
---

# VideoSample | Mediabunny

# VideoSample

Represents a raw, unencoded video sample (frame). Mainly used as an expressive wrapper around WebCodecs API's VideoFrame, but can also be used standalone.

**Implements:** `Disposable`

## Used by

- BaseMediaSampleSink
- ConversionVideoOptions.process
- CustomVideoDecoder.onSample
- CustomVideoEncoder.encode()
- VideoSampleSink.getSample()
- VideoSampleSink.samples()
- VideoSampleSink.samplesAtTimestamps()
- VideoSampleSource.add()

## Constructors

```
constructor(
	data: VideoFrame,
	init?: VideoSampleInit,
): VideoSample;
```

Creates a new VideoSample from a VideoFrame. This is essentially a near zero-cost wrapper around VideoFrame. The sample's metadata is optionally refined using the data specified in init.

See VideoSampleInit.

* * *

```
constructor(
	data: CanvasImageSource,
	init: SetRequired<VideoSampleInit, 'timestamp'>,
): VideoSample;
```

Creates a new VideoSample from a CanvasImageSource, similar to the VideoFrame constructor. When VideoFrame is available, this is simply a wrapper around its constructor. If not, it will copy the source's image data to an internal canvas for later use.

See SetRequired and VideoSampleInit.

* * *

```
constructor(
	data: AllowSharedBufferSource,
	init: SetRequired<VideoSampleInit, 'format' | 'codedWidth' | 'codedHeight' | 'timestamp'>,
): VideoSample;
```

Creates a new VideoSample from raw pixel data specified in data. Additional metadata must be provided in init.

See SetRequired and VideoSampleInit.

## Properties

### `codedHeight`

```
readonly codedHeight: number;
```

The height of the frame in pixels.

### `codedWidth`

```
readonly codedWidth: number;
```

The width of the frame in pixels.

### `colorSpace`

```
readonly colorSpace: VideoColorSpace;
```

The color space of the frame.

### `displayHeight`

```
get displayHeight(): number;
```

The height of the frame in pixels after rotation.

### `displayWidth`

```
get displayWidth(): number;
```

The width of the frame in pixels after rotation.

### `duration`

```
readonly duration: number;
```

The duration of the frame in seconds.

### `format`

```
readonly format: VideoPixelFormat | null;
```

The internal pixel format in which the frame is stored. See pixel formats

### `hasAlpha`

```
get hasAlpha(): boolean | null;
```

Whether this sample uses a pixel format that can hold transparency data. Note that this doesn't necessarily mean that the sample is transparent.

### `microsecondDuration`

```
get microsecondDuration(): number;
```

The duration of the frame in microseconds.

### `microsecondTimestamp`

```
get microsecondTimestamp(): number;
```

The presentation timestamp of the frame in microseconds.

### `rotation`

```
readonly rotation: Rotation;
```

The rotation of the frame in degrees, clockwise.

See Rotation.

### `timestamp`

```
readonly timestamp: number;
```

The presentation timestamp of the frame in seconds. May be negative. Frames with negative end timestamps should not be presented.

## Methods

### `clone()`

```
clone(): VideoSample;
```

Clones this video sample.

### `close()`

```
close(): void;
```

Closes this video sample, releasing held resources. Video samples should be closed as soon as they are not needed anymore.

### `allocationSize()`

```
allocationSize(): number;
```

Returns the number of bytes required to hold this video sample's pixel data.

### `copyTo()`

```
copyTo(
	destination: AllowSharedBufferSource,
): Promise<void>;
```

Copies this video sample's pixel data to an ArrayBuffer or ArrayBufferView.

### `toVideoFrame()`

```
toVideoFrame(): VideoFrame;
```

Converts this video sample to a VideoFrame for use with the WebCodecs API. The VideoFrame returned by this method *must* be closed separately from this video sample.

### `draw()`

```
draw(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	dx: number,
	dy: number,
	dWidth?: number,
	dHeight?: number,
): void;
```

Draws the video sample to a 2D canvas context. Rotation metadata will be taken into account.

**Parameters:**

- **dx**: The x-coordinate in the destination canvas at which to place the top-left corner of the source image.
- **dy**: The y-coordinate in the destination canvas at which to place the top-left corner of the source image.
- **dWidth**: The width in pixels with which to draw the image in the destination canvas.
- **dHeight**: The height in pixels with which to draw the image in the destination canvas.

### `draw()`

```
draw(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	sx: number,
	sy: number,
	sWidth: number,
	sHeight: number,
	dx: number,
	dy: number,
	dWidth?: number,
	dHeight?: number,
): void;
```

Draws the video sample to a 2D canvas context. Rotation metadata will be taken into account.

**Parameters:**

- **sx**: The x-coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
- **sy**: The y-coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context.
- **sWidth**: The width of the sub-rectangle of the source image to draw into the destination context.
- **sHeight**: The height of the sub-rectangle of the source image to draw into the destination context.
- **dx**: The x-coordinate in the destination canvas at which to place the top-left corner of the source image.
- **dy**: The y-coordinate in the destination canvas at which to place the top-left corner of the source image.
- **dWidth**: The width in pixels with which to draw the image in the destination canvas.
- **dHeight**: The height in pixels with which to draw the image in the destination canvas.

### `drawWithFit()`

```
drawWithFit(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	options: {
		/**
		 * Controls the fitting algorithm.
		 *
		 * - 'fill' will stretch the image to fill the entire box, potentially altering aspect ratio.
		 * - 'contain' will contain the entire image within the box while preserving aspect ratio. This may lead to
		 * letterboxing.
		 * - 'cover' will scale the image until the entire box is filled, while preserving aspect ratio.
		 */
		fit: 'fill' | 'contain' | 'cover';
		/** A way to override rotation. Defaults to the rotation of the sample. */
		rotation?: Rotation;
		/**
		 * Specifies the rectangular region of the video sample to crop to. The crop region will automatically be
		 * clamped to the dimensions of the video sample. Cropping is performed after rotation but before resizing.
		 */
		crop?: CropRectangle;
	},
): void;
```

Draws the sample in the middle of the canvas corresponding to the context with the specified fit behavior.

See Rotation and CropRectangle.

### `toCanvasImageSource()`

```
toCanvasImageSource(): VideoFrame | OffscreenCanvas;
```

Converts this video sample to a CanvasImageSource for drawing to a canvas.

You must use the value returned by this method immediately, as any VideoFrame created internally will automatically be closed in the next microtask.

### `setRotation()`

```
setRotation(
	newRotation: Rotation,
): void;
```

Sets the rotation metadata of this video sample.

See Rotation.

### `setTimestamp()`

```
setTimestamp(
	newTimestamp: number,
): void;
```

Sets the presentation timestamp of this video sample, in seconds.

### `setDuration()`

```
setDuration(
	newDuration: number,
): void;
```

Sets the duration of this video sample, in seconds.

### `[Symbol.dispose]()`

```
[Symbol.dispose](): void;
```

Calls .close().