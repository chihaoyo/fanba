<!DOCTYPE html>
<html>
<head>
	<title>fanba</title>
	<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="main.css" />
</head>
<body>
	<nav>
		<h1>翻吧，台灣！</h1>
	</nav>
	<div class="container" id="project">
		<input type="text" name="title" placeholder="標題" />
		<textarea name="description" placeholder="宣傳"></textarea>
		<textarea name="text" placeholder="貼上文字" class="large"></textarea>
		<select name="lang">
			<option>zh-tw</option>
			<option>en</option>
			<option>jp</option>
		</select>
		<input type="button" name="submit" value="翻吧！" />
	</div>
</body>

<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://cdn.firebase.com/js/client/2.0.4/firebase.js"></script>
<script src="./jquery.textarea_autosize.js"></script>
<script>

var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");

</script>
</html>