---
title: "Using React Hooks | TinyBase"
url: https://tinybase.org/guides/building-uis/using-react-hooks
---

There are reactive hooks in the [`ui-react`](/api/ui-react/) module for accessing every part of a [`Store`](/api/the-essentials/creating-stores/store/), as well as more advanced things like the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) and [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects.

By reactive hooks, we mean that the hook not only fetches part of the [`Store`](/api/the-essentials/creating-stores/store/), but that it also registers a listener that will then cause a component to re-render if the underlying value changes. Therefore, it's easy to describe a user interface in terms of raw data in a [`Store`](/api/the-essentials/creating-stores/store/), and know that it will stay updated when the data changes.

To start with a simple example, we use the [`useCell`](/api/the-essentials/using-react/usecell/) hook in a component called `App` to get the value of a [`Cell`](/api/store/type-aliases/store/cell/) and render it in a `<span>` element. When the [`Cell`](/api/store/type-aliases/store/cell/) is updated, so is the HTML.

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';
import {useCell} from 'tinybase/ui-react';

const store = createStore().setCell('pets', 'fido', 'color', 'brown');
const App = () => <span>{useCell('pets', 'fido', 'color', store)}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>brown</span>'

store.setCell('pets', 'fido', 'color', 'walnut');
console.log(app.innerHTML);
// -> '<span>walnut</span>'
```

There are hooks that correspond to each of the [`Store`](/api/the-essentials/creating-stores/store/) getter methods:

-   The [`useValues`](/api/ui-react/functions/store-hooks/usevalues/) hook is the reactive equivalent of the [`getValues`](/api/store/interfaces/store/store/methods/getter/getvalues/) method.
-   The [`useValueIds`](/api/ui-react/functions/store-hooks/usevalueids/) hook is the reactive equivalent of the [`getValueIds`](/api/store/interfaces/store/store/methods/getter/getvalueids/) method.
-   The [`useValue`](/api/the-essentials/using-react/usevalue/) hook is the reactive equivalent of the [`getValue`](/api/the-essentials/getting-data/getvalue/) method.

And for tabular data:

-   The [`useTables`](/api/ui-react/functions/store-hooks/usetables/) hook is the reactive equivalent of the [`getTables`](/api/store/interfaces/store/store/methods/getter/gettables/) method.
-   The [`useTableIds`](/api/ui-react/functions/store-hooks/usetableids/) hook is the reactive equivalent of the [`getTableIds`](/api/store/interfaces/store/store/methods/getter/gettableids/) method.
-   The [`useTable`](/api/ui-react/functions/store-hooks/usetable/) hook is the reactive equivalent of the [`getTable`](/api/store/interfaces/store/store/methods/getter/gettable/) method.
-   The [`useTableCellIds`](/api/ui-react/functions/store-hooks/usetablecellids/) hook is the reactive equivalent of the [`getTableCellIds`](/api/store/interfaces/store/store/methods/getter/gettablecellids/) method.
-   The [`useRowIds`](/api/ui-react/functions/store-hooks/userowids/) hook is the reactive equivalent of the [`getRowIds`](/api/store/interfaces/store/store/methods/getter/getrowids/) method.
-   The [`useSortedRowIds`](/api/ui-react/functions/store-hooks/usesortedrowids/) hook is the reactive equivalent of the [`getSortedRowIds`](/api/store/interfaces/store/store/methods/getter/getsortedrowids/) method.
-   The [`useRow`](/api/the-essentials/using-react/userow/) hook is the reactive equivalent of the [`getRow`](/api/the-essentials/getting-data/getrow/) method.
-   The [`useCellIds`](/api/ui-react/functions/store-hooks/usecellids/) hook is the reactive equivalent of the [`getCellIds`](/api/store/interfaces/store/store/methods/getter/getcellids/) method.
-   The [`useCell`](/api/the-essentials/using-react/usecell/) hook is the reactive equivalent of the [`getCell`](/api/the-essentials/getting-data/getcell/) method.

They have the same return types. For example, the [`useTable`](/api/ui-react/functions/store-hooks/usetable/) hook returns an object:

```
import {useTable} from 'tinybase/ui-react';

const App2 = () => <span>{JSON.stringify(useTable('pets', store))}</span>;
root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>{"fido":{"color":"walnut"}}</span>'

store.setCell('pets', 'fido', 'species', 'dog');
console.log(app.innerHTML);
// -> '<span>{"fido":{"color":"walnut","species":"dog"}}</span>'
```

When the component is unmounted, the listener will be automatically removed. This means you can use these hooks without having to worry too much about the lifecycle of how your component interacts with the [`Store`](/api/the-essentials/creating-stores/store/).

### Using Hooks To Set Data

In an interactive application, you don't just want to read data. You also want to be able to set it in response to user's actions. For this purpose, there is a group of hooks that return callbacks for setting data based on events.

Let's start with a simple example, the [`useSetCellCallback`](/api/ui-react/functions/store-hooks/usesetcellcallback/) hook. The [`Cell`](/api/store/type-aliases/store/cell/) to be updated needs to be identified by the [`Table`](/api/store/type-aliases/store/table/), [`Row`](/api/store/type-aliases/store/row/), and [`Cell`](/api/store/type-aliases/store/cell/) [`Id`](/api/common/type-aliases/identity/id/) parameters. The fourth parameter to the hook is a parameterized callback (that will be memoized based on the dependencies in the fifth parameter). The responsibility of that function is to return the value that will be used to update the [`Cell`](/api/store/type-aliases/store/cell/).

It's probably easier to understand with an example:

```
import {useSetCellCallback} from 'tinybase/ui-react';

const App3 = () => {
  const handleClick = useSetCellCallback(
    'pets',
    'fido',
    'sold',
    (event) => event.bubbles,
    [],
    store,
  );
  return (
    <span>
      Sold: {useCell('pets', 'fido', 'sold', store) ? 'yes' : 'no'}
      <br />
      <button onClick={handleClick}>Sell</button>
    </span>
  );
};
root.render(<App3 />);
console.log(app.innerHTML);
// -> '<span>Sold: no<br><button>Sell</button></span>'

const button = app.querySelector('button');
// User clicks the <button> element:
// -> button MouseEvent('click', {bubbles: true})

console.log(store.getTables());
// -> {pets: {fido: {color: 'walnut', species: 'dog', sold: true}}}
console.log(app.innerHTML);
// -> '<span>Sold: yes<br><button>Sell</button></span>'
```

In the real-world, a more valid case for using the event parameter might be to handle the content of a text input to write into the [`Store`](/api/the-essentials/creating-stores/store/). See the Todo demo for a working example of doing that with the [`useAddRowCallback`](/api/ui-react/functions/store-hooks/useaddrowcallback/) hook to add new todos.

### Other Hook Types

The hooks to read and write [`Store`](/api/the-essentials/creating-stores/store/) data (described above) will be the ones you most commonly use. For completeness, there are three other broad groups of hooks. Firstly, there are those that create callbacks to delete data (such as the [`useDelRowCallback`](/api/ui-react/functions/store-hooks/usedelrowcallback/) hook), which should be self-explanatory.

Then there are hooks that are used to create objects (including [`Store`](/api/the-essentials/creating-stores/store/) objects, but also [`Metrics`](/api/metrics/interfaces/metrics/metrics/), and [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects, and so on). These are essentially convenient aliases for memoization so that object creation can be performed inside a component without fear of creating a new instance per render:

```
import {useCreateStore} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() => {
    console.log('Store created');
    return createStore().setTables({pets: {fido: {species: 'dog'}}});
  });
  return <span>{store.getCell('pets', 'fido', 'species')}</span>;
};

root.render(<App4 />);
// -> 'Store created'

root.render(<App4 />);
// No second Store creation
```

There is also a final group of hooks that add listeners (such as the [`useCellListener`](/api/ui-react/functions/store-hooks/usecelllistener/) hook). Since the regular hooks (like the [`useCell`](/api/the-essentials/using-react/usecell/) hook) already register listeners to track changes, you won't often need to use these unless you need to establish a listener in a component that has some other side-effect, such as mutating data to enforce a schema, for example.

### Summary

The hooks available in the [`ui-react`](/api/ui-react/) module make it easy to connect your user interface to TinyBase [`Store`](/api/the-essentials/creating-stores/store/) data. It also contains some convenient components that you can use to build your user interface more declaratively. For that, let's proceed to the [Using React Components](/guides/building-uis/using-react-components/) guide.