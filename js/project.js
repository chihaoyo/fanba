var createProject = function(title, description, text, lang) {
	var _project = null;
	if(title && text) {
		var langs = [lang, 'en', 'jp'].join(',');
		if(lang != 'zh') {
			langs = [lang, 'zh'].join(',');
		}
		var ps = text.split("\n");
				
		_project = _fanba.child('projects').push({langs: langs});
		if(_project) {
			var _title = _project.child('paragraphs').push();
			var _description = _project.child('paragraphs').push();
			
			_title.child('translations').push(new FBP(lang, true, title));
			_description.child('translations').push(new FBP(lang, true, description));
			_project.update({title: _title.key(), description: _description.key()});
			
			if(ps && ps.constructor === Array) {
				for(var i = 0; i < ps.length; i++) {
					var p = ps[i].trim();
					if(p) {
						_project.child('paragraphs').push().child('translations').push(new FBP(lang, true, p));
					}
				}
			}
		}
	}
	return (_project ? _project.key() : null);
};

var _reset = false;
var _fanba = new Firebase("https://fanba.firebaseio.com");

$("[name='submit']").click(function() {
	var title = $("[name='title']").val();
	var description = $("[name='description']").val();
	var text = $("[name='text']").val();
	var lang = $("[name='lang']").val();
	
	var pID = createProject(title, description, text, lang);
	if(pID) {
		window.location = 'http://chihaoyo.net/fanba/translate.php?p=' + pID;
	}
	return false;
});