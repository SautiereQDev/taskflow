'use strict';
(() => {
  // node_modules/htmx.org/dist/htmx.esm.js
  var htmx2 = (function () {
    'use strict';
    const htmx = {
      // Tsc madness here, assigning the functions directly results in an invalid TypeScript output, but reassigning is fine
      /* Event processing */
      /** @type {typeof onLoadHelper} */
      onLoad: null,
      /** @type {typeof processNode} */
      process: null,
      /** @type {typeof addEventListenerImpl} */
      on: null,
      /** @type {typeof removeEventListenerImpl} */
      off: null,
      /** @type {typeof triggerEvent} */
      trigger: null,
      /** @type {typeof ajaxHelper} */
      ajax: null,
      /* DOM querying helpers */
      /** @type {typeof find} */
      find: null,
      /** @type {typeof findAll} */
      findAll: null,
      /** @type {typeof closest} */
      closest: null,
      /**
       * Returns the input values that would resolve for a given element via the htmx value resolution mechanism
       *
       * @see https://htmx.org/api/#values
       *
       * @param {Element} elt the element to resolve values on
       * @param {HttpVerb} type the request type (e.g. **get** or **post**) non-GET's will include the enclosing form of the element. Defaults to **post**
       * @returns {Object}
       */
      values: function (elt, type) {
        const inputValues = getInputValues(elt, type || 'post');
        return inputValues.values;
      },
      /* DOM manipulation helpers */
      /** @type {typeof removeElement} */
      remove: null,
      /** @type {typeof addClassToElement} */
      addClass: null,
      /** @type {typeof removeClassFromElement} */
      removeClass: null,
      /** @type {typeof toggleClassOnElement} */
      toggleClass: null,
      /** @type {typeof takeClassForElement} */
      takeClass: null,
      /** @type {typeof swap} */
      swap: null,
      /* Extension entrypoints */
      /** @type {typeof defineExtension} */
      defineExtension: null,
      /** @type {typeof removeExtension} */
      removeExtension: null,
      /* Debugging */
      /** @type {typeof logAll} */
      logAll: null,
      /** @type {typeof logNone} */
      logNone: null,
      /* Debugging */
      /**
       * The logger htmx uses to log with
       *
       * @see https://htmx.org/api/#logger
       */
      logger: null,
      /**
       * A property holding the configuration htmx uses at runtime.
       *
       * Note that using a [meta tag](https://htmx.org/docs/#config) is the preferred mechanism for setting these properties.
       *
       * @see https://htmx.org/api/#config
       */
      config: {
        /**
         * Whether to use history.
         * @type boolean
         * @default true
         */
        historyEnabled: true,
        /**
         * The number of pages to keep in **sessionStorage** for history support.
         * @type number
         * @default 10
         */
        historyCacheSize: 10,
        /**
         * @type boolean
         * @default false
         */
        refreshOnHistoryMiss: false,
        /**
         * The default swap style to use if **[hx-swap](https://htmx.org/attributes/hx-swap)** is omitted.
         * @type HtmxSwapStyle
         * @default 'innerHTML'
         */
        defaultSwapStyle: 'innerHTML',
        /**
         * The default delay between receiving a response from the server and doing the swap.
         * @type number
         * @default 0
         */
        defaultSwapDelay: 0,
        /**
         * The default delay between completing the content swap and settling attributes.
         * @type number
         * @default 20
         */
        defaultSettleDelay: 20,
        /**
         * If true, htmx will inject a small amount of CSS into the page to make indicators invisible unless the **htmx-indicator** class is present.
         * @type boolean
         * @default true
         */
        includeIndicatorStyles: true,
        /**
         * The class to place on indicators when a request is in flight.
         * @type string
         * @default 'htmx-indicator'
         */
        indicatorClass: 'htmx-indicator',
        /**
         * The class to place on triggering elements when a request is in flight.
         * @type string
         * @default 'htmx-request'
         */
        requestClass: 'htmx-request',
        /**
         * The class to temporarily place on elements that htmx has added to the DOM.
         * @type string
         * @default 'htmx-added'
         */
        addedClass: 'htmx-added',
        /**
         * The class to place on target elements when htmx is in the settling phase.
         * @type string
         * @default 'htmx-settling'
         */
        settlingClass: 'htmx-settling',
        /**
         * The class to place on target elements when htmx is in the swapping phase.
         * @type string
         * @default 'htmx-swapping'
         */
        swappingClass: 'htmx-swapping',
        /**
         * Allows the use of eval-like functionality in htmx, to enable **hx-vars**, trigger conditions & script tag evaluation. Can be set to **false** for CSP compatibility.
         * @type boolean
         * @default true
         */
        allowEval: true,
        /**
         * If set to false, disables the interpretation of script tags.
         * @type boolean
         * @default true
         */
        allowScriptTags: true,
        /**
         * If set, the nonce will be added to inline scripts.
         * @type string
         * @default ''
         */
        inlineScriptNonce: '',
        /**
         * If set, the nonce will be added to inline styles.
         * @type string
         * @default ''
         */
        inlineStyleNonce: '',
        /**
         * The attributes to settle during the settling phase.
         * @type string[]
         * @default ['class', 'style', 'width', 'height']
         */
        attributesToSettle: ['class', 'style', 'width', 'height'],
        /**
         * Allow cross-site Access-Control requests using credentials such as cookies, authorization headers or TLS client certificates.
         * @type boolean
         * @default false
         */
        withCredentials: false,
        /**
         * @type number
         * @default 0
         */
        timeout: 0,
        /**
         * The default implementation of **getWebSocketReconnectDelay** for reconnecting after unexpected connection loss by the event code **Abnormal Closure**, **Service Restart** or **Try Again Later**.
         * @type {'full-jitter' | ((retryCount:number) => number)}
         * @default "full-jitter"
         */
        wsReconnectDelay: 'full-jitter',
        /**
         * The type of binary data being received over the WebSocket connection
         * @type BinaryType
         * @default 'blob'
         */
        wsBinaryType: 'blob',
        /**
         * @type string
         * @default '[hx-disable], [data-hx-disable]'
         */
        disableSelector: '[hx-disable], [data-hx-disable]',
        /**
         * @type {'auto' | 'instant' | 'smooth'}
         * @default 'instant'
         */
        scrollBehavior: 'instant',
        /**
         * If the focused element should be scrolled into view.
         * @type boolean
         * @default false
         */
        defaultFocusScroll: false,
        /**
         * If set to true htmx will include a cache-busting parameter in GET requests to avoid caching partial responses by the browser
         * @type boolean
         * @default false
         */
        getCacheBusterParam: false,
        /**
         * If set to true, htmx will use the View Transition API when swapping in new content.
         * @type boolean
         * @default false
         */
        globalViewTransitions: false,
        /**
         * htmx will format requests with these methods by encoding their parameters in the URL, not the request body
         * @type {(HttpVerb)[]}
         * @default ['get', 'delete']
         */
        methodsThatUseUrlParams: ['get', 'delete'],
        /**
         * If set to true, disables htmx-based requests to non-origin hosts.
         * @type boolean
         * @default false
         */
        selfRequestsOnly: true,
        /**
         * If set to true htmx will not update the title of the document when a title tag is found in new content
         * @type boolean
         * @default false
         */
        ignoreTitle: false,
        /**
         * Whether the target of a boosted element is scrolled into the viewport.
         * @type boolean
         * @default true
         */
        scrollIntoViewOnBoost: true,
        /**
         * The cache to store evaluated trigger specifications into.
         * You may define a simple object to use a never-clearing cache, or implement your own system using a [proxy object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
         * @type {Object|null}
         * @default null
         */
        triggerSpecsCache: null,
        /** @type boolean */
        disableInheritance: false,
        /** @type HtmxResponseHandlingConfig[] */
        responseHandling: [
          { code: '204', swap: false },
          { code: '[23]..', swap: true },
          { code: '[45]..', swap: false, error: true },
        ],
        /**
         * Whether to process OOB swaps on elements that are nested within the main response element.
         * @type boolean
         * @default true
         */
        allowNestedOobSwaps: true,
        /**
         * Whether to treat history cache miss full page reload requests as a "HX-Request" by returning this response header
         * This should always be disabled when using HX-Request header to optionally return partial responses
         * @type boolean
         * @default true
         */
        historyRestoreAsHxRequest: true,
        /**
         * Weather to report input validation errors to the end user and update focus to the first input that fails validation.
         * This should always be enabled as this matches default browser form submit behaviour
         * @type boolean
         * @default false
         */
        reportValidityOfForms: false,
      },
      /** @type {typeof parseInterval} */
      parseInterval: null,
      /**
       * proxy of window.location used for page reload functions
       * @type location
       */
      location,
      /** @type {typeof internalEval} */
      _: null,
      version: '2.0.7',
    };
    htmx.onLoad = onLoadHelper;
    htmx.process = processNode;
    htmx.on = addEventListenerImpl;
    htmx.off = removeEventListenerImpl;
    htmx.trigger = triggerEvent;
    htmx.ajax = ajaxHelper;
    htmx.find = find;
    htmx.findAll = findAll;
    htmx.closest = closest;
    htmx.remove = removeElement;
    htmx.addClass = addClassToElement;
    htmx.removeClass = removeClassFromElement;
    htmx.toggleClass = toggleClassOnElement;
    htmx.takeClass = takeClassForElement;
    htmx.swap = swap;
    htmx.defineExtension = defineExtension;
    htmx.removeExtension = removeExtension;
    htmx.logAll = logAll;
    htmx.logNone = logNone;
    htmx.parseInterval = parseInterval;
    htmx._ = internalEval;
    const internalAPI = {
      addTriggerHandler,
      bodyContains,
      canAccessLocalStorage,
      findThisElement,
      filterValues,
      swap,
      hasAttribute,
      getAttributeValue,
      getClosestAttributeValue,
      getClosestMatch,
      getExpressionVars,
      getHeaders,
      getInputValues,
      getInternalData,
      getSwapSpecification,
      getTriggerSpecs,
      getTarget,
      makeFragment,
      mergeObjects,
      makeSettleInfo,
      oobSwap,
      querySelectorExt,
      settleImmediately,
      shouldCancel,
      triggerEvent,
      triggerErrorEvent,
      withExtensions,
    };
    const VERBS = ['get', 'post', 'put', 'delete', 'patch'];
    const VERB_SELECTOR = VERBS.map(function (verb) {
      return '[hx-' + verb + '], [data-hx-' + verb + ']';
    }).join(', ');
    function parseInterval(str2) {
      if (str2 == void 0) {
        return void 0;
      }
      let interval = NaN;
      if (str2.slice(-2) == 'ms') {
        interval = parseFloat(str2.slice(0, -2));
      } else if (str2.slice(-1) == 's') {
        interval = parseFloat(str2.slice(0, -1)) * 1e3;
      } else if (str2.slice(-1) == 'm') {
        interval = parseFloat(str2.slice(0, -1)) * 1e3 * 60;
      } else {
        interval = parseFloat(str2);
      }
      return isNaN(interval) ? void 0 : interval;
    }
    function getRawAttribute(elt, name) {
      return elt instanceof Element && elt.getAttribute(name);
    }
    function hasAttribute(elt, qualifiedName) {
      return (
        !!elt.hasAttribute &&
        (elt.hasAttribute(qualifiedName) || elt.hasAttribute('data-' + qualifiedName))
      );
    }
    function getAttributeValue(elt, qualifiedName) {
      return getRawAttribute(elt, qualifiedName) || getRawAttribute(elt, 'data-' + qualifiedName);
    }
    function parentElt(elt) {
      const parent = elt.parentElement;
      if (!parent && elt.parentNode instanceof ShadowRoot) return elt.parentNode;
      return parent;
    }
    function getDocument() {
      return document;
    }
    function getRootNode(elt, global) {
      return elt.getRootNode ? elt.getRootNode({ composed: global }) : getDocument();
    }
    function getClosestMatch(elt, condition) {
      while (elt && !condition(elt)) {
        elt = parentElt(elt);
      }
      return elt || null;
    }
    function getAttributeValueWithDisinheritance(initialElement, ancestor, attributeName) {
      const attributeValue = getAttributeValue(ancestor, attributeName);
      const disinherit = getAttributeValue(ancestor, 'hx-disinherit');
      var inherit = getAttributeValue(ancestor, 'hx-inherit');
      if (initialElement !== ancestor) {
        if (htmx.config.disableInheritance) {
          if (inherit && (inherit === '*' || inherit.split(' ').indexOf(attributeName) >= 0)) {
            return attributeValue;
          } else {
            return null;
          }
        }
        if (
          disinherit &&
          (disinherit === '*' || disinherit.split(' ').indexOf(attributeName) >= 0)
        ) {
          return 'unset';
        }
      }
      return attributeValue;
    }
    function getClosestAttributeValue(elt, attributeName) {
      let closestAttr = null;
      getClosestMatch(elt, function (e) {
        return !!(closestAttr = getAttributeValueWithDisinheritance(
          elt,
          asElement(e),
          attributeName
        ));
      });
      if (closestAttr !== 'unset') {
        return closestAttr;
      }
    }
    function matches(elt, selector) {
      return elt instanceof Element && elt.matches(selector);
    }
    function getStartTag(str2) {
      const tagMatcher = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
      const match = tagMatcher.exec(str2);
      if (match) {
        return match[1].toLowerCase();
      } else {
        return '';
      }
    }
    function parseHTML(resp) {
      const parser = new DOMParser();
      return parser.parseFromString(resp, 'text/html');
    }
    function takeChildrenFor(fragment, elt) {
      while (elt.childNodes.length > 0) {
        fragment.append(elt.childNodes[0]);
      }
    }
    function duplicateScript(script) {
      const newScript = getDocument().createElement('script');
      forEach(script.attributes, function (attr) {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = script.textContent;
      newScript.async = false;
      if (htmx.config.inlineScriptNonce) {
        newScript.nonce = htmx.config.inlineScriptNonce;
      }
      return newScript;
    }
    function isJavaScriptScriptNode(script) {
      return (
        script.matches('script') &&
        (script.type === 'text/javascript' || script.type === 'module' || script.type === '')
      );
    }
    function normalizeScriptTags(fragment) {
      Array.from(fragment.querySelectorAll('script')).forEach(
        /** @param {HTMLScriptElement} script */
        (script) => {
          if (isJavaScriptScriptNode(script)) {
            const newScript = duplicateScript(script);
            const parent = script.parentNode;
            try {
              parent.insertBefore(newScript, script);
            } catch (e) {
              logError(e);
            } finally {
              script.remove();
            }
          }
        }
      );
    }
    function makeFragment(response) {
      const responseWithNoHead = response.replace(/<head(\s[^>]*)?>[\s\S]*?<\/head>/i, '');
      const startTag = getStartTag(responseWithNoHead);
      let fragment;
      if (startTag === 'html') {
        fragment = /** @type DocumentFragmentWithTitle */ new DocumentFragment();
        const doc = parseHTML(response);
        takeChildrenFor(fragment, doc.body);
        fragment.title = doc.title;
      } else if (startTag === 'body') {
        fragment = /** @type DocumentFragmentWithTitle */ new DocumentFragment();
        const doc = parseHTML(responseWithNoHead);
        takeChildrenFor(fragment, doc.body);
        fragment.title = doc.title;
      } else {
        const doc = parseHTML(
          '<body><template class="internal-htmx-wrapper">' +
            responseWithNoHead +
            '</template></body>'
        );
        fragment = /** @type DocumentFragmentWithTitle */ doc.querySelector('template').content;
        fragment.title = doc.title;
        var titleElement = fragment.querySelector('title');
        if (titleElement && titleElement.parentNode === fragment) {
          titleElement.remove();
          fragment.title = titleElement.innerText;
        }
      }
      if (fragment) {
        if (htmx.config.allowScriptTags) {
          normalizeScriptTags(fragment);
        } else {
          fragment.querySelectorAll('script').forEach((script) => script.remove());
        }
      }
      return fragment;
    }
    function maybeCall(func) {
      if (func) {
        func();
      }
    }
    function isType(o, type) {
      return Object.prototype.toString.call(o) === '[object ' + type + ']';
    }
    function isFunction(o) {
      return typeof o === 'function';
    }
    function isRawObject(o) {
      return isType(o, 'Object');
    }
    function getInternalData(elt) {
      const dataProp = 'htmx-internal-data';
      let data = elt[dataProp];
      if (!data) {
        data = elt[dataProp] = {};
      }
      return data;
    }
    function toArray(arr) {
      const returnArr = [];
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          returnArr.push(arr[i]);
        }
      }
      return returnArr;
    }
    function forEach(arr, func) {
      if (arr) {
        for (let i = 0; i < arr.length; i++) {
          func(arr[i]);
        }
      }
    }
    function isScrolledIntoView(el) {
      const rect = el.getBoundingClientRect();
      const elemTop = rect.top;
      const elemBottom = rect.bottom;
      return elemTop < window.innerHeight && elemBottom >= 0;
    }
    function bodyContains(elt) {
      return elt.getRootNode({ composed: true }) === document;
    }
    function splitOnWhitespace(trigger) {
      return trigger.trim().split(/\s+/);
    }
    function mergeObjects(obj1, obj2) {
      for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
          obj1[key] = obj2[key];
        }
      }
      return obj1;
    }
    function parseJSON(jString) {
      try {
        return JSON.parse(jString);
      } catch (error) {
        logError(error);
        return null;
      }
    }
    function canAccessLocalStorage() {
      const test = 'htmx:sessionStorageTest';
      try {
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
    function normalizePath(path) {
      const url = new URL(path, 'http://x');
      if (url) {
        path = url.pathname + url.search;
      }
      if (path != '/') {
        path = path.replace(/\/+$/, '');
      }
      return path;
    }
    function internalEval(str) {
      return maybeEval(getDocument().body, function () {
        return eval(str);
      });
    }
    function onLoadHelper(callback) {
      const value = htmx.on(
        'htmx:load',
        /** @param {CustomEvent} evt */
        function (evt) {
          callback(evt.detail.elt);
        }
      );
      return value;
    }
    function logAll() {
      htmx.logger = function (elt, event, data) {
        if (console) {
          console.log(event, elt, data);
        }
      };
    }
    function logNone() {
      htmx.logger = null;
    }
    function find(eltOrSelector, selector) {
      if (typeof eltOrSelector !== 'string') {
        return eltOrSelector.querySelector(selector);
      } else {
        return find(getDocument(), eltOrSelector);
      }
    }
    function findAll(eltOrSelector, selector) {
      if (typeof eltOrSelector !== 'string') {
        return eltOrSelector.querySelectorAll(selector);
      } else {
        return findAll(getDocument(), eltOrSelector);
      }
    }
    function getWindow() {
      return window;
    }
    function removeElement(elt, delay) {
      elt = resolveTarget(elt);
      if (delay) {
        getWindow().setTimeout(function () {
          removeElement(elt);
          elt = null;
        }, delay);
      } else {
        parentElt(elt).removeChild(elt);
      }
    }
    function asElement(elt) {
      return elt instanceof Element ? elt : null;
    }
    function asHtmlElement(elt) {
      return elt instanceof HTMLElement ? elt : null;
    }
    function asString(value) {
      return typeof value === 'string' ? value : null;
    }
    function asParentNode(elt) {
      return elt instanceof Element || elt instanceof Document || elt instanceof DocumentFragment
        ? elt
        : null;
    }
    function addClassToElement(elt, clazz, delay) {
      elt = asElement(resolveTarget(elt));
      if (!elt) {
        return;
      }
      if (delay) {
        getWindow().setTimeout(function () {
          addClassToElement(elt, clazz);
          elt = null;
        }, delay);
      } else {
        elt.classList && elt.classList.add(clazz);
      }
    }
    function removeClassFromElement(node, clazz, delay) {
      let elt = asElement(resolveTarget(node));
      if (!elt) {
        return;
      }
      if (delay) {
        getWindow().setTimeout(function () {
          removeClassFromElement(elt, clazz);
          elt = null;
        }, delay);
      } else {
        if (elt.classList) {
          elt.classList.remove(clazz);
          if (elt.classList.length === 0) {
            elt.removeAttribute('class');
          }
        }
      }
    }
    function toggleClassOnElement(elt, clazz) {
      elt = resolveTarget(elt);
      elt.classList.toggle(clazz);
    }
    function takeClassForElement(elt, clazz) {
      elt = resolveTarget(elt);
      forEach(elt.parentElement.children, function (child) {
        removeClassFromElement(child, clazz);
      });
      addClassToElement(asElement(elt), clazz);
    }
    function closest(elt, selector) {
      elt = asElement(resolveTarget(elt));
      if (elt) {
        return elt.closest(selector);
      }
      return null;
    }
    function startsWith(str2, prefix) {
      return str2.substring(0, prefix.length) === prefix;
    }
    function endsWith(str2, suffix) {
      return str2.substring(str2.length - suffix.length) === suffix;
    }
    function normalizeSelector(selector) {
      const trimmedSelector = selector.trim();
      if (startsWith(trimmedSelector, '<') && endsWith(trimmedSelector, '/>')) {
        return trimmedSelector.substring(1, trimmedSelector.length - 2);
      } else {
        return trimmedSelector;
      }
    }
    function querySelectorAllExt(elt, selector, global) {
      if (selector.indexOf('global ') === 0) {
        return querySelectorAllExt(elt, selector.slice(7), true);
      }
      elt = resolveTarget(elt);
      const parts = [];
      {
        let chevronsCount = 0;
        let offset = 0;
        for (let i = 0; i < selector.length; i++) {
          const char = selector[i];
          if (char === ',' && chevronsCount === 0) {
            parts.push(selector.substring(offset, i));
            offset = i + 1;
            continue;
          }
          if (char === '<') {
            chevronsCount++;
          } else if (char === '/' && i < selector.length - 1 && selector[i + 1] === '>') {
            chevronsCount--;
          }
        }
        if (offset < selector.length) {
          parts.push(selector.substring(offset));
        }
      }
      const result = [];
      const unprocessedParts = [];
      while (parts.length > 0) {
        const selector2 = normalizeSelector(parts.shift());
        let item;
        if (selector2.indexOf('closest ') === 0) {
          item = closest(asElement(elt), normalizeSelector(selector2.slice(8)));
        } else if (selector2.indexOf('find ') === 0) {
          item = find(asParentNode(elt), normalizeSelector(selector2.slice(5)));
        } else if (selector2 === 'next' || selector2 === 'nextElementSibling') {
          item = asElement(elt).nextElementSibling;
        } else if (selector2.indexOf('next ') === 0) {
          item = scanForwardQuery(elt, normalizeSelector(selector2.slice(5)), !!global);
        } else if (selector2 === 'previous' || selector2 === 'previousElementSibling') {
          item = asElement(elt).previousElementSibling;
        } else if (selector2.indexOf('previous ') === 0) {
          item = scanBackwardsQuery(elt, normalizeSelector(selector2.slice(9)), !!global);
        } else if (selector2 === 'document') {
          item = document;
        } else if (selector2 === 'window') {
          item = window;
        } else if (selector2 === 'body') {
          item = document.body;
        } else if (selector2 === 'root') {
          item = getRootNode(elt, !!global);
        } else if (selector2 === 'host') {
          item = /** @type ShadowRoot */ elt.getRootNode().host;
        } else {
          unprocessedParts.push(selector2);
        }
        if (item) {
          result.push(item);
        }
      }
      if (unprocessedParts.length > 0) {
        const standardSelector = unprocessedParts.join(',');
        const rootNode = asParentNode(getRootNode(elt, !!global));
        result.push(...toArray(rootNode.querySelectorAll(standardSelector)));
      }
      return result;
    }
    var scanForwardQuery = function (start, match, global) {
      const results = asParentNode(getRootNode(start, global)).querySelectorAll(match);
      for (let i = 0; i < results.length; i++) {
        const elt = results[i];
        if (elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_PRECEDING) {
          return elt;
        }
      }
    };
    var scanBackwardsQuery = function (start, match, global) {
      const results = asParentNode(getRootNode(start, global)).querySelectorAll(match);
      for (let i = results.length - 1; i >= 0; i--) {
        const elt = results[i];
        if (elt.compareDocumentPosition(start) === Node.DOCUMENT_POSITION_FOLLOWING) {
          return elt;
        }
      }
    };
    function querySelectorExt(eltOrSelector, selector) {
      if (typeof eltOrSelector !== 'string') {
        return querySelectorAllExt(eltOrSelector, selector)[0];
      } else {
        return querySelectorAllExt(getDocument().body, eltOrSelector)[0];
      }
    }
    function resolveTarget(eltOrSelector, context) {
      if (typeof eltOrSelector === 'string') {
        return find(asParentNode(context) || document, eltOrSelector);
      } else {
        return eltOrSelector;
      }
    }
    function processEventArgs(arg1, arg2, arg3, arg4) {
      if (isFunction(arg2)) {
        return {
          target: getDocument().body,
          event: asString(arg1),
          listener: arg2,
          options: arg3,
        };
      } else {
        return {
          target: resolveTarget(arg1),
          event: asString(arg2),
          listener: arg3,
          options: arg4,
        };
      }
    }
    function addEventListenerImpl(arg1, arg2, arg3, arg4) {
      ready(function () {
        const eventArgs = processEventArgs(arg1, arg2, arg3, arg4);
        eventArgs.target.addEventListener(eventArgs.event, eventArgs.listener, eventArgs.options);
      });
      const b = isFunction(arg2);
      return b ? arg2 : arg3;
    }
    function removeEventListenerImpl(arg1, arg2, arg3) {
      ready(function () {
        const eventArgs = processEventArgs(arg1, arg2, arg3);
        eventArgs.target.removeEventListener(eventArgs.event, eventArgs.listener);
      });
      return isFunction(arg2) ? arg2 : arg3;
    }
    const DUMMY_ELT = getDocument().createElement('output');
    function findAttributeTargets(elt, attrName) {
      const attrTarget = getClosestAttributeValue(elt, attrName);
      if (attrTarget) {
        if (attrTarget === 'this') {
          return [findThisElement(elt, attrName)];
        } else {
          const result = querySelectorAllExt(elt, attrTarget);
          const shouldInherit = /(^|,)(\s*)inherit(\s*)($|,)/.test(attrTarget);
          if (shouldInherit) {
            const eltToInheritFrom = asElement(
              getClosestMatch(elt, function (parent) {
                return parent !== elt && hasAttribute(asElement(parent), attrName);
              })
            );
            if (eltToInheritFrom) {
              result.push(...findAttributeTargets(eltToInheritFrom, attrName));
            }
          }
          if (result.length === 0) {
            logError('The selector "' + attrTarget + '" on ' + attrName + ' returned no matches!');
            return [DUMMY_ELT];
          } else {
            return result;
          }
        }
      }
    }
    function findThisElement(elt, attribute) {
      return asElement(
        getClosestMatch(elt, function (elt2) {
          return getAttributeValue(asElement(elt2), attribute) != null;
        })
      );
    }
    function getTarget(elt) {
      const targetStr = getClosestAttributeValue(elt, 'hx-target');
      if (targetStr) {
        if (targetStr === 'this') {
          return findThisElement(elt, 'hx-target');
        } else {
          return querySelectorExt(elt, targetStr);
        }
      } else {
        const data = getInternalData(elt);
        if (data.boosted) {
          return getDocument().body;
        } else {
          return elt;
        }
      }
    }
    function shouldSettleAttribute(name) {
      return htmx.config.attributesToSettle.includes(name);
    }
    function cloneAttributes(mergeTo, mergeFrom) {
      forEach(Array.from(mergeTo.attributes), function (attr) {
        if (!mergeFrom.hasAttribute(attr.name) && shouldSettleAttribute(attr.name)) {
          mergeTo.removeAttribute(attr.name);
        }
      });
      forEach(mergeFrom.attributes, function (attr) {
        if (shouldSettleAttribute(attr.name)) {
          mergeTo.setAttribute(attr.name, attr.value);
        }
      });
    }
    function isInlineSwap(swapStyle, target) {
      const extensions2 = getExtensions(target);
      for (let i = 0; i < extensions2.length; i++) {
        const extension = extensions2[i];
        try {
          if (extension.isInlineSwap(swapStyle)) {
            return true;
          }
        } catch (e) {
          logError(e);
        }
      }
      return swapStyle === 'outerHTML';
    }
    function oobSwap(oobValue, oobElement, settleInfo, rootNode) {
      rootNode = rootNode || getDocument();
      let selector = '#' + CSS.escape(getRawAttribute(oobElement, 'id'));
      let swapStyle = 'outerHTML';
      if (oobValue === 'true') {
      } else if (oobValue.indexOf(':') > 0) {
        swapStyle = oobValue.substring(0, oobValue.indexOf(':'));
        selector = oobValue.substring(oobValue.indexOf(':') + 1);
      } else {
        swapStyle = oobValue;
      }
      oobElement.removeAttribute('hx-swap-oob');
      oobElement.removeAttribute('data-hx-swap-oob');
      const targets = querySelectorAllExt(rootNode, selector, false);
      if (targets.length) {
        forEach(targets, function (target) {
          let fragment;
          const oobElementClone = oobElement.cloneNode(true);
          fragment = getDocument().createDocumentFragment();
          fragment.appendChild(oobElementClone);
          if (!isInlineSwap(swapStyle, target)) {
            fragment = asParentNode(oobElementClone);
          }
          const beforeSwapDetails = { shouldSwap: true, target, fragment };
          if (!triggerEvent(target, 'htmx:oobBeforeSwap', beforeSwapDetails)) return;
          target = beforeSwapDetails.target;
          if (beforeSwapDetails.shouldSwap) {
            handlePreservedElements(fragment);
            swapWithStyle(swapStyle, target, target, fragment, settleInfo);
            restorePreservedElements();
          }
          forEach(settleInfo.elts, function (elt) {
            triggerEvent(elt, 'htmx:oobAfterSwap', beforeSwapDetails);
          });
        });
        oobElement.parentNode.removeChild(oobElement);
      } else {
        oobElement.parentNode.removeChild(oobElement);
        triggerErrorEvent(getDocument().body, 'htmx:oobErrorNoTarget', { content: oobElement });
      }
      return oobValue;
    }
    function restorePreservedElements() {
      const pantry = find('#--htmx-preserve-pantry--');
      if (pantry) {
        for (const preservedElt of [...pantry.children]) {
          const existingElement = find('#' + preservedElt.id);
          existingElement.parentNode.moveBefore(preservedElt, existingElement);
          existingElement.remove();
        }
        pantry.remove();
      }
    }
    function handlePreservedElements(fragment) {
      forEach(findAll(fragment, '[hx-preserve], [data-hx-preserve]'), function (preservedElt) {
        const id = getAttributeValue(preservedElt, 'id');
        const existingElement = getDocument().getElementById(id);
        if (existingElement != null) {
          if (preservedElt.moveBefore) {
            let pantry = find('#--htmx-preserve-pantry--');
            if (pantry == null) {
              getDocument().body.insertAdjacentHTML(
                'afterend',
                "<div id='--htmx-preserve-pantry--'></div>"
              );
              pantry = find('#--htmx-preserve-pantry--');
            }
            pantry.moveBefore(existingElement, null);
          } else {
            preservedElt.parentNode.replaceChild(existingElement, preservedElt);
          }
        }
      });
    }
    function handleAttributes(parentNode, fragment, settleInfo) {
      forEach(fragment.querySelectorAll('[id]'), function (newNode) {
        const id = getRawAttribute(newNode, 'id');
        if (id && id.length > 0) {
          const normalizedId = id.replace("'", "\\'");
          const normalizedTag = newNode.tagName.replace(':', '\\:');
          const parentElt2 = asParentNode(parentNode);
          const oldNode =
            parentElt2 && parentElt2.querySelector(normalizedTag + "[id='" + normalizedId + "']");
          if (oldNode && oldNode !== parentElt2) {
            const newAttributes = newNode.cloneNode();
            cloneAttributes(newNode, oldNode);
            settleInfo.tasks.push(function () {
              cloneAttributes(newNode, newAttributes);
            });
          }
        }
      });
    }
    function makeAjaxLoadTask(child) {
      return function () {
        removeClassFromElement(child, htmx.config.addedClass);
        processNode(asElement(child));
        processFocus(asParentNode(child));
        triggerEvent(child, 'htmx:load');
      };
    }
    function processFocus(child) {
      const autofocus = '[autofocus]';
      const autoFocusedElt = asHtmlElement(
        matches(child, autofocus) ? child : child.querySelector(autofocus)
      );
      if (autoFocusedElt != null) {
        autoFocusedElt.focus();
      }
    }
    function insertNodesBefore(parentNode, insertBefore, fragment, settleInfo) {
      handleAttributes(parentNode, fragment, settleInfo);
      while (fragment.childNodes.length > 0) {
        const child = fragment.firstChild;
        addClassToElement(asElement(child), htmx.config.addedClass);
        parentNode.insertBefore(child, insertBefore);
        if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
          settleInfo.tasks.push(makeAjaxLoadTask(child));
        }
      }
    }
    function stringHash(string, hash) {
      let char = 0;
      while (char < string.length) {
        hash = ((hash << 5) - hash + string.charCodeAt(char++)) | 0;
      }
      return hash;
    }
    function attributeHash(elt) {
      let hash = 0;
      for (let i = 0; i < elt.attributes.length; i++) {
        const attribute = elt.attributes[i];
        if (attribute.value) {
          hash = stringHash(attribute.name, hash);
          hash = stringHash(attribute.value, hash);
        }
      }
      return hash;
    }
    function deInitOnHandlers(elt) {
      const internalData = getInternalData(elt);
      if (internalData.onHandlers) {
        for (let i = 0; i < internalData.onHandlers.length; i++) {
          const handlerInfo = internalData.onHandlers[i];
          removeEventListenerImpl(elt, handlerInfo.event, handlerInfo.listener);
        }
        delete internalData.onHandlers;
      }
    }
    function deInitNode(element) {
      const internalData = getInternalData(element);
      if (internalData.timeout) {
        clearTimeout(internalData.timeout);
      }
      if (internalData.listenerInfos) {
        forEach(internalData.listenerInfos, function (info) {
          if (info.on) {
            removeEventListenerImpl(info.on, info.trigger, info.listener);
          }
        });
      }
      deInitOnHandlers(element);
      forEach(Object.keys(internalData), function (key) {
        if (key !== 'firstInitCompleted') delete internalData[key];
      });
    }
    function cleanUpElement(element) {
      triggerEvent(element, 'htmx:beforeCleanupElement');
      deInitNode(element);
      forEach(element.children, function (child) {
        cleanUpElement(child);
      });
    }
    function swapOuterHTML(target, fragment, settleInfo) {
      if (target.tagName === 'BODY') {
        return swapInnerHTML(target, fragment, settleInfo);
      }
      let newElt;
      const eltBeforeNewContent = target.previousSibling;
      const parentNode = parentElt(target);
      if (!parentNode) {
        return;
      }
      insertNodesBefore(parentNode, target, fragment, settleInfo);
      if (eltBeforeNewContent == null) {
        newElt = parentNode.firstChild;
      } else {
        newElt = eltBeforeNewContent.nextSibling;
      }
      settleInfo.elts = settleInfo.elts.filter(function (e) {
        return e !== target;
      });
      while (newElt && newElt !== target) {
        if (newElt instanceof Element) {
          settleInfo.elts.push(newElt);
        }
        newElt = newElt.nextSibling;
      }
      cleanUpElement(target);
      target.remove();
    }
    function swapAfterBegin(target, fragment, settleInfo) {
      return insertNodesBefore(target, target.firstChild, fragment, settleInfo);
    }
    function swapBeforeBegin(target, fragment, settleInfo) {
      return insertNodesBefore(parentElt(target), target, fragment, settleInfo);
    }
    function swapBeforeEnd(target, fragment, settleInfo) {
      return insertNodesBefore(target, null, fragment, settleInfo);
    }
    function swapAfterEnd(target, fragment, settleInfo) {
      return insertNodesBefore(parentElt(target), target.nextSibling, fragment, settleInfo);
    }
    function swapDelete(target) {
      cleanUpElement(target);
      const parent = parentElt(target);
      if (parent) {
        return parent.removeChild(target);
      }
    }
    function swapInnerHTML(target, fragment, settleInfo) {
      const firstChild = target.firstChild;
      insertNodesBefore(target, firstChild, fragment, settleInfo);
      if (firstChild) {
        while (firstChild.nextSibling) {
          cleanUpElement(firstChild.nextSibling);
          target.removeChild(firstChild.nextSibling);
        }
        cleanUpElement(firstChild);
        target.removeChild(firstChild);
      }
    }
    function swapWithStyle(swapStyle, elt, target, fragment, settleInfo) {
      switch (swapStyle) {
        case 'none':
          return;
        case 'outerHTML':
          swapOuterHTML(target, fragment, settleInfo);
          return;
        case 'afterbegin':
          swapAfterBegin(target, fragment, settleInfo);
          return;
        case 'beforebegin':
          swapBeforeBegin(target, fragment, settleInfo);
          return;
        case 'beforeend':
          swapBeforeEnd(target, fragment, settleInfo);
          return;
        case 'afterend':
          swapAfterEnd(target, fragment, settleInfo);
          return;
        case 'delete':
          swapDelete(target);
          return;
        default:
          var extensions2 = getExtensions(elt);
          for (let i = 0; i < extensions2.length; i++) {
            const ext = extensions2[i];
            try {
              const newElements = ext.handleSwap(swapStyle, target, fragment, settleInfo);
              if (newElements) {
                if (Array.isArray(newElements)) {
                  for (let j = 0; j < newElements.length; j++) {
                    const child = newElements[j];
                    if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
                      settleInfo.tasks.push(makeAjaxLoadTask(child));
                    }
                  }
                }
                return;
              }
            } catch (e) {
              logError(e);
            }
          }
          if (swapStyle === 'innerHTML') {
            swapInnerHTML(target, fragment, settleInfo);
          } else {
            swapWithStyle(htmx.config.defaultSwapStyle, elt, target, fragment, settleInfo);
          }
      }
    }
    function findAndSwapOobElements(fragment, settleInfo, rootNode) {
      var oobElts = findAll(fragment, '[hx-swap-oob], [data-hx-swap-oob]');
      forEach(oobElts, function (oobElement) {
        if (htmx.config.allowNestedOobSwaps || oobElement.parentElement === null) {
          const oobValue = getAttributeValue(oobElement, 'hx-swap-oob');
          if (oobValue != null) {
            oobSwap(oobValue, oobElement, settleInfo, rootNode);
          }
        } else {
          oobElement.removeAttribute('hx-swap-oob');
          oobElement.removeAttribute('data-hx-swap-oob');
        }
      });
      return oobElts.length > 0;
    }
    function swap(target, content, swapSpec, swapOptions) {
      if (!swapOptions) {
        swapOptions = {};
      }
      let settleResolve = null;
      let settleReject = null;
      let doSwap = function () {
        maybeCall(swapOptions.beforeSwapCallback);
        target = resolveTarget(target);
        const rootNode = swapOptions.contextElement
          ? getRootNode(swapOptions.contextElement, false)
          : getDocument();
        const activeElt = document.activeElement;
        let selectionInfo = {};
        selectionInfo = {
          elt: activeElt,
          // @ts-ignore
          start: activeElt ? activeElt.selectionStart : null,
          // @ts-ignore
          end: activeElt ? activeElt.selectionEnd : null,
        };
        const settleInfo = makeSettleInfo(target);
        if (swapSpec.swapStyle === 'textContent') {
          target.textContent = content;
        } else {
          let fragment = makeFragment(content);
          settleInfo.title = swapOptions.title || fragment.title;
          if (swapOptions.historyRequest) {
            fragment = fragment.querySelector('[hx-history-elt],[data-hx-history-elt]') || fragment;
          }
          if (swapOptions.selectOOB) {
            const oobSelectValues = swapOptions.selectOOB.split(',');
            for (let i = 0; i < oobSelectValues.length; i++) {
              const oobSelectValue = oobSelectValues[i].split(':', 2);
              let id = oobSelectValue[0].trim();
              if (id.indexOf('#') === 0) {
                id = id.substring(1);
              }
              const oobValue = oobSelectValue[1] || 'true';
              const oobElement = fragment.querySelector('#' + id);
              if (oobElement) {
                oobSwap(oobValue, oobElement, settleInfo, rootNode);
              }
            }
          }
          findAndSwapOobElements(fragment, settleInfo, rootNode);
          forEach(
            findAll(fragment, 'template'),
            /** @param {HTMLTemplateElement} template */
            function (template) {
              if (
                template.content &&
                findAndSwapOobElements(template.content, settleInfo, rootNode)
              ) {
                template.remove();
              }
            }
          );
          if (swapOptions.select) {
            const newFragment = getDocument().createDocumentFragment();
            forEach(fragment.querySelectorAll(swapOptions.select), function (node) {
              newFragment.appendChild(node);
            });
            fragment = newFragment;
          }
          handlePreservedElements(fragment);
          swapWithStyle(
            swapSpec.swapStyle,
            swapOptions.contextElement,
            target,
            fragment,
            settleInfo
          );
          restorePreservedElements();
        }
        if (
          selectionInfo.elt &&
          !bodyContains(selectionInfo.elt) &&
          getRawAttribute(selectionInfo.elt, 'id')
        ) {
          const newActiveElt = document.getElementById(getRawAttribute(selectionInfo.elt, 'id'));
          const focusOptions = {
            preventScroll:
              swapSpec.focusScroll !== void 0
                ? !swapSpec.focusScroll
                : !htmx.config.defaultFocusScroll,
          };
          if (newActiveElt) {
            if (selectionInfo.start && newActiveElt.setSelectionRange) {
              try {
                newActiveElt.setSelectionRange(selectionInfo.start, selectionInfo.end);
              } catch (e) {}
            }
            newActiveElt.focus(focusOptions);
          }
        }
        target.classList.remove(htmx.config.swappingClass);
        forEach(settleInfo.elts, function (elt2) {
          if (elt2.classList) {
            elt2.classList.add(htmx.config.settlingClass);
          }
          triggerEvent(elt2, 'htmx:afterSwap', swapOptions.eventInfo);
        });
        maybeCall(swapOptions.afterSwapCallback);
        if (!swapSpec.ignoreTitle) {
          handleTitle(settleInfo.title);
        }
        const doSettle = function () {
          forEach(settleInfo.tasks, function (task) {
            task.call();
          });
          forEach(settleInfo.elts, function (elt2) {
            if (elt2.classList) {
              elt2.classList.remove(htmx.config.settlingClass);
            }
            triggerEvent(elt2, 'htmx:afterSettle', swapOptions.eventInfo);
          });
          if (swapOptions.anchor) {
            const anchorTarget = asElement(resolveTarget('#' + swapOptions.anchor));
            if (anchorTarget) {
              anchorTarget.scrollIntoView({ block: 'start', behavior: 'auto' });
            }
          }
          updateScrollState(settleInfo.elts, swapSpec);
          maybeCall(swapOptions.afterSettleCallback);
          maybeCall(settleResolve);
        };
        if (swapSpec.settleDelay > 0) {
          getWindow().setTimeout(doSettle, swapSpec.settleDelay);
        } else {
          doSettle();
        }
      };
      let shouldTransition = htmx.config.globalViewTransitions;
      if (swapSpec.hasOwnProperty('transition')) {
        shouldTransition = swapSpec.transition;
      }
      const elt = swapOptions.contextElement || getDocument();
      if (
        shouldTransition &&
        triggerEvent(elt, 'htmx:beforeTransition', swapOptions.eventInfo) &&
        typeof Promise !== 'undefined' && // @ts-ignore experimental feature atm
        document.startViewTransition
      ) {
        const settlePromise = new Promise(function (_resolve, _reject) {
          settleResolve = _resolve;
          settleReject = _reject;
        });
        const innerDoSwap = doSwap;
        doSwap = function () {
          document.startViewTransition(function () {
            innerDoSwap();
            return settlePromise;
          });
        };
      }
      try {
        if (swapSpec?.swapDelay && swapSpec.swapDelay > 0) {
          getWindow().setTimeout(doSwap, swapSpec.swapDelay);
        } else {
          doSwap();
        }
      } catch (e) {
        triggerErrorEvent(elt, 'htmx:swapError', swapOptions.eventInfo);
        maybeCall(settleReject);
        throw e;
      }
    }
    function handleTriggerHeader(xhr, header, elt) {
      const triggerBody = xhr.getResponseHeader(header);
      if (triggerBody.indexOf('{') === 0) {
        const triggers = parseJSON(triggerBody);
        for (const eventName in triggers) {
          if (triggers.hasOwnProperty(eventName)) {
            let detail = triggers[eventName];
            if (isRawObject(detail)) {
              elt = detail.target !== void 0 ? detail.target : elt;
            } else {
              detail = { value: detail };
            }
            triggerEvent(elt, eventName, detail);
          }
        }
      } else {
        const eventNames = triggerBody.split(',');
        for (let i = 0; i < eventNames.length; i++) {
          triggerEvent(elt, eventNames[i].trim(), []);
        }
      }
    }
    const WHITESPACE = /\s/;
    const WHITESPACE_OR_COMMA = /[\s,]/;
    const SYMBOL_START = /[_$a-zA-Z]/;
    const SYMBOL_CONT = /[_$a-zA-Z0-9]/;
    const STRINGISH_START = ['"', "'", '/'];
    const NOT_WHITESPACE = /[^\s]/;
    const COMBINED_SELECTOR_START = /[{(]/;
    const COMBINED_SELECTOR_END = /[})]/;
    function tokenizeString(str2) {
      const tokens = [];
      let position = 0;
      while (position < str2.length) {
        if (SYMBOL_START.exec(str2.charAt(position))) {
          var startPosition = position;
          while (SYMBOL_CONT.exec(str2.charAt(position + 1))) {
            position++;
          }
          tokens.push(str2.substring(startPosition, position + 1));
        } else if (STRINGISH_START.indexOf(str2.charAt(position)) !== -1) {
          const startChar = str2.charAt(position);
          var startPosition = position;
          position++;
          while (position < str2.length && str2.charAt(position) !== startChar) {
            if (str2.charAt(position) === '\\') {
              position++;
            }
            position++;
          }
          tokens.push(str2.substring(startPosition, position + 1));
        } else {
          const symbol = str2.charAt(position);
          tokens.push(symbol);
        }
        position++;
      }
      return tokens;
    }
    function isPossibleRelativeReference(token, last, paramName) {
      return (
        SYMBOL_START.exec(token.charAt(0)) &&
        token !== 'true' &&
        token !== 'false' &&
        token !== 'this' &&
        token !== paramName &&
        last !== '.'
      );
    }
    function maybeGenerateConditional(elt, tokens, paramName) {
      if (tokens[0] === '[') {
        tokens.shift();
        let bracketCount = 1;
        let conditionalSource = ' return (function(' + paramName + '){ return (';
        let last = null;
        while (tokens.length > 0) {
          const token = tokens[0];
          if (token === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              if (last === null) {
                conditionalSource = conditionalSource + 'true';
              }
              tokens.shift();
              conditionalSource += ')})';
              try {
                const conditionFunction = maybeEval(
                  elt,
                  function () {
                    return Function(conditionalSource)();
                  },
                  function () {
                    return true;
                  }
                );
                conditionFunction.source = conditionalSource;
                return conditionFunction;
              } catch (e) {
                triggerErrorEvent(getDocument().body, 'htmx:syntax:error', {
                  error: e,
                  source: conditionalSource,
                });
                return null;
              }
            }
          } else if (token === '[') {
            bracketCount++;
          }
          if (isPossibleRelativeReference(token, last, paramName)) {
            conditionalSource +=
              '((' +
              paramName +
              '.' +
              token +
              ') ? (' +
              paramName +
              '.' +
              token +
              ') : (window.' +
              token +
              '))';
          } else {
            conditionalSource = conditionalSource + token;
          }
          last = tokens.shift();
        }
      }
    }
    function consumeUntil(tokens, match) {
      let result = '';
      while (tokens.length > 0 && !match.test(tokens[0])) {
        result += tokens.shift();
      }
      return result;
    }
    function consumeCSSSelector(tokens) {
      let result;
      if (tokens.length > 0 && COMBINED_SELECTOR_START.test(tokens[0])) {
        tokens.shift();
        result = consumeUntil(tokens, COMBINED_SELECTOR_END).trim();
        tokens.shift();
      } else {
        result = consumeUntil(tokens, WHITESPACE_OR_COMMA);
      }
      return result;
    }
    const INPUT_SELECTOR = 'input, textarea, select';
    function parseAndCacheTrigger(elt, explicitTrigger, cache) {
      const triggerSpecs = [];
      const tokens = tokenizeString(explicitTrigger);
      do {
        consumeUntil(tokens, NOT_WHITESPACE);
        const initialLength = tokens.length;
        const trigger = consumeUntil(tokens, /[,\[\s]/);
        if (trigger !== '') {
          if (trigger === 'every') {
            const every = { trigger: 'every' };
            consumeUntil(tokens, NOT_WHITESPACE);
            every.pollInterval = parseInterval(consumeUntil(tokens, /[,\[\s]/));
            consumeUntil(tokens, NOT_WHITESPACE);
            var eventFilter = maybeGenerateConditional(elt, tokens, 'event');
            if (eventFilter) {
              every.eventFilter = eventFilter;
            }
            triggerSpecs.push(every);
          } else {
            const triggerSpec = { trigger };
            var eventFilter = maybeGenerateConditional(elt, tokens, 'event');
            if (eventFilter) {
              triggerSpec.eventFilter = eventFilter;
            }
            consumeUntil(tokens, NOT_WHITESPACE);
            while (tokens.length > 0 && tokens[0] !== ',') {
              const token = tokens.shift();
              if (token === 'changed') {
                triggerSpec.changed = true;
              } else if (token === 'once') {
                triggerSpec.once = true;
              } else if (token === 'consume') {
                triggerSpec.consume = true;
              } else if (token === 'delay' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec.delay = parseInterval(consumeUntil(tokens, WHITESPACE_OR_COMMA));
              } else if (token === 'from' && tokens[0] === ':') {
                tokens.shift();
                if (COMBINED_SELECTOR_START.test(tokens[0])) {
                  var from_arg = consumeCSSSelector(tokens);
                } else {
                  var from_arg = consumeUntil(tokens, WHITESPACE_OR_COMMA);
                  if (
                    from_arg === 'closest' ||
                    from_arg === 'find' ||
                    from_arg === 'next' ||
                    from_arg === 'previous'
                  ) {
                    tokens.shift();
                    const selector = consumeCSSSelector(tokens);
                    if (selector.length > 0) {
                      from_arg += ' ' + selector;
                    }
                  }
                }
                triggerSpec.from = from_arg;
              } else if (token === 'target' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec.target = consumeCSSSelector(tokens);
              } else if (token === 'throttle' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec.throttle = parseInterval(consumeUntil(tokens, WHITESPACE_OR_COMMA));
              } else if (token === 'queue' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec.queue = consumeUntil(tokens, WHITESPACE_OR_COMMA);
              } else if (token === 'root' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec[token] = consumeCSSSelector(tokens);
              } else if (token === 'threshold' && tokens[0] === ':') {
                tokens.shift();
                triggerSpec[token] = consumeUntil(tokens, WHITESPACE_OR_COMMA);
              } else {
                triggerErrorEvent(elt, 'htmx:syntax:error', { token: tokens.shift() });
              }
              consumeUntil(tokens, NOT_WHITESPACE);
            }
            triggerSpecs.push(triggerSpec);
          }
        }
        if (tokens.length === initialLength) {
          triggerErrorEvent(elt, 'htmx:syntax:error', { token: tokens.shift() });
        }
        consumeUntil(tokens, NOT_WHITESPACE);
      } while (tokens[0] === ',' && tokens.shift());
      if (cache) {
        cache[explicitTrigger] = triggerSpecs;
      }
      return triggerSpecs;
    }
    function getTriggerSpecs(elt) {
      const explicitTrigger = getAttributeValue(elt, 'hx-trigger');
      let triggerSpecs = [];
      if (explicitTrigger) {
        const cache = htmx.config.triggerSpecsCache;
        triggerSpecs =
          (cache && cache[explicitTrigger]) || parseAndCacheTrigger(elt, explicitTrigger, cache);
      }
      if (triggerSpecs.length > 0) {
        return triggerSpecs;
      } else if (matches(elt, 'form')) {
        return [{ trigger: 'submit' }];
      } else if (matches(elt, 'input[type="button"], input[type="submit"]')) {
        return [{ trigger: 'click' }];
      } else if (matches(elt, INPUT_SELECTOR)) {
        return [{ trigger: 'change' }];
      } else {
        return [{ trigger: 'click' }];
      }
    }
    function cancelPolling(elt) {
      getInternalData(elt).cancelled = true;
    }
    function processPolling(elt, handler, spec) {
      const nodeData = getInternalData(elt);
      nodeData.timeout = getWindow().setTimeout(function () {
        if (bodyContains(elt) && nodeData.cancelled !== true) {
          if (
            !maybeFilterEvent(
              spec,
              elt,
              makeEvent('hx:poll:trigger', {
                triggerSpec: spec,
                target: elt,
              })
            )
          ) {
            handler(elt);
          }
          processPolling(elt, handler, spec);
        }
      }, spec.pollInterval);
    }
    function isLocalLink(elt) {
      return (
        location.hostname === elt.hostname &&
        getRawAttribute(elt, 'href') &&
        getRawAttribute(elt, 'href').indexOf('#') !== 0
      );
    }
    function eltIsDisabled(elt) {
      return closest(elt, htmx.config.disableSelector);
    }
    function boostElement(elt, nodeData, triggerSpecs) {
      if (
        (elt instanceof HTMLAnchorElement &&
          isLocalLink(elt) &&
          (elt.target === '' || elt.target === '_self')) ||
        (elt.tagName === 'FORM' &&
          String(getRawAttribute(elt, 'method')).toLowerCase() !== 'dialog')
      ) {
        nodeData.boosted = true;
        let verb, path;
        if (elt.tagName === 'A') {
          verb = /** @type HttpVerb */ 'get';
          path = getRawAttribute(elt, 'href');
        } else {
          const rawAttribute = getRawAttribute(elt, 'method');
          verb = /** @type HttpVerb */ rawAttribute ? rawAttribute.toLowerCase() : 'get';
          path = getRawAttribute(elt, 'action');
          if (path == null || path === '') {
            path = location.href;
          }
          if (verb === 'get' && path.includes('?')) {
            path = path.replace(/\?[^#]+/, '');
          }
        }
        triggerSpecs.forEach(function (triggerSpec) {
          addEventListener(
            elt,
            function (node, evt) {
              const elt2 = asElement(node);
              if (eltIsDisabled(elt2)) {
                cleanUpElement(elt2);
                return;
              }
              issueAjaxRequest(verb, path, elt2, evt);
            },
            nodeData,
            triggerSpec,
            true
          );
        });
      }
    }
    function shouldCancel(evt, elt) {
      if (evt.type === 'submit' && elt.tagName === 'FORM') {
        return true;
      } else if (evt.type === 'click') {
        const btn =
          /** @type {HTMLButtonElement|HTMLInputElement|null} */
          elt.closest('input[type="submit"], button');
        if (btn && btn.form && btn.type === 'submit') {
          return true;
        }
        const link = elt.closest('a');
        const samePageAnchor = /^#.+/;
        if (link && link.href && !samePageAnchor.test(link.getAttribute('href'))) {
          return true;
        }
      }
      return false;
    }
    function ignoreBoostedAnchorCtrlClick(elt, evt) {
      return (
        getInternalData(elt).boosted &&
        elt instanceof HTMLAnchorElement &&
        evt.type === 'click' && // @ts-ignore this will resolve to undefined for events that don't define those properties, which is fine
        (evt.ctrlKey || evt.metaKey)
      );
    }
    function maybeFilterEvent(triggerSpec, elt, evt) {
      const eventFilter = triggerSpec.eventFilter;
      if (eventFilter) {
        try {
          return eventFilter.call(elt, evt) !== true;
        } catch (e) {
          const source = eventFilter.source;
          triggerErrorEvent(getDocument().body, 'htmx:eventFilter:error', { error: e, source });
          return true;
        }
      }
      return false;
    }
    function addEventListener(elt, handler, nodeData, triggerSpec, explicitCancel) {
      const elementData = getInternalData(elt);
      let eltsToListenOn;
      if (triggerSpec.from) {
        eltsToListenOn = querySelectorAllExt(elt, triggerSpec.from);
      } else {
        eltsToListenOn = [elt];
      }
      if (triggerSpec.changed) {
        if (!('lastValue' in elementData)) {
          elementData.lastValue = /* @__PURE__ */ new WeakMap();
        }
        eltsToListenOn.forEach(function (eltToListenOn) {
          if (!elementData.lastValue.has(triggerSpec)) {
            elementData.lastValue.set(triggerSpec, /* @__PURE__ */ new WeakMap());
          }
          elementData.lastValue.get(triggerSpec).set(eltToListenOn, eltToListenOn.value);
        });
      }
      forEach(eltsToListenOn, function (eltToListenOn) {
        const eventListener = function (evt) {
          if (!bodyContains(elt)) {
            eltToListenOn.removeEventListener(triggerSpec.trigger, eventListener);
            return;
          }
          if (ignoreBoostedAnchorCtrlClick(elt, evt)) {
            return;
          }
          if (explicitCancel || shouldCancel(evt, eltToListenOn)) {
            evt.preventDefault();
          }
          if (maybeFilterEvent(triggerSpec, elt, evt)) {
            return;
          }
          const eventData = getInternalData(evt);
          eventData.triggerSpec = triggerSpec;
          if (eventData.handledFor == null) {
            eventData.handledFor = [];
          }
          if (eventData.handledFor.indexOf(elt) < 0) {
            eventData.handledFor.push(elt);
            if (triggerSpec.consume) {
              evt.stopPropagation();
            }
            if (triggerSpec.target && evt.target) {
              if (!matches(asElement(evt.target), triggerSpec.target)) {
                return;
              }
            }
            if (triggerSpec.once) {
              if (elementData.triggeredOnce) {
                return;
              } else {
                elementData.triggeredOnce = true;
              }
            }
            if (triggerSpec.changed) {
              const node = evt.target;
              const value = node.value;
              const lastValue = elementData.lastValue.get(triggerSpec);
              if (lastValue.has(node) && lastValue.get(node) === value) {
                return;
              }
              lastValue.set(node, value);
            }
            if (elementData.delayed) {
              clearTimeout(elementData.delayed);
            }
            if (elementData.throttle) {
              return;
            }
            if (triggerSpec.throttle > 0) {
              if (!elementData.throttle) {
                triggerEvent(elt, 'htmx:trigger');
                handler(elt, evt);
                elementData.throttle = getWindow().setTimeout(function () {
                  elementData.throttle = null;
                }, triggerSpec.throttle);
              }
            } else if (triggerSpec.delay > 0) {
              elementData.delayed = getWindow().setTimeout(function () {
                triggerEvent(elt, 'htmx:trigger');
                handler(elt, evt);
              }, triggerSpec.delay);
            } else {
              triggerEvent(elt, 'htmx:trigger');
              handler(elt, evt);
            }
          }
        };
        if (nodeData.listenerInfos == null) {
          nodeData.listenerInfos = [];
        }
        nodeData.listenerInfos.push({
          trigger: triggerSpec.trigger,
          listener: eventListener,
          on: eltToListenOn,
        });
        eltToListenOn.addEventListener(triggerSpec.trigger, eventListener);
      });
    }
    let windowIsScrolling = false;
    let scrollHandler = null;
    function initScrollHandler() {
      if (!scrollHandler) {
        scrollHandler = function () {
          windowIsScrolling = true;
        };
        window.addEventListener('scroll', scrollHandler);
        window.addEventListener('resize', scrollHandler);
        setInterval(function () {
          if (windowIsScrolling) {
            windowIsScrolling = false;
            forEach(
              getDocument().querySelectorAll(
                "[hx-trigger*='revealed'],[data-hx-trigger*='revealed']"
              ),
              function (elt) {
                maybeReveal(elt);
              }
            );
          }
        }, 200);
      }
    }
    function maybeReveal(elt) {
      if (!hasAttribute(elt, 'data-hx-revealed') && isScrolledIntoView(elt)) {
        elt.setAttribute('data-hx-revealed', 'true');
        const nodeData = getInternalData(elt);
        if (nodeData.initHash) {
          triggerEvent(elt, 'revealed');
        } else {
          elt.addEventListener(
            'htmx:afterProcessNode',
            function () {
              triggerEvent(elt, 'revealed');
            },
            { once: true }
          );
        }
      }
    }
    function loadImmediately(elt, handler, nodeData, delay) {
      const load = function () {
        if (!nodeData.loaded) {
          nodeData.loaded = true;
          triggerEvent(elt, 'htmx:trigger');
          handler(elt);
        }
      };
      if (delay > 0) {
        getWindow().setTimeout(load, delay);
      } else {
        load();
      }
    }
    function processVerbs(elt, nodeData, triggerSpecs) {
      let explicitAction = false;
      forEach(VERBS, function (verb) {
        if (hasAttribute(elt, 'hx-' + verb)) {
          const path = getAttributeValue(elt, 'hx-' + verb);
          explicitAction = true;
          nodeData.path = path;
          nodeData.verb = verb;
          triggerSpecs.forEach(function (triggerSpec) {
            addTriggerHandler(elt, triggerSpec, nodeData, function (node, evt) {
              const elt2 = asElement(node);
              if (eltIsDisabled(elt2)) {
                cleanUpElement(elt2);
                return;
              }
              issueAjaxRequest(verb, path, elt2, evt);
            });
          });
        }
      });
      return explicitAction;
    }
    function addTriggerHandler(elt, triggerSpec, nodeData, handler) {
      if (triggerSpec.trigger === 'revealed') {
        initScrollHandler();
        addEventListener(elt, handler, nodeData, triggerSpec);
        maybeReveal(asElement(elt));
      } else if (triggerSpec.trigger === 'intersect') {
        const observerOptions = {};
        if (triggerSpec.root) {
          observerOptions.root = querySelectorExt(elt, triggerSpec.root);
        }
        if (triggerSpec.threshold) {
          observerOptions.threshold = parseFloat(triggerSpec.threshold);
        }
        const observer = new IntersectionObserver(function (entries) {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.isIntersecting) {
              triggerEvent(elt, 'intersect');
              break;
            }
          }
        }, observerOptions);
        observer.observe(asElement(elt));
        addEventListener(asElement(elt), handler, nodeData, triggerSpec);
      } else if (!nodeData.firstInitCompleted && triggerSpec.trigger === 'load') {
        if (!maybeFilterEvent(triggerSpec, elt, makeEvent('load', { elt }))) {
          loadImmediately(asElement(elt), handler, nodeData, triggerSpec.delay);
        }
      } else if (triggerSpec.pollInterval > 0) {
        nodeData.polling = true;
        processPolling(asElement(elt), handler, triggerSpec);
      } else {
        addEventListener(elt, handler, nodeData, triggerSpec);
      }
    }
    function shouldProcessHxOn(node) {
      const elt = asElement(node);
      if (!elt) {
        return false;
      }
      const attributes = elt.attributes;
      for (let j = 0; j < attributes.length; j++) {
        const attrName = attributes[j].name;
        if (
          startsWith(attrName, 'hx-on:') ||
          startsWith(attrName, 'data-hx-on:') ||
          startsWith(attrName, 'hx-on-') ||
          startsWith(attrName, 'data-hx-on-')
        ) {
          return true;
        }
      }
      return false;
    }
    const HX_ON_QUERY = new XPathEvaluator().createExpression(
      './/*[@*[ starts-with(name(), "hx-on:") or starts-with(name(), "data-hx-on:") or starts-with(name(), "hx-on-") or starts-with(name(), "data-hx-on-") ]]'
    );
    function processHXOnRoot(elt, elements) {
      if (shouldProcessHxOn(elt)) {
        elements.push(asElement(elt));
      }
      const iter = HX_ON_QUERY.evaluate(elt);
      let node = null;
      while ((node = iter.iterateNext())) elements.push(asElement(node));
    }
    function findHxOnWildcardElements(elt) {
      const elements = [];
      if (elt instanceof DocumentFragment) {
        for (const child of elt.childNodes) {
          processHXOnRoot(child, elements);
        }
      } else {
        processHXOnRoot(elt, elements);
      }
      return elements;
    }
    function findElementsToProcess(elt) {
      if (elt.querySelectorAll) {
        const boostedSelector = ', [hx-boost] a, [data-hx-boost] a, a[hx-boost], a[data-hx-boost]';
        const extensionSelectors = [];
        for (const e in extensions) {
          const extension = extensions[e];
          if (extension.getSelectors) {
            var selectors = extension.getSelectors();
            if (selectors) {
              extensionSelectors.push(selectors);
            }
          }
        }
        const results = elt.querySelectorAll(
          VERB_SELECTOR +
            boostedSelector +
            ", form, [type='submit'], [hx-ext], [data-hx-ext], [hx-trigger], [data-hx-trigger]" +
            extensionSelectors
              .flat()
              .map((s) => ', ' + s)
              .join('')
        );
        return results;
      } else {
        return [];
      }
    }
    function maybeSetLastButtonClicked(evt) {
      const elt = getTargetButton(evt.target);
      const internalData = getRelatedFormData(evt);
      if (internalData) {
        internalData.lastButtonClicked = elt;
      }
    }
    function maybeUnsetLastButtonClicked(evt) {
      const internalData = getRelatedFormData(evt);
      if (internalData) {
        internalData.lastButtonClicked = null;
      }
    }
    function getTargetButton(target) {
      return (
        /** @type {HTMLButtonElement|HTMLInputElement|null} */
        closest(asElement(target), "button, input[type='submit']")
      );
    }
    function getRelatedForm(elt) {
      return elt.form || closest(elt, 'form');
    }
    function getRelatedFormData(evt) {
      const elt = getTargetButton(evt.target);
      if (!elt) {
        return;
      }
      const form = getRelatedForm(elt);
      if (!form) {
        return;
      }
      return getInternalData(form);
    }
    function initButtonTracking(elt) {
      elt.addEventListener('click', maybeSetLastButtonClicked);
      elt.addEventListener('focusin', maybeSetLastButtonClicked);
      elt.addEventListener('focusout', maybeUnsetLastButtonClicked);
    }
    function addHxOnEventHandler(elt, eventName, code) {
      const nodeData = getInternalData(elt);
      if (!Array.isArray(nodeData.onHandlers)) {
        nodeData.onHandlers = [];
      }
      let func;
      const listener = function (e) {
        maybeEval(elt, function () {
          if (eltIsDisabled(elt)) {
            return;
          }
          if (!func) {
            func = new Function('event', code);
          }
          func.call(elt, e);
        });
      };
      elt.addEventListener(eventName, listener);
      nodeData.onHandlers.push({ event: eventName, listener });
    }
    function processHxOnWildcard(elt) {
      deInitOnHandlers(elt);
      for (let i = 0; i < elt.attributes.length; i++) {
        const name = elt.attributes[i].name;
        const value = elt.attributes[i].value;
        if (startsWith(name, 'hx-on') || startsWith(name, 'data-hx-on')) {
          const afterOnPosition = name.indexOf('-on') + 3;
          const nextChar = name.slice(afterOnPosition, afterOnPosition + 1);
          if (nextChar === '-' || nextChar === ':') {
            let eventName = name.slice(afterOnPosition + 1);
            if (startsWith(eventName, ':')) {
              eventName = 'htmx' + eventName;
            } else if (startsWith(eventName, '-')) {
              eventName = 'htmx:' + eventName.slice(1);
            } else if (startsWith(eventName, 'htmx-')) {
              eventName = 'htmx:' + eventName.slice(5);
            }
            addHxOnEventHandler(elt, eventName, value);
          }
        }
      }
    }
    function initNode(elt) {
      triggerEvent(elt, 'htmx:beforeProcessNode');
      const nodeData = getInternalData(elt);
      const triggerSpecs = getTriggerSpecs(elt);
      const hasExplicitHttpAction = processVerbs(elt, nodeData, triggerSpecs);
      if (!hasExplicitHttpAction) {
        if (getClosestAttributeValue(elt, 'hx-boost') === 'true') {
          boostElement(elt, nodeData, triggerSpecs);
        } else if (hasAttribute(elt, 'hx-trigger')) {
          triggerSpecs.forEach(function (triggerSpec) {
            addTriggerHandler(elt, triggerSpec, nodeData, function () {});
          });
        }
      }
      if (
        elt.tagName === 'FORM' ||
        (getRawAttribute(elt, 'type') === 'submit' && hasAttribute(elt, 'form'))
      ) {
        initButtonTracking(elt);
      }
      nodeData.firstInitCompleted = true;
      triggerEvent(elt, 'htmx:afterProcessNode');
    }
    function maybeDeInitAndHash(elt) {
      if (!(elt instanceof Element)) {
        return false;
      }
      const nodeData = getInternalData(elt);
      const hash = attributeHash(elt);
      if (nodeData.initHash !== hash) {
        deInitNode(elt);
        nodeData.initHash = hash;
        return true;
      }
      return false;
    }
    function processNode(elt) {
      elt = resolveTarget(elt);
      if (eltIsDisabled(elt)) {
        cleanUpElement(elt);
        return;
      }
      const elementsToInit = [];
      if (maybeDeInitAndHash(elt)) {
        elementsToInit.push(elt);
      }
      forEach(findElementsToProcess(elt), function (child) {
        if (eltIsDisabled(child)) {
          cleanUpElement(child);
          return;
        }
        if (maybeDeInitAndHash(child)) {
          elementsToInit.push(child);
        }
      });
      forEach(findHxOnWildcardElements(elt), processHxOnWildcard);
      forEach(elementsToInit, initNode);
    }
    function kebabEventName(str2) {
      return str2.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
    function makeEvent(eventName, detail) {
      return new CustomEvent(eventName, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail,
      });
    }
    function triggerErrorEvent(elt, eventName, detail) {
      triggerEvent(elt, eventName, mergeObjects({ error: eventName }, detail));
    }
    function ignoreEventForLogging(eventName) {
      return eventName === 'htmx:afterProcessNode';
    }
    function withExtensions(elt, toDo, extensionsToIgnore) {
      forEach(getExtensions(elt, [], extensionsToIgnore), function (extension) {
        try {
          toDo(extension);
        } catch (e) {
          logError(e);
        }
      });
    }
    function logError(msg) {
      console.error(msg);
    }
    function triggerEvent(elt, eventName, detail) {
      elt = resolveTarget(elt);
      if (detail == null) {
        detail = {};
      }
      detail.elt = elt;
      const event = makeEvent(eventName, detail);
      if (htmx.logger && !ignoreEventForLogging(eventName)) {
        htmx.logger(elt, eventName, detail);
      }
      if (detail.error) {
        logError(detail.error);
        triggerEvent(elt, 'htmx:error', { errorInfo: detail });
      }
      let eventResult = elt.dispatchEvent(event);
      const kebabName = kebabEventName(eventName);
      if (eventResult && kebabName !== eventName) {
        const kebabedEvent = makeEvent(kebabName, event.detail);
        eventResult = eventResult && elt.dispatchEvent(kebabedEvent);
      }
      withExtensions(asElement(elt), function (extension) {
        eventResult =
          eventResult && extension.onEvent(eventName, event) !== false && !event.defaultPrevented;
      });
      return eventResult;
    }
    let currentPathForHistory = location.pathname + location.search;
    function setCurrentPathForHistory(path) {
      currentPathForHistory = path;
      if (canAccessLocalStorage()) {
        sessionStorage.setItem('htmx-current-path-for-history', path);
      }
    }
    function getHistoryElement() {
      const historyElt = getDocument().querySelector('[hx-history-elt],[data-hx-history-elt]');
      return historyElt || getDocument().body;
    }
    function saveToHistoryCache(url, rootElt) {
      if (!canAccessLocalStorage()) {
        return;
      }
      const innerHTML = cleanInnerHtmlForHistory(rootElt);
      const title = getDocument().title;
      const scroll = window.scrollY;
      if (htmx.config.historyCacheSize <= 0) {
        sessionStorage.removeItem('htmx-history-cache');
        return;
      }
      url = normalizePath(url);
      const historyCache = parseJSON(sessionStorage.getItem('htmx-history-cache')) || [];
      for (let i = 0; i < historyCache.length; i++) {
        if (historyCache[i].url === url) {
          historyCache.splice(i, 1);
          break;
        }
      }
      const newHistoryItem = { url, content: innerHTML, title, scroll };
      triggerEvent(getDocument().body, 'htmx:historyItemCreated', {
        item: newHistoryItem,
        cache: historyCache,
      });
      historyCache.push(newHistoryItem);
      while (historyCache.length > htmx.config.historyCacheSize) {
        historyCache.shift();
      }
      while (historyCache.length > 0) {
        try {
          sessionStorage.setItem('htmx-history-cache', JSON.stringify(historyCache));
          break;
        } catch (e) {
          triggerErrorEvent(getDocument().body, 'htmx:historyCacheError', {
            cause: e,
            cache: historyCache,
          });
          historyCache.shift();
        }
      }
    }
    function getCachedHistory(url) {
      if (!canAccessLocalStorage()) {
        return null;
      }
      url = normalizePath(url);
      const historyCache = parseJSON(sessionStorage.getItem('htmx-history-cache')) || [];
      for (let i = 0; i < historyCache.length; i++) {
        if (historyCache[i].url === url) {
          return historyCache[i];
        }
      }
      return null;
    }
    function cleanInnerHtmlForHistory(elt) {
      const className = htmx.config.requestClass;
      const clone =
        /** @type Element */
        elt.cloneNode(true);
      forEach(findAll(clone, '.' + className), function (child) {
        removeClassFromElement(child, className);
      });
      forEach(findAll(clone, '[data-disabled-by-htmx]'), function (child) {
        child.removeAttribute('disabled');
      });
      return clone.innerHTML;
    }
    function saveCurrentPageToHistory() {
      const elt = getHistoryElement();
      let path = currentPathForHistory;
      if (canAccessLocalStorage()) {
        path = sessionStorage.getItem('htmx-current-path-for-history');
      }
      path = path || location.pathname + location.search;
      const disableHistoryCache = getDocument().querySelector(
        '[hx-history="false" i],[data-hx-history="false" i]'
      );
      if (!disableHistoryCache) {
        triggerEvent(getDocument().body, 'htmx:beforeHistorySave', { path, historyElt: elt });
        saveToHistoryCache(path, elt);
      }
      if (htmx.config.historyEnabled)
        history.replaceState({ htmx: true }, getDocument().title, location.href);
    }
    function pushUrlIntoHistory(path) {
      if (htmx.config.getCacheBusterParam) {
        path = path.replace(/org\.htmx\.cache-buster=[^&]*&?/, '');
        if (endsWith(path, '&') || endsWith(path, '?')) {
          path = path.slice(0, -1);
        }
      }
      if (htmx.config.historyEnabled) {
        history.pushState({ htmx: true }, '', path);
      }
      setCurrentPathForHistory(path);
    }
    function replaceUrlInHistory(path) {
      if (htmx.config.historyEnabled) history.replaceState({ htmx: true }, '', path);
      setCurrentPathForHistory(path);
    }
    function settleImmediately(tasks) {
      forEach(tasks, function (task) {
        task.call(void 0);
      });
    }
    function loadHistoryFromServer(path) {
      const request = new XMLHttpRequest();
      const swapSpec = { swapStyle: 'innerHTML', swapDelay: 0, settleDelay: 0 };
      const details = { path, xhr: request, historyElt: getHistoryElement(), swapSpec };
      request.open('GET', path, true);
      if (htmx.config.historyRestoreAsHxRequest) {
        request.setRequestHeader('HX-Request', 'true');
      }
      request.setRequestHeader('HX-History-Restore-Request', 'true');
      request.setRequestHeader('HX-Current-URL', location.href);
      request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          details.response = this.response;
          triggerEvent(getDocument().body, 'htmx:historyCacheMissLoad', details);
          swap(details.historyElt, details.response, swapSpec, {
            contextElement: details.historyElt,
            historyRequest: true,
          });
          setCurrentPathForHistory(details.path);
          triggerEvent(getDocument().body, 'htmx:historyRestore', {
            path,
            cacheMiss: true,
            serverResponse: details.response,
          });
        } else {
          triggerErrorEvent(getDocument().body, 'htmx:historyCacheMissLoadError', details);
        }
      };
      if (triggerEvent(getDocument().body, 'htmx:historyCacheMiss', details)) {
        request.send();
      }
    }
    function restoreHistory(path) {
      saveCurrentPageToHistory();
      path = path || location.pathname + location.search;
      const cached = getCachedHistory(path);
      if (cached) {
        const swapSpec = {
          swapStyle: 'innerHTML',
          swapDelay: 0,
          settleDelay: 0,
          scroll: cached.scroll,
        };
        const details = { path, item: cached, historyElt: getHistoryElement(), swapSpec };
        if (triggerEvent(getDocument().body, 'htmx:historyCacheHit', details)) {
          swap(details.historyElt, cached.content, swapSpec, {
            contextElement: details.historyElt,
            title: cached.title,
          });
          setCurrentPathForHistory(details.path);
          triggerEvent(getDocument().body, 'htmx:historyRestore', details);
        }
      } else {
        if (htmx.config.refreshOnHistoryMiss) {
          htmx.location.reload(true);
        } else {
          loadHistoryFromServer(path);
        }
      }
    }
    function addRequestIndicatorClasses(elt) {
      let indicators =
        /** @type Element[] */
        findAttributeTargets(elt, 'hx-indicator');
      if (indicators == null) {
        indicators = [elt];
      }
      forEach(indicators, function (ic) {
        const internalData = getInternalData(ic);
        internalData.requestCount = (internalData.requestCount || 0) + 1;
        ic.classList.add.call(ic.classList, htmx.config.requestClass);
      });
      return indicators;
    }
    function disableElements(elt) {
      let disabledElts =
        /** @type Element[] */
        findAttributeTargets(elt, 'hx-disabled-elt');
      if (disabledElts == null) {
        disabledElts = [];
      }
      forEach(disabledElts, function (disabledElement) {
        const internalData = getInternalData(disabledElement);
        internalData.requestCount = (internalData.requestCount || 0) + 1;
        disabledElement.setAttribute('disabled', '');
        disabledElement.setAttribute('data-disabled-by-htmx', '');
      });
      return disabledElts;
    }
    function removeRequestIndicators(indicators, disabled) {
      forEach(indicators.concat(disabled), function (ele) {
        const internalData = getInternalData(ele);
        internalData.requestCount = (internalData.requestCount || 1) - 1;
      });
      forEach(indicators, function (ic) {
        const internalData = getInternalData(ic);
        if (internalData.requestCount === 0) {
          ic.classList.remove.call(ic.classList, htmx.config.requestClass);
        }
      });
      forEach(disabled, function (disabledElement) {
        const internalData = getInternalData(disabledElement);
        if (internalData.requestCount === 0) {
          disabledElement.removeAttribute('disabled');
          disabledElement.removeAttribute('data-disabled-by-htmx');
        }
      });
    }
    function haveSeenNode(processed, elt) {
      for (let i = 0; i < processed.length; i++) {
        const node = processed[i];
        if (node.isSameNode(elt)) {
          return true;
        }
      }
      return false;
    }
    function shouldInclude(element) {
      const elt =
        /** @type {HTMLInputElement} */
        element;
      if (
        elt.name === '' ||
        elt.name == null ||
        elt.disabled ||
        closest(elt, 'fieldset[disabled]')
      ) {
        return false;
      }
      if (
        elt.type === 'button' ||
        elt.type === 'submit' ||
        elt.tagName === 'image' ||
        elt.tagName === 'reset' ||
        elt.tagName === 'file'
      ) {
        return false;
      }
      if (elt.type === 'checkbox' || elt.type === 'radio') {
        return elt.checked;
      }
      return true;
    }
    function addValueToFormData(name, value, formData) {
      if (name != null && value != null) {
        if (Array.isArray(value)) {
          value.forEach(function (v) {
            formData.append(name, v);
          });
        } else {
          formData.append(name, value);
        }
      }
    }
    function removeValueFromFormData(name, value, formData) {
      if (name != null && value != null) {
        let values = formData.getAll(name);
        if (Array.isArray(value)) {
          values = values.filter((v) => value.indexOf(v) < 0);
        } else {
          values = values.filter((v) => v !== value);
        }
        formData.delete(name);
        forEach(values, (v) => formData.append(name, v));
      }
    }
    function getValueFromInput(elt) {
      if (elt instanceof HTMLSelectElement && elt.multiple) {
        return toArray(elt.querySelectorAll('option:checked')).map(function (e) {
          return (
            /** @type HTMLOptionElement */
            e.value
          );
        });
      }
      if (elt instanceof HTMLInputElement && elt.files) {
        return toArray(elt.files);
      }
      return elt.value;
    }
    function processInputValue(processed, formData, errors, elt, validate) {
      if (elt == null || haveSeenNode(processed, elt)) {
        return;
      } else {
        processed.push(elt);
      }
      if (shouldInclude(elt)) {
        const name = getRawAttribute(elt, 'name');
        addValueToFormData(name, getValueFromInput(elt), formData);
        if (validate) {
          validateElement(elt, errors);
        }
      }
      if (elt instanceof HTMLFormElement) {
        forEach(elt.elements, function (input) {
          if (processed.indexOf(input) >= 0) {
            removeValueFromFormData(input.name, getValueFromInput(input), formData);
          } else {
            processed.push(input);
          }
          if (validate) {
            validateElement(input, errors);
          }
        });
        new FormData(elt).forEach(function (value, name) {
          if (value instanceof File && value.name === '') {
            return;
          }
          addValueToFormData(name, value, formData);
        });
      }
    }
    function validateElement(elt, errors) {
      const element =
        /** @type {HTMLElement & ElementInternals} */
        elt;
      if (element.willValidate) {
        triggerEvent(element, 'htmx:validation:validate');
        if (!element.checkValidity()) {
          if (
            triggerEvent(element, 'htmx:validation:failed', {
              message: element.validationMessage,
              validity: element.validity,
            }) &&
            !errors.length &&
            htmx.config.reportValidityOfForms
          ) {
            element.reportValidity();
          }
          errors.push({
            elt: element,
            message: element.validationMessage,
            validity: element.validity,
          });
        }
      }
    }
    function overrideFormData(receiver, donor) {
      for (const key of donor.keys()) {
        receiver.delete(key);
      }
      donor.forEach(function (value, key) {
        receiver.append(key, value);
      });
      return receiver;
    }
    function getInputValues(elt, verb) {
      const processed = [];
      const formData = new FormData();
      const priorityFormData = new FormData();
      const errors = [];
      const internalData = getInternalData(elt);
      if (internalData.lastButtonClicked && !bodyContains(internalData.lastButtonClicked)) {
        internalData.lastButtonClicked = null;
      }
      let validate =
        (elt instanceof HTMLFormElement && elt.noValidate !== true) ||
        getAttributeValue(elt, 'hx-validate') === 'true';
      if (internalData.lastButtonClicked) {
        validate = validate && internalData.lastButtonClicked.formNoValidate !== true;
      }
      if (verb !== 'get') {
        processInputValue(processed, priorityFormData, errors, getRelatedForm(elt), validate);
      }
      processInputValue(processed, formData, errors, elt, validate);
      if (
        internalData.lastButtonClicked ||
        elt.tagName === 'BUTTON' ||
        (elt.tagName === 'INPUT' && getRawAttribute(elt, 'type') === 'submit')
      ) {
        const button =
          internalData.lastButtonClicked || /** @type HTMLInputElement|HTMLButtonElement */ elt;
        const name = getRawAttribute(button, 'name');
        addValueToFormData(name, button.value, priorityFormData);
      }
      const includes = findAttributeTargets(elt, 'hx-include');
      forEach(includes, function (node) {
        processInputValue(processed, formData, errors, asElement(node), validate);
        if (!matches(node, 'form')) {
          forEach(asParentNode(node).querySelectorAll(INPUT_SELECTOR), function (descendant) {
            processInputValue(processed, formData, errors, descendant, validate);
          });
        }
      });
      overrideFormData(formData, priorityFormData);
      return { errors, formData, values: formDataProxy(formData) };
    }
    function appendParam(returnStr, name, realValue) {
      if (returnStr !== '') {
        returnStr += '&';
      }
      if (String(realValue) === '[object Object]') {
        realValue = JSON.stringify(realValue);
      }
      const s = encodeURIComponent(realValue);
      returnStr += encodeURIComponent(name) + '=' + s;
      return returnStr;
    }
    function urlEncode(values) {
      values = formDataFromObject(values);
      let returnStr = '';
      values.forEach(function (value, key) {
        returnStr = appendParam(returnStr, key, value);
      });
      return returnStr;
    }
    function getHeaders(elt, target, prompt2) {
      const headers = {
        'HX-Request': 'true',
        'HX-Trigger': getRawAttribute(elt, 'id'),
        'HX-Trigger-Name': getRawAttribute(elt, 'name'),
        'HX-Target': getAttributeValue(target, 'id'),
        'HX-Current-URL': location.href,
      };
      getValuesForElement(elt, 'hx-headers', false, headers);
      if (prompt2 !== void 0) {
        headers['HX-Prompt'] = prompt2;
      }
      if (getInternalData(elt).boosted) {
        headers['HX-Boosted'] = 'true';
      }
      return headers;
    }
    function filterValues(inputValues, elt) {
      const paramsValue = getClosestAttributeValue(elt, 'hx-params');
      if (paramsValue) {
        if (paramsValue === 'none') {
          return new FormData();
        } else if (paramsValue === '*') {
          return inputValues;
        } else if (paramsValue.indexOf('not ') === 0) {
          forEach(paramsValue.slice(4).split(','), function (name) {
            name = name.trim();
            inputValues.delete(name);
          });
          return inputValues;
        } else {
          const newValues = new FormData();
          forEach(paramsValue.split(','), function (name) {
            name = name.trim();
            if (inputValues.has(name)) {
              inputValues.getAll(name).forEach(function (value) {
                newValues.append(name, value);
              });
            }
          });
          return newValues;
        }
      } else {
        return inputValues;
      }
    }
    function isAnchorLink(elt) {
      return !!getRawAttribute(elt, 'href') && getRawAttribute(elt, 'href').indexOf('#') >= 0;
    }
    function getSwapSpecification(elt, swapInfoOverride) {
      const swapInfo = swapInfoOverride || getClosestAttributeValue(elt, 'hx-swap');
      const swapSpec = {
        swapStyle: getInternalData(elt).boosted ? 'innerHTML' : htmx.config.defaultSwapStyle,
        swapDelay: htmx.config.defaultSwapDelay,
        settleDelay: htmx.config.defaultSettleDelay,
      };
      if (htmx.config.scrollIntoViewOnBoost && getInternalData(elt).boosted && !isAnchorLink(elt)) {
        swapSpec.show = 'top';
      }
      if (swapInfo) {
        const split = splitOnWhitespace(swapInfo);
        if (split.length > 0) {
          for (let i = 0; i < split.length; i++) {
            const value = split[i];
            if (value.indexOf('swap:') === 0) {
              swapSpec.swapDelay = parseInterval(value.slice(5));
            } else if (value.indexOf('settle:') === 0) {
              swapSpec.settleDelay = parseInterval(value.slice(7));
            } else if (value.indexOf('transition:') === 0) {
              swapSpec.transition = value.slice(11) === 'true';
            } else if (value.indexOf('ignoreTitle:') === 0) {
              swapSpec.ignoreTitle = value.slice(12) === 'true';
            } else if (value.indexOf('scroll:') === 0) {
              const scrollSpec = value.slice(7);
              var splitSpec = scrollSpec.split(':');
              const scrollVal = splitSpec.pop();
              var selectorVal = splitSpec.length > 0 ? splitSpec.join(':') : null;
              swapSpec.scroll = scrollVal;
              swapSpec.scrollTarget = selectorVal;
            } else if (value.indexOf('show:') === 0) {
              const showSpec = value.slice(5);
              var splitSpec = showSpec.split(':');
              const showVal = splitSpec.pop();
              var selectorVal = splitSpec.length > 0 ? splitSpec.join(':') : null;
              swapSpec.show = showVal;
              swapSpec.showTarget = selectorVal;
            } else if (value.indexOf('focus-scroll:') === 0) {
              const focusScrollVal = value.slice('focus-scroll:'.length);
              swapSpec.focusScroll = focusScrollVal == 'true';
            } else if (i == 0) {
              swapSpec.swapStyle = value;
            } else {
              logError('Unknown modifier in hx-swap: ' + value);
            }
          }
        }
      }
      return swapSpec;
    }
    function usesFormData(elt) {
      return (
        getClosestAttributeValue(elt, 'hx-encoding') === 'multipart/form-data' ||
        (matches(elt, 'form') && getRawAttribute(elt, 'enctype') === 'multipart/form-data')
      );
    }
    function encodeParamsForBody(xhr, elt, filteredParameters) {
      let encodedParameters = null;
      withExtensions(elt, function (extension) {
        if (encodedParameters == null) {
          encodedParameters = extension.encodeParameters(xhr, filteredParameters, elt);
        }
      });
      if (encodedParameters != null) {
        return encodedParameters;
      } else {
        if (usesFormData(elt)) {
          return overrideFormData(new FormData(), formDataFromObject(filteredParameters));
        } else {
          return urlEncode(filteredParameters);
        }
      }
    }
    function makeSettleInfo(target) {
      return { tasks: [], elts: [target] };
    }
    function updateScrollState(content, swapSpec) {
      const first = content[0];
      const last = content[content.length - 1];
      if (swapSpec.scroll) {
        var target = null;
        if (swapSpec.scrollTarget) {
          target = asElement(querySelectorExt(first, swapSpec.scrollTarget));
        }
        if (swapSpec.scroll === 'top' && (first || target)) {
          target = target || first;
          target.scrollTop = 0;
        }
        if (swapSpec.scroll === 'bottom' && (last || target)) {
          target = target || last;
          target.scrollTop = target.scrollHeight;
        }
        if (typeof swapSpec.scroll === 'number') {
          getWindow().setTimeout(function () {
            window.scrollTo(
              0,
              /** @type number */
              swapSpec.scroll
            );
          }, 0);
        }
      }
      if (swapSpec.show) {
        var target = null;
        if (swapSpec.showTarget) {
          let targetStr = swapSpec.showTarget;
          if (swapSpec.showTarget === 'window') {
            targetStr = 'body';
          }
          target = asElement(querySelectorExt(first, targetStr));
        }
        if (swapSpec.show === 'top' && (first || target)) {
          target = target || first;
          target.scrollIntoView({ block: 'start', behavior: htmx.config.scrollBehavior });
        }
        if (swapSpec.show === 'bottom' && (last || target)) {
          target = target || last;
          target.scrollIntoView({ block: 'end', behavior: htmx.config.scrollBehavior });
        }
      }
    }
    function getValuesForElement(elt, attr, evalAsDefault, values, event) {
      if (values == null) {
        values = {};
      }
      if (elt == null) {
        return values;
      }
      const attributeValue = getAttributeValue(elt, attr);
      if (attributeValue) {
        let str2 = attributeValue.trim();
        let evaluateValue = evalAsDefault;
        if (str2 === 'unset') {
          return null;
        }
        if (str2.indexOf('javascript:') === 0) {
          str2 = str2.slice(11);
          evaluateValue = true;
        } else if (str2.indexOf('js:') === 0) {
          str2 = str2.slice(3);
          evaluateValue = true;
        }
        if (str2.indexOf('{') !== 0) {
          str2 = '{' + str2 + '}';
        }
        let varsValues;
        if (evaluateValue) {
          varsValues = maybeEval(
            elt,
            function () {
              if (event) {
                return Function('event', 'return (' + str2 + ')').call(elt, event);
              } else {
                return Function('return (' + str2 + ')').call(elt);
              }
            },
            {}
          );
        } else {
          varsValues = parseJSON(str2);
        }
        for (const key in varsValues) {
          if (varsValues.hasOwnProperty(key)) {
            if (values[key] == null) {
              values[key] = varsValues[key];
            }
          }
        }
      }
      return getValuesForElement(asElement(parentElt(elt)), attr, evalAsDefault, values, event);
    }
    function maybeEval(elt, toEval, defaultVal) {
      if (htmx.config.allowEval) {
        return toEval();
      } else {
        triggerErrorEvent(elt, 'htmx:evalDisallowedError');
        return defaultVal;
      }
    }
    function getHXVarsForElement(elt, event, expressionVars) {
      return getValuesForElement(elt, 'hx-vars', true, expressionVars, event);
    }
    function getHXValsForElement(elt, event, expressionVars) {
      return getValuesForElement(elt, 'hx-vals', false, expressionVars, event);
    }
    function getExpressionVars(elt, event) {
      return mergeObjects(getHXVarsForElement(elt, event), getHXValsForElement(elt, event));
    }
    function safelySetHeaderValue(xhr, header, headerValue) {
      if (headerValue !== null) {
        try {
          xhr.setRequestHeader(header, headerValue);
        } catch (e) {
          xhr.setRequestHeader(header, encodeURIComponent(headerValue));
          xhr.setRequestHeader(header + '-URI-AutoEncoded', 'true');
        }
      }
    }
    function getPathFromResponse(xhr) {
      if (xhr.responseURL) {
        try {
          const url = new URL(xhr.responseURL);
          return url.pathname + url.search;
        } catch (e) {
          triggerErrorEvent(getDocument().body, 'htmx:badResponseUrl', { url: xhr.responseURL });
        }
      }
    }
    function hasHeader(xhr, regexp) {
      return regexp.test(xhr.getAllResponseHeaders());
    }
    function ajaxHelper(verb, path, context) {
      verb = /** @type HttpVerb */ verb.toLowerCase();
      if (context) {
        if (context instanceof Element || typeof context === 'string') {
          return issueAjaxRequest(verb, path, null, null, {
            targetOverride: resolveTarget(context) || DUMMY_ELT,
            returnPromise: true,
          });
        } else {
          let resolvedTarget = resolveTarget(context.target);
          if (
            (context.target && !resolvedTarget) ||
            (context.source && !resolvedTarget && !resolveTarget(context.source))
          ) {
            resolvedTarget = DUMMY_ELT;
          }
          return issueAjaxRequest(verb, path, resolveTarget(context.source), context.event, {
            handler: context.handler,
            headers: context.headers,
            values: context.values,
            targetOverride: resolvedTarget,
            swapOverride: context.swap,
            select: context.select,
            returnPromise: true,
          });
        }
      } else {
        return issueAjaxRequest(verb, path, null, null, {
          returnPromise: true,
        });
      }
    }
    function hierarchyForElt(elt) {
      const arr = [];
      while (elt) {
        arr.push(elt);
        elt = elt.parentElement;
      }
      return arr;
    }
    function verifyPath(elt, path, requestConfig) {
      const url = new URL(path, location.protocol !== 'about:' ? location.href : window.origin);
      const origin = location.protocol !== 'about:' ? location.origin : window.origin;
      const sameHost = origin === url.origin;
      if (htmx.config.selfRequestsOnly) {
        if (!sameHost) {
          return false;
        }
      }
      return triggerEvent(elt, 'htmx:validateUrl', mergeObjects({ url, sameHost }, requestConfig));
    }
    function formDataFromObject(obj) {
      if (obj instanceof FormData) return obj;
      const formData = new FormData();
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] && typeof obj[key].forEach === 'function') {
            obj[key].forEach(function (v) {
              formData.append(key, v);
            });
          } else if (typeof obj[key] === 'object' && !(obj[key] instanceof Blob)) {
            formData.append(key, JSON.stringify(obj[key]));
          } else {
            formData.append(key, obj[key]);
          }
        }
      }
      return formData;
    }
    function formDataArrayProxy(formData, name, array) {
      return new Proxy(array, {
        get: function (target, key) {
          if (typeof key === 'number') return target[key];
          if (key === 'length') return target.length;
          if (key === 'push') {
            return function (value) {
              target.push(value);
              formData.append(name, value);
            };
          }
          if (typeof target[key] === 'function') {
            return function () {
              target[key].apply(target, arguments);
              formData.delete(name);
              target.forEach(function (v) {
                formData.append(name, v);
              });
            };
          }
          if (target[key] && target[key].length === 1) {
            return target[key][0];
          } else {
            return target[key];
          }
        },
        set: function (target, index, value) {
          target[index] = value;
          formData.delete(name);
          target.forEach(function (v) {
            formData.append(name, v);
          });
          return true;
        },
      });
    }
    function formDataProxy(formData) {
      return new Proxy(formData, {
        get: function (target, name) {
          if (typeof name === 'symbol') {
            const result = Reflect.get(target, name);
            if (typeof result === 'function') {
              return function () {
                return result.apply(formData, arguments);
              };
            } else {
              return result;
            }
          }
          if (name === 'toJSON') {
            return () => Object.fromEntries(formData);
          }
          if (name in target) {
            if (typeof target[name] === 'function') {
              return function () {
                return formData[name].apply(formData, arguments);
              };
            }
          }
          const array = formData.getAll(name);
          if (array.length === 0) {
            return void 0;
          } else if (array.length === 1) {
            return array[0];
          } else {
            return formDataArrayProxy(target, name, array);
          }
        },
        set: function (target, name, value) {
          if (typeof name !== 'string') {
            return false;
          }
          target.delete(name);
          if (value && typeof value.forEach === 'function') {
            value.forEach(function (v) {
              target.append(name, v);
            });
          } else if (typeof value === 'object' && !(value instanceof Blob)) {
            target.append(name, JSON.stringify(value));
          } else {
            target.append(name, value);
          }
          return true;
        },
        deleteProperty: function (target, name) {
          if (typeof name === 'string') {
            target.delete(name);
          }
          return true;
        },
        // Support Object.assign call from proxy
        ownKeys: function (target) {
          return Reflect.ownKeys(Object.fromEntries(target));
        },
        getOwnPropertyDescriptor: function (target, prop) {
          return Reflect.getOwnPropertyDescriptor(Object.fromEntries(target), prop);
        },
      });
    }
    function issueAjaxRequest(verb, path, elt, event, etc, confirmed) {
      let resolve = null;
      let reject = null;
      etc = etc != null ? etc : {};
      if (etc.returnPromise && typeof Promise !== 'undefined') {
        var promise = new Promise(function (_resolve, _reject) {
          resolve = _resolve;
          reject = _reject;
        });
      }
      if (elt == null) {
        elt = getDocument().body;
      }
      const responseHandler = etc.handler || handleAjaxResponse;
      const select = etc.select || null;
      if (!bodyContains(elt)) {
        maybeCall(resolve);
        return promise;
      }
      const target = etc.targetOverride || asElement(getTarget(elt));
      if (target == null || target == DUMMY_ELT) {
        triggerErrorEvent(elt, 'htmx:targetError', {
          target: getClosestAttributeValue(elt, 'hx-target'),
        });
        maybeCall(reject);
        return promise;
      }
      let eltData = getInternalData(elt);
      const submitter = eltData.lastButtonClicked;
      if (submitter) {
        const buttonPath = getRawAttribute(submitter, 'formaction');
        if (buttonPath != null) {
          path = buttonPath;
        }
        const buttonVerb = getRawAttribute(submitter, 'formmethod');
        if (buttonVerb != null) {
          if (VERBS.includes(buttonVerb.toLowerCase())) {
            verb = /** @type HttpVerb */ buttonVerb;
          } else {
            maybeCall(resolve);
            return promise;
          }
        }
      }
      const confirmQuestion = getClosestAttributeValue(elt, 'hx-confirm');
      if (confirmed === void 0) {
        const issueRequest = function (skipConfirmation) {
          return issueAjaxRequest(verb, path, elt, event, etc, !!skipConfirmation);
        };
        const confirmDetails = {
          target,
          elt,
          path,
          verb,
          triggeringEvent: event,
          etc,
          issueRequest,
          question: confirmQuestion,
        };
        if (triggerEvent(elt, 'htmx:confirm', confirmDetails) === false) {
          maybeCall(resolve);
          return promise;
        }
      }
      let syncElt = elt;
      let syncStrategy = getClosestAttributeValue(elt, 'hx-sync');
      let queueStrategy = null;
      let abortable = false;
      if (syncStrategy) {
        const syncStrings = syncStrategy.split(':');
        const selector = syncStrings[0].trim();
        if (selector === 'this') {
          syncElt = findThisElement(elt, 'hx-sync');
        } else {
          syncElt = asElement(querySelectorExt(elt, selector));
        }
        syncStrategy = (syncStrings[1] || 'drop').trim();
        eltData = getInternalData(syncElt);
        if (syncStrategy === 'drop' && eltData.xhr && eltData.abortable !== true) {
          maybeCall(resolve);
          return promise;
        } else if (syncStrategy === 'abort') {
          if (eltData.xhr) {
            maybeCall(resolve);
            return promise;
          } else {
            abortable = true;
          }
        } else if (syncStrategy === 'replace') {
          triggerEvent(syncElt, 'htmx:abort');
        } else if (syncStrategy.indexOf('queue') === 0) {
          const queueStrArray = syncStrategy.split(' ');
          queueStrategy = (queueStrArray[1] || 'last').trim();
        }
      }
      if (eltData.xhr) {
        if (eltData.abortable) {
          triggerEvent(syncElt, 'htmx:abort');
        } else {
          if (queueStrategy == null) {
            if (event) {
              const eventData = getInternalData(event);
              if (eventData && eventData.triggerSpec && eventData.triggerSpec.queue) {
                queueStrategy = eventData.triggerSpec.queue;
              }
            }
            if (queueStrategy == null) {
              queueStrategy = 'last';
            }
          }
          if (eltData.queuedRequests == null) {
            eltData.queuedRequests = [];
          }
          if (queueStrategy === 'first' && eltData.queuedRequests.length === 0) {
            eltData.queuedRequests.push(function () {
              issueAjaxRequest(verb, path, elt, event, etc);
            });
          } else if (queueStrategy === 'all') {
            eltData.queuedRequests.push(function () {
              issueAjaxRequest(verb, path, elt, event, etc);
            });
          } else if (queueStrategy === 'last') {
            eltData.queuedRequests = [];
            eltData.queuedRequests.push(function () {
              issueAjaxRequest(verb, path, elt, event, etc);
            });
          }
          maybeCall(resolve);
          return promise;
        }
      }
      const xhr = new XMLHttpRequest();
      eltData.xhr = xhr;
      eltData.abortable = abortable;
      const endRequestLock = function () {
        eltData.xhr = null;
        eltData.abortable = false;
        if (eltData.queuedRequests != null && eltData.queuedRequests.length > 0) {
          const queuedRequest = eltData.queuedRequests.shift();
          queuedRequest();
        }
      };
      const promptQuestion = getClosestAttributeValue(elt, 'hx-prompt');
      if (promptQuestion) {
        var promptResponse = prompt(promptQuestion);
        if (
          promptResponse === null ||
          !triggerEvent(elt, 'htmx:prompt', { prompt: promptResponse, target })
        ) {
          maybeCall(resolve);
          endRequestLock();
          return promise;
        }
      }
      if (confirmQuestion && !confirmed) {
        if (!confirm(confirmQuestion)) {
          maybeCall(resolve);
          endRequestLock();
          return promise;
        }
      }
      let headers = getHeaders(elt, target, promptResponse);
      if (verb !== 'get' && !usesFormData(elt)) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      if (etc.headers) {
        headers = mergeObjects(headers, etc.headers);
      }
      const results = getInputValues(elt, verb);
      let errors = results.errors;
      const rawFormData = results.formData;
      if (etc.values) {
        overrideFormData(rawFormData, formDataFromObject(etc.values));
      }
      const expressionVars = formDataFromObject(getExpressionVars(elt, event));
      const allFormData = overrideFormData(rawFormData, expressionVars);
      let filteredFormData = filterValues(allFormData, elt);
      if (htmx.config.getCacheBusterParam && verb === 'get') {
        filteredFormData.set('org.htmx.cache-buster', getRawAttribute(target, 'id') || 'true');
      }
      if (path == null || path === '') {
        path = location.href;
      }
      const requestAttrValues = getValuesForElement(elt, 'hx-request');
      const eltIsBoosted = getInternalData(elt).boosted;
      let useUrlParams = htmx.config.methodsThatUseUrlParams.indexOf(verb) >= 0;
      const requestConfig = {
        boosted: eltIsBoosted,
        useUrlParams,
        formData: filteredFormData,
        parameters: formDataProxy(filteredFormData),
        unfilteredFormData: allFormData,
        unfilteredParameters: formDataProxy(allFormData),
        headers,
        elt,
        target,
        verb,
        errors,
        withCredentials:
          etc.credentials || requestAttrValues.credentials || htmx.config.withCredentials,
        timeout: etc.timeout || requestAttrValues.timeout || htmx.config.timeout,
        path,
        triggeringEvent: event,
      };
      if (!triggerEvent(elt, 'htmx:configRequest', requestConfig)) {
        maybeCall(resolve);
        endRequestLock();
        return promise;
      }
      path = requestConfig.path;
      verb = requestConfig.verb;
      headers = requestConfig.headers;
      filteredFormData = formDataFromObject(requestConfig.parameters);
      errors = requestConfig.errors;
      useUrlParams = requestConfig.useUrlParams;
      if (errors && errors.length > 0) {
        triggerEvent(elt, 'htmx:validation:halted', requestConfig);
        maybeCall(resolve);
        endRequestLock();
        return promise;
      }
      const splitPath = path.split('#');
      const pathNoAnchor = splitPath[0];
      const anchor = splitPath[1];
      let finalPath = path;
      if (useUrlParams) {
        finalPath = pathNoAnchor;
        const hasValues = !filteredFormData.keys().next().done;
        if (hasValues) {
          if (finalPath.indexOf('?') < 0) {
            finalPath += '?';
          } else {
            finalPath += '&';
          }
          finalPath += urlEncode(filteredFormData);
          if (anchor) {
            finalPath += '#' + anchor;
          }
        }
      }
      if (!verifyPath(elt, finalPath, requestConfig)) {
        triggerErrorEvent(elt, 'htmx:invalidPath', requestConfig);
        maybeCall(reject);
        endRequestLock();
        return promise;
      }
      xhr.open(verb.toUpperCase(), finalPath, true);
      xhr.overrideMimeType('text/html');
      xhr.withCredentials = requestConfig.withCredentials;
      xhr.timeout = requestConfig.timeout;
      if (requestAttrValues.noHeaders) {
      } else {
        for (const header in headers) {
          if (headers.hasOwnProperty(header)) {
            const headerValue = headers[header];
            safelySetHeaderValue(xhr, header, headerValue);
          }
        }
      }
      const responseInfo = {
        xhr,
        target,
        requestConfig,
        etc,
        boosted: eltIsBoosted,
        select,
        pathInfo: {
          requestPath: path,
          finalRequestPath: finalPath,
          responsePath: null,
          anchor,
        },
      };
      xhr.onload = function () {
        try {
          const hierarchy = hierarchyForElt(elt);
          responseInfo.pathInfo.responsePath = getPathFromResponse(xhr);
          responseHandler(elt, responseInfo);
          if (responseInfo.keepIndicators !== true) {
            removeRequestIndicators(indicators, disableElts);
          }
          triggerEvent(elt, 'htmx:afterRequest', responseInfo);
          triggerEvent(elt, 'htmx:afterOnLoad', responseInfo);
          if (!bodyContains(elt)) {
            let secondaryTriggerElt = null;
            while (hierarchy.length > 0 && secondaryTriggerElt == null) {
              const parentEltInHierarchy = hierarchy.shift();
              if (bodyContains(parentEltInHierarchy)) {
                secondaryTriggerElt = parentEltInHierarchy;
              }
            }
            if (secondaryTriggerElt) {
              triggerEvent(secondaryTriggerElt, 'htmx:afterRequest', responseInfo);
              triggerEvent(secondaryTriggerElt, 'htmx:afterOnLoad', responseInfo);
            }
          }
          maybeCall(resolve);
        } catch (e) {
          triggerErrorEvent(elt, 'htmx:onLoadError', mergeObjects({ error: e }, responseInfo));
          throw e;
        } finally {
          endRequestLock();
        }
      };
      xhr.onerror = function () {
        removeRequestIndicators(indicators, disableElts);
        triggerErrorEvent(elt, 'htmx:afterRequest', responseInfo);
        triggerErrorEvent(elt, 'htmx:sendError', responseInfo);
        maybeCall(reject);
        endRequestLock();
      };
      xhr.onabort = function () {
        removeRequestIndicators(indicators, disableElts);
        triggerErrorEvent(elt, 'htmx:afterRequest', responseInfo);
        triggerErrorEvent(elt, 'htmx:sendAbort', responseInfo);
        maybeCall(reject);
        endRequestLock();
      };
      xhr.ontimeout = function () {
        removeRequestIndicators(indicators, disableElts);
        triggerErrorEvent(elt, 'htmx:afterRequest', responseInfo);
        triggerErrorEvent(elt, 'htmx:timeout', responseInfo);
        maybeCall(reject);
        endRequestLock();
      };
      if (!triggerEvent(elt, 'htmx:beforeRequest', responseInfo)) {
        maybeCall(resolve);
        endRequestLock();
        return promise;
      }
      var indicators = addRequestIndicatorClasses(elt);
      var disableElts = disableElements(elt);
      forEach(['loadstart', 'loadend', 'progress', 'abort'], function (eventName) {
        forEach([xhr, xhr.upload], function (target2) {
          target2.addEventListener(eventName, function (event2) {
            triggerEvent(elt, 'htmx:xhr:' + eventName, {
              lengthComputable: event2.lengthComputable,
              loaded: event2.loaded,
              total: event2.total,
            });
          });
        });
      });
      triggerEvent(elt, 'htmx:beforeSend', responseInfo);
      const params = useUrlParams ? null : encodeParamsForBody(xhr, elt, filteredFormData);
      xhr.send(params);
      return promise;
    }
    function determineHistoryUpdates(elt, responseInfo) {
      const xhr = responseInfo.xhr;
      let pathFromHeaders = null;
      let typeFromHeaders = null;
      if (hasHeader(xhr, /HX-Push:/i)) {
        pathFromHeaders = xhr.getResponseHeader('HX-Push');
        typeFromHeaders = 'push';
      } else if (hasHeader(xhr, /HX-Push-Url:/i)) {
        pathFromHeaders = xhr.getResponseHeader('HX-Push-Url');
        typeFromHeaders = 'push';
      } else if (hasHeader(xhr, /HX-Replace-Url:/i)) {
        pathFromHeaders = xhr.getResponseHeader('HX-Replace-Url');
        typeFromHeaders = 'replace';
      }
      if (pathFromHeaders) {
        if (pathFromHeaders === 'false') {
          return {};
        } else {
          return {
            type: typeFromHeaders,
            path: pathFromHeaders,
          };
        }
      }
      const requestPath = responseInfo.pathInfo.finalRequestPath;
      const responsePath = responseInfo.pathInfo.responsePath;
      const pushUrl = getClosestAttributeValue(elt, 'hx-push-url');
      const replaceUrl = getClosestAttributeValue(elt, 'hx-replace-url');
      const elementIsBoosted = getInternalData(elt).boosted;
      let saveType = null;
      let path = null;
      if (pushUrl) {
        saveType = 'push';
        path = pushUrl;
      } else if (replaceUrl) {
        saveType = 'replace';
        path = replaceUrl;
      } else if (elementIsBoosted) {
        saveType = 'push';
        path = responsePath || requestPath;
      }
      if (path) {
        if (path === 'false') {
          return {};
        }
        if (path === 'true') {
          path = responsePath || requestPath;
        }
        if (responseInfo.pathInfo.anchor && path.indexOf('#') === -1) {
          path = path + '#' + responseInfo.pathInfo.anchor;
        }
        return {
          type: saveType,
          path,
        };
      } else {
        return {};
      }
    }
    function codeMatches(responseHandlingConfig, status) {
      var regExp = new RegExp(responseHandlingConfig.code);
      return regExp.test(status.toString(10));
    }
    function resolveResponseHandling(xhr) {
      for (var i = 0; i < htmx.config.responseHandling.length; i++) {
        var responseHandlingElement = htmx.config.responseHandling[i];
        if (codeMatches(responseHandlingElement, xhr.status)) {
          return responseHandlingElement;
        }
      }
      return {
        swap: false,
      };
    }
    function handleTitle(title) {
      if (title) {
        const titleElt = find('title');
        if (titleElt) {
          titleElt.textContent = title;
        } else {
          window.document.title = title;
        }
      }
    }
    function resolveRetarget(elt, target) {
      if (target === 'this') {
        return elt;
      }
      const resolvedTarget = asElement(querySelectorExt(elt, target));
      if (resolvedTarget == null) {
        triggerErrorEvent(elt, 'htmx:targetError', { target });
        throw new Error(`Invalid re-target ${target}`);
      }
      return resolvedTarget;
    }
    function handleAjaxResponse(elt, responseInfo) {
      const xhr = responseInfo.xhr;
      let target = responseInfo.target;
      const etc = responseInfo.etc;
      const responseInfoSelect = responseInfo.select;
      if (!triggerEvent(elt, 'htmx:beforeOnLoad', responseInfo)) return;
      if (hasHeader(xhr, /HX-Trigger:/i)) {
        handleTriggerHeader(xhr, 'HX-Trigger', elt);
      }
      if (hasHeader(xhr, /HX-Location:/i)) {
        saveCurrentPageToHistory();
        let redirectPath = xhr.getResponseHeader('HX-Location');
        var redirectSwapSpec;
        if (redirectPath.indexOf('{') === 0) {
          redirectSwapSpec = parseJSON(redirectPath);
          redirectPath = redirectSwapSpec.path;
          delete redirectSwapSpec.path;
        }
        ajaxHelper('get', redirectPath, redirectSwapSpec).then(function () {
          pushUrlIntoHistory(redirectPath);
        });
        return;
      }
      const shouldRefresh =
        hasHeader(xhr, /HX-Refresh:/i) && xhr.getResponseHeader('HX-Refresh') === 'true';
      if (hasHeader(xhr, /HX-Redirect:/i)) {
        responseInfo.keepIndicators = true;
        htmx.location.href = xhr.getResponseHeader('HX-Redirect');
        shouldRefresh && htmx.location.reload();
        return;
      }
      if (shouldRefresh) {
        responseInfo.keepIndicators = true;
        htmx.location.reload();
        return;
      }
      const historyUpdate = determineHistoryUpdates(elt, responseInfo);
      const responseHandling = resolveResponseHandling(xhr);
      const shouldSwap = responseHandling.swap;
      let isError = !!responseHandling.error;
      let ignoreTitle = htmx.config.ignoreTitle || responseHandling.ignoreTitle;
      let selectOverride = responseHandling.select;
      if (responseHandling.target) {
        responseInfo.target = resolveRetarget(elt, responseHandling.target);
      }
      var swapOverride = etc.swapOverride;
      if (swapOverride == null && responseHandling.swapOverride) {
        swapOverride = responseHandling.swapOverride;
      }
      if (hasHeader(xhr, /HX-Retarget:/i)) {
        responseInfo.target = resolveRetarget(elt, xhr.getResponseHeader('HX-Retarget'));
      }
      if (hasHeader(xhr, /HX-Reswap:/i)) {
        swapOverride = xhr.getResponseHeader('HX-Reswap');
      }
      var serverResponse = xhr.response;
      var beforeSwapDetails = mergeObjects(
        {
          shouldSwap,
          serverResponse,
          isError,
          ignoreTitle,
          selectOverride,
          swapOverride,
        },
        responseInfo
      );
      if (
        responseHandling.event &&
        !triggerEvent(target, responseHandling.event, beforeSwapDetails)
      )
        return;
      if (!triggerEvent(target, 'htmx:beforeSwap', beforeSwapDetails)) return;
      target = beforeSwapDetails.target;
      serverResponse = beforeSwapDetails.serverResponse;
      isError = beforeSwapDetails.isError;
      ignoreTitle = beforeSwapDetails.ignoreTitle;
      selectOverride = beforeSwapDetails.selectOverride;
      swapOverride = beforeSwapDetails.swapOverride;
      responseInfo.target = target;
      responseInfo.failed = isError;
      responseInfo.successful = !isError;
      if (beforeSwapDetails.shouldSwap) {
        if (xhr.status === 286) {
          cancelPolling(elt);
        }
        withExtensions(elt, function (extension) {
          serverResponse = extension.transformResponse(serverResponse, xhr, elt);
        });
        if (historyUpdate.type) {
          saveCurrentPageToHistory();
        }
        var swapSpec = getSwapSpecification(elt, swapOverride);
        if (!swapSpec.hasOwnProperty('ignoreTitle')) {
          swapSpec.ignoreTitle = ignoreTitle;
        }
        target.classList.add(htmx.config.swappingClass);
        if (responseInfoSelect) {
          selectOverride = responseInfoSelect;
        }
        if (hasHeader(xhr, /HX-Reselect:/i)) {
          selectOverride = xhr.getResponseHeader('HX-Reselect');
        }
        const selectOOB = getClosestAttributeValue(elt, 'hx-select-oob');
        const select = getClosestAttributeValue(elt, 'hx-select');
        swap(target, serverResponse, swapSpec, {
          select: selectOverride === 'unset' ? null : selectOverride || select,
          selectOOB,
          eventInfo: responseInfo,
          anchor: responseInfo.pathInfo.anchor,
          contextElement: elt,
          afterSwapCallback: function () {
            if (hasHeader(xhr, /HX-Trigger-After-Swap:/i)) {
              let finalElt = elt;
              if (!bodyContains(elt)) {
                finalElt = getDocument().body;
              }
              handleTriggerHeader(xhr, 'HX-Trigger-After-Swap', finalElt);
            }
          },
          afterSettleCallback: function () {
            if (hasHeader(xhr, /HX-Trigger-After-Settle:/i)) {
              let finalElt = elt;
              if (!bodyContains(elt)) {
                finalElt = getDocument().body;
              }
              handleTriggerHeader(xhr, 'HX-Trigger-After-Settle', finalElt);
            }
          },
          beforeSwapCallback: function () {
            if (historyUpdate.type) {
              triggerEvent(
                getDocument().body,
                'htmx:beforeHistoryUpdate',
                mergeObjects({ history: historyUpdate }, responseInfo)
              );
              if (historyUpdate.type === 'push') {
                pushUrlIntoHistory(historyUpdate.path);
                triggerEvent(getDocument().body, 'htmx:pushedIntoHistory', {
                  path: historyUpdate.path,
                });
              } else {
                replaceUrlInHistory(historyUpdate.path);
                triggerEvent(getDocument().body, 'htmx:replacedInHistory', {
                  path: historyUpdate.path,
                });
              }
            }
          },
        });
      }
      if (isError) {
        triggerErrorEvent(
          elt,
          'htmx:responseError',
          mergeObjects(
            {
              error:
                'Response Status Error Code ' +
                xhr.status +
                ' from ' +
                responseInfo.pathInfo.requestPath,
            },
            responseInfo
          )
        );
      }
    }
    const extensions = {};
    function extensionBase() {
      return {
        init: function (api) {
          return null;
        },
        getSelectors: function () {
          return null;
        },
        onEvent: function (name, evt) {
          return true;
        },
        transformResponse: function (text, xhr, elt) {
          return text;
        },
        isInlineSwap: function (swapStyle) {
          return false;
        },
        handleSwap: function (swapStyle, target, fragment, settleInfo) {
          return false;
        },
        encodeParameters: function (xhr, parameters, elt) {
          return null;
        },
      };
    }
    function defineExtension(name, extension) {
      if (extension.init) {
        extension.init(internalAPI);
      }
      extensions[name] = mergeObjects(extensionBase(), extension);
    }
    function removeExtension(name) {
      delete extensions[name];
    }
    function getExtensions(elt, extensionsToReturn, extensionsToIgnore) {
      if (extensionsToReturn == void 0) {
        extensionsToReturn = [];
      }
      if (elt == void 0) {
        return extensionsToReturn;
      }
      if (extensionsToIgnore == void 0) {
        extensionsToIgnore = [];
      }
      const extensionsForElement = getAttributeValue(elt, 'hx-ext');
      if (extensionsForElement) {
        forEach(extensionsForElement.split(','), function (extensionName) {
          extensionName = extensionName.replace(/ /g, '');
          if (extensionName.slice(0, 7) == 'ignore:') {
            extensionsToIgnore.push(extensionName.slice(7));
            return;
          }
          if (extensionsToIgnore.indexOf(extensionName) < 0) {
            const extension = extensions[extensionName];
            if (extension && extensionsToReturn.indexOf(extension) < 0) {
              extensionsToReturn.push(extension);
            }
          }
        });
      }
      return getExtensions(asElement(parentElt(elt)), extensionsToReturn, extensionsToIgnore);
    }
    var isReady = false;
    getDocument().addEventListener('DOMContentLoaded', function () {
      isReady = true;
    });
    function ready(fn) {
      if (isReady || getDocument().readyState === 'complete') {
        fn();
      } else {
        getDocument().addEventListener('DOMContentLoaded', fn);
      }
    }
    function insertIndicatorStyles() {
      if (htmx.config.includeIndicatorStyles !== false) {
        const nonceAttribute = htmx.config.inlineStyleNonce
          ? ` nonce="${htmx.config.inlineStyleNonce}"`
          : '';
        const indicator = htmx.config.indicatorClass;
        const request = htmx.config.requestClass;
        getDocument().head.insertAdjacentHTML(
          'beforeend',
          `<style${nonceAttribute}>.${indicator}{opacity:0;visibility: hidden} .${request} .${indicator}, .${request}.${indicator}{opacity:1;visibility: visible;transition: opacity 200ms ease-in}</style>`
        );
      }
    }
    function getMetaConfig() {
      const element = getDocument().querySelector('meta[name="htmx-config"]');
      if (element) {
        return parseJSON(element.content);
      } else {
        return null;
      }
    }
    function mergeMetaConfig() {
      const metaConfig = getMetaConfig();
      if (metaConfig) {
        htmx.config = mergeObjects(htmx.config, metaConfig);
      }
    }
    ready(function () {
      mergeMetaConfig();
      insertIndicatorStyles();
      let body = getDocument().body;
      processNode(body);
      const restoredElts = getDocument().querySelectorAll(
        "[hx-trigger='restored'],[data-hx-trigger='restored']"
      );
      body.addEventListener('htmx:abort', function (evt) {
        const target = evt.target;
        const internalData = getInternalData(target);
        if (internalData && internalData.xhr) {
          internalData.xhr.abort();
        }
      });
      const originalPopstate = window.onpopstate ? window.onpopstate.bind(window) : null;
      window.onpopstate = function (event) {
        if (event.state && event.state.htmx) {
          restoreHistory();
          forEach(restoredElts, function (elt) {
            triggerEvent(elt, 'htmx:restored', {
              document: getDocument(),
              triggerEvent,
            });
          });
        } else {
          if (originalPopstate) {
            originalPopstate(event);
          }
        }
      };
      getWindow().setTimeout(function () {
        triggerEvent(body, 'htmx:load', {});
        body = null;
      }, 0);
    });
    return htmx;
  })();
  var htmx_esm_default = htmx2;

  // node_modules/htmx-ext-loading-states/dist/loading-states.esm.js
  (function () {
    const loadingStatesUndoQueue = [];
    function loadingStateContainer(target) {
      return htmx_esm_default.closest(target, '[data-loading-states]') || document.body;
    }
    function mayProcessUndoCallback(target, callback) {
      if (document.body.contains(target)) {
        callback();
      }
    }
    function mayProcessLoadingStateByPath(elt, requestPath) {
      const pathElt = htmx_esm_default.closest(elt, '[data-loading-path]');
      if (!pathElt) {
        return true;
      }
      return pathElt.getAttribute('data-loading-path') === requestPath;
    }
    function queueLoadingState(sourceElt, targetElt, doCallback, undoCallback) {
      const delayElt = htmx_esm_default.closest(sourceElt, '[data-loading-delay]');
      if (delayElt) {
        const delayInMilliseconds = delayElt.getAttribute('data-loading-delay') || 200;
        const timeout = setTimeout(function () {
          doCallback();
          loadingStatesUndoQueue.push(function () {
            mayProcessUndoCallback(targetElt, undoCallback);
          });
        }, delayInMilliseconds);
        loadingStatesUndoQueue.push(function () {
          mayProcessUndoCallback(targetElt, function () {
            clearTimeout(timeout);
          });
        });
      } else {
        doCallback();
        loadingStatesUndoQueue.push(function () {
          mayProcessUndoCallback(targetElt, undoCallback);
        });
      }
    }
    function getLoadingStateElts(loadingScope, type, path) {
      return Array.from(htmx_esm_default.findAll(loadingScope, '[' + type + ']')).filter(
        function (elt) {
          return mayProcessLoadingStateByPath(elt, path);
        }
      );
    }
    function getLoadingTarget(elt) {
      if (elt.getAttribute('data-loading-target')) {
        return Array.from(htmx_esm_default.findAll(elt.getAttribute('data-loading-target')));
      }
      return [elt];
    }
    htmx_esm_default.defineExtension('loading-states', {
      onEvent: function (name, evt) {
        if (name === 'htmx:beforeRequest') {
          const container = loadingStateContainer(evt.target);
          const loadingStateTypes = [
            'data-loading',
            'data-loading-class',
            'data-loading-class-remove',
            'data-loading-disable',
            'data-loading-aria-busy',
          ];
          const loadingStateEltsByType = {};
          loadingStateTypes.forEach(function (type) {
            loadingStateEltsByType[type] = getLoadingStateElts(
              container,
              type,
              evt.detail.pathInfo.requestPath
            );
          });
          loadingStateEltsByType['data-loading'].forEach(function (sourceElt) {
            getLoadingTarget(sourceElt).forEach(function (targetElt) {
              queueLoadingState(
                sourceElt,
                targetElt,
                function () {
                  targetElt.style.display =
                    sourceElt.getAttribute('data-loading') || 'inline-block';
                },
                function () {
                  targetElt.style.display = 'none';
                }
              );
            });
          });
          loadingStateEltsByType['data-loading-class'].forEach(function (sourceElt) {
            const classNames = sourceElt.getAttribute('data-loading-class').split(' ');
            getLoadingTarget(sourceElt).forEach(function (targetElt) {
              queueLoadingState(
                sourceElt,
                targetElt,
                function () {
                  classNames.forEach(function (className) {
                    targetElt.classList.add(className);
                  });
                },
                function () {
                  classNames.forEach(function (className) {
                    targetElt.classList.remove(className);
                  });
                }
              );
            });
          });
          loadingStateEltsByType['data-loading-class-remove'].forEach(function (sourceElt) {
            const classNames = sourceElt.getAttribute('data-loading-class-remove').split(' ');
            getLoadingTarget(sourceElt).forEach(function (targetElt) {
              queueLoadingState(
                sourceElt,
                targetElt,
                function () {
                  classNames.forEach(function (className) {
                    targetElt.classList.remove(className);
                  });
                },
                function () {
                  classNames.forEach(function (className) {
                    targetElt.classList.add(className);
                  });
                }
              );
            });
          });
          loadingStateEltsByType['data-loading-disable'].forEach(function (sourceElt) {
            getLoadingTarget(sourceElt).forEach(function (targetElt) {
              queueLoadingState(
                sourceElt,
                targetElt,
                function () {
                  targetElt.disabled = true;
                },
                function () {
                  targetElt.disabled = false;
                }
              );
            });
          });
          loadingStateEltsByType['data-loading-aria-busy'].forEach(function (sourceElt) {
            getLoadingTarget(sourceElt).forEach(function (targetElt) {
              queueLoadingState(
                sourceElt,
                targetElt,
                function () {
                  targetElt.setAttribute('aria-busy', 'true');
                },
                function () {
                  targetElt.removeAttribute('aria-busy');
                }
              );
            });
          });
        }
        if (name === 'htmx:beforeOnLoad') {
          while (loadingStatesUndoQueue.length > 0) {
            loadingStatesUndoQueue.shift()();
          }
        }
      },
    });
  })();

  // src/frontend/htmx-bundle.ts
  globalThis.htmx = htmx_esm_default;
  if (globalThis.htmx === void 0) {
    console.error('[HTMX Bundle] Failed to load HTMX');
  } else {
    console.info('[HTMX Bundle] HTMX 2.0.7 loaded successfully');
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL2h0bXgub3JnL2Rpc3QvaHRteC5lc20uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL2h0bXgtZXh0LWxvYWRpbmctc3RhdGVzL2Rpc3QvbG9hZGluZy1zdGF0ZXMuZXNtLmpzIiwgIi4uLy4uL3NyYy9mcm9udGVuZC9odG14LWJ1bmRsZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsidmFyIGh0bXggPSAoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0J1xuXG4gIC8vIFB1YmxpYyBBUElcbiAgY29uc3QgaHRteCA9IHtcbiAgICAvLyBUc2MgbWFkbmVzcyBoZXJlLCBhc3NpZ25pbmcgdGhlIGZ1bmN0aW9ucyBkaXJlY3RseSByZXN1bHRzIGluIGFuIGludmFsaWQgVHlwZVNjcmlwdCBvdXRwdXQsIGJ1dCByZWFzc2lnbmluZyBpcyBmaW5lXG4gICAgLyogRXZlbnQgcHJvY2Vzc2luZyAqL1xuICAgIC8qKiBAdHlwZSB7dHlwZW9mIG9uTG9hZEhlbHBlcn0gKi9cbiAgICBvbkxvYWQ6IG51bGwsXG4gICAgLyoqIEB0eXBlIHt0eXBlb2YgcHJvY2Vzc05vZGV9ICovXG4gICAgcHJvY2VzczogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiBhZGRFdmVudExpc3RlbmVySW1wbH0gKi9cbiAgICBvbjogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiByZW1vdmVFdmVudExpc3RlbmVySW1wbH0gKi9cbiAgICBvZmY6IG51bGwsXG4gICAgLyoqIEB0eXBlIHt0eXBlb2YgdHJpZ2dlckV2ZW50fSAqL1xuICAgIHRyaWdnZXI6IG51bGwsXG4gICAgLyoqIEB0eXBlIHt0eXBlb2YgYWpheEhlbHBlcn0gKi9cbiAgICBhamF4OiBudWxsLFxuICAgIC8qIERPTSBxdWVyeWluZyBoZWxwZXJzICovXG4gICAgLyoqIEB0eXBlIHt0eXBlb2YgZmluZH0gKi9cbiAgICBmaW5kOiBudWxsLFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIGZpbmRBbGx9ICovXG4gICAgZmluZEFsbDogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiBjbG9zZXN0fSAqL1xuICAgIGNsb3Nlc3Q6IG51bGwsXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5wdXQgdmFsdWVzIHRoYXQgd291bGQgcmVzb2x2ZSBmb3IgYSBnaXZlbiBlbGVtZW50IHZpYSB0aGUgaHRteCB2YWx1ZSByZXNvbHV0aW9uIG1lY2hhbmlzbVxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jdmFsdWVzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdCB0aGUgZWxlbWVudCB0byByZXNvbHZlIHZhbHVlcyBvblxuICAgICAqIEBwYXJhbSB7SHR0cFZlcmJ9IHR5cGUgdGhlIHJlcXVlc3QgdHlwZSAoZS5nLiAqKmdldCoqIG9yICoqcG9zdCoqKSBub24tR0VUJ3Mgd2lsbCBpbmNsdWRlIHRoZSBlbmNsb3NpbmcgZm9ybSBvZiB0aGUgZWxlbWVudC4gRGVmYXVsdHMgdG8gKipwb3N0KipcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHZhbHVlczogZnVuY3Rpb24oZWx0LCB0eXBlKSB7XG4gICAgICBjb25zdCBpbnB1dFZhbHVlcyA9IGdldElucHV0VmFsdWVzKGVsdCwgdHlwZSB8fCAncG9zdCcpXG4gICAgICByZXR1cm4gaW5wdXRWYWx1ZXMudmFsdWVzXG4gICAgfSxcbiAgICAvKiBET00gbWFuaXB1bGF0aW9uIGhlbHBlcnMgKi9cbiAgICAvKiogQHR5cGUge3R5cGVvZiByZW1vdmVFbGVtZW50fSAqL1xuICAgIHJlbW92ZTogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiBhZGRDbGFzc1RvRWxlbWVudH0gKi9cbiAgICBhZGRDbGFzczogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiByZW1vdmVDbGFzc0Zyb21FbGVtZW50fSAqL1xuICAgIHJlbW92ZUNsYXNzOiBudWxsLFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIHRvZ2dsZUNsYXNzT25FbGVtZW50fSAqL1xuICAgIHRvZ2dsZUNsYXNzOiBudWxsLFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIHRha2VDbGFzc0ZvckVsZW1lbnR9ICovXG4gICAgdGFrZUNsYXNzOiBudWxsLFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIHN3YXB9ICovXG4gICAgc3dhcDogbnVsbCxcbiAgICAvKiBFeHRlbnNpb24gZW50cnlwb2ludHMgKi9cbiAgICAvKiogQHR5cGUge3R5cGVvZiBkZWZpbmVFeHRlbnNpb259ICovXG4gICAgZGVmaW5lRXh0ZW5zaW9uOiBudWxsLFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIHJlbW92ZUV4dGVuc2lvbn0gKi9cbiAgICByZW1vdmVFeHRlbnNpb246IG51bGwsXG4gICAgLyogRGVidWdnaW5nICovXG4gICAgLyoqIEB0eXBlIHt0eXBlb2YgbG9nQWxsfSAqL1xuICAgIGxvZ0FsbDogbnVsbCxcbiAgICAvKiogQHR5cGUge3R5cGVvZiBsb2dOb25lfSAqL1xuICAgIGxvZ05vbmU6IG51bGwsXG4gICAgLyogRGVidWdnaW5nICovXG4gICAgLyoqXG4gICAgICogVGhlIGxvZ2dlciBodG14IHVzZXMgdG8gbG9nIHdpdGhcbiAgICAgKlxuICAgICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI2xvZ2dlclxuICAgICAqL1xuICAgIGxvZ2dlcjogbnVsbCxcbiAgICAvKipcbiAgICAgKiBBIHByb3BlcnR5IGhvbGRpbmcgdGhlIGNvbmZpZ3VyYXRpb24gaHRteCB1c2VzIGF0IHJ1bnRpbWUuXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgdXNpbmcgYSBbbWV0YSB0YWddKGh0dHBzOi8vaHRteC5vcmcvZG9jcy8jY29uZmlnKSBpcyB0aGUgcHJlZmVycmVkIG1lY2hhbmlzbSBmb3Igc2V0dGluZyB0aGVzZSBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jY29uZmlnXG4gICAgICovXG4gICAgY29uZmlnOiB7XG4gICAgICAvKipcbiAgICAgICAqIFdoZXRoZXIgdG8gdXNlIGhpc3RvcnkuXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgKi9cbiAgICAgIGhpc3RvcnlFbmFibGVkOiB0cnVlLFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbnVtYmVyIG9mIHBhZ2VzIHRvIGtlZXAgaW4gKipzZXNzaW9uU3RvcmFnZSoqIGZvciBoaXN0b3J5IHN1cHBvcnQuXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqIEBkZWZhdWx0IDEwXG4gICAgICAgKi9cbiAgICAgIGhpc3RvcnlDYWNoZVNpemU6IDEwLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICovXG4gICAgICByZWZyZXNoT25IaXN0b3J5TWlzczogZmFsc2UsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBkZWZhdWx0IHN3YXAgc3R5bGUgdG8gdXNlIGlmICoqW2h4LXN3YXBdKGh0dHBzOi8vaHRteC5vcmcvYXR0cmlidXRlcy9oeC1zd2FwKSoqIGlzIG9taXR0ZWQuXG4gICAgICAgKiBAdHlwZSBIdG14U3dhcFN0eWxlXG4gICAgICAgKiBAZGVmYXVsdCAnaW5uZXJIVE1MJ1xuICAgICAgICovXG4gICAgICBkZWZhdWx0U3dhcFN0eWxlOiAnaW5uZXJIVE1MJyxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlZmF1bHQgZGVsYXkgYmV0d2VlbiByZWNlaXZpbmcgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIgYW5kIGRvaW5nIHRoZSBzd2FwLlxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKiBAZGVmYXVsdCAwXG4gICAgICAgKi9cbiAgICAgIGRlZmF1bHRTd2FwRGVsYXk6IDAsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBkZWZhdWx0IGRlbGF5IGJldHdlZW4gY29tcGxldGluZyB0aGUgY29udGVudCBzd2FwIGFuZCBzZXR0bGluZyBhdHRyaWJ1dGVzLlxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKiBAZGVmYXVsdCAyMFxuICAgICAgICovXG4gICAgICBkZWZhdWx0U2V0dGxlRGVsYXk6IDIwLFxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCBodG14IHdpbGwgaW5qZWN0IGEgc21hbGwgYW1vdW50IG9mIENTUyBpbnRvIHRoZSBwYWdlIHRvIG1ha2UgaW5kaWNhdG9ycyBpbnZpc2libGUgdW5sZXNzIHRoZSAqKmh0bXgtaW5kaWNhdG9yKiogY2xhc3MgaXMgcHJlc2VudC5cbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgICAqL1xuICAgICAgaW5jbHVkZUluZGljYXRvclN0eWxlczogdHJ1ZSxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGNsYXNzIHRvIHBsYWNlIG9uIGluZGljYXRvcnMgd2hlbiBhIHJlcXVlc3QgaXMgaW4gZmxpZ2h0LlxuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKiBAZGVmYXVsdCAnaHRteC1pbmRpY2F0b3InXG4gICAgICAgKi9cbiAgICAgIGluZGljYXRvckNsYXNzOiAnaHRteC1pbmRpY2F0b3InLFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgY2xhc3MgdG8gcGxhY2Ugb24gdHJpZ2dlcmluZyBlbGVtZW50cyB3aGVuIGEgcmVxdWVzdCBpcyBpbiBmbGlnaHQuXG4gICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAqIEBkZWZhdWx0ICdodG14LXJlcXVlc3QnXG4gICAgICAgKi9cbiAgICAgIHJlcXVlc3RDbGFzczogJ2h0bXgtcmVxdWVzdCcsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBjbGFzcyB0byB0ZW1wb3JhcmlseSBwbGFjZSBvbiBlbGVtZW50cyB0aGF0IGh0bXggaGFzIGFkZGVkIHRvIHRoZSBET00uXG4gICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAqIEBkZWZhdWx0ICdodG14LWFkZGVkJ1xuICAgICAgICovXG4gICAgICBhZGRlZENsYXNzOiAnaHRteC1hZGRlZCcsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBjbGFzcyB0byBwbGFjZSBvbiB0YXJnZXQgZWxlbWVudHMgd2hlbiBodG14IGlzIGluIHRoZSBzZXR0bGluZyBwaGFzZS5cbiAgICAgICAqIEB0eXBlIHN0cmluZ1xuICAgICAgICogQGRlZmF1bHQgJ2h0bXgtc2V0dGxpbmcnXG4gICAgICAgKi9cbiAgICAgIHNldHRsaW5nQ2xhc3M6ICdodG14LXNldHRsaW5nJyxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGNsYXNzIHRvIHBsYWNlIG9uIHRhcmdldCBlbGVtZW50cyB3aGVuIGh0bXggaXMgaW4gdGhlIHN3YXBwaW5nIHBoYXNlLlxuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKiBAZGVmYXVsdCAnaHRteC1zd2FwcGluZydcbiAgICAgICAqL1xuICAgICAgc3dhcHBpbmdDbGFzczogJ2h0bXgtc3dhcHBpbmcnLFxuICAgICAgLyoqXG4gICAgICAgKiBBbGxvd3MgdGhlIHVzZSBvZiBldmFsLWxpa2UgZnVuY3Rpb25hbGl0eSBpbiBodG14LCB0byBlbmFibGUgKipoeC12YXJzKiosIHRyaWdnZXIgY29uZGl0aW9ucyAmIHNjcmlwdCB0YWcgZXZhbHVhdGlvbi4gQ2FuIGJlIHNldCB0byAqKmZhbHNlKiogZm9yIENTUCBjb21wYXRpYmlsaXR5LlxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICovXG4gICAgICBhbGxvd0V2YWw6IHRydWUsXG4gICAgICAvKipcbiAgICAgICAqIElmIHNldCB0byBmYWxzZSwgZGlzYWJsZXMgdGhlIGludGVycHJldGF0aW9uIG9mIHNjcmlwdCB0YWdzLlxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICovXG4gICAgICBhbGxvd1NjcmlwdFRhZ3M6IHRydWUsXG4gICAgICAvKipcbiAgICAgICAqIElmIHNldCwgdGhlIG5vbmNlIHdpbGwgYmUgYWRkZWQgdG8gaW5saW5lIHNjcmlwdHMuXG4gICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAqIEBkZWZhdWx0ICcnXG4gICAgICAgKi9cbiAgICAgIGlubGluZVNjcmlwdE5vbmNlOiAnJyxcbiAgICAgIC8qKlxuICAgICAgICogSWYgc2V0LCB0aGUgbm9uY2Ugd2lsbCBiZSBhZGRlZCB0byBpbmxpbmUgc3R5bGVzLlxuICAgICAgICogQHR5cGUgc3RyaW5nXG4gICAgICAgKiBAZGVmYXVsdCAnJ1xuICAgICAgICovXG4gICAgICBpbmxpbmVTdHlsZU5vbmNlOiAnJyxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGF0dHJpYnV0ZXMgdG8gc2V0dGxlIGR1cmluZyB0aGUgc2V0dGxpbmcgcGhhc2UuXG4gICAgICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgICAgICogQGRlZmF1bHQgWydjbGFzcycsICdzdHlsZScsICd3aWR0aCcsICdoZWlnaHQnXVxuICAgICAgICovXG4gICAgICBhdHRyaWJ1dGVzVG9TZXR0bGU6IFsnY2xhc3MnLCAnc3R5bGUnLCAnd2lkdGgnLCAnaGVpZ2h0J10sXG4gICAgICAvKipcbiAgICAgICAqIEFsbG93IGNyb3NzLXNpdGUgQWNjZXNzLUNvbnRyb2wgcmVxdWVzdHMgdXNpbmcgY3JlZGVudGlhbHMgc3VjaCBhcyBjb29raWVzLCBhdXRob3JpemF0aW9uIGhlYWRlcnMgb3IgVExTIGNsaWVudCBjZXJ0aWZpY2F0ZXMuXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICovXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAqL1xuICAgICAgdGltZW91dDogMCxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgKipnZXRXZWJTb2NrZXRSZWNvbm5lY3REZWxheSoqIGZvciByZWNvbm5lY3RpbmcgYWZ0ZXIgdW5leHBlY3RlZCBjb25uZWN0aW9uIGxvc3MgYnkgdGhlIGV2ZW50IGNvZGUgKipBYm5vcm1hbCBDbG9zdXJlKiosICoqU2VydmljZSBSZXN0YXJ0Kiogb3IgKipUcnkgQWdhaW4gTGF0ZXIqKi5cbiAgICAgICAqIEB0eXBlIHsnZnVsbC1qaXR0ZXInIHwgKChyZXRyeUNvdW50Om51bWJlcikgPT4gbnVtYmVyKX1cbiAgICAgICAqIEBkZWZhdWx0IFwiZnVsbC1qaXR0ZXJcIlxuICAgICAgICovXG4gICAgICB3c1JlY29ubmVjdERlbGF5OiAnZnVsbC1qaXR0ZXInLFxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgdHlwZSBvZiBiaW5hcnkgZGF0YSBiZWluZyByZWNlaXZlZCBvdmVyIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvblxuICAgICAgICogQHR5cGUgQmluYXJ5VHlwZVxuICAgICAgICogQGRlZmF1bHQgJ2Jsb2InXG4gICAgICAgKi9cbiAgICAgIHdzQmluYXJ5VHlwZTogJ2Jsb2InLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZSBzdHJpbmdcbiAgICAgICAqIEBkZWZhdWx0ICdbaHgtZGlzYWJsZV0sIFtkYXRhLWh4LWRpc2FibGVdJ1xuICAgICAgICovXG4gICAgICBkaXNhYmxlU2VsZWN0b3I6ICdbaHgtZGlzYWJsZV0sIFtkYXRhLWh4LWRpc2FibGVdJyxcbiAgICAgIC8qKlxuICAgICAgICogQHR5cGUgeydhdXRvJyB8ICdpbnN0YW50JyB8ICdzbW9vdGgnfVxuICAgICAgICogQGRlZmF1bHQgJ2luc3RhbnQnXG4gICAgICAgKi9cbiAgICAgIHNjcm9sbEJlaGF2aW9yOiAnaW5zdGFudCcsXG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSBmb2N1c2VkIGVsZW1lbnQgc2hvdWxkIGJlIHNjcm9sbGVkIGludG8gdmlldy5cbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgKi9cbiAgICAgIGRlZmF1bHRGb2N1c1Njcm9sbDogZmFsc2UsXG4gICAgICAvKipcbiAgICAgICAqIElmIHNldCB0byB0cnVlIGh0bXggd2lsbCBpbmNsdWRlIGEgY2FjaGUtYnVzdGluZyBwYXJhbWV0ZXIgaW4gR0VUIHJlcXVlc3RzIHRvIGF2b2lkIGNhY2hpbmcgcGFydGlhbCByZXNwb25zZXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgKi9cbiAgICAgIGdldENhY2hlQnVzdGVyUGFyYW06IGZhbHNlLFxuICAgICAgLyoqXG4gICAgICAgKiBJZiBzZXQgdG8gdHJ1ZSwgaHRteCB3aWxsIHVzZSB0aGUgVmlldyBUcmFuc2l0aW9uIEFQSSB3aGVuIHN3YXBwaW5nIGluIG5ldyBjb250ZW50LlxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAqL1xuICAgICAgZ2xvYmFsVmlld1RyYW5zaXRpb25zOiBmYWxzZSxcbiAgICAgIC8qKlxuICAgICAgICogaHRteCB3aWxsIGZvcm1hdCByZXF1ZXN0cyB3aXRoIHRoZXNlIG1ldGhvZHMgYnkgZW5jb2RpbmcgdGhlaXIgcGFyYW1ldGVycyBpbiB0aGUgVVJMLCBub3QgdGhlIHJlcXVlc3QgYm9keVxuICAgICAgICogQHR5cGUgeyhIdHRwVmVyYilbXX1cbiAgICAgICAqIEBkZWZhdWx0IFsnZ2V0JywgJ2RlbGV0ZSddXG4gICAgICAgKi9cbiAgICAgIG1ldGhvZHNUaGF0VXNlVXJsUGFyYW1zOiBbJ2dldCcsICdkZWxldGUnXSxcbiAgICAgIC8qKlxuICAgICAgICogSWYgc2V0IHRvIHRydWUsIGRpc2FibGVzIGh0bXgtYmFzZWQgcmVxdWVzdHMgdG8gbm9uLW9yaWdpbiBob3N0cy5cbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgKi9cbiAgICAgIHNlbGZSZXF1ZXN0c09ubHk6IHRydWUsXG4gICAgICAvKipcbiAgICAgICAqIElmIHNldCB0byB0cnVlIGh0bXggd2lsbCBub3QgdXBkYXRlIHRoZSB0aXRsZSBvZiB0aGUgZG9jdW1lbnQgd2hlbiBhIHRpdGxlIHRhZyBpcyBmb3VuZCBpbiBuZXcgY29udGVudFxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAqL1xuICAgICAgaWdub3JlVGl0bGU6IGZhbHNlLFxuICAgICAgLyoqXG4gICAgICAgKiBXaGV0aGVyIHRoZSB0YXJnZXQgb2YgYSBib29zdGVkIGVsZW1lbnQgaXMgc2Nyb2xsZWQgaW50byB0aGUgdmlld3BvcnQuXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgKi9cbiAgICAgIHNjcm9sbEludG9WaWV3T25Cb29zdDogdHJ1ZSxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIGNhY2hlIHRvIHN0b3JlIGV2YWx1YXRlZCB0cmlnZ2VyIHNwZWNpZmljYXRpb25zIGludG8uXG4gICAgICAgKiBZb3UgbWF5IGRlZmluZSBhIHNpbXBsZSBvYmplY3QgdG8gdXNlIGEgbmV2ZXItY2xlYXJpbmcgY2FjaGUsIG9yIGltcGxlbWVudCB5b3VyIG93biBzeXN0ZW0gdXNpbmcgYSBbcHJveHkgb2JqZWN0XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSlcbiAgICAgICAqIEB0eXBlIHtPYmplY3R8bnVsbH1cbiAgICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgICAqL1xuICAgICAgdHJpZ2dlclNwZWNzQ2FjaGU6IG51bGwsXG4gICAgICAvKiogQHR5cGUgYm9vbGVhbiAqL1xuICAgICAgZGlzYWJsZUluaGVyaXRhbmNlOiBmYWxzZSxcbiAgICAgIC8qKiBAdHlwZSBIdG14UmVzcG9uc2VIYW5kbGluZ0NvbmZpZ1tdICovXG4gICAgICByZXNwb25zZUhhbmRsaW5nOiBbXG4gICAgICAgIHsgY29kZTogJzIwNCcsIHN3YXA6IGZhbHNlIH0sXG4gICAgICAgIHsgY29kZTogJ1syM10uLicsIHN3YXA6IHRydWUgfSxcbiAgICAgICAgeyBjb2RlOiAnWzQ1XS4uJywgc3dhcDogZmFsc2UsIGVycm9yOiB0cnVlIH1cbiAgICAgIF0sXG4gICAgICAvKipcbiAgICAgICAqIFdoZXRoZXIgdG8gcHJvY2VzcyBPT0Igc3dhcHMgb24gZWxlbWVudHMgdGhhdCBhcmUgbmVzdGVkIHdpdGhpbiB0aGUgbWFpbiByZXNwb25zZSBlbGVtZW50LlxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICovXG4gICAgICBhbGxvd05lc3RlZE9vYlN3YXBzOiB0cnVlLFxuICAgICAgLyoqXG4gICAgICAgKiBXaGV0aGVyIHRvIHRyZWF0IGhpc3RvcnkgY2FjaGUgbWlzcyBmdWxsIHBhZ2UgcmVsb2FkIHJlcXVlc3RzIGFzIGEgXCJIWC1SZXF1ZXN0XCIgYnkgcmV0dXJuaW5nIHRoaXMgcmVzcG9uc2UgaGVhZGVyXG4gICAgICAgKiBUaGlzIHNob3VsZCBhbHdheXMgYmUgZGlzYWJsZWQgd2hlbiB1c2luZyBIWC1SZXF1ZXN0IGhlYWRlciB0byBvcHRpb25hbGx5IHJldHVybiBwYXJ0aWFsIHJlc3BvbnNlc1xuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICovXG4gICAgICBoaXN0b3J5UmVzdG9yZUFzSHhSZXF1ZXN0OiB0cnVlLFxuICAgICAgLyoqXG4gICAgICAgKiBXZWF0aGVyIHRvIHJlcG9ydCBpbnB1dCB2YWxpZGF0aW9uIGVycm9ycyB0byB0aGUgZW5kIHVzZXIgYW5kIHVwZGF0ZSBmb2N1cyB0byB0aGUgZmlyc3QgaW5wdXQgdGhhdCBmYWlscyB2YWxpZGF0aW9uLlxuICAgICAgICogVGhpcyBzaG91bGQgYWx3YXlzIGJlIGVuYWJsZWQgYXMgdGhpcyBtYXRjaGVzIGRlZmF1bHQgYnJvd3NlciBmb3JtIHN1Ym1pdCBiZWhhdmlvdXJcbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgKi9cbiAgICAgIHJlcG9ydFZhbGlkaXR5T2ZGb3JtczogZmFsc2VcbiAgICB9LFxuICAgIC8qKiBAdHlwZSB7dHlwZW9mIHBhcnNlSW50ZXJ2YWx9ICovXG4gICAgcGFyc2VJbnRlcnZhbDogbnVsbCxcbiAgICAvKipcbiAgICAgKiBwcm94eSBvZiB3aW5kb3cubG9jYXRpb24gdXNlZCBmb3IgcGFnZSByZWxvYWQgZnVuY3Rpb25zXG4gICAgICogQHR5cGUgbG9jYXRpb25cbiAgICAgKi9cbiAgICBsb2NhdGlvbixcbiAgICAvKiogQHR5cGUge3R5cGVvZiBpbnRlcm5hbEV2YWx9ICovXG4gICAgXzogbnVsbCxcbiAgICB2ZXJzaW9uOiAnMi4wLjcnXG4gIH1cbiAgLy8gVHNjIG1hZG5lc3MgcGFydCAyXG4gIGh0bXgub25Mb2FkID0gb25Mb2FkSGVscGVyXG4gIGh0bXgucHJvY2VzcyA9IHByb2Nlc3NOb2RlXG4gIGh0bXgub24gPSBhZGRFdmVudExpc3RlbmVySW1wbFxuICBodG14Lm9mZiA9IHJlbW92ZUV2ZW50TGlzdGVuZXJJbXBsXG4gIGh0bXgudHJpZ2dlciA9IHRyaWdnZXJFdmVudFxuICBodG14LmFqYXggPSBhamF4SGVscGVyXG4gIGh0bXguZmluZCA9IGZpbmRcbiAgaHRteC5maW5kQWxsID0gZmluZEFsbFxuICBodG14LmNsb3Nlc3QgPSBjbG9zZXN0XG4gIGh0bXgucmVtb3ZlID0gcmVtb3ZlRWxlbWVudFxuICBodG14LmFkZENsYXNzID0gYWRkQ2xhc3NUb0VsZW1lbnRcbiAgaHRteC5yZW1vdmVDbGFzcyA9IHJlbW92ZUNsYXNzRnJvbUVsZW1lbnRcbiAgaHRteC50b2dnbGVDbGFzcyA9IHRvZ2dsZUNsYXNzT25FbGVtZW50XG4gIGh0bXgudGFrZUNsYXNzID0gdGFrZUNsYXNzRm9yRWxlbWVudFxuICBodG14LnN3YXAgPSBzd2FwXG4gIGh0bXguZGVmaW5lRXh0ZW5zaW9uID0gZGVmaW5lRXh0ZW5zaW9uXG4gIGh0bXgucmVtb3ZlRXh0ZW5zaW9uID0gcmVtb3ZlRXh0ZW5zaW9uXG4gIGh0bXgubG9nQWxsID0gbG9nQWxsXG4gIGh0bXgubG9nTm9uZSA9IGxvZ05vbmVcbiAgaHRteC5wYXJzZUludGVydmFsID0gcGFyc2VJbnRlcnZhbFxuICBodG14Ll8gPSBpbnRlcm5hbEV2YWxcblxuICBjb25zdCBpbnRlcm5hbEFQSSA9IHtcbiAgICBhZGRUcmlnZ2VySGFuZGxlcixcbiAgICBib2R5Q29udGFpbnMsXG4gICAgY2FuQWNjZXNzTG9jYWxTdG9yYWdlLFxuICAgIGZpbmRUaGlzRWxlbWVudCxcbiAgICBmaWx0ZXJWYWx1ZXMsXG4gICAgc3dhcCxcbiAgICBoYXNBdHRyaWJ1dGUsXG4gICAgZ2V0QXR0cmlidXRlVmFsdWUsXG4gICAgZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlLFxuICAgIGdldENsb3Nlc3RNYXRjaCxcbiAgICBnZXRFeHByZXNzaW9uVmFycyxcbiAgICBnZXRIZWFkZXJzLFxuICAgIGdldElucHV0VmFsdWVzLFxuICAgIGdldEludGVybmFsRGF0YSxcbiAgICBnZXRTd2FwU3BlY2lmaWNhdGlvbixcbiAgICBnZXRUcmlnZ2VyU3BlY3MsXG4gICAgZ2V0VGFyZ2V0LFxuICAgIG1ha2VGcmFnbWVudCxcbiAgICBtZXJnZU9iamVjdHMsXG4gICAgbWFrZVNldHRsZUluZm8sXG4gICAgb29iU3dhcCxcbiAgICBxdWVyeVNlbGVjdG9yRXh0LFxuICAgIHNldHRsZUltbWVkaWF0ZWx5LFxuICAgIHNob3VsZENhbmNlbCxcbiAgICB0cmlnZ2VyRXZlbnQsXG4gICAgdHJpZ2dlckVycm9yRXZlbnQsXG4gICAgd2l0aEV4dGVuc2lvbnNcbiAgfVxuXG4gIGNvbnN0IFZFUkJTID0gWydnZXQnLCAncG9zdCcsICdwdXQnLCAnZGVsZXRlJywgJ3BhdGNoJ11cbiAgY29uc3QgVkVSQl9TRUxFQ1RPUiA9IFZFUkJTLm1hcChmdW5jdGlvbih2ZXJiKSB7XG4gICAgcmV0dXJuICdbaHgtJyArIHZlcmIgKyAnXSwgW2RhdGEtaHgtJyArIHZlcmIgKyAnXSdcbiAgfSkuam9pbignLCAnKVxuXG4gIC8vPSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFV0aWxpdGllc1xuICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW4gaW50ZXJ2YWwgc3RyaW5nIGNvbnNpc3RlbnQgd2l0aCB0aGUgd2F5IGh0bXggZG9lcy4gVXNlZnVsIGZvciBwbHVnaW5zIHRoYXQgaGF2ZSB0aW1pbmctcmVsYXRlZCBhdHRyaWJ1dGVzLlxuICAgKlxuICAgKiBDYXV0aW9uOiBBY2NlcHRzIGFuIGludCBmb2xsb3dlZCBieSBlaXRoZXIgKipzKiogb3IgKiptcyoqLiBBbGwgb3RoZXIgdmFsdWVzIHVzZSAqKnBhcnNlRmxvYXQqKlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNwYXJzZUludGVydmFsXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgdGltaW5nIHN0cmluZ1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfHVuZGVmaW5lZH1cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlSW50ZXJ2YWwoc3RyKSB7XG4gICAgaWYgKHN0ciA9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBsZXQgaW50ZXJ2YWwgPSBOYU5cbiAgICBpZiAoc3RyLnNsaWNlKC0yKSA9PSAnbXMnKSB7XG4gICAgICBpbnRlcnZhbCA9IHBhcnNlRmxvYXQoc3RyLnNsaWNlKDAsIC0yKSlcbiAgICB9IGVsc2UgaWYgKHN0ci5zbGljZSgtMSkgPT0gJ3MnKSB7XG4gICAgICBpbnRlcnZhbCA9IHBhcnNlRmxvYXQoc3RyLnNsaWNlKDAsIC0xKSkgKiAxMDAwXG4gICAgfSBlbHNlIGlmIChzdHIuc2xpY2UoLTEpID09ICdtJykge1xuICAgICAgaW50ZXJ2YWwgPSBwYXJzZUZsb2F0KHN0ci5zbGljZSgwLCAtMSkpICogMTAwMCAqIDYwXG4gICAgfSBlbHNlIHtcbiAgICAgIGludGVydmFsID0gcGFyc2VGbG9hdChzdHIpXG4gICAgfVxuICAgIHJldHVybiBpc05hTihpbnRlcnZhbCkgPyB1bmRlZmluZWQgOiBpbnRlcnZhbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWx0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEByZXR1cm5zIHsoc3RyaW5nIHwgbnVsbCl9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRSYXdBdHRyaWJ1dGUoZWx0LCBuYW1lKSB7XG4gICAgcmV0dXJuIGVsdCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZWx0LmdldEF0dHJpYnV0ZShuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdWFsaWZpZWROYW1lXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgLy8gcmVzb2x2ZSB3aXRoIGJvdGggaHggYW5kIGRhdGEtaHggcHJlZml4ZXNcbiAgZnVuY3Rpb24gaGFzQXR0cmlidXRlKGVsdCwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiAhIWVsdC5oYXNBdHRyaWJ1dGUgJiYgKGVsdC5oYXNBdHRyaWJ1dGUocXVhbGlmaWVkTmFtZSkgfHxcbiAgICAgIGVsdC5oYXNBdHRyaWJ1dGUoJ2RhdGEtJyArIHF1YWxpZmllZE5hbWUpKVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWx0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdWFsaWZpZWROYW1lXG4gICAqIEByZXR1cm5zIHsoc3RyaW5nIHwgbnVsbCl9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVWYWx1ZShlbHQsIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZ2V0UmF3QXR0cmlidXRlKGVsdCwgcXVhbGlmaWVkTmFtZSkgfHwgZ2V0UmF3QXR0cmlidXRlKGVsdCwgJ2RhdGEtJyArIHF1YWxpZmllZE5hbWUpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBlbHRcbiAgICogQHJldHVybnMge05vZGUgfCBudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gcGFyZW50RWx0KGVsdCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGVsdC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKCFwYXJlbnQgJiYgZWx0LnBhcmVudE5vZGUgaW5zdGFuY2VvZiBTaGFkb3dSb290KSByZXR1cm4gZWx0LnBhcmVudE5vZGVcbiAgICByZXR1cm4gcGFyZW50XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0RvY3VtZW50fVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0RG9jdW1lbnQoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBlbHRcbiAgICogQHBhcmFtIHtib29sZWFufSBnbG9iYWxcbiAgICogQHJldHVybnMge05vZGV8RG9jdW1lbnR9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRSb290Tm9kZShlbHQsIGdsb2JhbCkge1xuICAgIHJldHVybiBlbHQuZ2V0Um9vdE5vZGUgPyBlbHQuZ2V0Um9vdE5vZGUoeyBjb21wb3NlZDogZ2xvYmFsIH0pIDogZ2V0RG9jdW1lbnQoKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWx0XG4gICAqIEBwYXJhbSB7KGU6Tm9kZSkgPT4gYm9vbGVhbn0gY29uZGl0aW9uXG4gICAqIEByZXR1cm5zIHtOb2RlIHwgbnVsbH1cbiAgICovXG4gIGZ1bmN0aW9uIGdldENsb3Nlc3RNYXRjaChlbHQsIGNvbmRpdGlvbikge1xuICAgIHdoaWxlIChlbHQgJiYgIWNvbmRpdGlvbihlbHQpKSB7XG4gICAgICBlbHQgPSBwYXJlbnRFbHQoZWx0KVxuICAgIH1cblxuICAgIHJldHVybiBlbHQgfHwgbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gaW5pdGlhbEVsZW1lbnRcbiAgICogQHBhcmFtIHtFbGVtZW50fSBhbmNlc3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlTmFtZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRBdHRyaWJ1dGVWYWx1ZVdpdGhEaXNpbmhlcml0YW5jZShpbml0aWFsRWxlbWVudCwgYW5jZXN0b3IsIGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IGdldEF0dHJpYnV0ZVZhbHVlKGFuY2VzdG9yLCBhdHRyaWJ1dGVOYW1lKVxuICAgIGNvbnN0IGRpc2luaGVyaXQgPSBnZXRBdHRyaWJ1dGVWYWx1ZShhbmNlc3RvciwgJ2h4LWRpc2luaGVyaXQnKVxuICAgIHZhciBpbmhlcml0ID0gZ2V0QXR0cmlidXRlVmFsdWUoYW5jZXN0b3IsICdoeC1pbmhlcml0JylcbiAgICBpZiAoaW5pdGlhbEVsZW1lbnQgIT09IGFuY2VzdG9yKSB7XG4gICAgICBpZiAoaHRteC5jb25maWcuZGlzYWJsZUluaGVyaXRhbmNlKSB7XG4gICAgICAgIGlmIChpbmhlcml0ICYmIChpbmhlcml0ID09PSAnKicgfHwgaW5oZXJpdC5zcGxpdCgnICcpLmluZGV4T2YoYXR0cmlidXRlTmFtZSkgPj0gMCkpIHtcbiAgICAgICAgICByZXR1cm4gYXR0cmlidXRlVmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGlzaW5oZXJpdCAmJiAoZGlzaW5oZXJpdCA9PT0gJyonIHx8IGRpc2luaGVyaXQuc3BsaXQoJyAnKS5pbmRleE9mKGF0dHJpYnV0ZU5hbWUpID49IDApKSB7XG4gICAgICAgIHJldHVybiAndW5zZXQnXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhdHRyaWJ1dGVWYWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGVOYW1lXG4gICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlKGVsdCwgYXR0cmlidXRlTmFtZSkge1xuICAgIGxldCBjbG9zZXN0QXR0ciA9IG51bGxcbiAgICBnZXRDbG9zZXN0TWF0Y2goZWx0LCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gISEoY2xvc2VzdEF0dHIgPSBnZXRBdHRyaWJ1dGVWYWx1ZVdpdGhEaXNpbmhlcml0YW5jZShlbHQsIGFzRWxlbWVudChlKSwgYXR0cmlidXRlTmFtZSkpXG4gICAgfSlcbiAgICBpZiAoY2xvc2VzdEF0dHIgIT09ICd1bnNldCcpIHtcbiAgICAgIHJldHVybiBjbG9zZXN0QXR0clxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3JcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBtYXRjaGVzKGVsdCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZWx0IGluc3RhbmNlb2YgRWxlbWVudCAmJiBlbHQubWF0Y2hlcyhzZWxlY3RvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGFydFRhZyhzdHIpIHtcbiAgICBjb25zdCB0YWdNYXRjaGVyID0gLzwoW2Etel1bXlxcL1xcMD5cXHgyMFxcdFxcclxcblxcZl0qKS9pXG4gICAgY29uc3QgbWF0Y2ggPSB0YWdNYXRjaGVyLmV4ZWMoc3RyKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hdGNoWzFdLnRvTG93ZXJDYXNlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwXG4gICAqIEByZXR1cm5zIHtEb2N1bWVudH1cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlSFRNTChyZXNwKSB7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpXG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZUZyb21TdHJpbmcocmVzcCwgJ3RleHQvaHRtbCcpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge05vZGV9IGVsdFxuICAgKi9cbiAgZnVuY3Rpb24gdGFrZUNoaWxkcmVuRm9yKGZyYWdtZW50LCBlbHQpIHtcbiAgICB3aGlsZSAoZWx0LmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgZnJhZ21lbnQuYXBwZW5kKGVsdC5jaGlsZE5vZGVzWzBdKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0hUTUxTY3JpcHRFbGVtZW50fSBzY3JpcHRcbiAgICogQHJldHVybnMge0hUTUxTY3JpcHRFbGVtZW50fVxuICAgKi9cbiAgZnVuY3Rpb24gZHVwbGljYXRlU2NyaXB0KHNjcmlwdCkge1xuICAgIGNvbnN0IG5ld1NjcmlwdCA9IGdldERvY3VtZW50KCkuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBmb3JFYWNoKHNjcmlwdC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBuZXdTY3JpcHQuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSlcbiAgICB9KVxuICAgIG5ld1NjcmlwdC50ZXh0Q29udGVudCA9IHNjcmlwdC50ZXh0Q29udGVudFxuICAgIG5ld1NjcmlwdC5hc3luYyA9IGZhbHNlXG4gICAgaWYgKGh0bXguY29uZmlnLmlubGluZVNjcmlwdE5vbmNlKSB7XG4gICAgICBuZXdTY3JpcHQubm9uY2UgPSBodG14LmNvbmZpZy5pbmxpbmVTY3JpcHROb25jZVxuICAgIH1cbiAgICByZXR1cm4gbmV3U2NyaXB0XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtIVE1MU2NyaXB0RWxlbWVudH0gc2NyaXB0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNKYXZhU2NyaXB0U2NyaXB0Tm9kZShzY3JpcHQpIHtcbiAgICByZXR1cm4gc2NyaXB0Lm1hdGNoZXMoJ3NjcmlwdCcpICYmIChzY3JpcHQudHlwZSA9PT0gJ3RleHQvamF2YXNjcmlwdCcgfHwgc2NyaXB0LnR5cGUgPT09ICdtb2R1bGUnIHx8IHNjcmlwdC50eXBlID09PSAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiB3ZSBoYXZlIHRvIG1ha2UgbmV3IGNvcGllcyBvZiBzY3JpcHQgdGFncyB0aGF0IHdlIGFyZSBnb2luZyB0byBpbnNlcnQgYmVjYXVzZVxuICAgKiBTT01FIGJyb3dzZXJzIChub3Qgc2F5aW5nIHdobywgYnV0IGl0IGludm9sdmVzIGFuIGVsZW1lbnQgYW5kIGFuIGFuaW1hbCkgZG9uJ3RcbiAgICogZXhlY3V0ZSBzY3JpcHRzIGNyZWF0ZWQgaW4gPHRlbXBsYXRlPiB0YWdzIHdoZW4gdGhleSBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgRE9NXG4gICAqIGFuZCBhbGwgdGhlIG90aGVycyBkbyBsbWFvXG4gICAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudH0gZnJhZ21lbnRcbiAgICovXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVNjcmlwdFRhZ3MoZnJhZ21lbnQpIHtcbiAgICBBcnJheS5mcm9tKGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NjcmlwdCcpKS5mb3JFYWNoKC8qKiBAcGFyYW0ge0hUTUxTY3JpcHRFbGVtZW50fSBzY3JpcHQgKi8gKHNjcmlwdCkgPT4ge1xuICAgICAgaWYgKGlzSmF2YVNjcmlwdFNjcmlwdE5vZGUoc2NyaXB0KSkge1xuICAgICAgICBjb25zdCBuZXdTY3JpcHQgPSBkdXBsaWNhdGVTY3JpcHQoc2NyaXB0KVxuICAgICAgICBjb25zdCBwYXJlbnQgPSBzY3JpcHQucGFyZW50Tm9kZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobmV3U2NyaXB0LCBzY3JpcHQpXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2dFcnJvcihlKVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7RG9jdW1lbnRGcmFnbWVudCAmIHt0aXRsZT86IHN0cmluZ319IERvY3VtZW50RnJhZ21lbnRXaXRoVGl0bGVcbiAgICogQGRlc2NyaXB0aW9uICBhIGRvY3VtZW50IGZyYWdtZW50IHJlcHJlc2VudGluZyB0aGUgcmVzcG9uc2UgSFRNTCwgaW5jbHVkaW5nXG4gICAqIGEgYHRpdGxlYCBwcm9wZXJ0eSBmb3IgYW55IHRpdGxlIGluZm9ybWF0aW9uIGZvdW5kXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2UgSFRNTFxuICAgKiBAcmV0dXJucyB7RG9jdW1lbnRGcmFnbWVudFdpdGhUaXRsZX1cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VGcmFnbWVudChyZXNwb25zZSkge1xuICAgIC8vIHN0cmlwIGhlYWQgdGFnIHRvIGRldGVybWluZSBzaGFwZSBvZiByZXNwb25zZSB3ZSBhcmUgZGVhbGluZyB3aXRoXG4gICAgY29uc3QgcmVzcG9uc2VXaXRoTm9IZWFkID0gcmVzcG9uc2UucmVwbGFjZSgvPGhlYWQoXFxzW14+XSopPz5bXFxzXFxTXSo/PFxcL2hlYWQ+L2ksICcnKVxuICAgIGNvbnN0IHN0YXJ0VGFnID0gZ2V0U3RhcnRUYWcocmVzcG9uc2VXaXRoTm9IZWFkKVxuICAgIC8qKiBAdHlwZSBEb2N1bWVudEZyYWdtZW50V2l0aFRpdGxlICovXG4gICAgbGV0IGZyYWdtZW50XG4gICAgaWYgKHN0YXJ0VGFnID09PSAnaHRtbCcpIHtcbiAgICAgIC8vIGlmIGl0IGlzIGEgZnVsbCBkb2N1bWVudCwgcGFyc2UgaXQgYW5kIHJldHVybiB0aGUgYm9keVxuICAgICAgZnJhZ21lbnQgPSAvKiogQHR5cGUgRG9jdW1lbnRGcmFnbWVudFdpdGhUaXRsZSAqLyAobmV3IERvY3VtZW50RnJhZ21lbnQoKSlcbiAgICAgIGNvbnN0IGRvYyA9IHBhcnNlSFRNTChyZXNwb25zZSlcbiAgICAgIHRha2VDaGlsZHJlbkZvcihmcmFnbWVudCwgZG9jLmJvZHkpXG4gICAgICBmcmFnbWVudC50aXRsZSA9IGRvYy50aXRsZVxuICAgIH0gZWxzZSBpZiAoc3RhcnRUYWcgPT09ICdib2R5Jykge1xuICAgICAgLy8gcGFyc2UgYm9keSB3L28gd3JhcHBpbmcgaW4gdGVtcGxhdGVcbiAgICAgIGZyYWdtZW50ID0gLyoqIEB0eXBlIERvY3VtZW50RnJhZ21lbnRXaXRoVGl0bGUgKi8gKG5ldyBEb2N1bWVudEZyYWdtZW50KCkpXG4gICAgICBjb25zdCBkb2MgPSBwYXJzZUhUTUwocmVzcG9uc2VXaXRoTm9IZWFkKVxuICAgICAgdGFrZUNoaWxkcmVuRm9yKGZyYWdtZW50LCBkb2MuYm9keSlcbiAgICAgIGZyYWdtZW50LnRpdGxlID0gZG9jLnRpdGxlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG90aGVyd2lzZSB3ZSBoYXZlIG5vbi1ib2R5IHBhcnRpYWwgSFRNTCBjb250ZW50LCBzbyB3cmFwIGl0IGluIGEgdGVtcGxhdGUgdG8gbWF4aW1pemUgcGFyc2luZyBmbGV4aWJpbGl0eVxuICAgICAgY29uc3QgZG9jID0gcGFyc2VIVE1MKCc8Ym9keT48dGVtcGxhdGUgY2xhc3M9XCJpbnRlcm5hbC1odG14LXdyYXBwZXJcIj4nICsgcmVzcG9uc2VXaXRoTm9IZWFkICsgJzwvdGVtcGxhdGU+PC9ib2R5PicpXG4gICAgICBmcmFnbWVudCA9IC8qKiBAdHlwZSBEb2N1bWVudEZyYWdtZW50V2l0aFRpdGxlICovIChkb2MucXVlcnlTZWxlY3RvcigndGVtcGxhdGUnKS5jb250ZW50KVxuICAgICAgLy8gZXh0cmFjdCB0aXRsZSBpbnRvIGZyYWdtZW50IGZvciBsYXRlciBwcm9jZXNzaW5nXG4gICAgICBmcmFnbWVudC50aXRsZSA9IGRvYy50aXRsZVxuXG4gICAgICAvLyBmb3IgbGVnYWN5IHJlYXNvbnMgd2Ugc3VwcG9ydCBhIHRpdGxlIHRhZyBhdCB0aGUgcm9vdCBsZXZlbCBvZiBub24tYm9keSByZXNwb25zZXMsIHNvIHdlIG5lZWQgdG8gaGFuZGxlIGl0XG4gICAgICB2YXIgdGl0bGVFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcigndGl0bGUnKVxuICAgICAgaWYgKHRpdGxlRWxlbWVudCAmJiB0aXRsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gZnJhZ21lbnQpIHtcbiAgICAgICAgdGl0bGVFbGVtZW50LnJlbW92ZSgpXG4gICAgICAgIGZyYWdtZW50LnRpdGxlID0gdGl0bGVFbGVtZW50LmlubmVyVGV4dFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZnJhZ21lbnQpIHtcbiAgICAgIGlmIChodG14LmNvbmZpZy5hbGxvd1NjcmlwdFRhZ3MpIHtcbiAgICAgICAgbm9ybWFsaXplU2NyaXB0VGFncyhmcmFnbWVudClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlbW92ZSBhbGwgc2NyaXB0IHRhZ3MgaWYgc2NyaXB0cyBhcmUgZGlzYWJsZWRcbiAgICAgICAgZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0JykuZm9yRWFjaCgoc2NyaXB0KSA9PiBzY3JpcHQucmVtb3ZlKCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmcmFnbWVudFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAgICovXG4gIGZ1bmN0aW9uIG1heWJlQ2FsbChmdW5jKSB7XG4gICAgaWYgKGZ1bmMpIHtcbiAgICAgIGZ1bmMoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2FueX0gb1xuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgZnVuY3Rpb24gaXNUeXBlKG8sIHR5cGUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pID09PSAnW29iamVjdCAnICsgdHlwZSArICddJ1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb1xuICAgKiBAcmV0dXJucyB7byBpcyBGdW5jdGlvbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb24obykge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJ1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Kn0gb1xuICAgKiBAcmV0dXJucyB7byBpcyBPYmplY3R9XG4gICAqL1xuICBmdW5jdGlvbiBpc1Jhd09iamVjdChvKSB7XG4gICAgcmV0dXJuIGlzVHlwZShvLCAnT2JqZWN0JylcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBPbkhhbmRsZXJcbiAgICogQHByb3BlcnR5IHsoa2V5b2YgSFRNTEVsZW1lbnRFdmVudE1hcCl8c3RyaW5nfSBldmVudFxuICAgKiBAcHJvcGVydHkge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBMaXN0ZW5lckluZm9cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHRyaWdnZXJcbiAgICogQHByb3BlcnR5IHtFdmVudExpc3RlbmVyfSBsaXN0ZW5lclxuICAgKiBAcHJvcGVydHkge0V2ZW50VGFyZ2V0fSBvblxuICAgKi9cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gSHRteE5vZGVJbnRlcm5hbERhdGFcbiAgICogRWxlbWVudCBkYXRhXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbaW5pdEhhc2hdXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Jvb3N0ZWRdXG4gICAqIEBwcm9wZXJ0eSB7T25IYW5kbGVyW119IFtvbkhhbmRsZXJzXVxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3RpbWVvdXRdXG4gICAqIEBwcm9wZXJ0eSB7TGlzdGVuZXJJbmZvW119IFtsaXN0ZW5lckluZm9zXVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFtjYW5jZWxsZWRdXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3RyaWdnZXJlZE9uY2VdXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZGVsYXllZF1cbiAgICogQHByb3BlcnR5IHtudW1iZXJ8bnVsbH0gW3Rocm90dGxlXVxuICAgKiBAcHJvcGVydHkge1dlYWtNYXA8SHRteFRyaWdnZXJTcGVjaWZpY2F0aW9uLFdlYWtNYXA8RXZlbnRUYXJnZXQsc3RyaW5nPj59IFtsYXN0VmFsdWVdXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2xvYWRlZF1cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFtwYXRoXVxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gW3ZlcmJdXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3BvbGxpbmddXG4gICAqIEBwcm9wZXJ0eSB7SFRNTEJ1dHRvbkVsZW1lbnR8SFRNTElucHV0RWxlbWVudHxudWxsfSBbbGFzdEJ1dHRvbkNsaWNrZWRdXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbcmVxdWVzdENvdW50XVxuICAgKiBAcHJvcGVydHkge1hNTEh0dHBSZXF1ZXN0fSBbeGhyXVxuICAgKiBAcHJvcGVydHkgeygoKSA9PiB2b2lkKVtdfSBbcXVldWVkUmVxdWVzdHNdXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Fib3J0YWJsZV1cbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbZmlyc3RJbml0Q29tcGxldGVkXVxuICAgKlxuICAgKiBFdmVudCBkYXRhXG4gICAqIEBwcm9wZXJ0eSB7SHRteFRyaWdnZXJTcGVjaWZpY2F0aW9ufSBbdHJpZ2dlclNwZWNdXG4gICAqIEBwcm9wZXJ0eSB7RXZlbnRUYXJnZXRbXX0gW2hhbmRsZWRGb3JdXG4gICAqL1xuXG4gIC8qKlxuICAgKiBnZXRJbnRlcm5hbERhdGEgcmV0cmlldmVzIFwicHJpdmF0ZVwiIGRhdGEgc3RvcmVkIGJ5IGh0bXggd2l0aGluIGFuIGVsZW1lbnRcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldHxFdmVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtIdG14Tm9kZUludGVybmFsRGF0YX1cbiAgICovXG4gIGZ1bmN0aW9uIGdldEludGVybmFsRGF0YShlbHQpIHtcbiAgICBjb25zdCBkYXRhUHJvcCA9ICdodG14LWludGVybmFsLWRhdGEnXG4gICAgbGV0IGRhdGEgPSBlbHRbZGF0YVByb3BdXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICBkYXRhID0gZWx0W2RhdGFQcm9wXSA9IHt9XG4gICAgfVxuICAgIHJldHVybiBkYXRhXG4gIH1cblxuICAvKipcbiAgICogdG9BcnJheSBjb252ZXJ0cyBhbiBBcnJheUxpa2Ugb2JqZWN0IGludG8gYSByZWFsIGFycmF5LlxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAcGFyYW0ge0FycmF5TGlrZTxUPn0gYXJyXG4gICAqIEByZXR1cm5zIHtUW119XG4gICAqL1xuICBmdW5jdGlvbiB0b0FycmF5KGFycikge1xuICAgIGNvbnN0IHJldHVybkFyciA9IFtdXG4gICAgaWYgKGFycikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmV0dXJuQXJyLnB1c2goYXJyW2ldKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuQXJyXG4gIH1cblxuICAvKipcbiAgICogQHRlbXBsYXRlIFRcbiAgICogQHBhcmFtIHtUW118TmFtZWROb2RlTWFwfEhUTUxDb2xsZWN0aW9ufEhUTUxGb3JtQ29udHJvbHNDb2xsZWN0aW9ufEFycmF5TGlrZTxUPn0gYXJyXG4gICAqIEBwYXJhbSB7KFQpID0+IHZvaWR9IGZ1bmNcbiAgICovXG4gIGZ1bmN0aW9uIGZvckVhY2goYXJyLCBmdW5jKSB7XG4gICAgaWYgKGFycikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZnVuYyhhcnJbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1Njcm9sbGVkSW50b1ZpZXcoZWwpIHtcbiAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBlbGVtVG9wID0gcmVjdC50b3BcbiAgICBjb25zdCBlbGVtQm90dG9tID0gcmVjdC5ib3R0b21cbiAgICByZXR1cm4gZWxlbVRvcCA8IHdpbmRvdy5pbm5lckhlaWdodCAmJiBlbGVtQm90dG9tID49IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZWxlbWVudCBpcyBpbiB0aGUgZG9jdW1lbnQgKGluY2x1ZGVzIHNoYWRvdyByb290cykuXG4gICAqIFRoaXMgZnVuY3Rpb24gdGhpcyBpcyBhIHNsaWdodCBtaXNub21lcjsgaXQgd2lsbCByZXR1cm4gdHJ1ZSBldmVuIGZvciBlbGVtZW50cyBpbiB0aGUgaGVhZC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBlbHRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBib2R5Q29udGFpbnMoZWx0KSB7XG4gICAgcmV0dXJuIGVsdC5nZXRSb290Tm9kZSh7IGNvbXBvc2VkOiB0cnVlIH0pID09PSBkb2N1bWVudFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0cmlnZ2VyXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICovXG4gIGZ1bmN0aW9uIHNwbGl0T25XaGl0ZXNwYWNlKHRyaWdnZXIpIHtcbiAgICByZXR1cm4gdHJpZ2dlci50cmltKCkuc3BsaXQoL1xccysvKVxuICB9XG5cbiAgLyoqXG4gICAqIG1lcmdlT2JqZWN0cyB0YWtlcyBhbGwgdGhlIGtleXMgZnJvbVxuICAgKiBvYmoyIGFuZCBkdXBsaWNhdGVzIHRoZW0gaW50byBvYmoxXG4gICAqIEB0ZW1wbGF0ZSBUMVxuICAgKiBAdGVtcGxhdGUgVDJcbiAgICogQHBhcmFtIHtUMX0gb2JqMVxuICAgKiBAcGFyYW0ge1QyfSBvYmoyXG4gICAqIEByZXR1cm5zIHtUMSAmIFQyfVxuICAgKi9cbiAgZnVuY3Rpb24gbWVyZ2VPYmplY3RzKG9iajEsIG9iajIpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmoyKSB7XG4gICAgICBpZiAob2JqMi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgdHNjIGRvZXNuJ3Qgc2VlbSB0byBwcm9wZXJseSBoYW5kbGUgdHlwZXMgbWVyZ2luZ1xuICAgICAgICBvYmoxW2tleV0gPSBvYmoyW2tleV1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZSB0c2MgZG9lc24ndCBzZWVtIHRvIHByb3Blcmx5IGhhbmRsZSB0eXBlcyBtZXJnaW5nXG4gICAgcmV0dXJuIG9iajFcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30galN0cmluZ1xuICAgKiBAcmV0dXJucyB7YW55fG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZUpTT04oalN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShqU3RyaW5nKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dFcnJvcihlcnJvcilcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gY2FuQWNjZXNzTG9jYWxTdG9yYWdlKCkge1xuICAgIGNvbnN0IHRlc3QgPSAnaHRteDpzZXNzaW9uU3RvcmFnZVRlc3QnXG4gICAgdHJ5IHtcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0odGVzdCwgdGVzdClcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0odGVzdClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGgpIHtcbiAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgdG8gYWxsb3cgbm9ybWFsaXplIG9uIHBhdGggb25seVxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aCwgJ2h0dHA6Ly94JylcbiAgICBpZiAodXJsKSB7XG4gICAgICBwYXRoID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaFxuICAgIH1cbiAgICAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2gsIHVubGVzcyBpbmRleCBwYWdlXG4gICAgaWYgKHBhdGggIT0gJy8nKSB7XG4gICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXC8rJC8sICcnKVxuICAgIH1cbiAgICByZXR1cm4gcGF0aFxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIHB1YmxpYyBBUElcbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICogQHJldHVybnMge2FueX1cbiAgICovXG4gIGZ1bmN0aW9uIGludGVybmFsRXZhbChzdHIpIHtcbiAgICByZXR1cm4gbWF5YmVFdmFsKGdldERvY3VtZW50KCkuYm9keSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXZhbChzdHIpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2FsbGJhY2sgZm9yIHRoZSAqKmh0bXg6bG9hZCoqIGV2ZW50LiBUaGlzIGNhbiBiZSB1c2VkIHRvIHByb2Nlc3MgbmV3IGNvbnRlbnQsIGZvciBleGFtcGxlIGluaXRpYWxpemluZyB0aGUgY29udGVudCB3aXRoIGEgamF2YXNjcmlwdCBsaWJyYXJ5XG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI29uTG9hZFxuICAgKlxuICAgKiBAcGFyYW0geyhlbHQ6IE5vZGUpID0+IHZvaWR9IGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBjYWxsIG9uIG5ld2x5IGxvYWRlZCBjb250ZW50XG4gICAqIEByZXR1cm5zIHtFdmVudExpc3RlbmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gb25Mb2FkSGVscGVyKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgdmFsdWUgPSBodG14Lm9uKCdodG14OmxvYWQnLCAvKiogQHBhcmFtIHtDdXN0b21FdmVudH0gZXZ0ICovIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgY2FsbGJhY2soZXZ0LmRldGFpbC5lbHQpXG4gICAgfSlcbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2cgYWxsIGh0bXggZXZlbnRzLCB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jbG9nQWxsXG4gICAqL1xuICBmdW5jdGlvbiBsb2dBbGwoKSB7XG4gICAgaHRteC5sb2dnZXIgPSBmdW5jdGlvbihlbHQsIGV2ZW50LCBkYXRhKSB7XG4gICAgICBpZiAoY29uc29sZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhldmVudCwgZWx0LCBkYXRhKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ05vbmUoKSB7XG4gICAgaHRteC5sb2dnZXIgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgYW4gZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3JcbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jZmluZFxuICAgKlxuICAgKiBAcGFyYW0ge1BhcmVudE5vZGV8c3RyaW5nfSBlbHRPclNlbGVjdG9yICB0aGUgcm9vdCBlbGVtZW50IHRvIGZpbmQgdGhlIG1hdGNoaW5nIGVsZW1lbnQgaW4sIGluY2x1c2l2ZSB8IHRoZSBzZWxlY3RvciB0byBtYXRjaFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3NlbGVjdG9yXSB0aGUgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cbiAgICovXG4gIGZ1bmN0aW9uIGZpbmQoZWx0T3JTZWxlY3Rvciwgc2VsZWN0b3IpIHtcbiAgICBpZiAodHlwZW9mIGVsdE9yU2VsZWN0b3IgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZWx0T3JTZWxlY3Rvci5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmluZChnZXREb2N1bWVudCgpLCBlbHRPclNlbGVjdG9yKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI2ZpbmRBbGxcbiAgICpcbiAgICogQHBhcmFtIHtQYXJlbnROb2RlfHN0cmluZ30gZWx0T3JTZWxlY3RvciB0aGUgcm9vdCBlbGVtZW50IHRvIGZpbmQgdGhlIG1hdGNoaW5nIGVsZW1lbnRzIGluLCBpbmNsdXNpdmUgfCB0aGUgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtzZWxlY3Rvcl0gdGhlIHNlbGVjdG9yIHRvIG1hdGNoXG4gICAqIEByZXR1cm5zIHtOb2RlTGlzdE9mPEVsZW1lbnQ+fVxuICAgKi9cbiAgZnVuY3Rpb24gZmluZEFsbChlbHRPclNlbGVjdG9yLCBzZWxlY3Rvcikge1xuICAgIGlmICh0eXBlb2YgZWx0T3JTZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBlbHRPclNlbGVjdG9yLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmaW5kQWxsKGdldERvY3VtZW50KCksIGVsdE9yU2VsZWN0b3IpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIFdpbmRvd1xuICAgKi9cbiAgZnVuY3Rpb24gZ2V0V2luZG93KCkge1xuICAgIHJldHVybiB3aW5kb3dcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGVsZW1lbnQgZnJvbSB0aGUgRE9NXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI3JlbW92ZVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGVsdFxuICAgKiBAcGFyYW0ge251bWJlcn0gW2RlbGF5XVxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChlbHQsIGRlbGF5KSB7XG4gICAgZWx0ID0gcmVzb2x2ZVRhcmdldChlbHQpXG4gICAgaWYgKGRlbGF5KSB7XG4gICAgICBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZW1vdmVFbGVtZW50KGVsdClcbiAgICAgICAgZWx0ID0gbnVsbFxuICAgICAgfSwgZGVsYXkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEVsdChlbHQpLnJlbW92ZUNoaWxkKGVsdClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IGVsdFxuICAgKiBAcmV0dXJuIHtFbGVtZW50fG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiBhc0VsZW1lbnQoZWx0KSB7XG4gICAgcmV0dXJuIGVsdCBpbnN0YW5jZW9mIEVsZW1lbnQgPyBlbHQgOiBudWxsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IGVsdFxuICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudHxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gYXNIdG1sRWxlbWVudChlbHQpIHtcbiAgICByZXR1cm4gZWx0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgPyBlbHQgOiBudWxsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge3N0cmluZ3xudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gYXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IGVsdFxuICAgKiBAcmV0dXJuIHtQYXJlbnROb2RlfG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiBhc1BhcmVudE5vZGUoZWx0KSB7XG4gICAgcmV0dXJuIGVsdCBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgZWx0IGluc3RhbmNlb2YgRG9jdW1lbnQgfHwgZWx0IGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCA/IGVsdCA6IG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBhZGRzIGEgY2xhc3MgdG8gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI2FkZENsYXNzXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudHxzdHJpbmd9IGVsdCB0aGUgZWxlbWVudCB0byBhZGQgdGhlIGNsYXNzIHRvXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGF6eiB0aGUgY2xhc3MgdG8gYWRkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZGVsYXldIHRoZSBkZWxheSAoaW4gbWlsbGlzZWNvbmRzKSBiZWZvcmUgY2xhc3MgaXMgYWRkZWRcbiAgICovXG4gIGZ1bmN0aW9uIGFkZENsYXNzVG9FbGVtZW50KGVsdCwgY2xhenosIGRlbGF5KSB7XG4gICAgZWx0ID0gYXNFbGVtZW50KHJlc29sdmVUYXJnZXQoZWx0KSlcbiAgICBpZiAoIWVsdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChkZWxheSkge1xuICAgICAgZ2V0V2luZG93KCkuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgYWRkQ2xhc3NUb0VsZW1lbnQoZWx0LCBjbGF6eilcbiAgICAgICAgZWx0ID0gbnVsbFxuICAgICAgfSwgZGVsYXkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsdC5jbGFzc0xpc3QgJiYgZWx0LmNsYXNzTGlzdC5hZGQoY2xhenopXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjbGFzcyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50XG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI3JlbW92ZUNsYXNzXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZXxzdHJpbmd9IG5vZGUgZWxlbWVudCB0byByZW1vdmUgdGhlIGNsYXNzIGZyb21cbiAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXp6IHRoZSBjbGFzcyB0byByZW1vdmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkZWxheV0gdGhlIGRlbGF5IChpbiBtaWxsaXNlY29uZHMgYmVmb3JlIGNsYXNzIGlzIHJlbW92ZWQpXG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmVDbGFzc0Zyb21FbGVtZW50KG5vZGUsIGNsYXp6LCBkZWxheSkge1xuICAgIGxldCBlbHQgPSBhc0VsZW1lbnQocmVzb2x2ZVRhcmdldChub2RlKSlcbiAgICBpZiAoIWVsdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChkZWxheSkge1xuICAgICAgZ2V0V2luZG93KCkuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3NGcm9tRWxlbWVudChlbHQsIGNsYXp6KVxuICAgICAgICBlbHQgPSBudWxsXG4gICAgICB9LCBkZWxheSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsdC5jbGFzc0xpc3QpIHtcbiAgICAgICAgZWx0LmNsYXNzTGlzdC5yZW1vdmUoY2xhenopXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBubyBjbGFzc2VzIGxlZnQsIHJlbW92ZSB0aGUgY2xhc3MgYXR0cmlidXRlXG4gICAgICAgIGlmIChlbHQuY2xhc3NMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGVsdC5yZW1vdmVBdHRyaWJ1dGUoJ2NsYXNzJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBnaXZlbiBjbGFzcyBvbiBhbiBlbGVtZW50XG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI3RvZ2dsZUNsYXNzXG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudHxzdHJpbmd9IGVsdCB0aGUgZWxlbWVudCB0byB0b2dnbGUgdGhlIGNsYXNzIG9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGF6eiB0aGUgY2xhc3MgdG8gdG9nZ2xlXG4gICAqL1xuICBmdW5jdGlvbiB0b2dnbGVDbGFzc09uRWxlbWVudChlbHQsIGNsYXp6KSB7XG4gICAgZWx0ID0gcmVzb2x2ZVRhcmdldChlbHQpXG4gICAgZWx0LmNsYXNzTGlzdC50b2dnbGUoY2xhenopXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGdpdmVuIGNsYXNzIGZyb20gaXRzIHNpYmxpbmdzLCBzbyB0aGF0IGFtb25nIGl0cyBzaWJsaW5ncywgb25seSB0aGUgZ2l2ZW4gZWxlbWVudCB3aWxsIGhhdmUgdGhlIGNsYXNzLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyN0YWtlQ2xhc3NcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWx0IHRoZSBlbGVtZW50IHRoYXQgd2lsbCB0YWtlIHRoZSBjbGFzc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhenogdGhlIGNsYXNzIHRvIHRha2VcbiAgICovXG4gIGZ1bmN0aW9uIHRha2VDbGFzc0ZvckVsZW1lbnQoZWx0LCBjbGF6eikge1xuICAgIGVsdCA9IHJlc29sdmVUYXJnZXQoZWx0KVxuICAgIGZvckVhY2goZWx0LnBhcmVudEVsZW1lbnQuY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICByZW1vdmVDbGFzc0Zyb21FbGVtZW50KGNoaWxkLCBjbGF6eilcbiAgICB9KVxuICAgIGFkZENsYXNzVG9FbGVtZW50KGFzRWxlbWVudChlbHQpLCBjbGF6eilcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgY2xvc2VzdCBtYXRjaGluZyBlbGVtZW50IGluIHRoZSBnaXZlbiBlbGVtZW50cyBwYXJlbnRhZ2UsIGluY2x1c2l2ZSBvZiB0aGUgZWxlbWVudFxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNjbG9zZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7RWxlbWVudHxzdHJpbmd9IGVsdCB0aGUgZWxlbWVudCB0byBmaW5kIHRoZSBzZWxlY3RvciBmcm9tXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gZmluZFxuICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gY2xvc2VzdChlbHQsIHNlbGVjdG9yKSB7XG4gICAgZWx0ID0gYXNFbGVtZW50KHJlc29sdmVUYXJnZXQoZWx0KSlcbiAgICBpZiAoZWx0KSB7XG4gICAgICByZXR1cm4gZWx0LmNsb3Nlc3Qoc2VsZWN0b3IpXG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gc3RhcnRzV2l0aChzdHIsIHByZWZpeCkge1xuICAgIHJldHVybiBzdHIuc3Vic3RyaW5nKDAsIHByZWZpeC5sZW5ndGgpID09PSBwcmVmaXhcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdWZmaXhcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBlbmRzV2l0aChzdHIsIHN1ZmZpeCkge1xuICAgIHJldHVybiBzdHIuc3Vic3RyaW5nKHN0ci5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSA9PT0gc3VmZml4XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemVTZWxlY3RvcihzZWxlY3Rvcikge1xuICAgIGNvbnN0IHRyaW1tZWRTZWxlY3RvciA9IHNlbGVjdG9yLnRyaW0oKVxuICAgIGlmIChzdGFydHNXaXRoKHRyaW1tZWRTZWxlY3RvciwgJzwnKSAmJiBlbmRzV2l0aCh0cmltbWVkU2VsZWN0b3IsICcvPicpKSB7XG4gICAgICByZXR1cm4gdHJpbW1lZFNlbGVjdG9yLnN1YnN0cmluZygxLCB0cmltbWVkU2VsZWN0b3IubGVuZ3RoIC0gMilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRyaW1tZWRTZWxlY3RvclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV8RWxlbWVudHxEb2N1bWVudHxzdHJpbmd9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3JcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZ2xvYmFsXG4gICAqIEByZXR1cm5zIHsoTm9kZXxXaW5kb3cpW119XG4gICAqL1xuICBmdW5jdGlvbiBxdWVyeVNlbGVjdG9yQWxsRXh0KGVsdCwgc2VsZWN0b3IsIGdsb2JhbCkge1xuICAgIGlmIChzZWxlY3Rvci5pbmRleE9mKCdnbG9iYWwgJykgPT09IDApIHtcbiAgICAgIHJldHVybiBxdWVyeVNlbGVjdG9yQWxsRXh0KGVsdCwgc2VsZWN0b3Iuc2xpY2UoNyksIHRydWUpXG4gICAgfVxuXG4gICAgZWx0ID0gcmVzb2x2ZVRhcmdldChlbHQpXG5cbiAgICBjb25zdCBwYXJ0cyA9IFtdXG4gICAge1xuICAgICAgbGV0IGNoZXZyb25zQ291bnQgPSAwXG4gICAgICBsZXQgb2Zmc2V0ID0gMFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjaGFyID0gc2VsZWN0b3JbaV1cbiAgICAgICAgaWYgKGNoYXIgPT09ICcsJyAmJiBjaGV2cm9uc0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgcGFydHMucHVzaChzZWxlY3Rvci5zdWJzdHJpbmcob2Zmc2V0LCBpKSlcbiAgICAgICAgICBvZmZzZXQgPSBpICsgMVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYXIgPT09ICc8Jykge1xuICAgICAgICAgIGNoZXZyb25zQ291bnQrK1xuICAgICAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICcvJyAmJiBpIDwgc2VsZWN0b3IubGVuZ3RoIC0gMSAmJiBzZWxlY3RvcltpICsgMV0gPT09ICc+Jykge1xuICAgICAgICAgIGNoZXZyb25zQ291bnQtLVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAob2Zmc2V0IDwgc2VsZWN0b3IubGVuZ3RoKSB7XG4gICAgICAgIHBhcnRzLnB1c2goc2VsZWN0b3Iuc3Vic3RyaW5nKG9mZnNldCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBjb25zdCB1bnByb2Nlc3NlZFBhcnRzID0gW11cbiAgICB3aGlsZSAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBub3JtYWxpemVTZWxlY3RvcihwYXJ0cy5zaGlmdCgpKVxuICAgICAgbGV0IGl0ZW1cbiAgICAgIGlmIChzZWxlY3Rvci5pbmRleE9mKCdjbG9zZXN0ICcpID09PSAwKSB7XG4gICAgICAgIGl0ZW0gPSBjbG9zZXN0KGFzRWxlbWVudChlbHQpLCBub3JtYWxpemVTZWxlY3RvcihzZWxlY3Rvci5zbGljZSg4KSkpXG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yLmluZGV4T2YoJ2ZpbmQgJykgPT09IDApIHtcbiAgICAgICAgaXRlbSA9IGZpbmQoYXNQYXJlbnROb2RlKGVsdCksIG5vcm1hbGl6ZVNlbGVjdG9yKHNlbGVjdG9yLnNsaWNlKDUpKSlcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgPT09ICduZXh0JyB8fCBzZWxlY3RvciA9PT0gJ25leHRFbGVtZW50U2libGluZycpIHtcbiAgICAgICAgaXRlbSA9IGFzRWxlbWVudChlbHQpLm5leHRFbGVtZW50U2libGluZ1xuICAgICAgfSBlbHNlIGlmIChzZWxlY3Rvci5pbmRleE9mKCduZXh0ICcpID09PSAwKSB7XG4gICAgICAgIGl0ZW0gPSBzY2FuRm9yd2FyZFF1ZXJ5KGVsdCwgbm9ybWFsaXplU2VsZWN0b3Ioc2VsZWN0b3Iuc2xpY2UoNSkpLCAhIWdsb2JhbClcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgPT09ICdwcmV2aW91cycgfHwgc2VsZWN0b3IgPT09ICdwcmV2aW91c0VsZW1lbnRTaWJsaW5nJykge1xuICAgICAgICBpdGVtID0gYXNFbGVtZW50KGVsdCkucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgICAgfSBlbHNlIGlmIChzZWxlY3Rvci5pbmRleE9mKCdwcmV2aW91cyAnKSA9PT0gMCkge1xuICAgICAgICBpdGVtID0gc2NhbkJhY2t3YXJkc1F1ZXJ5KGVsdCwgbm9ybWFsaXplU2VsZWN0b3Ioc2VsZWN0b3Iuc2xpY2UoOSkpLCAhIWdsb2JhbClcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgICAgaXRlbSA9IGRvY3VtZW50XG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yID09PSAnd2luZG93Jykge1xuICAgICAgICBpdGVtID0gd2luZG93XG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yID09PSAnYm9keScpIHtcbiAgICAgICAgaXRlbSA9IGRvY3VtZW50LmJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgPT09ICdyb290Jykge1xuICAgICAgICBpdGVtID0gZ2V0Um9vdE5vZGUoZWx0LCAhIWdsb2JhbClcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IgPT09ICdob3N0Jykge1xuICAgICAgICBpdGVtID0gKC8qKiBAdHlwZSBTaGFkb3dSb290ICovKGVsdC5nZXRSb290Tm9kZSgpKSkuaG9zdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW5wcm9jZXNzZWRQYXJ0cy5wdXNoKHNlbGVjdG9yKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbSkge1xuICAgICAgICByZXN1bHQucHVzaChpdGVtKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1bnByb2Nlc3NlZFBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHN0YW5kYXJkU2VsZWN0b3IgPSB1bnByb2Nlc3NlZFBhcnRzLmpvaW4oJywnKVxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSBhc1BhcmVudE5vZGUoZ2V0Um9vdE5vZGUoZWx0LCAhIWdsb2JhbCkpXG4gICAgICByZXN1bHQucHVzaCguLi50b0FycmF5KHJvb3ROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc3RhbmRhcmRTZWxlY3RvcikpKVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV9IHN0YXJ0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtYXRjaFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGdsb2JhbFxuICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICovXG4gIHZhciBzY2FuRm9yd2FyZFF1ZXJ5ID0gZnVuY3Rpb24oc3RhcnQsIG1hdGNoLCBnbG9iYWwpIHtcbiAgICBjb25zdCByZXN1bHRzID0gYXNQYXJlbnROb2RlKGdldFJvb3ROb2RlKHN0YXJ0LCBnbG9iYWwpKS5xdWVyeVNlbGVjdG9yQWxsKG1hdGNoKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWx0ID0gcmVzdWx0c1tpXVxuICAgICAgaWYgKGVsdC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihzdGFydCkgPT09IE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fUFJFQ0VESU5HKSB7XG4gICAgICAgIHJldHVybiBlbHRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBzdGFydFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2hcbiAgICogQHBhcmFtIHtib29sZWFufSBnbG9iYWxcbiAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAqL1xuICB2YXIgc2NhbkJhY2t3YXJkc1F1ZXJ5ID0gZnVuY3Rpb24oc3RhcnQsIG1hdGNoLCBnbG9iYWwpIHtcbiAgICBjb25zdCByZXN1bHRzID0gYXNQYXJlbnROb2RlKGdldFJvb3ROb2RlKHN0YXJ0LCBnbG9iYWwpKS5xdWVyeVNlbGVjdG9yQWxsKG1hdGNoKVxuICAgIGZvciAobGV0IGkgPSByZXN1bHRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBlbHQgPSByZXN1bHRzW2ldXG4gICAgICBpZiAoZWx0LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKHN0YXJ0KSA9PT0gTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9GT0xMT1dJTkcpIHtcbiAgICAgICAgcmV0dXJuIGVsdFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBlbHRPclNlbGVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc2VsZWN0b3JcbiAgICogQHJldHVybnMge05vZGV8V2luZG93fVxuICAgKi9cbiAgZnVuY3Rpb24gcXVlcnlTZWxlY3RvckV4dChlbHRPclNlbGVjdG9yLCBzZWxlY3Rvcikge1xuICAgIGlmICh0eXBlb2YgZWx0T3JTZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBxdWVyeVNlbGVjdG9yQWxsRXh0KGVsdE9yU2VsZWN0b3IsIHNlbGVjdG9yKVswXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcXVlcnlTZWxlY3RvckFsbEV4dChnZXREb2N1bWVudCgpLmJvZHksIGVsdE9yU2VsZWN0b3IpWzBdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSB7RXZlbnRUYXJnZXR9IFRcbiAgICogQHBhcmFtIHtUfHN0cmluZ30gZWx0T3JTZWxlY3RvclxuICAgKiBAcGFyYW0ge1R9IFtjb250ZXh0XVxuICAgKiBAcmV0dXJucyB7RWxlbWVudHxUfG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiByZXNvbHZlVGFyZ2V0KGVsdE9yU2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIGVsdE9yU2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZmluZChhc1BhcmVudE5vZGUoY29udGV4dCkgfHwgZG9jdW1lbnQsIGVsdE9yU2VsZWN0b3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbHRPclNlbGVjdG9yXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtrZXlvZiBIVE1MRWxlbWVudEV2ZW50TWFwfHN0cmluZ30gQW55RXZlbnROYW1lXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBFdmVudEFyZ3NcbiAgICogQHByb3BlcnR5IHtFdmVudFRhcmdldH0gdGFyZ2V0XG4gICAqIEBwcm9wZXJ0eSB7QW55RXZlbnROYW1lfSBldmVudFxuICAgKiBAcHJvcGVydHkge0V2ZW50TGlzdGVuZXJ9IGxpc3RlbmVyXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fGJvb2xlYW59IG9wdGlvbnNcbiAgICovXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8QW55RXZlbnROYW1lfSBhcmcxXG4gICAqIEBwYXJhbSB7QW55RXZlbnROYW1lfEV2ZW50TGlzdGVuZXJ9IGFyZzJcbiAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfE9iamVjdHxib29sZWFufSBbYXJnM11cbiAgICogQHBhcmFtIHtPYmplY3R8Ym9vbGVhbn0gW2FyZzRdXG4gICAqIEByZXR1cm5zIHtFdmVudEFyZ3N9XG4gICAqL1xuICBmdW5jdGlvbiBwcm9jZXNzRXZlbnRBcmdzKGFyZzEsIGFyZzIsIGFyZzMsIGFyZzQpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihhcmcyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiBnZXREb2N1bWVudCgpLmJvZHksXG4gICAgICAgIGV2ZW50OiBhc1N0cmluZyhhcmcxKSxcbiAgICAgICAgbGlzdGVuZXI6IGFyZzIsXG4gICAgICAgIG9wdGlvbnM6IGFyZzNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KGFyZzEpLFxuICAgICAgICBldmVudDogYXNTdHJpbmcoYXJnMiksXG4gICAgICAgIGxpc3RlbmVyOiBhcmczLFxuICAgICAgICBvcHRpb25zOiBhcmc0XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gYW4gZWxlbWVudFxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNvblxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fHN0cmluZ30gYXJnMSB0aGUgZWxlbWVudCB0byBhZGQgdGhlIGxpc3RlbmVyIHRvIHwgdGhlIGV2ZW50IG5hbWUgdG8gYWRkIHRoZSBsaXN0ZW5lciBmb3JcbiAgICogQHBhcmFtIHtzdHJpbmd8RXZlbnRMaXN0ZW5lcn0gYXJnMiB0aGUgZXZlbnQgbmFtZSB0byBhZGQgdGhlIGxpc3RlbmVyIGZvciB8IHRoZSBsaXN0ZW5lciB0byBhZGRcbiAgICogQHBhcmFtIHtFdmVudExpc3RlbmVyfE9iamVjdHxib29sZWFufSBbYXJnM10gdGhlIGxpc3RlbmVyIHRvIGFkZCB8IG9wdGlvbnMgdG8gYWRkXG4gICAqIEBwYXJhbSB7T2JqZWN0fGJvb2xlYW59IFthcmc0XSBvcHRpb25zIHRvIGFkZFxuICAgKiBAcmV0dXJucyB7RXZlbnRMaXN0ZW5lcn1cbiAgICovXG4gIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJJbXBsKGFyZzEsIGFyZzIsIGFyZzMsIGFyZzQpIHtcbiAgICByZWFkeShmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGV2ZW50QXJncyA9IHByb2Nlc3NFdmVudEFyZ3MoYXJnMSwgYXJnMiwgYXJnMywgYXJnNClcbiAgICAgIGV2ZW50QXJncy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudEFyZ3MuZXZlbnQsIGV2ZW50QXJncy5saXN0ZW5lciwgZXZlbnRBcmdzLm9wdGlvbnMpXG4gICAgfSlcbiAgICBjb25zdCBiID0gaXNGdW5jdGlvbihhcmcyKVxuICAgIHJldHVybiBiID8gYXJnMiA6IGFyZzNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGV2ZW50IGxpc3RlbmVyIGZyb20gYW4gZWxlbWVudFxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNvZmZcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldHxzdHJpbmd9IGFyZzEgdGhlIGVsZW1lbnQgdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHwgdGhlIGV2ZW50IG5hbWUgdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tXG4gICAqIEBwYXJhbSB7c3RyaW5nfEV2ZW50TGlzdGVuZXJ9IGFyZzIgdGhlIGV2ZW50IG5hbWUgdG8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHwgdGhlIGxpc3RlbmVyIHRvIHJlbW92ZVxuICAgKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJ9IFthcmczXSB0aGUgbGlzdGVuZXIgdG8gcmVtb3ZlXG4gICAqIEByZXR1cm5zIHtFdmVudExpc3RlbmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lckltcGwoYXJnMSwgYXJnMiwgYXJnMykge1xuICAgIHJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZXZlbnRBcmdzID0gcHJvY2Vzc0V2ZW50QXJncyhhcmcxLCBhcmcyLCBhcmczKVxuICAgICAgZXZlbnRBcmdzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50QXJncy5ldmVudCwgZXZlbnRBcmdzLmxpc3RlbmVyKVxuICAgIH0pXG4gICAgcmV0dXJuIGlzRnVuY3Rpb24oYXJnMikgPyBhcmcyIDogYXJnM1xuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gTm9kZSBwcm9jZXNzaW5nXG4gIC8vPSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgY29uc3QgRFVNTVlfRUxUID0gZ2V0RG9jdW1lbnQoKS5jcmVhdGVFbGVtZW50KCdvdXRwdXQnKSAvLyBkdW1teSBlbGVtZW50IGZvciBiYWQgc2VsZWN0b3JzXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0ck5hbWVcbiAgICogQHJldHVybnMgeyhOb2RlfFdpbmRvdylbXX1cbiAgICovXG4gIGZ1bmN0aW9uIGZpbmRBdHRyaWJ1dGVUYXJnZXRzKGVsdCwgYXR0ck5hbWUpIHtcbiAgICBjb25zdCBhdHRyVGFyZ2V0ID0gZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlKGVsdCwgYXR0ck5hbWUpXG4gICAgaWYgKGF0dHJUYXJnZXQpIHtcbiAgICAgIGlmIChhdHRyVGFyZ2V0ID09PSAndGhpcycpIHtcbiAgICAgICAgcmV0dXJuIFtmaW5kVGhpc0VsZW1lbnQoZWx0LCBhdHRyTmFtZSldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBxdWVyeVNlbGVjdG9yQWxsRXh0KGVsdCwgYXR0clRhcmdldClcbiAgICAgICAgLy8gZmluZCBgaW5oZXJpdGAgd2hvbGUgd29yZCBpbiB2YWx1ZSwgbWFrZSBzdXJlIGl0J3Mgc3Vycm91bmRlZCBieSBjb21tYXMgb3IgaXMgYXQgdGhlIHN0YXJ0L2VuZCBvZiBzdHJpbmdcbiAgICAgICAgY29uc3Qgc2hvdWxkSW5oZXJpdCA9IC8oXnwsKShcXHMqKWluaGVyaXQoXFxzKikoJHwsKS8udGVzdChhdHRyVGFyZ2V0KVxuICAgICAgICBpZiAoc2hvdWxkSW5oZXJpdCkge1xuICAgICAgICAgIGNvbnN0IGVsdFRvSW5oZXJpdEZyb20gPSBhc0VsZW1lbnQoZ2V0Q2xvc2VzdE1hdGNoKGVsdCwgZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50ICE9PSBlbHQgJiYgaGFzQXR0cmlidXRlKGFzRWxlbWVudChwYXJlbnQpLCBhdHRyTmFtZSlcbiAgICAgICAgICB9KSlcbiAgICAgICAgICBpZiAoZWx0VG9Jbmhlcml0RnJvbSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goLi4uZmluZEF0dHJpYnV0ZVRhcmdldHMoZWx0VG9Jbmhlcml0RnJvbSwgYXR0ck5hbWUpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxvZ0Vycm9yKCdUaGUgc2VsZWN0b3IgXCInICsgYXR0clRhcmdldCArICdcIiBvbiAnICsgYXR0ck5hbWUgKyAnIHJldHVybmVkIG5vIG1hdGNoZXMhJylcbiAgICAgICAgICByZXR1cm4gW0RVTU1ZX0VMVF1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZVxuICAgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gZmluZFRoaXNFbGVtZW50KGVsdCwgYXR0cmlidXRlKSB7XG4gICAgcmV0dXJuIGFzRWxlbWVudChnZXRDbG9zZXN0TWF0Y2goZWx0LCBmdW5jdGlvbihlbHQpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVWYWx1ZShhc0VsZW1lbnQoZWx0KSwgYXR0cmlidXRlKSAhPSBudWxsXG4gICAgfSkpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHJldHVybnMge05vZGV8V2luZG93fG51bGx9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRUYXJnZXQoZWx0KSB7XG4gICAgY29uc3QgdGFyZ2V0U3RyID0gZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LXRhcmdldCcpXG4gICAgaWYgKHRhcmdldFN0cikge1xuICAgICAgaWYgKHRhcmdldFN0ciA9PT0gJ3RoaXMnKSB7XG4gICAgICAgIHJldHVybiBmaW5kVGhpc0VsZW1lbnQoZWx0LCAnaHgtdGFyZ2V0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBxdWVyeVNlbGVjdG9yRXh0KGVsdCwgdGFyZ2V0U3RyKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICAgIGlmIChkYXRhLmJvb3N0ZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldERvY3VtZW50KCkuYm9keVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVsdFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIHNob3VsZFNldHRsZUF0dHJpYnV0ZShuYW1lKSB7XG4gICAgcmV0dXJuIGh0bXguY29uZmlnLmF0dHJpYnV0ZXNUb1NldHRsZS5pbmNsdWRlcyhuYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gbWVyZ2VUb1xuICAgKiBAcGFyYW0ge0VsZW1lbnR9IG1lcmdlRnJvbVxuICAgKi9cbiAgZnVuY3Rpb24gY2xvbmVBdHRyaWJ1dGVzKG1lcmdlVG8sIG1lcmdlRnJvbSkge1xuICAgIGZvckVhY2goQXJyYXkuZnJvbShtZXJnZVRvLmF0dHJpYnV0ZXMpLCBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBpZiAoIW1lcmdlRnJvbS5oYXNBdHRyaWJ1dGUoYXR0ci5uYW1lKSAmJiBzaG91bGRTZXR0bGVBdHRyaWJ1dGUoYXR0ci5uYW1lKSkge1xuICAgICAgICBtZXJnZVRvLnJlbW92ZUF0dHJpYnV0ZShhdHRyLm5hbWUpXG4gICAgICB9XG4gICAgfSlcbiAgICBmb3JFYWNoKG1lcmdlRnJvbS5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBpZiAoc2hvdWxkU2V0dGxlQXR0cmlidXRlKGF0dHIubmFtZSkpIHtcbiAgICAgICAgbWVyZ2VUby5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtIdG14U3dhcFN0eWxlfSBzd2FwU3R5bGVcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc0lubGluZVN3YXAoc3dhcFN0eWxlLCB0YXJnZXQpIHtcbiAgICBjb25zdCBleHRlbnNpb25zID0gZ2V0RXh0ZW5zaW9ucyh0YXJnZXQpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSBleHRlbnNpb25zW2ldXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uLmlzSW5saW5lU3dhcChzd2FwU3R5bGUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dFcnJvcihlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3dhcFN0eWxlID09PSAnb3V0ZXJIVE1MJ1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvb2JWYWx1ZVxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IG9vYkVsZW1lbnRcbiAgICogQHBhcmFtIHtIdG14U2V0dGxlSW5mb30gc2V0dGxlSW5mb1xuICAgKiBAcGFyYW0ge05vZGV8RG9jdW1lbnR9IFtyb290Tm9kZV1cbiAgICogQHJldHVybnNcbiAgICovXG4gIGZ1bmN0aW9uIG9vYlN3YXAob29iVmFsdWUsIG9vYkVsZW1lbnQsIHNldHRsZUluZm8sIHJvb3ROb2RlKSB7XG4gICAgcm9vdE5vZGUgPSByb290Tm9kZSB8fCBnZXREb2N1bWVudCgpXG4gICAgbGV0IHNlbGVjdG9yID0gJyMnICsgQ1NTLmVzY2FwZShnZXRSYXdBdHRyaWJ1dGUob29iRWxlbWVudCwgJ2lkJykpXG4gICAgLyoqIEB0eXBlIEh0bXhTd2FwU3R5bGUgKi9cbiAgICBsZXQgc3dhcFN0eWxlID0gJ291dGVySFRNTCdcbiAgICBpZiAob29iVmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH0gZWxzZSBpZiAob29iVmFsdWUuaW5kZXhPZignOicpID4gMCkge1xuICAgICAgc3dhcFN0eWxlID0gb29iVmFsdWUuc3Vic3RyaW5nKDAsIG9vYlZhbHVlLmluZGV4T2YoJzonKSlcbiAgICAgIHNlbGVjdG9yID0gb29iVmFsdWUuc3Vic3RyaW5nKG9vYlZhbHVlLmluZGV4T2YoJzonKSArIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN3YXBTdHlsZSA9IG9vYlZhbHVlXG4gICAgfVxuICAgIG9vYkVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdoeC1zd2FwLW9vYicpXG4gICAgb29iRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtaHgtc3dhcC1vb2InKVxuXG4gICAgY29uc3QgdGFyZ2V0cyA9IHF1ZXJ5U2VsZWN0b3JBbGxFeHQocm9vdE5vZGUsIHNlbGVjdG9yLCBmYWxzZSlcbiAgICBpZiAodGFyZ2V0cy5sZW5ndGgpIHtcbiAgICAgIGZvckVhY2goXG4gICAgICAgIHRhcmdldHMsXG4gICAgICAgIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgIGxldCBmcmFnbWVudFxuICAgICAgICAgIGNvbnN0IG9vYkVsZW1lbnRDbG9uZSA9IG9vYkVsZW1lbnQuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgZnJhZ21lbnQgPSBnZXREb2N1bWVudCgpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKG9vYkVsZW1lbnRDbG9uZSlcbiAgICAgICAgICBpZiAoIWlzSW5saW5lU3dhcChzd2FwU3R5bGUsIHRhcmdldCkpIHtcbiAgICAgICAgICAgIGZyYWdtZW50ID0gYXNQYXJlbnROb2RlKG9vYkVsZW1lbnRDbG9uZSkgLy8gaWYgdGhpcyBpcyBub3QgYW4gaW5saW5lIHN3YXAsIHdlIHVzZSB0aGUgY29udGVudCBvZiB0aGUgbm9kZSwgbm90IHRoZSBub2RlIGl0c2VsZlxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGJlZm9yZVN3YXBEZXRhaWxzID0geyBzaG91bGRTd2FwOiB0cnVlLCB0YXJnZXQsIGZyYWdtZW50IH1cbiAgICAgICAgICBpZiAoIXRyaWdnZXJFdmVudCh0YXJnZXQsICdodG14Om9vYkJlZm9yZVN3YXAnLCBiZWZvcmVTd2FwRGV0YWlscykpIHJldHVyblxuXG4gICAgICAgICAgdGFyZ2V0ID0gYmVmb3JlU3dhcERldGFpbHMudGFyZ2V0IC8vIGFsbG93IHJlLXRhcmdldGluZ1xuICAgICAgICAgIGlmIChiZWZvcmVTd2FwRGV0YWlscy5zaG91bGRTd2FwKSB7XG4gICAgICAgICAgICBoYW5kbGVQcmVzZXJ2ZWRFbGVtZW50cyhmcmFnbWVudClcbiAgICAgICAgICAgIHN3YXBXaXRoU3R5bGUoc3dhcFN0eWxlLCB0YXJnZXQsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgICAgICByZXN0b3JlUHJlc2VydmVkRWxlbWVudHMoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBmb3JFYWNoKHNldHRsZUluZm8uZWx0cywgZnVuY3Rpb24oZWx0KSB7XG4gICAgICAgICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDpvb2JBZnRlclN3YXAnLCBiZWZvcmVTd2FwRGV0YWlscylcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgICBvb2JFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob29iRWxlbWVudClcbiAgICB9IGVsc2Uge1xuICAgICAgb29iRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG9vYkVsZW1lbnQpXG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14Om9vYkVycm9yTm9UYXJnZXQnLCB7IGNvbnRlbnQ6IG9vYkVsZW1lbnQgfSlcbiAgICB9XG4gICAgcmV0dXJuIG9vYlZhbHVlXG4gIH1cblxuICBmdW5jdGlvbiByZXN0b3JlUHJlc2VydmVkRWxlbWVudHMoKSB7XG4gICAgY29uc3QgcGFudHJ5ID0gZmluZCgnIy0taHRteC1wcmVzZXJ2ZS1wYW50cnktLScpXG4gICAgaWYgKHBhbnRyeSkge1xuICAgICAgZm9yIChjb25zdCBwcmVzZXJ2ZWRFbHQgb2YgWy4uLnBhbnRyeS5jaGlsZHJlbl0pIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdFbGVtZW50ID0gZmluZCgnIycgKyBwcmVzZXJ2ZWRFbHQuaWQpXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgLSB1c2UgcHJvcG9zZWQgbW92ZUJlZm9yZSBmZWF0dXJlXG4gICAgICAgIGV4aXN0aW5nRWxlbWVudC5wYXJlbnROb2RlLm1vdmVCZWZvcmUocHJlc2VydmVkRWx0LCBleGlzdGluZ0VsZW1lbnQpXG4gICAgICAgIGV4aXN0aW5nRWxlbWVudC5yZW1vdmUoKVxuICAgICAgfVxuICAgICAgcGFudHJ5LnJlbW92ZSgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudHxQYXJlbnROb2RlfSBmcmFnbWVudFxuICAgKi9cbiAgZnVuY3Rpb24gaGFuZGxlUHJlc2VydmVkRWxlbWVudHMoZnJhZ21lbnQpIHtcbiAgICBmb3JFYWNoKGZpbmRBbGwoZnJhZ21lbnQsICdbaHgtcHJlc2VydmVdLCBbZGF0YS1oeC1wcmVzZXJ2ZV0nKSwgZnVuY3Rpb24ocHJlc2VydmVkRWx0KSB7XG4gICAgICBjb25zdCBpZCA9IGdldEF0dHJpYnV0ZVZhbHVlKHByZXNlcnZlZEVsdCwgJ2lkJylcbiAgICAgIGNvbnN0IGV4aXN0aW5nRWxlbWVudCA9IGdldERvY3VtZW50KCkuZ2V0RWxlbWVudEJ5SWQoaWQpXG4gICAgICBpZiAoZXhpc3RpbmdFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHByZXNlcnZlZEVsdC5tb3ZlQmVmb3JlKSB7IC8vIGlmIHRoZSBtb3ZlQmVmb3JlIEFQSSBleGlzdHMsIHVzZSBpdFxuICAgICAgICAgIC8vIGdldCBvciBjcmVhdGUgYSBzdG9yYWdlIHNwb3QgZm9yIHN0dWZmXG4gICAgICAgICAgbGV0IHBhbnRyeSA9IGZpbmQoJyMtLWh0bXgtcHJlc2VydmUtcGFudHJ5LS0nKVxuICAgICAgICAgIGlmIChwYW50cnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgZ2V0RG9jdW1lbnQoKS5ib2R5Lmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJlbmQnLCBcIjxkaXYgaWQ9Jy0taHRteC1wcmVzZXJ2ZS1wYW50cnktLSc+PC9kaXY+XCIpXG4gICAgICAgICAgICBwYW50cnkgPSBmaW5kKCcjLS1odG14LXByZXNlcnZlLXBhbnRyeS0tJylcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZSAtIHVzZSBwcm9wb3NlZCBtb3ZlQmVmb3JlIGZlYXR1cmVcbiAgICAgICAgICBwYW50cnkubW92ZUJlZm9yZShleGlzdGluZ0VsZW1lbnQsIG51bGwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJlc2VydmVkRWx0LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGV4aXN0aW5nRWxlbWVudCwgcHJlc2VydmVkRWx0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudE5vZGVcbiAgICogQHBhcmFtIHtQYXJlbnROb2RlfSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0h0bXhTZXR0bGVJbmZvfSBzZXR0bGVJbmZvXG4gICAqL1xuICBmdW5jdGlvbiBoYW5kbGVBdHRyaWJ1dGVzKHBhcmVudE5vZGUsIGZyYWdtZW50LCBzZXR0bGVJbmZvKSB7XG4gICAgZm9yRWFjaChmcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbaWRdJyksIGZ1bmN0aW9uKG5ld05vZGUpIHtcbiAgICAgIGNvbnN0IGlkID0gZ2V0UmF3QXR0cmlidXRlKG5ld05vZGUsICdpZCcpXG4gICAgICBpZiAoaWQgJiYgaWQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBub3JtYWxpemVkSWQgPSBpZC5yZXBsYWNlKFwiJ1wiLCBcIlxcXFwnXCIpXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRUYWcgPSBuZXdOb2RlLnRhZ05hbWUucmVwbGFjZSgnOicsICdcXFxcOicpXG4gICAgICAgIGNvbnN0IHBhcmVudEVsdCA9IGFzUGFyZW50Tm9kZShwYXJlbnROb2RlKVxuICAgICAgICBjb25zdCBvbGROb2RlID0gcGFyZW50RWx0ICYmIHBhcmVudEVsdC5xdWVyeVNlbGVjdG9yKG5vcm1hbGl6ZWRUYWcgKyBcIltpZD0nXCIgKyBub3JtYWxpemVkSWQgKyBcIiddXCIpXG4gICAgICAgIGlmIChvbGROb2RlICYmIG9sZE5vZGUgIT09IHBhcmVudEVsdCkge1xuICAgICAgICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSBuZXdOb2RlLmNsb25lTm9kZSgpXG4gICAgICAgICAgY2xvbmVBdHRyaWJ1dGVzKG5ld05vZGUsIG9sZE5vZGUpXG4gICAgICAgICAgc2V0dGxlSW5mby50YXNrcy5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2xvbmVBdHRyaWJ1dGVzKG5ld05vZGUsIG5ld0F0dHJpYnV0ZXMpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZFxuICAgKiBAcmV0dXJucyB7SHRteFNldHRsZVRhc2t9XG4gICAqL1xuICBmdW5jdGlvbiBtYWtlQWpheExvYWRUYXNrKGNoaWxkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3ZlQ2xhc3NGcm9tRWxlbWVudChjaGlsZCwgaHRteC5jb25maWcuYWRkZWRDbGFzcylcbiAgICAgIHByb2Nlc3NOb2RlKGFzRWxlbWVudChjaGlsZCkpXG4gICAgICBwcm9jZXNzRm9jdXMoYXNQYXJlbnROb2RlKGNoaWxkKSlcbiAgICAgIHRyaWdnZXJFdmVudChjaGlsZCwgJ2h0bXg6bG9hZCcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UGFyZW50Tm9kZX0gY2hpbGRcbiAgICovXG4gIGZ1bmN0aW9uIHByb2Nlc3NGb2N1cyhjaGlsZCkge1xuICAgIGNvbnN0IGF1dG9mb2N1cyA9ICdbYXV0b2ZvY3VzXSdcbiAgICBjb25zdCBhdXRvRm9jdXNlZEVsdCA9IGFzSHRtbEVsZW1lbnQobWF0Y2hlcyhjaGlsZCwgYXV0b2ZvY3VzKSA/IGNoaWxkIDogY2hpbGQucXVlcnlTZWxlY3RvcihhdXRvZm9jdXMpKVxuICAgIGlmIChhdXRvRm9jdXNlZEVsdCAhPSBudWxsKSB7XG4gICAgICBhdXRvRm9jdXNlZEVsdC5mb2N1cygpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50Tm9kZVxuICAgKiBAcGFyYW0ge05vZGV9IGluc2VydEJlZm9yZVxuICAgKiBAcGFyYW0ge1BhcmVudE5vZGV9IGZyYWdtZW50XG4gICAqIEBwYXJhbSB7SHRteFNldHRsZUluZm99IHNldHRsZUluZm9cbiAgICovXG4gIGZ1bmN0aW9uIGluc2VydE5vZGVzQmVmb3JlKHBhcmVudE5vZGUsIGluc2VydEJlZm9yZSwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHtcbiAgICBoYW5kbGVBdHRyaWJ1dGVzKHBhcmVudE5vZGUsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICAgIHdoaWxlIChmcmFnbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gZnJhZ21lbnQuZmlyc3RDaGlsZFxuICAgICAgYWRkQ2xhc3NUb0VsZW1lbnQoYXNFbGVtZW50KGNoaWxkKSwgaHRteC5jb25maWcuYWRkZWRDbGFzcylcbiAgICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNoaWxkLCBpbnNlcnRCZWZvcmUpXG4gICAgICBpZiAoY2hpbGQubm9kZVR5cGUgIT09IE5vZGUuVEVYVF9OT0RFICYmIGNoaWxkLm5vZGVUeXBlICE9PSBOb2RlLkNPTU1FTlRfTk9ERSkge1xuICAgICAgICBzZXR0bGVJbmZvLnRhc2tzLnB1c2gobWFrZUFqYXhMb2FkVGFzayhjaGlsZCkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGJhc2VkIG9uIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2h5YW1hbW90by9mZDQzNTUwNWQyOWViZmEzZDk3MTZmZDJiZThkNDJmMCxcbiAgICogZGVyaXZlZCBmcm9tIEphdmEncyBzdHJpbmcgaGFzaGNvZGUgaW1wbGVtZW50YXRpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGFzaFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gc3RyaW5nSGFzaChzdHJpbmcsIGhhc2gpIHtcbiAgICBsZXQgY2hhciA9IDBcbiAgICB3aGlsZSAoY2hhciA8IHN0cmluZy5sZW5ndGgpIHtcbiAgICAgIGhhc2ggPSAoaGFzaCA8PCA1KSAtIGhhc2ggKyBzdHJpbmcuY2hhckNvZGVBdChjaGFyKyspIHwgMCAvLyBiaXR3aXNlIG9yIGVuc3VyZXMgd2UgaGF2ZSBhIDMyLWJpdCBpbnRcbiAgICB9XG4gICAgcmV0dXJuIGhhc2hcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gYXR0cmlidXRlSGFzaChlbHQpIHtcbiAgICBsZXQgaGFzaCA9IDBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsdC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBlbHQuYXR0cmlidXRlc1tpXVxuICAgICAgaWYgKGF0dHJpYnV0ZS52YWx1ZSkgeyAvLyBvbmx5IGluY2x1ZGUgYXR0cmlidXRlcyB3LyBhY3R1YWwgdmFsdWVzIChlbXB0eSBpcyBzYW1lIGFzIG5vbi1leGlzdGVudClcbiAgICAgICAgaGFzaCA9IHN0cmluZ0hhc2goYXR0cmlidXRlLm5hbWUsIGhhc2gpXG4gICAgICAgIGhhc2ggPSBzdHJpbmdIYXNoKGF0dHJpYnV0ZS52YWx1ZSwgaGFzaClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhhc2hcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSBlbHRcbiAgICovXG4gIGZ1bmN0aW9uIGRlSW5pdE9uSGFuZGxlcnMoZWx0KSB7XG4gICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICBpZiAoaW50ZXJuYWxEYXRhLm9uSGFuZGxlcnMpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW50ZXJuYWxEYXRhLm9uSGFuZGxlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaGFuZGxlckluZm8gPSBpbnRlcm5hbERhdGEub25IYW5kbGVyc1tpXVxuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVySW1wbChlbHQsIGhhbmRsZXJJbmZvLmV2ZW50LCBoYW5kbGVySW5mby5saXN0ZW5lcilcbiAgICAgIH1cbiAgICAgIGRlbGV0ZSBpbnRlcm5hbERhdGEub25IYW5kbGVyc1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAgICovXG4gIGZ1bmN0aW9uIGRlSW5pdE5vZGUoZWxlbWVudCkge1xuICAgIGNvbnN0IGludGVybmFsRGF0YSA9IGdldEludGVybmFsRGF0YShlbGVtZW50KVxuICAgIGlmIChpbnRlcm5hbERhdGEudGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGludGVybmFsRGF0YS50aW1lb3V0KVxuICAgIH1cbiAgICBpZiAoaW50ZXJuYWxEYXRhLmxpc3RlbmVySW5mb3MpIHtcbiAgICAgIGZvckVhY2goaW50ZXJuYWxEYXRhLmxpc3RlbmVySW5mb3MsIGZ1bmN0aW9uKGluZm8pIHtcbiAgICAgICAgaWYgKGluZm8ub24pIHtcbiAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVySW1wbChpbmZvLm9uLCBpbmZvLnRyaWdnZXIsIGluZm8ubGlzdGVuZXIpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGRlSW5pdE9uSGFuZGxlcnMoZWxlbWVudClcbiAgICBmb3JFYWNoKE9iamVjdC5rZXlzKGludGVybmFsRGF0YSksIGZ1bmN0aW9uKGtleSkgeyBpZiAoa2V5ICE9PSAnZmlyc3RJbml0Q29tcGxldGVkJykgZGVsZXRlIGludGVybmFsRGF0YVtrZXldIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gICAqL1xuICBmdW5jdGlvbiBjbGVhblVwRWxlbWVudChlbGVtZW50KSB7XG4gICAgdHJpZ2dlckV2ZW50KGVsZW1lbnQsICdodG14OmJlZm9yZUNsZWFudXBFbGVtZW50JylcbiAgICBkZUluaXROb2RlKGVsZW1lbnQpXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvckVhY2goZWxlbWVudC5jaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHsgY2xlYW5VcEVsZW1lbnQoY2hpbGQpIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtQYXJlbnROb2RlfSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0h0bXhTZXR0bGVJbmZvfSBzZXR0bGVJbmZvXG4gICAqL1xuICBmdW5jdGlvbiBzd2FwT3V0ZXJIVE1MKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHtcbiAgICBpZiAodGFyZ2V0LnRhZ05hbWUgPT09ICdCT0RZJykgeyAvLyBzcGVjaWFsIGNhc2UgdGhlIGJvZHkgdG8gaW5uZXJIVE1MIGJlY2F1c2UgRG9jdW1lbnRGcmFnbWVudHMgY2FuJ3QgY29udGFpbiBhIGJvZHkgZWx0IHVuZm9ydHVuYXRlbHlcbiAgICAgIHJldHVybiBzd2FwSW5uZXJIVE1MKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgfVxuICAgIC8qKiBAdHlwZSB7Tm9kZX0gKi9cbiAgICBsZXQgbmV3RWx0XG4gICAgY29uc3QgZWx0QmVmb3JlTmV3Q29udGVudCA9IHRhcmdldC5wcmV2aW91c1NpYmxpbmdcbiAgICBjb25zdCBwYXJlbnROb2RlID0gcGFyZW50RWx0KHRhcmdldClcbiAgICBpZiAoIXBhcmVudE5vZGUpIHsgLy8gd2hlbiBwYXJlbnQgbm9kZSBkaXNhcHBlYXJzLCB3ZSBjYW4ndCBkbyBhbnl0aGluZ1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGluc2VydE5vZGVzQmVmb3JlKHBhcmVudE5vZGUsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgaWYgKGVsdEJlZm9yZU5ld0NvbnRlbnQgPT0gbnVsbCkge1xuICAgICAgbmV3RWx0ID0gcGFyZW50Tm9kZS5maXJzdENoaWxkXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld0VsdCA9IGVsdEJlZm9yZU5ld0NvbnRlbnQubmV4dFNpYmxpbmdcbiAgICB9XG4gICAgc2V0dGxlSW5mby5lbHRzID0gc2V0dGxlSW5mby5lbHRzLmZpbHRlcihmdW5jdGlvbihlKSB7IHJldHVybiBlICE9PSB0YXJnZXQgfSlcbiAgICAvLyBzY2FuIHRocm91Z2ggYWxsIG5ld2x5IGFkZGVkIGNvbnRlbnQgYW5kIGFkZCBhbGwgZWxlbWVudHMgdG8gdGhlIHNldHRsZSBpbmZvIHNvIHdlIHRyaWdnZXJcbiAgICAvLyBldmVudHMgcHJvcGVybHkgb24gdGhlbVxuICAgIHdoaWxlIChuZXdFbHQgJiYgbmV3RWx0ICE9PSB0YXJnZXQpIHtcbiAgICAgIGlmIChuZXdFbHQgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgIHNldHRsZUluZm8uZWx0cy5wdXNoKG5ld0VsdClcbiAgICAgIH1cbiAgICAgIG5ld0VsdCA9IG5ld0VsdC5uZXh0U2libGluZ1xuICAgIH1cbiAgICBjbGVhblVwRWxlbWVudCh0YXJnZXQpXG4gICAgdGFyZ2V0LnJlbW92ZSgpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtQYXJlbnROb2RlfSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0h0bXhTZXR0bGVJbmZvfSBzZXR0bGVJbmZvXG4gICAqL1xuICBmdW5jdGlvbiBzd2FwQWZ0ZXJCZWdpbih0YXJnZXQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKSB7XG4gICAgcmV0dXJuIGluc2VydE5vZGVzQmVmb3JlKHRhcmdldCwgdGFyZ2V0LmZpcnN0Q2hpbGQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gICAqIEBwYXJhbSB7UGFyZW50Tm9kZX0gZnJhZ21lbnRcbiAgICogQHBhcmFtIHtIdG14U2V0dGxlSW5mb30gc2V0dGxlSW5mb1xuICAgKi9cbiAgZnVuY3Rpb24gc3dhcEJlZm9yZUJlZ2luKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHtcbiAgICByZXR1cm4gaW5zZXJ0Tm9kZXNCZWZvcmUocGFyZW50RWx0KHRhcmdldCksIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtQYXJlbnROb2RlfSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0h0bXhTZXR0bGVJbmZvfSBzZXR0bGVJbmZvXG4gICAqL1xuICBmdW5jdGlvbiBzd2FwQmVmb3JlRW5kKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHtcbiAgICByZXR1cm4gaW5zZXJ0Tm9kZXNCZWZvcmUodGFyZ2V0LCBudWxsLCBmcmFnbWVudCwgc2V0dGxlSW5mbylcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0ge1BhcmVudE5vZGV9IGZyYWdtZW50XG4gICAqIEBwYXJhbSB7SHRteFNldHRsZUluZm99IHNldHRsZUluZm9cbiAgICovXG4gIGZ1bmN0aW9uIHN3YXBBZnRlckVuZCh0YXJnZXQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKSB7XG4gICAgcmV0dXJuIGluc2VydE5vZGVzQmVmb3JlKHBhcmVudEVsdCh0YXJnZXQpLCB0YXJnZXQubmV4dFNpYmxpbmcsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gICAqL1xuICBmdW5jdGlvbiBzd2FwRGVsZXRlKHRhcmdldCkge1xuICAgIGNsZWFuVXBFbGVtZW50KHRhcmdldClcbiAgICBjb25zdCBwYXJlbnQgPSBwYXJlbnRFbHQodGFyZ2V0KVxuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIHJldHVybiBwYXJlbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0ge1BhcmVudE5vZGV9IGZyYWdtZW50XG4gICAqIEBwYXJhbSB7SHRteFNldHRsZUluZm99IHNldHRsZUluZm9cbiAgICovXG4gIGZ1bmN0aW9uIHN3YXBJbm5lckhUTUwodGFyZ2V0LCBmcmFnbWVudCwgc2V0dGxlSW5mbykge1xuICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSB0YXJnZXQuZmlyc3RDaGlsZFxuICAgIGluc2VydE5vZGVzQmVmb3JlKHRhcmdldCwgZmlyc3RDaGlsZCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgaWYgKGZpcnN0Q2hpbGQpIHtcbiAgICAgIHdoaWxlIChmaXJzdENoaWxkLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGNsZWFuVXBFbGVtZW50KGZpcnN0Q2hpbGQubmV4dFNpYmxpbmcpXG4gICAgICAgIHRhcmdldC5yZW1vdmVDaGlsZChmaXJzdENoaWxkLm5leHRTaWJsaW5nKVxuICAgICAgfVxuICAgICAgY2xlYW5VcEVsZW1lbnQoZmlyc3RDaGlsZClcbiAgICAgIHRhcmdldC5yZW1vdmVDaGlsZChmaXJzdENoaWxkKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0h0bXhTd2FwU3R5bGV9IHN3YXBTdHlsZVxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICAgKiBAcGFyYW0ge1BhcmVudE5vZGV9IGZyYWdtZW50XG4gICAqIEBwYXJhbSB7SHRteFNldHRsZUluZm99IHNldHRsZUluZm9cbiAgICovXG4gIGZ1bmN0aW9uIHN3YXBXaXRoU3R5bGUoc3dhcFN0eWxlLCBlbHQsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHtcbiAgICBzd2l0Y2ggKHN3YXBTdHlsZSkge1xuICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgIHJldHVyblxuICAgICAgY2FzZSAnb3V0ZXJIVE1MJzpcbiAgICAgICAgc3dhcE91dGVySFRNTCh0YXJnZXQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICAgICAgICByZXR1cm5cbiAgICAgIGNhc2UgJ2FmdGVyYmVnaW4nOlxuICAgICAgICBzd2FwQWZ0ZXJCZWdpbih0YXJnZXQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICAgICAgICByZXR1cm5cbiAgICAgIGNhc2UgJ2JlZm9yZWJlZ2luJzpcbiAgICAgICAgc3dhcEJlZm9yZUJlZ2luKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgIHJldHVyblxuICAgICAgY2FzZSAnYmVmb3JlZW5kJzpcbiAgICAgICAgc3dhcEJlZm9yZUVuZCh0YXJnZXQsIGZyYWdtZW50LCBzZXR0bGVJbmZvKVxuICAgICAgICByZXR1cm5cbiAgICAgIGNhc2UgJ2FmdGVyZW5kJzpcbiAgICAgICAgc3dhcEFmdGVyRW5kKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgIHJldHVyblxuICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgc3dhcERlbGV0ZSh0YXJnZXQpXG4gICAgICAgIHJldHVyblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGV4dGVuc2lvbnMgPSBnZXRFeHRlbnNpb25zKGVsdClcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXh0ID0gZXh0ZW5zaW9uc1tpXVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXdFbGVtZW50cyA9IGV4dC5oYW5kbGVTd2FwKHN3YXBTdHlsZSwgdGFyZ2V0LCBmcmFnbWVudCwgc2V0dGxlSW5mbylcbiAgICAgICAgICAgIGlmIChuZXdFbGVtZW50cykge1xuICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShuZXdFbGVtZW50cykpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBoYW5kbGVTd2FwIHJldHVybnMgYW4gYXJyYXkgKGxpa2UpIG9mIGVsZW1lbnRzLCB3ZSBoYW5kbGUgdGhlbVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmV3RWxlbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbmV3RWxlbWVudHNbal1cbiAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUgJiYgY2hpbGQubm9kZVR5cGUgIT09IE5vZGUuQ09NTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHRsZUluZm8udGFza3MucHVzaChtYWtlQWpheExvYWRUYXNrKGNoaWxkKSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nRXJyb3IoZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN3YXBTdHlsZSA9PT0gJ2lubmVySFRNTCcpIHtcbiAgICAgICAgICBzd2FwSW5uZXJIVE1MKHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dhcFdpdGhTdHlsZShodG14LmNvbmZpZy5kZWZhdWx0U3dhcFN0eWxlLCBlbHQsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0h0bXhTZXR0bGVJbmZvfSBzZXR0bGVJbmZvXG4gICAqIEBwYXJhbSB7Tm9kZXxEb2N1bWVudH0gW3Jvb3ROb2RlXVxuICAgKi9cbiAgZnVuY3Rpb24gZmluZEFuZFN3YXBPb2JFbGVtZW50cyhmcmFnbWVudCwgc2V0dGxlSW5mbywgcm9vdE5vZGUpIHtcbiAgICB2YXIgb29iRWx0cyA9IGZpbmRBbGwoZnJhZ21lbnQsICdbaHgtc3dhcC1vb2JdLCBbZGF0YS1oeC1zd2FwLW9vYl0nKVxuICAgIGZvckVhY2gob29iRWx0cywgZnVuY3Rpb24ob29iRWxlbWVudCkge1xuICAgICAgaWYgKGh0bXguY29uZmlnLmFsbG93TmVzdGVkT29iU3dhcHMgfHwgb29iRWxlbWVudC5wYXJlbnRFbGVtZW50ID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG9vYlZhbHVlID0gZ2V0QXR0cmlidXRlVmFsdWUob29iRWxlbWVudCwgJ2h4LXN3YXAtb29iJylcbiAgICAgICAgaWYgKG9vYlZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICBvb2JTd2FwKG9vYlZhbHVlLCBvb2JFbGVtZW50LCBzZXR0bGVJbmZvLCByb290Tm9kZSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb29iRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2h4LXN3YXAtb29iJylcbiAgICAgICAgb29iRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtaHgtc3dhcC1vb2InKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG9vYkVsdHMubGVuZ3RoID4gMFxuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgY29tcGxldGUgc3dhcHBpbmcgcGlwZWxpbmUsIGluY2x1ZGluZzogZGVsYXksIHZpZXcgdHJhbnNpdGlvbnMsIGZvY3VzIGFuZCBzZWxlY3Rpb24gcHJlc2VydmF0aW9uLFxuICAgKiB0aXRsZSB1cGRhdGVzLCBzY3JvbGwsIE9PQiBzd2FwcGluZywgbm9ybWFsIHN3YXBwaW5nIGFuZCBzZXR0bGluZ1xuICAgKiBAcGFyYW0ge3N0cmluZ3xFbGVtZW50fSB0YXJnZXRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAgICogQHBhcmFtIHtIdG14U3dhcFNwZWNpZmljYXRpb259IHN3YXBTcGVjXG4gICAqIEBwYXJhbSB7U3dhcE9wdGlvbnN9IFtzd2FwT3B0aW9uc11cbiAgICovXG4gIGZ1bmN0aW9uIHN3YXAodGFyZ2V0LCBjb250ZW50LCBzd2FwU3BlYywgc3dhcE9wdGlvbnMpIHtcbiAgICBpZiAoIXN3YXBPcHRpb25zKSB7XG4gICAgICBzd2FwT3B0aW9ucyA9IHt9XG4gICAgfVxuICAgIC8vIG9wdGlvbmFsIHRyYW5zaXRpb24gQVBJIHByb21pc2UgY2FsbGJhY2tzXG4gICAgbGV0IHNldHRsZVJlc29sdmUgPSBudWxsXG4gICAgbGV0IHNldHRsZVJlamVjdCA9IG51bGxcblxuICAgIGxldCBkb1N3YXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIG1heWJlQ2FsbChzd2FwT3B0aW9ucy5iZWZvcmVTd2FwQ2FsbGJhY2spXG5cbiAgICAgIHRhcmdldCA9IHJlc29sdmVUYXJnZXQodGFyZ2V0KVxuICAgICAgY29uc3Qgcm9vdE5vZGUgPSBzd2FwT3B0aW9ucy5jb250ZXh0RWxlbWVudCA/IGdldFJvb3ROb2RlKHN3YXBPcHRpb25zLmNvbnRleHRFbGVtZW50LCBmYWxzZSkgOiBnZXREb2N1bWVudCgpXG5cbiAgICAgIC8vIHByZXNlcnZlIGZvY3VzIGFuZCBzZWxlY3Rpb25cbiAgICAgIGNvbnN0IGFjdGl2ZUVsdCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICAgIGxldCBzZWxlY3Rpb25JbmZvID0ge31cbiAgICAgIHNlbGVjdGlvbkluZm8gPSB7XG4gICAgICAgIGVsdDogYWN0aXZlRWx0LFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHN0YXJ0OiBhY3RpdmVFbHQgPyBhY3RpdmVFbHQuc2VsZWN0aW9uU3RhcnQgOiBudWxsLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGVuZDogYWN0aXZlRWx0ID8gYWN0aXZlRWx0LnNlbGVjdGlvbkVuZCA6IG51bGxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNldHRsZUluZm8gPSBtYWtlU2V0dGxlSW5mbyh0YXJnZXQpXG5cbiAgICAgIC8vIEZvciB0ZXh0IGNvbnRlbnQgc3dhcHMsIGRvbid0IHBhcnNlIHRoZSByZXNwb25zZSBhcyBIVE1MLCBqdXN0IGluc2VydCBpdFxuICAgICAgaWYgKHN3YXBTcGVjLnN3YXBTdHlsZSA9PT0gJ3RleHRDb250ZW50Jykge1xuICAgICAgICB0YXJnZXQudGV4dENvbnRlbnQgPSBjb250ZW50XG4gICAgICAvLyBPdGhlcndpc2UsIG1ha2UgdGhlIGZyYWdtZW50IGFuZCBwcm9jZXNzIGl0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZnJhZ21lbnQgPSBtYWtlRnJhZ21lbnQoY29udGVudClcblxuICAgICAgICBzZXR0bGVJbmZvLnRpdGxlID0gc3dhcE9wdGlvbnMudGl0bGUgfHwgZnJhZ21lbnQudGl0bGVcbiAgICAgICAgaWYgKHN3YXBPcHRpb25zLmhpc3RvcnlSZXF1ZXN0KSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZSBmcmFnbWVudCBjYW4gYmUgYSBwYXJlbnROb2RlIEVsZW1lbnRcbiAgICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoJ1toeC1oaXN0b3J5LWVsdF0sW2RhdGEtaHgtaGlzdG9yeS1lbHRdJykgfHwgZnJhZ21lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlbGVjdC1vb2Igc3dhcHNcbiAgICAgICAgaWYgKHN3YXBPcHRpb25zLnNlbGVjdE9PQikge1xuICAgICAgICAgIGNvbnN0IG9vYlNlbGVjdFZhbHVlcyA9IHN3YXBPcHRpb25zLnNlbGVjdE9PQi5zcGxpdCgnLCcpXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvb2JTZWxlY3RWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9vYlNlbGVjdFZhbHVlID0gb29iU2VsZWN0VmFsdWVzW2ldLnNwbGl0KCc6JywgMilcbiAgICAgICAgICAgIGxldCBpZCA9IG9vYlNlbGVjdFZhbHVlWzBdLnRyaW0oKVxuICAgICAgICAgICAgaWYgKGlkLmluZGV4T2YoJyMnKSA9PT0gMCkge1xuICAgICAgICAgICAgICBpZCA9IGlkLnN1YnN0cmluZygxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgb29iVmFsdWUgPSBvb2JTZWxlY3RWYWx1ZVsxXSB8fCAndHJ1ZSdcbiAgICAgICAgICAgIGNvbnN0IG9vYkVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGlkKVxuICAgICAgICAgICAgaWYgKG9vYkVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgb29iU3dhcChvb2JWYWx1ZSwgb29iRWxlbWVudCwgc2V0dGxlSW5mbywgcm9vdE5vZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG9vYiBzd2Fwc1xuICAgICAgICBmaW5kQW5kU3dhcE9vYkVsZW1lbnRzKGZyYWdtZW50LCBzZXR0bGVJbmZvLCByb290Tm9kZSlcbiAgICAgICAgZm9yRWFjaChmaW5kQWxsKGZyYWdtZW50LCAndGVtcGxhdGUnKSwgLyoqIEBwYXJhbSB7SFRNTFRlbXBsYXRlRWxlbWVudH0gdGVtcGxhdGUgKi9mdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgICAgIGlmICh0ZW1wbGF0ZS5jb250ZW50ICYmIGZpbmRBbmRTd2FwT29iRWxlbWVudHModGVtcGxhdGUuY29udGVudCwgc2V0dGxlSW5mbywgcm9vdE5vZGUpKSB7XG4gICAgICAgICAgICAvLyBBdm9pZCBwb2xsdXRpbmcgdGhlIERPTSB3aXRoIGVtcHR5IHRlbXBsYXRlcyB0aGF0IHdlcmUgb25seSB1c2VkIHRvIGVuY2Fwc3VsYXRlIG9vYiBzd2FwXG4gICAgICAgICAgICB0ZW1wbGF0ZS5yZW1vdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBub3JtYWwgc3dhcFxuICAgICAgICBpZiAoc3dhcE9wdGlvbnMuc2VsZWN0KSB7XG4gICAgICAgICAgY29uc3QgbmV3RnJhZ21lbnQgPSBnZXREb2N1bWVudCgpLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICAgICAgICAgIGZvckVhY2goZnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbChzd2FwT3B0aW9ucy5zZWxlY3QpLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBuZXdGcmFnbWVudC5hcHBlbmRDaGlsZChub2RlKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgZnJhZ21lbnQgPSBuZXdGcmFnbWVudFxuICAgICAgICB9XG4gICAgICAgIGhhbmRsZVByZXNlcnZlZEVsZW1lbnRzKGZyYWdtZW50KVxuICAgICAgICBzd2FwV2l0aFN0eWxlKHN3YXBTcGVjLnN3YXBTdHlsZSwgc3dhcE9wdGlvbnMuY29udGV4dEVsZW1lbnQsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pXG4gICAgICAgIHJlc3RvcmVQcmVzZXJ2ZWRFbGVtZW50cygpXG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IHNhdmVkIGZvY3VzIGFuZCBzZWxlY3Rpb24gaW5mb3JtYXRpb24gdG8gc3dhcHBlZCBjb250ZW50XG4gICAgICBpZiAoc2VsZWN0aW9uSW5mby5lbHQgJiZcbiAgICAgICAgIWJvZHlDb250YWlucyhzZWxlY3Rpb25JbmZvLmVsdCkgJiZcbiAgICAgICAgZ2V0UmF3QXR0cmlidXRlKHNlbGVjdGlvbkluZm8uZWx0LCAnaWQnKSkge1xuICAgICAgICBjb25zdCBuZXdBY3RpdmVFbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChnZXRSYXdBdHRyaWJ1dGUoc2VsZWN0aW9uSW5mby5lbHQsICdpZCcpKVxuICAgICAgICBjb25zdCBmb2N1c09wdGlvbnMgPSB7IHByZXZlbnRTY3JvbGw6IHN3YXBTcGVjLmZvY3VzU2Nyb2xsICE9PSB1bmRlZmluZWQgPyAhc3dhcFNwZWMuZm9jdXNTY3JvbGwgOiAhaHRteC5jb25maWcuZGVmYXVsdEZvY3VzU2Nyb2xsIH1cbiAgICAgICAgaWYgKG5ld0FjdGl2ZUVsdCkge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uSW5mby5zdGFydCAmJiBuZXdBY3RpdmVFbHQuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgbmV3QWN0aXZlRWx0LnNldFNlbGVjdGlvblJhbmdlKHNlbGVjdGlvbkluZm8uc3RhcnQsIHNlbGVjdGlvbkluZm8uZW5kKVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAvLyB0aGUgc2V0U2VsZWN0aW9uUmFuZ2UgbWV0aG9kIGlzIHByZXNlbnQgb24gZmllbGRzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBpdCwgc28ganVzdCBsZXQgdGhpcyBmYWlsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld0FjdGl2ZUVsdC5mb2N1cyhmb2N1c09wdGlvbnMpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoaHRteC5jb25maWcuc3dhcHBpbmdDbGFzcylcbiAgICAgIGZvckVhY2goc2V0dGxlSW5mby5lbHRzLCBmdW5jdGlvbihlbHQpIHtcbiAgICAgICAgaWYgKGVsdC5jbGFzc0xpc3QpIHtcbiAgICAgICAgICBlbHQuY2xhc3NMaXN0LmFkZChodG14LmNvbmZpZy5zZXR0bGluZ0NsYXNzKVxuICAgICAgICB9XG4gICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OmFmdGVyU3dhcCcsIHN3YXBPcHRpb25zLmV2ZW50SW5mbylcbiAgICAgIH0pXG4gICAgICBtYXliZUNhbGwoc3dhcE9wdGlvbnMuYWZ0ZXJTd2FwQ2FsbGJhY2spXG5cbiAgICAgIC8vIG1lcmdlIGluIG5ldyB0aXRsZSBhZnRlciBzd2FwIGJ1dCBiZWZvcmUgc2V0dGxlXG4gICAgICBpZiAoIXN3YXBTcGVjLmlnbm9yZVRpdGxlKSB7XG4gICAgICAgIGhhbmRsZVRpdGxlKHNldHRsZUluZm8udGl0bGUpXG4gICAgICB9XG5cbiAgICAgIC8vIHNldHRsZVxuICAgICAgY29uc3QgZG9TZXR0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yRWFjaChzZXR0bGVJbmZvLnRhc2tzLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgdGFzay5jYWxsKClcbiAgICAgICAgfSlcbiAgICAgICAgZm9yRWFjaChzZXR0bGVJbmZvLmVsdHMsIGZ1bmN0aW9uKGVsdCkge1xuICAgICAgICAgIGlmIChlbHQuY2xhc3NMaXN0KSB7XG4gICAgICAgICAgICBlbHQuY2xhc3NMaXN0LnJlbW92ZShodG14LmNvbmZpZy5zZXR0bGluZ0NsYXNzKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDphZnRlclNldHRsZScsIHN3YXBPcHRpb25zLmV2ZW50SW5mbylcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAoc3dhcE9wdGlvbnMuYW5jaG9yKSB7XG4gICAgICAgICAgY29uc3QgYW5jaG9yVGFyZ2V0ID0gYXNFbGVtZW50KHJlc29sdmVUYXJnZXQoJyMnICsgc3dhcE9wdGlvbnMuYW5jaG9yKSlcbiAgICAgICAgICBpZiAoYW5jaG9yVGFyZ2V0KSB7XG4gICAgICAgICAgICBhbmNob3JUYXJnZXQuc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ3N0YXJ0JywgYmVoYXZpb3I6ICdhdXRvJyB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZVNjcm9sbFN0YXRlKHNldHRsZUluZm8uZWx0cywgc3dhcFNwZWMpXG4gICAgICAgIG1heWJlQ2FsbChzd2FwT3B0aW9ucy5hZnRlclNldHRsZUNhbGxiYWNrKVxuICAgICAgICBtYXliZUNhbGwoc2V0dGxlUmVzb2x2ZSlcbiAgICAgIH1cblxuICAgICAgaWYgKHN3YXBTcGVjLnNldHRsZURlbGF5ID4gMCkge1xuICAgICAgICBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGRvU2V0dGxlLCBzd2FwU3BlYy5zZXR0bGVEZWxheSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvU2V0dGxlKClcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNob3VsZFRyYW5zaXRpb24gPSBodG14LmNvbmZpZy5nbG9iYWxWaWV3VHJhbnNpdGlvbnNcbiAgICBpZiAoc3dhcFNwZWMuaGFzT3duUHJvcGVydHkoJ3RyYW5zaXRpb24nKSkge1xuICAgICAgc2hvdWxkVHJhbnNpdGlvbiA9IHN3YXBTcGVjLnRyYW5zaXRpb25cbiAgICB9XG5cbiAgICBjb25zdCBlbHQgPSBzd2FwT3B0aW9ucy5jb250ZXh0RWxlbWVudCB8fCBnZXREb2N1bWVudCgpXG5cbiAgICBpZiAoc2hvdWxkVHJhbnNpdGlvbiAmJlxuICAgICAgICAgICAgdHJpZ2dlckV2ZW50KGVsdCwgJ2h0bXg6YmVmb3JlVHJhbnNpdGlvbicsIHN3YXBPcHRpb25zLmV2ZW50SW5mbykgJiZcbiAgICAgICAgICAgIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBleHBlcmltZW50YWwgZmVhdHVyZSBhdG1cbiAgICAgICAgICAgIGRvY3VtZW50LnN0YXJ0Vmlld1RyYW5zaXRpb24pIHtcbiAgICAgIGNvbnN0IHNldHRsZVByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihfcmVzb2x2ZSwgX3JlamVjdCkge1xuICAgICAgICBzZXR0bGVSZXNvbHZlID0gX3Jlc29sdmVcbiAgICAgICAgc2V0dGxlUmVqZWN0ID0gX3JlamVjdFxuICAgICAgfSlcbiAgICAgIC8vIHdyYXAgdGhlIG9yaWdpbmFsIGRvU3dhcCgpIGluIGEgY2FsbCB0byBzdGFydFZpZXdUcmFuc2l0aW9uKClcbiAgICAgIGNvbnN0IGlubmVyRG9Td2FwID0gZG9Td2FwXG4gICAgICBkb1N3YXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBleHBlcmltZW50YWwgZmVhdHVyZSBhdG1cbiAgICAgICAgZG9jdW1lbnQuc3RhcnRWaWV3VHJhbnNpdGlvbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBpbm5lckRvU3dhcCgpXG4gICAgICAgICAgcmV0dXJuIHNldHRsZVByb21pc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaWYgKHN3YXBTcGVjPy5zd2FwRGVsYXkgJiYgc3dhcFNwZWMuc3dhcERlbGF5ID4gMCkge1xuICAgICAgICBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGRvU3dhcCwgc3dhcFNwZWMuc3dhcERlbGF5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9Td2FwKClcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnN3YXBFcnJvcicsIHN3YXBPcHRpb25zLmV2ZW50SW5mbylcbiAgICAgIG1heWJlQ2FsbChzZXR0bGVSZWplY3QpXG4gICAgICB0aHJvdyBlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyXG4gICAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IGVsdFxuICAgKi9cbiAgZnVuY3Rpb24gaGFuZGxlVHJpZ2dlckhlYWRlcih4aHIsIGhlYWRlciwgZWx0KSB7XG4gICAgY29uc3QgdHJpZ2dlckJvZHkgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoaGVhZGVyKVxuICAgIGlmICh0cmlnZ2VyQm9keS5pbmRleE9mKCd7JykgPT09IDApIHtcbiAgICAgIGNvbnN0IHRyaWdnZXJzID0gcGFyc2VKU09OKHRyaWdnZXJCb2R5KVxuICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gdHJpZ2dlcnMpIHtcbiAgICAgICAgaWYgKHRyaWdnZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICBsZXQgZGV0YWlsID0gdHJpZ2dlcnNbZXZlbnROYW1lXVxuICAgICAgICAgIGlmIChpc1Jhd09iamVjdChkZXRhaWwpKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBlbHQgPSBkZXRhaWwudGFyZ2V0ICE9PSB1bmRlZmluZWQgPyBkZXRhaWwudGFyZ2V0IDogZWx0XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRldGFpbCA9IHsgdmFsdWU6IGRldGFpbCB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyaWdnZXJFdmVudChlbHQsIGV2ZW50TmFtZSwgZGV0YWlsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV2ZW50TmFtZXMgPSB0cmlnZ2VyQm9keS5zcGxpdCgnLCcpXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdHJpZ2dlckV2ZW50KGVsdCwgZXZlbnROYW1lc1tpXS50cmltKCksIFtdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IFdISVRFU1BBQ0UgPSAvXFxzL1xuICBjb25zdCBXSElURVNQQUNFX09SX0NPTU1BID0gL1tcXHMsXS9cbiAgY29uc3QgU1lNQk9MX1NUQVJUID0gL1tfJGEtekEtWl0vXG4gIGNvbnN0IFNZTUJPTF9DT05UID0gL1tfJGEtekEtWjAtOV0vXG4gIGNvbnN0IFNUUklOR0lTSF9TVEFSVCA9IFsnXCInLCBcIidcIiwgJy8nXVxuICBjb25zdCBOT1RfV0hJVEVTUEFDRSA9IC9bXlxcc10vXG4gIGNvbnN0IENPTUJJTkVEX1NFTEVDVE9SX1NUQVJUID0gL1t7KF0vXG4gIGNvbnN0IENPTUJJTkVEX1NFTEVDVE9SX0VORCA9IC9bfSldL1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICovXG4gIGZ1bmN0aW9uIHRva2VuaXplU3RyaW5nKHN0cikge1xuICAgIC8qKiBAdHlwZSBzdHJpbmdbXSAqL1xuICAgIGNvbnN0IHRva2VucyA9IFtdXG4gICAgbGV0IHBvc2l0aW9uID0gMFxuICAgIHdoaWxlIChwb3NpdGlvbiA8IHN0ci5sZW5ndGgpIHtcbiAgICAgIGlmIChTWU1CT0xfU1RBUlQuZXhlYyhzdHIuY2hhckF0KHBvc2l0aW9uKSkpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zaXRpb24gPSBwb3NpdGlvblxuICAgICAgICB3aGlsZSAoU1lNQk9MX0NPTlQuZXhlYyhzdHIuY2hhckF0KHBvc2l0aW9uICsgMSkpKSB7XG4gICAgICAgICAgcG9zaXRpb24rK1xuICAgICAgICB9XG4gICAgICAgIHRva2Vucy5wdXNoKHN0ci5zdWJzdHJpbmcoc3RhcnRQb3NpdGlvbiwgcG9zaXRpb24gKyAxKSlcbiAgICAgIH0gZWxzZSBpZiAoU1RSSU5HSVNIX1NUQVJULmluZGV4T2Yoc3RyLmNoYXJBdChwb3NpdGlvbikpICE9PSAtMSkge1xuICAgICAgICBjb25zdCBzdGFydENoYXIgPSBzdHIuY2hhckF0KHBvc2l0aW9uKVxuICAgICAgICB2YXIgc3RhcnRQb3NpdGlvbiA9IHBvc2l0aW9uXG4gICAgICAgIHBvc2l0aW9uKytcbiAgICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgc3RyLmxlbmd0aCAmJiBzdHIuY2hhckF0KHBvc2l0aW9uKSAhPT0gc3RhcnRDaGFyKSB7XG4gICAgICAgICAgaWYgKHN0ci5jaGFyQXQocG9zaXRpb24pID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uKytcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zaXRpb24rK1xuICAgICAgICB9XG4gICAgICAgIHRva2Vucy5wdXNoKHN0ci5zdWJzdHJpbmcoc3RhcnRQb3NpdGlvbiwgcG9zaXRpb24gKyAxKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN5bWJvbCA9IHN0ci5jaGFyQXQocG9zaXRpb24pXG4gICAgICAgIHRva2Vucy5wdXNoKHN5bWJvbClcbiAgICAgIH1cbiAgICAgIHBvc2l0aW9uKytcbiAgICB9XG4gICAgcmV0dXJuIHRva2Vuc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblxuICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBsYXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbU5hbWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpc1Bvc3NpYmxlUmVsYXRpdmVSZWZlcmVuY2UodG9rZW4sIGxhc3QsIHBhcmFtTmFtZSkge1xuICAgIHJldHVybiBTWU1CT0xfU1RBUlQuZXhlYyh0b2tlbi5jaGFyQXQoMCkpICYmXG4gICAgICB0b2tlbiAhPT0gJ3RydWUnICYmXG4gICAgICB0b2tlbiAhPT0gJ2ZhbHNlJyAmJlxuICAgICAgdG9rZW4gIT09ICd0aGlzJyAmJlxuICAgICAgdG9rZW4gIT09IHBhcmFtTmFtZSAmJlxuICAgICAgbGFzdCAhPT0gJy4nXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldHxzdHJpbmd9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0b2tlbnNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtTmFtZVxuICAgKiBAcmV0dXJucyB7Q29uZGl0aW9uYWxGdW5jdGlvbnxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gbWF5YmVHZW5lcmF0ZUNvbmRpdGlvbmFsKGVsdCwgdG9rZW5zLCBwYXJhbU5hbWUpIHtcbiAgICBpZiAodG9rZW5zWzBdID09PSAnWycpIHtcbiAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICBsZXQgYnJhY2tldENvdW50ID0gMVxuICAgICAgbGV0IGNvbmRpdGlvbmFsU291cmNlID0gJyByZXR1cm4gKGZ1bmN0aW9uKCcgKyBwYXJhbU5hbWUgKyAnKXsgcmV0dXJuICgnXG4gICAgICBsZXQgbGFzdCA9IG51bGxcbiAgICAgIHdoaWxlICh0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1swXVxuICAgICAgICAvLyBAdHMtaWdub3JlIEZvciBzb21lIHJlYXNvbiB0c2MgZG9lc24ndCB1bmRlcnN0YW5kIHRoZSBzaGlmdCBjYWxsLCBhbmQgdGhpbmtzIHdlJ3JlIGNvbXBhcmluZyB0aGUgc2FtZSB2YWx1ZSBoZXJlLCBpLmUuICdbJyB2cyAnXSdcbiAgICAgICAgaWYgKHRva2VuID09PSAnXScpIHtcbiAgICAgICAgICBicmFja2V0Q291bnQtLVxuICAgICAgICAgIGlmIChicmFja2V0Q291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChsYXN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbmRpdGlvbmFsU291cmNlID0gY29uZGl0aW9uYWxTb3VyY2UgKyAndHJ1ZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBjb25kaXRpb25hbFNvdXJjZSArPSAnKX0pJ1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgY29uZGl0aW9uRnVuY3Rpb24gPSBtYXliZUV2YWwoZWx0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRnVuY3Rpb24oY29uZGl0aW9uYWxTb3VyY2UpKClcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlIH0pXG4gICAgICAgICAgICAgIGNvbmRpdGlvbkZ1bmN0aW9uLnNvdXJjZSA9IGNvbmRpdGlvbmFsU291cmNlXG4gICAgICAgICAgICAgIHJldHVybiBjb25kaXRpb25GdW5jdGlvblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICB0cmlnZ2VyRXJyb3JFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14OnN5bnRheDplcnJvcicsIHsgZXJyb3I6IGUsIHNvdXJjZTogY29uZGl0aW9uYWxTb3VyY2UgfSlcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09ICdbJykge1xuICAgICAgICAgIGJyYWNrZXRDb3VudCsrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUG9zc2libGVSZWxhdGl2ZVJlZmVyZW5jZSh0b2tlbiwgbGFzdCwgcGFyYW1OYW1lKSkge1xuICAgICAgICAgIGNvbmRpdGlvbmFsU291cmNlICs9ICcoKCcgKyBwYXJhbU5hbWUgKyAnLicgKyB0b2tlbiArICcpID8gKCcgKyBwYXJhbU5hbWUgKyAnLicgKyB0b2tlbiArICcpIDogKHdpbmRvdy4nICsgdG9rZW4gKyAnKSknXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uZGl0aW9uYWxTb3VyY2UgPSBjb25kaXRpb25hbFNvdXJjZSArIHRva2VuXG4gICAgICAgIH1cbiAgICAgICAgbGFzdCA9IHRva2Vucy5zaGlmdCgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHRva2Vuc1xuICAgKiBAcGFyYW0ge1JlZ0V4cH0gbWF0Y2hcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIGNvbnN1bWVVbnRpbCh0b2tlbnMsIG1hdGNoKSB7XG4gICAgbGV0IHJlc3VsdCA9ICcnXG4gICAgd2hpbGUgKHRva2Vucy5sZW5ndGggPiAwICYmICFtYXRjaC50ZXN0KHRva2Vuc1swXSkpIHtcbiAgICAgIHJlc3VsdCArPSB0b2tlbnMuc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gdG9rZW5zXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBjb25zdW1lQ1NTU2VsZWN0b3IodG9rZW5zKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIGlmICh0b2tlbnMubGVuZ3RoID4gMCAmJiBDT01CSU5FRF9TRUxFQ1RPUl9TVEFSVC50ZXN0KHRva2Vuc1swXSkpIHtcbiAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICByZXN1bHQgPSBjb25zdW1lVW50aWwodG9rZW5zLCBDT01CSU5FRF9TRUxFQ1RPUl9FTkQpLnRyaW0oKVxuICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gY29uc3VtZVVudGlsKHRva2VucywgV0hJVEVTUEFDRV9PUl9DT01NQSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgY29uc3QgSU5QVVRfU0VMRUNUT1IgPSAnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBleHBsaWNpdFRyaWdnZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGNhY2hlIGZvciB0cmlnZ2VyIHNwZWNzXG4gICAqIEByZXR1cm5zIHtIdG14VHJpZ2dlclNwZWNpZmljYXRpb25bXX1cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlQW5kQ2FjaGVUcmlnZ2VyKGVsdCwgZXhwbGljaXRUcmlnZ2VyLCBjYWNoZSkge1xuICAgIC8qKiBAdHlwZSBIdG14VHJpZ2dlclNwZWNpZmljYXRpb25bXSAqL1xuICAgIGNvbnN0IHRyaWdnZXJTcGVjcyA9IFtdXG4gICAgY29uc3QgdG9rZW5zID0gdG9rZW5pemVTdHJpbmcoZXhwbGljaXRUcmlnZ2VyKVxuICAgIGRvIHtcbiAgICAgIGNvbnN1bWVVbnRpbCh0b2tlbnMsIE5PVF9XSElURVNQQUNFKVxuICAgICAgY29uc3QgaW5pdGlhbExlbmd0aCA9IHRva2Vucy5sZW5ndGhcbiAgICAgIGNvbnN0IHRyaWdnZXIgPSBjb25zdW1lVW50aWwodG9rZW5zLCAvWyxcXFtcXHNdLylcbiAgICAgIGlmICh0cmlnZ2VyICE9PSAnJykge1xuICAgICAgICBpZiAodHJpZ2dlciA9PT0gJ2V2ZXJ5Jykge1xuICAgICAgICAgIC8qKiBAdHlwZSBIdG14VHJpZ2dlclNwZWNpZmljYXRpb24gKi9cbiAgICAgICAgICBjb25zdCBldmVyeSA9IHsgdHJpZ2dlcjogJ2V2ZXJ5JyB9XG4gICAgICAgICAgY29uc3VtZVVudGlsKHRva2VucywgTk9UX1dISVRFU1BBQ0UpXG4gICAgICAgICAgZXZlcnkucG9sbEludGVydmFsID0gcGFyc2VJbnRlcnZhbChjb25zdW1lVW50aWwodG9rZW5zLCAvWyxcXFtcXHNdLykpXG4gICAgICAgICAgY29uc3VtZVVudGlsKHRva2VucywgTk9UX1dISVRFU1BBQ0UpXG4gICAgICAgICAgdmFyIGV2ZW50RmlsdGVyID0gbWF5YmVHZW5lcmF0ZUNvbmRpdGlvbmFsKGVsdCwgdG9rZW5zLCAnZXZlbnQnKVxuICAgICAgICAgIGlmIChldmVudEZpbHRlcikge1xuICAgICAgICAgICAgZXZlcnkuZXZlbnRGaWx0ZXIgPSBldmVudEZpbHRlclxuICAgICAgICAgIH1cbiAgICAgICAgICB0cmlnZ2VyU3BlY3MucHVzaChldmVyeSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvKiogQHR5cGUgSHRteFRyaWdnZXJTcGVjaWZpY2F0aW9uICovXG4gICAgICAgICAgY29uc3QgdHJpZ2dlclNwZWMgPSB7IHRyaWdnZXIgfVxuICAgICAgICAgIHZhciBldmVudEZpbHRlciA9IG1heWJlR2VuZXJhdGVDb25kaXRpb25hbChlbHQsIHRva2VucywgJ2V2ZW50JylcbiAgICAgICAgICBpZiAoZXZlbnRGaWx0ZXIpIHtcbiAgICAgICAgICAgIHRyaWdnZXJTcGVjLmV2ZW50RmlsdGVyID0gZXZlbnRGaWx0ZXJcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3VtZVVudGlsKHRva2VucywgTk9UX1dISVRFU1BBQ0UpXG4gICAgICAgICAgd2hpbGUgKHRva2Vucy5sZW5ndGggPiAwICYmIHRva2Vuc1swXSAhPT0gJywnKSB7XG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICBpZiAodG9rZW4gPT09ICdjaGFuZ2VkJykge1xuICAgICAgICAgICAgICB0cmlnZ2VyU3BlYy5jaGFuZ2VkID0gdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gJ29uY2UnKSB7XG4gICAgICAgICAgICAgIHRyaWdnZXJTcGVjLm9uY2UgPSB0cnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRva2VuID09PSAnY29uc3VtZScpIHtcbiAgICAgICAgICAgICAgdHJpZ2dlclNwZWMuY29uc3VtZSA9IHRydWVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09ICdkZWxheScgJiYgdG9rZW5zWzBdID09PSAnOicpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgdHJpZ2dlclNwZWMuZGVsYXkgPSBwYXJzZUludGVydmFsKGNvbnN1bWVVbnRpbCh0b2tlbnMsIFdISVRFU1BBQ0VfT1JfQ09NTUEpKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gJ2Zyb20nICYmIHRva2Vuc1swXSA9PT0gJzonKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgIGlmIChDT01CSU5FRF9TRUxFQ1RPUl9TVEFSVC50ZXN0KHRva2Vuc1swXSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJvbV9hcmcgPSBjb25zdW1lQ1NTU2VsZWN0b3IodG9rZW5zKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBmcm9tX2FyZyA9IGNvbnN1bWVVbnRpbCh0b2tlbnMsIFdISVRFU1BBQ0VfT1JfQ09NTUEpXG4gICAgICAgICAgICAgICAgaWYgKGZyb21fYXJnID09PSAnY2xvc2VzdCcgfHwgZnJvbV9hcmcgPT09ICdmaW5kJyB8fCBmcm9tX2FyZyA9PT0gJ25leHQnIHx8IGZyb21fYXJnID09PSAncHJldmlvdXMnKSB7XG4gICAgICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0b3IgPSBjb25zdW1lQ1NTU2VsZWN0b3IodG9rZW5zKVxuICAgICAgICAgICAgICAgICAgLy8gYG5leHRgIGFuZCBgcHJldmlvdXNgIGFsbG93IGEgc2VsZWN0b3ItbGVzcyBzeW50YXhcbiAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21fYXJnICs9ICcgJyArIHNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRyaWdnZXJTcGVjLmZyb20gPSBmcm9tX2FyZ1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gJ3RhcmdldCcgJiYgdG9rZW5zWzBdID09PSAnOicpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgdHJpZ2dlclNwZWMudGFyZ2V0ID0gY29uc3VtZUNTU1NlbGVjdG9yKHRva2VucylcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09ICd0aHJvdHRsZScgJiYgdG9rZW5zWzBdID09PSAnOicpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgdHJpZ2dlclNwZWMudGhyb3R0bGUgPSBwYXJzZUludGVydmFsKGNvbnN1bWVVbnRpbCh0b2tlbnMsIFdISVRFU1BBQ0VfT1JfQ09NTUEpKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlbiA9PT0gJ3F1ZXVlJyAmJiB0b2tlbnNbMF0gPT09ICc6Jykge1xuICAgICAgICAgICAgICB0b2tlbnMuc2hpZnQoKVxuICAgICAgICAgICAgICB0cmlnZ2VyU3BlYy5xdWV1ZSA9IGNvbnN1bWVVbnRpbCh0b2tlbnMsIFdISVRFU1BBQ0VfT1JfQ09NTUEpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRva2VuID09PSAncm9vdCcgJiYgdG9rZW5zWzBdID09PSAnOicpIHtcbiAgICAgICAgICAgICAgdG9rZW5zLnNoaWZ0KClcbiAgICAgICAgICAgICAgdHJpZ2dlclNwZWNbdG9rZW5dID0gY29uc3VtZUNTU1NlbGVjdG9yKHRva2VucylcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9rZW4gPT09ICd0aHJlc2hvbGQnICYmIHRva2Vuc1swXSA9PT0gJzonKSB7XG4gICAgICAgICAgICAgIHRva2Vucy5zaGlmdCgpXG4gICAgICAgICAgICAgIHRyaWdnZXJTcGVjW3Rva2VuXSA9IGNvbnN1bWVVbnRpbCh0b2tlbnMsIFdISVRFU1BBQ0VfT1JfQ09NTUEpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnN5bnRheDplcnJvcicsIHsgdG9rZW46IHRva2Vucy5zaGlmdCgpIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdW1lVW50aWwodG9rZW5zLCBOT1RfV0hJVEVTUEFDRSlcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJpZ2dlclNwZWNzLnB1c2godHJpZ2dlclNwZWMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbnMubGVuZ3RoID09PSBpbml0aWFsTGVuZ3RoKSB7XG4gICAgICAgIHRyaWdnZXJFcnJvckV2ZW50KGVsdCwgJ2h0bXg6c3ludGF4OmVycm9yJywgeyB0b2tlbjogdG9rZW5zLnNoaWZ0KCkgfSlcbiAgICAgIH1cbiAgICAgIGNvbnN1bWVVbnRpbCh0b2tlbnMsIE5PVF9XSElURVNQQUNFKVxuICAgIH0gd2hpbGUgKHRva2Vuc1swXSA9PT0gJywnICYmIHRva2Vucy5zaGlmdCgpKVxuICAgIGlmIChjYWNoZSkge1xuICAgICAgY2FjaGVbZXhwbGljaXRUcmlnZ2VyXSA9IHRyaWdnZXJTcGVjc1xuICAgIH1cbiAgICByZXR1cm4gdHJpZ2dlclNwZWNzXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHJldHVybnMge0h0bXhUcmlnZ2VyU3BlY2lmaWNhdGlvbltdfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0VHJpZ2dlclNwZWNzKGVsdCkge1xuICAgIGNvbnN0IGV4cGxpY2l0VHJpZ2dlciA9IGdldEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LXRyaWdnZXInKVxuICAgIGxldCB0cmlnZ2VyU3BlY3MgPSBbXVxuICAgIGlmIChleHBsaWNpdFRyaWdnZXIpIHtcbiAgICAgIGNvbnN0IGNhY2hlID0gaHRteC5jb25maWcudHJpZ2dlclNwZWNzQ2FjaGVcbiAgICAgIHRyaWdnZXJTcGVjcyA9IChjYWNoZSAmJiBjYWNoZVtleHBsaWNpdFRyaWdnZXJdKSB8fCBwYXJzZUFuZENhY2hlVHJpZ2dlcihlbHQsIGV4cGxpY2l0VHJpZ2dlciwgY2FjaGUpXG4gICAgfVxuXG4gICAgaWYgKHRyaWdnZXJTcGVjcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdHJpZ2dlclNwZWNzXG4gICAgfSBlbHNlIGlmIChtYXRjaGVzKGVsdCwgJ2Zvcm0nKSkge1xuICAgICAgcmV0dXJuIFt7IHRyaWdnZXI6ICdzdWJtaXQnIH1dXG4gICAgfSBlbHNlIGlmIChtYXRjaGVzKGVsdCwgJ2lucHV0W3R5cGU9XCJidXR0b25cIl0sIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nKSkge1xuICAgICAgcmV0dXJuIFt7IHRyaWdnZXI6ICdjbGljaycgfV1cbiAgICB9IGVsc2UgaWYgKG1hdGNoZXMoZWx0LCBJTlBVVF9TRUxFQ1RPUikpIHtcbiAgICAgIHJldHVybiBbeyB0cmlnZ2VyOiAnY2hhbmdlJyB9XVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3sgdHJpZ2dlcjogJ2NsaWNrJyB9XVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKi9cbiAgZnVuY3Rpb24gY2FuY2VsUG9sbGluZyhlbHQpIHtcbiAgICBnZXRJbnRlcm5hbERhdGEoZWx0KS5jYW5jZWxsZWQgPSB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtUcmlnZ2VySGFuZGxlcn0gaGFuZGxlclxuICAgKiBAcGFyYW0ge0h0bXhUcmlnZ2VyU3BlY2lmaWNhdGlvbn0gc3BlY1xuICAgKi9cbiAgZnVuY3Rpb24gcHJvY2Vzc1BvbGxpbmcoZWx0LCBoYW5kbGVyLCBzcGVjKSB7XG4gICAgY29uc3Qgbm9kZURhdGEgPSBnZXRJbnRlcm5hbERhdGEoZWx0KVxuICAgIG5vZGVEYXRhLnRpbWVvdXQgPSBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGJvZHlDb250YWlucyhlbHQpICYmIG5vZGVEYXRhLmNhbmNlbGxlZCAhPT0gdHJ1ZSkge1xuICAgICAgICBpZiAoIW1heWJlRmlsdGVyRXZlbnQoc3BlYywgZWx0LCBtYWtlRXZlbnQoJ2h4OnBvbGw6dHJpZ2dlcicsIHtcbiAgICAgICAgICB0cmlnZ2VyU3BlYzogc3BlYyxcbiAgICAgICAgICB0YXJnZXQ6IGVsdFxuICAgICAgICB9KSkpIHtcbiAgICAgICAgICBoYW5kbGVyKGVsdClcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzUG9sbGluZyhlbHQsIGhhbmRsZXIsIHNwZWMpXG4gICAgICB9XG4gICAgfSwgc3BlYy5wb2xsSW50ZXJ2YWwpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtIVE1MQW5jaG9yRWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNMb2NhbExpbmsoZWx0KSB7XG4gICAgcmV0dXJuIGxvY2F0aW9uLmhvc3RuYW1lID09PSBlbHQuaG9zdG5hbWUgJiZcbiAgICAgIGdldFJhd0F0dHJpYnV0ZShlbHQsICdocmVmJykgJiZcbiAgICAgIGdldFJhd0F0dHJpYnV0ZShlbHQsICdocmVmJykuaW5kZXhPZignIycpICE9PSAwXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICovXG4gIGZ1bmN0aW9uIGVsdElzRGlzYWJsZWQoZWx0KSB7XG4gICAgcmV0dXJuIGNsb3Nlc3QoZWx0LCBodG14LmNvbmZpZy5kaXNhYmxlU2VsZWN0b3IpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtIdG14Tm9kZUludGVybmFsRGF0YX0gbm9kZURhdGFcbiAgICogQHBhcmFtIHtIdG14VHJpZ2dlclNwZWNpZmljYXRpb25bXX0gdHJpZ2dlclNwZWNzXG4gICAqL1xuICBmdW5jdGlvbiBib29zdEVsZW1lbnQoZWx0LCBub2RlRGF0YSwgdHJpZ2dlclNwZWNzKSB7XG4gICAgaWYgKChlbHQgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCAmJiBpc0xvY2FsTGluayhlbHQpICYmIChlbHQudGFyZ2V0ID09PSAnJyB8fCBlbHQudGFyZ2V0ID09PSAnX3NlbGYnKSkgfHwgKGVsdC50YWdOYW1lID09PSAnRk9STScgJiYgU3RyaW5nKGdldFJhd0F0dHJpYnV0ZShlbHQsICdtZXRob2QnKSkudG9Mb3dlckNhc2UoKSAhPT0gJ2RpYWxvZycpKSB7XG4gICAgICBub2RlRGF0YS5ib29zdGVkID0gdHJ1ZVxuICAgICAgbGV0IHZlcmIsIHBhdGhcbiAgICAgIGlmIChlbHQudGFnTmFtZSA9PT0gJ0EnKSB7XG4gICAgICAgIHZlcmIgPSAoLyoqIEB0eXBlIEh0dHBWZXJiICovKCdnZXQnKSlcbiAgICAgICAgcGF0aCA9IGdldFJhd0F0dHJpYnV0ZShlbHQsICdocmVmJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJhd0F0dHJpYnV0ZSA9IGdldFJhd0F0dHJpYnV0ZShlbHQsICdtZXRob2QnKVxuICAgICAgICB2ZXJiID0gKC8qKiBAdHlwZSBIdHRwVmVyYiAqLyhyYXdBdHRyaWJ1dGUgPyByYXdBdHRyaWJ1dGUudG9Mb3dlckNhc2UoKSA6ICdnZXQnKSlcbiAgICAgICAgcGF0aCA9IGdldFJhd0F0dHJpYnV0ZShlbHQsICdhY3Rpb24nKVxuICAgICAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT09ICcnKSB7XG4gICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gYWN0aW9uIGF0dHJpYnV0ZSBvbiB0aGUgZm9ybSBzZXQgcGF0aCB0byBjdXJyZW50IGhyZWYgYmVmb3JlIHRoZVxuICAgICAgICAgIC8vIGZvbGxvd2luZyBsb2dpYyB0byBwcm9wZXJseSBjbGVhciBwYXJhbWV0ZXJzIG9uIGEgR0VUIChub3Qgb24gYSBQT1NUISlcbiAgICAgICAgICBwYXRoID0gbG9jYXRpb24uaHJlZlxuICAgICAgICB9XG4gICAgICAgIGlmICh2ZXJiID09PSAnZ2V0JyAmJiBwYXRoLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXD9bXiNdKy8sICcnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cmlnZ2VyU3BlY3MuZm9yRWFjaChmdW5jdGlvbih0cmlnZ2VyU3BlYykge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVyKGVsdCwgZnVuY3Rpb24obm9kZSwgZXZ0KSB7XG4gICAgICAgICAgY29uc3QgZWx0ID0gYXNFbGVtZW50KG5vZGUpXG4gICAgICAgICAgaWYgKGVsdElzRGlzYWJsZWQoZWx0KSkge1xuICAgICAgICAgICAgY2xlYW5VcEVsZW1lbnQoZWx0KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICAgIGlzc3VlQWpheFJlcXVlc3QodmVyYiwgcGF0aCwgZWx0LCBldnQpXG4gICAgICAgIH0sIG5vZGVEYXRhLCB0cmlnZ2VyU3BlYywgdHJ1ZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIHNob3VsZENhbmNlbChldnQsIGVsdCkge1xuICAgIGlmIChldnQudHlwZSA9PT0gJ3N1Ym1pdCcgJiYgZWx0LnRhZ05hbWUgPT09ICdGT1JNJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKGV2dC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAvLyBmaW5kIGJ1dHRvbiB3cmFwcGluZyB0aGUgdHJpZ2dlciBlbGVtZW50XG4gICAgICBjb25zdCBidG4gPSAvKiogQHR5cGUge0hUTUxCdXR0b25FbGVtZW50fEhUTUxJbnB1dEVsZW1lbnR8bnVsbH0gKi8gKGVsdC5jbG9zZXN0KCdpbnB1dFt0eXBlPVwic3VibWl0XCJdLCBidXR0b24nKSlcbiAgICAgIC8vIERvIG5vdCBjYW5jZWwgb24gYnV0dG9ucyB0aGF0IDEpIGRvbid0IGhhdmUgYSByZWxhdGVkIGZvcm0gb3IgMikgaGF2ZSBhIHR5cGUgYXR0cmlidXRlIG9mICdyZXNldCcvJ2J1dHRvbicuXG4gICAgICBpZiAoYnRuICYmIGJ0bi5mb3JtICYmIGJ0bi50eXBlID09PSAnc3VibWl0Jykge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuXG4gICAgICAvLyBmaW5kIGxpbmsgd3JhcHBpbmcgdGhlIHRyaWdnZXIgZWxlbWVudFxuICAgICAgY29uc3QgbGluayA9IGVsdC5jbG9zZXN0KCdhJylcbiAgICAgIC8vIEFsbG93IGxpbmtzIHdpdGggaHJlZj1cIiNmcmFnbWVudFwiIChhbmNob3JzIHdpdGggY29udGVudCBhZnRlciAjKSB0byBwZXJmb3JtIG5vcm1hbCBmcmFnbWVudCBuYXZpZ2F0aW9uLlxuICAgICAgLy8gQ2FuY2VsIGRlZmF1bHQgYWN0aW9uIGZvciBsaW5rcyB3aXRoIGhyZWY9XCIjXCIgKGJhcmUgaGFzaCkgdG8gcHJldmVudCBzY3JvbGxpbmcgdG8gdG9wIGFuZCB1bndhbnRlZCBVUkwgY2hhbmdlcy5cbiAgICAgIGNvbnN0IHNhbWVQYWdlQW5jaG9yID0gL14jLisvXG4gICAgICBpZiAobGluayAmJiBsaW5rLmhyZWYgJiYgIXNhbWVQYWdlQW5jaG9yLnRlc3QobGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBlbHRcbiAgICogQHBhcmFtIHtFdmVudHxNb3VzZUV2ZW50fEtleWJvYXJkRXZlbnR8VG91Y2hFdmVudH0gZXZ0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaWdub3JlQm9vc3RlZEFuY2hvckN0cmxDbGljayhlbHQsIGV2dCkge1xuICAgIHJldHVybiBnZXRJbnRlcm5hbERhdGEoZWx0KS5ib29zdGVkICYmIGVsdCBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50ICYmIGV2dC50eXBlID09PSAnY2xpY2snICYmXG4gICAgICAvLyBAdHMtaWdub3JlIHRoaXMgd2lsbCByZXNvbHZlIHRvIHVuZGVmaW5lZCBmb3IgZXZlbnRzIHRoYXQgZG9uJ3QgZGVmaW5lIHRob3NlIHByb3BlcnRpZXMsIHdoaWNoIGlzIGZpbmVcbiAgICAgIChldnQuY3RybEtleSB8fCBldnQubWV0YUtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0h0bXhUcmlnZ2VyU3BlY2lmaWNhdGlvbn0gdHJpZ2dlclNwZWNcbiAgICogQHBhcmFtIHtOb2RlfSBlbHRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gbWF5YmVGaWx0ZXJFdmVudCh0cmlnZ2VyU3BlYywgZWx0LCBldnQpIHtcbiAgICBjb25zdCBldmVudEZpbHRlciA9IHRyaWdnZXJTcGVjLmV2ZW50RmlsdGVyXG4gICAgaWYgKGV2ZW50RmlsdGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gZXZlbnRGaWx0ZXIuY2FsbChlbHQsIGV2dCkgIT09IHRydWVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gZXZlbnRGaWx0ZXIuc291cmNlXG4gICAgICAgIHRyaWdnZXJFcnJvckV2ZW50KGdldERvY3VtZW50KCkuYm9keSwgJ2h0bXg6ZXZlbnRGaWx0ZXI6ZXJyb3InLCB7IGVycm9yOiBlLCBzb3VyY2UgfSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtUcmlnZ2VySGFuZGxlcn0gaGFuZGxlclxuICAgKiBAcGFyYW0ge0h0bXhOb2RlSW50ZXJuYWxEYXRhfSBub2RlRGF0YVxuICAgKiBAcGFyYW0ge0h0bXhUcmlnZ2VyU3BlY2lmaWNhdGlvbn0gdHJpZ2dlclNwZWNcbiAgICogQHBhcmFtIHtib29sZWFufSBbZXhwbGljaXRDYW5jZWxdXG4gICAqL1xuICBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGVsdCwgaGFuZGxlciwgbm9kZURhdGEsIHRyaWdnZXJTcGVjLCBleHBsaWNpdENhbmNlbCkge1xuICAgIGNvbnN0IGVsZW1lbnREYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICAvKiogQHR5cGUgeyhOb2RlfFdpbmRvdylbXX0gKi9cbiAgICBsZXQgZWx0c1RvTGlzdGVuT25cbiAgICBpZiAodHJpZ2dlclNwZWMuZnJvbSkge1xuICAgICAgZWx0c1RvTGlzdGVuT24gPSBxdWVyeVNlbGVjdG9yQWxsRXh0KGVsdCwgdHJpZ2dlclNwZWMuZnJvbSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWx0c1RvTGlzdGVuT24gPSBbZWx0XVxuICAgIH1cbiAgICAvLyBzdG9yZSB0aGUgaW5pdGlhbCB2YWx1ZXMgb2YgdGhlIGVsZW1lbnRzLCBzbyB3ZSBjYW4gdGVsbCBpZiB0aGV5IGNoYW5nZVxuICAgIGlmICh0cmlnZ2VyU3BlYy5jaGFuZ2VkKSB7XG4gICAgICBpZiAoISgnbGFzdFZhbHVlJyBpbiBlbGVtZW50RGF0YSkpIHtcbiAgICAgICAgZWxlbWVudERhdGEubGFzdFZhbHVlID0gbmV3IFdlYWtNYXAoKVxuICAgICAgfVxuICAgICAgZWx0c1RvTGlzdGVuT24uZm9yRWFjaChmdW5jdGlvbihlbHRUb0xpc3Rlbk9uKSB7XG4gICAgICAgIGlmICghZWxlbWVudERhdGEubGFzdFZhbHVlLmhhcyh0cmlnZ2VyU3BlYykpIHtcbiAgICAgICAgICBlbGVtZW50RGF0YS5sYXN0VmFsdWUuc2V0KHRyaWdnZXJTcGVjLCBuZXcgV2Vha01hcCgpKVxuICAgICAgICB9XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgdmFsdWUgd2lsbCBiZSB1bmRlZmluZWQgZm9yIG5vbi1pbnB1dCBlbGVtZW50cywgd2hpY2ggaXMgZmluZVxuICAgICAgICBlbGVtZW50RGF0YS5sYXN0VmFsdWUuZ2V0KHRyaWdnZXJTcGVjKS5zZXQoZWx0VG9MaXN0ZW5PbiwgZWx0VG9MaXN0ZW5Pbi52YWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIGZvckVhY2goZWx0c1RvTGlzdGVuT24sIGZ1bmN0aW9uKGVsdFRvTGlzdGVuT24pIHtcbiAgICAgIC8qKiBAdHlwZSBFdmVudExpc3RlbmVyICovXG4gICAgICBjb25zdCBldmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgIGlmICghYm9keUNvbnRhaW5zKGVsdCkpIHtcbiAgICAgICAgICBlbHRUb0xpc3Rlbk9uLnJlbW92ZUV2ZW50TGlzdGVuZXIodHJpZ2dlclNwZWMudHJpZ2dlciwgZXZlbnRMaXN0ZW5lcilcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoaWdub3JlQm9vc3RlZEFuY2hvckN0cmxDbGljayhlbHQsIGV2dCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXhwbGljaXRDYW5jZWwgfHwgc2hvdWxkQ2FuY2VsKGV2dCwgZWx0VG9MaXN0ZW5PbikpIHtcbiAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYXliZUZpbHRlckV2ZW50KHRyaWdnZXJTcGVjLCBlbHQsIGV2dCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBldmVudERhdGEgPSBnZXRJbnRlcm5hbERhdGEoZXZ0KVxuICAgICAgICBldmVudERhdGEudHJpZ2dlclNwZWMgPSB0cmlnZ2VyU3BlY1xuICAgICAgICBpZiAoZXZlbnREYXRhLmhhbmRsZWRGb3IgPT0gbnVsbCkge1xuICAgICAgICAgIGV2ZW50RGF0YS5oYW5kbGVkRm9yID0gW11cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnREYXRhLmhhbmRsZWRGb3IuaW5kZXhPZihlbHQpIDwgMCkge1xuICAgICAgICAgIGV2ZW50RGF0YS5oYW5kbGVkRm9yLnB1c2goZWx0KVxuICAgICAgICAgIGlmICh0cmlnZ2VyU3BlYy5jb25zdW1lKSB7XG4gICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRyaWdnZXJTcGVjLnRhcmdldCAmJiBldnQudGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAoIW1hdGNoZXMoYXNFbGVtZW50KGV2dC50YXJnZXQpLCB0cmlnZ2VyU3BlYy50YXJnZXQpKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHJpZ2dlclNwZWMub25jZSkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnREYXRhLnRyaWdnZXJlZE9uY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbGVtZW50RGF0YS50cmlnZ2VyZWRPbmNlID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHJpZ2dlclNwZWMuY2hhbmdlZCkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGV2dC50YXJnZXRcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdmFsdWUgd2lsbCBiZSB1bmRlZmluZWQgZm9yIG5vbi1pbnB1dCBlbGVtZW50cywgd2hpY2ggaXMgZmluZVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBub2RlLnZhbHVlXG4gICAgICAgICAgICBjb25zdCBsYXN0VmFsdWUgPSBlbGVtZW50RGF0YS5sYXN0VmFsdWUuZ2V0KHRyaWdnZXJTcGVjKVxuICAgICAgICAgICAgaWYgKGxhc3RWYWx1ZS5oYXMobm9kZSkgJiYgbGFzdFZhbHVlLmdldChub2RlKSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0VmFsdWUuc2V0KG5vZGUsIHZhbHVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZWxlbWVudERhdGEuZGVsYXllZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGVsZW1lbnREYXRhLmRlbGF5ZWQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChlbGVtZW50RGF0YS50aHJvdHRsZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRyaWdnZXJTcGVjLnRocm90dGxlID4gMCkge1xuICAgICAgICAgICAgaWYgKCFlbGVtZW50RGF0YS50aHJvdHRsZSkge1xuICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDp0cmlnZ2VyJylcbiAgICAgICAgICAgICAgaGFuZGxlcihlbHQsIGV2dClcbiAgICAgICAgICAgICAgZWxlbWVudERhdGEudGhyb3R0bGUgPSBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnREYXRhLnRocm90dGxlID0gbnVsbFxuICAgICAgICAgICAgICB9LCB0cmlnZ2VyU3BlYy50aHJvdHRsZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRyaWdnZXJTcGVjLmRlbGF5ID4gMCkge1xuICAgICAgICAgICAgZWxlbWVudERhdGEuZGVsYXllZCA9IGdldFdpbmRvdygpLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OnRyaWdnZXInKVxuICAgICAgICAgICAgICBoYW5kbGVyKGVsdCwgZXZ0KVxuICAgICAgICAgICAgfSwgdHJpZ2dlclNwZWMuZGVsYXkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OnRyaWdnZXInKVxuICAgICAgICAgICAgaGFuZGxlcihlbHQsIGV2dClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChub2RlRGF0YS5saXN0ZW5lckluZm9zID09IG51bGwpIHtcbiAgICAgICAgbm9kZURhdGEubGlzdGVuZXJJbmZvcyA9IFtdXG4gICAgICB9XG4gICAgICBub2RlRGF0YS5saXN0ZW5lckluZm9zLnB1c2goe1xuICAgICAgICB0cmlnZ2VyOiB0cmlnZ2VyU3BlYy50cmlnZ2VyLFxuICAgICAgICBsaXN0ZW5lcjogZXZlbnRMaXN0ZW5lcixcbiAgICAgICAgb246IGVsdFRvTGlzdGVuT25cbiAgICAgIH0pXG4gICAgICBlbHRUb0xpc3Rlbk9uLmFkZEV2ZW50TGlzdGVuZXIodHJpZ2dlclNwZWMudHJpZ2dlciwgZXZlbnRMaXN0ZW5lcilcbiAgICB9KVxuICB9XG5cbiAgbGV0IHdpbmRvd0lzU2Nyb2xsaW5nID0gZmFsc2UgLy8gdXNlZCBieSBpbml0U2Nyb2xsSGFuZGxlclxuICBsZXQgc2Nyb2xsSGFuZGxlciA9IG51bGxcbiAgZnVuY3Rpb24gaW5pdFNjcm9sbEhhbmRsZXIoKSB7XG4gICAgaWYgKCFzY3JvbGxIYW5kbGVyKSB7XG4gICAgICBzY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvd0lzU2Nyb2xsaW5nID0gdHJ1ZVxuICAgICAgfVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjcm9sbEhhbmRsZXIpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2Nyb2xsSGFuZGxlcilcbiAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAod2luZG93SXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICB3aW5kb3dJc1Njcm9sbGluZyA9IGZhbHNlXG4gICAgICAgICAgZm9yRWFjaChnZXREb2N1bWVudCgpLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaHgtdHJpZ2dlcio9J3JldmVhbGVkJ10sW2RhdGEtaHgtdHJpZ2dlcio9J3JldmVhbGVkJ11cIiksIGZ1bmN0aW9uKGVsdCkge1xuICAgICAgICAgICAgbWF5YmVSZXZlYWwoZWx0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sIDIwMClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICovXG4gIGZ1bmN0aW9uIG1heWJlUmV2ZWFsKGVsdCkge1xuICAgIGlmICghaGFzQXR0cmlidXRlKGVsdCwgJ2RhdGEtaHgtcmV2ZWFsZWQnKSAmJiBpc1Njcm9sbGVkSW50b1ZpZXcoZWx0KSkge1xuICAgICAgZWx0LnNldEF0dHJpYnV0ZSgnZGF0YS1oeC1yZXZlYWxlZCcsICd0cnVlJylcbiAgICAgIGNvbnN0IG5vZGVEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICAgIGlmIChub2RlRGF0YS5pbml0SGFzaCkge1xuICAgICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAncmV2ZWFsZWQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgdGhlIG5vZGUgaXNuJ3QgaW5pdGlhbGl6ZWQsIHdhaXQgZm9yIGl0IGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSByZXF1ZXN0XG4gICAgICAgIGVsdC5hZGRFdmVudExpc3RlbmVyKCdodG14OmFmdGVyUHJvY2Vzc05vZGUnLCBmdW5jdGlvbigpIHsgdHJpZ2dlckV2ZW50KGVsdCwgJ3JldmVhbGVkJykgfSwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtUcmlnZ2VySGFuZGxlcn0gaGFuZGxlclxuICAgKiBAcGFyYW0ge0h0bXhOb2RlSW50ZXJuYWxEYXRhfSBub2RlRGF0YVxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVsYXlcbiAgICovXG4gIGZ1bmN0aW9uIGxvYWRJbW1lZGlhdGVseShlbHQsIGhhbmRsZXIsIG5vZGVEYXRhLCBkZWxheSkge1xuICAgIGNvbnN0IGxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghbm9kZURhdGEubG9hZGVkKSB7XG4gICAgICAgIG5vZGVEYXRhLmxvYWRlZCA9IHRydWVcbiAgICAgICAgdHJpZ2dlckV2ZW50KGVsdCwgJ2h0bXg6dHJpZ2dlcicpXG4gICAgICAgIGhhbmRsZXIoZWx0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgICBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGxvYWQsIGRlbGF5KVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkKClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtIdG14Tm9kZUludGVybmFsRGF0YX0gbm9kZURhdGFcbiAgICogQHBhcmFtIHtIdG14VHJpZ2dlclNwZWNpZmljYXRpb25bXX0gdHJpZ2dlclNwZWNzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gcHJvY2Vzc1ZlcmJzKGVsdCwgbm9kZURhdGEsIHRyaWdnZXJTcGVjcykge1xuICAgIGxldCBleHBsaWNpdEFjdGlvbiA9IGZhbHNlXG4gICAgZm9yRWFjaChWRVJCUywgZnVuY3Rpb24odmVyYikge1xuICAgICAgaWYgKGhhc0F0dHJpYnV0ZShlbHQsICdoeC0nICsgdmVyYikpIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGdldEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LScgKyB2ZXJiKVxuICAgICAgICBleHBsaWNpdEFjdGlvbiA9IHRydWVcbiAgICAgICAgbm9kZURhdGEucGF0aCA9IHBhdGhcbiAgICAgICAgbm9kZURhdGEudmVyYiA9IHZlcmJcbiAgICAgICAgdHJpZ2dlclNwZWNzLmZvckVhY2goZnVuY3Rpb24odHJpZ2dlclNwZWMpIHtcbiAgICAgICAgICBhZGRUcmlnZ2VySGFuZGxlcihlbHQsIHRyaWdnZXJTcGVjLCBub2RlRGF0YSwgZnVuY3Rpb24obm9kZSwgZXZ0KSB7XG4gICAgICAgICAgICBjb25zdCBlbHQgPSBhc0VsZW1lbnQobm9kZSlcbiAgICAgICAgICAgIGlmIChlbHRJc0Rpc2FibGVkKGVsdCkpIHtcbiAgICAgICAgICAgICAgY2xlYW5VcEVsZW1lbnQoZWx0KVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlzc3VlQWpheFJlcXVlc3QodmVyYiwgcGF0aCwgZWx0LCBldnQpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBleHBsaWNpdEFjdGlvblxuICB9XG5cbiAgLyoqXG4gICAqIEBjYWxsYmFjayBUcmlnZ2VySGFuZGxlclxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge0V2ZW50fSBbZXZ0XVxuICAgKi9cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtIdG14VHJpZ2dlclNwZWNpZmljYXRpb259IHRyaWdnZXJTcGVjXG4gICAqIEBwYXJhbSB7SHRteE5vZGVJbnRlcm5hbERhdGF9IG5vZGVEYXRhXG4gICAqIEBwYXJhbSB7VHJpZ2dlckhhbmRsZXJ9IGhhbmRsZXJcbiAgICovXG4gIGZ1bmN0aW9uIGFkZFRyaWdnZXJIYW5kbGVyKGVsdCwgdHJpZ2dlclNwZWMsIG5vZGVEYXRhLCBoYW5kbGVyKSB7XG4gICAgaWYgKHRyaWdnZXJTcGVjLnRyaWdnZXIgPT09ICdyZXZlYWxlZCcpIHtcbiAgICAgIGluaXRTY3JvbGxIYW5kbGVyKClcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoZWx0LCBoYW5kbGVyLCBub2RlRGF0YSwgdHJpZ2dlclNwZWMpXG4gICAgICBtYXliZVJldmVhbChhc0VsZW1lbnQoZWx0KSlcbiAgICB9IGVsc2UgaWYgKHRyaWdnZXJTcGVjLnRyaWdnZXIgPT09ICdpbnRlcnNlY3QnKSB7XG4gICAgICBjb25zdCBvYnNlcnZlck9wdGlvbnMgPSB7fVxuICAgICAgaWYgKHRyaWdnZXJTcGVjLnJvb3QpIHtcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zLnJvb3QgPSBxdWVyeVNlbGVjdG9yRXh0KGVsdCwgdHJpZ2dlclNwZWMucm9vdClcbiAgICAgIH1cbiAgICAgIGlmICh0cmlnZ2VyU3BlYy50aHJlc2hvbGQpIHtcbiAgICAgICAgb2JzZXJ2ZXJPcHRpb25zLnRocmVzaG9sZCA9IHBhcnNlRmxvYXQodHJpZ2dlclNwZWMudGhyZXNob2xkKVxuICAgICAgfVxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24oZW50cmllcykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IGVudHJpZXNbaV1cbiAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdpbnRlcnNlY3QnKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIG9ic2VydmVyT3B0aW9ucylcbiAgICAgIG9ic2VydmVyLm9ic2VydmUoYXNFbGVtZW50KGVsdCkpXG4gICAgICBhZGRFdmVudExpc3RlbmVyKGFzRWxlbWVudChlbHQpLCBoYW5kbGVyLCBub2RlRGF0YSwgdHJpZ2dlclNwZWMpXG4gICAgfSBlbHNlIGlmICghbm9kZURhdGEuZmlyc3RJbml0Q29tcGxldGVkICYmIHRyaWdnZXJTcGVjLnRyaWdnZXIgPT09ICdsb2FkJykge1xuICAgICAgaWYgKCFtYXliZUZpbHRlckV2ZW50KHRyaWdnZXJTcGVjLCBlbHQsIG1ha2VFdmVudCgnbG9hZCcsIHsgZWx0IH0pKSkge1xuICAgICAgICBsb2FkSW1tZWRpYXRlbHkoYXNFbGVtZW50KGVsdCksIGhhbmRsZXIsIG5vZGVEYXRhLCB0cmlnZ2VyU3BlYy5kZWxheSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRyaWdnZXJTcGVjLnBvbGxJbnRlcnZhbCA+IDApIHtcbiAgICAgIG5vZGVEYXRhLnBvbGxpbmcgPSB0cnVlXG4gICAgICBwcm9jZXNzUG9sbGluZyhhc0VsZW1lbnQoZWx0KSwgaGFuZGxlciwgdHJpZ2dlclNwZWMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoZWx0LCBoYW5kbGVyLCBub2RlRGF0YSwgdHJpZ2dlclNwZWMpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIHNob3VsZFByb2Nlc3NIeE9uKG5vZGUpIHtcbiAgICBjb25zdCBlbHQgPSBhc0VsZW1lbnQobm9kZSlcbiAgICBpZiAoIWVsdCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbHQuYXR0cmlidXRlc1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgYXR0cmlidXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgYXR0ck5hbWUgPSBhdHRyaWJ1dGVzW2pdLm5hbWVcbiAgICAgIGlmIChzdGFydHNXaXRoKGF0dHJOYW1lLCAnaHgtb246JykgfHwgc3RhcnRzV2l0aChhdHRyTmFtZSwgJ2RhdGEtaHgtb246JykgfHxcbiAgICAgICAgc3RhcnRzV2l0aChhdHRyTmFtZSwgJ2h4LW9uLScpIHx8IHN0YXJ0c1dpdGgoYXR0ck5hbWUsICdkYXRhLWh4LW9uLScpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gZWx0XG4gICAqIEByZXR1cm5zIHtFbGVtZW50W119XG4gICAqL1xuICBjb25zdCBIWF9PTl9RVUVSWSA9IG5ldyBYUGF0aEV2YWx1YXRvcigpXG4gICAgLmNyZWF0ZUV4cHJlc3Npb24oJy4vLypbQCpbIHN0YXJ0cy13aXRoKG5hbWUoKSwgXCJoeC1vbjpcIikgb3Igc3RhcnRzLXdpdGgobmFtZSgpLCBcImRhdGEtaHgtb246XCIpIG9yJyArXG4gICAgICAnIHN0YXJ0cy13aXRoKG5hbWUoKSwgXCJoeC1vbi1cIikgb3Igc3RhcnRzLXdpdGgobmFtZSgpLCBcImRhdGEtaHgtb24tXCIpIF1dJylcblxuICBmdW5jdGlvbiBwcm9jZXNzSFhPblJvb3QoZWx0LCBlbGVtZW50cykge1xuICAgIGlmIChzaG91bGRQcm9jZXNzSHhPbihlbHQpKSB7XG4gICAgICBlbGVtZW50cy5wdXNoKGFzRWxlbWVudChlbHQpKVxuICAgIH1cbiAgICBjb25zdCBpdGVyID0gSFhfT05fUVVFUlkuZXZhbHVhdGUoZWx0KVxuICAgIGxldCBub2RlID0gbnVsbFxuICAgIHdoaWxlIChub2RlID0gaXRlci5pdGVyYXRlTmV4dCgpKSBlbGVtZW50cy5wdXNoKGFzRWxlbWVudChub2RlKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRIeE9uV2lsZGNhcmRFbGVtZW50cyhlbHQpIHtcbiAgICAvKiogQHR5cGUge0VsZW1lbnRbXX0gKi9cbiAgICBjb25zdCBlbGVtZW50cyA9IFtdXG4gICAgaWYgKGVsdCBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWx0LmNoaWxkTm9kZXMpIHtcbiAgICAgICAgcHJvY2Vzc0hYT25Sb290KGNoaWxkLCBlbGVtZW50cylcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzc0hYT25Sb290KGVsdCwgZWxlbWVudHMpXG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50c1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtOb2RlTGlzdE9mPEVsZW1lbnQ+fFtdfVxuICAgKi9cbiAgZnVuY3Rpb24gZmluZEVsZW1lbnRzVG9Qcm9jZXNzKGVsdCkge1xuICAgIGlmIChlbHQucXVlcnlTZWxlY3RvckFsbCkge1xuICAgICAgY29uc3QgYm9vc3RlZFNlbGVjdG9yID0gJywgW2h4LWJvb3N0XSBhLCBbZGF0YS1oeC1ib29zdF0gYSwgYVtoeC1ib29zdF0sIGFbZGF0YS1oeC1ib29zdF0nXG5cbiAgICAgIGNvbnN0IGV4dGVuc2lvblNlbGVjdG9ycyA9IFtdXG4gICAgICBmb3IgKGNvbnN0IGUgaW4gZXh0ZW5zaW9ucykge1xuICAgICAgICBjb25zdCBleHRlbnNpb24gPSBleHRlbnNpb25zW2VdXG4gICAgICAgIGlmIChleHRlbnNpb24uZ2V0U2VsZWN0b3JzKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9ycyA9IGV4dGVuc2lvbi5nZXRTZWxlY3RvcnMoKVxuICAgICAgICAgIGlmIChzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIGV4dGVuc2lvblNlbGVjdG9ycy5wdXNoKHNlbGVjdG9ycylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0cyA9IGVsdC5xdWVyeVNlbGVjdG9yQWxsKFZFUkJfU0VMRUNUT1IgKyBib29zdGVkU2VsZWN0b3IgKyBcIiwgZm9ybSwgW3R5cGU9J3N1Ym1pdCddLFwiICtcbiAgICAgICAgJyBbaHgtZXh0XSwgW2RhdGEtaHgtZXh0XSwgW2h4LXRyaWdnZXJdLCBbZGF0YS1oeC10cmlnZ2VyXScgKyBleHRlbnNpb25TZWxlY3RvcnMuZmxhdCgpLm1hcChzID0+ICcsICcgKyBzKS5qb2luKCcnKSlcblxuICAgICAgcmV0dXJuIHJlc3VsdHNcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBzdWJtaXQgYnV0dG9ucy9pbnB1dHMgdGhhdCBoYXZlIHRoZSBmb3JtIGF0dHJpYnV0ZSBzZXRcbiAgICogc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0hUTUwvRWxlbWVudC9idXR0b25cbiAgICogQHBhcmFtIHtFdmVudH0gZXZ0XG4gICAqL1xuICBmdW5jdGlvbiBtYXliZVNldExhc3RCdXR0b25DbGlja2VkKGV2dCkge1xuICAgIGNvbnN0IGVsdCA9IGdldFRhcmdldEJ1dHRvbihldnQudGFyZ2V0KVxuICAgIGNvbnN0IGludGVybmFsRGF0YSA9IGdldFJlbGF0ZWRGb3JtRGF0YShldnQpXG4gICAgaWYgKGludGVybmFsRGF0YSkge1xuICAgICAgaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkID0gZWx0XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICAgKi9cbiAgZnVuY3Rpb24gbWF5YmVVbnNldExhc3RCdXR0b25DbGlja2VkKGV2dCkge1xuICAgIGNvbnN0IGludGVybmFsRGF0YSA9IGdldFJlbGF0ZWRGb3JtRGF0YShldnQpXG4gICAgaWYgKGludGVybmFsRGF0YSkge1xuICAgICAgaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcbiAgICogQHJldHVybnMge0hUTUxCdXR0b25FbGVtZW50fEhUTUxJbnB1dEVsZW1lbnR8bnVsbH1cbiAgICovXG4gIGZ1bmN0aW9uIGdldFRhcmdldEJ1dHRvbih0YXJnZXQpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtIVE1MQnV0dG9uRWxlbWVudHxIVE1MSW5wdXRFbGVtZW50fG51bGx9ICovIChjbG9zZXN0KGFzRWxlbWVudCh0YXJnZXQpLCBcImJ1dHRvbiwgaW5wdXRbdHlwZT0nc3VibWl0J11cIikpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHJldHVybnMge0hUTUxGb3JtRWxlbWVudHxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UmVsYXRlZEZvcm0oZWx0KSB7XG4gICAgLy8gQHRzLWlnbm9yZSBHZXQgdGhlIHJlbGF0ZWQgZm9ybSBpZiBhdmFpbGFibGUsIGVsc2UgZmluZCB0aGUgY2xvc2VzdCBwYXJlbnQgZm9ybVxuICAgIHJldHVybiBlbHQuZm9ybSB8fCBjbG9zZXN0KGVsdCwgJ2Zvcm0nKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2dFxuICAgKiBAcmV0dXJucyB7SHRteE5vZGVJbnRlcm5hbERhdGF8dW5kZWZpbmVkfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UmVsYXRlZEZvcm1EYXRhKGV2dCkge1xuICAgIGNvbnN0IGVsdCA9IGdldFRhcmdldEJ1dHRvbihldnQudGFyZ2V0KVxuICAgIGlmICghZWx0KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgZm9ybSA9IGdldFJlbGF0ZWRGb3JtKGVsdClcbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXR1cm4gZ2V0SW50ZXJuYWxEYXRhKGZvcm0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldH0gZWx0XG4gICAqL1xuICBmdW5jdGlvbiBpbml0QnV0dG9uVHJhY2tpbmcoZWx0KSB7XG4gICAgLy8gbmVlZCB0byBoYW5kbGUgYm90aCBjbGljayBhbmQgZm9jdXMgaW46XG4gICAgLy8gICBmb2N1c2luIC0gaW4gY2FzZSBzb21lb25lIHRhYnMgaW4gdG8gYSBidXR0b24gYW5kIGhpdHMgdGhlIHNwYWNlIGJhclxuICAgIC8vICAgY2xpY2sgLSBvbiBPU1ggYnV0dG9ucyBkbyBub3QgZm9jdXMgb24gY2xpY2sgc2VlIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMzcyNFxuICAgIGVsdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1heWJlU2V0TGFzdEJ1dHRvbkNsaWNrZWQpXG4gICAgZWx0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBtYXliZVNldExhc3RCdXR0b25DbGlja2VkKVxuICAgIGVsdC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIG1heWJlVW5zZXRMYXN0QnV0dG9uQ2xpY2tlZClcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlXG4gICAqL1xuICBmdW5jdGlvbiBhZGRIeE9uRXZlbnRIYW5kbGVyKGVsdCwgZXZlbnROYW1lLCBjb2RlKSB7XG4gICAgY29uc3Qgbm9kZURhdGEgPSBnZXRJbnRlcm5hbERhdGEoZWx0KVxuICAgIGlmICghQXJyYXkuaXNBcnJheShub2RlRGF0YS5vbkhhbmRsZXJzKSkge1xuICAgICAgbm9kZURhdGEub25IYW5kbGVycyA9IFtdXG4gICAgfVxuICAgIGxldCBmdW5jXG4gICAgLyoqIEB0eXBlIEV2ZW50TGlzdGVuZXIgKi9cbiAgICBjb25zdCBsaXN0ZW5lciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIG1heWJlRXZhbChlbHQsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZWx0SXNEaXNhYmxlZChlbHQpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmdW5jKSB7XG4gICAgICAgICAgZnVuYyA9IG5ldyBGdW5jdGlvbignZXZlbnQnLCBjb2RlKVxuICAgICAgICB9XG4gICAgICAgIGZ1bmMuY2FsbChlbHQsIGUpXG4gICAgICB9KVxuICAgIH1cbiAgICBlbHQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyKVxuICAgIG5vZGVEYXRhLm9uSGFuZGxlcnMucHVzaCh7IGV2ZW50OiBldmVudE5hbWUsIGxpc3RlbmVyIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICovXG4gIGZ1bmN0aW9uIHByb2Nlc3NIeE9uV2lsZGNhcmQoZWx0KSB7XG4gICAgLy8gd2lwZSBhbnkgcHJldmlvdXMgb24gaGFuZGxlcnMgc28gdGhhdCB0aGlzIGZ1bmN0aW9uIHRha2VzIHByZWNlZGVuY2VcbiAgICBkZUluaXRPbkhhbmRsZXJzKGVsdClcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWx0LmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBlbHQuYXR0cmlidXRlc1tpXS5uYW1lXG4gICAgICBjb25zdCB2YWx1ZSA9IGVsdC5hdHRyaWJ1dGVzW2ldLnZhbHVlXG4gICAgICBpZiAoc3RhcnRzV2l0aChuYW1lLCAnaHgtb24nKSB8fCBzdGFydHNXaXRoKG5hbWUsICdkYXRhLWh4LW9uJykpIHtcbiAgICAgICAgY29uc3QgYWZ0ZXJPblBvc2l0aW9uID0gbmFtZS5pbmRleE9mKCctb24nKSArIDNcbiAgICAgICAgY29uc3QgbmV4dENoYXIgPSBuYW1lLnNsaWNlKGFmdGVyT25Qb3NpdGlvbiwgYWZ0ZXJPblBvc2l0aW9uICsgMSlcbiAgICAgICAgaWYgKG5leHRDaGFyID09PSAnLScgfHwgbmV4dENoYXIgPT09ICc6Jykge1xuICAgICAgICAgIGxldCBldmVudE5hbWUgPSBuYW1lLnNsaWNlKGFmdGVyT25Qb3NpdGlvbiArIDEpXG4gICAgICAgICAgLy8gaWYgdGhlIGV2ZW50TmFtZSBzdGFydHMgd2l0aCBhIGNvbG9uIG9yIGRhc2gsIHByZXBlbmQgXCJodG14XCIgZm9yIHNob3J0aGFuZCBzdXBwb3J0XG4gICAgICAgICAgaWYgKHN0YXJ0c1dpdGgoZXZlbnROYW1lLCAnOicpKSB7XG4gICAgICAgICAgICBldmVudE5hbWUgPSAnaHRteCcgKyBldmVudE5hbWVcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXJ0c1dpdGgoZXZlbnROYW1lLCAnLScpKSB7XG4gICAgICAgICAgICBldmVudE5hbWUgPSAnaHRteDonICsgZXZlbnROYW1lLnNsaWNlKDEpXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGFydHNXaXRoKGV2ZW50TmFtZSwgJ2h0bXgtJykpIHtcbiAgICAgICAgICAgIGV2ZW50TmFtZSA9ICdodG14OicgKyBldmVudE5hbWUuc2xpY2UoNSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhZGRIeE9uRXZlbnRIYW5kbGVyKGVsdCwgZXZlbnROYW1lLCB2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR8SFRNTElucHV0RWxlbWVudH0gZWx0XG4gICAqL1xuICBmdW5jdGlvbiBpbml0Tm9kZShlbHQpIHtcbiAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDpiZWZvcmVQcm9jZXNzTm9kZScpXG5cbiAgICBjb25zdCBub2RlRGF0YSA9IGdldEludGVybmFsRGF0YShlbHQpXG4gICAgY29uc3QgdHJpZ2dlclNwZWNzID0gZ2V0VHJpZ2dlclNwZWNzKGVsdClcbiAgICBjb25zdCBoYXNFeHBsaWNpdEh0dHBBY3Rpb24gPSBwcm9jZXNzVmVyYnMoZWx0LCBub2RlRGF0YSwgdHJpZ2dlclNwZWNzKVxuXG4gICAgaWYgKCFoYXNFeHBsaWNpdEh0dHBBY3Rpb24pIHtcbiAgICAgIGlmIChnZXRDbG9zZXN0QXR0cmlidXRlVmFsdWUoZWx0LCAnaHgtYm9vc3QnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgIGJvb3N0RWxlbWVudChlbHQsIG5vZGVEYXRhLCB0cmlnZ2VyU3BlY3MpXG4gICAgICB9IGVsc2UgaWYgKGhhc0F0dHJpYnV0ZShlbHQsICdoeC10cmlnZ2VyJykpIHtcbiAgICAgICAgdHJpZ2dlclNwZWNzLmZvckVhY2goZnVuY3Rpb24odHJpZ2dlclNwZWMpIHtcbiAgICAgICAgICAvLyBGb3IgXCJuYWtlZFwiIHRyaWdnZXJzLCBkb24ndCBkbyBhbnl0aGluZyBhdCBhbGxcbiAgICAgICAgICBhZGRUcmlnZ2VySGFuZGxlcihlbHQsIHRyaWdnZXJTcGVjLCBub2RlRGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3VibWl0IGJ1dHRvbnMvaW5wdXRzIHRoYXQgaGF2ZSB0aGUgZm9ybSBhdHRyaWJ1dGUgc2V0XG4gICAgLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0hUTUwvRWxlbWVudC9idXR0b25cbiAgICBpZiAoZWx0LnRhZ05hbWUgPT09ICdGT1JNJyB8fCAoZ2V0UmF3QXR0cmlidXRlKGVsdCwgJ3R5cGUnKSA9PT0gJ3N1Ym1pdCcgJiYgaGFzQXR0cmlidXRlKGVsdCwgJ2Zvcm0nKSkpIHtcbiAgICAgIGluaXRCdXR0b25UcmFja2luZyhlbHQpXG4gICAgfVxuXG4gICAgbm9kZURhdGEuZmlyc3RJbml0Q29tcGxldGVkID0gdHJ1ZVxuICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OmFmdGVyUHJvY2Vzc05vZGUnKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gbWF5YmVEZUluaXRBbmRIYXNoKGVsdCkge1xuICAgIC8vIEVuc3VyZSBvbmx5IHZhbGlkIEVsZW1lbnRzIGFuZCBub3Qgc2hhZG93IERPTSByb290cyBhcmUgaW5pdGVkXG4gICAgaWYgKCEoZWx0IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IG5vZGVEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICBjb25zdCBoYXNoID0gYXR0cmlidXRlSGFzaChlbHQpXG4gICAgaWYgKG5vZGVEYXRhLmluaXRIYXNoICE9PSBoYXNoKSB7XG4gICAgICBkZUluaXROb2RlKGVsdClcbiAgICAgIG5vZGVEYXRhLmluaXRIYXNoID0gaGFzaFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogUHJvY2Vzc2VzIG5ldyBjb250ZW50LCBlbmFibGluZyBodG14IGJlaGF2aW9yLiBUaGlzIGNhbiBiZSB1c2VmdWwgaWYgeW91IGhhdmUgY29udGVudCB0aGF0IGlzIGFkZGVkIHRvIHRoZSBET00gb3V0c2lkZSBvZiB0aGUgbm9ybWFsIGh0bXggcmVxdWVzdCBjeWNsZSBidXQgc3RpbGwgd2FudCBodG14IGF0dHJpYnV0ZXMgdG8gd29yay5cbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jcHJvY2Vzc1xuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR8c3RyaW5nfSBlbHQgZWxlbWVudCB0byBwcm9jZXNzXG4gICAqL1xuICBmdW5jdGlvbiBwcm9jZXNzTm9kZShlbHQpIHtcbiAgICBlbHQgPSByZXNvbHZlVGFyZ2V0KGVsdClcbiAgICBpZiAoZWx0SXNEaXNhYmxlZChlbHQpKSB7XG4gICAgICBjbGVhblVwRWxlbWVudChlbHQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50c1RvSW5pdCA9IFtdXG4gICAgaWYgKG1heWJlRGVJbml0QW5kSGFzaChlbHQpKSB7XG4gICAgICBlbGVtZW50c1RvSW5pdC5wdXNoKGVsdClcbiAgICB9XG4gICAgZm9yRWFjaChmaW5kRWxlbWVudHNUb1Byb2Nlc3MoZWx0KSwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIGlmIChlbHRJc0Rpc2FibGVkKGNoaWxkKSkge1xuICAgICAgICBjbGVhblVwRWxlbWVudChjaGlsZClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAobWF5YmVEZUluaXRBbmRIYXNoKGNoaWxkKSkge1xuICAgICAgICBlbGVtZW50c1RvSW5pdC5wdXNoKGNoaWxkKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBmb3JFYWNoKGZpbmRIeE9uV2lsZGNhcmRFbGVtZW50cyhlbHQpLCBwcm9jZXNzSHhPbldpbGRjYXJkKVxuICAgIGZvckVhY2goZWxlbWVudHNUb0luaXQsIGluaXROb2RlKVxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRXZlbnQvTG9nIFN1cHBvcnRcbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24ga2ViYWJFdmVudE5hbWUoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2EtejAtOV0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgKiBAcGFyYW0ge2FueX0gZGV0YWlsXG4gICAqIEByZXR1cm5zIHtDdXN0b21FdmVudH1cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VFdmVudChldmVudE5hbWUsIGRldGFpbCkge1xuICAgIC8vIFRPRE86IGBjb21wb3NlZDogdHJ1ZWAgaGVyZSBpcyBhIGhhY2sgdG8gbWFrZSBnbG9iYWwgZXZlbnQgaGFuZGxlcnMgd29yayB3aXRoIGV2ZW50cyBpbiBzaGFkb3cgRE9NXG4gICAgLy8gVGhpcyBicmVha3MgZXhwZWN0ZWQgZW5jYXBzdWxhdGlvbiBidXQgbmVlZHMgdG8gYmUgaGVyZSB1bnRpbCBkZWNpZGVkIG90aGVyd2lzZSBieSBjb3JlIGRldnNcbiAgICByZXR1cm4gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiB0cnVlLCBjb21wb3NlZDogdHJ1ZSwgZGV0YWlsIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldHxzdHJpbmd9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAqIEBwYXJhbSB7YW55PX0gZGV0YWlsXG4gICAqL1xuICBmdW5jdGlvbiB0cmlnZ2VyRXJyb3JFdmVudChlbHQsIGV2ZW50TmFtZSwgZGV0YWlsKSB7XG4gICAgdHJpZ2dlckV2ZW50KGVsdCwgZXZlbnROYW1lLCBtZXJnZU9iamVjdHMoeyBlcnJvcjogZXZlbnROYW1lIH0sIGRldGFpbCkpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlnbm9yZUV2ZW50Rm9yTG9nZ2luZyhldmVudE5hbWUpIHtcbiAgICByZXR1cm4gZXZlbnROYW1lID09PSAnaHRteDphZnRlclByb2Nlc3NOb2RlJ1xuICB9XG5cbiAgLyoqXG4gICAqIGB3aXRoRXh0ZW5zaW9uc2AgbG9jYXRlcyBhbGwgYWN0aXZlIGV4dGVuc2lvbnMgZm9yIGEgcHJvdmlkZWQgZWxlbWVudCwgdGhlblxuICAgKiBleGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gdXNpbmcgZWFjaCBvZiB0aGUgYWN0aXZlIGV4dGVuc2lvbnMuIFlvdSBjYW4gZmlsdGVyXG4gICAqIHRoZSBlbGVtZW50J3MgZXh0ZW5zaW9ucyBieSBnaXZpbmcgaXQgYSBsaXN0IG9mIGV4dGVuc2lvbnMgdG8gaWdub3JlLiBJdCBzaG91bGRcbiAgICogYmUgY2FsbGVkIGludGVybmFsbHkgYXQgZXZlcnkgZXh0ZW5kYWJsZSBleGVjdXRpb24gcG9pbnQgaW4gaHRteC5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHsoZXh0ZW5zaW9uOkh0bXhFeHRlbnNpb24pID0+IHZvaWR9IHRvRG9cbiAgICogQHBhcmFtIHtzdHJpbmdbXT19IGV4dGVuc2lvbnNUb0lnbm9yZVxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBmdW5jdGlvbiB3aXRoRXh0ZW5zaW9ucyhlbHQsIHRvRG8sIGV4dGVuc2lvbnNUb0lnbm9yZSkge1xuICAgIGZvckVhY2goZ2V0RXh0ZW5zaW9ucyhlbHQsIFtdLCBleHRlbnNpb25zVG9JZ25vcmUpLCBmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRvRG8oZXh0ZW5zaW9uKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dFcnJvcihlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBsb2dFcnJvcihtc2cpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGdpdmVuIGV2ZW50IG9uIGFuIGVsZW1lbnRcbiAgICpcbiAgICogQHNlZSBodHRwczovL2h0bXgub3JnL2FwaS8jdHJpZ2dlclxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fHN0cmluZ30gZWx0IHRoZSBlbGVtZW50IHRvIHRyaWdnZXIgdGhlIGV2ZW50IG9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgdGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHRyaWdnZXJcbiAgICogQHBhcmFtIHthbnk9fSBkZXRhaWwgZGV0YWlscyBmb3IgdGhlIGV2ZW50XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gdHJpZ2dlckV2ZW50KGVsdCwgZXZlbnROYW1lLCBkZXRhaWwpIHtcbiAgICBlbHQgPSByZXNvbHZlVGFyZ2V0KGVsdClcbiAgICBpZiAoZGV0YWlsID09IG51bGwpIHtcbiAgICAgIGRldGFpbCA9IHt9XG4gICAgfVxuICAgIGRldGFpbC5lbHQgPSBlbHRcbiAgICBjb25zdCBldmVudCA9IG1ha2VFdmVudChldmVudE5hbWUsIGRldGFpbClcbiAgICBpZiAoaHRteC5sb2dnZXIgJiYgIWlnbm9yZUV2ZW50Rm9yTG9nZ2luZyhldmVudE5hbWUpKSB7XG4gICAgICBodG14LmxvZ2dlcihlbHQsIGV2ZW50TmFtZSwgZGV0YWlsKVxuICAgIH1cbiAgICBpZiAoZGV0YWlsLmVycm9yKSB7XG4gICAgICBsb2dFcnJvcihkZXRhaWwuZXJyb3IpXG4gICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDplcnJvcicsIHsgZXJyb3JJbmZvOiBkZXRhaWwgfSlcbiAgICB9XG4gICAgbGV0IGV2ZW50UmVzdWx0ID0gZWx0LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG4gICAgY29uc3Qga2ViYWJOYW1lID0ga2ViYWJFdmVudE5hbWUoZXZlbnROYW1lKVxuICAgIGlmIChldmVudFJlc3VsdCAmJiBrZWJhYk5hbWUgIT09IGV2ZW50TmFtZSkge1xuICAgICAgY29uc3Qga2ViYWJlZEV2ZW50ID0gbWFrZUV2ZW50KGtlYmFiTmFtZSwgZXZlbnQuZGV0YWlsKVxuICAgICAgZXZlbnRSZXN1bHQgPSBldmVudFJlc3VsdCAmJiBlbHQuZGlzcGF0Y2hFdmVudChrZWJhYmVkRXZlbnQpXG4gICAgfVxuICAgIHdpdGhFeHRlbnNpb25zKGFzRWxlbWVudChlbHQpLCBmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICAgIGV2ZW50UmVzdWx0ID0gZXZlbnRSZXN1bHQgJiYgKGV4dGVuc2lvbi5vbkV2ZW50KGV2ZW50TmFtZSwgZXZlbnQpICE9PSBmYWxzZSAmJiAhZXZlbnQuZGVmYXVsdFByZXZlbnRlZClcbiAgICB9KVxuICAgIHJldHVybiBldmVudFJlc3VsdFxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gSGlzdG9yeSBTdXBwb3J0XG4gIC8vPSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGxldCBjdXJyZW50UGF0aEZvckhpc3RvcnkgPSBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0Q3VycmVudFBhdGhGb3JIaXN0b3J5KHBhdGgpIHtcbiAgICBjdXJyZW50UGF0aEZvckhpc3RvcnkgPSBwYXRoXG4gICAgaWYgKGNhbkFjY2Vzc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdodG14LWN1cnJlbnQtcGF0aC1mb3ItaGlzdG9yeScsIHBhdGgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtFbGVtZW50fVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0SGlzdG9yeUVsZW1lbnQoKSB7XG4gICAgY29uc3QgaGlzdG9yeUVsdCA9IGdldERvY3VtZW50KCkucXVlcnlTZWxlY3RvcignW2h4LWhpc3RvcnktZWx0XSxbZGF0YS1oeC1oaXN0b3J5LWVsdF0nKVxuICAgIHJldHVybiBoaXN0b3J5RWx0IHx8IGdldERvY3VtZW50KCkuYm9keVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtFbGVtZW50fSByb290RWx0XG4gICAqL1xuICBmdW5jdGlvbiBzYXZlVG9IaXN0b3J5Q2FjaGUodXJsLCByb290RWx0KSB7XG4gICAgaWYgKCFjYW5BY2Nlc3NMb2NhbFN0b3JhZ2UoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZ2V0IHN0YXRlIHRvIHNhdmVcbiAgICBjb25zdCBpbm5lckhUTUwgPSBjbGVhbklubmVySHRtbEZvckhpc3Rvcnkocm9vdEVsdClcbiAgICBjb25zdCB0aXRsZSA9IGdldERvY3VtZW50KCkudGl0bGVcbiAgICBjb25zdCBzY3JvbGwgPSB3aW5kb3cuc2Nyb2xsWVxuXG4gICAgaWYgKGh0bXguY29uZmlnLmhpc3RvcnlDYWNoZVNpemUgPD0gMCkge1xuICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgYW4gZXZlbnR1YWxseSBhbHJlYWR5IGV4aXN0aW5nIGNhY2hlIGlzIHB1cmdlZFxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnaHRteC1oaXN0b3J5LWNhY2hlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHVybCA9IG5vcm1hbGl6ZVBhdGgodXJsKVxuXG4gICAgY29uc3QgaGlzdG9yeUNhY2hlID0gcGFyc2VKU09OKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2h0bXgtaGlzdG9yeS1jYWNoZScpKSB8fCBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGlzdG9yeUNhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaGlzdG9yeUNhY2hlW2ldLnVybCA9PT0gdXJsKSB7XG4gICAgICAgIGhpc3RvcnlDYWNoZS5zcGxpY2UoaSwgMSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogQHR5cGUgSHRteEhpc3RvcnlJdGVtICovXG4gICAgY29uc3QgbmV3SGlzdG9yeUl0ZW0gPSB7IHVybCwgY29udGVudDogaW5uZXJIVE1MLCB0aXRsZSwgc2Nyb2xsIH1cblxuICAgIHRyaWdnZXJFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14Omhpc3RvcnlJdGVtQ3JlYXRlZCcsIHsgaXRlbTogbmV3SGlzdG9yeUl0ZW0sIGNhY2hlOiBoaXN0b3J5Q2FjaGUgfSlcblxuICAgIGhpc3RvcnlDYWNoZS5wdXNoKG5ld0hpc3RvcnlJdGVtKVxuICAgIHdoaWxlIChoaXN0b3J5Q2FjaGUubGVuZ3RoID4gaHRteC5jb25maWcuaGlzdG9yeUNhY2hlU2l6ZSkge1xuICAgICAgaGlzdG9yeUNhY2hlLnNoaWZ0KClcbiAgICB9XG5cbiAgICAvLyBrZWVwIHRyeWluZyB0byBzYXZlIHRoZSBjYWNoZSB1bnRpbCBpdCBzdWNjZWVkcyBvciBpcyBlbXB0eVxuICAgIHdoaWxlIChoaXN0b3J5Q2FjaGUubGVuZ3RoID4gMCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnaHRteC1oaXN0b3J5LWNhY2hlJywgSlNPTi5zdHJpbmdpZnkoaGlzdG9yeUNhY2hlKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdHJpZ2dlckVycm9yRXZlbnQoZ2V0RG9jdW1lbnQoKS5ib2R5LCAnaHRteDpoaXN0b3J5Q2FjaGVFcnJvcicsIHsgY2F1c2U6IGUsIGNhY2hlOiBoaXN0b3J5Q2FjaGUgfSlcbiAgICAgICAgaGlzdG9yeUNhY2hlLnNoaWZ0KCkgLy8gc2hyaW5rIHRoZSBjYWNoZSBhbmQgcmV0cnlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gSHRteEhpc3RvcnlJdGVtXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmxcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGNvbnRlbnRcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHRpdGxlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzY3JvbGxcbiAgICovXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybnMge0h0bXhIaXN0b3J5SXRlbXxudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q2FjaGVkSGlzdG9yeSh1cmwpIHtcbiAgICBpZiAoIWNhbkFjY2Vzc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHVybCA9IG5vcm1hbGl6ZVBhdGgodXJsKVxuXG4gICAgY29uc3QgaGlzdG9yeUNhY2hlID0gcGFyc2VKU09OKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2h0bXgtaGlzdG9yeS1jYWNoZScpKSB8fCBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGlzdG9yeUNhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaGlzdG9yeUNhY2hlW2ldLnVybCA9PT0gdXJsKSB7XG4gICAgICAgIHJldHVybiBoaXN0b3J5Q2FjaGVbaV1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZnVuY3Rpb24gY2xlYW5Jbm5lckh0bWxGb3JIaXN0b3J5KGVsdCkge1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGh0bXguY29uZmlnLnJlcXVlc3RDbGFzc1xuICAgIGNvbnN0IGNsb25lID0gLyoqIEB0eXBlIEVsZW1lbnQgKi8gKGVsdC5jbG9uZU5vZGUodHJ1ZSkpXG4gICAgZm9yRWFjaChmaW5kQWxsKGNsb25lLCAnLicgKyBjbGFzc05hbWUpLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgcmVtb3ZlQ2xhc3NGcm9tRWxlbWVudChjaGlsZCwgY2xhc3NOYW1lKVxuICAgIH0pXG4gICAgLy8gcmVtb3ZlIHRoZSBkaXNhYmxlZCBhdHRyaWJ1dGUgZm9yIGFueSBlbGVtZW50IGRpc2FibGVkIGR1ZSB0byBhbiBodG14IHJlcXVlc3RcbiAgICBmb3JFYWNoKGZpbmRBbGwoY2xvbmUsICdbZGF0YS1kaXNhYmxlZC1ieS1odG14XScpLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgY2hpbGQucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpXG4gICAgfSlcbiAgICByZXR1cm4gY2xvbmUuaW5uZXJIVE1MXG4gIH1cblxuICBmdW5jdGlvbiBzYXZlQ3VycmVudFBhZ2VUb0hpc3RvcnkoKSB7XG4gICAgY29uc3QgZWx0ID0gZ2V0SGlzdG9yeUVsZW1lbnQoKVxuICAgIGxldCBwYXRoID0gY3VycmVudFBhdGhGb3JIaXN0b3J5XG4gICAgaWYgKGNhbkFjY2Vzc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgICBwYXRoID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnaHRteC1jdXJyZW50LXBhdGgtZm9yLWhpc3RvcnknKVxuICAgIH1cbiAgICBwYXRoID0gcGF0aCB8fCBsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaFxuXG4gICAgLy8gQWxsb3cgaGlzdG9yeSBzbmFwc2hvdCBmZWF0dXJlIHRvIGJlIGRpc2FibGVkIHdoZXJlIGh4LWhpc3Rvcnk9XCJmYWxzZVwiXG4gICAgLy8gaXMgcHJlc2VudCAqYW55d2hlcmUqIGluIHRoZSBjdXJyZW50IGRvY3VtZW50IHdlJ3JlIGFib3V0IHRvIHNhdmUsXG4gICAgLy8gc28gd2UgY2FuIHByZXZlbnQgcHJpdmlsZWdlZCBkYXRhIGVudGVyaW5nIHRoZSBjYWNoZS5cbiAgICAvLyBUaGUgcGFnZSB3aWxsIHN0aWxsIGJlIHJlYWNoYWJsZSBhcyBhIGhpc3RvcnkgZW50cnksIGJ1dCBodG14IHdpbGwgZmV0Y2ggaXRcbiAgICAvLyBsaXZlIGZyb20gdGhlIHNlcnZlciBvbnBvcHN0YXRlIHJhdGhlciB0aGFuIGxvb2sgaW4gdGhlIHNlc3Npb25TdG9yYWdlIGNhY2hlXG4gICAgY29uc3QgZGlzYWJsZUhpc3RvcnlDYWNoZSA9IGdldERvY3VtZW50KCkucXVlcnlTZWxlY3RvcignW2h4LWhpc3Rvcnk9XCJmYWxzZVwiIGldLFtkYXRhLWh4LWhpc3Rvcnk9XCJmYWxzZVwiIGldJylcbiAgICBpZiAoIWRpc2FibGVIaXN0b3J5Q2FjaGUpIHtcbiAgICAgIHRyaWdnZXJFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14OmJlZm9yZUhpc3RvcnlTYXZlJywgeyBwYXRoLCBoaXN0b3J5RWx0OiBlbHQgfSlcbiAgICAgIHNhdmVUb0hpc3RvcnlDYWNoZShwYXRoLCBlbHQpXG4gICAgfVxuXG4gICAgaWYgKGh0bXguY29uZmlnLmhpc3RvcnlFbmFibGVkKSBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IGh0bXg6IHRydWUgfSwgZ2V0RG9jdW1lbnQoKS50aXRsZSwgbG9jYXRpb24uaHJlZilcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKi9cbiAgZnVuY3Rpb24gcHVzaFVybEludG9IaXN0b3J5KHBhdGgpIHtcbiAgLy8gcmVtb3ZlIHRoZSBjYWNoZSBidXN0ZXIgcGFyYW1ldGVyLCBpZiBhbnlcbiAgICBpZiAoaHRteC5jb25maWcuZ2V0Q2FjaGVCdXN0ZXJQYXJhbSkge1xuICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvb3JnXFwuaHRteFxcLmNhY2hlLWJ1c3Rlcj1bXiZdKiY/LywgJycpXG4gICAgICBpZiAoZW5kc1dpdGgocGF0aCwgJyYnKSB8fCBlbmRzV2l0aChwYXRoLCAnPycpKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnNsaWNlKDAsIC0xKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaHRteC5jb25maWcuaGlzdG9yeUVuYWJsZWQpIHtcbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsgaHRteDogdHJ1ZSB9LCAnJywgcGF0aClcbiAgICB9XG4gICAgc2V0Q3VycmVudFBhdGhGb3JIaXN0b3J5KHBhdGgpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VVcmxJbkhpc3RvcnkocGF0aCkge1xuICAgIGlmIChodG14LmNvbmZpZy5oaXN0b3J5RW5hYmxlZCkgaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBodG14OiB0cnVlIH0sICcnLCBwYXRoKVxuICAgIHNldEN1cnJlbnRQYXRoRm9ySGlzdG9yeShwYXRoKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SHRteFNldHRsZVRhc2tbXX0gdGFza3NcbiAgICovXG4gIGZ1bmN0aW9uIHNldHRsZUltbWVkaWF0ZWx5KHRhc2tzKSB7XG4gICAgZm9yRWFjaCh0YXNrcywgZnVuY3Rpb24odGFzaykge1xuICAgICAgdGFzay5jYWxsKHVuZGVmaW5lZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqL1xuICBmdW5jdGlvbiBsb2FkSGlzdG9yeUZyb21TZXJ2ZXIocGF0aCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIGNvbnN0IHN3YXBTcGVjID0geyBzd2FwU3R5bGU6ICdpbm5lckhUTUwnLCBzd2FwRGVsYXk6IDAsIHNldHRsZURlbGF5OiAwIH1cbiAgICBjb25zdCBkZXRhaWxzID0geyBwYXRoLCB4aHI6IHJlcXVlc3QsIGhpc3RvcnlFbHQ6IGdldEhpc3RvcnlFbGVtZW50KCksIHN3YXBTcGVjIH1cbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHBhdGgsIHRydWUpXG4gICAgaWYgKGh0bXguY29uZmlnLmhpc3RvcnlSZXN0b3JlQXNIeFJlcXVlc3QpIHtcbiAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignSFgtUmVxdWVzdCcsICd0cnVlJylcbiAgICB9XG4gICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdIWC1IaXN0b3J5LVJlc3RvcmUtUmVxdWVzdCcsICd0cnVlJylcbiAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0hYLUN1cnJlbnQtVVJMJywgbG9jYXRpb24uaHJlZilcbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDQwMCkge1xuICAgICAgICBkZXRhaWxzLnJlc3BvbnNlID0gdGhpcy5yZXNwb25zZVxuICAgICAgICB0cmlnZ2VyRXZlbnQoZ2V0RG9jdW1lbnQoKS5ib2R5LCAnaHRteDpoaXN0b3J5Q2FjaGVNaXNzTG9hZCcsIGRldGFpbHMpXG4gICAgICAgIHN3YXAoZGV0YWlscy5oaXN0b3J5RWx0LCBkZXRhaWxzLnJlc3BvbnNlLCBzd2FwU3BlYywge1xuICAgICAgICAgIGNvbnRleHRFbGVtZW50OiBkZXRhaWxzLmhpc3RvcnlFbHQsXG4gICAgICAgICAgaGlzdG9yeVJlcXVlc3Q6IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgc2V0Q3VycmVudFBhdGhGb3JIaXN0b3J5KGRldGFpbHMucGF0aClcbiAgICAgICAgdHJpZ2dlckV2ZW50KGdldERvY3VtZW50KCkuYm9keSwgJ2h0bXg6aGlzdG9yeVJlc3RvcmUnLCB7IHBhdGgsIGNhY2hlTWlzczogdHJ1ZSwgc2VydmVyUmVzcG9uc2U6IGRldGFpbHMucmVzcG9uc2UgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyaWdnZXJFcnJvckV2ZW50KGdldERvY3VtZW50KCkuYm9keSwgJ2h0bXg6aGlzdG9yeUNhY2hlTWlzc0xvYWRFcnJvcicsIGRldGFpbHMpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0cmlnZ2VyRXZlbnQoZ2V0RG9jdW1lbnQoKS5ib2R5LCAnaHRteDpoaXN0b3J5Q2FjaGVNaXNzJywgZGV0YWlscykpIHtcbiAgICAgIHJlcXVlc3Quc2VuZCgpIC8vIG9ubHkgc2VuZCByZXF1ZXN0IGlmIGV2ZW50IG5vdCBwcmV2ZW50ZWRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoXVxuICAgKi9cbiAgZnVuY3Rpb24gcmVzdG9yZUhpc3RvcnkocGF0aCkge1xuICAgIHNhdmVDdXJyZW50UGFnZVRvSGlzdG9yeSgpXG4gICAgcGF0aCA9IHBhdGggfHwgbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2hcbiAgICBjb25zdCBjYWNoZWQgPSBnZXRDYWNoZWRIaXN0b3J5KHBhdGgpXG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgY29uc3Qgc3dhcFNwZWMgPSB7IHN3YXBTdHlsZTogJ2lubmVySFRNTCcsIHN3YXBEZWxheTogMCwgc2V0dGxlRGVsYXk6IDAsIHNjcm9sbDogY2FjaGVkLnNjcm9sbCB9XG4gICAgICBjb25zdCBkZXRhaWxzID0geyBwYXRoLCBpdGVtOiBjYWNoZWQsIGhpc3RvcnlFbHQ6IGdldEhpc3RvcnlFbGVtZW50KCksIHN3YXBTcGVjIH1cbiAgICAgIGlmICh0cmlnZ2VyRXZlbnQoZ2V0RG9jdW1lbnQoKS5ib2R5LCAnaHRteDpoaXN0b3J5Q2FjaGVIaXQnLCBkZXRhaWxzKSkge1xuICAgICAgICBzd2FwKGRldGFpbHMuaGlzdG9yeUVsdCwgY2FjaGVkLmNvbnRlbnQsIHN3YXBTcGVjLCB7XG4gICAgICAgICAgY29udGV4dEVsZW1lbnQ6IGRldGFpbHMuaGlzdG9yeUVsdCxcbiAgICAgICAgICB0aXRsZTogY2FjaGVkLnRpdGxlXG4gICAgICAgIH0pXG4gICAgICAgIHNldEN1cnJlbnRQYXRoRm9ySGlzdG9yeShkZXRhaWxzLnBhdGgpXG4gICAgICAgIHRyaWdnZXJFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14Omhpc3RvcnlSZXN0b3JlJywgZGV0YWlscylcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGh0bXguY29uZmlnLnJlZnJlc2hPbkhpc3RvcnlNaXNzKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmU6IG9wdGlvbmFsIHBhcmFtZXRlciBpbiByZWxvYWQoKSBmdW5jdGlvbiB0aHJvd3MgZXJyb3JcbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTVW5yZXNvbHZlZFJlZmVyZW5jZVxuICAgICAgICBodG14LmxvY2F0aW9uLnJlbG9hZCh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9hZEhpc3RvcnlGcm9tU2VydmVyKHBhdGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtFbGVtZW50W119XG4gICAqL1xuICBmdW5jdGlvbiBhZGRSZXF1ZXN0SW5kaWNhdG9yQ2xhc3NlcyhlbHQpIHtcbiAgICBsZXQgaW5kaWNhdG9ycyA9IC8qKiBAdHlwZSBFbGVtZW50W10gKi8gKGZpbmRBdHRyaWJ1dGVUYXJnZXRzKGVsdCwgJ2h4LWluZGljYXRvcicpKVxuICAgIGlmIChpbmRpY2F0b3JzID09IG51bGwpIHtcbiAgICAgIGluZGljYXRvcnMgPSBbZWx0XVxuICAgIH1cbiAgICBmb3JFYWNoKGluZGljYXRvcnMsIGZ1bmN0aW9uKGljKSB7XG4gICAgICBjb25zdCBpbnRlcm5hbERhdGEgPSBnZXRJbnRlcm5hbERhdGEoaWMpXG4gICAgICBpbnRlcm5hbERhdGEucmVxdWVzdENvdW50ID0gKGludGVybmFsRGF0YS5yZXF1ZXN0Q291bnQgfHwgMCkgKyAxXG4gICAgICBpYy5jbGFzc0xpc3QuYWRkLmNhbGwoaWMuY2xhc3NMaXN0LCBodG14LmNvbmZpZy5yZXF1ZXN0Q2xhc3MpXG4gICAgfSlcbiAgICByZXR1cm4gaW5kaWNhdG9yc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtFbGVtZW50W119XG4gICAqL1xuICBmdW5jdGlvbiBkaXNhYmxlRWxlbWVudHMoZWx0KSB7XG4gICAgbGV0IGRpc2FibGVkRWx0cyA9IC8qKiBAdHlwZSBFbGVtZW50W10gKi8gKGZpbmRBdHRyaWJ1dGVUYXJnZXRzKGVsdCwgJ2h4LWRpc2FibGVkLWVsdCcpKVxuICAgIGlmIChkaXNhYmxlZEVsdHMgPT0gbnVsbCkge1xuICAgICAgZGlzYWJsZWRFbHRzID0gW11cbiAgICB9XG4gICAgZm9yRWFjaChkaXNhYmxlZEVsdHMsIGZ1bmN0aW9uKGRpc2FibGVkRWxlbWVudCkge1xuICAgICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGRpc2FibGVkRWxlbWVudClcbiAgICAgIGludGVybmFsRGF0YS5yZXF1ZXN0Q291bnQgPSAoaW50ZXJuYWxEYXRhLnJlcXVlc3RDb3VudCB8fCAwKSArIDFcbiAgICAgIGRpc2FibGVkRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJycpXG4gICAgICBkaXNhYmxlZEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWRpc2FibGVkLWJ5LWh0bXgnLCAnJylcbiAgICB9KVxuICAgIHJldHVybiBkaXNhYmxlZEVsdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnRbXX0gaW5kaWNhdG9yc1xuICAgKiBAcGFyYW0ge0VsZW1lbnRbXX0gZGlzYWJsZWRcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZVJlcXVlc3RJbmRpY2F0b3JzKGluZGljYXRvcnMsIGRpc2FibGVkKSB7XG4gICAgZm9yRWFjaChpbmRpY2F0b3JzLmNvbmNhdChkaXNhYmxlZCksIGZ1bmN0aW9uKGVsZSkge1xuICAgICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsZSlcbiAgICAgIGludGVybmFsRGF0YS5yZXF1ZXN0Q291bnQgPSAoaW50ZXJuYWxEYXRhLnJlcXVlc3RDb3VudCB8fCAxKSAtIDFcbiAgICB9KVxuICAgIGZvckVhY2goaW5kaWNhdG9ycywgZnVuY3Rpb24oaWMpIHtcbiAgICAgIGNvbnN0IGludGVybmFsRGF0YSA9IGdldEludGVybmFsRGF0YShpYylcbiAgICAgIGlmIChpbnRlcm5hbERhdGEucmVxdWVzdENvdW50ID09PSAwKSB7XG4gICAgICAgIGljLmNsYXNzTGlzdC5yZW1vdmUuY2FsbChpYy5jbGFzc0xpc3QsIGh0bXguY29uZmlnLnJlcXVlc3RDbGFzcylcbiAgICAgIH1cbiAgICB9KVxuICAgIGZvckVhY2goZGlzYWJsZWQsIGZ1bmN0aW9uKGRpc2FibGVkRWxlbWVudCkge1xuICAgICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGRpc2FibGVkRWxlbWVudClcbiAgICAgIGlmIChpbnRlcm5hbERhdGEucmVxdWVzdENvdW50ID09PSAwKSB7XG4gICAgICAgIGRpc2FibGVkRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJylcbiAgICAgICAgZGlzYWJsZWRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1kaXNhYmxlZC1ieS1odG14JylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gSW5wdXQgVmFsdWUgUHJvY2Vzc2luZ1xuICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnRbXX0gcHJvY2Vzc2VkXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaGF2ZVNlZW5Ob2RlKHByb2Nlc3NlZCwgZWx0KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9jZXNzZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBwcm9jZXNzZWRbaV1cbiAgICAgIGlmIChub2RlLmlzU2FtZU5vZGUoZWx0KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIHNob3VsZEluY2x1ZGUoZWxlbWVudCkge1xuICAgIC8vIENhc3QgdG8gdHJpY2sgdHNjLCB1bmRlZmluZWQgdmFsdWVzIHdpbGwgd29yayBmaW5lIGhlcmVcbiAgICBjb25zdCBlbHQgPSAvKiogQHR5cGUge0hUTUxJbnB1dEVsZW1lbnR9ICovIChlbGVtZW50KVxuICAgIGlmIChlbHQubmFtZSA9PT0gJycgfHwgZWx0Lm5hbWUgPT0gbnVsbCB8fCBlbHQuZGlzYWJsZWQgfHwgY2xvc2VzdChlbHQsICdmaWVsZHNldFtkaXNhYmxlZF0nKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vIGlnbm9yZSBcInN1Ym1pdHRlclwiIHR5cGVzIChzZWUgalF1ZXJ5IHNyYy9zZXJpYWxpemUuanMpXG4gICAgaWYgKGVsdC50eXBlID09PSAnYnV0dG9uJyB8fCBlbHQudHlwZSA9PT0gJ3N1Ym1pdCcgfHwgZWx0LnRhZ05hbWUgPT09ICdpbWFnZScgfHwgZWx0LnRhZ05hbWUgPT09ICdyZXNldCcgfHwgZWx0LnRhZ05hbWUgPT09ICdmaWxlJykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChlbHQudHlwZSA9PT0gJ2NoZWNrYm94JyB8fCBlbHQudHlwZSA9PT0gJ3JhZGlvJykge1xuICAgICAgcmV0dXJuIGVsdC5jaGVja2VkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd8QXJyYXl8Rm9ybURhdGFFbnRyeVZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge0Zvcm1EYXRhfSBmb3JtRGF0YSAqL1xuICBmdW5jdGlvbiBhZGRWYWx1ZVRvRm9ybURhdGEobmFtZSwgdmFsdWUsIGZvcm1EYXRhKSB7XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiB2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbih2KSB7IGZvcm1EYXRhLmFwcGVuZChuYW1lLCB2KSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ3xBcnJheX0gdmFsdWVcbiAgICogQHBhcmFtIHtGb3JtRGF0YX0gZm9ybURhdGEgKi9cbiAgZnVuY3Rpb24gcmVtb3ZlVmFsdWVGcm9tRm9ybURhdGEobmFtZSwgdmFsdWUsIGZvcm1EYXRhKSB7XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiB2YWx1ZSAhPSBudWxsKSB7XG4gICAgICBsZXQgdmFsdWVzID0gZm9ybURhdGEuZ2V0QWxsKG5hbWUpXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWVzID0gdmFsdWVzLmZpbHRlcih2ID0+IHZhbHVlLmluZGV4T2YodikgPCAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzID0gdmFsdWVzLmZpbHRlcih2ID0+IHYgIT09IHZhbHVlKVxuICAgICAgfVxuICAgICAgZm9ybURhdGEuZGVsZXRlKG5hbWUpXG4gICAgICBmb3JFYWNoKHZhbHVlcywgdiA9PiBmb3JtRGF0YS5hcHBlbmQobmFtZSwgdikpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm5zIHtzdHJpbmd8QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRWYWx1ZUZyb21JbnB1dChlbHQpIHtcbiAgICBpZiAoZWx0IGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQgJiYgZWx0Lm11bHRpcGxlKSB7XG4gICAgICByZXR1cm4gdG9BcnJheShlbHQucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uOmNoZWNrZWQnKSkubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuICgvKiogQHR5cGUgSFRNTE9wdGlvbkVsZW1lbnQgKi8oZSkpLnZhbHVlIH0pXG4gICAgfVxuICAgIC8vIGluY2x1ZGUgZmlsZSBpbnB1dHNcbiAgICBpZiAoZWx0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiBlbHQuZmlsZXMpIHtcbiAgICAgIHJldHVybiB0b0FycmF5KGVsdC5maWxlcylcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZSB2YWx1ZSB3aWxsIGJlIHVuZGVmaW5lZCBmb3Igbm9uLWlucHV0IGVsZW1lbnRzLCB3aGljaCBpcyBmaW5lXG4gICAgcmV0dXJuIGVsdC52YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudFtdfSBwcm9jZXNzZWRcbiAgICogQHBhcmFtIHtGb3JtRGF0YX0gZm9ybURhdGFcbiAgICogQHBhcmFtIHtIdG14RWxlbWVudFZhbGlkYXRpb25FcnJvcltdfSBlcnJvcnNcbiAgICogQHBhcmFtIHtFbGVtZW50fEhUTUxJbnB1dEVsZW1lbnR8SFRNTFNlbGVjdEVsZW1lbnR8SFRNTEZvcm1FbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtib29sZWFufSB2YWxpZGF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gcHJvY2Vzc0lucHV0VmFsdWUocHJvY2Vzc2VkLCBmb3JtRGF0YSwgZXJyb3JzLCBlbHQsIHZhbGlkYXRlKSB7XG4gICAgaWYgKGVsdCA9PSBudWxsIHx8IGhhdmVTZWVuTm9kZShwcm9jZXNzZWQsIGVsdCkpIHtcbiAgICAgIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICBwcm9jZXNzZWQucHVzaChlbHQpXG4gICAgfVxuICAgIGlmIChzaG91bGRJbmNsdWRlKGVsdCkpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBnZXRSYXdBdHRyaWJ1dGUoZWx0LCAnbmFtZScpXG4gICAgICBhZGRWYWx1ZVRvRm9ybURhdGEobmFtZSwgZ2V0VmFsdWVGcm9tSW5wdXQoZWx0KSwgZm9ybURhdGEpXG4gICAgICBpZiAodmFsaWRhdGUpIHtcbiAgICAgICAgdmFsaWRhdGVFbGVtZW50KGVsdCwgZXJyb3JzKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZWx0IGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50KSB7XG4gICAgICBmb3JFYWNoKGVsdC5lbGVtZW50cywgZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKHByb2Nlc3NlZC5pbmRleE9mKGlucHV0KSA+PSAwKSB7XG4gICAgICAgICAgLy8gVGhlIGlucHV0IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkIGFuZCBhZGRlZCB0byB0aGUgdmFsdWVzLCBidXQgdGhlIEZvcm1EYXRhIHRoYXQgd2lsbCBiZVxuICAgICAgICAgIC8vICBjb25zdHJ1Y3RlZCByaWdodCBhZnRlciBvbiB0aGUgZm9ybSwgd2lsbCBpbmNsdWRlIGl0IG9uY2UgYWdhaW4uIFNvIHJlbW92ZSB0aGF0IGlucHV0J3MgdmFsdWVcbiAgICAgICAgICAvLyAgbm93IHRvIGF2b2lkIGR1cGxpY2F0ZXNcbiAgICAgICAgICByZW1vdmVWYWx1ZUZyb21Gb3JtRGF0YShpbnB1dC5uYW1lLCBnZXRWYWx1ZUZyb21JbnB1dChpbnB1dCksIGZvcm1EYXRhKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2Nlc3NlZC5wdXNoKGlucHV0KVxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWxpZGF0ZSkge1xuICAgICAgICAgIHZhbGlkYXRlRWxlbWVudChpbnB1dCwgZXJyb3JzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbmV3IEZvcm1EYXRhKGVsdCkuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGaWxlICYmIHZhbHVlLm5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgcmV0dXJuIC8vIGlnbm9yZSBuby1uYW1lIGZpbGVzXG4gICAgICAgIH1cbiAgICAgICAgYWRkVmFsdWVUb0Zvcm1EYXRhKG5hbWUsIHZhbHVlLCBmb3JtRGF0YSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEBwYXJhbSB7SHRteEVsZW1lbnRWYWxpZGF0aW9uRXJyb3JbXX0gZXJyb3JzXG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUVsZW1lbnQoZWx0LCBlcnJvcnMpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gLyoqIEB0eXBlIHtIVE1MRWxlbWVudCAmIEVsZW1lbnRJbnRlcm5hbHN9ICovIChlbHQpXG4gICAgaWYgKGVsZW1lbnQud2lsbFZhbGlkYXRlKSB7XG4gICAgICB0cmlnZ2VyRXZlbnQoZWxlbWVudCwgJ2h0bXg6dmFsaWRhdGlvbjp2YWxpZGF0ZScpXG4gICAgICBpZiAoIWVsZW1lbnQuY2hlY2tWYWxpZGl0eSgpKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0cmlnZ2VyRXZlbnQoZWxlbWVudCwgJ2h0bXg6dmFsaWRhdGlvbjpmYWlsZWQnLCB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlbGVtZW50LnZhbGlkYXRpb25NZXNzYWdlLFxuICAgICAgICAgICAgdmFsaWRpdHk6IGVsZW1lbnQudmFsaWRpdHlcbiAgICAgICAgICB9KSAmJlxuICAgICAgICAgICFlcnJvcnMubGVuZ3RoICYmXG4gICAgICAgICAgaHRteC5jb25maWcucmVwb3J0VmFsaWRpdHlPZkZvcm1zXG4gICAgICAgICkge1xuICAgICAgICAgIGVsZW1lbnQucmVwb3J0VmFsaWRpdHkoKVxuICAgICAgICB9XG4gICAgICAgIGVycm9ycy5wdXNoKHsgZWx0OiBlbGVtZW50LCBtZXNzYWdlOiBlbGVtZW50LnZhbGlkYXRpb25NZXNzYWdlLCB2YWxpZGl0eTogZWxlbWVudC52YWxpZGl0eSB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZSB2YWx1ZXMgaW4gdGhlIG9uZSBGb3JtRGF0YSB3aXRoIHRob3NlIGZyb20gYW5vdGhlci5cbiAgICogQHBhcmFtIHtGb3JtRGF0YX0gcmVjZWl2ZXIgdGhlIGZvcm1kYXRhIHRoYXQgd2lsbCBiZSBtdXRhdGVkXG4gICAqIEBwYXJhbSB7Rm9ybURhdGF9IGRvbm9yIHRoZSBmb3JtZGF0YSB0aGF0IHdpbGwgcHJvdmlkZSB0aGUgb3ZlcnJpZGluZyB2YWx1ZXNcbiAgICogQHJldHVybnMge0Zvcm1EYXRhfSB0aGUge0BsaW5rY29kZSByZWNlaXZlcn1cbiAgICovXG4gIGZ1bmN0aW9uIG92ZXJyaWRlRm9ybURhdGEocmVjZWl2ZXIsIGRvbm9yKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgZG9ub3Iua2V5cygpKSB7XG4gICAgICByZWNlaXZlci5kZWxldGUoa2V5KVxuICAgIH1cbiAgICBkb25vci5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIHJlY2VpdmVyLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlY2VpdmVyXG4gIH1cblxuICAvKipcbiAqIEBwYXJhbSB7RWxlbWVudHxIVE1MRm9ybUVsZW1lbnR9IGVsdFxuICogQHBhcmFtIHtIdHRwVmVyYn0gdmVyYlxuICogQHJldHVybnMge3tlcnJvcnM6IEh0bXhFbGVtZW50VmFsaWRhdGlvbkVycm9yW10sIGZvcm1EYXRhOiBGb3JtRGF0YSwgdmFsdWVzOiBPYmplY3R9fVxuICovXG4gIGZ1bmN0aW9uIGdldElucHV0VmFsdWVzKGVsdCwgdmVyYikge1xuICAgIC8qKiBAdHlwZSBFbGVtZW50W10gKi9cbiAgICBjb25zdCBwcm9jZXNzZWQgPSBbXVxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBjb25zdCBwcmlvcml0eUZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICAvKiogQHR5cGUgSHRteEVsZW1lbnRWYWxpZGF0aW9uRXJyb3JbXSAqL1xuICAgIGNvbnN0IGVycm9ycyA9IFtdXG4gICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKGVsdClcbiAgICBpZiAoaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkICYmICFib2R5Q29udGFpbnMoaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkKSkge1xuICAgICAgaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkID0gbnVsbFxuICAgIH1cblxuICAgIC8vIG9ubHkgdmFsaWRhdGUgd2hlbiBmb3JtIGlzIGRpcmVjdGx5IHN1Ym1pdHRlZCBhbmQgbm92YWxpZGF0ZSBvciBmb3Jtbm92YWxpZGF0ZSBhcmUgbm90IHNldFxuICAgIC8vIG9yIGlmIHRoZSBlbGVtZW50IGhhcyBhbiBleHBsaWNpdCBoeC12YWxpZGF0ZT1cInRydWVcIiBvbiBpdFxuICAgIGxldCB2YWxpZGF0ZSA9IChlbHQgaW5zdGFuY2VvZiBIVE1MRm9ybUVsZW1lbnQgJiYgZWx0Lm5vVmFsaWRhdGUgIT09IHRydWUpIHx8IGdldEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LXZhbGlkYXRlJykgPT09ICd0cnVlJ1xuICAgIGlmIChpbnRlcm5hbERhdGEubGFzdEJ1dHRvbkNsaWNrZWQpIHtcbiAgICAgIHZhbGlkYXRlID0gdmFsaWRhdGUgJiYgaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkLmZvcm1Ob1ZhbGlkYXRlICE9PSB0cnVlXG4gICAgfVxuXG4gICAgLy8gZm9yIGEgbm9uLUdFVCBpbmNsdWRlIHRoZSByZWxhdGVkIGZvcm0sIHdoaWNoIG1heSBvciBtYXkgbm90IGJlIGEgcGFyZW50IGVsZW1lbnQgb2YgZWx0XG4gICAgaWYgKHZlcmIgIT09ICdnZXQnKSB7XG4gICAgICBwcm9jZXNzSW5wdXRWYWx1ZShwcm9jZXNzZWQsIHByaW9yaXR5Rm9ybURhdGEsIGVycm9ycywgZ2V0UmVsYXRlZEZvcm0oZWx0KSwgdmFsaWRhdGUpXG4gICAgfVxuXG4gICAgLy8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGZcbiAgICBwcm9jZXNzSW5wdXRWYWx1ZShwcm9jZXNzZWQsIGZvcm1EYXRhLCBlcnJvcnMsIGVsdCwgdmFsaWRhdGUpXG5cbiAgICAvLyBpZiBhIGJ1dHRvbiBvciBzdWJtaXQgd2FzIGNsaWNrZWQgbGFzdCwgaW5jbHVkZSBpdHMgdmFsdWVcbiAgICBpZiAoaW50ZXJuYWxEYXRhLmxhc3RCdXR0b25DbGlja2VkIHx8IGVsdC50YWdOYW1lID09PSAnQlVUVE9OJyB8fFxuICAgIChlbHQudGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiBnZXRSYXdBdHRyaWJ1dGUoZWx0LCAndHlwZScpID09PSAnc3VibWl0JykpIHtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9IGludGVybmFsRGF0YS5sYXN0QnV0dG9uQ2xpY2tlZCB8fCAoLyoqIEB0eXBlIEhUTUxJbnB1dEVsZW1lbnR8SFRNTEJ1dHRvbkVsZW1lbnQgKi8oZWx0KSlcbiAgICAgIGNvbnN0IG5hbWUgPSBnZXRSYXdBdHRyaWJ1dGUoYnV0dG9uLCAnbmFtZScpXG4gICAgICBhZGRWYWx1ZVRvRm9ybURhdGEobmFtZSwgYnV0dG9uLnZhbHVlLCBwcmlvcml0eUZvcm1EYXRhKVxuICAgIH1cblxuICAgIC8vIGluY2x1ZGUgYW55IGV4cGxpY2l0IGluY2x1ZGVzXG4gICAgY29uc3QgaW5jbHVkZXMgPSBmaW5kQXR0cmlidXRlVGFyZ2V0cyhlbHQsICdoeC1pbmNsdWRlJylcbiAgICBmb3JFYWNoKGluY2x1ZGVzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICBwcm9jZXNzSW5wdXRWYWx1ZShwcm9jZXNzZWQsIGZvcm1EYXRhLCBlcnJvcnMsIGFzRWxlbWVudChub2RlKSwgdmFsaWRhdGUpXG4gICAgICAvLyBpZiBhIG5vbi1mb3JtIGlzIGluY2x1ZGVkLCBpbmNsdWRlIGFueSBpbnB1dCB2YWx1ZXMgd2l0aGluIGl0XG4gICAgICBpZiAoIW1hdGNoZXMobm9kZSwgJ2Zvcm0nKSkge1xuICAgICAgICBmb3JFYWNoKGFzUGFyZW50Tm9kZShub2RlKS5xdWVyeVNlbGVjdG9yQWxsKElOUFVUX1NFTEVDVE9SKSwgZnVuY3Rpb24oZGVzY2VuZGFudCkge1xuICAgICAgICAgIHByb2Nlc3NJbnB1dFZhbHVlKHByb2Nlc3NlZCwgZm9ybURhdGEsIGVycm9ycywgZGVzY2VuZGFudCwgdmFsaWRhdGUpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIHZhbHVlcyBmcm9tIGEgPGZvcm0+IHRha2UgcHJlY2VkZW5jZSwgb3ZlcnJpZGluZyB0aGUgcmVndWxhciB2YWx1ZXNcbiAgICBvdmVycmlkZUZvcm1EYXRhKGZvcm1EYXRhLCBwcmlvcml0eUZvcm1EYXRhKVxuXG4gICAgcmV0dXJuIHsgZXJyb3JzLCBmb3JtRGF0YSwgdmFsdWVzOiBmb3JtRGF0YVByb3h5KGZvcm1EYXRhKSB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJldHVyblN0clxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge2FueX0gcmVhbFZhbHVlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBmdW5jdGlvbiBhcHBlbmRQYXJhbShyZXR1cm5TdHIsIG5hbWUsIHJlYWxWYWx1ZSkge1xuICAgIGlmIChyZXR1cm5TdHIgIT09ICcnKSB7XG4gICAgICByZXR1cm5TdHIgKz0gJyYnXG4gICAgfVxuICAgIGlmIChTdHJpbmcocmVhbFZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgIHJlYWxWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KHJlYWxWYWx1ZSlcbiAgICB9XG4gICAgY29uc3QgcyA9IGVuY29kZVVSSUNvbXBvbmVudChyZWFsVmFsdWUpXG4gICAgcmV0dXJuU3RyICs9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIHNcbiAgICByZXR1cm4gcmV0dXJuU3RyXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGb3JtRGF0YXxPYmplY3R9IHZhbHVlc1xuICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICovXG4gIGZ1bmN0aW9uIHVybEVuY29kZSh2YWx1ZXMpIHtcbiAgICB2YWx1ZXMgPSBmb3JtRGF0YUZyb21PYmplY3QodmFsdWVzKVxuICAgIGxldCByZXR1cm5TdHIgPSAnJ1xuICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIHJldHVyblN0ciA9IGFwcGVuZFBhcmFtKHJldHVyblN0ciwga2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiByZXR1cm5TdHJcbiAgfVxuXG4gIC8vPSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEFqYXhcbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvKipcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtzdHJpbmd9IHByb21wdFxuICogQHJldHVybnMge0h0bXhIZWFkZXJTcGVjaWZpY2F0aW9ufVxuICovXG4gIGZ1bmN0aW9uIGdldEhlYWRlcnMoZWx0LCB0YXJnZXQsIHByb21wdCkge1xuICAgIC8qKiBAdHlwZSBIdG14SGVhZGVyU3BlY2lmaWNhdGlvbiAqL1xuICAgIGNvbnN0IGhlYWRlcnMgPSB7XG4gICAgICAnSFgtUmVxdWVzdCc6ICd0cnVlJyxcbiAgICAgICdIWC1UcmlnZ2VyJzogZ2V0UmF3QXR0cmlidXRlKGVsdCwgJ2lkJyksXG4gICAgICAnSFgtVHJpZ2dlci1OYW1lJzogZ2V0UmF3QXR0cmlidXRlKGVsdCwgJ25hbWUnKSxcbiAgICAgICdIWC1UYXJnZXQnOiBnZXRBdHRyaWJ1dGVWYWx1ZSh0YXJnZXQsICdpZCcpLFxuICAgICAgJ0hYLUN1cnJlbnQtVVJMJzogbG9jYXRpb24uaHJlZlxuICAgIH1cbiAgICBnZXRWYWx1ZXNGb3JFbGVtZW50KGVsdCwgJ2h4LWhlYWRlcnMnLCBmYWxzZSwgaGVhZGVycylcbiAgICBpZiAocHJvbXB0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGhlYWRlcnNbJ0hYLVByb21wdCddID0gcHJvbXB0XG4gICAgfVxuICAgIGlmIChnZXRJbnRlcm5hbERhdGEoZWx0KS5ib29zdGVkKSB7XG4gICAgICBoZWFkZXJzWydIWC1Cb29zdGVkJ10gPSAndHJ1ZSdcbiAgICB9XG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIC8qKlxuICogZmlsdGVyVmFsdWVzIHRha2VzIGFuIG9iamVjdCBjb250YWluaW5nIGZvcm0gaW5wdXQgdmFsdWVzXG4gKiBhbmQgcmV0dXJucyBhIG5ldyBvYmplY3QgdGhhdCBvbmx5IGNvbnRhaW5zIGtleXMgdGhhdCBhcmVcbiAqIHNwZWNpZmllZCBieSB0aGUgY2xvc2VzdCBcImh4LXBhcmFtc1wiIGF0dHJpYnV0ZVxuICogQHBhcmFtIHtGb3JtRGF0YX0gaW5wdXRWYWx1ZXNcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gKiBAcmV0dXJucyB7Rm9ybURhdGF9XG4gKi9cbiAgZnVuY3Rpb24gZmlsdGVyVmFsdWVzKGlucHV0VmFsdWVzLCBlbHQpIHtcbiAgICBjb25zdCBwYXJhbXNWYWx1ZSA9IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC1wYXJhbXMnKVxuICAgIGlmIChwYXJhbXNWYWx1ZSkge1xuICAgICAgaWYgKHBhcmFtc1ZhbHVlID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGb3JtRGF0YSgpXG4gICAgICB9IGVsc2UgaWYgKHBhcmFtc1ZhbHVlID09PSAnKicpIHtcbiAgICAgICAgcmV0dXJuIGlucHV0VmFsdWVzXG4gICAgICB9IGVsc2UgaWYgKHBhcmFtc1ZhbHVlLmluZGV4T2YoJ25vdCAnKSA9PT0gMCkge1xuICAgICAgICBmb3JFYWNoKHBhcmFtc1ZhbHVlLnNsaWNlKDQpLnNwbGl0KCcsJyksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS50cmltKClcbiAgICAgICAgICBpbnB1dFZhbHVlcy5kZWxldGUobmFtZSlcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGlucHV0VmFsdWVzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgICBmb3JFYWNoKHBhcmFtc1ZhbHVlLnNwbGl0KCcsJyksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS50cmltKClcbiAgICAgICAgICBpZiAoaW5wdXRWYWx1ZXMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICBpbnB1dFZhbHVlcy5nZXRBbGwobmFtZSkuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBuZXdWYWx1ZXMuYXBwZW5kKG5hbWUsIHZhbHVlKSB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlc1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW5wdXRWYWx1ZXNcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGZ1bmN0aW9uIGlzQW5jaG9yTGluayhlbHQpIHtcbiAgICByZXR1cm4gISFnZXRSYXdBdHRyaWJ1dGUoZWx0LCAnaHJlZicpICYmIGdldFJhd0F0dHJpYnV0ZShlbHQsICdocmVmJykuaW5kZXhPZignIycpID49IDBcbiAgfVxuXG4gIC8qKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAqIEBwYXJhbSB7SHRteFN3YXBTdHlsZX0gW3N3YXBJbmZvT3ZlcnJpZGVdXG4gKiBAcmV0dXJucyB7SHRteFN3YXBTcGVjaWZpY2F0aW9ufVxuICovXG4gIGZ1bmN0aW9uIGdldFN3YXBTcGVjaWZpY2F0aW9uKGVsdCwgc3dhcEluZm9PdmVycmlkZSkge1xuICAgIGNvbnN0IHN3YXBJbmZvID0gc3dhcEluZm9PdmVycmlkZSB8fCBnZXRDbG9zZXN0QXR0cmlidXRlVmFsdWUoZWx0LCAnaHgtc3dhcCcpXG4gICAgLyoqIEB0eXBlIEh0bXhTd2FwU3BlY2lmaWNhdGlvbiAqL1xuICAgIGNvbnN0IHN3YXBTcGVjID0ge1xuICAgICAgc3dhcFN0eWxlOiBnZXRJbnRlcm5hbERhdGEoZWx0KS5ib29zdGVkID8gJ2lubmVySFRNTCcgOiBodG14LmNvbmZpZy5kZWZhdWx0U3dhcFN0eWxlLFxuICAgICAgc3dhcERlbGF5OiBodG14LmNvbmZpZy5kZWZhdWx0U3dhcERlbGF5LFxuICAgICAgc2V0dGxlRGVsYXk6IGh0bXguY29uZmlnLmRlZmF1bHRTZXR0bGVEZWxheVxuICAgIH1cbiAgICBpZiAoaHRteC5jb25maWcuc2Nyb2xsSW50b1ZpZXdPbkJvb3N0ICYmIGdldEludGVybmFsRGF0YShlbHQpLmJvb3N0ZWQgJiYgIWlzQW5jaG9yTGluayhlbHQpKSB7XG4gICAgICBzd2FwU3BlYy5zaG93ID0gJ3RvcCdcbiAgICB9XG4gICAgaWYgKHN3YXBJbmZvKSB7XG4gICAgICBjb25zdCBzcGxpdCA9IHNwbGl0T25XaGl0ZXNwYWNlKHN3YXBJbmZvKVxuICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gc3BsaXRbaV1cbiAgICAgICAgICBpZiAodmFsdWUuaW5kZXhPZignc3dhcDonKSA9PT0gMCkge1xuICAgICAgICAgICAgc3dhcFNwZWMuc3dhcERlbGF5ID0gcGFyc2VJbnRlcnZhbCh2YWx1ZS5zbGljZSg1KSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmluZGV4T2YoJ3NldHRsZTonKSA9PT0gMCkge1xuICAgICAgICAgICAgc3dhcFNwZWMuc2V0dGxlRGVsYXkgPSBwYXJzZUludGVydmFsKHZhbHVlLnNsaWNlKDcpKVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUuaW5kZXhPZigndHJhbnNpdGlvbjonKSA9PT0gMCkge1xuICAgICAgICAgICAgc3dhcFNwZWMudHJhbnNpdGlvbiA9IHZhbHVlLnNsaWNlKDExKSA9PT0gJ3RydWUnXG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5pbmRleE9mKCdpZ25vcmVUaXRsZTonKSA9PT0gMCkge1xuICAgICAgICAgICAgc3dhcFNwZWMuaWdub3JlVGl0bGUgPSB2YWx1ZS5zbGljZSgxMikgPT09ICd0cnVlJ1xuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUuaW5kZXhPZignc2Nyb2xsOicpID09PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxTcGVjID0gdmFsdWUuc2xpY2UoNylcbiAgICAgICAgICAgIHZhciBzcGxpdFNwZWMgPSBzY3JvbGxTcGVjLnNwbGl0KCc6JylcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFZhbCA9IHNwbGl0U3BlYy5wb3AoKVxuICAgICAgICAgICAgdmFyIHNlbGVjdG9yVmFsID0gc3BsaXRTcGVjLmxlbmd0aCA+IDAgPyBzcGxpdFNwZWMuam9pbignOicpIDogbnVsbFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgc3dhcFNwZWMuc2Nyb2xsID0gc2Nyb2xsVmFsXG4gICAgICAgICAgICBzd2FwU3BlYy5zY3JvbGxUYXJnZXQgPSBzZWxlY3RvclZhbFxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUuaW5kZXhPZignc2hvdzonKSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3Qgc2hvd1NwZWMgPSB2YWx1ZS5zbGljZSg1KVxuICAgICAgICAgICAgdmFyIHNwbGl0U3BlYyA9IHNob3dTcGVjLnNwbGl0KCc6JylcbiAgICAgICAgICAgIGNvbnN0IHNob3dWYWwgPSBzcGxpdFNwZWMucG9wKClcbiAgICAgICAgICAgIHZhciBzZWxlY3RvclZhbCA9IHNwbGl0U3BlYy5sZW5ndGggPiAwID8gc3BsaXRTcGVjLmpvaW4oJzonKSA6IG51bGxcbiAgICAgICAgICAgIHN3YXBTcGVjLnNob3cgPSBzaG93VmFsXG4gICAgICAgICAgICBzd2FwU3BlYy5zaG93VGFyZ2V0ID0gc2VsZWN0b3JWYWxcbiAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlLmluZGV4T2YoJ2ZvY3VzLXNjcm9sbDonKSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgZm9jdXNTY3JvbGxWYWwgPSB2YWx1ZS5zbGljZSgnZm9jdXMtc2Nyb2xsOicubGVuZ3RoKVxuICAgICAgICAgICAgc3dhcFNwZWMuZm9jdXNTY3JvbGwgPSBmb2N1c1Njcm9sbFZhbCA9PSAndHJ1ZSdcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT0gMCkge1xuICAgICAgICAgICAgc3dhcFNwZWMuc3dhcFN0eWxlID0gdmFsdWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nRXJyb3IoJ1Vua25vd24gbW9kaWZpZXIgaW4gaHgtc3dhcDogJyArIHZhbHVlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3dhcFNwZWNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gdXNlc0Zvcm1EYXRhKGVsdCkge1xuICAgIHJldHVybiBnZXRDbG9zZXN0QXR0cmlidXRlVmFsdWUoZWx0LCAnaHgtZW5jb2RpbmcnKSA9PT0gJ211bHRpcGFydC9mb3JtLWRhdGEnIHx8XG4gICAgKG1hdGNoZXMoZWx0LCAnZm9ybScpICYmIGdldFJhd0F0dHJpYnV0ZShlbHQsICdlbmN0eXBlJykgPT09ICdtdWx0aXBhcnQvZm9ybS1kYXRhJylcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fSB4aHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtGb3JtRGF0YX0gZmlsdGVyZWRQYXJhbWV0ZXJzXG4gICAqIEByZXR1cm5zIHsqfHN0cmluZ3xudWxsfVxuICAgKi9cbiAgZnVuY3Rpb24gZW5jb2RlUGFyYW1zRm9yQm9keSh4aHIsIGVsdCwgZmlsdGVyZWRQYXJhbWV0ZXJzKSB7XG4gICAgbGV0IGVuY29kZWRQYXJhbWV0ZXJzID0gbnVsbFxuICAgIHdpdGhFeHRlbnNpb25zKGVsdCwgZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgICBpZiAoZW5jb2RlZFBhcmFtZXRlcnMgPT0gbnVsbCkge1xuICAgICAgICBlbmNvZGVkUGFyYW1ldGVycyA9IGV4dGVuc2lvbi5lbmNvZGVQYXJhbWV0ZXJzKHhociwgZmlsdGVyZWRQYXJhbWV0ZXJzLCBlbHQpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAoZW5jb2RlZFBhcmFtZXRlcnMgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGVuY29kZWRQYXJhbWV0ZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1c2VzRm9ybURhdGEoZWx0KSkge1xuICAgICAgICAvLyBGb3JjZSBjb252ZXJzaW9uIHRvIGFuIGFjdHVhbCBGb3JtRGF0YSBvYmplY3QgaW4gY2FzZSBmaWx0ZXJlZFBhcmFtZXRlcnMgaXMgYSBmb3JtRGF0YVByb3h5XG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYmlnc2t5c29mdHdhcmUvaHRteC9pc3N1ZXMvMjMxN1xuICAgICAgICByZXR1cm4gb3ZlcnJpZGVGb3JtRGF0YShuZXcgRm9ybURhdGEoKSwgZm9ybURhdGFGcm9tT2JqZWN0KGZpbHRlcmVkUGFyYW1ldGVycykpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdXJsRW5jb2RlKGZpbHRlcmVkUGFyYW1ldGVycylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHJldHVybnMge0h0bXhTZXR0bGVJbmZvfVxuICovXG4gIGZ1bmN0aW9uIG1ha2VTZXR0bGVJbmZvKHRhcmdldCkge1xuICAgIHJldHVybiB7IHRhc2tzOiBbXSwgZWx0czogW3RhcmdldF0gfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudFtdfSBjb250ZW50XG4gICAqIEBwYXJhbSB7SHRteFN3YXBTcGVjaWZpY2F0aW9ufSBzd2FwU3BlY1xuICAgKi9cbiAgZnVuY3Rpb24gdXBkYXRlU2Nyb2xsU3RhdGUoY29udGVudCwgc3dhcFNwZWMpIHtcbiAgICBjb25zdCBmaXJzdCA9IGNvbnRlbnRbMF1cbiAgICBjb25zdCBsYXN0ID0gY29udGVudFtjb250ZW50Lmxlbmd0aCAtIDFdXG4gICAgaWYgKHN3YXBTcGVjLnNjcm9sbCkge1xuICAgICAgdmFyIHRhcmdldCA9IG51bGxcbiAgICAgIGlmIChzd2FwU3BlYy5zY3JvbGxUYXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0ID0gYXNFbGVtZW50KHF1ZXJ5U2VsZWN0b3JFeHQoZmlyc3QsIHN3YXBTcGVjLnNjcm9sbFRhcmdldCkpXG4gICAgICB9XG4gICAgICBpZiAoc3dhcFNwZWMuc2Nyb2xsID09PSAndG9wJyAmJiAoZmlyc3QgfHwgdGFyZ2V0KSkge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwgZmlyc3RcbiAgICAgICAgdGFyZ2V0LnNjcm9sbFRvcCA9IDBcbiAgICAgIH1cbiAgICAgIGlmIChzd2FwU3BlYy5zY3JvbGwgPT09ICdib3R0b20nICYmIChsYXN0IHx8IHRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IGxhc3RcbiAgICAgICAgdGFyZ2V0LnNjcm9sbFRvcCA9IHRhcmdldC5zY3JvbGxIZWlnaHRcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygc3dhcFNwZWMuc2Nyb2xsID09PSAnbnVtYmVyJykge1xuICAgICAgICBnZXRXaW5kb3coKS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAvKiogQHR5cGUgbnVtYmVyICovIChzd2FwU3BlYy5zY3JvbGwpKVxuICAgICAgICB9LCAwKSAvLyBuZXh0ICd0aWNrJywgc28gYnJvd3NlciBoYXMgdGltZSB0byByZW5kZXIgbGF5b3V0XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzd2FwU3BlYy5zaG93KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gbnVsbFxuICAgICAgaWYgKHN3YXBTcGVjLnNob3dUYXJnZXQpIHtcbiAgICAgICAgbGV0IHRhcmdldFN0ciA9IHN3YXBTcGVjLnNob3dUYXJnZXRcbiAgICAgICAgaWYgKHN3YXBTcGVjLnNob3dUYXJnZXQgPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgdGFyZ2V0U3RyID0gJ2JvZHknXG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0ID0gYXNFbGVtZW50KHF1ZXJ5U2VsZWN0b3JFeHQoZmlyc3QsIHRhcmdldFN0cikpXG4gICAgICB9XG4gICAgICBpZiAoc3dhcFNwZWMuc2hvdyA9PT0gJ3RvcCcgJiYgKGZpcnN0IHx8IHRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IGZpcnN0XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgRm9yIHNvbWUgcmVhc29uIHRzYyBkb2Vzbid0IHJlY29nbml6ZSBcImluc3RhbnRcIiBhcyBhIHZhbGlkIG9wdGlvbiBmb3Igbm93XG4gICAgICAgIHRhcmdldC5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnc3RhcnQnLCBiZWhhdmlvcjogaHRteC5jb25maWcuc2Nyb2xsQmVoYXZpb3IgfSlcbiAgICAgIH1cbiAgICAgIGlmIChzd2FwU3BlYy5zaG93ID09PSAnYm90dG9tJyAmJiAobGFzdCB8fCB0YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCBsYXN0XG4gICAgICAgIC8vIEB0cy1pZ25vcmUgRm9yIHNvbWUgcmVhc29uIHRzYyBkb2Vzbid0IHJlY29nbml6ZSBcImluc3RhbnRcIiBhcyBhIHZhbGlkIG9wdGlvbiBmb3Igbm93XG4gICAgICAgIHRhcmdldC5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnZW5kJywgYmVoYXZpb3I6IGh0bXguY29uZmlnLnNjcm9sbEJlaGF2aW9yIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICogQHBhcmFtIHtzdHJpbmd9IGF0dHJcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IGV2YWxBc0RlZmF1bHRcbiAqIEBwYXJhbSB7T2JqZWN0PX0gdmFsdWVzXG4gKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnRcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbiAgZnVuY3Rpb24gZ2V0VmFsdWVzRm9yRWxlbWVudChlbHQsIGF0dHIsIGV2YWxBc0RlZmF1bHQsIHZhbHVlcywgZXZlbnQpIHtcbiAgICBpZiAodmFsdWVzID09IG51bGwpIHtcbiAgICAgIHZhbHVlcyA9IHt9XG4gICAgfVxuICAgIGlmIChlbHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHZhbHVlc1xuICAgIH1cbiAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZSA9IGdldEF0dHJpYnV0ZVZhbHVlKGVsdCwgYXR0cilcbiAgICBpZiAoYXR0cmlidXRlVmFsdWUpIHtcbiAgICAgIGxldCBzdHIgPSBhdHRyaWJ1dGVWYWx1ZS50cmltKClcbiAgICAgIGxldCBldmFsdWF0ZVZhbHVlID0gZXZhbEFzRGVmYXVsdFxuICAgICAgaWYgKHN0ciA9PT0gJ3Vuc2V0Jykge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwKSB7XG4gICAgICAgIHN0ciA9IHN0ci5zbGljZSgxMSlcbiAgICAgICAgZXZhbHVhdGVWYWx1ZSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoc3RyLmluZGV4T2YoJ2pzOicpID09PSAwKSB7XG4gICAgICAgIHN0ciA9IHN0ci5zbGljZSgzKVxuICAgICAgICBldmFsdWF0ZVZhbHVlID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCd7JykgIT09IDApIHtcbiAgICAgICAgc3RyID0gJ3snICsgc3RyICsgJ30nXG4gICAgICB9XG4gICAgICBsZXQgdmFyc1ZhbHVlc1xuICAgICAgaWYgKGV2YWx1YXRlVmFsdWUpIHtcbiAgICAgICAgdmFyc1ZhbHVlcyA9IG1heWJlRXZhbChlbHQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uKCdldmVudCcsICdyZXR1cm4gKCcgKyBzdHIgKyAnKScpLmNhbGwoZWx0LCBldmVudClcbiAgICAgICAgICB9IGVsc2UgeyAvLyBhbGxvdyB3aW5kb3cuZXZlbnQgdG8gYmUgYWNjZXNzaWJsZVxuICAgICAgICAgICAgcmV0dXJuIEZ1bmN0aW9uKCdyZXR1cm4gKCcgKyBzdHIgKyAnKScpLmNhbGwoZWx0KVxuICAgICAgICAgIH1cbiAgICAgICAgfSwge30pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXJzVmFsdWVzID0gcGFyc2VKU09OKHN0cilcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3Qga2V5IGluIHZhcnNWYWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhcnNWYWx1ZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZXNba2V5XSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZXNba2V5XSA9IHZhcnNWYWx1ZXNba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZ2V0VmFsdWVzRm9yRWxlbWVudChhc0VsZW1lbnQocGFyZW50RWx0KGVsdCkpLCBhdHRyLCBldmFsQXNEZWZhdWx0LCB2YWx1ZXMsIGV2ZW50KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8c3RyaW5nfSBlbHRcbiAgICogQHBhcmFtIHsoKSA9PiBhbnl9IHRvRXZhbFxuICAgKiBAcGFyYW0ge2FueT19IGRlZmF1bHRWYWxcbiAgICogQHJldHVybnMge2FueX1cbiAgICovXG4gIGZ1bmN0aW9uIG1heWJlRXZhbChlbHQsIHRvRXZhbCwgZGVmYXVsdFZhbCkge1xuICAgIGlmIChodG14LmNvbmZpZy5hbGxvd0V2YWwpIHtcbiAgICAgIHJldHVybiB0b0V2YWwoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OmV2YWxEaXNhbGxvd2VkRXJyb3InKVxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWxcbiAgICB9XG4gIH1cblxuICAvKipcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnRcbiAqIEBwYXJhbSB7Kj89fSBleHByZXNzaW9uVmFyc1xuICogQHJldHVybnNcbiAqL1xuICBmdW5jdGlvbiBnZXRIWFZhcnNGb3JFbGVtZW50KGVsdCwgZXZlbnQsIGV4cHJlc3Npb25WYXJzKSB7XG4gICAgcmV0dXJuIGdldFZhbHVlc0ZvckVsZW1lbnQoZWx0LCAnaHgtdmFycycsIHRydWUsIGV4cHJlc3Npb25WYXJzLCBldmVudClcbiAgfVxuXG4gIC8qKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAqIEBwYXJhbSB7RXZlbnQ9fSBldmVudFxuICogQHBhcmFtIHsqPz19IGV4cHJlc3Npb25WYXJzXG4gKiBAcmV0dXJuc1xuICovXG4gIGZ1bmN0aW9uIGdldEhYVmFsc0ZvckVsZW1lbnQoZWx0LCBldmVudCwgZXhwcmVzc2lvblZhcnMpIHtcbiAgICByZXR1cm4gZ2V0VmFsdWVzRm9yRWxlbWVudChlbHQsICdoeC12YWxzJywgZmFsc2UsIGV4cHJlc3Npb25WYXJzLCBldmVudClcbiAgfVxuXG4gIC8qKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAqIEBwYXJhbSB7RXZlbnQ9fSBldmVudFxuICogQHJldHVybnMge0Zvcm1EYXRhfVxuICovXG4gIGZ1bmN0aW9uIGdldEV4cHJlc3Npb25WYXJzKGVsdCwgZXZlbnQpIHtcbiAgICByZXR1cm4gbWVyZ2VPYmplY3RzKGdldEhYVmFyc0ZvckVsZW1lbnQoZWx0LCBldmVudCksIGdldEhYVmFsc0ZvckVsZW1lbnQoZWx0LCBldmVudCkpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdH0geGhyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gaGVhZGVyVmFsdWVcbiAgICovXG4gIGZ1bmN0aW9uIHNhZmVseVNldEhlYWRlclZhbHVlKHhociwgaGVhZGVyLCBoZWFkZXJWYWx1ZSkge1xuICAgIGlmIChoZWFkZXJWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBoZWFkZXJWYWx1ZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE9uIGFuIGV4Y2VwdGlvbiwgdHJ5IHRvIHNldCB0aGUgaGVhZGVyIFVSSSBlbmNvZGVkIGluc3RlYWRcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBlbmNvZGVVUklDb21wb25lbnQoaGVhZGVyVmFsdWUpKVxuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIgKyAnLVVSSS1BdXRvRW5jb2RlZCcsICd0cnVlJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdH0geGhyXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGZ1bmN0aW9uIGdldFBhdGhGcm9tUmVzcG9uc2UoeGhyKSB7XG4gICAgaWYgKHhoci5yZXNwb25zZVVSTCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh4aHIucmVzcG9uc2VVUkwpXG4gICAgICAgIHJldHVybiB1cmwucGF0aG5hbWUgKyB1cmwuc2VhcmNoXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRyaWdnZXJFcnJvckV2ZW50KGdldERvY3VtZW50KCkuYm9keSwgJ2h0bXg6YmFkUmVzcG9uc2VVcmwnLCB7IHVybDogeGhyLnJlc3BvbnNlVVJMIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBoYXNIZWFkZXIoeGhyLCByZWdleHApIHtcbiAgICByZXR1cm4gcmVnZXhwLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKVxuICB9XG5cbiAgLyoqXG4gICAqIElzc3VlcyBhbiBodG14LXN0eWxlIEFKQVggcmVxdWVzdFxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNhamF4XG4gICAqXG4gICAqIEBwYXJhbSB7SHR0cFZlcmJ9IHZlcmJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggdGhlIFVSTCBwYXRoIHRvIG1ha2UgdGhlIEFKQVhcbiAgICogQHBhcmFtIHtFbGVtZW50fHN0cmluZ3xIdG14QWpheEhlbHBlckNvbnRleHR9IGNvbnRleHQgdGhlIGVsZW1lbnQgdG8gdGFyZ2V0IChkZWZhdWx0cyB0byB0aGUgKipib2R5KiopIHwgYSBzZWxlY3RvciBmb3IgdGhlIHRhcmdldCB8IGEgY29udGV4dCBvYmplY3QgdGhhdCBjb250YWlucyBhbnkgb2YgdGhlIGZvbGxvd2luZ1xuICAgKiBAcmV0dXJuIHtQcm9taXNlPHZvaWQ+fSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgaW1tZWRpYXRlbHkgaWYgbm8gcmVxdWVzdCBpcyBzZW50LCBvciB3aGVuIHRoZSByZXF1ZXN0IGlzIGNvbXBsZXRlXG4gICAqL1xuICBmdW5jdGlvbiBhamF4SGVscGVyKHZlcmIsIHBhdGgsIGNvbnRleHQpIHtcbiAgICB2ZXJiID0gKC8qKiBAdHlwZSBIdHRwVmVyYiAqLyh2ZXJiLnRvTG93ZXJDYXNlKCkpKVxuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBpZiAoY29udGV4dCBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgdHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBpc3N1ZUFqYXhSZXF1ZXN0KHZlcmIsIHBhdGgsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICB0YXJnZXRPdmVycmlkZTogcmVzb2x2ZVRhcmdldChjb250ZXh0KSB8fCBEVU1NWV9FTFQsXG4gICAgICAgICAgcmV0dXJuUHJvbWlzZTogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHJlc29sdmVkVGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChjb250ZXh0LnRhcmdldClcbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIHN1cHBsaWVkIGJ1dCBjYW4ndCByZXNvbHZlIE9SIHNvdXJjZSBpcyBzdXBwbGllZCBidXQgYm90aCB0YXJnZXQgYW5kIHNvdXJjZSBjYW4ndCBiZSByZXNvbHZlZFxuICAgICAgICAvLyB0aGVuIHVzZSBEVU1NWV9FTFQgdG8gYWJvcnQgdGhlIHJlcXVlc3Qgd2l0aCBodG14OnRhcmdldEVycm9yIHRvIGF2b2lkIGl0IHJlcGxhY2luZyBib2R5IGJ5IG1pc3Rha2VcbiAgICAgICAgaWYgKChjb250ZXh0LnRhcmdldCAmJiAhcmVzb2x2ZWRUYXJnZXQpIHx8IChjb250ZXh0LnNvdXJjZSAmJiAhcmVzb2x2ZWRUYXJnZXQgJiYgIXJlc29sdmVUYXJnZXQoY29udGV4dC5zb3VyY2UpKSkge1xuICAgICAgICAgIHJlc29sdmVkVGFyZ2V0ID0gRFVNTVlfRUxUXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzc3VlQWpheFJlcXVlc3QodmVyYiwgcGF0aCwgcmVzb2x2ZVRhcmdldChjb250ZXh0LnNvdXJjZSksIGNvbnRleHQuZXZlbnQsXG4gICAgICAgICAge1xuICAgICAgICAgICAgaGFuZGxlcjogY29udGV4dC5oYW5kbGVyLFxuICAgICAgICAgICAgaGVhZGVyczogY29udGV4dC5oZWFkZXJzLFxuICAgICAgICAgICAgdmFsdWVzOiBjb250ZXh0LnZhbHVlcyxcbiAgICAgICAgICAgIHRhcmdldE92ZXJyaWRlOiByZXNvbHZlZFRhcmdldCxcbiAgICAgICAgICAgIHN3YXBPdmVycmlkZTogY29udGV4dC5zd2FwLFxuICAgICAgICAgICAgc2VsZWN0OiBjb250ZXh0LnNlbGVjdCxcbiAgICAgICAgICAgIHJldHVyblByb21pc2U6IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaXNzdWVBamF4UmVxdWVzdCh2ZXJiLCBwYXRoLCBudWxsLCBudWxsLCB7XG4gICAgICAgIHJldHVyblByb21pc2U6IHRydWVcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEByZXR1cm4ge0VsZW1lbnRbXX1cbiAgICovXG4gIGZ1bmN0aW9uIGhpZXJhcmNoeUZvckVsdChlbHQpIHtcbiAgICBjb25zdCBhcnIgPSBbXVxuICAgIHdoaWxlIChlbHQpIHtcbiAgICAgIGFyci5wdXNoKGVsdClcbiAgICAgIGVsdCA9IGVsdC5wYXJlbnRFbGVtZW50XG4gICAgfVxuICAgIHJldHVybiBhcnJcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge0h0bXhSZXF1ZXN0Q29uZmlnfSByZXF1ZXN0Q29uZmlnXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiB2ZXJpZnlQYXRoKGVsdCwgcGF0aCwgcmVxdWVzdENvbmZpZykge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aCwgbG9jYXRpb24ucHJvdG9jb2wgIT09ICdhYm91dDonID8gbG9jYXRpb24uaHJlZiA6IHdpbmRvdy5vcmlnaW4pXG4gICAgY29uc3Qgb3JpZ2luID0gbG9jYXRpb24ucHJvdG9jb2wgIT09ICdhYm91dDonID8gbG9jYXRpb24ub3JpZ2luIDogd2luZG93Lm9yaWdpblxuICAgIGNvbnN0IHNhbWVIb3N0ID0gb3JpZ2luID09PSB1cmwub3JpZ2luXG5cbiAgICBpZiAoaHRteC5jb25maWcuc2VsZlJlcXVlc3RzT25seSkge1xuICAgICAgaWYgKCFzYW1lSG9zdCkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyaWdnZXJFdmVudChlbHQsICdodG14OnZhbGlkYXRlVXJsJywgbWVyZ2VPYmplY3RzKHsgdXJsLCBzYW1lSG9zdCB9LCByZXF1ZXN0Q29uZmlnKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdHxGb3JtRGF0YX0gb2JqXG4gICAqIEByZXR1cm4ge0Zvcm1EYXRhfVxuICAgKi9cbiAgZnVuY3Rpb24gZm9ybURhdGFGcm9tT2JqZWN0KG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBGb3JtRGF0YSkgcmV0dXJuIG9ialxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAob2JqW2tleV0gJiYgdHlwZW9mIG9ialtrZXldLmZvckVhY2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYmpba2V5XS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHsgZm9ybURhdGEuYXBwZW5kKGtleSwgdikgfSlcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmICEob2JqW2tleV0gaW5zdGFuY2VvZiBCbG9iKSkge1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChrZXksIEpTT04uc3RyaW5naWZ5KG9ialtrZXldKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCBvYmpba2V5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZm9ybURhdGFcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zvcm1EYXRhfSBmb3JtRGF0YVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheVxuICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAqL1xuICBmdW5jdGlvbiBmb3JtRGF0YUFycmF5UHJveHkoZm9ybURhdGEsIG5hbWUsIGFycmF5KSB7XG4gICAgLy8gbXV0YXRpbmcgdGhlIGFycmF5IHNob3VsZCBtdXRhdGUgdGhlIHVuZGVybHlpbmcgZm9ybSBkYXRhXG4gICAgcmV0dXJuIG5ldyBQcm94eShhcnJheSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbih0YXJnZXQsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ251bWJlcicpIHJldHVybiB0YXJnZXRba2V5XVxuICAgICAgICBpZiAoa2V5ID09PSAnbGVuZ3RoJykgcmV0dXJuIHRhcmdldC5sZW5ndGhcbiAgICAgICAgaWYgKGtleSA9PT0gJ3B1c2gnKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0YXJnZXQucHVzaCh2YWx1ZSlcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKVxuICAgICAgICAgICAgZm9ybURhdGEuZGVsZXRlKG5hbWUpXG4gICAgICAgICAgICB0YXJnZXQuZm9yRWFjaChmdW5jdGlvbih2KSB7IGZvcm1EYXRhLmFwcGVuZChuYW1lLCB2KSB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YXJnZXRba2V5XSAmJiB0YXJnZXRba2V5XS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0W2tleV1bMF1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0W2tleV1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24odGFyZ2V0LCBpbmRleCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W2luZGV4XSA9IHZhbHVlXG4gICAgICAgIGZvcm1EYXRhLmRlbGV0ZShuYW1lKVxuICAgICAgICB0YXJnZXQuZm9yRWFjaChmdW5jdGlvbih2KSB7IGZvcm1EYXRhLmFwcGVuZChuYW1lLCB2KSB9KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGb3JtRGF0YX0gZm9ybURhdGFcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIGZvcm1EYXRhUHJveHkoZm9ybURhdGEpIHtcbiAgICByZXR1cm4gbmV3IFByb3h5KGZvcm1EYXRhLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgICAgLy8gRm9yd2FyZCBzeW1ib2wgY2FsbHMgdG8gdGhlIEZvcm1EYXRhIGl0c2VsZiBkaXJlY3RseVxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwgbmFtZSlcbiAgICAgICAgICAvLyBXcmFwIGluIGZ1bmN0aW9uIHdpdGggYXBwbHkgdG8gY29ycmVjdGx5IGJpbmQgdGhlIEZvcm1EYXRhIGNvbnRleHQsIGFzIGEgZGlyZWN0IGNhbGwgd291bGQgcmVzdWx0IGluIGFuIGlsbGVnYWwgaW52b2NhdGlvbiBlcnJvclxuICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQuYXBwbHkoZm9ybURhdGEsIGFyZ3VtZW50cylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PT0gJ3RvSlNPTicpIHtcbiAgICAgICAgICAvLyBTdXBwb3J0IEpTT04uc3RyaW5naWZ5IGNhbGwgb24gcHJveHlcbiAgICAgICAgICByZXR1cm4gKCkgPT4gT2JqZWN0LmZyb21FbnRyaWVzKGZvcm1EYXRhKVxuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lIGluIHRhcmdldCkge1xuICAgICAgICAgIC8vIFdyYXAgaW4gZnVuY3Rpb24gd2l0aCBhcHBseSB0byBjb3JyZWN0bHkgYmluZCB0aGUgRm9ybURhdGEgY29udGV4dCwgYXMgYSBkaXJlY3QgY2FsbCB3b3VsZCByZXN1bHQgaW4gYW4gaWxsZWdhbCBpbnZvY2F0aW9uIGVycm9yXG4gICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbbmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZvcm1EYXRhW25hbWVdLmFwcGx5KGZvcm1EYXRhLCBhcmd1bWVudHMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFycmF5ID0gZm9ybURhdGEuZ2V0QWxsKG5hbWUpXG4gICAgICAgIC8vIFRob3NlIDIgdW5kZWZpbmVkICYgc2luZ2xlIHZhbHVlIHJldHVybnMgYXJlIGZvciByZXRyby1jb21wYXRpYmlsaXR5IGFzIHdlIHdlcmVuJ3QgdXNpbmcgRm9ybURhdGEgYmVmb3JlXG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICAgIH0gZWxzZSBpZiAoYXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGFycmF5WzBdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZvcm1EYXRhQXJyYXlQcm94eSh0YXJnZXQsIG5hbWUsIGFycmF5KVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih0YXJnZXQsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQuZGVsZXRlKG5hbWUpXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHZhbHVlLmZvckVhY2goZnVuY3Rpb24odikgeyB0YXJnZXQuYXBwZW5kKG5hbWUsIHYpIH0pXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhKHZhbHVlIGluc3RhbmNlb2YgQmxvYikpIHtcbiAgICAgICAgICB0YXJnZXQuYXBwZW5kKG5hbWUsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9LFxuICAgICAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uKHRhcmdldCwgbmFtZSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGFyZ2V0LmRlbGV0ZShuYW1lKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9LFxuICAgICAgLy8gU3VwcG9ydCBPYmplY3QuYXNzaWduIGNhbGwgZnJvbSBwcm94eVxuICAgICAgb3duS2V5czogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXMoT2JqZWN0LmZyb21FbnRyaWVzKHRhcmdldCkpXG4gICAgICB9LFxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBmdW5jdGlvbih0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5mcm9tRW50cmllcyh0YXJnZXQpLCBwcm9wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtIdHRwVmVyYn0gdmVyYlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge0h0bXhBamF4RXRjfSBbZXRjXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjb25maXJtZWRdXG4gICAqIEByZXR1cm4ge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBmdW5jdGlvbiBpc3N1ZUFqYXhSZXF1ZXN0KHZlcmIsIHBhdGgsIGVsdCwgZXZlbnQsIGV0YywgY29uZmlybWVkKSB7XG4gICAgbGV0IHJlc29sdmUgPSBudWxsXG4gICAgbGV0IHJlamVjdCA9IG51bGxcbiAgICBldGMgPSBldGMgIT0gbnVsbCA/IGV0YyA6IHt9XG4gICAgaWYgKGV0Yy5yZXR1cm5Qcm9taXNlICYmIHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihfcmVzb2x2ZSwgX3JlamVjdCkge1xuICAgICAgICByZXNvbHZlID0gX3Jlc29sdmVcbiAgICAgICAgcmVqZWN0ID0gX3JlamVjdFxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKGVsdCA9PSBudWxsKSB7XG4gICAgICBlbHQgPSBnZXREb2N1bWVudCgpLmJvZHlcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VIYW5kbGVyID0gZXRjLmhhbmRsZXIgfHwgaGFuZGxlQWpheFJlc3BvbnNlXG4gICAgY29uc3Qgc2VsZWN0ID0gZXRjLnNlbGVjdCB8fCBudWxsXG5cbiAgICBpZiAoIWJvZHlDb250YWlucyhlbHQpKSB7XG4gICAgLy8gZG8gbm90IGlzc3VlIHJlcXVlc3RzIGZvciBlbGVtZW50cyByZW1vdmVkIGZyb20gdGhlIERPTVxuICAgICAgbWF5YmVDYWxsKHJlc29sdmUpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBjb25zdCB0YXJnZXQgPSBldGMudGFyZ2V0T3ZlcnJpZGUgfHwgYXNFbGVtZW50KGdldFRhcmdldChlbHQpKVxuICAgIGlmICh0YXJnZXQgPT0gbnVsbCB8fCB0YXJnZXQgPT0gRFVNTVlfRUxUKSB7XG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnRhcmdldEVycm9yJywgeyB0YXJnZXQ6IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC10YXJnZXQnKSB9KVxuICAgICAgbWF5YmVDYWxsKHJlamVjdClcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuXG4gICAgbGV0IGVsdERhdGEgPSBnZXRJbnRlcm5hbERhdGEoZWx0KVxuICAgIGNvbnN0IHN1Ym1pdHRlciA9IGVsdERhdGEubGFzdEJ1dHRvbkNsaWNrZWRcblxuICAgIGlmIChzdWJtaXR0ZXIpIHtcbiAgICAgIGNvbnN0IGJ1dHRvblBhdGggPSBnZXRSYXdBdHRyaWJ1dGUoc3VibWl0dGVyLCAnZm9ybWFjdGlvbicpXG4gICAgICBpZiAoYnV0dG9uUGF0aCAhPSBudWxsKSB7XG4gICAgICAgIHBhdGggPSBidXR0b25QYXRoXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJ1dHRvblZlcmIgPSBnZXRSYXdBdHRyaWJ1dGUoc3VibWl0dGVyLCAnZm9ybW1ldGhvZCcpXG4gICAgICBpZiAoYnV0dG9uVmVyYiAhPSBudWxsKSB7XG4gICAgICAgIGlmIChWRVJCUy5pbmNsdWRlcyhidXR0b25WZXJiLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgdmVyYiA9ICgvKiogQHR5cGUgSHR0cFZlcmIgKi8oYnV0dG9uVmVyYikpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF5YmVDYWxsKHJlc29sdmUpXG4gICAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpcm1RdWVzdGlvbiA9IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC1jb25maXJtJylcbiAgICAvLyBhbGxvdyBldmVudC1iYXNlZCBjb25maXJtYXRpb24gdy8gYSBjYWxsYmFja1xuICAgIGlmIChjb25maXJtZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaXNzdWVSZXF1ZXN0ID0gZnVuY3Rpb24oc2tpcENvbmZpcm1hdGlvbikge1xuICAgICAgICByZXR1cm4gaXNzdWVBamF4UmVxdWVzdCh2ZXJiLCBwYXRoLCBlbHQsIGV2ZW50LCBldGMsICEhc2tpcENvbmZpcm1hdGlvbilcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbmZpcm1EZXRhaWxzID0geyB0YXJnZXQsIGVsdCwgcGF0aCwgdmVyYiwgdHJpZ2dlcmluZ0V2ZW50OiBldmVudCwgZXRjLCBpc3N1ZVJlcXVlc3QsIHF1ZXN0aW9uOiBjb25maXJtUXVlc3Rpb24gfVxuICAgICAgaWYgKHRyaWdnZXJFdmVudChlbHQsICdodG14OmNvbmZpcm0nLCBjb25maXJtRGV0YWlscykgPT09IGZhbHNlKSB7XG4gICAgICAgIG1heWJlQ2FsbChyZXNvbHZlKVxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBzeW5jRWx0ID0gZWx0XG4gICAgbGV0IHN5bmNTdHJhdGVneSA9IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC1zeW5jJylcbiAgICBsZXQgcXVldWVTdHJhdGVneSA9IG51bGxcbiAgICBsZXQgYWJvcnRhYmxlID0gZmFsc2VcbiAgICBpZiAoc3luY1N0cmF0ZWd5KSB7XG4gICAgICBjb25zdCBzeW5jU3RyaW5ncyA9IHN5bmNTdHJhdGVneS5zcGxpdCgnOicpXG4gICAgICBjb25zdCBzZWxlY3RvciA9IHN5bmNTdHJpbmdzWzBdLnRyaW0oKVxuICAgICAgaWYgKHNlbGVjdG9yID09PSAndGhpcycpIHtcbiAgICAgICAgc3luY0VsdCA9IGZpbmRUaGlzRWxlbWVudChlbHQsICdoeC1zeW5jJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN5bmNFbHQgPSBhc0VsZW1lbnQocXVlcnlTZWxlY3RvckV4dChlbHQsIHNlbGVjdG9yKSlcbiAgICAgIH1cbiAgICAgIC8vIGRlZmF1bHQgdG8gdGhlIGRyb3Agc3RyYXRlZ3lcbiAgICAgIHN5bmNTdHJhdGVneSA9IChzeW5jU3RyaW5nc1sxXSB8fCAnZHJvcCcpLnRyaW0oKVxuICAgICAgZWx0RGF0YSA9IGdldEludGVybmFsRGF0YShzeW5jRWx0KVxuICAgICAgaWYgKHN5bmNTdHJhdGVneSA9PT0gJ2Ryb3AnICYmIGVsdERhdGEueGhyICYmIGVsdERhdGEuYWJvcnRhYmxlICE9PSB0cnVlKSB7XG4gICAgICAgIG1heWJlQ2FsbChyZXNvbHZlKVxuICAgICAgICByZXR1cm4gcHJvbWlzZVxuICAgICAgfSBlbHNlIGlmIChzeW5jU3RyYXRlZ3kgPT09ICdhYm9ydCcpIHtcbiAgICAgICAgaWYgKGVsdERhdGEueGhyKSB7XG4gICAgICAgICAgbWF5YmVDYWxsKHJlc29sdmUpXG4gICAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhYm9ydGFibGUgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3luY1N0cmF0ZWd5ID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgdHJpZ2dlckV2ZW50KHN5bmNFbHQsICdodG14OmFib3J0JykgLy8gYWJvcnQgdGhlIGN1cnJlbnQgcmVxdWVzdCBhbmQgY29udGludWVcbiAgICAgIH0gZWxzZSBpZiAoc3luY1N0cmF0ZWd5LmluZGV4T2YoJ3F1ZXVlJykgPT09IDApIHtcbiAgICAgICAgY29uc3QgcXVldWVTdHJBcnJheSA9IHN5bmNTdHJhdGVneS5zcGxpdCgnICcpXG4gICAgICAgIHF1ZXVlU3RyYXRlZ3kgPSAocXVldWVTdHJBcnJheVsxXSB8fCAnbGFzdCcpLnRyaW0oKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbHREYXRhLnhocikge1xuICAgICAgaWYgKGVsdERhdGEuYWJvcnRhYmxlKSB7XG4gICAgICAgIHRyaWdnZXJFdmVudChzeW5jRWx0LCAnaHRteDphYm9ydCcpIC8vIGFib3J0IHRoZSBjdXJyZW50IHJlcXVlc3QgYW5kIGNvbnRpbnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocXVldWVTdHJhdGVneSA9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBnZXRJbnRlcm5hbERhdGEoZXZlbnQpXG4gICAgICAgICAgICBpZiAoZXZlbnREYXRhICYmIGV2ZW50RGF0YS50cmlnZ2VyU3BlYyAmJiBldmVudERhdGEudHJpZ2dlclNwZWMucXVldWUpIHtcbiAgICAgICAgICAgICAgcXVldWVTdHJhdGVneSA9IGV2ZW50RGF0YS50cmlnZ2VyU3BlYy5xdWV1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocXVldWVTdHJhdGVneSA9PSBudWxsKSB7XG4gICAgICAgICAgICBxdWV1ZVN0cmF0ZWd5ID0gJ2xhc3QnXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlbHREYXRhLnF1ZXVlZFJlcXVlc3RzID09IG51bGwpIHtcbiAgICAgICAgICBlbHREYXRhLnF1ZXVlZFJlcXVlc3RzID0gW11cbiAgICAgICAgfVxuICAgICAgICBpZiAocXVldWVTdHJhdGVneSA9PT0gJ2ZpcnN0JyAmJiBlbHREYXRhLnF1ZXVlZFJlcXVlc3RzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGVsdERhdGEucXVldWVkUmVxdWVzdHMucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlzc3VlQWpheFJlcXVlc3QodmVyYiwgcGF0aCwgZWx0LCBldmVudCwgZXRjKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSBpZiAocXVldWVTdHJhdGVneSA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICBlbHREYXRhLnF1ZXVlZFJlcXVlc3RzLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpc3N1ZUFqYXhSZXF1ZXN0KHZlcmIsIHBhdGgsIGVsdCwgZXZlbnQsIGV0YylcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKHF1ZXVlU3RyYXRlZ3kgPT09ICdsYXN0Jykge1xuICAgICAgICAgIGVsdERhdGEucXVldWVkUmVxdWVzdHMgPSBbXSAvLyBkdW1wIGV4aXN0aW5nIHF1ZXVlXG4gICAgICAgICAgZWx0RGF0YS5xdWV1ZWRSZXF1ZXN0cy5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXNzdWVBamF4UmVxdWVzdCh2ZXJiLCBwYXRoLCBlbHQsIGV2ZW50LCBldGMpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBtYXliZUNhbGwocmVzb2x2ZSlcbiAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIGVsdERhdGEueGhyID0geGhyXG4gICAgZWx0RGF0YS5hYm9ydGFibGUgPSBhYm9ydGFibGVcbiAgICBjb25zdCBlbmRSZXF1ZXN0TG9jayA9IGZ1bmN0aW9uKCkge1xuICAgICAgZWx0RGF0YS54aHIgPSBudWxsXG4gICAgICBlbHREYXRhLmFib3J0YWJsZSA9IGZhbHNlXG4gICAgICBpZiAoZWx0RGF0YS5xdWV1ZWRSZXF1ZXN0cyAhPSBudWxsICYmXG4gICAgICBlbHREYXRhLnF1ZXVlZFJlcXVlc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgcXVldWVkUmVxdWVzdCA9IGVsdERhdGEucXVldWVkUmVxdWVzdHMuc2hpZnQoKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0KClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcHJvbXB0UXVlc3Rpb24gPSBnZXRDbG9zZXN0QXR0cmlidXRlVmFsdWUoZWx0LCAnaHgtcHJvbXB0JylcbiAgICBpZiAocHJvbXB0UXVlc3Rpb24pIHtcbiAgICAgIHZhciBwcm9tcHRSZXNwb25zZSA9IHByb21wdChwcm9tcHRRdWVzdGlvbilcbiAgICAgIC8vIHByb21wdCByZXR1cm5zIG51bGwgaWYgY2FuY2VsbGVkIGFuZCBlbXB0eSBzdHJpbmcgaWYgYWNjZXB0ZWQgd2l0aCBubyBlbnRyeVxuICAgICAgaWYgKHByb21wdFJlc3BvbnNlID09PSBudWxsIHx8XG4gICAgICAhdHJpZ2dlckV2ZW50KGVsdCwgJ2h0bXg6cHJvbXB0JywgeyBwcm9tcHQ6IHByb21wdFJlc3BvbnNlLCB0YXJnZXQgfSkpIHtcbiAgICAgICAgbWF5YmVDYWxsKHJlc29sdmUpXG4gICAgICAgIGVuZFJlcXVlc3RMb2NrKClcbiAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29uZmlybVF1ZXN0aW9uICYmICFjb25maXJtZWQpIHtcbiAgICAgIGlmICghY29uZmlybShjb25maXJtUXVlc3Rpb24pKSB7XG4gICAgICAgIG1heWJlQ2FsbChyZXNvbHZlKVxuICAgICAgICBlbmRSZXF1ZXN0TG9jaygpXG4gICAgICAgIHJldHVybiBwcm9taXNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGhlYWRlcnMgPSBnZXRIZWFkZXJzKGVsdCwgdGFyZ2V0LCBwcm9tcHRSZXNwb25zZSlcblxuICAgIGlmICh2ZXJiICE9PSAnZ2V0JyAmJiAhdXNlc0Zvcm1EYXRhKGVsdCkpIHtcbiAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbiAgICB9XG5cbiAgICBpZiAoZXRjLmhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMgPSBtZXJnZU9iamVjdHMoaGVhZGVycywgZXRjLmhlYWRlcnMpXG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdHMgPSBnZXRJbnB1dFZhbHVlcyhlbHQsIHZlcmIpXG4gICAgbGV0IGVycm9ycyA9IHJlc3VsdHMuZXJyb3JzXG4gICAgY29uc3QgcmF3Rm9ybURhdGEgPSByZXN1bHRzLmZvcm1EYXRhXG4gICAgaWYgKGV0Yy52YWx1ZXMpIHtcbiAgICAgIG92ZXJyaWRlRm9ybURhdGEocmF3Rm9ybURhdGEsIGZvcm1EYXRhRnJvbU9iamVjdChldGMudmFsdWVzKSlcbiAgICB9XG4gICAgY29uc3QgZXhwcmVzc2lvblZhcnMgPSBmb3JtRGF0YUZyb21PYmplY3QoZ2V0RXhwcmVzc2lvblZhcnMoZWx0LCBldmVudCkpXG4gICAgY29uc3QgYWxsRm9ybURhdGEgPSBvdmVycmlkZUZvcm1EYXRhKHJhd0Zvcm1EYXRhLCBleHByZXNzaW9uVmFycylcbiAgICBsZXQgZmlsdGVyZWRGb3JtRGF0YSA9IGZpbHRlclZhbHVlcyhhbGxGb3JtRGF0YSwgZWx0KVxuXG4gICAgaWYgKGh0bXguY29uZmlnLmdldENhY2hlQnVzdGVyUGFyYW0gJiYgdmVyYiA9PT0gJ2dldCcpIHtcbiAgICAgIGZpbHRlcmVkRm9ybURhdGEuc2V0KCdvcmcuaHRteC5jYWNoZS1idXN0ZXInLCBnZXRSYXdBdHRyaWJ1dGUodGFyZ2V0LCAnaWQnKSB8fCAndHJ1ZScpXG4gICAgfVxuXG4gICAgLy8gYmVoYXZpb3Igb2YgYW5jaG9ycyB3LyBlbXB0eSBocmVmIGlzIHRvIHVzZSB0aGUgY3VycmVudCBVUkxcbiAgICBpZiAocGF0aCA9PSBudWxsIHx8IHBhdGggPT09ICcnKSB7XG4gICAgICBwYXRoID0gbG9jYXRpb24uaHJlZlxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBbY3JlZGVudGlhbHNdXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt0aW1lb3V0XVxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW25vSGVhZGVyc11cbiAgICAgKi9cbiAgICBjb25zdCByZXF1ZXN0QXR0clZhbHVlcyA9IGdldFZhbHVlc0ZvckVsZW1lbnQoZWx0LCAnaHgtcmVxdWVzdCcpXG5cbiAgICBjb25zdCBlbHRJc0Jvb3N0ZWQgPSBnZXRJbnRlcm5hbERhdGEoZWx0KS5ib29zdGVkXG5cbiAgICBsZXQgdXNlVXJsUGFyYW1zID0gaHRteC5jb25maWcubWV0aG9kc1RoYXRVc2VVcmxQYXJhbXMuaW5kZXhPZih2ZXJiKSA+PSAwXG5cbiAgICAvKiogQHR5cGUgSHRteFJlcXVlc3RDb25maWcgKi9cbiAgICBjb25zdCByZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgYm9vc3RlZDogZWx0SXNCb29zdGVkLFxuICAgICAgdXNlVXJsUGFyYW1zLFxuICAgICAgZm9ybURhdGE6IGZpbHRlcmVkRm9ybURhdGEsXG4gICAgICBwYXJhbWV0ZXJzOiBmb3JtRGF0YVByb3h5KGZpbHRlcmVkRm9ybURhdGEpLFxuICAgICAgdW5maWx0ZXJlZEZvcm1EYXRhOiBhbGxGb3JtRGF0YSxcbiAgICAgIHVuZmlsdGVyZWRQYXJhbWV0ZXJzOiBmb3JtRGF0YVByb3h5KGFsbEZvcm1EYXRhKSxcbiAgICAgIGhlYWRlcnMsXG4gICAgICBlbHQsXG4gICAgICB0YXJnZXQsXG4gICAgICB2ZXJiLFxuICAgICAgZXJyb3JzLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiBldGMuY3JlZGVudGlhbHMgfHwgcmVxdWVzdEF0dHJWYWx1ZXMuY3JlZGVudGlhbHMgfHwgaHRteC5jb25maWcud2l0aENyZWRlbnRpYWxzLFxuICAgICAgdGltZW91dDogZXRjLnRpbWVvdXQgfHwgcmVxdWVzdEF0dHJWYWx1ZXMudGltZW91dCB8fCBodG14LmNvbmZpZy50aW1lb3V0LFxuICAgICAgcGF0aCxcbiAgICAgIHRyaWdnZXJpbmdFdmVudDogZXZlbnRcbiAgICB9XG5cbiAgICBpZiAoIXRyaWdnZXJFdmVudChlbHQsICdodG14OmNvbmZpZ1JlcXVlc3QnLCByZXF1ZXN0Q29uZmlnKSkge1xuICAgICAgbWF5YmVDYWxsKHJlc29sdmUpXG4gICAgICBlbmRSZXF1ZXN0TG9jaygpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIC8vIGNvcHkgb3V0IGluIGNhc2UgdGhlIG9iamVjdCB3YXMgb3ZlcndyaXR0ZW5cbiAgICBwYXRoID0gcmVxdWVzdENvbmZpZy5wYXRoXG4gICAgdmVyYiA9IHJlcXVlc3RDb25maWcudmVyYlxuICAgIGhlYWRlcnMgPSByZXF1ZXN0Q29uZmlnLmhlYWRlcnNcbiAgICBmaWx0ZXJlZEZvcm1EYXRhID0gZm9ybURhdGFGcm9tT2JqZWN0KHJlcXVlc3RDb25maWcucGFyYW1ldGVycylcbiAgICBlcnJvcnMgPSByZXF1ZXN0Q29uZmlnLmVycm9yc1xuICAgIHVzZVVybFBhcmFtcyA9IHJlcXVlc3RDb25maWcudXNlVXJsUGFyYW1zXG5cbiAgICBpZiAoZXJyb3JzICYmIGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDp2YWxpZGF0aW9uOmhhbHRlZCcsIHJlcXVlc3RDb25maWcpXG4gICAgICBtYXliZUNhbGwocmVzb2x2ZSlcbiAgICAgIGVuZFJlcXVlc3RMb2NrKClcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuXG4gICAgY29uc3Qgc3BsaXRQYXRoID0gcGF0aC5zcGxpdCgnIycpXG4gICAgY29uc3QgcGF0aE5vQW5jaG9yID0gc3BsaXRQYXRoWzBdXG4gICAgY29uc3QgYW5jaG9yID0gc3BsaXRQYXRoWzFdXG5cbiAgICBsZXQgZmluYWxQYXRoID0gcGF0aFxuICAgIGlmICh1c2VVcmxQYXJhbXMpIHtcbiAgICAgIGZpbmFsUGF0aCA9IHBhdGhOb0FuY2hvclxuICAgICAgY29uc3QgaGFzVmFsdWVzID0gIWZpbHRlcmVkRm9ybURhdGEua2V5cygpLm5leHQoKS5kb25lXG4gICAgICBpZiAoaGFzVmFsdWVzKSB7XG4gICAgICAgIGlmIChmaW5hbFBhdGguaW5kZXhPZignPycpIDwgMCkge1xuICAgICAgICAgIGZpbmFsUGF0aCArPSAnPydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaW5hbFBhdGggKz0gJyYnXG4gICAgICAgIH1cbiAgICAgICAgZmluYWxQYXRoICs9IHVybEVuY29kZShmaWx0ZXJlZEZvcm1EYXRhKVxuICAgICAgICBpZiAoYW5jaG9yKSB7XG4gICAgICAgICAgZmluYWxQYXRoICs9ICcjJyArIGFuY2hvclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF2ZXJpZnlQYXRoKGVsdCwgZmluYWxQYXRoLCByZXF1ZXN0Q29uZmlnKSkge1xuICAgICAgdHJpZ2dlckVycm9yRXZlbnQoZWx0LCAnaHRteDppbnZhbGlkUGF0aCcsIHJlcXVlc3RDb25maWcpXG4gICAgICBtYXliZUNhbGwocmVqZWN0KVxuICAgICAgZW5kUmVxdWVzdExvY2soKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG5cbiAgICB4aHIub3Blbih2ZXJiLnRvVXBwZXJDYXNlKCksIGZpbmFsUGF0aCwgdHJ1ZSlcbiAgICB4aHIub3ZlcnJpZGVNaW1lVHlwZSgndGV4dC9odG1sJylcbiAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gcmVxdWVzdENvbmZpZy53aXRoQ3JlZGVudGlhbHNcbiAgICB4aHIudGltZW91dCA9IHJlcXVlc3RDb25maWcudGltZW91dFxuXG4gICAgLy8gcmVxdWVzdCBoZWFkZXJzXG4gICAgaWYgKHJlcXVlc3RBdHRyVmFsdWVzLm5vSGVhZGVycykge1xuICAgIC8vIGlnbm9yZSBhbGwgaGVhZGVyc1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGhlYWRlciBpbiBoZWFkZXJzKSB7XG4gICAgICAgIGlmIChoZWFkZXJzLmhhc093blByb3BlcnR5KGhlYWRlcikpIHtcbiAgICAgICAgICBjb25zdCBoZWFkZXJWYWx1ZSA9IGhlYWRlcnNbaGVhZGVyXVxuICAgICAgICAgIHNhZmVseVNldEhlYWRlclZhbHVlKHhociwgaGVhZGVyLCBoZWFkZXJWYWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBAdHlwZSB7SHRteFJlc3BvbnNlSW5mb30gKi9cbiAgICBjb25zdCByZXNwb25zZUluZm8gPSB7XG4gICAgICB4aHIsXG4gICAgICB0YXJnZXQsXG4gICAgICByZXF1ZXN0Q29uZmlnLFxuICAgICAgZXRjLFxuICAgICAgYm9vc3RlZDogZWx0SXNCb29zdGVkLFxuICAgICAgc2VsZWN0LFxuICAgICAgcGF0aEluZm86IHtcbiAgICAgICAgcmVxdWVzdFBhdGg6IHBhdGgsXG4gICAgICAgIGZpbmFsUmVxdWVzdFBhdGg6IGZpbmFsUGF0aCxcbiAgICAgICAgcmVzcG9uc2VQYXRoOiBudWxsLFxuICAgICAgICBhbmNob3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBoaWVyYXJjaHkgPSBoaWVyYXJjaHlGb3JFbHQoZWx0KVxuICAgICAgICByZXNwb25zZUluZm8ucGF0aEluZm8ucmVzcG9uc2VQYXRoID0gZ2V0UGF0aEZyb21SZXNwb25zZSh4aHIpXG4gICAgICAgIHJlc3BvbnNlSGFuZGxlcihlbHQsIHJlc3BvbnNlSW5mbylcbiAgICAgICAgaWYgKHJlc3BvbnNlSW5mby5rZWVwSW5kaWNhdG9ycyAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHJlbW92ZVJlcXVlc3RJbmRpY2F0b3JzKGluZGljYXRvcnMsIGRpc2FibGVFbHRzKVxuICAgICAgICB9XG4gICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OmFmdGVyUmVxdWVzdCcsIHJlc3BvbnNlSW5mbylcbiAgICAgICAgdHJpZ2dlckV2ZW50KGVsdCwgJ2h0bXg6YWZ0ZXJPbkxvYWQnLCByZXNwb25zZUluZm8pXG4gICAgICAgIC8vIGlmIHRoZSBib2R5IG5vIGxvbmdlciBjb250YWlucyB0aGUgZWxlbWVudCwgdHJpZ2dlciB0aGUgZXZlbnQgb24gdGhlIGNsb3Nlc3QgcGFyZW50XG4gICAgICAgIC8vIHJlbWFpbmluZyBpbiB0aGUgRE9NXG4gICAgICAgIGlmICghYm9keUNvbnRhaW5zKGVsdCkpIHtcbiAgICAgICAgICBsZXQgc2Vjb25kYXJ5VHJpZ2dlckVsdCA9IG51bGxcbiAgICAgICAgICB3aGlsZSAoaGllcmFyY2h5Lmxlbmd0aCA+IDAgJiYgc2Vjb25kYXJ5VHJpZ2dlckVsdCA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRFbHRJbkhpZXJhcmNoeSA9IGhpZXJhcmNoeS5zaGlmdCgpXG4gICAgICAgICAgICBpZiAoYm9keUNvbnRhaW5zKHBhcmVudEVsdEluSGllcmFyY2h5KSkge1xuICAgICAgICAgICAgICBzZWNvbmRhcnlUcmlnZ2VyRWx0ID0gcGFyZW50RWx0SW5IaWVyYXJjaHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNlY29uZGFyeVRyaWdnZXJFbHQpIHtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudChzZWNvbmRhcnlUcmlnZ2VyRWx0LCAnaHRteDphZnRlclJlcXVlc3QnLCByZXNwb25zZUluZm8pXG4gICAgICAgICAgICB0cmlnZ2VyRXZlbnQoc2Vjb25kYXJ5VHJpZ2dlckVsdCwgJ2h0bXg6YWZ0ZXJPbkxvYWQnLCByZXNwb25zZUluZm8pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1heWJlQ2FsbChyZXNvbHZlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14Om9uTG9hZEVycm9yJywgbWVyZ2VPYmplY3RzKHsgZXJyb3I6IGUgfSwgcmVzcG9uc2VJbmZvKSlcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZW5kUmVxdWVzdExvY2soKVxuICAgICAgfVxuICAgIH1cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVtb3ZlUmVxdWVzdEluZGljYXRvcnMoaW5kaWNhdG9ycywgZGlzYWJsZUVsdHMpXG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OmFmdGVyUmVxdWVzdCcsIHJlc3BvbnNlSW5mbylcbiAgICAgIHRyaWdnZXJFcnJvckV2ZW50KGVsdCwgJ2h0bXg6c2VuZEVycm9yJywgcmVzcG9uc2VJbmZvKVxuICAgICAgbWF5YmVDYWxsKHJlamVjdClcbiAgICAgIGVuZFJlcXVlc3RMb2NrKClcbiAgICB9XG4gICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVJlcXVlc3RJbmRpY2F0b3JzKGluZGljYXRvcnMsIGRpc2FibGVFbHRzKVxuICAgICAgdHJpZ2dlckVycm9yRXZlbnQoZWx0LCAnaHRteDphZnRlclJlcXVlc3QnLCByZXNwb25zZUluZm8pXG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnNlbmRBYm9ydCcsIHJlc3BvbnNlSW5mbylcbiAgICAgIG1heWJlQ2FsbChyZWplY3QpXG4gICAgICBlbmRSZXF1ZXN0TG9jaygpXG4gICAgfVxuICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlbW92ZVJlcXVlc3RJbmRpY2F0b3JzKGluZGljYXRvcnMsIGRpc2FibGVFbHRzKVxuICAgICAgdHJpZ2dlckVycm9yRXZlbnQoZWx0LCAnaHRteDphZnRlclJlcXVlc3QnLCByZXNwb25zZUluZm8pXG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnRpbWVvdXQnLCByZXNwb25zZUluZm8pXG4gICAgICBtYXliZUNhbGwocmVqZWN0KVxuICAgICAgZW5kUmVxdWVzdExvY2soKVxuICAgIH1cbiAgICBpZiAoIXRyaWdnZXJFdmVudChlbHQsICdodG14OmJlZm9yZVJlcXVlc3QnLCByZXNwb25zZUluZm8pKSB7XG4gICAgICBtYXliZUNhbGwocmVzb2x2ZSlcbiAgICAgIGVuZFJlcXVlc3RMb2NrKClcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuICAgIHZhciBpbmRpY2F0b3JzID0gYWRkUmVxdWVzdEluZGljYXRvckNsYXNzZXMoZWx0KVxuICAgIHZhciBkaXNhYmxlRWx0cyA9IGRpc2FibGVFbGVtZW50cyhlbHQpXG5cbiAgICBmb3JFYWNoKFsnbG9hZHN0YXJ0JywgJ2xvYWRlbmQnLCAncHJvZ3Jlc3MnLCAnYWJvcnQnXSwgZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICBmb3JFYWNoKFt4aHIsIHhoci51cGxvYWRdLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OnhocjonICsgZXZlbnROYW1lLCB7XG4gICAgICAgICAgICBsZW5ndGhDb21wdXRhYmxlOiBldmVudC5sZW5ndGhDb21wdXRhYmxlLFxuICAgICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgICAgICB0b3RhbDogZXZlbnQudG90YWxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRyaWdnZXJFdmVudChlbHQsICdodG14OmJlZm9yZVNlbmQnLCByZXNwb25zZUluZm8pXG4gICAgY29uc3QgcGFyYW1zID0gdXNlVXJsUGFyYW1zID8gbnVsbCA6IGVuY29kZVBhcmFtc0ZvckJvZHkoeGhyLCBlbHQsIGZpbHRlcmVkRm9ybURhdGEpXG4gICAgeGhyLnNlbmQocGFyYW1zKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gSHRteEhpc3RvcnlVcGRhdGVcbiAgICogQHByb3BlcnR5IHtzdHJpbmd8bnVsbH0gW3R5cGVdXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfG51bGx9IFtwYXRoXVxuICAgKi9cblxuICAvKipcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtIdG14UmVzcG9uc2VJbmZvfSByZXNwb25zZUluZm9cbiAgICogQHJldHVybiB7SHRteEhpc3RvcnlVcGRhdGV9XG4gICAqL1xuICBmdW5jdGlvbiBkZXRlcm1pbmVIaXN0b3J5VXBkYXRlcyhlbHQsIHJlc3BvbnNlSW5mbykge1xuICAgIGNvbnN0IHhociA9IHJlc3BvbnNlSW5mby54aHJcblxuICAgIC8vPSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBGaXJzdCBjb25zdWx0IHJlc3BvbnNlIGhlYWRlcnNcbiAgICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgbGV0IHBhdGhGcm9tSGVhZGVycyA9IG51bGxcbiAgICBsZXQgdHlwZUZyb21IZWFkZXJzID0gbnVsbFxuICAgIGlmIChoYXNIZWFkZXIoeGhyLCAvSFgtUHVzaDovaSkpIHtcbiAgICAgIHBhdGhGcm9tSGVhZGVycyA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignSFgtUHVzaCcpXG4gICAgICB0eXBlRnJvbUhlYWRlcnMgPSAncHVzaCdcbiAgICB9IGVsc2UgaWYgKGhhc0hlYWRlcih4aHIsIC9IWC1QdXNoLVVybDovaSkpIHtcbiAgICAgIHBhdGhGcm9tSGVhZGVycyA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignSFgtUHVzaC1VcmwnKVxuICAgICAgdHlwZUZyb21IZWFkZXJzID0gJ3B1c2gnXG4gICAgfSBlbHNlIGlmIChoYXNIZWFkZXIoeGhyLCAvSFgtUmVwbGFjZS1Vcmw6L2kpKSB7XG4gICAgICBwYXRoRnJvbUhlYWRlcnMgPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLVJlcGxhY2UtVXJsJylcbiAgICAgIHR5cGVGcm9tSGVhZGVycyA9ICdyZXBsYWNlJ1xuICAgIH1cblxuICAgIC8vIGlmIHRoZXJlIHdhcyBhIHJlc3BvbnNlIGhlYWRlciwgdGhhdCBoYXMgcHJpb3JpdHlcbiAgICBpZiAocGF0aEZyb21IZWFkZXJzKSB7XG4gICAgICBpZiAocGF0aEZyb21IZWFkZXJzID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiB7fVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiB0eXBlRnJvbUhlYWRlcnMsXG4gICAgICAgICAgcGF0aDogcGF0aEZyb21IZWFkZXJzXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gTmV4dCByZXNvbHZlIHZpYSBET00gdmFsdWVzXG4gICAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IHJlcXVlc3RQYXRoID0gcmVzcG9uc2VJbmZvLnBhdGhJbmZvLmZpbmFsUmVxdWVzdFBhdGhcbiAgICBjb25zdCByZXNwb25zZVBhdGggPSByZXNwb25zZUluZm8ucGF0aEluZm8ucmVzcG9uc2VQYXRoXG5cbiAgICBjb25zdCBwdXNoVXJsID0gZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LXB1c2gtdXJsJylcbiAgICBjb25zdCByZXBsYWNlVXJsID0gZ2V0Q2xvc2VzdEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LXJlcGxhY2UtdXJsJylcbiAgICBjb25zdCBlbGVtZW50SXNCb29zdGVkID0gZ2V0SW50ZXJuYWxEYXRhKGVsdCkuYm9vc3RlZFxuXG4gICAgbGV0IHNhdmVUeXBlID0gbnVsbFxuICAgIGxldCBwYXRoID0gbnVsbFxuXG4gICAgaWYgKHB1c2hVcmwpIHtcbiAgICAgIHNhdmVUeXBlID0gJ3B1c2gnXG4gICAgICBwYXRoID0gcHVzaFVybFxuICAgIH0gZWxzZSBpZiAocmVwbGFjZVVybCkge1xuICAgICAgc2F2ZVR5cGUgPSAncmVwbGFjZSdcbiAgICAgIHBhdGggPSByZXBsYWNlVXJsXG4gICAgfSBlbHNlIGlmIChlbGVtZW50SXNCb29zdGVkKSB7XG4gICAgICBzYXZlVHlwZSA9ICdwdXNoJ1xuICAgICAgcGF0aCA9IHJlc3BvbnNlUGF0aCB8fCByZXF1ZXN0UGF0aCAvLyBpZiB0aGVyZSBpcyBubyByZXNwb25zZSBwYXRoLCBnbyB3aXRoIHRoZSBvcmlnaW5hbCByZXF1ZXN0IHBhdGhcbiAgICB9XG5cbiAgICBpZiAocGF0aCkge1xuICAgIC8vIGZhbHNlIGluZGljYXRlcyBubyBwdXNoLCByZXR1cm4gZW1wdHkgb2JqZWN0XG4gICAgICBpZiAocGF0aCA9PT0gJ2ZhbHNlJykge1xuICAgICAgICByZXR1cm4ge31cbiAgICAgIH1cblxuICAgICAgLy8gdHJ1ZSBpbmRpY2F0ZXMgd2Ugd2FudCB0byBmb2xsb3cgd2hlcmV2ZXIgdGhlIHNlcnZlciBlbmRlZCB1cCBzZW5kaW5nIHVzXG4gICAgICBpZiAocGF0aCA9PT0gJ3RydWUnKSB7XG4gICAgICAgIHBhdGggPSByZXNwb25zZVBhdGggfHwgcmVxdWVzdFBhdGggLy8gaWYgdGhlcmUgaXMgbm8gcmVzcG9uc2UgcGF0aCwgZ28gd2l0aCB0aGUgb3JpZ2luYWwgcmVxdWVzdCBwYXRoXG4gICAgICB9XG5cbiAgICAgIC8vIHJlc3RvcmUgYW55IGFuY2hvciBhc3NvY2lhdGVkIHdpdGggdGhlIHJlcXVlc3RcbiAgICAgIGlmIChyZXNwb25zZUluZm8ucGF0aEluZm8uYW5jaG9yICYmIHBhdGguaW5kZXhPZignIycpID09PSAtMSkge1xuICAgICAgICBwYXRoID0gcGF0aCArICcjJyArIHJlc3BvbnNlSW5mby5wYXRoSW5mby5hbmNob3JcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogc2F2ZVR5cGUsXG4gICAgICAgIHBhdGhcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7SHRteFJlc3BvbnNlSGFuZGxpbmdDb25maWd9IHJlc3BvbnNlSGFuZGxpbmdDb25maWdcbiAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXR1c1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gY29kZU1hdGNoZXMocmVzcG9uc2VIYW5kbGluZ0NvbmZpZywgc3RhdHVzKSB7XG4gICAgdmFyIHJlZ0V4cCA9IG5ldyBSZWdFeHAocmVzcG9uc2VIYW5kbGluZ0NvbmZpZy5jb2RlKVxuICAgIHJldHVybiByZWdFeHAudGVzdChzdGF0dXMudG9TdHJpbmcoMTApKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxuICAgKiBAcmV0dXJuIHtIdG14UmVzcG9uc2VIYW5kbGluZ0NvbmZpZ31cbiAgICovXG4gIGZ1bmN0aW9uIHJlc29sdmVSZXNwb25zZUhhbmRsaW5nKHhocikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaHRteC5jb25maWcucmVzcG9uc2VIYW5kbGluZy5sZW5ndGg7IGkrKykge1xuICAgICAgLyoqIEB0eXBlIEh0bXhSZXNwb25zZUhhbmRsaW5nQ29uZmlnICovXG4gICAgICB2YXIgcmVzcG9uc2VIYW5kbGluZ0VsZW1lbnQgPSBodG14LmNvbmZpZy5yZXNwb25zZUhhbmRsaW5nW2ldXG4gICAgICBpZiAoY29kZU1hdGNoZXMocmVzcG9uc2VIYW5kbGluZ0VsZW1lbnQsIHhoci5zdGF0dXMpKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZUhhbmRsaW5nRWxlbWVudFxuICAgICAgfVxuICAgIH1cbiAgICAvLyBubyBtYXRjaGVzLCByZXR1cm4gbm8gc3dhcFxuICAgIHJldHVybiB7XG4gICAgICBzd2FwOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICovXG4gIGZ1bmN0aW9uIGhhbmRsZVRpdGxlKHRpdGxlKSB7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBjb25zdCB0aXRsZUVsdCA9IGZpbmQoJ3RpdGxlJylcbiAgICAgIGlmICh0aXRsZUVsdCkge1xuICAgICAgICB0aXRsZUVsdC50ZXh0Q29udGVudCA9IHRpdGxlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSB0aXRsZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvdmUgdGhlIFJldGFyZ2V0IHNlbGVjdG9yIGFuZCB0aHJvdyBpZiBub3QgZm91bmRcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHRhcmdldFxuICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICovXG4gIGZ1bmN0aW9uIHJlc29sdmVSZXRhcmdldChlbHQsIHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQgPT09ICd0aGlzJykge1xuICAgICAgcmV0dXJuIGVsdFxuICAgIH1cbiAgICBjb25zdCByZXNvbHZlZFRhcmdldCA9IGFzRWxlbWVudChxdWVyeVNlbGVjdG9yRXh0KGVsdCwgdGFyZ2V0KSlcbiAgICBpZiAocmVzb2x2ZWRUYXJnZXQgPT0gbnVsbCkge1xuICAgICAgdHJpZ2dlckVycm9yRXZlbnQoZWx0LCAnaHRteDp0YXJnZXRFcnJvcicsIHsgdGFyZ2V0IH0pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmUtdGFyZ2V0ICR7dGFyZ2V0fWApXG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFRhcmdldFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWx0XG4gICAqIEBwYXJhbSB7SHRteFJlc3BvbnNlSW5mb30gcmVzcG9uc2VJbmZvXG4gICAqL1xuICBmdW5jdGlvbiBoYW5kbGVBamF4UmVzcG9uc2UoZWx0LCByZXNwb25zZUluZm8pIHtcbiAgICBjb25zdCB4aHIgPSByZXNwb25zZUluZm8ueGhyXG4gICAgbGV0IHRhcmdldCA9IHJlc3BvbnNlSW5mby50YXJnZXRcbiAgICBjb25zdCBldGMgPSByZXNwb25zZUluZm8uZXRjXG4gICAgY29uc3QgcmVzcG9uc2VJbmZvU2VsZWN0ID0gcmVzcG9uc2VJbmZvLnNlbGVjdFxuXG4gICAgaWYgKCF0cmlnZ2VyRXZlbnQoZWx0LCAnaHRteDpiZWZvcmVPbkxvYWQnLCByZXNwb25zZUluZm8pKSByZXR1cm5cblxuICAgIGlmIChoYXNIZWFkZXIoeGhyLCAvSFgtVHJpZ2dlcjovaSkpIHtcbiAgICAgIGhhbmRsZVRyaWdnZXJIZWFkZXIoeGhyLCAnSFgtVHJpZ2dlcicsIGVsdClcbiAgICB9XG5cbiAgICBpZiAoaGFzSGVhZGVyKHhociwgL0hYLUxvY2F0aW9uOi9pKSkge1xuICAgICAgc2F2ZUN1cnJlbnRQYWdlVG9IaXN0b3J5KClcbiAgICAgIGxldCByZWRpcmVjdFBhdGggPSB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0hYLUxvY2F0aW9uJylcbiAgICAgIC8qKiBAdHlwZSB7SHRteEFqYXhIZWxwZXJDb250ZXh0JntwYXRoOnN0cmluZ319ICovXG4gICAgICB2YXIgcmVkaXJlY3RTd2FwU3BlY1xuICAgICAgaWYgKHJlZGlyZWN0UGF0aC5pbmRleE9mKCd7JykgPT09IDApIHtcbiAgICAgICAgcmVkaXJlY3RTd2FwU3BlYyA9IHBhcnNlSlNPTihyZWRpcmVjdFBhdGgpXG4gICAgICAgIC8vIHdoYXQncyB0aGUgYmVzdCB3YXkgdG8gdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHVzZXIgZGlkbid0IGluY2x1ZGUgdGhpc1xuICAgICAgICByZWRpcmVjdFBhdGggPSByZWRpcmVjdFN3YXBTcGVjLnBhdGhcbiAgICAgICAgZGVsZXRlIHJlZGlyZWN0U3dhcFNwZWMucGF0aFxuICAgICAgfVxuICAgICAgYWpheEhlbHBlcignZ2V0JywgcmVkaXJlY3RQYXRoLCByZWRpcmVjdFN3YXBTcGVjKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBwdXNoVXJsSW50b0hpc3RvcnkocmVkaXJlY3RQYXRoKVxuICAgICAgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHNob3VsZFJlZnJlc2ggPSBoYXNIZWFkZXIoeGhyLCAvSFgtUmVmcmVzaDovaSkgJiYgeGhyLmdldFJlc3BvbnNlSGVhZGVyKCdIWC1SZWZyZXNoJykgPT09ICd0cnVlJ1xuXG4gICAgaWYgKGhhc0hlYWRlcih4aHIsIC9IWC1SZWRpcmVjdDovaSkpIHtcbiAgICAgIHJlc3BvbnNlSW5mby5rZWVwSW5kaWNhdG9ycyA9IHRydWVcbiAgICAgIGh0bXgubG9jYXRpb24uaHJlZiA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignSFgtUmVkaXJlY3QnKVxuICAgICAgc2hvdWxkUmVmcmVzaCAmJiBodG14LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoc2hvdWxkUmVmcmVzaCkge1xuICAgICAgcmVzcG9uc2VJbmZvLmtlZXBJbmRpY2F0b3JzID0gdHJ1ZVxuICAgICAgaHRteC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaGlzdG9yeVVwZGF0ZSA9IGRldGVybWluZUhpc3RvcnlVcGRhdGVzKGVsdCwgcmVzcG9uc2VJbmZvKVxuXG4gICAgY29uc3QgcmVzcG9uc2VIYW5kbGluZyA9IHJlc29sdmVSZXNwb25zZUhhbmRsaW5nKHhocilcbiAgICBjb25zdCBzaG91bGRTd2FwID0gcmVzcG9uc2VIYW5kbGluZy5zd2FwXG4gICAgbGV0IGlzRXJyb3IgPSAhIXJlc3BvbnNlSGFuZGxpbmcuZXJyb3JcbiAgICBsZXQgaWdub3JlVGl0bGUgPSBodG14LmNvbmZpZy5pZ25vcmVUaXRsZSB8fCByZXNwb25zZUhhbmRsaW5nLmlnbm9yZVRpdGxlXG4gICAgbGV0IHNlbGVjdE92ZXJyaWRlID0gcmVzcG9uc2VIYW5kbGluZy5zZWxlY3RcbiAgICBpZiAocmVzcG9uc2VIYW5kbGluZy50YXJnZXQpIHtcbiAgICAgIHJlc3BvbnNlSW5mby50YXJnZXQgPSByZXNvbHZlUmV0YXJnZXQoZWx0LCByZXNwb25zZUhhbmRsaW5nLnRhcmdldClcbiAgICB9XG4gICAgdmFyIHN3YXBPdmVycmlkZSA9IGV0Yy5zd2FwT3ZlcnJpZGVcbiAgICBpZiAoc3dhcE92ZXJyaWRlID09IG51bGwgJiYgcmVzcG9uc2VIYW5kbGluZy5zd2FwT3ZlcnJpZGUpIHtcbiAgICAgIHN3YXBPdmVycmlkZSA9IHJlc3BvbnNlSGFuZGxpbmcuc3dhcE92ZXJyaWRlXG4gICAgfVxuXG4gICAgLy8gcmVzcG9uc2UgaGVhZGVycyBvdmVycmlkZSByZXNwb25zZSBoYW5kbGluZyBjb25maWdcbiAgICBpZiAoaGFzSGVhZGVyKHhociwgL0hYLVJldGFyZ2V0Oi9pKSkge1xuICAgICAgcmVzcG9uc2VJbmZvLnRhcmdldCA9IHJlc29sdmVSZXRhcmdldChlbHQsIHhoci5nZXRSZXNwb25zZUhlYWRlcignSFgtUmV0YXJnZXQnKSlcbiAgICB9XG5cbiAgICBpZiAoaGFzSGVhZGVyKHhociwgL0hYLVJlc3dhcDovaSkpIHtcbiAgICAgIHN3YXBPdmVycmlkZSA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignSFgtUmVzd2FwJylcbiAgICB9XG5cbiAgICB2YXIgc2VydmVyUmVzcG9uc2UgPSB4aHIucmVzcG9uc2VcbiAgICAvKiogQHR5cGUgSHRteEJlZm9yZVN3YXBEZXRhaWxzICovXG4gICAgdmFyIGJlZm9yZVN3YXBEZXRhaWxzID0gbWVyZ2VPYmplY3RzKHtcbiAgICAgIHNob3VsZFN3YXAsXG4gICAgICBzZXJ2ZXJSZXNwb25zZSxcbiAgICAgIGlzRXJyb3IsXG4gICAgICBpZ25vcmVUaXRsZSxcbiAgICAgIHNlbGVjdE92ZXJyaWRlLFxuICAgICAgc3dhcE92ZXJyaWRlXG4gICAgfSwgcmVzcG9uc2VJbmZvKVxuXG4gICAgaWYgKHJlc3BvbnNlSGFuZGxpbmcuZXZlbnQgJiYgIXRyaWdnZXJFdmVudCh0YXJnZXQsIHJlc3BvbnNlSGFuZGxpbmcuZXZlbnQsIGJlZm9yZVN3YXBEZXRhaWxzKSkgcmV0dXJuXG5cbiAgICBpZiAoIXRyaWdnZXJFdmVudCh0YXJnZXQsICdodG14OmJlZm9yZVN3YXAnLCBiZWZvcmVTd2FwRGV0YWlscykpIHJldHVyblxuXG4gICAgdGFyZ2V0ID0gYmVmb3JlU3dhcERldGFpbHMudGFyZ2V0IC8vIGFsbG93IHJlLXRhcmdldGluZ1xuICAgIHNlcnZlclJlc3BvbnNlID0gYmVmb3JlU3dhcERldGFpbHMuc2VydmVyUmVzcG9uc2UgLy8gYWxsb3cgdXBkYXRpbmcgY29udGVudFxuICAgIGlzRXJyb3IgPSBiZWZvcmVTd2FwRGV0YWlscy5pc0Vycm9yIC8vIGFsbG93IHVwZGF0aW5nIGVycm9yXG4gICAgaWdub3JlVGl0bGUgPSBiZWZvcmVTd2FwRGV0YWlscy5pZ25vcmVUaXRsZSAvLyBhbGxvdyB1cGRhdGluZyBpZ25vcmluZyB0aXRsZVxuICAgIHNlbGVjdE92ZXJyaWRlID0gYmVmb3JlU3dhcERldGFpbHMuc2VsZWN0T3ZlcnJpZGUgLy8gYWxsb3cgdXBkYXRpbmcgc2VsZWN0IG92ZXJyaWRlXG4gICAgc3dhcE92ZXJyaWRlID0gYmVmb3JlU3dhcERldGFpbHMuc3dhcE92ZXJyaWRlIC8vIGFsbG93IHVwZGF0aW5nIHN3YXAgb3ZlcnJpZGVcblxuICAgIHJlc3BvbnNlSW5mby50YXJnZXQgPSB0YXJnZXQgLy8gTWFrZSB1cGRhdGVkIHRhcmdldCBhdmFpbGFibGUgdG8gcmVzcG9uc2UgZXZlbnRzXG4gICAgcmVzcG9uc2VJbmZvLmZhaWxlZCA9IGlzRXJyb3IgLy8gTWFrZSBmYWlsZWQgcHJvcGVydHkgYXZhaWxhYmxlIHRvIHJlc3BvbnNlIGV2ZW50c1xuICAgIHJlc3BvbnNlSW5mby5zdWNjZXNzZnVsID0gIWlzRXJyb3IgLy8gTWFrZSBzdWNjZXNzZnVsIHByb3BlcnR5IGF2YWlsYWJsZSB0byByZXNwb25zZSBldmVudHNcblxuICAgIGlmIChiZWZvcmVTd2FwRGV0YWlscy5zaG91bGRTd2FwKSB7XG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjg2KSB7XG4gICAgICAgIGNhbmNlbFBvbGxpbmcoZWx0KVxuICAgICAgfVxuXG4gICAgICB3aXRoRXh0ZW5zaW9ucyhlbHQsIGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICBzZXJ2ZXJSZXNwb25zZSA9IGV4dGVuc2lvbi50cmFuc2Zvcm1SZXNwb25zZShzZXJ2ZXJSZXNwb25zZSwgeGhyLCBlbHQpXG4gICAgICB9KVxuXG4gICAgICAvLyBTYXZlIGN1cnJlbnQgcGFnZSBpZiB0aGVyZSB3aWxsIGJlIGEgaGlzdG9yeSB1cGRhdGVcbiAgICAgIGlmIChoaXN0b3J5VXBkYXRlLnR5cGUpIHtcbiAgICAgICAgc2F2ZUN1cnJlbnRQYWdlVG9IaXN0b3J5KClcbiAgICAgIH1cblxuICAgICAgdmFyIHN3YXBTcGVjID0gZ2V0U3dhcFNwZWNpZmljYXRpb24oZWx0LCBzd2FwT3ZlcnJpZGUpXG5cbiAgICAgIGlmICghc3dhcFNwZWMuaGFzT3duUHJvcGVydHkoJ2lnbm9yZVRpdGxlJykpIHtcbiAgICAgICAgc3dhcFNwZWMuaWdub3JlVGl0bGUgPSBpZ25vcmVUaXRsZVxuICAgICAgfVxuXG4gICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChodG14LmNvbmZpZy5zd2FwcGluZ0NsYXNzKVxuXG4gICAgICBpZiAocmVzcG9uc2VJbmZvU2VsZWN0KSB7XG4gICAgICAgIHNlbGVjdE92ZXJyaWRlID0gcmVzcG9uc2VJbmZvU2VsZWN0XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNIZWFkZXIoeGhyLCAvSFgtUmVzZWxlY3Q6L2kpKSB7XG4gICAgICAgIHNlbGVjdE92ZXJyaWRlID0geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdIWC1SZXNlbGVjdCcpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNlbGVjdE9PQiA9IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC1zZWxlY3Qtb29iJylcbiAgICAgIGNvbnN0IHNlbGVjdCA9IGdldENsb3Nlc3RBdHRyaWJ1dGVWYWx1ZShlbHQsICdoeC1zZWxlY3QnKVxuXG4gICAgICBzd2FwKHRhcmdldCwgc2VydmVyUmVzcG9uc2UsIHN3YXBTcGVjLCB7XG4gICAgICAgIHNlbGVjdDogc2VsZWN0T3ZlcnJpZGUgPT09ICd1bnNldCcgPyBudWxsIDogc2VsZWN0T3ZlcnJpZGUgfHwgc2VsZWN0LFxuICAgICAgICBzZWxlY3RPT0IsXG4gICAgICAgIGV2ZW50SW5mbzogcmVzcG9uc2VJbmZvLFxuICAgICAgICBhbmNob3I6IHJlc3BvbnNlSW5mby5wYXRoSW5mby5hbmNob3IsXG4gICAgICAgIGNvbnRleHRFbGVtZW50OiBlbHQsXG4gICAgICAgIGFmdGVyU3dhcENhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoaGFzSGVhZGVyKHhociwgL0hYLVRyaWdnZXItQWZ0ZXItU3dhcDovaSkpIHtcbiAgICAgICAgICAgIGxldCBmaW5hbEVsdCA9IGVsdFxuICAgICAgICAgICAgaWYgKCFib2R5Q29udGFpbnMoZWx0KSkge1xuICAgICAgICAgICAgICBmaW5hbEVsdCA9IGdldERvY3VtZW50KCkuYm9keVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaGFuZGxlVHJpZ2dlckhlYWRlcih4aHIsICdIWC1UcmlnZ2VyLUFmdGVyLVN3YXAnLCBmaW5hbEVsdClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyU2V0dGxlQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChoYXNIZWFkZXIoeGhyLCAvSFgtVHJpZ2dlci1BZnRlci1TZXR0bGU6L2kpKSB7XG4gICAgICAgICAgICBsZXQgZmluYWxFbHQgPSBlbHRcbiAgICAgICAgICAgIGlmICghYm9keUNvbnRhaW5zKGVsdCkpIHtcbiAgICAgICAgICAgICAgZmluYWxFbHQgPSBnZXREb2N1bWVudCgpLmJvZHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZVRyaWdnZXJIZWFkZXIoeGhyLCAnSFgtVHJpZ2dlci1BZnRlci1TZXR0bGUnLCBmaW5hbEVsdClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZVN3YXBDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gaWYgd2UgbmVlZCB0byBzYXZlIGhpc3RvcnksIGRvIHNvLCBiZWZvcmUgc3dhcHBpbmcgc28gdGhhdCByZWxhdGl2ZSByZXNvdXJjZXMgaGF2ZSB0aGUgY29ycmVjdCBiYXNlIFVSTFxuICAgICAgICAgIGlmIChoaXN0b3J5VXBkYXRlLnR5cGUpIHtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14OmJlZm9yZUhpc3RvcnlVcGRhdGUnLCBtZXJnZU9iamVjdHMoeyBoaXN0b3J5OiBoaXN0b3J5VXBkYXRlIH0sIHJlc3BvbnNlSW5mbykpXG4gICAgICAgICAgICBpZiAoaGlzdG9yeVVwZGF0ZS50eXBlID09PSAncHVzaCcpIHtcbiAgICAgICAgICAgICAgcHVzaFVybEludG9IaXN0b3J5KGhpc3RvcnlVcGRhdGUucGF0aClcbiAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KGdldERvY3VtZW50KCkuYm9keSwgJ2h0bXg6cHVzaGVkSW50b0hpc3RvcnknLCB7IHBhdGg6IGhpc3RvcnlVcGRhdGUucGF0aCB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVwbGFjZVVybEluSGlzdG9yeShoaXN0b3J5VXBkYXRlLnBhdGgpXG4gICAgICAgICAgICAgIHRyaWdnZXJFdmVudChnZXREb2N1bWVudCgpLmJvZHksICdodG14OnJlcGxhY2VkSW5IaXN0b3J5JywgeyBwYXRoOiBoaXN0b3J5VXBkYXRlLnBhdGggfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChpc0Vycm9yKSB7XG4gICAgICB0cmlnZ2VyRXJyb3JFdmVudChlbHQsICdodG14OnJlc3BvbnNlRXJyb3InLCBtZXJnZU9iamVjdHMoeyBlcnJvcjogJ1Jlc3BvbnNlIFN0YXR1cyBFcnJvciBDb2RlICcgKyB4aHIuc3RhdHVzICsgJyBmcm9tICcgKyByZXNwb25zZUluZm8ucGF0aEluZm8ucmVxdWVzdFBhdGggfSwgcmVzcG9uc2VJbmZvKSlcbiAgICB9XG4gIH1cblxuICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBFeHRlbnNpb25zIEFQSVxuICAvLz0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKiBAdHlwZSB7T2JqZWN0PHN0cmluZywgSHRteEV4dGVuc2lvbj59ICovXG4gIGNvbnN0IGV4dGVuc2lvbnMgPSB7fVxuXG4gIC8qKlxuICAgKiBleHRlbnNpb25CYXNlIGRlZmluZXMgdGhlIGRlZmF1bHQgZnVuY3Rpb25zIGZvciBhbGwgZXh0ZW5zaW9ucy5cbiAgICogQHJldHVybnMge0h0bXhFeHRlbnNpb259XG4gICAqL1xuICBmdW5jdGlvbiBleHRlbnNpb25CYXNlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpbml0OiBmdW5jdGlvbihhcGkpIHsgcmV0dXJuIG51bGwgfSxcbiAgICAgIGdldFNlbGVjdG9yczogZnVuY3Rpb24oKSB7IHJldHVybiBudWxsIH0sXG4gICAgICBvbkV2ZW50OiBmdW5jdGlvbihuYW1lLCBldnQpIHsgcmV0dXJuIHRydWUgfSxcbiAgICAgIHRyYW5zZm9ybVJlc3BvbnNlOiBmdW5jdGlvbih0ZXh0LCB4aHIsIGVsdCkgeyByZXR1cm4gdGV4dCB9LFxuICAgICAgaXNJbmxpbmVTd2FwOiBmdW5jdGlvbihzd2FwU3R5bGUpIHsgcmV0dXJuIGZhbHNlIH0sXG4gICAgICBoYW5kbGVTd2FwOiBmdW5jdGlvbihzd2FwU3R5bGUsIHRhcmdldCwgZnJhZ21lbnQsIHNldHRsZUluZm8pIHsgcmV0dXJuIGZhbHNlIH0sXG4gICAgICBlbmNvZGVQYXJhbWV0ZXJzOiBmdW5jdGlvbih4aHIsIHBhcmFtZXRlcnMsIGVsdCkgeyByZXR1cm4gbnVsbCB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZUV4dGVuc2lvbiBpbml0aWFsaXplcyB0aGUgZXh0ZW5zaW9uIGFuZCBhZGRzIGl0IHRvIHRoZSBodG14IHJlZ2lzdHJ5XG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9hcGkvI2RlZmluZUV4dGVuc2lvblxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgZXh0ZW5zaW9uIG5hbWVcbiAgICogQHBhcmFtIHtQYXJ0aWFsPEh0bXhFeHRlbnNpb24+fSBleHRlbnNpb24gdGhlIGV4dGVuc2lvbiBkZWZpbml0aW9uXG4gICAqL1xuICBmdW5jdGlvbiBkZWZpbmVFeHRlbnNpb24obmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgaWYgKGV4dGVuc2lvbi5pbml0KSB7XG4gICAgICBleHRlbnNpb24uaW5pdChpbnRlcm5hbEFQSSlcbiAgICB9XG4gICAgZXh0ZW5zaW9uc1tuYW1lXSA9IG1lcmdlT2JqZWN0cyhleHRlbnNpb25CYXNlKCksIGV4dGVuc2lvbilcbiAgfVxuXG4gIC8qKlxuICAgKiByZW1vdmVFeHRlbnNpb24gcmVtb3ZlcyBhbiBleHRlbnNpb24gZnJvbSB0aGUgaHRteCByZWdpc3RyeVxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvYXBpLyNyZW1vdmVFeHRlbnNpb25cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZUV4dGVuc2lvbihuYW1lKSB7XG4gICAgZGVsZXRlIGV4dGVuc2lvbnNbbmFtZV1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRFeHRlbnNpb25zIHNlYXJjaGVzIHVwIHRoZSBET00gdHJlZSB0byByZXR1cm4gYWxsIGV4dGVuc2lvbnMgdGhhdCBjYW4gYmUgYXBwbGllZCB0byBhIGdpdmVuIGVsZW1lbnRcbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbHRcbiAgICogQHBhcmFtIHtIdG14RXh0ZW5zaW9uW109fSBleHRlbnNpb25zVG9SZXR1cm5cbiAgICogQHBhcmFtIHtzdHJpbmdbXT19IGV4dGVuc2lvbnNUb0lnbm9yZVxuICAgKiBAcmV0dXJucyB7SHRteEV4dGVuc2lvbltdfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0RXh0ZW5zaW9ucyhlbHQsIGV4dGVuc2lvbnNUb1JldHVybiwgZXh0ZW5zaW9uc1RvSWdub3JlKSB7XG4gICAgaWYgKGV4dGVuc2lvbnNUb1JldHVybiA9PSB1bmRlZmluZWQpIHtcbiAgICAgIGV4dGVuc2lvbnNUb1JldHVybiA9IFtdXG4gICAgfVxuICAgIGlmIChlbHQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXh0ZW5zaW9uc1RvUmV0dXJuXG4gICAgfVxuICAgIGlmIChleHRlbnNpb25zVG9JZ25vcmUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICBleHRlbnNpb25zVG9JZ25vcmUgPSBbXVxuICAgIH1cbiAgICBjb25zdCBleHRlbnNpb25zRm9yRWxlbWVudCA9IGdldEF0dHJpYnV0ZVZhbHVlKGVsdCwgJ2h4LWV4dCcpXG4gICAgaWYgKGV4dGVuc2lvbnNGb3JFbGVtZW50KSB7XG4gICAgICBmb3JFYWNoKGV4dGVuc2lvbnNGb3JFbGVtZW50LnNwbGl0KCcsJyksIGZ1bmN0aW9uKGV4dGVuc2lvbk5hbWUpIHtcbiAgICAgICAgZXh0ZW5zaW9uTmFtZSA9IGV4dGVuc2lvbk5hbWUucmVwbGFjZSgvIC9nLCAnJylcbiAgICAgICAgaWYgKGV4dGVuc2lvbk5hbWUuc2xpY2UoMCwgNykgPT0gJ2lnbm9yZTonKSB7XG4gICAgICAgICAgZXh0ZW5zaW9uc1RvSWdub3JlLnB1c2goZXh0ZW5zaW9uTmFtZS5zbGljZSg3KSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0ZW5zaW9uc1RvSWdub3JlLmluZGV4T2YoZXh0ZW5zaW9uTmFtZSkgPCAwKSB7XG4gICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gZXh0ZW5zaW9uc1tleHRlbnNpb25OYW1lXVxuICAgICAgICAgIGlmIChleHRlbnNpb24gJiYgZXh0ZW5zaW9uc1RvUmV0dXJuLmluZGV4T2YoZXh0ZW5zaW9uKSA8IDApIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnNUb1JldHVybi5wdXNoKGV4dGVuc2lvbilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBnZXRFeHRlbnNpb25zKGFzRWxlbWVudChwYXJlbnRFbHQoZWx0KSksIGV4dGVuc2lvbnNUb1JldHVybiwgZXh0ZW5zaW9uc1RvSWdub3JlKVxuICB9XG5cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gSW5pdGlhbGl6YXRpb25cbiAgLy89ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIGlzUmVhZHkgPSBmYWxzZVxuICBnZXREb2N1bWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICBpc1JlYWR5ID0gdHJ1ZVxuICB9KVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgZnVuY3Rpb24gbm93IGlmIERPTUNvbnRlbnRMb2FkZWQgaGFzIGZpcmVkLCBvdGhlcndpc2UgbGlzdGVuIGZvciBpdC5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB1c2VzIGlzUmVhZHkgYmVjYXVzZSB0aGVyZSBpcyBubyByZWxpYWJsZSB3YXkgdG8gYXNrIHRoZSBicm93c2VyIHdoZXRoZXJcbiAgICogdGhlIERPTUNvbnRlbnRMb2FkZWQgZXZlbnQgaGFzIGFscmVhZHkgYmVlbiBmaXJlZDsgdGhlcmUncyBhIGdhcCBiZXR3ZWVuIERPTUNvbnRlbnRMb2FkZWRcbiAgICogZmlyaW5nIGFuZCByZWFkeXN0YXRlPWNvbXBsZXRlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVhZHkoZm4pIHtcbiAgICAvLyBDaGVja2luZyByZWFkeVN0YXRlIGhlcmUgaXMgYSBmYWlsc2FmZSBpbiBjYXNlIHRoZSBodG14IHNjcmlwdCB0YWcgZW50ZXJlZCB0aGUgRE9NIGJ5XG4gICAgLy8gc29tZSBtZWFucyBvdGhlciB0aGFuIHRoZSBpbml0aWFsIHBhZ2UgbG9hZC5cbiAgICBpZiAoaXNSZWFkeSB8fCBnZXREb2N1bWVudCgpLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIGZuKClcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0RG9jdW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5zZXJ0SW5kaWNhdG9yU3R5bGVzKCkge1xuICAgIGlmIChodG14LmNvbmZpZy5pbmNsdWRlSW5kaWNhdG9yU3R5bGVzICE9PSBmYWxzZSkge1xuICAgICAgY29uc3Qgbm9uY2VBdHRyaWJ1dGUgPSBodG14LmNvbmZpZy5pbmxpbmVTdHlsZU5vbmNlID8gYCBub25jZT1cIiR7aHRteC5jb25maWcuaW5saW5lU3R5bGVOb25jZX1cImAgOiAnJ1xuICAgICAgY29uc3QgaW5kaWNhdG9yID0gaHRteC5jb25maWcuaW5kaWNhdG9yQ2xhc3NcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSBodG14LmNvbmZpZy5yZXF1ZXN0Q2xhc3NcbiAgICAgIGdldERvY3VtZW50KCkuaGVhZC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsXG4gICAgICAgIGA8c3R5bGUke25vbmNlQXR0cmlidXRlfT5gICtcbiAgICAgICAgYC4ke2luZGljYXRvcn17b3BhY2l0eTowO3Zpc2liaWxpdHk6IGhpZGRlbn0gYCArXG4gICAgICAgIGAuJHtyZXF1ZXN0fSAuJHtpbmRpY2F0b3J9LCAuJHtyZXF1ZXN0fS4ke2luZGljYXRvcn17b3BhY2l0eToxO3Zpc2liaWxpdHk6IHZpc2libGU7dHJhbnNpdGlvbjogb3BhY2l0eSAyMDBtcyBlYXNlLWlufWAgK1xuICAgICAgICAnPC9zdHlsZT4nXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWV0YUNvbmZpZygpIHtcbiAgICAvKiogQHR5cGUgSFRNTE1ldGFFbGVtZW50ICovXG4gICAgY29uc3QgZWxlbWVudCA9IGdldERvY3VtZW50KCkucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwiaHRteC1jb25maWdcIl0nKVxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICByZXR1cm4gcGFyc2VKU09OKGVsZW1lbnQuY29udGVudClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZU1ldGFDb25maWcoKSB7XG4gICAgY29uc3QgbWV0YUNvbmZpZyA9IGdldE1ldGFDb25maWcoKVxuICAgIGlmIChtZXRhQ29uZmlnKSB7XG4gICAgICBodG14LmNvbmZpZyA9IG1lcmdlT2JqZWN0cyhodG14LmNvbmZpZywgbWV0YUNvbmZpZylcbiAgICB9XG4gIH1cblxuICAvLyBpbml0aWFsaXplIHRoZSBkb2N1bWVudFxuICByZWFkeShmdW5jdGlvbigpIHtcbiAgICBtZXJnZU1ldGFDb25maWcoKVxuICAgIGluc2VydEluZGljYXRvclN0eWxlcygpXG4gICAgbGV0IGJvZHkgPSBnZXREb2N1bWVudCgpLmJvZHlcbiAgICBwcm9jZXNzTm9kZShib2R5KVxuICAgIGNvbnN0IHJlc3RvcmVkRWx0cyA9IGdldERvY3VtZW50KCkucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIFwiW2h4LXRyaWdnZXI9J3Jlc3RvcmVkJ10sW2RhdGEtaHgtdHJpZ2dlcj0ncmVzdG9yZWQnXVwiXG4gICAgKVxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcignaHRteDphYm9ydCcsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZXZ0LnRhcmdldFxuICAgICAgY29uc3QgaW50ZXJuYWxEYXRhID0gZ2V0SW50ZXJuYWxEYXRhKHRhcmdldClcbiAgICAgIGlmIChpbnRlcm5hbERhdGEgJiYgaW50ZXJuYWxEYXRhLnhocikge1xuICAgICAgICBpbnRlcm5hbERhdGEueGhyLmFib3J0KClcbiAgICAgIH1cbiAgICB9KVxuICAgIC8qKiBAdHlwZSB7KGV2OiBQb3BTdGF0ZUV2ZW50KSA9PiBhbnl9ICovXG4gICAgY29uc3Qgb3JpZ2luYWxQb3BzdGF0ZSA9IHdpbmRvdy5vbnBvcHN0YXRlID8gd2luZG93Lm9ucG9wc3RhdGUuYmluZCh3aW5kb3cpIDogbnVsbFxuICAgIC8qKiBAdHlwZSB7KGV2OiBQb3BTdGF0ZUV2ZW50KSA9PiBhbnl9ICovXG4gICAgd2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnN0YXRlICYmIGV2ZW50LnN0YXRlLmh0bXgpIHtcbiAgICAgICAgcmVzdG9yZUhpc3RvcnkoKVxuICAgICAgICBmb3JFYWNoKHJlc3RvcmVkRWx0cywgZnVuY3Rpb24oZWx0KSB7XG4gICAgICAgICAgdHJpZ2dlckV2ZW50KGVsdCwgJ2h0bXg6cmVzdG9yZWQnLCB7XG4gICAgICAgICAgICBkb2N1bWVudDogZ2V0RG9jdW1lbnQoKSxcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3JpZ2luYWxQb3BzdGF0ZSkge1xuICAgICAgICAgIG9yaWdpbmFsUG9wc3RhdGUoZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZ2V0V2luZG93KCkuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRyaWdnZXJFdmVudChib2R5LCAnaHRteDpsb2FkJywge30pIC8vIGdpdmUgcmVhZHkgaGFuZGxlcnMgYSBjaGFuY2UgdG8gbG9hZCB1cCBiZWZvcmUgZmlyaW5nIHRoaXMgZXZlbnRcbiAgICAgIGJvZHkgPSBudWxsIC8vIGtpbGwgcmVmZXJlbmNlIGZvciBnY1xuICAgIH0sIDApXG4gIH0pXG5cbiAgcmV0dXJuIGh0bXhcbn0pKClcblxuLyoqIEB0eXBlZGVmIHsnZ2V0J3wnaGVhZCd8J3Bvc3QnfCdwdXQnfCdkZWxldGUnfCdjb25uZWN0J3wnb3B0aW9ucyd8J3RyYWNlJ3wncGF0Y2gnfSBIdHRwVmVyYiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFN3YXBPcHRpb25zXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3NlbGVjdF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2VsZWN0T09CXVxuICogQHByb3BlcnR5IHsqfSBbZXZlbnRJbmZvXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFthbmNob3JdXG4gKiBAcHJvcGVydHkge0VsZW1lbnR9IFtjb250ZXh0RWxlbWVudF1cbiAqIEBwcm9wZXJ0eSB7c3dhcENhbGxiYWNrfSBbYWZ0ZXJTd2FwQ2FsbGJhY2tdXG4gKiBAcHJvcGVydHkge3N3YXBDYWxsYmFja30gW2FmdGVyU2V0dGxlQ2FsbGJhY2tdXG4gKiBAcHJvcGVydHkge3N3YXBDYWxsYmFja30gW2JlZm9yZVN3YXBDYWxsYmFja11cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbdGl0bGVdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtoaXN0b3J5UmVxdWVzdF1cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayBzd2FwQ2FsbGJhY2tcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsnaW5uZXJIVE1MJyB8ICdvdXRlckhUTUwnIHwgJ2JlZm9yZWJlZ2luJyB8ICdhZnRlcmJlZ2luJyB8ICdiZWZvcmVlbmQnIHwgJ2FmdGVyZW5kJyB8ICdkZWxldGUnIHwgJ25vbmUnIHwgc3RyaW5nfSBIdG14U3dhcFN0eWxlXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiBIdG14U3dhcFNwZWNpZmljYXRpb25cbiAqIEBwcm9wZXJ0eSB7SHRteFN3YXBTdHlsZX0gc3dhcFN0eWxlXG4gKiBAcHJvcGVydHkge251bWJlcn0gc3dhcERlbGF5XG4gKiBAcHJvcGVydHkge251bWJlcn0gc2V0dGxlRGVsYXlcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3RyYW5zaXRpb25dXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtpZ25vcmVUaXRsZV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaGVhZF1cbiAqIEBwcm9wZXJ0eSB7J3RvcCcgfCAnYm90dG9tJyB8IG51bWJlciB9IFtzY3JvbGxdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3Njcm9sbFRhcmdldF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2hvd11cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2hvd1RhcmdldF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2ZvY3VzU2Nyb2xsXVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgeygodGhpczpOb2RlLCBldnQ6RXZlbnQpID0+IGJvb2xlYW4pICYge3NvdXJjZTogc3RyaW5nfX0gQ29uZGl0aW9uYWxGdW5jdGlvblxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSHRteFRyaWdnZXJTcGVjaWZpY2F0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHJpZ2dlclxuICogQHByb3BlcnR5IHtudW1iZXJ9IFtwb2xsSW50ZXJ2YWxdXG4gKiBAcHJvcGVydHkge0NvbmRpdGlvbmFsRnVuY3Rpb259IFtldmVudEZpbHRlcl1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2NoYW5nZWRdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvbmNlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbY29uc3VtZV1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZGVsYXldXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2Zyb21dXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3RhcmdldF1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdGhyb3R0bGVdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3F1ZXVlXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtyb290XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFt0aHJlc2hvbGRdXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7e2VsdDogRWxlbWVudCwgbWVzc2FnZTogc3RyaW5nLCB2YWxpZGl0eTogVmFsaWRpdHlTdGF0ZX19IEh0bXhFbGVtZW50VmFsaWRhdGlvbkVycm9yXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7UmVjb3JkPHN0cmluZywgc3RyaW5nPn0gSHRteEhlYWRlclNwZWNpZmljYXRpb25cbiAqIEBwcm9wZXJ0eSB7J3RydWUnfSBIWC1SZXF1ZXN0XG4gKiBAcHJvcGVydHkge3N0cmluZ3xudWxsfSBIWC1UcmlnZ2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ3xudWxsfSBIWC1UcmlnZ2VyLU5hbWVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfG51bGx9IEhYLVRhcmdldFxuICogQHByb3BlcnR5IHtzdHJpbmd9IEhYLUN1cnJlbnQtVVJMXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW0hYLVByb21wdF1cbiAqIEBwcm9wZXJ0eSB7J3RydWUnfSBbSFgtQm9vc3RlZF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbQ29udGVudC1UeXBlXVxuICogQHByb3BlcnR5IHsndHJ1ZSd9IFtIWC1IaXN0b3J5LVJlc3RvcmUtUmVxdWVzdF1cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIEh0bXhBamF4SGVscGVyQ29udGV4dFxuICogQHByb3BlcnR5IHtFbGVtZW50fHN0cmluZ30gW3NvdXJjZV1cbiAqIEBwcm9wZXJ0eSB7RXZlbnR9IFtldmVudF1cbiAqIEBwcm9wZXJ0eSB7SHRteEFqYXhIYW5kbGVyfSBbaGFuZGxlcl1cbiAqIEBwcm9wZXJ0eSB7RWxlbWVudHxzdHJpbmd9IFt0YXJnZXRdXG4gKiBAcHJvcGVydHkge0h0bXhTd2FwU3R5bGV9IFtzd2FwXVxuICogQHByb3BlcnR5IHtPYmplY3R8Rm9ybURhdGF9IFt2YWx1ZXNdXG4gKiBAcHJvcGVydHkge1JlY29yZDxzdHJpbmcsc3RyaW5nPn0gW2hlYWRlcnNdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3NlbGVjdF1cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IEh0bXhSZXF1ZXN0Q29uZmlnXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IGJvb3N0ZWRcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdXNlVXJsUGFyYW1zXG4gKiBAcHJvcGVydHkge0Zvcm1EYXRhfSBmb3JtRGF0YVxuICogQHByb3BlcnR5IHtPYmplY3R9IHBhcmFtZXRlcnMgZm9ybURhdGEgcHJveHlcbiAqIEBwcm9wZXJ0eSB7Rm9ybURhdGF9IHVuZmlsdGVyZWRGb3JtRGF0YVxuICogQHByb3BlcnR5IHtPYmplY3R9IHVuZmlsdGVyZWRQYXJhbWV0ZXJzIHVuZmlsdGVyZWRGb3JtRGF0YSBwcm94eVxuICogQHByb3BlcnR5IHtIdG14SGVhZGVyU3BlY2lmaWNhdGlvbn0gaGVhZGVyc1xuICogQHByb3BlcnR5IHtFbGVtZW50fSBlbHRcbiAqIEBwcm9wZXJ0eSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcHJvcGVydHkge0h0dHBWZXJifSB2ZXJiXG4gKiBAcHJvcGVydHkge0h0bXhFbGVtZW50VmFsaWRhdGlvbkVycm9yW119IGVycm9yc1xuICogQHByb3BlcnR5IHtib29sZWFufSB3aXRoQ3JlZGVudGlhbHNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB0aW1lb3V0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gcGF0aFxuICogQHByb3BlcnR5IHtFdmVudH0gdHJpZ2dlcmluZ0V2ZW50XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBIdG14UmVzcG9uc2VJbmZvXG4gKiBAcHJvcGVydHkge1hNTEh0dHBSZXF1ZXN0fSB4aHJcbiAqIEBwcm9wZXJ0eSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcHJvcGVydHkge0h0bXhSZXF1ZXN0Q29uZmlnfSByZXF1ZXN0Q29uZmlnXG4gKiBAcHJvcGVydHkge0h0bXhBamF4RXRjfSBldGNcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gYm9vc3RlZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNlbGVjdFxuICogQHByb3BlcnR5IHt7cmVxdWVzdFBhdGg6IHN0cmluZywgZmluYWxSZXF1ZXN0UGF0aDogc3RyaW5nLCByZXNwb25zZVBhdGg6IHN0cmluZ3xudWxsLCBhbmNob3I6IHN0cmluZ319IHBhdGhJbmZvXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtmYWlsZWRdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzdWNjZXNzZnVsXVxuICogQHByb3BlcnR5IHtib29sZWFufSBba2VlcEluZGljYXRvcnNdXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBIdG14QWpheEV0Y1xuICogQHByb3BlcnR5IHtib29sZWFufSBbcmV0dXJuUHJvbWlzZV1cbiAqIEBwcm9wZXJ0eSB7SHRteEFqYXhIYW5kbGVyfSBbaGFuZGxlcl1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2VsZWN0XVxuICogQHByb3BlcnR5IHtFbGVtZW50fSBbdGFyZ2V0T3ZlcnJpZGVdXG4gKiBAcHJvcGVydHkge0h0bXhTd2FwU3R5bGV9IFtzd2FwT3ZlcnJpZGVdXG4gKiBAcHJvcGVydHkge1JlY29yZDxzdHJpbmcsc3RyaW5nPn0gW2hlYWRlcnNdXG4gKiBAcHJvcGVydHkge09iamVjdHxGb3JtRGF0YX0gW3ZhbHVlc11cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2NyZWRlbnRpYWxzXVxuICogQHByb3BlcnR5IHtudW1iZXJ9IFt0aW1lb3V0XVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gSHRteFJlc3BvbnNlSGFuZGxpbmdDb25maWdcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY29kZV1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gc3dhcFxuICogQHByb3BlcnR5IHtib29sZWFufSBbZXJyb3JdXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtpZ25vcmVUaXRsZV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2VsZWN0XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFt0YXJnZXRdXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3N3YXBPdmVycmlkZV1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbZXZlbnRdXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7SHRteFJlc3BvbnNlSW5mbyAmIHtzaG91bGRTd2FwOiBib29sZWFuLCBzZXJ2ZXJSZXNwb25zZTogYW55LCBpc0Vycm9yOiBib29sZWFuLCBpZ25vcmVUaXRsZTogYm9vbGVhbiwgc2VsZWN0T3ZlcnJpZGU6c3RyaW5nLCBzd2FwT3ZlcnJpZGU6c3RyaW5nfX0gSHRteEJlZm9yZVN3YXBEZXRhaWxzXG4gKi9cblxuLyoqXG4gKiBAY2FsbGJhY2sgSHRteEFqYXhIYW5kbGVyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsdFxuICogQHBhcmFtIHtIdG14UmVzcG9uc2VJbmZvfSByZXNwb25zZUluZm9cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoKCkgPT4gdm9pZCl9IEh0bXhTZXR0bGVUYXNrXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBIdG14U2V0dGxlSW5mb1xuICogQHByb3BlcnR5IHtIdG14U2V0dGxlVGFza1tdfSB0YXNrc1xuICogQHByb3BlcnR5IHtFbGVtZW50W119IGVsdHNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbdGl0bGVdXG4gKi9cblxuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iaWdza3lzb2Z0d2FyZS9odG14LWV4dGVuc2lvbnMvYmxvYi9tYWluL1JFQURNRS5tZFxuICogQHR5cGVkZWYge09iamVjdH0gSHRteEV4dGVuc2lvblxuICogQHByb3BlcnR5IHsoYXBpOiBhbnkpID0+IHZvaWR9IGluaXRcbiAqIEBwcm9wZXJ0eSB7KG5hbWU6IHN0cmluZywgZXZlbnQ6IEN1c3RvbUV2ZW50KSA9PiBib29sZWFufSBvbkV2ZW50XG4gKiBAcHJvcGVydHkgeyh0ZXh0OiBzdHJpbmcsIHhocjogWE1MSHR0cFJlcXVlc3QsIGVsdDogRWxlbWVudCkgPT4gc3RyaW5nfSB0cmFuc2Zvcm1SZXNwb25zZVxuICogQHByb3BlcnR5IHsoc3dhcFN0eWxlOiBIdG14U3dhcFN0eWxlKSA9PiBib29sZWFufSBpc0lubGluZVN3YXBcbiAqIEBwcm9wZXJ0eSB7KHN3YXBTdHlsZTogSHRteFN3YXBTdHlsZSwgdGFyZ2V0OiBOb2RlLCBmcmFnbWVudDogTm9kZSwgc2V0dGxlSW5mbzogSHRteFNldHRsZUluZm8pID0+IGJvb2xlYW58Tm9kZVtdfSBoYW5kbGVTd2FwXG4gKiBAcHJvcGVydHkgeyh4aHI6IFhNTEh0dHBSZXF1ZXN0LCBwYXJhbWV0ZXJzOiBGb3JtRGF0YSwgZWx0OiBOb2RlKSA9PiAqfHN0cmluZ3xudWxsfSBlbmNvZGVQYXJhbWV0ZXJzXG4gKiBAcHJvcGVydHkgeygpID0+IHN0cmluZ1tdfG51bGx9IGdldFNlbGVjdG9yc1xuICovXG5leHBvcnQgZGVmYXVsdCBodG14XG4iLCAiaW1wb3J0IGh0bXggZnJvbSAnaHRteC5vcmcnO1xuKGZ1bmN0aW9uKCkge1xuICBjb25zdCBsb2FkaW5nU3RhdGVzVW5kb1F1ZXVlID0gW11cblxuICBmdW5jdGlvbiBsb2FkaW5nU3RhdGVDb250YWluZXIodGFyZ2V0KSB7XG4gICAgcmV0dXJuIGh0bXguY2xvc2VzdCh0YXJnZXQsICdbZGF0YS1sb2FkaW5nLXN0YXRlc10nKSB8fCBkb2N1bWVudC5ib2R5XG4gIH1cblxuICBmdW5jdGlvbiBtYXlQcm9jZXNzVW5kb0NhbGxiYWNrKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyh0YXJnZXQpKSB7XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWF5UHJvY2Vzc0xvYWRpbmdTdGF0ZUJ5UGF0aChlbHQsIHJlcXVlc3RQYXRoKSB7XG4gICAgY29uc3QgcGF0aEVsdCA9IGh0bXguY2xvc2VzdChlbHQsICdbZGF0YS1sb2FkaW5nLXBhdGhdJylcbiAgICBpZiAoIXBhdGhFbHQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhFbHQuZ2V0QXR0cmlidXRlKCdkYXRhLWxvYWRpbmctcGF0aCcpID09PSByZXF1ZXN0UGF0aFxuICB9XG5cbiAgZnVuY3Rpb24gcXVldWVMb2FkaW5nU3RhdGUoc291cmNlRWx0LCB0YXJnZXRFbHQsIGRvQ2FsbGJhY2ssIHVuZG9DYWxsYmFjaykge1xuICAgIGNvbnN0IGRlbGF5RWx0ID0gaHRteC5jbG9zZXN0KHNvdXJjZUVsdCwgJ1tkYXRhLWxvYWRpbmctZGVsYXldJylcbiAgICBpZiAoZGVsYXlFbHQpIHtcbiAgICAgIGNvbnN0IGRlbGF5SW5NaWxsaXNlY29uZHMgPVxuICAgICAgICBkZWxheUVsdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGluZy1kZWxheScpIHx8IDIwMFxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvQ2FsbGJhY2soKVxuXG4gICAgICAgIGxvYWRpbmdTdGF0ZXNVbmRvUXVldWUucHVzaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBtYXlQcm9jZXNzVW5kb0NhbGxiYWNrKHRhcmdldEVsdCwgdW5kb0NhbGxiYWNrKVxuICAgICAgICB9KVxuICAgICAgfSwgZGVsYXlJbk1pbGxpc2Vjb25kcylcblxuICAgICAgbG9hZGluZ1N0YXRlc1VuZG9RdWV1ZS5wdXNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBtYXlQcm9jZXNzVW5kb0NhbGxiYWNrKHRhcmdldEVsdCwgZnVuY3Rpb24oKSB7IGNsZWFyVGltZW91dCh0aW1lb3V0KSB9KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9DYWxsYmFjaygpXG4gICAgICBsb2FkaW5nU3RhdGVzVW5kb1F1ZXVlLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgICAgIG1heVByb2Nlc3NVbmRvQ2FsbGJhY2sodGFyZ2V0RWx0LCB1bmRvQ2FsbGJhY2spXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvYWRpbmdTdGF0ZUVsdHMobG9hZGluZ1Njb3BlLCB0eXBlLCBwYXRoKSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oaHRteC5maW5kQWxsKGxvYWRpbmdTY29wZSwgJ1snICsgdHlwZSArICddJykpLmZpbHRlcihcbiAgICAgIGZ1bmN0aW9uKGVsdCkgeyByZXR1cm4gbWF5UHJvY2Vzc0xvYWRpbmdTdGF0ZUJ5UGF0aChlbHQsIHBhdGgpIH1cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2FkaW5nVGFyZ2V0KGVsdCkge1xuICAgIGlmIChlbHQuZ2V0QXR0cmlidXRlKCdkYXRhLWxvYWRpbmctdGFyZ2V0JykpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKFxuICAgICAgICBodG14LmZpbmRBbGwoZWx0LmdldEF0dHJpYnV0ZSgnZGF0YS1sb2FkaW5nLXRhcmdldCcpKVxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gW2VsdF1cbiAgfVxuXG4gIGh0bXguZGVmaW5lRXh0ZW5zaW9uKCdsb2FkaW5nLXN0YXRlcycsIHtcbiAgICBvbkV2ZW50OiBmdW5jdGlvbihuYW1lLCBldnQpIHtcbiAgICAgIGlmIChuYW1lID09PSAnaHRteDpiZWZvcmVSZXF1ZXN0Jykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBsb2FkaW5nU3RhdGVDb250YWluZXIoZXZ0LnRhcmdldClcblxuICAgICAgICBjb25zdCBsb2FkaW5nU3RhdGVUeXBlcyA9IFtcbiAgICAgICAgICAnZGF0YS1sb2FkaW5nJyxcbiAgICAgICAgICAnZGF0YS1sb2FkaW5nLWNsYXNzJyxcbiAgICAgICAgICAnZGF0YS1sb2FkaW5nLWNsYXNzLXJlbW92ZScsXG4gICAgICAgICAgJ2RhdGEtbG9hZGluZy1kaXNhYmxlJyxcbiAgICAgICAgICAnZGF0YS1sb2FkaW5nLWFyaWEtYnVzeSdcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbnN0IGxvYWRpbmdTdGF0ZUVsdHNCeVR5cGUgPSB7fVxuXG4gICAgICAgIGxvYWRpbmdTdGF0ZVR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgICAgICAgIGxvYWRpbmdTdGF0ZUVsdHNCeVR5cGVbdHlwZV0gPSBnZXRMb2FkaW5nU3RhdGVFbHRzKFxuICAgICAgICAgICAgY29udGFpbmVyLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGV2dC5kZXRhaWwucGF0aEluZm8ucmVxdWVzdFBhdGhcbiAgICAgICAgICApXG4gICAgICAgIH0pXG5cbiAgICAgICAgbG9hZGluZ1N0YXRlRWx0c0J5VHlwZVsnZGF0YS1sb2FkaW5nJ10uZm9yRWFjaChmdW5jdGlvbihzb3VyY2VFbHQpIHtcbiAgICAgICAgICBnZXRMb2FkaW5nVGFyZ2V0KHNvdXJjZUVsdCkuZm9yRWFjaChmdW5jdGlvbih0YXJnZXRFbHQpIHtcbiAgICAgICAgICAgIHF1ZXVlTG9hZGluZ1N0YXRlKFxuICAgICAgICAgICAgICBzb3VyY2VFbHQsXG4gICAgICAgICAgICAgIHRhcmdldEVsdCxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0RWx0LnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgICAgICAgICAgc291cmNlRWx0LmdldEF0dHJpYnV0ZSgnZGF0YS1sb2FkaW5nJykgfHxcbiAgICAgICAgICAgICAgICAgICdpbmxpbmUtYmxvY2snXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKCkgeyB0YXJnZXRFbHQuc3R5bGUuZGlzcGxheSA9ICdub25lJyB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBsb2FkaW5nU3RhdGVFbHRzQnlUeXBlWydkYXRhLWxvYWRpbmctY2xhc3MnXS5mb3JFYWNoKFxuICAgICAgICAgIGZ1bmN0aW9uKHNvdXJjZUVsdCkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IHNvdXJjZUVsdFxuICAgICAgICAgICAgICAuZ2V0QXR0cmlidXRlKCdkYXRhLWxvYWRpbmctY2xhc3MnKVxuICAgICAgICAgICAgICAuc3BsaXQoJyAnKVxuXG4gICAgICAgICAgICBnZXRMb2FkaW5nVGFyZ2V0KHNvdXJjZUVsdCkuZm9yRWFjaChmdW5jdGlvbih0YXJnZXRFbHQpIHtcbiAgICAgICAgICAgICAgcXVldWVMb2FkaW5nU3RhdGUoXG4gICAgICAgICAgICAgICAgc291cmNlRWx0LFxuICAgICAgICAgICAgICAgIHRhcmdldEVsdCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZXMuZm9yRWFjaChmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RWx0LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbHQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIClcblxuICAgICAgICBsb2FkaW5nU3RhdGVFbHRzQnlUeXBlWydkYXRhLWxvYWRpbmctY2xhc3MtcmVtb3ZlJ10uZm9yRWFjaChcbiAgICAgICAgICBmdW5jdGlvbihzb3VyY2VFbHQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBzb3VyY2VFbHRcbiAgICAgICAgICAgICAgLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2FkaW5nLWNsYXNzLXJlbW92ZScpXG4gICAgICAgICAgICAgIC5zcGxpdCgnICcpXG5cbiAgICAgICAgICAgIGdldExvYWRpbmdUYXJnZXQoc291cmNlRWx0KS5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldEVsdCkge1xuICAgICAgICAgICAgICBxdWV1ZUxvYWRpbmdTdGF0ZShcbiAgICAgICAgICAgICAgICBzb3VyY2VFbHQsXG4gICAgICAgICAgICAgICAgdGFyZ2V0RWx0LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRFbHQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWVzLmZvckVhY2goZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEVsdC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIGxvYWRpbmdTdGF0ZUVsdHNCeVR5cGVbJ2RhdGEtbG9hZGluZy1kaXNhYmxlJ10uZm9yRWFjaChcbiAgICAgICAgICBmdW5jdGlvbihzb3VyY2VFbHQpIHtcbiAgICAgICAgICAgIGdldExvYWRpbmdUYXJnZXQoc291cmNlRWx0KS5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldEVsdCkge1xuICAgICAgICAgICAgICBxdWV1ZUxvYWRpbmdTdGF0ZShcbiAgICAgICAgICAgICAgICBzb3VyY2VFbHQsXG4gICAgICAgICAgICAgICAgdGFyZ2V0RWx0LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkgeyB0YXJnZXRFbHQuZGlzYWJsZWQgPSB0cnVlIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHRhcmdldEVsdC5kaXNhYmxlZCA9IGZhbHNlIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIClcblxuICAgICAgICBsb2FkaW5nU3RhdGVFbHRzQnlUeXBlWydkYXRhLWxvYWRpbmctYXJpYS1idXN5J10uZm9yRWFjaChcbiAgICAgICAgICBmdW5jdGlvbihzb3VyY2VFbHQpIHtcbiAgICAgICAgICAgIGdldExvYWRpbmdUYXJnZXQoc291cmNlRWx0KS5mb3JFYWNoKGZ1bmN0aW9uKHRhcmdldEVsdCkge1xuICAgICAgICAgICAgICBxdWV1ZUxvYWRpbmdTdGF0ZShcbiAgICAgICAgICAgICAgICBzb3VyY2VFbHQsXG4gICAgICAgICAgICAgICAgdGFyZ2V0RWx0LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkgeyB0YXJnZXRFbHQuc2V0QXR0cmlidXRlKCdhcmlhLWJ1c3knLCAndHJ1ZScpIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IHRhcmdldEVsdC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtYnVzeScpIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgPT09ICdodG14OmJlZm9yZU9uTG9hZCcpIHtcbiAgICAgICAgd2hpbGUgKGxvYWRpbmdTdGF0ZXNVbmRvUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxvYWRpbmdTdGF0ZXNVbmRvUXVldWUuc2hpZnQoKSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KSgpXG4iLCAiLyoqXG4gKiBIVE1YIEJ1bmRsZSAtIFBoYXNlIDUuNC1IVE1YXG4gKlxuICogQnVuZGxlcyBIVE1YIDIuMC43IHdpdGggbG9hZGluZy1zdGF0ZXMgZXh0ZW5zaW9uIGZvciBsb2NhbCBkZXBsb3ltZW50LlxuICogVGhpcyBlbGltaW5hdGVzIHRoZSBsYXN0IENETiBkZXBlbmRlbmN5ICh1bnBrZy5jb20pIGFuZCBoYXJkZW5zIENTUC5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vaHRteC5vcmcvZG9jcy9cbiAqIEBzZWUgaHR0cHM6Ly9odG14Lm9yZy9leHRlbnNpb25zL2xvYWRpbmctc3RhdGVzL1xuICovXG5cbi8vIEltcG9ydCBIVE1YIDIuMC43IEVTTSBtb2R1bGVcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSBodG14Lm9yZyBwYWNrYWdlIGRvZXNuJ3Qgc2hpcCB3aXRoIFR5cGVTY3JpcHQgZGVmaW5pdGlvbnNcbmltcG9ydCBodG14IGZyb20gJ2h0bXgub3JnL2Rpc3QvaHRteC5lc20uanMnO1xuXG4vLyBJbXBvcnQgbG9hZGluZy1zdGF0ZXMgZXh0ZW5zaW9uXG4vLyBAdHMtZXhwZWN0LWVycm9yIC0gaHRteC1leHQtbG9hZGluZy1zdGF0ZXMgZG9lc24ndCBzaGlwIHdpdGggVHlwZVNjcmlwdCBkZWZpbml0aW9uc1xuaW1wb3J0ICdodG14LWV4dC1sb2FkaW5nLXN0YXRlcyc7XG5cbi8vIEV4cG9zZSBIVE1YIGdsb2JhbGx5IGZvciBjb21wYXRpYmlsaXR5IHdpdGggaW5saW5lIHNjcmlwdHNcbi8vIFVzZSBnbG9iYWxUaGlzIGluc3RlYWQgb2Ygd2luZG93IGZvciBiZXR0ZXIgY29tcGF0aWJpbGl0eVxuZ2xvYmFsVGhpcy5odG14ID0gaHRteDtcblxuLy8gVmVyaWZ5IEhUTVggaXMgbG9hZGVkXG5pZiAoZ2xvYmFsVGhpcy5odG14ID09PSB1bmRlZmluZWQpIHtcbiAgY29uc29sZS5lcnJvcignW0hUTVggQnVuZGxlXSBGYWlsZWQgdG8gbG9hZCBIVE1YJyk7XG59IGVsc2Uge1xuICBjb25zb2xlLmluZm8oJ1tIVE1YIEJ1bmRsZV0gSFRNWCAyLjAuNyBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFJQSxTQUFRLFdBQVc7QUFDckI7QUFHQSxVQUFNLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlYLFFBQVE7QUFBQTtBQUFBLE1BRVIsU0FBUztBQUFBO0FBQUEsTUFFVCxJQUFJO0FBQUE7QUFBQSxNQUVKLEtBQUs7QUFBQTtBQUFBLE1BRUwsU0FBUztBQUFBO0FBQUEsTUFFVCxNQUFNO0FBQUE7QUFBQTtBQUFBLE1BR04sTUFBTTtBQUFBO0FBQUEsTUFFTixTQUFTO0FBQUE7QUFBQSxNQUVULFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQVVULFFBQVEsU0FBUyxLQUFLLE1BQU07QUFDMUIsY0FBTSxjQUFjLGVBQWUsS0FBSyxRQUFRLE1BQU07QUFDdEQsZUFBTyxZQUFZO0FBQUEsTUFDckI7QUFBQTtBQUFBO0FBQUEsTUFHQSxRQUFRO0FBQUE7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VztBQUNULCtCQUFXLFFBQVEsU0FBUyxXQUFXO0FBQ3JDLGdDQUFVLFVBQVUsT0FBTyxTQUFTO0FBQUEsb0JBQ3RDLENBQUM7QUFBQSxrQkFDSDtBQUFBLGtCQUNBLFdBQVc7QUFDVCwrQkFBVyxRQUFRLFNBQVMsV0FBVztBQUNyQyxnQ0FBVSxVQUFVLElBQUksU0FBUztBQUFBLG9CQUNuQyxDQUFDO0FBQUEsa0JBQ0g7QUFBQSxnQkFDRjtBQUFBLGNBQ0YsQ0FBQztBQUFBLFlBQ0g7QUFBQSxVQUNGO0FBRUEsaUNBQXVCLHNCQUFzQixFQUFFO0FBQUEsWUFDN0MsU0FBUyxXQUFXO0FBQ2xCLCtCQUFpQixTQUFTLEVBQUUsUUFBUSxTQUFTLFdBQVc7QUFDdEQ7QUFBQSxrQkFDRTtBQUFBLGtCQUNBO0FBQUEsa0JBQ0EsV0FBVztBQUFFLDhCQUFVLFdBQVc7QUFBQSxrQkFBSztBQUFBLGtCQUN2QyxXQUFXO0FBQUUsOEJBQVUsV0FBVztBQUFBLGtCQUFNO0FBQUEsZ0JBQzFDO0FBQUEsY0FDRixDQUFDO0FBQUEsWUFDSDtBQUFBLFVBQ0Y7QUFFQSxpQ0FBdUIsd0JBQXdCLEVBQUU7QUFBQSxZQUMvQyxTQUFTLFdBQVc7QUFDbEIsK0JBQWlCLFNBQVMsRUFBRSxRQUFRLFNBQVMsV0FBVztBQUN0RDtBQUFBLGtCQUNFO0FBQUEsa0JBQ0E7QUFBQSxrQkFDQSxXQUFXO0FBQUUsOEJBQVUsYUFBYSxhQUFhLE1BQU07QUFBQSxrQkFBRTtBQUFBLGtCQUN6RCxXQUFXO0FBQUUsOEJBQVUsZ0JBQWdCLFdBQVc7QUFBQSxrQkFBRTtBQUFBLGdCQUN0RDtBQUFBLGNBQ0YsQ0FBQztBQUFBLFlBQ0g7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLFlBQUksU0FBUyxxQkFBcUI7QUFDaEMsaUJBQU8sdUJBQXVCLFNBQVMsR0FBRztBQUN4QyxtQ0FBdUIsTUFBTSxFQUFFO0FBQUEsVUFDakM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsR0FBRzs7O0FDcEtILGFBQVcsT0FBTztBQUdsQixNQUFJLFdBQVcsU0FBUyxRQUFXO0FBQ2pDLFlBQVEsTUFBTSxtQ0FBbUM7QUFBQSxFQUNuRCxPQUFPO0FBQ0wsWUFBUSxLQUFLLDhDQUE4QztBQUFBLEVBQzdEOyIsCiAgIm5hbWVzIjogWyJodG14IiwgInN0ciIsICJzZWxlY3RvciIsICJlbHQiLCAiZXh0ZW5zaW9ucyIsICJwYXJlbnRFbHQiLCAicHJvbXB0IiwgInRhcmdldCIsICJldmVudCJdCn0K
