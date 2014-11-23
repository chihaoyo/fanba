<!DOCTYPE html>
<html>
<head>
	<title>fanba</title>
	<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="main.css" />
	<link rel="stylesheet" href="index.css" />
</head>
<body>
	<nav>
		<h1>翻吧，台灣！</h1>
	</nav>
	<div class="section action"><a href="project.php">我想被翻</a></div>
	<div class="section action">我想翻</div>
	<div class="section" id="projects"></div>
</body>
<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://cdn.firebase.com/js/client/2.0.4/firebase.js"></script>
<script src="./jquery.textarea_autosize.js"></script>
<script>

var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");

window.addEventListener('load', function() {
	var $projects = $('#projects');

	var _projects = _fanba.child('projects');
	_projects.on('child_added', function(s) {
		var k = s.key();
		var v = s.val();
		$('<div class="project"><a class="headshot" href="./translate.php?p=' + k + '"></a><div class="info"><p class="code">' + k + '</p><h1>' + v.title + '</h1><p>' + v.description + '</p></div></div>')
			.appendTo($projects);
	});
});

</script>
</html>