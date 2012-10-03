/*
 * jQuery simpletag v0.1 (https://petalyaa.github.com/simpletag)
 *
 * Copyright (c) 2012 Khairul Ikhwan
 * https://github.com/petalyaa
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision (Changelog : https://github.com/petalyaa/simpletag): 
 * 0.1 (20121002)
 * 0.2 (20121003)
 */
(function($) {

	var o = null;
	var currentZIndex = 0;
	var useImpromptu = false;
	var impromptuHtml = "Name :<br /><input type='text' id='simpletag-impromptu-name' name='myname' value='' />";
	var impromptuSelector = null;
	var thisPhoto = null;

	$.fn.extend({
		simpletag : function(options, arg) {
			thisPhoto = this;
			if (options && typeof (options) == 'object') {
				options = $.extend({}, $.simpletag.defaults, options);
				o = options;
				currentZIndex = o.initialZIndex;
				if (typeof o.impromptu != 'undefined') {
					if (typeof o.impromptu.enable != 'undefined')
						useImpromptu = o.impromptu.enable;
					if (typeof o.impromptu.html != 'undefined')
						impromptuHtml = o.impromptu.html;
					if (typeof o.impromptu.selector != 'undefined')
						impromptuSelector = o.impromptu.selector;
				}
			}
			this.each(function() {
				new $.simpletag(this, options, arg);
			});
			return;
		}
	});

	$.simpletag = function(elem, options, arg) {
		if (options && typeof (options) == 'string') {
			if (options == 'add') {
				addTag(arg);
			}
			return;
		}
		
		if(o==null)	o = $.extend({}, $.simpletag.defaults); // Fix if init without any argument ('o' is null)

		// During init, we load existing tag
		if(o.existingList != null && o.existingList.length > 0){
			$(o.existingList).each(function(x, y) {
				var tag = y;
				if (typeof y != 'undefined')
					addOverlayDiv(tag.label, y);
			});
		}
		
		var tempLabel = null;
		function addTag(arg) {
			tempLabel = arg;
			$(elem).imgAreaSelect({
				handles : true,
				onSelectEnd : onSelectEnd
			});
		}

		// What to do after selection end
		function onSelectEnd(img, selection) {
			// Hide imgAreaSelect plugins
			if (useImpromptu) {
				var text = impromptuHtml;
				// Override text value to use html from the selector (Priority if selector is specified)
				if (impromptuSelector != null) {
					text = $(impromptuSelector).html();
				}
				$.prompt(text,
						{
							opacity : 0.2,
							callback : function(){
								$(elem).imgAreaSelect({hide : true, fadeSpeed : 200, disable : true});
							},
							submit : function(e, v, m, f) {
								// 'f' is the key value of all input in your form {input1 : 'khairul', input2 : 'male'}
								// For more details : http://trentrichardson.com/Impromptu/
								var callbackResult = o.impromptu.callback(
										selection, f);
								if (!callbackResult)
									return false;
								addOverlayDiv(callbackResult, selection);
								return true;
							}
						});
			} else {
				// Finally, we call the provided callback from user with selection as parameter. 
				// selection : {x1 : 0, y1 : 0, x2 : 0, y2 : 0, width : 0, height : 0}
				var thisLabel = o.onSelectionComplete(selection);
				if(typeof tempLabel != 'undefined')
					thisLabel = tempLabel;
				$(elem).imgAreaSelect({hide : true, fadeSpeed : 200, disable : true});
				// Write overlay div on top of the selection
				addOverlayDiv(thisLabel, selection);
			}
		}

		// Add new overlay div
		function addOverlayDiv(label, selection) {
			currentZIndex++;
			// Div that will permanently shown but invisible
			var div = document.createElement('div');
			// Div that contain border, title, etc only shown first time and upon hover
			var anotherDiv = document.createElement('div');
			div = addStyle(div, selection, currentZIndex);
			anotherDiv = addStyle(anotherDiv, selection, currentZIndex, true);
			$(anotherDiv).append(label);
			$('body').append(div);
			$('body').append(anotherDiv);
			if (o.autoHide)
				hideIt($(anotherDiv), o.timeoutDelay);
			$(div).hover(function() {
				if (!$(anotherDiv).is(":visible")) {
					showIt($(anotherDiv), o.timeoutDelay);
				}
			});
		}

		// Apply style to the overlay box
		function addStyle(div, selection, zIndex, border) {
			var position = thisPhoto.position();
			var topPosition = position.top;
			var leftPosition = position.left;
			$(div).css('position', 'absolute');
			$(div).css('left', (selection.x1 + leftPosition));
			$(div).css('top', (selection.y1 + topPosition));
			$(div).css('width', selection.width);
			$(div).css('height', selection.height);
			$(div).css('z-index', zIndex);
			$(div).css('font-family', 'Arial');
			$(div).css('padding', '5px 0px 0px 5px');
			if (border) {
				$(div).css('border', o.borderCss);
				$(div).css('border-radius', o.borderRadius);
				$(div).css('-moz-border-radius', o.borderRadius);
				$(div).css('-moz-box-shadow', '0 0 5px #888');
				$(div).css('-webkit-box-shadow', '0 0 5px#888');
				$(div).css('box-shadow', '0 0 5px #888');
			}
			return $(div);
		}

		// Show overlay element
		function showIt(element, timeout) {
			$(element).fadeIn(500);
			hideIt(element, timeout);
		}

		// Hide overlay element
		function hideIt(element, timeout) {
			if (typeof timeout == 'undefined') {
				$(element).fadeOut(500);
			} else {
				setTimeout(function() {
					$(element).fadeOut(500);
				}, timeout);
			}
		}
	};

	$.simpletag.defaults = {
		onSelectionComplete : function() {}, // Optional : If this method return string, then the string value will be use as overlay label
		initialZIndex : 100, // Optional
		existingList : [], // Optional
		borderCss : '2px #6E6E6E solid', // Optional
		borderRadius : '5px', // Optional
		autoHide : false, // Optional
		timeoutDelay : 1000, // Optional (Only use if autoHide is true)
		impromptu : { // Optional
			enable : false,
			html : "Name :<br /><input type='text' id='simpletag-impromptu-name' name='myname' value='' />",
			selector : null,
			callback : function() {}
		}
	};

})(jQuery);