---
url: https://mediabunny.dev/api/CustomVideoDecoder
title: CustomVideoDecoder | Mediabunny
---

# CustomVideoDecoder | Mediabunny

# CustomVideoDecoder

Base class for custom video decoders. To add your own custom video decoder, extend this class, implement the abstract methods and static `supports` method, and register the decoder using `registerDecoder`.

## Used by

-   `registerDecoder()`

## Static methods

### `supports()`

```
static supports(
	codec: VideoCodec,
	config: VideoDecoderConfig,
): boolean;
```

Returns true if and only if the decoder can decode the given codec configuration.

See `VideoCodec`.

## Properties

### `codec`

```
readonly codec: VideoCodec;
```

The input video's codec.

See `VideoCodec`.

### `config`

```
readonly config: VideoDecoderConfig;
```

The input video's decoder config.

## Events

### `onSample`

```
readonly onSample: (sample: VideoSample) => unknown;
```

The callback to call when a decoded VideoSample is available.

See `VideoSample`.

## Methods

### `init()`

```
init(): MaybePromise<void>;
```

Called after decoder creation; can be used for custom initialization logic.

See `MaybePromise`.

### `decode()`

```
decode(
	packet: EncodedPacket,
): MaybePromise<void>;
```

Decodes the provided encoded packet.

See `EncodedPacket` and `MaybePromise`.

### `flush()`

```
flush(): MaybePromise<void>;
```

Decodes all remaining packets and then resolves.

See `MaybePromise`.

### `close()`

```
close(): MaybePromise<void>;
```

Called when the decoder is no longer needed and its resources can be freed.

See `MaybePromise`.