<?php
namespace Common\Model;
use Think\Model;

class UserModel extends Model {
	protected $fields = array('user_id', 'user_nick', 'user_name', 'user_phone', 'bind_store', 
			'_pk'=>'user_id', '_type'=>array('user_id'=>'int'), 'user_nick'=>'varchar', 'user_name'=>'varchar', 'user_phone'=>'varchar', 'bind_store'=>'int');
}

class UsermetaModel extends Model {
	protected $fields = array('meta_id', 'user_id', 'meta_key', 'meta_value',
			'_pk'=>'meta_id', '_type'=>array('meta_id'=>'int', 'user_id'=>'int', 'meta_key'=>'varchar', 'meta_value'=>'varchar'));
}
