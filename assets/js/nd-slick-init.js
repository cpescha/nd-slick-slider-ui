(function($){
  'use strict';
  $(function(){

    var pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1.7em" height="1.7em" viewBox="0 0 20 20"><path fill="currentColor" d="M14.78 2.044a.73.73 0 0 1 .72.741v14.473a.73.73 0 0 1-.72.742a.73.73 0 0 1-.72-.742V2.785a.73.73 0 0 1 .72-.741M5.22 2a.73.73 0 0 1 .72.742v14.473a.73.73 0 0 1-.72.741a.73.73 0 0 1-.72-.741V2.742A.73.73 0 0 1 5.22 2"/></svg>';
    var playIcon  = '<svg xmlns="http://www.w3.org/2000/svg" width="1.7em" height="1.7em" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M1.436 12.33a1.14 1.14 0 0 0 .63 1a1.24 1.24 0 0 0 1.22 0l8.65-5.35a1.11 1.11 0 0 0 0-2L3.286.67a1.24 1.24 0 0 0-1.22 0a1.14 1.14 0 0 0-.63 1z" stroke-width="1"/></svg>';

    function assign(target, patch){ for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch,k)) target[k]=patch[k]; return target; }

    function initOne($slider){
      if ($slider.hasClass('slick-initialized')) return;

      var key = $slider.attr('data-slick-id');
      if (!key) {
        var m = ($slider.attr('class')||'').match(/(slider-[a-z0-9_-]+)/i);
        key = m ? m[1] : ('slider-' + Math.random().toString(36).slice(2));
        $slider.attr('data-slick-id', key);
      }

      var $ui        = $('.slick-ui[data-for="'+ key +'"]').first();
      var $dotsWrap  = $ui.find('.slick-nav-dots');
      var $counterEl = $ui.find('.slick-nav-counter');
      var $toggleBtn = $ui.find('.slider-autoplay-toggle');
      var $controlsRow = $ui.find('.slick-controls-row');
      var $arrowsWrap  = $ui.find('.slick-nav-arrows');

      var raw        = $slider.attr('data-autoplay');
      var startAuto  = (typeof raw !== 'undefined') ? (String(raw) === '1') : true;
      var userStopped = !startAuto;

      if ($dotsWrap.length) $dotsWrap.empty();
      $slider.find('ul.slick-dots').remove();

      if ($counterEl.length) {
        $slider.on('init reInit afterChange', function(e, slick){
          var i = (typeof slick.currentSlide === 'number' ? slick.currentSlide : 0) + 1;
          var total = slick.slideCount, pad = String(total).length;
          $counterEl.text(String(i).padStart(pad,'0') + ' / ' + String(total).padStart(pad,'0'));
        });
      }

      function syncToggleIcons(isRunning){
        if (!$toggleBtn.length) return;
        $toggleBtn.attr('aria-label', isRunning ? 'Autoplay pausieren' : 'Autoplay starten');
        $toggleBtn.attr('aria-pressed', isRunning ? 'true' : 'false');
        var $icon = $toggleBtn.find('.slider-toggle-icon');
        if (!$icon.length) $icon = $('<span class="slider-toggle-icon" aria-hidden="true"></span>').appendTo($toggleBtn);
        $icon.html(isRunning ? pauseIcon : playIcon);
      }

      function fixDots(slick){
        if (!$dotsWrap.length) return;
        var $lists = $dotsWrap.find('ul.slick-dots');
        if ($lists.length > 1) $lists.not(':last').remove();
        var $ul = $dotsWrap.find('ul.slick-dots').last();
        if ($ul.length) {
          $ul.find('li').removeClass('slick-active');
          var idx = (typeof slick.currentSlide === 'number') ? slick.currentSlide : 0;
          $ul.children('li').eq(idx).addClass('slick-active');
        }
      }

      $slider.on('init', function(e, slick){
        var reposition=function(){ slick.setPosition(); };
        var curIndex=(typeof slick.currentSlide==='number'?slick.currentSlide:0);
        var curSlideEl=(slick.$slides&&slick.$slides.length)?slick.$slides.get(curIndex)||slick.$slides.get(0):null;
        var $img=curSlideEl?$(curSlideEl).find('img').first():$();
        if ($img.length && !$img[0].complete) $img.one('load', reposition); else setTimeout(reposition, 0);
        syncToggleIcons(startAuto);
        fixDots(slick);
      });

      $slider.on('afterChange reInit', function(e, slick){
        fixDots(slick);
        var running=!userStopped && !!slick.options.autoplay;
        syncToggleIcons(running);
      });

      var wantArrows=false;
      if ($ui.length) {
        var ds=$ui.attr('data-show-arrows');
        if (typeof ds!=='undefined') { wantArrows=(String(ds)==='1'); }
        else { wantArrows=!!($controlsRow.length || $arrowsWrap.length); }
      }

      var baseOptions={
        infinite:true,
        fade:true,
        speed:900,
        arrows:wantArrows,
        dots:!!$dotsWrap.length,
        appendDots: $dotsWrap.length ? $dotsWrap.get(0) : undefined,
        customPaging: function(slider, i) {
          return '<button type="button" aria-label="Gehe zu Folie ' + (i + 1) + '"></button>';
        },
        prevArrow:'<button type="button" class="slick-prev" aria-label="Vorherige Folie"></button>',
        nextArrow:'<button type="button" class="slick-next" aria-label="Nächste Folie"></button>',
        appendArrows: $controlsRow.length ? $controlsRow.get(0) : ($arrowsWrap.length ? $arrowsWrap.get(0) : undefined),
        adaptiveHeight:false,
        pauseOnHover:false,
        pauseOnDotsHover:false,
        pauseOnFocus:true,
        autoplay:startAuto,
        autoplaySpeed:5000,
        waitForAnimate:true,
        slidesToShow:1,
        slidesToScroll:1,
        swipeToSlide:true
      };

      if (key==='slider-b' || $slider.hasClass('slider-b')) {
        var bOptions={ fade:false, slidesToShow:3, slidesToScroll:1,
          responsive:[
            {breakpoint:1200, settings:{slidesToShow:3, slidesToScroll:1}},
            {breakpoint:1024, settings:{slidesToShow:2, slidesToScroll:1}},
            {breakpoint:768,  settings:{slidesToShow:1, slidesToScroll:1}}
          ]
        };
        assign(baseOptions, bOptions);
      }

      $slider.slick(baseOptions);

      var resumeTimer=null;
      function pauseAndMaybeResume(){
        if(!$slider.hasClass('slick-initialized')) return;
        var slick=$slider.slick('getSlick');
        if(typeof slick.autoPlayClear==='function') slick.autoPlayClear();
        $slider.slick('slickPause');
        clearTimeout(resumeTimer);
        if (userStopped){ syncToggleIcons(false); return; }
        var delay=(slick&&slick.options&&slick.options.autoplaySpeed)?slick.options.autoplaySpeed:5000;
        resumeTimer=setTimeout(function(){
          if($slider.hasClass('slick-initialized')&&!userStopped){
            $slider.slick('slickPlay'); syncToggleIcons(true);
          }
        }, delay);
      }

      if ($dotsWrap.length) {
        $dotsWrap.on('mousedown click', 'ul.slick-dots li button', function(){
          pauseAndMaybeResume();
          setTimeout(function(){ var slick=$slider.slick('getSlick'); fixDots(slick); },0);
        });
      }
      $ui.on('click', '.slick-prev, .slick-next', pauseAndMaybeResume);
      $slider.on('swipe', pauseAndMaybeResume);

      if ($toggleBtn.length) {
        $toggleBtn.on('click', function(){
          if(!$slider.hasClass('slick-initialized')) return;
          var slick=$slider.slick('getSlick');
          if (userStopped){
            userStopped=false; slick.options.autoplay=true; $slider.slick('slickPlay'); syncToggleIcons(true);
          } else {
            userStopped=true; if(typeof slick.autoPlayClear==='function') slick.autoPlayClear();
            $slider.slick('slickPause'); slick.options.autoplay=false; clearTimeout(resumeTimer); syncToggleIcons(false);
          }
        });
      }
    }

    // Init all eligible sliders
    $('.slider[data-slick-id], .slider-a, .slider-b').each(function(){ initOne($(this)); });

  });
})(jQuery);
