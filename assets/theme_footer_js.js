theme.psjson_lib = new Array;
theme.gadget = {
  cookies_infor: true,
  newsletter_popup: false,
  shipTo: true,
  shipToCs: false
}; 
theme.extensions = {
  ktjs_product_sg: '//cdn.shopify.com/s/files/1/0588/1380/8845/t/18/assets/ktjs_product_sg.min.js?v=265042933493879676',
  ktjs_flts_or: false,
  workerktlz: '//cdn.shopify.com/s/files/1/0588/1380/8845/t/18/assets/workerktlz.min.js?v=6780989794685148611'
};

theme.embedResponPlayer = ['.product-desc-content iframe[src*="youtube.com"]', '.product-desc-content iframe[src*="vimeo.com"]', '.blog-content iframe[src*="youtube.com"]', '.blog-content iframe[src*="vimeo.com"]', '.page-content iframe[src*="youtube.com"]', '.page-content iframe[src*="vimeo.com"]', '.imgs__banner_flexible iframe[src*="youtube.com"]', '.imgs__banner_flexible iframe[src*="vimeo.com"]'];

const headDocument = document.head;
const bodyDocument = document.body;
const custom_css = document.getElementById("custom-css");
const firstLink = document.getElementsByTagName("link")[0];

if (theme.crr_library.length == 0) {
  localStorage.setItem('library','[]');
}

window._handleize = function(str){
  str = (str+'').toLowerCase();
  var str_ = str.replace(/'|"|\(|\)|\[|\]/g,"").replace(/[\s\x21-\x2f\x3a-\x40\x7b-\x7f^`\\[\]]+/g,"-").replace(/\W+/g,"-").replace(/^-+|-+$/g,"");
  return str_ == '' ? str : str_;
};
window._snakeCase = function(str){
  str = (str+'').toLowerCase();
  var str_ = str.replace(/'|"|\(|\)|\[|\]/g,"").replace(/[\s\x21-\x2f\x3a-\x40\x7b-\x7f^`\\[\]]+/g,"_").replace(/\W+/g,"_").replace(/^-+|-+$/g,"");  
  return str_ == '' ? str : str_;
};
$.getScriptCached = function(url, callback) {return $.ajax({url: url,dataType: "script",cache: true}).done(callback).fail(function(){console.log("Error loading js " + url);return true;})};
"undefined" == typeof KT && (KT = {});
KT.checkVersion = function(name_item){
  name_item = name_item.split('/')[name_item.split('/').length - 1];
  var version = false;
  if(!localStorage.getItem(name_item)){
    version = true; 
  }
  var libs_ver = JSON.parse(theme.crr_library);
  if (libs_ver.length && libs_ver.findIndex(function(obj){ return obj.name == name_item}) !== -1) { 
    var objIndex = libs_ver.findIndex(function(obj){ return obj.name == name_item});
    if (parseFloat(libs_ver[objIndex].ver) !== theme.library) {
      libs_ver[objIndex].ver = theme.library;
      localStorage.setItem('library',JSON.stringify(libs_ver));
      version = true;
    }
  } else if(libs_ver.findIndex(function(obj){ return obj.name == name_item}) === -1){
    version = true;
  }
  return version; 
};
KT.pushVersion = function(name_item){
  var libs_ver = JSON.parse(theme.crr_library);
  if (libs_ver.length && libs_ver.findIndex(function(obj){ return obj.name == name_item}) !== -1) { 
    var objIndex = libs_ver.findIndex(function(obj){ return obj.name == name_item});
    if (parseFloat(libs_ver[objIndex].ver) !== theme.library) {
      libs_ver[objIndex].ver = theme.library;
      localStorage.setItem('library',JSON.stringify(libs_ver));
    }
  }
  else {
    var obj = {
      name : name_item,
      ver : theme.library
    };
    libs_ver.push(obj);
    localStorage.setItem('library',JSON.stringify(libs_ver));
  }
  theme.crr_library = localStorage.getItem('library') || '[]';
};
KT.themeScripts = [];
KT.loadScript = function(id, callback) {
  let css_url = "";
  let js_url = "";
  let done = false;
  let pos = 0;
  if(KT.themeScripts.includes(id)){
    checkExists(id, js_url)
  }
  else {
    KT.themeScripts.push(id);
    if(id == 'magnific-popup'){
      css_url = theme.asset_url('magnific-popup.min.css');
      js_url = theme.asset_url('jquery.magnific-popup.min.js');
    }
    else if(id == 'threesixty'){
      css_url = theme.asset_url('threesixty.min.css');
      js_url = theme.asset_url('threesixty.min.js');
    }
    else if(id == 'photo-swipe'){
      css_url = theme.asset_url('photoswipe-ui.min.css');
      js_url = theme.asset_url('photoswipe-ui.min.js');
    }
    else if(id == 'YTPlayer'){
      css_url = theme.asset_url('jquery.mb.YTPlayer.min.css');
      js_url = theme.asset_url('jquery.mb.YTPlayer.min.js');
    }
    else if(id == 'swiper'){ 
      js_url = theme.asset_url('swiper.min.js');
    }
    else if(id == 'pjax'){
      js_url = theme.asset_url('jquery.pjax.min.js');
    }
    else if(id == 'imagesloaded'){
      js_url = theme.asset_url('imagesloaded.pkgd.min.js');
    }
    else if(id == 'isotope'){
      js_url = theme.asset_url('isotope-plus.pkgd.min.js');
    }
    else if(id == 'countdown'){
      js_url = theme.asset_url('jquery.countdown.min.js');
    }
    else if(id == 'countto'){
      js_url = theme.asset_url('jquery.countTo.min.js');
    }
    else if(id == 'moment'){
      js_url = theme.asset_url('moment.min.js');
    }
    else if(id == 'moment-zone'){
      js_url = theme.asset_url('moment-timezone-with-data.min.js');
    }
    else if(id == 'momentlocale'){
      if (shopLocale === 'en') {handleLoad();return}
      js_url = "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/locale/"+shopLocale+".js";
    }
    else if(id == 'zoom'){
      js_url = theme.asset_url('jquery.zoom.min.js');
    }
    else if(id == 'parallax'){
      js_url = theme.asset_url('jquery.parallax_mousemove.js');
    }
    else if(id == 'tippy'){
      js_url = theme.asset_url('tippy-bundle.umd.min.js');
    }
    else if(id == 'color_sw'){
      css_url = theme.asset_url('swatch-color.css');
    }
    else if(id == 'animate'){
      css_url = theme.asset_url('animate.min.css');
    }
    else if(id == 'molla_icon'){
      css_url = theme.asset_url('molla-icon.css');
    }
    else if(id == 'molla_font'){
      css_url = theme.asset_url('theme.font.css');
    }
    else if(id == 'google_f'){
      css_url = theme.link_google_f;
    }
    else if(id == 'shopify-currency'){
      js_url = "//cdn.shopify.com/s/javascripts/currencies.js";
    }
    else if(id == 'shipping'){
      js_url = theme.asset_url('jquery.currency-shipping.min.js');
    }
    else if(id == 'plyr'){
      css_url = "//cdn.shopify.com/shopifycloud/shopify-plyr/v1.1/shopify-plyr.css";
      js_url = "//cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.en.js";
    }
    else if(id == 'shopify-xr'){
      js_url = "//cdn.shopify.com/shopifycloud/shopify-xr-js/v1.0/shopify-xr.en.js";
    }
    else if(id == 'model-viewer-ui'){
      css_url = "//cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css";
      js_url = "//cdn.shopify.com/shopifycloud/model-viewer-ui/v1.0/model-viewer-ui.en.js";
    }
    else if(id == 'theme-alert'){
      js_url = theme.asset_url('theme-alert.js');
    }
    else if(id == 'qs-css'){
      css_url = theme.asset_url('kt_quick-shop.min.css');
      pos = 1;
    }    
    else if(id == 'edit-opts-css'){
      css_url = theme.asset_url('kt-c_edit-opts.min.css');
      pos = 1;
    }
    done = false;
    ajaxLoad(id, css_url, js_url, pos);
  }
  function ajaxLoad(name, css_url, js_url, pos){
    if(css_url !== ''){
      var scr_css = document.createElement('link');
      scr_css.type = 'text/css';
      scr_css.rel = "stylesheet";
      scr_css.cache = true;
      scr_css.id = name+'-css';
      scr_css.href = css_url;
      scr_css.onerror = function() {
        console.log("Error loading css " + this.href);
      };
      if (pos == 1) {
        headDocument.insertBefore(scr_css, custom_css);
      } else {
        headDocument.insertBefore(scr_css, firstLink);
      }
    }
    if(js_url !== ''){
      $.getScriptCached(js_url, function() {
        handleLoad();
      })
      // var scr_js = document.createElement('script');
      // scr_js.type = 'text/javascript';
      // scr_js.cache = true;
      // scr_js.async = true;
      // scr_js.src = js_url;
      // scr_js.id = name;
      // scr_js.onload = checkExists(name, js_url);
      // scr_js.onerror = function() {
      //   console.log("Error loading js " + this.src);
      // };
      // bodyDocument.appendChild(scr_js);
    }
  }
  function checkExists(id, js_url){
    var callbackTimer = setInterval(function() {
      if (id == 'swiper' && typeof Swiper === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'owl-carousel' && typeof $.fn.owlCarousel === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'slick-slide' && typeof $.fn.slick === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'moment' && typeof moment === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'moment-zone' && typeof moment.tz === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'momentlocale' && moment.locale() == shopLocale){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }     
      if (id == 'magnific-popup' && typeof $.fn.magnificPopup === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'imagesloaded' && typeof $.fn.imagesLoaded === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'isotope' && typeof $.fn.isotope === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'YTPlayer' && typeof jQuery.fn.YTPlayer === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'parallax' && typeof $.fn.mouseMove === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'countdown' && typeof $.fn.countdown === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'countto' && typeof $.fn.countTo === 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'magnific-popup' && typeof $.fn.magnificPopup == 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if (id == 'zoom' && typeof $.fn.zoom == 'function'){
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'pjax' && typeof $.fn.pjax == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'photo-swipe' && typeof PhotoSwipe == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'threesixty' && typeof $.fn.ThreeSixty == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'tippy' && typeof tippy == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'shipping' && typeof Kt_currency.convertAll == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'shopify-currency' && typeof Currency !== "undefined") {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'plyr' && typeof Shopify.Plyr == 'function') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'shopify-xr' && typeof ShopifyXR !== 'undefined') {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'model-viewer-ui' && typeof Shopify.ModelViewerUI == 'function' ) {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
      if(id === 'theme-alert' && typeof KT_Alert !== "undefined" ) {
        handleLoad();
        clearInterval(callbackTimer);
        return true;
      }
    }, 100);
  }
  function handleLoad() {
    if (!done) {
      done = true;
      callback(js_url, "ok");
    }
  }
}