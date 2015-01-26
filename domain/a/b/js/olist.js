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

function show_msg(msg, fade_out) {
  var move_center = function(selector) {
    var node = $(selector);
    var x = document.body.scrollLeft + (document.documentElement.clientWidth - node.width())/2;
    var y = document.body.scrollTop + (document.documentElement.clientHeight - node.height())/2;
    node.css({"left": x + "px","top": y + "px"});
  }

  $(".warnMsg").text(msg);
  move_center(".c-float-popWrap");
  $(".c-float-popWrap").removeClass("hide");
  $(".c-float-popWrap").addClass("show");
  $(".c-float-popWrap").show();
  if (fade_out) {
    $(".c-float-popWrap").fadeOut(2000, function() {
      $(this).removeClass("show");
      $(this).addClass("hide");
    });
  }
}

var olist = function() {
  var load_orders = function(query){
  }

  var orders_ready = function() {
  }

  var form_action = function() {
    var check_form = function(){
      return true;
    }
    var buy_now = function(){
    }
    var order_cancel = function(){
    }
    var order_trade  = function(){
    }
    var order_arrive = function(){
    }
    var order_accept = function(){
    }

    return {
      "buy_now"  : buy_now,
      "order_cancel" : order_cancel,
      "order_trade"  : order_trade,
      "order_arrive" : order_arrive,
      "order_accept" : order_accept
    };
  }

  return {
    "load_orders" : load_orders
  };
}

$(function(){

  var status = function(key){
    var reg = new RegExp("[\?|&]"+ key +"=([^&^#]*)(&|#|$)");
    var ret = window.location.search.match(reg);
    if (ret != null)
    {
      return decodeURIComponent(ret[1]);
    }
    return null;
  }("status");

  //set page title
  var status_map = {"1":"我的代购车", "2":"待下单", "3":"待付款", "4":"待发货", "5":"待收货", "6":"待取件", "9":"所有订单"};
  var title = status_map[status];
  (function(title){
    if (!title) {
      return;
    }
  })();

  olist().load_orders(window.location.search);
});