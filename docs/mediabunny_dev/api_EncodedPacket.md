---
url: https://mediabunny.dev/api/EncodedPacket
title: EncodedPacket | Mediabunny
---

# EncodedPacket | Mediabunny

# EncodedPacket

Represents an encoded chunk of media. Mainly used as an expressive wrapper around WebCodecs API's [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) and [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk), but can also be used standalone.

## Used by

-   [`AudioEncodingConfig.onEncodedPacket`](./AudioEncodingConfig#onencodedpacket)
-   [`CustomAudioDecoder.decode()`](./CustomAudioDecoder#decode)
-   [`CustomAudioEncoder.onPacket`](./CustomAudioEncoder#onpacket)
-   [`CustomVideoDecoder.decode()`](./CustomVideoDecoder#decode)
-   [`CustomVideoEncoder.onPacket`](./CustomVideoEncoder#onpacket)
-   [`EncodedAudioPacketSource.add()`](./EncodedAudioPacketSource#add)
-   [`EncodedPacketSink.getFirstPacket()`](./EncodedPacketSink#getfirstpacket)
-   [`EncodedPacketSink.getKeyPacket()`](./EncodedPacketSink#getkeypacket)
-   [`EncodedPacketSink.getNextKeyPacket()`](./EncodedPacketSink#getnextkeypacket)
-   [`EncodedPacketSink.getNextPacket()`](./EncodedPacketSink#getnextpacket)
-   [`EncodedPacketSink.getPacket()`](./EncodedPacketSink#getpacket)
-   [`EncodedPacketSink.packets()`](./EncodedPacketSink#packets)
-   [`EncodedVideoPacketSource.add()`](./EncodedVideoPacketSource#add)
-   [`InputAudioTrack.determinePacketType()`](./InputAudioTrack#determinepackettype)
-   [`InputTrack.determinePacketType()`](./InputTrack#determinepackettype)
-   [`InputVideoTrack.determinePacketType()`](./InputVideoTrack#determinepackettype)
-   [`VideoEncodingConfig.onEncodedPacket`](./VideoEncodingConfig#onencodedpacket)

## Constructor

```
constructor(
	data: Uint8Array,
	type: PacketType,
	timestamp: number,
	duration: number,
	sequenceNumber: number = -1,
	byteLength?: number,
	sideData?: EncodedPacketSideData,
): EncodedPacket;
```

Creates a new `EncodedPacket` from raw bytes and timing information.

See [`PacketType`](./PacketType) and [`EncodedPacketSideData`](./EncodedPacketSideData).

## Static methods

### `fromEncodedChunk()`

```
static fromEncodedChunk(
	chunk: EncodedVideoChunk | EncodedAudioChunk,
	sideData?: EncodedPacketSideData,
): EncodedPacket;
```

Creates an `EncodedPacket` from an [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful for converting chunks from the WebCodecs API to `EncodedPacket` instances.

See [`EncodedPacketSideData`](./EncodedPacketSideData).

## Properties

### `byteLength`

```
readonly byteLength: number;
```

The actual byte length of the data in this packet. This field is useful for metadata-only packets where the `data` field contains no bytes.

### `data`

```
readonly data: Uint8Array;
```

The encoded data of this packet.

### `duration`

```
readonly duration: number;
```

The duration of this packet in seconds.

### `isMetadataOnly`

```
get isMetadataOnly(): boolean;
```

If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the result of retrieving packets with [`metadataOnly`](./PacketRetrievalOptions#metadataonly) set to `true`.

### `microsecondDuration`

```
get microsecondDuration(): number;
```

The duration of this packet in microseconds.

### `microsecondTimestamp`

```
get microsecondTimestamp(): number;
```

The timestamp of this packet in microseconds.

### `sequenceNumber`

```
readonly sequenceNumber: number;
```

The sequence number indicates the decode order of the packets. Packet A must be decoded before packet B if A has a lower sequence number than B. If two packets have the same sequence number, they are the same packet. Otherwise, sequence numbers are arbitrary and are not guaranteed to have any meaning besides their relative ordering. Negative sequence numbers mean the sequence number is undefined.

### `sideData`

```
readonly sideData: EncodedPacketSideData;
```

Additional data carried with this packet.

See [`EncodedPacketSideData`](./EncodedPacketSideData).

### `timestamp`

```
readonly timestamp: number;
```

The presentation timestamp of this packet in seconds. May be negative. Samples with negative end timestamps should not be presented.

### `type`

```
readonly type: PacketType;
```

The type of this packet.

See [`PacketType`](./PacketType).

## Methods

### `toEncodedVideoChunk()`

```
toEncodedVideoChunk(): EncodedVideoChunk;
```

Converts this packet to an [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the WebCodecs API.

### `alphaToEncodedVideoChunk()`

```
alphaToEncodedVideoChunk(
	type: PacketType = this.type,
): EncodedVideoChunk;
```

Converts this packet to an [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.

See [`PacketType`](./PacketType).

### `toEncodedAudioChunk()`

```
toEncodedAudioChunk(): EncodedAudioChunk;
```

Converts this packet to an [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the WebCodecs API.

### `clone()`

```
clone(
	options?: {
		/** The timestamp of the cloned packet in seconds. */
		timestamp?: number;
		/** The duration of the cloned packet in seconds. */
		duration?: number;
	},
): EncodedPacket;
```

Clones this packet while optionally updating timing information.