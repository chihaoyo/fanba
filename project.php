<!DOCTYPE html>
<html>
<head>
	<title>fanba</title>
	<link rel="stylesheet" href="main.css" />
	<link rel="stylesheet" href="project.css" />
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

<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://cdn.firebase.com/js/client/2.1.2/firebase.js"></script>
<script src="./jquery.textarea_autosize.js"></script>
<script src="./main.js"></script>
<script src="./project.js"></script>
</html>