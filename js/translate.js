var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");
var _project = null;
var _langs = null;
/*
_fanba.child('.info/connected').on('value', function(connectedSnap) {
	if (connectedSnap.val() === true) {
		alert('on!');
	}
	else {
		alert('off!');
	}
});*/

var makeLanguageHeaderUI = function(langs) {
	var $dom = $('<div id="header">');
	for(var i = 0; i < langs.length; i++)
		$dom.append('<div class="language">' + _lang_names[langs[i]] + '</div>');
	return $dom;
};

var makeTranslationUI = function(pID, lang) {
	var _translations = _project.child('paragraphs/' + pID + '/translations');
	var $dom = $('<div class="translation" lang="' + lang + '" timestamp="0"><p class="code id">⎵</p><textarea class="full" placeholder="' + _lang_names[lang] + '"></textarea></div>');
	$textarea = $dom.find('textarea').keypress(function(e) {
		if(e.keyCode == 13) {
			var $that = $(this);
			var $t = $that.closest('.translation').addClass('saved');
			var tID = $t.attr('id');
			var lang = $t.attr('lang');
			var text = $that.val().trim();
			
			_translations.push(new FBP(lang, false, text)) // always push (revision)
				.update({locked: true}, function(response) {
					$t.addClass('saved');
					setTimeout(function() {
						$t.removeClass('saved');
					}, 1000);
					$that.blur();
				});

			e.preventDefault();
		}
	}).focus(function(e) {
		var $t = $(this).addClass('has-focus').closest('.translation');
		var tID = $t.attr('id');
		var lang = $t.attr('lang');

		if(tID) {
			_translations.child(tID).update({locked: true});
		}
		else {
			_translations.push(new FBP(lang, true, null)).update({locked: true});
		}
	}).blur(function(e) {
		var $t = $(this).addClass('has-focus').closest('.translation');
		var tID = $t.attr('id');
		var lang = $t.attr('lang');

		if(tID) {
			_translations.child(tID).update({locked: false});
		}
		else {
			_translations.push(new FBP(lang, false, null)).update({locked: false});
		}
	});
	return $dom;
};
var makeParagraphUI = function(pID, langs) {
	$p = $('<div class="paragraph" id="' + pID + '"><p class="code">' + pID + '</p><div class="cross"><rect></rect><rect></rect></div></div>');
	$p.find('.cross').click(function() {
		var $p = $(this).closest('.paragraph');
		var pID = $p.attr('id');
		
		$p.find('.translation').each(function() {
			var tID = $(this).attr('id');
			_project.child('paragraphs/' + pID + '/translations/' + tID).onDisconnect().cancel();
		});
		
		_project.child('paragraphs/' + pID).remove();
	})
	for(var i = 0; i < langs.length; i++)
		$p.append(makeTranslationUI(pID, langs[i]));
	
	return $p;
};
var updateTranslationUI = function($dom, k, v, pID) {
	var k0 = $dom.attr('id');
	if(k0 !== k) {
		if(k0 !== undefined) {
			// cancel connectivity monitor on translation k0
			_project.child('paragraphs/' + pID + '/translations/' + k0).onDisconnect().cancel();
		}
		if(k !== undefined) {
			// activate connectivity monitor on translation k
			_project.child('paragraphs/' + pID + '/translations/' + k).onDisconnect().update({locked: false});
		}
	}
	$dom.attr({
			id: k,
			lang: v.lang,
			timestamp: v.timestamp,
		})
		.toggleClass('original', v.original)
		.toggleClass('locked', v.locked);
	
	$dom.find('textarea')
		.prop('disabled', function() { return v.locked && !$(this).hasClass('has-focus'); })
		.val(v.text).trigger('input');
	$dom.find('.id').text(k);
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
			// make language header
			$text.before(makeLanguageHeaderUI(_langs));
			
			var _paragraphs = _project.child('paragraphs');
			_paragraphs.on('child_added', function(s) {
				var pID = s.key();
				var pContent = s.val();
				var $p = makeParagraphUI(pID, _langs).appendTo($text);
				$p.find('textarea').textareaAutoSize(); // https://github.com/javierjulio/textarea-autosize
				
				var _translations = s.ref().child('translations')
				_translations.on('child_added', function(s) {
					var tID = s.key();
					var tContent = s.val();
					
					var $t = $('.paragraph#' + pID).find('.translation[lang="' + tContent.lang + '"]');
					updateTranslationUI($t, tID, tContent, pID);
				});
				_translations.on('child_changed', function(s) {
					var tID = s.key();
					var tContent = s.val();
					
					$t = $('.translation#' + tID);
					updateTranslationUI($t, tID, tContent, pID);
				})
			});
			_paragraphs.on('child_changed', function(s) {});
			_paragraphs.on('child_removed', function(s) {
				var pID = s.key();
				$('.paragraph#' + pID).remove();
			});
		});
	} // end of a valid project
	
	$('button.create-paragraph').click(function() {
		_project.child('paragraphs').push().set({init: true});
	});
}); // end of load event