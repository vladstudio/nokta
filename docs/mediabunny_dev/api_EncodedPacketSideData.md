---
url: https://mediabunny.dev/api/EncodedPacketSideData
title: EncodedPacketSideData | Mediabunny
---

# EncodedPacketSideData | Mediabunny

# EncodedPacketSideData

Holds additional data accompanying an `EncodedPacket`.

## Used by

- `EncodedPacket.fromEncodedChunk()`
- `EncodedPacket.sideData`
- `new EncodedPacket()`

## Properties

### `alpha`

An encoded alpha frame, encoded with the same codec as the packet. Typically used for transparent videos, where the alpha information is stored separately from the color information.

### `alphaByteLength`

The actual byte length of the alpha data. This field is useful for metadata-only packets where the `alpha` field contains no bytes.