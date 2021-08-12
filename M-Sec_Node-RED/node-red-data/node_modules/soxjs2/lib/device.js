"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Device = function () {
  function Device(soxConnection, deviceName, domain) {
    _classCallCheck(this, Device);

    if (domain === undefined) {
      domain = soxConnection.getDomain();
    }

    this.soxConnection = soxConnection;
    this.name = deviceName;
    this.domain = domain;
  }

  _createClass(Device, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getDomain",
    value: function getDomain() {
      return this.domain;
    }
  }, {
    key: "getMetaNodeName",
    value: function getMetaNodeName() {
      return this.name + "_meta";
    }
  }, {
    key: "getDataNodeName",
    value: function getDataNodeName() {
      return this.name + "_data";
    }
  }, {
    key: "getBoundSoxConnection",
    value: function getBoundSoxConnection() {
      return this.soxConnection;
    }
  }, {
    key: "addListener",
    value: function addListener(callback, listenerId) {
      var conn = this.getBoundSoxConnection();
      conn.addListeer(this, callback, listenerId);
    }
  }, {
    key: "removeAllListener",
    value: function removeAllListener() {
      var conn = this.getBoundSoxConnection();
      conn.removeAllListenerForDevice(this);
    }
  }, {
    key: "fetchMeta",
    value: function fetchMeta(callback) {
      var conn = this.getBoundSoxConnection();
      conn.fetchMeta(this, callback);
    }
  }, {
    key: "publish",
    value: function publish(data) {
      var conn = this.getBoundSoxConnection();
      return conn.publish(self, data);
    }
  }]);

  return Device;
}();

module.exports = Device;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZXZpY2UuanMiXSwibmFtZXMiOlsiRGV2aWNlIiwic294Q29ubmVjdGlvbiIsImRldmljZU5hbWUiLCJkb21haW4iLCJ1bmRlZmluZWQiLCJnZXREb21haW4iLCJuYW1lIiwiY2FsbGJhY2siLCJsaXN0ZW5lcklkIiwiY29ubiIsImdldEJvdW5kU294Q29ubmVjdGlvbiIsImFkZExpc3RlZXIiLCJyZW1vdmVBbGxMaXN0ZW5lckZvckRldmljZSIsImZldGNoTWV0YSIsImRhdGEiLCJwdWJsaXNoIiwic2VsZiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNQSxNO0FBRUosa0JBQVlDLGFBQVosRUFBMkJDLFVBQTNCLEVBQXVDQyxNQUF2QyxFQUErQztBQUFBOztBQUM3QyxRQUFJQSxXQUFXQyxTQUFmLEVBQTBCO0FBQ3hCRCxlQUFTRixjQUFjSSxTQUFkLEVBQVQ7QUFDRDs7QUFFRCxTQUFLSixhQUFMLEdBQXFCQSxhQUFyQjtBQUNBLFNBQUtLLElBQUwsR0FBWUosVUFBWjtBQUNBLFNBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNEOzs7OzhCQUVTO0FBQ1IsYUFBTyxLQUFLRyxJQUFaO0FBQ0Q7OztnQ0FFVztBQUNWLGFBQU8sS0FBS0gsTUFBWjtBQUNEOzs7c0NBRWlCO0FBQ2hCLGFBQU8sS0FBS0csSUFBTCxHQUFZLE9BQW5CO0FBQ0Q7OztzQ0FFaUI7QUFDaEIsYUFBTyxLQUFLQSxJQUFMLEdBQVksT0FBbkI7QUFDRDs7OzRDQUV1QjtBQUN0QixhQUFPLEtBQUtMLGFBQVo7QUFDRDs7O2dDQUVXTSxRLEVBQVVDLFUsRUFBWTtBQUNoQyxVQUFJQyxPQUFPLEtBQUtDLHFCQUFMLEVBQVg7QUFDQUQsV0FBS0UsVUFBTCxDQUFnQixJQUFoQixFQUFzQkosUUFBdEIsRUFBZ0NDLFVBQWhDO0FBQ0Q7Ozt3Q0FFbUI7QUFDbEIsVUFBSUMsT0FBTyxLQUFLQyxxQkFBTCxFQUFYO0FBQ0FELFdBQUtHLDBCQUFMLENBQWdDLElBQWhDO0FBQ0Q7Ozs4QkFFU0wsUSxFQUFVO0FBQ2xCLFVBQUlFLE9BQU8sS0FBS0MscUJBQUwsRUFBWDtBQUNBRCxXQUFLSSxTQUFMLENBQWUsSUFBZixFQUFxQk4sUUFBckI7QUFDRDs7OzRCQUVPTyxJLEVBQU07QUFDWixVQUFJTCxPQUFPLEtBQUtDLHFCQUFMLEVBQVg7QUFDQSxhQUFPRCxLQUFLTSxPQUFMLENBQWFDLElBQWIsRUFBbUJGLElBQW5CLENBQVA7QUFDRDs7Ozs7O0FBSUhHLE9BQU9DLE9BQVAsR0FBaUJsQixNQUFqQiIsImZpbGUiOiJkZXZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEZXZpY2Uge1xuXG4gIGNvbnN0cnVjdG9yKHNveENvbm5lY3Rpb24sIGRldmljZU5hbWUsIGRvbWFpbikge1xuICAgIGlmIChkb21haW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZG9tYWluID0gc294Q29ubmVjdGlvbi5nZXREb21haW4oKTtcbiAgICB9XG5cbiAgICB0aGlzLnNveENvbm5lY3Rpb24gPSBzb3hDb25uZWN0aW9uO1xuICAgIHRoaXMubmFtZSA9IGRldmljZU5hbWU7XG4gICAgdGhpcy5kb21haW4gPSBkb21haW47XG4gIH1cblxuICBnZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cblxuICBnZXREb21haW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9tYWluO1xuICB9XG5cbiAgZ2V0TWV0YU5vZGVOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWUgKyBcIl9tZXRhXCI7XG4gIH1cblxuICBnZXREYXRhTm9kZU5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZSArIFwiX2RhdGFcIjtcbiAgfVxuXG4gIGdldEJvdW5kU294Q29ubmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zb3hDb25uZWN0aW9uO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2ssIGxpc3RlbmVySWQpIHtcbiAgICBsZXQgY29ubiA9IHRoaXMuZ2V0Qm91bmRTb3hDb25uZWN0aW9uKCk7XG4gICAgY29ubi5hZGRMaXN0ZWVyKHRoaXMsIGNhbGxiYWNrLCBsaXN0ZW5lcklkKTtcbiAgfVxuXG4gIHJlbW92ZUFsbExpc3RlbmVyKCkge1xuICAgIGxldCBjb25uID0gdGhpcy5nZXRCb3VuZFNveENvbm5lY3Rpb24oKTtcbiAgICBjb25uLnJlbW92ZUFsbExpc3RlbmVyRm9yRGV2aWNlKHRoaXMpO1xuICB9XG5cbiAgZmV0Y2hNZXRhKGNhbGxiYWNrKSB7XG4gICAgbGV0IGNvbm4gPSB0aGlzLmdldEJvdW5kU294Q29ubmVjdGlvbigpO1xuICAgIGNvbm4uZmV0Y2hNZXRhKHRoaXMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHB1Ymxpc2goZGF0YSkge1xuICAgIGxldCBjb25uID0gdGhpcy5nZXRCb3VuZFNveENvbm5lY3Rpb24oKTtcbiAgICByZXR1cm4gY29ubi5wdWJsaXNoKHNlbGYsIGRhdGEpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZXZpY2U7XG4iXX0=