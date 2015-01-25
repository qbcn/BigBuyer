/**
* 内容: 代购商品
* 作用: 热卖分析和推荐, 每日更新1次
* 1. 定期离线分析订单数据, 插入或更新本数据
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
* 主要读写: 订单列表展示
* 1. "加入代购车"创建暂存订单
* 2. "立即代购"创建代购订单, 可分派至网点进入交易流程
* 3. 交易开始前(即mkt_tid未生成), 根据mkt_sid合并订单)
* 4. 交易开始后(即mkt_tid已生成), 根据mkt_tid合并订单)
* 5. 查询by (buyer | store | mkt_tid | ship_sn)&状态["代购车"|"未下单"|"待付款"|"待收货"|"待取件"]
* 6. 更新by (order_id | mkt_tid)
* ship_fee 各单品的运费, 下单前预估合并运费, 下单后以合并运费为准
*/
CREATE TABLE IF NOT EXISTS `fbee_order`(
  `order_id` int unsigned NOT NULL AUTO_INCREMENT,
  `buyer_id` int unsigned NOT NULL,
  `store_id` int unsigned NOT NULL,
  `market` tinyint unsigned NOT NULL,
  `mkt_tid` varchar(31) NOT NULL,
  `mkt_sid` varchar(15) NOT NULL,
  `mkt_iid` varchar(15) NOT NULL,
  `sku_id` varchar(15) unsigned NOT NULL,
  `title` varchar(95) NOT NULL,
  `image` varchar(1023) NOT NULL,
  `price` float(8,2) unsigned NOT NULL,
  `quantity` smallint unsigned NOT NULL DEFAULT 1,
  `ship_fee` smallint unsigned NOT NULL DEFAULT 0,
  `order_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint unsigned NOT NULL DEFAULT 0,
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
* 内容: 交易订单,物流数据
* 作用: 主要承载物流数据,正反向查单
* 主要读写: 订单同步, 查物流
* 1. "立即下单"创建交易订单,更新代购订单
* 2. "订单同步"更新交易订单
* 3. 正向查单：根据订单号查物流状态
* 4. 反向查单: 根据物流单号查订单
* ship_fee 合并运费,下单后以此运费为准
*/
CREATE TABLE IF NOT EXISTS `fbee_trade`(
  `trade_id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int unsigned NOT NULL,
  `market` tinyint unsigned NOT NULL,
  `mkt_tid` varchar(31) NOT NULL,
  `ship_fee` smallint unsigned NOT NULL DEFAULT 0,
  `ship_sp` tinyint unsigned NOT NULL DEFAULT 0,
  `ship_sn` varchar(31) NOT NULL,
  `ship_tail` varchar(7) NOT NULL,
  `trade_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint unsigned NOT NULL DEFAULT 0,
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
* 系统周统计: stat_dya=周日, store_id=0
*/
CREATE TABLE IF NOT EXISTS `fbee_sales`(
  `stat_id` int unsigned NOT NULL AUTO_INCREMENT,
  `stat_day` date NOT NULL,
  `store_id` int unsigned NOT NULL DEFAULT 0,
  `orders` int unsigned NOT NULL DEFAULT 0,
  `serv_fee` int unsigned NOT NULL DEFAULT 0,
  `cps_sum` float(10,2) unsigned NOT NULL,
  `rebate` float(10,2) unsigned NOT NULL,
  PRIMARY KEY (`stat_id`),
  KEY `idx_store` (`store_id`),
  KEY `idx_day` (`stat_day`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

/**
* KV高速缓存: item_id:cps_ratio, sku_id:sku_name, shop_id:shop_name, store_id:serv_fee
*/
