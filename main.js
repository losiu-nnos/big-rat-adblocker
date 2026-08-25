// ==UserScript==
// @name         big rat = no ad
// @namespace    http://tampermonkey.net/
// @version      v1.0
// @description  biig rat
// @author       iunno
// @match        *://*/*
// @exclude https://www.google.com/recaptcha/*
// @exclude https://recaptcha.net/recaptcha/*
// @exclude https://www.recaptcha.net/recaptcha/*
// @exclude https://api2.recaptcha.net/*
// @exclude https://hcaptcha.com/*
// @exclude https://www.hcaptcha.com/*
// @exclude https://newassets.hcaptcha.com/*
// @exclude https://imgs.hcaptcha.com/*
// @exclude https://js.hcaptcha.com/*
// @exclude https://api.hcaptcha.com/*
// @exclude https://accounts.hcaptcha.com/*
// @exclude https://funcaptcha.com/*
// @exclude https://www.funcaptcha.com/*
// @exclude https://client-api.arkoselabs.com/*
// @exclude https://api.funcaptcha.com/*
// @exclude https://roblox-api.arkoselabs.com/*
// @exclude https://iframe.arkoselabs.com/*
// @exclude https://turnstile.cloudflare.com/*
// @exclude https://challenges.cloudflare.com/*
// @exclude https://captcha.qcloud.com/*
// @exclude https://geo.captcha-delivery.com/*
// @exclude https://capgoo.com/*
// @exclude https://api.capmonster.cloud/*
// @exclude https://2captcha.com/*
// @exclude https://www.2captcha.com/*
// @exclude https://anti-captcha.com/*
// @exclude https://captcha.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const bigrat = 'https://bigrat.monster/media/bigrat_full.jpg';
  const blacklist = 'https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt';

  function looksLikeAd(el) {
    const attrs = [
      el.id,
      typeof el.className === 'string' ? el.className : '',
      el.getAttribute('alt'),
      el.getAttribute('aria-label'),
      el.getAttribute('title'),
      el.getAttribute('name'),
      el.getAttribute('role'),
      el.getAttribute('src'),
      el.getAttribute('href'),
      el.getAttribute('action'),
      el.getAttribute('target'),
      el.getAttribute('slot'),
      el.getAttribute('type'),
      el.getAttribute('content'),
      el.getAttribute('data-testid'),
      el.getAttribute('data-cy'),
      el.getAttribute('data-test'),
      ...Array.from(el.attributes)
        .filter(a => a.name.startsWith('data-'))
        .map(a => `${a.name}=${a.value}`),
      ...[
        'data-ad', 'data-ads', 'data-advert', 'data-advertisement',
        'data-advertising', 'data-adunit', 'data-ad-unit', 'data-ad-slot',
        'data-ad-client', 'data-ad-format', 'data-ad-type', 'data-ad-size',
        'data-ad-id', 'data-ad-name', 'data-ad-position', 'data-ad-placement',
        'data-ad-provider', 'data-ad-network', 'data-advertiser',
        'data-sponsored', 'data-sponsor', 'data-promo', 'data-promoted',
        'data-placement', 'data-zone', 'data-slot', 'data-unit',
        'data-bid', 'data-bidding', 'data-auction',
        'data-google-query-id', 'data-google-ad', 'data-google-ad-slot',
        'data-google-ad-client', 'data-gpt', 'data-dfp', 'data-prebid',
        'data-adform', 'data-criteo', 'data-taboola', 'data-outbrain',
        'data-mgid', 'data-yandex', 'data-amazon-ad', 'data-amazon-ads',
      ].map(x => el.getAttribute(x)),
    ].filter(Boolean);

    const text = attrs.join(' ');

    const adPatterns = [
      /\bad(s|vert|vertisement|vertising)?\b/i,
      /\bad[-_ ]?(slot|unit|container|wrapper|banner|box|frame|block)\b/i,
      /\b(advert|advertisement|advertising|advertiser)\b/i,
      /\bsponsored\b/i,
      /\bpromoted\b/i,
      /\bpromo[-_ ]?(content|box|banner)\b/i,
      /\bbanner[-_ ]?ad\b/i,
      /\bdoubleclick\b/i,
      /\bgooglesyndication\b/i,
      /\bgoogleadservices\b/i,
      /\badservice\b/i,
      /\badserver\b/i,
      /\badnxs\b/i,
      /\badsrvr\b/i,
      /\bappnexus\b/i,
      /\bopenx\b/i,
      /\bpubmatic\b/i,
      /\bprebid\b/i,
      /\bcriteo\b/i,
      /\btaboola\b/i,
      /\boutbrain\b/i,
      /\bmgid\b/i,
      /\bmedia\.net\b/i,
      /\badform\b/i,
      /\bamazonads\b/i,
      /\badsense\b/i,
      /\bgoogletagservices\b/i,
      /\bgoogletagmanager\b/i,
      /(^|[-_])ad([-_]|$)/i,
      /(^|[-_])ads([-_]|$)/i,
      /(^|[-_])advert([-_]|$)/i,
      /(^|[-_])sponsor(ed)?([-_]|$)/i,
      /(^|[-_])promotion([-_]|$)/i,
      /(^|[-_])commercial([-_]|$)/i,
    ];

    return adPatterns.some(p => p.test(text));
  }

  const blockedDomains = new Set();
  let listReady = false;
  const pendingElements = [];

  function getHostname(url) {
    try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); }
    catch { return null; }
  }

  function isDomainBlocked(url) {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return false;
    const host = getHostname(url);
    if (!host) return false;
    const parts = host.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      if (blockedDomains.has(parts.slice(i).join('.'))) return true;
    }
    return false;
  }

  function makeRat(el) {
    const rat = document.createElement('img');
    rat.src = bigrat;
    rat._ratified = true;
    const cs = window.getComputedStyle(el);
    const w = el.getAttribute('width')  || cs.width  || '100%';
    const h = el.getAttribute('height') || cs.height || '100%';
    rat.style.cssText = `width:${w};height:${h};object-fit:contain;display:block;visibility:visible;opacity:1;`;
    return rat;
  }

  function ratify(el) {
    if (el._ratified) return;
    el._ratified = true;

    const tag = el.tagName.toLowerCase();

    if (tag === 'img') {
      el.src = bigrat;
      el.srcset = '';
      ['srcset', 'data-src', 'data-lazy-src', 'data-original'].forEach(a => el.removeAttribute(a));
      el.style.cssText += ';display:block!important;visibility:visible!important;opacity:1!important;';

    } else if (tag === 'iframe' || tag === 'video') {
      el.parentNode && el.parentNode.replaceChild(makeRat(el), el);

    } else {
      el.innerHTML = '';
      const rat = document.createElement('img');
      rat.src = bigrat;
      rat._ratified = true;
      rat.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;visibility:visible;opacity:1;';
      el.appendChild(rat);
    }
  }

  function checkElement(el) {
    if (!el || !el.tagName || el._ratified) return;

    const src = el.src
      || el.getAttribute('data-src')
      || el.getAttribute('data-lazy-src')
      || el.getAttribute('data-original')
      || '';

    if ((src && isDomainBlocked(src)) || looksLikeAd(el)) {
      ratify(el);
    }
  }

  function sweep(root) {
    (root || document)
      .querySelectorAll('img, iframe, video, div, section, aside, figure, span, ins')
      .forEach(checkElement);
  }

  function drainQueue() {
    pendingElements.forEach(checkElement);
    pendingElements.length = 0;
    sweep();
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        listReady ? checkElement(node) : pendingElements.push(node);
        node.querySelectorAll &&
          node.querySelectorAll('img, iframe, video, div, section, aside, ins').forEach(el =>
            listReady ? checkElement(el) : pendingElements.push(el)
          );
      }
      if (mutation.type === 'attributes') {
        listReady ? checkElement(mutation.target) : pendingElements.push(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-src', 'data-lazy-src', 'data-original', 'class', 'id', 'alt'],
  });

  function interceptSrc(proto, prop) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc || !desc.set) return;
    Object.defineProperty(proto, prop, {
      get: desc.get,
      set(value) {
        if (listReady && (isDomainBlocked(value) || looksLikeAd(this))) {
          desc.set.call(this, '');
          ratify(this);
        } else {
          desc.set.call(this, value);
          if (!this._ratified) listReady ? checkElement(this) : pendingElements.push(this);
        }
      },
      configurable: true,
    });
  }

  interceptSrc(HTMLImageElement.prototype, 'src');
  interceptSrc(HTMLIFrameElement.prototype, 'src');

  function parseBlacklist(text) {
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/\s+/);
      const domain = (parts.length >= 2 ? parts[1] : parts[0]).toLowerCase();
      if (domain && domain !== 'localhost' && !domain.startsWith('#'))
        blockedDomains.add(domain.replace(/^www\./, ''));
    }
    listReady = true;
    console.log(`[BigRat] ${blockedDomains.size} blocked domains + keyword heuristics active 🐀`);
    drainQueue();
  }

  GM_xmlhttpRequest({
    method: 'GET',
    url: blacklist,
    onload(res) {
      if (res.status === 200) parseBlacklist(res.responseText);
      else console.warn('[BigRat] Blacklist fetch failed:', res.status);
    },
    onerror() { console.warn('[BigRat] Network error fetching blacklist.'); },
  });

  document.addEventListener('DOMContentLoaded', () => { if (listReady) sweep(); });
  window.addEventListener('load', () => { if (listReady) sweep(); });

})();
