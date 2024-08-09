/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');
    constructor = constructor || this.constructors[type];
    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) { 
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow 
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    var self = this;
    var type_ = type;
    $('[data-section-type=' + type + ']:not(.sc-registered)').each(
      function(index, container) {
        $(container).addClass('sc-registered');
        if (type == 'product' && _.isUndefined(constructor)) {
          $.getScriptCached(theme.extensions.ktjs_product_sg, function() {
            self.constructors[type_] = theme.Product;
            self._createInstance(container, theme.Product);
          });
        }
        else {
          this.constructors[type] = constructor;
          this._createInstance(container, constructor);
        }
      }.bind(this)
    );
  }
});

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    if(src.indexOf('@') != -1) {
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)?\@\d{1,2}x|\d{1,4}x\d{0,4}?@\d{1,2}x|x\d{1,4}?\@\d{1,2}x)[_\.@]/);
    }else{
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
    }
    if (match !== null) {
      return match[1];
    } else {
      return null;
    }
  }
  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size == null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match != null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  function getName(path) {
    return _.last(path.split(/\.\w+\?/g)[0].split('/'));
  }

  function imgFit(width, height, a_ratioW, a_ratioH) {
    var fit = '';
    var aspect_ratioW = a_ratioW || parseFloat(theme.strings.aspect_ratio.split('/')[0]),
        aspect_ratioH = a_ratioH || parseFloat(theme.strings.aspect_ratio.split('/')[1]),
        aspect_cs = aspect_ratioW / aspect_ratioH;
    var aspect_image = width * 1.00 / height;
    if (aspect_ratioW < aspect_ratioH) {
      if (width == height ) {
        fit = "nonheight_ nonwidth";
      }
      else{
        if (aspect_cs >= aspect_image ) {
          fit = "nonheight";
        } else {
          fit = "nonwidth";
        }
      }
    } else if (aspect_ratioW > aspect_ratioH) {
      if (width == height ) {
        fit = "nonheight nonwidth_";
      } else{
        if (aspect_cs <= aspect_image ) {
          fit = "nonwidth";
        } else {
          fit = "nonheight";
        }
      }
    } else {      
      if( aspect_cs <= aspect_image) {
        fit = 'nonwidth';
      }
      else{
        fit = 'nonheight';
      }
    }
    return fit;
  }
  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol,
    getName: getName,
    imgFit: imgFit
  };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function() {

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || theme.moneyFormat);
    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }
    function formatWithDelimiters(number, precision, thousands, decimal) {
      if(shopCry == 'KWD') {
        precision = 3;
      }
      precision = defaultOption(precision, 2);
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      // if(shopCry == 'JPY') {
      //   number = (number / 1.0).toFixed(precision);
      // } else if(shopCry == 'KWD') {
      //   number = (number / 1000.0).toFixed(precision);
      // } else {
        number = (number / 100.0).toFixed(precision);
      // }
            
      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      // if (dollarsAmount !== '0') {
      //   dollarsAmount = dollarsAmount.replace(/\d(\.+\d\d\d)$/g, parseFloat(dollarsAmount.match(/\d(\.+\d\d\d)$/g)).toFixed() + '.000')
      // }
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';
      // if (centsAmount !== '') {
      //   dollarsAmount = (dollarsAmount + centsAmount).replace(/\d(\.+\d\d)$/g, parseFloat((dollarsAmount + centsAmount).match(/\d(\.+\d\d)$/g)).toFixed() + '.00')
      // }

      return dollarsAmount + centsAmount;
    }
    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, "'");
        break;
    }
    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

/* ================ GLOBAL ================ */

window.theme = theme || {}; 

theme.getScrollbarWidth = (function() {
  if ($('#getScrollbarWidth').length <= 0) {
    $('body').append('<div id="getScrollbarWidth" style="width:200px;height:150px;position:absolute;top:0;left:0;visibility:hidden;overflow:hidden;"><div id="getScrollbarWidthChild" style="width:100%;height:200px;">test</div></div>')
  }
  var $inner = $('#getScrollbarWidth'),
      $outer = $('#getScrollbarWidthChild');
  var width1 = $inner[0].offsetWidth;
  $outer.css('overflow', 'scroll');
  var width2 = $outer[0].clientWidth;
  // $outer.remove();
  return (width1 - width2);
});

/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.MenuReposive = (function() {
  var selectors = {
    body: 'body',
    header: '#header',
    headerOntop: '#header-ontop',
    navigation: '#header .main-navigation',
    siteNavHasDropdown: '.mn-has-child',
    siteNavVertical: '.vertical-menu',
    subNavVertical: '.sub-mn-v'
  };

  var config = {
    activeClass: 'show-submn',
    verticalClass: 'mn-ivt'
  };

  var mouseLeave;
  
  function is_mobile() {
    var isMobile = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobile|Kindle|Windows Phone|PSP|AvantGo|Atomic Web Browser|Blazer|Chrome Mobile|Dolphin|Dolfin|Doris|GO Browser|Jasmine|MicroB|Mobile Firefox|Mobile Safari|Mobile Silk|Motorola Internet Browser|NetFront|NineSky|Nokia Web Browser|Obigo|Openwave Mobile Browser|Palm Pre web browser|Polaris|PS Vita browser|Puffin|QQbrowser|SEMC Browser|Skyfire|Tear|TeaShark|UC Browser|uZard Web|wOSBrowser|Yandex.Browser mobile/i.test(navigator.userAgent)) isMobile = true;
    return isMobile;
  }
  function init() {
    if(theme.is_mobile == false) {
      $(document).on('mouseenter','.kt-nav '+selectors.siteNavHasDropdown,function() {
        if($(this).hasClass(config.activeClass) == false ) {
          $(this).addClass(config.activeClass);
          if($(this).hasClass(config.verticalClass)) {
            if (typeof mouseLeave == 'number') {
              clearInterval(mouseLeave);
            }
            $(selectors.subNavVertical).removeAttr('style');
            $(selectors.subNavVertical+'.item-'+$(this).attr('data-block-id')).css({
              opacity: 1,
              visibility: 'visible',
              'pointer-events': 'auto'
            });
          }
        }
      })
      $(document).on('mouseleave','.kt-nav '+selectors.siteNavHasDropdown,function() {
        if($(this).hasClass(config.activeClass)) {
          $(this).removeClass(config.activeClass);
        }
        function funHide() {
          $(selectors.subNavVertical).removeAttr('style');
          clearInterval(mouseLeave);
        }
        mouseLeave = setInterval(funHide, 300);
      });
      $(document).on('mouseenter', selectors.subNavVertical,function() {
        if (typeof mouseLeave == 'number') {
          clearInterval(mouseLeave);
        }
      });
      $(document).on('mouseleave',selectors.subNavVertical,function() {
        $(selectors.subNavVertical).removeAttr('style');
      });
    }
    // load_content_mega_item();
  }
  
  function unload() {
    $(window).off(selectors.siteNavHasDropdown+' a');
    $(selectors.siteNavHasDropdown).off(selectors.siteNavHasDropdown+' a');
    $(selectors.body).off(selectors.siteNavHasDropdown+' a');
  }

  function clone_header_ontop() {
    var width = $(window).width(); 
    if(width >= 320) {
      if($('#header-ontop .header').length > 0) {return false};
      if( $(selectors.header).length > 0 && $(selectors.headerOntop).length > 0 && $(selectors.headerOntop).hasClass('is-sticky') && !$(selectors.headerOntop).hasClass('cloned')) {
        $(selectors.headerOntop).addClass('cloned');
        if(typeof Swiper === 'function') {
          $.each($(selectors.header).find('.swiper-container-initialized'), function(index, val) {
            var mySwiper = this.swiper;
            mySwiper.destroy(true, true);
          })
        }
        var content = $(selectors.header).clone();
        content.removeAttr('id');
        content.find(".not-sticky,style,script").remove();
        content.find(".li--s").html();
        content.find(".show").removeClass('show');
        content.find(".box-search").removeClass('focus loaded');
        content.appendTo(selectors.headerOntop);
        $(selectors.headerOntop+' [data-shopify-editor-block]').removeAttr('data-shopify-editor-block');
        $(selectors.headerOntop).find(".dropdown-toggle").attr('aria-expanded',false);
        theme.ResizeNavMega.init('header-ontop');
        setTimeout(function() {
          theme.DropdownReposive.init('.kt--drop-w','.header-control .kt--drop-i','.kt--drop-in');
        },200)        
        if ($(selectors.headerOntop).find('.swiper-container').length > 0) {
          theme.SwiperSection('[data-section-type="header-section"]');
        }
      }else{
        setTimeout(function() {
          theme.DropdownReposive.init('.kt--drop-w','.header-control .kt--drop-i','.kt--drop-in');
        },200)
      }
    }else{
      $(selectors.headerOntop).removeClass('cloned').html('');
      return false;
    }    
    theme.StickyMenu.init();
  }
  return {
    init: init,
    is_mobile: is_mobile,
    clone_header_ontop: clone_header_ontop,
    unload: unload
  };
})();

window.theme = window.theme || {};

theme.StickyMenu = (function() {
  var selectors = {
    headerId: '#header',
    headerTop: '.header-top',
    headerAnnouncement: '.header-announcement:not(.none_sticky)',
    headerClassProp: '.header',
    stickyHeaderTop: '#header-ontop',
    headerClassPropTop: ''
  };
  var previousScroll = currentScroll = headerOrgOffset = wrapStickOrgOffset = headerHeight = headerTopHeight = headerTopAnnouncement = 0;
  var $body = $('body');
  var $bodynotonhide = $('body:not(.onhide)');
  var $windowWidth = $(window).width();
  var closeAnnouncement = '.close-header-announcement';
  function init() {
    if($(selectors.stickyHeaderTop + ' ' +selectors.headerClassProp).length <= 0) { return true };
    selectors.headerClassPropTop = $('#header-ontop .header');
    headerOrgOffset = $(selectors.headerId).offset().top + ($(selectors.headerId).outerHeight() * 2);
    wrapStickOrgOffset = $(selectors.headerId).offset().top;
    headerHeight = selectors.headerClassPropTop.outerHeight() || 0;
    headerTopHeight = $(selectors.stickyHeaderTop+' '+selectors.headerTop).outerHeight() || 0;
    headerTopAnnouncement = $(selectors.stickyHeaderTop+' '+selectors.headerAnnouncement).outerHeight() || 0;
    if($(selectors.headerId).length > 0 && $windowWidth >= 320) {
      $(window).scroll(function() {
        currentScroll = $(window).scrollTop();
        if(currentScroll <= headerOrgOffset && $bodynotonhide.hasClass('onsticky')) {
          $body.removeClass('onsticky').removeClass('onup');
        }
      })
      $(window).scroll($.throttle( 100, scroll));
      $(window).resize(function() {
        $windowWidth = $(window).width();
        headerHeight = selectors.headerClassPropTop.outerHeight() || 0;
        headerTopHeight = $(selectors.stickyHeaderTop+' '+selectors.headerTop).outerHeight() || 0;
        headerTopAnnouncement = $(selectors.stickyHeaderTop+' '+selectors.headerAnnouncement).outerHeight() || 0;
      });
    }
    if ( $(closeAnnouncement).length ) {
      $(document).on('click', closeAnnouncement, function(e) {
        headerTopAnnouncement = 0;
      });
    }
  }
  function scroll() {
    headerHeight = selectors.headerClassPropTop.outerHeight() || 0;
    if (currentScroll > headerOrgOffset && $windowWidth >= 320 && $body.hasClass('onsticky') === false) {
      if ($windowWidth >= 768) {
        selectors.headerClassPropTop.animate({'margin-top': (headerTopHeight * -1) + (headerTopAnnouncement * -1)}, 150);
      }
      else {
        selectors.headerClassPropTop.animate({'margin-top': headerHeight * -1 - 10}, 150);
      }
      $body.addClass('onsticky');
    }
    if (currentScroll > headerOrgOffset) {
      if(previousScroll > currentScroll + 80 && $bodynotonhide.hasClass('onsticky') && $body.hasClass('onup') === false) {
        $body.addClass('onup');
        selectors.headerClassPropTop.animate({'margin-top': 0}, 150);
          $('.kt-stickyAddCart.fixed .position-fixed.top').css('top', headerHeight);
      }
      else if(previousScroll <= currentScroll - 50 && $bodynotonhide.hasClass('onsticky') && $body.hasClass('onup')) {
        $body.removeClass('onup');
        if ($windowWidth >= 768) {
          selectors.headerClassPropTop.animate({'margin-top': (headerTopHeight * -1) + (headerTopAnnouncement * -1)}, 150);
        }
        else {
          selectors.headerClassPropTop.animate({'margin-top': headerHeight * -1 - 10}, 150);
          $('.kt-stickyAddCart.fixed .position-fixed.top').css('top', 0);
        }
      }
    }
    previousScroll = currentScroll;
  }
  return {
    init: init
  };
})(jQuery);

window.theme = window.theme || {};

theme.ResizeNavMega = (function() {
  function init(headId) {
    var selectors = {
      headerIsVisible: headId !== undefined ? '#header-ontop .main-header' : '#header .main-header',
      itemMega: '.i-megamn',
      contentItemMega: '.sub-mn'
    };
    var _data_width = $('#header .main-navigation').data('width'),
        _data_layout = $('#header .main-navigation').data("layout");
    if( theme.window_W > _data_width ) {
      if( $(selectors.headerIsVisible).length > 0) {
        var container = $(selectors.headerIsVisible);
        if( container!= 'undefined') {
          var container_width = 0;
          container_width = container.innerWidth();
          var container_offset = container.offset();
          var container_left = container_offset.left;
          var container_right = (container_left + container_width);
          if (_data_layout === 'vertical') {
            var offset = $('.vertical-menu .main-header').offset().top - $(window).scrollTop();
            $(selectors.headerIsVisible+' .mn-i[data-block]>.sub-mn').css({'height': $(window).height(),'max-width': $(window).width() * 0.8,'top': -1 * (offset)});
          }
          else {
            setTimeout(function() {
              $(selectors.headerIsVisible+' '+selectors.itemMega).each(function(index,element) {
                if ($(element).hasClass('f-width')) {
                  $(element).children(selectors.contentItemMega).css({'max-width':theme.window_W+'px'});
                  var item_left = $(element).offset().left;
                  $(element).children(selectors.contentItemMega).css('left','-'+item_left+'px');
                }
                else {                  
                  $(element).children(selectors.contentItemMega).css({'max-width':container_width+'px'});
                  var sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
                  var item_width = $(element).outerWidth();
                  $(element).children(selectors.contentItemMega).css('left','-'+(sub_menu_width/2 - item_width/2)+'px');
                  var item_left = $(element).offset().left;
                  var overflow_left = (sub_menu_width/2 > (item_left - container_left));
                  var overflow_right = ((sub_menu_width/2 + item_left) > container_right);
                  if( overflow_left ) {
                    var left = (item_left - container_left);
                    $(element).children(selectors.contentItemMega).css('left', -left+'px');
                  }
                  if( overflow_right && !overflow_left ) {
                    var left = (item_left - container_left);
                    left = left - (container_width - sub_menu_width);
                    $(element).children(selectors.contentItemMega).css('left', -left+'px');
                  }
                }
              })
              $(selectors.headerIsVisible+' .drop_to_right').each(function(index,element) {
                var item_left = $(element).offset().left;
                var overflow_left = (550 > (item_left - container_left));
                var overflow_right = ((550 + item_left) > container_right);
                if( overflow_left ) {
                  var left = (item_left - container_left);
                  $(element).addClass('drop_to_right').removeClass('drop_to_left');
                }
                if( overflow_right && !overflow_left ) {
                  $(element).addClass('drop_to_left').removeClass('drop_to_right');
                }
              });
            },100);
          }
        }
      }
    }
  }
  return {
    init: init
  };
})(jQuery);

window.theme = window.theme || {};

theme.DropdownReposive = (function() {
  function init(window,item,box) {
    // '.kt--drop-w','.kt--drop-i','.kt--drop-in'
    var selectors = {
      headerIsVisibleDesktop: '.kt--drop-w-d',
      headerIsVisible: window,
      itemMega: item,
      contentItemMega: box
    };
    var headerIsVisible = selectors.headerIsVisibleDesktop;
    if( theme.window_W <= 480 || $(selectors.headerIsVisible).innerWidth() <= 480 ) {
      headerIsVisible = selectors.headerIsVisible;
    }
    if($(headerIsVisible).length > 0) {
      setTimeout(function() {
        $(selectors.itemMega).each(function(index,element) {
          var container = $(element).closest(headerIsVisible);
          if(container.length <= 0) { return true };
          if($(element).find(selectors.contentItemMega).length <= 0) { return true };
          var itemwidth_css = $(element).find(selectors.contentItemMega).outerWidth();
          if (itemwidth_css > $(element).closest(selectors.headerIsVisible).outerWidth()) {
            itemwidth_css = $(element).closest(selectors.headerIsVisible).outerWidth();
          }
          var container_width = container.innerWidth() < itemwidth_css ? itemwidth_css : container.innerWidth();
          var container_offset = container.offset();
          $(element).children(selectors.contentItemMega).css({'max-width':container_width,'left':'','right':''});
          var sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
          var item_width = $(element).outerWidth();
          $(element).children(selectors.contentItemMega).css({'left':'-'+(sub_menu_width/2 - item_width/2)});
          var container_left = container_offset.left;
          var container_right = (container_left + container_width);
          var item_left = container.innerWidth() < itemwidth_css ? $(element).find(selectors.contentItemMega).offset().left : $(element).offset().left;

          var overflow_left = (sub_menu_width/2 > (item_left - container_left));
          var overflow_right = ((sub_menu_width + item_left) > container_right);
          if( overflow_left) {
            var left = (item_left - container_left); 
            $(element).children(selectors.contentItemMega).css({'left':-left});
          }
          if( overflow_right && !overflow_left ) {
            var left = (item_left - container_left);
            if(!(sub_menu_width/2 > (item_left + item_width - container_left)) && $(element).find(selectors.contentItemMega).hasClass('inline')) {
              var item_right = ((container_left + container_width) - (item_left + item_width))
              if ((item_right + sub_menu_width) > container_width) {
                var maxWidth = container_width - item_right;
                $(element).children(selectors.contentItemMega).css({'max-width':maxWidth});
                sub_menu_width = $(element).children(selectors.contentItemMega).outerWidth();
                left = left + item_right;
              } else {
                left = left + item_right;
              }
            }
            left = left - ( container_width - sub_menu_width );
            $(element).children(selectors.contentItemMega).css({'left':-left});
          }
        })
      },100);
    }
    if(theme.is_mobile === true) {
      $(selectors.itemMega).addClass('kt--drop-i-m').removeClass('kt--drop-i-d');
    }
    else{
      $(selectors.itemMega).addClass('kt--drop-i-d').removeClass('kt--drop-i-m');
    }
  }
  return {
    init: init
  };
})();

(function() {
  var selectors = {
    backButton: '.return-link'
  };

  var $backButton = $(selectors.backButton);

  if (!document.referrer || !$backButton.length || !window.history.length) {
    return;
  }

  $backButton.one('click', function(evt) {
    evt.preventDefault();

    var referrerDomain = urlDomain(document.referrer);
    var shopDomain = urlDomain(window.location.href);

    if (shopDomain === referrerDomain) {
      history.back();
    }

    return false;
  });

  function urlDomain(url) {
    var anchor = document.createElement('a');
    anchor.ref = url;

    return anchor.hostname;
  }
})();

/* ================ TEMPLATES ================ */

window.theme = theme || {};

theme.customerTemplates = (function() {

  function initEventListeners() {
    // Show modal
    if($('#accountModal').length > 0) {
      $(document).on('click','a[href*="/account/login"], a[href*="/account/register"],[data-href*="/account/login"], [data-href*="/account/register"]', function(evt) {
        if ($(this).attr('href') === '/account' || $(this).attr('data-href') === '/account') {
          return false;
        }
        evt.preventDefault();
        $('#accountModal').modal();
      });
    }

    // Show reset password form
    $(document).on('click','#RecoverPassword', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    $(document).on('click','#HideRecoverPasswordLink', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    $('.tab-trigger-link').on('click', function (e) {
      var targetHref = $(this).attr('href');
      $('.nav-dashboard').find('a[href="'+targetHref+'"]').trigger('click');
      e.preventDefault();
    });

    if($('.reset-password-success').length >0) {
      $('#CustomerLoginForm [name="checkout_url"]').after('<span class="mb-1">'+$('.reset-password-success').html()+'</span>');
    };
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('d-none');
    $('#CustomerLoginForm').toggleClass('d-none');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('d-none');
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('d-none');
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('d-none');
      $(this).closest('.col-toggle').toggleClass('col-lg-6');
    });
       $('.address-setdefault').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('d-none');
      $(this).closest('.col-toggle').toggleClass('col-lg-6');
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  return {
    init: function() {
      checkUrlHash();
      initEventListeners();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();

/*================ SECTIONS ================*/

window.theme = window.theme || {};
theme.CollSection = (function() {
  function init(container) {
    $(container).on('click','.show-pds, .show-list, .show-grid:not([data-col])', function() {
      $('.loadingFilter .d-none').removeClass('d-none');
      var val = $(this).attr('data-href');
      $('.ktjax').attr('href',theme.Images.removeProtocol(window.location.href));
      $.ajax({
        type: "POST",
        url: Shopify.root_url+'/cart.js',
        data: {"attributes[theme_coll_layout]": val},
        dataType: 'json',
        success: function(d) {
          if ($.support.pjax) {
            $('.ktjax').trigger('click');
            $(container).off();
          } else {
            window.location.reload();
          }
        }
      });
    });
    $(container).on('click','.show-grid[data-col]', function() {
      $('.show-grid-list').css('pointer-events', 'none');
      var val = $(this).attr('data-href');
      $.ajax({
        type: "POST",
        url: Shopify.root_url+'/cart.js',
        data: {"attributes[theme_coll_layout]": val},
        dataType: 'json',
        success: function() {
          $('.product-listing img.lazyloaded').addClass('lazyload');
          $('.show-grid-list').css('pointer-events', '');
        }
      });
      $('.show-grid[data-col]').removeClass('active').attr('data-ktpjax');
      $(this).addClass('active');
      $('.show-grid-list .layered_subtitle').html($(this).html());
      $('.show-pds').each(function() {
        $(this).attr('data-href',val.split('_')[0]+$(this).attr('data-pds'))
      });
      var col_crr = $('.product-listing').attr('data-grid'), col = $(this).attr('data-col');
      $('.product-listing').attr({'data-grid': col});
      $('.product-listing li.grid-item').attr('class', $('.product-listing li.grid-item').attr('class').replace(col_crr,col));
      if($('[data-section-type="masonry-prds-section"]').length > 0) {
        var $grid = $('.ly__ms_items').isotope({
          itemSelector: '.grid-item',
          masonry: {
            horizontalOrder: true,
            percentPosition: true
          },
          transitionDuration: '.8s'
        });
      }    
    });
  }

  function infinityLoad() {    
    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var element = $('.kt--filter-js a[data-action="infinity"]').not('.loading')[0];
    if(element !== undefined && getComputedStyle($('.kt--filter-js').find('.loadMore')[0]).display !== "none" && element.getBoundingClientRect().top <= viewportHeight + 600) {
      // disableScroll();    
      $('.kt--filter-js').find('a[data-action="infinity"]').trigger('click');
    }
  };

  return {
    init: init,
    infinityLoad: infinityLoad
  }
})();

theme.collPjax = (function() {
  if (theme.extensions.ktjs_flts_or) {
    var prefetch_flts = document.createElement('link');
      prefetch_flts.type = "xhr";
      prefetch_flts.rel = "prefetch";
      prefetch_flts.href = window.location.search.indexOf('?') >= 0 ? window.location.search + '&view=multi_flts_or' :  window.location.search + '?view=multi_flts_or';
      prefetch_flts.onload = function() {
        $(this).remove();
      };
    headDocument.insertBefore(prefetch_flts, firstLink);
  }
  var prefetch_url = $('.collection-products .btn-loadmore').attr('href');
  if(prefetch_url !== '' & prefetch_url !== undefined) {
    var prefetch = document.createElement('link');
      prefetch.type = "xhr";
      prefetch.rel = "prefetch";
      prefetch.href = prefetch_url + '&_pjax=.product-listing-loadmore';
      prefetch.onload = function() {
        $(this).remove();
      };
    headDocument.insertBefore(prefetch, firstLink);
  }
  var loadmore = false;
  var scrollTop = null;
  $(document).on('click', 'a[data-pjax-filter]', function(event) {
    if ($.support.pjax) {
      if($(this).attr('data-action') === 'loadmore' || $(this).attr('data-action') === 'infinity' ) {
        $.pjax.click(event, {
          container: '.product-listing-loadmore',
          fragment: '.product-listing',
          timeout: 4000,
          scrollTo: false,
          push: false
        });
        $(this).text($(this).attr('data-text-loading'));
        loadmore = true;
      }
      else{
        $('.loadingFilter .d-none').removeClass('d-none');
        $.pjax.click(event, {
          container: '.kt--filter-js',
          fragment: '.kt--filter-js',
          timeout: 4000,
          scrollTo: false
        });
      }
      if($(this).attr('data-scroll-top') !== undefined) {
        scrollTop = true;
        $('div[data-section-id="kt_collection_banner"]').find('img').css('opacity',0.5)
      }
    }
  });
  if (theme.extensions.ktjs_flts_or) {
    $(document).on('pjax:click', function(e, options) {
      var prefetch_flts = document.createElement('link');
        prefetch_flts.type = "xhr";
        prefetch_flts.rel = "prefetch";
        prefetch_flts.href = options.url.indexOf('?') >= 0 ? options.url + '&view=multi_flts_or' : options.url + '?view=multi_flts_or';
        prefetch_flts.onload = function() {
          $(this).remove();
        };
      headDocument.insertBefore(prefetch_flts, firstLink);
    });
  }
  $(document).on('pjax:success', function() {
    if(loadmore) {
      var countAddNew = $('.product-listing .product-listing-loadmore').find('.grid-item').length;
      $('.product-listing').find('.product-listing-loadmore').first().addClass('removeElement');
      $('.product-listing').append($('.product-listing').find('.product-listing-loadmore').first().html());
      $('.product-listing').find('.product-listing-loadmore.removeElement').first().remove();
      var CountEnd = $('.CountEnd').first().text(), AllCount = $('.AllCount').first().text(), $aMore = $('.pagination_ [data-action]').first();
      CountEnd = +CountEnd + countAddNew;
      $('.CountEnd').text(CountEnd);
      if(CountEnd < +AllCount) {
        var curPage = $aMore.attr('data-page').replace('page_','');
        if (theme.extensions.ktjs_flts_or) {
          $aMore.attr('href',$aMore.attr('href').replace('page_'+curPage,'page_'+(+curPage+1)).replace('offp_'+offp_obj[curPage-1],'offp_'+offp_obj[curPage])).attr('data-page','page_'+(+curPage+1));
        } else {
          $aMore.attr('href',$aMore.attr('href').replace('page='+curPage,'page='+(+curPage+1))).attr('data-page','page_'+(+curPage+1));
        }
      }
      else{
        $('.pagination_ .loadMore').hide();
      }
      $aMore.removeClass('loading').text($aMore.attr('data-text-button'));
      $('#filterApply').html($('.result-count').html());
      // enableScroll();
    }
    else if(scrollTop == true) {
      $('html').animate({scrollTop:0}, 'slow');
      scrollTop = false;
    }
    else{
      var offsetTop = $('.header.ontop').length !== 0 ? $('#PageContainer').offset().top - ($('.header.ontop').height()) * 2 : $('#PageContainer').offset().top - 100;
      $('html').animate({scrollTop:offsetTop}, 'slow');
    }
    if($('[data-section-type="masonry-prds-section"]').length > 0 && loadmore) {
      for (var i = CountEnd - countAddNew; i <= CountEnd; i++) {
        var $this = $('.product-listing .grid-item:eq('+i+')');
        $('.product-listing')
        .isotope('appended', $this)
        .isotope('layout');
      }
      theme.resize_card_grid();
    }
    loadmore = false;
    var prefetch_url = $('.collection-products .btn-loadmore').attr('href');
    if(prefetch_url !== '' & prefetch_url !== undefined) {
      var prefetch = document.createElement('link');
        prefetch.rel = "prefetch";
        prefetch.href = prefetch_url + '&_pjax=.product-listing-loadmore';
        prefetch.onload = function() {
          $(this).remove();
        };
      headDocument.insertBefore(prefetch, firstLink);
    }
    if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
      Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
    }
    if ($(".spr-badge").length > 0 && typeof window.SPR == 'function') {
      return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
    }
  })
  $(document).on('pjax:complete', function(event, xhr, textStatus, options) {
    var sections = new theme.Sections();
    sections.register('masonry-prds-section', theme.PrdsMasonrySection);
    $('[data-section-type="collection-template"]').off();
    $('.kt--filter-js').off();
    sections.register('collection-filter', theme.Filters);
    sections.register('collection-template', theme.CollSection.init);
    KT.fixGridSwatch();    
    theme.DropdownReposive.init('.kt--drop-w','.kt--drop-i','.kt--drop-in');
    if($('.loadingFilter .card').length > 0) {$('.loadingFilter .card').addClass('d-none').removeClass('bottom')};
    if($('.kt--filter.kt_canvas.opend-overlay').length <= 0) {
      $('#bg-overlay').trigger('click')
    }
  });
});

window.theme = window.theme || {};
theme.HeaderSection = (function() {
  function Header(container) {
    theme.MenuReposive.init();
    theme.ResizeNavMega.init();
    var closeAnnouncement = '.close-header-announcement';
    if ( $(closeAnnouncement).length ) {
      var announcement = sessionStorage.getItem('announcement');
      if (announcement !== 'hide') {
        $('.header-announcement').slideDown('400');
      }
      $(document).on('click', closeAnnouncement, function(e) {
        $('.header-announcement').slideUp('400');
        sessionStorage.setItem('announcement', 'hide');
      });
    }
    if ($(container).find('.swiper-container').length > 0) {
      theme.SwiperSection('[data-section-type="header-section"]');
    }
  }
  Header.prototype = _.assignIn({}, Header.prototype, {
    onUnload: function() {
      theme.MenuReposive.unload();
    },
    onSelect: function(evt) {
    },
    onBlockSelect: function(evt) {
      $('.show-submn').removeClass('show-submn');
      $('.mn-lv1').removeClass('active');
      $(evt.target).addClass('show-submn active');
    },
    onBlockDeselect: function(evt) {
      $('.show-submn').removeClass('show-submn');
      $('.mn-lv1').removeClass('active');
    }
  });
  return Header;
})();

window.theme = window.theme || {};
theme.MegamnVerticalSection = (function() {
  function Mega(container) {
  }
  Mega.prototype = _.assignIn({}, Mega.prototype, {
    onUnload: function(evt) {
      $(evt.target).removeClass('on-edit');
    },
    onSelect: function(evt) {
      $(evt.target).addClass('on-edit');
    },
    onDeselect: function(evt) {
      $(evt.target).removeClass('on-edit');
    },
    onBlockSelect: function(evt) {
      $('.show-submn').removeClass('show-submn');
      $('.mn-lv1').removeClass('active');
      if ($(evt.target).hasClass('.i-megamn.--vt')) {
        $(evt.target).addClass('show-submn active');
      } else if ($(evt.target).closest('.i-megamn.--vt').length > 0) {
        $(evt.target).closest('.i-megamn.--vt').addClass('show-submn active');
      }
    },
    onBlockDeselect: function(evt) {
      $('.show-submn').removeClass('show-submn');
      $('.mn-lv1').removeClass('active');
    }
  });
  return Mega;
})();
window.theme = window.theme || {};
theme.HeaderMbSection = (function() {
  function MbHeader(container) {    
    $(document).on('click','.mmenu-btn', function (e) {
      var $parent = $(this).closest('li'),
      $targetUl = $parent.find('ul').eq(0);
      if ( !$parent.hasClass('open') ) {
        $targetUl.slideDown(300, function () {
          $parent.addClass('open');
        });
      } else {
        $targetUl.slideUp(300, function () {
          $parent.removeClass('open');
        });
      }
      e.stopPropagation();
      e.preventDefault();
    });

    function action_addClass() {
      $('body').addClass('mmenu-active');
      $('#bg-overlay').addClass('menu-mb-overlay').removeClass('menu-overlay');
      return false;
    }

    function action_removeClass() {
      $('body').removeClass('mmenu-active');
      anime({targets: '#bg-overlay.menu-mb-overlay',backgroundColor: 'rgba(0,0,0,0)', duration: 300,easing: 'linear',complete: function(anim) {
        $('#bg-overlay').removeAttr('style class');
      }})
      return false;
    }

    $(document).on('click', ".menu-toggle", function() {
      action_addClass();
      if ($('.nav-link[data-type="item_menu"]').length > 0) {
        $('.nav-link[data-type="item_menu"]').first().trigger('click');
      }
    })
    $(document).on('click touchstart', ".mobile-menu-close, #bg-overlay.menu-mb-overlay", function() {
      action_removeClass();
    })
  }
  MbHeader.prototype = _.assignIn({}, MbHeader.prototype, {
    onUnload: function() {
    },
    onSelect: function(evt) {
      $('body').addClass('mmenu-active');
      $('#bg-overlay').addClass('menu-mb-overlay').removeClass('menu-overlay');
    },
    onDeselect: function(evt) {
      $('body').removeClass('mmenu-active');
      anime({targets: '#bg-overlay.menu-mb-overlay',backgroundColor: 'rgba(0,0,0,0)', duration: 300,easing: 'linear',complete: function(anim) {
        $('#bg-overlay').removeAttr('style class');
      }})
    },
    onBlockSelect: function(evt) {
    },
    onBlockDeselect: function(evt) {
    }
  });
  return MbHeader;
})();

/* eslint-disable no-new */

theme.videoPopup = (function(url) {
  if(url.indexOf('.mp4') !== -1) {
    $.magnificPopup.open({
      items: [
        {
          src: '<div class="white-popup"><div class="white-popupcontent"><video class="amp-page amp-video-element" id="myVideo_product" controls="controls" autoplay><source type="video/mp4" src="'+url+'"></video></div></div>',
          type: 'inline'
        }
      ],
      type: 'image'
    });
  }else if(url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be.com') !== -1 || url.indexOf('vimeo.com') !== -1) {
    $.magnificPopup.open({
      items: [
        {
          src: url,
          type: 'iframe'
        }
      ],
      type: 'image'
    });
  }
});

window.theme = theme || {};
theme.Swiper = (function() {
  /* ---------------------------------------------
   Swiper
   --------------------------------------------- */
  function init(container) {
    var $container = $(container);
    if ($container.find('.shopify-section').length > 0) {
      $container.find('.shopify-section').children().unwrap();
    }
    $container.find('.swiper-container').each(function() {
      if ($(this).hasClass('swiper-container-initialized')) {
        return true;
      }
      var self = this;
      var config = $(this).data();
      config.watchOverflow = true;
      config.a11y = false;
      config.watchSlidesVisibility = true;
      if (config.nav) {
        config.navigation = {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
        if (config.nextEl && config.nextEl !== '') {
          config.navigation = {
            nextEl: config.nextEl,
            prevEl: config.prevEl
          }
        }
      }
      if (config.dots) {
        config.pagination = {
          el: '.swiper-pagination',
          type: 'bullets'
        }
      }
      if (config.autoplay && config.delay !== undefined) {
        config.autoplay = {
          delay: config.delay * 1000
        }
      } else if (config.autoplay) {
      	config.autoplay = {
          delay: 7000
        }
      }
      if (config.scrollbar) {
        config.scrollbar = {
          el: '.swiper-scrollbar',
          draggable: true
        }
      }
      if (config.noOverflow) {
        config.loop = true;
        config.loopAdditionalSlides = 2;
        config.loopFillGroupWithBlank = 2;
      }
      config.on = {
        init: function (swiper) {
          // console.log('init')
          checkThemeCustom();
          // KT.countdown();
          var mySwiper = self.swiper;
          var itemCrr = $(mySwiper.slides[mySwiper.activeIndex]);
          if (itemCrr.find(".bgndVideo").length > 0) {
            KT.loadScript('YTPlayer', function(e,l) {
              if (l == 'ok') {
                itemCrr.find(".bgndVideo").YTPlayer({containment:itemCrr.find(".bgndVideo").parent()});
              }
            })
          }
          if(swiper.slides.length > 0) {
            $(swiper.el).addClass('has-its');
          }
          if ($(self).find('.kt_pin[data-product-handle]').length > 0) {
            KT.loadScript('tippy', function(e,l) {
              if (l == 'ok') {
                $.each($(self).find('.kt_pin[data-product-handle]'), function(index, el) {
                  tippy(this, {
                    content: function(reference) {
                      var template = $(reference).parents('.kt_pins').find('.kt_pin_pritem[data-product-handle="'+$(reference).attr('data-product-handle')+'"]')[0];
                      return template.outerHTML;
                    },
                    allowHTML: true,
                    sticky: true,
                    interactive: true
                  });
                });
              }
            })
          }
          if ($container.find('.btn-iframe').length > 0) {
            KT.loadScript('magnific-popup', function(e,l) {
              if (l == 'ok') {
                $.each($container.find('.btn-iframe'), function(idx, el) {
                  $(this).on('click',function(event) {
                    event.preventDefault();
                    theme.videoPopup($(this).attr('href'));
                  })
                })
              }
            })
          }
        },
        slideChange: function () {
          // console.log('slideChange')
          if(typeof jQuery.fn.YTPlayer === 'function') {
            $.each($(self).find(".bgndVideo.mb_YTPlayer"), function() {
              $(this).YTPPause();
            })
          }
          var mySwiper = self.swiper;
          var itemCrr = $(mySwiper.slides[mySwiper.activeIndex]);
          mySwiper.$el.find('.lazyloading:not(.lazyload):not([data-include])').addClass('lazyload');
          if (itemCrr.find(".bgndVideo.mb_YTPlayer").length > 0) {
            itemCrr.find(".bgndVideo.mb_YTPlayer").YTPPlay();
          }
          if (itemCrr.find(".bgndVideo:not(.mb_YTPlayer)").length > 0) {
            KT.loadScript('YTPlayer', function(e,l) {
              if (l == 'ok') {
                itemCrr.find(".bgndVideo").YTPlayer({containment:itemCrr.find(".bgndVideo").parent()});
              }
            })
          }
        },
        resize: function () {
          $.debounce( 250, function() {checkThemeCustom()})();
        },
        observerUpdate: function (swiper) {
          checkThemeCustom();
          if(swiper.slides.length > 0) {
            $(swiper.el).addClass('has-its');
          }
        }
      };
      function checkThemeCustom() {
        var mySwiper = self.swiper;
        var $self = $(self);
        var $self_p = $(self).parent();
        if (mySwiper.slides.length > mySwiper.params.slidesPerView) {
          if(mySwiper.params.nav) {
            $self_p.addClass('swiper-container-has-nav');
          } else {
            $self_p.removeClass('swiper-container-has-nav');
          }
          if(mySwiper.params.dots) {
            $self_p.addClass('swiper-container-has-dot');
          } else {
            $self_p.removeClass('swiper-container-has-dot');
          }
          if(mySwiper.params.noOverflow) {
            $self_p.addClass('swiper-no-overflow');
          } else {
            $self_p.removeClass('swiper-no-overflow');
          }
        }
        if($self_p.find('.swiper-pagination-outside').length > 0) {
          $self_p.addClass('swiper-pagination-outside');
        }
        if(mySwiper.params.spaceBetween <= 0) {
          $(self).css({paddingRight: 1,paddingLeft: 1,marginRight: 1,marginLeft:1});
        }
      }
      // console.log(config)
      var mySwiper = new Swiper(this, config);
    });
   }
  /* ---------------------------------------------
   Swiper mobile
   --------------------------------------------- */
  function initSwiperMobile() {
  }
  return{
    init: init,
    initSwiperMobile: initSwiperMobile
  };
})();

theme.swiper = {};
theme.SwiperSection = (function() {
  function Swiper(container) {
    var $container = this.$container = $(container);
    KT.loadScript('swiper', function(e,l) {
      if (l == 'ok') {
        theme.Swiper.init(container);
      }
    });
  }
  return Swiper;
})();
theme.SwiperSection.prototype = _.assignIn({}, theme.SwiperSection.prototype, {
  onSelect: function(evt) {
  },
  onUnload: function() {
    delete theme.swiper[this.container];
  },

  onBlockSelect: function(evt) {
    var $swiper = $(this.container).find('.swiper-container')[0].swiper;
    if ($swiper !== undefined) {
      var slide_i = $(evt.target).hasClass('slide_i') == true ? $(evt.target) : $(evt.target).parent();
      $swiper.slideTo(slide_i.index());
    }
  },

  onBlockDeselect: function() {
    var $swiper = $(this.container).find('.swiper-container')[0].swiper;
    if($swiper !== undefined && $(this.container).find('.swiper-container').data('autoplay') === true ) {
      $swiper.autoplay.start();
    }
  }
});

window.theme = theme || {};
theme.PrdsMasonrySection = (function() {  
  function MasonrySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var masonry = this.masonry = '#Masonry-' + sectionId;

    KT.loadScript('isotope', function(e,l) {
      if (l == 'ok') {
        $(masonry+ ' .ly__ms_items').on( 'arrangeComplete', function() {
          $(masonry+ ' .ly__ms_items').addClass('isotoped')
        });
        var $grid = $(masonry+ ' .ly__ms_items').isotope({
          itemSelector: '.ly__ms',
          layoutMode: 'packery',
          packery: {
            horizontalOrder: true,
            percentPosition: true
          },
          transitionDuration: '.4s'
        });
        theme.resize_card_grid();
      }
    });
  }
  return MasonrySection;
})();

window.theme = theme || {};
theme.MasonrySection = (function() {  
  function MasonrySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var masonry = this.masonry = '#Masonry-' + sectionId;

    KT.loadScript('isotope', function(e,l) {
      if (l == 'ok') {
        var $grid = $(masonry).isotope({
          itemSelector: '.masonry-item',
          layoutMode: 'packery',
          packery: {
            horizontalOrder: true,
            percentPosition: true
          },
          transitionDuration: '0.8s'
        });
      }
    });
  }
  return MasonrySection;
})();

window.theme = theme || {};
theme.portfolioMasorySection = (function() {  
  function MasorySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var sectionContainer = $container.attr('data-container');
    var sectionFilter = $container.attr('data-filter');
    var sectionItems = $container.attr('data-items');

    KT.loadScript('isotope', function(e,l) {
      if (l == 'ok') {
        var $portfolioFilterNav = $(sectionFilter),
            $portfolioContainer = $(sectionContainer);
        function isotopeInit() {
          var layoutMode = $portfolioContainer.data('layoutmode');
          $portfolioContainer.isotope({
            itemSelector: sectionItems
          });
          // reveal all items after init
          var $items = $portfolioContainer.find(sectionItems);
          $portfolioContainer.addClass('show-items').isotope('revealItemElements', $items);
        }
        function isotopeFilter() {
          $portfolioFilterNav.find('a').on('click', function(e) {
            var $this = $(this),
                selector = $this.attr('data-filter');
            // Remove active class
            $portfolioFilterNav.find('.active').removeClass('active');
            // Init filter
            $portfolioContainer.isotope({
              filter: selector,
              transitionDuration: '0.7s'
            });
            // Add active class
            $this.closest('li').addClass('active');
            e.preventDefault();
          });
        }
        isotopeInit();
        isotopeFilter();
      }
    })
  }
  return{
    MasorySection:MasorySection
  }
})();

window.theme = theme || {};
theme.Instagram = (function() {  
  function Instagram(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var ul_ins = $('#shopify-section-'+sectionId+' .instagramWrapper'), dataIns = ul_ins.data();
    var padd = ul_ins.data('use-slide') === true ? ' swiper-slide' : ' col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2-10';
    var html = '';
    var count = 0;
    var childrenId = new Array;
    var childrenMedias = new Array;
    if("" == dataIns.accessToken) {
      $('#instagramWrapper-'+sectionId).hide();
      return;
    }
    var getMedias = function() {
      $.ajax({
        url: '//graph.instagram.com/me/media?fields=caption,id,media_type,media_url,permalink,thumbnail_url,children&access_token='+dataIns.accessToken,
        type: 'GET',
        dataType: 'json'
      })
      .done(function(data) {
        // console.log("success");
        var medias = data.data;
        if (dataIns.tag !== undefined && dataIns.tag !== '') {
          medias = medias.filter(function(item) { return item.caption.indexOf('#'+dataIns.tag) >= 0})
        }
        buildMedia(medias);
        sessionStorage.setItem('instaMedias', JSON.stringify(medias));
      })
      .fail(function() {
        // console.log("error");
        $('#instagramWrapper-'+sectionId).hide();
      })
      .always(function() {
        // console.log("complete");
        completeLayout();
        $.each(childrenId, function(index, c_media) {
          $.ajax({
            url: '//graph.instagram.com/'+c_media+'/children?fields=media_url,permalink,thumbnail_url&access_token='+dataIns.accessToken,
            type: 'GET',
            dataType: 'json'
          })
          .fail(function() {
            console.log("error load children");
          })
          .always(function(data) {
            var medias = data.data;
            buildMediaChildren(medias);
            childrenMedias.push(medias);
            sessionStorage.setItem('childrenMedias', JSON.stringify(childrenMedias));
          });
        });
      });
    }
    var buildMedia = function(medias) {
      $.each(medias, function(index, media) {
        if (media.children) {
          $.each(media.children.data, function(index, c_media) {
            if (count < dataIns.limit) {
              count ++;
              html +='<div class="item'+padd+' order-'+count+'"><a class="instagram-feed insta_'+c_media.id+' fkt-instagram" href="' + media.permalink + '" style="padding-bottom: 100%;"></a></div>';
            }
          });
          childrenId.push(media.id);
        } else if(media.media_type === 'VIDEO' && count < dataIns.limit) {
            count ++;
            var img_url = media.thumbnail_url;
            html +='<div class="item'+padd+' order-'+count+'">';
              html +='<a class="instagram-feed lazyload fkt-instagram prev" href="' + media.permalink + '" style="padding-bottom: 100%;" data-bgset="'+img_url+'">';
                html +='<span id="vd_p_'+media.id+'" class="fkt-play" onclick="$(\'#vd_'+media.id+'\')[0].play();$(this).remove()" style="position: absolute;z-index: 2;left: 50%;top: 50%;margin-left: -1.4rem;margin-top: -2.95rem;cursor: pointer;font-size: 3.2rem;color: #fff;"></span>';
                html +='<video id="vd_'+media.id+'" loop style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"><source src="'+media.media_url+'" type="video/mp4"></video>';
              html +='</a>';
            html +='</div>';
        } else {
          if (count < dataIns.limit) {
            count ++;
            var img_url = media.media_url || media.thumbnail_url;
            html +='<div class="item'+padd+' order-'+count+'"><a class="instagram-feed lazyload fkt-instagram" href="' + media.permalink + '" style="padding-bottom: 100%;" data-bgset="'+img_url+'"></a></div>';
          }
        }
      });
    }
    var buildMediaChildren = function(medias) {
      $.each(medias, function(index, media) {
        $('.insta_'+media.id).attr('data-bgset', media.media_url).addClass('lazyload');
      })
    }
    var completeLayout = function() {
      $('#instagramWrapper-'+sectionId).append(html).show(0);
      ul_ins.find('li:empty').remove();
      if(dataIns.useSlide === true || dataIns.useSlide === 'true' ) {
        theme.SwiperSection(container);
      }
      if(dataIns.useMasonry === true || dataIns.useMasonry === 'true' ) {
        KT.loadScript('isotope', function(e,l) {
          if (l == 'ok') {
            var $grid = $('#instagramWrapper-'+sectionId).isotope({
              itemSelector: '.item',
              layoutMode: 'packery',
              packery: {
                horizontalOrder: true,
                percentPosition: true
              },
              transitionDuration: '.4s'
            });
          }
        });
      }
    }
    var instaMedias = sessionStorage.getItem('instaMedias')
    if (instaMedias !== null) {
      buildMedia(JSON.parse(instaMedias));
      completeLayout();
      var childrenMedias = sessionStorage.getItem('childrenMedias');
      if (childrenMedias !== null) {
        $.each(JSON.parse(childrenMedias), function(index, c_medias) {
          buildMediaChildren(c_medias);
        });
      }
      $('.fkt-instagram').on('click', function(e) {
        if($(this).hasClass('prev')) {
          e.preventDefault();
          $(this).removeClass('prev')
        }
      })
    }
    else {
      getMedias();
    }
  }
  return Instagram;
})();

theme.ktCountdown = (function(container) { 
  var container_ = container !== undefined ? '#'+$(container).attr('id')+' ' : '';  
      container_ = container_ !== '#undefined ' ? container_ : '';
  if($(container_+'.kt_countdown').length >0) {
    KT.loadScript('countdown', function(e,l) {
      if (l == 'ok') {
        Countdown();
      }
    });
    function Countdown() {
      $(container_+'.kt_countdown:not(.cd-initialized)').each(function() {
        var $this = $(this);
        $this.addClass('cd-initialized');
        var html = '<div class="block cdhrs"><span class="flip-top">00</span><span class="label">'+theme.strings.cdhrs+'</span></div><span class="sign">:</span>';
            html += '<div class="block cdmins"><span class="flip-top">00</span><span class="label">'+theme.strings.cdmin+'</span></div><span class="sign">:</span>';
            html += '<div class="block cdsecs"><span class="flip-top">00</span><span class="label">'+theme.strings.cdsecs+'</span></div>';
        var htmlFull = '<div class="block cdday"><span class="flip-top">00</span><span class="label">'+theme.strings.cdday+'</span></div><span class="sign">:</span>' + html;
        if ($this.hasClass('kt_loop_bar')) {
          var sFullDay = 86400,
              hours = parseInt(theme.timenow.h),
              minutes = parseInt(theme.timenow.i),
              seconds = parseInt(theme.timenow.s),
              seconds_row = hours*60*60+minutes*60+seconds;
          var loop_per_day = Math.ceil(sFullDay/seconds_row);
          var monthFullNumber = ["01", "02", "03","04", "05", "06", "07","08", "09", "10","11", "12"];
          if (theme.function.countdown_timezone) {
          var date =  theme.timenow.timeNow,
              now_h = parseInt(theme.timenow.hNow),
              now_m = parseInt(theme.timenow.iNow),
              now_s = parseInt(theme.timenow.sNow);
          } else {
          var day = new Date();
          var date =  day.getFullYear() + '/' + monthFullNumber[day.getMonth()] + '/' + day.getDate(),
              now_h = day.getHours(),
              now_m = day.getMinutes(),
              now_s = day.getSeconds();
          }
          // many days from now!
          var secondsTimeSpanToHMS = function(seconds) {
            var s = seconds;
            var h = Math.floor(s/3600);
            s -= h*3600;
            var m = Math.floor(s/60);
            s -= m*60;
            return (h < 10 ? '0'+h : h)+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s);
          }
          var checkRow = function checkRow() {
            for (var i = 1; i < loop_per_day + 1; i++) {
              var now = now_h*60*60+now_m*60+now_s;
              if (now < seconds_row * i) {
                return seconds_row * i < sFullDay ? seconds_row * i : sFullDay;
              }
            }
          }
          if(checkRow() !== undefined || checkRow() !== null) {
            var seconds_end = secondsTimeSpanToHMS(checkRow());
            if (seconds_end === '24:00:00') {
              var day = new Date(date);
              var nextDay = new Date(day);
              nextDay.setDate(day.getDate()+1);
              date = nextDay.getFullYear() + '/' + monthFullNumber[nextDay.getMonth()] + '/' + (nextDay.getDate() < 10 ? '0' + nextDay.getDate() : nextDay.getDate());
              seconds_end = secondsTimeSpanToHMS(seconds_row == sFullDay ? seconds_row - 1 : seconds_row);
            }
            $this.html(html);
            var $thisHrs = $this.find('.cdhrs .flip-top');
            var $thisMins = $this.find('.cdmins .flip-top');
            var $thisSecs = $this.find('.cdsecs .flip-top');
            var onStart = 0;
            if(theme.function.countdown_timezone) {
              KT.loadScript('moment', function(e,l) {
                if (l == 'ok') {                      
                  KT.loadScript('moment-zone', function(e,l) {
                    if (l == 'ok') {
                      var endtime = moment.tz(date+' '+seconds_end, theme.timezone);
                      $this.countdown(endtime.toDate())
                      .on('update.countdown', function(event) {
                        $thisHrs.text(event.strftime('%H'))
                        $thisMins.text(event.strftime('%M'))
                        $thisSecs.text(event.strftime('%S'))
                        if (onStart === 0) {onStart++;$this.parent().addClass('showOn');}
                      })
                      .on('finish.countdown', function(event) {
                        $this.parent().remove();
                      });
                    }
                  });
                }
              });
            } else {
              $this.countdown(Date.parse(date+' '+seconds_end))
              .on('update.countdown', function(event) {
                $thisHrs.text(event.strftime('%H'))
                $thisMins.text(event.strftime('%M'))
                $thisSecs.text(event.strftime('%S'))
                if (onStart === 0) {onStart++;$this.parent().addClass('showOn');}
              })
              .on('finish.countdown', function(event) {
                $this.parent().remove();
              });
            }
          }
        }
        else{
          var date = $this.data('time');
          if ('24:00:00'.indexOf(date) !== -1) {
            var day = new Date(date);
            var nextDay = new Date(day);
            nextDay.setDate(day.getDate()+1);
            var monthFullNumber = ["01", "02", "03","04", "05", "06", "07","08", "09", "10","11", "12"];
            date = nextDay.getFullYear() + '/' + monthFullNumber[nextDay.getMonth()] + '/' + nextDay.getDate() +' 00:00:00';
          }
          $this.html(htmlFull);
          var $thisDay = $this.find('.cdday .flip-top');
          var $thisHrs = $this.find('.cdhrs .flip-top');
          var $thisMins = $this.find('.cdmins .flip-top');
          var $thisSecs = $this.find('.cdsecs .flip-top');
          var onStart = 0;
          if(theme.function.countdown_timezone) {
            KT.loadScript('moment', function(e,l) {
              if (l == 'ok') {
                KT.loadScript('moment-zone', function(e,l) {
                  if (l == 'ok') {
                    $this.countdown(moment.tz(date, theme.timezone).toDate())
                    .on('update.countdown', function(event) {
                      $thisDay.text(event.strftime('%-D'))
                      $thisHrs.text(event.strftime('%H'))
                      $thisMins.text(event.strftime('%M'))
                      $thisSecs.text(event.strftime('%S'))
                      if (onStart === 0) {onStart++;$this.parent().addClass('showOn');}
                    })
                    .on('finish.countdown', function(event) {
                      $this.parent().remove();
                    });
                  }
                });
              }
            });
          }
          else {
            $this.countdown(Date.parse(date))
            .on('update.countdown', function(event) {
              $thisDay.text(event.strftime('%-D'))
              $thisHrs.text(event.strftime('%H'))
              $thisMins.text(event.strftime('%M'))
              $thisSecs.text(event.strftime('%S'))
              if (onStart === 0) {onStart++;$this.parent().addClass('showOn')}
            })
            .on('finish.countdown', function(event) {
              $this.parent().remove();
            });
          }
        }
      });
    }
  }
})

window.theme = theme || {};
theme.BannerSection = (function() {
  function Banner(container) {
    theme.ktCountdown(container);
  }
  return Banner;
})();

window.theme = theme || {};
theme.BannerVideoSection = (function() {
  function Banner(container) {
    var $container = $(container);
    if ($container.find('.btn-iframe').length > 0) {
      KT.loadScript('magnific-popup', function(e,l) {
        if (l == 'ok') {
          $.each($container.find('.btn-iframe'), function(idx, el) {
            $(this).on('click',function(event) {
              event.preventDefault();
              theme.videoPopup($(this).attr('href'));
            })
          })
        }
      })
    } else if($container.find('.bgndVideo').length > 0){      
      KT.loadScript('YTPlayer', function(e,l) {
        if (l == 'ok') {
          $container.find('.bgndVideo').YTPlayer({containment:$container.find(".bgndVideo").parent(), optimizeDisplay: true});
        }
      })
    }
  }
  return Banner;
})();

theme.variantChange = (function() {
  function vars_change(vrId,chageByTitle,opt,prVrs,formJs) {
    var img_url = '';
    var activeVr = _.find(prVrs, { 'id': vrId}) || _.find(prVrs, { 'title': chageByTitle});

    var prdOptsStyle = theme.function.productGridOptionStyle;
    var prdOpt2Style = prdOptsStyle.find(function(prdOptsStyle) { return prdOptsStyle['name'] == activeVr.p_options[1]});
    var prdOpt3Style = prdOptsStyle.find(function(prdOptsStyle) { return prdOptsStyle['name'] == activeVr.p_options[2]});
    if (opt === 'Opt1Js') {
      var varsVisible = _.filter(prVrs, { 'option1': activeVr.option1 });
      if (activeVr.option2) {
        var vars_opt2 = '', vars_unless2 = new Array, selected2 = '';
        var vars_opt3 = '', vars_unless3 = new Array, selected3 = '';
        _.forEach(varsVisible, function(variant) {
          if (_.indexOf(vars_unless2,variant.option2) == -1 && activeVr.option1 == variant.option1) {
            vars_unless2.push(variant.option2)
            var img_url = variant.featured_image ? variant.featured_image.src : null;
            var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
            var bgImage = img_url !== null && prdOpt2Style !== undefined && prdOpt2Style.color_watched && prdOpt2Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
            var active = activeVr.option2 == variant.option2 ? ' active': '';
            var maybeHide2 = vars_unless2.length > 5 ? true : false;
            vars_opt2 += '<li class="swatch-on-grid _'+ _handleize(variant.option2) + active +'" data-toggle="tooltip" data-placement="top" title="'+ variant.option2 +'" data-available="'+ variant.available +'" data-maybe-hide="'+maybeHide2+'">';
            vars_opt2 += '<span class="swatch" data-vrS="kt_'+ _handleize(variant.option2) +'" data-opt="Opt2Js" data-vrId='+ variant.id +' data-available="'+ variant.available +'" title="'+ variant.title.replace('"','&quot;')+'"'+bgImage+'>';
            vars_opt2 += '<span class="swatch-title">'+ variant.option2 +'</span><span class="comma">,</span>';
            vars_opt2 += '</span></li>';
          }
          if (activeVr.option3) {
            if (activeVr.id == variant.id) {
              vars_unless3.push(variant.option3);
              var img_url = variant.featured_image ? variant.featured_image.src : null;
              var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
              var bgImage = img_url !== null && prdOpt3Style !== undefined && prdOpt3Style.color_watched && prdOpt3Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
              var maybeHide3 = vars_unless3.length > 5 ? true : false;
              vars_opt3 += '<li class="swatch-on-grid _'+ _handleize(variant.option3) +' active" data-toggle="tooltip" data-placement="top" title="'+ variant.option3 +'" data-available="'+ variant.available +'" data-maybe-hide="'+maybeHide3+'">';
              vars_opt3 += '<span class="swatch" data-vrS="kt_'+ _handleize(variant.option3) +'" data-opt="Opt3Js" data-vrId='+ variant.id +' data-available="'+ variant.available +'" title="'+ variant.title.replace('"','&quot;')+'"'+bgImage+'>';
              vars_opt3 += '<span class="swatch-title">'+ variant.option3 +'</span><span class="comma">,</span>';
              vars_opt3 += '</span></li>';
            }
            if (_.indexOf(vars_unless3,variant.option3) == -1 && activeVr.option1 === variant.option1 && activeVr.option2 === variant.option2 && activeVr.option3 !== variant.option3) {
              vars_unless3.push(variant.option3);
              var img_url = variant.featured_image ? variant.featured_image.src : null;
              var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
              var bgImage = img_url !== null && prdOpt3Style !== undefined && prdOpt3Style.color_watched && prdOpt3Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
              var maybeHide3 = vars_unless3.length > 5 ? true : false;
              vars_opt3 += '<li class="swatch-on-grid _'+ _handleize(variant.option3) +'" data-toggle="tooltip" data-placement="top" title="'+ variant.option3 +'" data-available="'+ variant.available +'" data-maybe-hide="'+maybeHide3+'">';
              vars_opt3 += '<span class="swatch" data-vrS="kt_'+ _handleize(variant.option3) +'" data-opt="Opt3Js" data-vrId='+ variant.id +' data-available="'+ variant.available +'" title="'+ variant.title.replace('"','&quot;')+'"'+bgImage+'>';
              vars_opt3 += '<span class="swatch-title">'+ variant.option3 +'</span><span class="comma">,</span>';
              vars_opt3 += '</span></li>';
            }
          }
          if (variant.option1 == activeVr.option1 && variant.featured_image) {
            img_url = variant.featured_image.src;
          }
        });
        if(vars_unless2.length > 5) {
          vars_opt2 += '<li class="swatch-on-grid more kt_view_qs"><span class="swatch"><span class="swatch-title">'+theme.productStrings.viewMoreVariants+'+</span></span> </li>';
        }
        if(vars_unless3.length > 5) {
          vars_opt3 += '<li class="swatch-on-grid more kt_view_qs"><span class="swatch"><span class="swatch-title">'+theme.productStrings.viewMoreVariants+'+</span></span> </li>';
        }
        formJs.closest('.product-inner').find('[data-opt="Opt2Js"] .content__variants_list').html(vars_opt2);
        formJs.closest('.product-inner').find('[data-opt="Opt3Js"] .content__variants_list').html(vars_opt3);
      }
    }
    if (opt === 'Opt2Js') {
      var varsVisible = _.filter(prVrs, { 'option1': activeVr.option1 });
      if (parseInt(formJs.data('options')) == 3) {
        var vars_opt3 = '', vars_unless3 = new Array;
        _.forEach(varsVisible, function(variant) {
          if (activeVr.id == variant.id) {
            vars_unless3.push(variant.option3);
            var maybeHide3 = vars_unless3.length > 5 ? true : false;
            vars_opt3 += '<li class="swatch-on-grid _'+ _handleize(variant.option3) +' active" data-toggle="tooltip" data-placement="top" title="'+ variant.option3 +'" data-available="'+ variant.available +'" data-maybe-hide="'+maybeHide3+'">';
            vars_opt3 += '<span class="swatch" data-vrS="kt_'+ _handleize(variant.option3) +'" data-opt="Opt3Js" data-vrId='+ variant.id +' data-available="'+ variant.available +'" title="'+ variant.title.replace('"','&quot;')+'">';
            vars_opt3 += '<span class="swatch-title">'+ variant.option3 +'</span><span class="comma">,</span>';
            vars_opt3 += '</span></li>';
          }
          if (_.indexOf(vars_unless3,variant.option3) === -1 && activeVr.option1 === variant.option1 && activeVr.option2 === variant.option2) {
            vars_unless3.push(variant.option3);
            var maybeHide3 = vars_unless3.length > 5 ? true : false;
            vars_opt3 += '<li class="swatch-on-grid _'+ _handleize(variant.option3) +'" data-toggle="tooltip" data-placement="top" title="'+ variant.option3 +'" data-available="'+ variant.available +'" data-maybe-hide="'+maybeHide3+'">';
            vars_opt3 += '<span class="swatch" data-vrS="kt_'+ _handleize(variant.option3) +'" data-opt="Opt3Js" data-vrId='+ variant.id +' data-available="'+ variant.available +'" title="'+ variant.title.replace('"','&quot;')+'">';
            vars_opt3 += '<span class="swatch-title">'+ variant.option3 +'</span><span class="comma">,</span>';
            vars_opt3 += '</span></li>';
          }
          if (variant.option1 == activeVr.option1 && variant.featured_image) {
            img_url = variant.featured_image.src;
          }
        });
        if(vars_unless3.length > 5) {
          vars_opt3 += '<li class="swatch-on-grid more kt_view_qs"><span class="swatch"><span class="swatch-title">'+theme.productStrings.viewMoreVariants+'+</span></span> </li>';
        }
        formJs.closest('.product-inner').find('[data-opt="Opt3Js"] .content__variants_list').html(vars_opt3);
      }
    }
    var pInner = formJs.closest('.product-inner');
    var atc_btn = pInner.find('.add_to_cart_button');
    var img_scr = pInner.find('.primary-thumb img');
    var name_src = img_scr.attr('src') != undefined ? img_scr.attr('src').split(',')[0] : undefined;
    if (name_src == undefined) {
      name_src = img_scr.attr('srcset') != undefined ? img_scr.attr('srcset').split(',')[0] : undefined;
    }
    var imgChecked = false;
    if (activeVr.featured_image && name_src != undefined) {
      imgChecked = (name_src.split('/').slice(-1)[0]).indexOf(theme.Images.getName(activeVr.featured_image.src)) < 0 ? true : false;
    }
    if (imgChecked === true) {
      var img_url = activeVr.featured_image.src;
      var fileExt = _.last(img_url.split('.'));
      var featured_image = '<div class="primary-thumb"><img width="'+activeVr.featured_image.width+'" height="'+activeVr.featured_image.height+'" class="lazyload '+theme.Images.imgFit(activeVr.featured_image.width,activeVr.featured_image.height)+'"';
          featured_image += 'src="'+theme.Images.removeProtocol(img_url.replace('.'+fileExt, '_270x.'+fileExt))+'"';
          featured_image += 'data-src="'+theme.Images.removeProtocol(img_url.replace('.'+fileExt, '_{width}x.'+fileExt))+'"';
          featured_image += 'data-widths="[270, 360, 540, 720]"';
          featured_image += 'data-sizes="auto"';
          featured_image += 'alt="'+activeVr.featured_image.alt+'"></div>';
      pInner.find('.aspectRatio').append(featured_image);
      pInner.find('.primary-thumb').first().remove();
      pInner.find('.second-thumb').first().remove();
      atc_btn.removeClass('loading');
    }
    else{
      atc_btn.removeClass('loading');
    }
    var pId = pInner.find('[class*="ProductPrice-"]').data('id'),
        ProductVaries = pInner.find('.ProductVaries-'+pId),
        ProductPrice = pInner.find('.ProductPrice-'+pId),
        ComparePrice = pInner.find('.ComparePrice-'+pId),
        UnitPrice = pInner.find('.UnitPrice-'+pId);
    ProductVaries.addClass('d-none');
    ProductPrice.html(theme.Currency.formatMoney(activeVr.price, theme.moneyFormat)).removeClass('d-none');
    if (activeVr.compare_at_price > activeVr.price) {
      if(ComparePrice.length < 0){
        ProductPrice.after('<del class="ComparePrice-'+pId+'"></del>');
        ComparePrice = pInner.find('[class*="ComparePrice-"]');
      }
      ComparePrice.html(theme.Currency.formatMoney(activeVr.compare_at_price, theme.moneyFormat)).removeClass('d-none');
    }
    else if(ComparePrice != undefined){
      ComparePrice.addClass('d-none');
    }
    // Update and show the product's unit price if necessary
    if (activeVr.unit_price) {
      var unit_price_base_unit = activeVr.unit_price_measurement.quantity_value + activeVr.unit_price_measurement.quantity_unit;
          unit_price_base_unit += ' (<span class="unit_price">'+ theme.Currency.formatMoney(activeVr.unit_price, theme.moneyFormat) + '</span> / ';
          unit_price_base_unit += '<span class="base_unit">';
      if(activeVr.unit_price_measurement) {
        if (activeVr.unit_price_measurement.reference_value != 1) {
          unit_price_base_unit += activeVr.unit_price_measurement.reference_value;
        }
        unit_price_base_unit += activeVr.unit_price_measurement.reference_unit;
      }
      unit_price_base_unit += '</span>';
      unit_price_base_unit += '</span>)';
      if(UnitPrice.length < 0){
        ( ComparePrice || ProductPrice ).after('<del class="UnitPrice-'+pId+'"></del>');
        UnitPrice = pInner.find('.UnitPrice-'+pId);
      }
      UnitPrice.html(unit_price_base_unit).removeClass('d-none');
    } else if(UnitPrice != undefined) {
      UnitPrice.addClass('d-none');
    }
    pInner.find('input[name="id"]').val(activeVr.id);
    pInner.find('.add_to_cart_button').attr('data-vrid', activeVr.id);
    if(theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
      Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
    }
    if (activeVr.available) {
      atc_btn.prop('disabled', false).removeClass('sold_out disabled');
      if (activeVr.incoming) {
        pInner.find('.add_to_cart_button span').html(theme.productStrings.preOrder);
      }else{
        pInner.find('.add_to_cart_button span').html(theme.productStrings.addToCart);
      }
    } else {
      atc_btn.prop('disabled', true).addClass('sold_out disabled');
      pInner.find('.add_to_cart_button span').html(theme.productStrings.soldOut);
    }
    if (formJs.parents('.kt-stickyAddCart.fixed').length > 0 && $('.kt-stickyAddCart').hasClass('fixed')) {
      var productSingleObject = JSON.parse(document.getElementById('ProductJson-product-template').innerHTML);
      $('#ProductSection-product-template .fake_select li').removeClass('selected');
      $(activeVr.options).each(function(index, option) {
        var option_title = option;
        var options_change = $("#ProductSection-product-template option[value='"+option_title+"']").val();
        var $options_change_ = $("#ProductSection-product-template option[value='"+option_title+"']").parent();
        $('#ProductSection-product-template .fake_select li[data-value="'+option_title+'"]').addClass('selected');
        $('label[data-change-label="SglOptSelector-'+index+'--product-template"] .text').text(option_title);
        if(options_change != $options_change_.val()) {
          $options_change_.val(options_change).change();
        }
      });
    }
    if (formJs.parents('.table-compare').length > 0) {
      var pInner = formJs.parents('.table-compare');
      var pId = pInner.find('[class*="ProductPrice-"]').data('id'),
          ProductVaries = pInner.find('.ProductVaries-'+pId),
          ProductPrice = pInner.find('.ProductPrice-'+pId),
          ComparePrice = pInner.find('.ComparePrice-'+pId),
          UnitPrice = pInner.find('.UnitPrice-'+pId);
      ProductPrice.html(theme.Currency.formatMoney(activeVr.price, theme.moneyFormat));
      if (activeVr.compare_at_price > activeVr.price) {
        if(ComparePrice.length < 0){
          ProductPrice.after('<del class="ComparePrice-'+pId+'"></del>');
          ComparePrice = pInner.find('[class*="ComparePrice-"]');
        }
        ComparePrice.html(theme.Currency.formatMoney(activeVr.compare_at_price, theme.moneyFormat)).show();
      } else if(ComparePrice != undefined){
        ComparePrice.hide();
      }
      // Update and show the product's unit price if necessary
      if (activeVr.unit_price) {
        var unit_price_base_unit = activeVr.unit_price_measurement.quantity_value + activeVr.unit_price_measurement.quantity_unit;
            unit_price_base_unit += ' (<span class="unit_price">'+ theme.Currency.formatMoney(activeVr.unit_price, theme.moneyFormat) + '</span> / ';
            unit_price_base_unit += '<span class="base_unit">';
        if(activeVr.unit_price_measurement) {
          if (activeVr.unit_price_measurement.reference_value != 1) {
            unit_price_base_unit += activeVr.unit_price_measurement.reference_value;
          }
          unit_price_base_unit += activeVr.unit_price_measurement.reference_unit;
        }
        unit_price_base_unit += '</span>';
        unit_price_base_unit += '</span>)';
        if(UnitPrice.length < 0){
          ( ComparePrice || ProductPrice ).after('<del class="UnitPrice-'+pId+'"></del>');
          UnitPrice = pInner.find('.UnitPrice-'+pId);
        }
        UnitPrice.html(unit_price_base_unit).removeClass('d-none');
      } else if(UnitPrice != undefined) {
        UnitPrice.addClass('d-none');
      }
      if (activeVr.available) {
        pInner.find('.Availability-'+pId).text(theme.productStrings.inStock).addClass('in_stock');
      } else {
        pInner.find('.Availability-'+pId).text(theme.productStrings.outOfStock).removeClass('in_stock');
      }
      if(theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
        Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
      }
    }    
    formJs.closest('.product-inner').find('[data-opt="Opt1Js"] .n_selected').html(activeVr.option1);
    formJs.closest('.product-inner').find('[data-opt="Opt2Js"] .n_selected').html(activeVr.option2);
    formJs.closest('.product-inner').find('[data-opt="Opt3Js"] .n_selected').html(activeVr.option3);
    formJs.trigger({type: 'variantChange',variant: activeVr});
  }
  $(document).on('click','.product-loop-variants .swatch-on-grid:not(.more) .swatch', function(event) {
    var url = $(this).attr('data-view');
    var $this = $(this);
    var formJs = $this.closest('.product-inner').find('form[data-section-id]').last();
    formJs.closest('.product-inner').find('.add_to_cart_button').addClass('loading');
    formJs.closest('.product-inner').find('[data-opt="'+$this.data('opt')+'"] .variants_list li.active').removeClass('active');
    $this.parent().addClass('active');
    var activeVrOpt1 = formJs.closest('.product-inner').find('[data-opt="Opt1Js"] .variants_list li.active').attr('title');
    var activeVrOpt2 = formJs.closest('.product-inner').find('[data-opt="Opt2Js"] .variants_list li.active').attr('title');
    var activeVrOpt3 = formJs.closest('.product-inner').find('[data-opt="Opt3Js"] .variants_list li.active').attr('title');
    var varTitle = activeVrOpt1 + (activeVrOpt2 !== undefined ? ' / '+ activeVrOpt2 : '') + (activeVrOpt3 !== undefined ? ' / '+ activeVrOpt3 : '');
    if (theme.psjson_lib[formJs.data('p-id')] == undefined) {
      $.ajax({
        url: url+'?view=vrsjson',
        type: 'GET'
      })
      .done(function(data) {
        // console.log("success");
        theme.psjson_lib[formJs.data('p-id')] = JSON.parse(data.replace(/<!--.*?-->/g, ""));
        vars_change($this.data('vrid'),varTitle,$this.data('opt'),theme.psjson_lib[formJs.data('p-id')],formJs);
      })
      .fail(function() {
        // console.log("error");
      })
      .always(function() {
        // console.log("complete");
      });
    } else {
      vars_change($this.data('vrid'),varTitle,$this.attr('data-opt'),theme.psjson_lib[formJs.data('p-id')],formJs);
    }
  });
});

theme.card_grid_size = (function() {  
  function init() {
    theme.card_grid_size.check();
    $(window).resize($.throttle( 250, theme.card_grid_size.resize));
  }
  function resize() {
    $('.smallCard,.normalCard,.largeCard,.hugeCard').addClass('--card');
    theme.card_grid_size.check();
  }
  function check() {
    $('.product-card.--card').each(function() {
      var $this = $(this);
      if ($this.is(':visible')) {
        $this.removeClass('--card');
        var parentWidth = $this.width();
        $this.removeClass('ssmallCard smallCard normalCard largeCard hugeCard');
        if(parentWidth > 550) {
          $this.addClass('hugeCard');
        }
        else if(parentWidth > 350) {
          $this.addClass('largeCard');
        }
        else if(parentWidth <= 240 && parentWidth > 180 ) {
          $this.addClass('smallCard');
        }
        else if(parentWidth <= 180) {
          $this.addClass('ssmallCard smallCard');
        }
        else{
          $this.addClass('normalCard');
        }
      }
    });
  }
  return {
    init: init,
    check: check,
    resize: resize
  }
})();

theme.Quantity = (function() {
  $(document).on('click', '.quantity-up, .qtyplus',function(event) {
    event.preventDefault();
    var spinner = $(this).closest('.quantity'),
        input = spinner.find('input.input-qty'),
        min = input.attr('data-min') || 0,
        max = input.attr('data-max');
    var oldValue = parseFloat(input.val());
    if (oldValue >= max) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue + 1;
      input.val(newVal).trigger("change");
    }
  });
  $(document).on('click', '.quantity-down, .qtyminus',function(event) {
    event.preventDefault();
    var spinner = $(this).closest('.quantity'),
        input = spinner.find('input.input-qty'),
        min = input.attr('data-min') || 0,
        max = input.attr('data-max');
    var oldValue = parseFloat(input.val());
    if (oldValue <= min) {
      var newVal = oldValue;
    } else {
      var newVal = oldValue - 1;
      input.val(newVal).trigger("change");
    }
  });
  $(document).on('change', '.quantity input.input-qty', function() {
    // $(this).parent().find('.fake-select-qty').remove();
    var input = $(this),max = input.attr('max');
    if( parseFloat(input.val()) > parseFloat(max) ) {
      input.val(parseFloat(max)).trigger("change");
    }
    if( $(this).parents('form').length > 0 ) {
      $(this).parents('form').find('input[type="hidden"][name="quantity"]').remove();
    }
  });
});

theme.initPhotoSwipeFromDOM = (function(gallerySelector, elcloned, tgName, callback) {
  $('.pswp').removeAttr('style');
  // loop through all gallery elements and bind events
  var galleryElements = $( gallerySelector );
  // parse slide data (url, title, size ...) from DOM elements 
  // (children of gallerySelector)
  var parseThumbnailElements = function(el) {
    // build items array
    var itemsArray = $(el).find(elcloned+' [data-size]');
    var items = [];
    _.forEach(itemsArray, function(elItem, idx) {
      var item = new Object();
      item['src'] = $(elItem).attr('data-srcfix');
      item['w'] = $(elItem).attr('data-size').split('x')[0];
      item['h'] = $(elItem).attr('data-size').split('x')[1];
      items.push(item)
    });
    return items;
  };

  // find nearest parent element
  var closest = function closest(el, fn) {
    return el && ( fn(el) ? el : closest(el.parentNode, fn) );
  };

  // triggers when user clicks on thumbnail
  var onThumbnailsClick = function(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    // find root element of slide
    var clickedListItem = closest(eTarget, function(el) {
      return (el.tagName && el.tagName.toUpperCase() === tgName);
    });
    if(!clickedListItem) {
      return;
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    var clickedGallery = $(clickedListItem).parents(gallerySelector),
        childNodes = clickedGallery.find(elcloned+' [data-size]'),
        numChildNodes = childNodes.length,
        nodeIndex = 0,
        index;
    for (var i = 0; i < numChildNodes; i++) {
      if(childNodes[i] === clickedListItem) {
        index = nodeIndex;
        break;
      }
      nodeIndex++;
    }
    if(index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe( index, clickedGallery );
    }
    return false;
  };

  var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = $('.pswp')[0],
        gallery,
        options,
        items;

    items = parseThumbnailElements(galleryElement);

    // define options (if needed)
    options = {
      // history & focus options are disabled
      history: false,
      focus: false,

      // define gallery index (for URL)
      galleryUID: $(galleryElement).attr('data-pswp-uid'),

      getThumbBoundsFn: function(index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = $(galleryElement).find(elcloned+' [data-size]')[index], // find thumbnail
            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect(); 

        return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
      },
      shareButtons: [
        {id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
        {id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
        {id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'}
      ]

    };

    // PhotoSwipe opened from URL
    if(fromURL) {
      if(options.galleryPIDs) {
        // parse real index when custom PIDs are used 
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for(var j = 0; j < items.length; j++) {
          if(items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if( isNaN(options.index) ) {
      return;
    }

    if(disableAnimation) {
      options.showAnimationDuration = 0;
    }
    
    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
    gallery.listen('afterChange', function() {
      callback(gallery.getCurrentIndex(),gallery.currItem)
    });
  };

  for(var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i+1);
    galleryElements[i].onclick = onThumbnailsClick;
  }
})

theme.imgs360 = (function(files,position,width,height,vrId) {
  var totalFrames = position[1] - position[0];
  var mdl_tpl = '<section class="modal fade md_qvModalThreeSixty kt_630-'+vrId+'" aria-hidden="false" role="dialog" tabindex="-1" data-vr-id="'+vrId+'" data-total-frames="'+totalFrames+'" data-end-frames="'+totalFrames+'" data-files="'+files+'" data-width="'+width+'" data-height="'+height+'"> <div class="modal-dialog modal-dialog-centered modal-lg modal-xl"> <div class="modal-content"> <button class="close" aria-label="Close" data-dismiss="modal" type="button"> <span aria-hidden="true">×</span> </button> <div class="content-item"> <div class="threesixty productThreeSixty"> <div class="spinner"> <span>0%</span> </div><ol class="threesixty_images"></ol> </div></div></div></div></section>';
  $('body').append(mdl_tpl);
  var mdl = $('.kt_630-'+vrId);
  $(document).on('click','button.kt_open360_'+vrId,function(e) {
    mdl.modal();
    if(mdl.find('.threesixty_images li').length > 0) {return false}
    var options = {
      totalFrames: mdl.attr('data-total-frames'),
      endFrame: mdl.attr('data-end-frames'), 
      currentFrame: 1, 
      imgList: '.threesixty_images', 
      progress: '.spinner',
      imgArray: mdl.attr('data-files').split(','),
      width: mdl.attr('data-width'),
      height: mdl.attr('data-height'),
      responsive: true,
      navigation: true
    }
    mdl.find('.productThreeSixty').ThreeSixty(options);
  });
  mdl.on('hidden.bs.modal', function () {
    mdl.find('.nav_bar_stop').trigger('click')
  })
})

window.theme = theme || {};
theme.cookiesPopup = (function() {
  function init(container) {
    var popup = $('.kt-cookies-popup');
    setTimeout(function() {
      popup.addClass('popup-display');
      popup.on('click', '.cookies-accept-btn', function(e) {
        e.preventDefault();
        acceptCookies();
      })
    }, 2500);

    var acceptCookies = function() {
      popup.removeClass('popup-display').addClass('popup-hide');
      localStorage.setItem("kt_cookies", "accepted")
    };
    if(localStorage.getItem("kt_cookies") == 'accepted') {
      popup.removeClass('popup-display').addClass('popup-hide');
    }
  }
  return init;
})();
theme.cookiesPopup.prototype = _.assignIn({}, theme.cookiesPopup.prototype, {
  onSelect: function(evt) {
    localStorage.removeItem("kt_cookies");
    $('.kt-cookies-popup').addClass('popup-display').removeClass('popup-hide');
  }
});

window.theme = theme || {};
theme.lookBook = (function() { 
  function lookBook(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    KT.loadScript('tippy', function(e,l) {
      if (l == 'ok') {
        $.each($container.find('.kt_pin[data-product-handle]'), function(index, el) {
          tippy(this, {
            content: function(reference) {
              var template = $('.kt_pin_pritem[data-product-handle="'+$(reference).attr('data-product-handle')+'"]')[0];
              return template.outerHTML;
            },
            allowHTML: true,
            sticky: true,
            interactive: true
          });
        });
      }
    })
  }
  return lookBook;
})();

theme.wokerktlz = (function() {
  function init() {
    theme.wokerktlz.load();
    $(window).resize($.throttle( 100, theme.wokerktlz.load));
    $(window, '.modal-open .modal').scroll($.throttle( 100, theme.wokerktlz.load));
  }
  function createWorkerktlz(element) {
    var blob = new Blob([localStorage.getItem('workerktlz')], { type: "text/javascript", async: true });
    var myWorker = theme.myWorker = new Worker(window.URL.createObjectURL(blob));
    if(theme.myWorker === undefined) {return true}
    myWorker_onmessage(element);
  }
  function KlzDynamicVariantsLoader(loadDeferral, visibilityBuffer, skipHidden) {
    loadDeferral = loadDeferral == undefined ? "onVisible" : loadDeferral;
    visibilityBuffer = visibilityBuffer == undefined ? 300 : visibilityBuffer;
    skipHidden = skipHidden == undefined ? 1 : skipHidden;
    var loadComplete = false;
    var getWindowHeight = function() {
      if (undefined !== self.innerHeight) {
        return self.innerHeight;
      } else {
        if (undefined !== document.documentElement && undefined !== document.documentElement.clientHeight) {
          return document.documentElement.clientHeight;
        } else {
          if (undefined !== document.body) {
            return document.body.clientHeight;
          }
        }
      }
    };
    var getVerticalScrollPosition = function() {
      if (undefined !== document.documentElement && document.documentElement.scrollTop) {
        return document.documentElement.scrollTop;
      } else {
        if (undefined !== document.body) {
          return document.body.scrollTop;
        }
      }
    };
    var isHidden = function(element) {
      return skipHidden && (element.offsetWidth <= 0 || element.offsetHeight <= 0);
    };
    var getVerticalPosition = function(element) {
      if (!element) {
        return 0;
      }
      var verticalPosition = element.offsetTop;
      var parent = element;
      while (parent = parent.offsetParent) {
        verticalPosition += parent.offsetTop;
      }
      return verticalPosition;
    };
    var shouldLoadNow = function(element) {
      var loadDeferralByElement = element.getAttribute('data-ktlz');
      if(loadDeferralByElement !== null) {loadDeferral = loadDeferralByElement};
      switch (loadDeferral) {
        case "onLoad":
          if (loadComplete) {
            return true;
          }
        case "onVisible":
          return !isHidden(element) && ((getVerticalScrollPosition() - visibilityBuffer) <= getVerticalPosition(element) && getVerticalPosition(element) <= (getWindowHeight() + getVerticalScrollPosition() + visibilityBuffer));
        case "instant":
        default:
          return true;
      }
    };
    var loadDynamicVariants = function() {
      $.each($(".ktlz"), function(idx, el) {
        var element = this;
        if (!shouldLoadNow(element) || $(element).hasClass("ktlz-loaded") || $(element).attr('data-href') === undefined) {return true}
        if (theme.myWorker) {
          myWorker_onmessage(element);
        }
        else if(KT.checkVersion('workerktlz') && !theme.function.variantsLoad) {
          theme.function.variantsLoad = true;
          $.ajax({
            url: theme.extensions.workerktlz,
            type: 'GET',
            dataType: 'html'
          })
          .done(function(data) {
            KT.pushVersion('workerktlz');
            localStorage.setItem('workerktlz', data);
          })
          .fail(function() {
            // console.log("error");
          })
          .always(function() {
            // console.log("complete");
            createWorkerktlz(element);
          });
        }
        else if(!theme.function.variantsLoad) {
          theme.function.variantsLoad = true;
          createWorkerktlz(element);
        }
      });
    };
    loadComplete = true;
    return loadDynamicVariants();
  }
  function myWorker_onmessage(element) {
    var $el = $(element);
    theme.myWorker.onmessage = function(e) {
      var ktlzFormPid = $(".ktlz-form-pid-"+e.data.pId);
      $.each(ktlzFormPid, function(idx, el) {
        var $this = $(this);
        $this.find('.prd--option1').html(e.data.html.option1).removeClass('animated-background');
        $this.find('.prd--option2').html(e.data.html.option2).removeClass('animated-background');
        $this.find('.prd--option3').html(e.data.html.option3).removeClass('animated-background');
        // $this.attr("data-pr-vrs", JSON.stringify(e.data.pJson.variants));
        theme.psjson_lib[e.data.pId] = e.data.pJson.variants;
        if ($this.find('[name="id"]').length <= 0 && $this.data('noneid') !== true) {
          $this.append(e.data.html.input);
        }
        if (typeof $.fn.tooltip == 'function') {
          $this.find('[data-toggle="tooltip"]').tooltip();
        }
        $.each(currTags_handleize, function(index, val) {
          if(val.indexOf('color:') === 0) {
            var val = val.split(':')[1].split(',')[0];
            $this.find('.swatch-on-grid._'+val+ ' .swatch').trigger('click');
            $this.find('.swatch-on-grid._'+val+'[data-maybe-hide="true"]').attr('data-maybe-hide',false);
            return true;
          }
          if (val.indexOf('color-') === 0) {
            $this.find('.swatch-on-grid._'+val.replace('color-','')+ ' .swatch').trigger('click');
            $this.find('.swatch-on-grid._'+val.replace('color-','')+'[data-maybe-hide="true"]').attr('data-maybe-hide',false);
            return true;
          }
        });
        $this.trigger({type: 'variantsLoaded',variant: e.data.variant});
      });
    }
    var postWorkerData = {
      rootUrl: Shopify.shop_url,
      handleProduct: $el.attr('data-href'),
      prdOptsStyle: theme.function.productGridOptionStyle,
      currentVariant: $el.find('input[name="id"]').val() || null,
      moreText: theme.productStrings.viewMoreVariants
    }
    theme.myWorker.postMessage(postWorkerData); // Start the worker.
    $el.removeClass('ktlz').add("ktlz-loaded");
  }
  return {
    init: init,
    load: KlzDynamicVariantsLoader
  }
})();

theme.resize_card_grid = (function(el) {
  function updateLayout(mutationsList) {
   $('.ly__ms_items').isotope('layout');
  }
  var listObserver_masorySection = new MutationObserver(updateLayout);
  $.each($('.product-body:not(.on_live)'), function(idx, el) {
    listObserver_masorySection.observe(this, { childList: true, subtree: true })
    $(this).addClass('on_live')
  });
})

theme.lazyListener = (function(container) {
  var el = container !== undefined ? container + ' ' : '';
  var initializeFunc = function($el) {
    var $this = $el;
    if ($this.find('.shopify-section').children().length <= 0) {
      $this.find('.shopify-section').remove()
    }
    $this.find('.shopify-section').children().unwrap();
    if ($this.find('[data-section-type="swiper-section"]').length > 0) {
      theme.SwiperSection($this.find('[data-section-type="swiper-section"]')[0]);
    } else {
      if (typeof KT.countdown == 'function'){
        KT.countdown();
      }
    }
    theme.wokerktlz.load();

    //currency
    if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
      Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
    }
    if($this.find('[data-respon]').length > 0) {
      KT.respSpaceSc($this.find('[data-respon]'));
    }
    $('.tab-content').removeClass('including').css('height', '');
    if ($this.find('[name="checkout_url"]').length > 0) {
      $this.find('[name="checkout_url"]').val($this.data('checkout-url'));
    }
    //product review
    if ($(".spr-badge").length > 0 && typeof window.SPR == 'function') {
      return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
    }
  }
  document.addEventListener('lazyincluded', function(event) {
    if (event.detail.content) {
      $(event.target).find('.shopify-section').children().unwrap();
      initializeFunc($(event.target))
    }
  });
  $.each($(el+'[data-include]:not(.lazyloaded)'), function(el, idx) {
    this.addEventListener('lazyincludloaded', function(event) {
      if (event.detail.content.indexOf('<!--lz_sc-->') != -1) {
        event.detail.content = event.detail.content.split('<!--lz_sc-->')[1]
      }
    });
  });
});

window.theme = theme || {};
theme.cookiesPopup = (function() {
  function init(container) {
    var popup = $('.kt-cookies-popup');
    setTimeout(function() {
      popup.addClass('popup-display');
      popup.on('click', '.cookies-accept-btn', function(e) {
        e.preventDefault();
        acceptCookies();
      })
    }, 2500);

    var acceptCookies = function() {
      popup.removeClass('popup-display').addClass('popup-hide');
      localStorage.setItem("kt_cookies", "accepted")
    };
    if(localStorage.getItem("kt_cookies") == 'accepted') {
      popup.removeClass('popup-display').addClass('popup-hide');
    }
  }
  return init;
})();
theme.cookiesPopup.prototype = _.assignIn({}, theme.cookiesPopup.prototype, {
  onSelect: function(evt) {
    localStorage.removeItem("kt_cookies");
    $('.kt-cookies-popup').addClass('popup-display').removeClass('popup-hide');
  }
});

window.theme = theme || {};
theme.ageVerModal = (function() {
  function ageVerModal(container) {    
    var ageVerModal = $("#ageVerModal");
    ageVerModal.on('show.bs.modal', function (e) {
    })
    ageVerModal.on('hidden.bs.modal', function (e) {
      sessionStorage.setItem('ageVer', 'hide');
      $('html').removeClass('ageVerModal');      
      if ($('#hideforever_ageVer').is(':checked')) {
        localStorage.setItem('ageVer', 'hide');
      } else {
        localStorage.removeItem('ageVer');
      }
    })
    if (ageVer !== 'hide') {
      ageVerModal.modal({
        backdrop: 'static' 
      });
    }
    $(document).on('click', '.verification-failed-btn', function(event) {
      event.preventDefault();
      $('.verification-failed').show();
      ageVerModal.find('.btn,p,.custom-control').hide();
    });
  }
  return ageVerModal;
})();
theme.ageVerModal.prototype = _.assignIn({}, theme.ageVerModal.prototype, {
  onSelect: function(evt) {
    localStorage.removeItem("ageVer");
    sessionStorage.removeItem("ageVer");
    $("#ageVerModal").modal({
      backdrop: 'static' 
    });
  }
});

window.theme = theme || {};
theme.FooterSection = (function() {
  function Footer(container) {
    var btnToggle = 'footer .widget-title:not(.not_drop)';
    if(theme.window_W < 576) {
      $(btnToggle).addClass('onHide');
    }
    $(document).on('click',btnToggle,function(e) {
      if(theme.window_W >= 576) {return}
      e.preventDefault();
      $(this).next().toggle('slideUp');
      $(this).toggleClass('onHide');
    });
  }
  return Footer;
})();

theme.toast = (function({ title = "", message = "", type = "info", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
    const toast = document.createElement("div");
    // Auto remove toast
    const autoRemoveId = setTimeout(function () {
      main.removeChild(toast);
    }, duration + 1000);

    // Remove toast when clicked
    toast.onclick = function (e) {
      if (e.target.closest(".toast__close")) {
        main.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };
    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="svg-icon bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>',
      error: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="svg-icon bi bi-exclamation-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>',
    };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);
    toast.classList.add("toast", `toast--${type}`);
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
    toast.innerHTML = `<div class="toast__icon">${icon}</div>`
                    +`<div class="toast__body">`
                    +`<h3 class="toast__title">${title}</h3><p class="toast__msg">${message}</p>`
                    +`</div>`
                    +`<div class="toast__close">`
                    +`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="svg-icon bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`
                    +`</div>`;
    main.appendChild(toast);
  }
});

$(document).ready(function() {
  theme.lazyListener();
  theme.is_mobile = theme.MenuReposive.is_mobile();
  theme.window_W = $(window).width();
  theme.window_H = $(window).height();
  var sections = new theme.Sections();
  sections.register('header-section', theme.HeaderSection);
  sections.register('mega_mn-vertical', theme.MegamnVerticalSection);
  sections.register('header-mobile-section', theme.HeaderMbSection);
  sections.register('swiper-section', theme.SwiperSection);
  sections.register('product', theme.Product);
  sections.register('store-availability', theme.StoreAvailability);
  sections.register('collection-template', theme.CollSection.init);
  sections.register('collection-filter', theme.Filters);
  sections.register('masonry-section', theme.MasonrySection);
  sections.register('instagram-section', theme.Instagram);
  sections.register('banner-section', theme.BannerSection);
  sections.register('banner-video-section', theme.BannerVideoSection);
  sections.register('countdown-section', theme.ktCountdown);
  sections.register('countto-section', theme.ktCountTo);
  sections.register('masonry-prds-section', theme.PrdsMasonrySection);
  sections.register('portfolio-masonry',theme.portfolioMasorySection.MasorySection);
  sections.register('kt-cookies', theme.cookiesPopup);
  sections.register('kt-ageVer', theme.ageVerModal);
  sections.register('kt-lookbook', theme.lookBook);
  sections.register('footer-section', theme.FooterSection);
  theme.variantChange();
  theme.Quantity();
  theme.DropdownReposive.init('.kt--drop-w','.kt--drop-i','.kt--drop-in');
  if (!Shopify.designMode) {
    if (theme.gadget.cookies_infor && localStorage.getItem("kt_cookies") !== 'accepted' && templateName !== 'password') {
      $.ajax({
        url: Shopify.root_url+'/?section_id=cookies_popup',
        type: 'GET',
        dataType: 'html'
      })
      .done(function(data) {
        $('.content_for_extension').append(data);
        sections.register('kt-cookies', theme.cookiesPopup);  
      })
    }
  }
  KT.loadScript('color_sw', function(e,l) {});
  KT.loadScript('molla_icon', function(e,l) {});
  KT.loadScript('molla_font', function(e,l) {});
  if (theme.link_google_f !== '') {
    KT.loadScript('google_f', function(e,l) {});
  }
  if ($('[data-section-type="collection-filter"]').length > 0) {
    KT.loadScript('pjax', function(e,l) {
      if (l == 'ok') {
        theme.collPjax();
      }
    })
  }
  theme.card_grid_size.init();
  theme.wokerktlz.init();

  function check(mutationsList, observer) {
    var return_ = false;
    for (i = 0; i < mutationsList.length; i++) {
      var mutation = mutationsList[i].target.outerHTML;
      if (mutation.includes('ktlz')) {
        theme.wokerktlz.load();
        return_ = true;
      }
      if (mutation.includes('--card')) {
        theme.card_grid_size.check();
        return_ = true;
      }
      if (return_) {return false}
    }
  }
  var observer_lz_vrs = new MutationObserver($.throttle( 200, check));
  observer_lz_vrs.observe(document.querySelector('body'), { attributes: true, childList: true, subtree: true })
});

$(window).on("resize", function() {
  theme.is_mobile = theme.MenuReposive.is_mobile();
  theme.window_W = $(window).width();
  theme.window_H = $(window).height();

  if($('#header-ontop .ResizedNavMegaScroll').length > 0) {
    $('#header-ontop .ResizedNavMegaScroll').removeClass('ResizedNavMegaScroll')
  }
  if($('.kt--filter-grs-m').length > 0) {
    if (theme.window_W >= 768 && $('.kt--filter-grs-m').html() != '') {
      $('.kt--filter-grs-d').html($('.kt--filter-grs-m').html())
    }
    else if(theme.window_W < 768 && $('.kt--filter-grs-d').html() != '') {
      $('.kt--filter-grs-m').html($('.kt--filter-grs-d').html())
    }
  }
  theme.ResizeNavMega.init();
  theme.DropdownReposive.init('.kt--drop-w','.kt--drop-i','.kt--drop-in');
});
$(window).scroll(function() {
  if(theme.window_W < 768 && !theme.attrTheme || theme.window_W >= 768 && theme.attrTheme) {
  if(theme.attrTheme) {theme.attrTheme = false}else{theme.attrTheme = true}
  $.ajax({
    type: "POST",
    url: Shopify.root_url+'/cart.js',
    data: {"attributes[theme_mobile]": theme.attrTheme},
    dataType: 'json'});
  }
});

if ($('.kt--filter-js a[data-action="infinity"]').length > 0) {
  KT.loadScript('pjax', function(e,l) {
    if (l == 'ok') {
      $('.kt--filter-js a[data-action="infinity"]').addClass('listened');
      $(window).scroll($.throttle( 250,theme.CollSection.infinityLoad));
    }
  })
}
if ($('#header-ontop .header').length <= 0 && $('[data-header-sticky]').data('header-sticky') === true) {
  $(window).scroll($.throttle( 250, theme.MenuReposive.clone_header_ontop));
  $(window).resize($.throttle( 250, theme.MenuReposive.clone_header_ontop));
}
theme.init = function() {
  theme.customerTemplates.init();

  $(document).on('click', 'a[href="#"]', function(evt) {
    evt.preventDefault();
  });

  $('[data-toggle="tooltip"]').tooltip({trigger : 'hover'});

  if(Shopify.designMode && createPagesByTheme) {
    if (!theme.csrfToken) {
      $.ajax({
        type: "GET",
        url: "/admin/themes/"+Shopify.theme.id,
        success: function (data){
          theme.csrfToken = data.split('name="csrf-token"')[1].split(" />")[0].split('"')[1];
          theme.createPages();
        }
      });
    } else {
      theme.createPages();
    }
    theme.createPages = function() {
      var pages = [
        {
          "title": "Vertical menu Builder",
          "handle": "vertical-menu",
          "template_suffix": "vertical-menu"
        },
        {
          "title": "Products Wishlist",
          "handle": "wishlist",
          "template_suffix": "wishlist"
        },
        {
          "title": "Products Wishlist Local",
          "handle": "wishlist-local",
          "template_suffix": "wishlist-local"
        },
        {
          "title": "Edit additional information",
          "handle": "edit-additional-information",
          "template_suffix": "prd-additional"
        }
      ];
      pages.forEach(function(page) {
        $.ajax({
          url: '/admin/api/2021-07/pages.json',
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-csrf-token": theme.csrfToken
          },
          type: 'POST',
          data: {"page": page},
          success: function (data){
            console.log("Success page: "+ page.title);
          },
          error: function(data) {
            console.log("error page: "+ page.title);
          }
        })
      })
    }
  }
  if(Shopify.designMode) {
    // Reset cart attributes
    if(theme.cartAttributes.length > 1) {
      $.ajax({
        type: "POST",
        url: Shopify.root_url+'/cart.js',
        data: {
          "attributes": {
            "theme_align":'',
            "theme_light":'',
            "theme_coll_layout":''
          }
        },
        dataType: 'json',
        success: function() {}
      });
    }
    if (theme.role === 'the4') {
      window.parent.$ && window.parent.$.ajax({
        type: "PUT",
        url: window.parent.location.pathname.split('/themes/')[0] + '/api/2021-07/themes/'+Shopify.theme.id+'.json',
        dataType: 'json',
        data: {
          "theme": {
            "id": Shopify.theme.id,
            "role": "unpublished"
          }
        },
        success: function(data) {
          // console.log(data)
        }
      });
    }
  }
};

$(theme.init);