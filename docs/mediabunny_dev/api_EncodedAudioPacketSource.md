---
url: https://mediabunny.dev/api/EncodedAudioPacketSource
title: EncodedAudioPacketSource | Mediabunny
---

# EncodedAudioPacketSource | Mediabunny

# EncodedAudioPacketSource

The most basic audio source; can be used to directly pipe encoded packets into the output file.

**Extends:** `AudioSource`

## Constructor

Creates a new `EncodedAudioPacketSource` whose packets are encoded using `codec`.

See `AudioCodec`.

## Methods

### `add()`

Adds an encoded packet to the output audio track. Packets must be added in *decode order*.

**Parameters:**

-   **meta**: Additional metadata from the encoder. You should pass this for the first call, including a valid decoder config.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.

See `EncodedPacket`.