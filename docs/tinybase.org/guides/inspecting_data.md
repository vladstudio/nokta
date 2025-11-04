---
title: "Inspecting Data | TinyBase"
url: https://tinybase.org/guides/inspecting-data
---

If you are using TinyBase with React, you can use its web-based inspector, the [`Inspector`](/api/the-essentials/using-react/inspector/) component, that allows you to reason about the data during development.

![Inspector](/inspector.webp "Inspector")

(NB: Previous to v5.0, this component was called `StoreInspector`.)

### Usage

The component is available in the [`ui-react-inspector`](/api/ui-react-inspector/) module. Simply add the component inside a [`Provider`](/api/the-essentials/using-react/provider/) component (which is providing the [`Store`](/api/the-essentials/creating-stores/store/) context for the app that you want to be inspected). In total, the boilerplate will look something like this:

```
const {Provider, useCreateStore} = TinyBaseUiReact;
const {Inspector} = TinyBaseUiReactInspector;

const App = () => (
  <Provider store={useCreateStore(createStore)}>
    <Body />
  </Provider>
);

const Body = () => {
  return (
    <>
      <h1>My app</h1>
      {/* ... */}
      <Inspector />
    </>
  );
};

addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

### What Is In The Inspector?

The inspector appears at first as a nub in the corner of the screen containing the TinyBase logo. Once clicked, it will open up to show a dark panel. You can reposition this to dock to any side of the window, or expand to the full screen.

The inspector contains the following sections for whatever is available in the [`Provider`](/api/the-essentials/using-react/provider/) component context:

-   Default [`Store`](/api/the-essentials/creating-stores/store/): [`Values`](/api/store/type-aliases/store/values/) and a sortable view of each [`Table`](/api/store/type-aliases/store/table/)
-   Each named [`Store`](/api/the-essentials/creating-stores/store/): [`Values`](/api/store/type-aliases/store/values/) and a sortable view of each [`Table`](/api/store/type-aliases/store/table/)
-   Default [`Indexes`](/api/indexes/interfaces/indexes/indexes/): each [`Row`](/api/store/type-aliases/store/row/) in each [`Slice`](/api/indexes/type-aliases/concept/slice/) of each [`Index`](/api/indexes/type-aliases/concept/index/)
-   Each named [`Indexes`](/api/indexes/interfaces/indexes/indexes/): each [`Row`](/api/store/type-aliases/store/row/) in each [`Slice`](/api/indexes/type-aliases/concept/slice/) of each [`Index`](/api/indexes/type-aliases/concept/index/)
-   Default [`Relationships`](/api/relationships/interfaces/relationships/relationships/): the pair of [`Tables`](/api/store/type-aliases/store/tables/) in each [`Relationship`](/api/relationships/type-aliases/concept/relationship/)
-   Each named [`Relationships`](/api/relationships/interfaces/relationships/relationships/): the pair of [`Tables`](/api/store/type-aliases/store/tables/) in each [`Relationship`](/api/relationships/type-aliases/concept/relationship/)
-   Default [`Queries`](/api/queries/interfaces/queries/queries/): the pair of [`Tables`](/api/store/type-aliases/store/tables/) in each Query
-   Each named [`Queries`](/api/queries/interfaces/queries/queries/): the pair of [`Tables`](/api/store/type-aliases/store/tables/) in each Query

It is hoped that each section is quite self-explanatory. If not, please try it out in the [<Inspector />](/demos/ui-components/inspector/) demo, or indeed in most of the TinyBase demos themselves! The [Movie Database](/demos/movie-database/) demo and [Countries](/demos/countries/) demo are quite good examples of the inspector in use.

Note that, as of TinyBase v6.6, you can also create, duplicate, and delete tables, rows, values, and cells - all directly within the Inspector.