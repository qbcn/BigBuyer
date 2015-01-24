<?php
namespace Common\Model;
use Think\Model;

class StoreMode extends Model {
	protected $fields = array('store_id', 'store_dist', 'store_addr', 'store_name', 'owner_phone', 'owner_id',
			'_pk'=>'store_id', '_type'=>array('store_id'=>'int', 'store_dist'=>'int', 'store_addr'=>'varchar', 'store_name'=>'varchar', 'owner_phone'=>'varchar', 'owner_id'=>'int'));
}

class StoremetaModel extends Model {
	protected $fields = array('meta_id', 'store_id', 'meta_key', 'meta_value',
			'_pk'=>'meta_id', '_type'=>array('meta_id'=>'int', 'store_id'=>'int', 'meta_key'=>'varchar', 'meta_value'=>'varchar'));
}
