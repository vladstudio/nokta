---
title: "Advanced Relationship Definitions | TinyBase"
url: https://tinybase.org/guides/using-relationships/advanced-relationship-definitions
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Relationships](/guides/using-relationships/)
-   [Advanced Relationship Definitions](/guides/using-relationships/advanced-relationship-definitions/)

This guide describes how the [`relationships`](/api/relationships/) module let you create more complex types of relationships based on the data in [`Store`](/api/the-essentials/creating-stores/store/) objects.

By default, our [`Relationship`](/api/relationships/type-aliases/concept/relationship/) definitions have named a [`Cell`](/api/store/type-aliases/store/cell/) in the [`Row`](/api/store/type-aliases/store/row/) which contains the string to use as the [`Row`](/api/store/type-aliases/store/row/) [`Id`](/api/common/type-aliases/identity/id/) in the remote [`Table`](/api/store/type-aliases/store/table/) - like the `species` [`Cell`](/api/store/type-aliases/store/cell/) in the previous guides' examples.

Sometimes you may wish to derive a remote [`Row`](/api/store/type-aliases/store/row/) [`Id`](/api/common/type-aliases/identity/id/) for each [`Row`](/api/store/type-aliases/store/row/) that is not in a single [`Cell`](/api/store/type-aliases/store/cell/), and in this case you can replace the fourth parameter with a function which can process the [`Row`](/api/store/type-aliases/store/row/) in any way you wish.

For example, we could link our pets to a remote [`Table`](/api/store/type-aliases/store/table/) that is keyed off both color and species:

```
import {createRelationships, createStore} from 'tinybase';

const store = createStore()
  .setTable('pets', {
    fido: {species: 'dog', color: 'brown'},
    felix: {species: 'cat', color: 'black'},
    cujo: {species: 'dog', color: 'black'},
  })
  .setTable('species_color', {
    dog_brown: {price: 6},
    dog_black: {price: 5},
    cat_brown: {price: 4},
    cat_black: {price: 2},
  });

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petSpeciesColor', // relationshipId
  'pets', //            localTableId to link from
  'species_color', //   remote TableId to link to
  (getCell) => `${getCell('species')}_${getCell('color')}`, // => remote Row Id
);

console.log(relationships.getRemoteRowId('petSpeciesColor', 'fido'));
// -> 'dog_brown'
console.log(relationships.getLocalRowIds('petSpeciesColor', 'dog_black'));
// -> ['cujo']
```

And with that, we have covered most of the basics of using the [`relationships`](/api/relationships/) module.

Let's move on to keeping track of changes to your data in the [Using Checkpoints](/guides/relationships-and-checkpoints/using-checkpoints/) guide.