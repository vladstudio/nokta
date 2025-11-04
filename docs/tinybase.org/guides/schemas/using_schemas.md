---
title: "Using Schemas | TinyBase"
url: https://tinybase.org/guides/schemas/using-schemas
---

[Schemas](/guides/schemas/) are a simple declarative way to say what data you would like to store.

A [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) simply describes specific [`Value`](/api/store/type-aliases/store/value/) types and default. A [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) describes specific [`Cell`](/api/store/type-aliases/store/cell/) types and defaults in specific [`Tables`](/api/store/type-aliases/store/tables/).

Each is a JavaScript object, and to apply them, you use the [`setValuesSchema`](/api/store/interfaces/store/store/methods/setter/setvaluesschema/) method and [`setTablesSchema`](/api/store/interfaces/store/store/methods/setter/settablesschema/) method respectively.

### Adding A [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/)

Typically you will want to set a [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) prior to loading and setting data in your [`Store`](/api/the-essentials/creating-stores/store/):

```
import {createStore} from 'tinybase';

const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});
store.setValues({employees: 3, website: 'pets.com'});
console.log(store.getValues());
// -> {employees: 3, open: false}
```

In the above example, we indicated that the [`Store`](/api/the-essentials/creating-stores/store/) contains an `employees` [`Value`](/api/store/type-aliases/store/value/) (which needs to be a number) and an `open` [`Value`](/api/store/type-aliases/store/value/) (which needs to be a boolean).

As you can see, when a [`Values`](/api/store/type-aliases/store/values/) object is used that doesn't quite match those constraints, the data is corrected. The `website` [`Value`](/api/store/type-aliases/store/value/) is ignored, and the missing `open` [`Value`](/api/store/type-aliases/store/value/) gets defaulted to `false`.

### Adding A [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/)

Tabular schemas are similar. Set a [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) prior to loading data into your [`Tables`](/api/store/type-aliases/store/tables/):

```
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    sold: {type: 'boolean', default: false},
  },
});
store.setRow('pets', 'fido', {species: 'dog', color: 'brown', sold: 'maybe'});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false}}}
```

In the above example, we indicated that the [`Store`](/api/the-essentials/creating-stores/store/) contains a single `pets` [`Table`](/api/store/type-aliases/store/table/), each [`Row`](/api/store/type-aliases/store/row/) of which has a `species` [`Cell`](/api/store/type-aliases/store/cell/) (which needs to be a string) and a `sold` [`Cell`](/api/store/type-aliases/store/cell/) (which needs to be a boolean).

Again, when a [`Row`](/api/store/type-aliases/store/row/) is added that doesn't quite match those constraints, the data is corrected. The `color` [`Cell`](/api/store/type-aliases/store/cell/) is ignored, and the `sold` string is corrected to the default `false` value.

In general, if a default value is provided (and its type is correct), you can be certain that that [`Cell`](/api/store/type-aliases/store/cell/) will always be present in a [`Row`](/api/store/type-aliases/store/row/). If the default value is _not_ provided (or its type is incorrect), the [`Cell`](/api/store/type-aliases/store/cell/) may be missing from the [`Row`](/api/store/type-aliases/store/row/). But when it is present you can be guaranteed it is of the correct type.

### Altering A Schema

You can also set or change the [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) or [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) after data has been added to the [`Store`](/api/the-essentials/creating-stores/store/). Note that this may result in a change to data in the [`Store`](/api/the-essentials/creating-stores/store/), as defaults are applied or as invalid [`Value`](/api/store/type-aliases/store/value/), [`Table`](/api/store/type-aliases/store/table/), [`Row`](/api/store/type-aliases/store/row/), or [`Cell`](/api/store/type-aliases/store/cell/) objects are removed. These changes will fire any listeners to that data, as expected.

In this example, the [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) gains a new required field that is added to the current [`Row`](/api/store/type-aliases/store/row/) to make it compliant:

```
store.setTablesSchema({
  pets: {
    species: {type: 'string'},
    legs: {type: 'number', default: 4},
    sold: {type: 'boolean', default: false},
  },
});
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}
```

The [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) does not attempt to cast data. If a field needs to be of a particular type, it really needs to be of that type:

```
store.setCell('pets', 'fido', 'legs', '3');
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 4}}}

store.setCell('pets', 'fido', 'legs', 3);
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog', sold: false, legs: 3}}}
```

### Be Aware Of Potential Data Loss

In order to guarantee that a schema is met, [`Value`](/api/store/type-aliases/store/value/) or [`Cell`](/api/store/type-aliases/store/cell/) data may be removed. In the case of a [`Cell`](/api/store/type-aliases/store/cell/) being removed, this might result in the removal of a whole [`Row`](/api/store/type-aliases/store/row/).

In this case, for example, the [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) changes quite dramatically and none of the Cells of the existing data match it, so the [`Row`](/api/store/type-aliases/store/row/) is deleted:

```
store.setTablesSchema({
  pets: {
    color: {type: 'string'},
    weight: {type: 'number'},
  },
});
console.log(store.getTables());
// -> {}
```

When no longer needed, you can also completely removes existing schemas with the [`delValuesSchema`](/api/store/interfaces/store/store/methods/deleter/delvaluesschema/) method or the [`delTablesSchema`](/api/store/interfaces/store/store/methods/deleter/deltablesschema/) method.

### Summary

Adding a schema gives you a simple declarative way to describe your data structure.

You can also benefit from a better developer experience based on these schemas, and for that we turn to the [Schema-Based Typing](/guides/schemas/schema-based-typing/) guide.