/**
 * 该文件中添加对新闻列表显示详情的模版操作
 **/
(function($, owner) {

	var template = null;
	var getTemplate = function(name, header, content) {
		if (!template) {
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
		getTemplate('default', 'template.html');
	};
	// 进入详情界面
	var toDatail = function(conf) {
		conf = conf || {};
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
		$.fire(headerWebview, 'updateHeader', conf);
		if ($.os.ios || ($.os.android && parseFloat($.os.version) < 4.4)) {
			var reload = true;
			if (!template.loaded) {
				if (contentWebview.getURL() != this.href) {
					contentWebview.loadURL(this.href);
				} else {
					reload = false;
				}
			} else {
				reload = false;
			}
			(!reload) && contentWebview.show();
			headerWebview.show("pop-in", 150);
		}
	};
	owner.getTemplate = getTemplate;
	owner.initTemplates = initTemplates;
	owner.toDatail = toDatail;
}(mui, window.app));