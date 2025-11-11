---
url: https://mediabunny.dev/api/VideoSampleInit
title: VideoSampleInit | Mediabunny
---

# VideoSampleInit | Mediabunny

# VideoSampleInit

Metadata used for VideoSample initialization.

```
type VideoSampleInit = {
	format?: VideoPixelFormat;
	codedWidth?: number;
	codedHeight?: number;
	rotation?: Rotation;
	timestamp?: number;
	duration?: number;
	colorSpace?: VideoColorSpaceInit;
};
```

See Rotation.

## Used by

- new VideoSample()

## Properties

### `format`

```
format?: VideoPixelFormat;
```

The internal pixel format in which the frame is stored. See pixel formats

### `codedWidth`

```
codedWidth?: number;
```

The width of the frame in pixels.

### `codedHeight`

```
codedHeight?: number;
```

The height of the frame in pixels.

### `rotation`

```
rotation?: Rotation;
```

The rotation of the frame in degrees, clockwise.

See Rotation.

### `timestamp`

```
timestamp?: number;
```

The presentation timestamp of the frame in seconds.

### `duration`

```
duration?: number;
```

The duration of the frame in seconds.

### `colorSpace`

```
colorSpace?: VideoColorSpaceInit;
```

The color space of the frame.