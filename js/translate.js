var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");
var _project = null;
var _langs = null;
/*
// http://stackoverflow.com/questions/11351689/detect-if-firebase-connection-is-lost-regained
_fanba.child('.info/connected').on('value', function(connectedSnap) {
	if (connectedSnap.val() === true) {
		alert('on!');
	}
	else {
		alert('off!');
	}
});*/

var makeLanguageHeaderUI = function(langs) {
	var $dom = $('<div class="row" id="header">');
	for(var i = 0; i < langs.length; i++)
		$dom.append('<div class="col centered language">' + _lang_names[langs[i]] + '</div>');
	return $dom;
};

// http://thiscouldbebetter.neocities.org/texteditor.html
function saveTextAsFile(text, lang) {
	var blob = new Blob([text], {type:'text/plain'});
	var anchor = document.createElement('a');
	anchor.download = lang + '@' + (new Date()).rightNow();
	anchor.innerHTML = "Download File";
/*	if (window.webkitURL != null) { // webkitURL is deprecated
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		anchor.href = window.webkitURL.createObjectURL(blob);
	}
	else {*/
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		anchor.href = window.URL.createObjectURL(blob);
		anchor.onclick = function(e) { document.body.removeChild(e.target); };
		anchor.style.position = 'absolute';
		anchor.style.display = 'none';
		document.body.appendChild(anchor);
//	}
	anchor.click();
};
var makeDownloadsUI = function(langs) {
	var $dom = $('<div class="row" id="downloads">');
	for(var i = 0; i < langs.length; i++) {
		$col = $('<div class="col centered"><button class="download" lang="' + langs[i] + '">' + _dict['downloads'][langs[i]] + '</button></div>');
		$col.find('button').click(function(e) {
			var lang = $(this).attr('lang');
			var text = '';
			$('.translation[lang="' + lang + '"]').each(function() {
				//console.log($(this));
				text += $(this).find('textarea').val().trim() + "\n\n";
			});
			text = text.trim();
			saveTextAsFile(text, lang);
		});
		$col.appendTo($dom);
	}
	return $dom;
}

var saveTranslation = function($textarea, options) {
	if(options.forceSave === undefined) options.forceSave = false;
	if(options.locked === undefined) options.locked = $textarea.hasClass('has-focus');
	
	var pID = $textarea.closest('.paragraph').data('id');
	var _translations = _project.child('paragraphs/' + pID + '/translations');
	
	var $t = $textarea.closest('.translation');
	var tID = $t.data('id');//attr('id');
	var lang = $t.data('lang');//attr('lang');
	
	var beforeText = $t.data('beforeText') ? $t.data('beforeText') : '';
	var afterText = $textarea.val().replace(/^\s+/g, '');//.trim();
	var lastSaved = $t.data('lastSaved') ? $t.data('lastSaved') : 0;
	var now = FBF.now();
	var dt = FBF.autoSave.interval - (now - lastSaved);
		
	if(options.forceSave || (afterText != beforeText && (!options.throttle || (options.throttle && dt < 0)))) {
		var revision = new FBP(lang, false, afterText, options.locked);
//		console.log(revision);
		_translations.push(revision, function(response) {
			$t.addClass('saved');
			setTimeout(function() {
				$t.removeClass('saved');
			}, 500);
		});
		
		$t.data({beforeText: afterText, lastSaved: revision.timestamp});
	}
	else if(options.throttle && dt > 0) {
		$t.data({timer: setTimeout(function() { saveTranslation($textarea, {throttle: false}); }, dt)});
	}
};

/*
event			save?			throttled?	locked?
===================================================
return			->blur
key/cut/paste	save on diff	true		true (on timer: locked when has-focus)
focus			save on diff	false		true
blur			save on diff	false		false
*/
var makeTranslationUI = function(pID, lang) {
	var _translations = _project.child('paragraphs/' + pID + '/translations');
	var $dom = $('<div class="col translation" lang="' + lang + '"><p class="code id" lang="en">⎵</p><textarea class="full" placeholder="' + _lang_names[lang] + '"></textarea></div>');
	$dom.data({lang: lang});
	$textarea = $dom
		.find('textarea')
		.on('keydown cut paste', function(e) { // 'keyup cut paste' instead of 'input': triggers excessive events at init
			var $textarea = $(this);
			var $t = $textarea.closest('.translation');
			clearTimeout($t.data('timer'));
			
			//console.log(e.type, e.keyCode);
			if(e.type == 'keydown' && e.keyCode == 13) {
				$textarea.blur();
				e.preventDefault();
			}
			else {
				saveTranslation($textarea, {throttle: true, locked: true});
			}
		}).focus(function(e) {
			var $textarea = $(this);
			var $t = $textarea.addClass('has-focus').closest('.translation');
			clearTimeout($t.data('timer'));
			
			var tID = $t.data('id');//attr('id');
			var lang = $t.data('lang');//attr('lang');
	
			if(tID) {
				//_translations.child(tID).update({locked: true});
				saveTranslation($textarea, {throttle: false, locked: true});
			}
			else {
				var text = $textarea.val().replace(/^\s+/g, '');//.trim();
				_translations.push(new FBP(lang, true, text, true));
			}
		}).blur(function(e) {
			var $textarea = $(this);
			var $t = $textarea.closest('.translation');
			clearTimeout($t.data('timer'));
			
			var tID = $t.data('id');//attr('id');
			var lang = $t.data('lang');//attr('lang');
	
			if(tID) {
				//_translations.child(tID).update({locked: false});
				saveTranslation($textarea, {forceSave: true, throttle: false, locked: false});
			}
			else {
				var text = $textarea.val().replace(/^\s+/g, '');//.trim();
				_translations.push(new FBP(lang, false, text, false));//.update({locked: false});
			}
			$textarea.removeClass('has-focus');
		});
	return $dom;
};
var makeParagraphUI = function(pID, langs) {
	$p = $('<div class="row paragraph" id="' + pID + '"><p class="code">' + pID + '</p><div class="cross"><rect></rect><rect></rect></div></div>');
	$p.data({id: pID});
	$p.find('.cross').click(function() {
		var $p = $(this).closest('.paragraph');
		var pID = $p.data('id');//attr('id');
		
		$p.find('.translation').each(function() {
			var tID = $(this).data('id');//attr('id');
			_project.child('paragraphs/' + pID + '/translations/' + tID).onDisconnect().cancel();
		});
		
		_project.child('paragraphs/' + pID).remove();
	})
	for(var i = 0; i < langs.length; i++)
		$p.append(makeTranslationUI(pID, langs[i]));
	
	return $p;
};
var updateTranslationUI = function($dom, k, v, pID) {
//	console.log($dom, k, v, pID);
	var k0 = $dom.data('id');//attr('id');
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
	$dom
		.toggleClass('original', v.original)
		.toggleClass('locked', v.locked)
		.attr('id', k)
		.data({ //attr
			id: k,
			lang: v.lang,
			timestamp: v.timestamp,
			beforeText: v.text,
			lastSaved: 0
		});
	
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
			var lang = 'zh';
			
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
			_paragraphs.once('value', function(s) {
				$text.append(makeDownloadsUI(_langs));
			})
		});
	} // end of a valid project
	
	$('button.create-paragraph').click(function() {
		_project.child('paragraphs').push().set({init: true});
	});
}); // end of load event