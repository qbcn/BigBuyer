/**
* 内容: 代购商品
* 作用: 热卖分析和推荐, 每日更新1次
* 1. 每日凌晨分析订单数据, 插入或更新本数据
* 2. 佣金排名: (price*cps_ratio-1)*sales
* 3. 热卖排名：sales
*/
CREATE TABLE IF NOT EXISTS `fbee_item`(
  `item_id` int unsigned NOT NULL AUTO_INCREMENT,
  `market` tinyint unsigned NOT NULL,
  `mkt_iid` varchar(15) NOT NULL,
  `price` float(8,2) unsigned NOT NULL,
  `cps_ratio` float(4,4) unsigned NOT NULL,
  `sales` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`item_id`),
  KEY `idx_iid` (`mkt_iid`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_itemmeta`(
  `meta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `item_id` int unsigned NOT NULL,
  `meta_key` varchar(7) NOT NULL,
  `meta_value` varchar(1023) NOT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `idx_item` (`item_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

/**
* 内容: 代购订单
* 作用: 代购记录和流程跟踪
* head_oid=0 单品订单(非购物车订单)
* head_oid=1 购物车头订单
* head_oid>1 购物车子订单
* market 1-taobao 2-tmall 3-jd 4-mogujie
* sku_id 格式20509:3267945;1627207:28326#34927191052
* status 状态值与迁移
* -1 ORDER_DELETE
* +0 ORDER_CANCEL 
* +1 IN_CART      --> WAIT_TRADE | ORDER_DELETE
* +2 WAIT_TRADE   --> WAIT_PAY | ORDER_CANCEL
* +3 WAIT_PAY     --> WAIT_SEND
* +4 WAIT_SEND    --> WAIT_RECV
* +5 WAIT_RECV    --> WAIT_ACCEPT
* +6 WAIT_ACCEPT  --> ORDER_FIN
* +9 ORDER_FIN
* 立即代购: insert ... status=WAIT_TRADE,head_oid=0
* 加入购物车: insert ... status=IN_CART,head_oid=0, 限20个
* 移出购物车: update status=ORDER_DELETE where order_id=xxx
* 查询购物车: select ... where buyer=xxx and status=IN_CART 全量查询,结果按 mkt_shopid合并
* 购物车代购: update status=WAIT_TRADE,head_oid=xxx
* 完成下单: update mkt_tid=xxx where order_id=yyy or head_oid=yyy
* 查询订单列表: select ... buyer=xxx and status=Y and head_oid<=1 and offset... 得到单品订单 和 购物车头订单
* 查询购物车订单: select ... buyer=xxx and status=Y and head_oid=zzz
* 查询物流: select ... from fbee_trade where mkt_tid=xxx
*/
CREATE TABLE IF NOT EXISTS `fbee_order`(
  `order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `head_oid` int unsigned NOT NULL DEFAULT 0,
  `buyer_id` int unsigned NOT NULL,
  `store_id` int unsigned NOT NULL,
  `market` tinyint unsigned NOT NULL,
  `mkt_tid` varchar(31) NOT NULL DEFAULT 0,
  `mkt_shopid` varchar(15) NOT NULL,
  `mkt_shopname` varchar(95) NOT NULL,
  `mkt_iid` varchar(15) NOT NULL,
  `sku_id` varchar(120),
  `sku_txt` varchar(95),
  `title` varchar(95) NOT NULL,
  `image` varchar(1023) NOT NULL,
  `price` float(8,2) unsigned NOT NULL,
  `quantity` smallint unsigned NOT NULL DEFAULT 1,
  `ship_fee` smallint unsigned NOT NULL DEFAULT 0,
  `modified` timestamp,
  `order_time` timestamp,
  `status` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`order_id`),
  KEY `idx_buyer` (`buyer_id`),
  KEY `idx_store` (`store_id`),
  KEY `idx_tid` (`mkt_tid`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_ordermeta`(
  `meta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int unsigned NOT NULL,
  `meta_key` varchar(7) NOT NULL,
  `meta_value` varchar(1023) NOT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `idx_order` (`order_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

/**
* 内容: 交易信息
* 作用: 主要承载物流数据,正反向查单
* 主要读写: 订单同步, 查物流
* 1. "立即下单"创建交易信息,更新代购信息
* 2. "订单同步"更新交易信息
* 3. 正向查单：自助根据订单号查物流状态
* 4. 反向查单: 到货根据物流单号查订单
*/
CREATE TABLE IF NOT EXISTS `fbee_trade`(
  `trade_id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int unsigned NOT NULL,
  `market` tinyint unsigned NOT NULL,
  `mkt_tid` varchar(31) NOT NULL,
  `ship_fee` smallint unsigned NOT NULL DEFAULT 0,
  `ship_sp` varchar(31),
  `ship_sn` varchar(31),
  `ship_tail` int unsigned NOT NULL,
  `trade_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `idx_tid` (`mkt_tid`),
  KEY `idx_ship` (`ship_tail`),
  KEY `idx_store` (`store_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_trademeta`(
  `meta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `trade_id` int unsigned NOT NULL,
  `meta_key` varchar(7) NOT NULL,
  `meta_value` varchar(1023) NOT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `idx_trade` (`trade_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

/**
* 明细实时,统计非实时
* 统计每日1次,结算每周1次.日数据只保留1天,累计进周数据,周数据保留所有历史记录.
* 网点收入 = 服务费+返利, 服务费 = 日单量*服务费单价
* 系统收入 = cps佣金-返利
* 网点昨日统计: stat_day=0, store_id=网点id
* 系统昨日统计: stat_day=0, store_id=0
* 网点周统计: stat_day=周日, store_id=网点id
* 系统周统计: stat_day=周日, store_id=0
* orders 订单量
* sales  交易额
* cps    cps佣金
* rebate  网点返利
* servfee 网点服务费
*/
CREATE TABLE IF NOT EXISTS `fbee_sales`(
  `stat_id` int unsigned NOT NULL AUTO_INCREMENT,
  `stat_day` date NOT NULL,
  `store_id` int unsigned NOT NULL DEFAULT 0,
  `orders` int unsigned NOT NULL DEFAULT 0,
  `sales` float(12,2) unsigned NOT NULL DEFAULT 0,
  `cps` float(10,2) unsigned NOT NULL DEFAULT 0,
  `rebate` float(10,2) unsigned NOT NULL DEFAULT 0,
  `serv_fee` int unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`stat_id`),
  KEY `idx_store` (`store_id`),
  KEY `idx_day` (`stat_day`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;
