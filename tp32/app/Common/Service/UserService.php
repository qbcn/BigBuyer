<?php

namespace Common\Service;

class UserService {
	/**
	 * 新增用户
	 */
	public function registerUser($user_info) {
		
	}
	
	/**
	 * 更新或审核用户
	 */
	public function updateUser($user_id, $status = null, $user_info) {
		
	}
	
	/**
	 * 用户绑定网点
	 */
	public function bindStore($user_id, $store_id) {
		
	}
	
	/**
	 * 查询用户
	 */
	public function getUserById($user_id) {
		
	}
	
	/**
	 * 根据电话号码查用户
	 * $phone_tail 电话号码尾号
	 * $user_phone 完整电话号码
	 * $store_id 网点id
	 * 若$phone_tail为空，则根据$user_phone得$phone_tail
	 * 先根据$phone_tail查，再根据$user_phone和$store_id过滤
	 */
	public function getUserByPhone($phone_tail, $user_phone, $store_id) {
		
	}
	
	/**
	 * 查询网点用户
	 */
	public function getUsersByStore($store_id, $pindex = 1, $psize = 10) {
		
	}
}