/**
 * 该文件中添加对新闻列表显示详情的模版操作
 **/
(function($, owner) {

	var template = null;
	var getTemplate = function(name, header, content) {
		console.log("加载模板 name:" + name + " header:" + header + " content:" + content);
		console.log("公用父模板:" + template);
		if (!template) {
			console.log("公用父模板不存在，开始创建");
			console.log("加载模板头:" + header);
			//预加载共用父模板；
			var headerWebview = $.preload({
				url: header,
				id: name + "-main",
				styles: {
					popGesture: "hide",
				},
				extras: {
					mType: 'main'
				}
			});
			console.log("加载内容(子模板）:" + content);
			//预加载共用子webview
			var subWebview = $.preload({
				url: !content ? "" : content,
				id: name + "-sub",
				styles: {
					top: '45px',
					bottom: '0px',
				},
				extras: {
					mType: 'sub'
				}
			});
			console.log("给子模板添加事件:loaded,加载完成之后自动显示")
			subWebview.addEventListener('loaded', function() {
				setTimeout(function() {
					subWebview.show();
				}, 50);
			});
			subWebview.hide();
			headerWebview.append(subWebview);
			//iOS平台支持侧滑关闭，父窗体侧滑隐藏后，同时需要隐藏子窗体；
			if ($.os.ios) { //5+父窗体隐藏，子窗体还可以看到？不符合逻辑吧？
				headerWebview.addEventListener('hide', function() {
					subWebview.hide("none");
				});
			}
			template = {
				name: name,
				header: headerWebview,
				content: subWebview,
			};
		}
		return template;
	};
	// 初始化模版
	var initTemplates = function() {
		console.log("初始化模板");
		getTemplate('default', 'template.html');
	};
	// 进入详情界面
	var toDatail = function(conf) {
		conf = conf || {};
		console.log("conf.id:" + conf.id);
		console.log("conf.href:", conf.href);
		if (!conf.href) {
			return false;
		}
		conf.target = conf.href;
		//判断是否显示右上角menu图标；
		conf.showMenu = conf.showMenu ? true : false;
		conf.title = conf.title || "详细信息";
		conf.aniShow = conf.aniShow || "pop-in";
		//使用父子模板方案打开的页面
		//获得共用模板组
		var template = getTemplate('default');
		//获得共用父模板
		var headerWebview = template.header;
		//获得共用子webview
		var contentWebview = template.content;
		//通知模板修改标题，并显示隐藏右上角图标；
		console.log("更新头部信息");
		console.log("conf.id:" + conf.id);
		$.fire(headerWebview, 'updateHeader', conf);
		console.log("conf.id:" + conf.id);
		console.log("ios:" + $.os.ios + " android:" + $.os.android + " $.os.version:" + $.os.version)
		if ($.os.ios || ($.os.android && parseFloat($.os.version) < 4.4)) {
			console.log("ios或者android版本小于4.4");
			var reload = true;
			if (!template.loaded) {
				console.log("模板还没有被加载过,开始加载");
				console.log("内容模板的url:" + contentWebview.getURL());
				console.log("this.href:" + this.href);
				console.log("需要加载的地址:" + conf.id);
				if (contentWebview.getURL() != conf.id) {
					console.log("模板地址和需要加载的地址不一致，重新加载新地址");
					contentWebview.loadURL(conf.id);
				} else {
					reload = false;
				}
			} else {
				console.log("模板已经加载数据成功，不在加载")
				reload = false;
			}
			console.log("realod:" + reload);
			(!reload) && contentWebview.show();
			headerWebview.show("pop-in", 150);
		}
	};
	owner.getTemplate = getTemplate;
	owner.initTemplates = initTemplates;
	owner.toDatail = toDatail;
}(mui, window.app));