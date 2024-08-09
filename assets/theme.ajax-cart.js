function attributeToString(e) {
  return "string" != typeof e && (e += "", "undefined" === e && (e = "")), jQuery.trim(e)
}
"undefined" == typeof window.Shopify && (window.Shopify = {}),

Shopify.KT_onError = function(e, t) {
  $('.btn.loading, .kt-button.loading').removeClass('loading');
  var n = eval("(" + e.responseText + ")");
  if(n.message){
    theme.toast({
      title: "Error",
      message: n.message + "(" + n.status + "): " + n.description + ".",
      type: "error",
      duration: 5000
    })
  } else {
    theme.toast({
      title: "Error",
      message: Shopify.KT_fullMessagesFromErrors(n).join("; ") + ".",
      type: "error",
      duration: 5000
    })
  }
},
Shopify.KT_fullMessagesFromErrors = function(e) {
  var t = [];
  return jQuery.each(e, function(e, n) {
    jQuery.each(n, function(n, r) {
      t.push(e + " " + r)
    })
  }), t
},
Shopify.KT_onCartUpdate = function(e,remove) {
  // alert("There are now " + e.item_count + " items in the cart."); 
  Shopify.KT_onCartUpdate_(e,remove);
},
Shopify.KT_onCartShippingRatesUpdate = function(e, t) {
  var n = "";
  t.zip && (n += t.zip + ", "), t.province && (n += t.province + ", "), n += t.country;
},
Shopify.KT_onItemAdded = function(e) {
  // Shopify.Cart.alert(e, true)
  Shopify.KT_getCart();
},
Shopify.KT_addItem = function(e, t, n) {
  var itemChange = e;
  var t = t || 1,
      r = {
        type: "POST",
        url: Shopify.root_url+"/cart/add.js",
        data: "quantity=" + t + "&id=" + e,
        dataType: "json",
        success: function(e) {
          "function" == typeof n ? n(itemChange,e) : Shopify.KT_onItemAdded(e)
        },
        error: function(e, t) {
          Shopify.KT_onError(e, t)
        }
      };
  jQuery.ajax(r)
},
Shopify.KT_addItems = function(items, callback) {
  var ajax = {
        type: "POST",
        url: Shopify.root_url+"/cart/add.js",
        data: {'items': items},
        dataType: "json",
        success: function(data) {
          "function" == typeof callback ? callback(items) : Shopify.KT_onItemAdded(data)
        },
        error: function(data, t) {
          Shopify.KT_onError(data, t)
        }
      };
  jQuery.ajax(ajax)
},
Shopify.KT_addItemFromForm = function(e, t) {
  // console.log(jQuery("#" + e).serialize());
  var n = {
    type: "POST",
    url: Shopify.root_url+"/cart/add.js",
    data: jQuery("#" + e).serialize(),
    dataType: "json",
    success: function(e) {
      "function" == typeof t ? t(e) : Shopify.KT_onItemAdded(e)
    },
    error: function(e, t) {
      Shopify.KT_onError(e, t)
    }
  };
  jQuery.ajax(n)
},
Shopify.KT_addItemsFromForm = function(el) {
  var n = {
      type: "POST",
      url: Shopify.root_url+"/cart/update.js",
      data: $(el).serialize(),
      dataType: "json",
      success: function(e) {
        "function" == typeof t ? t(e) : Shopify.KT_onCartUpdate(e);
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(n)
},
Shopify.KT_getCart = function(e) {
  jQuery.getJSON(Shopify.root_url+"/cart.js", function(t, n) {
    "function" == typeof e ? e(t) : Shopify.KT_onCartUpdate(t)
  })
},
Shopify.KT_changeItem = function(e, t, n) {
  var itemChange = e;
  var r = {
      type: "POST",
      url: Shopify.root_url+"/cart/change.js",
      data: "quantity=" + t + "&id=" + e,
      dataType: "json",
      success: function(e) {
        "function" == typeof n ? n(itemChange,e) : Shopify.KT_onCartUpdate(e)
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(r)
},
Shopify.KT_removeItem = function(e, t) {
  var itemChange = e;
  var n = {
      type: "POST",
      url: Shopify.root_url+"/cart/change.js",
      data: "quantity=0&id=" + e,
      dataType: "json",
      success: function(e) {
        "function" == typeof t ? t(itemChange,e,'remove item') : Shopify.KT_onCartUpdate(e,'remove item')
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(n)
},
Shopify.KT_clear = function(e) {
  var t = {
      type: "POST",
      url: Shopify.root_url+"/cart/clear.js",
      data: "",
      dataType: "json",
      success: function(t) {
        "function" == typeof e ? e(t) : Shopify.KT_onCartUpdate(t)
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(t)
},
Shopify.KT_updateCartAttributes = function(e, t) {
  var n = "";
  jQuery.isArray(e) ? jQuery.each(e, function(e, t) {
      var r = attributeToString(t.key);
      "" !== r && (n += "attributes[" + r + "]=" + attributeToString(t.value) + "&")
  }) : "object" == typeof e && null !== e && jQuery.each(e, function(e, t) {
      n += "attributes[" + attributeToString(e) + "]=" + attributeToString(t) + "&"
  });
  var r = {
      type: "POST",
      url: Shopify.root_url+"/cart/update.js",
      data: n,
      dataType: "json",
      success: function(e) {
        "function" == typeof t ? t(e) : Shopify.KT_onCartUpdate(e)
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(r)
},
Shopify.KT_updateCartNote = function(e, t) {
  var n = {
      type: "POST",
      url: Shopify.root_url+"/cart/update.js",
      data: "note=" + attributeToString(e),
      dataType: "json",
      success: function(cart) {
        "function" == typeof t ? t(cart) : Shopify.KT_onCartUpdate(cart);
        if (cart.note !== '') {
          $('[data-tab-content="tab-floating-note"]').addClass('has-data');
        } else {          
          $('[data-tab-content="tab-floating-note"]').removeClass('has-data');
        }
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
  };
  jQuery.ajax(n)
},
Shopify.KT_updatedCartNote = function(cart) {
  $('.kt-button.loading').removeClass('loading');
  $('.cart-drawer__content').removeClass('show-tab-floating');
  $('.tab-floating-note').removeClass('show');
},
Shopify.KT_buildParams = function(e, t, n) {
    jQuery.isArray(t) && t.length ? jQuery.each(t, function(t, r) {
      rbracket.test(e) ? n(e, r) : Shopify.KT_buildParams(e + "[" + ("object" == typeof r || jQuery.isArray(r) ? t : "") + "]", r, n)
    }) : null != t && "object" == typeof t ? Shopify.KT_isEmptyObject(t) ? n(e, "") : jQuery.each(t, function(t, r) {
      Shopify.KT_buildParams(e + "[" + t + "]", r, n)
    }) : n(e, t)
},
Shopify.KT_isEmptyObject = function(e) {
  for (var t in e) return !1;
  return !0
},
Shopify.KT_addGift = function(cart){
  if($('[data-gift-auto-add]').length <= 0){return false}
  let option_data = JSON.parse($('[data-gift-auto-add]').html())
  if(!option_data && !option_data.id){return false}
  
  let alreadyExist = cart.items.filter(variant => variant.id == option_data.id);
  
  if(alreadyExist.length){
    if(cart.total_price < option_data.price_limit){
      Shopify.KT_removeItem(option_data.id)
    }else{
      return false
    }
  }
  
  if(cart && cart.total_price >= option_data.price_limit){
    let data = {
      id: option_data.id,
      quantity: 1
    }
    var n = {
      type: "POST",
      url: Shopify.root_url+"/cart/add.js",
      data: data,
      dataType: "json",
      success: function(e) {
        "function" == typeof t ? t(e) : Shopify.KT_onItemAdded(e)
      },
      error: function(e, t) {
        Shopify.KT_onError(e, t)
      }
    };
    jQuery.ajax(n)    
  } else {
    return false
  }
};

/* ----------- onClick customize for theme
---------------*/
$(document)
.on('click', '.addItemAjax', function(event){
  event.preventDefault();
  var $this = $(this);
  var id = $this.attr('data-vrid');
  var qty = 1;
  var $form = $this.parents('.form-ajax--');
  $this.find('.addItemAjax-text').attr('data-prev-text', $this.find('.addItemAjax-text').text()).addClass('waitting-text-change');
 	//       $this.addClass('disabled');
  if ($form.length > 0) {
    if($form.find('[name="id"]').length > 0){
      id = $form.find('[name="id"]').val();

      
    }
    if($form.find('[name="quantity"]').length > 0){
      qty = $form.find('[name="quantity"]').val();
    }
  }
  Shopify.KT_addItem(id,qty);
})
.on('click', '.addItemsAjax', function(event){
  event.preventDefault();
  $(this).addClass('loading');
  Shopify.KT_addItemsFromForm('.addItemsAjaxFrom')
  
   
})
.on('click', '.cart-drawer .remove-item', function(event){
  event.preventDefault();
  $(this).parents('.item__cart').find('input').val(0).trigger('change');
})
.on('submit', '#upadteCartNote', function(event){
  event.preventDefault();
  $(this).find('.kt-button').addClass('loading');
  Shopify.KT_updateCartNote($('#upadteCartNote').find('textarea[name="note"]').val(),Shopify.KT_updatedCartNote);
})
.on('submit', '#upadteCartCoupon', function(event) {
  event.preventDefault();
  var checkOutForm = $('#upadteCartCheckout');
  var discountCode = $(this).find('input[name="discount"]').val();
  if (checkOutForm.find('input[name="discount"]').length > 0) {
    checkOutForm.find('input[name="discount"]').val(discountCode);
  } else {
    checkOutForm.append('<input type="hidden" name="discount" value="'+discountCode+'">');
  }
  $.ajax({
    type: "POST",
    url: Shopify.root_url+'/cart.js',
    data: {"attributes[discount]": discountCode},
    dataType: 'json',
    success: function(data) {
      $('.tab-floating-coupon').removeClass('show');
      $('.cart-drawer__content').removeClass('show-tab-floating');
      if (discountCode == '') {
        $('[data-tab-content="tab-floating-coupon"]').removeClass('has-data');
      } else {
        $('[data-tab-content="tab-floating-coupon"]').addClass('has-data');
      }
    }
  });
})
.on('change', '#gift-wrapping', function(event) {
  event.preventDefault();
  event.stopPropagation();
  if ($(this).is(':checked')) {
    $('#gift-wrap_product').val(1).trigger('change');
  } else {      
    $('#gift-wrap_product').val(0).trigger('change');
  }
})
.on('change', '#upadteCartDrawer', function(event) {
  event.preventDefault();
  $('.content__cart-drawer').addClass('loading')
  Shopify.KT_addItemsFromForm('#upadteCartDrawer');
});

/* ----------- onCartUpdate customize for theme
---------------*/
Shopify.KT_onCartUpdate_ = function(cart,remove_action) {
  if (window.location.pathname.indexOf(Shopify.root_url+'/cart') == 0){
    location.reload();
    return false;
  }
  let GiftAdded =  Shopify.KT_addGift(cart);
  if(GiftAdded != false){return}

  var table = $(".ajax__list-cart");
  var table_content = '';
  $('.cartCount').text(cart.item_count);
  $('.cartCost').attr('data-price',cart.total_price).html(theme.Currency.formatMoney(cart.items_subtotal_price, theme.moneyFormat));
  if (cart.items_subtotal_price !== cart.total_price) {
    $('.cartSubTotalWrap').show();
  } else {
    $('.cartSubTotalWrap').hide();
  }
  $('.cartCostTotal').html(theme.Currency.formatMoney(cart.total_price, theme.moneyFormat));
  $('.title.has-item').html(cart.item_count == 1 ? theme.strings.cartItem.split('(')[0]+'('+cart.item_count+' '+theme.strings.cartItemText+')'+theme.strings.cartItem.split(')')[1] : theme.strings.cartItems.split('(')[0]+'('+cart.item_count+' '+theme.strings.cartItemsText+')'+theme.strings.cartItems.split(')')[1]);
  $('.btn.loading, .kt-button.loading').removeClass('loading');
  $('.waitting-text-change').text(theme.strings.addedToCart);
  $('.mini-cart .icon-link').removeClass('load');

  var iconCartVisible = function(){
    var cartVisible = false;
    if (theme.function.sticky_icon_cart === false) {return false}
    $('.cartCount:not(.fixed)').each(function(el,idx){
      if(this.getBoundingClientRect().top > 1){
        cartVisible = true;
      }
      if((idx + 1) === $('.cartCount:not(.fixed)').length) {
        return false;
      }
    });
    return cartVisible;
  }
  if (iconCartVisible() === false) {
    if (theme.function.type_ajax_cart === 'drop' || theme.function.type_ajax_cart === 'none') {
      $('body').addClass('popIn');
      anime({
        targets: '.cartCount.fixed',
        keyframes: [
          {backgroundColor: '#fff',color: '#555',scale: 1.25,rotate:-45,borderRadius:15},
          {backgroundColor: '#111',color: '#fff',scale: 1,rotate:0,borderRadius:50}
        ],
        duration: 2000,
        delay: 100,
        easing: 'easeOutElastic(1, .8)',
        compvare: function(anim) {
          $('.cartCount.fixed').removeAttr('style')
        }
      });
    }
  }
  if (theme.function.type_ajax_cart === 'none') {return}
  var urlAjax = Shopify.root_url+'/cart?view=listjsondrop';
  theme.function.type_ajax_cart == 'drawer' ? urlAjax = Shopify.root_url+'/cart?view=listjson' : urlAjax;
  theme.function.type_ajax_cart == 'popup' ? urlAjax = Shopify.root_url+'/cart?view=listjsonpopup' : urlAjax;
  if ($('#address_country').length > 0) {
    if($('#address_country option').length <= 0 ) {
      Shopify.Cart.getCountry();
    }
    if($('.get__shipping').attr('data-curr-address') !== undefined && cart.item_count > 0){
      $('.get__shipping').show();
      if ($('#address_country option').length > 0) {
        var address = JSON.parse($('.get__shipping').attr('data-curr-address'));
        Shopify.Cart.getCartShippingRates(address,Shopify.Cart.getShippingCart,Shopify.Cart.onError);
      }
    }
  }
  $.ajax({
    type: 'get',
    url: urlAjax,
    beforeSend: function() {
      if(!remove_action && theme.function.type_ajax_cart == 'drawer'){
        theme.is_mobile ? $('.close-qs').trigger('touchstart') : $('.close-qs').trigger('click');
      }
      if (cart.item_count > 0) {
        if ( $( ".has-item" ).is( ":hidden" ) ) {
          $('.has-item').css({'display':''});
          $('.no-item').css({'display':'none'});
        }
      }
      else {
        if ( $( ".no-item" ).is( ":hidden" ) ) {
          $('.has-item').css({'display':'none'});
          $('.no-item').css({'display':''});
        }
      }
      if($('#md_qvModal').length > 0){
        $('#md_qvModal').modal('hide')
      }
      if($('#compare-modal').length > 0){
        $('#compare-modal').modal('hide')
      }
      if($('.modalQuickShop').length > 0){
        $('.modalQuickShop').modal('hide')
      }
      if($('.modalEditOpts').length > 0){
        $('.modalEditOpts').modal('hide')
      }
    },
    success: function(table_content) {
      $('.mini-cart').removeClass('load');
      setTimeout(function(){
        $('.btn.adding').text(theme.strings.addToCart).removeClass('adding');
      },1000)
      var data = table_content.split('<!-- summary-discounts -->')
      table_content = data[0];
      if (data[1] && data[1].length > 0){
        $('.summary-discounts').html(data[1]).removeClass('d-none');
      } else {
        $('.summary-discounts').html(data[1]).addClass('d-none');
      }
      table.html(table_content).removeClass('loading');
      if(!remove_action && theme.function.type_ajax_cart == 'drawer'){
        KT.drawOpen();
      }
      if(!remove_action && theme.function.type_ajax_cart == 'popup'){
        KT.popupOpen();
      }
      if($('.spendFreeShip').length > 0){
        var $spendFreeShip = $('.spendFreeShip');
        var line_total = parseInt($spendFreeShip.find('[aria-valuemax]').attr('aria-valuemax'));
        var progress_bar = $spendFreeShip.find('.progress-bar');
        if (line_total > cart.total_price){
          progress_bar.attr('aria-valuenow', line_total - cart.total_price).css('width',cart.total_price / line_total * 100 + '%').text(Math.round(cart.total_price / line_total * 100) + '%');
          $spendFreeShip.find('.text_progress .add_more_price').html(theme.function.threshold_cart.replace('#more', theme.Currency.formatMoney(line_total - cart.total_price, theme.moneyFormat)));
          $spendFreeShip.removeClass('congratulations');
        }else{
          progress_bar.attr('aria-valuenow', line_total).css('width','100%').text('100%');
          $spendFreeShip.addClass('congratulations');
        }
      }
      $('.title-ajax__cart').html(cart.item_count == 1 ? theme.strings.cartItem.split('(')[0]+'('+cart.item_count+' '+theme.strings.cartItemText+')'+theme.strings.cartItem.split(')')[1] : theme.strings.cartItems.split('(')[0]+'('+cart.item_count+' '+theme.strings.cartItemsText+')'+theme.strings.cartItems.split(')')[1]);
      if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
        Kt_currency.convertAll(shopCry,localStorageCurrency);
      }
      $('.content__cart-drawer.loading').removeClass('loading');
    }
  });
}