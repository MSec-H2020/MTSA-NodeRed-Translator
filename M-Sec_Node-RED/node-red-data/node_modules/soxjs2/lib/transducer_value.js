'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TransducerValue = function () {
  function TransducerValue(transducerId, rawValue, typedValue, timestamp) {
    _classCallCheck(this, TransducerValue);

    this.transducerId = transducerId;
    this.rawValue = rawValue;
    this.typedValue = typedValue;
    if (timestamp === undefined) {
      timestamp = new Date();
    }
    this.timestamp = timestamp;
  }

  _createClass(TransducerValue, [{
    key: 'getTransducerId',
    value: function getTransducerId() {
      return this.transducerId;
    }
  }, {
    key: 'getRawValue',
    value: function getRawValue() {
      return this.rawValue;
    }
  }, {
    key: 'getTypedValue',
    value: function getTypedValue() {
      return this.typedValue;
    }
  }, {
    key: 'getTimestamp',
    value: function getTimestamp() {
      return this.timestamp;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder
      return { '$': this.getXmlAttrs() };
    }
  }, {
    key: 'getXmlAttrs',
    value: function getXmlAttrs() {
      var ts = this.timestamp.toISOString();
      return {
        'id': this.transducerId,
        'rawValue': this.rawValue,
        'typedValue': this.typedValue,
        'timestamp': ts
      };
    }
  }]);

  return TransducerValue;
}();

module.exports = TransducerValue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2R1Y2VyX3ZhbHVlLmpzIl0sIm5hbWVzIjpbIlRyYW5zZHVjZXJWYWx1ZSIsInRyYW5zZHVjZXJJZCIsInJhd1ZhbHVlIiwidHlwZWRWYWx1ZSIsInRpbWVzdGFtcCIsInVuZGVmaW5lZCIsIkRhdGUiLCJnZXRYbWxBdHRycyIsInRzIiwidG9JU09TdHJpbmciLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTUEsZTtBQUVKLDJCQUFZQyxZQUFaLEVBQTBCQyxRQUExQixFQUFvQ0MsVUFBcEMsRUFBZ0RDLFNBQWhELEVBQTJEO0FBQUE7O0FBQ3pELFNBQUtILFlBQUwsR0FBb0JBLFlBQXBCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFFBQUlDLGNBQWNDLFNBQWxCLEVBQTZCO0FBQzNCRCxrQkFBWSxJQUFJRSxJQUFKLEVBQVo7QUFDRDtBQUNELFNBQUtGLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0Q7Ozs7c0NBRWlCO0FBQ2hCLGFBQU8sS0FBS0gsWUFBWjtBQUNEOzs7a0NBRWE7QUFDWixhQUFPLEtBQUtDLFFBQVo7QUFDRDs7O29DQUVlO0FBQ2QsYUFBTyxLQUFLQyxVQUFaO0FBQ0Q7OzttQ0FFYztBQUNiLGFBQU8sS0FBS0MsU0FBWjtBQUNEOzs7NkNBRXdCO0FBQ3ZCO0FBQ0EsYUFBTyxFQUFFLEtBQUssS0FBS0csV0FBTCxFQUFQLEVBQVA7QUFDRDs7O2tDQUVhO0FBQ1osVUFBSUMsS0FBSyxLQUFLSixTQUFMLENBQWVLLFdBQWYsRUFBVDtBQUNBLGFBQU87QUFDTCxjQUFNLEtBQUtSLFlBRE47QUFFTCxvQkFBWSxLQUFLQyxRQUZaO0FBR0wsc0JBQWMsS0FBS0MsVUFIZDtBQUlMLHFCQUFhSztBQUpSLE9BQVA7QUFNRDs7Ozs7O0FBSUhFLE9BQU9DLE9BQVAsR0FBaUJYLGVBQWpCIiwiZmlsZSI6InRyYW5zZHVjZXJfdmFsdWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUcmFuc2R1Y2VyVmFsdWUge1xuXG4gIGNvbnN0cnVjdG9yKHRyYW5zZHVjZXJJZCwgcmF3VmFsdWUsIHR5cGVkVmFsdWUsIHRpbWVzdGFtcCkge1xuICAgIHRoaXMudHJhbnNkdWNlcklkID0gdHJhbnNkdWNlcklkO1xuICAgIHRoaXMucmF3VmFsdWUgPSByYXdWYWx1ZTtcbiAgICB0aGlzLnR5cGVkVmFsdWUgPSB0eXBlZFZhbHVlO1xuICAgIGlmICh0aW1lc3RhbXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXN0YW1wID0gbmV3IERhdGUoKTtcbiAgICB9XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gIH1cblxuICBnZXRUcmFuc2R1Y2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNkdWNlcklkO1xuICB9XG5cbiAgZ2V0UmF3VmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucmF3VmFsdWU7XG4gIH1cblxuICBnZXRUeXBlZFZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGVkVmFsdWU7XG4gIH1cblxuICBnZXRUaW1lc3RhbXAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZXN0YW1wO1xuICB9XG5cbiAgX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpIHtcbiAgICAvLyBidWlsZCBjb250ZW50IGZvciB4bWwyanMuQnVpbGRlclxuICAgIHJldHVybiB7ICckJzogdGhpcy5nZXRYbWxBdHRycygpIH07XG4gIH1cblxuICBnZXRYbWxBdHRycygpIHtcbiAgICBsZXQgdHMgPSB0aGlzLnRpbWVzdGFtcC50b0lTT1N0cmluZygpO1xuICAgIHJldHVybiB7XG4gICAgICAnaWQnOiB0aGlzLnRyYW5zZHVjZXJJZCxcbiAgICAgICdyYXdWYWx1ZSc6IHRoaXMucmF3VmFsdWUsXG4gICAgICAndHlwZWRWYWx1ZSc6IHRoaXMudHlwZWRWYWx1ZSxcbiAgICAgICd0aW1lc3RhbXAnOiB0c1xuICAgIH07XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZHVjZXJWYWx1ZTtcbiJdfQ==