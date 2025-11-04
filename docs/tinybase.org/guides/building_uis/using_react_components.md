---
title: "Using React Components | TinyBase"
url: https://tinybase.org/guides/building-uis/using-react-components
---

The reactive components in the [`ui-react`](/api/ui-react/) module let you declaratively display parts of a [`Store`](/api/the-essentials/creating-stores/store/).

These are all essentially convenience wrappers around the hooks we described in the [Using React Hooks](/guides/building-uis/using-react-hooks/) guide, but make it easy to build hierarchical component trees from the [`Store`](/api/the-essentials/creating-stores/store/) data. For example, the [`ValuesView`](/api/ui-react/functions/store-components/valuesview/) component wraps around the [`useValueIds`](/api/ui-react/functions/store-hooks/usevalueids/) hook to render child [`ValueView`](/api/ui-react/functions/store-components/valueview/) components. Similarly, the [`TablesView`](/api/ui-react/functions/store-components/tablesview/) component wraps around the [`useTableIds`](/api/ui-react/functions/store-hooks/usetableids/) hook to render child [`TableView`](/api/ui-react/functions/store-components/tableview/) components, which in turn can render child [`RowView`](/api/ui-react/functions/store-components/rowview/) components and [`CellView`](/api/ui-react/functions/store-components/cellview/) components.

In this simple example, the [`CellView`](/api/ui-react/functions/store-components/cellview/) component is used to render the color [`Cell`](/api/store/type-aliases/store/cell/) in a `<span>`:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createStore} from 'tinybase';
import {CellView} from 'tinybase/ui-react';

const store = createStore().setCell('pets', 'fido', 'color', 'brown');
const App = () => (
  <span>
    <CellView tableId="pets" rowId="fido" cellId="color" store={store} />
  </span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>brown</span>'

store.setCell('pets', 'fido', 'color', 'walnut');
console.log(app.innerHTML);
// -> '<span>walnut</span>'
```

These components have very plain default renderings, and don't even generate HTML or use ReactDOM. This means that the [`ui-react`](/api/ui-react/) module works just as well with React Native or other React-based rendering systems.

It does mean though, that if you use the default [`RowView`](/api/ui-react/functions/store-components/rowview/) component, you will simply render a concatenation of the values of its Cells:

```
import {RowView} from 'tinybase/ui-react';

store.setCell('pets', 'fido', 'weight', 42);
const App2 = () => (
  <span>
    <RowView tableId="pets" rowId="fido" store={store} />
  </span>
);

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>walnut42</span>'
```

This is not a particularly nice rendering! Even for the purposes of debugging data, you may want to separate the values, and this can be cheaply done with the `separator` prop:

```
const App3 = () => (
  <span>
    <RowView tableId="pets" rowId="fido" store={store} separator="," />
  </span>
);

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<span>walnut,42</span>'
```

Going further, the `debugIds` prop helps you see the structure of the objects with their [`Ids`](/api/common/type-aliases/identity/ids/).

```
const App4 = () => (
  <span>
    <RowView tableId="pets" rowId="fido" store={store} debugIds={true} />
  </span>
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<span>fido:{color:{walnut}weight:{42}}</span>'
```

These are slightly more readable, but are still not really appropriate to actually build a user interface! For that we need to understand how to customize components.

### Customizing Components

More likely than JSON-like strings, you will want to customize or compose the rendering of parts of the [`Store`](/api/the-essentials/creating-stores/store/) for your UI. The way this works is that each of the react-ui module components has a prop that takes an alternative rendering for its children.

For example, the [`TableView`](/api/ui-react/functions/store-components/tableview/) component takes a `rowComponent` prop that lets you indicate how each [`Row`](/api/store/type-aliases/store/row/) should be rendered, and the [`RowView`](/api/ui-react/functions/store-components/rowview/) component takes a `cellComponent` prop that lets you indicate how each [`Cell`](/api/store/type-aliases/store/cell/) should be rendered. The component passed in to such props itself needs to be capable of taking the same props that the default component would have.

To render the contents of a [`Table`](/api/store/type-aliases/store/table/) into an HTML table, therefore, you might set the components up like this:

```
import {TableView} from 'tinybase/ui-react';

const MyTableView = (props) => (
  <table>
    <tbody>
      <TableView {...props} rowComponent={MyRowView} />
    </tbody>
  </table>
);

const MyRowView = (props) => (
  <tr>
    <th>{props.rowId}</th>
    <RowView {...props} cellComponent={MyCellView} />
  </tr>
);

const MyCellView = (props) => (
  <td>
    <CellView {...props} />
  </td>
);

const App5 = () => <MyTableView store={store} tableId="pets" />;
root.render(<App5 />);
console.log(app.innerHTML);
// -> '<table><tbody><tr><th>fido</th><td>walnut</td><td>42</td></tr></tbody></table>'
```

That is now starting to resemble a useful UI for tabular data! A final touch here is that each view can also let you create custom props for each of its children. For example the `getRowComponentProps` prop of the [`TableView`](/api/ui-react/functions/store-components/tableview/) component should be a function that returns additional props that will be passed to each child. See the API documentation for more examples.

### Summary

The components available in the [`ui-react`](/api/ui-react/) module make it easy to enumerate over objects to build your user interface with customized, composed components. This will work wherever the React module does, including React Native.

When you are building an app in a web browser, however, where the ReactDOM module is available, TinyBase includes pre-made HTML components. We will look at these in the next [Using React DOM Components](/guides/building-uis/using-react-dom-components/) guide.