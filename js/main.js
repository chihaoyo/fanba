Date.prototype.rightNow = function() {
	var y = this.getFullYear(),
		m = this.getMonth() + 1,
		d = this.getDate(),
		h = this.getHours(),
		i = this.getMinutes(),
		s = this.getSeconds();
	return '' + y + '-' + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d + '-' + (h < 10 ? '0' : '') + h + (i < 10 ? '0' : '') + i + (s < 10 ? '0' : '') + s;
};

var _GET = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var FBF = {};
FBF.now = function() {
	return new Date().getTime();
};
FBF.autoSave = {interval: 5000};
var FBP = function(lang, original, text, locked) {
	original = (original === undefined ? false : original);
	text = (text === undefined ? null : text);
	this.locked = (locked === undefined ? false: locked);
	this.lang = lang;
	this.original = original;
	this.text = text;
	this.timestamp = FBF.now();
};

var _lang_hierarchy = ['jp', 'en', 'zh'];
var _isHigherThan = function(a, b) {
	return _lang_hierarchy.indexOf(a) - _lang_hierarchy.indexOf(b);
}
var _titles = ['逆転！台湾！', 'Fight! Taiwan!', '翻吧！台灣！'];
var _t = _titles.length - 1;
(function(){
	setInterval(function() {
		_t = (_t - 1 + _titles.length) % _titles.length;
		$('nav h1 a').text(_titles[_t]);
	}, 2000);
})();

var _lang_names = {
	'zh': '中文',
	'en': 'English',
	'jp': '日本語'
};
var _lang_codes = {
	'中': 'zh',
	'英': 'en',
	'日': 'jp',
};
var _dict = {
	'downloads': {
		'jp': '記事全体をダウンロード',
		'en': 'Download article',
		'zh': '全文下載',
	}
}