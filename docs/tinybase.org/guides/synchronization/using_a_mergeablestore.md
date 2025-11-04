---
title: "Using A MergeableStore | TinyBase"
url: https://tinybase.org/guides/synchronization/using-a-mergeablestore
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Synchronization](/guides/synchronization/)
-   [Using A MergeableStore](/guides/synchronization/using-a-mergeablestore/)

The basic building block of TinyBase's synchronization system is the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) interface.

### The Anatomy Of A [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/)

The [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) interface is a sub-type of the regular [`Store`](/api/the-essentials/creating-stores/store/) - and it shares its underlying implementation.

This means that if you want to add synchronization to your app, all of your existing calls to the [`Store`](/api/the-essentials/creating-stores/store/) methods will be unchanged - you just need to use the [`createMergeableStore`](/api/the-essentials/creating-stores/createmergeablestore/) function to instantiate it, instead of the classic [`createStore`](/api/the-essentials/creating-stores/createstore/) function.

```
import {createMergeableStore} from 'tinybase';

const store1 = createMergeableStore('store1');
store1.setCell('pets', 'fido', 'species', 'dog');

console.log(store1.getContent());
// -> [{pets: {fido: {species: 'dog'}}}, {}]
```

The difference, though, is that a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) records additional metadata as the data is changed so that potential conflicts between it and another instance can be reconciled. This metadata is intended to be opaque, but you can see it if you call the [`getMergeableContent`](/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/getter/getmergeablecontent/) method:

```
console.log(store1.getMergeableContent());
// ->
[
  [
    {
      pets: [
        {
          fido: [
            {species: ['dog', 'Nn1JUF-----FnHIC', 290599168]},
            '',
            2682656941,
          ],
        },
        '',
        2102515304,
      ],
    },
    '',
    3506229770,
  ],
  [{}, '', 0],
];
```

Without going into the detail of this, the main point to understand is that each update gets a timestamp, based on a hybrid logical clock (HLC), and a hash. As a result, TinyBase is able to understand which parts of the data have changed, and which changes are the most recent. The resulting 'last write wins' (LWW) approach allows the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) to act as a Conflict-Free Replicated Data Type (CRDT).

(Notice we provided an explicit `uniqueId` when we initialized the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/): this is not normally required, but here it just ensures the hashes in the example are deterministic).

We can of course, create a second [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) with different data:

```
const store2 = createMergeableStore();
store2.setCell('pets', 'felix', 'species', 'cat');
```

And now merge them together with the convenient [`merge`](/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/setter/merge/) method:

```
store1.merge(store2);

console.log(store1.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]

console.log(store2.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]
```

Magic!

This all said, it's very unlikely you will need to use the numerous extra methods available on a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) (compared to a [`Store`](/api/the-essentials/creating-stores/store/)) since most of them exist to support synchronization behind the scenes.

In general, you'll just use a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) in the same was as you would have used a [`Store`](/api/the-essentials/creating-stores/store/), and instead rely on the more approachable [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) API for synchronization. We'll discuss this next in the [Using A Synchronizer](/guides/synchronization/using-a-synchronizer/) guide.

## Persisting A [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/)

Once important thing that you need to be aware of is that a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) cannot currently be persisted by every type of [`Persister`](/api/the-essentials/persisting-stores/persister/) available to a regular [`Store`](/api/the-essentials/creating-stores/store/). This is partly because some are already designed to work with alternative third-party CRDT systems (like the [`YjsPersister`](/api/persister-yjs/interfaces/persister/yjspersister/) and [`AutomergePersister`](/api/persister-automerge/interfaces/persister/automergepersister/)), and partly because this extra metadata cannot be easily stored in a plain SQLite database.

The following [`Persister`](/api/the-essentials/persisting-stores/persister/) types _can_ be used to persist a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/):

The following database-oriented [`Persister`](/api/the-essentials/persisting-stores/persister/) types can be used to persist a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/), but _only_ in the 'JSON-serialization' mode:

The following database-oriented [`Persister`](/api/the-essentials/persisting-stores/persister/) types _cannot_ currently be used to persist a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/):

Next, let's see how to synchronize [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) objects together with the [`synchronizers`](/api/synchronizers/) module. Please continue on to the [Using A Synchronizer](/guides/synchronization/using-a-synchronizer/) guide.