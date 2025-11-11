---
url: https://mediabunny.dev/api/InputAudioTrack
title: InputAudioTrack | Mediabunny
---

# InputAudioTrack | Mediabunny

# InputAudioTrack

Represents an audio track in an input file.

**Extends:** [`InputTrack`](./InputTrack)

## Used by

- [`ConversionOptions.audio`](./ConversionOptions#audio)
- [`Input.getAudioTracks()`](./Input#getaudiotracks)
- [`Input.getPrimaryAudioTrack()`](./Input#getprimaryaudiotrack)
- [`new AudioBufferSink()`](./AudioBufferSink#constructor)
- [`new AudioSampleSink()`](./AudioSampleSink#constructor)

## Properties

### `codec`

ts
```
get codec(): AudioCodec | null;
```

The codec of the track's packets.

See [`AudioCodec`](./AudioCodec).

### `id`

ts
```
get id(): number;
```

The unique ID of this track in the input file.

### `input`

ts
```
readonly input: Input;
```

The input file this track belongs to.

See [`Input`](./Input).

### `internalCodecId`

ts
```
get internalCodecId(): string | number | Uint8Array<ArrayBufferLike> | null;
```

The identifier of the codec used internally by the container. It is not homogenized by Mediabunny and depends entirely on the container format.

This field can be used to determine the codec of a track in case Mediabunny doesn't know that codec.

-   For ISOBMFF files, this field returns the name of the Sample Description Box (e.g. `'avc1'`).
-   For Matroska files, this field returns the value of the `CodecID` element.
-   For WAVE files, this field returns the value of the format tag in the `'fmt '` chunk.
-   For ADTS files, this field contains the `MPEG-4 Audio Object Type`.
-   In all other cases, this field is `null`.

### `languageCode`

ts
```
get languageCode(): string;
```

The ISO 639-2/T language code for this track. If the language is unknown, this field is `'und'` (undetermined).

### `name`

ts
```
get name(): string | null;
```

A user-defined name for this track.

### `numberOfChannels`

ts
```
get numberOfChannels(): number;
```

The number of audio channels in the track.

### `sampleRate`

ts
```
get sampleRate(): number;
```

The track's audio sample rate in hertz.

### `timeResolution`

ts
```
get timeResolution(): number;
```

A positive number x such that all timestamps and durations of all packets of this track are integer multiples of 1/x.

### `type`

ts
```
get type(): TrackType;
```

The type of the track.

See [`TrackType`](./TrackType).

## Methods

### `getDecoderConfig()`

ts
```
getDecoderConfig(): Promise<AudioDecoderConfig | null>;
```

Returns the [decoder configuration](https://www.w3.org/TR/webcodecs/#audio-decoder-config) for decoding the track's packets using an [`AudioDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/AudioDecoder). Returns null if the track's codec is unknown.

### `getCodecParameterString()`

ts
```
getCodecParameterString(): Promise<string | null>;
```

Returns the full codec parameter string for this track.

### `canDecode()`

ts
```
canDecode(): Promise<boolean>;
```

Checks if this track's packets can be decoded by the browser.

### `determinePacketType()`

ts
```
determinePacketType(
	packet: EncodedPacket,
): Promise<PacketType | null>;
```

For a given packet of this track, this method determines the actual type of this packet (key/delta) by looking into its bitstream. Returns null if the type couldn't be determined.

See [`EncodedPacket`](./EncodedPacket) and [`PacketType`](./PacketType).

### `isVideoTrack()`

ts
```
isVideoTrack(): boolean;
```

Returns true if and only if this track is a video track.

### `isAudioTrack()`

ts
```
isAudioTrack(): boolean;
```

Returns true if and only if this track is an audio track.

### `getFirstTimestamp()`

ts
```
getFirstTimestamp(): Promise<number>;
```

Returns the start timestamp of the first packet of this track, in seconds. While often near zero, this value may be positive or even negative. A negative starting timestamp means the track's timing has been offset. Samples with a negative timestamp should not be presented.

### `computeDuration()`

ts
```
computeDuration(): Promise<number>;
```

Returns the end timestamp of the last packet of this track, in seconds.

### `computePacketStats()`

ts
```
computePacketStats(
	targetPacketCount: number = Infinity,
): Promise<PacketStats>;
```

Computes aggregate packet statistics for this track, such as average packet rate or bitrate.

**Parameters:**

-   **targetPacketCount**: This optional parameter sets a target for how many packets this method must have looked at before it can return early; this means, you can use it to aggregate only a subset (prefix) of all packets. This is very useful for getting a great estimate of video frame rate without having to scan through the entire file.

See [`PacketStats`](./PacketStats).