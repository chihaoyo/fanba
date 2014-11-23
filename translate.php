<!DOCTYPE html>
<html>
<head>
	<title>fanba</title>
	<link href='http://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="main.css" />
	<link rel="stylesheet" href="translate.css" />
</head>
<body>
	<nav>
		<h1>翻吧，台灣！</h1>
	</nav>
	<div class="container" id="text"></div>
</body>

<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://cdn.firebase.com/js/client/2.0.4/firebase.js"></script>
<script src="./jquery.textarea_autosize.js"></script>
<script>

function _GET() {
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
	if(original === undefined)
		original = false;
	if(text === undefined)
		text = null;
	this.locked = false;
	this.lang = lang;
	this.original = original;
	this.text = text;
	this.timestamp = FBF.now();
};

var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");	

window.addEventListener('load', function() {

	// reset?
	if(_reset) {
		_fanba.child('projects').remove();

		// initiate sample project
		var title = '柯';
		var description = '柯柯柯';

		var _project = _fanba.child('projects').push({title: title, description: description, langs: 'zh-tw,en,jp'});

		_project.child('paragraphs').push().child('translations').push(new FBP('zh-tw', true, title));
		_project.child('paragraphs').push().child('translations').push(new FBP('zh-tw', true, description));

		// load text file
		$.get('ko.txt', function(data) {
			var ps = data.split("\n");
			for(var i = 0; i < ps.length; i++) {
				var p = ps[i].trim();
				if(p != '') {
					_project.child('paragraphs').push().child('translations').push(new FBP('zh-tw', true, p));
				}
			}
		});
	}
	else {
		//var pID = '-JbQeyi3CgH0i9AFuD3D';
		//var _project = _fanba.child('projects/' + pID);
		var pID = _GET()['p'];
		var _project = _fanba.child('projects/' + pID);
	}

	if(_project) {
		var $text = $('#text');

		var langs = [];
		var _paragraphs = _project.child('paragraphs');

		var _translationDOM = function(lang) {
			var $dom = $('<div class="translation" lang="' + lang + '"timestamp="0"><p class="code id"></p><textarea class="full" placeholder="' + lang + '"></textarea></div>');
			$box = $dom.find('textarea').keypress(function(e) {
				var $that = $(this);
				var $t = $that.closest('.translation');
				var $p = $that.closest('.paragraph');
				var tID = $t.attr('id');
				var pID = $p.attr('id');

				var lang = $t.attr('lang');
				if(e.keyCode == 13) {
					var original = (tID === undefined ? false : $t.hasClass('original'));
					var text = $that.val().trim();
					_paragraphs.child(pID + '/translations').push(new FBP(lang, original, text)); // always push (revision)
	/*				if(tID === undefined)
						_paragraphs.child(pID + '/translations').push(new FBP(lang, false, text));
					else {
						_paragraphs.child(pID + '/translations/' + tID).update({text: text}); //PUSH ALWAYS
					}*/
					e.preventDefault();
				}
			}).focus(function(e) {
				console.log('focus');

				var $that = $(this);
				var $t = $that.closest('.translation');
				var $p = $that.closest('.paragraph');
				var tID = $t.attr('id');
				var pID = $p.attr('id');
				var lang = $t.attr('lang');

				if(tID === undefined)
					_paragraphs.child(pID + '/translations').push(new FBP(lang, false, null)).update({locked: true});
				else
					_paragraphs.child(pID + '/translations/' + tID).update({locked: true});
			}).blur(function(e) {
				console.log('blur');

				var $that = $(this);
				var $t = $that.closest('.translation');
				var $p = $that.closest('.paragraph');
				var tID = $t.attr('id');
				var pID = $p.attr('id');
				var lang = $t.attr('lang');

				if(tID === undefined)
					_paragraphs.child(pID + '/translations').push(new FBP(lang, false, null)).update({locked: false});
				else
					_paragraphs.child(pID + '/translations/' + tID).update({locked: false});
			});
			return $dom;
		};
		var _translationDOMUpdate = function($dom, id, o) {
			$dom.attr({
				id: id,
				lang: o.lang,
				timestamp: o.timestamp,
			})
				.toggleClass('original', o.original)
				.toggleClass('locked', o.locked);

			$dom.find('.id').html(id);
			$dom.find('textarea').val(o.text).trigger('input');
		}

	// PROJECT
		_project.on('child_added', function(s) {
			var key = s.key();
			var val = s.val();
			if(key == 'langs') {
				langs = val.split(',');
				console.log('j', 'child_added', langs);

	// PARAGRAPH
				_paragraphs.on('child_added', function(s) {
					console.log('p', 'child_added', s.key(), s.val());

					var pID = s.key();
					$p = $('<div class="paragraph" id="' + pID + '"><p class="code">' + pID + '</p></div>');
					for(var i = 0; i < langs.length; i++)
						$p.append(_translationDOM(langs[i]));
					$p.appendTo($text);
					$p.find('textarea').textareaAutoSize(); // https://github.com/javierjulio/textarea-autosize

	// TRANSLATION
					var _translations = _paragraphs.child(s.key() + '/translations');
					_translations.on('child_added', function(s) {
						console.log('t', 'child_added', s.key(), s.val());

						var pID = s.ref().parent().parent().key(); //TEMP
						var sID = s.key();
						var o = s.val();

						var $t = $('.paragraph#' + pID).find('.translation[lang="' + o.lang + '"]');
						_translationDOMUpdate($t, sID, o);
					});
					_translations.on('child_changed', function(s) {
						console.log('t', 'child_changed', s.key(), s.val());
						var sID = s.key();
						var o = s.val();
						$t = $('.translation#' + sID);
						_translationDOMUpdate($t, sID, o);
					})
				});
			}
		});
		_project.on('child_changed', function(s) {
			var key = s.key();
			var val = s.val();
			if(key == 'langs') {
				langs = val.split(',');
				console.log('j', 'child_changed', langs);
			}
		});
	} // end of valid pID
}); // end of load event

</script>
</html>