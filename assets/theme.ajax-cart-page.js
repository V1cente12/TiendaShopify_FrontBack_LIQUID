"undefined" == typeof Shopify.Cart && (Shopify.Cart = {});
(function($) { 
  "use strict";
  Shopify.Cart.getCartPage = function() {
		$.ajax({
			url: Shopify.root_url+'/cart?view=page-ajax',
			type: 'GET'
		})
		.done(function(data) {
			// console.log("success");
			data = data.split('<!-- summary-discounts -->');
			$('#cart-form').html(data[0]);
			if (data[1].length > 0){
				$('.summary-discounts').html(data[1]).removeClass('d-none');
			} else {
				$('.summary-discounts').html(data[1]).addClass('d-none');
			}
			$('#cart-form').removeClass('loading');
		})
		.fail(function() {
			console.log("error get cart");
	    location.reload();
		})
		.always(function() {
			// console.log("complete");
		});
  }
	$(document).on('change', '#cart-form', function(event) {
		event.preventDefault();
		$(this).addClass('loading');
		var data = $(this).serialize();
		$.ajax({
			url: Shopify.root_url+'/cart/update.js',
			type: 'POST',
			dataType: 'json',
			data: data,
		})
		.done(function(cart) {
			// console.log("success");
			if (cart.item_count > 0) {				
				Shopify.Cart.getCartPage()
			  $('.cartCount').text(cart.item_count);
			  $('.cartCost').attr('data-price',cart.total_price).html(theme.Currency.formatMoney(cart.original_total_price, theme.moneyFormat));
			  var shipp = parseFloat($('.content__shipping').find('input[type="radio"][checked="checked"]').val()) * 100 || 0;
			  $('.cartCostTotal').html(theme.Currency.formatMoney(cart.total_price+shipp, theme.moneyFormat));			  
	      if($('.spendFreeShip').length > 0){
	        var $spendFreeShip = $('.spendFreeShip');
	        var line_total = parseInt($spendFreeShip.find('[aria-valuemax]').attr('aria-valuemax'));
	        var progress_bar = $spendFreeShip.find('.progress-bar');
	        if (line_total > cart.total_price){
	          progress_bar.attr('aria-valuenow', line_total - cart.total_price).css('width',cart.total_price / line_total * 100 + '%').text(Math.round(cart.total_price / line_total * 100) + '%');
	          $spendFreeShip.find('.text_progress span:first-child').html(theme.function.threshold_cart.replace('#more', theme.Currency.formatMoney(line_total - cart.total_price, theme.moneyFormat)));
	          $spendFreeShip.removeClass('congratulations');
	        }else{
	          progress_bar.attr('aria-valuenow', line_total).css('width','100%').text('100%');
	          $spendFreeShip.addClass('congratulations');
	        }
	      }
			} else {
				$('.cart-has-content').remove()
				$('.cart-empty-content').removeClass('d-none')
			}
		})
		.fail(function() {
			alert("error update cart");
	    location.reload();
		})
		.always(function(cart) {
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
			// console.log("complete");
		});		
	});
	$(document).on('click', 'a.btn-remove', function(event) {
		event.preventDefault();
		$(this).parents('tr').find('.input-qty').val(0).trigger('change')
	});
})( jQuery );