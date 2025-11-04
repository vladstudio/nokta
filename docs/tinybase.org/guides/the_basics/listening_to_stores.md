---
title: "Listening To Stores | TinyBase"
url: https://tinybase.org/guides/the-basics/listening-to-stores
---

This guide shows you how to listen to changes in the data in a [`Store`](/api/the-essentials/creating-stores/store/).

By now, you'll have noticed that there are always consistent methods for each level of the [`Store`](/api/the-essentials/creating-stores/store/) hierarchy, and the way you register listeners is no exception:

-   Listen to [`Values`](/api/store/type-aliases/store/values/) with the [`addValuesListener`](/api/store/interfaces/store/store/methods/listener/addvalueslistener/) method.
-   Listen to [`Value`](/api/store/type-aliases/store/value/) [`Ids`](/api/common/type-aliases/identity/ids/) with the [`addValueIdsListener`](/api/store/interfaces/store/store/methods/listener/addvalueidslistener/) method.
-   Listen to a [`Value`](/api/store/type-aliases/store/value/) with the [`addValueListener`](/api/the-essentials/listening-for-changes/addvaluelistener/) method.

And for tabular data:

-   Listen to [`Tables`](/api/store/type-aliases/store/tables/) with the [`addTablesListener`](/api/store/interfaces/store/store/methods/listener/addtableslistener/) method.
-   Listen to [`Table`](/api/store/type-aliases/store/table/) [`Ids`](/api/common/type-aliases/identity/ids/) with the [`addTableIdsListener`](/api/store/interfaces/store/store/methods/listener/addtableidslistener/) method.
-   Listen to a [`Table`](/api/store/type-aliases/store/table/) with the [`addTableListener`](/api/store/interfaces/store/store/methods/listener/addtablelistener/) method.
-   Listen to Cells [`Ids`](/api/common/type-aliases/identity/ids/) across a [`Table`](/api/store/type-aliases/store/table/) with the [`addTableCellIdsListener`](/api/store/interfaces/store/store/methods/listener/addtablecellidslistener/) method.
-   Listen to [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) with the [`addRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addrowidslistener/) method.
-   Listen to sorted [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) with the [`addSortedRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/) method.
-   Listen to a [`Row`](/api/store/type-aliases/store/row/) with the [`addRowListener`](/api/the-essentials/listening-for-changes/addrowlistener/) method.
-   Listen to [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/) with the [`addCellIdsListener`](/api/store/interfaces/store/store/methods/listener/addcellidslistener/) method.
-   Listen to a [`Cell`](/api/store/type-aliases/store/cell/) with the [`addCellListener`](/api/the-essentials/listening-for-changes/addcelllistener/) method.

You can also listen to attempts to write invalid data to a [`Value`](/api/store/type-aliases/store/value/) with the [`addInvalidValueListener`](/api/store/interfaces/store/store/methods/listener/addinvalidvaluelistener/) method, and to a [`Cell`](/api/store/type-aliases/store/cell/) with the [`addInvalidCellListener`](/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener/) method.

Let's start with the simplest type of listener, addTablesListener, which listens to changes to any tabular data in the [`Store`](/api/the-essentials/creating-stores/store/). Firstly, let's set up some simple data:

```
import {createStore} from 'tinybase';

const store = createStore().setTables({
  pets: {fido: {species: 'dog'}},
  species: {dog: {price: 5}},
});
```

We can then use the [`addTablesListener`](/api/store/interfaces/store/store/methods/listener/addtableslistener/) method to register a function on the [`Store`](/api/the-essentials/creating-stores/store/) that will be called whenever the data in the [`Store`](/api/the-essentials/creating-stores/store/) changes:

```
const listenerId = store.addTablesListener(() =>
  console.log('Tables changed!'),
);
```

Let's test it out by updating a [`Cell`](/api/store/type-aliases/store/cell/) in the [`Store`](/api/the-essentials/creating-stores/store/):

```
store.setCell('species', 'dog', 'price', 6);
// -> 'Tables changed!'
```

The listener will be called, regardless of which type of setter method was used to make the change. But a change needs to have been made! If a setter method was used to no effect, the listener is not called:

```
store.setCell('pets', 'fido', 'species', 'dog');
// Since the data didn't actually change, the listener was not called.
```

It is important to note that by default, you can't mutate the [`Store`](/api/the-essentials/creating-stores/store/) with code inside a listener, and attempting to do so will fail silently. We cover how to mutate the [`Store`](/api/the-essentials/creating-stores/store/) from with in a listener (in order to adhere to a [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/), for example) in the [Mutating Data With Listeners](/guides/schemas/mutating-data-with-listeners/) guide.

### Cleaning Up Listeners

You will have noticed that the [`addTablesListener`](/api/store/interfaces/store/store/methods/listener/addtableslistener/) method didn't return a reference to the [`Store`](/api/the-essentials/creating-stores/store/) object (so you can't chain other methods after it), but an [`Id`](/api/common/type-aliases/identity/id/) representing the registration of that listener.

You can use that [`Id`](/api/common/type-aliases/identity/id/) to remove the listener at a later stage with the [`delListener`](/api/store/interfaces/store/store/methods/listener/dellistener/) method:

```
store.delListener(listenerId);
store.setCell('species', 'dog', 'price', 7);
// Listener has been unregistered and so is not called.
```

It's good habit to remove the listeners you are no longer using. Note that listener [`Ids`](/api/common/type-aliases/identity/ids/) are commonly re-used, so you have removed a listener with a given [`Id`](/api/common/type-aliases/identity/id/), don't try to use that [`Id`](/api/common/type-aliases/identity/id/) again.

### Listener Parameters

In the example above, we registered a listener that didn't take any parameters. However, all [`Store`](/api/the-essentials/creating-stores/store/) listeners are called with at least a reference to the [`Store`](/api/the-essentials/creating-stores/store/), and often a convenient `getCellChange` function that lets you inspect changes that might have happened:

```
const listenerId2 = store.addTablesListener((store, getCellChange) =>
  console.log(getCellChange('species', 'dog', 'price')),
);

store.setCell('species', 'dog', 'price', 8);
// -> [true, 7, 8]

store.delListener(listenerId2);
```

See the [`addTablesListener`](/api/store/interfaces/store/store/methods/listener/addtableslistener/) method documentation for more information on these parameters.

When you listen to changes down inside a [`Store`](/api/the-essentials/creating-stores/store/) (with more granular listeners), you will also be passed [`Id`](/api/common/type-aliases/identity/id/) parameters reflecting what changed.

For example, here we register a listener on the `fido` [`Row`](/api/store/type-aliases/store/row/) in the `pets` [`Table`](/api/store/type-aliases/store/table/):

```
const listenerId3 = store.addRowListener(
  'pets',
  'fido',
  (store, tableId, rowId) =>
    console.log(`${rowId} row in ${tableId} table changed`),
);

store.setCell('pets', 'fido', 'color', 'brown');
// -> 'fido row in pets table changed'

store.delListener(listenerId3);
```

When you register a [`CellListener`](/api/store/type-aliases/listener/celllistener/) listener with the [`addCellListener`](/api/the-essentials/listening-for-changes/addcelllistener/) method, that also receives parameters containing the old and new [`Cell`](/api/store/type-aliases/store/cell/) values.

### Wildcard Listeners

The fact that the listeners are passed parameters for what changed becomes very useful when you register wildcard listeners. These listen to changes at a particular part of the [`Store`](/api/the-essentials/creating-stores/store/) hierarchy but not necessarily to a specific object.

So for example, you can listen to changes to any [`Row`](/api/store/type-aliases/store/row/) in a given [`Table`](/api/store/type-aliases/store/table/). To wildcard what you want to listen to, simply use `null` in place of an [`Id`](/api/common/type-aliases/identity/id/) argument when you add a listener:

```
const listenerId4 = store.addRowListener(null, null, (store, tableId, rowId) =>
  console.log(`${rowId} row in ${tableId} table changed`),
);

store.setCell('pets', 'fido', 'color', 'walnut');
// -> 'fido row in pets table changed'

store.setCell('species', 'dog', 'price', '9');
// -> 'dog row in species table changed'

store.delListener(listenerId4);
```

You can intermingle wildcards and actual [`Id`](/api/common/type-aliases/identity/id/) values for any of the parameters. So, for example, you could listen to the [`Cell`](/api/store/type-aliases/store/cell/) values with a given [`Id`](/api/common/type-aliases/identity/id/) in any [`Row`](/api/store/type-aliases/store/row/) in a given [`Table`](/api/store/type-aliases/store/table/), and so on.

Note that you can't use the wildcard technique with the [`addSortedRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/) method. You must explicitly specify just one [`Table`](/api/store/type-aliases/store/table/), for performance reasons.

### Summary

We've now seen how to create a [`Store`](/api/the-essentials/creating-stores/store/), set data in it, read it back out, and set up listeners to detect whenever it changes. Finally we'll cover how to wrap multiple changes together, in the [Transactions](/guides/the-basics/transactions/) guide.