---
title: "Writing To Stores | TinyBase"
url: https://tinybase.org/guides/the-basics/writing-to-stores
---

This guide shows you how to write data to a [`Store`](/api/the-essentials/creating-stores/store/).

A [`Store`](/api/the-essentials/creating-stores/store/) has two types of data in it: keyed values ('[`Values`](/api/store/type-aliases/store/values/)'), and tabular data ('[`Tables`](/api/store/type-aliases/store/tables/)').

[`Values`](/api/store/type-aliases/store/values/) are just [`Id`](/api/common/type-aliases/identity/id/)/[`Value`](/api/store/type-aliases/store/value/) pairs. [`Tables`](/api/store/type-aliases/store/tables/) on the other hand, have a simple hierarchical structure:

-   The [`Store`](/api/the-essentials/creating-stores/store/)'s [`Tables`](/api/store/type-aliases/store/tables/) object contains a number of [`Table`](/api/store/type-aliases/store/table/) objects.
-   Each [`Table`](/api/store/type-aliases/store/table/) contains a number of [`Row`](/api/store/type-aliases/store/row/) objects.
-   Each [`Row`](/api/store/type-aliases/store/row/) contains a number of [`Cell`](/api/store/type-aliases/store/cell/) objects.

Once you have created a [`Store`](/api/the-essentials/creating-stores/store/), you can write data to it with one of its setter methods, according to the level of the hierarchy that you want to set.

For example, you can set the data for the keyed value structure of [`Store`](/api/the-essentials/creating-stores/store/) with the [`setValues`](/api/store/interfaces/store/store/methods/setter/setvalues/) method:

```
import {createStore} from 'tinybase';

const store = createStore();
store.setValues({employees: 3, open: true});
```

Similarly, you can set the data for the tabular structure of [`Store`](/api/the-essentials/creating-stores/store/) with the [`setTables`](/api/store/interfaces/store/store/methods/setter/settables/) method:

```
store.setTables({pets: {fido: {species: 'dog'}}});
```

Hopefully self-evidently, this sets the [`Store`](/api/the-essentials/creating-stores/store/) to have two [`Values`](/api/store/type-aliases/store/values/) (`employees` and `open`, which are `3` and `true` respectively). It also has one [`Table`](/api/store/type-aliases/store/table/) object (called `pets`), containing one [`Row`](/api/store/type-aliases/store/row/) object (called `fido`), containing one [`Cell`](/api/store/type-aliases/store/cell/) object (called `species` and with the string value `dog`):

```
console.log(store.getValues());
// -> {employees: 3, open: true}

console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

You can also alter [`Store`](/api/the-essentials/creating-stores/store/) data at different granularities with the [`setValue`](/api/the-essentials/setting-data/setvalue/) method, the [`setTable`](/api/store/interfaces/store/store/methods/setter/settable/) method, the [`setRow`](/api/the-essentials/setting-data/setrow/) method, and the [`setCell`](/api/the-essentials/setting-data/setcell/) method:

```
store.setValue('employees', 4);
console.log(store.getValues());
// -> {employees: 4, open: true}

store.setTable('species', {dog: {price: 5}});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}}}

store.setRow('species', 'cat', {price: 4});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}, species: {dog: {price: 5}, cat: {price: 4}}}

store.setCell('pets', 'fido', 'color', 'brown');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}, species: {dog: {price: 5}, cat: {price: 4}}}
```

The data in a [`Value`](/api/store/type-aliases/store/value/) or a [`Cell`](/api/store/type-aliases/store/cell/) can be a string, a number, or a boolean type.

It's worth mentioning here that there are two extra methods to manipulate [`Row`](/api/store/type-aliases/store/row/) objects. The [`addRow`](/api/the-essentials/setting-data/addrow/) method is like the [`setRow`](/api/the-essentials/setting-data/setrow/) method but automatically assigns it a new unique [`Id`](/api/common/type-aliases/identity/id/). And the [`setPartialRow`](/api/store/interfaces/store/store/methods/setter/setpartialrow/) method lets you update multiple [`Cell`](/api/store/type-aliases/store/cell/) values in a [`Row`](/api/store/type-aliases/store/row/) without affecting the others. (setPartialValues does the same for [`Values`](/api/store/type-aliases/store/values/).)

### Deleting Data

There are dedicated deletion methods (again, for each level of granularity), such as the [`delValue`](/api/store/interfaces/store/store/methods/deleter/delvalue/) method, the [`delTable`](/api/store/interfaces/store/store/methods/deleter/deltable/) method, the [`delRow`](/api/store/interfaces/store/store/methods/deleter/delrow/) method, and the [`delCell`](/api/store/interfaces/store/store/methods/deleter/delcell/) method. For example:

```
store.delValue('employees');
console.log(store.getValues());
// -> {open: true}

store.delTable('species');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}}
```

Deletions are also implied when you set an object that omits something that existed before:

```
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', color: 'brown'}}}

store.setRow('pets', 'fido', {species: 'dog'});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}}}
// The `color` Cell has been deleted.
```

[`Table`](/api/store/type-aliases/store/table/) and [`Row`](/api/store/type-aliases/store/row/) objects cannot be empty - if they are, they are removed - which leads to a cascading effect when you remove the final child of a parent object:

```
store.delCell('pets', 'fido', 'species');
console.log(store.getTables());
// -> {}
// The `fido` Row and `pets` Table have been recursively deleted.
```

### Summary

That's a quick overview on how to write data to a [`Store`](/api/the-essentials/creating-stores/store/). But of course you want to get it out again too!

In the examples above, we've used the [`getValues`](/api/store/interfaces/store/store/methods/getter/getvalues/) method and the [`getTables`](/api/store/interfaces/store/store/methods/getter/gettables/) method to get a view into the data in the [`Store`](/api/the-essentials/creating-stores/store/). Unsurprisingly, you can also use more granular methods to get data out - for which we proceed to the [Reading From Stores](/guides/the-basics/reading-from-stores/) guide.