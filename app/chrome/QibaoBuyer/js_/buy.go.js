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

function bgp_call(func, arg, callback) {
  if (typeof chrome.extension == "undefined") {
    console.log("[Buyer]please check environment.");
    return;
  }
  chrome.extension.sendRequest({"call" : func, "arg" : arg}, callback);
}

$(function(){
  console.log("[BuyAgent]buy.go.js loaded.");
  bgp_call("get_buying", null, function(orders){
    if (!orders) {
      return ;
    }
    var url_map = [
      {"src_url":"http://b.fastbee.cn/item/convert", "mkt":"qb", "matches":null, "dst_url":null},
      {"src_url":"http://item.taobao.com/item.htm", "mkt":"tb", "matches":null, "dst_url":"http://h5.m.taobao.com/awp/core/detail.htm"},
      {"src_url":"http://detail.tmall.com/item.htm", "mkt":"tm", "matches":null, "dst_url":"http://detail.m.tmall.com/item.htm"},
      {"src_url":"http://item.jd.com/", "mkt":"jd", "matches":/(\d{6,})\.html/, "dst_url":"http://m.jd.com/product/{0}.html"},
      {"src_url":"http://shop.mogujie.com/detail/", "mkt":"mg", "matches":/^(\w{6,})/, "dst_url":"http://m.mogujie.com/x6/detail/{0}"},
    ];
    var this_url = window.location.href;
    var url_args = window.location.search;
    var target = null;
    for (var i=0; i<url_map.length; i++) {
      var map = url_map[i];
      if (this_url.startsWith(map.src_url)) {
        if (map.mkt=="qb"){
          setTimeout(function(){
            $("a.active-item").get(0).click();
          }, 200);
        } else if (map.mkt=="tb" || map.mkt=="tm") {
          target = map.dst_url + url_args;
        } else {
          var args = this_url.substr(map.src_url.length).match(map.matches);
          target = map.dst_url.format(args.slice(1,args.length)) + url_args;
        }
      }
    }
    if (target) {
      window.location.href = target;
    }
  });
});
