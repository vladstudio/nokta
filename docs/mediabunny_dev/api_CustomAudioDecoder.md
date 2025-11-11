---
url: https://mediabunny.dev/api/CustomAudioDecoder
title: CustomAudioDecoder | Mediabunny
---

# CustomAudioDecoder | Mediabunny

CustomAudioDecoder | Mediabunny

Abstract class

# CustomAudioDecoder

Base class for custom audio decoders. To add your own custom audio decoder, extend this class, implement the abstract methods and static `supports` method, and register the decoder using `registerDecoder`.

## Used by

- `registerDecoder()`

## Static methods

### `supports()`

```
static supports(
	codec: AudioCodec,
	config: AudioDecoderConfig,
): boolean;
```

Returns true if and only if the decoder can decode the given codec configuration.

See `AudioCodec`.

## Properties

### `codec`

```
readonly codec: AudioCodec;
```

The input audio's codec.

See `AudioCodec`.

### `config`

```
readonly config: AudioDecoderConfig;
```

The input audio's decoder config.

## Events

### `onSample`

```
readonly onSample: (sample: AudioSample) => unknown;
```

The callback to call when a decoded AudioSample is available.

See `AudioSample`.

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