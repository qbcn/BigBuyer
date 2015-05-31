<?php
namespace Common\Model;
use Think\Model;

class ItemModel extends Model {
	protected $fields = array('item_id', 'item_mkt', 'item_iid', 'item_price', 'item_title', 'item_img',
		'_key'=>'item_id', '_type'=>array('item_id'=>'int', 'item_mkt'=>'tinyint', 'item_price'=>'float', 'item_title'=>'varchar', 'item_img'=>'varchar'));
}

class ItemmetaModel extends Model {
	protected $fields = array('meta_id', 'item_id', 'meta_key', 'meta_value',
			'_pk'=>'meta_id', '_type'=>array('meta_id'=>'int', 'item_id'=>'int', 'meta_key'=>'varchar', 'meta_value'=>'varchar'));
}
