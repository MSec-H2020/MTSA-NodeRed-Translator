'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// TODO
// import SoxUtil from './sox_util';


var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _xml_util = require('./xml_util');

var _xml_util2 = _interopRequireDefault(_xml_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Data = function () {
  function Data(device, transducerValues) {
    _classCallCheck(this, Data);

    this.device = device;
    this.transducerValues = transducerValues;
  }

  _createClass(Data, [{
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getTransducerValues',
    value: function getTransducerValues() {
      return this.transducerValues;
    }
  }, {
    key: 'getRawValues',
    value: function getRawValues() {
      var vals = this.getTransducerValues();
      var ret = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = vals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var v = _step.value;

          var tid = v.getTransducerId();
          ret[tid] = v.getRawValue();
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

      return ret;
    }
  }, {
    key: 'getTypedValues',
    value: function getTypedValues() {
      var vals = this.getTransducerValues();
      var ret = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = vals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var v = _step2.value;

          var tid = v.getTransducerId();
          ret[tid] = v.getTypedValue();
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

      return ret;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      var tValues = this.transducerValues.map(function (tv) {
        return tv._getContentForXmlBuild();
      });
      return {
        device: {
          '$': {
            xmlns: 'http://jabber.org/protocol/sox'
          },
          transducerValue: tValues
        }
      };
    }
  }, {
    key: 'toXmlString',
    value: function toXmlString() {
      var builder = new _xml2js2.default.Builder({ renderOpts: { pretty: false } });
      var content = this._getContentForXmlBuild();
      var rawXmlStr = builder.buildObject(content);

      // remove <?xml ....?>
      var trimmedXmlStr = _xml_util2.default.removeXmlDeclaration(rawXmlStr);

      return trimmedXmlStr;
    }
  }, {
    key: 'appendToNode',
    value: function appendToNode(node) {
      var ret = node.c('data', { xmlns: 'http://jabber.org/protocol/sox' });

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.transducerValues[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var tv = _step3.value;

          ret.c('transducerValue', tv.getXmlAttrs()).up();
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

      return ret;
    }
  }]);

  return Data;
}();

module.exports = Data;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYXRhLmpzIl0sIm5hbWVzIjpbIkRhdGEiLCJkZXZpY2UiLCJ0cmFuc2R1Y2VyVmFsdWVzIiwidmFscyIsImdldFRyYW5zZHVjZXJWYWx1ZXMiLCJyZXQiLCJ2IiwidGlkIiwiZ2V0VHJhbnNkdWNlcklkIiwiZ2V0UmF3VmFsdWUiLCJnZXRUeXBlZFZhbHVlIiwidFZhbHVlcyIsIm1hcCIsInR2IiwiX2dldENvbnRlbnRGb3JYbWxCdWlsZCIsInhtbG5zIiwidHJhbnNkdWNlclZhbHVlIiwiYnVpbGRlciIsInhtbDJqcyIsIkJ1aWxkZXIiLCJyZW5kZXJPcHRzIiwicHJldHR5IiwiY29udGVudCIsInJhd1htbFN0ciIsImJ1aWxkT2JqZWN0IiwidHJpbW1lZFhtbFN0ciIsIlhtbFV0aWwiLCJyZW1vdmVYbWxEZWNsYXJhdGlvbiIsIm5vZGUiLCJjIiwiZ2V0WG1sQXR0cnMiLCJ1cCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFHQTtBQUNBOzs7QUFIQTs7OztBQUlBOzs7Ozs7OztJQUdNQSxJO0FBRUosZ0JBQVlDLE1BQVosRUFBb0JDLGdCQUFwQixFQUFzQztBQUFBOztBQUNwQyxTQUFLRCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QkEsZ0JBQXhCO0FBQ0Q7Ozs7Z0NBRVc7QUFDVixhQUFPLEtBQUtELE1BQVo7QUFDRDs7OzBDQUVxQjtBQUNwQixhQUFPLEtBQUtDLGdCQUFaO0FBQ0Q7OzttQ0FFYztBQUNiLFVBQUlDLE9BQU8sS0FBS0MsbUJBQUwsRUFBWDtBQUNBLFVBQUlDLE1BQU0sRUFBVjtBQUZhO0FBQUE7QUFBQTs7QUFBQTtBQUdiLDZCQUFjRixJQUFkLDhIQUFvQjtBQUFBLGNBQVhHLENBQVc7O0FBQ2xCLGNBQUlDLE1BQU1ELEVBQUVFLGVBQUYsRUFBVjtBQUNBSCxjQUFJRSxHQUFKLElBQVdELEVBQUVHLFdBQUYsRUFBWDtBQUNEO0FBTlk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFPYixhQUFPSixHQUFQO0FBQ0Q7OztxQ0FFZ0I7QUFDZixVQUFJRixPQUFPLEtBQUtDLG1CQUFMLEVBQVg7QUFDQSxVQUFJQyxNQUFNLEVBQVY7QUFGZTtBQUFBO0FBQUE7O0FBQUE7QUFHZiw4QkFBY0YsSUFBZCxtSUFBb0I7QUFBQSxjQUFYRyxDQUFXOztBQUNsQixjQUFJQyxNQUFNRCxFQUFFRSxlQUFGLEVBQVY7QUFDQUgsY0FBSUUsR0FBSixJQUFXRCxFQUFFSSxhQUFGLEVBQVg7QUFDRDtBQU5jO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBT2YsYUFBT0wsR0FBUDtBQUNEOzs7NkNBRXdCO0FBQ3ZCO0FBQ0EsVUFBSU0sVUFBVSxLQUFLVCxnQkFBTCxDQUFzQlUsR0FBdEIsQ0FBMEI7QUFBQSxlQUFNQyxHQUFHQyxzQkFBSCxFQUFOO0FBQUEsT0FBMUIsQ0FBZDtBQUNBLGFBQU87QUFDTGIsZ0JBQVE7QUFDTixlQUFLO0FBQ0hjLG1CQUFPO0FBREosV0FEQztBQUlOQywyQkFBaUJMO0FBSlg7QUFESCxPQUFQO0FBUUQ7OztrQ0FFYTtBQUNaLFVBQUlNLFVBQVUsSUFBSUMsaUJBQU9DLE9BQVgsQ0FBbUIsRUFBRUMsWUFBWSxFQUFDQyxRQUFRLEtBQVQsRUFBZCxFQUFuQixDQUFkO0FBQ0EsVUFBSUMsVUFBVSxLQUFLUixzQkFBTCxFQUFkO0FBQ0EsVUFBSVMsWUFBWU4sUUFBUU8sV0FBUixDQUFvQkYsT0FBcEIsQ0FBaEI7O0FBRUE7QUFDQSxVQUFJRyxnQkFBZ0JDLG1CQUFRQyxvQkFBUixDQUE2QkosU0FBN0IsQ0FBcEI7O0FBRUEsYUFBT0UsYUFBUDtBQUNEOzs7aUNBRVlHLEksRUFBTTtBQUNqQixVQUFNdkIsTUFBTXVCLEtBQUtDLENBQUwsQ0FBTyxNQUFQLEVBQWUsRUFBRWQsT0FBTyxnQ0FBVCxFQUFmLENBQVo7O0FBRGlCO0FBQUE7QUFBQTs7QUFBQTtBQUdqQiw4QkFBaUIsS0FBS2IsZ0JBQXRCLG1JQUF3QztBQUFBLGNBQTdCVyxFQUE2Qjs7QUFDdENSLGNBQUl3QixDQUFKLENBQU0saUJBQU4sRUFBeUJoQixHQUFHaUIsV0FBSCxFQUF6QixFQUEyQ0MsRUFBM0M7QUFDRDtBQUxnQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU9qQixhQUFPMUIsR0FBUDtBQUNEOzs7Ozs7QUFLSDJCLE9BQU9DLE9BQVAsR0FBaUJqQyxJQUFqQiIsImZpbGUiOiJkYXRhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeG1sMmpzIGZyb20gJ3htbDJqcyc7XG5cbi8vIFRPRE9cbi8vIGltcG9ydCBTb3hVdGlsIGZyb20gJy4vc294X3V0aWwnO1xuaW1wb3J0IFhtbFV0aWwgZnJvbSAnLi94bWxfdXRpbCc7XG5cblxuY2xhc3MgRGF0YSB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlLCB0cmFuc2R1Y2VyVmFsdWVzKSB7XG4gICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgdGhpcy50cmFuc2R1Y2VyVmFsdWVzID0gdHJhbnNkdWNlclZhbHVlcztcbiAgfVxuXG4gIGdldERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2U7XG4gIH1cblxuICBnZXRUcmFuc2R1Y2VyVmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZHVjZXJWYWx1ZXM7XG4gIH1cblxuICBnZXRSYXdWYWx1ZXMoKSB7XG4gICAgbGV0IHZhbHMgPSB0aGlzLmdldFRyYW5zZHVjZXJWYWx1ZXMoKTtcbiAgICBsZXQgcmV0ID0ge307XG4gICAgZm9yIChsZXQgdiBvZiB2YWxzKSB7XG4gICAgICBsZXQgdGlkID0gdi5nZXRUcmFuc2R1Y2VySWQoKTtcbiAgICAgIHJldFt0aWRdID0gdi5nZXRSYXdWYWx1ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZ2V0VHlwZWRWYWx1ZXMoKSB7XG4gICAgbGV0IHZhbHMgPSB0aGlzLmdldFRyYW5zZHVjZXJWYWx1ZXMoKTtcbiAgICBsZXQgcmV0ID0ge307XG4gICAgZm9yIChsZXQgdiBvZiB2YWxzKSB7XG4gICAgICBsZXQgdGlkID0gdi5nZXRUcmFuc2R1Y2VySWQoKTtcbiAgICAgIHJldFt0aWRdID0gdi5nZXRUeXBlZFZhbHVlKCk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBfZ2V0Q29udGVudEZvclhtbEJ1aWxkKCkge1xuICAgIC8vIGJ1aWxkIGNvbnRlbnQgZm9yIHhtbDJqcy5CdWlsZGVyXG4gICAgdmFyIHRWYWx1ZXMgPSB0aGlzLnRyYW5zZHVjZXJWYWx1ZXMubWFwKHR2ID0+IHR2Ll9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRldmljZToge1xuICAgICAgICAnJCc6IHtcbiAgICAgICAgICB4bWxuczogJ2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3NveCdcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNkdWNlclZhbHVlOiB0VmFsdWVzXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHRvWG1sU3RyaW5nKCkge1xuICAgIGxldCBidWlsZGVyID0gbmV3IHhtbDJqcy5CdWlsZGVyKHsgcmVuZGVyT3B0czoge3ByZXR0eTogZmFsc2V9IH0pO1xuICAgIGxldCBjb250ZW50ID0gdGhpcy5fZ2V0Q29udGVudEZvclhtbEJ1aWxkKCk7XG4gICAgbGV0IHJhd1htbFN0ciA9IGJ1aWxkZXIuYnVpbGRPYmplY3QoY29udGVudCk7XG5cbiAgICAvLyByZW1vdmUgPD94bWwgLi4uLj8+XG4gICAgbGV0IHRyaW1tZWRYbWxTdHIgPSBYbWxVdGlsLnJlbW92ZVhtbERlY2xhcmF0aW9uKHJhd1htbFN0cik7XG5cbiAgICByZXR1cm4gdHJpbW1lZFhtbFN0cjtcbiAgfVxuXG4gIGFwcGVuZFRvTm9kZShub2RlKSB7XG4gICAgY29uc3QgcmV0ID0gbm9kZS5jKCdkYXRhJywgeyB4bWxuczogJ2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3NveCcgfSk7XG5cbiAgICBmb3IgKGNvbnN0IHR2IG9mIHRoaXMudHJhbnNkdWNlclZhbHVlcykge1xuICAgICAgcmV0LmMoJ3RyYW5zZHVjZXJWYWx1ZScsIHR2LmdldFhtbEF0dHJzKCkpLnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhO1xuIl19