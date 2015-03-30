<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>fanba</title>
	<link rel="stylesheet" href="css/project.css" />
</head>
<body>
	<nav>
		<h1><a href="http://chihaoyo.net/fanba/">翻吧！台灣！</a></h1>
	</nav>
	<div class="container">
		<div class="project">
			<div class="field"><input type="text" name="title" placeholder="標題" /></div>
			<div class="field"><textarea name="description" placeholder="宣傳"></textarea></div>
			<div class="field"><textarea name="text" placeholder="貼上文字" class="large"></textarea></div>
			<div class="field"><select name="lang">
				<option value="martian">主要語言</option>
				<option>zh-tw</option>
				<option>en</option>
				<option>jp</option>
			</select></div>
			<div class="field"><input type="button" name="submit" value="翻吧！" /></div>
		</div>
	</div>
</body>

<script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="//cdn.firebase.com/js/client/2.1.2/firebase.js"></script>
<script src="./js/jquery.textarea_autosize.js"></script>
<script src="./js/main.js"></script>
<script src="./js/project.js"></script>
</html>