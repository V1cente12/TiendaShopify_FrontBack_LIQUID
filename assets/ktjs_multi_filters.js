window.theme = window.theme || {};
theme.Filters = (function() {
  var selectors = {
    filterGroup: '.kt--filter-grs',
    filterGroupDesktop: '.kt--filter-grs-d',
    filterGroupMobile: '.kt--filter-grs-m',
    filterLink: 'a[data-pjax-filter]',
    catShowing: '.child_collection li.current-cat'
  };
  var dataToggle = $(selectors.filterGroupDesktop).data('toggle');
  var item_categories_filter,groupsFilters, brands_icon, colorGroupFilter, groupsFilter;
  function Filters(container) {
    var $container = this.$container = $(container);
    var self = this;
    item_categories_filter = $('.kt_categories_filter').length > 0 ? $('.kt_categories_filter')[0].innerText.replace(/(\r\n|\n|\r|\s\s)/gm, "") : '';
    groupsFilters = JSON.parse(document.getElementById('groupsFilters').innerHTML);
    brands_icon = groupsFilters.settings.brands_icon.split(",");
    colorGroupFilter = groupsFilters.settings.color_groups.split(", ");
    groupsFilter = groupsFilters.blocks;
    var $container = (this.$container = $(container));
    var url = window.location.search.indexOf('/collections/') >= 0 ? window.location.search :  collection.url + window.location.search; 
    url = url.replace('&oseid=','kiti=').replace('?oseid=','kiti=').split('kiti=')[0];
    $.ajax({
      url: url.indexOf('?') >= 0 ? url + '&view=multi_flts_or' :  url + '?view=multi_flts_or',
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done(function(data) {
      if (data.indexOf('ktjs') >= 0 && data.indexOf('<!--flt_or-->') !== 0) {
        $('.pagination_').html(data.split("<!--flt_or-->")[2].replace(/(noscript\>)/gm, 'script>'));
        $('.result-count').html(data.split("<!--flt_or-->")[1]);
        if($('.kt--filter-js a[data-action="infinity"]').length > 0 && $('.kt--filter-js a[data-action="infinity"]').hasClass('listened') == false){
          $(window).scroll($.throttle( 250,theme.CollSection.infinityLoad));
        }
      }
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      self._createFilter();
      self._checkCatShowing();
    });

    // Filter on click
    $('.kt--filter-js')
    .on('click', '.kt--filter-gr-i .layered_subtitle_heading', function(e){
      e.preventDefault();
      $(this).parents('.kt--filter-gr-i').toggleClass('show');
    })
    .on('click', function(e){
      if ($(e.target).is('.kt--filter-gr-i.kt--filter-dr *') === false ) {
        $('.kt--filter-gr-i.kt--filter-dr').removeClass("show");
      }
      if ($(e.target).is('.kt_dropdown .kt--filter-grs') === false) {
        $('.kt_dropdown .kt--filter-grs').slideUp();
      }
    })
    .on('click', '.filter-by.filterDrop', function(e){
      e.preventDefault();
      $(this).toggleClass('opened');
      $('.kt_dropdown .kt--filter-grs').is(':hidden') ? $('.kt_dropdown .kt--filter-grs').slideDown('slow')  : $('.kt_dropdown .kt--filter-grs').slideUp();
    })
    .on('click', '.filter-by.filterCanvas', function(e){
      e.preventDefault();
      $('.kt--filter.kt_canvas').addClass('opend-overlay');
      $('body').css({overflow:'hidden',paddingRight: theme.getScrollbarWidth()});
      $('#bg-overlay').addClass('filter-overlay').attr('data-box','filter-canvas');
    })
    .on('click', '.filter-by.filterMobile, #filterApply, .headFilter .close', function(e){
      e.preventDefault();
      if($('.kt--filter.kt--filter-m').hasClass('show')){
        $('.kt--filter.kt--filter-m.show').removeClass('show');
      }
      else{
        $('.kt--filter.kt--filter-m').addClass('show');
      }
    })
    .on('click', '.widget_product_categories.market-layout .level-1:not(.opened)>a', function(e){
      e.preventDefault();
      if ($(this).parent().hasClass('opened')) {return false}
      $('.widget_product_categories.market-layout .opened').removeClass('opened');
      $('.widget_product_categories.market-layout .child_collection').slideUp();
      $(this).parent().toggleClass('opened');
      $(this).parent().find('.child_collection').slideToggle();
    })
  }

  Filters.prototype = _.assignIn({}, Filters.prototype, {
    _get_tags_from_url: function(str) {
      return str.match(/[^\+\=]+\w+\:.*?(\&|$)/g) !== null ? str.match(/[^\+\=]+\w+\:.*?(\&|$)/g)[0].replace(/(\&*)$/g, '') : str;
    },
    _build_tags_url: function(array) {
      var url = '';
      var tags = new Array;
      for (var attr in array) {
        if(array[attr].length > 0){
          tags.push(attr + ':' + array[attr].join(','))
        }
      }
      return tags.join('+')
    },
    _createFilter: function() {
      var self = this;
      var filterContent = '';
      var filterSelect = new Array;
      var currSearch = window.location.search;
      var currSort = $('#sort_by').length ? ($('#sort_by li.selected a').attr('href')).replace('?','') : undefined;
      // currSearch = currSearch.replace(/(offp|page)\_.*?\w+/g , '').replace(/(\+\+|\+$)/g, '').replace(/\=\+/g,'=');
      if (currSearch.indexOf('q=') == -1 && currSearch.indexOf('?') == -1) {currSearch = '?q='}else if(currSearch.indexOf('q=') == -1){currSearch = currSearch+'&q='}
      var currTags_handle = [];var currTags_array = {};
      _.forEach(currTags_handleize, function(attr,idx0) {
        if(attr !== ''){
          var attr_ = attr.split(':');
          var attr_its = attr_[1].split(',');
          currTags_array[attr_[0]] = attr_its;
          _.forEach(attr_its, function(attr_it,idx0) {
            var attr_check = attr_[0]+'-'+attr_it;
            currTags_handle.push(attr_check);
          })
        }
      })
      _.forEach(groupsFilter, function(item,idx0) {
        var filterGroupItem = "";
        var attrOfItem = new Array;
        item.new_row = item.new_row || false;
        if(item.key == 'kt_rencent'){
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_recent_product" style="display:none;">';
          filterGroupItem += '<ul class="list-unstyled"><li class="_"></li></ul></div>';
        }
        else if(item.key == 'kt_banner'){
          if (item.img === null) {return}
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_banner"><ul class="kt--filter-gr-i_ul list-unstyled pt-2i pt-lg-0i"><li class="_banner text-center" style="border: none"><div class="banner-effect1" style="position: relative"><a href="'+item.url+'" class="mb_0i"><img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="'+item.img+'"></a></div></li></ul>';
          filterGroupItem += '</div>';
        }
        else if(item.key == 'kt_custom'){
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_custom">'+item.content+'<ul class="list-unstyled"><li class="_"></li></ul>';
          filterGroupItem += '</div>';
        }
        else if(item.key == 'kt_categories'){
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_product_categories">'+item_categories_filter+'<ul class="list-unstyled m-0"><li class="_"></li></ul>';
          filterGroupItem += '</div>';
        }
        else if(item.key == 'kt_slider'){
          if (item.option == 'price') {if (fltSlider.mipr == fltSlider.mapr) {return}}
          if (item.option == 'weight') {if (fltSlider.miw == fltSlider.maw) {return}}
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_flt_slider">';
          filterGroupItem += '<div class="layered_subtitle_heading"><span class="layered_subtitle">'+item.title+'<span></span></span><span class="ico"><i class="fkt-angle-down" aria-hidden="true"></i></span></div>';
          filterGroupItem += '<ul class="kt--filter-gr-i_ul list-unstyled"><li class="_"></li>';
            filterGroupItem += '<li class="ui-slider" data-option="'+item.option+'" data-step="'+item.step+'" data-unit="'+item.unit+'">';
              filterGroupItem += '<div class="slider-range"></div>';
              filterGroupItem += '<div class="d-flex align-items-center justify-content-between mt-2">';
                filterGroupItem += '<div class="">';
                  filterGroupItem += '<label for="amount">'+theme.strings.flt_range+':</label>';
                  filterGroupItem += '<div class="amount"></div>';
                filterGroupItem += '</div>';
                filterGroupItem += '<div><a data-pjax-filter href="?q=" class="btn-flt btn btn-minwidth-sm btn-outline-darker mb-0i">Filter</a></div>';
              filterGroupItem += '</div>';
            filterGroupItem += '</li>';
          filterGroupItem += '</ul>';
          filterGroupItem += '</div>';
        }
        else if(item.key == 'kt_truthy'){
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' blockStyle_'+item.block_style+'">';
          filterGroupItem += '<div class="layered_subtitle_heading"><span class="layered_subtitle">'+item.title+'<span></span></span><span class="ico"><i class="fkt-angle-down" aria-hidden="true"></i></span></div>';
          filterGroupItem += '<ul class="kt--filter-gr-i_ul list-unstyled">';
          item.tags = item.val+'-true';
          var handle_pos = -1;
          var it_href_array = null; 
          _.find(collectionTags, function(itemTag) {
            ++handle_pos;
            if(_snakeCase(itemTag) !== _snakeCase(item.tags) || filterGroupItem.indexOf('_true kt') !== -1){return;}
            var itemTag_handle = item.val+'-true';
            filterGroupItem += '<li class="_true kt ';
            if(_.indexOf(currTags_handle, itemTag_handle) >= 0 || currTags_handle.includes("nkey-"+itemTag_handle)){
              filterGroupItem += 'tagSelected';
            }
            if(iscollectionTags.length > 0 && _.indexOf(iscollectionTags, itemTag) < 0){
              filterGroupItem += 'tagHidden';
            }
            filterGroupItem += '">';
            filterGroupItem += '<a class="custom-control custom-checkbox" data-pjax-filter="" href="';
            filterGroupItem += Shopify.root_url;
            it_href_array = JSON.parse(JSON.stringify(currTags_array));
            if(it_href_array[item.val] != null){
              if(_.indexOf(it_href_array[item.val], 'true') >= 0){
                it_href_array[item.val].splice(_.indexOf(it_href_array[item.val], 'true'), 1);
              }
              else {
                it_href_array[item.val].push('true');
              }
            }
            else {
              it_href_array[item.val] = [];
              it_href_array[item.val].push('true');
            }
            filterGroupItem += templateName !== 'collection' ? allPrdUrl : '';
            var url = currTags_handle.length > 0 ? currSearch.replace(self._get_tags_from_url(currSearch), self._build_tags_url(it_href_array)) : currSearch + self._build_tags_url(it_href_array);
            filterGroupItem += url;
            if(_.indexOf(currTags_handle, item.val+'-'+itemTag_handle) >= 0){
              var itSel = [itemTag.replace(item.key+" ",""), url];
              filterSelect.push(itSel);
            }
            filterGroupItem += '" title="'+itemTag+'">';
            filterGroupItem += '<span class="custom-control-label titleFilterItem">'+item.label+'</span>';
            filterGroupItem += '</a>';
            filterGroupItem += '</li>';
            return true;
          });
          filterGroupItem += '</ul>';
          filterGroupItem += '</div>';
        }
        else{
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' blockStyle_'+item.block_style+' split_'+item.use_split;
          filterGroupItem += item.always_show == true ? '">' : ' unshowAny">';
          filterGroupItem += '<div class="layered_subtitle_heading"><span class="layered_subtitle">'+item.title+'<span></span></span><span class="ico"><i class="fkt-angle-down" aria-hidden="true"></i></span></div>';
          filterGroupItem += '<ul class="kt--filter-gr-i_ul list-unstyled">';
          var itemTags = item.tags;
          if(item.tags.length > 0 && item.tags !== 'all_tag'){
            _.forEach(item.tags.split(', '), function(item_,idx0) {
              var handle_pos = -1;
              var it_href_array = null; 
              _.find(collectionTags, function(itemTag) {
                ++handle_pos;
                if(_snakeCase(itemTag) !== _snakeCase(item_) || filterGroupItem.indexOf('_'+_snakeCase(collectionTagsHandle[handle_pos].replace(item.key_+"-",""))+' kt') !== -1){return;}
                var itemTag_handle = collectionTagsHandle[handle_pos];
                var itemTag_snake = _snakeCase(itemTag_handle);
                filterGroupItem += '<li class="_'+itemTag_handle.replace(item.key_+"-","")+' kt ';
                if(_.indexOf(currTags_handle, itemTag_handle) >= 0 || currTags_handle.includes("nkey-"+itemTag_handle)){
                  filterGroupItem += 'tagSelected';
                }
                if(iscollectionTags.length > 0 && _.indexOf(iscollectionTags, itemTag) < 0){
                  filterGroupItem += 'tagHidden';
                }
                filterGroupItem += '">';
                filterGroupItem += '<a class="custom-control custom-checkbox" data-pjax-filter="" href="';
                filterGroupItem += Shopify.root_url != '' ? collection.url : '' ;
                it_href_array = JSON.parse(JSON.stringify(currTags_array));
                if(it_href_array[_handleize(item.key)] != undefined && _.indexOf(it_href_array[_handleize(item.key)], _handleize(itemTag.replace(item.key, ''))) >= 0){  
                  it_href_array[_handleize(item.key)].splice(_.indexOf(it_href_array[_handleize(item.key)], _handleize(itemTag.replace(item.key, ''))), 1);
                }
                else if (it_href_array[_handleize(item.key)] != undefined){
                  it_href_array[_handleize(item.key)].push(_handleize(itemTag.replace(item.key, '')));
                }
                else if(it_href_array['nkey'] != null && item.key === ''){
                  if(_.indexOf(it_href_array['nkey'], _handleize(itemTag)) >= 0){
                    it_href_array['nkey'].splice(_.indexOf(it_href_array['nkey'], _handleize(itemTag)), 1);
                  }
                  else {
                    it_href_array['nkey'].push(_handleize(itemTag.replace(item.key, '')));
                  }
                }
                else {
                  it_href_array[_handleize(item.key)||'nkey'] = [];
                  it_href_array[_handleize(item.key)||'nkey'].push(_handleize(itemTag.replace(item.key, '')));
                }
                filterGroupItem += templateName !== 'collection' ? allPrdUrl : '';
                var url = currTags_handle.length > 0 ? currSearch.replace(self._get_tags_from_url(currSearch), self._build_tags_url(it_href_array)) : currSearch + self._build_tags_url(it_href_array);
                filterGroupItem += url;
                if(_.indexOf(currTags_handle, itemTag_handle) >= 0 || _.indexOf(currTags_handle, 'nkey-'+itemTag_handle) >= 0){
                  var itSel = [itemTag.replace(item.key+" ",""), url];
                  filterSelect.push(itSel);
                }
                filterGroupItem += '" title="'+itemTag+'">';
                if(colorGroupFilter.indexOf(item.key) !== -1 || colorGroupFilter.indexOf(item.title) !== -1){
                  filterGroupItem += '<span class="color_pick swatch" data-color="'+itemTag_handle+'"></span>';
                }
                if(item.block_style === '6' || item.block_style === '7'){
                  _.forEach(brands_icon, function(itemBrandIcon) {
                    if(itemBrandIcon.indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1 || _snakeCase(itemBrandIcon).indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1){
                      filterGroupItem += '<span class="brand_icon"><img src="';
                      filterGroupItem += itemBrandIcon;
                      filterGroupItem += '"></span>';
                    }
                  });
                }
                filterGroupItem += '<span class="custom-control-label titleFilterItem">'+itemTag.replace(item.key, '')+'</span>';
                filterGroupItem += '</a>';
                filterGroupItem += '</li>';
                return true;
              });
            });
          } else {
            var handle_pos = -1;
            _.find(collectionTags, function(itemTag) {
              var it_href_array = null; 
              ++handle_pos;
              var itemTag_handle = collectionTagsHandle[handle_pos];
              var itemTag_snake = _snakeCase(itemTag_handle);
              var continue_ = false;
              if (item.tags !== 'all_tag') {
                if(itemTag.indexOf(item.key+" ") !== 0){continue_ = true;}
                if(attrOfItem.indexOf(itemTag_handle) !== -1){continue_ = true;}
              }
              if(continue_){return;}
              attrOfItem.push(itemTag_handle);
              filterGroupItem += '<li class="_'+itemTag_handle.replace(item.key_+"-","")+' ';
              if(_.indexOf(currTags_handle, itemTag_handle) >= 0 || currTags_handle.includes("nkey-"+itemTag_handle)){
                filterGroupItem += ' tagSelected';
              }
              if(iscollectionTags.length > 0 && _.indexOf(iscollectionTags, itemTag) < 0){
                filterGroupItem += ' tagHidden';
              }
              filterGroupItem += '">';
              filterGroupItem += '<a class="custom-control custom-checkbox" data-pjax-filter="" href="';
              filterGroupItem += Shopify.root_url != '' ? collection.url : '' ;
              it_href_array = JSON.parse(JSON.stringify(currTags_array));
              if(it_href_array[_handleize(item.key)] != undefined && _.indexOf(it_href_array[_handleize(item.key)], _handleize(itemTag.replace(item.key, ''))) >= 0){  
                it_href_array[_handleize(item.key)].splice(_.indexOf(it_href_array[_handleize(item.key)], _handleize(itemTag.replace(item.key, ''))), 1);
              }
              else if (it_href_array[_handleize(item.key)] != undefined){
                it_href_array[_handleize(item.key)].push(_handleize(itemTag.replace(item.key, '')));
              }
              else if(it_href_array['nkey'] != null && item.key === ''){
                if(_.indexOf(it_href_array['nkey'], _handleize(itemTag)) >= 0){
                  it_href_array['nkey'].splice(_.indexOf(it_href_array['nkey'], _handleize(itemTag)), 1);
                }
                else {
                  it_href_array['nkey'].push(_handleize(itemTag.replace(item.key, '')));
                }
              }
              else {
                it_href_array[_handleize(item.key)||'nkey'] = [];
                it_href_array[_handleize(item.key)||'nkey'].push(_handleize(itemTag.replace(item.key, '')));
              }
              filterGroupItem += templateName !== 'collection' ? allPrdUrl : '';
              var url = currTags_handle.length > 0 ? currSearch.replace(self._get_tags_from_url(currSearch), self._build_tags_url(it_href_array)) : currSearch + self._build_tags_url(it_href_array);
              filterGroupItem += url;
              if(_.indexOf(currTags_handle, itemTag_handle) >= 0 || _.indexOf(currTags_handle, 'nkey-'+itemTag_handle) >= 0){
                var itSel = [itemTag.replace(item.key+" ",""), url];
                filterSelect.push(itSel);
              }
              filterGroupItem += '" title="'+itemTag+'">';
              if(colorGroupFilter.indexOf(item.key) !== -1 || colorGroupFilter.indexOf(item.title) !== -1){
                filterGroupItem += '<span class="color_pick swatch" data-color="'+itemTag_handle+'"></span>';
              }
              if(item.block_style === '6' || item.block_style === '7'){
                _.forEach(brands_icon, function(itemBrandIcon) {
                  if(itemBrandIcon.indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1 || _snakeCase(itemBrandIcon).indexOf(_snakeCase(itemTag.replace(item.key+" ",""))) !== -1){
                    filterGroupItem += '<span class="brand_icon"><img src="';
                    filterGroupItem += itemBrandIcon;
                    filterGroupItem += '"></span>';
                  }
                });
              }
              var less_itemTag = itemTag.replace(item.key+"  ","").replace(item.key+" ","");
              filterGroupItem += '<span class="custom-control-label titleFilterItem">'+less_itemTag+'</span>';
              filterGroupItem += '</a>';
              filterGroupItem += '</li>';
            })
          }
          filterGroupItem += '</ul>';
          filterGroupItem += '</div>';
        }
        if(filterGroupItem.indexOf('<li class="_') !== -1){
          filterContent += filterGroupItem;
        }
      })
      $(selectors.filterGroupDesktop).addClass('colFilter-'+$(filterContent).length);
      if($(window).width() >= 992){
        $(selectors.filterGroupDesktop).html('<div class="d-flex flex-wrap">'+filterContent+'</div>');
        if(dataToggle == 'show'){
          $(selectors.filterGroupDesktop).find('.kt--filter-gr-i:not(.unshowAny)').addClass('showAny');
          $(selectors.filterGroupDesktop).find('.kt--filter-gr-i.unshowAny').addClass('show');
        }
      }
      else{
        $(selectors.filterGroupMobile).html(filterContent);
        if(dataToggle == 'show'){
          $(selectors.filterGroupMobile).find('.kt--filter-gr-i').addClass('show')
        }
        if($('.kt--filter-grs .kt--filter-gr-i').last().hasClass('blockStyle_3') || $('.kt--filter-grs .kt--filter-gr-i').last().hasClass('blockStyle_6') || $('.kt--filter-grs .kt--filter-gr-i').last().hasClass('blockStyle_7')){
          $('.kt--filter-grs .kt--filter-gr-i').last().addClass('showAny');
        }
        if($('.kt--filter-grs .kt--filter-gr-i').first().hasClass('widget_product_categories')){
          $('.kt--filter-grs .kt--filter-gr-i').first().addClass('showAny');
        }
        $('.kt--filter-gr-i.widget_flt_slider').addClass('showAny');
      }

      if ($('.widget_flt_slider').length > 0) { 
        $.each($( ".slider-range" ), function(idx, el) {
          var $this = $(this);
          var $container = $(this).parents('.ui-slider');
          var $flt_btn = $container.find('.btn-flt');
          if ($container.data('option') == 'price') {
            var currSearch_ = currSearch.replace(/(mipr|mapr)\_.*?\w+/g , '').replace(/(\+\+|\+$)/g, '').replace(/\=\+/g,'=');
            var min = fltSlider.mipr, max = fltSlider.mapr, val1 = fltSlider.mipr_crr, val2 = fltSlider.mapr_crr, step = $container.data('step') || 1;
            if ( max%step !== max/step ) {
              if (val2 == max) {val2 = max + step}
              max = max + step;
            }
            $this.slider({
              range: true,
              min: min,
              max: max,
              values: [val1, val2],
              step: step,
              isRTL: dirBody,
              slide: function( event, ui ) {
                $container.find(".amount").html(theme.Currency.formatMoney(ui.values[0], theme.moneyFormat) + "&nbsp;-&nbsp;" + theme.Currency.formatMoney(ui.values[1], theme.moneyFormat));
                if(ui.values[1] != max && ui.values[0] == min) {                  
                  var href = currSearch_.replace('q=', 'q=mapr_'+ui.values[1]+'+')
                }
                else if(ui.values[1] == max && ui.values[0] != min) {                  
                  var href = currSearch_.replace('q=', 'q=mipr_'+ui.values[0]+'+')
                }
                else {
                  var href = currSearch_.replace('q=', 'q=mipr_'+ui.values[0]+'+mapr_'+ui.values[1]+'+');
                }
                $flt_btn.attr('href', href);
              }
            });
            $container.find(".amount").html(theme.Currency.formatMoney($this.slider("values", 0), theme.moneyFormat) + "&nbsp;-&nbsp;" + theme.Currency.formatMoney($this.slider("values", 1), theme.moneyFormat));
            $flt_btn.attr('href', currSearch_.replace('q=', 'q=mipr_'+$this.slider("values", 0)+'+mapr_'+$this.slider("values", 1)+'+'));
          }
          if ($container.data('option') == 'weight') {
            var currSearch_ = currSearch.replace(/(miw|maw)\_.*?\w+/g , '').replace(/(\+\+|\+$)/g, '').replace(/\=\+/g,'=');
            var min = fltSlider.miw, max = fltSlider.maw, val1 = fltSlider.wmin_crr, val2 = fltSlider.wmax_crr, step = $container.data('step') || 1, unit = $container.data('unit') || 'g';
            if ( max%step !== max/step ) {
              if (val2 == max) {val2 = max + step}
              max = max + step;
            }
            $this.slider({
              range: true,
              min: min,
              max: max,
              values: [val1, val2],
              step: step,
              isRTL: dirBody,
              slide: function( event, ui ) {
                $container.find(".amount").html('<span>' + ui.values[0] + unit + "</span>&nbsp;-&nbsp;<span>"+ ui.values[1] + unit + '</span>');
                if(ui.values[1] != max && ui.values[0] == min) {                  
                  var href = currSearch_.replace('q=', 'q=maw_'+ui.values[1]+'+')
                }
                else if(ui.values[1] == max && ui.values[0] != min) {                  
                  var href = currSearch_.replace('q=', 'q=miw_'+ui.values[0]+'+')
                }
                else {
                  var href = currSearch_.replace('q=', 'q=miw_'+ui.values[0]+'+maw_'+ui.values[1]+'+');
                }
                $flt_btn.attr('href', href);
              }
            });
            $container.find(".amount").html('<span>' + $this.slider("values", 0) + unit + "</span>&nbsp;-&nbsp;<span>"+ $this.slider("values", 1) + unit + '</span>');
            $flt_btn.attr('href', currSearch_.replace('q=', 'q=miw_'+$this.slider("values", 0)+'+maw_'+$this.slider("values", 1)+'+'));
          }
        });
      }
      
      if($('.widget_recent_product').length > 0){
        var stringProduct = localStorage.getItem("kt-recent") || '';
        if(localStorage.getItem("kt-recent") !== null){
          var arrayProduct = stringProduct.split(',').reverse();
          $(".widget_recent_product").show().attr('data-include', firstPrd+'?q='+arrayProduct.join("+")+'&view=recently-sidebar').addClass('lazyload');
        }
      }

      if (filterSelect.length > 0) {
        $.each(currTags_handle, function(index, val) {
          if (val.indexOf('color-') === 0) {
            $('.swatch-on-grid._'+val.replace('color-','')+ ' .swatch').trigger('click');
            $('.swatch-on-grid._'+val.replace('color-','')+'[data-maybe-hide="true"]').attr('data-maybe-hide',false);
            return true;
          }
        });
        var fltSelect = '';
        $.each(filterSelect, function(index, val) {
          fltSelect += '<li class="kt--fl-sl-i" style="margin-right: 0 !important;">';
            fltSelect += '<a data-pjax-filter href="'+val[1]+'"><span class="remove_kt--filter-sl" data-action="remove">'+val[0]+'<i class="fkt-close" aria-hidden="true"></i></span></a>';
          fltSelect += '</li>';
        });
        $('.kt--fl-sl').html(fltSelect);
        $('.kt--filter-wrap-sl').removeClass('d-none');
        $('.filter-clean.d-none, .sidebar-filter-clear.d-none').removeClass('d-none');
      }

      if (typeof currSort !== undefined){
        _.forEach($('#sort_by a'), function(itemOrderby,idx0) {
          var $itemOrderby = $(itemOrderby);
          var newSort = ($itemOrderby.attr('href')).replace('?','');
          if(currSearch !== '' && currSearch.indexOf('sort_by=') === -1 && currSearch.indexOf(($itemOrderby.attr('href')).replace('?','')) === -1){
            $itemOrderby.attr('href',currSearch+($itemOrderby.attr('href')).replace('?','&'))
          }
          else if(currSearch !== '' && currSearch.indexOf('sort_by=') !== -1 && currSearch.indexOf(($itemOrderby.attr('href')).replace('?','')) === -1){
            $itemOrderby.attr('href',currSearch.replace(currSort,newSort));
          }else if(currSort == newSort){
            $itemOrderby.attr('href',currSearch);
          }
        });
      }
      $('#filterApply').html($('.result-count').html());
      $('#kt--filter-sl').html($('.kt--filter-wrap-sl').html());
      if($(selectors.filterGroup).find('.tagSelected').length > 0){
        $('#filterClear').show();
      }
      else{
        $('#filterClear').hide();
      }
    },
    _checkCatShowing: function() {
      if($(selectors.catShowing).length > 0){
        $(selectors.catShowing).parents('li.level-1').addClass('showAny');
      }
    },

    onUnload: function() {
      this.$container.off();
      $('.kt--filter-js').off();
    }
  });

  return Filters;
})();