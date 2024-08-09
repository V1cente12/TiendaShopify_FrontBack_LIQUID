onmessage = function(e) {
  var url = e.data.rootUrl+'/products/'+e.data.handleProduct+'?view=jsfull';
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if(request.readyState === 4) {
      if(request.status === 200) {
        var pJSON = JSON.parse(request.responseText.replace(/<!--.*?-->/g, ""));
        var postWorkerData = {
          pId: pJSON.id,
          pJson : pJSON,
          html: buildHTML(pJSON),
          variant: selectedVariant(pJSON)
        }
        postMessage(postWorkerData);
      } else {
        console.log('An error occurred during your request: ' +  request.status + ' ' + request.statusText);
      } 
    }
  }
  function escape(unsafe) {
    return unsafe
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
 }
  function handleize(str) {
    str = (str+'').toLowerCase();
    var str_ = str
      .replace(/'|"|\(|\)|\[|\]/g,"")
      .replace(/[\s\x21-\x2f\x3a-\x40\x7b-\x7f^`\\[\]]+/g,"-")
      .replace(/\W+/g,"-")
      .replace(/^-+|-+$/g,"");
    return str_ == '' ? str : str_;
 }

  request.open('Get', url);
  request.send();
  var selectedVariant = function(data){
    var first_available_variant = data.variants.find(function(variant){ return variant.available === true});
    if(first_available_variant === undefined){
      first_available_variant = data.variants[0];
    }
    if (e.data.currentVariant !== null) {
      first_available_variant = data.variants.find(function(variant){ return variant.id === parseInt(e.data.currentVariant)});
    }
    return first_available_variant;
  }
  var buildHTML = function(data){
    var option1_Name = data.options && data.options[0] ? data.options[0] : null;
    var option1_Variants = '';
    var option1_Variants_Array = [];
    var option_Variants_Array_Visible = [];
    var option2_Name = data.options && data.options[1] ? data.options[1] : null;
    var option2_Variants = '';
    var option2_Variants_Array = [];
    var option3_Name = data.options && data.options[2] ? data.options[2] : null;
    var option3_Variants = '';
    var option3_Variants_Array = [];
    
    var prdOptsStyle = e.data.prdOptsStyle;
    var prdOpt1Style = prdOptsStyle.find(function(prdOptsStyle){ return prdOptsStyle['name'] == option1_Name});
    var prdOpt2Style = prdOptsStyle.find(function(prdOptsStyle){ return prdOptsStyle['name'] == option2_Name});
    var prdOpt3Style = prdOptsStyle.find(function(prdOptsStyle){ return prdOptsStyle['name'] == option3_Name});
    console.log(prdOpt1Style);

    var first_available_variant = selectedVariant(data);
    data.variants.forEach(function(variant) {
      var bg_style = prdOpt1Style !== undefined && prdOpt1Style.color_watched && prdOpt1Style.sw_style == 'image_variant' ? ' bg-contain' : '';
      if(option1_Variants_Array.indexOf(variant.option1) === -1){
        option1_Variants_Array.push(variant.option1);
        var activeVariantFirstOption1 = first_available_variant.options.indexOf(variant.option1) !== -1 ? ' active' : '';
        var maybeHide1 = option1_Variants_Array.length > 5 ? true : false;
        var handleOption1 = handleize(variant.option1);

        var img_url = variant.featured_image ? variant.featured_image.src : null;
        var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
        var bgImage = img_url !== null && prdOpt1Style !== undefined && prdOpt1Style.color_watched && prdOpt1Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
        if(handleOption1 == '') {handleOption1 = variant.option1};
        option1_Variants += '<li class="swatch-on-grid _'+handleOption1+activeVariantFirstOption1+'" title="'+escape(variant.option1)+'" data-available="true" data-maybe-hide="'+maybeHide1+'">';
        option1_Variants += '<span class="swatch'+bg_style+'" data-vrs="kt_'+handleOption1+'" data-opt="Opt1Js" data-vrid="'+variant.id+'" data-view="/products/'+e.data.handleProduct+'" data-available="'+variant.available+'" data-toggle="tooltip" data-placement="bottom" title="'+escape(variant.option1)+'"'+bgImage+'>';
        option1_Variants += '<span class="swatch-title">'+variant.option1+'</span><span class="comma">,</span>';
        option1_Variants += '</span>';
        option1_Variants += '</li>';
      }
      if(option1_Variants_Array.indexOf(first_available_variant.options[0]) !== -1){
        if(option_Variants_Array_Visible.indexOf(variant.option1) === -1){option_Variants_Array_Visible.push(variant.option1);}
        if(option2_Name !== null && option_Variants_Array_Visible[0] === variant.option1 && option_Variants_Array_Visible.indexOf(variant.option2) === -1){option_Variants_Array_Visible.push(variant.option2);}
        if(option3_Name !== null && option_Variants_Array_Visible[1] === variant.option2 && option_Variants_Array_Visible.indexOf(variant.option3) === -1){option_Variants_Array_Visible.push(variant.option3);}
      }
      if(option2_Name !== null && option2_Variants_Array.indexOf(variant.option2) === -1 && option_Variants_Array_Visible.indexOf(variant.option2) !== -1){
        option2_Variants_Array.push(variant.option2);
        var activeVariantFirstOption2 = first_available_variant.options.indexOf(variant.option2) !== -1 ? ' active' : '';
        var maybeHide2 = option2_Variants_Array.length > 5 ? true : false;
        var handleOption2 = handleize(variant.option2);
        if(handleOption2 == '') {handleOption2 = variant.option2};
        var img_url = variant.featured_image ? variant.featured_image.src : null;
        var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
        var bgImage = img_url !== null && prdOpt2Style !== undefined && prdOpt2Style.color_watched && prdOpt2Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
        
        option2_Variants += '<li class="swatch-on-grid _'+handleOption2+activeVariantFirstOption2+'" title="'+(variant.option2)+'" data-available="true" data-maybe-hide="'+maybeHide2+'">';
        option2_Variants += '<span class="swatch'+bg_style+'" data-vrs="kt_'+handleOption2+'" data-opt="Opt2Js" data-vrid="'+variant.id+'" data-view="/products/'+e.data.handleProduct+'" data-available="'+variant.available+'" data-toggle="tooltip" data-placement="bottom" title="'+escape(variant.option2)+'"'+bgImage+'>';
        option2_Variants += '<span class="swatch-title">'+variant.option2+'</span><span class="comma">,</span>';
        option2_Variants += '</span>';
        option2_Variants += '</li>';
      }
      if(option3_Name !== null && option3_Variants_Array.indexOf(variant.option3) === -1 && option_Variants_Array_Visible.indexOf(variant.option3) !== -1){
        option3_Variants_Array.push(variant.option3);
        var activeVariantFirstOption3 = first_available_variant.options.indexOf(variant.option3) !== -1 ? ' active' : '';
        var maybeHide3 = option3_Variants_Array.length > 5 ? true : false;
        var handleOption3 = handleize(variant.option3);
        if(handleOption3 == '') {handleOption3 = variant.option3};
        var img_url = variant.featured_image ? variant.featured_image.src : null;
        var fileExt = img_url !== null ? img_url.split('.')[img_url.split('.').length - 1] : null;
        var bgImage = img_url !== null && prdOpt3Style !== undefined && prdOpt3Style.color_watched && prdOpt3Style.sw_style !== 'color' ? 'style="background-image: url(\''+(img_url.replace('.'+fileExt, '_100x100_crop_center.'+fileExt)).replace(/http(s)?:/, '')+'\')"' : '';
        
        option3_Variants += '<li class="swatch-on-grid _'+handleOption3+activeVariantFirstOption3+'" title="'+escape(variant.option3)+'" data-available="true" data-maybe-hide="'+maybeHide3+'">';
        option3_Variants += '<span class="swatch'+bg_style+'" data-vrs="kt_'+handleOption3+'" data-opt="Opt3Js" data-vrid="'+variant.id+'" data-view="/products/'+e.data.handleProduct+'" data-available="'+variant.available+'" data-toggle="tooltip" data-placement="bottom" title="'+escape(variant.option3)+'"'+bgImage+'>';
        option3_Variants += '<span class="swatch-title">'+variant.option3+'</span><span class="comma">,</span>';
        option3_Variants += '</span>';
        option3_Variants += '</li>';
      }
    });
    var li_more = '<li class="swatch-on-grid more kt_view_qs"><span class="swatch"><span class="swatch-title">'+e.data.moreText+'+</span></span> </li>';
    if(option1_Variants_Array.length > 0){
      if(option1_Variants_Array.length > 5){ option1_Variants += li_more; }
      if(prdOpt1Style !== undefined){
        var one_option_1 = option1_Variants_Array.length === 1 ? ' one-option' : '';
        option1_Variants = '<ul class="product-loop-variants variants '+prdOpt1Style.style + one_option_1+' list-unstyled" data-swatchesstyle="image_variant" data-usecolor="'+prdOpt1Style.color_watched+'" data-opt="Opt1Js" data-n-opt="'+option1_Name+'"><li class="name_option">'+option1_Name+': <span class="n_selected">'+first_available_variant.options[0]+'</span></li><li class="variants_list"><ul class="content__variants_list p-0">' + option1_Variants + '</li></ul></ul>'
      }
      else{
        option1_Variants = '<ul class="product-loop-variants variants list list_1 list-unstyled" data-swatchesstyle="image_variant" data-usecolor="false" data-opt="Opt1Js" data-n-opt="'+option1_Name+'"><li class="name_option">'+option1_Name+':</li><li class="variants_list"><ul class="content__variants_list p-0">' + option1_Variants + '</li></ul></ul>'
      }
    }
    if(option2_Variants_Array.length > 0){
      if(option2_Variants_Array.length > 5){ option2_Variants += li_more; }
      if(prdOpt2Style !== undefined){
        var one_option_2 = option2_Variants_Array.length === 1 ? ' one-option' : '';
        option2_Variants = '<ul class="product-loop-variants variants '+prdOpt2Style.style + one_option_2+' list-unstyled" data-swatchesstyle="image_variant" data-usecolor="'+prdOpt2Style.color_watched+'" data-opt="Opt2Js" data-n-opt="'+option2_Name+'"><li class="name_option">'+option2_Name+': <span class="n_selected">'+first_available_variant.options[1]+'</span></li><li class="variants_list"><ul class="content__variants_list p-0">' + option2_Variants + '</li></ul></ul>'
      }
      else{
        option2_Variants = '<ul class="product-loop-variants variants list list_1 list-unstyled" data-swatchesstyle="image_variant" data-usecolor="false" data-opt="Opt2Js" data-n-opt="'+option2_Name+'"><li class="name_option">'+option2_Name+':</li><li class="variants_list"><ul class="content__variants_list p-0">' + option2_Variants + '</li></ul></ul>'
      }
    }

    if(option3_Variants_Array.length > 0){
      if(option3_Variants_Array.length > 5){ option3_Variants += li_more; }
      if(prdOpt3Style !== undefined){
        var one_option_3 = option2_Variants_Array.length === 1 ? ' one-option' : '';
        option3_Variants = '<ul class="product-loop-variants variants '+prdOpt3Style.style + one_option_3+' list-unstyled" data-swatchesstyle="image_variant" data-usecolor="'+prdOpt3Style.color_watched+'" data-opt="Opt3Js" data-n-opt="'+option3_Name+'"><li class="name_option">'+option3_Name+': <span class="n_selected">'+first_available_variant.options[2]+'</span></li><li class="variants_list"><ul class="content__variants_list p-0">' + option3_Variants + '</li></ul></ul>'
      }
      else{
        option3_Variants = '<ul class="product-loop-variants variants list list_1 list-unstyled" data-swatchesstyle="image_variant" data-usecolor="false" data-opt="Opt3Js" data-n-opt="'+option3_Name+'"><li class="name_option">'+option3_Name+':</li><li class="variants_list"><ul class="content__variants_list p-0">' + option3_Variants + '</li></ul></ul>'
      }
    }
    var productVariants = '<input type="hidden" name="quantity" value="1"><input type="hidden" name="id" value="'+first_available_variant.id+'">';
    return options = {
      "option1": option1_Variants,
      "option2": option2_Variants,
      "option3": option3_Variants,
      "input": productVariants
    };
  }
};