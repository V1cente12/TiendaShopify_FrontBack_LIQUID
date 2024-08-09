window.theme = theme || {};
theme.newsletterPopup = (function() {
  function newsletterPopup(container) {
    var $container = $(container);
    var display = getCookie("kt_popupNewsletter");
    var delay = $container.attr('data-pause');
    var backdrop = $container.data('backdrop') || true;
    var mobileDisplay = $container.data('mobile-display');
    var dataScrollNewsletterPopup = parseInt($container.attr('data-scroll'));
    var scroll = function() {
      display = getCookie("kt_popupNewsletter");
      if($(window).scrollTop() < dataScrollNewsletterPopup && dataScrollNewsletterPopup != 0 || display === 'disable') {
        return false
      }
      if (mobileDisplay && theme.window_W < 768) {
        return false;
      }
      if($(container).find('p.form--success').length <= 0) {
        $container.on('change', '#hideforever', function() {
          if ($(this).is(':checked')) {
            document.cookie = "kt_popupNewsletter=disable;1;path=/";
          } else {
            document.cookie = "kt_popupNewsletter=;path=/";
          }
        });
        $container.on('click', '.close', function() {
          if ($(container).find('#hideforever').is(':checked') === false) {
            setCookie("kt_popupNewsletter",'disable',1,1,10);
          }
        });
        if (display != "disable") {
          if( dataScrollNewsletterPopup == 0 ) {
            setTimeout(function() {
              $container.modal({
                backdrop: backdrop
              });
            }, delay);
          } else {
            $container.modal({
              backdrop: backdrop
            });
          }
        }
      }
    }
    if( dataScrollNewsletterPopup == 0) {
      scroll();
    } else {
      $(window).scroll($.throttle( 150, scroll));
    }
    $('#newsletterModal').on('hide.bs.modal', function () {
      if ($(container).find('#hideforever').is(':checked') === false) {
        setCookie("kt_popupNewsletter",'disable',1,1,10);
      }
    });
    if(window.location.search.indexOf('?customer_posted') >= 0) {      
      $container.modal({
        backdrop: backdrop
      });
    }
  }
  return newsletterPopup;
})();
theme.newsletterPopup.prototype = _.assignIn({}, theme.newsletterPopup.prototype, {
  onSelect: function(evt) {
    $container.modal('show');
    document.cookie = "kt_popupNewsletter=;path=/";
  }
});
var sections = new theme.Sections();
sections.register('kt-newsletter-modal', theme.newsletterPopup);