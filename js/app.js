/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {

	var host = "http://172.27.35.2:8080/pisWeb";
	// 服务器上的环境
//	var host = "http://123.57.4.104:38034/pisWeb";
	var conf = {
		host: host,
		regUrl: host + "/api/addUser.json", // 用户注册
		loginUrl: host + "/api/login.json", // 用户登录
		recommendUrl: host + "/api/addRecommend.json", // 用户推荐
		cityListUrl: host + "/api/getCitys.json", // 城市列表
		propertyListUrl: host + "/api/properties.html", // 楼盘裂变
		propertyDetailUrl: host + "/api/property.html", // 楼盘详情
		infoListUrl: host + "/api/articles.json", // 咨询列表
		infoDetailUrl: host + "/api/article.html", // 咨询详情
		userGroupUrl: host + "/api/user/group.json", // 用户组信息
		timeout: "timeout" // 超时标识
	};
	owner.conf = conf;
	// 第一次进入页签时调用
	owner.initPage = function() {};
	// 除第一次意外的每次调用
	owner.exceptFirst = function() {};
	// 每次进入均被调用的方法
	owner.everyTime = function() {};

	/**
	 * 创建实体对象
	 * @param {Object} userInfo
	 * @param {Object} callback
	 */
	owner.createState = function(userInfo, callback) {
		var state = userInfo || {};
		if (userInfo.userGroup) {
			state.groupTypeName = userInfo.userGroup.name;
		}
		owner.setState(state);
		return callback();
	};

	/**
	 * 获取当前保存的系统状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前系统状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.userName = regInfo.userName || '';
		regInfo.password = regInfo.password || '';
		if (!checkTEL(regInfo.TEL)) {
			return callback('手机号码不合法');
		}
		if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		var waiting = plus.nativeUI.showWaiting("处理中，请等待...");
		mui.ajax(conf.regUrl, {
			data: regInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback();
					} else {
						return callback(data.message || '注册用户是出错');
					}
				} else {
					callback('注册用户时出错');
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					callback('用户登录超时，请检测网络');
				} else {
					callback('用户登录失败');
				}
			}
		});
	};

	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.userName = loginInfo.userName || '';
		loginInfo.password = loginInfo.password || '';
		if (!loginInfo.userName) {
			return callback('请输入账号');
		}
		if (!loginInfo.password.length) {
			return callback('请输入密码');
		}
		var waiting = plus.nativeUI.showWaiting("登录中，请等待...");
		loginInfo.deviceId = plus.device.imei || "unknown";
		mui.ajax(conf.loginUrl, {
			data: loginInfo,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var authed = data.success;
					if (authed) {
						//用户验证成功，记录下用户名称、用户id、用户类型（管理员、驻场专员、经纪公司、业务员）
						return owner.createState(data.result, callback);
					} else {
						return callback(data.message || '用户名或密码错误');
					}
				} else {
					callback('用户登录失败');
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					callback('用户登录超时，请检测网络');
				} else {
					callback('用户登录失败');
				}
			}
		});
	};
	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	owner.recommend = function(customerInfo, callback) {
		if (!customerInfo.customerName) {
			return callback('客户名称不能为空');
		}
		if (!customerInfo.customerTel) {
			return callback('客户电话不能空');
		}
		if (!customerInfo.cityId) {
			return callback('推荐城市不能为空');
		}
		if (!customerInfo.buildingId) {
			return callback('推荐楼盘不能空');
		}
		if (!customerInfo.remark) {
			return callback('详情不能为空');
		}
//		if (customerInfo.appointmentLookHouseDate == null) {
//			return callback('预约看房日期不能为空');
//		}
		var waiting = plus.nativeUI.showWaiting("处理中，请等待...");
		mui.ajax(conf.recommendUrl, {
			contentType: "application/json;charset=utf-8",
			data: JSON.stringify(customerInfo),
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data, textStatus, xhr) {
				waiting.close();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data) {
					var success = data.success;
					if (success) {
						return callback("推荐成功");
					} else {
						return callback(data.message || '推荐客户失败，请稍候重试。');
					}
				} else {
					callback('推荐客户失败，请稍候重试。');
				}
			},
			error: function(xhr, type, errorThrown) {
				waiting.close();
				//异常处理；
				if (type == conf.timeout) {
					callback('系统超时，请检测网络');
				} else {
					callback('推荐客户失败，请稍候重试。');
				}
			}
		});
	}

	function checkUserName(s) {
		var patrn = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;
		if (patrn.test(s)) return true;
		return false
	}

	function checkEmail(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	function checkTEL(TEL) {
		var patrn = /^1\d{10}$/;
		if (patrn.test(TEL)) return true;
		return false;
	}
}(mui, window.app = {}));