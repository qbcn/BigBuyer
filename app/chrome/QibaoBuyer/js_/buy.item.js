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

function bgp_call(func, arg, callback) {
  if (typeof chrome.extension == "undefined") {
    console.log("[Buyer]please check environment.");
    return;
  }
  chrome.extension.sendRequest({"call" : func, "arg" : arg}, callback);
}

console.log("[BuyAgent]buy.item.js loaded.");

var tb_buy = function(buy_item){
  
}

var tm_buy = function(buy_item){
  $("#s-action-container .sku .content").click();
}

var unsupport_buy = function(buy_item){
  return ;
}

var jd_buy = unsupport_buy;
var mg_buy = unsupport_buy;

$(function(){
  var this_url = window.location.href;
  var this_item = function(url) {
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

    var mkt=null, id=null;
    for (var i in item_urls) {
      var item = item_urls[i];
      if (url.startsWith(item.url)) {
        var args = url.substr(item.url.length).match(item.matches);
        if (args.length > 1) {
          mkt = item.mkt;
          id = args[1];
        }
      }
    }
    if (mkt && id) {
      return {"market":mkt, "mkt_iid":id};
    } else {
      return null;
    }
  }(this_url);

  bgp_call("get_buying", this_item, function(buy_item){
    if (!buy_item){
      return ;
    }
    var mkt = this_item.market;
    if (mkt == "tb") {
      tb_buy(buy_item);
    } else if (mkt = "tm") {
      tm_buy(buy_item);
    } else if (mkt = "jd") {
      jd_buy(buy_item);
    } else if (mkt = "mg") {
      mg_buy(buy_item);
    } else {
      unsupport_buy(buy_item);
    }
  });
});