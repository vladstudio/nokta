---
title: "Creating A Store | TinyBase"
url: https://tinybase.org/guides/the-basics/creating-a-store
---

This guide shows you how to create a new [`Store`](/api/the-essentials/creating-stores/store/).

Creating a [`Store`](/api/the-essentials/creating-stores/store/) requires just a simple call to the [`createStore`](/api/the-essentials/creating-stores/createstore/) function from the [`store`](/api/store/) module.

```
import {createStore} from 'tinybase';

const store = createStore();
```

Easy enough! The returned [`Store`](/api/the-essentials/creating-stores/store/) starts off empty of course:

```
console.log(store.getValues());
// -> {}

console.log(store.getTables());
// -> {}
```

To fix that, let's move onto the [Writing To Stores](/guides/the-basics/writing-to-stores/) guide.