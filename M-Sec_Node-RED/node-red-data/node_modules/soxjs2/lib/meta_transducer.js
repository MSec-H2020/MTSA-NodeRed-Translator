'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MetaTransducer = function () {
  function MetaTransducer(device, name, tdrId, _canActuate, _hasOwnNode, units, unitScalar, minValue, maxValue, resolution) {
    _classCallCheck(this, MetaTransducer);

    this.device = device;
    this.name = name;
    this.tdrId = tdrId;
    this._canActuate = _canActuate;
    this._hasOwnNode = _hasOwnNode;
    this.units = units;
    this.unitScalar = unitScalar;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.resolution = resolution;
  }

  _createClass(MetaTransducer, [{
    key: 'getDevice',
    value: function getDevice() {
      return this.device;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this.tdrId;
    }
  }, {
    key: 'canActuate',
    value: function canActuate() {
      return this._canActuate;
    }
  }, {
    key: 'hasOwnNode',
    value: function hasOwnNode() {
      return this._hasOwnNode;
    }
  }, {
    key: 'getUnits',
    value: function getUnits() {
      return this.units;
    }
  }, {
    key: 'getUnitScalar',
    value: function getUnitScalar() {
      return this.unitScalar;
    }
  }, {
    key: 'getMinValue',
    value: function getMinValue() {
      return this.minValue;
    }
  }, {
    key: 'getMaxValue',
    value: function getMaxValue() {
      return this.maxValue;
    }
  }, {
    key: 'getResolution',
    value: function getResolution() {
      return this.resolution;
    }
  }, {
    key: 'getXmlAttrs',
    value: function getXmlAttrs() {
      var attrs = {
        name: this.name,
        id: this.tdrId
        // canActuate: String(this.canActuate()),
        // hasOwnNode: String(this.hasOwnNode()),
        // units: this.units,
        // unitScalar: this.unitScalar,
        // minValue: this.minValue,
        // maxValue: this.maxValue,
        // resolution: this.resolution
      };

      if (this._canActuate !== undefined) {
        attrs.canActuate = String(this.canActuate());
      }

      if (this._hasOwnNode !== undefined) {
        attrs.hasOwnNode = String(this.hasOwnNode());
      }

      if (this.units) {
        attrs.units = this.units;
      }

      if (this.unitScalar) {
        attrs.unitScalar = this.unitScalar;
      }

      if (this.minValue) {
        attrs.minValue = this.minValue;
      }

      if (this.maxValue) {
        attrs.maxValue = this.maxValue;
      }

      if (this.resolution) {
        attrs.resolution = this.resolution;
      }

      return attrs;
    }
  }, {
    key: '_getContentForXmlBuild',
    value: function _getContentForXmlBuild() {
      // build content for xml2js.Builder()
      return { '$': this.getXmlAttrs() };
    }
  }]);

  return MetaTransducer;
}();

module.exports = MetaTransducer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhX3RyYW5zZHVjZXIuanMiXSwibmFtZXMiOlsiTWV0YVRyYW5zZHVjZXIiLCJkZXZpY2UiLCJuYW1lIiwidGRySWQiLCJfY2FuQWN0dWF0ZSIsIl9oYXNPd25Ob2RlIiwidW5pdHMiLCJ1bml0U2NhbGFyIiwibWluVmFsdWUiLCJtYXhWYWx1ZSIsInJlc29sdXRpb24iLCJhdHRycyIsImlkIiwidW5kZWZpbmVkIiwiY2FuQWN0dWF0ZSIsIlN0cmluZyIsImhhc093bk5vZGUiLCJnZXRYbWxBdHRycyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxjO0FBRUosMEJBQVlDLE1BQVosRUFBb0JDLElBQXBCLEVBQTBCQyxLQUExQixFQUFpQ0MsV0FBakMsRUFBOENDLFdBQTlDLEVBQTJEQyxLQUEzRCxFQUNJQyxVQURKLEVBQ2dCQyxRQURoQixFQUMwQkMsUUFEMUIsRUFDb0NDLFVBRHBDLEVBQ2dEO0FBQUE7O0FBQzlDLFNBQUtULE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtDLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQkEsV0FBbkI7QUFDQSxTQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxVQUFMLEdBQWtCQSxVQUFsQjtBQUNEOzs7O2dDQUVXO0FBQ1YsYUFBTyxLQUFLVCxNQUFaO0FBQ0Q7Ozs4QkFFUztBQUNSLGFBQU8sS0FBS0MsSUFBWjtBQUNEOzs7NEJBRU87QUFDTixhQUFPLEtBQUtDLEtBQVo7QUFDRDs7O2lDQUVZO0FBQ1gsYUFBTyxLQUFLQyxXQUFaO0FBQ0Q7OztpQ0FFWTtBQUNYLGFBQU8sS0FBS0MsV0FBWjtBQUNEOzs7K0JBRVU7QUFDVCxhQUFPLEtBQUtDLEtBQVo7QUFDRDs7O29DQUVlO0FBQ2QsYUFBTyxLQUFLQyxVQUFaO0FBQ0Q7OztrQ0FFYTtBQUNaLGFBQU8sS0FBS0MsUUFBWjtBQUNEOzs7a0NBRWE7QUFDWixhQUFPLEtBQUtDLFFBQVo7QUFDRDs7O29DQUVlO0FBQ2QsYUFBTyxLQUFLQyxVQUFaO0FBQ0Q7OztrQ0FFYTtBQUNaLFVBQUlDLFFBQVE7QUFDUlQsY0FBTSxLQUFLQSxJQURIO0FBRVJVLFlBQUksS0FBS1Q7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVRRLE9BQVo7O0FBWUEsVUFBSSxLQUFLQyxXQUFMLEtBQXFCUyxTQUF6QixFQUFvQztBQUNsQ0YsY0FBTUcsVUFBTixHQUFtQkMsT0FBTyxLQUFLRCxVQUFMLEVBQVAsQ0FBbkI7QUFDRDs7QUFFRCxVQUFJLEtBQUtULFdBQUwsS0FBcUJRLFNBQXpCLEVBQW9DO0FBQ2xDRixjQUFNSyxVQUFOLEdBQW1CRCxPQUFPLEtBQUtDLFVBQUwsRUFBUCxDQUFuQjtBQUNEOztBQUVELFVBQUksS0FBS1YsS0FBVCxFQUFnQjtBQUNkSyxjQUFNTCxLQUFOLEdBQWMsS0FBS0EsS0FBbkI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFVBQVQsRUFBcUI7QUFDbkJJLGNBQU1KLFVBQU4sR0FBbUIsS0FBS0EsVUFBeEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFFBQVQsRUFBbUI7QUFDakJHLGNBQU1ILFFBQU4sR0FBaUIsS0FBS0EsUUFBdEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFFBQVQsRUFBbUI7QUFDakJFLGNBQU1GLFFBQU4sR0FBaUIsS0FBS0EsUUFBdEI7QUFDRDs7QUFFRCxVQUFJLEtBQUtDLFVBQVQsRUFBcUI7QUFDbkJDLGNBQU1ELFVBQU4sR0FBbUIsS0FBS0EsVUFBeEI7QUFDRDs7QUFFRCxhQUFPQyxLQUFQO0FBQ0Q7Ozs2Q0FFd0I7QUFDdkI7QUFDQSxhQUFPLEVBQUUsS0FBSyxLQUFLTSxXQUFMLEVBQVAsRUFBUDtBQUNEOzs7Ozs7QUFLSEMsT0FBT0MsT0FBUCxHQUFpQm5CLGNBQWpCIiwiZmlsZSI6Im1ldGFfdHJhbnNkdWNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1ldGFUcmFuc2R1Y2VyIHtcblxuICBjb25zdHJ1Y3RvcihkZXZpY2UsIG5hbWUsIHRkcklkLCBfY2FuQWN0dWF0ZSwgX2hhc093bk5vZGUsIHVuaXRzLFxuICAgICAgdW5pdFNjYWxhciwgbWluVmFsdWUsIG1heFZhbHVlLCByZXNvbHV0aW9uKSB7XG4gICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnRkcklkID0gdGRySWQ7XG4gICAgdGhpcy5fY2FuQWN0dWF0ZSA9IF9jYW5BY3R1YXRlO1xuICAgIHRoaXMuX2hhc093bk5vZGUgPSBfaGFzT3duTm9kZTtcbiAgICB0aGlzLnVuaXRzID0gdW5pdHM7XG4gICAgdGhpcy51bml0U2NhbGFyID0gdW5pdFNjYWxhcjtcbiAgICB0aGlzLm1pblZhbHVlID0gbWluVmFsdWU7XG4gICAgdGhpcy5tYXhWYWx1ZSA9IG1heFZhbHVlO1xuICAgIHRoaXMucmVzb2x1dGlvbiA9IHJlc29sdXRpb247XG4gIH1cblxuICBnZXREZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlO1xuICB9XG5cbiAgZ2V0TmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lO1xuICB9XG5cbiAgZ2V0SWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudGRySWQ7XG4gIH1cblxuICBjYW5BY3R1YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW5BY3R1YXRlO1xuICB9XG5cbiAgaGFzT3duTm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGFzT3duTm9kZTtcbiAgfVxuXG4gIGdldFVuaXRzKCkge1xuICAgIHJldHVybiB0aGlzLnVuaXRzO1xuICB9XG5cbiAgZ2V0VW5pdFNjYWxhcigpIHtcbiAgICByZXR1cm4gdGhpcy51bml0U2NhbGFyO1xuICB9XG5cbiAgZ2V0TWluVmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWluVmFsdWU7XG4gIH1cblxuICBnZXRNYXhWYWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXhWYWx1ZTtcbiAgfVxuXG4gIGdldFJlc29sdXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x1dGlvbjtcbiAgfVxuXG4gIGdldFhtbEF0dHJzKCkge1xuICAgIGxldCBhdHRycyA9IHtcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICBpZDogdGhpcy50ZHJJZCxcbiAgICAgICAgLy8gY2FuQWN0dWF0ZTogU3RyaW5nKHRoaXMuY2FuQWN0dWF0ZSgpKSxcbiAgICAgICAgLy8gaGFzT3duTm9kZTogU3RyaW5nKHRoaXMuaGFzT3duTm9kZSgpKSxcbiAgICAgICAgLy8gdW5pdHM6IHRoaXMudW5pdHMsXG4gICAgICAgIC8vIHVuaXRTY2FsYXI6IHRoaXMudW5pdFNjYWxhcixcbiAgICAgICAgLy8gbWluVmFsdWU6IHRoaXMubWluVmFsdWUsXG4gICAgICAgIC8vIG1heFZhbHVlOiB0aGlzLm1heFZhbHVlLFxuICAgICAgICAvLyByZXNvbHV0aW9uOiB0aGlzLnJlc29sdXRpb25cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY2FuQWN0dWF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdHRycy5jYW5BY3R1YXRlID0gU3RyaW5nKHRoaXMuY2FuQWN0dWF0ZSgpKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faGFzT3duTm9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdHRycy5oYXNPd25Ob2RlID0gU3RyaW5nKHRoaXMuaGFzT3duTm9kZSgpKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy51bml0cykge1xuICAgICAgYXR0cnMudW5pdHMgPSB0aGlzLnVuaXRzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnVuaXRTY2FsYXIpIHtcbiAgICAgIGF0dHJzLnVuaXRTY2FsYXIgPSB0aGlzLnVuaXRTY2FsYXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWluVmFsdWUpIHtcbiAgICAgIGF0dHJzLm1pblZhbHVlID0gdGhpcy5taW5WYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tYXhWYWx1ZSkge1xuICAgICAgYXR0cnMubWF4VmFsdWUgPSB0aGlzLm1heFZhbHVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlc29sdXRpb24pIHtcbiAgICAgIGF0dHJzLnJlc29sdXRpb24gPSB0aGlzLnJlc29sdXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJzO1xuICB9XG5cbiAgX2dldENvbnRlbnRGb3JYbWxCdWlsZCgpIHtcbiAgICAvLyBidWlsZCBjb250ZW50IGZvciB4bWwyanMuQnVpbGRlcigpXG4gICAgcmV0dXJuIHsgJyQnOiB0aGlzLmdldFhtbEF0dHJzKCkgfTtcbiAgfVxuXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNZXRhVHJhbnNkdWNlcjtcbiJdfQ==