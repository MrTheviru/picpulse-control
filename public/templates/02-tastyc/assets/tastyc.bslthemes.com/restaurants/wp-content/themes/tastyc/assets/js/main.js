/* -------------------------------------------

Name: 		Tastyc

------------------------------------------- */
( function( $ ) {
  'use strict';

  var elementor = 0;
  if ( window.location.href.indexOf('/?elementor-preview=') > -1 ) {
      elementor = 1;
  }
  if ( $('.tst-app.ui-minimal').length ) {
    $('body').addClass('ui-minimal');
  }
  if ( $('.tst-app.ui-dark').length ) {
    $('body').addClass('ui-dark');
  }
  if ( $('.bg-curve-center').length ) {
    $('.tst-scroll-hint-frame').hide();
  }

  /*-------------------------
  preload
  -------------------------*/
  $(document).ready(function() {
    $('html').addClass('is-animating');

    if ( $('.tst-menu').hasClass('tst-menu-transparent') && $('.tst-banner').length ) {
      $('.tst-app').addClass('white-header');
    } else {
      $('.tst-menu-frame').addClass('tst-active');
    }

    if ( $('.tst-dynamic-banner-empty').length ) {
      $('.tst-scroll-hint-frame.tst-anchor-scroll').hide();
    }

    setTimeout(function() {
      $(".tst-app").animate({
        opacity: 1
      }, {
        duration: 400,
        complete: function() {
          $('html').removeClass('is-animating');
          $('.tst-menu-frame').removeClass('tst-active');
        }
      });
    }, 1200);
  });

  /*-------------------------
  datepicker
  -------------------------*/
  var localeDatepicker = {
    days: datepicker_localize_data.dayNames,
    daysShort: datepicker_localize_data.dayNamesShort,
    daysMin: datepicker_localize_data.dayNamesMin,
    months: datepicker_localize_data.monthNames,
    monthsShort: datepicker_localize_data.monthNamesShort,
    today: datepicker_localize_data.currentText,
    clear: datepicker_localize_data.closeText,
    dateFormat: datepicker_localize_data.dateFormat,
    timeFormat: 'hh:ii aa',
    firstDay: 0
  };

  const datepickerElements = document.querySelectorAll(".datepicker-here");
  datepickerElements.forEach((element) => {
    new AirDatepicker(element, {
      minDate: new Date(),
      autoClose: true,
      locale: localeDatepicker
    });
  });

  /*-------------------------
  nice select
  -------------------------*/
  $('select').not('[autocomplete]').niceSelect();

  /*-------------------------
  mobile menu
  -------------------------*/
  $('.tst-menu-btn').on('click', function() {
    $('.tst-menu-btn , .tst-menu nav, .tst-menu-nav').toggleClass('tst-active');
    $('.tst-minicart-window , .tst-popup-bg').removeClass('tst-active');
  });

  if ($(window).width() < 1181) {
	  $('.menu-item-has-children > a').append('<span></span>');
	  $('.menu-item-has-children > a > span').on('click', function() {
		  $(this).closest('li').toggleClass('dropdown-active');
		  return false;
	  });
  }

  /*-------------------------
  minicart
  -------------------------*/
  $('.tst-cart').on('click', function() {
    $('.tst-minicart-window').toggleClass('tst-active');
    $('.tst-menu-btn , .tst-menu nav , .tst-popup-bg').removeClass('tst-active');
  });

  $('.woocommerce-mini-cart__buttons a').on('click', function() {
    $('.tst-minicart-window').removeClass('tst-active');
  });

  /*-------------------------
  popups
  -------------------------*/
  var $h_btn_cloned = 1;
  if ($(window).width() < 1181 && $('.tst-mobile-btn-2-show').length && $h_btn_cloned === 1) {
    $('.tst-menu-right.tst-mobile-btn-2-show .theme-btn').clone(true).appendTo('.tst-menu-nav');
    $h_btn_cloned = 0;
  }
  if ($(window).width() < 1181 && $('.tst-mobile-btn-show').length && $h_btn_cloned === 1) {
    $('.tst-menu-right.tst-mobile-btn-show .tst-btn').clone(true).appendTo('.tst-menu-nav');
    $h_btn_cloned = 0;
  }

  $(window).resize(function() {
      if ($(window).width() < 1181 && $('.tst-mobile-btn-2-show').length && $h_btn_cloned === 1) {
        $('.tst-menu-right.tst-mobile-btn-2-show .theme-btn').clone(true).appendTo('.tst-menu-nav');
        $h_btn_cloned = 0;
      }
      if ($(window).width() > 1181 && $('.tst-mobile-btn-2-show').length) {
        $('.tst-menu-nav .theme-btn').remove();
        $h_btn_cloned = 1;
      }
      if ($(window).width() < 1181 && $('.tst-mobile-btn-show').length && $h_btn_cloned === 1) {
        $('.tst-menu-right.tst-mobile-btn-show .tst-btn').clone(true).appendTo('.tst-menu-nav');
        $h_btn_cloned = 0;
      }
      if ($(window).width() > 1181 && $('.tst-mobile-btn-show').length) {
        $('.tst-menu-nav .tst-btn').remove();
        $h_btn_cloned = 1;
      }
  });

  $('.tst-res-btn').on('click', function() {
    $('.tst-popup-bg').toggleClass('tst-active');
    $('.tst-minicart-window , .tst-menu nav').removeClass('tst-active');
    return false;
  });

  $('.tst-close-popup').on('click', function() {
    $('.tst-popup-bg').removeClass('tst-active');
  });

  $('.links-box .info-btn').on('click', function() {
    $('.tst-menu-right').addClass('tst-sidebar-active');
    $('.info-back-drop').addClass('tst-sidebar-active');
    return false;
  });

  $('.info-back-drop, .info-bar .cross-icon').on('click', function() {
    $('.tst-menu-right').removeClass('tst-sidebar-active');
    $('.info-back-drop').removeClass('tst-sidebar-active');
    return false;
  });

  /*-------------------------
  menu after scroll
  -------------------------*/
  var sct_h = 120;
  if ( $(window).width() < 768 ) {
    var sct_h = 46;
  }

  $(window).on("scroll", function() {
    var scroll = $(window).scrollTop();
    if (scroll >= sct_h) {
      $(".tst-menu-frame").addClass("tst-active");
    } else {
      $(".tst-menu-frame").removeClass("tst-active");
    }
  });

  /*-------------------------
  main title after scroll
  -------------------------*/
  $(window).scroll(function() {
    $(".tst-main-title , .tst-main-slider-nav , .tst-main-pagination").css("opacity", 1 - $(window).scrollTop() / 500);
  });

  /*-------------------------
  parallax
  -------------------------*/
  $(window).on('scroll', parallax)
  function parallax() {
    var s = $(window).scrollTop();
    function parallaxDown(e, t) {
      $(e).css({
        'position': 'relative',
        'top': (s * t) + 'px'
      });
    }
    parallaxDown('.tst-parallax', .3);
  }

  /*-------------------------
  fade scroll object
  -------------------------*/
  $(window).scroll(function() {
    $('.tst-fade-up , .tst-fade-down').each(function(i) {
      var bottom_of_object = $(this).offset().top;
      var bottom_of_window = $(window).scrollTop() + $(window).height();
      if (bottom_of_window > bottom_of_object) {
        $(this).addClass('tst-active');
      }
    });
  });

  if ($(window).width() < 992) {
    $('footer').removeClass('tst-fade-down');
  }

  $(window).on('resize orientationChange', function(event) {
    if ($(window).width() < 992) {
      $('footer').removeClass('tst-fade-down');
    } else {
      $('footer').addClass('tst-fade-down');
    }
  });

  /*-------------------------
  onepage navigation and anchor scroll
  -------------------------*/
  $('.tst-onepage a , .tst-anchor-scroll').on("click", function() {
    $(".tst-onepage .current-menu-item").removeClass("current-menu-item");
    $(this).closest('li').addClass("current-menu-item");
    var theClass = $(this).attr("class");
    $('.' + theClass).parent('li').addClass('current-menu-item');
    $('html, body').stop().animate({
      scrollTop: $($(this).attr('href')).offset().top - 140
    }, 800);
    return false;
  });

  /* Collapse */
  $('.collapse-item').on('click', '.collapse-btn', function(){
    if($(this).closest('.collapse-item').hasClass('active')) {
      $(this).closest('.collapse-item').find('.collapse-content').slideUp();
      $(this).closest('.collapse-item').removeClass('active');
      $(this).removeClass('active');
    }
    else {
      $(this).closest('.collapse-items').find('.collapse-content').slideUp();
      $(this).closest('.collapse-items').find('.collapse-item').removeClass('active');
      $(this).closest('.collapse-item').find('.collapse-content').slideDown();
      $(this).closest('.collapse-item').addClass('active');
      $(this).addClass('active');
    }
  });

  /*-------------------------
  Magnific Popups
  -------------------------*/
  if (!$('body').hasClass('elementor-default')) {
    $("a").each(function(i, el) {
      var href_value = el.href;
      if (/\.(jpg|png|gif)$/.test(href_value)) {
         $(el).magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            fixedContentPos: false,
            closeBtnInside: false,
            callbacks: {
              beforeOpen: function() {
                // just a hack that adds mfp-anim class to markup
                 this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                 this.st.mainClass = 'mfp-zoom-in';
              }
            },
          });
      }
    });
  }

  $('[data-magnific-inline]').magnificPopup({
    type: 'inline',
    overflowY: 'auto',
    preloader: false,
    callbacks: {
      beforeOpen: function() {
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
  });

  $('[data-magnific-image]').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    fixedContentPos: false,
    closeBtnInside: false,
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
         this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
  });

  $('[data-magnific-video]').magnificPopup({
    type: 'iframe',
    iframe: {
        patterns: {
            youtube_short: {
              index: 'youtu.be/',
              id: 'youtu.be/',
              src: 'https://www.youtube.com/embed/%id%?autoplay=1'
            }
        }
    },
    preloader: false,
    fixedContentPos: false,
    callbacks: {
      markupParse: function(template, values, item) {
        template.find('iframe').attr('allow', 'autoplay');
      },
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
         this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
  });

  $('[data-magnific-music]').magnificPopup({
    type: 'iframe',
    preloader: false,
    fixedContentPos: false,
    closeBtnInside: true,
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
         this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
  });

  $('[data-magnific-gallery]').magnificPopup({
    gallery: {
        enabled: true
    },
    type: 'image',
    closeOnContentClick: false,
    fixedContentPos: false,
    closeBtnInside: false,
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
         this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
         this.st.mainClass = 'mfp-zoom-in';
      }
    },
  });

  /*-------------------------
  just slider
  -------------------------*/
  var swiper = new Swiper('.tst-slider', {
    slidesPerView: 3,
    spaceBetween: 30,
    speed: 800,
    noSwipingSelector: 'a',
    navigation: {
      prevEl: '.tst-prev',
      nextEl: '.tst-next',
    },
    pagination: {
      el: '.tst-blog-pagination',
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 1,
      },
      992: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });

  /*-------------------------
  just slider two
  -------------------------*/
  var swiper = new Swiper('.tst-slider-two', {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    noSwipingSelector: 'a',
    navigation: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });

  /*-------------------------
  banner slider
  -------------------------*/
  var prop_delay = $('.tst-main-slider').data('swiper-delay');
  var prop_autoplay = $('.tst-main-slider').data('swiper-autoplay');
  var autoplay_param = 0;
  if ( prop_autoplay && ! elementor ) {
      autoplay_param = {
          disableOnInteraction: false,
          delay: prop_delay
      };
  }

  var swiper = new Swiper('.tst-main-slider', {
    slidesPerView: 1,
    speed: 800,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    pagination: {
      el: '.tst-main-pagination',
      clickable: true,
    },
    parallax: true,
    autoplay: autoplay_param,
    noSwipingSelector: 'a',
    navigation: {
      prevEl: '.tst-main-prev',
      nextEl: '.tst-main-next',
    },
  });

  /*-------------------------
  banner hero style-2
  -------------------------*/
  var prop_btwo_delay = $('.tst-hero-style-2').data('swiper-delay');
  var prop_btwo_autoplay = $('.tst-hero-style-2').data('swiper-autoplay');
  var autoplay_btwo_param = 0;
  if ( prop_btwo_autoplay && ! elementor ) {
      autoplay_btwo_param = {
          disableOnInteraction: false,
          delay: prop_btwo_delay
      };
  }

  var swiper = new Swiper('.tst-hero-style-2', {
    slidesPerView: 1,
    speed: 800,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    pagination: {
      el: '.tst-main-pagination',
      clickable: true,
    },
    parallax: true,
    autoplay: autoplay_btwo_param,
    noSwipingSelector: 'a',
    navigation: {
      prevEl: '.tst-main-prev',
      nextEl: '.tst-main-next',
    },
  });

  /*-------------------------
  footer gallery slider
  -------------------------*/
  var swiper = new Swiper('.tst-footer-gallery', {
    slidesPerView: 4,
    spaceBetween: 15,
    loop: true,
    speed: 800,
    autoplay: {
      delay: 5000,
    },
    navigation: {
      prevEl: '.tst-fg-prev',
      nextEl: '.tst-fg-next',
    },
    breakpoints: {
      0: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
      },
    },
  });

  /*-------------------------
  testimonials slider
  -------------------------*/
  var swiper = new Swiper('.tst-testimonials-slider', {
    slidesPerView: 3,
    spaceBetween: 30,
    speed: 800,
    centeredSlides: true,
    loop: true,
    noSwipingSelector: 'a',
    navigation: {
      prevEl: '.tst-testi-prev',
      nextEl: '.tst-testi-next',
    },
    pagination: {
      el: '.tst-testi-pagination',
      clickable: true,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 1,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });

  /*-------------------------
  testimonials slider style-2
  -------------------------*/
  var swiper_testi_top = new Swiper('.testi-top-carousel', {
    slidesPerView: 1,
    spaceBetween: 50,
    speed: 800,
    loop: false,
    rewind: true,
    navigation: false,
    pagination: false,
    initialSlide: 1,
  });

  var swiper_testi_th = new Swiper('.testi-thumbs-carousel', {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 800,
    loop: false,
    rewind: true,
    navigation: false,
    pagination: false,
    initialSlide: 1,
  });

  swiper_testi_top.controller.control = swiper_testi_th;
  swiper_testi_th.controller.control = swiper_testi_top;

  /*-------------------------
  menu tabs
  -------------------------*/
  var menu = [];
  $('.swiper-menu-container').each(function(i, container){
    menu[i] = [];
    $(container).find('.swiper-menu-nav .span-category').each(function(j, item){
      menu[i].push( $(item).find('span').text() );
    });
	  
    var hash_navigation_param = false;
    if ( $(container).find('.swiper-menu').data('hash-navigation') == '1' ) {
      hash_navigation_param = true;
    }

    var mySwiper = new Swiper( $(container).find('.swiper-menu')[0], {
      effect: 'fade',
      parallax: true,
      speed: 600,
  	  autoHeight: true,
	    hashNavigation: hash_navigation_param,
      noSwipingSelector: 'a',
      pagination: {
        el: $(container).find('.swiper-menu-nav')[0],
        clickable: true,
        renderBullet: function(index, className) {
          return '<span class="' + className + '">' + (menu[i][index]) + '</span>';
        },
      },
    });
  });

  if($(window).width() < 991) {
    $('.swiper-menu-nav').on('click', '.swiper-pagination-bullet', function(){
      $('body, html').animate({scrollTop: $('.swiper-menu').offset().top - 100}, 400);
    });
  }

  if ( $('.menu-nav-all').length ) {
    setTimeout(function() {
      $('.swiper-menu-nav.swiper-pagination-bullets .swiper-pagination-bullet').removeClass('swiper-pagination-bullet-active');
      $('.menu-tabs-box .tab-buttons .tab-btn:not(.menu-nav-all)').removeClass('active-btn');
      $('.swiper-menu-container, .menu-tabs-box').addClass('all-active');
      $('.menu-tabs-box').addClass('menu-list-box');
      
      $('.swiper-menu-nav.swiper-pagination-bullets .swiper-pagination-bullet, .menu-tabs-box .tab-buttons .tab-btn:not(.menu-nav-all)').on("click", function() {
        $('.swiper-menu-container, .menu-tabs-box').removeClass('all-active');
        $('.menu-tabs-box').removeClass('menu-list-box');
        $('.swiper-menu-nav-all .swiper-pagination-bullet').removeClass('swiper-pagination-bullet-active');
        $('.menu-tabs-box .tab-buttons .tab-btn').removeClass('active-btn');
        if ( $(this).hasClass('swiper-pagination-bullet') ) {
          $(this).addClass('swiper-pagination-bullet-active');
        } else {
          $(this).addClass('active-btn');
        }
      });

      $('.swiper-menu-nav-all .swiper-pagination-bullet, .menu-tabs-box .tab-buttons .tab-btn.menu-nav-all').on("click", function() {
        $('.swiper-menu-container, .menu-tabs-box').addClass('all-active');
        $('.menu-tabs-box').addClass('menu-list-box');
        $('.swiper-menu-nav.swiper-pagination-bullets .swiper-pagination-bullet').removeClass('swiper-pagination-bullet-active');
        $('.menu-tabs-box .tab-buttons .tab-btn').removeClass('active-btn');
        if ( $(this).hasClass('swiper-pagination-bullet') ) {
          $(this).addClass('swiper-pagination-bullet-active');
        } else {
          $(this).addClass('active-btn');
        }
      });
    }, 250);
  }

  /*-------------------------
  Initialize isotope items
  -------------------------*/
  var $masonryGallery=$('.js-gallery').isotope({
      itemSelector: '.itemGallery',
      percentPosition: true,
    transitionDuration: '0.5s',
      hiddenStyle: {
          opacity: 0,
          transform: 'scale(0.001)'
      },
      visibleStyle: {
          opacity: 1,
          transform: 'scale(1)'
      },
      masonry: {
        columnWidth: '.itemGallery',
          isAnimated: true
      }
  });

  $masonryGallery.imagesLoaded().progress( function() {
      $masonryGallery.isotope ({
        columnWidth: '.itemGallery',
          isAnimated: true
    });
  });

  /*-----------------------------------------------------------------
  20. Switch categories & Filter mobile
  -------------------------------------------------------------------*/
  $('.gallery-filter').on('click','ul li',function(){
    $('.filter__item').removeClass('active');
    $(this).addClass('active');
    var selector = $(this).attr('data-filter');
    $('.js-sort').isotope({
      filter: selector
    });
    return false;
  });

  /*-------------------------
  counter up
  -------------------------*/
  if ( $('.tst-number').length ) {
    var count = 0;
    $(window).scroll(function() {
      var oTop = $('.tst-number').offset().top - window.innerHeight;
      if (count == 0 && $(window).scrollTop() > oTop) {
        $('.tst-number').each(function() {
          var $this = $(this),
            countTo = $this.attr('data-count');
          $({
            countNum: $this.text()
          }).animate({
            countNum: countTo
          }, {
            duration: 3000,
            easing: 'swing',
            step: function() {
              $this.text(Math.floor(this.countNum));
            },
            complete: function() {
              $this.text(this.countNum);
            }
          });
        });
        count = 1;
      }
    });
  }

  /*-------------------------
  map
  -------------------------*/
  if ($("div").is("#map")) {
    var map_long = $('#map').data('long');
    var map_lat = $('#map').data('lat');
    var map_zoom = $('#map').data('zoom');
    var map_key = $('#map').data('key');
    var map_style = $('#map').data('style');
    var map_style_ui = 'mapbox://styles/mapbox/dark-v11';

    if (map_style == 0) {
      map_style_ui = 'mapbox://styles/mapbox/dark-v11';
    }
    if (map_style == 1) {
      map_style_ui = 'mapbox://styles/mapbox/light-v11';
    }
    if (map_style == 2) {
      map_style_ui = 'mapbox://styles/mapbox/streets-v12';
    }

    mapboxgl.accessToken = map_key;
    var map = new mapboxgl.Map({
      container: 'map',
      style: map_style_ui,
      center: [map_long, map_lat],
      zoom: map_zoom
    });

    var marker = new mapboxgl.Marker()
      .setLngLat([map_long, map_lat])
      .addTo(map);
  }

  $('.tst-lock').on('click', function() {
    $('.tst-with-map').toggleClass('tst-active');
    $('.tst-map').toggleClass('tst-active');
    $('.tst-lock').toggleClass('tst-active');
    $('.tst-lock .fas').toggleClass('fa-unlock');
  });

  if ( $('.tst-call-to-action').length ) {
    var divider_el = $('.tst-call-to-action');
    var divider_sec = divider_el.closest('section');
    var divider_con = divider_el.closest('div[data-element_type="container"]');

    if ( divider_sec.length ) {
      divider_sec.css('background-color', 'transparent');
      divider_sec.prev().find('.tst-spacer:last').hide();
    }
    if ( divider_con.length ) {
      divider_con.css('background-color', 'transparent');
      divider_con.prev().find('.tst-spacer:last').hide();
    }

    var last_section = $('.tst-dynamic-content .elementor-section').last();
    if ( last_section.find('.tst-call-to-action').length ){
      $('.tst-content-box > .tst-content-frame--end').hide();
    }

    var first_section = $('.tst-dynamic-content .elementor-section').first();
    if ( first_section.find('.tst-call-to-action').length ){
      $('.tst-content-box > .tst-content-frame--start').css('background-color', 'transparent');
    }
  }

  if ( $('.tst-woo-breadcrumbs').length ) {
    var bread_ul = $('.tst-woo-breadcrumbs').find('ul');
    $('.tst-breadcrumbs').html( bread_ul.html() );
  }

  $(document).on('click', function(e){
    if ( ! $(e.target).closest('.tst-minicart-window, .tst-cart').length  ) {
      if ( $('.tst-minicart-window').hasClass('tst-active') ) {
        $('.tst-cart').trigger('click');
      }
    }
    if ( ! $(e.target).closest('.added_to_cart').length ) {
      $('.added_to_cart').remove();
    }
  });

  /* 
    X Icon
  */
  if($('.tst-social .fab.fa-twitter').length){
    $('.tst-social .fab.fa-twitter').addClass('x-icon');
    $('.tst-social .fab.fa-twitter').append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#f2f6f7" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>');
  }
  if($('.tst-content-frame .tst-icon-link .fab.fa-twitter').length){
    $('.tst-content-frame .tst-icon-link .fab.fa-twitter').addClass('x-icon');
    $('.tst-content-frame .tst-icon-link .fab.fa-twitter').append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#1a2f33" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>');
  }
  if($('.social-share .fab.fa-twitter').length){
    $('.social-share .fab.fa-twitter').addClass('x-icon');
    $('.social-share .fab.fa-twitter').append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#1a2f33" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>');
  }

  /* Menu Tabs Style-2 */
  $('.menu-tabs-box').on('click', '.tab-btn', function(){
    var $id = $(this).data('tab');
    if( ! $(this).hasClass('active-tab') ) {
      $(this).closest('.menu-tabs-box').find('.tab-btn').removeClass('active-btn');
      $(this).closest('.menu-tabs-box').find('.tab-item').removeClass('active-tab');

      $(this).addClass('active-btn');
      $($id).addClass('active-tab');
    }
  });

} )( jQuery );
