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

var popup = function(){
  var move_center = function(selector) {
    var node = $(selector);
    var x = document.body.scrollLeft + (document.documentElement.clientWidth - node.width())/2;
    var y = document.body.scrollTop + (document.documentElement.clientHeight - node.height())/2;
    node.css({"left": x + "px","top": y + "px"});
  }

  var event_cb = null;
  var event_inited = false;
  var event_init = function(){
    if (event_inited) {
      return;
    }
    event_inited = true;
    $(".c-float-modePop .doBtn button").click(function(){
      var popup_box = $(".c-float-popWrap");
      popup_box.removeClass("show");
      popup_box.addClass("hide");
      popup_box.removeClass("alertMode");
      popup_box.removeClass("confirmMode");
      if (typeof event_cb == "function") {
        if ($(this).hasClass("ok")) {
          event_cb("ok");
        } else {
          event_cb("cancel");
        }
        event_cb = null;
      }
    });
  }
 
  var show_popup = function(mode, msg, fade_out) {
    $(".warnMsg").text(msg);
    move_center(".c-float-popWrap");
    var popup_box = $(".c-float-popWrap");
    popup_box.addClass(mode);
    popup_box.removeClass("hide");
    popup_box.addClass("show");
    popup_box.show();
    if (fade_out) {
      $(".c-float-popWrap").fadeOut(2000, function() {
        popup_box.removeClass("show");
        popup_box.addClass("hide");
        popup_box.removeClass(mode);
      });
    }
  }

  var show_msg = function(msg, fade_out) {
    show_popup("msgMode", msg, fade_out);
  }
  var show_alert = function(msg, callback) {
    event_cb = callback;
    event_init();
    show_popup("alertMode", msg, false);
  }
  var show_confirm = function(msg, callback) {
    event_cb = callback;
    event_init();
    show_popup("confirmMode", msg, false);
  }

  return {
    "show_msg" : show_msg,
    "show_alert" : show_alert,
    "show_confirm" : show_confirm
  }
}();

function bgp_call(func, arg, callback) {
  if (typeof chrome.extension == "undefined") {
    console.log("[Buyer]please check environment.");
    return;
  }
  chrome.extension.sendRequest({"call" : func, "arg" : arg}, callback);
}

$(function(){
  $(".dgsc-ft a").click(function(){
    var action = $(this).attr("data-act");
    if (action=="trade") {
      var nodes = new Array();
      nodes[0] = $(this).parent().parent(".order-info");
      order_trade(nodes);
    }
  });

  var order_trade = function(nodes){
    var orders = new Array();
    for (var i=0; i<nodes.length; i++){
      var node = nodes[i];
      var status = node.attr("data-sts");
      if (status != "2") {
        continue;
      }
      var order_id = node.attr("data-oid");
      var mkt = node.attr("data-mkt");
      var shop_id = node.attr("data-sid");
      var items = new Array();
      var j = 0;
      $(".order-list-info li", node).each(function(){
        var iid = $(this).attr("data-iid");
        var sub_oid = $(this).attr("data-suboid");
        var skuid = $(this).attr("data-skuid");
        var quantity = $(this).attr("data-qty");
        var item = {"mkt_iid":iid, "sub_oid":sub_oid, "sku_id":skuid, "quantity":quantity, "cart_added":false};
        items[j] = item;
        j++;
      });
      var order = {
        "order_id":order_id,
        "market":mkt,
        "mkt_shopid":shop_id,
        "mkt_tid":null,
        "status":2,
        "items":items
      };
      orders[i] = order;
    }
    bgp_call("start_buy", orders, function(ret){
      console.log("[Buyer]start_buy " + ret.ret + "," + ret.msg);
    });
  }
});
