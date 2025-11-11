---
url: https://mediabunny.dev/api/CropRectangle
title: CropRectangle | Mediabunny
---

# CropRectangle | Mediabunny

# CropRectangle

Specifies the rectangular cropping region.

```ts
type CropRectangle = {
	left: number;
	top: number;
	width: number;
	height: number;
};
```

## Used by

- [`CanvasSinkOptions.crop`](./CanvasSinkOptions#crop)
- [`VideoSample.drawWithFit()`](./VideoSample#drawwithfit)

## Properties

### `left`

```ts
left: number;
```

The distance in pixels from the left edge of the source frame to the left edge of the crop rectangle.

### `top`

```ts
top: number;
```

The distance in pixels from the top edge of the source frame to the top edge of the crop rectangle.

### `width`

```ts
width: number;
```

The width in pixels of the crop rectangle.

### `height`

```ts
height: number;
```

The height in pixels of the crop rectangle.