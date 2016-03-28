(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/* eslint no-use-before-define: [0, { "functions": false }] */
/* eslint no-param-reassign: [2, { "props": false }] */

// dom ready wrapper
var ready = function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

var addClass = function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
};

var removeClass = function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    var search = className.split(' ').join('|');
    var regex = new RegExp('(^|\\b)' + search + '(\\b|$)', 'gi');
    el.className = el.className.replace(regex, ' ');
  }
};

var css = function css(el, className, val) {
  if ((typeof className === 'undefined' ? 'undefined' : _typeof(className)) === 'object') {
    Object.keys(className).forEach(function (k) {
      return undefined.css(k, className[k]);
    });
    return null;
  }

  if (!val) {
    return getComputedStyle(el)[className];
  }
  el.style[className] = val;
  return val;
};

var attr = function attr(el, name, val) {
  if (!val) {
    return el.getAttribute(name);
  }
  el.setAttribute(name, val);
  return undefined;
};

var triggerEvent = function triggerEvent(el, eventName, customData) {
  var event = undefined;

  if (customData) {
    if (window.CustomEvent) {
      event = new CustomEvent(eventName, { detail: customData });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, customData);
    }

    el.dispatchEvent(event);
  } else {
    event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, false);
    el.dispatchEvent(event);
  }
  return undefined;
};

var images = [];

var gallery = {
  addImage: function addImage(url, title) {
    images.push({ url: url, title: title });
  },
  loadImage: function loadImage() {
    // empty
  },
  show: function show() {
    // empty
  },
  hide: function hide() {
    // empty
  }
};

ready(function () {
  var $lightbox = document.getElementById('lightbox');
  if (!$lightbox) {
    return;
  }
  var $overlay = document.getElementById('lightboxOverlay');
  var $image = $lightbox.querySelector('.lb-image');
  var $outerContainer = $lightbox.querySelector('.lb-outerContainer');
  var $loader = $lightbox.querySelector('.lb-loader');
  var $modalclose = $lightbox.querySelector('.lb-close');
  var $caption = $lightbox.querySelector('.lb-caption');
  var $albumlabel = $lightbox.querySelector('.lb-number');
  var $next = $lightbox.querySelector('.lb-next');
  var $prev = $lightbox.querySelector('.lb-prev');
  var current = 0;
  var _imgReady = true;

  var nextImg = function nextImg() {
    if (!_imgReady) {
      return;
    }
    current++;
    loadImage(current);
  };

  var prevImg = function prevImg() {
    if (!_imgReady) {
      return;
    }
    current--;
    current = current < 0 ? images.length - 1 : current;
    loadImage(current);
  };

  $next.addEventListener('click', function () {
    return nextImg();
  });
  $prev.addEventListener('click', function () {
    return prevImg();
  });

  var keyHandler = function keyHandler(ev) {
    if (ev.code === 'ArrowLeft') {
      prevImg();
    } else if (ev.code === 'ArrowRight') {
      nextImg();
    } else if (ev.code === 'Escape') {
      gallery.hide();
    }
  };

  $modalclose.addEventListener('click', function () {
    gallery.hide();
  });
  $overlay.addEventListener('click', function () {
    gallery.hide();
  });

  var preloadImages = [];

  var loadImage = function loadImage(n) {
    if (!_imgReady) {
      return;
    }
    _imgReady = false;
    current = n % images.length;
    var img = images[current];
    var preloader = preloadImages[current] || new Image();
    removeClass($image, 'lightbox__fadein');
    $loader.style.display = 'block';
    preloader.onerror = function () {
      _imgReady = true;
      preloadImages[current] = null;
      $loader.style.display = 'none';
      $caption.innerText = 'Error while loading the image.';
    };

    preloader.onload = function () {
      triggerEvent(document, 'lightbox-change', [current]);
      css($outerContainer, 'width', preloader.width + 8 + 'px');
      css($outerContainer, 'height', preloader.height + 8 + 'px');

      setTimeout(function () {
        attr($image, 'src', img.url);
        addClass($image, 'lightbox__fadein');
        $albumlabel.innerText = 'Image ' + (current + 1) + ' of ' + images.length;
        $caption.innerText = img.title ? img.title : '';
        setTimeout(function () {
          _imgReady = true;
        });
      }, 200);
      $loader.style.display = 'none';
    };

    if (!preloadImages[current]) {
      preloader.src = img.url;
      preloadImages[current] = preloader;
    } else {
      preloader.onload();
    }
  };

  gallery.loadImage = loadImage;

  gallery.show = function () {
    var n = arguments.length <= 0 || arguments[0] === undefined ? current : arguments[0];

    document.addEventListener('keyup', keyHandler);
    triggerEvent(document, 'lightbox-open');
    loadImage(parseInt(n, 10));

    setTimeout(function () {
      addClass($lightbox, 'lightbox__fadein');
    }, 1);
    $overlay.style.display = 'block';
    $lightbox.style.display = 'block';
  };

  gallery.hide = function () {
    document.removeEventListener('keyup', keyHandler);
    triggerEvent(document, 'lightbox-close');
    removeClass($lightbox, 'lightbox__fadein');
    $overlay.style.display = 'none';
    $lightbox.style.display = 'none';
  };
});

module.exports = gallery;

},{}],2:[function(require,module,exports){
'use strict';

window.vainillaGallery = require('./gallery');

},{"./gallery":1}]},{},[2])


//# sourceMappingURL=build.js.map
