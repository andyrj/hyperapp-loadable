# hyperapp-loadable
*WIP*
This package is inspired be react-loadable.  The main difference between the two packages is that this package targets hyperapp instead of react and thus does not have stateful components.

To work around this difference we use a mixin to provide a { loadable: {} } in the state as well as add actions: { loadable: { loaded: () => any }} for triggering an update/re-render after the lazy-loaded module is available.

```jsx
/* src/Test.js */
import { h } from "hyperapp";

export function Test(state, actions) {
  return (
    <div>{"Testing lazy-loaded component!"}</div>
  );
}
```

```jsx
import { h, app } from "hyperapp";
import { LoadableMixin, Loadable, load } from "hyperapp-loadable";

const Loading = (state, actions) => <div>{"Loading..."}</div>;

app({
  view: (state, actions) => {
    return (
      <Loadable 
        name={"/Test"} // unique key for the result of loader to be stored under state.loadable[name]
        loader={() => import("./Test")} // thunk which returns a promise that resolves to a stateless component
        loading={Loading} // component to display while loading the above loader thunk...
        defaultTime={200} // default 200ms time spent displaying loading
        terminalTime={3000} // default 3 second error timeout
        errorHandler={ // could be used to clear cache and retry on failures etc...
          ({ name, result }) => console.error(`Loadable: ${name}, error: ${result}`)
        }
      />
    );
  },
  mixins: [LoadableMixin]
});
```

* NOTE on SSR
```
/* SSR needs a few things special for this to all work from within nodejs...
   - you will need to add babel-plugin-dynamic-import-node to your babel config for your server bundle
   - const defaultTime = isServer() ? -1 : 200;
     const terminalTime = isServer() ? -1 : 3000;
     set default timeouts to -1 so that setTimeout's do not trigger in your server side renders...
   - be sure to load() all your components needed for a route prior to calling app({...}) then it will   all just work, YMMV

   // example of isServer used in above SSR setup...
   const isServer() => {
     return (
      typeof process !== "undefined" &&
      process.release != null &&
      (process.release.name.search(/node|io.js/) !== -1 ||
        typeof process.versions.node !== "undefined")
    );
   }
*/
```

## License

hyperapp-loadable is MIT licensed. See [LICENSE](LICENSE.md).

