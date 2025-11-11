---
url: https://mediabunny.dev/api/EncodedVideoPacketSource
title: EncodedVideoPacketSource | Mediabunny
---

# EncodedVideoPacketSource | Mediabunny

# EncodedVideoPacketSource

The most basic video source; can be used to directly pipe encoded packets into the output file.

**Extends:** `VideoSource`

## Constructor

Creates a new `EncodedVideoPacketSource` whose packets are encoded using `codec`.

See `VideoCodec`.

## Methods

### `add()`

Adds an encoded packet to the output video track. Packets must be added in *decode order*, while a packet's timestamp must be its *presentation timestamp*. B-frames are handled automatically.

**Parameters:**

-   **meta**: Additional metadata from the encoder. You should pass this for the first call, including a valid decoder config.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.

See `EncodedPacket`.