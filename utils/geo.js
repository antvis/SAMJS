function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
export var TileHelper = /*#__PURE__*/function () {
  function TileHelper() {
    var tileSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'tms';
    _classCallCheck(this, TileHelper);
    _defineProperty(this, "tileSize", void 0);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "initialResolution", void 0);
    _defineProperty(this, "originShift", void 0);
    // "Initialize the TMS Global Mercator pyramid"
    this.tileSize = tileSize;
    this.type = type;
    this.initialResolution = 2 * Math.PI * 6378137 / this.tileSize;
    this.originShift = 2 * Math.PI * 6378137 / 2.0;
  }
  _createClass(TileHelper, [{
    key: "lngLatToMeters",
    value: function lngLatToMeters(lon, lat) {
      // "Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:3857"
      var mx = lon * this.originShift / 180.0;
      var my = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);
      my = my * this.originShift / 180.0;
      return [mx, my];
    }

    // "Converts XY point from Spherical Mercator EPSG:3857 to lat/lon in WGS84 Datum"
  }, {
    key: "metersToLatLon",
    value: function metersToLatLon(mx, my) {
      var lon = mx / this.originShift * 180.0;
      var lat = my / this.originShift * 180.0;
      lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
      return [lon, lat];
    }

    //  "Converts pixel coordinates in given zoom level of pyramid to EPSG:3857"
  }, {
    key: "pixelsToMeters",
    value: function pixelsToMeters(px, py, zoom) {
      var res = this.resolution(zoom);
      var mx = px * res - this.originShift;
      var my = (this.type === 'tms' ? py : Math.pow(2, zoom) * 256 - py) * res - this.originShift;
      return [mx, my];
    }

    //  "Converts EPSG:3857 to pyramid pixel coordinates in given zoom level"
  }, {
    key: "metersToPixels",
    value: function metersToPixels(mx, my, zoom) {
      var res = this.resolution(zoom);
      var px = (mx + this.originShift) / res;
      var py = (my + this.originShift) / res;
      py = this.type === 'tms' ? py : Math.pow(2, zoom) * 256 - py;
      return [px, py];
    }
    // "Returns tile for given mercator coordinates"
  }, {
    key: "metersToTile",
    value: function metersToTile(mx, my, zoom) {
      var _this$metersToPixels = this.metersToPixels(mx, my, zoom),
        _this$metersToPixels2 = _slicedToArray(_this$metersToPixels, 2),
        px = _this$metersToPixels2[0],
        py = _this$metersToPixels2[1];
      return this.pixelsToTile(px, py);
    }
  }, {
    key: "tileToMeters",
    value: function tileToMeters(tx, ty, zoom) {
      return this.pixelsToMeters(tx * this.tileSize, ty * this.tileSize, zoom);
    }

    // "Returns a tile covering region in given pixel coordinates"
  }, {
    key: "pixelsToTile",
    value: function pixelsToTile(px, py) {
      var tx = Math.floor(Math.ceil(px / this.tileSize) - 1);
      var ty = Math.floor(Math.ceil(py / this.tileSize) - 1);
      return [tx, ty];
    }

    //  "Move the origin of pixel coordinates to top-left corner"
  }, {
    key: "pixelsToRaster",
    value: function pixelsToRaster(px, py, zoom) {
      var mapSize = this.tileSize << zoom;
      return [px, mapSize - py];
    }

    //"Returns bounds of the given tile in EPSG:3857 coordinates"
  }, {
    key: "tileBounds",
    value: function tileBounds(tx, ty, zoom) {
      var _this$pixelsToMeters = this.pixelsToMeters(tx * this.tileSize, ty * this.tileSize, zoom),
        _this$pixelsToMeters2 = _slicedToArray(_this$pixelsToMeters, 2),
        minx = _this$pixelsToMeters2[0],
        miny = _this$pixelsToMeters2[1];
      var _this$pixelsToMeters3 = this.pixelsToMeters((tx + 1) * this.tileSize, (ty + 1) * this.tileSize, zoom),
        _this$pixelsToMeters4 = _slicedToArray(_this$pixelsToMeters3, 2),
        maxx = _this$pixelsToMeters4[0],
        maxy = _this$pixelsToMeters4[1];
      return [minx, miny, maxx, maxy];
    }

    // "Returns bounds of the given tile in latitude/longitude using WGS84 datum"
  }, {
    key: "tileLatLonBounds",
    value: function tileLatLonBounds(tx, ty, zoom) {
      var bounds = this.tileBounds(tx, ty, zoom);
      var _this$metersToLatLon = this.metersToLatLon(bounds[0], bounds[1]),
        _this$metersToLatLon2 = _slicedToArray(_this$metersToLatLon, 2),
        minLat = _this$metersToLatLon2[0],
        minLon = _this$metersToLatLon2[1];
      var _this$metersToLatLon3 = this.metersToLatLon(bounds[2], bounds[3]),
        _this$metersToLatLon4 = _slicedToArray(_this$metersToLatLon3, 2),
        maxLat = _this$metersToLatLon4[0],
        maxLon = _this$metersToLatLon4[1];
      return [minLat, minLon, maxLat, maxLon];
    }

    // "Resolution (meters/pixel) for given zoom level (measured at Equator)"
  }, {
    key: "resolution",
    value: function resolution(zoom) {
      return this.initialResolution / Math.pow(2, zoom);
    }
  }, {
    key: "lngLatToPixels",
    value: function lngLatToPixels(lon, lat, zoom) {
      var _this$lngLatToMeters = this.lngLatToMeters(lon, lat),
        _this$lngLatToMeters2 = _slicedToArray(_this$lngLatToMeters, 2),
        mx = _this$lngLatToMeters2[0],
        my = _this$lngLatToMeters2[1];
      return this.metersToPixels(mx, my, zoom);
    }
  }, {
    key: "pixelsTolngLat",
    value: function pixelsTolngLat(px, py, zoom) {
      var meters = this.pixelsToMeters(px, py, zoom);
      return this.metersToLatLon(meters[0], meters[1]);
    }
  }, {
    key: "lngLatToTile",
    value: function lngLatToTile(lon, lat, zoom) {
      var _this$lngLatToPixels = this.lngLatToPixels(lon, lat, zoom),
        _this$lngLatToPixels2 = _slicedToArray(_this$lngLatToPixels, 2),
        px = _this$lngLatToPixels2[0],
        py = _this$lngLatToPixels2[1];
      return this.pixelsToTile(px, py);
    }

    //"Converts TMS tile coordinates to Google Tile coordinates"
  }, {
    key: "googleTile",
    value: function googleTile(tx, ty, zoom) {
      return [tx, Math.pow(2, zoom) - 1 - ty];
    }
  }, {
    key: "boundsToTileExtent",
    value: function boundsToTileExtent(minLon, minLat, maxLon, maxLat, zoom) {
      var _this$lngLatToTile = this.lngLatToTile(minLon, maxLat, zoom),
        _this$lngLatToTile2 = _slicedToArray(_this$lngLatToTile, 2),
        minTx = _this$lngLatToTile2[0],
        minTy = _this$lngLatToTile2[1];
      var _this$lngLatToTile3 = this.lngLatToTile(maxLon, minLat, zoom),
        _this$lngLatToTile4 = _slicedToArray(_this$lngLatToTile3, 2),
        maxTx = _this$lngLatToTile4[0],
        maxTy = _this$lngLatToTile4[1];
      return [[minTx, minTy], [maxTx, maxTy]];
    }
  }, {
    key: "metersboundsToTileExtent",
    value: function metersboundsToTileExtent(minX, minY, maxX, maxY, zoom) {
      var _this$metersToTile = this.metersToTile(minX, maxY, zoom),
        _this$metersToTile2 = _slicedToArray(_this$metersToTile, 2),
        minTx = _this$metersToTile2[0],
        minTy = _this$metersToTile2[1];
      var _this$metersToTile3 = this.metersToTile(maxX, minY, zoom),
        _this$metersToTile4 = _slicedToArray(_this$metersToTile3, 2),
        maxTx = _this$metersToTile4[0],
        maxTy = _this$metersToTile4[1];
      return [[minTx, minTy], [maxTx, maxTy]];
    }
  }]);
  return TileHelper;
}();