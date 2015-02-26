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

var order_action = function(){
  var status_map = {
      "0":{"statxt":"已取消"},
      "1":{"statxt":"代购车","actions":["buynow","remove"]},
      "2":{"statxt":"待下单","actions":["cancel"],"store_actions":["cancel","trade"],"admin_actions":["cancel"]},
      "3":{"statxt":"待付款","store_actions":["cancel"],"admin_actions":["cancel"]},
      "4":{"statxt":"待发货","store_actions":["cancel"],"admin_actions":["cancel"]},
      "5":{"statxt":"已发货","actions":["viewship"],"store_actions":["viewship","arrive"],"admin_actions":["viewship"]}, 
      "6":{"statxt":"已到货","actions":["viewship","accept"],"store_actions":["viewship","accept"],"admin_actions":["viewship"]}, 
      "9":{"statxt":"已完成"}
  };
  var action_txt = {
    "remove":"移出代购车",
    "buynow":"立即代购",
    "cancel":"取消代购",
    "trade" :"立即下单",
    "viewship":"查看物流",
    "arrive":"确认到货",
    "accept":"确认取件"
  };
  var role = function(){
    /* get role from cookie */
    return "buyer";
  }();
  var action_url = function(){
    var urls = {
      "buyer":"http://b.fastbee.cn/buy/order",
      "store":"http://b.fastbee.cn/buy/store/order",
      "admin":"http://b.fastbee.cn/buy/admin/order"
    }
    return urls[role];
  }();
  
  var get_statustxt = function(status){
    var statinfo = status_map[status];
    if (statinfo) {
      return statinfo.statxt;
    }
    return null;
  };
  var get_actions = function(status){
    var statinfo = status_map[status];
    var actions = null;
    if (statinfo) {
      if (role=="admin") {
        actions = statinfo.admin_actions;
      } else if (role=="store") {
        actions = statinfo.store_actions;
      } else {
        actions = statinfo.actions;
      }
    }
    return actions;
  };
  var get_actiontxt = function(action){
    return action_txt[action];
  };
  var do_action = function(order_id, action, order, callback){
    $.post(action_url, {
      "order_id" : order_id,
      "action" : action
    }, function(data){
      var resp = JSON.parse(data);
      callback(resp);
    });
  }

  return {
    "get_statustxt" : get_statustxt,
    "get_actions" : get_actions,
    "get_actiontxt" : get_actiontxt,
    "do_action" : do_action
  }
}();

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
          order_box.attr({"data-oid":order.order_id,"data-mkt":order.market,"data-sid":order.mkt_shopid,"data-sts":order.status});
          if (order.market=="tm") {
            $(".seller-name img", order_box).attr({"src":"http://gtms01.alicdn.com/tps/i1/TB17dGWFVXXXXc3aXXXlZPaGpXX-36-27.png"});
          }
          $(".seller-name span", order_box).text(" " + order.mkt_shopname);
          $(".order-time", order_box).text(order.order_time);

          var ilist_box = $(".order-list-info", order_box);
          var item_tpl = $(".order-list-info li", order_box);
          for (var j in order.items) {
            var item = order.items[j];
            var item_box = item_tpl;
            if (j < order.items.length-1) {
              item_tpl = item_tpl.clone().appendTo(ilist_box);
            }
            item_box.attr({"data-iid":item.mkt_iid,"data-suboid":item.sub_oid,"data-skuid":item.sku_id,"data-qty":item.quantity});
            $(".list-img a img", item_box).attr({"src":item.image});
            $(".goods-title", item_box).text(item.title);
            $(".goods-specification", item_box).text(item.sku_txt);
            $(".list-price-nums .price", item_box).text("￥" + item.price);
            $(".list-price-nums .quantity", item_box).text(item.quantity);
            total_price += item.price*item.quantity;
            total_quantity += item.quantity;
          }

          $(".subtotal .ship-fee", order_box).text("￥" + order.ship_fee);
          total_price += order.ship_fee;
          $(".subtotal .price", order_box).text("￥" + total_price);
          $(".subtotal .quantity", order_box).text(total_quantity);
          var status = order.status;
          if (status > 1) {
            $(".subtotal .order-status", order_box).text(order_action.get_statustxt(status));
          }
          var act_box = $(".dgsc-ft", order_box);
          var actions = order_action.get_actions(status);
          if (actions && actions.length>0) {
            var act_btn = act_box.children("a");
            for (var k in actions) {
              if (k > 0) {
                act_btn = act_btn.clone().appendTo(act_box);
              }
              var action = actions[k];
              act_btn.text(order_action.get_actiontxt(action));
              act_btn.attr({"data-act":action});
            }
          } else {
            act_box.hide();
          }
        }
      } catch(error) {
        popup.show_msg("加载订单失败", false);
        console.log("[Buyer]failed to load order: " + error.message);
        return ;
      }

      orders_ready();
    });
  }

  var orders_ready = function() {
    $(".dgsc-ft a").click(function(){
      var action = $(this).attr("data-act");
      var node = $(this).parent().parent(".order-info");
      var id = node.attr("data-oid");
      form_action["order_" + action](node, id);
    });
    $(".dt-loading").hide();
    $(".order-buy").show();
  }

  var form_action = function() {
    var order_remove = function(order_node, order_id){
      order_action.do_action(order_id, "remove_cart", null, function(data){
        if (data.ret && data.ret=="SUCCESS") {
          order_node.slideUp("slow", function(){
            order_node.remove();
          });
        }
      });
    }
    var order_buynow = function(order_node, order_id){
    }
    var order_cancel = function(order_node, order_id){
      popup.show_confirm("确定取消代购?", function(confirm){
        if (confirm=="ok"){
          order_action.do_action(order_id, "cancel", null, function(data){
            if (data.ret && data.ret=="SUCCESS") {
              order_node.slideUp("slow", function(){
                order_node.remove();
              });
            }
          });
        }
      })
    }
    var order_trade  = function(order_node, order_id){
      //do nothing
      return;
    }
    var order_viewship  = function(order_node, order_id){
    }
    var order_arrive = function(order_node, order_id){
    }
    var order_accept = function(order_node, order_id){
    }

    return {
      "order_remove" : order_remove,
      "order_buynow" : order_buynow,
      "order_cancel" : order_cancel,
      "order_trade"  : order_trade,
      "order_viewship" : order_viewship,
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
  var title = order_action.get_statustxt(status);
  if (title) {
    $("title").text(title);
    $(".navbar>ul>li:first-child").text(title);
  }

  olist().load_orders(window.location.search);
});