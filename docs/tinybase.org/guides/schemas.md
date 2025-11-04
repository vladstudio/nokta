---
title: "Schemas | TinyBase"
url: https://tinybase.org/guides/schemas
---

These guides discuss how to set up a [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) or [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) on a [`Store`](/api/the-essentials/creating-stores/store/) so that certain structures of data are assured.

See also the [Countries](/demos/countries/) demo, the [Todo App](/demos/todo-app/) demos, and the [Drawing](/demos/drawing/) demo.

## Using Schemas

[Schemas](/guides/schemas/) are a simple declarative way to say what data you would like to store. [Read more](/guides/schemas/using-schemas/).

## Schema-Based Typing

You can use type definitions that infer API types from the schemas you apply, providing a powerful way to improve your developer experience when you know the shape of the data being stored. [Read more](/guides/schemas/schema-based-typing/).

## Mutating Data With Listeners

Although listeners are normally prevented from updating data, there are times when you may want to - such as when you are programmatically checking your data as it gets updated. [Read more](/guides/schemas/mutating-data-with-listeners/).