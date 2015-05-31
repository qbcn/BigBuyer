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

console.log("[BuyAgent]buy.login.js loaded.");

var tb_logincheck = function(){
  var is_logined = function(){
    var nick = $("#J_myTaobao_plugin .mb-user #J_nick span").text();
    if (nick) {
      return true;
    } else {
      return false;
    }
  }
  
  return {
    "is_logined" : is_logined
  }
}
var jd_logincheck = function(){
  var is_logined = function(){
    var uid = $(".head-img p").first.text();
    if (uid) {
      return true;
    } else {
      return false;
    }
  }
  
  return {
    "is_logined" : is_logined
  }
}
var mg_logincheck = function(){
  var is_logined = function(){
    var nick = $(".ui-subfield-con .sf-login p").text();
    if (nick && nick != "请登录") {
      return true;
    } else {
      return false;
    }
  }
  
  return {
    "is_logined" : is_logined
  }
}

$(function(){
  var check_urls = {
    "tb":"http://h5.m.taobao.com/awp/mtb/mtb.htm",
    "tm":"http://h5.m.taobao.com/awp/mtb/mtb.htm",
    "jd":"http://home.m.jd.com/myJd/home.action",
    "mg":"http://m.mogujie.com/"
  };

  var mkt = null;
  var this_url = window.location.href;
  for (key in check_urls){
    if (this_url.startsWith(check_urls[key])){
      mkt = key;
      break;
    }
  }
  setTimeout(function(){
    var login_check;
    if (mkt == "tb" || mkt == "tm") {
      login_check = tb_logincheck();
    } else if (mkt = "jd") {
      login_check = jd_logincheck();
    } else if (mkt = "mg") {
      login_check = mg_logincheck();
    } else {
      login_check = null;
    }
    
    if (login_check && login_check.is_logined()){
      bgp_call("user_logined", mkt, function(ret){
        console.log("[Buyer]user_logined " + ret.ret + "," + ret.msg);
      });
    }
  }, 200);
});
