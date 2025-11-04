---
title: "An Intro To Relationships | TinyBase"
url: https://tinybase.org/guides/using-relationships/an-intro-to-relationships
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Relationships](/guides/using-relationships/)
-   [An Intro To Relationships](/guides/using-relationships/an-intro-to-relationships/)

This guide describes how the [`relationships`](/api/relationships/) module gives you the ability to create and track relationships between [`Row`](/api/store/type-aliases/store/row/) objects based on the data in a [`Store`](/api/the-essentials/creating-stores/store/).

The main entry point to using the [`relationships`](/api/relationships/) module is the [`createRelationships`](/api/relationships/functions/creation/createrelationships/) function, which returns a new [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object. That object in turn has methods that let you create new [`Relationship`](/api/relationships/type-aliases/concept/relationship/) definitions, access them directly, and register listeners for when they change.

### [The Basics](/guides/the-basics/)

Here's a simple example to show a [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object in action. The `pets` [`Table`](/api/store/type-aliases/store/table/) has three [`Row`](/api/store/type-aliases/store/row/) objects, each with a string `species` [`Cell`](/api/store/type-aliases/store/cell/), which act as a key into the [`Ids`](/api/common/type-aliases/identity/ids/) of the `species` [`Table`](/api/store/type-aliases/store/table/). We create a [`Relationship`](/api/relationships/type-aliases/concept/relationship/) definition called `petSpecies` which connects the two:

```
import {createRelationships, createStore} from 'tinybase';

const store = createStore()
  .setTable('pets', {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
    cujo: {species: 'dog'},
  })
  .setTable('species', {
    dog: {price: 5},
    cat: {price: 4},
  });

const relationships = createRelationships(store);
relationships.setRelationshipDefinition(
  'petSpecies', // relationshipId
  'pets', //       localTableId to link from
  'species', //    remoteTableId to link to
  'species', //    cellId containing remote key
);

console.log(relationships.getRemoteRowId('petSpecies', 'fido'));
// -> 'dog'
console.log(relationships.getLocalRowIds('petSpecies', 'dog'));
// -> ['fido', 'cujo']
```

The [`getRemoteRowId`](/api/relationships/interfaces/relationships/relationships/methods/getter/getremoterowid/) method allows you to traverse in the many-to-one direction: in other words for every [`Row`](/api/store/type-aliases/store/row/) in the local [`Table`](/api/store/type-aliases/store/table/) you can find out the one remote [`Row`](/api/store/type-aliases/store/row/) referenced. The [`getLocalRowIds`](/api/relationships/interfaces/relationships/relationships/methods/getter/getlocalrowids/) method is the reverse: for a remote [`Row`](/api/store/type-aliases/store/row/), it will return an array of the [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) in the local [`Table`](/api/store/type-aliases/store/table/) that reference it.

There is a special case when the local [`Table`](/api/store/type-aliases/store/table/) is the same as the remote [`Table`](/api/store/type-aliases/store/table/). This creates a 'linked list' of [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/). Specify from which you would like to start the list, and the [`getLinkedRowIds`](/api/relationships/interfaces/relationships/relationships/methods/getter/getlinkedrowids/) method will return the list:

```
store.setTable('pets', {
  fido: {species: 'dog', next: 'felix'},
  felix: {species: 'cat', next: 'cujo'},
  cujo: {species: 'dog'},
});

relationships.setRelationshipDefinition('petSequence', 'pets', 'pets', 'next');

console.log(relationships.getLinkedRowIds('petSequence', 'fido'));
// -> ['fido', 'felix', 'cujo']
console.log(relationships.getLinkedRowIds('petSequence', 'felix'));
// -> ['felix', 'cujo']
```

### [`Relationship`](/api/relationships/type-aliases/concept/relationship/) Reactivity

As with [`Metrics`](/api/metrics/interfaces/metrics/metrics/) and [`Indexes`](/api/indexes/interfaces/indexes/indexes/), [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects take care of tracking changes that will affect the [`Relationships`](/api/relationships/interfaces/relationships/relationships/). The familiar paradigm is used to let you add a listener to the [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object. The listener fires when there's a change to a [`Relationship`](/api/relationships/type-aliases/concept/relationship/):

```
const listenerId = relationships.addRemoteRowIdListener(
  'petSpecies',
  'cujo',
  () => {
    console.log(relationships.getRemoteRowId('petSpecies', 'cujo'));
  },
);
store.setCell('pets', 'cujo', 'species', 'wolf');
// -> 'wolf'
```

As expected, reactivity will also work for local and linked [`Row`](/api/store/type-aliases/store/row/) relationships (with the [`addLocalRowIdsListener`](/api/relationships/interfaces/relationships/relationships/methods/listener/addlocalrowidslistener/) method and [`addLinkedRowIdsListener`](/api/relationships/interfaces/relationships/relationships/methods/listener/addlinkedrowidslistener/) method respectively).

You can set multiple [`Relationship`](/api/relationships/type-aliases/concept/relationship/) definitions on each [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object. However, a given [`Store`](/api/the-essentials/creating-stores/store/) can only have one [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object associated with it. If you call this function twice on the same [`Store`](/api/the-essentials/creating-stores/store/), your second call will return a reference to the [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object created by the first.

Let's find out how to include relationships in a user interface in the [Building A UI With Relationships](/guides/using-relationships/building-a-ui-with-relationships/) guide.