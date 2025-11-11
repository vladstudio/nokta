---
url: https://mediabunny.dev/api/PacketRetrievalOptions
title: PacketRetrievalOptions | Mediabunny
---

# PacketRetrievalOptions | Mediabunny

# PacketRetrievalOptions

Additional options for controlling packet retrieval.

```
type PacketRetrievalOptions = {
	metadataOnly?: boolean;
	verifyKeyPackets?: boolean;
};
```

## Used by

-   getFirstPacket()
-   getKeyPacket()
-   getNextKeyPacket()
-   getNextPacket()
-   getPacket()
-   packets()

## Properties

### `metadataOnly`

```
metadataOnly?: boolean;
```

When set to `true`, only packet metadata (like timestamp) will be retrieved - the actual packet data will not be loaded.

### `verifyKeyPackets`

```
verifyKeyPackets?: boolean;
```

When set to true, key packets will be verified upon retrieval by looking into the packet's bitstream. If not enabled, the packet types will be determined solely by what's stored in the containing file and may be incorrect, potentially leading to decoder errors. Since determining a packet's actual type requires looking into its data, this option cannot be enabled together with `metadataOnly`.