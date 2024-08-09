(function( $ ){
	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.parallax = function(startPos, speedFactor, outerHeight) {
		var $this = $(this);
		var getHeight;
		var firstTop;
		var paddingTop = 0;
		
		//get the starting position of each element to have parallax applied to it		
		$this.each(function(){
		  firstTop = $this.offset().top;
		});

		if (outerHeight) {
			getHeight = function(jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function(jqo) {
				return jqo.height();
			};
		}
			
		// setup defaults if arguments aren't specified
		if (arguments.length < 1 || startPos === null) startPos = 0;
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;
		
		// function to be called whenever the window is scrolled or resized
		function update(){
			var pos = $window.scrollTop();
			$this.each(function(){
			  firstTop = $this.offset().top;
				var $element = $(this);
				var top = $element.offset().top;
				var height = getHeight($element);
				var parentTop = $element.parent().offset().top;
				var parentHeight = getHeight($element.parent());

				// Check if totally above or totally below viewport
				if (parentTop + parentHeight < pos || parentTop > pos + windowHeight) {
					return;
				}
		  	var move = Math.round((firstTop - pos) * speedFactor);
		  	move = -startPos + (move / height)* -100;
	      anime({targets: $element[0], duration: 100, easing: 'linear', translateY: move+'%', marginLeft: '50%', translateX: '-50%', translateZ: 0});
	    });
		}		

		$window.on('scroll', function(){$.debounce( 100, function(){update()})()}).on('resize', update);
		update();
	};
	$.fn.mouseMove = function(area_mouse) {
		var $this = $(this);
		var lFollowX = 0,
    lFollowY = 0,
    x = 0,
    y = 0;
    function moveBackground(elem) {
			var height = elem.height();
			var height_extra = elem.children().height() * 1.1;
			var ratio_height = (height_extra - elem.children().height()) / height;
			var width = elem.width();
			var width_extra = elem.children().width() * 1.1;
			var ratio_width = (width_extra - elem.children().width()) / width;
      x += (lFollowX - x);
      y += (lFollowY - y);
	    anime({targets: elem.children()[0], duration: Math.abs(x * ratio_width), easing: 'linear', translateX: x * ratio_width, translateY: y * ratio_height, translateZ: 0, scale: 1.1});
    }
		$this.each(function(){
			var $mover_container = $this.parent();
	    area_mouse.on('mousemove click', function(evt) {
	      var offset = $mover_container.offset();
	      var lMouseX = $mover_container.width() / 2 - ((evt.pageX - offset.left));
	      var lMouseY = $mover_container.height() / 2 - ((evt.pageY - offset.top));
	      lFollowX = lMouseX;
	      lFollowY = lMouseY;
	      $.debounce( 100, function(){moveBackground($mover_container)})();
	    });
		});
	}
})(jQuery);