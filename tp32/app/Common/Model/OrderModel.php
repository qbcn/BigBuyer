<?php
namespace Common\Model;
use Think\Model;

class OrderModel extends Model {
	protected $fields = array('order_id', 'buyer_id', 'item_mkt', 'item_iid', 'item_skuid', 'item_price', 'item_title', 'item_img', 'order_tid', 'order_time', 'order_status', 'ship_fee', 'ship_sp', 'ship_sn',
			'_pk'=>'order_id', '_type'=>array('order_id'=>'int', 'buyer_id'=>'int', 'item_mkt'=>'tinyint', 'item_iid'=>'varchar', 'item_skuid'=>'varchar', 'item_price'=>'float', 'item_title'=>'varchar', 'item_img'=>'varchar', 'order_tid'=>'varchar', 'order_time'=>'timestamp', 'order_status'=>'tinyint', 'ship_fee'=>'smallint', 'ship_sp'=>'tinyint', 'ship_sn'=>'varchar'));
}

class OrdermetaModel extends Model {
	protected $fields = array('meta_id', 'order_id', 'meta_key', 'meta_value',
			'_pk'=>'meta_id', '_type'=>array('meta_id'=>'int', 'order_id'=>'int', 'meta_key'=>'varchar', 'meta_value'=>'varchar'));
}
