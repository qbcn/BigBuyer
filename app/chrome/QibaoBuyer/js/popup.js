var this_version = '0.1';

$(function(){
  var bgp = chrome.extension.getBackgroundPage();

  var menucfg = bgp.app_config.get_menuconfig();
  var menuitems = $("#menu .item");
  var len = menucfg.length;
  if (len > menuitems.length) {
    len = menuitems.length;
  }
  for (var i = 0; i < len; i++) {
    var cfg = menucfg[i];
    $(menuitems[i]).attr({"data-act":cfg.action, "data-arg":cfg.arg});
    $(menuitems[i]).children(".menu-name").text(cfg.name);
  }

  $("#menu .item").click(function(){
    var action = $(this).attr("data-act");
    var arg = $(this).attr("data-arg");
    //eval("bgp.base_api." + action + "(" + arg + ")");
    bgp.base_api[action](arg);
  })
});