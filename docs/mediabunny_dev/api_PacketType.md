---
url: https://mediabunny.dev/api/PacketType
title: PacketType | Mediabunny
---

# PacketType | Mediabunny

# PacketType

The type of a packet. Key packets can be decoded without previous packets, while delta packets depend on previous packets.

```
type PacketType = 
	| 'key'
	| 'delta';
```

## Used by

- `EncodedPacket.alphaToEncodedVideoChunk()`
- `EncodedPacket.type`
- `InputAudioTrack.determinePacketType()`
- `InputTrack.determinePacketType()`
- `InputVideoTrack.determinePacketType()`
- `new EncodedPacket()`