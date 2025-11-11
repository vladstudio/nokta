---
url: https://mediabunny.dev/api/CustomVideoEncoder
title: CustomVideoEncoder | Mediabunny
---

# CustomVideoEncoder | Mediabunny

# CustomVideoEncoder

Base class for custom video encoders. To add your own custom video encoder, extend this class, implement the abstract methods and static `supports` method, and register the encoder using [`registerEncoder`](./registerEncoder).

## Used by

- [`registerEncoder()`](./registerEncoder)

## Static methods

### `supports()`

ts
```
static supports(
	codec: VideoCodec,
	config: VideoEncoderConfig,
): boolean;
```

Returns true if and only if the encoder can encode the given codec configuration.

See [`VideoCodec`](./VideoCodec).

## Properties

### `codec`

ts
```
readonly codec: VideoCodec;
```

The codec with which to encode the video.

See [`VideoCodec`](./VideoCodec).

### `config`

ts
```
readonly config: VideoEncoderConfig;
```

Config for the encoder.

## Events

### `onPacket`

ts
```
readonly onPacket: (packet: EncodedPacket, meta?: EncodedVideoChunkMetadata) => unknown;
```

The callback to call when an EncodedPacket is available.

See [`EncodedPacket`](./EncodedPacket).

## Methods

### `init()`

ts
```
init(): MaybePromise<void>;
```

Called after encoder creation; can be used for custom initialization logic.

See [`MaybePromise`](./MaybePromise).

### `encode()`

ts
```
encode(
	videoSample: VideoSample,
	options: VideoEncoderEncodeOptions,
): MaybePromise<void>;
```

Encodes the provided video sample.

See [`VideoSample`](./VideoSample) and [`MaybePromise`](./MaybePromise).

### `flush()`

ts
```
flush(): MaybePromise<void>;
```

Encodes all remaining video samples and then resolves.

See [`MaybePromise`](./MaybePromise).

### `close()`

ts
```
close(): MaybePromise<void>;
```

Called when the encoder is no longer needed and its resources can be freed.

See [`MaybePromise`](./MaybePromise).