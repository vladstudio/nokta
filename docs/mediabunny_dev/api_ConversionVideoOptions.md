---
url: https://mediabunny.dev/api/ConversionVideoOptions
title: ConversionVideoOptions | Mediabunny
---

# ConversionVideoOptions | Mediabunny

# ConversionVideoOptions

Video-specific options.

```ts
type ConversionVideoOptions = {
	discard?: boolean;
	width?: number;
	height?: number;
	fit?: 'fill' | 'contain' | 'cover';
	rotate?: Rotation;
	crop?: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	frameRate?: number;
	codec?: VideoCodec;
	bitrate?: number | Quality;
	alpha?: 'discard' | 'keep';
	keyFrameInterval?: number;
	forceTranscode?: boolean;
	process?: (sample: VideoSample) => MaybePromise<
		CanvasImageSource | VideoSample | (CanvasImageSource | VideoSample)[] | null
	>;
	processedWidth?: number;
	processedHeight?: number;
};
```

See [`Rotation`](./Rotation), [`VideoCodec`](./VideoCodec), [`Quality`](./Quality), [`VideoSample`](./VideoSample), and [`MaybePromise`](./MaybePromise).

## Used by

-   [`ConversionOptions.video`](./ConversionOptions#video)

## Properties

### `discard`

If `true`, all video tracks will be discarded and will not be present in the output.

```ts
discard?: boolean;
```

### `width`

The desired width of the output video in pixels, defaulting to the video's natural display width. If height is not set, it will be deduced automatically based on aspect ratio.

```ts
width?: number;
```

### `height`

The desired height of the output video in pixels, defaulting to the video's natural display height. If width is not set, it will be deduced automatically based on aspect ratio.

```ts
height?: number;
```

### `fit`

The fitting algorithm in case both width and height are set, or if the input video changes its size over time.

-   `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
-   `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to letterboxing.
-   `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.

```ts
fit?: 'fill' | 'contain' | 'cover';
```

### `rotate`

The angle in degrees to rotate the input video by, clockwise. Rotation is applied before cropping and resizing. This rotation is *in addition to* the natural rotation of the input video as specified in input file's metadata.

See [`Rotation`](./Rotation).

```ts
rotate?: Rotation;
```

### `crop`

Specifies the rectangular region of the input video to crop to. The crop region will automatically be clamped to the dimensions of the input video track. Cropping is performed after rotation but before resizing.

```ts
crop?: { left: number; top: number; width: number; height: number; };
```

### `frameRate`

The desired frame rate of the output video, in hertz. If not specified, the original input frame rate will be used (which may be variable).

```ts
frameRate?: number;
```

### `codec`

The desired output video codec.

See [`VideoCodec`](./VideoCodec).

```ts
codec?: VideoCodec;
```

### `bitrate`

The desired bitrate of the output video.

See [`Quality`](./Quality).

```ts
bitrate?: number | Quality;
```

### `alpha`

Whether to discard or keep the transparency information of the input video. The default is `'discard'`. Note that for `'keep'` to produce a transparent video, you must use an output config that supports it, such as WebM with VP9.

```ts
alpha?: 'discard' | 'keep';
```

### `keyFrameInterval`

The interval, in seconds, of how often frames are encoded as a key frame. The default is 5 seconds. Frequent key frames improve seeking behavior but increase file size. When using multiple video tracks, you should give them all the same key frame interval.

Setting this fields forces a transcode.

```ts
keyFrameInterval?: number;
```

### `forceTranscode`

When `true`, video will always be re-encoded instead of directly copying over the encoded samples.

```ts
forceTranscode?: boolean;
```

### `process`

Allows for custom user-defined processing of video frames, e.g. for applying overlays, color transformations, or timestamp modifications. Will be called for each input video sample after transformations and frame rate corrections.

Must return a [`VideoSample`](./VideoSample) or a `CanvasImageSource`, an array of them, or `null` for dropping the frame. When non-timestamped data is returned, the timestamp and duration from the source sample will be used.

This function can also be used to manually resize frames. When doing so, you should signal the post-process dimensions using the `processedWidth` and `processedHeight` fields, which enables the encoder to better know what to expect. If these fields aren't set, Mediabunny will assume you won't perform any resizing.

See [`VideoSample`](./VideoSample) and [`MaybePromise`](./MaybePromise).

```ts
process?: ((sample: VideoSample) => MaybePromise<VideoSample | CanvasImageSource | (VideoSample | CanvasImageSource)[] | null>);
```

### `processedWidth`

An optional hint specifying the width of video samples returned by the `process` function, for better encoder configuration.

```ts
processedWidth?: number;
```

### `processedHeight`

An optional hint specifying the height of video samples returned by the `process` function, for better encoder configuration.

```ts
processedHeight?: number;
```