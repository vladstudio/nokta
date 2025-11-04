---
title: "Reading From Stores | TinyBase"
url: https://tinybase.org/guides/the-basics/reading-from-stores
---

This guide shows you how to read data from a [`Store`](/api/the-essentials/creating-stores/store/).

While we're here, notice how the the [`createStore`](/api/the-essentials/creating-stores/createstore/) function and setter methods return the [`Store`](/api/the-essentials/creating-stores/store/) again, so we can easily instantiate it by chaining methods together:

```
import {createStore} from 'tinybase';

const store = createStore()
  .setValues({employees: 3, open: true})
  .setTables({
    pets: {fido: {species: 'dog'}},
    species: {dog: {price: 5}},
  });
```

To get the data out again, according to the level of the hierarchy that you want to get data for, you can use the [`getValues`](/api/store/interfaces/store/store/methods/getter/getvalues/) method, the [`getValue`](/api/the-essentials/getting-data/getvalue/) method, the [`getTables`](/api/store/interfaces/store/store/methods/getter/gettables/) method, the [`getTable`](/api/store/interfaces/store/store/methods/getter/gettable/) method, the [`getRow`](/api/the-essentials/getting-data/getrow/) method, or the [`getCell`](/api/the-essentials/getting-data/getcell/) method.

By now, this should be starting to look intuitive. (I hope so! If not, let me know!)

```
console.log(store.getValues());
// -> {employees: 3, open: true}

console.log(store.getValue('employees'));
// -> 3

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}

console.log(store.getTable('pets'));
// -> {fido: {species: 'dog'}}

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog'}

console.log(store.getCell('pets', 'fido', 'species'));
// -> 'dog'
```

It is worth noting that the return types of these methods are by value, not by reference. So if you manipulate the returned object, the [`Store`](/api/the-essentials/creating-stores/store/) is not updated:

```
const fido = store.getRow('pets', 'fido');
fido.color = 'brown';
console.log(fido);
// -> {species: 'dog', color: 'brown'}

console.log(store.getRow('pets', 'fido'));
// -> {species: 'dog'}
```

### Handling Non-Existent Data

The [`hasValue`](/api/store/interfaces/store/store/methods/getter/hasvalue/) method, the [`hasTable`](/api/store/interfaces/store/store/methods/getter/hastable/) method, the [`hasRow`](/api/store/interfaces/store/store/methods/getter/hasrow/) method, and the [`hasCell`](/api/store/interfaces/store/store/methods/getter/hascell/) method can be used to see whether a given object exists, without having to read it:

```
console.log(store.hasValue('website'));
// -> false

console.log(store.hasTable('customers'));
// -> false

console.log(store.hasRow('pets', 'fido'));
// -> true
```

When you try to access something that doesn't exist, you'll receive an `undefined` value for a [`Value`](/api/store/type-aliases/store/value/) or [`Cell`](/api/store/type-aliases/store/cell/), or an empty object:

```
console.log(store.getValue('website'));
// -> undefined

console.log(store.getTable('customers'));
// -> {}

console.log(store.getRow('pets', 'felix'));
// -> {}

console.log(store.getCell('pets', 'fido', 'color'));
// -> undefined
```

### Enumerating [`Ids`](/api/common/type-aliases/identity/ids/)

A [`Store`](/api/the-essentials/creating-stores/store/) contains [`Value`](/api/store/type-aliases/store/value/) and [`Table`](/api/store/type-aliases/store/table/) objects, keyed by [`Id`](/api/common/type-aliases/identity/id/). A [`Table`](/api/store/type-aliases/store/table/) contains [`Row`](/api/store/type-aliases/store/row/) objects, keyed by [`Id`](/api/common/type-aliases/identity/id/). And a [`Row`](/api/store/type-aliases/store/row/) contains [`Cell`](/api/store/type-aliases/store/cell/) objects, keyed by [`Id`](/api/common/type-aliases/identity/id/).

You can enumerate the [`Id`](/api/common/type-aliases/identity/id/) keys for each with the [`getValueIds`](/api/store/interfaces/store/store/methods/getter/getvalueids/) method, the [`getTableIds`](/api/store/interfaces/store/store/methods/getter/gettableids/) method, the [`getRowIds`](/api/store/interfaces/store/store/methods/getter/getrowids/) method, or the [`getCellIds`](/api/store/interfaces/store/store/methods/getter/getcellids/) method - each of which return arrays:

```
console.log(store.getValueIds());
// -> ['employees', 'open']

console.log(store.getTableIds());
// -> ['pets', 'species']

console.log(store.getRowIds('pets'));
// -> ['fido']

console.log(store.getCellIds('pets', 'fido'));
// -> ['species']
```

There is also the [`getSortedRowIds`](/api/store/interfaces/store/store/methods/getter/getsortedrowids/) method that lets you get the [`Ids`](/api/common/type-aliases/identity/ids/) sorted by a specific [`Cell`](/api/store/type-aliases/store/cell/) [`Id`](/api/common/type-aliases/identity/id/), and the [`getTableCellIds`](/api/store/interfaces/store/store/methods/getter/gettablecellids/) method that lets you get all the [`Ids`](/api/common/type-aliases/identity/ids/) used across a whole [`Table`](/api/store/type-aliases/store/table/).

Again, the return types of these methods are by value, not by reference. So if you manipulate the returned array, the [`Store`](/api/the-essentials/creating-stores/store/) is not updated:

```
const tableIds = store.getTableIds();
tableIds.pop();
console.log(tableIds);
// -> ['pets']

console.log(store.getTableIds());
// -> ['pets', 'species']
```

Finally, the [`forEachValue`](/api/store/interfaces/store/store/methods/iterator/foreachvalue/) method, the [`forEachTable`](/api/store/interfaces/store/store/methods/iterator/foreachtable/) method, the [`forEachRow`](/api/store/interfaces/store/store/methods/iterator/foreachrow/) method, and the [`forEachCell`](/api/store/interfaces/store/store/methods/iterator/foreachcell/) method each provide a convenient way to iterate over these objects and their children in turn:

```
store.forEachTable((tableId, forEachRow) => {
  console.log(tableId);
  forEachRow((rowId) => console.log(`- ${rowId}`));
});
// -> 'pets'
// -> '- fido'
// -> 'species'
// -> '- dog'
```

### Summary

So far, this should seem relatively straightforward. For more information on all of these methods, you'll find a lot more in the [`Store`](/api/the-essentials/creating-stores/store/) documentation.

The reactive TinyBase magic starts to happen when we register listeners on the [`Store`](/api/the-essentials/creating-stores/store/) so we don't have to keep explicitly fetching data.

For that, we proceed to the [Listening To Stores](/guides/the-basics/listening-to-stores/) guide.