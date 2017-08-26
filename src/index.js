export default function Loadable(config) {
  const defaultTime = config.defaultTime || 200;
  const terminalTime = config.terminalTime || 3000;
  const errorHandler = config.errorHandler;
  const nodeHandler = config.nodeHandler;

  function runErrorHandler(status) {
    if (errorHandler != null && typeof errorHandler === "function") {
      errorHandler(status);
    }
  }

  function load(name, loadable, loader, loaded) {
    let result;
    let defaultTimeout = setTimeout(() => {
      defaultTimeout = null;
      loaded({ name, result });
    }, defaultTime);
    const terminalTimeout = setTimeout(() => {
      result = new Error("Loadable timed out");
      runErrorHandler({ name, result });
      loaded({ name, result });
    }, terminalTime);

    loader()
      .then(promised => {
        if (result == null) {
          if (typeof promised === "function") {
            result = promised;
          } else if (
            promised.default != null &&
            typeof promised.default === "function"
          ) {
            result = promised.default;
          }
          clearTimeout(terminalTimeout);
          if (typeof result === "function" && defaultTimeout == null) {
            loaded({ name, result });
          }
        } else {
          loaded({ name, result });
        }
      })
      .catch(err => {
        clearTimeout(terminalTimeout);
        clearTimeout(defaultTimeout);
        result = err;
        runErrorHandler({ name, result });
        loaded({ name, result });
      });
  }

  function isNode() {
    return (
      typeof process !== "undefined" &&
      process.release != null &&
      (process.release.name.search(/node|io.js/) !== -1 ||
        typeof process.versions.node !== "undefined")
    );
  }
  let emit;
  return {
    LoadableMixin: function(Emit) {
      emit = Emit;
      return {
        state: {
          loadable: {}
        },
        actions: {
          loadable: {
            loaded: function(state, actions, { name, result }) {
              let newLoadable = {};
              newLoadable[name] = result;
              return {
                loadable: Object.assign({}, state.loadable, newLoadable)
              };
            }
          }
        },
        events: {
          getStateAndActions(state, actions) {
            return { state, actions };
          }
        }
      };
    },
    Loadable: function(props) {
      const { state, actions } = emit("getStateAndActions");
      const loadable = state.loadable;
      const { name, loader, loading } = props;
      const loaded = props.loaded || actions.loadable.loaded;
      if (isNode()) {
        if (nodeHandler != null && typeof nodeHandler === "function") {
          return nodeHandler(loader);
        } else {
          runErrorHandler({ name, result: new Error("No nodeHandler was provided to mixin config") });
        }
        return;
      }
      if (loadable[name] != null && typeof loadable[name] === "function") {
        return loadable[name](state, actions);
      } else {
        if (loadable[name] == null) {
          load(name, loadable, loader, loaded);
        }
        return loading(state, actions);
      }
    }
  };
}
