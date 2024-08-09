"undefined" == typeof Shopify.Cart && (Shopify.Cart = {});
Shopify.Cart.getCartShippingRates = function(address, callback, n) {
  n = n || Shopify.Cart.onError;
  // console.log(e);
  jQuery.ajax({
    url: Shopify.root_url+'/cart/shipping_rates.json',
    type: 'GET',
    data: $.param({shipping_address: address})
  })
  .done(function(respon) {
  // console.log("success");
    callback(respon.shipping_rates,address);
  })
  .fail(function(XMLHttpRequest, textStatus) {
    // console.log("error");
    n(XMLHttpRequest, textStatus);
  });
},
Shopify.Cart.getShippingCart = function(respon,address) {
  $.ajax({
    type: "POST",
    url: Shopify.root_url+'/cart.js',
    data: {"attributes[theme_shipping]": JSON.stringify(address)},
    dataType: 'json'
  });
  var $getShipping = $('.get__shipping'),
      $contentShipping = $('.content__shipping'),
      $cartCost = $('.cartCost'),
      $cartCostTotal = $('.cartCostTotal.plus_shipping'),
      $addressShipping = $('.address__shipping');

  $getShipping.attr('data-curr-address',JSON.stringify(address));
  var addressHTML = ''; 
  if(address.zip !== '1'){
    addressHTML += address.zip + ', ';
  }
  if(address.province !== address.country){
    addressHTML += address.province + ', ';
  }
  addressHTML += address.country;
  $addressShipping.html(addressHTML).show();
  $('.toggle_ship').show();
  if(respon.length == 0){
    $('[data-tab-content="tab-floating-shipping"]').removeClass('has-data');
    $contentShipping.html('<td colspan="2"><div class="alert alert-danger" role="alert">There are no shipping methods available for your cart or destination.</div></td>');
  } else {
    var items_ = '<td class="item__shipping" colspan="2">';
    $.each(respon, function(index, val) {
      items_ += '<div class="item_shipp">';
      items_ += '<div class="item_shipp_name custom-control custom-radio">';
      items_ += '<input id="item_spp'+index+'" class="custom-control-input" type="radio" name="shipping-cart-drawer" data-name="'+val.code+'" value="'+val.price+'" placeholder=""';
      items_ += index == 0 ? 'checked="checked">' : '>';
      items_ += '<label class="content-item__shipping custom-control-label" for="item_spp'+index+'">';
      items_ += '<span class="name-item__shipping">'+val.name;
      if(val.delivery_days.length > 0){
        items_ += '</span><span class="delivery_days-item__shipping"> (';
        if(val.delivery_days.length >= 2){
          items_ += val.delivery_days[0]+'-'+val.delivery_days[1]+' days)</span>';
        } else {
          items_ += val.delivery_days[0]+' day)</span>';
        }
      } else {
        items_ += '</span>';
      }
      items_ += '</label>';
      if(val.delivery_date !== null){
        items_ += '<div class="data-item__shipping"> Get by it ';
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var delivery_date  = new Date(val.delivery_date);
        items_ += delivery_date.toLocaleDateString("en-US", options);
        items_ += '</div>';
      }
      items_ += '</div>';
      items_ += '<div class="item_shipp_price">';
      items_ += '<span class="price-item__shipping">'+theme.Currency.formatMoney(val.price * 100, theme.moneyFormat)+'</span>';
      items_ += '</div>';
      items_ += '</div>';
    });
    items_ += '</td>';
    $contentShipping.html(items_).show();
  }
  $contentShipping.css('opacity', '');
  $('.calculate__shipping').removeClass('loading');
  $('.wrapper__shipping').removeClass('show')
  $('.afterShip,.cartSubTotalWrap').show();
  var cartCost = parseFloat($cartCost.attr('data-price'));
  var shipp = parseFloat($contentShipping.find('input[type="radio"][checked="checked"]').val()) * 100;
  $cartCostTotal.html(theme.Currency.formatMoney(cartCost+shipp, theme.moneyFormat));
  if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
    Kt_currency.convertAll(shopCry,localStorageCurrency);
  }
  KT.drawResize();
}
Shopify.Cart.fullMessagesFromErrors = function(e) {
  var t = [];
  return jQuery.each(e, function(e, r) {
    jQuery.each(r, function(r, n) {
      t.push(e + " " + n)
    })
  }), t
}
Shopify.Cart.onError = function(XMLHttpRequest, textStatus) {
  var feedback = "",
      data = eval("(" + XMLHttpRequest.responseText + ")");
  feedback = data.message ? data.message + "(" + data.status + "): " + data.description : "Error : " + Shopify.Cart.fullMessagesFromErrors(data).join("; ") + ".", "Error : country is not supported." === feedback && (feedback = "We do not ship to this destination.");
  $('.content__shipping').html(feedback).show();
  $('.calculate__shipping').addClass('error').removeClass('loading');
}
Shopify.Cart.alert = function(product, success, status){
  console.log(product)
}
Shopify.Cart.getCountry = function(){
  if (typeof(Storage) !== "undefined" && sessionStorage.dataCountry !== undefined ) {
    $('#address_country').html(sessionStorage.dataCountry);
    Shopify.Cart.buildCountry();
    return;
  }
  jQuery.ajax({
    url: Shopify.root_url+'/cart?view=listcountry',
    type: 'GET',
    dataType: 'html',
    compvare: function(xhr, textStatus) {
      //called when compvare
    },
    success: function(data, textStatus, xhr) {
      //called when successful      
      $('#address_country').html(data);
      sessionStorage.dataCountry = data;
      Shopify.Cart.buildCountry()
    },
    error: function(xhr, textStatus, errorThrown) {
      //called when there is an error
    }
  });     
}
Shopify.Cart.buildCountry = function(){
  if($('[name="address[country]"]').attr('data-default') !== undefined){
    $('[name="address[country]"]').val($('[name="address[country]"] option[value="'+$('[name="address[country]"]').attr('data-default')+'"]').val());
  }
  var select = $('[name="address[country]"] option:selected').html(), provinces = $('[name="address[country]"] option:selected').attr('data-provinces');
  if (provinces !== "[]") {
    var provinces = JSON.parse($('[name="address[country]"] option:selected').attr('data-provinces'));
    var default_province = $('[name="address[province]"]').attr('data-default');
    var provinces_html = '';
    $.each(provinces, function(index, val) {
      if (default_province !== undefined && val[0] == default_province){
        $('[data-select="#address__province"]').html(val[1]);
        provinces_html += '<option selected="selected" value="'+val[0]+'">'+val[1]+'</option>';
      } else if (index == 0) {
        $('[data-select="#address__province"]').html(val[1]);
        provinces_html += '<option selected="selected" value="'+val[0]+'">'+val[1]+'</option>';
      } else {
        provinces_html += '<option value="'+val[0]+'">'+val[1]+'</option>';
      }
    });
    $('[name="address[province]"]').html(provinces_html).parent().show();
    // $('[name="address[zip]"]').val('').parent().show();
  } else {
    $('[name="address[province]"]').html('').parent().hide();
    $('[name="address[zip]"]').parent();
  }
  if($('.get__shipping').attr('data-curr-address') !== undefined){
    var address = JSON.parse($('.get__shipping').attr('data-curr-address'));
    Shopify.Cart.getCartShippingRates(address,Shopify.Cart.getShippingCart,Shopify.Cart.onError);
  }
}
$(document)
.on('change','[name="address[country]"]',function(){
 var select = $('[name="address[country]"] option:selected').html(), provinces = $(this).find('option:selected').attr('data-provinces');
  $(this).parent().find('.label_hidden_select').html(select);
  if (provinces !== "[]") {
    var provinces = JSON.parse($(this).find('option:selected').attr('data-provinces'));
    var default_province = $('[name="address[province]"]').attr('data-default');
    var provinces_html = '';
    $.each(provinces, function(index, val) {
      if (default_province !== undefined && val[0] == default_province){
        $('[data-select="#address__province"]').html(val[1]);
        provinces_html += '<option selected="selected" value="'+val[0]+'">'+val[1]+'</option>';
      } else if (index == 0) {
        $('[data-select="#address__province"]').html(val[1]);
        provinces_html += '<option selected="selected" value="'+val[0]+'">'+val[1]+'</option>';
      } else {
        provinces_html += '<option value="'+val[0]+'">'+val[1]+'</option>';
      }
    });
    $('[name="address[province]"]').html(provinces_html).parent().show();
    $('[name="address[zip]"]').val('').parent().show();
  } else {
    $('[name="address[province]"]').html('').parent().hide();
    $('[name="address[zip]"]').parent();
  }
  KT.drawResize();
})
.on('change','[name="address[province]"]',function(){
  var select = $('[name="address[province]"] option:selected').html();
  $(this).parent().find('.label_hidden_select').html(select);
  KT.drawResize();
})
.on('click','.calculate__shipping',function(){
  var address = {
    'zip': $('[name="address[zip]"]').val(),
    'country': $('[name="address[country]"]').val(),
    'province': $('[name="address[province]"]').val() !== null ? $('[name="address[province]"]').val() : $('[name="address[country]"]').val()
  }
  if (JSON.stringify(address) !== $('.get__shipping').attr('data-curr-address')) {
    $(this).addClass('loading');
    Shopify.Cart.getCartShippingRates(address,Shopify.Cart.getShippingCart,Shopify.Cart.onError);
  } else {
    $('.wrapper__shipping').removeClass('show');
  }
})
.on('change','[name="shipping-cart-drawer"]',function(){
  var cartCost = parseFloat($('.cartCost').attr('data-price'));
  var shipp = parseFloat($(this).val()) * 100;
  $('.show__shipping-price').html(theme.Currency.formatMoney(shipp, theme.moneyFormat));
  $('.cartCostTotal').html(theme.Currency.formatMoney(cartCost+shipp, theme.moneyFormat));
  if (theme.function.multiCurrency == true && localStorageCurrency !== null && localStorageCurrency !== shopCry) {
    Kt_currency.convertAll(shopCry,localStorageCurrency);
  }
});
document.addEventListener("DOMContentLoaded", function(event) {
  if ($('#address_country').length > 0 && $('body.template-cart').length > 0) {
    if (typeof(Storage) !== "undefined" && sessionStorage.dataCountry !== undefined ) {
      $('#address_country').html(sessionStorage.dataCountry);
      Shopify.Cart.buildCountry();
    } else {
      Shopify.Cart.getCountry();
    }
  }
});