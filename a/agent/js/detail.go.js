var url_map = [
  {"src_url":"http://item.taobao.com/item.htm", "matches":/[\?|&]id=(\d{6,})/, "dst_url":"http://h5.m.taobao.com/awp/core/detail.htm?id={0}"},
  {"src_url":"http://detail.tmall.com/item.htm", "matches":/[\?|&]id=(\d{6,})/, "dst_url":"http://detail.m.tmall.com/item.htm?id={0}"},
  {"src_url":"http://item.jd.com/", "matches":/(\d{6,})\.html/, "dst_url":"http://m.jd.com/product/{0}.html"},
  {"src_url":"http://shop.mogujie.com/detail/", "matches":/^(\w{6,})/, "dst_url":"http://m.mogujie.com/x6/detail/{0}"},
]

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.substr(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.substr(-str.length) == str;
  };
}
if (typeof String.prototype.format != 'function') {
  String.prototype.format = function(args) {
    var result = this;
    if (arguments.length < 1) {
      return result;
    }

    var data = arguments;
    if (arguments.length == 1 && typeof (args) == "object") {
      data = args;
    }
    for (var key in data) {
      var value = data[key];
      if (undefined != value) {
        result = result.replace("{" + key + "}", value);
      }
    }
    return result;
  }
}

console.log("[BuyAgent]detail.go.js loaded.");
var this_url = window.location.href;
for (var i=0; i<url_map.length; i++) {
  var map = url_map[i];
  if (this_url.startsWith(map.src_url)) {
    var args = this_url.substr(map.src_url.length).match(map.matches);
    var target = map.dst_url.format(args.slice(1,args.length));
    window.location.href = target;
  }
}