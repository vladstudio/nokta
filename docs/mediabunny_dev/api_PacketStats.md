---
url: https://mediabunny.dev/api/PacketStats
title: PacketStats | Mediabunny
---

# PacketStats | Mediabunny

# PacketStats

Contains aggregate statistics about the encoded packets of a track.

```
type PacketStats = {
	packetCount: number;
	averagePacketRate: number;
	averageBitrate: number;
};
```

## Used by

-   `InputAudioTrack.computePacketStats()`
-   `InputTrack.computePacketStats()`
-   `InputVideoTrack.computePacketStats()`

## Properties

### `packetCount`

```
packetCount: number;
```

The total number of packets.

### `averagePacketRate`

```
averagePacketRate: number;
```

The average number of packets per second. For video tracks, this will equal the average frame rate (FPS).

### `averageBitrate`

```
averageBitrate: number;
```

The average number of bits per second.