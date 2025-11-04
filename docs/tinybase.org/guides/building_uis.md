---
title: "Building UIs | TinyBase"
url: https://tinybase.org/guides/building-uis
---

These guides cover how to use the [`ui-react`](/api/ui-react/) module and use React hooks and components to easily build reactive user interfaces with TinyBase.

See also the [Countries](/demos/countries/) demo, the [Todo App](/demos/todo-app/) demos, and the [Drawing](/demos/drawing/) demo.

## Getting Started With ui-react

To build React-based user interfaces with TinyBase, you will need to install the [`ui-react`](/api/ui-react/) module in addition to the main module, and, of course, React itself. [Read more](/guides/building-uis/getting-started-with-ui-react/).

## Using React Hooks

There are reactive hooks in the [`ui-react`](/api/ui-react/) module for accessing every part of a [`Store`](/api/the-essentials/creating-stores/store/), as well as more advanced things like the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) and [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects. [Read more](/guides/building-uis/using-react-hooks/).

## Using React Components

The reactive components in the [`ui-react`](/api/ui-react/) module let you declaratively display parts of a [`Store`](/api/the-essentials/creating-stores/store/). [Read more](/guides/building-uis/using-react-components/).

## Using React DOM Components

The reactive components in the [`ui-react-dom`](/api/ui-react-dom/) module let you declaratively display parts of a [`Store`](/api/the-essentials/creating-stores/store/) in a web browser, where the ReactDOM module is available. [Read more](/guides/building-uis/using-react-dom-components/).

## Using Context

The [`ui-react`](/api/ui-react/) module includes a context provider that lets you avoid passing global objects down through your component hierarchy. [Read more](/guides/building-uis/using-context/).