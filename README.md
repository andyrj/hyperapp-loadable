# hyperapp-loadable
*WIP*
This package is inspired be react-loadable.  The main difference between the two packages is that this package targets hyperapp instead of react and thus does not have stateful components.

To work around this difference we use a mixin to provide a { loadable: {} } in the state as well as add actions: { loadable: { loaded: () => any }} for triggering an update/re-render after the lazy-loaded module is available.

```jsx
/* src/Test.js */
import { h } from "hyperapp";

export function Test(props) {
  return (
    <div>{"Testing lazy-loaded component!"}</div>
  );
}
```

```jsx
import { h, app } from "hyperapp";
import { loadable, Loadable, load } from "hyperapp-loadable";

const Loading = (props) => <div>{`Loading... look at my ${props}`}</div>;

app({
  view: (state, actions) => {
    return (
      <Loadable 
        loaded={actions.loadable.loaded} // *REQUIRED
        loadable={state.loadable} // *REQUIRED
        name={"/Test"} // *REQUIRED unique key for the result of loader to be stored under state.loadable[name]
        loader={() => import("./Test")} // *REQUIRED thunk which returns a promise that resolves to a component
        loaderProps={({ state: state, actions: actions })} // Optional, but useful...
        loading={Loading} // *REQUIRED component to display while loading the above loader thunk...
        loadingProps={({ foo: "bar" })} // Optional, will be passed into your Loading component for render
        defaultTime={200} // Optional default 200ms time spent displaying loading
        terminalTime={3000} // Optional default 3 second error timeout
        errorHandler={ // Optional could be used to clear cache and retry on failures etc...
          ({ name, result }) => console.error(`Loadable: ${name}, error: ${result}`)
        }
      />
    );
  },
  mixins: [loadable]
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

