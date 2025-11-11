---
url: https://mediabunny.dev/api/EncodedPacketSink
title: EncodedPacketSink | Mediabunny
---

# EncodedPacketSink | Mediabunny

# EncodedPacketSink

Sink for retrieving encoded packets from an input track.

## Constructor

Creates a new `EncodedPacketSink` for the given `InputTrack`.

## Methods

### `getFirstPacket()`

Retrieves the track's first packet (in decode order), or null if it has no packets. The first packet is very likely to be a key packet.

See `PacketRetrievalOptions` and `EncodedPacket`.

### `getPacket()`

Retrieves the packet corresponding to the given timestamp, in seconds. More specifically, returns the last packet (in presentation order) with a start timestamp less than or equal to the given timestamp. This method can be used to retrieve a track's last packet using `getPacket(Infinity)`. The method returns null if the timestamp is before the first packet in the track.

**Parameters:**

-   **timestamp**: The timestamp used for retrieval, in seconds.

See `PacketRetrievalOptions` and `EncodedPacket`.

### `getNextPacket()`

Retrieves the packet following the given packet (in decode order), or null if the given packet is the last packet.

See `EncodedPacket` and `PacketRetrievalOptions`.

### `getKeyPacket()`

Retrieves the key packet corresponding to the given timestamp, in seconds. More specifically, returns the last key packet (in presentation order) with a start timestamp less than or equal to the given timestamp. A key packet is a packet that doesn't require previous packets to be decoded. This method can be used to retrieve a track's last key packet using `getKeyPacket(Infinity)`. The method returns null if the timestamp is before the first key packet in the track.

To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.

**Parameters:**

-   **timestamp**: The timestamp used for retrieval, in seconds.

See `PacketRetrievalOptions` and `EncodedPacket`.

### `getNextKeyPacket()`

Retrieves the key packet following the given packet (in decode order), or null if the given packet is the last key packet.

To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.

See `EncodedPacket` and `PacketRetrievalOptions`.

### `packets()`

Creates an async iterator that yields the packets in this track in decode order. To enable fast iteration, this method will intelligently preload packets based on the speed of the consumer.

**Parameters:**

-   **startPacket**: (optional) The packet from which iteration should begin. This packet will also be yielded.
-   **endTimestamp**: (optional) The timestamp at which iteration should end. This packet will *not* be yielded.

See `EncodedPacket` and `PacketRetrievalOptions`.