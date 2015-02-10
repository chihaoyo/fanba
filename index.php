<!DOCTYPE html>
<html>
<head>
	<title>fanba</title>
	<link rel="stylesheet" href="main.css" />
	<link rel="stylesheet" href="index.css" />
</head>
<body>
	<nav>
		<h1><a href="http://chihaoyo.net/fanba/">翻吧！台灣！</a></h1>
	</nav>
	<div class="section action"><a href="project.php">我想被翻</a></div>
	<div class="section action">我想翻</div>
	<div class="section" id="projects"></div>
</body>
<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://cdn.firebase.com/js/client/2.1.2/firebase.js"></script>
<script src="./jquery.textarea_autosize.js"></script>
<script src="./main.js"></script>
<script>

var compare = function(a, b) {
	return _list.indexOf(a) - _list.indexOf(b);
}

var monitor = function(project, paragraph) {
	var ref = _fanba.child('projects/' + project + '/paragraphs/' + paragraph + '/translations');
	ref.on('child_added', function(s) {
		var k = s.key();
		var v = s.val();
		var $el = $('.project#' + project).find('.paragraph#' + paragraph);
		if(compare(v.lang, $el.attr('lang')) >= 0)
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

</script>
</html>