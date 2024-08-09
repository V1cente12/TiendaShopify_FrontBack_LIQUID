(function($) { 
  "use strict";
  /* ---------------------------------------------
  SEARCH
   --------------------------------------------- */
  KT.ajaxSearch = function(){
    if(theme.function.searchAjax === false){return false};
    var $current_search;
    function init(element){
      clearTimeout($current_search);
      var $val = element.val();
      var $this = element.parents('form.box-search');
      var $typeSearch = theme.function.searchAjaxTypes;
      var $url = '';
      var searchByCollection = theme.function.searchByCollection;
      if($val.trim() == '') {
        $this.removeClass('loading loaded');
        $this.find(".li--s").html('');
        return false;
      }else{
        if (searchByCollection) {
          var $thisLiSelected = $this.find(".searchCat");
          if($thisLiSelected.val() !== ''){
            $val = ($thisLiSelected.val() || '') + $this.find("input.search").val();
          }
        }
        $this.find(".li--s").html('<li class="col-12"><div class="col-12 py-1 lz-place pin-search-place"></div></li>');
        $this.addClass('loading');
        $current_search = setTimeout(function(){
          $.getJSON(Shopify.root_url+"/search/suggest.json", {
            "q": $val,
            "resources": {
              "type": $typeSearch,
              "options": {
                "unavailable_products": "last",
                "fields": "author,body,product_type,tag,title,variants.barcode,variants.sku,variants.title,vendor"
              }
            }
          }).done(function(response) {
            var articles = response.resources.results.articles;
            var pages = response.resources.results.pages;
            var products = response.resources.results.products;
            var htmlResult = '';
            if (products.length > 0) {
              $.each(products, function(index, prd) {
                htmlResult += productLayout(prd);
              });
            }
            if (pages !== undefined && pages.length > 0) {
              htmlResult += '<li class="item-search pages_obj">';
                htmlResult += '<div class="name_type">'+theme.strings.search_dropdown_pages+'</div>';
                htmlResult += '<ul class="list-unstyled">';
                $.each(pages, function(index, page) {
                  htmlResult += pageLayout(page);
                });
                htmlResult += '</ul> ';
              htmlResult += '</li> ';
            }
            if (articles !== undefined && articles.length > 0) {
              htmlResult += '<li class="item-search pages_obj">';
                htmlResult += '<div class="name_type">'+theme.strings.search_dropdown_articles+'</div>';
                htmlResult += '<ul class="list-unstyled">';
                $.each(articles, function(index, article) {
                  htmlResult += articleLayout(article);
                });
                htmlResult += '</ul>';
              htmlResult += '</li>';
            }
            if (htmlResult === ''){
              htmlResult += '<li class="col-12"><h4 class="mb-0 py-1">'+theme.strings.search_dropdown_no_results+'</h4></li>';
            }
            $this.find(".li--s").html(htmlResult);
            $this.removeClass('loading').addClass('loaded');
            if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
              Kt_currency.convertAll(shopCry,localStorageCurrency,'span.money');
            }
            if ($(".li--s .shopify-product-reviews-badge").length > 0 && typeof window.SPR == 'function') {
              return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
            }
          })
        }, 400);
      }
    }
    function productLayout(product) {
      var html = ''
      html += '<li class="item-search">';
        html += '<a href="'+product.url+'">';
          html += '<div class="thumb">';
          if(product.image){
            html += '<img src="'+theme.Images.getSizedImageUrl(product.image, '240x240_crop_center')+'" alt="'+product.title+'">';
          }
          html += '</div>';
          html += '<div class="product-info">';
            html += '<h4 class="product-name">'+product.title+'</h4>';
            html += '<div class="product-description">';
            html += '</div>';
            html += '<div class="rating">';
              html += '<span class="shopify-product-reviews-badge" data-id="'+product.id+'"></span>';
            html += '</div>';
            html += '<span class="price">';
              var fixedPrice = ['VND'];
              if (theme.function.typeCurrency == 'shopify' && fixedPrice.includes(shopCry) || !theme.function.multiCurrency){
                product.price = parseInt(product.price) * 100;
                product.compare_at_price = parseInt(product.compare_at_price) * 100;
              }
              html += '<ins>'+theme.Currency.formatMoney(product.price, theme.moneyFormat)+'</ins>';
              if(product.compare_at_price > product.price){
              html += '<del>'+theme.Currency.formatMoney(product.compare_at_price, theme.moneyFormat)+' </del>';
              }
            html += '</span>';
          html += '</div>';
        html += '</a>';
      html += '</li> ';
      return html;
    }
    function pageLayout(page) {
      var html = ''
      html += '<li>';
        html += '<a href="'+page.url+'">';
        html += page.title;
        html += '</a>';
      html += '</li> ';
      return html;
    }
    function articleLayout(article) {
      var html = ''
      html += '<li>';
        html += '<a href="'+article.url+'">';
        html += article.title;
        html += '</a>';
      html += '</li> ';
      return html;
    }
    $(document)
    .on('keyup','.box-search input.search', function(event) {
      event.preventDefault();
      var $this = $(this);
      $("input.search").not($this).val($this.val());
      init($this)
    })
    .on('click','.box-search.show input.search', function(event) {
      event.preventDefault();
      var $this = $(this);
      var $val_input = $(this).val();
      if ($val_input === '' || $this.parents('.box-search.show').find('.li--s li').length > 0) {return false}
      init($this)
    })
    .on('change','.box-search .searchCat', function(event) {
      event.preventDefault();
      var $this = $(this);
      var $val_input = $(this).val();
      if ($val_input === '' || $this.parents('.box-search.show').find('.li--s li').length > 0) {return false}
      init($this)
    });
  }
  
  /* ---------------------------------------------
    Search By cattegories
    kitisummus@gmail.com
   --------------------------------------------- */
  function kt_search(){
    $(document)
    .on('click', function(e){
      if ($(e.target).is('.box-search') === false && $(e.target).is('.box-search *') === false) {
        $('.box-search').removeClass('loaded');
        $('.li--s').empty();
      }
      if ($(e.target).is('.box-search input') === false) {
        $('.box-search').removeClass('focus').removeClass('showCatt')
      }
    });
    if (!theme.function.searchByCollection) {return false}
    //Search Box
    $(document)
    .on('submit', "form.box-search", function(event){
      var $this = $(this);
      var $thisLiSelected = $this.find(".searchCat");
      if($thisLiSelected.length > 0 && $thisLiSelected.val() !== ''){
        var inputValue = $thisLiSelected.val() + $this.find("input.search").val();
        $("input.search").val(inputValue);
      }
      return;
    });

    //Search By cattegories
    function searchDrop(el){
      if ($(el).parents('.box-search').hasClass('focus') === false) {
        $(el).parents('.box-search').addClass('focus');
      }
    }
    $(document)
    .on("focus",".box-search input.search",function(evt) {
      searchDrop(this);
    })
    .on("click",".searchDrop",function(evt) {
      searchDrop(this);
    });
  }
    
  /* ---------------------------------------------
   QUICKVIEW
   --------------------------------------------- */
  function kt_quickView(){
    $(document).on('click', '.quick-view', function(event) {
      event.preventDefault();
      var $this = $(this);
      var $md_qvModal = $("#md_qvModal");
      var url = $this.attr('data-view').split('?')[0];
      var vr_id = $(this).parents('.product-inner').find('input[name="id"]').val();
      $this.addClass('loading');
      if ($md_qvModal.attr('data-view') == url) {
        $this.removeClass('loading');
        $md_qvModal.modal();
        return false;
      }
      $('#ProductSection-quickview-template').off();
      $('#ProductSection-quickview-template').find('.kt_countdown').off();
      $('.kt_630-quickview-template').remove();
      $('#sizeGuide_and_shipping').remove();
      $.ajax({
        url: url+'?variant='+vr_id+'&view=quickView',
        type: 'GET',
        success: function(data){
          var content = data.split('<!-- sizeGuide_and_shipping -->');
          var script = content[2].split('<!-- noscript -->')[1].replace(/(noscript)/gm, 'script');
          $('.product-quickview-content').html(content[2].split('<!-- noscript -->')[0]);
          $('.product-quickview-content').append(script);
          $('body').append('<div id="sizeGuide_and_shipping">'+content[1]+'</div>');
          $this.removeClass('loading');
          var sections = new theme.Sections();
          sections.register('product', theme.Product);
          if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
            Kt_currency.convertAll(shopCry,localStorageCurrency,'.product-quickview-content span.money');
          }
          $md_qvModal.attr('data-view',url).modal();
          var prefetch = document.createElement('link');
          prefetch.rel = "prefetch";
          prefetch.href = url;
          prefetch.onload = function() {
            $(this).remove();
          };
          headDocument.insertBefore(prefetch, firstLink);
          if ($(".product-quickview-content .shopify-product-reviews-badge").length > 0 && typeof window.SPR == 'function') {
            return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
          }
        }
      });
    });
  }

  /* ---------------------------------------------
   QUICKSHOP
   --------------------------------------------- */
  function kt_quickShop(){
    $(document).on('click', '.kt__quick-shop', function(event) {
      event.preventDefault();
      var $this = $(this);
      var $data = $this.data();
      var mdl = $('.modalQuickShop');
      if ($('#qs-'+$data.pid).length > 0){
        $('.modalQuickShop .modal-content').attr('data-pid', $data.pid).append($('#qs-'+$data.pid).html());
        mdl.modal();
        return false;
      } else {
        var url = $data.view.split('?')[0]+'?view=qshop';
        if ($data.vrid !== undefined) {
          url = $data.view.split('?')[0]+'?variant='+$data.vrid+'&view=qshop';
        }
        KT.loadScript('qs-css', function(e,l) {});
        $.ajax({
          url: url,
          type: 'GET',
          success: function(data) {
            if ($('.modalQuickShop').length <= 0) {
              var html = '<section class="modal fade modalQuickShop" id="quickShop-modal" role="dialog">';
                html += '<div class="modal-dialog modal-dialog-centered">';
                  html += '<div class="modal-content">';
                    html += data;
                  html += '</div>';
                html += '</div>';
              html += '</section>';
              $('body').append(html);
            } else {
              $('.modalQuickShop .modal-content').append(data);
            }
            $('.modalQuickShop .modal-content').attr('data-pid', $data.pid);
            mdl = $('.modalQuickShop');
            $('.modalQuickShop').find('.product-variants-wrapper-qs ul._small').removeClass('_small');
            mdl.modal();
            theme.wokerktlz.load();
          }
        });
      }
    });
    $(document).on('variantsLoaded', '.modalQuickShop form', function (event){
      var variant = event.variant;
      $('.modalQuickShop').find('ul._small').removeClass('_small');
    });  
    $(document).on('shown.bs.modal', '.modalQuickShop', function () {
      $('head link').first().after('<link class="prefetch-product" rel="prefetch" href="'+$('.kt__quick-shop.loading').attr('data-view')+'">');
      $('.kt__quick-shop.loading').removeClass('loading');
    })
    $(document).on('hidden.bs.modal', '.modalQuickShop', function () {
      if ($('#qs-'+$('.modalQuickShop .modal-content').attr('data-pid')).length <= 0){
        $('body').append('<noscript id="qs-'+$('.modalQuickShop .modal-content').attr('data-pid')+'">'+$('.modalQuickShop .modal-content').html()+'</noscript>');
      }
      $('.modalQuickShop .modal-content').html('');
    })
    $(document).on('click', '.kt_view_qs', function(event) {
      var btn_qs = $(this).parents('.product-inner').find('.kt__quick-shop');
      if (btn_qs.length > 0) {
        if (btn_qs.hasClass('disabled')) {btn_qs.removeClass('disabled').addClass('disabled_').prop('disabled', false)};
        $(this).parents('.product-inner').find('.kt__quick-shop').trigger('click');
        if ($('.kt__quick-shop.disabled_').length > 0) {btn_qs.removeClass('disabled_').addClass('disabled').prop('disabled', true)};
      }
    });
  }

  /* ---------------------------------------------
   EDIT OPTIONS
   --------------------------------------------- */
  function kt_editOpts(){
    $(document).on('click', '.kt__edit-opts', function(event) {
      event.preventDefault();
      var $this = $(this);
      var $data = $this.data();
      var mdl = $('.modalEditOpts');
      if ($this.hasClass('product-variable__cart')) {
        theme.is_mobile ? $('.close__cart-drawer').trigger('touchstart') : $('.close__cart-drawer').trigger('click');
      }
      if ($('#eo-'+$data.pid).length > 0){
        $('.modalEditOpts .modal-content').attr('data-pid', $data.pid).append($('#eo-'+$data.pid).html());
        mdl.modal();
        return false;
      } else {
        var url = $data.view.split('?')[0]+'?view=edit-opts';
        if ($data.vrid !== undefined) {
          url = $data.view.split('?')[0]+'?variant='+$data.vrid+'&view=edit-opts';
        }
        KT.loadScript('edit-opts-css', function(e,l) {});
        $.ajax({
          url: url,
          type: 'GET',
          success: function(data) {
            if ($('.modalEditOpts').length <= 0) {
              var html = '<section class="modal fade modalEditOpts" id="quickShop-modal" role="dialog">';
                html += '<div class="modal-dialog modal-dialog-centered">';
                  html += '<div class="modal-content">';
                    html += data;
                  html += '</div>';
                html += '</div>';
              html += '</section>';
              $('body').append(html);
            } else {
              $('.modalEditOpts .modal-content').append(data);
            }
            $('.modalEditOpts .modal-content').attr('data-pid', $data.pid);
            mdl = $('.modalEditOpts');
            if($data.qty !== undefined) {
              $('.modalEditOpts').find('#qty-eo').val($data.qty);
              $('.modalEditOpts').find('[name="updates['+$data.vrid+']"]').val($data.qty);
              $('.modalEditOpts').find('.it-qty').html($data.qty);
            }
            mdl.modal();
            setTimeout(function(){
              mdl.find('[name="id"]').remove();
            }, 300)
          }
        });
      }
    });
    $(document).on('variantChange', '.modalEditOpts form', function (event){
      var variant = event.variant;
      $('#qty-eo').attr('data-id', variant.id);
      $('.it-ip-editing').val(0);
      if ($('.it-ip-edited').length <= 0) {
        $('.it-ip-editing').removeClass('it-ip-editing').addClass('it-ip-edited');
        $('.modalEditOpts form').append('<input class="it-ip-editing" type="hidden" name="updates['+$('#qty-eo').attr('data-id')+']" value="'+$('#qty-eo').val()+'">');
      } else {
        $('.it-ip-editing').attr({'name': 'updates['+$('#qty-eo').attr('data-id')+']', 'value': $('#qty-eo').val()});
      }
    });
    $(document).on('change', '#qty-eo', function () {
      $('.modalEditOpts [name="updates['+$(this).attr('data-id')+']"]').val($(this).val());
    })
    $(document).on('hidden.bs.modal', '.modalEditOpts', function () {
      if ($('#eo-'+$('.modalEditOpts .modal-content').attr('data-pid')).length <= 0){
        $('body').append('<noscript id="eo-'+$('.modalEditOpts .modal-content').attr('data-pid')+'">'+$('.modalEditOpts .modal-content').html()+'</noscript>');
      }
      $('.modalEditOpts .modal-content').html('');
    });
    $(document).on('variantsLoaded', '.modalEditOpts form', function (event){
      var variant = event.variant;
      $('.modalEditOpts').find(' ul._small').removeClass('_small').addClass('_huge');
    });
  }
    
  /* ---------------------------------------------
   WISHLIST
   --------------------------------------------- */
  function AutoloadWishlistNitro(){
    var stringProduct = theme.wishlist.nitro_list;
    if(stringProduct == null){return false};
    if(stringProduct.length !== 0){ 
      var arrayProduct = stringProduct;
      theme.wishlist.list = arrayProduct;
      $('.wishlist-count').text(arrayProduct.length);
      $.each(arrayProduct, function(idx, handle) {
        if (handle !== '' && handle !== null) {
          var $btn = $('.kt-wishlist[data-handle="'+handle+'"]');
          $btn.addClass('added').attr({'data-action': 'view', 'data-href': theme.wishlist.page});
          $btn.find('.btn-name').html(theme.wishlist.view);
        }
      });
    }
    function check(mutationsList, observer) {
      for (i = 0; i < mutationsList.length; i++) {
        var mutation = mutationsList[i];
        if (mutation.target.outerHTML.includes('kt-wishlist')) {
          var wishlist_btns = mutation.target.querySelectorAll('.kt-wishlist');
          for (i = 0; i < wishlist_btns.length; i++) {
            var handle = wishlist_btns[i].getAttribute("data-handle");
            if (theme.wishlist.list.includes(handle)) {
              var $btn = $('.kt-wishlist[data-handle="'+handle+'"]');
              $btn.addClass('added').attr({'data-action': 'view', 'data-href': theme.wishlist.page});
              $btn.find('.btn-name').html(theme.wishlist.view);
            }
          }
          return false;
        }
      }
    }
    var observer_wishlist = new MutationObserver($.throttle( 200, check));
    observer_wishlist.observe(document.querySelector('body'), { attributes: true, childList: true, subtree: true })
  }
  // Add wishlist
  function addwishlist() {
    $("body").on('click', '.kt-wishlist', function(event) {
      if (!Shopify.customer) {
        if($('#accountModal').length > 0) {
          $('#accountModal').modal();
        } else {
          window.location.href = theme.wishlist.login;
        }
        return false;
      }
      if ($(this).attr('data-action') == "view") {
        window.location.href = $(this).attr('data-href');
        return false;
      }
      event.preventDefault();
      var $this = $(this);
      $this.addClass('loading');
      $.ajax({
        url: 'https://nitro-wishlist.teathemes.net?shop='+ Shopify.shop,
        type: 'POST',
        data: $this.data(),
        success: function(data, status) {
          try {
            data = $.parseJSON(data);
          } catch(ex) {
            //console.log(ex);
          }
          if(data.status == 'success' && status == 'success') {
            $this.removeClass('loading').addClass('added').attr('data-action','view').attr('data-href', theme.wishlist.page);
            $this.find('.btn-name').text(theme.productStrings.viewWishlist);
            $('.wishlist-count').html(function(i, val) {
              return val * 1 + 1
            });
          } else {
            $this.removeClass('loading');
            console.log(data.message);
          }
        },
        error: function(data) {
          $this.removeClass('loading');
          console.log('ajax error');
        },
      });
    });
  }
  // Remove wishlist
  function removewishlist() {
    $("body").on('click', '.nitro_wishlist_remove', function(event) {
      event.preventDefault();
      var $this = $(this),
          value = $(this).data('id');
      $('.wishlist-page .card').css('opacity','1');
      $.ajax({
        url: 'https://nitro-wishlist.teathemes.net?shop='+ Shopify.shop,
        type: 'POST',
        data: $this.data(),
        success: function(data, status) {
          try {
            data = $.parseJSON(data);
          } catch(ex) {
            //console.log(ex);
          }
          if(data.status == 'success' && status == 'success') {
            $('.wishlist-count').html(function(i, val) {
              return val * 1 - 1
            });
            $('#WishItem-' + value).fadeOut(300, function(){
              $(this).remove();
              var rowCount = $('.wishlist-page-items .wishlist-page-item').length;
              if(rowCount == 0) {
                $('.table-wishlist').hide();
                $('.wishlist-empty').show();
              }
            });
            $('.wishlist-page .card').css('opacity','0');
          } else {
            $('.loader').remove();
            console.log('ajax error');
          }
        },
        error: function(data) {
          $('.loader').remove();
          console.log('ajax error');
        },
      });
    });
  }
    
  /* ---------------------------------------------
   WISHLIST LOCAL
   --------------------------------------------- */
  function AutoloadWishlist(){
    var stringProduct = localStorage.getItem("kt-wishlist");
    var wishlist_page = $('.wishlist-page-items');
    if(stringProduct == null){$('.table-wishlist').hide();$('.wishlist-empty').show();return false};
    if(stringProduct.length !== 0){ 
      var arrayProduct = stringProduct.split(',');
      theme.wishlist.list = arrayProduct;
      $('.wishlist-count').text(arrayProduct.length);
      $.each(arrayProduct, function(idx, handle) {
        if (handle !== '' && handle !== null) {
          var $btn = $('.kt-wishlist[data-handle="'+handle+'"]');
          $btn.addClass('added').attr({'data-action': 'view', 'data-href': theme.wishlist.page_local});
          $btn.find('.btn-name').html(theme.wishlist.view);
        }
      });
      if (wishlist_page) {
        var buildItemsInPage = arrayProduct.map(itemsInPage, stringProduct);
        wishlist_page.html(buildItemsInPage.join());
      }
    } else if(wishlist_page) {
      $('.table-wishlist').hide();
      $('.wishlist-empty').show();
    }
    function itemsInPage(itemHandle) {
      return `<tr class="wishlist-page-item lazyload" id="WishItem-${itemHandle}" data-include="${Shopify.root_url}/products/${itemHandle}?view=wishlist-local">`
        +`<td class="product-col">`
          +`<div class="product d-flex align-content-stretch">`
            +`<figure class="product-media"><div class="lz-place"></div></figure>`
            +`<div class="w-100"><div class="lz-place"></div></div>`
          +`</div>`
        +`</td>`
        +`<td class="price-col"><div class="lz-place"></div></td>`
        +`<td class="stock-col"><div class="lz-place"></div></td>`
        +`<td class="action-col"><div class="lz-place"></div></td>`
        +`<td class="remove-col"><div class="lz-place"></div></td>`
      +`</tr>`;
    }
    function check(mutationsList, observer) {
      for (i = 0; i < mutationsList.length; i++) {
        var mutation = mutationsList[i];
        if (mutation.target.outerHTML.includes('kt-wishlist')) {
          var wishlist_btns = mutation.target.querySelectorAll('.kt-wishlist');
          for (i = 0; i < wishlist_btns.length; i++) {
            var handle = wishlist_btns[i].getAttribute("data-handle");
            if (theme.wishlist.list.includes(handle)) {
              var $btn = $('.kt-wishlist[data-handle="'+handle+'"]');
              $btn.addClass('added').attr({'data-action': 'view', 'data-href': theme.wishlist.page_local});
              $btn.find('.btn-name').html(theme.wishlist.view);
            }
          }
          return false;
        }
      }
    }
    var observer_wishlist = new MutationObserver($.throttle( 200, check));
    observer_wishlist.observe(document.querySelector('body'), { attributes: true, childList: true, subtree: true })
  }
  function AddWishlist(){
    $('body').on('click', '.kt-wishlist', function(event) {
      var $this = $(this);
      if ($this.attr('data-action') == "view") {
        window.location.href = $this.attr('data-href');
        return false;
      }
      event.preventDefault();

      /* Act on the event */
      var handle = $this.data('handle'),
          stringProduct = localStorage.getItem("kt-wishlist");
      if(stringProduct !== null && stringProduct.length > 1){ 
        var arrayProduct = stringProduct.split(',');
      }else{
        var arrayProduct = new Array;
      }
      if(arrayProduct.indexOf(handle) < 0){
        arrayProduct.push(handle);
        if (arrayProduct.length > 1) {
          var arrayProduct_ = arrayProduct.join(',');
          if (arrayProduct_.substring(0, 1) == ',') { 
            arrayProduct_ = arrayProduct_.substring(1);
          }
        }else{
          arrayProduct_ = arrayProduct.toString();
        }
        $('.wishlist-count').text(arrayProduct.length);
        localStorage.setItem("kt-wishlist", arrayProduct_);
      }
      $this.addClass('added').attr({'data-action': 'view', 'data-href': theme.wishlist.page_local});
      $this.find('.btn-name').html(theme.wishlist.view);
    });
  }
  function RemoveWishlist(){    
    $(document).on('click', '.wishlist-remove', function(event) {
      event.preventDefault();
      var $this = $(this), handle = $this.attr('data-handle');
      var $btn = $('.kt-wishlist[data-handle="'+handle+'"]');
      console.log(handle);
      $btn.removeClass('added').attr({'data-action': 'add', 'data-href': '#'});
      $btn.find('.btn-name').html(theme.wishlist.add);
      var list_handle = localStorage.getItem("kt-wishlist");      
      if(list_handle !== null){ 
        var arrayProduct = list_handle.split(',');
      }
      arrayProduct = $.grep(arrayProduct, function(value) {
        return value != handle;
      });
      arrayProduct = $.trim(arrayProduct);
      $('.wishlist-count').text(arrayProduct.length);
      localStorage.setItem("kt-wishlist", arrayProduct.toString());      
      $('#WishItem-' + handle).fadeOut(300, function(){
        $(this).remove();
        if(arrayProduct == 0) {
          $('.table-wishlist').hide();
          $('.wishlist-empty').show();
        }
      });
    });
  }
  
  /* ---------------------------------------------
   RECENTLY VIEWED
   --------------------------------------------- */
  // Add to recently
  function recentlyViewedAdd() {
    if($('#shopify-section-kt_recentlyViewedProducts').length <= 0 || $('#ProductSection-product-template').length <= 0){return false}
    var arrayProduct = localStorage.getItem("kt-recent") !== null ? localStorage.getItem("kt-recent").split(',') : new Array;
    if(product_handle !== null){
      var c = _handleize(product_handle);
      if(arrayProduct.indexOf(c)< 0 ){
        if(arrayProduct.length >= 10){
          arrayProduct.pop();
        }
        arrayProduct[arrayProduct.length]= (c);
        arrayProduct = arrayProduct.toString();
        localStorage.setItem("kt-recent", arrayProduct);
      }
    }
  }
  // recentlyViewedProductSingle
  window.recentlyViewedProductSingle = function() {
    if($('#shopify-section-kt_recentlyViewedProducts').length > 0){
      var stringProduct = localStorage.getItem("kt-recent") || '';
      var arrayProduct = stringProduct.split(',');
      if(localStorage.getItem("kt-recent") !== null){
        var arrayProduct = arrayProduct.reverse();
        $('.load_recent').attr('data-include', canonical_url+'?q='+arrayProduct.join("+")+'&view=recently').addClass('lazyload');
      }
    }
  }
  
  /* ---------------------------------------------
   COMPARE
   --------------------------------------------- */
  function AutoloadCompare(){
    var stringProduct = localStorage.getItem("kt-compare");
    if(stringProduct != null && stringProduct.length !== 0){ 
      var arrayProduct = stringProduct.split(',');
      $('.compareCount').text(arrayProduct.length);
      $('.no-compare').hide();
      $.each(arrayProduct, function(index, elem) {
        $(".compare[data-pid='"+index+"']").addClass('added');
      });
      if($('.mini-compare-content').length){
        $(document).on('mouseenter', '.mini-compare .icon-link', function() {
          if ($('.mini-compare').hasClass('load')) {
            $('.mini-compare').removeClass('load');
            $(this).find('.kt-button').addClass('loading');
            KT.loadMiniCompare();
          } else {
            return
          }
        });
      }
    } else {
      $('.no-compare').show();
    }
  }
  function AddCompare(){
    $('body').on('click', '.compare', function(event) {
      event.preventDefault();
      if($(this).hasClass('added') && $("#compare-content").find('.product-description').length > 0){
        $("#compare-modal").modal('show');
        return false;
      }
      /* Act on the event */
      var $this = $(this),
          handle = $this.data('pid'),
          stringProduct = localStorage.getItem("kt-compare");
      $this.addClass('loading');
      if(stringProduct !== null && stringProduct.length > 1){ 
        var arrayProduct = stringProduct.split(',');
      }else{
        var arrayProduct = new Array;
      }
      if(arrayProduct.indexOf(handle)< 0 && $(this).hasClass('added') === false ){
        arrayProduct.push(handle);
        if (arrayProduct.length > 1) {
          var arrayProduct_ = arrayProduct.join(',');
          if (arrayProduct_.substring(0, 1) == ',') { 
            arrayProduct_ = arrayProduct_.substring(1);
          }
        }else{
          arrayProduct_ = arrayProduct.toString();
        }
        $('.compareCount').text(arrayProduct.length);
        localStorage.setItem("kt-compare", arrayProduct_);
      }      
      $('.no-compare').hide();
      KT.showModalCompare(handle);
      KT.loadMiniCompare();
      setTimeout(function() {
        $this.removeClass('loading').addClass('added');
      }, 1000);
    });
  }
  function RemoveCompare(){
    $(document).on('click', '.compare-remove', function(event) {
      event.preventDefault();
      var $this = $(this), handle = $this.attr('data-pid');
      $('.compare[data-pid="'+handle+'"]' ).removeClass('added');
      var list_handle = localStorage.getItem("kt-compare");      
      if(list_handle !== null){ 
        var arrayProduct = list_handle.split(',');
      }
      arrayProduct = $.grep(arrayProduct, function(value) {
        return value != handle;
      });
      arrayProduct = $.trim(arrayProduct);        
      $('.compareCount').text(arrayProduct.split(',').length);
      localStorage.setItem("kt-compare", arrayProduct.toString());
      anime({targets: '.cp-'+handle, opacity: 0,duration: 300,easing: 'linear',complete: function(anim) {$('.cp-'+handle).remove()}});
      if(arrayProduct.length === 0 ){
        $('.no-compare').show();
        $(".mini-compare-content .mini-compare-body").hide(0);
      }
    });
    $(document).on('click', '.compare-remove-all', function(event) {
      event.preventDefault();
      var list_handle = localStorage.getItem("kt-compare").split(',');
      list_handle.map(function(handle, idx) {
        $('.cp-'+handle).remove();
      })
      localStorage.removeItem("kt-compare");
      $('.no-compare').show();
      $(".mini-compare-content .mini-compare-body").hide(0);
    });
  }
  KT.showModalCompare = function(p_handle){
    $("#compare-content").css({'overflow-y':'auto','max-height':$(window).outerHeight() - 30});
    if($("#compare-content").find('.'+p_handle).length > 0 || localStorage.getItem("kt-compare") == null || localStorage.getItem("kt-compare").length === 0){
      $("#compare-modal").modal('show');
      return false;
    }
    if(p_handle === 'kiti' && $("#compare-content .compare-remove").length){
      $("#compare-modal").modal('show');
      return false;
    }
    var list_handle = localStorage.getItem("kt-compare").split(',');
    $("#compare-content").attr('data-include',Shopify.root_url+'/collections/all?view=compare&q='+localStorage.getItem("kt-compare")).addClass('lazyload');
    $("#compare-modal").modal('show');
    theme.lazyListener('#compare-modal');
  }
  KT.loadMiniCompare = function(){
    var list_handle = localStorage.getItem("kt-compare").split(',');
    if(list_handle != null && list_handle.length !== 0){
      $(".mini-compare-content .mini-compare-body").show(0);
      var html = '';
      html += '<ul class="compare-products list-unstyled"></ul>';
      html += '<div class="compare-actions">';
        html += '<a href="javascript:void(0)" class="compare-remove-all action-link">'+theme.compare.clear_all+'</a>';
        html += '<a href="javascript:void(0)" class="btn btn-outline-primary-2" onclick="KT.showModalCompare(\'kiti\')"><span>'+theme.compare.mini_title+'</span><i class="fkt-long-arrow-right"></i></a>';
      html += '</div>';
      $(".mini-compare-content .mini-compare-body").html(html);
      $.each(list_handle, function(idx, handle) {
        if (handle !== '' && handle !== null) {
          KT.getProduct(handle,function(prd){
            var html_item = '';
            html_item += '<li class="compare-product cp-'+prd.handle+'">';
              html_item += '<a href="javascript:void(0)" class="compare-remove btn-remove fkt-close" data-pid="'+prd.handle+'" title="Remove Product"></a>';
              html_item += '<h4 class="compare-product-title"><a href="'+prd.url+'">'+prd.title+'</a></h4>';
            html_item += '</li>';
            $(".mini-compare-content .compare-products").append(html_item);
            if (idx+1 === list_handle.length) {
              $('.mini-compare .kt-button').removeClass('loading');
            }
          })
        }
      });
    }else{
      $(".mini-compare-content .mini-compare-body").hide(0);
      $('.mini-compare .kt-button').removeClass('loading');
    }
  }

  /* ---------------------------------------------
   CSS BANNER WAIT
   --------------------------------------------- */  
  function css_banner_builded(){
    if ($('.banner-css').length <= 0) {return;}
    var css_banner = '';
    var array_banner = new Array;
    $('.banner-css').each(function(){
      var sectionType = $(this).data().sectionType;
      if (array_banner.indexOf(sectionType) >= 0) {return}else{array_banner.push(sectionType)}
      css_banner += $(this)[0].innerText;
    });
    css_banner = css_banner.replace('<style>','').replace('<style data-shopify>','').replace('</style>','').replace(/(\r\n|\n|\r|\s\s)/gm, "");
    if ($('.css_banner_builded').length == 0) {
      $('script').first().before('<style class="css_banner_builded">'+css_banner+'</style>');
    }else{
      $('.css_banner_builded').html(css_banner)
    }
    $('.wait-for-css').removeClass('wait-for-css');
  }

  /* ---------------------------------------------
   ACCOUNT FORM ERORR
   --------------------------------------------- */
  function customize_error(){
    $('#error_html .errors').detach().appendTo('.error_html_clone');
  }

  /* ---------------------------------------------
   RESPONSIVE IFRAME
   --------------------------------------------- */
  function embedRespon(){
    var players = theme.embedResponPlayer;
    var fitVids = $(players.join(","));
    if (fitVids.length) {
      for (var i = 0; i < fitVids.length; i++) {
        var fitVid = $(fitVids[i]);
        if (fitVid.hasClass('embed-responsive-item')) {return true}
        var width = fitVid.attr("width") || 560;
        var height = fitVid.attr("height") || 315;
        var aspectRatio = height / width;
        fitVid.addClass('embed-responsive-item');
        if (fitVid.hasClass('fullw')) {
        var div = '<div style="width:100%;"><div class="embed-responsive" style="padding-bottom: '+aspectRatio * 100+'%">'+fitVid[0].outerHTML+'</div>';
        } else {
        var div = '<div style="width:100%;max-width:'+width+'"><div class="embed-responsive" style="padding-bottom: '+aspectRatio * 100+'%">'+fitVid[0].outerHTML+'</div>';
        }
        fitVid.after(div).remove();
      }
    }
  }

  /* ---------------------------------------------
   NEWSLETTER FORM
   --------------------------------------------- */

  KT.register = function($form) {
    $form.find('[id|="mc-embedded-subscribe"]').addClass('loading');
    $form.find('.close__').hide();
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      cache: false,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      error: function (err) { alert(theme.strings.nll_error_mesenger) },
      success: function (data) {
        $form.find('[id|="mc-embedded-subscribe"]').removeClass('loading');
        if (data.result === 'success') {
          // Yeahhhh Success
          // console.log(data.msg)
          $form.find('.msg.error').remove();
          $('.kt-popup-newsletter .notice').hide();
          if ($form.find('.msg.success').length > 0) {
            $form.find('.msg.success').html((theme.strings.nll_success_mesenger).replace('<span class=\"code\"></span>', '<span class=\"code\">'+$form.attr('data-kt')+'</span>'));
          }else{
            $form.prepend('<p class="msg success margin-bottom-10" style="color: rgb(53, 114, 210)">'+(theme.strings.nll_success_mesenger).replace('<span class=\"code\"></span>', '<span class=\"code\">'+$form.attr('data-kt')+'</span>')+'</p>')
          }
        } else {
          // Something went wrong, do something to notify the user.
          $form.find('.msg.success').remove();
          if ($form.find('.msg.error').length > 0) {
            $form.find('.msg.error').html(data.msg.substring(4))
          }else{
            $form.prepend('<p class="msg error mb-1" style="color: #ff8282;margin-top: 15px;">' + data.msg.substring(4) + '</p>')
          }
        }
      }
    })
  }

  /* ---------------------------------------------
   SUGGEST PRODUCTS
   --------------------------------------------- */
  function suggestProducts() {
    var sggPrds = sessionStorage.getItem('sggPrds');
    var curNewsIndex = 0;
    var delay_time = theme.suggest.delay_time;
    var show_time = theme.suggest.show_time;
    var all_time = 5000;
    var $thisSuggest = $('.kt-products-suggest');
    var intervalID;
    var intervalShow;
    var intervalShowTime;
    if ($thisSuggest.length <= 0) {return false}
    
    function advanceNewsItem() {
      if(sggPrds.length == 0){return;}
      curNewsIndex = Math.floor(Math.random() * sggPrds.length);
      var spaceBottom = 15;
      if($('.kt-stickyAddCart.fixed').length > 1){
        spaceBottom = $('.kt-stickyAddCart.fixed').outerHeight() + 15;
      }
      if($('.kt-cookies-popup').length > 1){
        spaceBottom = $('.kt-cookies-popup').outerHeight() + 15;
      }
      $thisSuggest.animate({bottom: ($thisSuggest.width()+spaceBottom)*-1+'px',opacity: 0},600);
      function funShow(){
        $thisSuggest.show();
        var sggPrd = sggPrds[curNewsIndex];
        if (theme.suggest.use_fake_location && theme.suggest.arr_fake_location.length > 0) {
          var myArray = theme.suggest.arr_fake_location, rand = Math.floor(Math.random() * theme.suggest.arr_fake_location.length);
        }
        var fakeTimeOrder = Math.floor((Math.random() * 60) + 1);
        $thisSuggest.find('.product-title').html(sggPrd.title).attr('href',theme.suggest.collection_opj+sggPrd.url);
        $thisSuggest.find('.table-cell-top.img a').attr('href',theme.suggest.collection_opj+sggPrd.url);
        $thisSuggest.find('.table-cell-top.img img').attr( { src:sggPrd.image, alt:sggPrd.title } );
        $thisSuggest.find('.minute-number').html(fakeTimeOrder);
        if (theme.suggest.use_fake_location && theme.suggest.arr_fake_location.length > 0) {
          $thisSuggest.find('.from').html(myArray[rand]);
        }
        $thisSuggest.animate({bottom: spaceBottom+'px',opacity: 1},600);
        clearInterval(intervalShow);
      }
      function funShowTime(){
        $thisSuggest.animate({bottom: ($thisSuggest.width()+spaceBottom)*-1+'px',opacity: 0},600);
        clearInterval(intervalShowTime);
      }
      intervalShow = setInterval(funShow, 600);
      intervalShowTime = setInterval(funShowTime, show_time);
    }
    if (sggPrds !== null) {
      sggPrds = jQuery.parseJSON(sggPrds);
      if(sggPrds.length == 0){return;}
      setTimeout(function() {
        advanceNewsItem();
      }, 1000);
      var intervalID = setInterval(advanceNewsItem, delay_time + show_time);
    } else {
      $.ajax({
        url: (theme.suggest.collection_opj || allPrdUrl) + '?view=suggest',
        type: 'GET',
        dataType: 'html'
      })
      .done(function(data) {
        // console.log("success");
        sggPrds = jQuery.parseJSON(data.replace(/<!--.*?-->/g, ""));
        sessionStorage.setItem('sggPrds', JSON.stringify(sggPrds));
        setTimeout(function() {
          advanceNewsItem();
        }, 1000);
        var intervalID = setInterval(advanceNewsItem, delay_time + show_time);
      })
      .fail(function() {
        // console.log("error");
      });
    }
    var check_mouse = true;
    $thisSuggest.on({
      mouseenter: function () {
        if (check_mouse) {
          clearInterval(intervalShow);
          clearInterval(intervalShowTime);
          check_mouse = false;
       }
      },
      mouseleave: function () {
        intervalID = setInterval(advanceNewsItem, delay_time + show_time);
        check_mouse = true;
      }
    });
    $('.suggest-close').on('click', function(event) {
      event.preventDefault();
      $(this).parent().parent().remove()
    });
  }

  KT.resizeImage = function(e, t) {
    try {
      if ("original" == t) return e;
      var n = e.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return n[1] + "_" + t + "." + n[2]
    } catch (r) {
      return e
    }
  }

  /* ---------------------------------------------
   CART DRAWER
  --------------------------------------------- */
  KT.drawOpen = function(){
    $('.cart-drawer').addClass('opend-overlay');
    $('#bg-overlay').addClass('cart-drawer-overlay').attr('data-box','cart-drawer').removeClass('menu-overlay');
    $('body').css({overflow:'hidden',paddingRight: theme.getScrollbarWidth()});
    if ($('.mini-cart').hasClass('load')) {
      $('.mini-cart').removeClass('load');
      if(theme.function.ajax_cart){
        $('.content__cart-drawer').addClass('loading');
        Shopify.KT_getCart();
      }
    }
    KT.drawResize();
  }
  KT.drawResize = function(){
    var wHeight = $(window).height();
    var headHeight = $('.head__cart-drawer').outerHeight();
    var footHeight = $('.footer__cart-drawer').outerHeight();
    var height = wHeight-(headHeight+footHeight+27);
    if (height > 350) {
      $('.items__cart-drawer').css('max-height',height);
    }else{
      $('.items__cart-drawer').css('max-height',350);
    }
  }

  /* ---------------------------------------------
   CART POPUP
  --------------------------------------------- */
  KT.popupOpen = function(){
    if ($('.mini-cart').hasClass('load')) {
      $('.mini-cart').removeClass('load');
      if(theme.function.ajax_cart){
        $('#cartModal .ajax__list-cart').addClass('loading');
        Shopify.KT_getCart();
      }
    }
    $('#cartModal').modal()
  }

  /* ---------------------------------------------
   BACKGROUND OVERLAY
  --------------------------------------------- */
  KT.bgOverlay = function(action){
    $(document).on(action, '#bg-overlay, .cls-overlay', function(e){
      e.preventDefault();
      var $this = $(this);
      var $bgOverlay = $('#bg-overlay');
      $('body').css({overflow:'',paddingRight: ''});
      switch($this.attr('data-box')) {
        case 'showUp':
          anime({targets: '#bg-overlay', backgroundColor: 'rgba(0,0,0,0)', duration: 270, easing: 'linear'})
          anime({targets: '#amShowUp', bottom: '-50%', opacity: 0, duration: 300, easing: 'linear', complete: function(anim) {
            $bgOverlay.removeClass('showUp').removeAttr('style data-form');
            $('#amShowUp').remove();
          }});
          break;
        default:
          $('.opend-overlay').removeClass('opend-overlay');
          anime({targets: '#bg-overlay', backgroundColor: 'rgba(0,0,0,0)', duration: 300, easing: 'linear', complete: function(anim) {
            $bgOverlay.removeAttr('style class data-box');
          }})
          break;
      }
    });
  }

  /* ---------------------------------------------
   FIX SWATCH STYLE
   --------------------------------------------- */
  KT.fixGridSwatch = function(){
    $('.color_pick.swatch, [data-usecolor="true"] .swatch').each(function( index ) {
      if(getComputedStyle(this).backgroundColor === 'rgba(0, 0, 0, 0)' && getComputedStyle(this).backgroundImage === 'none'){
        $(this).addClass('no_background')
      }
    });
  }

  /* ---------------------------------------------
   COUNTDOWN WITHOUT SECTION
  --------------------------------------------- */
  KT.countdown = function(){
    $('.kt_countdown').each(function(){
      if ($(this).parents('[data-section-type="countdown-section"]').length <= 0) {
        var el = $(this).parents('[data-section-type]');
        if (el.length > 0){
          if(el.hasClass('product-page')) {
            return true
          }
          theme.ktCountdown(el);
        } else {
          theme.ktCountdown($(this));
        }
      }
    });
  }

  /* ---------------------------------------------
   RESPONSIVE SPACE SECTION
   --------------------------------------------- */
  KT.respSpaceSc = function(el){
    var resp_0 = '',resp_1 = '',resp_2 = '',resp_3 = '',resp_4 = '',resp_5 = '';
    // 0, 576px, 768px, 992px, 1200px, 1230px
    var query0 = "screen and (min-width: 0px)",
        query1 = "screen and (min-width: 576px)",
        query2 = "screen and (min-width: 768px)",
        query3 = "screen and (min-width: 992px)",
        query4 = "screen and (min-width: 1200px)",
        query5 = "screen and (min-width: 1400px)",
    respSpace = function(el,count){
      var respon = el.attr('data-respon');
      // if (respon.indexOf('|') < 0) {return ''}
      var elData = JSON.parse(respon.replace(/'/g,'"'));
      var resp_ = elData.el + '{';
      if (elData.mt !== '') {
        var mt = elData.mt.toString().split('|');
        resp_ += mt[count] !== undefined ? 'margin-top:' + mt[count] + ';' : '';
      }
      if (elData.mb !== '') {
        var mb = elData.mb.toString().split('|');
        resp_ += mb[count] !== undefined ? 'margin-bottom:' + mb[count] + ';' : '';
      }
      if (elData.p !== '') {
        var p = elData.p.toString().split('|');
        if (elData.elp == undefined) {
          resp_ += p[count] !== undefined ? 'padding:' + p[count] + ';' : '';
          resp_ === elData.el + '{' ? resp_ = '' : resp_ += '}';
        } else if(p[count] !== undefined) {
          resp_ === elData.el + '{' ? resp_ = '' : resp_ += '}';
          resp_ += elData.elp + '{';
          resp_ += p[count] !== undefined ? 'padding:' + p[count] + ';' : '';
          resp_ += '}';
        } else {
          resp_ === elData.el + '{' ? resp_ = '' : resp_ += '}';
        }
      } else {
       resp_ === elData.el + '{' ? resp_ = '' : resp_ += '}';
      }
      return resp_;
    },
    el_respon = $('[data-respon]'),
    handler0 = {
        match : function() {
          if (el !== undefined) {
            resp_0 += respSpace(el,0);
          } else {
            $.each(el_respon, function(index, el) {
              resp_0 += respSpace($(this),0);
            });
          }
          resp_0 = resp_0 !== '' ? '@media ' + query0 + '{' + resp_0 + '}' : '';
        },
        destroy : function() {}
    },
    handler1 = {
        match : function() {
          if (el !== undefined) {
            resp_1 += respSpace(el,1);
          } else {
            $.each(el_respon, function(index, el) {
              resp_1 += respSpace($(this),1);
            });
          }
          resp_1 = resp_1 !== '' ? '@media ' + query1 + '{' + resp_1 + '}' : '';
        },
        destroy : function() {}
    },
    handler2 = {
        match : function() {
          if (el !== undefined) {
            resp_2 += respSpace(el,2);
          } else {
            $.each(el_respon, function(index, el) {
              resp_2 += respSpace($(this),2);
            });
          }
          resp_2 = resp_2 !== '' ? '@media ' + query2 + '{' + resp_2 + '}' : '';
        },
        destroy : function() {}
    },
    handler3 = {
        match : function() {
          if (el !== undefined) {
            resp_3 += respSpace(el,3);
          } else {
            $.each(el_respon, function(index, el) {
              resp_3 += respSpace($(this),3);
            });
          }
          resp_3 = resp_3 !== '' ? '@media ' + query3 + '{' + resp_3 + '}' : '';
        },
        destroy : function() {}
    },
    handler4 = {
        match : function() {
          if (el !== undefined) {
            resp_4 += respSpace(el,4);
          } else {
            $.each(el_respon, function(index, el) {
              resp_4 += respSpace($(this),4);
            });
          }
          resp_4 = resp_4 !== '' ? '@media ' + query4 + '{' + resp_4 + '}' : '';
        },
        destroy : function() {}
    },
    handler5 = {
        match : function() {
          if (el !== undefined) {
            resp_5 += respSpace(el,5);
          } else {
            $.each(el_respon, function(index, el) {
              resp_5 += respSpace($(this),5);
            });
          }
          resp_5 = resp_5 !== '' ? '@media ' + query5 + '{' + resp_5 + '}' : '';
        },
        destroy : function() {}
    };
    enquire.register(query0, handler0, true);
    enquire.register(query1, handler1, true);
    enquire.register(query2, handler2, true);
    enquire.register(query3, handler3, true);
    enquire.register(query4, handler4, true);
    enquire.register(query5, handler5, true);
    if ($('style.respSpaceSc').length) {
      $('.respSpaceSc').html(resp_0+resp_1+resp_2+resp_3+resp_4+resp_5);
    }else{
      $('body').append('<style class="respSpaceSc">'+resp_0+resp_1+resp_2+resp_3+resp_4+resp_5+'</style>');
    }
  }
  
  /* ---------------------------------------------
   API
  --------------------------------------------- */
  KT.addItem = function(id, qty, backfunc) {
    var itemChange = id;
    var qty = qty || 1,
        ajax = {
          type: "POST",
          url: Shopify.root_url+"/cart/add.js",
          data: "quantity=" + qty + "&id=" + itemChange,
          dataType: "json",
          success: function(e) {
            window.location.href = Shopify.root_url+'/cart';
          },
          error: function(e) {
            alert('error');
          }
        };
    $.ajax(ajax)
  }
  KT.addItemFromFormAddMore = function(el_id) {
    var queue = [];
    $(el_id+' [name="quantity"]').each(function() {
      queue.push({
        "id": parseInt($(this).attr('data-id')),
        "quantity": parseInt($(this).val(), 10) || 0
      });
    });
    var ajax = {
          type: "POST",
          url: Shopify.root_url+"/cart/add.js",
          data: {'items': queue},
          dataType: "json",
          success: function(e) {
            window.location.href = Shopify.root_url+'/cart';
          },
          error: function(e) {
            alert('error');
          }
        };
    $.ajax(ajax)
  }
  KT.resizeImage = function(image, size) {
    try {
      if(size == 'original') { return image; }
      else {      
        var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
        return matches[1] + '_' + size + '.' + matches[2];
      }    
    } catch (e) { return image; }
  }
  KT.getProduct = function(handle, callback) {
    jQuery.getJSON(Shopify.root_url+'/products/' + handle + '.js', function (product, textStatus) {
      if ((typeof callback) === 'function') {
        callback(product);
      }
      else {
        console.log(product.title);
      }
    });
  };

  /* ---------------------------------------------
    Scripts ready
  --------------------------------------------- */
  $(document).ready(function() {
    KT.ajaxSearch();
    kt_search();
    kt_quickView();
    kt_quickShop();
    kt_editOpts();
    customize_error();
    embedRespon();
    recentlyViewedAdd();
    recentlyViewedProductSingle();
    css_banner_builded();
    theme.is_mobile ? KT.bgOverlay('touchstart') : KT.bgOverlay('click');
    KT.respSpaceSc();
    if(theme.wishlist.type == 'local'){
      AutoloadWishlist();
      AddWishlist();
      RemoveWishlist();
    }
    if(theme.wishlist.type == 'nitro'){
      AutoloadWishlistNitro();
      addwishlist();
      removewishlist();
    }
    AutoloadCompare();
    AddCompare();
    RemoveCompare();
    KT.countdown();
    KT.fixGridSwatch();
    theme.suggest.enable ? suggestProducts() : null;

    // Scroll top Top
    $('.scrollToTop').on('click', function() {
      $('body,html').animate({scrollTop:0},800);
    });

    // CART
    $(document)
    .on('click', 'input.kt_agree', function(){
      var layout = $(this).attr('data-layout');
      if ($(this).is(':checked')) {
        $('input.kt_agree[data-layout="'+layout+'"]').prop('checked',true);
        $('.alert-terms-conditions').alert('close');
        if (layout == 'checkout') {
          $('.additional-checkout-buttons').css('pointer-events', '');
        }
      }else{
        $('input.kt_agree[data-layout="'+layout+'"]').prop('checked',false);
        if (layout == 'checkout') {
          $('.additional-checkout-buttons').css('pointer-events', 'none');
        }
      }
    })
    .on('click', '.kt_agree_swich', function(e){
      var layout = $(this).attr('data-layout');
      if ($('input.kt_agree[data-layout="'+layout+'"]').length > 0 && $('input.kt_agree[data-layout="'+layout+'"]').is(':checked') == false) {
        e.preventDefault();
        e.stopPropagation();
        KT.loadScript('theme-alert', function(e,l){
          if (l == 'ok') {
            KT_Alert.terms_conditions(layout);
          }
        });
      }
    })
    if ($('input.kt_agree[data-layout="checkout"]').length > 0 && $('input.kt_agree[data-layout="checkout"]').is(':checked') == false) {
      $('.additional-checkout-buttons').css('pointer-events', 'none');
    }

    // CART MINI
    if($('.ajax__list-cart').length && theme.function.ajax_cart){
      $(document).on('mouseenter', '.mini-cart:not([onclick]) .icon-link', function(e) {
        if ($('.mini-cart').hasClass('load')) {
          $('.mini-cart').removeClass('load');
          $('.ajax__list-cart').addClass('loading')
          Shopify.KT_getCart();
        } else {
          return
        }
      });
    }
    $(document).on('click', '[onclick] a', function(e) {
      e.preventDefault();
    })

    // CART DRAWER
    $(document)
    .on('click', '.footer__cart-drawer .nav-link' ,function(){
      $('.cart-drawer__content').addClass('show-tab-floating');
      $('.'+$(this).attr('data-tab-content')).addClass('show');
    })
    .on('click', '.btn-x-tab-floating' ,function(){
      $('.cart-drawer__content').removeClass('show-tab-floating');
      $(this).parents('.tab-floating').removeClass('show');
    })
    $(document)
    .on('focusin', '#CartSpecialInstructions' ,function(){
      $('.note__cart-drawer').addClass('show');
      $('.note__cart-drawer .update').show();
    })
    .on('click', '.toggle_ship' ,function(){
      $('.cart-drawer .wrapper__shipping').toggleClass('show');
    })

    // CART PAGE
    $(document)
    .on('change', '#discount_code', function(e){
      e.stopPropagation();
    })
    .on('click', '.save_discount_code', function(event){ 
      event.preventDefault();
      $(this).addClass('loading');
      var discountCode = $(this).parent().find('[name="discount_code"]').val();
      $.ajax({
        type: "POST",
        url: Shopify.root_url+'/cart.js',
        data: {"attributes[discount]": discountCode},
        dataType: 'json',
        success: function(data) {
          $('.save_discount_code').removeClass('loading');
          $('form[action="'+Shopify.root_url+'/checkout"] #coupon_code').val(discountCode).trigger('change')
        }
      });
    })
    .on('click', '.modalQuickShop .back_id', function(event) {
      event.preventDefault();
      var data = theme.psjson_lib[parseInt($(this).attr('data-pid'))];
      var variant = _.find(data, { 'id': parseInt($(this).attr('data-vrid')) });
      $('.p-gift-variant').html(variant.title+'<i class="fkt-edit" aria-hidden="true"></i></span>');
      $('.p-gift-price').html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));
      $('.p-gift-image').html('<img src="'+variant.featured_image.src.replace('.jpg?','_240x.jpg?').replace('.png?','_240x.png?')+'" alt="">');
      var new_gift_wrap = '<input type="hidden" name="updates['+$(this).attr('data-vrid')+']" value="1">';
      $('#is-a-gift').append(new_gift_wrap);
      $('#gift-wrap_product').val(0).trigger('change');
      $('.modalQuickShop').modal('hide'); 
    });
    
    // BOTTOM BAR
    $(document).on('click', '.bottom__bar .menu-toggle', function (e) {
      e.preventDefault();
      $('.mobile-menu-wrapper.lazyload').attr('data-include',Shopify.root_url+'/cart?view=mobile-menu&q=category');
      if ($('.nav-link[data-type="item_categories_1"]').length > 0) {
        $('.nav-link[data-type="item_categories_1"]').trigger('click');
      }
    })
    .on('click', '.bottom__bar .filterMobile', function(e){
      e.preventDefault();
      if($('.kt--filter.kt--filter-m').hasClass('show')){
        $('.kt--filter.kt--filter-m.show').removeClass('show');
      }
      else{
        $('.kt--filter.kt--filter-m').addClass('show');
      }
    });

    // SCROLL TOP
    $(document).on('click', '.scroll_top', function() {
      $('body,html').animate({scrollTop:0},800);
    });
    
    $(document)
    .on('click', '.fake_select label', function(e) {
      e.preventDefault();
      var $this = $(this).parents('.fake_select');
      $this.toggleClass('show');
      $('.fake_select.show').not($this).removeClass('show');
    })
    .on("click", function(e) {
      if ($(e.target).is('.fake_select.show') === false && $(e.target).is('.fake_select.show *') === false) {
        $('.fake_select').removeClass("show");
      }
    })
    .on('click', '.btn.play', function(e) {
      $(this).closest('.product-page').find('video.video-element').trigger('play');
    });
    
    $(document)
    .on('click', '.kt--drop-title', function(e) {
      e.preventDefault();
      var $this = $(this).parent();
      $this.toggleClass('show');
      $('.kt--drop-i.show').not($this).removeClass('show');
    })
    .on("click", function(e) {
      if ($(e.target).is('.kt--drop-i.show') === false && $(e.target).is('.kt--drop-i.show *') === false) {
        $('.kt--drop-i.show').removeClass("show");
      }
    })
    .on("click", ".kt--drop-in a, .kt--drop-in [data-href]", function(e) {
      var $this = $(this).parents('.kt--drop-i');
      $this.css("pointer-events","none");
      setTimeout(function(){
        $this.css("pointer-events","")
      }, 400);
    });

    $(document).on('click', '.tab-list-ajax [data-toggle="list"]', function(e) {
      var tab_content = $(this).closest('.tab-list-ajax').find('.tab-content');
      if($(this).attr('data-view') !== undefined){
        $(this).closest('.tab-list-ajax').find('.section-title .button-more a').attr('href', $(this).attr('data-view'))
      }
      if ($($(this).attr('href')).find('.swiper-wrapper.lazyload').length > 0) {
        var height = tab_content.innerHeight();
        tab_content.addClass('including').css('height', height - 200);
        $($(this).attr('href')).find('.button-loadmore').css('opacity', '0');
      }
    });

    $(document).on('click', '.btn-onclick', function(e) {
      $(this).addClass('loading').removeClass('loaded');
    })

    $('[id|="mc-embedded-subscribe-form"]').each(function(){
      var $form = $(this);
      if ($form.length > 0 && theme.function.nll_ajax) {
        $form.find('[type="submit"]').bind('click', function (event) {
          if (event) event.preventDefault()
          KT.register($form)
        })
      }
    });

    if ( $(window).width() >= 992 && $('.sticky-content').length > 0) {
      $('.sticky-content').stick_in_parent({
        offset_top: 80
      });
    }
    $(document)
    .on('click', '.drop-mobile .label-drop', function(e){
      e.preventDefault();
      $(this).parent().toggleClass('show');
    })
    .on('click', function(e){
      if ($(e.target).is('.drop-mobile.show *') === false ) {
        $('.drop-mobile.show').removeClass("show");
      }
    });  
    /* ---------------------------------------------
     Fixed-fshadow
     --------------------------------------------- */
    $(document)
    .on('mouseenter', '.swiper-fixed-fshadow .grid-item', function(event) {
      event.preventDefault();
      $(this).parents('.swiper-fixed-fshadow').css('z-index', '2');
    })
    .on('touchstart', '.swiper-fixed-fshadow .grid-item', function(event) {
      event.preventDefault();
      $(this).parents('.swiper-fixed-fshadow').css('z-index', '2');
    })
    .on('touchmove', '.swiper-fixed-fshadow .grid-item', function(event) {
      event.preventDefault();
      $(this).parents('.swiper-fixed-fshadow').css('z-index', '');
    })
    .on('mouseleave', '.swiper-fixed-fshadow .grid-item', function(event) {
      event.preventDefault();
      $(this).parents('.swiper-fixed-fshadow').css('z-index', '');
    });

    // Scroll To button
    var $scrollTo = $('.kt_home_slide .btn');
    if ( $scrollTo.length ) {
      $scrollTo.on('click', function(e) {
        var target = $(this).attr('href');
        if (target.length > 1 && target.charAt(0) === '#') {
          e.preventDefault();
          var $target = $(target);
          var scrolloffset = ($(window).width() >= 992) ? ($target.offset().top - 52) : $target.offset().top
          $('html, body').animate({
            'scrollTop': scrolloffset
          }, 600);
        }
      });
    }
    if ($('.border-top.unset').length > 0 && $('#shopify-section-kt_top_banner > div').length > 0) {
      $('.border-top.unset').show()
    }

    if ($('#currency_form').length > 0) {
      $(document).on('click', '.curcy_item', function(event){
        event.preventDefault();
        $('.curcy_list').css('pointer-events', 'none');
        var newCurrency =  $(this).data('currency');
        $('#currency_form input[name="currency"]').val(newCurrency);
        $('#currency_form').submit();
      })
    }
    /* ---------------------------------------------
     Form trick
    --------------------------------------------- */
    $(document)
    .on('click', '.product-thumb a[data-href]', function(event) {
      event.preventDefault();
      window.location.href = $(this).attr('data-href');
    })
    if (!themeAjaxCart) {
      $(document)
      .on('click', '[data-submit]:not(.kt__quick-shop)', function(event) {
        event.preventDefault();
        $(this).parents('form').submit();
      })
    }


    /* ---------------------------------------------
     FBT
    --------------------------------------------- */
    $(document).on('change','.fbt-prds select, .fbt-prds .custom-control-input', function(e){
      var price = 0, cprice = 0;
      $.each($('.fbt-info select'), function(idx, el) {
        if ($(this).parents('.custom-control').find('.custom-control-input').is(":checked")) {
          var opt = $(this).find('option[value="'+$(this).val()+'"]');
          price = price + parseInt(opt.attr('data-price'));
          cprice = cprice + parseInt(opt.attr('data-cprice'));
        }
      });
      var $this = $(this);
      var is_input = this.nodeName;
      $('.fbt-btn ins').html(theme.Currency.formatMoney(price, theme.moneyFormat));
      if (cprice > price) {
        $('.fbt-btn del').html(theme.Currency.formatMoney(cprice, theme.moneyFormat)).show();
      } else {
        $('.fbt-btn del').hide();
      }
      if(is_input !== 'INPUT'){
        var prices = $this.find('option:selected').data();
        $this.parent().find('.product-price ins').html(theme.Currency.formatMoney(prices.price, theme.moneyFormat));
        if (prices.cprice > prices.price) {
          $this.parent().find('.product-price del').html(theme.Currency.formatMoney(prices.cprice, theme.moneyFormat)).show();
        } else {
          $this.parent().find('.product-price del').html('');
        }        
      }
      if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
        Kt_currency.convertAll(shopCry,localStorageCurrency,'.fbt-prds span.money');
      }
      // console.log(price, cprice);
      var pid = $this.parents('[data-pid]').data('pid');
      if (is_input === 'INPUT') {
        var input = $this.parent().find('input[name*="updates"]');
        if($this.is(":checked")){
          $('.fbt-item-'+pid).parent().show(300);
          input.val(1);
        } else {
          $('.fbt-item-'+pid).parent().hide(300);
          input.val(0);
        }
        setTimeout(function() {
          $('#Swiper-fbt .swiper-container')[0].swiper.update();
        }, 300);
        return
      } else {        
        var input = $this.parent().find('input[name*="updates"]');
        input.attr('name', 'updates['+$this.val()+']');
      }

      // Update image
      var psjson = theme.psjson_lib[parseInt(pid)];
      var variant = _.find(psjson, { 'id': parseInt($this.val()) });
      // console.log(variant);
      if (variant == undefined || variant.featured_image == null){return}
      var pInner = $('.fbt-item-'+pid);
      var img_scr = pInner.find('.primary-thumb img');
      var name_src = img_scr.attr('src') != undefined ? img_scr.attr('src').split(',')[0] : undefined;
      if (name_src == undefined) {
        name_src = img_scr.attr('srcset') != undefined ? img_scr.attr('srcset').split(',')[0] : undefined;
      }
      var imgChecked = false;
      if (variant.featured_image && name_src != undefined) {
        imgChecked = (name_src.split('/').slice(-1)[0]).indexOf(theme.Images.getName(variant.featured_image.src)) < 0 ? true : false;
      }
      if (imgChecked === true) {
        var img_url = variant.featured_image.src;
        var fileExt = _.last(img_url.split('.'));
        var imgLarge = new Image();
        imgLarge.src = theme.Images.removeProtocol(img_url.replace('.'+fileExt, '_540x.'+fileExt)); 
        var featured_image = '<div class="primary-thumb '+theme.Images.imgFit(variant.featured_image.width,variant.featured_image.height)+'"><img class="lazyload"';
            featured_image += 'src="'+theme.Images.removeProtocol(img_url.replace('.'+fileExt, '_540x.'+fileExt))+'"';
            featured_image += 'data-src="'+theme.Images.removeProtocol(img_url.replace('.'+fileExt, '_{width}x.'+fileExt))+'"';
            featured_image += 'data-widths="[240]"';
            featured_image += 'data-sizes="auto"';
            featured_image += 'alt=""></div>';
        pInner.find('.aspectRatio').append(featured_image);
        pInner.find('.primary-thumb').first().remove();
      }
    })
    $(document).on('click','.fbt-view', function(){
      $('.fbt-info').slideToggle();
      $('.fbt-view .more, .fbt-view .less').toggle();
    })
    $(document).on('click.bs.dropdown','.header .main-header .dropdown', function (event) {
      event.stopPropagation();
    })
  });

  /* ---------------------------------------------
   Scripts scroll
   --------------------------------------------- */
  $(window).scroll($.throttle( 150, function() {
    // Show hide scrolltop button
    if($(this).scrollTop() > theme.window_H ) {
      $('.scroll_top').fadeIn(500);
    } else {
      $('.scroll_top').fadeOut(800);
    }
  }));
  
  /* ---------------------------------------------
   Scripts resize
   --------------------------------------------- */
  $(window).on("resize", function() {
    KT.respSpaceSc();
    KT.drawResize();
  });


  if(Shopify.designMode){
    var designMode_refresh = function () {
      recentlyViewedProductSingle();
      css_banner_builded();
      customize_error();
      KT.countdown();
      KT.respSpaceSc();
      embedRespon();
    }
    $(document)
    .on('shopify:section:load', designMode_refresh)
    .on('shopify:block:select', designMode_refresh);
  }

})( jQuery );