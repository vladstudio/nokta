---
url: https://mediabunny.dev/api/AttachedImage
title: AttachedImage | Mediabunny
---

# AttachedImage | Mediabunny

# AttachedImage

An embedded image such as cover art, booklet scan, artwork or preview frame.

```ts
type AttachedImage = {
	data: Uint8Array;
	mimeType: string;
	kind: 'coverFront' | 'coverBack' | 'unknown';
	name?: string;
	description?: string;
};
```

## Used by

- [`MetadataTags.images`](./MetadataTags#images)

## Properties

### `data`

```ts
data: Uint8Array<ArrayBufferLike>;
```

The raw image data.

### `mimeType`

```ts
mimeType: string;
```

An RFC 6838 MIME type (e.g. image/jpeg, image/png, etc.)

### `kind`

```ts
kind: 'coverFront' | 'coverBack' | 'unknown';
```

The kind or purpose of the image.

### `name`

```ts
name?: string;
```

The name of the image file.

### `description`

```ts
description?: string;
```

A description of the image.