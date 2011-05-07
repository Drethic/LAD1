// jTask Plugin for jQuery 1.5, Yotam Bar-On, 2011
// Released under the MIT license:
// http://www.opensource.org/licenses/mit-license.php
// Version 0.1 (14-Feb-2011)
// Modified by: Michael Flowers, 2011

jQuery.fn.jTaskBar = function (prop) {
	// Some default variables:
	$wrapper = $(this);
        $cwrapper = $("#center");
	// Set default properties:
	if (!prop.winClass) {prop.winClass = '.window'}
	if (!prop.attach) {prop.attach = 'bottom'}
	if (!prop.autoHide) {prop.autoHide = false}
	// Set attachment class:
	var jTaskBarClass;
	if (prop.attach == 'top') {jTaskBarClass = 'jTaskBar-Top'}
	else if (prop.attach == 'bottom') {jTaskBarClass = 'jTaskBar-Bottom'}
	else {jTaskBarClass = 'jTaskBar-Bottom'}
	// Append the jTaskBar to the wrapper element.
	$wrapper.append('<div id="jTaskBar" class="'+jTaskBarClass+'"></div>');
	$jTaskBar = $wrapper.find('#jTaskBar');
	// Populate the jTaskBar:
        /*
	$cwrapper.children(prop.winClass).each( function() {
		var _title = $(this).attr('id').replace('_', ' ');
		$jTaskBar.append('<div id="'+$(this).attr('id')+'" class="jTask"><span>'+_title+'</span></div>');		
	});
        */
	// If 'autoHide' is true, then the jTaskBar will start hidden:
	if (prop.autoHide) {
		$jTaskBar.hide();
		// Create a hidden div that has a fixed size. Whenever the cursor enters that div, the jTaskBar appears. Whenever it leaves the jTaskBar, it disappears.
		$wrapper.append('<div id="autoHide-div"></div>');
		$autoHide = $wrapper.find('#autoHide-div');
		$autoHide.css('width', $jTaskBar.width());
		$autoHide.css('min-height', $jTaskBar.height());
		$autoHide.css('z-index', $jTaskBar.css('z-index')-1);
		if (prop.attach == 'bottom') {
			$autoHide.addClass('jTaskBar-Bottom');
		} else if (prop.attach == 'top') {
			$autoHide.addClass('jTaskBar-Top');
		}
		$autoHide.css('background-color', 'transparent');
		// Every time the mouse enters the autoHide-div, the jTaskBar appears.
		$autoHide.mouseenter( function(e) {
			$jTaskBar.fadeIn('600');
		});
		// Every time the mouse leaves the jTaskBar, it disappears.
		$jTaskBar.mouseleave( function(e) {
			$jTaskBar.fadeOut('600');
		});
	}
	// Give all '.winClass' elements the z-index attribute in order to create the illusion of depth.
	$cwrapper.children(prop.winClass).css("z-index", "10000");
	// When a 'window' is clicked: 1. bring it to front. 2. mark its jTask as 'current'
	$cwrapper.children(prop.winClass).mousedown(function() {
		$cwrapper.children(prop.winClass).css("z-index", "10000");
		$jTaskBar.children('.jTask').removeClass('jTask-current');
		$(this).css("z-index", "10001");
		$jTaskBar.children('.jTask#'+$(this).attr("id")).addClass('jTask-current');
	});
        /*
	$(document).mousemove( function() {
		// Check which 'windows' are open (visible) and set their class accordingly:
		$jTaskBar.find('.jTask').each( function() {
			$this = $cwrapper.find('.'+prop.winClass+'#'+$(this).attr('id'));
			if ($this.css('display') == "none") {
				$jTaskBar.find('.jTask#'+$(this).attr('id')).addClass('jTask-hidden');
				$jTaskBar.find('.jTask#'+$(this).attr('id')).removeClass('jTask-current');
			} else {
				$jTaskBar.find('.jTask#'+$(this).attr('id')).removeClass('jTask-hidden');
			}
		});
		// Check which jTasks has been closed, and remove those jTasks from the jTaskBar:
		$jTaskBar.children('.jTask').each( function() {
			$win = $cwrapper.children('#'+$(this).attr('id')); // The 'window' that corresponds with this jTask
			var _class = prop.winClass.replace('.', '');
			if (!$win.hasClass(_class)) {
				$(this).remove();
			}
		});
		// Check if there are windows with winClass but with no corresponding jTask:
		$cwrapper.children(prop.winClass).each( function() {
			$cwrapper.children(prop.winClass).each( function() {
				if (!$jTaskBar.find('.jTask#'+$(this).attr('id')).length) { // If there is no jTask that fits this window, add a new jTask to jTaskBar:
					var _title = $(this).attr('id').replace('_', ' ');
					$jTaskBar.append('<div id="'+$(this).attr('id')+'" class="jTask"><span>'+_title+'</span></div>');
				}
			});
		});
	});
        */
	// Trigger the 'mousemove' event handler when clicking on the document.
	$(document).click( function() {
		$('body').trigger('mousemove');
	});
	// Add click events for the jTasks:
	$jTaskBar.find('.jTask').live('mousedown', function() {
		$(this).addClass('jTask-click');
	});
	$jTaskBar.find('.jTask').live('mouseup', function() {
		$(this).removeClass('jTask-click');
		$win = $cwrapper.children('#'+$(this).attr('id')+prop.winClass); // The 'window' that corresponds with this jTask
		if ($win.css('display') == 'none') {
                    $(this).addClass('jTask-current'); // Set this task to be 'current'
                    $win.fadeIn('fast').queue(function(){
                        $(this).updatejTaskBar();
                        $(this).dequeue();
                    }); // If this task is minimized, then expand it.
                    $win.trigger('mousedown');
		} else if ($(this).hasClass('jTask-current')) {
                    $(this).removeClass('jTask-current'); // This task cannot be 'current' since it is now minimized.
                    $win.fadeOut('fast').queue(function(){
                        $(this).updatejTaskBar();
                        $(this).dequeue();
                    }); // Minimize task.
		} else {
                    $win.trigger('mousedown'); // If this jTask is neither 'current' nor 'shown', than it must be visible in the background. In this case, clicking on the jTask is just as clicking on the window itself.
		}
	});
};

jQuery.fn.updatejTaskBar = function() {
    $wrapper = $(this);
    $cwrapper = $("#center");
    $jTaskBar.find('.jTask').each( function() {
        $this = $cwrapper.find('.popup#'+$(this).attr('id'));
        if ($this.css('display') == "none") {
            $jTaskBar.find('.jTask#'+$(this).attr('id')).addClass('jTask-hidden');
            $jTaskBar.find('.jTask#'+$(this).attr('id')).removeClass('jTask-current');
        } else {
            $jTaskBar.find('.jTask#'+$(this).attr('id')).removeClass('jTask-hidden');
        }
    });
    // Check which jTasks has been closed, and remove those jTasks from the jTaskBar:
    $jTaskBar.children('.jTask').each( function() {
        $win = $cwrapper.children('#'+$(this).attr('id')); // The 'window' that corresponds with this jTask
        if (!$win.hasClass('popup')) {
            $(this).remove();
        }
    });
    // Check if there are windows with winClass but with no corresponding jTask:
    $cwrapper.children('.popup').each( function() {
        var popups = $cwrapper.children('.popup');
        popups.each( function() {
            if (!$jTaskBar.find('.jTask#'+$(this).attr('id')).length) { // If there is no jTask that fits this window, add a new jTask to jTaskBar:
                var _title = $(this).attr('id').replace('_', ' ');
                $jTaskBar.append('<div id="'+$(this).attr('id')+'" class="jTask"><span>'+_title+'</span></div>');
                if( popups.length == 1 )
                {
                    $jTaskBar.find( '.jTask#' + $(this).attr('id') ).addClass( "jTask-current" );
                }
            }
        });
    });
};