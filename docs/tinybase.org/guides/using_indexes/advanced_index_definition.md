---
title: "Advanced Index Definition | TinyBase"
url: https://tinybase.org/guides/using-indexes/advanced-index-definition
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Indexes](/guides/using-indexes/)
-   [Advanced Index Definition](/guides/using-indexes/advanced-index-definition/)

This guide describes how the [`indexes`](/api/indexes/) module let you create more complex types of indexes based on the data in [`Store`](/api/the-essentials/creating-stores/store/) objects.

### Custom Sorting

As well as indicating what the [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/) in the [`Index`](/api/indexes/type-aliases/concept/index/) should be, based on a [`Cell`](/api/store/type-aliases/store/cell/) value in each [`Row`](/api/store/type-aliases/store/row/), you can also indicate how the [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) will be sorted inside each [`Slice`](/api/indexes/type-aliases/concept/slice/). For example, here the members of each species are sorted by weight, by specifying that CellId in the fourth parameter:

```
import {createIndexes, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', weight: 42},
  felix: {species: 'cat', weight: 13},
  cujo: {species: 'dog', weight: 37},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index
  'weight', //    cellId to sort by
);

console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['cujo', 'fido']
```

With a further fifth and sixth parameter, you can also indicate how the [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/) (and the Rows within them) should be sorted. These two parameters take a 'sorter' function (much like JavaScript's own array `sort` method) which compares pairs of values. For example, to order the species Slices alphabetically, and the animals in each species in _reverse_ weight order:

```
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index
  'weight', //    cellId to sort by
  (id1, id2) => (id1 < id2 ? -1 : 1), // Slices in alphabetical order
  (id1, id2) => (id1 > id2 ? -1 : 1), // Rows in reverse numerical order
);

console.log(indexes.getSliceIds('bySpecies'));
// -> ['cat', 'dog']
console.log(indexes.getSliceRowIds('bySpecies', 'dog'));
// -> ['fido', 'cujo']
```

Note that you can use the [`defaultSorter`](/api/common/functions/convenience/defaultsorter/) function from the [`common`](/api/common/) module (which is literally equivalent to `(id1, id2) => (id1 < id2 ? -1 : 1)`) if all you want to do is sort something alphanumerically.

Sorting is used in the [Countries](/demos/countries/) demo to sort both the [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/) (the first letters of the alphabet) and the [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) (the country names) within them.

### Getting Custom [`Values`](/api/store/type-aliases/store/values/) From Rows

By default, our [`Index`](/api/indexes/type-aliases/concept/index/) definitions have named a [`Cell`](/api/store/type-aliases/store/cell/) in the [`Row`](/api/store/type-aliases/store/row/) which contains the string to use as the [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Id`](/api/common/type-aliases/identity/id/) - like the `species` [`Cell`](/api/store/type-aliases/store/cell/) in the example above. Sometimes you may wish to derive a [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Id`](/api/common/type-aliases/identity/id/) for each [`Row`](/api/store/type-aliases/store/row/) that is not in a single [`Cell`](/api/store/type-aliases/store/cell/), and in this case you can replace the third parameter with a function which can process the [`Row`](/api/store/type-aliases/store/row/) in any way you wish.

For example, we could group our pets into 'heavy' and 'light' Slices, based on the range that the `weight` [`Cell`](/api/store/type-aliases/store/cell/) lies in.:

```
indexes.setIndexDefinition(
  'byWeightRange', //                                           indexId
  'pets', //                                                    tableId to index
  (getCell) => (getCell('weight') > 40 ? 'heavy' : 'light'), // => sliceId
);

console.log(indexes.getSliceIds('byWeightRange'));
// -> ['heavy', 'light']
console.log(indexes.getSliceRowIds('byWeightRange', 'light'));
// -> ['felix', 'cujo']
```

You can also provide a function for the key to sort entries by. This sorts animal [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/), heaviest first, in each [`Slice`](/api/indexes/type-aliases/concept/slice/):

```
indexes.setIndexDefinition(
  'byWeightRange', //                                           indexId
  'pets', //                                                    tableId to index
  (getCell) => (getCell('weight') > 40 ? 'heavy' : 'light'), // => sliceId
  (getCell) => -getCell('weight'), //                           => sort key
);

console.log(indexes.getSliceRowIds('byWeightRange', 'light'));
// -> ['cujo', 'felix']
```

And with that, we have covered most of the basics of using the [`indexes`](/api/indexes/) module. Let's move on to a very similar module for creating relationships between data in the [Using Relationships](/guides/using-relationships/) guide.