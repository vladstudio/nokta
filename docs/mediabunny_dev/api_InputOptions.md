---
url: https://mediabunny.dev/api/InputOptions
title: InputOptions | Mediabunny
---

# InputOptions | Mediabunny

# InputOptions

The options for creating an Input object.

```
type InputOptions<S extends Source = Source> = {
	formats: InputFormat[];
	source: S;
};
```

See [`InputFormat`](./InputFormat) and [`Source`](./Source).

## Used by

- [`new Input()`](./Input#constructor)

## Properties

### `formats`

```
formats: InputFormat[];
```

A list of supported formats. If the source file is not of one of these formats, then it cannot be read.

See [`InputFormat`](./InputFormat).

### `source`

```
source: S;
```

The source from which data will be read.