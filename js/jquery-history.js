/**
* jQuery History
*
* @author: Ivan Cvetomirov Ivanov
* @License: MIT
* @version: 1.0.1
**/

//jQuery-browser
(function($) {
    var ua = navigator.userAgent.toLowerCase(),
        match,
        browsers = [
            /(chrome)[ \/]([\w.]+)/,
            /(safari)[ \/]([\w.]+)/,
            /(opera)(?:.*version)?[ \/]([\w.]+)/,
            /(msie) ([\w.]+)/,
            /(mozilla)(?:.*? rv:([\w.]+))?/
        ],
        i = browsers.length;
    $.browser = {} || 0;
    while ( i-- ) {
        if ( (match = browsers[i].exec( ua )) && match[1] ) {
            $.browser[ match[1] ] = true;
            $.browser.version = match[2] || "0";
            break;
        }
    }
})( window.jQuery || window );

//jQuery-platform
(function($) {
    var ua = navigator.userAgent.toLowerCase(),
        match,
        platform = [
            /(ip\w+).*?os ([\w_]+)/,
            /(android)[ \/]([\w.]+)/,
            /(blackberry)(?:\d*?\/|.*?version\/)([\w.]+)/,
            /(windows phone)( os)? ([\w.]+)/,
            /(symbian)(?:os\/([\w.]+))?/
        ],
        i = platform.length;

    $.platform = {} || 0;
    while ( i-- ) {
        if ( (match = platform[i].exec( ua )) && match[1] ) {
            $.platform[ match[1].replace(" p", "P") ] = true;
            $.platform.version = match[2].split("_").join(".") || "0";
            break;
        }
    }
})( window.jQuery || window );
 
(function($) {
	function History() {
		this._curHash = '';
		this._callback = function(hash){};
	};

	$.extend(History.prototype, {
		init: function(callback) {
			this._callback = callback;
			this._curHash = location.hash;

			if($.browser.msie) {			
				if (this._curHash == '') {
					this._curHash = '#';
				}
		
				$("body").prepend('<iframe id="jQuery_history" style="display: none;"></iframe>');
				var iframe = $("#jQuery_history")[0].contentWindow.document;
				iframe.open();
				iframe.close();
				iframe.location.hash = this._curHash;
			} else if ($.browser.safari) {			
				this._historyBackStack = [];
				this._historyBackStack.length = history.length;
				this._historyForwardStack = [];
				this._isFirst = true;
				this._dontCheck = false;
			}
			
			this._callback(this._curHash.replace(/^#/, ''));
			setInterval(this._check, 100);
		},
		add: function(hash) {		
			this._historyBackStack.push(hash);		
			this._historyForwardStack.length = 0; 
			this._isFirst = true;
		},	
		_check: function() {
			if($.browser.msie) {			
				var ihistory = $("#jQuery_history")[0];
				var iframe = ihistory.contentDocument || ihistory.contentWindow.document;
				var current_hash = iframe.location.hash;
				
				if(current_hash != $.history._curHash) {			
					location.hash = current_hash;
					$.history._curHash = current_hash;
					$.history._callback(current_hash.replace(/^#/, ''));
				}
			} else if ($.browser.safari) {
				if (!$.history._dontCheck) {
				
					var historyDelta = history.length - $.history._historyBackStack.length;				
				
					if (historyDelta) { 
						$.history._isFirst = false;
						if (historyDelta < 0) {
							for (var i = 0; i < Math.abs(historyDelta); i++) $.history._historyForwardStack.unshift($.history._historyBackStack.pop());
						} else { 
							for (var i = 0; i < historyDelta; i++) $.history._historyBackStack.push($.history._historyForwardStack.shift());
						}
					var cachedHash = $.history._historyBackStack[$.history._historyBackStack.length - 1];
					if (cachedHash != undefined) {
						$.history._curHash = location.hash;
						$.history._callback(cachedHash);
					}
				} else if ($.history._historyBackStack[$.history._historyBackStack.length - 1] == undefined && !$.history._isFirst){					
					if (document.URL.indexOf('#') >= 0) {
						$.history._callback(document.URL.split('#')[1]);
					} else {
						$.history._callback('');
					}
					$.history._isFirst = true;
				}
			}
		} else {			
			var current_hash = location.hash;
			if(current_hash != $.history._curHash) {
				$.history._curHash = current_hash;
				$.history._callback(current_hash.replace(/^#/, ''));
			}
		}
	},
	load: function(hash) {
		var newhash;
		
		if ($.browser.safari) {
			newhash = hash;
		} else {
			newhash = '#' + hash;
			location.hash = newhash;
		}
		this._curHash = newhash;
		
		if ($.browser.msie) {
			var ihistory = $("#jQuery_history")[0]; 
			var iframe = ihistory.contentWindow.document;
			iframe.open();
			iframe.close();
			iframe.location.hash = newhash;
			this._callback(hash);
		}
		else if ($.browser.safari) {
			this._dontCheck = true;			
			this.add(hash);			
			var fn = function() {$.history._dontCheck = false;};
			window.setTimeout(fn, 200);
			this._callback(hash);			
			location.hash = newhash;
		}
		else {
		  this._callback(hash);
		}
	}
});

$(document).ready(function() {
	$.history = new History(); 
});
})(jQuery);