---
title: "An Intro To Checkpoints | TinyBase"
url: https://tinybase.org/guides/using-checkpoints/an-intro-to-checkpoints
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Checkpoints](/guides/using-checkpoints/)
-   [An Intro To Checkpoints](/guides/using-checkpoints/an-intro-to-checkpoints/)

This guide describes how the [`checkpoints`](/api/checkpoints/) module gives you the ability to create and track changes to a [`Store`](/api/the-essentials/creating-stores/store/)'s data for the purposes of undo and redo functionality.

The main entry point to using the [`checkpoints`](/api/checkpoints/) module is the [`createCheckpoints`](/api/checkpoints/functions/creation/createcheckpoints/) function, which returns a new [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object. That object in turn has methods that let you set checkpoints, move between them (altering the underlying [`Store`](/api/the-essentials/creating-stores/store/) accordingly), and register listeners for when they change.

[`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) let you undo and redo both keyed value and tabular data changes.

### [The Basics](/guides/the-basics/)

Here's a simple example to show a [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object in action. The `fido` [`Row`](/api/store/type-aliases/store/row/) starts off with the `sold` [`Cell`](/api/store/type-aliases/store/cell/) set to `false`. We set a checkpoint when this field changes, and which then allows us to return later to that initial state.

```
import {createCheckpoints, createStore} from 'tinybase';

const store = createStore().setTables({pets: {fido: {sold: false}}});

const checkpoints = createCheckpoints(store);
console.log(checkpoints.getCheckpointIds());
// -> [[], '0', []]

store.setCell('pets', 'fido', 'sold', true);
checkpoints.addCheckpoint('sale');
console.log(checkpoints.getCheckpointIds());
// -> [['0'], '1', []]

checkpoints.goBackward();
console.log(store.getCell('pets', 'fido', 'sold'));
// -> false
console.log(checkpoints.getCheckpointIds());
// -> [[], '0', ['1']]
```

The [`getCheckpointIds`](/api/checkpoints/interfaces/checkpoints/checkpoints/methods/getter/getcheckpointids/) method deserves a quick explanation. It returns a [`CheckpointIds`](/api/checkpoints/type-aliases/identity/checkpointids/) array which has three parts:

-   The 'backward' checkpoint [`Ids`](/api/common/type-aliases/identity/ids/) that can be rolled backward to (in other words, the checkpoints in the undo stack for this [`Store`](/api/the-essentials/creating-stores/store/)). They are in chronological order with the oldest checkpoint at the start of the array.
-   The current checkpoint [`Id`](/api/common/type-aliases/identity/id/) of the [`Store`](/api/the-essentials/creating-stores/store/)'s state, or `undefined` if the current state has not been checkpointed.
-   The 'forward' checkpoint [`Ids`](/api/common/type-aliases/identity/ids/) that can be rolled forward to (in other words, the checkpoints in the redo stack for this [`Store`](/api/the-essentials/creating-stores/store/)). They are in chronological order with the newest checkpoint at the end of the array.

The [`goBackward`](/api/checkpoints/interfaces/checkpoints/checkpoints/methods/movement/gobackward/) method is only one of the ways to move around the checkpoint stack. The [`goForward`](/api/checkpoints/interfaces/checkpoints/checkpoints/methods/movement/goforward/) method lets you redo changes, and the [`goTo`](/api/checkpoints/interfaces/checkpoints/checkpoints/methods/movement/goto/) method lets you skip multiple checkpoints to undo or redo many changes at once.

### Checkpoint Reactivity

As with [`Metrics`](/api/metrics/interfaces/metrics/metrics/), [`Indexes`](/api/indexes/interfaces/indexes/indexes/), and [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects, you can add a listener to the [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object for whenever the checkpoint stack changes:

```
const listenerId = checkpoints.addCheckpointIdsListener(() => {
  console.log(checkpoints.getCheckpointIds());
});
store.setCell('pets', 'fido', 'species', 'dog');
// -> [['0'], undefined, []]
checkpoints.addCheckpoint();
// -> [['0'], '2', []]

checkpoints.delListener(listenerId);
```

Also note that when a new change is layered onto the original state, the previous redo of checkpoint '1' is now not available.

A given [`Store`](/api/the-essentials/creating-stores/store/) can only have one [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object associated with it. If you call this function twice on the same [`Store`](/api/the-essentials/creating-stores/store/), your second call will return a reference to the [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object created by the first.

Finally, let's find out how to include checkpoints in a user interface in the [Building A UI With Checkpoints](/guides/using-checkpoints/building-a-ui-with-checkpoints/) guide.