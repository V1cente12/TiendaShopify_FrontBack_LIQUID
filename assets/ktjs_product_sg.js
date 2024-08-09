window.slate = window.slate || {};

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();
    this.template = this.originalSelectorId.replace('#ProductSelect-','');
    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = _.assignIn({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {

      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();
      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });
      if (!variant) {
        return;
      }
      this.$container.trigger({
        type: 'updateVariant',
        variant: variant
      });

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      if($('.color_sw.selected .swatch').length != 0){
        var firstVariantImage = $('.color_sw.selected .swatch').css( 'background-image' ).replace('_small_crop_center','').replace(/(url\(|\)|'|")/gi, '');
      }
      var variantImage = variant.featured_media || {};
      var currentVariantImage = $('.p-sgl__photos-'+this.template + ' .swiper-slide-active').attr('data-src') || {};
      if (!variant.featured_media && firstVariantImage == undefined || variantImage.src === currentVariantImage && firstVariantImage == undefined) {
        return;
      }
      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
      
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }
      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant sku changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantSKUChange
     */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }

      this.$container.trigger({
        type: 'variantSKUChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);
    }
  });

  return Variants;
})();

theme.Product = (function() {
  function Product(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var productsectionId = $container.attr('data-product-id');
    theme.ktCountdown(container);

    this.settings = {
      // Breakpoints from src/stylesheets/global/variables.scss.liquid
      enableHistoryState: $container.data('enable-history-state') || false,
      imageSize: "720x720",
      sectionId: sectionId,
      zoomEnabled: $container.data('use-zoom'),
      thumbEnabled: $container.data('use-thumb'),
      imagesLayout: $container.data('images-layout'),
      ajaxCart: $container.data('enable-ajax-cart') || false
    };
    this.selectors = {
      template: '#ProductSection-' + sectionId,
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      variesPrice: '#ProductVaries-' + sectionId,
      unitPrice: '#UnitPrice-' + sectionId,
      SKU: '.variant-sku',
      originalSelectorId: '#ProductSelect-' + sectionId,
      productPhotosWrapper: '.photos-wrapper-' + sectionId,
      productPhotos: '.p-sgl__photos-' + sectionId,
      productPhotoImages: '.p-sgl__photo--' + sectionId,
      productThumbsWrapper: '.thumbs-wrapper-' + sectionId,
      productThumbs: '.p-sgl__thumbs-' + sectionId,
      productThumbImages: '.p-sgl__thumb--' + sectionId,
      singleOptionSelector: '.sgl-opt-selector-' + sectionId,
      dataSettings: '.datasettings--' + sectionId,
      dataJs: '.datajs--' + sectionId,
      cartForm: '#cart-form--' + sectionId,
      progressBar: '.progress_bar-' + sectionId,
      realTime: '.realTime-' + sectionId,
      dateFromTo: '.prd_delivery-' + sectionId,
      shipBL: '.shipBL-' + sectionId,
      storeAvailabilityContainer: '[data-store-avai-container]'
    }

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);
    this.previewImage = _.map(this.productSingleObject.media,"preview_image");
    this.modelsObject = JSON.parse(document.getElementById('ModelJson-' + sectionId).innerHTML);
    this.dataSettings = $(this.selectors.dataSettings).data();
    this.dataSettings.progressBar = $(this.selectors.progressBar).length;
    this.dataSettings.realTime = $(this.selectors.realTime).length;
    this.dataSettings.dateFromTo = $(this.selectors.dateFromTo).length;
    this.dataJs = $(this.selectors.dataJs).data();
    this.currentMedia = '';
    this.storeAvailabilityContainer = $container.find(this.selectors.storeAvailabilityContainer)[0];
    if (this.storeAvailabilityContainer) {
      this._initStoreAvailability();
    }
    var self = this;
    if (sectionId == 'quickview-template') {
      setTimeout(function() {
        self._initBreakpoints();
      }, 400);
    } else {
      if(this.settings.imagesLayout === 'masonry' && theme.window_W >= 992){
        if ($(self.selectors.productThumbImages).length >= 1) {
          $(self.selectors.productThumbsWrapper+':not(.first)').addClass('has-its');
        }
        if ($(self.selectors.productPhotoImages).length >= 1) {
          $(self.selectors.productPhotosWrapper+':not(.first)').addClass('has-its');
        }
        this._initIsotope();
        self._initPhotoSwipeFromDOM();
        self._initPhotoZoom(false);
        if ($(self.selectors.template+" iframe#resize-info-product").length > 0) {
          this._initStickySummary();
          self._onReSizeInfo();
        }
      } else {
        this._initBreakpoints();
      }
    }
    this._stringOverrides();
    this._initVariants();
    this._initImageSwitch();
    this._initSwatch();
    if(this.dataJs.imgspos360.length > 0){
      this._create360();
    }
    if(this.dataSettings.useMaxheight) {
      if($(self.selectors.template+" iframe#resize-image-product").length > 0 || $(self.selectors.template+" iframe#resize-image-product-qv").length > 0){
        this._onReSizeImages();
      }
    }
    if(this.dataSettings.stickyatc){
      this._stickyAddCart();
    }
    this._AjaxForm();
    if(theme.gadget.shipTo && theme.gadget.shipToCs == false){
      this._shipTo(this.selectors.shipBL);
    }
    if (this.dataSettings.progressBar) {
      this._stockCountdown().init(this.selectors.progressBar);
    }
    if (this.dataSettings.realTime) {
      this._realTimeVisitor(this.selectors.realTime);
    }
    if (this.dataSettings.dateFromTo) {
      this._dateFromTo(this.selectors.dateFromTo);
    }
    if ($(self.selectors.template +' .table-products').length > 0) {
      this._responTableGroup();
    }
    if (this.variants.currentVariant.featured_media && this.variants.currentVariant.featured_media.preview_image) {
      this.currentMedia = this.variants.currentVariant.featured_media.preview_image;
    }
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initStoreAvailability: function() {
      this.storeAvailability = new theme.StoreAvailability(
        this.storeAvailabilityContainer
      );
    },

    _initBreakpoints: function() {
      var self = this;
      var current_window_width = theme.window_W;
      KT.loadScript('swiper', function(e,l){
        if (l == 'ok') {
          // initialize thumbnail slider on mobile if more than three thumbnails
          if ($(self.selectors.productThumbImages).length >= 1) {
            self._initThumbnailSlider();
          }
          // initialize photo slider
          if ($(self.selectors.productPhotoImages).length >= 1) {
            self._initPhotoSlider();
          }
          // Changes slider direction
          $(window).on("resize", function() {
            if(current_window_width >= 576 && theme.window_W < 576 || current_window_width < 576 && theme.window_W >= 576){
              if (self.dataSettings.useThumbVertical) {
                if (typeof self.thumbSlider === 'object') {
                  self.thumbSlider.changeDirection();
                }
                else if ($(self.selectors.productThumbImages).length >= 1) {
                  self._initThumbnailSlider();
                }
              }
              current_window_width = theme.window_W;
            }
          })
        }
      })
    },

    _initIsotope: function() {
      var self = this;
      KT.loadScript('isotope', function(e,l){
        if (l == 'ok') {
          var $grid = $(self.selectors.productPhotos).isotope({
            // disable initial layout
            initLayout: false,
            itemSelector: '.p-sgl__photos-item',
            percentPosition: true,
            masonry: {
              columnWidth: '.grid-sizer'
            }
          });
          $grid.one( 'arrangeComplete', function() {
            self._mediaSlider(false);
          });
          $grid.isotope();
        }
      });
    },

    _initSwatch: function() {
      var self = this;
      $(self.$container).on('click', '.--js-opt', function(e) {
        e.preventDefault();
        var $this = $(this);
        goto = true;
        optionIndex = $this.parents('.--js-selector').data('js-opt');
        optionValue = $this.data('value');
        var selector = self.selectors.template+' .--js-selector[data-js-opt="'+optionIndex+'"]', $selector = $(selector);
        $(selector+' .--js-opt').removeClass('selected');
        $(selector+' .--js-opt[data-value="'+optionValue+'"]').addClass('selected');
        if($selector.find(".fake_select.variant_image").length){
          $selector.find(".fake_select.variant_image li").removeClass('selected');
          $selector.find('.fake_select.variant_image li[data-value="'+optionValue+'"]').addClass('selected');
        }
        $('.fake_select.show').removeClass('show');
        $selector.removeClass('op_pre_select error');
        $(self.selectors.cartForm +" #SglOptSelector-"+optionIndex).val(optionValue).trigger('change');
        $(".kt-stickyAddCart .swatch-on-grid._"+_snakeCase(optionValue)+' .swatch').trigger('click');
      });
    },

    _initVariants: function() {
      var self = this;
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };
      if(_.filter(theme.function.productOptionStyle,{'op_pre_select': true}).length){
        options.enableHistoryState = false;
      }
      this.variants = new slate.Variants(options);
      if (this.storeAvailability && this.variants.currentVariant.available) {
        this.storeAvailability.updateContent(this.variants.currentVariant.id);
      }
      this.$container.on('variantChange', this._updateAddToCart.bind(this));
      this.$container.on('variantImageChange', this._updateImages.bind(this));
      this.$container.on('variantPriceChange', this._updatePrice.bind(this));
      this.$container.on('variantSKUChange', this._updateSKU.bind(this));
      if(!this.dataJs.dfVariant){
        this.dataJs.dfVariant = true;
        var option = this.variants.currentVariant.option1, check_option = 0;
        var optitonSelector1 = 'SglOptSelector-0--'+self.settings.sectionId;
        var optitonSelector2 = 'SglOptSelector-1--'+self.settings.sectionId;
        var optitonSelector3 = 'SglOptSelector-2--'+self.settings.sectionId;
        _.forEach(self.productSingleObject.variants, function(variant) {
          $.each($('#'+optitonSelector1+' option'), function(index,el) {
            if(variant.option1 !== option){
              check_option = 0;option = variant.option1;
            }
            if(check_option == 0 && $(this).val() == variant.option1){
              $(this).attr({
                'data-first-variant': $(self.selectors.originalSelectorId + ' option[value="'+variant.id+'"]').data('value')
              });
              if(variant.featured_image){
                $(this).attr('data-featured-image', variant.featured_image.src);
              }
              check_option++;
            }
          });
        });
        $.each($('.sgl-opt-selector-'+self.settings.sectionId), function(index, el) {
          var $this = $(this);
          var $selector = $('.--js-selector[data-js-opt="'+$this.data('js-selector')+'"]').first();
          var settings_op = _.find(theme.function.productOptionStyle, { 'name': $selector.data('n-opt')});
          if(settings_op === undefined){ return }
          if(settings_op.style === "combobox with_out_variant_image" || settings_op.color_watched && self.dataSettings.swatchStyle !== 'color') {
            $.each($selector.find('.--js-opt'), function(idx, el) {
              var $this_ = $(this);
              var featuredImage = $this.find('option[value="'+$this_.attr('data-value')+'"]').attr('data-featured-image');
              if(featuredImage === undefined){ return }
              if(settings_op.style === "combobox with_out_variant_image") {
                var fileExt = _.last(featuredImage.split('.')), featuredImage = featuredImage.replace('.'+fileExt, '_150x150_crop_center.'+fileExt);
                $('[data-n-opt="'+$selector.data('n-opt')+'"] .--js-opt[data-value="'+$this_.attr('data-value')+'"]').find('img').attr('data-src', featuredImage).addClass('lazyload');
              }
              else if(settings_op.color_watched && self.dataSettings.swatchStyle !== 'color'){       
                var fileExt = _.last(featuredImage.split('.')), featuredImage = featuredImage.replace('.'+fileExt, '_100x100.'+fileExt);
                $('[data-n-opt="'+$selector.data('n-opt')+'"] .--js-opt[data-value="'+$this_.attr('data-value')+'"]').find('.swatch').css({'background-image': 'url("' +featuredImage+ '")', 'background-color': 'transparent'});
              }
            });
          }
        });
        this._initVariant(this.variants.currentVariant);
        this.$container.on('updateVariant', this._updateVariant.bind(this));
      }
    },

    _AjaxForm: function() {
      var self = this;
      var $form = $(self.selectors.cartForm);
      var itemGroup = new Array;
      $(document).on('change', '.group-product .product-form__variants', function(){
        var $item = $(this).parents('.itemGroupProducts');
        var $option = $(this).find('option:selected');
        var pr = parseInt($option.attr('data-price'));
        var cpr = parseInt($option.attr('data-c-price'));
        $item.find('[name="qty_group"]').attr({'data-id': $(this).val(), 'data-price': pr, 'data-c-price': cpr});
        $item.find('.price ins').html(theme.Currency.formatMoney(pr, theme.moneyFormat));
        if(pr !== cpr){
          $item.find('.price del').html(theme.Currency.formatMoney(cpr, theme.moneyFormat)).removeClass('d-none');
        } else {
          $item.find('.price del').addClass('d-none');
        }
      });
      $form.on('change', function(event) {
        event.preventDefault();
        var itemsGroup = $form.find('[name="qty_group"]').length;
        var crr_pr = self.variants.currentVariant.price;
        var crr_c_pr = self.variants.currentVariant.compare_at_price || 0;
        if (self.$container.hasClass('product-mix-a-match')) {
          crr_pr = 0;
          crr_c_pr = 0;
        }
        itemGroup = _.filter($(this).serializeArray(), { 'name': "qty_group", 'value': "0" });
        if (itemsGroup !== itemGroup.length) {
          $.each($form.find('[name="qty_group"]'), function(idx, el) {
            var qty = $(this).val();
            var price = parseInt($(this).attr('data-price'));
            var c_price = parseInt($(this).attr('data-c-price'));
            crr_pr = crr_pr+(price*qty);
            crr_c_pr = crr_c_pr+(c_price*qty);
          });
          $('.subtt_gr--'+ self.settings.sectionId + ' .subtt_gr-money').html(theme.Currency.formatMoney(crr_pr, theme.moneyFormat));
          if(crr_pr !== crr_c_pr){
            $('.subtt_gr--'+ self.settings.sectionId + ' .subtt_gr-c-money').html(theme.Currency.formatMoney(crr_c_pr, theme.moneyFormat)).removeClass('d-none');
          } else {
            $('.subtt_gr--'+ self.settings.sectionId + ' .subtt_gr-c-money').addClass('d-none');
          }
          $form.addClass('may-add');
          $('.subtt_gr--'+ self.settings.sectionId).show()
        } else {
          $form.removeClass('may-add');
          $('.subtt_gr--'+ self.settings.sectionId).hide()
        }
      });
      if(this.settings.ajaxCart){
        $(document).on('submit', self.selectors.cartForm, function(e) {
          e.preventDefault();
          $(self.selectors.addToCart).removeClass('loaded').addClass('loading');
          if($(self.selectors.template).find('.op_pre_select').length>0) {
            $(self.selectors.template).find('.op_pre_select').addClass('error flash');
            setTimeout(function(){      
              $(self.selectors.template).find('.op_pre_select').removeClass('flash');
            }, 1000)
            $('.btn.loading').removeClass('loading');
            return false;
          }
          if($form.find('.itemGroupProducts').length > 0) {
            var queue = [];
            if ($form.find('[name="quantity"]').length > 0) {
              queue.push({
                "id": parseInt($form.find('[name="id"]').val()),
                "quantity": parseInt($form.find('[name="quantity"]').val())
              })
            }
            $(self.selectors.cartForm+' .itemGroupProducts [name="qty_group"]').each(function() {
              queue.push({
                "id": parseInt($(this).attr('data-id')),
                "quantity": parseInt($(this).val(), 10) || 0
              });
            });
            Shopify.KT_addItems(queue);
          } else {
            Shopify.KT_addItemFromForm('cart-form--'+self.settings.sectionId);
          }
        });
      }
      else if(this.settings.ajaxCart == false) {
        $(document).on('submit', self.selectors.cartForm, function(e) {
          $(self.selectors.addToCart).removeClass('loaded').addClass('loading');
          if($(self.selectors.template).find('.op_pre_select').length>0){
            e.preventDefault();
            $(self.selectors.template).find('.op_pre_select').addClass('error flash');
            setTimeout(function(){      
              $(self.selectors.template).find('.op_pre_select').removeClass('flash');
            }, 1000)
            $('.btn.loading').removeClass('loading');
            return false;
          }else{
            if($form.find('.itemGroupProducts').length > 0) {
              e.preventDefault();
              var queue = [];
              if ($form.find('[name="quantity"]').length > 0) {
                queue.push({
                  'id': parseInt($form.find('[name="id"]').val()),
                  'quantity': parseInt($form.find('[name="quantity"]').val())
                });
              }
              $(self.selectors.cartForm+' .itemGroupProducts [name="qty_group"]').each(function() {
                queue.push({
                  'id': parseInt($(this).attr('data-id')),
                  'quantity': parseInt($(this).val(), 10) || 0
                });
              });
              var ajax = {
                    type: "POST",
                    url: Shopify.root_url+"/cart/add.js",
                    data: {'items': queue},
                    dataType: "json",
                    success: function(e) {
                      // console.log(e)
                      window.location.href = Shopify.root_url+'/cart';
                    },
                    error: function(e) {
                      alert('error');
                    }
                  };
              $.ajax(ajax);
            } else {
              return;
            }
          }
        });
      }
    },

    _initVariant: function(currentVariant) {
      var self = this;
      var options2 = new Array, options3 = new Array;
      var option = currentVariant.option1, check_option = 0;
      var optitonSelector1 = 'SglOptSelector-0--'+self.settings.sectionId;
      var optitonSelector2 = 'SglOptSelector-1--'+self.settings.sectionId;
      var optitonSelector3 = 'SglOptSelector-2--'+self.settings.sectionId;
      $.each($('.sgl-opt-selector-'+self.settings.sectionId+' option'), function(index,el) {
        $(this).text($(this).val());
      });
      $('._soulout').removeClass('_soulout');
      $('._unavailable').removeClass('_unavailable');
      $('.kt_flash_lable').text('');
      _.forEach(self.productSingleObject.variants, function(value) {
        if(value.option1 === currentVariant.option1){
          options2.push(value.option2)
          if(value.option2 === currentVariant.option2){
            options3.push(value.option3)
          }
        }
        if(value.available == false){
          if (value.option1 == currentVariant.option1 && value.option2 == currentVariant.option2) {
            $.each($('#'+optitonSelector3+' option'), function(index,el) {
              if(value.option3 == $(this).attr('value')){
                // $(this).text($(this).text()+' - Soldout');
                $('[data-js-opt="2--'+self.settings.sectionId+'"] [data-value="'+value.option3+'"]').addClass('_soulout')
                // .find('.kt_flash_lable').text(' - Soldout');
              }
            });
          }
          else if(value.option1 == currentVariant.option1 && value.option3 == currentVariant.option3) {
            $.each($('#'+optitonSelector2+' option'), function(index,el) {
              if(value.option2 == $(this).attr('value')){
                // $(this).text($(this).text()+' - Soldout');
                $('[data-js-opt="1--'+self.settings.sectionId+'"] [data-value="'+value.option2+'"]').addClass('_soulout')
                // .find('.kt_flash_lable').text(' - Soldout');
              }
            });
          }
        }
      });
      options2 = $.unique(options2);
      options3 = $.unique(options3);
      $.each($('#'+optitonSelector2+' option'), function(index,el) {
        if(_.indexOf(options2,$(this).attr('value')) == -1){
          $('[data-js-opt="1--'+self.settings.sectionId+'"] [data-value="'+$(this).val()+'"]').addClass('_unavailable').find('.kt_flash_lable').text(' - Unavailable');
        }
        else if(self.dataSettings.swatchStyle !== 'color'){
          var variant = _.filter(self.productSingleObject.variants, { 'option1': currentVariant.option1, 'option2': $(this).attr('value'), 'option3': currentVariant.option3 });
          var featuredImage = variant[0].featured_image !== null ? variant[0].featured_image.src : undefined;
          if (featuredImage !== undefined) {           
            var fileExt = _.last(featuredImage.split('.')), featuredImage = featuredImage.replace('.'+fileExt, '_100x100_crop_center.'+fileExt);
            $('[data-js-opt="1--'+self.settings.sectionId+'"] [data-value="'+$(this).val()+'"] .swatch').css('background-image', 'url("' +featuredImage+ '")');
          }
        }
      });
      $.each($('#'+optitonSelector3+' option'), function(index,el) {
        if(_.indexOf(options3,$(this).attr('value')) == -1){
          $('[data-js-opt="2--'+self.settings.sectionId+'"] [data-value="'+$(this).val()+'"]').addClass('_unavailable').find('.kt_flash_lable').text(' - Unavailable');
        }
        else if(self.dataSettings.swatchStyle !== 'color'){
          var variant = _.filter(self.productSingleObject.variants, { 'id': currentVariant.id });
          var featuredImage = variant[0].featured_image !== null ? variant[0].featured_image.src : undefined;
          if (featuredImage !== undefined) {
            var fileExt = _.last(featuredImage.split('.')), featuredImage = featuredImage.replace('.'+fileExt, '_100x100_crop_center.'+fileExt);
            $('[data-js-opt="2--'+self.settings.sectionId+'"] [data-value="'+$(this).val()+'"] .swatch').css('background-image', 'url("' +featuredImage+ '")');
          }
        }
      });
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;
      }
      var self = this;
      $(self.$container).on('click', this.selectors.productThumbImages, function(evt) {
        evt.preventDefault();
        var $el = $(this);
        var template = self.selectors.template;
        if(typeof $el.attr('data-id') !== "undefined" && $el.attr('data-id') !== ''){
          var varaintsByMedia = _.filter(self.productSingleObject.variants, function(variant) {if (variant.featured_image && variant.featured_image.variant_ids.includes(parseInt($el.attr('data-id')))) {return variant}});
          if (varaintsByMedia.length > 1) {
            $(template+' .--js-opt[data-value="'+varaintsByMedia[0].option1+'"]').first().trigger('click');
          } else {
            goto = false;
            $(template +' .fake_select li').removeClass('selected');
            $(varaintsByMedia[0].options).each(function(index, opiton) {
              var options_change = $(template +' option[value="'+opiton+'"]').val();
              var $options_change_ = $(template +' option[value="'+opiton+'"]').parent();
              $(template +' .fake_select li._'+_handleize(opiton)).addClass('selected');
              if(opiton != self.productSingleObject.title && $('[data-js-opt="'+index+'--'+self.settings.sectionId+'"]').hasClass('op_pre_select') === false){
                $(template +' label[data-change-label="SglOptSelector-'+index+'--'+self.settings.sectionId+'"] .js-change-label').text(opiton);
              }
              if(options_change != $options_change_.val() ){
                $options_change_.val(options_change).trigger('change');
              }
            });
            var val_id = $el.attr('data-id');
            if(($(this).parents("div.product-page").data('enable-history-state')) == true && _.filter(theme.function.productOptionStyle,{'op_pre_select': true}).length <= 0){
              var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + val_id;
              window.history.replaceState({path: newurl}, '', newurl);
            }
          }
        }
      });
    },

    _initThumbnailSlider: function() {
      var self = this;
      var current_window_width = $(window).width();
      $(self.selectors.productThumbsWrapper+':not(.first)').addClass('has-its');
      if (self.thumbnailOptions) {
        optionsThumbs = self.thumbnailOptions;
      } else {
        var optionsThumbs = $(self.selectors.productThumbsWrapper).data();
        optionsThumbs.speed = 500;
        optionsThumbs.watchSlidesVisibility = true;
        optionsThumbs.grabCursor = true;
        optionsThumbs.watchOverflow = true;
        optionsThumbs.initialSlide = initialSlide || 0;
        if(self.dataSettings.useThumbVertical && current_window_width >= 576){
          optionsThumbs.direction = "vertical";
          optionsThumbs.slidesPerView = "auto";
        }
        self.thumbnailOptions = optionsThumbs;
      }
      // console.log(optionsThumbs);
      self.thumbSlider = new Swiper(self.selectors.productThumbsWrapper, optionsThumbs);
    },

    _destroyThumbnailSlider: function() {
      this.thumbSlider.destroy();
      this.thumbSlider = undefined;
      this.thumbnailOptions = undefined;
    },
    
    _initPhotoSlider: function() {
      var self = this;
      var videos = {};
      $(self.selectors.productPhotosWrapper).addClass('has-its');
      var btnGroup = $(self.selectors.template + ' .product-detail-image .btn-group');
      self.itsVisible = false;
      // Create Photo slide
      if (self.photoOptions) {
        options = self.photoOptions;
      } else {
        var options = $(self.selectors.productPhotosWrapper).data();
        options.speed = 500;
        options.watchSlidesVisibility = true;
        options.grabCursor = true;
        options.watchOverflow = true;
        options.initialSlide = initialSlide || 0;
        options.navigation = {
          nextEl: '.sw-btn-next-'+self.settings.sectionId,
          prevEl: '.sw-btn-prev-'+self.settings.sectionId,
        };
        options.pagination = {
          el: '.swiper-pagination',
          type: 'bullets'
        };
        if ($(self.selectors.productThumbsWrapper).hasClass('oneImageThumb') === false) {
          options.thumbs = {
            swiper: self.thumbSlider
          }
          if (theme.function.use_thumb_hidden_on_mb && theme.window_W < 768) {
            options.thumbs = null;
          }
        }
        if (self.productSingleObject.media.length > self.productSingleObject.images.length) {
          options.simulateTouch = false;
        }
        options.on = {
          init: function (swiper) {
            initialSlide = 0;
            var autoplay = true;
            var itemCrr = $(swiper.slides[swiper.activeIndex]);
            if (itemCrr.find('video').length <= 0 || itemCrr.find('.bgndVideo').length <= 0) {
              autoplay = false;
            }
            self._mediaSlider(autoplay);
            self._initPhotoSwipeFromDOM();
            self._initPhotoZoom(true);
            if (btnGroup.length > 0) {
              btnGroup.css('z-index', '-1');
              for (var i = swiper.activeIndex; i < swiper.activeIndex + swiper.visibleSlidesIndexes.length; i++) {
                if ($(swiper.slides[i]).hasClass('gallery-image')) {
                  btnGroup.css('z-index', '1');return true;
                }
              }
            }
          },
          slideChange: function (swiper) {
            if (!self.itsVisible) {
              $(self.selectors.productPhotosWrapper).addClass('its-visible');
              self.itsVisible = true;
            }
            if (swiper.thumbs.swiper) {
              var thumbsSwiper = swiper.thumbs.swiper;
              var crridx = swiper.activeIndex;
              var slides = thumbsSwiper.slides.length;
              if (crridx === thumbsSwiper.visibleSlidesIndexes[thumbsSwiper.visibleSlidesIndexes.length - 1] && crridx < slides) {
                self.thumbSlider.translateTo(-1 * thumbsSwiper.snapGrid[thumbsSwiper.visibleSlidesIndexes[1]],300,false);
              }
              if (crridx === thumbsSwiper.visibleSlidesIndexes[0] && crridx !== 0) {
                self.thumbSlider.translateTo(-1 * thumbsSwiper.snapGrid[thumbsSwiper.visibleSlidesIndexes[0] - 1],300,false);
              }
            }
            if(typeof jQuery.fn.YTPlayer === 'function'){
              $.each($(self.selectors.productPhotosWrapper + " .bgndVideo"), function() {
                $(this).YTPPause();
              })
            }
            $.each($(self.selectors.productPhotosWrapper + " video"), function() {
              $(this).trigger('pause');
            })

            var itemCrr = $(swiper.slides[swiper.activeIndex]);
            itemCrr.find('.lazyloading:not(.lazyload)').addClass('lazyload');
            if (itemCrr.find('.plyr__video-wrapper video').length > 0){
              $(itemCrr).find('video').trigger('play');
            }
            else if (itemCrr.find(".bgndVideo.mb_YTPlayer").length > 0) {
              itemCrr.find(".bgndVideo.mb_YTPlayer").YTPPlay();
            }
            else if (itemCrr.find("model-viewer").length > 0) {
              itemCrr.find("model-viewer").trigger('click');
              $(self.selectors.template+' .view-in-space').attr('data-shopify-model3d-id', itemCrr.find("model-viewer").attr('data-model-id'));
            }
            if (theme.is_mobile == false && self.settings.zoomEnabled && typeof $.fn.zoom == 'function'){
              $(self.selectors.template+' .photos-wrapper .p-sgl__photos-item').trigger('zoom.destroy');
              $.each($(self.selectors.template+' .photos-wrapper .gallery-image.swiper-slide-visible'), function(index, val) {
                $(this).zoom({url: $(this).attr('data-src')});
              });
            }
            if (btnGroup.length > 0) {
              btnGroup.css('z-index', '-1');
              for (var i = swiper.activeIndex; i < swiper.activeIndex + swiper.visibleSlidesIndexes.length; i++) {
                if ($(swiper.slides[i]).hasClass('gallery-image')) {
                  btnGroup.css('z-index', '1');return true;
                }
              }
            }
          }
        };
        self.photoOptions = options;
      }
      // console.log(options);
      self.photoSlider = new Swiper(self.selectors.productPhotosWrapper+':not(.first)', options);
    },

    _mediaSlider: function(autoplay) {
      var self = this;
      if ($(self.selectors.productPhotosWrapper+" .plyr__video-wrapper video").length > 0) {return true;}
      if ($(self.selectors.productPhotosWrapper+" .bgndVideo.mb_YTPlayer").length > 0) {return true;}
      if ($(self.selectors.productPhotosWrapper+" .shopify-model-viewer-ui").length > 0) {return true;}
      if (self.dataSettings.video5){
        KT.loadScript('plyr', function(e,l){
          if (l == 'ok') {
            $.each($(self.selectors.productPhotosWrapper+':not(.first) video'), function(index, el) {
              var player = new Shopify.Plyr($(this), {
                loop: { active: true },
                autoplay: autoplay
              });
            });
          }
        });
        autoplay = false;
      }
      if (self.dataSettings.externalVideo) {
        KT.loadScript('YTPlayer', function(e,l){
          if (l == 'ok') {
            $.each($(self.selectors.productPhotosWrapper+':not(.first) .bgndVideo'), function(index, el) {
              $(this).YTPlayer({
                autoPlay : autoplay
              });
            });
          }
        })
        autoplay = false;
      }
      if (self.dataSettings.model){
        // if ($(self.selectors.productPhotosWrapper+':not(.first) .shopify-model-viewer-ui').length > 0) {
        //   $(self.selectors.template+' .view-in-space').removeClass('d-none');
        // } else {
        //   $(self.selectors.template+' .view-in-space').addClass('d-none');
        // }
        KT.loadScript('shopify-xr', function(e,l){
          if (l == 'ok') {
            ShopifyXR.addModels(self.modelsObject);
            ShopifyXR.setupXRElements();
          }
        });
        KT.loadScript('model-viewer-ui', function(e,l){
          if (l == 'ok') {
            $.each($(self.selectors.productPhotosWrapper+':not(.first) model-viewer'), function(index, el) {
              var modelViewerUi = new Shopify.ModelViewerUI(this);
            });
          }
        });
      }
    },

    _destroyPhotoSlider: function() {
      this.photoSlider.destroy();
      this.photoSlider = undefined;
      this.photoOptions = undefined;
    },

    _updateVariant: function(evt) {
      var variant = evt.variant;
      var dataJs = this.dataJs;
      if($('.prd-mirror-'+this.productSingleObject.id).length > 0){
        $('.prd-mirror-'+this.productSingleObject.id).val(variant.id).trigger('change');
      }
      this._initVariant(variant);
      if (variant.featured_media == null || variant.featured_media == undefined) { return }
      if (this.dataSettings.gallery && dataJs.curpos.join(',') != dataJs.imgspos) {
        if (this.currentMedia.src == variant.featured_media.preview_image.src) { return }
        this.currentMedia = variant.featured_media.preview_image;
        this._updateGallery(variant); 
      }
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;
      var self = this;
      var template = self.selectors.template;
      var sectionId = self.settings.sectionId;
      if (variant) {
        if (this.storeAvailability) {
          this.storeAvailability.updateContent(evt.variant.id);
        }
		if ($(template + ' .notify-available [name="contact[body]"]').length > 0) {
        $(template + ' .notify-available [name="contact[body]"]').val($(template + ' .notify-available [name="contact[body]"]').val().replace(/\(.*\)/g, '('+variant.title+')'))
        }
        var variantOption = $(template+' option[value="'+variant.id+'"]');
        variant.inventory_quantity = parseInt(variantOption.data('inventory-quantity'));
        variant.incoming = variantOption.data('incoming');
        if($('#SglOptSelector-0--'+sectionId) !== undefined && $('[data-js-opt="0--'+sectionId+'"]').hasClass('op_pre_select') == false){
          $('label[data-change-label="0--'+sectionId+'"] .js-change-label').html($('#SglOptSelector-0--'+sectionId).val());
        }
        if($('#SglOptSelector-1--'+sectionId) !== undefined && $('[data-js-opt="1--'+sectionId+'"]').hasClass('op_pre_select') == false){
          $('label[data-change-label="1--'+sectionId+'"] .js-change-label').html($('#SglOptSelector-1--'+sectionId).val());
        }
        if($('#SglOptSelector-2--'+sectionId) !== undefined && $('[data-js-opt="2--'+sectionId+'"]').hasClass('op_pre_select') == false){
          $('label[data-change-label="2--'+sectionId+'"] .js-change-label').html($('#SglOptSelector-2--'+sectionId).val());
        }
        $(this.selectors.productPrices).removeClass('visibility-hidden').attr('aria-hidden', 'true');
        if (variant.available) {
          if (self.dataSettings.useQty) {
            $(template).find('.item-quantity--'+sectionId).show();
          }
          $(template).find('.kt_progress_bar').slideDown();
          $('.fbt-item #ip_'+self.productSingleObject.id+':not(:checked)').removeAttr('disabled').trigger('click').attr('disabled', 'disabled');
          $('.notify-'+self.productSingleObject.id).slideUp();
          if (variant.inventory_quantity > 0 && variant.inventory_management !== null) {
            $('#qty-'+sectionId).attr('max',variant.inventory_quantity).trigger('change');
            if (this.dataSettings.progressBar) {
              $(self.selectors.progressBar).attr('data-remaining_items', variant.inventory_quantity);
              self._stockCountdown().updateMeter(self.selectors.progressBar, variant.inventory_quantity, true);
            }
          }
        } else {
          $('.notify-'+self.productSingleObject.id).slideDown();
          $('.fbt-item #ip_'+self.productSingleObject.id+':checked').removeAttr('disabled').trigger('click').attr('disabled', 'disabled');
          $(template).find('.item-quantity--'+sectionId).hide();
          $(template).find('.kt_progress_bar').slideUp();
        }
        if (variant.available || variant.incoming) {
          $(this.selectors.addToCart).prop('disabled', false);
          if (variant.inventory_quantity <= 0 && variant.inventory_management === "shopify" && variant.incoming || !variant.inventory_quantity && variant.incoming) {
            $('.preOrder--'+sectionId).slideDown().find('span').html(variant.incoming);
            $(this.selectors.addToCartText).text(theme.strings.preOrder);
          } else {
            $('.preOrder--'+sectionId).slideUp();
            $(this.selectors.addToCartText).text(theme.strings.addToCart);
          }
          $(template).find('.shopifyPaymentButton').show()
        } else {
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.soldOut);
          $(template).find('.shopifyPaymentButton').hide()
        }
      }
      else {
        if(goto == true){
          $('[data-op-pre-select]').each(function(index, el) {
            let $this = $(this);
            $this.addClass('op_pre_select');
            $this.find('.js-change-label').html(theme.productStrings.label_select+$this.attr('data-n-opt').toLowerCase());
          });
          var option1 = $('#SglOptSelector-0--'+sectionId).val();
          var option1_cr = option1;
          var options = $('#SglOptSelector-0--'+sectionId+' option[value="'+option1+'"]').attr('data-first-variant').split(' / ');
          $(template +' .fake_select li').removeClass('selected');
          $(options).each(function(index, option) {
            if (options.length == 3 && index == 1 && optionIndex == 'SglOptSelector-1--'+ sectionId) {
              option = optionValue;
            }
            if (options.length == 3 && index == 2 && optionIndex == 'SglOptSelector-1--'+ sectionId) {
              var vr_available = _.find(self.productSingleObject.variants, { 'option1': option1,'option2': optionValue});
              option = vr_available.option3;
            }
            if(index === 0 && option !== option1_cr ){
              $(template +' .fake_select li[data-value="'+option1_cr+'"]').addClass('selected');
            }
            else{
              var options_change = $(template +" option[value='"+option+"']").val();
              var $options_change_ = $(template +" option[value='"+option+"']").parent();
              $(template +' .fake_select li[data-value="'+option+'"]').addClass('selected');
              $('label[data-change-label="'+index+'--'+sectionId+'"] .js-change-label').html(option);
              if(options_change != $options_change_.val()){
                $options_change_.val(options_change).change();
              }
            }
          });
        }
      }
    },

    _updateImages: function(evt) {
      var self = this;
      var variant = evt.variant;
      if (variant.featured_media == undefined) {return};
      var variantImage = variant.featured_media.preview_image.src;
      if(variantImage != undefined && goto == true ){
        var $photo = $(this.selectors.productPhotos + ' .p-sgl__photos-item[data-src="' + theme.Images.removeProtocol(variantImage) + '"]');
        slideIndex = $photo.index();
        if(self.photoSlider !== undefined){
          self.photoSlider.slideTo(slideIndex,300,false);
        }
      }
    },
    
    _updateGallery: function(variant) {
      var self = this;
      var dataJs = this.dataJs;
      var imgPos = variant.featured_media ? _.indexOf(_.map(self.previewImage,'src'), variant.featured_media.preview_image.src) + 1 : parseInt($(this.selectors.dataJs).attr('data-vrimgpos'));
      var imgspr = dataJs.imgspos.split(','), imgsArray = _.map(self.previewImage,'src');
      var htmlPhotoImages = '';
      if ($(self.selectors.productThumbImages).length >= 1) {
        var htmlThumbImages = '';
      }
      var last_imgPos = $(this.selectors.dataJs).attr('data-vrimgpos');
      if(_.indexOf(imgspr,imgPos.toString()) == -1 && last_imgPos == imgPos.toString()){return true}
      var imgsPos = [];
      _.forEach(imgspr, function(value,idx0) {
        if(parseInt(value) >= imgPos){
          if (parseInt(value) == imgsArray.length) {
            imgsPos.push(parseInt(imgspr[idx0]));
            imgsPos.push(parseInt(value));
            return false;
          }
          else{
            imgsPos.push(parseInt(value));
            imgsPos.push(parseInt(imgspr[idx0+1]));
            return false;
          }
        }
      });
      var newgallery = false;
      if($.unique($.merge(JSON.parse($(this.selectors.dataJs).attr('data-curpos')),imgsPos)).length > 2){
        newgallery = true;
      }
      if(parseInt(imgsPos[0]) == parseInt(imgsPos[1])){
        newgallery = true;
      }
      if(imgspr.length <= 0 && !newgallery){return true}
      $(this.selectors.dataJs).attr('data-curpos', '['+imgsPos[0]+","+imgsPos[1]+']');
      $(this.selectors.dataJs).attr('data-vrimgpos', imgPos);
      var imgsprw = _.map(self.previewImage,'width'), imgsprh = _.map(self.previewImage,'height');
      if($(this.selectors.productThumbs).length > 0){
        var image_size = theme.Images.imageSize($(this.selectors.productThumbs+" .p-sgl__thumb-image:first").attr('src')) || theme.Images.imageSize($(this.selectors.productThumbs+" .p-sgl__thumb-image:first").attr('data-src'));
      }
      var image_size_ = image_size || '220x220';
      var count_img = positionIdx = 0;
      var kt_visible = false;
      if (theme.function.productImgType === 'normal') {
        var featured_image = self.productSingleObject.media[0].preview_image;
        var a_ratioW = featured_image.width;
        var a_ratioH = featured_image.height;
      }
      _.forEach(self.productSingleObject.media, function(media, idx) {
        if (parseInt(imgsPos[1]) < idx+1) {return true}
        kt_visible = false;
        if(parseInt(imgsPos[0]) <= idx+1 && parseInt(imgsPos[1]) > idx+1){
          kt_visible = true;
        }
        if(parseInt(imgsPos[0]) == parseInt(imgsPos[1]) && parseInt(imgsPos[0] == idx+1)){
          kt_visible = true;
        }
        if(parseInt(imgsPos[0]) == parseInt(imgsPos[1]) && parseInt(imgsPos[0]) == idx+1 && parseInt(imgsPos[1]) == imgsArray.length){
          kt_visible = true;
        }
        if(imgspr[imgspr.length - 2] !== imgspr[imgspr.length - 1] && parseInt(imgsPos[1]) == idx+1 && parseInt(imgsPos[1]) == imgsArray.length){
          kt_visible = true;
        }
        if(kt_visible == true){
          var fileExt = _.last(media.preview_image.src.split('.')), img_url_photo = media.preview_image.src.replace('.'+fileExt, '_{width}x.'+fileExt);
          if ($(self.selectors.productThumbs).length > 0) {
            var img_url_thumb = media.preview_image.src.replace('.'+fileExt, '_'+image_size+'.'+fileExt);
          }
          var varaintsByMedia = _.filter(self.productSingleObject.variants, function(variant) {if (variant.featured_media && variant.featured_media.preview_image.src == media.preview_image.src) {return variant}});
          var productImgType = theme.function.productImgType === 'stretch' ? ' is-cover' : '';

          var positionCss = ' one_hundred';
          if (count_img !== 0){
            positionCss = ' sixties';
            if (positionIdx == 1 || positionIdx == 2){
              positionCss = ' forty';
              if (positionIdx == 2){
                positionIdx = -1;
              }
            }
            positionIdx++
          }
          var image_fit = theme.function.productImgType === 'stretch' ? theme.Images.imgFit(media.preview_image.width,media.preview_image.height,a_ratioW,a_ratioH) : '';

          var alt = varaintsByMedia.length > 0 ? ' title="'+ varaintsByMedia[0].title+'"' : '';
          var id = varaintsByMedia.length > 0 ? ' data-id="'+varaintsByMedia[0].id+'"' : '';
          htmlPhotoImages += '<div class="swiper-slide p-sgl__photos-item  gallery-'+ media.media_type + productImgType + positionCss +'" data-src="'+ media.preview_image.src+'">';
          htmlPhotoImages += '<div class="p-sgl__photo p-sgl__photo-'+idx+' p-sgl__photo--'+self.settings.sectionId +' aspectRatio" data-src="'+media.preview_image.src+'"' + alt + id +'>';
          if( media.media_type !== 'external_video') {
          htmlPhotoImages += '<img width="'+media.preview_image.width+'" height="'+media.preview_image.height+'" class="p-sgl__photo-image lazyload mll-lz '+ image_fit+'"';
            htmlPhotoImages += ' src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="';
            htmlPhotoImages += ' data-srcbase="'+ media.preview_image.src.replace('.'+fileExt, '_'+image_size_+'.'+fileExt) +'"';
            htmlPhotoImages += ' data-src="'+img_url_photo+'" data-widths="[335, 550, 720, 900, 1080]"';
            htmlPhotoImages += ' data-aspectratio="'+media.preview_image.width / media.preview_image.height+'"';
            htmlPhotoImages += ' data-srcfix="'+media.preview_image.src+'"';
            if(media.media_type === 'image'){
              htmlPhotoImages += ' data-size="'+media.preview_image.width+'x'+media.preview_image.height+'"';
            }
            htmlPhotoImages += ' data-sizes="auto" style="padding-bottom: '+1.00 / media.aspect_ratio * 100.00000000+'%">';
          }
          switch(media.media_type) {
            case 'external_video':
              htmlPhotoImages += '<div class="video_content video_content_'+media.id+' embed-responsive embed-responsive-16by9">';
              htmlPhotoImages += '<div class="position-absolute" style="top: 0;left: 0;width: 100%;height: 100%;">';
              htmlPhotoImages += '<div class="position-relative" style="width: 100%;height: 100%;">';
              if (media.host == 'youtube') {
                htmlPhotoImages += '<div class="bgndVideo" data-property="{videoURL:\'https://www.youtube.com/watch?v='+media.external_id+'\', quality:\'highres\', stopMovieOnBlur: false, containment: \'self\', vol: 100}"></div>';
              } else {
                htmlPhotoImages += '<iframe src="https://player.vimeo.com/video/'+media.external_id+'?autoplay=1&loop=1&title=0&byline=0&portrait=0" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
              }              
              htmlPhotoImages += '</div>';
              htmlPhotoImages += '</div>';
              htmlPhotoImages += '</div>';
              break;
            case 'video':
              htmlPhotoImages += '<div class="video_content video_content_'+media.id+'">';
              htmlPhotoImages += '<video playsinline="playsinline" controls="controls" loop="loop" preload="none" class="video-element" aria-label="'+self.productSingleObject.title+'" poster="'+media.preview_image.src.replace('.'+fileExt, '_720x.'+fileExt)+'">';
              $.each(media.sources, function(index, source) {
                htmlPhotoImages += '<source src="'+source.url+'" type="'+source.mime_type+'">';
              });
              htmlPhotoImages += '<img src="'+media.preview_image.src.replace('.'+fileExt, '_720x.'+fileExt)+'">';
              htmlPhotoImages += '</video>';
              htmlPhotoImages += '</div>';
              break;
            case 'model':
              htmlPhotoImages += '<div class="video_content model_content model_content_'+media.id+'">';
              htmlPhotoImages += '<model-viewer reveal="interaction" toggleable="true" data-model-id="'+media.id+'" src="'+media.sources[0].url+'" camera-controls="true" data-shopify-feature="0.8" alt="'+self.productSingleObject.title+'" poster="'+media.preview_image.src.replace('.'+fileExt, '_720x.'+fileExt)+'"></model-viewer>';
              htmlPhotoImages += '</div>';
              break;
            default:
          }
          if (theme.function.productImgType === 'normal' && self.settings.imagesLayout === 'masonry') {
            htmlPhotoImages += '<style media="(min-width: 992px)">.product-page .aspectRatio.p-sgl__photo-'+idx+'{padding-bottom:'+1/media.preview_image.aspect_ratio*100.0000000+'%}</style>';
          }
          htmlPhotoImages += '</div></div>';
          if( $(self.selectors.productThumbs).length > 0){
            htmlThumbImages += '<div class="swiper-slide p-sgl__thumbs-item gallery-'+ media.media_type + productImgType +'" data-src="'+media.preview_image.src+'">';
            htmlThumbImages += '<div class="p-sgl__thumb p-sgl__thumb--'+self.settings.sectionId+' aspectRatio" data-src="'+media.preview_image.src+'"' + alt + id +'>';
            htmlThumbImages += '<img class="p-sgl__thumb-image lazyload mll-lz '+ image_fit +'" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="'+ img_url_thumb +'" alt="'+self.productSingleObject.title+'" style="padding-bottom: '+1.00 / media.aspect_ratio * 100.00000000+'%">';
            switch(media.media_type) {
              case 'external_video':
                htmlThumbImages += '<div class="btn play"><i class="fkt-play m-0i" aria-hidden="true"></i></div>';
                break;
              case 'video':
                htmlThumbImages += '<div class="btn play"><i class="fkt-play m-0i" aria-hidden="true"></i></div>';
                break;
              case 'model':                
                htmlThumbImages += '<div class="btn play p-0i"><svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--full-color icon-3d-badge-full-color" viewBox="0 0 26 26"><path class="icon-3d-badge-full-color-element" d="M19.13 8.28L14 5.32a2 2 0 0 0-2 0l-5.12 3a2 2 0 0 0-1 1.76V16a2 2 0 0 0 1 1.76l5.12 3a2 2 0 0 0 2 0l5.12-3a2 2 0 0 0 1-1.76v-6a2 2 0 0 0-.99-1.72zm-6.4 11.1l-5.12-3a.53.53 0 0 1-.26-.38v-6a.53.53 0 0 1 .27-.46l5.12-3a.53.53 0 0 1 .53 0l5.12 3-4.72 2.68a1.33 1.33 0 0 0-.67 1.2v6a.53.53 0 0 1-.26 0z" opacity=".6" style="isolation:isolate"></path></svg></div>';
                break;
              default:
            }
            htmlThumbImages += '</div></div>';
          }
          count_img++
        }
      });
      var templateImages = self.selectors.template;
      if(self.settings.imagesLayout === 'masonry' && theme.window_W >= 992){
        $(self.selectors.productPhotos + ' .p-sgl__photos-item').each(function(index, el) {
          $(self.selectors.productPhotos).isotope( 'remove', this )
          if (index+1 == $(self.selectors.productPhotos + ' .p-sgl__photos-item').length) {
            $(self.selectors.productPhotos).append(htmlPhotoImages);
             $.each($(self.selectors.productPhotos + ' .p-sgl__photos-item'), function(index, val) {
              if ($(this).attr('style') == undefined){
                $(self.selectors.productPhotos)
                .isotope('appended', $(this))
                .isotope('layout');
              }
              if (index+1 == $(self.selectors.productPhotos + ' .p-sgl__photos-item').length){
                self._mediaSlider(false)
              }
            });
          }
        });
      }
      else {
        var thumbs = $('#product-thumb-slide--'+self.settings.sectionId), photos = $('#product-photo-slide--'+self.settings.sectionId);
        if (thumbs.data('vertical')) {
          if( count_img > 1){
            thumbs.removeClass('oneImageThumb');
            photos.removeClass('oneImagePhoto');
          }else{
            thumbs.addClass('oneImageThumb');
            photos.addClass('oneImagePhoto');
          }
        }
        if (typeof self.thumbSlider === 'object') {
          self.thumbSlider.removeAllSlides();
          self.thumbSlider.appendSlide(htmlThumbImages);
        }
        self.photoSlider.removeAllSlides();
        self.photoSlider.appendSlide(htmlPhotoImages);
        self._mediaSlider(false);
      }
    },
    
    _updatePrice: function(evt) {
      var variant = evt.variant;
      var self = this;
      var template = self.selectors.template;
      // Update the product price
      $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      $(this.selectors.originalPrice.replace('#','.')).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice)
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('d-none');
        $(this.selectors.comparePrice.replace('#','.'))
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('d-none');
        $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);
        $(this.selectors.saleLabel).removeClass('d-none');
      } else {
        $(this.selectors.comparePrice).addClass('d-none');
        $(this.selectors.comparePrice.replace('#','.')).addClass('d-none');
        $(this.selectors.saleLabel).addClass('d-none');
        $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
      }
      // Update and show the product's unit price if necessary
      if (variant.unit_price){
        $(this.selectors.unitPrice).show().removeClass('d-none');
        $(this.selectors.unitPrice.replace('#','.')).show().removeClass('d-none');
        var unit_price_base_unit = variant.unit_price_measurement.quantity_value + variant.unit_price_measurement.quantity_unit;
            unit_price_base_unit += ' (<span class="unit_price">'+ theme.Currency.formatMoney(variant.unit_price, theme.moneyFormat) + '</span> / ';
            unit_price_base_unit += '<span class="base_unit">';
        if(variant.unit_price_measurement){
          if (variant.unit_price_measurement.reference_value != 1) {
            unit_price_base_unit += variant.unit_price_measurement.reference_value;
          }
          unit_price_base_unit += variant.unit_price_measurement.reference_unit;
        }
        unit_price_base_unit += '</span>';
        unit_price_base_unit += '</span>)';
        $(this.selectors.unitPrice).html(unit_price_base_unit);
        $(this.selectors.unitPrice.replace('#','.')).html(unit_price_base_unit);
      } else {
        $(this.selectors.unitPrice).hide().addClass('d-none');
        $(this.selectors.unitPrice.replace('#','.')).hide().addClass('d-none');
      }
      // Update fbt price
      if ($('.fbt-item .ktlz-form-pid-'+ self.productSingleObject.id).length > 0) {
      	$('.fbt-item .ktlz-form-pid-'+ self.productSingleObject.id + ' ins').html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      	if (variant.compare_at_price > variant.price) {
	        $('.fbt-item .ktlz-form-pid-'+ self.productSingleObject.id + ' del')
		        .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
	      } else {
	        $('.fbt-item .ktlz-form-pid-'+ self.productSingleObject.id + ' del').html('');
	      }
      }
      if(theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry){
        Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;
      // Update the sku
      $(this.selectors.SKU).html(variant.sku);
    },

    _onReSizeImages: function() {
      var self = this;
      var iframe = $(self.selectors.template+" iframe#resize-image-product");
      if (self.selectors.template == '#ProductSection-quickview-template') {
        iframe = $(self.selectors.template+" iframe#resize-image-product-qv");
      }
      function maxHeight() {        
        if ($(window).width() >= 768) {
          if (self.selectors.template == '#ProductSection-product-template' && self.dataSettings.useMaxheight) {
            $(self.selectors.template+' .content-summary').css('max-height', iframe.height());
          }
          if (self.selectors.template == '#ProductSection-quickview-template') {
            $('#md_qvModal .content-summary').css('max-height', iframe.height());
          }
        } else {
          $('.content-summary').css('max-height', '');
        }
      }
      maxHeight();
      iframe.each(function() {
        $(this.contentWindow || this).resize($.throttle( 150, maxHeight));
      });
    },

    _initPhotoZoom: function(slide) {
      var self = this;
      if (theme.is_mobile == false && self.settings.zoomEnabled){
        KT.loadScript('zoom', function(e,l){
          if (l == 'ok') {
            var selector = self.selectors.template+' .photos-wrapper .gallery-image';
            if (slide) {
              selector = self.selectors.template+' .photos-wrapper .gallery-image.swiper-slide-visible';
            }
            $.each($(selector), function(index, val) {
              var $this = $(this);
              $this.zoom({url: $this.attr('data-src')});
            });
            $(self.$container).on('click', 'img.zoomImg', function(event) {
              event.preventDefault();
              $(self.selectors.template+' img[data-srcfix="'+theme.Images.removeProtocol(event.target.currentSrc)+'"]').trigger('click');
            });
          }
        })
      }
    },

    _initPhotoSwipeFromDOM: function() {
      var self = this;
      if (self.dataSettings.wide) {
        KT.loadScript('photo-swipe', function(e,l){          
          if (l == 'ok') {
            theme.initPhotoSwipeFromDOM(self.selectors.template+' .photos-wrapper','.p-sgl__photo','IMG', function(currentIndex, currentItem){
              if($(self.selectors.template+' .photos-wrapper .p-sgl__photos-item').length !== 0 && self.photoSlider !== undefined){
                var itemSlick = $(self.selectors.template+' .photos-wrapper').find('.p-sgl__photos-item[data-src~="'+currentItem.src+'"]');
                if($(itemSlick).length !== 0){
                  var slideIndex = $(itemSlick).closest('.p-sgl__photos-item').index();
                  self.photoSlider.slideTo(slideIndex, 300);
                }
              }
            });
          }
        })
      }
    },

    _stickyAddCart: function() {
      var self = this;
      $(document).on('click', '.kt-stickyAddCart .toggle, .kt-stickyAddCart .close', function() {
        $('#form_variants').slideToggle();
        $('body').toggleClass('show-stickyAddCart');
        if (theme.window_W >= 768) {return}
        $('.kt-stickyAddCart .infor').slideToggle();
      })
      var stickyAddCart = function(){        
        var scrollTop = $(window).scrollTop();
        var $this = $('.kt-stickyAddCart');
        if (scrollTop > $(self.selectors.addToCart).offset().top + 60 && $('.kt-stickyAddCart').hasClass('fixed') === false) {
          var headerHeight = $('header[data-header-sticky="true"] .content_header').outerHeight() || 0;
          $this.addClass('fixed')
          if($('.kt-stickyAddCart .position-fixed').hasClass('top')){
            if (theme.window_W < 767 ) {
              headerHeight = 0
            }
            $('.kt-stickyAddCart .position-fixed.top').css('top',headerHeight+'px');
          }
        }
        else if(scrollTop <= $(self.selectors.addToCart).offset().top && $('.kt-stickyAddCart').hasClass('fixed')){
          $this.removeClass('fixed');
          $('.show-stickyAddCart #form_variants').slideToggle();
          $('body').removeClass('show-stickyAddCart');
          if($('.kt-stickyAddCart .position-fixed').hasClass('top')){
            $('.kt-stickyAddCart .position-fixed.top').css('top','-100%');
          }
        }
      }
      $(window).scroll($.throttle( 100, stickyAddCart));
    },

    _initStickySummary: function() {
      var self = this;
      var thissummary = $('.summary.entry-summary');
      var thissummaryw = thissummary.width();
      var thissummaryo = thissummary.offset();
      var scrollTop = $(window).scrollTop();
      var mirrorHeight = $('.product-images').height();
      var thisposition = scrollTop + thissummary[0].getBoundingClientRect().top + thissummary.height();
      var thisposition_max= scrollTop + thissummary[0].getBoundingClientRect().top + (thissummary.outerHeight() - thissummary.height());
      function sticky() {
        var $window = $(window);
        if (theme.window_W < 992) {return}
        scrollTop = $window.scrollTop();
        mirrorHeight = $('.product-images').height();
        var thissummaryh = thissummary.outerHeight();
        if (mirrorHeight > scrollTop + thissummaryh - thisposition_max) {
          if (scrollTop + theme.window_H - 200 >= thisposition && thissummary.hasClass('fixed') == false){
            var transalte = $('header[data-header-sticky="true"]').length > 0 ? 85 : 20;
            thissummary.not('.fixed').addClass('fixed').removeClass('maxscroll').css({'top': transalte+'px','width': thissummaryw+'px','transform': 'none'});
          } else if(scrollTop + theme.window_H - 200 < thisposition && thissummary.hasClass('fixed')){
            thissummary.removeClass('fixed maxscroll').removeAttr('style');
          }
        }
        else if (thissummary.hasClass('maxscroll') == false && mirrorHeight <= thissummaryh + thissummary.offset().top) {
          var transalte = mirrorHeight - thissummaryh - 10;
          thissummary
          .addClass('maxscroll')
          .removeClass('fixed')
          .removeAttr('style')
          .css({'transform': 'translate3d(0px,'+transalte+'px,0px)','-webkit-transform': 'translate3d(0px,'+transalte+'px,0px)','moz-transform': 'translate3d(0px,'+transalte+'px,0px)','-ms-transform': 'translate3d(0px,'+transalte+'px,0px)','-o-transform': 'translate3d(0px,'+transalte+'px,0px)'});
        }
      }
      function transalte() {
        thissummaryh = $('.summary.entry-summary').outerHeight();
        if (thissummary !== undefined && $(window).width() >= 992 && thissummary.hasClass('fixed')) {
          thissummary.removeClass('fixed maxscroll').removeAttr('style');
        }
      }
      $(window).scroll($.throttle( 90, sticky));
      var iframe = $(self.selectors.template+" iframe#resize-info-product");    
      iframe.each(function() {
        $(this.contentWindow || this).resize($.throttle( 150, transalte));
      })
    },

    _onReSizeInfo: function(refresh) {
      var self = this;
      var thissummary = $('.summary.entry-summary');
      var thissummaryw = thissummary.width();
      var thissummaryo = thissummary.offset();
      var scrollTop = $(window).scrollTop();
      var mirrorHeight = $('.product-images').height();
      var m_p = thissummary.outerHeight() - thissummary.height();
      var thisposition = scrollTop + thissummaryo.top + m_p + thissummary.height();
      var thisposition_max= scrollTop + thissummaryo.top + m_p;
      var thissummaryh = thissummary.outerHeight();
      function sticky() {
        var $window = $(window);
        if (theme.window_W < 992) {return}
        scrollTop = $window.scrollTop();
        mirrorHeight = $('.product-images').height();
        thissummaryh = thissummary.outerHeight();
        if (mirrorHeight > scrollTop + thissummaryh - thisposition_max) {
          if (scrollTop + theme.window_H - 200 >= thisposition && $('.summary.entry-summary').hasClass('fixed') == false){
            var transalte = $('header[data-header-sticky="true"]').length > 0 ? 85 : 20;
            thissummary.not('.fixed').addClass('fixed').removeClass('maxscroll').css({'top': transalte+'px','width': thissummaryw+'px','transform': 'none'});
          } else if(scrollTop + theme.window_H - 200 < thisposition && thissummary.hasClass('fixed')){
            thissummary.removeClass('fixed maxscroll').removeAttr('style');
          }
        }
        else if (thissummary.hasClass('maxscroll') == false && mirrorHeight <= thissummaryh + thissummary.offset().top) {
          var transalte = mirrorHeight - thissummaryh - 10;
          thissummary
          .addClass('maxscroll')
          .removeClass('fixed')
          .removeAttr('style')
          .css({'transform': 'translate3d(0px,'+transalte+'px,0px)','-webkit-transform': 'translate3d(0px,'+transalte+'px,0px)','moz-transform': 'translate3d(0px,'+transalte+'px,0px)','-ms-transform': 'translate3d(0px,'+transalte+'px,0px)','-o-transform': 'translate3d(0px,'+transalte+'px,0px)'});
        }
      }
      function transalte() {
        thissummaryh = $('.summary.entry-summary').outerHeight();
        if (thissummary !== undefined && $(window).width() >= 992 && thissummary.hasClass('fixed')) {
          thissummary.removeClass('fixed maxscroll').removeAttr('style');
        }
      }
      sticky();
      $(window).scroll($.throttle( 90, sticky));
      var iframe = $(self.selectors.template+" iframe#resize-info-product");    
      iframe.each(function() {
        $(this.contentWindow || this).resize($.throttle( 150, transalte));
      })
    },

    _create360: function(variant) {
      var dataJs = this.dataJs,
          self = this;
      // Check 360 available
      var imgsPos360 = dataJs.imgspos360.split(','), imgsArray = _.map(self.previewImage,'src'), imgsprw = _.map(self.previewImage,'width'), imgsprh = _.map(self.previewImage,'height');
      var files = [];
      _.forEach(imgsArray, function(value, idx) {
        if(parseInt(imgsPos360[0]) <= idx+1 && idx+1 < parseInt(imgsPos360[1])){
          var file = value;
          files.push(file)
        }
      });
      KT.loadScript('threesixty', function(e,l){
        if (l == 'ok') {
          theme.imgs360(files,imgsPos360,imgsprw[imgsPos360[0]],imgsprh[imgsPos360[0]],self.id);
          $('.kt_open360_'+self.id).removeClass('d-none')
        }
      })
    },

    _shipTo: function() {
      function buildRates(data){
        sessionStorage.setItem("kt-shipping-rates", data);
        var list_shipping = '';
        var data = JSON.parse(data.replace('<!-- BEGIN template --><!-- cart.listShipping -->','').replace('<!-- END template -->',''));
        $('.shipByLocation .flag').html('<img width="26" height="19.5" class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="'+data.flag+'" alt="'+data.code+'">');
        data.shipping_rates = JSON.parse(data.shipping_rates);
        $.each(data.shipping_rates, function(index, val) {
          var p_mr = index < data.shipping_rates.length - 1 ? ' class="mb-1"' : '';
          list_shipping += '<p'+ p_mr + '>';
          list_shipping += '<i class="fkt-check pr-2"></i>';
          if (val.min_order_subtotal !== undefined && val.min_order_subtotal !== null) {                
            list_shipping += val.name+' '+theme.function.textInListShipping+' '+val.min_order_subtotal;
            if (val.max_order_subtotal !== null) {
              list_shipping += ' - '+val.max_order_subtotal;
            }
          }
          else if (val.weight_low !== undefined && val.weight_low !== null) {
            list_shipping += val.name+' '+theme.function.textInListShipping+' '+val.weight_low+' kg';
            if (val.weight_high !== null) {
              list_shipping += ' - '+val.weight_high+' kg';
            }
          }
          else {
            list_shipping += val.name;
          }
          list_shipping += '. <span style="color: #F44336">+ '+val.price+'</span>';
          list_shipping += '</p>';
        });
        // console.log(data)
        $('.shipByLocation .list').html(list_shipping);
        if(Shopify.currency !== undefined && shopCry !== Shopify.currency.active){
          KT.loadScript('shopify-currency', function(e,l){
            if (l == 'ok') {
            KT.loadScript('shipping', function(e,l){
              if (l == 'ok') {
                Kt_currency.convertAll(shopCry,Shopify.currency.active,'.shipByLocation span.money');
              }
            })
            }
          })
        }
        $('.shipByLocation').slideDown();        
        if ($('.shipping_rates .shipByLocation').length <= 0) {return}
        $('.shipping_rates').show();
      }
      function checkLocation(location_code){
        $.ajax({
          type: 'get',
          url: Shopify.root_url+'/cart?view=listShipping&q='+location_code,
        })
        .done(function(data) {
          if(data == ''){return};
          buildRates(data);
          // console.log("success");
        })
        .fail(function() {
          console.log("error checkLocation");
        })
        .always(function(data) {
          // console.log("complete");
        });
      }
      function getLocation(){
        $.ajax({
          type: 'get',
          url: 'https://api.teathemes.net/currency',
        })
        .done(function(data) {
          // console.log("success");
          var location = {
            name: data.registered_country.names.en,
            code: data.countryCode
          }
          localStorage.setItem("kt-location",JSON.stringify(location));
          checkLocation(data.countryCode);
          $('.shipByLocation .name_country').html(data.registered_country.names.en);
        })
        .fail(function() {
          console.log("error getLocation");
        })
        .always(function(data) {
          // console.log("complete");
        });        
      }
      var kt_location = localStorage.getItem("kt-location");
      if (localStorage.getItem("kt-location") !== null) {
        $('.shipByLocation .name_country').html(JSON.parse(localStorage.getItem("kt-location")).name)
        var kt_shipping_rates = sessionStorage.getItem("kt-shipping-rates");
        if (kt_shipping_rates !== null) {
          buildRates(kt_shipping_rates);
        } 
        else {
          checkLocation(JSON.parse(localStorage.getItem("kt-location")).code);
        }
      } else {
        getLocation()
      }
    },

    _stockCountdown: function() {
      var total_items = 70;
      var check_stock = false;
      var timer = null,timerinterval = null;
      var min_of_remaining_items = 1;
      var decrease_after = 1.7; 
      var decrease_after_first_item = 0.17; 
      var min_items_left = 0;
      var max_items_left = 0;
      var remaining_items = 0;
      var stock_bg_process = 0;
      function randomIntFromInterval(min, max) {return Math.floor(Math.random() * (max - min + 1) + min);}
      function progressbar(container) {
        updateMeter(container, remaining_items);
        timer = setTimeout(function() {
          updateMeter(container)
        }, 1000 * 60 * decrease_after_first_item );

        timerinterval = setInterval(function() {
          updateMeter(container)
        }, 100 * 60 * decrease_after)
      }
      function updateMeter(container,remaining_items_,important) {
        var $container = $(container);
        // var important = important || false;
        var remaining_items_ = remaining_items_;
        if (remaining_items_ == undefined) {
          remaining_items_ = remaining_items - 1;
          if (remaining_items < min_of_remaining_items) {
            remaining_items = remaining_items_;
            remaining_items_ = randomIntFromInterval(min_items_left, max_items_left)
          }
        }
        if (remaining_items_ > max_items_left) {
          return false;
        }
        var content = theme.productStrings.stockMessage[0]+' <span class="count">' + remaining_items_ + '</span> '+theme.productStrings.stockMessage[1];
        $container.addClass('items-count').find('p').html(content);
        var stock_bg_process = stock_bg_process || $container.data().stockBgProcess;
        $container.find('.count').css({'background-color': stock_bg_process, 'color': '#fff'});
        setTimeout(function() {
          $container.find('.count').css({'background-color': '#fff', 'color': stock_bg_process});
        }, 400);
        $container.find(".count").text(remaining_items_);
        var width = 100 * remaining_items_ / total_items;
        if (remaining_items_ < 10) {
          $container.find('.progress').addClass('less-than-ten')
        }
        setTimeout(function() {
          $container.find('.progress-bar').css('width', width + '%').attr('aria-valuenow', width);;
        }, 300);
        max_items_left = remaining_items_;
        remaining_items = remaining_items_;
        if(max_items_left <= min_items_left){
          clearTimeout(timerinterval);
        }
      }
      function init(container){
        var $container = $(container);
        var data = $container.data();
        min_items_left = parseInt(data.stockFrom);
        max_items_left = parseInt(data.stockTo);
        remaining_items = parseInt(data.remainingItems) || randomIntFromInterval(min_items_left, max_items_left);
        stock_bg_process = data.stockBgProcess;
        progressbar(container);
      }
      return {
        init: init,
        progressbar: progressbar,
        updateMeter: updateMeter
      };
    },

    _realTimeVisitor: function(el) {
      var $el = $(el);
      $(function(a){
        var min = 1,
        max=5,
        //max = $el.find('.counter_real_time').attr('data-counter-max'),
        t=1,
        r=max;
        t=Math.ceil(t),
        r=Math.floor(r);
        var o=Math.floor(Math.random()*(r-t+1))+t,
        n=["1","2","4","3","6","10","-1","-3","-2","-4","-6"],
        h="",e="",l=["10","20","15"],h="",e="",M="";
        setInterval(function(){
          if(h=Math.floor(Math.random()*n.length),e=n[h],o=parseInt(o)+parseInt(e),min>=o){
            M=Math.floor(Math.random()*l.length);
            var a=l[M];o+=a
          }
          if(o>1 || o<max){
            o=Math.floor(Math.random()*(r-t+1))+t;
          }
          $el.find("#number_counter>span").html((parseInt(o)));$el.show();
        },parseInt($el.find('.counter_real_time').attr('data-interval-time')))
      });
    },

    _dateFromTo: function(el) {
      var $el = $(el);
      KT.loadScript('moment', function(e,l){
        if (l == 'ok') {
          dateFromTo();
        }
      });
      function dateFromTo(){
        var data = theme.function.product_delivery;
        var fromDays = parseInt(data.fromDate);
        var toDays = parseInt(data.toDate);
        KT.loadScript('momentlocale', function(e,l){
          if (l == 'ok') {
            moment.locale(shopLocale);
            var fromDate = moment().add(fromDays, 'days');
            if (data.offSaturday && fromDate.format('d') == '6'){
              fromDays++;
              fromDate = moment().add(fromDays, 'days');
            }
            if (data.offSunday &&fromDate.format('d') == '0') { 
              fromDays = fromDays + 2;
              fromDate = moment().add(fromDays, 'days');
            }
            if (toDays > fromDays) {
              var toDate = moment().add(toDays, 'days');
              if (data.offSaturday &&toDate.format('d') == '6'){
                toDays++;
                toDate = moment().add(toDays, 'days');
              }
              if (data.offSunday &&toDate.format('d') == '0') {
                toDays = toDays + 2;
                toDate = moment().add(toDays, 'days');
              }
            }
            $.each(data.offDays, function(index, val) {
              var valD = val.split('/')[1],valM = val.split('/')[0],valY = val.split('/')[2];
              if (fromDate.format('DD') === valD && fromDate.format('MM') === valM) {
                if (fromDate.format('YYYY') === '****' || fromDate.format('YYYY') === valY) {
                  fromDays++;
                  fromDate = moment().add(fromDays, 'days');
                }
              }
              if (toDays > fromDays) {
                if (toDate.format('DD') === valD && toDate.format('MM') === valM) {
                  if (toDate.format('YYYY') === '****' || toDate.format('YYYY') === valY) {
                    toDays++;
                    toDate = moment().add(toDays, 'days');
                  }
                }
              }
            });
            if ($('.product_delivery .timeDay').length > 0) {
              var $this = $('.product_delivery .timeDay');
              $el.append('<style>span.timeDay{display: inline-block}.timeDay .block{display: inline-block}.timeDay span.label{padding: 0 4px}</style>')
              KT.loadScript('countdown', function(e,l) {
                if (l == 'ok') {
                  var date = moment().endOf("day").format();
                  var html = '<div class="block cdhrs"><span class="flip-top">00</span><span class="label">'+theme.strings.cdhrs+'</span></div>';
                      html += '<div class="block cdmins"><span class="flip-top">00</span><span class="label">'+theme.strings.cdmin+'</span></div>';
                  $this.html(html);
                  var $thisHrs = $this.find('.cdhrs .flip-top');
                  var $thisMins = $this.find('.cdmins .flip-top');
                  var $thisSecs = $this.find('.cdsecs .flip-top');
                  $this.countdown(moment(date).toDate())
                  .on('update.countdown', function(event) {
                    $thisHrs.text(event.strftime('%H'))
                    $thisMins.text(event.strftime('%M'))
                  })
                  .on('finish.countdown', function(event) {
                    $this.parent().remove();
                  });
                }
              });
            }
            $el.find('.fromDate').html(fromDate.format(theme.deliveryFormatDate));
            if (toDays > fromDays) {
              $el.find('.toDate i').html(toDate.format(theme.deliveryFormatDate));
              $el.find('.toDate').removeClass('d-none');
            }
            $el.slideDown();
            if ($el.parents('.shipping_rates').length <= 0) {return}
            $el.parents('.shipping_rates').show();
          }
        })
      }
    },

    _responTableGroup: function() {
      var self = this;
      $(self.selectors.template +' .table-products').scroll($.throttle( 100, function(){
        var $this = $(this);
        if ($(this).scrollLeft() >= 80 && $(this).hasClass('mini') == false) {
          $this.addClass('mini');
        } else if ($(this).scrollLeft() < 80 && $(this).hasClass('mini')) {
          $this.removeClass('mini');
        }
      }));
    },

    onUnload: function() {
      this.$container.off();
      this.$container.find('.kt_countdown').off();
    }
  });

  return Product;
})();

theme.StoreAvailability = (function() {
  var selectors = {
    modal: '[data-store-availability-modal-open]',
    modalProductTitle: '[data-store-avai-modal-product-title]',
    modalVariantTitle: '[data-store-avai-modal-variant-title]'
  };

  var classes = {
    hidden: 'd-none'
  };

  function StoreAvailability(container) {
    this.$container = $(container);
    this.$data = this.$container.data();
    this.productTitle = this.$data.productTitle;
    this.hasOnlyDefaultVariant = this.$data.hasOnlyDefaultVariant;
  }

  StoreAvailability.prototype = Object.assign({}, StoreAvailability.prototype, {
    updateContent: function(variantId) {
      var variantSectionUrl = this.$data.baseUrl + 'variants/' + variantId + '/?section_id=store-availability';
      var self = this;
      $.ajax({
        url: variantSectionUrl,
        type: 'GET',
        dataType: 'html',
        success: function(response) {
          response = response.split('<!--lz_sc-->')[1].split('<!-- modal -->');
          self.$container.html(response[0]);
          var $modal = $('#store-avai-modal-'+variantId);
          if ($modal.length <= 0) {
            $('.content_for_extension').append(response[1]);
            $modal = $('#store-avai-modal-'+variantId);
            var modalProductTitle = $modal.find(selectors.modalProductTitle);
            modalProductTitle.text(self.productTitle);
            if (self.hasOnlyDefaultVariant) {
              var modalVariantTitle = $modal.find(selectors.modalVariantTitle);
              modalVariantTitle.addClass(classes.hidden);
            }
          }
        }
      })
    }
  });

return StoreAvailability;
})();