var monitorParagraph = function(project, paragraph, lang, callback) {
	var _ref = _fanba.child('projects/' + project + '/paragraphs/' + paragraph + '/translations');
	
	_ref.on('child_added', function(s) {
		var k = s.key();
		var v = s.val();
		var $el = $('.project#' + project).find('.paragraph#' + paragraph);
		
		if(v.lang == lang) {
			//$el.text(v.text).attr('key', k).attr('lang', v.lang).attr('timestamp', v.timestamp);
			callback();
		}
	});
	_ref.on('child_changed', function(s) {
		var k = s.key();
		var v = s.val();
		var $el = $('.project#' + project).find('.paragraph#' + paragraph);
		
		if(v.lang == lang && v.timestamp > $el.attr('timestamp')) {
			//$el.text(v.text).attr('key', k).attr('lang', v.lang).attr('timestamp', v.timestamp);
			callback();
		}
	});
	_ref.on('child_removed', function(s) {
		var k = s.key();
		var v = s.val();
		var $el = $('.project#' + project).find('.paragraph#' + paragraph);
		
		if(k == $el.attr('key')) {
			_ref.orderByChild('lang').equalTo(lang).limitToLast(1).once('value', function(s) { // OK?
				var k = s.key();
				var v = s.val();
				//$el.text(v.text).attr('key', k).attr('lang', v.lang).attr('timestamp', v.timestamp);
				callback();
			})
		}
	});
}

var monitor = function(project, paragraph) {
	var ref = _fanba.child('projects/' + project + '/paragraphs/' + paragraph + '/translations');
	ref.on('child_added', function(s) {
		var k = s.key();
		var v = s.val();
		var $el = $('.project#' + project).find('.paragraph#' + paragraph);
		if(_isHigherThan(v.lang, $el.attr('lang')) >= 0)
			$el.text(v.text).attr('lang', v.lang);
	});
};

var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");

window.addEventListener('load', function() {
	var $projects = $('#projects');

	var _projects = _fanba.child('projects');
	_projects.on('child_added', function(s) {
		var k = s.key();
		var v = s.val();
		
		$('<div class="project" id="' + k + '"><a class="headshot" href="./translate.php?p=' + k + '"></a><div class="info"><p class="code">' + k + '</p><h1 class="paragraph title" id="' + v.title + '">標題</h1><p class="paragraph description" id="' + v.description + '">宣傳</p></div></div>').appendTo($projects);
		monitor(k, v.title);
		monitor(k, v.description);
	});
});