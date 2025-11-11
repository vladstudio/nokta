---
url: https://mediabunny.dev/api/OutputOptions
title: OutputOptions | Mediabunny
---

# OutputOptions | Mediabunny

# OutputOptions

The options for creating an Output object.

```ts
type OutputOptions<F extends OutputFormat = OutputFormat, T extends Target = Target> = {
	format: F;
	target: T;
};
```

See [`OutputFormat`](./OutputFormat) and [`Target`](./Target).

## Used by

- [`new Output()`](./Output#constructor)

## Properties

### `format`

The format of the output file.

```ts
format: F;
```

### `target`

The target to which the file will be written.

```ts
target: T;
```