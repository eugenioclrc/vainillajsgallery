/* eslint no-use-before-define: [0, { "functions": false }] */
/* eslint no-param-reassign: [2, { "props": false }] */

// dom ready wrapper
const ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

const addClass = (el, className) => {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ` ${className}`;
  }
};

const removeClass = (el, className) => {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    const search = className.split(' ').join('|');
    const regex = new RegExp(`(^|\\b)${search}(\\b|$)`, 'gi');
    el.className = el.className.replace(regex, ' ');
  }
};

const css = (el, className, val) => {
  if (typeof className === 'object') {
    Object.keys(className).forEach(k => this.css(k, className[k]));
    return null;
  }

  if (!val) {
    return getComputedStyle(el)[className];
  }
  el.style[className] = val;
  return val;
};

const attr = (el, name, val) => {
  if (!val) {
    return el.getAttribute(name);
  }
  el.setAttribute(name, val);
  return this;
};

const triggerEvent = (el, eventName, customData) => {
  let event;

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
  return this;
};


const images = [];

const gallery = {
  addImage: (url, title) => {
    images.push({ url, title });
  },
  loadImage: () => {
    // empty
  },
  show: () => {
    // empty
  },
  hide: () => {
    // empty
  },
};

ready(() => {
  const $lightbox = document.getElementById('lightbox');
  if (!$lightbox) {
    return;
  }
  const $overlay = document.getElementById('lightboxOverlay');
  const $image = $lightbox.querySelector('.lb-image');
  const $outerContainer = $lightbox.querySelector('.lb-outerContainer');
  const $loader = $lightbox.querySelector('.lb-loader');
  const $modalclose = $lightbox.querySelector('.lb-close');
  const $caption = $lightbox.querySelector('.lb-caption');
  const $albumlabel = $lightbox.querySelector('.lb-number');
  const $next = $lightbox.querySelector('.lb-next');
  const $prev = $lightbox.querySelector('.lb-prev');
  let current = 0;
  let _imgReady = true;

  const nextImg = () => {
    if (!_imgReady) {
      return;
    }
    current++;
    loadImage(current);
  };

  const prevImg = () => {
    if (!_imgReady) {
      return;
    }
    current--;
    current = current < 0 ? images.length - 1 : current;
    loadImage(current);
  };

  $next.addEventListener('click', () => nextImg());
  $prev.addEventListener('click', () => prevImg());

  const keyHandler = (ev) => {
    if (ev.code === 'ArrowLeft') {
      prevImg();
    } else if (ev.code === 'ArrowRight') {
      nextImg();
    } else if (ev.code === 'Escape') {
      gallery.hide();
    }
  };

  $modalclose.addEventListener('click', () => {
    gallery.hide();
  });
  $overlay.addEventListener('click', () => {
    gallery.hide();
  });

  const preloadImages = [];

  const loadImage = (n) => {
    if (!_imgReady) {
      return;
    }
    _imgReady = false;
    current = n % images.length;
    const img = images[current];
    const preloader = preloadImages[current] || new Image();
    removeClass($image, 'lightbox__fadein');
    $loader.style.display = 'block';
    preloader.onerror = () => {
      _imgReady = true;
      preloadImages[current] = null;
      $loader.style.display = 'none';
      $caption.innerText = 'Error while loading the image.';
    };

    preloader.onload = () => {
      triggerEvent(document, 'lightbox-change', [current]);
      css($outerContainer, 'width', `${preloader.width + 8}px`);
      css($outerContainer, 'height', `${preloader.height + 8}px`);

      setTimeout(() => {
        attr($image, 'src', img.url);
        addClass($image, 'lightbox__fadein');
        $albumlabel.innerText = `Image ${current + 1} of ${images.length}`;
        $caption.innerText = img.title ? img.title : '';
        setTimeout(() => {
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

  gallery.show = (n = current) => {
    document.addEventListener('keyup', keyHandler);
    triggerEvent(document, 'lightbox-open');
    loadImage(parseInt(n, 10));

    setTimeout(() => {
      addClass($lightbox, 'lightbox__fadein');
    }, 1);
    $overlay.style.display = 'block';
    $lightbox.style.display = 'block';
  };

  gallery.hide = () => {
    document.removeEventListener('keyup', keyHandler);
    triggerEvent(document, 'lightbox-close');
    removeClass($lightbox, 'lightbox__fadein');
    $overlay.style.display = 'none';
    $lightbox.style.display = 'none';
  };
});

module.exports = gallery;
