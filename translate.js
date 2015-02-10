var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");
var _project = null;
var _langs = null;

var makeTranslationDOM = function(pID, lang) {
	var _translations = _project.child('paragraphs/' + pID + '/translations');
	var $dom = $('<div class="translation" lang="' + lang + '" timestamp="0"><p class="code id">⎵</p><textarea class="full" placeholder="' + lang + '"></textarea></div>');
	$textarea = $dom.find('textarea').keypress(function(e) {
		var $that = $(this);
		var $t = $that.closest('.translation');
		var $p = $that.closest('.paragraph');
		var tID = $t.attr('id');
		var pID = $p.attr('id');

		var lang = $t.attr('lang');
		if(e.keyCode == 13) {
			var original = (tID ? false : $t.hasClass('original'));
			var text = $that.val().trim();
			_translations.push(new FBP(lang, original, text)).update({locked: true}); // always push (revision)
			
			var $translation = $that.closest('.translation').addClass('saved');
			setTimeout(function() {
				$translation.removeClass('saved');
			}, 1000);
			$that.blur();
			
			e.preventDefault();
		}
	}).focus(function(e) {
		//console.log('focus');

		var $that = $(this);
		var $t = $that.closest('.translation');
		var $p = $that.closest('.paragraph');
		var tID = $t.attr('id');
		var pID = $p.attr('id');
		var lang = $t.attr('lang');

		if(tID) {
			//console.log('update');
			_translations.child(tID).update({locked: true});
		}
		else {
			//console.log('push');
			_translations.push(new FBP(lang, false, null)).update({locked: true});
		}
			
	}).blur(function(e) {
		//console.log('blur');

		var $that = $(this);
		var $t = $that.closest('.translation');
		var $p = $that.closest('.paragraph');
		var tID = $t.attr('id');
		var pID = $p.attr('id');
		var lang = $t.attr('lang');

		if(tID) {
			//console.log('update');
			_translations.child(tID).update({locked: false});
		}
		else {
			//console.log('push');
			_translations.push(new FBP(lang, false, null)).update({locked: false});
		}
	});
	return $dom;
};
var makeParagraphDOM = function(pID, langs) {
	$p = $('<div class="paragraph" id="' + pID + '"><p class="code">' + pID + '</p></div>');
	
	for(var i = 0; i < langs.length; i++)
		$p.append(makeTranslationDOM(pID, langs[i]));
	$p.find('textarea').textareaAutoSize(); // https://github.com/javierjulio/textarea-autosize
	
	return $p;
};
var updateTranslationDOM = function($dom, k, v) {
	$dom.attr({
			id: k,
			lang: v.lang,
			timestamp: v.timestamp,
		})
		.toggleClass('original', v.original)
		.toggleClass('locked', v.locked);
	
	$dom.find('.id').text(k);
	$dom.find('textarea').val(v.text).trigger('input');
};

window.addEventListener('load', function() {
	var $text = $('#text');
	
	// reset?
	if(_reset) {
		_fanba.child('projects').remove();

		// initiate sample project
		$.get('ko.txt', function(text) {
			var title = '柯';
			var description = '柯柯柯';
			var lang = 'zh-tw';
			
			_project = createProject(title, description, text, lang);
		});
	}
	else {
		_project = _fanba.child('projects/' + _GET()['p']);
	}
	
	if(_project) {
		_project.once('value', function(s) {
			var projectID = s.key();
			var projectContent = s.val();
			_langs = projectContent.langs.split(',');
			
			// update title (temporary)
			document.title = projectID + '・' + document.title;
			
			var _paragraphs = _project.child('paragraphs');
			_paragraphs.on('child_added', function(s) {
				var pID = s.key();
				var pContent = s.val();
				var $p = makeParagraphDOM(pID, _langs).appendTo($text);
				
				var _translations = s.ref().child('translations')
				_translations.on('child_added', function(s) {
					var tID = s.key();
					var tContent = s.val();
					
					var $t = $('.paragraph#' + pID).find('.translation[lang="' + tContent.lang + '"]');
					updateTranslationDOM($t, tID, tContent);
				});
				_translations.on('child_changed', function(s) {
					var tID = s.key();
					var tContent = s.val();
					
					$t = $('.translation#' + tID);
					updateTranslationDOM($t, tID, tContent);
				})
			});
			_paragraphs.on('child_changed', function(s) {});
		});
	} // end of a valid project
}); // end of load event
