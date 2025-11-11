---
url: https://mediabunny.dev/api/CanvasSinkOptions
title: CanvasSinkOptions | Mediabunny
---

# CanvasSinkOptions | Mediabunny

# CanvasSinkOptions

Options for constructing a CanvasSink.

```ts
type CanvasSinkOptions = {
	alpha?: boolean;
	width?: number;
	height?: number;
	fit?: 'fill' | 'contain' | 'cover';
	rotation?: Rotation;
	crop?: CropRectangle;
	poolSize?: number;
};
```

See [`Rotation`](./Rotation) and [`CropRectangle`](./CropRectangle).

## Used by

- [`new CanvasSink()`](./CanvasSink#constructor)

## Properties

### `alpha`

```ts
alpha?: boolean;
```

Whether the output canvases should have transparency instead of a black background. Defaults to `false`. Set this to `true` when using this sink to read transparent videos.

### `width`

```ts
width?: number;
```

The width of the output canvas in pixels, defaulting to the display width of the video track. If height is not set, it will be deduced automatically based on aspect ratio.

### `height`

```ts
height?: number;
```

The height of the output canvas in pixels, defaulting to the display height of the video track. If width is not set, it will be deduced automatically based on aspect ratio.

### `fit`

```ts
fit?: 'fill' | 'contain' | 'cover';
```

The fitting algorithm in case both width and height are set.

-   `'fill'` will stretch the image to fill the entire box, potentially altering aspect ratio.
-   `'contain'` will contain the entire image within the box while preserving aspect ratio. This may lead to letterboxing.
-   `'cover'` will scale the image until the entire box is filled, while preserving aspect ratio.

### `rotation`

```ts
rotation?: Rotation;
```

The clockwise rotation by which to rotate the raw video frame. Defaults to the rotation set in the file metadata. Rotation is applied before resizing.

See [`Rotation`](./Rotation).

### `crop`

```ts
crop?: CropRectangle;
```

Specifies the rectangular region of the input video to crop to. The crop region will automatically be clamped to the dimensions of the input video track. Cropping is performed after rotation but before resizing.

See [`CropRectangle`](./CropRectangle).

### `poolSize`

```ts
poolSize?: number;
```

When set, specifies the number of canvases in the pool. These canvases will be reused in a ring buffer / round-robin type fashion. This keeps the amount of allocated VRAM constant and relieves the browser from constantly allocating/deallocating canvases. A pool size of 0 or `undefined` disables the pool and means a new canvas is created each time.