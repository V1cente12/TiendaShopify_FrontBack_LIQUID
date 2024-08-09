"undefined" == typeof window.KT_Alert && (window.KT_Alert = {})
KT_Alert.terms_conditions = function(layout) {
	var notice = '<div class="alert theme_alt alert-warning alert-terms-conditions alert-dismissible position-fixed w-100 text-center fade show" style="top: 1rem;z-index: 1200;" role="alert">'
			if(layout == 'checkout'){
			notice += '<p>You must agree with the <strong>terms and conditions</strong> of sales to check out.</p>'
			} else if(layout == 'account'){
			notice += '<p>You must agree with the <strong>terms and conditions</strong> of sales to check out.</p>'
			}
			notice += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
			notice += '</div>';
	$('.content_for_extension').append(notice)
}