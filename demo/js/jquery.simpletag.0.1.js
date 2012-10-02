/*
 * jQuery simpletag v0.1 (https://github.com/petalyaa/simpletag)
 *
 * Copyright (c) 2012 Khairul Ikhwan
 * https://github.com/petalyaa
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: 
*/
(function($){
	
	var currentZIndex = 100;
 
    $.fn.extend({ 
         
        //pass the options variable to the function
        simpletag : function(options) {
 
        	var thisPhoto = $(this);
 
            var defaults = {
                title : "Untitled", // Required
                borderCss : '2px #6E6E6E solid', // Optional
                borderRadius : '5px', // Optional
                timeoutDelay : 1000, // Optional
                onSelectionComplete : function(obj){} // Optional
            };

            var o =  $.extend(defaults, options);
 
            function doImageSelect(){
            	$(thisPhoto).imgAreaSelect({
                    handles: true,
                    onSelectEnd: onSelectEnd
                });
            }
            
            function addOverlayDiv(selection){
            	currentZIndex++;
            	var div = document.createElement('div'); // Div that will permanently shown but invisible
            	var anotherDiv = document.createElement('div'); // Div that contain border, title, etc only shown first time and upon hover
            	div = addStyle(div, selection, currentZIndex);
            	anotherDiv = addStyle(anotherDiv, selection, currentZIndex, true);
            	$(anotherDiv).append(o.title);
            	$('body').append(div);
            	$('body').append(anotherDiv);
            	hideIt($(anotherDiv), o.timeoutDelay);
            	$(div).hover(function(){
            		if(!$(anotherDiv).is(":visible")){
            			showIt($(anotherDiv), o.timeoutDelay);
            		}
            	});
            }
            
            function addStyle(div, selection, zIndex, border){
            	$(div).css('position', 'absolute'); //make it absolute to the parent
            	$(div).css('left', selection.x1); // Set left base on coordinate
            	$(div).css('top', selection.y1); // set top base on coordinate
            	$(div).css('width', selection.width);
            	$(div).css('z-index', zIndex);
            	$(div).css('height', selection.height);
            	if(border){
            		$(div).css('border', o.borderCss);
                	$(div).css('border-radius', o.borderRadius);
                	$(div).css('-moz-border-radius', o.borderRadius);
            	}
            	return $(div);
            }
            
            function showIt(element, timeout){
            	$(element).fadeIn(500);
            	hideIt(element, timeout);
            }
            
            function hideIt(element, timeout){
            	if(typeof timeout == 'undefined'){
            		$(element).fadeOut(500);
            	} else {
            		setTimeout(function(){
            			$(element).fadeOut(500);
            		}, timeout);
            		 
            	}
            }
            
            function onSelectEnd(img, selection){
				// Remove imgAreaSelect plugins
				$(thisPhoto).imgAreaSelect({hide:true,fadeSpeed:200, disable : true});
				
				// Write overlay div on top of the selection, apply z-index to it
				addOverlayDiv(selection);
				
				// Finally, we call the provided callback from user with selection as parameter passed as per below :
				// selection : {x1 : 0, y1 : 0, x2 : 0, y2 : 0, width : 0, height : 0}
				o.onSelectionComplete(selection); 
            }
            
            return this.each(function() {
                 
                doImageSelect();
                
            });
        }
    });
     
})(jQuery);