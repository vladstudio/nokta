---
url: https://mediabunny.dev/api/SetRequired
title: SetRequired | Mediabunny
---

# SetRequired | Mediabunny

SetRequired

# SetRequired

Sets all keys K of T to be required.

```
type SetRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

## Used by

- `new VideoSample()`