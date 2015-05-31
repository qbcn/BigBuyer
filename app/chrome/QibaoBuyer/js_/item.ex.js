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

var form_action = function(this_item) {
  var check_form = function(){
    var sku_id = $("input#form-sku-id").val();
    var sku_txt = $("input#form-sku-txt").val();
    if (!sku_id || !sku_txt) {
      var msg = "请选择" + $(".dgscp-c h3.unset").text();
      popup.show_msg(msg, true);
      return false;
    }
    var mkt_support = {"tb":true,"tm":true,"jd":false,"mg":false};
    var mkt = $("input#form-mkt").val();
    if (!mkt_support[mkt]) {
      popup.show_msg("不支持该平台商品", true);
      return false;
    }
    if (mkt == "tb" || mkt == "tm") {
      var shop_id = $("input#form-shop-id").val();
      var shop_name = $("input#form-shop-name").val();
      if (!shop_id || !shop_name) {
        popup.show_msg("无法获取店铺信息", true);
        return false;
      }
    }
    var item_id = $("input#form-item-id").val();
    var title = $("input#form-title").val();
    var image = $("input#form-image").val();
    var price = $("input#form-price").val();
    if (!item_id) {
      popup.show_msg("无法获取商品id", true);
      return false;
    }
    if (!title) {
      popup.show_msg("无法获取商品标题", true);
      return false;
    }
    if (!image) {
      popup.show_msg("无法获取商品图片", true);
      return false;
    }
    if (!price) {
      popup.show_msg("无法获取商品价格", true);
      return false;
    }
    return true;
  }
  var buy_now = function(){
    $("input#form-action").val("buy");
    if (check_form()) {
      $("#order-form").submit();
    }
  }
  var add_cart = function(){
    $("input#form-action").val("cart");
    if (check_form()) {
      $("#order-form").submit();
    }
  }

  return {
    "buy_now"  : buy_now,
    "add_cart" : add_cart
  };
}

var item_ready = function(this_item) {
  $(".dgsc-pc>i").click(function(){
    $(this).toggleClass("sel");
    $(this).siblings().removeClass("sel");
    if ($(this).hasClass("sel")) {
      $(this).parent().siblings("h3").removeClass("unset");
    } else {
      $(this).parent().siblings("h3").addClass("unset");
    }

    var sku_txt = "";
    var sku_props = new Array();
    $(".dgsc-pc>i.sel").each(function(i){
      sku_txt = sku_txt + ", " + $(this).text();
      sku_props[i] = $(this).attr("data-id");
    });
    if (sku_txt) {
      sku_txt = "已选:" + sku_txt.substr(1);
    }
    $(".order-buy .order-info .order-list-info .list-cont .goods-specification").text(sku_txt);

    var sku_id = this_item.get_skuid(sku_props);
    if (sku_id) {
      var price = this_item.get_price(sku_id);
      var num = parseInt($(".order-buy .order-info .buy-nums .input-nums").val());
      var total = this_item.get_shipfee() + price*num;
      $(".order-buy .order-info .order-list-info .list-price-nums .price").text("￥" + price);
      $(".order-buy .order-info .subtotal .price").text("￥" + total);
      $("input#form-sku-id").val(sku_props.join(";") + "#" + sku_id);
      $("input#form-sku-txt").val(sku_txt);
      $("input#form-price").val(price);
    } else {
      $("input#form-sku-id").val("");
      $("input#form-sku-txt").val("");
      $("input#form-price").val("");
    }
  });

  $(".order-buy .order-info .buy-nums .minus").click(function(){
    if ($(this).hasClass("lock")) {
      return ;
    }
    var input_num = $(".order-buy .order-info .buy-nums .input-nums");
    var num = parseInt(input_num.val());
    if (num && num > 1) {
      input_num.val(num-1).change();
    }
  });
  $(".order-buy .order-info .buy-nums .plus").click(function(){
    if ($(this).hasClass("lock")) {
      return ;
    }
    var input_num = $(".order-buy .order-info .buy-nums .input-nums");
    var num = parseInt(input_num.val());
    var sku_id = $("input#form-sku-id").val();
    var quantity = this_item.get_quantity(sku_id);
    if (num && num < quantity) {
      input_num.val(num+1).change();
    }
  });
  $(".order-buy .order-info .buy-nums .input-nums").change(function(){
    var num = parseInt($(this).val());
    var sku_id = $("input#form-sku-id").val();
    var quantity = this_item.get_quantity(sku_id);
    if (!num || num < 1) {
      popup.show_msg("数量请输入正整数", true);
      $(this).val(1);
      num = 1;
    } else if (num > quantity) {
      popup.show_msg("此商品最多可购买" + quantity + "件", true);
      $(this).val(quantity);
      num = quantity;
    }
    if (num == 1) {
      $(".order-buy .order-info .buy-nums .minus").addClass("lock");
    } else {
      $(".order-buy .order-info .buy-nums .minus").removeClass("lock");
    }
    if (num == quantity) {
      $(".order-buy .order-info .buy-nums .plus").addClass("lock");
    } else {
      $(".order-buy .order-info .buy-nums .plus").removeClass("lock");
    }
    $("input#form-quantity").val(num);
    $(".order-buy .order-info .subtotal .quantity").text(num);
    var price = this_item.get_price(sku_id);
    var total = this_item.get_shipfee() + price*num;
    $(".order-buy .order-info .subtotal .price").text("￥" + total);
  });
  $(".order-buy .c-inputs").change(function(){
    $("input#form-memo").val($(this).val());
  });

  $(".dt-loading").hide();
  $(".order-buy").show();
}

var tb_item = function(mkt, item_id) {
  var sku_map = null;
  var sku_info = null;
  var item_info = null;
  var ship_fee = 0;

  var parse_shipfee = function(ship_text) {
    if (ship_text.indexOf("包邮") >= 0){
      ship_fee = 0
    } else {
      var ret = ship_text.match(/\d+\.\d{2}/);
      if (ret != null) {
        ship_fee = parseFloat(ret[0]);
      }
    }
    return ship_fee;
  }
  var get_shipfee = function() {
    return ship_fee;
  }
  var get_skuid = function(sku_props) {
    if (!sku_map || !sku_map.ppathIdmap) {
      return null;
    }
    if (typeof sku_props.join == "function") {
      return sku_map.ppathIdmap[sku_props.join(";")];
    } else {
      return sku_map.ppathIdmap[sku_props];
    }
  }
  var get_price = function(sku_id) {
    if (!sku_id || !sku_info) {
      if (item_info) {
        return parseFloat(item_info.priceUnits[0].price);
      } else {
        return -1;
      }
    }
    return parseFloat(sku_info[sku_id].priceUnits[0].price);
  }
  var get_quantity = function(sku_id) {
    if (!sku_id || !sku_info) {
      if (item_info) {
        return parseInt(item_info.quantity);
      } else {
        return -1;
      }
    }
    return parseInt(sku_info[sku_id].quantity);
  }

  var load_item = function(this_item){
    var url = "http://hws.m.taobao.com/cache/wdetail/5.0/?id=" + item_id;
    bgp_call("get_json", url, function(response) {
      console.log("[Buyer]load item detail: " + response.substr(0,80));
      var detail = JSON.parse(response);
      if (!detail || !detail.data) {
        popup.show_msg("商品基本信息解析出错", false);
        return;
      }
      var item_base = detail.data.itemInfoModel;
      var seller = detail.data.seller;
      sku_map = detail.data.skuModel;
      if (!item_base || !seller || (item_base.sku && !sku_map)) {
        popup.show_msg("商品基本信息解析出错", false);
        return;
      }

      var esi_json = detail.data.apiStack[0].value;
      var esi_info = JSON.parse(esi_json);
      if (!esi_info || !esi_info.data) {
        popup.show_msg("商品扩展信息解析出错", false);
        return;
      }
      item_info = esi_info.data.itemInfoModel;
      var delivery = esi_info.data.delivery;
      if (!item_info || !delivery) {
        popup.show_msg("商品扩展信息解析出错", false);
        return;
      }
      ship_fee = parse_shipfee(delivery.deliveryFees[0]);
      if (item_base.sku) {
        var sku_model = esi_info.data.skuModel;
        if (sku_model) {
          sku_info = sku_model.skus;
        } else {
          popup.show_msg("商品SKU信息解析出错", false);
          return;
        }
      }

      $(".order-buy .order-info .seller-name span").text(" " + seller.shopTitle);
      if (mkt == "tm") {
        $(".order-buy .order-info .seller-name img").attr({"src":"http://gtms01.alicdn.com/tps/i1/TB17dGWFVXXXXc3aXXXlZPaGpXX-36-27.png"});
      }
      $(".order-buy .order-info .order-list-info .list-info .list-img a img").attr({"src":item_base.picsPath[0]});
      $(".order-buy .order-info .order-list-info .list-cont .goods-title").text(item_base.title);
      $(".order-buy .order-info .order-list-info .list-price-nums .price").text("￥" + item_info.priceUnits[0].price);

      var sku_pbox = $(".dgsc-pr");
      if (item_base.sku) {
        //set sku props
        var sku_box_tpl = sku_pbox.children(".dgscp-c");
        var sku_props = sku_map.skuProps;
        for (var i in sku_props) {
          var sku_prop = sku_props[i];
          var prop_id = sku_prop.propId;
          var sku_box = sku_box_tpl;
          if (i < sku_props.length-1) {
            sku_box_tpl = sku_box_tpl.clone().appendTo(sku_pbox);
          }
          sku_box.children("h3").text(sku_prop.propName);
          // set values for current prop
          var value_pdiv = sku_box.children(".dgsc-pc");
          var value_box_tpl = value_pdiv.children("i");
          var sku_values = sku_prop.values;
          for (var j in sku_values) {
            var value = sku_values[j];
            var value_box = value_box_tpl;
            if (j < sku_values.length-1) {
              value_box_tpl = value_box_tpl.clone().appendTo(value_pdiv);
            }
            value_box.text(value.name);
            value_box.attr({"data-id" : prop_id + ":" + value.valueId})
          }
        }
      } else {
        sku_pbox.hide();
        var total = parseFloat(item_info.priceUnits[0].price) + ship_fee;
        $(".order-buy .order-info .subtotal .price").text("￥" + total);
        $(".order-buy .order-info .subtotal .ship-fee").text("￥" + ship_fee);
      }
      
      $("input#form-mkt").val(mkt);
      $("input#form-shop-id").val(seller.shopId);
      $("input#form-shop-name").val(seller.shopTitle);
      $("input#form-item-id").val(item_id);
      $("input#form-title").val(item_base.title);
      $("input#form-image").val(item_base.picsPath[0]);
      $("input#form-ship-fee").val(ship_fee);
      item_ready(this_item);
    });
  }

  return {
    "load_item" : load_item,
    "get_shipfee" : get_shipfee,
    "get_skuid" : get_skuid,
    "get_price" : get_price,
    "get_quantity" : get_quantity
  };
}

var unsupport_item = function(mkt, item_id) {
  var load_item = function(this_item) {
    var msg = {"jd":"暂不支持京东商品", "mg":"暂不支持蘑菇街商品"};
    if (msg[mkt]) {
      popup.show_msg(msg[mkt], false);
    } else {
      popup.show_msg("暂不支持该商品", false);
    }
  }
  var get_shipfee = function() {
    return -1;
  }
  var get_skuid = function(sku_props) {
    return null;
  }
  var get_price = function(sku_id) {
    return -1;
  }
  var get_quantity = function(sku_id) {
    return -1;
  }

  return {
    "load_item" : load_item,
    "get_shipfee" : get_shipfee,
    "get_skuid" : get_skuid,
    "get_price" : get_price,
    "get_quantity" : get_quantity
  };
}

var jd_item = unsupport_item;
var mg_item = unsupport_item;

$(function(){

  var item_url = function(key){
    var reg = new RegExp("[\?|&]"+ key +"=([^&^#]*)(&|#|$)");
    var ret = window.location.search.match(reg);
    if (ret != null)
    {
      return decodeURIComponent(ret[1]);
    }
    return null;
  }("item_url");

  var this_item = function(url) {
    if (url == null) {
      popup.show_msg("非法请求！", false);
      return null;
    }
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
    if (mkt == null || id == null) {
      popup.show_msg("商品无法识别", false);
      return null;
    }

    if (mkt == "tb" || mkt == "tm") {
      return tb_item(mkt, id);
    } else if (mkt = "jd") {
      return jd_item(mkt, id);
    } else if (mkt = "mg") {
      return mg_item(mkt, id);
    } else {
      popup.show_msg("商品无法识别", false);
      return null;
    }
  }(item_url);

  if (this_item) {
    this_item.load_item(this_item);
    var action = form_action(this_item);
    $(".dt-immbuy").click(action.buy_now);
    $(".dt-addcart").click(action.add_cart);
  }
});