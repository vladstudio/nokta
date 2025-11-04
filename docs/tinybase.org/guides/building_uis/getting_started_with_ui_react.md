---
title: "Getting Started With ui-react | TinyBase"
url: https://tinybase.org/guides/building-uis/getting-started-with-ui-react
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Building UIs](/guides/building-uis/)
-   [Getting Started With ui-react](/guides/building-uis/getting-started-with-ui-react/)

To build React-based user interfaces with TinyBase, you will need to install the [`ui-react`](/api/ui-react/) module in addition to the main module, and, of course, React itself.

For example, in an HTML file, you can get started with boilerplate that might look like this:

```
<html>
  <head>
    <title>My First TinyBase App</title>
    <script type="importmap">
      {
        "imports": {
          "tinybase": "https://esm.sh/tinybase@6.7.2",
          "tinybase/ui-react": "https://esm.sh/tinybase@6.7.2/ui-react",
          "react": "https://esm.sh/react@^19.0.0",
          "react/jsx-runtime": "https://esm.sh/react@^19.0.0/jsx-runtime",
          "react-dom/client": "https://esm.sh/react-dom@^19.0.0/client"
        }
      }
    </script>
    <script type="module" src="https://esm.sh/tsx"></script>
    <script type="text/jsx">
      import {createStore} from "tinybase";
      import {CellView} from "tinybase/ui-react";
      import {createRoot} from "react-dom/client";
      import React from "react";

      const store = createStore();
      store.setCell('t1', 'r1', 'c1', 'Hello World');
      createRoot(document.body).render(
        <CellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
      );
    </script>
  </head>
  <body />
</html>
```

Open this file in your browser and you should see the words '[Hello World](/demos/hello-world/)' on the screen, having been written to, and read from, a [`Store`](/api/the-essentials/creating-stores/store/), and then rendered by the [`CellView`](/api/ui-react/functions/store-components/cellview/) component from the [`ui-react`](/api/ui-react/) module.

Note that the standalone `https://esm.sh/tsx` script and `text/jsx` type on the script here are merely to support JSX in the browser and for the purposes of illustrating how to get started quickly. In a production environment you should pre-compile and your JSX and modules to create a bundled browser app. If you're bundling the whole app, you can of course import the [`ui-react`](/api/ui-react/) module something like this.

Boilerplate aside, let's move on to understand how to use hooks in the [`ui-react`](/api/ui-react/) module, with the [Using React Hooks](/guides/building-uis/using-react-hooks/) guide.