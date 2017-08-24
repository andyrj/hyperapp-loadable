/*
<Loadable
  state={state}
  actions={actions}
  name={"/test"}
  loader={() => import("./test")}
  loading={MyLoadingComponent}
  loaded={actions.loadable.loaded}
  errorHandler={(name, err) => console.error(`hyperapp-loadable error: ${err}`)}
/>
*/
export function Loadable(props) {
  if (typeof props === "function") { // used as mixin...
    var emit = props;
    return {
      state: {
        loadable: {}
      },
      actions: {
        loadable: {
          loaded: function(state, actions, {name, component}) {
            var newLoadable = {};
            return {
              loadable: Object.assign({}, state.loadable, newLoadable[name] = component)
            };
          }
        }
      }
    }
  } else { // used as stateless component
    var state = props.state;
    var actions = props.actions;
    var name = props.name;
    var loader = props.loader;
    var loaded = props.loaded;
    var loading = props.loading;
    var errorHandler = props.errorHandler;
    if (state.loadable[name] != null && state.loadable[name].component != null) {
      return state.loadable[name].component(state, actions);
    } else {
      // loader is thunk returning promise
      loader().then(function(component) {
        loaded({ name: name, component: component });
      }).catch(function(err) {
        errorHandler(name, err);
      });
      return loading(state, actions);
    }
  }
}

