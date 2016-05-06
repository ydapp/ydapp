/**
 * 在“我的”选项卡中处理用户的待办等数据
 **/
(function($, owner) {
	var toast = function(msg) {
		if (plus && plus.nativeUI && plus.nativeUI.toast) {
			plus.nativeUI.toast(msg);
		} else {
			alert(msg);
		}
	}
	var errorFn = function(xhr, type, errorThrown) {
		if (type == "timeout") {
			toast('系统超时，请检测网络。');
		} else if (type == "abort") {
			toast("连接服务器失败，请稍后再试");
		} else {
			toast('请求数据失败，请稍候重试。');
		}
	}
	var host = owner.conf.host;
	//获取等待到场确认列表
	owner.waitingPresent = function(callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		//这里报plus未定义，先注释掉
		//var waiting = plus.nativeUI.showWaiting("正在获取报备列表，请等待...");
		mui.ajax(host + '/api/recommends/waitingPresent/' + userId + '.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				//报waiting没有定义
				//waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback(data.result);
					} else {
						return callback(data.message || '获取到场列表失败1。');
					}
				} else {
					callback('获取到场列表失败2。');
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取到场列表失败4")
					//这个waiting也说没有定义
					//waiting.close();
					//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('获取到场列表失败，请稍候重试。');
				}
			}
		});
	};
	//到场操作
	owner.customerPresent = function(recommendId, callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		var waiting = plus.nativeUI.showWaiting("正在处理到场操作，请等待...");
		mui.ajax(host + '/api/recommends/customerPresent/' + recommendId + '/' + userId + '.json', {
			contentType: 'application/json',
			dataType: 'json', //服务器返回json格式数据
			type: 'put', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						//自动移除这一行
						var _el = document.getElementById(recommendId);
						if (_el) {
							_el.style.display = 'none';
							_el.parentNode.removeChild(_el);
						}
						return callback("客户到场操作成功");
					} else {
						return callback(data.message || '客户到场操作失败');
					}
				} else {
					callback('客户到场操作失败');
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('客户到场操作失败');
				}
			}
		});
	};
	owner.customerPresentCallback = function(err) {
		if (err === true) {
			mui.alert('到场操作失败', '对不起 !', function() {});
			return;
		}
		if (err) {
			toast(err);
			return;
		}
	};

	//获取等待到场确认列表
	owner.waitingConfirm = function(callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		//这里报plus未定义，先注释掉
		//var waiting = plus.nativeUI.showWaiting("正在获取报备列表，请等待...");
		mui.ajax(host + '/api/recommends/waitingConfirm/' + userId + '.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				//报waiting没有定义
				//waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback(data.result);
					} else {
						return callback(data.message || '获取报备待确认列表失败。');
					}
				} else {
					callback('获取报备待确认列表失败。');
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取报备待确认列表失败")
					//这个waiting也说没有定义
					//waiting.close();
					//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('获取到场列表失败，请稍候重试。');
				}
			}
		});
	};
	//驻场专员操作
	owner.recommendConfirm = function(recommendId, callback) {
		console.log("驻场专员对报备信息进行操作：" + recommendId);
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		var waiting = plus.nativeUI.showWaiting("正在处理报备确认操作，请等待...");
		mui.ajax(host + '/api/recommends/recommendConfirm/' + recommendId + '/' + userId + '.json', {
			contentType: 'application/json',
			dataType: 'json', //服务器返回json格式数据
			type: 'put', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				waiting.close();
				console.log("驻场专员操作成功");
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						//自动移除这一行
						var _el = document.getElementById(recommendId);
						console.log("驻场专员操作recommendId:" + recommendId + " 操作成功");
						//loadTODO();
						return callback("确认操作成功");
					} else {
						return callback(data.message || '确认操作失败');
					}
				} else {
					callback('报备确认操作失败');
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('报备确认操作失败');
				}
			}
		});
	};
	owner.recommendConfirmCallback = function(err) {
		if (err === true) {
			mui.alert('确认报备操作失败', '对不起 !', function() {});
			return;
		}
		if (err) {
			toast(err);
			return;
		}
	};

	//获取我的已经到场的报备信息
	owner.getMyPresent = function(callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		//这里报plus未定义，先注释掉
		//var waiting = plus.nativeUI.showWaiting("正在获取报备列表，请等待...");
		mui.ajax(host + '/api/recommends/presented/' + userId + '.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				//报waiting没有定义
				//waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback(data.result);
					} else {
						return callback(data.message || '获取已办列表失败。');
					}
				} else {
					alert('获取已办列表失败：无数据');
				}
			},
			error: function(xhr, type, errorThrown) {
				//这个waiting也说没有定义
				//waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					alert('系统超时，请检测网络');
				} else if (type == "abort") {
					alert("连接服务器失败，请稍后再试");
				} else {
					alert('获取已办列表失败，请稍候重试。');
				}
			}
		});
	};

	//获取我的已经到场的报备信息
	owner.getMyConfirm = function(callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		//这里报plus未定义，先注释掉
		//var waiting = plus.nativeUI.showWaiting("正在获取报备列表，请等待...");
		mui.ajax(host + '/api/recommends/confirmed/' + userId + '.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				//报waiting没有定义
				//waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback(data.result);
					} else {
						return callback(data.message || '获取已办列表失败');
					}
				} else {
					callback('获取已办列表失败');
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取已办列表失败")
					//这个waiting也说没有定义
					//waiting.close();
					//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('获取已办列表失败，请稍候重试。');
				}
			}
		});
	};
	owner.getRecommendStatusName = function(status) {
		if ("confirm" == status) {
			return "确";
		} else if ("buy" == status) {
			return "购";
		} else if ("order" == status) {
			return "订";
		} else if ("pledges" == status) {
			return "筹";
		} else if ("present" == status) {
			return "来";
		} else if ("appointment" == status) {
			return "报";
		}
	}

	//获取报备信息详情
	owner.getRecommendDetail = function(recommendId, callback) {
		mui.ajax(host + '/api/recommends/' + recommendId + '.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				data = data || {};
				return callback(data);
			},
			error: errorFn
		});
	};

	//获取我的已经到场的报备信息
	owner.getMyPhonebook = function(callback) {
		var state = app.getState() || {};
		var user = state.user || {};
		var userId = user.userId;
		mui.ajax(host + '/api/userInfos.json', {
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			data:{page:1,rows:100},
			timeout: 30000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				data = data || {};
				return callback(data);
			},
			error: errorFn
		});
	};

}(mui, window.app));