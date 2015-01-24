/**
* 内容: 代购商品
* 作用: 热卖分析和推荐
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
* 1. "加入代购车"创建暂存订单
* 2. "立即代购"创建代购订单, 可分派至网点进入交易流程
* 3. 交易开始前(即mkt_tid未生成), 根据mkt_sid合并订单)
* 4. 交易开始后(即mkt_tid已生成), 根据mkt_tid合并订单)
* 5. 查询by (buyer | store | mkt_tid | ship_sn)&状态["代购车"|"未下单"|"待付款"|"待收货"|"待取件"]
* 6. 更新by (order_id | mkt_tid)
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
* 内容: 交易订单,物流数据
* 作用: 主要承载物流数据,正反向查单
* 1. "立即下单"创建交易订单,更新代购订单
* 2. "订单同步"更新交易订单
* 3. 正向查单：根据订单号查物流状态
* 4. 反向查单: 根据物流单号查订单
*/
CREATE TABLE IF NOT EXISTS `fbee_trade`(
  `trade_id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int unsigned NOT NULL,
  `market` tinyint unsigned NOT NULL,
  `mkt_tid` varchar(31) NOT NULL,
  `ship_fee` smallint unsigned NOT NULL DEFAULT 0,
  `ship_sp` tinyint NOT NULL DEFAULT 0,
  `ship_sn` varchar(31) NOT NULL,
  `ship_tail` varchar(7) NOT NULL,
  `trade_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT 0,
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
