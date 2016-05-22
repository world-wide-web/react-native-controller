var OriginalReact = require('react-native');
var RCCManager = OriginalReact.NativeModules.RCCManager;
var NativeAppEventEmitter = OriginalReact.NativeAppEventEmitter;
var utils = require('./utils');
var resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
var processColor = require('react-native/Libraries/StyleSheet/processColor');

var controllerRegistry = {};

function getRandomId() {
  return (Math.random() * 1e20).toString(36);
}

function processProperties(properties) {
  for (var i in properties) {
    if (properties.hasOwnProperty(i)) {
      const property = properties[i];
      if (i === 'icon' || i.endsWith('Icon')) {
        properties[i] = resolveAssetSource(property);
        continue;
      }
      if (i === 'color' || i.endsWith('Color')) {
        properties[i] = processColor(property);
        continue;
      }
      if (i === 'buttons' || i.endsWith('Buttons')) {
        processButtons(property);
        continue;
      }
    }
  }
}

function setListener(callbackId, func) {
  return NativeAppEventEmitter.addListener(callbackId, (...args) => func(...args));
}

function processButtons(buttons) {
  if (buttons == null) {
    return;
  }
  var unsubscribes = [];
  for (var i = 0 ; i < buttons.length ; i++) {
    var button = buttons[i];
    processProperties(button);
    if (typeof button.onPress === "function") {
      var onPressId = getRandomId();
      var onPressFunc = button.onPress;
      button.onPress = onPressId;
      var unsubscribe = setListener(onPressId, onPressFunc);
      unsubscribes.push(unsubscribe);
    }
  }
  return function () {
    for (var i = 0 ; i < unsubscribes.length ; i++) {
      if (unsubscribes[i]) { unsubscribes[i](); }
    }
  };
}

function createElement(type, props, ...children) {
  props || (props = {});
  children = utils.flattenDeep(children);
  if (children.length) {
    props.children = children;
  }
  if (type instanceof Function) {
    if (type.prototype.render) {
      return new type({props}, {}).render();
    }
    return type(props);
  }
  if (type.render) {
    return type.render.call({props});
  }
  processProperties(props);
  if (props && props.style) {
    processProperties(props.style);
  }
  return {
    type: type.name, props, children
  };
}

export function getController(id) {
  const {address, type = 'ViewControllerIOS'} = id;
  return ViewControllerIOS[type].get(address);
}

export class ViewControllerIOS {
  //
  static instances = {};
  static get(address) {
    return this.instances[address] || (
      this.instances[address] = new this(address)
    );
  }
  //
  constructor(address) {
    this.address = address;
  }
  async getNavigationController() {
    return getController(await RCCManager.ViewControllerIOS(this.address, 'navigationController'));
  }
  async getParentViewController() {
    return getController(await RCCManager.ViewControllerIOS(this.address, 'parentViewController'));
  }
  async getChildViewControllers() {
    return Promise.all(await RCCManager.ViewControllerIOS(this.address, 'childViewControllers').map(getController));
  }
}
ViewControllerIOS.ViewControllerIOS = ViewControllerIOS;

export class NavigationControllerIOS extends ViewControllerIOS {
  //
  static instances = {};
  //
  push(params) {
    var unsubscribes = [];
    if (params['style']) {
      processProperties(params['style']);
    }
    if (params['leftButtons']) {
      var unsubscribe = processButtons(params['leftButtons']);
      unsubscribes.push(unsubscribe);
    }
    if (params['rightButtons']) {
      var unsubscribe = processButtons(params['rightButtons']);
      unsubscribes.push(unsubscribe);
    }
    RCCManager.NavigationControllerIOS(this.address, "push", params);
    return function() {
      for (var i = 0 ; i < unsubscribes.length ; i++) {
        if (unsubscribes[i]) { unsubscribes[i](); }
      }
    };
  }
  pop(params) {
    RCCManager.NavigationControllerIOS(this.address, "pop", params);
  }
  setLeftButtons(buttons, animated = false) {
    var unsubscribe = processButtons(buttons);
    RCCManager.NavigationControllerIOS(this.address, "setButtons", {buttons: buttons, side: "left", animated: animated});
    return unsubscribe;
  }
  setRightButtons(buttons, animated = false) {
    var unsubscribe = processButtons(buttons);
    RCCManager.NavigationControllerIOS(this.address, "setButtons", {buttons: buttons, side: "right", animated: animated});
    return unsubscribe;
  }
}
ViewControllerIOS.NavigationControllerIOS = NavigationControllerIOS;

export class TabBarControllerIOS extends ViewControllerIOS {
  //
  static instances = {};
  //
  setHidden(params) {
    return RCCManager.TabBarControllerIOS(this.address, "setTabBarHidden", params);
  }
}
ViewControllerIOS.TabBarControllerIOS = TabBarControllerIOS;

export class DrawerControllerIOS extends ViewControllerIOS {
  //
  static instances = {};
  //
  open(params) {
    return RCCManager.DrawerControllerIOS(this.address, "open", params);
  }
  close(params) {
    return RCCManager.DrawerControllerIOS(this.address, "close", params);
  }
  toggle(params) {
    return RCCManager.DrawerControllerIOS(this.address, "toggle", params);
  }
  setStyle(params) {
    return RCCManager.DrawerControllerIOS(this.address, "setStyle", params);
  }
}
ViewControllerIOS.DrawerControllerIOS = DrawerControllerIOS;

var Controllers = {
  createClass(app) {
    return app;
  },
  hijackReact() {
    return {
      createElement,
      ControllerRegistry: Controllers.ControllerRegistry,
      TabBarControllerIOS: {name: 'TabBarControllerIOS', Item: {name: 'TabBarControllerIOS.Item'}},
      NavigationControllerIOS: {name: 'NavigationControllerIOS'},
      ViewControllerIOS: {name: 'ViewControllerIOS'},
      DrawerControllerIOS: {name: 'DrawerControllerIOS'},
    };
  },
  ControllerRegistry: {
    registerController(appKey, getControllerFunc) {
      controllerRegistry[appKey] = getControllerFunc();
    },
    setRootController(appKey, animationType = 'none') {
      var controller = controllerRegistry[appKey];
      if (controller === undefined) return;
      var layout = createElement(controller);
      RCCManager.setRootController(layout, animationType);
    }
  },
  getController,
  modal: {
    showLightBox(params) {
      processProperties(params.style);
      RCCManager.modalShowLightBox(params);
    },
    dismissLightBox() {
      RCCManager.modalDismissLightBox();
    },
    showController(appKey, animationType = 'slide-down') {
      var controller = controllerRegistry[appKey];
      if (controller === undefined) return;
      var layout = createElement(controller);
      RCCManager.showController(layout, animationType);
    },
    dismissController(animationType = 'slide-down') {
      RCCManager.dismissController(animationType);
    }
  },
};

module.exports = Controllers;
