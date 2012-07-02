// Generated by CoffeeScript 1.3.3
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
A lightweight MVC view controller.

Used in conjunction with {@link Deft.mixin.Controllable}.
*/

Ext.define('Deft.mvc.ViewController', {
  alternateClassName: ['Deft.ViewController'],
  requires: ['Deft.log.Logger'],
  config: {
    /**
    		View controlled by this ViewController.
    */

    view: null
  },
  constructor: function(config) {
    if (config == null) {
      config = {};
    }
    if (config.view) {
      this.controlView(config.view);
    }
    return this.initConfig(config);
  },
  /**
  	@protected
  */

  controlView: function(view) {
    if (view instanceof Ext.ClassManager.get('Ext.Component')) {
      this.setView(view);
      this.registeredComponents = {};
      this.isExtJS = this.getView().events != null;
      this.isSenchaTouch = !this.isExtJS;
      if (this.isExtJS) {
        if (this.getView().rendered) {
          this.onViewInitialize();
        } else {
          this.getView().on('afterrender', this.onViewInitialize, this, {
            single: true
          });
        }
      } else {
        if (this.getView().initialized) {
          this.onViewInitialize();
        } else {
          this.getView().on('initialize', this.onViewInitialize, this, {
            single: true
          });
        }
      }
    } else {
      Ext.Error.raise({
        msg: 'Error constructing ViewController: the configured \'view\' is not an Ext.Component.'
      });
    }
  },
  /**
  	Initialize the ViewController
  */

  init: function() {},
  /**
  	Destroy the ViewController
  */

  destroy: function() {
    return true;
  },
  /**
  	@private
  */

  onViewInitialize: function() {
    var component, config, id, listeners, originalViewDestroyFunction, self, _ref;
    if (this.isExtJS) {
      this.getView().on('beforedestroy', this.onViewBeforeDestroy, this);
      this.getView().on('destroy', this.onViewDestroy, this, {
        single: true
      });
    } else {
      self = this;
      originalViewDestroyFunction = this.getView().destroy;
      this.getView().destroy = function() {
        if (self.destroy()) {
          originalViewDestroyFunction.call(this);
        }
      };
    }
    _ref = this.control;
    for (id in _ref) {
      config = _ref[id];
      component = this.locateComponent(id, config);
      listeners = Ext.isObject(config.listeners) ? config.listeners : !(config.selector != null) ? config : void 0;
      this.registerComponent(id, component, listeners);
    }
    this.init();
  },
  /**
  	@private
  */

  onViewBeforeDestroy: function() {
    if (this.destroy()) {
      this.getView().un('beforedestroy', this.onBeforeDestroy, this);
      return true;
    }
    return false;
  },
  /**
  	@private
  */

  onViewDestroy: function() {
    var id;
    for (id in this.registeredComponents) {
      this.unregisterComponent(id);
    }
  },
  /**
  	@private
  */

  getComponent: function(id) {
    var _ref;
    return (_ref = this.registeredComponents[id]) != null ? _ref.component : void 0;
  },
  /**
  	@private
  */

  registerComponent: function(id, component, listeners) {
    var event, existingComponent, fn, getterName, listener, options, scope;
    Deft.Logger.log("Registering '" + id + "' component.");
    existingComponent = this.getComponent(id);
    if (existingComponent != null) {
      Ext.Error.raise({
        msg: "Error registering component: an existing component already registered as '" + id + "'."
      });
    }
    this.registeredComponents[id] = {
      component: component,
      listeners: listeners
    };
    if (id !== 'view') {
      getterName = 'get' + Ext.String.capitalize(id);
      if (!this[getterName]) {
        this[getterName] = Ext.Function.pass(this.getComponent, [id], this);
      }
    }
    if (Ext.isObject(listeners)) {
      for (event in listeners) {
        listener = listeners[event];
        fn = listener;
        scope = this;
        options = null;
        if (Ext.isObject(listener)) {
          options = Ext.apply({}, listener);
          if (options.fn != null) {
            fn = options.fn;
            delete options.fn;
          }
          if (options.scope != null) {
            scope = options.scope;
            delete options.scope;
          }
        }
        Deft.Logger.log("Adding '" + event + "' listener to '" + id + "'.");
        if (Ext.isFunction(fn)) {
          component.on(event, fn, scope, options);
        } else if (Ext.isFunction(this[fn])) {
          component.on(event, this[fn], scope, options);
        } else {
          Ext.Error.raise({
            msg: "Error adding '" + event + "' listener: the specified handler '" + fn + "' is not a Function or does not exist."
          });
        }
      }
    }
  },
  /**
  	@private
  */

  unregisterComponent: function(id) {
    var component, event, existingComponent, fn, getterName, listener, listeners, options, scope, _ref;
    Deft.Logger.log("Unregistering '" + id + "' component.");
    existingComponent = this.getComponent(id);
    if (!(existingComponent != null)) {
      Ext.Error.raise({
        msg: "Error unregistering component: no component is registered as '" + id + "'."
      });
    }
    _ref = this.registeredComponents[id], component = _ref.component, listeners = _ref.listeners;
    if (Ext.isObject(listeners)) {
      for (event in listeners) {
        listener = listeners[event];
        fn = listener;
        scope = this;
        if (Ext.isObject(listener)) {
          options = listener;
          if (options.fn != null) {
            fn = options.fn;
          }
          if (options.scope != null) {
            scope = options.scope;
          }
        }
        Deft.Logger.log("Removing '" + event + "' listener from '" + id + "'.");
        if (Ext.isFunction(fn)) {
          component.un(event, fn, scope);
        } else if (Ext.isFunction(this[fn])) {
          component.un(event, this[fn], scope);
        } else {
          Ext.Error.raise({
            msg: "Error removing '" + event + "' listener: the specified handler '" + fn + "' is not a Function or does not exist."
          });
        }
      }
    }
    if (id !== 'view') {
      getterName = 'get' + Ext.String.capitalize(id);
      this[getterName] = null;
    }
    this.registeredComponents[id] = null;
  },
  /**
  	@private
  */

  locateComponent: function(id, config) {
    var matches, view;
    view = this.getView();
    if (id === 'view') {
      return view;
    }
    if (Ext.isString(config)) {
      matches = view.query(config);
      if (matches.length === 0) {
        Ext.Error.raise({
          msg: "Error locating component: no component found matching '" + config + "'."
        });
      }
      if (matches.length > 1) {
        Ext.Error.raise({
          msg: "Error locating component: multiple components found matching '" + config + "'."
        });
      }
      return matches[0];
    } else if (Ext.isString(config.selector)) {
      matches = view.query(config.selector);
      if (matches.length === 0) {
        Ext.Error.raise({
          msg: "Error locating component: no component found matching '" + config.selector + "'."
        });
      }
      if (matches.length > 1) {
        Ext.Error.raise({
          msg: "Error locating component: multiple components found matching '" + config.selector + "'."
        });
      }
      return matches[0];
    } else {
      matches = view.query('#' + id);
      if (matches.length === 0) {
        Ext.Error.raise({
          msg: "Error locating component: no component found with an itemId of '" + id + "'."
        });
      }
      if (matches.length > 1) {
        Ext.Error.raise({
          msg: "Error locating component: multiple components found with an itemId of '" + id + "'."
        });
      }
      return matches[0];
    }
  }
});
