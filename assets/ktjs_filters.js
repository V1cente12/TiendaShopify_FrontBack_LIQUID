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
    $.ajax({
      url: collection.url.indexOf('?') >= 0 ? collection.url + '&view=alltag' :  collection.url + '?view=alltag',
      type: 'GET',
      dataType: 'html',
      cache: true
    })
    .done(function(data) {
      if (data.indexOf('ktjs') >= 0) {
        $('[data-section-type="collection-filter"]').append(data.replace('ktjs','').replace(/(noscript\>)/gm, 'script>'))
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
    _createFilter: function() {
      var filterContent = '';
      var currSearch = window.location.search;
      var currSort = $('#sort_by').length ? ($('#sort_by li.selected a').attr('href')).replace('?','') : undefined;
      if(currSearch.indexOf('?sort_by=') >= 0 || currSearch.indexOf('?page=') >= 0 || currSearch.indexOf('?view=') >= 0 || currSearch.indexOf('?q=') >= 0){
        currSearch = '?'+currSearch.split('?')[1];
        if (currPage > 1) {
          currSearch = currSearch.replace('page='+currPage, 'page=1')
        }
      }
      else{
        currSearch = '';
      }
      _.forEach(groupsFilter, function(item,idx0) {
        var filterGroupItem  = "";
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
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' widget widget_banner"><ul class="list-unstyled kt--filter-gr-i_ul pt-2i pt-lg-0i"><li class="_banner text-center" style="border: none"><div class="banner-effect1" style="position: relative"><a href="'+item.url+'" class="mb_0i"><img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="'+item.img+'"></a></div></li></ul>';
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
        else{
          if (item.key == 'kt_slider'){return}
          if (item.new_row) {filterGroupItem += '<div class="col-12 d-none d-lg-block clearfix"></div>'}
          filterGroupItem += '<div class="kt--filter-gr-i col-12 col-lg-'+item.block_width+' kt--filter-gr-i'+idx0+' blockStyle_'+item.block_style+' split_'+item.use_split;
          filterGroupItem += item.always_show == true ? '">' : ' unshowAny">';
          filterGroupItem += '<div class="layered_subtitle_heading"><span class="layered_subtitle">'+item.title+'<span></span></span><span class="ico"><i class="fkt-angle-down" aria-hidden="true"></i></span></div>';
          filterGroupItem += '<ul class="kt--filter-gr-i_ul list-unstyled">';
          var itemTags = item.tags;
          if(item.tags.length > 0){
            _.forEach(item.tags.split(', '), function(item_,idx0) {
              var handle_pos = -1;
              _.find(collectionTags, function(itemTag) {
                ++handle_pos;                
                if(_snakeCase(itemTag) !== _snakeCase(item_) || filterGroupItem.indexOf('_'+_snakeCase(collectionTagsHandle[handle_pos].replace(item.key_+"-",""))+' kt') !== -1){return;}
                var itemTag_handle = collectionTagsHandle[handle_pos];
                var itemTag_snake = _snakeCase(itemTag_handle);
                filterGroupItem += '<li class="_'+itemTag_handle+' kt';
                if(_.indexOf(currTags_handleize, itemTag_handle) >= 0){
                  filterGroupItem += ' tagSelected';
                }
                if(iscollectionTags.length > 0 && _.indexOf(iscollectionTags, itemTag) < 0){
                  filterGroupItem += ' tagHidden';
                }
                filterGroupItem += '">';
                filterGroupItem += '<a class="custom-control custom-checkbox" data-pjax-filter="" href="';
                filterGroupItem += Shopify.root_url;
                if(currTags_handleize.length == 0){
                  filterGroupItem += '/collections/'+collection.Crr+'/'+itemTag_handle+currSearch;
                }
                else if(_.indexOf(currTags_handleize, itemTag_handle) >= 0){
                  filterGroupItem += '/collections/'+collection.Crr+'/';
                  _.forEach(currTags_handleize, function(itemCurrentTags) {
                    if(itemTag_handle !== itemCurrentTags){
                      filterGroupItem += itemCurrentTags+'+'
                    }
                  })
                  filterGroupItem += currSearch;
                }
                else{
                  filterGroupItem += '/collections/'+collection.Crr+'/';
                  _.forEach(currTags_handleize, function(itemCurrentTags) {
                    if(itemTag !== itemCurrentTags){
                      filterGroupItem += itemCurrentTags+'+'
                    }
                  })
                  filterGroupItem += itemTag_handle+currSearch;
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
              });
            });
          } else {
            var handle_pos = -1;
            _.find(collectionTags, function(itemTag) {
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
              var itemTag_handle = collectionTagsHandle[handle_pos];
              var itemTag_snake = _snakeCase(itemTag_handle);
              filterGroupItem += '<li class="_'+itemTag_handle.replace(item.key_+"-","")+' kt';
              if(_.indexOf(currTags_handleize, itemTag_handle) >= 0){
                filterGroupItem += ' tagSelected';
              }
              if(iscollectionTags.length > 0 && _.indexOf(iscollectionTags, itemTag) < 0){
                filterGroupItem += ' tagHidden';
              }
              filterGroupItem += '">';
              filterGroupItem += '<a class="custom-control custom-checkbox" data-pjax-filter="" href="';
              filterGroupItem += Shopify.root_url;
              if(currTags_handleize.length == 0){
                filterGroupItem += '/collections/'+collection.Crr+'/'+itemTag_handle+currSearch;
              }
              else if(_.indexOf(currTags_handleize, itemTag_handle) >= 0){
                filterGroupItem += '/collections/'+collection.Crr+'/';
                _.forEach(currTags_handleize, function(itemCurrentTags) {
                  if(itemTag_handle !== itemCurrentTags){
                    filterGroupItem += itemCurrentTags+'+';
                  }
                })
                filterGroupItem += currSearch;
              }else{
                filterGroupItem += '/collections/'+collection.Crr+'/';
                _.forEach(currTags_handleize, function(itemCurrentTags) {
                  if(itemTag_handle !== itemCurrentTags){
                    filterGroupItem += itemCurrentTags+'+'
                  }
                })
                filterGroupItem += itemTag_handle+currSearch;
              }
              filterGroupItem += '" title="'+itemTag+'">';
              if(colorGroupFilter.indexOf(item.key) !== -1 || colorGroupFilter.indexOf(item.title) !== -1){
                filterGroupItem += '<span class="color_pick swatch" data-color="'+itemTag_handle.replace(item.key_+" ","")+'"></span>';
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
              filterGroupItem += '<span class="custom-control-label titleFilterItem">'+itemTag.replace(item.key+" ","")+'</span>';
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
          $('.kt--filter-grs .kt--filter-gr-i').last().addClass('showAny')
        }
        if($('.kt--filter-grs .kt--filter-gr-i').first().hasClass('widget_product_categories')){
          $('.kt--filter-grs .kt--filter-gr-i').first().addClass('showAny')
        }
      }
      
      if($('.widget_recent_product').length > 0){
        var stringProduct = localStorage.getItem("kt-recent") || '';
        if(localStorage.getItem("kt-recent") !== null){
          var arrayProduct = stringProduct.split(',').reverse();
          $(".widget_recent_product").show().attr('data-include', firstPrd+'?q='+arrayProduct.join("+")+'&view=recently-sidebar').addClass('lazyload');
        }
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
      $.each(currTags_handleize, function(index, val) {
        if (val.indexOf('color-') === 0) {
          $('.swatch-on-grid._'+val.replace('color-','')+ ' .swatch').trigger('click');
          $('.swatch-on-grid._'+val.replace('color-','')+'[data-maybe-hide="true"]').attr('data-maybe-hide',false);
          return true;
        }
      });
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