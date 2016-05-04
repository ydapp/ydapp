/**
 * 升级文件为JSON格式数据，如下：
 * 
 * 需升级
 * <code>
 * {
 *     "status":1,
 *     "version": "2.6.0",
 *     "title": "版本更新",
 *     "note": "修复“选项卡+下拉刷新”示例中，某个选项卡滚动到底时，会触发所有选项卡上拉加载事件的bug；\n修复Android4.4.4版本部分手机上，软键盘弹出时影响图片轮播组件，导致自动轮播停止的bug；",
 *     "url": "http://www.dcloud.io/hellomui/HelloMUI.apk"
 * }
 * </code>
 *
 * 无需升级
 * <code>
 * {"status":0}
 * </code>
 */

(function($, owner) {
	owner = owner || {};
	var conf = owner.conf;
	if(!conf){
		alert("没有正确配置，请引入app.js");
		return;
	}
	var server = conf.host + "/api/check/update.json"; //获取升级描述文件服务器地址
	function update() {
		mui.getJSON(server, {
			"appid": plus.runtime.appid,
			"version": plus.runtime.version,
			"imei": plus.device.imei
		}, function(data) {
			if (data.status) {
				plus.nativeUI.confirm(data.note, function(event) {
					if (0 == event.index) {
						alert(data.url);
						var url = data.url;
						if(url && url.indexOf("http") == 0){
						}else{
							url = conf.host + url;
						}
						plus.runtime.openURL(data.url);
					}
				}, data.title, ["立即更新", "取　　消"]);
			}
		});
	}

	mui.os.plus && !mui.os.stream && mui.plusReady(update);

}(mui, window.app));