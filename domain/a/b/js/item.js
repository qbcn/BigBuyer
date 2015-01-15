var item_urls = [
  {"mkt":"tb", "url":"http://item.taobao.com/item.htm", "matches":/[\?|&]id=(\d{6,})/},
  {"mkt":"tb", "url":"http://h5.m.taobao.com/awp/core/detail.htm", "matches":/[\?|&]id=(\d{6,})/},
  {"mkt":"tm", "url":"http://detail.tmall.com/item.htm", "matches":/[\?|&]id=(\d{6,})/},
  {"mkt":"tm", "url":"http://detail.m.tmall.com/item.htm", "matches":/[\?|&]id=(\d{6,})/},
  {"mkt":"jd", "url":"http://item.jd.com/", "matches":/(\d{6,})\.html/},
  {"mkt":"jd", "url":"http://m.jd.com/product/", "matches":/(\d{6,})\.html/},
  {"mkt":"mg", "url":"http://shop.mogujie.com/detail/", "matches":/^(\w{6,})/},
  {"mkt":"mg", "url":"http://m.mogujie.com/x6/detail/", "matches":/^(\w{6,})/}
];

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
if (typeof get_urlparam != 'function') {
  function get_urlparam(key) {
    var reg = new RegExp("[\?|&]"+ key +"=([^&^#]*)(&|#|$)");
    var ret = window.location.search.match(reg);
    if (ret != null)
    {
      return decodeURIComponent(ret[1]);
    }
    return null;
  }
}
if (typeof bgp_call != 'function') {
  function bgp_call(func, arg, receive) {
    chrome.extension.sendRequest({"call" : func, "arg" : arg}, function(response) {
      console.log("[Buyer] get response from bgp");
      receive(response);
    });
  }
}

$(function(){
  function place_center(selector) {
    var node = $(selector);
    var x = document.documentElement.scrollLeft + (document.documentElement.clientWidth - node.width())/2;
    var y = document.documentElement.scrollTop + (document.documentElement.clientHeight - node.height())/2;
    node.css({"left": x + "px","top": y + "px"});
  }

  function show_msg(msg, fade_out) {
    $(".warnMsg").text(msg);
    place_center(".c-float-popWrap");
    $(".c-float-popWrap").show();
    if (fade_out) {
      $(".c-float-popWrap").fadeOut(3000, function() {
        $(this).hide();
      });
    }
  }

  function load_item() {
    var item_url = get_urlparam("item_url");
    if (item_url == null) {
      show_msg("非法请求！", true);
      return;
    }

    var mkt=null, id=null;
    for (var i in item_urls) {
      var item = item_urls[i];
      if (item_url.startsWith(item.url)) {
        var args = item_url.substr(item.url.length).match(item.matches);
        if (args.length > 1) {
          mkt = item.mkt;
          id = args[1];
        }
      }
    }

    if (mkt == null || id == null) {
      show_msg("非商品详情页无法代购！", true);
      return;
    }
    
    if (mkt == "tb" || mkt == "tm") {
      var url = "http://hws.m.taobao.com/cache/wdetail/5.0/?id=" + id;
      bgp_call("get_json", url, function(response) {
        console.log("[Buyer]load item detail: " + response);
      });
    }
  }
  load_item();
});