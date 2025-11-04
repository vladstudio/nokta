---
title: "An Intro To Indexes | TinyBase"
url: https://tinybase.org/guides/using-indexes/an-intro-to-indexes
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Indexes](/guides/using-indexes/)
-   [An Intro To Indexes](/guides/using-indexes/an-intro-to-indexes/)

This guide describes how the [`indexes`](/api/indexes/) module gives you the ability to create and track indexes based on the data in [`Store`](/api/the-essentials/creating-stores/store/) objects, and which allow you to look up and display filtered data quickly.

The main entry point to using the [`indexes`](/api/indexes/) module is the [`createIndexes`](/api/indexes/functions/creation/createindexes/) function, which returns a new [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object. That object in turn has methods that let you create new [`Index`](/api/indexes/type-aliases/concept/index/) definitions, access the content of those [`Indexes`](/api/indexes/interfaces/indexes/indexes/) directly, and register listeners for when they change.

### [The Basics](/guides/the-basics/)

An [`Index`](/api/indexes/type-aliases/concept/index/) comprises a map of [`Slice`](/api/indexes/type-aliases/concept/slice/) objects, keyed by [`Id`](/api/common/type-aliases/identity/id/). The [`Ids`](/api/common/type-aliases/identity/ids/) in a [`Slice`](/api/indexes/type-aliases/concept/slice/) represent [`Row`](/api/store/type-aliases/store/row/) objects from a [`Table`](/api/store/type-aliases/store/table/) that all have a derived string value in common, as described by the [`setIndexDefinition`](/api/indexes/interfaces/indexes/indexes/methods/configuration/setindexdefinition/) method. Those values are used as the key for each [`Slice`](/api/indexes/type-aliases/concept/slice/) in the overall [`Index`](/api/indexes/type-aliases/concept/index/) object.

This might be simpler to understand with an example: if a [`Table`](/api/store/type-aliases/store/table/) contains pets, each with a species, then an [`Index`](/api/indexes/type-aliases/concept/index/) could be configured to contain the [`Ids`](/api/common/type-aliases/identity/ids/) of each [`Row`](/api/store/type-aliases/store/row/), grouped into a [`Slice`](/api/indexes/type-aliases/concept/slice/) for each distinct species. In other words, this [`Table`](/api/store/type-aliases/store/table/):

```
{ // Store
  pets: {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
    cujo: {species: 'dog'},
  },
}
```

would conceptually become this [`Index`](/api/indexes/type-aliases/concept/index/):

```
{ // Indexes
  bySpecies: {
    dog: ['fido', 'cujo'],
    cat: ['felix'],
  },
}
```

This is for illustrative purposes: note that this resulting [`Index`](/api/indexes/type-aliases/concept/index/) structure is never an object literal like this: you would instead use the [`getSliceIds`](/api/indexes/interfaces/indexes/indexes/methods/getter/getsliceids/) method and the [`getSliceRowIds`](/api/indexes/interfaces/indexes/indexes/methods/getter/getslicerowids/) method to iterate through the it.

Here's a simple example to show such an [`Index`](/api/indexes/type-aliases/concept/index/) in action. The `pets` [`Table`](/api/store/type-aliases/store/table/) has three [`Row`](/api/store/type-aliases/store/row/) objects, each with a string `species` [`Cell`](/api/store/type-aliases/store/cell/). We create an [`Index`](/api/indexes/type-aliases/concept/index/) definition called `bySpecies` which groups them:

```
import {createIndexes, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //    cellId to index on
);

console.log(indexes.getSliceIds('bySpecies'));
// -> ['dog', 'cat']
console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['fido', 'cujo']
```

### [`Index`](/api/indexes/type-aliases/concept/index/) Reactivity

As with the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object, magic happens when the underlying data changes. The [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object efficiently takes care of tracking changes that will affect the [`Index`](/api/indexes/type-aliases/concept/index/) or the [`Slice`](/api/indexes/type-aliases/concept/slice/) arrays within it. A similar paradigm to that used on the [`Store`](/api/the-essentials/creating-stores/store/) is used to let you add a listener to the [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object. The listener fires when there's a change to the [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/) or a [`Slice`](/api/indexes/type-aliases/concept/slice/)'s content:

```
indexes.addSliceIdsListener('bySpecies', () => {
  console.log(indexes.getSliceIds('bySpecies'));
});
store.setRow('pets', 'lowly', {species: 'worm'});
// -> ['dog', 'cat', 'worm']

indexes.addSliceRowIdsListener('bySpecies', 'worm', () => {
  console.log(indexes.getSliceRowIds('bySpecies', 'worm'));
});
store.setRow('pets', 'smaug', {species: 'worm'});
// -> ['lowly', 'smaug']
```

You can set multiple [`Index`](/api/indexes/type-aliases/concept/index/) definitions on each [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object. However, a given [`Store`](/api/the-essentials/creating-stores/store/) can only have one [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object associated with it. So, as with the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object, if you call this function twice on the same [`Store`](/api/the-essentials/creating-stores/store/), your second call will return a reference to the [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object created by the first.

Let's next find out how to include [`Indexes`](/api/indexes/interfaces/indexes/indexes/) in a user interface in the [Building A UI With Indexes](/guides/using-indexes/building-a-ui-with-indexes/) guide.