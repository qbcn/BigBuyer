CREATE TABLE IF NOT EXISTS `fbee_user`(
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_nick` varchar(15) NOT NULL,
  `user_name` varchar(15) DEFAULT NULL,
  `user_phone` varchar(15) DEFAULT NULL,
  `phone_tail` int unsigned NOT NULL,
  `bind_store` int unsigned NOT NULL DEFAULT 0,
  `status` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY `user`,
  KEY `idx_phone` (`phone_tail`),
  KEY `idx_name` (`user_name`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_usermeta`(
  `meta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `meta_key` varchar(7) NOT NULL,
  `meta_value` varchar(1023) NOT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `idx_user` (`user_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_store`(
  `store_id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_area` int unsigned NOT NULL,
  `store_addr` varchar(95) NOT NULL,
  `store_name` varchar(15) NOT NULL,
  `owner_phone` varchar(15) NOT NULL,
  `owner_id` int unsigned NOT NULL,
  `status` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`store_id`),
  KEY `idx_area` (`store_area`),
  KEY `idx_owner` (`owner_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `fbee_storemeta`(
  `meta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int unsigned NOT NULL,
  `meta_key` varchar(7) NOT NULL,
  `meta_value` varchar(1023) NOT NULL,
  PRIMARY KEY (`meta_id`),
  KEY `idx_store` (`store_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;
