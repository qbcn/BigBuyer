<?php

namespace Common\Service;

class OrderService {
	/**
	 * 客户下代购单
	 */
	public function createOrder($buyer_id, $item_info) {
	
	}

	/**
	 * 订单同步与更新
	 */
	public function updateOrder($order_id, $order_status, $order_tid, $ship_info) {
	
	}

	/**
	 * 客户查单，客服查单
	 */
	public function getOrdersForBuyer($buyer_id, $order_status, $pindex = 1, $psize = 10) {
	
	}
	
	/**
	 * 网点拉取代购单
	 */
	public function getOrdersForStore($store_id, $order_status = 0, $pindex = 1, $psize = 10) {
		
	}
	
	/**
	 * 物流查单
	 * $ship_sn 物流单号完整
	 * $ship_tail 物流单号尾号
	 * $store_id 过滤网点。后台可查任意网点，网点只能查本网点
	 * 若$ship_tail为空，则根据$ship_sn得$ship_tail
	 * 一律根据$ship_tail查出订单，再针对$ship_sn和$store_id匹配过滤
	 */
	public function getOrderByShip($ship_tail, $ship_sn, $ship_sp, $store_id) {
		
	}
	
	/**
	 * 反向查单，根据交易订单号查代购订单
	 */
	public function getOrderByTid($order_tid, $store_id) {
		
	}
}