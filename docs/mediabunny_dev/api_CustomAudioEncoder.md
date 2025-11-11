---
url: https://mediabunny.dev/api/CustomAudioEncoder
title: CustomAudioEncoder | Mediabunny
---

# CustomAudioEncoder | Mediabunny

# CustomAudioEncoder

Base class for custom audio encoders. To add your own custom audio encoder, extend this class, implement the abstract methods and static `supports` method, and register the encoder using [registerEncoder](./registerEncoder).

## Used by

* [registerEncoder()](./registerEncoder)

## Static methods

### `supports()`

```
static supports(
	codec: AudioCodec,
	config: AudioEncoderConfig,
): boolean;
```

Returns true if and only if the encoder can encode the given codec configuration.

See [AudioCodec](./AudioCodec).

## Properties

### `codec`

```
readonly codec: AudioCodec;
```

The codec with which to encode the audio.

See [AudioCodec](./AudioCodec).

### `config`

```
readonly config: AudioEncoderConfig;
```

Config for the encoder.

## Events

### `onPacket`

```
readonly onPacket: (packet: EncodedPacket, meta?: EncodedAudioChunkMetadata) => unknown;
```

The callback to call when an EncodedPacket is available.

See [EncodedPacket](./EncodedPacket).

## Methods

### `init()`

```
init(): MaybePromise<void>;
```

Called after encoder creation; can be used for custom initialization logic.

See [MaybePromise](./MaybePromise).

### `encode()`

```
encode(
	audioSample: AudioSample,
): MaybePromise<void>;
```

Encodes the provided audio sample.

See [AudioSample](./AudioSample) and [MaybePromise](./MaybePromise).

### `flush()`

```
flush(): MaybePromise<void>;
```

Encodes all remaining audio samples and then resolves.

See [MaybePromise](./MaybePromise).

### `close()`

```
close(): MaybePromise<void>;
```

Called when the encoder is no longer needed and its resources can be freed.

See [MaybePromise](./MaybePromise).