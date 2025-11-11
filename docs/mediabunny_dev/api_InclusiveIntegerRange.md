---
url: https://mediabunny.dev/api/InclusiveIntegerRange
title: InclusiveIntegerRange | Mediabunny
---

# InclusiveIntegerRange | Mediabunny

# InclusiveIntegerRange

Specifies an inclusive range of integers.

```
type InclusiveIntegerRange = {
	min: number;
	max: number;
};
```

## Used by

- [`TrackCountLimits.audio`](./TrackCountLimits#audio)
- [`TrackCountLimits.subtitle`](./TrackCountLimits#subtitle)
- [`TrackCountLimits.total`](./TrackCountLimits#total)
- [`TrackCountLimits.video`](./TrackCountLimits#video)

## Properties

### `min`

```
min: number;
```

The integer cannot be less than this.

### `max`

```
max: number;
```

The integer cannot be greater than this.