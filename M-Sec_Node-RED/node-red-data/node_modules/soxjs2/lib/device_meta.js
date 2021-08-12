'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import XmlUtil from './xml_util';

var _xmlDeclarePatStr = "^<\\?xml[^>]+?>";
var _xmlDeclarePat = new RegExp(_xmlDeclarePatStr);

var DeviceMeta = function () {
  function DeviceMeta(device, deviceId, deviceType, serialNumber, metaTransducers) {
    _classCallCheck(this, DeviceMeta);

    this.device = device;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.serialNumber = serialNumber;
    this.metaTransducers = metaTransducers;
  }

  _createClass(DeviceMeta, [{
    key: 'getXmlAttrs',
    value: function getXmlAttrs() {
      return {
        id: this.deviceId,
        type: this.deviceType,
        serialNumber: this.serialNumber,
        name: this.device.getName(),
        xmlns: 'http://jabber.org/protocol/sox'
      };
    }
  }, {
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.getDevice().getName();
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this.deviceId;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return this.deviceType;
    }
  }, {
    key: 'getSerialNumber',
    value: function getSerialNumber() {
      return this.serialNumber;
    }
  }, {
    key: 'getMetaTransducers',
    value: function getMetaTransducers() {
      return this.metaTransducers;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      var tMetas = this.metaTransducers.map(function (mtv) {
        return mtv._getContentForXmlBuild();
      });
      return {
        device: {
          '$': {
            xmlns: 'http://jabber.org/protocol/sox',
            name: this.getName(),
            id: this.deviceId,
            type: this.deviceType,
            serialNumber: this.serialNumber
          },
          transducer: tMetas
        }
      };
    }
  }, {
    key: 'toXmlString',
    value: function toXmlString() {
      // import XmlUtil from './xml_util';
      var builder = new _xml2js2.default.Builder({ renderOpts: { pretty: false } });
      var content = this._getContentForXmlBuild();
      var rawXmlStr = builder.buildObject(content);

      // remove <?xml ....?>
      // let trimmedXmlStr = XmlUtil.removeXmlDeclaration(rawXmlStr);
      var trimmedXmlStr = rawXmlStr.replace(_xmlDeclarePat, "");

      return trimmedXmlStr;
    }
  }, {
    key: 'appendToNode',
    value: function appendToNode(node) {
      // used when publish
      var ret = node.c('device', this.getXmlAttrs());

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.metaTransducers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tdr = _step.value;

          ret.c('transducer', tdr.getXmlAttrs()).up();
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
  }]);

  return DeviceMeta;
}();

module.exports = DeviceMeta;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZpY2VfbWV0YS5qcyJdLCJuYW1lcyI6WyJfeG1sRGVjbGFyZVBhdFN0ciIsIl94bWxEZWNsYXJlUGF0IiwiUmVnRXhwIiwiRGV2aWNlTWV0YSIsImRldmljZSIsImRldmljZUlkIiwiZGV2aWNlVHlwZSIsInNlcmlhbE51bWJlciIsIm1ldGFUcmFuc2R1Y2VycyIsImlkIiwidHlwZSIsIm5hbWUiLCJnZXROYW1lIiwieG1sbnMiLCJnZXREZXZpY2UiLCJ0TWV0YXMiLCJtYXAiLCJtdHYiLCJfZ2V0Q29udGVudEZvclhtbEJ1aWxkIiwidHJhbnNkdWNlciIsImJ1aWxkZXIiLCJ4bWwyanMiLCJCdWlsZGVyIiwicmVuZGVyT3B0cyIsInByZXR0eSIsImNvbnRlbnQiLCJyYXdYbWxTdHIiLCJidWlsZE9iamVjdCIsInRyaW1tZWRYbWxTdHIiLCJyZXBsYWNlIiwibm9kZSIsInJldCIsImMiLCJnZXRYbWxBdHRycyIsInRkciIsInVwIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7OztBQUNBOztBQUVBLElBQU1BLG9CQUFvQixpQkFBMUI7QUFDQSxJQUFNQyxpQkFBaUIsSUFBSUMsTUFBSixDQUFXRixpQkFBWCxDQUF2Qjs7SUFFTUcsVTtBQUVKLHNCQUFZQyxNQUFaLEVBQW9CQyxRQUFwQixFQUE4QkMsVUFBOUIsRUFBMENDLFlBQTFDLEVBQXdEQyxlQUF4RCxFQUF5RTtBQUFBOztBQUN2RSxTQUFLSixNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFNBQUtDLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQUNEOzs7O2tDQUVhO0FBQ1osYUFBTztBQUNMQyxZQUFJLEtBQUtKLFFBREo7QUFFTEssY0FBTSxLQUFLSixVQUZOO0FBR0xDLHNCQUFjLEtBQUtBLFlBSGQ7QUFJTEksY0FBTSxLQUFLUCxNQUFMLENBQVlRLE9BQVosRUFKRDtBQUtMQyxlQUFPO0FBTEYsT0FBUDtBQU9EOzs7Z0NBRVc7QUFDVixhQUFPLEtBQUtULE1BQVo7QUFDRDs7OzhCQUVTO0FBQ1IsYUFBTyxLQUFLVSxTQUFMLEdBQWlCRixPQUFqQixFQUFQO0FBQ0Q7Ozs0QkFFTztBQUNOLGFBQU8sS0FBS1AsUUFBWjtBQUNEOzs7OEJBRVM7QUFDUixhQUFPLEtBQUtDLFVBQVo7QUFDRDs7O3NDQUVpQjtBQUNoQixhQUFPLEtBQUtDLFlBQVo7QUFDRDs7O3lDQUVvQjtBQUNuQixhQUFPLEtBQUtDLGVBQVo7QUFDRDs7OzZDQUV3QjtBQUN2QjtBQUNBLFVBQUlPLFNBQVMsS0FBS1AsZUFBTCxDQUFxQlEsR0FBckIsQ0FBeUI7QUFBQSxlQUFPQyxJQUFJQyxzQkFBSixFQUFQO0FBQUEsT0FBekIsQ0FBYjtBQUNBLGFBQU87QUFDTGQsZ0JBQVE7QUFDTixlQUFLO0FBQ0hTLG1CQUFPLGdDQURKO0FBRUhGLGtCQUFNLEtBQUtDLE9BQUwsRUFGSDtBQUdISCxnQkFBSSxLQUFLSixRQUhOO0FBSUhLLGtCQUFNLEtBQUtKLFVBSlI7QUFLSEMsMEJBQWMsS0FBS0E7QUFMaEIsV0FEQztBQVFOWSxzQkFBWUo7QUFSTjtBQURILE9BQVA7QUFZRDs7O2tDQUVhO0FBQ1o7QUFDQSxVQUFNSyxVQUFVLElBQUlDLGlCQUFPQyxPQUFYLENBQW1CLEVBQUVDLFlBQVksRUFBQ0MsUUFBUSxLQUFULEVBQWQsRUFBbkIsQ0FBaEI7QUFDQSxVQUFNQyxVQUFVLEtBQUtQLHNCQUFMLEVBQWhCO0FBQ0EsVUFBTVEsWUFBWU4sUUFBUU8sV0FBUixDQUFvQkYsT0FBcEIsQ0FBbEI7O0FBRUE7QUFDQTtBQUNBLFVBQU1HLGdCQUFnQkYsVUFBVUcsT0FBVixDQUFrQjVCLGNBQWxCLEVBQWtDLEVBQWxDLENBQXRCOztBQUVBLGFBQU8yQixhQUFQO0FBQ0Q7OztpQ0FFWUUsSSxFQUFNO0FBQ2pCO0FBQ0EsVUFBTUMsTUFBTUQsS0FBS0UsQ0FBTCxDQUFPLFFBQVAsRUFBaUIsS0FBS0MsV0FBTCxFQUFqQixDQUFaOztBQUZpQjtBQUFBO0FBQUE7O0FBQUE7QUFJakIsNkJBQWtCLEtBQUt6QixlQUF2Qiw4SEFBd0M7QUFBQSxjQUE3QjBCLEdBQTZCOztBQUN0Q0gsY0FBSUMsQ0FBSixDQUFNLFlBQU4sRUFBb0JFLElBQUlELFdBQUosRUFBcEIsRUFBdUNFLEVBQXZDO0FBQ0Q7QUFOZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFRakIsYUFBT0osR0FBUDtBQUNEOzs7Ozs7QUFJSEssT0FBT0MsT0FBUCxHQUFpQmxDLFVBQWpCIiwiZmlsZSI6ImRldmljZV9tZXRhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHhtbDJqcyBmcm9tICd4bWwyanMnO1xuLy8gaW1wb3J0IFhtbFV0aWwgZnJvbSAnLi94bWxfdXRpbCc7XG5cbmNvbnN0IF94bWxEZWNsYXJlUGF0U3RyID0gXCJePFxcXFw/eG1sW14+XSs/PlwiO1xuY29uc3QgX3htbERlY2xhcmVQYXQgPSBuZXcgUmVnRXhwKF94bWxEZWNsYXJlUGF0U3RyKTtcblxuY2xhc3MgRGV2aWNlTWV0YSB7XG5cbiAgY29uc3RydWN0b3IoZGV2aWNlLCBkZXZpY2VJZCwgZGV2aWNlVHlwZSwgc2VyaWFsTnVtYmVyLCBtZXRhVHJhbnNkdWNlcnMpIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLmRldmljZUlkID0gZGV2aWNlSWQ7XG4gICAgdGhpcy5kZXZpY2VUeXBlID0gZGV2aWNlVHlwZTtcbiAgICB0aGlzLnNlcmlhbE51bWJlciA9IHNlcmlhbE51bWJlcjtcbiAgICB0aGlzLm1ldGFUcmFuc2R1Y2VycyA9IG1ldGFUcmFuc2R1Y2VycztcbiAgfVxuXG4gIGdldFhtbEF0dHJzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5kZXZpY2VJZCxcbiAgICAgIHR5cGU6IHRoaXMuZGV2aWNlVHlwZSxcbiAgICAgIHNlcmlhbE51bWJlcjogdGhpcy5zZXJpYWxOdW1iZXIsXG4gICAgICBuYW1lOiB0aGlzLmRldmljZS5nZXROYW1lKCksXG4gICAgICB4bWxuczogJ2h0dHA6Ly9qYWJiZXIub3JnL3Byb3RvY29sL3NveCdcbiAgICB9O1xuICB9XG5cbiAgZ2V0RGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLmRldmljZTtcbiAgfVxuXG4gIGdldE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGV2aWNlKCkuZ2V0TmFtZSgpO1xuICB9XG5cbiAgZ2V0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlSWQ7XG4gIH1cblxuICBnZXRUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLmRldmljZVR5cGU7XG4gIH1cblxuICBnZXRTZXJpYWxOdW1iZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VyaWFsTnVtYmVyO1xuICB9XG5cbiAgZ2V0TWV0YVRyYW5zZHVjZXJzKCkge1xuICAgIHJldHVybiB0aGlzLm1ldGFUcmFuc2R1Y2VycztcbiAgfVxuXG4gIF9nZXRDb250ZW50Rm9yWG1sQnVpbGQoKSB7XG4gICAgLy8gYnVpbGQgY29udGVudCBmb3IgeG1sMmpzLkJ1aWxkZXJcbiAgICB2YXIgdE1ldGFzID0gdGhpcy5tZXRhVHJhbnNkdWNlcnMubWFwKG10diA9PiBtdHYuX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpKTtcbiAgICByZXR1cm4ge1xuICAgICAgZGV2aWNlOiB7XG4gICAgICAgICckJzoge1xuICAgICAgICAgIHhtbG5zOiAnaHR0cDovL2phYmJlci5vcmcvcHJvdG9jb2wvc294JyxcbiAgICAgICAgICBuYW1lOiB0aGlzLmdldE5hbWUoKSxcbiAgICAgICAgICBpZDogdGhpcy5kZXZpY2VJZCxcbiAgICAgICAgICB0eXBlOiB0aGlzLmRldmljZVR5cGUsXG4gICAgICAgICAgc2VyaWFsTnVtYmVyOiB0aGlzLnNlcmlhbE51bWJlclxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2R1Y2VyOiB0TWV0YXNcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdG9YbWxTdHJpbmcoKSB7XG4gICAgLy8gaW1wb3J0IFhtbFV0aWwgZnJvbSAnLi94bWxfdXRpbCc7XG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyB4bWwyanMuQnVpbGRlcih7IHJlbmRlck9wdHM6IHtwcmV0dHk6IGZhbHNlfSB9KTtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5fZ2V0Q29udGVudEZvclhtbEJ1aWxkKCk7XG4gICAgY29uc3QgcmF3WG1sU3RyID0gYnVpbGRlci5idWlsZE9iamVjdChjb250ZW50KTtcblxuICAgIC8vIHJlbW92ZSA8P3htbCAuLi4uPz5cbiAgICAvLyBsZXQgdHJpbW1lZFhtbFN0ciA9IFhtbFV0aWwucmVtb3ZlWG1sRGVjbGFyYXRpb24ocmF3WG1sU3RyKTtcbiAgICBjb25zdCB0cmltbWVkWG1sU3RyID0gcmF3WG1sU3RyLnJlcGxhY2UoX3htbERlY2xhcmVQYXQsIFwiXCIpO1xuXG4gICAgcmV0dXJuIHRyaW1tZWRYbWxTdHI7XG4gIH1cblxuICBhcHBlbmRUb05vZGUobm9kZSkge1xuICAgIC8vIHVzZWQgd2hlbiBwdWJsaXNoXG4gICAgY29uc3QgcmV0ID0gbm9kZS5jKCdkZXZpY2UnLCB0aGlzLmdldFhtbEF0dHJzKCkpO1xuXG4gICAgZm9yIChjb25zdCB0ZHIgb2YgdGhpcy5tZXRhVHJhbnNkdWNlcnMpIHtcbiAgICAgIHJldC5jKCd0cmFuc2R1Y2VyJywgdGRyLmdldFhtbEF0dHJzKCkpLnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGV2aWNlTWV0YTtcbiJdfQ==