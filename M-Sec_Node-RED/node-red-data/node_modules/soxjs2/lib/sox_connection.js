"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeStrophe = require("node-strophe");

var _nodeStrophe2 = _interopRequireDefault(_nodeStrophe);

var _xml2js = require("xml2js");

var _xml2js2 = _interopRequireDefault(_xml2js);

var _sox_util = require("./sox_util");

var _sox_util2 = _interopRequireDefault(_sox_util);

var _xml_util = require("./xml_util");

var _xml_util2 = _interopRequireDefault(_xml_util);

var _device = require("./device");

var _device2 = _interopRequireDefault(_device);

var _transducer_value = require("./transducer_value");

var _transducer_value2 = _interopRequireDefault(_transducer_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Strophe = _nodeStrophe2.default.Strophe;

var $pres = Strophe.$pres;
var $iq = Strophe.$iq;

var PUBSUB_NS = "http://jabber.org/protocol/pubsub";
var PUBSUB_OWNER_NS = "http://jabber.org/protocol/pubsub#owner";

var SoxConnection = function () {
  function SoxConnection(boshService, jid, password) {
    _classCallCheck(this, SoxConnection);

    this.boshService = boshService;
    this.jid = jid;
    this.password = password;

    this._rawConn = null;
    this._isConnected = false;
    this._dataCallbacks = {};
    this._metaCallbacks = {};

    this._connEventCallbacks = {};
  }

  _createClass(SoxConnection, [{
    key: "_stropheOnRawInput",
    value: function _stropheOnRawInput(data) {
      //console.log("<<<<<< input");
      //console.log(data);
    }
  }, {
    key: "_stropheOnRawOutput",
    value: function _stropheOnRawOutput(data) {
      //console.log(">>>>>> output");
      //console.log(data);
    }
  }, {
    key: "addConnectionEventListner",
    value: function addConnectionEventListner(listener, listenerId) {
      if (listenerId === undefined) {
        listenerId = this._genRandomId();
      }

      this._connEventCallbacks[listenerId] = listener;
      return listenerId;
    }
  }, {
    key: "_callConnEvent",
    value: function _callConnEvent(methodName) {
      var callbacks = this._connEventCallbacks;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(callbacks)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callbackId = _step.value;

          var listener = callbacks[callbackId];
          var callback = listener[methodName];
          try {
            if (callback === undefined) {
              console.warn('callbackId=' + callbackId + " has not such method: " + methodName);
            } else {
              callback();
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "_stropheOnConnConnecting",
    value: function _stropheOnConnConnecting() {
      this._callConnEvent('onConnecting');
    }
  }, {
    key: "_stropheOnConnConnected",
    value: function _stropheOnConnConnected() {
      // console.log("connected 1");
      this._rawConn.send($pres().c('priority').t('-1'));
      // console.log("### connected 2");

      // this._rawConn.PubSub.bind(
      //   "xmpp:pubsub:last-published-item",
      //   that._onLastPublishedItemReceived
      // );

      // this._rawConn.PubSub.bind(
      //   "xmpp:pubsub:item-published",
      //   that._onPublishedItemReceived
      // );

      var that = this;

      var pubsubHandler = function pubsubHandler(ev) {
        // TODO
        try {
          // console.log('@@@@@ pubsubHandler!');
          // XmlUtil.dumpDom(ev);
          var cb = function cb(data) {
            // console.log("@@@@@ got data!");
          };
          var data = _sox_util2.default.parseDataPayload(that, ev, cb);
          // TODO: dispatch
          that.dispatchData(data);
        } catch (ex) {
          console.error(ex);
        }
        return true; // needed to be called every time
      };

      var service = 'pubsub.' + this.getDomain();

      this._rawConn.addHandler(pubsubHandler, null, 'message', null, null, service);

      this._isConnected = true;
      // console.log("### connected 3");
      if (this._onConnectCallback) {
        // console.log("### connected 3-1");
        this._onConnectCallback();
        // console.log("### connected 3-2");
      }
      // console.log("### connected 4 end");
      this._callConnEvent('onConnected');
    }
  }, {
    key: "_stropheOnConnDisconnecting",
    value: function _stropheOnConnDisconnecting() {
      this._callConnEvent('onDisconnecting');
    }
  }, {
    key: "_stropheOnConnDisconnected",
    value: function _stropheOnConnDisconnected() {
      this._rawConn = null;
      this._isConnected = false;
      if (this._onDisconnectCallback) {
        this._onDisconnectCallback();
      }
      this._callConnEvent('onDisconnected');
    }
  }, {
    key: "_stropheOnConnFaill",
    value: function _stropheOnConnFaill() {
      this._callConnEvent('onFail');
    }
  }, {
    key: "_stropheOnConnectionStatusUpdate",
    value: function _stropheOnConnectionStatusUpdate(status) {
      // console.log("@@ start of _stropheOnConnectionStatusUpdate");
      if (status === Strophe.Strophe.Status.CONNECTING) {
        // console.log("@@connecting");
        this._stropheOnConnConnecting();
      } else if (status === Strophe.Strophe.Status.CONNFAIL) {
        // console.log("@@connfail");
        this._stropheOnConnFaill();
      } else if (status === Strophe.Strophe.Status.DISCONNECTING) {
        // console.log("@@disconnecting");
        this._stropheOnConnDisconnecting();
      } else if (status === Strophe.Strophe.Status.DISCONNECTED) {
        // console.log("@@disconnected");
        this._stropheOnConnDisconnected();
      } else if (status === Strophe.Strophe.Status.CONNECTED) {
        // console.log("@@connected");
        this._stropheOnConnConnected();
      } else {}
      // console.log("@@ UNKNOWN STATUS: " + status);

      // console.log("@@ end of _stropheOnConnectionStatusUpdate");
      return true;
    }

    // _stropheOnLastPublishedItemReceived(obj) {
    //   let node = obj.node;
    //   if (SoxUtil.endsWithMeta(node)) {
    //     this.dispatchMetaPublish(obj);
    //   } else if (SoxUtil.endsWithData(node)) {
    //     this.dispatchDataPublish(obj);
    //   } else {
    //     // FIXME
    //   }
    // }

    // _stropheOnPublishedItemReceived(obj) {
    //   let node = obj.node;
    //   if (SoxUtil.endsWithData(node)) {
    //     this.dispatchDataPublish(obj);
    //   } else {
    //     // FIXME
    //   }
    // }

    // dispatchDataPublish(obj) {
    //   let node = obj.node;
    //   let deviceName = SoxUtil.cutDataSuffix(node);
    //   let deviceListenerTable = this._dataCallbacks[deviceName];
    //   if (deviceListenerTable === undefined) {
    //     return;
    //   }
    //
    //   let deviceToBind = this.bind(deviceName);
    //   let that = this;
    //   let onDataParsed = (data) => {
    //     that._broadcast(deviceListenerTable, data);
    //   };
    //   SoxUtil.parseDataPayload(obj.entry, deviceToBind, onDataParsed);
    //   // this._broadcast(deviceListenerTable, data);
    // }

  }, {
    key: "dispatchData",
    value: function dispatchData(data) {
      var deviceName = data.getDevice().getName();
      var dataListenerTable = this._dataCallbacks[deviceName];
      if (dataListenerTable === undefined) {
        return;
      }

      this._broadcast(dataListenerTable, data);
    }

    // dispatchMetaPublish(obj) {
    //   let node = obj.node;
    //   let deviceName = SoxUtil.cutMetaSuffix(node);
    //   let deviceListenerTable = this._metaCallbacks[deviceName];
    //   if (deviceListenerTable === undefined) {
    //     return;
    //   }
    //
    //   let deviceToBind = this.bind(deviceName);
    //   let that = this;
    //   let onMetaParsed = (meta) => {
    //     that._broadcast(deviceListenerTable, meta);
    //   };
    //   SoxUtil.parseMetaPayload(obj.entry, deviceToBind, onMetaParsed);
    //   // let meta = SoxUtil.parseMetaPayload(obj.entry, deviceToBind);
    //   // this._broadcast(deviceListenerTable, meta);
    // }

  }, {
    key: "getBoshService",
    value: function getBoshService() {
      return this.boshService;
    }
  }, {
    key: "getDomain",
    value: function getDomain() {
      return Strophe.Strophe.getDomainFromJid(this.getJID());
    }
  }, {
    key: "getJID",
    value: function getJID() {
      return this.jid;
    }
  }, {
    key: "getPassword",
    value: function getPassword() {
      return this.password;
    }
  }, {
    key: "connect",
    value: function connect(callback) {
      var conn = new Strophe.Strophe.Connection(this.getBoshService());
      this._onConnectCallback = callback;
      conn.rawInput = this._stropheOnRawInput;
      conn.rawOutput = this._stropheOnRawOutput;
      this._rawConn = conn;
      var jid = this.getJID();
      var password = this.getPassword();

      // without wrapping call of _stropheOnConnectionStatusUpdate, "this" will be missed inside the func
      var that = this;
      var cb = function cb(status) {
        return that._stropheOnConnectionStatusUpdate(status);
      };
      conn.connect(jid, password, cb);
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback) {
      if (this._rawConn !== null && this.isConnected()) {
        this._onDisconnectCallback = callback;
        this._rawConn.disconnect();
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this._isConnected;
    }
  }, {
    key: "getStropheConnection",
    value: function getStropheConnection() {
      return this._rawConn;
    }
  }, {
    key: "addListener",
    value: function addListener(device, callback, listenerId) {
      if (listenerId === undefined) {
        listenerId = this._genRandomId();
      }
      this._registerDataListener(device, listenerId, callback);
      return listenerId;
    }
  }, {
    key: "removeAllListenerForDevice",
    value: function removeAllListenerForDevice(device) {
      this._dataCallbacks = {};
    }
  }, {
    key: "removeListener",
    value: function removeListener(listenerId) {
      this._removeDataListenerWithId(listenerId);
    }
  }, {
    key: "fetchMeta",
    value: function fetchMeta(device, callback) {
      var _this = this;

      try {
        var that = this;
        var listenerId = this._genRandomId();
        var metaNode = device.getMetaNodeName();
        var _callback = function _callback(meta) {
          that._unsubNode(device.getMetaNodeName(), device.getDomain(), function () {});
          callback(meta);
        };
        var service = "pubsub." + this.getDomain();
        this._registerMetaListener(device, listenerId, _callback);

        var cb = function cb(subscriptions) {
          var jid = that._rawConn.jid;
          var mySub = subscriptions[jid];
          if (mySub !== undefined) {
            var metaNodeSubIDs = mySub[metaNode];
            var availableSubID = metaNodeSubIDs[0];

            var uniqueId = that._rawConn.getUniqueId("pubsub");
            var iq2 = $iq({ type: "get", from: jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: metaNode, max_items: 1, subid: availableSubID });
            var suc2 = function suc2(iq) {
              // console.log("\n\nrecent request success?\n\n");
            };
            var err2 = function err2(iq) {
              // console.log("\n\nrecent request failed?\n\n");
            };
            that._rawConn.sendIQ(iq2, suc2, err2);do {} while (true);
          } else {
            // first we need to sub
            // console.log("\n\n\n@@@@@ no our sub info, going to sub!\n\n\n");
            var rawJid = _this._rawConn.jid;
            var bareJid = Strophe.Strophe.getBareJidFromJid(_this._rawConn.jid);
            var subIq = $iq({ to: service, type: "set", id: _this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('subscribe', { node: metaNode, jid: rawJid });

            var subSuc = function subSuc(iq) {
              // console.log("\n\n@@@@ sub success, going to fetch subscriptions to get subid");
              that._getSubscription(device.getMetaNodeName(), device.getDomain(), function (subscriptions2) {
                var mySub2 = subscriptions2[jid];
                var metaNodeSubIDs2 = mySub2[metaNode];
                var availableSubID2 = metaNodeSubIDs2[0];

                var uniqueId3 = that._rawConn.getUniqueId("pubsub");
                var iq3 = $iq({ type: "get", from: jid, to: service, id: uniqueId3 }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: metaNode, max_items: 1, subid: availableSubID2 });

                var suc3 = function suc3(iq) {
                  var meta = _xml_util2.default.convRecentItem(that, iq);
                  _callback(meta);
                };
                var err3 = function err3(iq) {
                  // console.log("\n\n@@@@@ recent request error? 3\n\n");
                };

                that._rawConn.sendIQ(iq3, suc3, err3);
              });
            };
            that._rawConn.sendIQ(subIq, subSuc, function () {});
          }
        };
        this._getSubscription(device.getMetaNodeName(), device.getDomain(), cb);
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_getSubscription",
    value: function _getSubscription(node, domain, cb) {
      // <iq type='get'
      //     from='francisco@denmark.lit/barracks'
      //     to='pubsub.shakespeare.lit'
      //     id='subscriptions1'>
      //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
      //     <subscriptions/>
      //   </pubsub>
      // </iq>
      var service = "pubsub." + domain;
      var uniqueId = this._rawConn.getUniqueId("pubsub");
      var iq = $iq({ type: "get", from: this._rawConn.jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("subscriptions");

      var suc = function suc(iq) {
        var converted = _xml_util2.default.convSubscriptions(iq);
        cb(converted);
      };
      var err = function err(iq) {};

      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "bind",
    value: function bind(deviceName, domain) {
      if (domain === undefined) {
        domain = this.getDomain();
      }

      return new _device2.default(this, deviceName, domain);
    }
  }, {
    key: "fetchDevices",
    value: function fetchDevices(callback, domain) {
      if (domain === undefined) {
        domain = this.getDomain();
      }
      // https://github.com/strophe/strophejs-plugin-pubsub/blob/master/strophe.pubsub.js#L297
      var jid = this.getJID();
      var service = "pubsub." + domain;
      var iq = $iq({ from: jid, to: service, type: "get", id: this._rawConn.getUniqueId("pubsub") }).c('query', { xmlns: Strophe.Strophe.NS.DISCO_ITEMS });

      var that = this;
      var success = function success(msg) {
        var query = msg._childNodesList[0];
        var items = query._childNodesList;

        var check = {};
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var node = item._attributes.node._valueForAttrModified;
          if (_sox_util2.default.endsWithData(node)) {
            var realNode = _sox_util2.default.cutDataSuffix(node);
            if (check[realNode] === undefined) {
              check[realNode] = { data: true };
            } else {
              check[realNode].data = true;
            }
          } else if (_sox_util2.default.endsWithMeta(node)) {
            var _realNode = _sox_util2.default.cutMetaSuffix(node);
            if (check[_realNode] === undefined) {
              check[_realNode] = { meta: true };
            } else {
              check[_realNode].data = true;
            }
          }
        }

        var devices = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(check)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var deviceName = _step2.value;

            var c = check[deviceName];
            if (c.data && c.meta) {
              var device = that.bind(deviceName);
              devices.push(device);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        callback(devices);
      };

      var error = function error(msg) {};

      return this._rawConn.sendIQ(iq.tree(), success, error, undefined);
    }
  }, {
    key: "fetchSubscriptions",
    value: function fetchSubscriptions(callback) {
      this._rawConn.PubSub.getSubscriptions(function (subscriptions) {
        // TODO: Device オブジェクトのリストに加工してcallbackを呼び出す

      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(device) {
      var dataNode = device.getDataNodeName();
      var domain = device.getDomain();
      // let service = "pubsub." + device.getDomain();

      // this._subNode(dataNode, device.getDomain());
      var that = this;

      this.unsubscribe(device, function () {
        // console.log("@@@ unsubscribe callback called");
        var cb = function cb() {};
        that._subNode(dataNode, domain, false, cb);
        // console.log("@@@ _subNode called");
      });
    }
  }, {
    key: "_subNode",
    value: function _subNode(node, domain, requestRecent, callback) {
      // https://github.com/strophe/strophejs-plugin-pubsub/blob/master/strophe.pubsub.js#L297
      var that = this;
      var service = "pubsub." + domain;

      // http://ggozad.com/strophe.plugins/docs/strophe.pubsub.html
      // console.log("@@@@@@@ raw jid = " + this._rawConn.jid);
      var rawJid = this._rawConn.jid;
      var bareJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);
      var iq = $iq({ to: service, type: "set", id: this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('subscribe', { node: node, jid: rawJid });

      var suc = function suc(iq) {
        // https://xmpp.org/extensions/xep-0060.html#subscriber-retrieve-requestrecent

        // <iq type='get'
        //     from='francisco@denmark.lit/barracks'
        //     to='pubsub.shakespeare.lit'
        //     id='items2'>
        //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
        //     <items node='princely_musings' max_items='2'/>
        //   </pubsub>
        // </iq>
        if (requestRecent) {
          var uniqueId = that._rawConn.getUniqueId("pubsub");
          var iq2 = $iq({ type: "get", from: that._rawConn.jid, to: service, id: uniqueId }).c("pubsub", { xmlns: PUBSUB_NS }).c("items", { node: node, max_items: 1 });
          var suc2 = function suc2(iq) {
            if (callback) {
              callback();
            }
          };
          var err2 = function err2(iq) {};
          that._rawConn.sendIQ(iq2, suc2, err2);
        } else {
          callback();
        }
      };
      var err = function err(iq) {};
      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(device, callback) {
      var dataNode = device.getDataNodeName();
      var domain = device.getDomain();
      var that = this;

      var cb = function cb() {
        if (callback) {
          callback();
        }
      };

      var myJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);

      this._getSubscription(dataNode, domain, function (sub) {
        // console.log("_getSubscription callback called in unsubscribe");
        if (sub[myJid] === undefined) {
          sub[myJid] = {};
        }
        var subids = sub[myJid][dataNode];
        if (subids === undefined) {
          // console.log("@@@ subids === undefined!");
          cb();
          return;
        }
        // console.log("@@@ subids.length===" + subids.length);
        if (subids.length == 0) {
          that._unsubNode(dataNode, domain, cb);
        } else {
          var delNextFunc = function delNextFunc(i) {
            if (subids.length <= i) {
              return cb;
            }
            return function () {
              that._unsubNode(dataNode, domain, delNextFunc(i + 1), subids[i]);
              // console.log("@@@ _unsubNode called for subid=" + subids[i]);
            };
          };

          that._unsubNode(dataNode, domain, delNextFunc(1), subids[0]);
          // console.log("@@@ _unsubNode called for subid=" + subids[0]);
        }
      });
      // this._unsubNode(dataNode, domain, () => {
      //   // TODO
      // });
    }
  }, {
    key: "_unsubNode",
    value: function _unsubNode(node, domain, callback, subid) {
      var service = "pubsub." + domain;
      // <iq type='set'
      // from='francisco@denmark.lit/barracks'
      // to='pubsub.shakespeare.lit'
      // id='unsub1'>
      //   <pubsub xmlns='http://jabber.org/protocol/pubsub'>
      //      <unsubscribe
      //          node='princely_musings'
      //          jid='francisco@denmark.lit'/>
      //   </pubsub>
      // </iq>
      var bareJid = Strophe.Strophe.getBareJidFromJid(this._rawConn.jid);
      // console.log("_unsubNode: bareJid=" + bareJid);

      var unsubAttrs = { node: node, jid: bareJid };
      if (subid !== undefined) {
        unsubAttrs.subid = subid;
      }

      var iq = $iq({ to: service, type: "set", id: this._rawConn.getUniqueId("pubsub") }).c('pubsub', { xmlns: "http://jabber.org/protocol/pubsub" }).c('unsubscribe', unsubAttrs);

      var suc = function suc(iq) {
        // console.log("unsub success");
        if (callback) {
          callback(iq);
        }
      };
      var err = function err(iq) {
        // console.log("unsub failed");
        // XmlUtil.dumpDom(iq);
      };
      this._rawConn.sendIQ(iq, suc, err);
    }
  }, {
    key: "unsubscribeAll",
    value: function unsubscribeAll() {
      var that = this;
      this.fetchSubscriptions(function (devices) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = devices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var device = _step3.value;

            that.unsubscribe(device);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      });
    }
  }, {
    key: "createDevice",
    value: function createDevice(device, meta, cbSuccess, cbFailed) {
      try {
        var domain = device.getDomain();
        var metaNode = device.getMetaNodeName();
        var dataNode = device.getDataNodeName();
        var that = this;
        this._createNode(metaNode, domain, function (iq) {
          that._createNode(dataNode, domain, function (iq2) {
            // TODO: send meta to meta node
            that._publishToNode(metaNode, device.getDomain(), meta, cbSuccess, cbFailed);
          }, cbFailed);
        }, cbFailed);
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_createNode",
    value: function _createNode(nodeName, domain, cbSuccess, cbFailed) {
      // console.log("\n\n---- _createNode");
      var service = 'pubsub.' + domain;
      var conn = this._rawConn;
      var uniqueId = conn.getUniqueId('pubsub');
      // console.log("\n\n---- _createNode2");
      try {
        // const iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid })
        //   .c('pubsub', { xmlns: PUBSUB_NS })
        //   .c('create', { node: nodeName });
        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_NS }).c('create', { node: nodeName }).c('configure').c('x', { xmlns: 'jabber:x:data', type: 'submit' }).c('field', { var: 'pubsub#access_model', type: 'list-single' }).c('value').t('open').up().up().c('field', { var: 'pubsub#publish_model', type: 'list-single' }).c('value').t('open').up().up().c('field', { var: 'pubsub#persist_items', type: 'boolean' }).c('value').t('1').up().up().c('field', { var: 'pubsub#max_items', type: 'text-single' }).c('value').t('1');
        // console.log("\n\n---- _createNode3");

        conn.sendIQ(iq, cbSuccess, cbFailed);
        // console.log("\n\n---- _createNode4");
      } catch (e) {
        console.log(e.stack);
      }
    }
  }, {
    key: "_deleteNode",
    value: function _deleteNode(nodeName, domain, cbSuccess, cbFailed) {
      var service = 'pubsub.' + domain;
      var conn = this._rawConn;
      var uniqueId = conn.getUniqueId('pubsub');
      // const bareJid = Strophe.Strophe.getBareJidFromJid(conn.jid);
      // const fromJid = conn.
      var iq =
      // const iq = $iq({ to: service, type: 'set', id: uniqueId, from: bareJid })
      $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_OWNER_NS }).c('delete', { node: nodeName });

      conn.sendIQ(iq, cbSuccess, cbFailed);
    }
  }, {
    key: "deleteDevice",
    value: function deleteDevice(device, cbSuccess, cbFailed) {
      var domain = device.getDomain();
      var metaNode = device.getMetaNodeName();
      var dataNode = device.getDataNodeName();
      var that = this;
      this._deleteNode(metaNode, domain, function (iq) {
        that._deleteNode(dataNode, domain, cbSuccess, cbFailed);
      }, function (iq) {
        cbFailed(iq);
        that._deleteNode(dataNode, domain, function (iq2) {}, function (iq2) {});
      });
    }
  }, {
    key: "publish",
    value: function publish(data, cbSuccess, cbFailed) {
      var device = data.getDevice();
      var domain = device.getDomain();
      var dataNode = device.getDataNodeName();
      this._publishToNode(dataNode, domain, data, cbSuccess, cbFailed);
    }
  }, {
    key: "_publishToNode",
    value: function _publishToNode(nodeName, domain, publishContent, cbSuccess, cbFailed) {
      // expects publishContent as an instance of DeviceMeta or Data
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');
        var itemUniqueId = conn.getUniqueId('item');
        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_NS }).c('publish', { node: nodeName }).c('item', { id: itemUniqueId })
        // .cnode(publishContent)
        ;

        publishContent.appendToNode(iq);

        conn.sendIQ(iq, cbSuccess, cbFailed);
      } catch (e) {
        console.error(e.stack);
      }
    }
  }, {
    key: "_genRandomId",
    value: function _genRandomId() {
      var chars = "abcdef01234567890";
      var nChars = chars.length;
      var len = 128;
      var ret = "";
      for (var i = 0; i < len; i++) {
        var idx = Math.floor(Math.random() * nChars);
        var char = chars.charAt(idx);
        ret = ret + char;
      }
      return ret;
    }
  }, {
    key: "_registerMetaListener",
    value: function _registerMetaListener(device, listenerId, callback) {
      this._registerListener(this._metaCallbacks, device, listenerId, callback);
    }
  }, {
    key: "_registerDataListener",
    value: function _registerDataListener(device, listenerId, callback) {
      this._registerListener(this._dataCallbacks, device, listenerId, callback);
    }
  }, {
    key: "_registerListener",
    value: function _registerListener(table, device, listenerId, callback) {
      var deviceName = device.getName();

      if (table[deviceName] === undefined) {
        table[deviceName] = {};
      }

      table[deviceName][listenerId] = callback;
    }
  }, {
    key: "_broadcast",
    value: function _broadcast(table, argument) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = Object.keys(table)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var listenerId = _step4.value;

          var listener = table[listenerId];
          // console.log('$$$$ listenerId=' + listenerId + ", listener=" + listener);
          listener(argument);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "_removeMetaListenerWithId",
    value: function _removeMetaListenerWithId(listenerId) {
      this._removeListenerWithId(this._metaCallbacks, listenerId);
    }
  }, {
    key: "_removeDataListenerWithId",
    value: function _removeDataListenerWithId(listenerId) {
      this._removeListenerWithId(this._dataCallbacks, listenerId);
    }
  }, {
    key: "_removeListenerWithId",
    value: function _removeListenerWithId(table, listenerId) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = Object.keys(table)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var devName = _step5.value;

          var devTable = table[devName];
          var found = false;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = Object.keys(devTable)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var lstnId = _step6.value;

              if (lstnId === listenerId) {
                found = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          if (found) {
            delete devTable[listenerId];
            break;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "setAccessPermission",
    value: function setAccessPermission(nodeName, domain, accessModel, cbSuccess, cbFailed) {
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');

        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_OWNER_NS }).c('configure', { node: nodeName }).c('x', { xmlns: 'jabber:x:data', type: 'submit' }).c('field', { var: 'pubsub#access_model', type: 'list-single' }).c('value').t(accessModel);
        conn.sendIQ(iq, cbSuccess, cbFailed);
      } catch (e) {
        console.error(e.stack);
      }
    }
  }, {
    key: "setAffaliation",
    value: function setAffaliation(nodeName, domain, affaliation, cbSuccess, cbFailed) {
      try {
        var service = 'pubsub.' + domain;
        var conn = this._rawConn;
        var uniqueId = conn.getUniqueId('pubsub');

        var iq = $iq({ to: service, type: 'set', id: uniqueId, from: conn.jid }).c('pubsub', { xmlns: PUBSUB_OWNER_NS }).c('affiliations', { node: nodeName });

        for (var i = 0; i < affaliation.length; i++) {
          iq.c('affiliation', { xmlns: PUBSUB_OWNER_NS, jid: affaliation[i], affiliation: 'none' }).up();
        }
        conn.sendIQ(iq, cbSuccess, cbFailed);
      } catch (e) {
        console.error(e.stack);
      }
    }
  }]);

  return SoxConnection;
}();

module.exports = SoxConnection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfY29ubmVjdGlvbi5qcyJdLCJuYW1lcyI6WyJTdHJvcGhlIiwibm9kZVN0cm9waGUiLCIkcHJlcyIsIiRpcSIsIlBVQlNVQl9OUyIsIlBVQlNVQl9PV05FUl9OUyIsIlNveENvbm5lY3Rpb24iLCJib3NoU2VydmljZSIsImppZCIsInBhc3N3b3JkIiwiX3Jhd0Nvbm4iLCJfaXNDb25uZWN0ZWQiLCJfZGF0YUNhbGxiYWNrcyIsIl9tZXRhQ2FsbGJhY2tzIiwiX2Nvbm5FdmVudENhbGxiYWNrcyIsImRhdGEiLCJsaXN0ZW5lciIsImxpc3RlbmVySWQiLCJ1bmRlZmluZWQiLCJfZ2VuUmFuZG9tSWQiLCJtZXRob2ROYW1lIiwiY2FsbGJhY2tzIiwiT2JqZWN0Iiwia2V5cyIsImNhbGxiYWNrSWQiLCJjYWxsYmFjayIsImNvbnNvbGUiLCJ3YXJuIiwiZSIsImVycm9yIiwiX2NhbGxDb25uRXZlbnQiLCJzZW5kIiwiYyIsInQiLCJ0aGF0IiwicHVic3ViSGFuZGxlciIsImV2IiwiY2IiLCJTb3hVdGlsIiwicGFyc2VEYXRhUGF5bG9hZCIsImRpc3BhdGNoRGF0YSIsImV4Iiwic2VydmljZSIsImdldERvbWFpbiIsImFkZEhhbmRsZXIiLCJfb25Db25uZWN0Q2FsbGJhY2siLCJfb25EaXNjb25uZWN0Q2FsbGJhY2siLCJzdGF0dXMiLCJTdGF0dXMiLCJDT05ORUNUSU5HIiwiX3N0cm9waGVPbkNvbm5Db25uZWN0aW5nIiwiQ09OTkZBSUwiLCJfc3Ryb3BoZU9uQ29ubkZhaWxsIiwiRElTQ09OTkVDVElORyIsIl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZyIsIkRJU0NPTk5FQ1RFRCIsIl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkIiwiQ09OTkVDVEVEIiwiX3N0cm9waGVPbkNvbm5Db25uZWN0ZWQiLCJkZXZpY2VOYW1lIiwiZ2V0RGV2aWNlIiwiZ2V0TmFtZSIsImRhdGFMaXN0ZW5lclRhYmxlIiwiX2Jyb2FkY2FzdCIsImdldERvbWFpbkZyb21KaWQiLCJnZXRKSUQiLCJjb25uIiwiQ29ubmVjdGlvbiIsImdldEJvc2hTZXJ2aWNlIiwicmF3SW5wdXQiLCJfc3Ryb3BoZU9uUmF3SW5wdXQiLCJyYXdPdXRwdXQiLCJfc3Ryb3BoZU9uUmF3T3V0cHV0IiwiZ2V0UGFzc3dvcmQiLCJfc3Ryb3BoZU9uQ29ubmVjdGlvblN0YXR1c1VwZGF0ZSIsImNvbm5lY3QiLCJpc0Nvbm5lY3RlZCIsImRpc2Nvbm5lY3QiLCJkZXZpY2UiLCJfcmVnaXN0ZXJEYXRhTGlzdGVuZXIiLCJfcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkIiwibWV0YU5vZGUiLCJnZXRNZXRhTm9kZU5hbWUiLCJfY2FsbGJhY2siLCJtZXRhIiwiX3Vuc3ViTm9kZSIsIl9yZWdpc3Rlck1ldGFMaXN0ZW5lciIsInN1YnNjcmlwdGlvbnMiLCJteVN1YiIsIm1ldGFOb2RlU3ViSURzIiwiYXZhaWxhYmxlU3ViSUQiLCJ1bmlxdWVJZCIsImdldFVuaXF1ZUlkIiwiaXEyIiwidHlwZSIsImZyb20iLCJ0byIsImlkIiwieG1sbnMiLCJub2RlIiwibWF4X2l0ZW1zIiwic3ViaWQiLCJzdWMyIiwiaXEiLCJlcnIyIiwic2VuZElRIiwicmF3SmlkIiwiYmFyZUppZCIsImdldEJhcmVKaWRGcm9tSmlkIiwic3ViSXEiLCJzdWJTdWMiLCJfZ2V0U3Vic2NyaXB0aW9uIiwic3Vic2NyaXB0aW9uczIiLCJteVN1YjIiLCJtZXRhTm9kZVN1YklEczIiLCJhdmFpbGFibGVTdWJJRDIiLCJ1bmlxdWVJZDMiLCJpcTMiLCJzdWMzIiwiWG1sVXRpbCIsImNvbnZSZWNlbnRJdGVtIiwiZXJyMyIsImxvZyIsInN0YWNrIiwiZG9tYWluIiwic3VjIiwiY29udmVydGVkIiwiY29udlN1YnNjcmlwdGlvbnMiLCJlcnIiLCJEZXZpY2UiLCJOUyIsIkRJU0NPX0lURU1TIiwic3VjY2VzcyIsIm1zZyIsInF1ZXJ5IiwiX2NoaWxkTm9kZXNMaXN0IiwiaXRlbXMiLCJjaGVjayIsImkiLCJsZW5ndGgiLCJpdGVtIiwiX2F0dHJpYnV0ZXMiLCJfdmFsdWVGb3JBdHRyTW9kaWZpZWQiLCJlbmRzV2l0aERhdGEiLCJyZWFsTm9kZSIsImN1dERhdGFTdWZmaXgiLCJlbmRzV2l0aE1ldGEiLCJjdXRNZXRhU3VmZml4IiwiZGV2aWNlcyIsImJpbmQiLCJwdXNoIiwidHJlZSIsIlB1YlN1YiIsImdldFN1YnNjcmlwdGlvbnMiLCJkYXRhTm9kZSIsImdldERhdGFOb2RlTmFtZSIsInVuc3Vic2NyaWJlIiwiX3N1Yk5vZGUiLCJyZXF1ZXN0UmVjZW50IiwibXlKaWQiLCJzdWIiLCJzdWJpZHMiLCJkZWxOZXh0RnVuYyIsInVuc3ViQXR0cnMiLCJmZXRjaFN1YnNjcmlwdGlvbnMiLCJjYlN1Y2Nlc3MiLCJjYkZhaWxlZCIsIl9jcmVhdGVOb2RlIiwiX3B1Ymxpc2hUb05vZGUiLCJub2RlTmFtZSIsInZhciIsInVwIiwiX2RlbGV0ZU5vZGUiLCJwdWJsaXNoQ29udGVudCIsIml0ZW1VbmlxdWVJZCIsImFwcGVuZFRvTm9kZSIsImNoYXJzIiwibkNoYXJzIiwibGVuIiwicmV0IiwiaWR4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiY2hhciIsImNoYXJBdCIsIl9yZWdpc3Rlckxpc3RlbmVyIiwidGFibGUiLCJhcmd1bWVudCIsIl9yZW1vdmVMaXN0ZW5lcldpdGhJZCIsImRldk5hbWUiLCJkZXZUYWJsZSIsImZvdW5kIiwibHN0bklkIiwiYWNjZXNzTW9kZWwiLCJhZmZhbGlhdGlvbiIsImFmZmlsaWF0aW9uIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBVUE7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFiQSxJQUFNQSxVQUFVQyxzQkFBWUQsT0FBNUI7O0FBRUEsSUFBTUUsUUFBUUYsUUFBUUUsS0FBdEI7QUFDQSxJQUFNQyxNQUFNSCxRQUFRRyxHQUFwQjs7QUFFQSxJQUFNQyxZQUFZLG1DQUFsQjtBQUNBLElBQU1DLGtCQUFrQix5Q0FBeEI7O0lBU01DLGE7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SUFBSXlELFlBQVl4RCxNQUFoQyxFQUF3Q0QsR0FBeEMsRUFBNkM7QUFDM0NuQyxhQUFHdkUsQ0FBSCxDQUFLLGFBQUwsRUFBb0IsRUFBRWtFLE9BQU83RixlQUFULEVBQTBCRyxLQUFLMkwsWUFBWXpELENBQVosQ0FBL0IsRUFBK0MwRCxhQUFhLE1BQTVELEVBQXBCLEVBQTBGekIsRUFBMUY7QUFDRDtBQUNEekcsYUFBS3VDLE1BQUwsQ0FBWUYsRUFBWixFQUFnQjhELFNBQWhCLEVBQTJCQyxRQUEzQjtBQUVELE9BZEQsQ0FjRSxPQUFPMUksQ0FBUCxFQUFVO0FBQ1ZGLGdCQUFRRyxLQUFSLENBQWNELEVBQUUrRixLQUFoQjtBQUNEO0FBQ0Y7Ozs7OztBQUtIMEUsT0FBT0MsT0FBUCxHQUFpQmhNLGFBQWpCIiwiZmlsZSI6InNveF9jb25uZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG5vZGVTdHJvcGhlIGZyb20gXCJub2RlLXN0cm9waGVcIjtcblxuY29uc3QgU3Ryb3BoZSA9IG5vZGVTdHJvcGhlLlN0cm9waGU7XG5cbmNvbnN0ICRwcmVzID0gU3Ryb3BoZS4kcHJlcztcbmNvbnN0ICRpcSA9IFN0cm9waGUuJGlxO1xuXG5jb25zdCBQVUJTVUJfTlMgPSBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiO1xuY29uc3QgUFVCU1VCX09XTkVSX05TID0gXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWIjb3duZXJcIjtcblxuaW1wb3J0IHBhcnNlU3RyaW5nIGZyb20gXCJ4bWwyanNcIjtcblxuaW1wb3J0IFNveFV0aWwgZnJvbSBcIi4vc294X3V0aWxcIjtcbmltcG9ydCBYbWxVdGlsIGZyb20gXCIuL3htbF91dGlsXCI7XG5pbXBvcnQgRGV2aWNlIGZyb20gXCIuL2RldmljZVwiO1xuaW1wb3J0IFRyYW5zZHVjZXJWYWx1ZSBmcm9tIFwiLi90cmFuc2R1Y2VyX3ZhbHVlXCI7XG5cbmNsYXNzIFNveENvbm5lY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihib3NoU2VydmljZSwgamlkLCBwYXNzd29yZCkge1xuICAgIHRoaXMuYm9zaFNlcnZpY2UgPSBib3NoU2VydmljZTtcbiAgICB0aGlzLmppZCA9IGppZDtcbiAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XG5cbiAgICB0aGlzLl9yYXdDb25uID0gbnVsbDtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2RhdGFDYWxsYmFja3MgPSB7fTtcbiAgICB0aGlzLl9tZXRhQ2FsbGJhY2tzID0ge307XG5cbiAgICB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3MgPSB7fTtcbiAgfVxuXG4gIF9zdHJvcGhlT25SYXdJbnB1dChkYXRhKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIjw8PDw8PCBpbnB1dFwiKTtcbiAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xuICB9XG5cbiAgX3N0cm9waGVPblJhd091dHB1dChkYXRhKSB7XG4gICAgLy9jb25zb2xlLmxvZyhcIj4+Pj4+PiBvdXRwdXRcIik7XG4gICAgLy9jb25zb2xlLmxvZyhkYXRhKTtcbiAgfVxuXG4gIGFkZENvbm5lY3Rpb25FdmVudExpc3RuZXIobGlzdGVuZXIsIGxpc3RlbmVySWQpIHtcbiAgICBpZiAobGlzdGVuZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3NbbGlzdGVuZXJJZF0gPSBsaXN0ZW5lcjtcbiAgICByZXR1cm4gbGlzdGVuZXJJZDtcbiAgfVxuXG4gIF9jYWxsQ29ubkV2ZW50KG1ldGhvZE5hbWUpIHtcbiAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9jb25uRXZlbnRDYWxsYmFja3M7XG4gICAgZm9yIChjb25zdCBjYWxsYmFja0lkIG9mIE9iamVjdC5rZXlzKGNhbGxiYWNrcykpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gY2FsbGJhY2tzW2NhbGxiYWNrSWRdO1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSBsaXN0ZW5lclttZXRob2ROYW1lXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdjYWxsYmFja0lkPScgKyBjYWxsYmFja0lkICsgXCIgaGFzIG5vdCBzdWNoIG1ldGhvZDogXCIgKyBtZXRob2ROYW1lKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RpbmcoKSB7XG4gICAgdGhpcy5fY2FsbENvbm5FdmVudCgnb25Db25uZWN0aW5nJyk7XG4gIH1cblxuICBfc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCgpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImNvbm5lY3RlZCAxXCIpO1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZCgkcHJlcygpLmMoJ3ByaW9yaXR5JykudCgnLTEnKSk7XG4gICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDJcIik7XG5cbiAgICAvLyB0aGlzLl9yYXdDb25uLlB1YlN1Yi5iaW5kKFxuICAgIC8vICAgXCJ4bXBwOnB1YnN1YjpsYXN0LXB1Ymxpc2hlZC1pdGVtXCIsXG4gICAgLy8gICB0aGF0Ll9vbkxhc3RQdWJsaXNoZWRJdGVtUmVjZWl2ZWRcbiAgICAvLyApO1xuXG4gICAgLy8gdGhpcy5fcmF3Q29ubi5QdWJTdWIuYmluZChcbiAgICAvLyAgIFwieG1wcDpwdWJzdWI6aXRlbS1wdWJsaXNoZWRcIixcbiAgICAvLyAgIHRoYXQuX29uUHVibGlzaGVkSXRlbVJlY2VpdmVkXG4gICAgLy8gKTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIGxldCBwdWJzdWJIYW5kbGVyID0gKGV2KSA9PiB7XG4gICAgICAvLyBUT0RPXG4gICAgICB0cnkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnQEBAQEAgcHVic3ViSGFuZGxlciEnKTtcbiAgICAgICAgLy8gWG1sVXRpbC5kdW1wRG9tKGV2KTtcbiAgICAgICAgbGV0IGNiID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAIGdvdCBkYXRhIVwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGRhdGEgPSBTb3hVdGlsLnBhcnNlRGF0YVBheWxvYWQodGhhdCwgZXYsIGNiKTtcbiAgICAgICAgLy8gVE9ETzogZGlzcGF0Y2hcbiAgICAgICAgdGhhdC5kaXNwYXRjaERhdGEoZGF0YSk7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGV4KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlOyAvLyBuZWVkZWQgdG8gYmUgY2FsbGVkIGV2ZXJ5IHRpbWVcbiAgICB9O1xuXG4gICAgbGV0IHNlcnZpY2UgPSAncHVic3ViLicgKyB0aGlzLmdldERvbWFpbigpO1xuXG4gICAgdGhpcy5fcmF3Q29ubi5hZGRIYW5kbGVyKFxuICAgICAgcHVic3ViSGFuZGxlcixcbiAgICAgIG51bGwsXG4gICAgICAnbWVzc2FnZScsXG4gICAgICBudWxsLFxuICAgICAgbnVsbCxcbiAgICAgIHNlcnZpY2VcbiAgICApO1xuXG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiIyMjIGNvbm5lY3RlZCAzXCIpO1xuICAgIGlmICh0aGlzLl9vbkNvbm5lY3RDYWxsYmFjaykge1xuICAgICAgLy8gY29uc29sZS5sb2coXCIjIyMgY29ubmVjdGVkIDMtMVwiKTtcbiAgICAgIHRoaXMuX29uQ29ubmVjdENhbGxiYWNrKCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgMy0yXCIpO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhcIiMjIyBjb25uZWN0ZWQgNCBlbmRcIik7XG4gICAgdGhpcy5fY2FsbENvbm5FdmVudCgnb25Db25uZWN0ZWQnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGluZygpIHtcbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkRpc2Nvbm5lY3RpbmcnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkKCkge1xuICAgIHRoaXMuX3Jhd0Nvbm4gPSBudWxsO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9vbkRpc2Nvbm5lY3RDYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkRpc2Nvbm5lY3RlZCcpO1xuICB9XG5cbiAgX3N0cm9waGVPbkNvbm5GYWlsbCgpIHtcbiAgICB0aGlzLl9jYWxsQ29ubkV2ZW50KCdvbkZhaWwnKTtcbiAgfVxuXG4gIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlKHN0YXR1cykge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgc3RhcnQgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGVcIik7XG4gICAgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5DT05ORUNUSU5HKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmVjdGluZ1wiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5Db25uZWN0aW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkZBSUwpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBjb25uZmFpbFwiKTtcbiAgICAgIHRoaXMuX3N0cm9waGVPbkNvbm5GYWlsbCgpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTdHJvcGhlLlN0cm9waGUuU3RhdHVzLkRJU0NPTk5FQ1RJTkcpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBkaXNjb25uZWN0aW5nXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkRpc2Nvbm5lY3RpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gU3Ryb3BoZS5TdHJvcGhlLlN0YXR1cy5ESVNDT05ORUNURUQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLl9zdHJvcGhlT25Db25uRGlzY29ubmVjdGVkKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFN0cm9waGUuU3Ryb3BoZS5TdGF0dXMuQ09OTkVDVEVEKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5fc3Ryb3BoZU9uQ29ubkNvbm5lY3RlZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAIFVOS05PV04gU1RBVFVTOiBcIiArIHN0YXR1cyk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKFwiQEAgZW5kIG9mIF9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlXCIpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gX3N0cm9waGVPbkxhc3RQdWJsaXNoZWRJdGVtUmVjZWl2ZWQob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBpZiAoU294VXRpbC5lbmRzV2l0aE1ldGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hNZXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICAvLyBGSVhNRVxuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8vIF9zdHJvcGhlT25QdWJsaXNoZWRJdGVtUmVjZWl2ZWQob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgLy8gICAgIHRoaXMuZGlzcGF0Y2hEYXRhUHVibGlzaChvYmopO1xuICAvLyAgIH0gZWxzZSB7XG4gIC8vICAgICAvLyBGSVhNRVxuICAvLyAgIH1cbiAgLy8gfVxuXG4gIC8vIGRpc3BhdGNoRGF0YVB1Ymxpc2gob2JqKSB7XG4gIC8vICAgbGV0IG5vZGUgPSBvYmoubm9kZTtcbiAgLy8gICBsZXQgZGV2aWNlTmFtZSA9IFNveFV0aWwuY3V0RGF0YVN1ZmZpeChub2RlKTtcbiAgLy8gICBsZXQgZGV2aWNlTGlzdGVuZXJUYWJsZSA9IHRoaXMuX2RhdGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gIC8vICAgaWYgKGRldmljZUxpc3RlbmVyVGFibGUgPT09IHVuZGVmaW5lZCkge1xuICAvLyAgICAgcmV0dXJuO1xuICAvLyAgIH1cbiAgLy9cbiAgLy8gICBsZXQgZGV2aWNlVG9CaW5kID0gdGhpcy5iaW5kKGRldmljZU5hbWUpO1xuICAvLyAgIGxldCB0aGF0ID0gdGhpcztcbiAgLy8gICBsZXQgb25EYXRhUGFyc2VkID0gKGRhdGEpID0+IHtcbiAgLy8gICAgIHRoYXQuX2Jyb2FkY2FzdChkZXZpY2VMaXN0ZW5lclRhYmxlLCBkYXRhKTtcbiAgLy8gICB9O1xuICAvLyAgIFNveFV0aWwucGFyc2VEYXRhUGF5bG9hZChvYmouZW50cnksIGRldmljZVRvQmluZCwgb25EYXRhUGFyc2VkKTtcbiAgLy8gICAvLyB0aGlzLl9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgZGF0YSk7XG4gIC8vIH1cbiAgZGlzcGF0Y2hEYXRhKGRhdGEpIHtcbiAgICBsZXQgZGV2aWNlTmFtZSA9IGRhdGEuZ2V0RGV2aWNlKCkuZ2V0TmFtZSgpO1xuICAgIGxldCBkYXRhTGlzdGVuZXJUYWJsZSA9IHRoaXMuX2RhdGFDYWxsYmFja3NbZGV2aWNlTmFtZV07XG4gICAgaWYgKGRhdGFMaXN0ZW5lclRhYmxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9icm9hZGNhc3QoZGF0YUxpc3RlbmVyVGFibGUsIGRhdGEpO1xuICB9XG5cbiAgLy8gZGlzcGF0Y2hNZXRhUHVibGlzaChvYmopIHtcbiAgLy8gICBsZXQgbm9kZSA9IG9iai5ub2RlO1xuICAvLyAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXRNZXRhU3VmZml4KG5vZGUpO1xuICAvLyAgIGxldCBkZXZpY2VMaXN0ZW5lclRhYmxlID0gdGhpcy5fbWV0YUNhbGxiYWNrc1tkZXZpY2VOYW1lXTtcbiAgLy8gICBpZiAoZGV2aWNlTGlzdGVuZXJUYWJsZSA9PT0gdW5kZWZpbmVkKSB7XG4gIC8vICAgICByZXR1cm47XG4gIC8vICAgfVxuICAvL1xuICAvLyAgIGxldCBkZXZpY2VUb0JpbmQgPSB0aGlzLmJpbmQoZGV2aWNlTmFtZSk7XG4gIC8vICAgbGV0IHRoYXQgPSB0aGlzO1xuICAvLyAgIGxldCBvbk1ldGFQYXJzZWQgPSAobWV0YSkgPT4ge1xuICAvLyAgICAgdGhhdC5fYnJvYWRjYXN0KGRldmljZUxpc3RlbmVyVGFibGUsIG1ldGEpO1xuICAvLyAgIH07XG4gIC8vICAgU294VXRpbC5wYXJzZU1ldGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kLCBvbk1ldGFQYXJzZWQpO1xuICAvLyAgIC8vIGxldCBtZXRhID0gU294VXRpbC5wYXJzZU1ldGFQYXlsb2FkKG9iai5lbnRyeSwgZGV2aWNlVG9CaW5kKTtcbiAgLy8gICAvLyB0aGlzLl9icm9hZGNhc3QoZGV2aWNlTGlzdGVuZXJUYWJsZSwgbWV0YSk7XG4gIC8vIH1cblxuICBnZXRCb3NoU2VydmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5ib3NoU2VydmljZTtcbiAgfVxuXG4gIGdldERvbWFpbigpIHtcbiAgICByZXR1cm4gU3Ryb3BoZS5TdHJvcGhlLmdldERvbWFpbkZyb21KaWQodGhpcy5nZXRKSUQoKSk7XG4gIH1cblxuICBnZXRKSUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuamlkO1xuICB9XG5cbiAgZ2V0UGFzc3dvcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFzc3dvcmQ7XG4gIH1cblxuICBjb25uZWN0KGNhbGxiYWNrKSB7XG4gICAgbGV0IGNvbm4gPSBuZXcgU3Ryb3BoZS5TdHJvcGhlLkNvbm5lY3Rpb24odGhpcy5nZXRCb3NoU2VydmljZSgpKTtcbiAgICB0aGlzLl9vbkNvbm5lY3RDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIGNvbm4ucmF3SW5wdXQgPSB0aGlzLl9zdHJvcGhlT25SYXdJbnB1dDtcbiAgICBjb25uLnJhd091dHB1dCA9IHRoaXMuX3N0cm9waGVPblJhd091dHB1dDtcbiAgICB0aGlzLl9yYXdDb25uID0gY29ubjtcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLmdldFBhc3N3b3JkKCk7XG5cbiAgICAvLyB3aXRob3V0IHdyYXBwaW5nIGNhbGwgb2YgX3N0cm9waGVPbkNvbm5lY3Rpb25TdGF0dXNVcGRhdGUsIFwidGhpc1wiIHdpbGwgYmUgbWlzc2VkIGluc2lkZSB0aGUgZnVuY1xuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgY2IgPSAoc3RhdHVzKSA9PiB7IHJldHVybiB0aGF0Ll9zdHJvcGhlT25Db25uZWN0aW9uU3RhdHVzVXBkYXRlKHN0YXR1cyk7IH07XG4gICAgY29ubi5jb25uZWN0KGppZCwgcGFzc3dvcmQsIGNiKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoY2FsbGJhY2spIHtcbiAgICBpZiAodGhpcy5fcmF3Q29ubiAhPT0gbnVsbCAmJiB0aGlzLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHRoaXMuX29uRGlzY29ubmVjdENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLl9yYXdDb25uLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBnZXRTdHJvcGhlQ29ubmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmF3Q29ubjtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGRldmljZSwgY2FsbGJhY2ssIGxpc3RlbmVySWQpIHtcbiAgICBpZiAobGlzdGVuZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsaXN0ZW5lcklkID0gdGhpcy5fZ2VuUmFuZG9tSWQoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIGxpc3RlbmVySWQ7XG4gIH1cblxuICByZW1vdmVBbGxMaXN0ZW5lckZvckRldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9kYXRhQ2FsbGJhY2tzID0ge307XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpO1xuICB9XG5cbiAgZmV0Y2hNZXRhKGRldmljZSwgY2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgICAgbGV0IGxpc3RlbmVySWQgPSB0aGlzLl9nZW5SYW5kb21JZCgpO1xuICAgICAgbGV0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgICAgbGV0IF9jYWxsYmFjayA9IChtZXRhKSA9PiB7XG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCksIGRldmljZS5nZXREb21haW4oKSwgKCkgPT4geyB9KTtcbiAgICAgICAgY2FsbGJhY2sobWV0YSk7XG4gICAgICB9XG4gICAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgdGhpcy5nZXREb21haW4oKTtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyTWV0YUxpc3RlbmVyKGRldmljZSwgbGlzdGVuZXJJZCwgX2NhbGxiYWNrKTtcblxuICAgICAgbGV0IGNiID0gKHN1YnNjcmlwdGlvbnMpID0+IHtcbiAgICAgICAgY29uc3QgamlkID0gdGhhdC5fcmF3Q29ubi5qaWQ7XG4gICAgICAgIGNvbnN0IG15U3ViID0gc3Vic2NyaXB0aW9uc1tqaWRdO1xuICAgICAgICBpZiAobXlTdWIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IG1ldGFOb2RlU3ViSURzID0gbXlTdWJbbWV0YU5vZGVdO1xuICAgICAgICAgIGNvbnN0IGF2YWlsYWJsZVN1YklEID0gbWV0YU5vZGVTdWJJRHNbMF07XG5cbiAgICAgICAgICBsZXQgdW5pcXVlSWQgPSB0aGF0Ll9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgICAgICAgIGxldCBpcTIgPSAkaXEoeyB0eXBlOiBcImdldFwiLCBmcm9tOiBqaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgICAgICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgICAgLmMoXCJpdGVtc1wiLCB7IG5vZGU6IG1ldGFOb2RlLCBtYXhfaXRlbXM6IDEsIHN1YmlkOiBhdmFpbGFibGVTdWJJRCB9KTtcbiAgICAgICAgICBsZXQgc3VjMiA9IChpcSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5yZWNlbnQgcmVxdWVzdCBzdWNjZXNzP1xcblxcblwiKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGxldCBlcnIyID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbnJlY2VudCByZXF1ZXN0IGZhaWxlZD9cXG5cXG5cIik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShpcTIsIHN1YzIsIGVycjIpOyBkbyB7XG5cbiAgICAgICAgICB9IHdoaWxlICh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBmaXJzdCB3ZSBuZWVkIHRvIHN1YlxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuQEBAQEAgbm8gb3VyIHN1YiBpbmZvLCBnb2luZyB0byBzdWIhXFxuXFxuXFxuXCIpO1xuICAgICAgICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICAgICAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgICAgICAgbGV0IHN1YklxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAgICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgICAgICAgLmMoJ3N1YnNjcmliZScsIHsgbm9kZTogbWV0YU5vZGUsIGppZDogcmF3SmlkIH0pO1xuXG4gICAgICAgICAgY29uc3Qgc3ViU3VjID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbkBAQEAgc3ViIHN1Y2Nlc3MsIGdvaW5nIHRvIGZldGNoIHN1YnNjcmlwdGlvbnMgdG8gZ2V0IHN1YmlkXCIpO1xuICAgICAgICAgICAgdGhhdC5fZ2V0U3Vic2NyaXB0aW9uKGRldmljZS5nZXRNZXRhTm9kZU5hbWUoKSwgZGV2aWNlLmdldERvbWFpbigpLCAoc3Vic2NyaXB0aW9uczIpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbXlTdWIyID0gc3Vic2NyaXB0aW9uczJbamlkXTtcbiAgICAgICAgICAgICAgY29uc3QgbWV0YU5vZGVTdWJJRHMyID0gbXlTdWIyW21ldGFOb2RlXTtcbiAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlU3ViSUQyID0gbWV0YU5vZGVTdWJJRHMyWzBdO1xuXG4gICAgICAgICAgICAgIGxldCB1bmlxdWVJZDMgPSB0aGF0Ll9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgICAgICAgICAgICBsZXQgaXEzID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogamlkLCB0bzogc2VydmljZSwgaWQ6IHVuaXF1ZUlkMyB9KVxuICAgICAgICAgICAgICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgICAgICAgIC5jKFwiaXRlbXNcIiwgeyBub2RlOiBtZXRhTm9kZSwgbWF4X2l0ZW1zOiAxLCBzdWJpZDogYXZhaWxhYmxlU3ViSUQyIH0pO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHN1YzMgPSAoaXEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhID0gWG1sVXRpbC5jb252UmVjZW50SXRlbSh0aGF0LCBpcSk7XG4gICAgICAgICAgICAgICAgX2NhbGxiYWNrKG1ldGEpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBjb25zdCBlcnIzID0gKGlxKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJcXG5cXG5AQEBAQCByZWNlbnQgcmVxdWVzdCBlcnJvcj8gM1xcblxcblwiKTtcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICB0aGF0Ll9yYXdDb25uLnNlbmRJUShpcTMsIHN1YzMsIGVycjMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKHN1YklxLCBzdWJTdWMsICgpID0+IHsgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpLCBkZXZpY2UuZ2V0RG9tYWluKCksIGNiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0U3Vic2NyaXB0aW9uKG5vZGUsIGRvbWFpbiwgY2IpIHtcbiAgICAvLyA8aXEgdHlwZT0nZ2V0J1xuICAgIC8vICAgICBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gICAgIHRvPSdwdWJzdWIuc2hha2VzcGVhcmUubGl0J1xuICAgIC8vICAgICBpZD0nc3Vic2NyaXB0aW9uczEnPlxuICAgIC8vICAgPHB1YnN1YiB4bWxucz0naHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvcHVic3ViJz5cbiAgICAvLyAgICAgPHN1YnNjcmlwdGlvbnMvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIGxldCB1bmlxdWVJZCA9IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIik7XG4gICAgbGV0IGlxID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhpcy5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgIC5jKFwicHVic3ViXCIsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgLmMoXCJzdWJzY3JpcHRpb25zXCIpO1xuXG4gICAgbGV0IHN1YyA9IChpcSkgPT4ge1xuICAgICAgbGV0IGNvbnZlcnRlZCA9IFhtbFV0aWwuY29udlN1YnNjcmlwdGlvbnMoaXEpO1xuICAgICAgY2IoY29udmVydGVkKTtcbiAgICB9O1xuICAgIGxldCBlcnIgPSAoaXEpID0+IHsgfTtcblxuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICBiaW5kKGRldmljZU5hbWUsIGRvbWFpbikge1xuICAgIGlmIChkb21haW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tYWluID0gdGhpcy5nZXREb21haW4oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERldmljZSh0aGlzLCBkZXZpY2VOYW1lLCBkb21haW4pO1xuICB9XG5cbiAgZmV0Y2hEZXZpY2VzKGNhbGxiYWNrLCBkb21haW4pIHtcbiAgICBpZiAoZG9tYWluID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvbWFpbiA9IHRoaXMuZ2V0RG9tYWluKCk7XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICBsZXQgamlkID0gdGhpcy5nZXRKSUQoKTtcbiAgICBsZXQgc2VydmljZSA9IFwicHVic3ViLlwiICsgZG9tYWluO1xuICAgIGxldCBpcSA9ICRpcSh7IGZyb206IGppZCwgdG86IHNlcnZpY2UsIHR5cGU6IFwiZ2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pLmMoXG4gICAgICAncXVlcnknLCB7IHhtbG5zOiBTdHJvcGhlLlN0cm9waGUuTlMuRElTQ09fSVRFTVMgfVxuICAgICk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHN1Y2Nlc3MgPSAobXNnKSA9PiB7XG4gICAgICBsZXQgcXVlcnkgPSBtc2cuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgICAgbGV0IGl0ZW1zID0gcXVlcnkuX2NoaWxkTm9kZXNMaXN0O1xuXG4gICAgICBsZXQgY2hlY2sgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgbGV0IG5vZGUgPSBpdGVtLl9hdHRyaWJ1dGVzLm5vZGUuX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgICBpZiAoU294VXRpbC5lbmRzV2l0aERhdGEobm9kZSkpIHtcbiAgICAgICAgICBsZXQgcmVhbE5vZGUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKGNoZWNrW3JlYWxOb2RlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0gPSB7IGRhdGE6IHRydWUgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tbcmVhbE5vZGVdLmRhdGEgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChTb3hVdGlsLmVuZHNXaXRoTWV0YShub2RlKSkge1xuICAgICAgICAgIGxldCByZWFsTm9kZSA9IFNveFV0aWwuY3V0TWV0YVN1ZmZpeChub2RlKTtcbiAgICAgICAgICBpZiAoY2hlY2tbcmVhbE5vZGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoZWNrW3JlYWxOb2RlXSA9IHsgbWV0YTogdHJ1ZSB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja1tyZWFsTm9kZV0uZGF0YSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBkZXZpY2VzID0gW107XG4gICAgICBmb3IgKGxldCBkZXZpY2VOYW1lIG9mIE9iamVjdC5rZXlzKGNoZWNrKSkge1xuICAgICAgICBsZXQgYyA9IGNoZWNrW2RldmljZU5hbWVdO1xuICAgICAgICBpZiAoYy5kYXRhICYmIGMubWV0YSkge1xuICAgICAgICAgIGxldCBkZXZpY2UgPSB0aGF0LmJpbmQoZGV2aWNlTmFtZSk7XG4gICAgICAgICAgZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soZGV2aWNlcyk7XG4gICAgfTtcblxuICAgIGxldCBlcnJvciA9IChtc2cpID0+IHtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLnRyZWUoKSwgc3VjY2VzcywgZXJyb3IsIHVuZGVmaW5lZCk7XG4gIH1cblxuICBmZXRjaFN1YnNjcmlwdGlvbnMoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9yYXdDb25uLlB1YlN1Yi5nZXRTdWJzY3JpcHRpb25zKChzdWJzY3JpcHRpb25zKSA9PiB7XG4gICAgICAvLyBUT0RPOiBEZXZpY2Ug44Kq44OW44K444Kn44Kv44OI44Gu44Oq44K544OI44Gr5Yqg5bel44GX44GmY2FsbGJhY2vjgpLlkbzjgbPlh7rjgZlcblxuICAgIH0pO1xuICB9XG5cbiAgc3Vic2NyaWJlKGRldmljZSkge1xuICAgIGxldCBkYXRhTm9kZSA9IGRldmljZS5nZXREYXRhTm9kZU5hbWUoKTtcbiAgICBsZXQgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIC8vIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkZXZpY2UuZ2V0RG9tYWluKCk7XG5cbiAgICAvLyB0aGlzLl9zdWJOb2RlKGRhdGFOb2RlLCBkZXZpY2UuZ2V0RG9tYWluKCkpO1xuICAgIGxldCB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMudW5zdWJzY3JpYmUoZGV2aWNlLCAoKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCB1bnN1YnNjcmliZSBjYWxsYmFjayBjYWxsZWRcIik7XG4gICAgICBsZXQgY2IgPSAoKSA9PiB7XG4gICAgICB9O1xuICAgICAgdGhhdC5fc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBmYWxzZSwgY2IpO1xuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgX3N1Yk5vZGUgY2FsbGVkXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgX3N1Yk5vZGUobm9kZSwgZG9tYWluLCByZXF1ZXN0UmVjZW50LCBjYWxsYmFjaykge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHJvcGhlL3N0cm9waGVqcy1wbHVnaW4tcHVic3ViL2Jsb2IvbWFzdGVyL3N0cm9waGUucHVic3ViLmpzI0wyOTdcbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHNlcnZpY2UgPSBcInB1YnN1Yi5cIiArIGRvbWFpbjtcblxuICAgIC8vIGh0dHA6Ly9nZ296YWQuY29tL3N0cm9waGUucGx1Z2lucy9kb2NzL3N0cm9waGUucHVic3ViLmh0bWxcbiAgICAvLyBjb25zb2xlLmxvZyhcIkBAQEBAQEAgcmF3IGppZCA9IFwiICsgdGhpcy5fcmF3Q29ubi5qaWQpO1xuICAgIGxldCByYXdKaWQgPSB0aGlzLl9yYXdDb25uLmppZDtcbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgbGV0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6IFwic2V0XCIsIGlkOiB0aGlzLl9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpIH0pXG4gICAgICAuYygncHVic3ViJywgeyB4bWxuczogXCJodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWJcIiB9KVxuICAgICAgLmMoJ3N1YnNjcmliZScsIHsgbm9kZTogbm9kZSwgamlkOiByYXdKaWQgfSk7XG5cbiAgICBsZXQgc3VjID0gKGlxKSA9PiB7XG4gICAgICAvLyBodHRwczovL3htcHAub3JnL2V4dGVuc2lvbnMveGVwLTAwNjAuaHRtbCNzdWJzY3JpYmVyLXJldHJpZXZlLXJlcXVlc3RyZWNlbnRcblxuICAgICAgLy8gPGlxIHR5cGU9J2dldCdcbiAgICAgIC8vICAgICBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgICAvLyAgICAgdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgICAvLyAgICAgaWQ9J2l0ZW1zMic+XG4gICAgICAvLyAgIDxwdWJzdWIgeG1sbnM9J2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1Yic+XG4gICAgICAvLyAgICAgPGl0ZW1zIG5vZGU9J3ByaW5jZWx5X211c2luZ3MnIG1heF9pdGVtcz0nMicvPlxuICAgICAgLy8gICA8L3B1YnN1Yj5cbiAgICAgIC8vIDwvaXE+XG4gICAgICBpZiAocmVxdWVzdFJlY2VudCkge1xuICAgICAgICBsZXQgdW5pcXVlSWQgPSB0aGF0Ll9yYXdDb25uLmdldFVuaXF1ZUlkKFwicHVic3ViXCIpO1xuICAgICAgICBsZXQgaXEyID0gJGlxKHsgdHlwZTogXCJnZXRcIiwgZnJvbTogdGhhdC5fcmF3Q29ubi5qaWQsIHRvOiBzZXJ2aWNlLCBpZDogdW5pcXVlSWQgfSlcbiAgICAgICAgICAuYyhcInB1YnN1YlwiLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgICAgICAuYyhcIml0ZW1zXCIsIHsgbm9kZTogbm9kZSwgbWF4X2l0ZW1zOiAxIH0pO1xuICAgICAgICBsZXQgc3VjMiA9IChpcSkgPT4ge1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGxldCBlcnIyID0gKGlxKSA9PiB7IH07XG4gICAgICAgIHRoYXQuX3Jhd0Nvbm4uc2VuZElRKGlxMiwgc3VjMiwgZXJyMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IGVyciA9IChpcSkgPT4geyB9O1xuICAgIHRoaXMuX3Jhd0Nvbm4uc2VuZElRKGlxLCBzdWMsIGVycik7XG4gIH1cblxuICB1bnN1YnNjcmliZShkZXZpY2UsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIGxldCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuXG4gICAgbGV0IGNiID0gKCkgPT4ge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBteUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG5cbiAgICB0aGlzLl9nZXRTdWJzY3JpcHRpb24oZGF0YU5vZGUsIGRvbWFpbiwgKHN1YikgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJfZ2V0U3Vic2NyaXB0aW9uIGNhbGxiYWNrIGNhbGxlZCBpbiB1bnN1YnNjcmliZVwiKTtcbiAgICAgIGlmIChzdWJbbXlKaWRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3ViW215SmlkXSA9IHt9O1xuICAgICAgfVxuICAgICAgbGV0IHN1YmlkcyA9IHN1YltteUppZF1bZGF0YU5vZGVdO1xuICAgICAgaWYgKHN1YmlkcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIHN1YmlkcyA9PT0gdW5kZWZpbmVkIVwiKTtcbiAgICAgICAgY2IoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2coXCJAQEAgc3ViaWRzLmxlbmd0aD09PVwiICsgc3ViaWRzLmxlbmd0aCk7XG4gICAgICBpZiAoc3ViaWRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBjYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZGVsTmV4dEZ1bmMgPSAoaSkgPT4ge1xuICAgICAgICAgIGlmIChzdWJpZHMubGVuZ3RoIDw9IGkpIHtcbiAgICAgICAgICAgIHJldHVybiBjYjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoYXQuX3Vuc3ViTm9kZShkYXRhTm9kZSwgZG9tYWluLCBkZWxOZXh0RnVuYyhpICsgMSksIHN1Ymlkc1tpXSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIkBAQCBfdW5zdWJOb2RlIGNhbGxlZCBmb3Igc3ViaWQ9XCIgKyBzdWJpZHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGF0Ll91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGVsTmV4dEZ1bmMoMSksIHN1Ymlkc1swXSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQEBAIF91bnN1Yk5vZGUgY2FsbGVkIGZvciBzdWJpZD1cIiArIHN1Ymlkc1swXSk7XG4gICAgICB9XG4gICAgfSlcbiAgICAvLyB0aGlzLl91bnN1Yk5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgKCkgPT4ge1xuICAgIC8vICAgLy8gVE9ET1xuICAgIC8vIH0pO1xuICB9XG5cbiAgX3Vuc3ViTm9kZShub2RlLCBkb21haW4sIGNhbGxiYWNrLCBzdWJpZCkge1xuICAgIGxldCBzZXJ2aWNlID0gXCJwdWJzdWIuXCIgKyBkb21haW47XG4gICAgLy8gPGlxIHR5cGU9J3NldCdcbiAgICAvLyBmcm9tPSdmcmFuY2lzY29AZGVubWFyay5saXQvYmFycmFja3MnXG4gICAgLy8gdG89J3B1YnN1Yi5zaGFrZXNwZWFyZS5saXQnXG4gICAgLy8gaWQ9J3Vuc3ViMSc+XG4gICAgLy8gICA8cHVic3ViIHhtbG5zPSdodHRwOi8vamFiYmVyLm9yZy9wcm90b2NvbC9wdWJzdWInPlxuICAgIC8vICAgICAgPHVuc3Vic2NyaWJlXG4gICAgLy8gICAgICAgICAgbm9kZT0ncHJpbmNlbHlfbXVzaW5ncydcbiAgICAvLyAgICAgICAgICBqaWQ9J2ZyYW5jaXNjb0BkZW5tYXJrLmxpdCcvPlxuICAgIC8vICAgPC9wdWJzdWI+XG4gICAgLy8gPC9pcT5cbiAgICBsZXQgYmFyZUppZCA9IFN0cm9waGUuU3Ryb3BoZS5nZXRCYXJlSmlkRnJvbUppZCh0aGlzLl9yYXdDb25uLmppZCk7XG4gICAgLy8gY29uc29sZS5sb2coXCJfdW5zdWJOb2RlOiBiYXJlSmlkPVwiICsgYmFyZUppZCk7XG5cbiAgICBsZXQgdW5zdWJBdHRycyA9IHsgbm9kZTogbm9kZSwgamlkOiBiYXJlSmlkIH07XG4gICAgaWYgKHN1YmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHVuc3ViQXR0cnMuc3ViaWQgPSBzdWJpZDtcbiAgICB9XG5cbiAgICBsZXQgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogXCJzZXRcIiwgaWQ6IHRoaXMuX3Jhd0Nvbm4uZ2V0VW5pcXVlSWQoXCJwdWJzdWJcIikgfSlcbiAgICAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBcImh0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3B1YnN1YlwiIH0pXG4gICAgICAuYygndW5zdWJzY3JpYmUnLCB1bnN1YkF0dHJzKTtcblxuICAgIGxldCBzdWMgPSAoaXEpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwidW5zdWIgc3VjY2Vzc1wiKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhpcSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBsZXQgZXJyID0gKGlxKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcInVuc3ViIGZhaWxlZFwiKTtcbiAgICAgIC8vIFhtbFV0aWwuZHVtcERvbShpcSk7XG4gICAgfTtcbiAgICB0aGlzLl9yYXdDb25uLnNlbmRJUShpcSwgc3VjLCBlcnIpO1xuICB9XG5cbiAgdW5zdWJzY3JpYmVBbGwoKSB7XG4gICAgbGV0IHRoYXQgPSB0aGlzO1xuICAgIHRoaXMuZmV0Y2hTdWJzY3JpcHRpb25zKChkZXZpY2VzKSA9PiB7XG4gICAgICBmb3IgKGxldCBkZXZpY2Ugb2YgZGV2aWNlcykge1xuICAgICAgICB0aGF0LnVuc3Vic2NyaWJlKGRldmljZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjcmVhdGVEZXZpY2UoZGV2aWNlLCBtZXRhLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRvbWFpbiA9IGRldmljZS5nZXREb21haW4oKTtcbiAgICAgIGNvbnN0IG1ldGFOb2RlID0gZGV2aWNlLmdldE1ldGFOb2RlTmFtZSgpO1xuICAgICAgY29uc3QgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICAgIHRoaXMuX2NyZWF0ZU5vZGUoXG4gICAgICAgIG1ldGFOb2RlLFxuICAgICAgICBkb21haW4sXG4gICAgICAgIChpcSkgPT4ge1xuICAgICAgICAgIHRoYXQuX2NyZWF0ZU5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgKGlxMikgPT4ge1xuICAgICAgICAgICAgLy8gVE9ETzogc2VuZCBtZXRhIHRvIG1ldGEgbm9kZVxuICAgICAgICAgICAgdGhhdC5fcHVibGlzaFRvTm9kZShcbiAgICAgICAgICAgICAgbWV0YU5vZGUsXG4gICAgICAgICAgICAgIGRldmljZS5nZXREb21haW4oKSxcbiAgICAgICAgICAgICAgbWV0YSxcbiAgICAgICAgICAgICAgY2JTdWNjZXNzLFxuICAgICAgICAgICAgICBjYkZhaWxlZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9LCBjYkZhaWxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNiRmFpbGVkXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVOb2RlKG5vZGVOYW1lLCBkb21haW4sIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIlxcblxcbi0tLS0gX2NyZWF0ZU5vZGVcIik7XG4gICAgY29uc3Qgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICBjb25zdCB1bmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ3B1YnN1YicpO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuLS0tLSBfY3JlYXRlTm9kZTJcIik7XG4gICAgdHJ5IHtcbiAgICAgIC8vIGNvbnN0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAvLyAgIC5jKCdwdWJzdWInLCB7IHhtbG5zOiBQVUJTVUJfTlMgfSlcbiAgICAgIC8vICAgLmMoJ2NyZWF0ZScsIHsgbm9kZTogbm9kZU5hbWUgfSk7XG4gICAgICBjb25zdCBpcSA9ICgkaXEoeyB0bzogc2VydmljZSwgdHlwZTogJ3NldCcsIGlkOiB1bmlxdWVJZCwgZnJvbTogY29ubi5qaWQgfSlcbiAgICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAuYygnY3JlYXRlJywgeyBub2RlOiBub2RlTmFtZSB9KVxuICAgICAgICAuYygnY29uZmlndXJlJylcbiAgICAgICAgLmMoJ3gnLCB7IHhtbG5zOiAnamFiYmVyOng6ZGF0YScsIHR5cGU6ICdzdWJtaXQnIH0pXG4gICAgICAgIC5jKCdmaWVsZCcsIHsgdmFyOiAncHVic3ViI2FjY2Vzc19tb2RlbCcsIHR5cGU6ICdsaXN0LXNpbmdsZScgfSlcbiAgICAgICAgLmMoJ3ZhbHVlJylcbiAgICAgICAgLnQoJ29wZW4nKVxuICAgICAgICAudXAoKS51cCgpXG4gICAgICAgIC5jKCdmaWVsZCcsIHsgdmFyOiAncHVic3ViI3B1Ymxpc2hfbW9kZWwnLCB0eXBlOiAnbGlzdC1zaW5nbGUnIH0pXG4gICAgICAgIC5jKCd2YWx1ZScpXG4gICAgICAgIC50KCdvcGVuJylcbiAgICAgICAgLnVwKCkudXAoKVxuICAgICAgICAuYygnZmllbGQnLCB7IHZhcjogJ3B1YnN1YiNwZXJzaXN0X2l0ZW1zJywgdHlwZTogJ2Jvb2xlYW4nIH0pXG4gICAgICAgIC5jKCd2YWx1ZScpXG4gICAgICAgIC50KCcxJylcbiAgICAgICAgLnVwKCkudXAoKVxuICAgICAgICAuYygnZmllbGQnLCB7IHZhcjogJ3B1YnN1YiNtYXhfaXRlbXMnLCB0eXBlOiAndGV4dC1zaW5nbGUnIH0pXG4gICAgICAgIC5jKCd2YWx1ZScpXG4gICAgICAgIC50KCcxJylcblxuICAgICAgKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuLS0tLSBfY3JlYXRlTm9kZTNcIik7XG5cbiAgICAgIGNvbm4uc2VuZElRKGlxLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiXFxuXFxuLS0tLSBfY3JlYXRlTm9kZTRcIik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coZS5zdGFjayk7XG4gICAgfVxuICB9XG5cbiAgX2RlbGV0ZU5vZGUobm9kZU5hbWUsIGRvbWFpbiwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIGNvbnN0IHNlcnZpY2UgPSAncHVic3ViLicgKyBkb21haW47XG4gICAgY29uc3QgY29ubiA9IHRoaXMuX3Jhd0Nvbm47XG4gICAgY29uc3QgdW5pcXVlSWQgPSBjb25uLmdldFVuaXF1ZUlkKCdwdWJzdWInKTtcbiAgICAvLyBjb25zdCBiYXJlSmlkID0gU3Ryb3BoZS5TdHJvcGhlLmdldEJhcmVKaWRGcm9tSmlkKGNvbm4uamlkKTtcbiAgICAvLyBjb25zdCBmcm9tSmlkID0gY29ubi5cbiAgICBjb25zdCBpcSA9IChcbiAgICAgIC8vIGNvbnN0IGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGJhcmVKaWQgfSlcbiAgICAgICRpcSh7IHRvOiBzZXJ2aWNlLCB0eXBlOiAnc2V0JywgaWQ6IHVuaXF1ZUlkLCBmcm9tOiBjb25uLmppZCB9KVxuICAgICAgICAuYygncHVic3ViJywgeyB4bWxuczogUFVCU1VCX09XTkVSX05TIH0pXG4gICAgICAgIC5jKCdkZWxldGUnLCB7IG5vZGU6IG5vZGVOYW1lIH0pXG4gICAgKTtcblxuICAgIGNvbm4uc2VuZElRKGlxLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKTtcbiAgfVxuXG4gIGRlbGV0ZURldmljZShkZXZpY2UsIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICBjb25zdCBkb21haW4gPSBkZXZpY2UuZ2V0RG9tYWluKCk7XG4gICAgY29uc3QgbWV0YU5vZGUgPSBkZXZpY2UuZ2V0TWV0YU5vZGVOYW1lKCk7XG4gICAgY29uc3QgZGF0YU5vZGUgPSBkZXZpY2UuZ2V0RGF0YU5vZGVOYW1lKCk7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgdGhpcy5fZGVsZXRlTm9kZShcbiAgICAgIG1ldGFOb2RlLFxuICAgICAgZG9tYWluLFxuICAgICAgKGlxKSA9PiB7XG4gICAgICAgIHRoYXQuX2RlbGV0ZU5vZGUoZGF0YU5vZGUsIGRvbWFpbiwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gICAgICB9LFxuICAgICAgKGlxKSA9PiB7XG4gICAgICAgIGNiRmFpbGVkKGlxKTtcbiAgICAgICAgdGhhdC5fZGVsZXRlTm9kZShkYXRhTm9kZSwgZG9tYWluLCAoaXEyKSA9PiB7IH0sIChpcTIpID0+IHsgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHB1Ymxpc2goZGF0YSwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIGNvbnN0IGRldmljZSA9IGRhdGEuZ2V0RGV2aWNlKCk7XG4gICAgY29uc3QgZG9tYWluID0gZGV2aWNlLmdldERvbWFpbigpO1xuICAgIGNvbnN0IGRhdGFOb2RlID0gZGV2aWNlLmdldERhdGFOb2RlTmFtZSgpO1xuICAgIHRoaXMuX3B1Ymxpc2hUb05vZGUoZGF0YU5vZGUsIGRvbWFpbiwgZGF0YSwgY2JTdWNjZXNzLCBjYkZhaWxlZCk7XG4gIH1cblxuICBfcHVibGlzaFRvTm9kZShub2RlTmFtZSwgZG9tYWluLCBwdWJsaXNoQ29udGVudCwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIC8vIGV4cGVjdHMgcHVibGlzaENvbnRlbnQgYXMgYW4gaW5zdGFuY2Ugb2YgRGV2aWNlTWV0YSBvciBEYXRhXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNlcnZpY2UgPSAncHVic3ViLicgKyBkb21haW47XG4gICAgICBjb25zdCBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICAgIGNvbnN0IHVuaXF1ZUlkID0gY29ubi5nZXRVbmlxdWVJZCgncHVic3ViJyk7XG4gICAgICBjb25zdCBpdGVtVW5pcXVlSWQgPSBjb25uLmdldFVuaXF1ZUlkKCdpdGVtJyk7XG4gICAgICBjb25zdCBpcSA9IChcbiAgICAgICAgJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pXG4gICAgICAgICAgLmMoJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9OUyB9KVxuICAgICAgICAgIC5jKCdwdWJsaXNoJywgeyBub2RlOiBub2RlTmFtZSB9KVxuICAgICAgICAgIC5jKCdpdGVtJywgeyBpZDogaXRlbVVuaXF1ZUlkIH0pXG4gICAgICAgIC8vIC5jbm9kZShwdWJsaXNoQ29udGVudClcbiAgICAgICk7XG5cbiAgICAgIHB1Ymxpc2hDb250ZW50LmFwcGVuZFRvTm9kZShpcSk7XG5cbiAgICAgIGNvbm4uc2VuZElRKGlxLCBjYlN1Y2Nlc3MsIGNiRmFpbGVkKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUuc3RhY2spO1xuICAgIH1cbiAgfVxuXG4gIF9nZW5SYW5kb21JZCgpIHtcbiAgICBsZXQgY2hhcnMgPSBcImFiY2RlZjAxMjM0NTY3ODkwXCI7XG4gICAgbGV0IG5DaGFycyA9IGNoYXJzLmxlbmd0aDtcbiAgICBsZXQgbGVuID0gMTI4O1xuICAgIHZhciByZXQgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBpZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuQ2hhcnMpO1xuICAgICAgbGV0IGNoYXIgPSBjaGFycy5jaGFyQXQoaWR4KTtcbiAgICAgIHJldCA9IHJldCArIGNoYXI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBfcmVnaXN0ZXJNZXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fbWV0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJEYXRhTGlzdGVuZXIoZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIodGhpcy5fZGF0YUNhbGxiYWNrcywgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjayk7XG4gIH1cblxuICBfcmVnaXN0ZXJMaXN0ZW5lcih0YWJsZSwgZGV2aWNlLCBsaXN0ZW5lcklkLCBjYWxsYmFjaykge1xuICAgIGxldCBkZXZpY2VOYW1lID0gZGV2aWNlLmdldE5hbWUoKTtcblxuICAgIGlmICh0YWJsZVtkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWJsZVtkZXZpY2VOYW1lXSA9IHt9O1xuICAgIH1cblxuICAgIHRhYmxlW2RldmljZU5hbWVdW2xpc3RlbmVySWRdID0gY2FsbGJhY2s7XG4gIH1cblxuICBfYnJvYWRjYXN0KHRhYmxlLCBhcmd1bWVudCkge1xuICAgIGZvciAobGV0IGxpc3RlbmVySWQgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgbGlzdGVuZXIgPSB0YWJsZVtsaXN0ZW5lcklkXTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCckJCQkIGxpc3RlbmVySWQ9JyArIGxpc3RlbmVySWQgKyBcIiwgbGlzdGVuZXI9XCIgKyBsaXN0ZW5lcik7XG4gICAgICBsaXN0ZW5lcihhcmd1bWVudCk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZU1ldGFMaXN0ZW5lcldpdGhJZChsaXN0ZW5lcklkKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJXaXRoSWQodGhpcy5fbWV0YUNhbGxiYWNrcywgbGlzdGVuZXJJZCk7XG4gIH1cblxuICBfcmVtb3ZlRGF0YUxpc3RlbmVyV2l0aElkKGxpc3RlbmVySWQpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0aGlzLl9kYXRhQ2FsbGJhY2tzLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIF9yZW1vdmVMaXN0ZW5lcldpdGhJZCh0YWJsZSwgbGlzdGVuZXJJZCkge1xuICAgIGZvciAobGV0IGRldk5hbWUgb2YgT2JqZWN0LmtleXModGFibGUpKSB7XG4gICAgICBsZXQgZGV2VGFibGUgPSB0YWJsZVtkZXZOYW1lXTtcbiAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yIChsZXQgbHN0bklkIG9mIE9iamVjdC5rZXlzKGRldlRhYmxlKSkge1xuICAgICAgICBpZiAobHN0bklkID09PSBsaXN0ZW5lcklkKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICBkZWxldGUgZGV2VGFibGVbbGlzdGVuZXJJZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEFjY2Vzc1Blcm1pc3Npb24obm9kZU5hbWUsIGRvbWFpbiwgYWNjZXNzTW9kZWwsIGNiU3VjY2VzcywgY2JGYWlsZWQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHNlcnZpY2UgPSAncHVic3ViLicgKyBkb21haW47XG4gICAgICB2YXIgY29ubiA9IHRoaXMuX3Jhd0Nvbm47XG4gICAgICB2YXIgdW5pcXVlSWQgPSBjb25uLmdldFVuaXF1ZUlkKCdwdWJzdWInKTtcblxuICAgICAgdmFyIGlxID0gJGlxKHsgdG86IHNlcnZpY2UsIHR5cGU6ICdzZXQnLCBpZDogdW5pcXVlSWQsIGZyb206IGNvbm4uamlkIH0pLmMoXG4gICAgICAgICdwdWJzdWInLCB7IHhtbG5zOiBQVUJTVUJfT1dORVJfTlMgfSkuYyhcbiAgICAgICAgICAnY29uZmlndXJlJywgeyBub2RlOiBub2RlTmFtZSB9KS5jKFxuICAgICAgICAgICAgJ3gnLCB7IHhtbG5zOiAnamFiYmVyOng6ZGF0YScsIHR5cGU6ICdzdWJtaXQnIH0pLmMoXG4gICAgICAgICAgICAgICdmaWVsZCcsIHsgdmFyOiAncHVic3ViI2FjY2Vzc19tb2RlbCcsIHR5cGU6ICdsaXN0LXNpbmdsZScgfSkuYyhcbiAgICAgICAgICAgICAgICAndmFsdWUnKS50KGFjY2Vzc01vZGVsKVxuICAgICAgY29ubi5zZW5kSVEoaXEsIGNiU3VjY2VzcywgY2JGYWlsZWQpO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICBzZXRBZmZhbGlhdGlvbihub2RlTmFtZSwgZG9tYWluLCBhZmZhbGlhdGlvbiwgY2JTdWNjZXNzLCBjYkZhaWxlZCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgc2VydmljZSA9ICdwdWJzdWIuJyArIGRvbWFpbjtcbiAgICAgIHZhciBjb25uID0gdGhpcy5fcmF3Q29ubjtcbiAgICAgIHZhciB1bmlxdWVJZCA9IGNvbm4uZ2V0VW5pcXVlSWQoJ3B1YnN1YicpO1xuXG4gICAgICB2YXIgaXEgPSAkaXEoeyB0bzogc2VydmljZSwgdHlwZTogJ3NldCcsIGlkOiB1bmlxdWVJZCwgZnJvbTogY29ubi5qaWQgfSkuYyhcbiAgICAgICAgJ3B1YnN1YicsIHsgeG1sbnM6IFBVQlNVQl9PV05FUl9OUyB9KS5jKFxuICAgICAgICAgICdhZmZpbGlhdGlvbnMnLCB7IG5vZGU6IG5vZGVOYW1lIH0pXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWZmYWxpYXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXEuYygnYWZmaWxpYXRpb24nLCB7IHhtbG5zOiBQVUJTVUJfT1dORVJfTlMsIGppZDogYWZmYWxpYXRpb25baV0sIGFmZmlsaWF0aW9uOiAnbm9uZScgfSkudXAoKVxuICAgICAgfVxuICAgICAgY29ubi5zZW5kSVEoaXEsIGNiU3VjY2VzcywgY2JGYWlsZWQpO1xuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihlLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU294Q29ubmVjdGlvbjtcbiJdfQ==