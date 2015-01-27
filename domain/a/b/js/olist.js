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

var status_map = {"1":"代购车", "2":"待下单", "3":"待付款", "4":"待发货", "5":"已发货", "6":"已到货", "9":"已完成"};

var olist = function() {
  var load_orders = function(query){
    var url = "http://b.fastbee.cn/buy/orders.json" + query;
    $.getJSON(url, function(data){
      console.log("[Buyer]load orders:" + url);
      try {
        var orders = data.orders;
        var olist_box = $(".order-buy");
        var order_tpl = $(".order-buy .order-info");
        for (var i in orders) {
          var total_price = 0;
          var total_quantity = 0;
          var order = orders[i];
          var order_box = order_tpl;
          if (i < orders.length-1) {
            order_tpl = order_tpl.clone().appendTo(olist_box);
          }
          order_box.attr({"data-oid":order.order_id,"data-mkt":order.market});
          if (order.market="tm") {
            $(".seller-name img", order_box).attr({"src":"http://gtms01.alicdn.com/tps/i1/TB17dGWFVXXXXc3aXXXlZPaGpXX-36-27.png"});
          }
          $(".seller-name span", order_box).text(order.mkt_shopname);
          $(".order-time", order_box).text(order.order_time);

          var ilist_box = $(".order-list-info", order_box);
          var item_tpl = $(".order-list-info li", order_box);
          for (var j in order.items) {
            var item = order.items[j];
            var item_box = item_tpl;
            if (j < order.items.length-1) {
              item_tpl = item_tpl.clone().appendTo(ilist_box);
            }
            item_box.attr({"data-iid":item.mkt_iid,"data-skuid":item.sku_id});
            $(".list-img a img", item_box).attr({"src":item.image});
            $(".goods-title", item_box).text(" " + item.title);
            $(".goods-specification", item_box).text(item.sku_txt);
            $(".list-price-nums .price", item_box).text(item.price);
            $(".list-price-nums .quantity", item_box).text(item.quantity);
            total_price += item.price*item.quantity;
            total_quantity += item.quantity;
          }

          if (order.status > 1){
            $(".subtotal .order-status", order_box).text(status_map[order.status]);
          }
          $(".subtotal .ship-fee", order_box).text("￥" + order.ship_fee);
          total_price += order.ship_fee;
          $(".subtotal .price", order_box).text("￥" + total_price);
          $(".subtotal .quantity", order_box).text(total_quantity);
          
        }
      } catch(error) {
        show_msg("加载订单失败", false);
        console.log("[Buyer]failed to load order: " + err.message);
      }
    });
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
  }();

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
  var title = status_map[status];
  (function(title){
    if (!title) {
      return;
    }
    $("title").text(title);
    $(".navbar>ul>li:first-child").text(title);
  })();

  olist().load_orders(window.location.search);
});