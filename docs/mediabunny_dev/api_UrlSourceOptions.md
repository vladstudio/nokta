---
url: https://mediabunny.dev/api/UrlSourceOptions
title: UrlSourceOptions | Mediabunny
---

# UrlSourceOptions | Mediabunny

# UrlSourceOptions

Options for `UrlSource`.

```
type UrlSourceOptions = {
	requestInit?: RequestInit;
	getRetryDelay?: (previousAttempts: number, error: unknown, url: string | URL | Request) => number | null;
	maxCacheSize?: number;
	fetchFn?: typeof fetch;
};
```

## Used by

-   `new UrlSource()`

## Properties

### `requestInit`

The `RequestInit` used by the Fetch API. Can be used to further control the requests, such as setting custom headers.

### `getRetryDelay`

A function that returns the delay (in seconds) before retrying a failed request. The function is called with the number of previous, unsuccessful attempts, as well as with the error with which the previous request failed. If the function returns `null`, no more retries will be made.

By default, it uses an exponential backoff algorithm that never gives up unless a CORS error is suspected (`fetch()` did reject, `navigator.onLine` is true and origin is different)

### `maxCacheSize`

The maximum number of bytes the cache is allowed to hold in memory. Defaults to 64 MiB.

### `fetchFn`

A WHATWG-compatible fetch function. You can use this field to polyfill the `fetch` function, add missing features, or use a custom implementation.