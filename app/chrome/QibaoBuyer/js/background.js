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

var app_config = function(){
  var _config_url = "http://a.fastbee.cn/crx/appconfig.json";
  var _config = null;

  var load_config = function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", _config_url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        _config = JSON.parse(xhr.responseText);
        console.log('[Buyer]get config ok.');
      }
    }
    xhr.send();
  }
  var debug_config = function() {
    console.log('[Buyer]app config:' + _config);  
  }
  var version_compare = function(stra, strb) {
    var straArr = stra.split('.');
    var strbArr = strb.split('.');
    var maxLen = Math.max(straArr.length, strbArr.length);
    var result, sa, sb;
    for (var i=0; i<maxLen; i++) {
      sa = ~~straArr[i];
      sb = ~~strbArr[i];
      if(sa > sb){
        result = 1;
      }else if(sa < sb){
        result = -1;
      }else{
        result = 0;
      }
      if ( result !== 0 ) {
        return result;
      }
    }
    return result;
  }
  var check_update = function(this_version) {
    if (_config == null || typeof this_version != "string") {
      return false;
    }
    var result = version_compare(_config.update_version, this_version);
    if (result > 0) {
      return true;
    } else {
      return false;
    }
  }
  var get_menuconfig = function() {
    return _config.menu_config;
  }
  var is_itempage = function(page_url) {
    var urls = _config.item_urls;
    for (var i=0; i<urls.length; i++) {
      if (page_url.startsWith(urls[i])) {
        return true;
      }
    }
    return false;
  }
  var get_pagescripts = function(page_url) {
    if (_config == null) {
      return null;
    }
    var items = _config.page_scripts;
    for (var i in items) {
      var matches = items[i].matches;
      for (var j in matches) {
        if (page_url.startsWith(matches[j])) {
          return items[i].scripts;
        }
      }
    }
    return null;
  }
  var get_logincheck = function(mkt) {
    if (_config == null) {
      return null;
    }
    var urls = _config.market_urls[mkt];
    if (urls){
      return urls.login_check;
    }
    return null;
  }
  var get_carturl = function(mkt){
    if (_config == null) {
      return null;
    }
    var urls = _config.market_urls[mkt];
    if (urls){
      return urls.cart_url;
    }
    return null;
  }
  var get_converturl = function(){
    if (_config == null) {
      return null;
    }
    return _config.convert_url;
  }
  var get_orderapi = function(){
    if (_config == null) {
      return null;
    }
    return _config.order_api;
  }

  load_config();
  return {
    "check_update" : check_update,
    "get_menuconfig" : get_menuconfig,
    "get_pagescripts" : get_pagescripts,
    "is_itempage" : is_itempage,
    "get_logincheck" : get_logincheck,
    "get_carturl" : get_carturl,
    "get_orderapi" : get_orderapi,
    "get_converturl" : get_converturl,
    "debug_config" : debug_config
  };
}();

var order_buy = function(){
  var _tab_id = -1;
  var set_tabid = function(tabid){
    _tab_id = tabid;
  }
  var get_tabid = function(){
    return _tab_id;
  }

  var _login_control = {
    "tb":{"is_logined":false,"logined_cb":null},
    //"tm":{"is_logined":false,"logined_cb":null},
    "jd":{"is_logined":false,"logined_cb":null},
    "mg":{"is_logined":false,"logined_cb":null},
    "vip":{"is_logined":false,"logined_cb":null}
  };
  var make_login = function(mkt, callback){
    if (mkt == "tm"){
      mkt = "tb";
    }
    var control = _login_control[mkt];
    if (!control){
      console.log("[Buyer]can not login unsupported market " + mkt);
      return;
    }
    if (control.is_logined){
      callback();
      return;
    }
    control.logined_cb = callback;
    var url = app_config.get_logincheck(mkt);
    base_api.load_url(url, get_tabid());
  }
  var user_logined = function(mkt, response, tabid){
    if (mkt == "tm"){
      mkt = "tb";
    }
    var control = _login_control[mkt];
    if (!control){
      console.log("[Buyer]logined unsupported market " + mkt);
      response({"ret":"FAIL","msg":"unsupported market."});
    }
    control.is_logined = true;
    set_tabid(tabid);
    if (typeof control.logined_cb == "function"){
      setTimeout(control.logined_cb, 500);
    }
    response({"ret":"SUCCESS","msg":"ok"});
  }

  var _orders_buying = null;
  var start_buy = function(orders, response){
    if (_orders_buying != null){
      response({"ret":"FAIL","msg":"service is buy!"});
      return;
    }
    _orders_buying = orders;
    emit_order();
    response({"ret":"SUCCESS","msg":"orders received"});
    return;
  }
  var get_buying = function(item, response){
    var order = get_order();
    if (item == null) {
      response(order);
    } else {
      if (order){
        var items = order.items
        for (var i=0; i<items.length; i++){
          if (items[i].mkt_iid == item.mkt_iid){
            response(items[i]);
            return;
          }
        }
      }
      response(null);
      return;
    }
  }

  var get_order = function(){
    if (!_orders_buying){
      return null;
    }
    for(var i=0; i<_orders_buying.length; i++){
      var order = _orders_buying[i];
      if (order.status == 2){
        return order
      }
    }
    return null;
  }
  var emit_order = function(){
    var order = get_order();
    if (!order){
      _orders_buying = null;
      return;
    }
    make_login(order.market, function(){
      emit_item(order);
    });
  }
  var get_item = function(order){
    if (order) {
      var items = order.items;
      for (var i=0; i<items.length; i++){
        if (!items[i].cart_added){
          return items[i];
        }
      }
    }
    return null;
  }
  var emit_item = function(order){
    var item = get_item(order);
    if (item){
      var url = app_config.get_converturl();
      url = url.replace("{mkt}", order.market).replace("{id}", item.mkt_iid);
      base_api.load_url(url, get_tabid());
    }
    if (order && !item){
      emit_trade(order);
    }
  }
  var emit_trade = function(order){
    var url = app_config.get_carturl(order.market);
    base_api.load_url(url, get_tabid());
  }

  var cart_added = function(item, response, tabid){
    if (item) {
      set_tabid(tabid);
      var order = get_order();
      if (order){
        var items = order.items
        for (var i=0; i<items.length; i++){
          var this_item = items[i];
          if (this_item.mkt_iid==item.mkt_iid && this_item.sub_oid==item.sub_oid){
            this_item.cart_added = true;
            set_tabid(tabid);
            setTimeout(function(){emit_item(order)}, 500);
            response({"ret":"SUCCESS","msg":"add cart " + item.mkt_iid});
            return;
          }
        }
      }
    }
    response({"ret":"FAIL","msg":"unkonwn item or order."});
    return;
  }
  
  var trade_created = function(order, response, tabid){
    var this_order = get_order();
    if (this_order.market==order.market && this_order.order_id==order.order_id){
      this_order.mkt_tid = order.mkt_tid;
      this_order.status = 3;
      set_tabid(tabid);
      setTimeout(emit_order, 500);
      var api = app_config.get_orderapi;
      $.post(api, this_order);
      response({"ret":"SUCCESS","msg":"trade created " + this_order.mkt_tid});
    } else {
      response({"ret":"FAIL","msg":"unknown order."});
    }
    return;
  }
  
  return {
    "start_buy" : start_buy,
    "get_buying" : get_buying,
    "user_logined" : user_logined,
    "cart_added" : cart_added,
    "trade_created" : trade_created
  }
}();

var base_api = function(){
  var load_url = function(url, tabid){
    if (tabid <= 0){
      chrome.tabs.create({"url":url});
    } else {
      chrome.tabs.update(tabid, {"url":url})
    }
  }
  var copy_url = function(){
    chrome.tabs.getSelected(function(tab){
      //copy(tab.url);
    });
  }
  var buy_this = function(buy_url){
    console.log("[Buyer]buy_this: " + buy_url);
    chrome.tabs.getSelected(function(tab){
      var item_url = encodeURIComponent(tab.url);
      var arg_str = "?item_url=";
      if (buy_url.indexOf("?") > 0) {
        arg_str = "&item_url=";
      }
      var url = buy_url + arg_str + item_url;
      load_url(url);
    });
  }

  return {
    "load_url" : load_url,
    "copy_url" : copy_url,
    "buy_this" : buy_this
  }
}();

var ext_api = function(){
  var get_json = function(url, receive){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        receive(xhr.responseText);
        console.log('[Buyer]get json ok.');
      }
    }
    xhr.send();
  }
  
  return {
    "get_json" : get_json
  }
}();

var msg_events = function() {
  var on_request = function(request, sender, response) {
    console.log(sender.tab ? "[Buyer]on request from " + sender.tab.url : "extension");
    if (typeof ext_api[request.call] == "function"){
      ext_api[request.call](request.arg, response);
    } else if(typeof order_buy[request.call] == "function"){
      order_buy[request.call](request.arg, response, sender.tab.id);
    } else {
      console.log("[Buyer]unknown msg: " + request.call);
    }
  }

  return {
    "on_request" : on_request
  }
}();

var tab_events = function(){
  var insert_script = function(tabid, scripts, index) {
    if (scripts != null && index < scripts.length) {
      var script = scripts[index];
      if (script.startsWith("http://")) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", script, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            console.log('[Buyer]excute script:', tabid, script);
            chrome.tabs.executeScript(tabid, {code : xhr.responseText});
            insert_script(tabid, scripts, index+1);
            console.log('[Buyer]request finish:', tabid, script);
          }
        }
        xhr.send();
        console.log('[Buyer]load script:', tabid, script);
      } else {
        console.log('[Buyer]excute script:', tabid, script);
        chrome.tabs.executeScript(tabid, {file : script});
        insert_script(tabid, scripts, index+1);
      }
    }
  }
  var insert_scripts = function(tab) {
    var scripts = app_config.get_pagescripts(tab.url);
    insert_script(tab.id, scripts, 0);
  }

  var on_tabcreated = function(tab) {
    console.log('[Buyer]tab created:', tab.id, tab.url);
  }
  var on_tabupdated = function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
      console.log('[Buyer]tab complete:', tab.id, tab.url);
      insert_scripts(tab);
    }
  }

  return {
    "on_tabcreated" : on_tabcreated,
    "on_tabupdated" : on_tabupdated
  }
}();

chrome.tabs.onUpdated.addListener(tab_events.on_tabupdated);
chrome.extension.onRequest.addListener(msg_events.on_request);