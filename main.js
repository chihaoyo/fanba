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
var FBP = function(lang, original, text) {
	original = original || false;
	text = text || null;
	this.locked = false;
	this.lang = lang;
	this.original = original;
	this.text = text;
	this.timestamp = FBF.now();
};

var _list = ['jp', 'en', 'zh-tw'];
var _titles = ['逆転！台湾！', 'Fight! Taiwan!', '翻吧！台灣！'];
var _t = _titles.length - 1;
(function(){
	setInterval(function() {
		_t = (_t - 1 + _titles.length) % _titles.length;
		$('nav h1 a').text(_titles[_t]);
	}, 2000);
})();