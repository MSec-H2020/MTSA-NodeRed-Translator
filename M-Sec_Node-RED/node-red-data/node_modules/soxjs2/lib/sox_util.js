"use strict";

var _xml2js = require("xml2js");

var _xml2js2 = _interopRequireDefault(_xml2js);

var _data = require("./data");

var _data2 = _interopRequireDefault(_data);

var _transducer_value = require("./transducer_value");

var _transducer_value2 = _interopRequireDefault(_transducer_value);

var _device_meta = require("./device_meta");

var _device_meta2 = _interopRequireDefault(_device_meta);

var _meta_transducer = require("./meta_transducer");

var _meta_transducer2 = _interopRequireDefault(_meta_transducer);

var _device = require("./device");

var _device2 = _interopRequireDefault(_device);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SoxUtil = {

  parseTimestamp: function parseTimestamp(timestampStr) {
    return new Date(timestampStr);
  },

  extractDevices: function extractDevices(soxConn, entry, callback) {
    var xml = entry.toString();
    _xml2js2.default.parseString(xml, function (error, result) {

      // console.log("parseString error: " + error);

      var iqTag = result.iq;
      var queryTag = iqTag.query[0];
      var itemTags = queryTag.item;

      // if both "_meta" and "_data" exists, it should be sox device
      var nodeCheck = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = itemTags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var itemTag = _step.value;

          var itemAttrs = itemTag.$;
          var node = itemAttrs.node;

          if (SoxUtil.endsWithMeta(node)) {
            var deviceName = SoxUtil.cutMetaSuffix(node);
            if (nodeCheck[deviceName] === undefined) {
              nodeCheck[deviceName] = {};
            }
            nodeCheck[deviceName].meta = true;
          } else if (SoxUtil.endsWithData(node)) {
            var deviceName = SoxUtil.cutDataSuffix(node);
            if (nodeCheck[deviceName] === undefined) {
              nodeCheck[deviceName] = {};
            }
            nodeCheck[deviceName].data = true;
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

      var devices = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.keys(nodeCheck)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _deviceName = _step2.value;

          var check = nodeCheck[_deviceName];
          if (check.meta && check.data) {
            var device = soxConn.bind(_deviceName);
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
    });
  },

  endsWithMeta: function endsWithMeta(nodeName) {
    var len = nodeName.length;
    return 5 <= len && nodeName.substring(len - 5, len) === "_meta";
  },

  endsWithData: function endsWithData(nodeName) {
    var len = nodeName.length;
    return 5 <= len && nodeName.substring(len - 5, len) === "_data";
  },

  cutMetaSuffix: function cutMetaSuffix(nodeName) {
    if (!SoxUtil.endsWithMeta(nodeName)) {
      return nodeName;
    }
    return nodeName.substr(0, nodeName.length - 5);
  },

  cutDataSuffix: function cutDataSuffix(nodeName) {
    if (!SoxUtil.endsWithData(nodeName)) {
      return nodeName;
    }
    return nodeName.substr(0, nodeName.length - 5);
  },

  // parseDataPayload: (entry, deviceToBind, callback) => {
  //   let xml = entry.toString();
  //   xml2js.parseString(xml, (err, result) => {
  //     let dataTag = result.data;
  //     let transducerValueTags = dataTag.transducerValue;
  //     let values = [];
  //     for (let tValueTag of transducerValueTags) {
  //       let vAttrs = tValueTag.$;
  //       let vId = vAttrs.id;
  //       let vRaw = vAttrs.rawValue || null;
  //       let vTyped = vAttrs.typedValue || null;
  //       let vTimestamp = SoxUtil.parseTimestamp(vAttrs.timestamp);
  //
  //       let tValue = new TransducerValue(vId, vRaw, vTyped, vTimestamp);
  //       values.push(tValue);
  //     }
  //
  //     let data = new Data(deviceToBind, values);
  //     // let data = new DataModule.Data(deviceToBind, values);
  //     callback(data);
  //   });
  // },

  parseDataPayload: function parseDataPayload(soxConn, entry, callback) {
    var messageTag = entry;
    var eventTag = entry._childNodesList[0];
    var itemsTag = eventTag._childNodesList[0];
    var itemTag = itemsTag._childNodesList[0];
    var dataTag = itemTag._childNodesList[0];
    var tdrTags = dataTag._childNodesList;

    var messageTagAttrs = messageTag._attributes;
    var service = messageTagAttrs['from']._valueForAttrModified;
    var domain = service.substring(7); // sox...
    // console.log('### parseDataPayload: domain = ' + domain);

    var itemsTagAttrs = itemsTag._attributes;
    var node = itemsTagAttrs['node']._valueForAttrModified;
    // console.log('### parseDataPayload: node = ' + node);
    var deviceName = SoxUtil.cutDataSuffix(node);
    // console.log('### parseDataPayload: deviceName = ' + deviceName);

    var deviceToBind = new _device2.default(soxConn, deviceName, domain);

    var values = [];

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = tdrTags[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var tdrTag = _step3.value;

        var tagName = tdrTag._localName;

        // come in 'transducerValue' and 'transducervalue'
        // FIXME: Snake case becomes lowercase in node-strophe specification
        // if you fix this, customize to 'node-strophe'
        if (tagName !== 'transducerValue' && tagName !== 'transducervalue') {
          // console.log('### tagName !== transducerV(v)alue, skipping: name=' + tagName);
          continue;
        }
        // console.log('### examine tag=' + tagName);

        // let attrs = tdrTag._valueForAttrModified;
        var attrs = tdrTag._attributes;
        var attrNames = Object.keys(attrs);
        // console.log('### attrNames=' + JSON.stringify(attrNames));

        var transducerId = attrs['id']._valueForAttrModified;

        var rawValue = null;
        var typedValue = null;

        // if camelCase ============================
        if (attrs['rawValue'] !== undefined) {
          rawValue = attrs['rawValue']._valueForAttrModified;
        }

        if (attrs['typedValue'] !== undefined) {
          typedValue = attrs['typedValue']._valueForAttrModified;
        }

        // if lowercase ============================
        // FIXME: Snake case becomes lowercase in node-strophe specification
        // if you fix this, customize to 'node-strophe'
        if (attrs['rawvalue'] !== undefined) {
          rawValue = attrs['rawvalue']._valueForAttrModified;
        }

        if (attrs['typedvalue'] !== undefined) {
          typedValue = attrs['typedvalue']._valueForAttrModified;
        }

        var timestamp = attrs['timestamp']._valueForAttrModified;

        if (timestamp) {
          timestamp = Date.parse(timestamp);
        }

        var value = new _transducer_value2.default(transducerId, rawValue, typedValue, timestamp);
        values.push(value);
        // console.log('### parseDataPayload: added transducer value: id=' + transducerId);
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

    var data = new _data2.default(deviceToBind, values);
    return data;
  },

  parseMetaPayload: function parseMetaPayload(entry, deviceToBind, callback) {
    var xml = entry.toString();
    _xml2js2.default.parseString(xml, function (err, result) {
      var deviceTag = result.device;
      var dAttrs = deviceTag.$;

      var dName = dAttrs.name;
      var dId = dAttrs.id;
      var dType = dAttrs.type;
      var dSerialNumber = dAttrs.serialNumber;

      var metaTransducers = [];
      var transducerTags = deviceTag.transducer;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = transducerTags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tTag = _step4.value;

          var tAttrs = tTag.$;

          var tName = tAttrs.name;
          var tId = tAttrs.id;
          var tCanActuate = (tAttrs.canActuate || "false") === "true";
          var tHasOwnNode = (tAttrs.hasOwnNode || "false") === "true";
          var tUnits = tAttrs.units || null;
          var tUnitScalar = tAttrs.unitScalar || null;
          var tMinValue = tAttrs.minValue || null;
          var tMaxValue = tAttrs.maxValue || null;
          var tResolution = tAttrs.resolution || null;

          var transducer = new _meta_transducer2.default(deviceToBind, tName, tId, tCanActuate, tHasOwnNode, tUnits, tUnitScalar, tMinValue, tMaxValue, tResolution);

          metaTransducers.push(transducer);
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

      var meta = new _device_meta2.default(deviceToBind, dId, dType, dSerialNumber, metaTransducers);
      callback(meta);
    });
  }

};

// import * as DataModule from "./data";
// import Data as SoxData from "./data";


module.exports = SoxUtil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3hfdXRpbC5qcyJdLCJuYW1lcyI6WyJTb3hVdGlsIiwicGFyc2VUaW1lc3RhbXAiLCJ0aW1lc3RhbXBTdHIiLCJEYXRlIiwiZXh0cmFjdERldmljZXMiLCJzb3hDb25uIiwiZW50cnkiLCJjYWxsYmFjayIsInhtbCIsInRvU3RyaW5nIiwieG1sMmpzIiwicGFyc2VTdHJpbmciLCJlcnJvciIsInJlc3VsdCIsImlxVGFnIiwiaXEiLCJxdWVyeVRhZyIsInF1ZXJ5IiwiaXRlbVRhZ3MiLCJpdGVtIiwibm9kZUNoZWNrIiwiaXRlbVRhZyIsIml0ZW1BdHRycyIsIiQiLCJub2RlIiwiZW5kc1dpdGhNZXRhIiwiZGV2aWNlTmFtZSIsImN1dE1ldGFTdWZmaXgiLCJ1bmRlZmluZWQiLCJtZXRhIiwiZW5kc1dpdGhEYXRhIiwiY3V0RGF0YVN1ZmZpeCIsImRhdGEiLCJkZXZpY2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoZWNrIiwiZGV2aWNlIiwiYmluZCIsInB1c2giLCJub2RlTmFtZSIsImxlbiIsImxlbmd0aCIsInN1YnN0cmluZyIsInN1YnN0ciIsInBhcnNlRGF0YVBheWxvYWQiLCJtZXNzYWdlVGFnIiwiZXZlbnRUYWciLCJfY2hpbGROb2Rlc0xpc3QiLCJpdGVtc1RhZyIsImRhdGFUYWciLCJ0ZHJUYWdzIiwibWVzc2FnZVRhZ0F0dHJzIiwiX2F0dHJpYnV0ZXMiLCJzZXJ2aWNlIiwiX3ZhbHVlRm9yQXR0ck1vZGlmaWVkIiwiZG9tYWluIiwiaXRlbXNUYWdBdHRycyIsImRldmljZVRvQmluZCIsIkRldmljZSIsInZhbHVlcyIsInRkclRhZyIsInRhZ05hbWUiLCJfbG9jYWxOYW1lIiwiYXR0cnMiLCJhdHRyTmFtZXMiLCJ0cmFuc2R1Y2VySWQiLCJyYXdWYWx1ZSIsInR5cGVkVmFsdWUiLCJ0aW1lc3RhbXAiLCJwYXJzZSIsInZhbHVlIiwiVHJhbnNkdWNlclZhbHVlIiwiRGF0YSIsInBhcnNlTWV0YVBheWxvYWQiLCJlcnIiLCJkZXZpY2VUYWciLCJkQXR0cnMiLCJkTmFtZSIsIm5hbWUiLCJkSWQiLCJpZCIsImRUeXBlIiwidHlwZSIsImRTZXJpYWxOdW1iZXIiLCJzZXJpYWxOdW1iZXIiLCJtZXRhVHJhbnNkdWNlcnMiLCJ0cmFuc2R1Y2VyVGFncyIsInRyYW5zZHVjZXIiLCJ0VGFnIiwidEF0dHJzIiwidE5hbWUiLCJ0SWQiLCJ0Q2FuQWN0dWF0ZSIsImNhbkFjdHVhdGUiLCJ0SGFzT3duTm9kZSIsImhhc093bk5vZGUiLCJ0VW5pdHMiLCJ1bml0cyIsInRVbml0U2NhbGFyIiwidW5pdFNjYWxhciIsInRNaW5WYWx1ZSIsIm1pblZhbHVlIiwidE1heFZhbHVlIiwibWF4VmFsdWUiLCJ0UmVzb2x1dGlvbiIsInJlc29sdXRpb24iLCJNZXRhVHJhbnNkdWNlciIsIkRldmljZU1ldGEiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0FBSUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0EsSUFBSUEsVUFBVTs7QUFFWkMsa0JBQWdCLHdCQUFDQyxZQUFELEVBQWtCO0FBQ2hDLFdBQU8sSUFBSUMsSUFBSixDQUFTRCxZQUFULENBQVA7QUFDRCxHQUpXOztBQU1aRSxrQkFBZ0Isd0JBQUNDLE9BQUQsRUFBVUMsS0FBVixFQUFpQkMsUUFBakIsRUFBOEI7QUFDNUMsUUFBSUMsTUFBTUYsTUFBTUcsUUFBTixFQUFWO0FBQ0FDLHFCQUFPQyxXQUFQLENBQW1CSCxHQUFuQixFQUF3QixVQUFDSSxLQUFELEVBQVFDLE1BQVIsRUFBbUI7O0FBRXpDOztBQUVBLFVBQUlDLFFBQVFELE9BQU9FLEVBQW5CO0FBQ0EsVUFBSUMsV0FBV0YsTUFBTUcsS0FBTixDQUFZLENBQVosQ0FBZjtBQUNBLFVBQUlDLFdBQVdGLFNBQVNHLElBQXhCOztBQUVBO0FBQ0EsVUFBSUMsWUFBWSxFQUFoQjtBQVR5QztBQUFBO0FBQUE7O0FBQUE7QUFVekMsNkJBQW9CRixRQUFwQiw4SEFBOEI7QUFBQSxjQUFyQkcsT0FB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REMsRUFDTUMsR0FETixFQUNXQyxXQURYLEVBQ3dCRSxXQUR4QixFQUNxQ0UsTUFEckMsRUFFZkUsV0FGZSxFQUVGRSxTQUZFLEVBRVNFLFNBRlQsRUFFb0JFLFdBRnBCLENBQWpCOztBQUlBbkIsMEJBQWdCL0MsSUFBaEIsQ0FBcUJpRCxVQUFyQjtBQUNEO0FBN0JzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQStCdkMsVUFBSTNELE9BQU8sSUFBSStFLHFCQUFKLENBQ1RsRCxZQURTLEVBQ0tzQixHQURMLEVBQ1VFLEtBRFYsRUFDaUJFLGFBRGpCLEVBQ2dDRSxlQURoQyxDQUFYO0FBRUEvRSxlQUFTc0IsSUFBVDtBQUNELEtBbENEO0FBbUNEOztBQXhOVyxDQUFkOztBQVRBO0FBQ0E7OztBQW9PQWdGLE9BQU9DLE9BQVAsR0FBaUI5RyxPQUFqQiIsImZpbGUiOiJzb3hfdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB4bWwyanMgZnJvbSBcInhtbDJqc1wiO1xuXG4vLyBpbXBvcnQgKiBhcyBEYXRhTW9kdWxlIGZyb20gXCIuL2RhdGFcIjtcbi8vIGltcG9ydCBEYXRhIGFzIFNveERhdGEgZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IERhdGEgZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IFRyYW5zZHVjZXJWYWx1ZSBmcm9tIFwiLi90cmFuc2R1Y2VyX3ZhbHVlXCI7XG5pbXBvcnQgRGV2aWNlTWV0YSBmcm9tIFwiLi9kZXZpY2VfbWV0YVwiO1xuaW1wb3J0IE1ldGFUcmFuc2R1Y2VyIGZyb20gXCIuL21ldGFfdHJhbnNkdWNlclwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwiLi9kZXZpY2VcIjtcblxuXG5sZXQgU294VXRpbCA9IHtcblxuICBwYXJzZVRpbWVzdGFtcDogKHRpbWVzdGFtcFN0cikgPT4ge1xuICAgIHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXBTdHIpO1xuICB9LFxuXG4gIGV4dHJhY3REZXZpY2VzOiAoc294Q29ubiwgZW50cnksIGNhbGxiYWNrKSA9PiB7XG4gICAgbGV0IHhtbCA9IGVudHJ5LnRvU3RyaW5nKCk7XG4gICAgeG1sMmpzLnBhcnNlU3RyaW5nKHhtbCwgKGVycm9yLCByZXN1bHQpID0+IHtcblxuICAgICAgLy8gY29uc29sZS5sb2coXCJwYXJzZVN0cmluZyBlcnJvcjogXCIgKyBlcnJvcik7XG5cbiAgICAgIGxldCBpcVRhZyA9IHJlc3VsdC5pcTtcbiAgICAgIGxldCBxdWVyeVRhZyA9IGlxVGFnLnF1ZXJ5WzBdO1xuICAgICAgbGV0IGl0ZW1UYWdzID0gcXVlcnlUYWcuaXRlbTtcblxuICAgICAgLy8gaWYgYm90aCBcIl9tZXRhXCIgYW5kIFwiX2RhdGFcIiBleGlzdHMsIGl0IHNob3VsZCBiZSBzb3ggZGV2aWNlXG4gICAgICBsZXQgbm9kZUNoZWNrID0ge307XG4gICAgICBmb3IgKGxldCBpdGVtVGFnIG9mIGl0ZW1UYWdzKSB7XG4gICAgICAgIGxldCBpdGVtQXR0cnMgPSBpdGVtVGFnLiQ7XG4gICAgICAgIGxldCBub2RlID0gaXRlbUF0dHJzLm5vZGU7XG5cbiAgICAgICAgaWYgKFNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGUpKSB7XG4gICAgICAgICAgdmFyIGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dE1ldGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdLm1ldGEgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKFNveFV0aWwuZW5kc1dpdGhEYXRhKG5vZGUpKSB7XG4gICAgICAgICAgdmFyIGRldmljZU5hbWUgPSBTb3hVdGlsLmN1dERhdGFTdWZmaXgobm9kZSk7XG4gICAgICAgICAgaWYgKG5vZGVDaGVja1tkZXZpY2VOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBub2RlQ2hlY2tbZGV2aWNlTmFtZV0gPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbm9kZUNoZWNrW2RldmljZU5hbWVdLmRhdGEgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBkZXZpY2VzID0gW107XG4gICAgICBmb3IgKGxldCBkZXZpY2VOYW1lIG9mIE9iamVjdC5rZXlzKG5vZGVDaGVjaykpIHtcbiAgICAgICAgbGV0IGNoZWNrID0gbm9kZUNoZWNrW2RldmljZU5hbWVdO1xuICAgICAgICBpZiAoY2hlY2subWV0YSAmJiBjaGVjay5kYXRhKSB7XG4gICAgICAgICAgbGV0IGRldmljZSA9IHNveENvbm4uYmluZChkZXZpY2VOYW1lKTtcbiAgICAgICAgICBkZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhkZXZpY2VzKTtcbiAgICB9KTtcbiAgfSxcblxuICBlbmRzV2l0aE1ldGE6IChub2RlTmFtZSkgPT4ge1xuICAgIGxldCBsZW4gPSBub2RlTmFtZS5sZW5ndGg7XG4gICAgcmV0dXJuICg1IDw9IGxlbikgJiYgbm9kZU5hbWUuc3Vic3RyaW5nKGxlbiAtIDUsIGxlbikgPT09IFwiX21ldGFcIjtcbiAgfSxcblxuICBlbmRzV2l0aERhdGE6IChub2RlTmFtZSkgPT4ge1xuICAgIGxldCBsZW4gPSBub2RlTmFtZS5sZW5ndGg7XG4gICAgcmV0dXJuICg1IDw9IGxlbikgJiYgbm9kZU5hbWUuc3Vic3RyaW5nKGxlbiAtIDUsIGxlbikgPT09IFwiX2RhdGFcIjtcbiAgfSxcblxuICBjdXRNZXRhU3VmZml4OiAobm9kZU5hbWUpID0+IHtcbiAgICBpZiAoIVNveFV0aWwuZW5kc1dpdGhNZXRhKG5vZGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG5vZGVOYW1lO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZU5hbWUuc3Vic3RyKDAsIG5vZGVOYW1lLmxlbmd0aCAtIDUpO1xuICB9LFxuXG4gIGN1dERhdGFTdWZmaXg6IChub2RlTmFtZSkgPT4ge1xuICAgIGlmICghU294VXRpbC5lbmRzV2l0aERhdGEobm9kZU5hbWUpKSB7XG4gICAgICByZXR1cm4gbm9kZU5hbWU7XG4gICAgfVxuICAgIHJldHVybiBub2RlTmFtZS5zdWJzdHIoMCwgbm9kZU5hbWUubGVuZ3RoIC0gNSk7XG4gIH0sXG5cbiAgLy8gcGFyc2VEYXRhUGF5bG9hZDogKGVudHJ5LCBkZXZpY2VUb0JpbmQsIGNhbGxiYWNrKSA9PiB7XG4gIC8vICAgbGV0IHhtbCA9IGVudHJ5LnRvU3RyaW5nKCk7XG4gIC8vICAgeG1sMmpzLnBhcnNlU3RyaW5nKHhtbCwgKGVyciwgcmVzdWx0KSA9PiB7XG4gIC8vICAgICBsZXQgZGF0YVRhZyA9IHJlc3VsdC5kYXRhO1xuICAvLyAgICAgbGV0IHRyYW5zZHVjZXJWYWx1ZVRhZ3MgPSBkYXRhVGFnLnRyYW5zZHVjZXJWYWx1ZTtcbiAgLy8gICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgLy8gICAgIGZvciAobGV0IHRWYWx1ZVRhZyBvZiB0cmFuc2R1Y2VyVmFsdWVUYWdzKSB7XG4gIC8vICAgICAgIGxldCB2QXR0cnMgPSB0VmFsdWVUYWcuJDtcbiAgLy8gICAgICAgbGV0IHZJZCA9IHZBdHRycy5pZDtcbiAgLy8gICAgICAgbGV0IHZSYXcgPSB2QXR0cnMucmF3VmFsdWUgfHwgbnVsbDtcbiAgLy8gICAgICAgbGV0IHZUeXBlZCA9IHZBdHRycy50eXBlZFZhbHVlIHx8IG51bGw7XG4gIC8vICAgICAgIGxldCB2VGltZXN0YW1wID0gU294VXRpbC5wYXJzZVRpbWVzdGFtcCh2QXR0cnMudGltZXN0YW1wKTtcbiAgLy9cbiAgLy8gICAgICAgbGV0IHRWYWx1ZSA9IG5ldyBUcmFuc2R1Y2VyVmFsdWUodklkLCB2UmF3LCB2VHlwZWQsIHZUaW1lc3RhbXApO1xuICAvLyAgICAgICB2YWx1ZXMucHVzaCh0VmFsdWUpO1xuICAvLyAgICAgfVxuICAvL1xuICAvLyAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YShkZXZpY2VUb0JpbmQsIHZhbHVlcyk7XG4gIC8vICAgICAvLyBsZXQgZGF0YSA9IG5ldyBEYXRhTW9kdWxlLkRhdGEoZGV2aWNlVG9CaW5kLCB2YWx1ZXMpO1xuICAvLyAgICAgY2FsbGJhY2soZGF0YSk7XG4gIC8vICAgfSk7XG4gIC8vIH0sXG5cbiAgcGFyc2VEYXRhUGF5bG9hZDogKHNveENvbm4sIGVudHJ5LCBjYWxsYmFjaykgPT4ge1xuICAgIGxldCBtZXNzYWdlVGFnID0gZW50cnk7XG4gICAgbGV0IGV2ZW50VGFnID0gZW50cnkuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgIGxldCBpdGVtc1RhZyA9IGV2ZW50VGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICBsZXQgaXRlbVRhZyA9IGl0ZW1zVGFnLl9jaGlsZE5vZGVzTGlzdFswXTtcbiAgICBsZXQgZGF0YVRhZyA9IGl0ZW1UYWcuX2NoaWxkTm9kZXNMaXN0WzBdO1xuICAgIGxldCB0ZHJUYWdzID0gZGF0YVRhZy5fY2hpbGROb2Rlc0xpc3Q7XG5cbiAgICBsZXQgbWVzc2FnZVRhZ0F0dHJzID0gbWVzc2FnZVRhZy5fYXR0cmlidXRlcztcbiAgICBsZXQgc2VydmljZSA9IG1lc3NhZ2VUYWdBdHRyc1snZnJvbSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICBsZXQgZG9tYWluID0gc2VydmljZS5zdWJzdHJpbmcoNyk7ICAvLyBzb3guLi5cbiAgICAvLyBjb25zb2xlLmxvZygnIyMjIHBhcnNlRGF0YVBheWxvYWQ6IGRvbWFpbiA9ICcgKyBkb21haW4pO1xuXG4gICAgbGV0IGl0ZW1zVGFnQXR0cnMgPSBpdGVtc1RhZy5fYXR0cmlidXRlcztcbiAgICBsZXQgbm9kZSA9IGl0ZW1zVGFnQXR0cnNbJ25vZGUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBub2RlID0gJyArIG5vZGUpO1xuICAgIGxldCBkZXZpY2VOYW1lID0gU294VXRpbC5jdXREYXRhU3VmZml4KG5vZGUpO1xuICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgcGFyc2VEYXRhUGF5bG9hZDogZGV2aWNlTmFtZSA9ICcgKyBkZXZpY2VOYW1lKTtcblxuICAgIGxldCBkZXZpY2VUb0JpbmQgPSBuZXcgRGV2aWNlKHNveENvbm4sIGRldmljZU5hbWUsIGRvbWFpbik7XG5cbiAgICBsZXQgdmFsdWVzID0gW107XG5cbiAgICBmb3IgKGxldCB0ZHJUYWcgb2YgdGRyVGFncykge1xuICAgICAgbGV0IHRhZ05hbWUgPSB0ZHJUYWcuX2xvY2FsTmFtZTtcblxuICAgICAgLy8gY29tZSBpbiAndHJhbnNkdWNlclZhbHVlJyBhbmQgJ3RyYW5zZHVjZXJ2YWx1ZSdcbiAgICAgIC8vIEZJWE1FOiBTbmFrZSBjYXNlIGJlY29tZXMgbG93ZXJjYXNlIGluIG5vZGUtc3Ryb3BoZSBzcGVjaWZpY2F0aW9uXG4gICAgICAvLyBpZiB5b3UgZml4IHRoaXMsIGN1c3RvbWl6ZSB0byAnbm9kZS1zdHJvcGhlJ1xuICAgICAgaWYgKHRhZ05hbWUgIT09ICd0cmFuc2R1Y2VyVmFsdWUnICYmIHRhZ05hbWUgIT09ICd0cmFuc2R1Y2VydmFsdWUnKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCcjIyMgdGFnTmFtZSAhPT0gdHJhbnNkdWNlclYodilhbHVlLCBza2lwcGluZzogbmFtZT0nICsgdGFnTmFtZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBleGFtaW5lIHRhZz0nICsgdGFnTmFtZSk7XG5cbiAgICAgIC8vIGxldCBhdHRycyA9IHRkclRhZy5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICBsZXQgYXR0cnMgPSB0ZHJUYWcuX2F0dHJpYnV0ZXM7XG4gICAgICBsZXQgYXR0ck5hbWVzID0gT2JqZWN0LmtleXMoYXR0cnMpO1xuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBhdHRyTmFtZXM9JyArIEpTT04uc3RyaW5naWZ5KGF0dHJOYW1lcykpO1xuXG4gICAgICBsZXQgdHJhbnNkdWNlcklkID0gYXR0cnNbJ2lkJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuXG4gICAgICB2YXIgcmF3VmFsdWUgPSBudWxsO1xuICAgICAgdmFyIHR5cGVkVmFsdWUgPSBudWxsO1xuXG4gICAgICAvLyBpZiBjYW1lbENhc2UgPT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgaWYgKGF0dHJzWydyYXdWYWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmF3VmFsdWUgPSBhdHRyc1sncmF3VmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChhdHRyc1sndHlwZWRWYWx1ZSddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdHlwZWRWYWx1ZSA9IGF0dHJzWyd0eXBlZFZhbHVlJ10uX3ZhbHVlRm9yQXR0ck1vZGlmaWVkO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBsb3dlcmNhc2UgPT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgLy8gRklYTUU6IFNuYWtlIGNhc2UgYmVjb21lcyBsb3dlcmNhc2UgaW4gbm9kZS1zdHJvcGhlIHNwZWNpZmljYXRpb25cbiAgICAgIC8vIGlmIHlvdSBmaXggdGhpcywgY3VzdG9taXplIHRvICdub2RlLXN0cm9waGUnXG4gICAgICBpZiAoYXR0cnNbJ3Jhd3ZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByYXdWYWx1ZSA9IGF0dHJzWydyYXd2YWx1ZSddLl92YWx1ZUZvckF0dHJNb2RpZmllZDtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzWyd0eXBlZHZhbHVlJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0eXBlZFZhbHVlID0gYXR0cnNbJ3R5cGVkdmFsdWUnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG4gICAgICB9XG5cblxuICAgICAgdmFyIHRpbWVzdGFtcCA9IGF0dHJzWyd0aW1lc3RhbXAnXS5fdmFsdWVGb3JBdHRyTW9kaWZpZWQ7XG5cbiAgICAgIGlmICh0aW1lc3RhbXApIHtcbiAgICAgICAgdGltZXN0YW1wID0gRGF0ZS5wYXJzZSh0aW1lc3RhbXApO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmFsdWUgPSBuZXcgVHJhbnNkdWNlclZhbHVlKFxuICAgICAgICB0cmFuc2R1Y2VySWQsIHJhd1ZhbHVlLCB0eXBlZFZhbHVlLCB0aW1lc3RhbXApO1xuICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJyMjIyBwYXJzZURhdGFQYXlsb2FkOiBhZGRlZCB0cmFuc2R1Y2VyIHZhbHVlOiBpZD0nICsgdHJhbnNkdWNlcklkKTtcbiAgICB9XG5cbiAgICBsZXQgZGF0YSA9IG5ldyBEYXRhKGRldmljZVRvQmluZCwgdmFsdWVzKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSxcblxuICBwYXJzZU1ldGFQYXlsb2FkOiAoZW50cnksIGRldmljZVRvQmluZCwgY2FsbGJhY2spID0+IHtcbiAgICBsZXQgeG1sID0gZW50cnkudG9TdHJpbmcoKTtcbiAgICB4bWwyanMucGFyc2VTdHJpbmcoeG1sLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgIGxldCBkZXZpY2VUYWcgPSByZXN1bHQuZGV2aWNlO1xuICAgICAgbGV0IGRBdHRycyA9IGRldmljZVRhZy4kO1xuXG4gICAgICBsZXQgZE5hbWUgPSBkQXR0cnMubmFtZTtcbiAgICAgIGxldCBkSWQgPSBkQXR0cnMuaWQ7XG4gICAgICBsZXQgZFR5cGUgPSBkQXR0cnMudHlwZTtcbiAgICAgIGxldCBkU2VyaWFsTnVtYmVyID0gZEF0dHJzLnNlcmlhbE51bWJlcjtcblxuICAgICAgbGV0IG1ldGFUcmFuc2R1Y2VycyA9IFtdO1xuICAgICAgbGV0IHRyYW5zZHVjZXJUYWdzID0gZGV2aWNlVGFnLnRyYW5zZHVjZXI7XG4gICAgICBmb3IgKGxldCB0VGFnIG9mIHRyYW5zZHVjZXJUYWdzKSB7XG4gICAgICAgIGxldCB0QXR0cnMgPSB0VGFnLiQ7XG5cbiAgICAgICAgbGV0IHROYW1lID0gdEF0dHJzLm5hbWU7XG4gICAgICAgIGxldCB0SWQgPSB0QXR0cnMuaWQ7XG4gICAgICAgIGxldCB0Q2FuQWN0dWF0ZSA9ICh0QXR0cnMuY2FuQWN0dWF0ZSB8fCBcImZhbHNlXCIpID09PSBcInRydWVcIjtcbiAgICAgICAgbGV0IHRIYXNPd25Ob2RlID0gKHRBdHRycy5oYXNPd25Ob2RlIHx8IFwiZmFsc2VcIikgPT09IFwidHJ1ZVwiO1xuICAgICAgICBsZXQgdFVuaXRzID0gdEF0dHJzLnVuaXRzIHx8IG51bGw7XG4gICAgICAgIGxldCB0VW5pdFNjYWxhciA9IHRBdHRycy51bml0U2NhbGFyIHx8IG51bGw7XG4gICAgICAgIGxldCB0TWluVmFsdWUgPSB0QXR0cnMubWluVmFsdWUgfHwgbnVsbDtcbiAgICAgICAgbGV0IHRNYXhWYWx1ZSA9IHRBdHRycy5tYXhWYWx1ZSB8fCBudWxsO1xuICAgICAgICBsZXQgdFJlc29sdXRpb24gPSB0QXR0cnMucmVzb2x1dGlvbiB8fCBudWxsO1xuXG4gICAgICAgIGxldCB0cmFuc2R1Y2VyID0gbmV3IE1ldGFUcmFuc2R1Y2VyKFxuICAgICAgICAgIGRldmljZVRvQmluZCwgdE5hbWUsIHRJZCwgdENhbkFjdHVhdGUsIHRIYXNPd25Ob2RlLCB0VW5pdHMsXG4gICAgICAgICAgdFVuaXRTY2FsYXIsIHRNaW5WYWx1ZSwgdE1heFZhbHVlLCB0UmVzb2x1dGlvbik7XG5cbiAgICAgICAgbWV0YVRyYW5zZHVjZXJzLnB1c2godHJhbnNkdWNlcik7XG4gICAgICB9XG5cbiAgICAgIGxldCBtZXRhID0gbmV3IERldmljZU1ldGEoXG4gICAgICAgIGRldmljZVRvQmluZCwgZElkLCBkVHlwZSwgZFNlcmlhbE51bWJlciwgbWV0YVRyYW5zZHVjZXJzKTtcbiAgICAgIGNhbGxiYWNrKG1ldGEpO1xuICAgIH0pO1xuICB9LFxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNveFV0aWw7XG4iXX0=