'use strict';
(() => {
  // node_modules/@alpinejs/csp/dist/module.esm.js
  var flushPending = false;
  var flushing = false;
  var queue = [];
  var lastFlushedIndex = -1;
  function scheduler(callback) {
    queueJob(callback);
  }
  function queueJob(job) {
    if (!queue.includes(job)) queue.push(job);
    queueFlush();
  }
  function dequeueJob(job) {
    let index = queue.indexOf(job);
    if (index !== -1 && index > lastFlushedIndex) queue.splice(index, 1);
  }
  function queueFlush() {
    if (!flushing && !flushPending) {
      flushPending = true;
      queueMicrotask(flushJobs);
    }
  }
  function flushJobs() {
    flushPending = false;
    flushing = true;
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
      lastFlushedIndex = i;
    }
    queue.length = 0;
    lastFlushedIndex = -1;
    flushing = false;
  }
  var reactive;
  var effect;
  var release;
  var raw;
  var shouldSchedule = true;
  function disableEffectScheduling(callback) {
    shouldSchedule = false;
    callback();
    shouldSchedule = true;
  }
  function setReactivityEngine(engine) {
    reactive = engine.reactive;
    release = engine.release;
    effect = (callback) =>
      engine.effect(callback, {
        scheduler: (task) => {
          if (shouldSchedule) {
            scheduler(task);
          } else {
            task();
          }
        },
      });
    raw = engine.raw;
  }
  function overrideEffect(override) {
    effect = override;
  }
  function elementBoundEffect(el) {
    let cleanup2 = () => {};
    let wrappedEffect = (callback) => {
      let effectReference = effect(callback);
      if (!el._x_effects) {
        el._x_effects = /* @__PURE__ */ new Set();
        el._x_runEffects = () => {
          el._x_effects.forEach((i) => i());
        };
      }
      el._x_effects.add(effectReference);
      cleanup2 = () => {
        if (effectReference === void 0) return;
        el._x_effects.delete(effectReference);
        release(effectReference);
      };
      return effectReference;
    };
    return [
      wrappedEffect,
      () => {
        cleanup2();
      },
    ];
  }
  function watch(getter, callback) {
    let firstTime = true;
    let oldValue;
    let effectReference = effect(() => {
      let value = getter();
      JSON.stringify(value);
      if (!firstTime) {
        queueMicrotask(() => {
          callback(value, oldValue);
          oldValue = value;
        });
      } else {
        oldValue = value;
      }
      firstTime = false;
    });
    return () => release(effectReference);
  }
  var onAttributeAddeds = [];
  var onElRemoveds = [];
  var onElAddeds = [];
  function onElAdded(callback) {
    onElAddeds.push(callback);
  }
  function onElRemoved(el, callback) {
    if (typeof callback === 'function') {
      if (!el._x_cleanups) el._x_cleanups = [];
      el._x_cleanups.push(callback);
    } else {
      callback = el;
      onElRemoveds.push(callback);
    }
  }
  function onAttributesAdded(callback) {
    onAttributeAddeds.push(callback);
  }
  function onAttributeRemoved(el, name, callback) {
    if (!el._x_attributeCleanups) el._x_attributeCleanups = {};
    if (!el._x_attributeCleanups[name]) el._x_attributeCleanups[name] = [];
    el._x_attributeCleanups[name].push(callback);
  }
  function cleanupAttributes(el, names) {
    if (!el._x_attributeCleanups) return;
    Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
      if (names === void 0 || names.includes(name)) {
        value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      }
    });
  }
  function cleanupElement(el) {
    el._x_effects?.forEach(dequeueJob);
    while (el._x_cleanups?.length) el._x_cleanups.pop()();
  }
  var observer = new MutationObserver(onMutate);
  var currentlyObserving = false;
  function startObservingMutations() {
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });
    currentlyObserving = true;
  }
  function stopObservingMutations() {
    flushObserver();
    observer.disconnect();
    currentlyObserving = false;
  }
  var queuedMutations = [];
  function flushObserver() {
    let records = observer.takeRecords();
    queuedMutations.push(() => records.length > 0 && onMutate(records));
    let queueLengthWhenTriggered = queuedMutations.length;
    queueMicrotask(() => {
      if (queuedMutations.length === queueLengthWhenTriggered) {
        while (queuedMutations.length > 0) queuedMutations.shift()();
      }
    });
  }
  function mutateDom(callback) {
    if (!currentlyObserving) return callback();
    stopObservingMutations();
    let result = callback();
    startObservingMutations();
    return result;
  }
  var isCollecting = false;
  var deferredMutations = [];
  function deferMutations() {
    isCollecting = true;
  }
  function flushAndStopDeferringMutations() {
    isCollecting = false;
    onMutate(deferredMutations);
    deferredMutations = [];
  }
  function onMutate(mutations) {
    if (isCollecting) {
      deferredMutations = deferredMutations.concat(mutations);
      return;
    }
    let addedNodes = [];
    let removedNodes = /* @__PURE__ */ new Set();
    let addedAttributes = /* @__PURE__ */ new Map();
    let removedAttributes = /* @__PURE__ */ new Map();
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].target._x_ignoreMutationObserver) continue;
      if (mutations[i].type === 'childList') {
        mutations[i].removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (!node._x_marker) return;
          removedNodes.add(node);
        });
        mutations[i].addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (removedNodes.has(node)) {
            removedNodes.delete(node);
            return;
          }
          if (node._x_marker) return;
          addedNodes.push(node);
        });
      }
      if (mutations[i].type === 'attributes') {
        let el = mutations[i].target;
        let name = mutations[i].attributeName;
        let oldValue = mutations[i].oldValue;
        let add2 = () => {
          if (!addedAttributes.has(el)) addedAttributes.set(el, []);
          addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
        };
        let remove = () => {
          if (!removedAttributes.has(el)) removedAttributes.set(el, []);
          removedAttributes.get(el).push(name);
        };
        if (el.hasAttribute(name) && oldValue === null) {
          add2();
        } else if (el.hasAttribute(name)) {
          remove();
          add2();
        } else {
          remove();
        }
      }
    }
    removedAttributes.forEach((attrs, el) => {
      cleanupAttributes(el, attrs);
    });
    addedAttributes.forEach((attrs, el) => {
      onAttributeAddeds.forEach((i) => i(el, attrs));
    });
    for (let node of removedNodes) {
      if (addedNodes.some((i) => i.contains(node))) continue;
      onElRemoveds.forEach((i) => i(node));
    }
    for (let node of addedNodes) {
      if (!node.isConnected) continue;
      onElAddeds.forEach((i) => i(node));
    }
    addedNodes = null;
    removedNodes = null;
    addedAttributes = null;
    removedAttributes = null;
  }
  function scope(node) {
    return mergeProxies(closestDataStack(node));
  }
  function addScopeToNode(node, data2, referenceNode) {
    node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
    };
  }
  function closestDataStack(node) {
    if (node._x_dataStack) return node._x_dataStack;
    if (typeof ShadowRoot === 'function' && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }
  function mergeProxies(objects) {
    return new Proxy({ objects }, mergeProxyTrap);
  }
  var mergeProxyTrap = {
    ownKeys({ objects }) {
      return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
    },
    has({ objects }, name) {
      if (name == Symbol.unscopables) return false;
      return objects.some(
        (obj) => Object.prototype.hasOwnProperty.call(obj, name) || Reflect.has(obj, name)
      );
    },
    get({ objects }, name, thisProxy) {
      if (name == 'toJSON') return collapseProxies;
      return Reflect.get(objects.find((obj) => Reflect.has(obj, name)) || {}, name, thisProxy);
    },
    set({ objects }, name, value, thisProxy) {
      const target =
        objects.find((obj) => Object.prototype.hasOwnProperty.call(obj, name)) ||
        objects[objects.length - 1];
      const descriptor = Object.getOwnPropertyDescriptor(target, name);
      if (descriptor?.set && descriptor?.get) return descriptor.set.call(thisProxy, value) || true;
      return Reflect.set(target, name, value);
    },
  };
  function collapseProxies() {
    let keys = Reflect.ownKeys(this);
    return keys.reduce((acc, key) => {
      acc[key] = Reflect.get(this, key);
      return acc;
    }, {});
  }
  function initInterceptors(data2) {
    let isObject2 = (val) => typeof val === 'object' && !Array.isArray(val) && val !== null;
    let recurse = (obj, basePath = '') => {
      Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(
        ([key, { value, enumerable }]) => {
          if (enumerable === false || value === void 0) return;
          if (typeof value === 'object' && value !== null && value.__v_skip) return;
          let path = basePath === '' ? key : `${basePath}.${key}`;
          if (typeof value === 'object' && value !== null && value._x_interceptor) {
            obj[key] = value.initialize(data2, path, key);
          } else {
            if (isObject2(value) && value !== obj && !(value instanceof Element)) {
              recurse(value, path);
            }
          }
        }
      );
    };
    return recurse(data2);
  }
  function interceptor(callback, mutateObj = () => {}) {
    let obj = {
      initialValue: void 0,
      _x_interceptor: true,
      initialize(data2, path, key) {
        return callback(
          this.initialValue,
          () => get(data2, path),
          (value) => set(data2, path, value),
          path,
          key
        );
      },
    };
    mutateObj(obj);
    return (initialValue) => {
      if (
        typeof initialValue === 'object' &&
        initialValue !== null &&
        initialValue._x_interceptor
      ) {
        let initialize = obj.initialize.bind(obj);
        obj.initialize = (data2, path, key) => {
          let innerValue = initialValue.initialize(data2, path, key);
          obj.initialValue = innerValue;
          return initialize(data2, path, key);
        };
      } else {
        obj.initialValue = initialValue;
      }
      return obj;
    };
  }
  function get(obj, path) {
    return path.split('.').reduce((carry, segment) => carry[segment], obj);
  }
  function set(obj, path, value) {
    if (typeof path === 'string') path = path.split('.');
    if (path.length === 1) obj[path[0]] = value;
    else if (path.length === 0) throw error;
    else {
      if (obj[path[0]]) return set(obj[path[0]], path.slice(1), value);
      else {
        obj[path[0]] = {};
        return set(obj[path[0]], path.slice(1), value);
      }
    }
  }
  var magics = {};
  function magic(name, callback) {
    magics[name] = callback;
  }
  function injectMagics(obj, el) {
    let memoizedUtilities = getUtilities(el);
    Object.entries(magics).forEach(([name, callback]) => {
      Object.defineProperty(obj, `$${name}`, {
        get() {
          return callback(el, memoizedUtilities);
        },
        enumerable: false,
      });
    });
    return obj;
  }
  function getUtilities(el) {
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    let utils = { interceptor, ...utilities };
    onElRemoved(el, cleanup2);
    return utils;
  }
  function tryCatch(el, expression, callback, ...args) {
    try {
      return callback(...args);
    } catch (e) {
      handleError(e, el, expression);
    }
  }
  function handleError(error2, el, expression = void 0) {
    error2 = Object.assign(error2 ?? { message: 'No error message given.' }, { el, expression });
    console.warn(
      `Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ''}`,
      el
    );
    setTimeout(() => {
      throw error2;
    }, 0);
  }
  var shouldAutoEvaluateFunctions = true;
  function dontAutoEvaluateFunctions(callback) {
    let cache = shouldAutoEvaluateFunctions;
    shouldAutoEvaluateFunctions = false;
    let result = callback();
    shouldAutoEvaluateFunctions = cache;
    return result;
  }
  function evaluate(el, expression, extras = {}) {
    let result;
    evaluateLater(el, expression)((value) => (result = value), extras);
    return result;
  }
  function evaluateLater(...args) {
    return theEvaluatorFunction(...args);
  }
  var theEvaluatorFunction = normalEvaluator;
  function setEvaluator(newEvaluator) {
    theEvaluatorFunction = newEvaluator;
  }
  function normalEvaluator(el, expression) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    let dataStack = [overriddenMagics, ...closestDataStack(el)];
    let evaluator =
      typeof expression === 'function'
        ? generateEvaluatorFromFunction(dataStack, expression)
        : generateEvaluatorFromString(dataStack, expression, el);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateEvaluatorFromFunction(dataStack, func) {
    return (receiver = () => {}, { scope: scope2 = {}, params = [], context } = {}) => {
      let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
      runIfTypeOfFunction(receiver, result);
    };
  }
  var evaluatorMemo = {};
  function generateFunctionFromString(expression, el) {
    if (evaluatorMemo[expression]) {
      return evaluatorMemo[expression];
    }
    let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let rightSideSafeExpression =
      /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim())
        ? `(async()=>{ ${expression} })()`
        : expression;
    const safeAsyncFunction = () => {
      try {
        let func2 = new AsyncFunction(
          ['__self', 'scope'],
          `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`
        );
        Object.defineProperty(func2, 'name', {
          value: `[Alpine] ${expression}`,
        });
        return func2;
      } catch (error2) {
        handleError(error2, el, expression);
        return Promise.resolve();
      }
    };
    let func = safeAsyncFunction();
    evaluatorMemo[expression] = func;
    return func;
  }
  function generateEvaluatorFromString(dataStack, expression, el) {
    let func = generateFunctionFromString(expression, el);
    return (receiver = () => {}, { scope: scope2 = {}, params = [], context } = {}) => {
      func.result = void 0;
      func.finished = false;
      let completeScope = mergeProxies([scope2, ...dataStack]);
      if (typeof func === 'function') {
        let promise = func
          .call(context, func, completeScope)
          .catch((error2) => handleError(error2, el, expression));
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
          func.result = void 0;
        } else {
          promise
            .then((result) => {
              runIfTypeOfFunction(receiver, result, completeScope, params, el);
            })
            .catch((error2) => handleError(error2, el, expression))
            .finally(() => (func.result = void 0));
        }
      }
    };
  }
  function runIfTypeOfFunction(receiver, value, scope2, params, el) {
    if (shouldAutoEvaluateFunctions && typeof value === 'function') {
      let result = value.apply(scope2, params);
      if (result instanceof Promise) {
        result
          .then((i) => runIfTypeOfFunction(receiver, i, scope2, params))
          .catch((error2) => handleError(error2, el, value));
      } else {
        receiver(result);
      }
    } else if (typeof value === 'object' && value instanceof Promise) {
      value.then((i) => receiver(i));
    } else {
      receiver(value);
    }
  }
  var prefixAsString = 'x-';
  function prefix(subject = '') {
    return prefixAsString + subject;
  }
  function setPrefix(newPrefix) {
    prefixAsString = newPrefix;
  }
  var directiveHandlers = {};
  function directive(name, callback) {
    directiveHandlers[name] = callback;
    return {
      before(directive2) {
        if (!directiveHandlers[directive2]) {
          console.warn(
            String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`
          );
          return;
        }
        const pos = directiveOrder.indexOf(directive2);
        directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf('DEFAULT'), 0, name);
      },
    };
  }
  function directiveExists(name) {
    return Object.keys(directiveHandlers).includes(name);
  }
  function directives(el, attributes, originalAttributeOverride) {
    attributes = Array.from(attributes);
    if (el._x_virtualDirectives) {
      let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({
        name,
        value,
      }));
      let staticAttributes = attributesOnly(vAttributes);
      vAttributes = vAttributes.map((attribute) => {
        if (staticAttributes.find((attr) => attr.name === attribute.name)) {
          return {
            name: `x-bind:${attribute.name}`,
            value: `"${attribute.value}"`,
          };
        }
        return attribute;
      });
      attributes = attributes.concat(vAttributes);
    }
    let transformedAttributeMap = {};
    let directives2 = attributes
      .map(
        toTransformedAttributes((newName, oldName) => (transformedAttributeMap[newName] = oldName))
      )
      .filter(outNonAlpineAttributes)
      .map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride))
      .sort(byPriority);
    return directives2.map((directive2) => {
      return getDirectiveHandler(el, directive2);
    });
  }
  function attributesOnly(attributes) {
    return Array.from(attributes)
      .map(toTransformedAttributes())
      .filter((attr) => !outNonAlpineAttributes(attr));
  }
  var isDeferringHandlers = false;
  var directiveHandlerStacks = /* @__PURE__ */ new Map();
  var currentHandlerStackKey = Symbol();
  function deferHandlingDirectives(callback) {
    isDeferringHandlers = true;
    let key = Symbol();
    currentHandlerStackKey = key;
    directiveHandlerStacks.set(key, []);
    let flushHandlers = () => {
      while (directiveHandlerStacks.get(key).length) directiveHandlerStacks.get(key).shift()();
      directiveHandlerStacks.delete(key);
    };
    let stopDeferring = () => {
      isDeferringHandlers = false;
      flushHandlers();
    };
    callback(flushHandlers);
    stopDeferring();
  }
  function getElementBoundUtilities(el) {
    let cleanups = [];
    let cleanup2 = (callback) => cleanups.push(callback);
    let [effect3, cleanupEffect] = elementBoundEffect(el);
    cleanups.push(cleanupEffect);
    let utilities = {
      Alpine: alpine_default,
      effect: effect3,
      cleanup: cleanup2,
      evaluateLater: evaluateLater.bind(evaluateLater, el),
      evaluate: evaluate.bind(evaluate, el),
    };
    let doCleanup = () => cleanups.forEach((i) => i());
    return [utilities, doCleanup];
  }
  function getDirectiveHandler(el, directive2) {
    let noop = () => {};
    let handler4 = directiveHandlers[directive2.type] || noop;
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    onAttributeRemoved(el, directive2.original, cleanup2);
    let fullHandler = () => {
      if (el._x_ignore || el._x_ignoreSelf) return;
      handler4.inline && handler4.inline(el, directive2, utilities);
      handler4 = handler4.bind(handler4, el, directive2, utilities);
      isDeferringHandlers
        ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4)
        : handler4();
    };
    fullHandler.runCleanups = cleanup2;
    return fullHandler;
  }
  var startingWith =
    (subject, replacement) =>
    ({ name, value }) => {
      if (name.startsWith(subject)) name = name.replace(subject, replacement);
      return { name, value };
    };
  var into = (i) => i;
  function toTransformedAttributes(callback = () => {}) {
    return ({ name, value }) => {
      let { name: newName, value: newValue } = attributeTransformers.reduce(
        (carry, transform) => {
          return transform(carry);
        },
        { name, value }
      );
      if (newName !== name) callback(newName, name);
      return { name: newName, value: newValue };
    };
  }
  var attributeTransformers = [];
  function mapAttributes(callback) {
    attributeTransformers.push(callback);
  }
  function outNonAlpineAttributes({ name }) {
    return alpineAttributeRegex().test(name);
  }
  var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
  function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
    return ({ name, value }) => {
      let typeMatch = name.match(alpineAttributeRegex());
      let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
      let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      let original = originalAttributeOverride || transformedAttributeMap[name] || name;
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map((i) => i.replace('.', '')),
        expression: value,
        original,
      };
    };
  }
  var DEFAULT = 'DEFAULT';
  var directiveOrder = [
    'ignore',
    'ref',
    'data',
    'id',
    'anchor',
    'bind',
    'init',
    'for',
    'model',
    'modelable',
    'transition',
    'show',
    'if',
    DEFAULT,
    'teleport',
  ];
  function byPriority(a, b) {
    let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
    let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
    return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
  }
  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        // Allows events to pass the shadow DOM barrier.
        composed: true,
        cancelable: true,
      })
    );
  }
  function walk(el, callback) {
    if (typeof ShadowRoot === 'function' && el instanceof ShadowRoot) {
      Array.from(el.children).forEach((el2) => walk(el2, callback));
      return;
    }
    let skip = false;
    callback(el, () => (skip = true));
    if (skip) return;
    let node = el.firstElementChild;
    while (node) {
      walk(node, callback, false);
      node = node.nextElementSibling;
    }
  }
  function warn(message, ...args) {
    console.warn(`Alpine Warning: ${message}`, ...args);
  }
  var started = false;
  function start() {
    if (started)
      warn(
        'Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.'
      );
    started = true;
    if (!document.body)
      warn(
        "Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?"
      );
    dispatch(document, 'alpine:init');
    dispatch(document, 'alpine:initializing');
    startObservingMutations();
    onElAdded((el) => initTree(el, walk));
    onElRemoved((el) => destroyTree(el));
    onAttributesAdded((el, attrs) => {
      directives(el, attrs).forEach((handle) => handle());
    });
    let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
    Array.from(document.querySelectorAll(allSelectors().join(',')))
      .filter(outNestedComponents)
      .forEach((el) => {
        initTree(el);
      });
    dispatch(document, 'alpine:initialized');
    setTimeout(() => {
      warnAboutMissingPlugins();
    });
  }
  var rootSelectorCallbacks = [];
  var initSelectorCallbacks = [];
  function rootSelectors() {
    return rootSelectorCallbacks.map((fn) => fn());
  }
  function allSelectors() {
    return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
  }
  function addRootSelector(selectorCallback) {
    rootSelectorCallbacks.push(selectorCallback);
  }
  function addInitSelector(selectorCallback) {
    initSelectorCallbacks.push(selectorCallback);
  }
  function closestRoot(el, includeInitSelectors = false) {
    return findClosest(el, (element) => {
      const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
      if (selectors.some((selector) => element.matches(selector))) return true;
    });
  }
  function findClosest(el, callback) {
    if (!el) return;
    if (callback(el)) return el;
    if (el._x_teleportBack) el = el._x_teleportBack;
    if (!el.parentElement) return;
    return findClosest(el.parentElement, callback);
  }
  function isRoot(el) {
    return rootSelectors().some((selector) => el.matches(selector));
  }
  var initInterceptors2 = [];
  function interceptInit(callback) {
    initInterceptors2.push(callback);
  }
  var markerDispenser = 1;
  function initTree(el, walker = walk, intercept = () => {}) {
    if (findClosest(el, (i) => i._x_ignore)) return;
    deferHandlingDirectives(() => {
      walker(el, (el2, skip) => {
        if (el2._x_marker) return;
        intercept(el2, skip);
        initInterceptors2.forEach((i) => i(el2, skip));
        directives(el2, el2.attributes).forEach((handle) => handle());
        if (!el2._x_ignore) el2._x_marker = markerDispenser++;
        el2._x_ignore && skip();
      });
    });
  }
  function destroyTree(root, walker = walk) {
    walker(root, (el) => {
      cleanupElement(el);
      cleanupAttributes(el);
      delete el._x_marker;
    });
  }
  function warnAboutMissingPlugins() {
    let pluginDirectives = [
      ['ui', 'dialog', ['[x-dialog], [x-popover]']],
      ['anchor', 'anchor', ['[x-anchor]']],
      ['sort', 'sort', ['[x-sort]']],
    ];
    pluginDirectives.forEach(([plugin2, directive2, selectors]) => {
      if (directiveExists(directive2)) return;
      selectors.some((selector) => {
        if (document.querySelector(selector)) {
          warn(`found "${selector}", but missing ${plugin2} plugin`);
          return true;
        }
      });
    });
  }
  var tickStack = [];
  var isHolding = false;
  function nextTick(callback = () => {}) {
    queueMicrotask(() => {
      isHolding ||
        setTimeout(() => {
          releaseNextTicks();
        });
    });
    return new Promise((res) => {
      tickStack.push(() => {
        callback();
        res();
      });
    });
  }
  function releaseNextTicks() {
    isHolding = false;
    while (tickStack.length) tickStack.shift()();
  }
  function holdNextTicks() {
    isHolding = true;
  }
  function setClasses(el, value) {
    if (Array.isArray(value)) {
      return setClassesFromString(el, value.join(' '));
    } else if (typeof value === 'object' && value !== null) {
      return setClassesFromObject(el, value);
    } else if (typeof value === 'function') {
      return setClasses(el, value());
    }
    return setClassesFromString(el, value);
  }
  function setClassesFromString(el, classString) {
    let split = (classString2) => classString2.split(' ').filter(Boolean);
    let missingClasses = (classString2) =>
      classString2
        .split(' ')
        .filter((i) => !el.classList.contains(i))
        .filter(Boolean);
    let addClassesAndReturnUndo = (classes) => {
      el.classList.add(...classes);
      return () => {
        el.classList.remove(...classes);
      };
    };
    classString = classString === true ? (classString = '') : classString || '';
    return addClassesAndReturnUndo(missingClasses(classString));
  }
  function setClassesFromObject(el, classObject) {
    let split = (classString) => classString.split(' ').filter(Boolean);
    let forAdd = Object.entries(classObject)
      .flatMap(([classString, bool]) => (bool ? split(classString) : false))
      .filter(Boolean);
    let forRemove = Object.entries(classObject)
      .flatMap(([classString, bool]) => (!bool ? split(classString) : false))
      .filter(Boolean);
    let added = [];
    let removed = [];
    forRemove.forEach((i) => {
      if (el.classList.contains(i)) {
        el.classList.remove(i);
        removed.push(i);
      }
    });
    forAdd.forEach((i) => {
      if (!el.classList.contains(i)) {
        el.classList.add(i);
        added.push(i);
      }
    });
    return () => {
      removed.forEach((i) => el.classList.add(i));
      added.forEach((i) => el.classList.remove(i));
    };
  }
  function setStyles(el, value) {
    if (typeof value === 'object' && value !== null) {
      return setStylesFromObject(el, value);
    }
    return setStylesFromString(el, value);
  }
  function setStylesFromObject(el, value) {
    let previousStyles = {};
    Object.entries(value).forEach(([key, value2]) => {
      previousStyles[key] = el.style[key];
      if (!key.startsWith('--')) {
        key = kebabCase(key);
      }
      el.style.setProperty(key, value2);
    });
    setTimeout(() => {
      if (el.style.length === 0) {
        el.removeAttribute('style');
      }
    });
    return () => {
      setStyles(el, previousStyles);
    };
  }
  function setStylesFromString(el, value) {
    let cache = el.getAttribute('style', value);
    el.setAttribute('style', value);
    return () => {
      el.setAttribute('style', cache || '');
    };
  }
  function kebabCase(subject) {
    return subject.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function once(callback, fallback = () => {}) {
    let called = false;
    return function () {
      if (!called) {
        called = true;
        callback.apply(this, arguments);
      } else {
        fallback.apply(this, arguments);
      }
    };
  }
  directive('transition', (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
    if (typeof expression === 'function') expression = evaluate2(expression);
    if (expression === false) return;
    if (!expression || typeof expression === 'boolean') {
      registerTransitionsFromHelper(el, modifiers, value);
    } else {
      registerTransitionsFromClassString(el, expression, value);
    }
  });
  function registerTransitionsFromClassString(el, classString, stage) {
    registerTransitionObject(el, setClasses, '');
    let directiveStorageMap = {
      enter: (classes) => {
        el._x_transition.enter.during = classes;
      },
      'enter-start': (classes) => {
        el._x_transition.enter.start = classes;
      },
      'enter-end': (classes) => {
        el._x_transition.enter.end = classes;
      },
      leave: (classes) => {
        el._x_transition.leave.during = classes;
      },
      'leave-start': (classes) => {
        el._x_transition.leave.start = classes;
      },
      'leave-end': (classes) => {
        el._x_transition.leave.end = classes;
      },
    };
    directiveStorageMap[stage](classString);
  }
  function registerTransitionsFromHelper(el, modifiers, stage) {
    registerTransitionObject(el, setStyles);
    let doesntSpecify = !modifiers.includes('in') && !modifiers.includes('out') && !stage;
    let transitioningIn = doesntSpecify || modifiers.includes('in') || ['enter'].includes(stage);
    let transitioningOut = doesntSpecify || modifiers.includes('out') || ['leave'].includes(stage);
    if (modifiers.includes('in') && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index < modifiers.indexOf('out'));
    }
    if (modifiers.includes('out') && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index > modifiers.indexOf('out'));
    }
    let wantsAll = !modifiers.includes('opacity') && !modifiers.includes('scale');
    let wantsOpacity = wantsAll || modifiers.includes('opacity');
    let wantsScale = wantsAll || modifiers.includes('scale');
    let opacityValue = wantsOpacity ? 0 : 1;
    let scaleValue = wantsScale ? modifierValue(modifiers, 'scale', 95) / 100 : 1;
    let delay3 = modifierValue(modifiers, 'delay', 0) / 1e3;
    let origin = modifierValue(modifiers, 'origin', 'center');
    let property = 'opacity, transform';
    let durationIn = modifierValue(modifiers, 'duration', 150) / 1e3;
    let durationOut = modifierValue(modifiers, 'duration', 75) / 1e3;
    let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
    if (transitioningIn) {
      el._x_transition.enter.during = {
        transformOrigin: origin,
        transitionDelay: `${delay3}s`,
        transitionProperty: property,
        transitionDuration: `${durationIn}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.enter.start = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
      el._x_transition.enter.end = {
        opacity: 1,
        transform: `scale(1)`,
      };
    }
    if (transitioningOut) {
      el._x_transition.leave.during = {
        transformOrigin: origin,
        transitionDelay: `${delay3}s`,
        transitionProperty: property,
        transitionDuration: `${durationOut}s`,
        transitionTimingFunction: easing,
      };
      el._x_transition.leave.start = {
        opacity: 1,
        transform: `scale(1)`,
      };
      el._x_transition.leave.end = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`,
      };
    }
  }
  function registerTransitionObject(el, setFunction, defaultValue = {}) {
    if (!el._x_transition)
      el._x_transition = {
        enter: { during: defaultValue, start: defaultValue, end: defaultValue },
        leave: { during: defaultValue, start: defaultValue, end: defaultValue },
        in(before = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.enter.during,
              start: this.enter.start,
              end: this.enter.end,
            },
            before,
            after
          );
        },
        out(before = () => {}, after = () => {}) {
          transition(
            el,
            setFunction,
            {
              during: this.leave.during,
              start: this.leave.start,
              end: this.leave.end,
            },
            before,
            after
          );
        },
      };
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function (el, value, show, hide) {
    const nextTick2 = document.visibilityState === 'visible' ? requestAnimationFrame : setTimeout;
    let clickAwayCompatibleShow = () => nextTick2(show);
    if (value) {
      if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
        el._x_transition.enter &&
        (Object.entries(el._x_transition.enter.during).length ||
          Object.entries(el._x_transition.enter.start).length ||
          Object.entries(el._x_transition.enter.end).length)
          ? el._x_transition.in(show)
          : clickAwayCompatibleShow();
      } else {
        el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
      }
      return;
    }
    el._x_hidePromise = el._x_transition
      ? new Promise((resolve, reject) => {
          el._x_transition.out(
            () => {},
            () => resolve(hide)
          );
          el._x_transitioning &&
            el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
        })
      : Promise.resolve(hide);
    queueMicrotask(() => {
      let closest = closestHide(el);
      if (closest) {
        if (!closest._x_hideChildren) closest._x_hideChildren = [];
        closest._x_hideChildren.push(el);
      } else {
        nextTick2(() => {
          let hideAfterChildren = (el2) => {
            let carry = Promise.all([
              el2._x_hidePromise,
              ...(el2._x_hideChildren || []).map(hideAfterChildren),
            ]).then(([i]) => i?.());
            delete el2._x_hidePromise;
            delete el2._x_hideChildren;
            return carry;
          };
          hideAfterChildren(el).catch((e) => {
            if (!e.isFromCancelledTransition) throw e;
          });
        });
      }
    });
  };
  function closestHide(el) {
    let parent = el.parentNode;
    if (!parent) return;
    return parent._x_hidePromise ? parent : closestHide(parent);
  }
  function transition(
    el,
    setFunction,
    { during, start: start2, end } = {},
    before = () => {},
    after = () => {}
  ) {
    if (el._x_transitioning) el._x_transitioning.cancel();
    if (
      Object.keys(during).length === 0 &&
      Object.keys(start2).length === 0 &&
      Object.keys(end).length === 0
    ) {
      before();
      after();
      return;
    }
    let undoStart, undoDuring, undoEnd;
    performTransition(el, {
      start() {
        undoStart = setFunction(el, start2);
      },
      during() {
        undoDuring = setFunction(el, during);
      },
      before,
      end() {
        undoStart();
        undoEnd = setFunction(el, end);
      },
      after,
      cleanup() {
        undoDuring();
        undoEnd();
      },
    });
  }
  function performTransition(el, stages) {
    let interrupted, reachedBefore, reachedEnd;
    let finish = once(() => {
      mutateDom(() => {
        interrupted = true;
        if (!reachedBefore) stages.before();
        if (!reachedEnd) {
          stages.end();
          releaseNextTicks();
        }
        stages.after();
        if (el.isConnected) stages.cleanup();
        delete el._x_transitioning;
      });
    });
    el._x_transitioning = {
      beforeCancels: [],
      beforeCancel(callback) {
        this.beforeCancels.push(callback);
      },
      cancel: once(function () {
        while (this.beforeCancels.length) {
          this.beforeCancels.shift()();
        }
        finish();
      }),
      finish,
    };
    mutateDom(() => {
      stages.start();
      stages.during();
    });
    holdNextTicks();
    requestAnimationFrame(() => {
      if (interrupted) return;
      let duration =
        Number(getComputedStyle(el).transitionDuration.replace(/,.*/, '').replace('s', '')) * 1e3;
      let delay3 =
        Number(getComputedStyle(el).transitionDelay.replace(/,.*/, '').replace('s', '')) * 1e3;
      if (duration === 0)
        duration = Number(getComputedStyle(el).animationDuration.replace('s', '')) * 1e3;
      mutateDom(() => {
        stages.before();
      });
      reachedBefore = true;
      requestAnimationFrame(() => {
        if (interrupted) return;
        mutateDom(() => {
          stages.end();
        });
        releaseNextTicks();
        setTimeout(el._x_transitioning.finish, duration + delay3);
        reachedEnd = true;
      });
    });
  }
  function modifierValue(modifiers, key, fallback) {
    if (modifiers.indexOf(key) === -1) return fallback;
    const rawValue = modifiers[modifiers.indexOf(key) + 1];
    if (!rawValue) return fallback;
    if (key === 'scale') {
      if (isNaN(rawValue)) return fallback;
    }
    if (key === 'duration' || key === 'delay') {
      let match = rawValue.match(/([0-9]+)ms/);
      if (match) return match[1];
    }
    if (key === 'origin') {
      if (
        ['top', 'right', 'left', 'center', 'bottom'].includes(modifiers[modifiers.indexOf(key) + 2])
      ) {
        return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(' ');
      }
    }
    return rawValue;
  }
  var isCloning = false;
  function skipDuringClone(callback, fallback = () => {}) {
    return (...args) => (isCloning ? fallback(...args) : callback(...args));
  }
  function onlyDuringClone(callback) {
    return (...args) => isCloning && callback(...args);
  }
  var interceptors = [];
  function interceptClone(callback) {
    interceptors.push(callback);
  }
  function cloneNode(from, to) {
    interceptors.forEach((i) => i(from, to));
    isCloning = true;
    dontRegisterReactiveSideEffects(() => {
      initTree(to, (el, callback) => {
        callback(el, () => {});
      });
    });
    isCloning = false;
  }
  var isCloningLegacy = false;
  function clone(oldEl, newEl) {
    if (!newEl._x_dataStack) newEl._x_dataStack = oldEl._x_dataStack;
    isCloning = true;
    isCloningLegacy = true;
    dontRegisterReactiveSideEffects(() => {
      cloneTree(newEl);
    });
    isCloning = false;
    isCloningLegacy = false;
  }
  function cloneTree(el) {
    let hasRunThroughFirstEl = false;
    let shallowWalker = (el2, callback) => {
      walk(el2, (el3, skip) => {
        if (hasRunThroughFirstEl && isRoot(el3)) return skip();
        hasRunThroughFirstEl = true;
        callback(el3, skip);
      });
    };
    initTree(el, shallowWalker);
  }
  function dontRegisterReactiveSideEffects(callback) {
    let cache = effect;
    overrideEffect((callback2, el) => {
      let storedEffect = cache(callback2);
      release(storedEffect);
      return () => {};
    });
    callback();
    overrideEffect(cache);
  }
  function bind(el, name, value, modifiers = []) {
    if (!el._x_bindings) el._x_bindings = reactive({});
    el._x_bindings[name] = value;
    name = modifiers.includes('camel') ? camelCase(name) : name;
    switch (name) {
      case 'value':
        bindInputValue(el, value);
        break;
      case 'style':
        bindStyles(el, value);
        break;
      case 'class':
        bindClasses(el, value);
        break;
      case 'selected':
      case 'checked':
        bindAttributeAndProperty(el, name, value);
        break;
      default:
        bindAttribute(el, name, value);
        break;
    }
  }
  function bindInputValue(el, value) {
    if (isRadio(el)) {
      if (el.attributes.value === void 0) {
        el.value = value;
      }
      if (window.fromModel) {
        if (typeof value === 'boolean') {
          el.checked = safeParseBoolean(el.value) === value;
        } else {
          el.checked = checkedAttrLooseCompare(el.value, value);
        }
      }
    } else if (isCheckbox(el)) {
      if (Number.isInteger(value)) {
        el.value = value;
      } else if (
        !Array.isArray(value) &&
        typeof value !== 'boolean' &&
        ![null, void 0].includes(value)
      ) {
        el.value = String(value);
      } else {
        if (Array.isArray(value)) {
          el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
        } else {
          el.checked = !!value;
        }
      }
    } else if (el.tagName === 'SELECT') {
      updateSelect(el, value);
    } else {
      if (el.value === value) return;
      el.value = value === void 0 ? '' : value;
    }
  }
  function bindClasses(el, value) {
    if (el._x_undoAddedClasses) el._x_undoAddedClasses();
    el._x_undoAddedClasses = setClasses(el, value);
  }
  function bindStyles(el, value) {
    if (el._x_undoAddedStyles) el._x_undoAddedStyles();
    el._x_undoAddedStyles = setStyles(el, value);
  }
  function bindAttributeAndProperty(el, name, value) {
    bindAttribute(el, name, value);
    setPropertyIfChanged(el, name, value);
  }
  function bindAttribute(el, name, value) {
    if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
      el.removeAttribute(name);
    } else {
      if (isBooleanAttr(name)) value = name;
      setIfChanged(el, name, value);
    }
  }
  function setIfChanged(el, attrName, value) {
    if (el.getAttribute(attrName) != value) {
      el.setAttribute(attrName, value);
    }
  }
  function setPropertyIfChanged(el, propName, value) {
    if (el[propName] !== value) {
      el[propName] = value;
    }
  }
  function updateSelect(el, value) {
    const arrayWrappedValue = [].concat(value).map((value2) => {
      return value2 + '';
    });
    Array.from(el.options).forEach((option) => {
      option.selected = arrayWrappedValue.includes(option.value);
    });
  }
  function camelCase(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function checkedAttrLooseCompare(valueA, valueB) {
    return valueA == valueB;
  }
  function safeParseBoolean(rawValue) {
    if ([1, '1', 'true', 'on', 'yes', true].includes(rawValue)) {
      return true;
    }
    if ([0, '0', 'false', 'off', 'no', false].includes(rawValue)) {
      return false;
    }
    return rawValue ? Boolean(rawValue) : null;
  }
  var booleanAttributes = /* @__PURE__ */ new Set([
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected',
    'shadowrootclonable',
    'shadowrootdelegatesfocus',
    'shadowrootserializable',
  ]);
  function isBooleanAttr(attrName) {
    return booleanAttributes.has(attrName);
  }
  function attributeShouldntBePreservedIfFalsy(name) {
    return !['aria-pressed', 'aria-checked', 'aria-expanded', 'aria-selected'].includes(name);
  }
  function getBinding(el, name, fallback) {
    if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
    return getAttributeBinding(el, name, fallback);
  }
  function extractProp(el, name, fallback, extract = true) {
    if (el._x_bindings && el._x_bindings[name] !== void 0) return el._x_bindings[name];
    if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
      let binding = el._x_inlineBindings[name];
      binding.extract = extract;
      return dontAutoEvaluateFunctions(() => {
        return evaluate(el, binding.expression);
      });
    }
    return getAttributeBinding(el, name, fallback);
  }
  function getAttributeBinding(el, name, fallback) {
    let attr = el.getAttribute(name);
    if (attr === null) return typeof fallback === 'function' ? fallback() : fallback;
    if (attr === '') return true;
    if (isBooleanAttr(name)) {
      return !![name, 'true'].includes(attr);
    }
    return attr;
  }
  function isCheckbox(el) {
    return el.type === 'checkbox' || el.localName === 'ui-checkbox' || el.localName === 'ui-switch';
  }
  function isRadio(el) {
    return el.type === 'radio' || el.localName === 'ui-radio';
  }
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      let context = this,
        args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
  function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
    let firstRun = true;
    let outerHash;
    let innerHash;
    let reference = effect(() => {
      let outer = outerGet();
      let inner = innerGet();
      if (firstRun) {
        innerSet(cloneIfObject(outer));
        firstRun = false;
      } else {
        let outerHashLatest = JSON.stringify(outer);
        let innerHashLatest = JSON.stringify(inner);
        if (outerHashLatest !== outerHash) {
          innerSet(cloneIfObject(outer));
        } else if (outerHashLatest !== innerHashLatest) {
          outerSet(cloneIfObject(inner));
        } else {
        }
      }
      outerHash = JSON.stringify(outerGet());
      innerHash = JSON.stringify(innerGet());
    });
    return () => {
      release(reference);
    };
  }
  function cloneIfObject(value) {
    return typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
  }
  function plugin(callback) {
    let callbacks = Array.isArray(callback) ? callback : [callback];
    callbacks.forEach((i) => i(alpine_default));
  }
  var stores = {};
  var isReactive = false;
  function store(name, value) {
    if (!isReactive) {
      stores = reactive(stores);
      isReactive = true;
    }
    if (value === void 0) {
      return stores[name];
    }
    stores[name] = value;
    initInterceptors(stores[name]);
    if (
      typeof value === 'object' &&
      value !== null &&
      value.hasOwnProperty('init') &&
      typeof value.init === 'function'
    ) {
      stores[name].init();
    }
  }
  function getStores() {
    return stores;
  }
  var binds = {};
  function bind2(name, bindings) {
    let getBindings = typeof bindings !== 'function' ? () => bindings : bindings;
    if (name instanceof Element) {
      return applyBindingsObject(name, getBindings());
    } else {
      binds[name] = getBindings;
    }
    return () => {};
  }
  function injectBindingProviders(obj) {
    Object.entries(binds).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback(...args);
          };
        },
      });
    });
    return obj;
  }
  function applyBindingsObject(el, obj, original) {
    let cleanupRunners = [];
    while (cleanupRunners.length) cleanupRunners.pop()();
    let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(attributes);
    attributes = attributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`,
        };
      }
      return attribute;
    });
    directives(el, attributes, original).map((handle) => {
      cleanupRunners.push(handle.runCleanups);
      handle();
    });
    return () => {
      while (cleanupRunners.length) cleanupRunners.pop()();
    };
  }
  var datas = {};
  function data(name, callback) {
    datas[name] = callback;
  }
  function injectDataProviders(obj, context) {
    Object.entries(datas).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback.bind(context)(...args);
          };
        },
        enumerable: false,
      });
    });
    return obj;
  }
  var Alpine = {
    get reactive() {
      return reactive;
    },
    get release() {
      return release;
    },
    get effect() {
      return effect;
    },
    get raw() {
      return raw;
    },
    version: '3.15.1',
    flushAndStopDeferringMutations,
    dontAutoEvaluateFunctions,
    disableEffectScheduling,
    startObservingMutations,
    stopObservingMutations,
    setReactivityEngine,
    onAttributeRemoved,
    onAttributesAdded,
    closestDataStack,
    skipDuringClone,
    onlyDuringClone,
    addRootSelector,
    addInitSelector,
    interceptClone,
    addScopeToNode,
    deferMutations,
    mapAttributes,
    evaluateLater,
    interceptInit,
    setEvaluator,
    mergeProxies,
    extractProp,
    findClosest,
    onElRemoved,
    closestRoot,
    destroyTree,
    interceptor,
    // INTERNAL: not public API and is subject to change without major release.
    transition,
    // INTERNAL
    setStyles,
    // INTERNAL
    mutateDom,
    directive,
    entangle,
    throttle,
    debounce,
    evaluate,
    initTree,
    nextTick,
    prefixed: prefix,
    prefix: setPrefix,
    plugin,
    magic,
    store,
    start,
    clone,
    // INTERNAL
    cloneNode,
    // INTERNAL
    bound: getBinding,
    $data: scope,
    watch,
    walk,
    data,
    bind: bind2,
  };
  var alpine_default = Alpine;
  var Token = class {
    constructor(type, value, start2, end) {
      this.type = type;
      this.value = value;
      this.start = start2;
      this.end = end;
    }
  };
  var Tokenizer = class {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.tokens = [];
    }
    tokenize() {
      while (this.position < this.input.length) {
        this.skipWhitespace();
        if (this.position >= this.input.length) break;
        const char = this.input[this.position];
        if (this.isDigit(char)) {
          this.readNumber();
        } else if (this.isAlpha(char) || char === '_' || char === '$') {
          this.readIdentifierOrKeyword();
        } else if (char === '"' || char === "'") {
          this.readString();
        } else if (char === '/' && this.peek() === '/') {
          this.skipLineComment();
        } else {
          this.readOperatorOrPunctuation();
        }
      }
      this.tokens.push(new Token('EOF', null, this.position, this.position));
      return this.tokens;
    }
    skipWhitespace() {
      while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
        this.position++;
      }
    }
    skipLineComment() {
      while (this.position < this.input.length && this.input[this.position] !== '\n') {
        this.position++;
      }
    }
    isDigit(char) {
      return /[0-9]/.test(char);
    }
    isAlpha(char) {
      return /[a-zA-Z]/.test(char);
    }
    isAlphaNumeric(char) {
      return /[a-zA-Z0-9_$]/.test(char);
    }
    peek(offset = 1) {
      return this.input[this.position + offset] || '';
    }
    readNumber() {
      const start2 = this.position;
      let hasDecimal = false;
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (this.isDigit(char)) {
          this.position++;
        } else if (char === '.' && !hasDecimal) {
          hasDecimal = true;
          this.position++;
        } else {
          break;
        }
      }
      const value = this.input.slice(start2, this.position);
      this.tokens.push(new Token('NUMBER', parseFloat(value), start2, this.position));
    }
    readIdentifierOrKeyword() {
      const start2 = this.position;
      while (this.position < this.input.length && this.isAlphaNumeric(this.input[this.position])) {
        this.position++;
      }
      const value = this.input.slice(start2, this.position);
      const keywords = [
        'true',
        'false',
        'null',
        'undefined',
        'new',
        'typeof',
        'void',
        'delete',
        'in',
        'instanceof',
      ];
      if (keywords.includes(value)) {
        if (value === 'true' || value === 'false') {
          this.tokens.push(new Token('BOOLEAN', value === 'true', start2, this.position));
        } else if (value === 'null') {
          this.tokens.push(new Token('NULL', null, start2, this.position));
        } else if (value === 'undefined') {
          this.tokens.push(new Token('UNDEFINED', void 0, start2, this.position));
        } else {
          this.tokens.push(new Token('KEYWORD', value, start2, this.position));
        }
      } else {
        this.tokens.push(new Token('IDENTIFIER', value, start2, this.position));
      }
    }
    readString() {
      const start2 = this.position;
      const quote = this.input[this.position];
      this.position++;
      let value = '';
      let escaped = false;
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (escaped) {
          switch (char) {
            case 'n':
              value += '\n';
              break;
            case 't':
              value += '	';
              break;
            case 'r':
              value += '\r';
              break;
            case '\\':
              value += '\\';
              break;
            case quote:
              value += quote;
              break;
            default:
              value += char;
          }
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quote) {
          this.position++;
          this.tokens.push(new Token('STRING', value, start2, this.position));
          return;
        } else {
          value += char;
        }
        this.position++;
      }
      throw new Error(`Unterminated string starting at position ${start2}`);
    }
    readOperatorOrPunctuation() {
      const start2 = this.position;
      const char = this.input[this.position];
      const next = this.peek();
      const nextNext = this.peek(2);
      if (char === '=' && next === '=' && nextNext === '=') {
        this.position += 3;
        this.tokens.push(new Token('OPERATOR', '===', start2, this.position));
      } else if (char === '!' && next === '=' && nextNext === '=') {
        this.position += 3;
        this.tokens.push(new Token('OPERATOR', '!==', start2, this.position));
      } else if (char === '=' && next === '=') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '==', start2, this.position));
      } else if (char === '!' && next === '=') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '!=', start2, this.position));
      } else if (char === '<' && next === '=') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '<=', start2, this.position));
      } else if (char === '>' && next === '=') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '>=', start2, this.position));
      } else if (char === '&' && next === '&') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '&&', start2, this.position));
      } else if (char === '|' && next === '|') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '||', start2, this.position));
      } else if (char === '+' && next === '+') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '++', start2, this.position));
      } else if (char === '-' && next === '-') {
        this.position += 2;
        this.tokens.push(new Token('OPERATOR', '--', start2, this.position));
      } else {
        this.position++;
        const type = '()[]{},.;:?'.includes(char) ? 'PUNCTUATION' : 'OPERATOR';
        this.tokens.push(new Token(type, char, start2, this.position));
      }
    }
  };
  var Parser = class {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
    }
    parse() {
      if (this.isAtEnd()) {
        throw new Error('Empty expression');
      }
      const expr = this.parseExpression();
      this.match('PUNCTUATION', ';');
      if (!this.isAtEnd()) {
        throw new Error(`Unexpected token: ${this.current().value}`);
      }
      return expr;
    }
    parseExpression() {
      return this.parseAssignment();
    }
    parseAssignment() {
      const expr = this.parseTernary();
      if (this.match('OPERATOR', '=')) {
        const value = this.parseAssignment();
        if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
          return {
            type: 'AssignmentExpression',
            left: expr,
            operator: '=',
            right: value,
          };
        }
        throw new Error('Invalid assignment target');
      }
      return expr;
    }
    parseTernary() {
      const expr = this.parseLogicalOr();
      if (this.match('PUNCTUATION', '?')) {
        const consequent = this.parseExpression();
        this.consume('PUNCTUATION', ':');
        const alternate = this.parseExpression();
        return {
          type: 'ConditionalExpression',
          test: expr,
          consequent,
          alternate,
        };
      }
      return expr;
    }
    parseLogicalOr() {
      let expr = this.parseLogicalAnd();
      while (this.match('OPERATOR', '||')) {
        const operator = this.previous().value;
        const right = this.parseLogicalAnd();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseLogicalAnd() {
      let expr = this.parseEquality();
      while (this.match('OPERATOR', '&&')) {
        const operator = this.previous().value;
        const right = this.parseEquality();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseEquality() {
      let expr = this.parseRelational();
      while (this.match('OPERATOR', '==', '!=', '===', '!==')) {
        const operator = this.previous().value;
        const right = this.parseRelational();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseRelational() {
      let expr = this.parseAdditive();
      while (this.match('OPERATOR', '<', '>', '<=', '>=')) {
        const operator = this.previous().value;
        const right = this.parseAdditive();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseAdditive() {
      let expr = this.parseMultiplicative();
      while (this.match('OPERATOR', '+', '-')) {
        const operator = this.previous().value;
        const right = this.parseMultiplicative();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseMultiplicative() {
      let expr = this.parseUnary();
      while (this.match('OPERATOR', '*', '/', '%')) {
        const operator = this.previous().value;
        const right = this.parseUnary();
        expr = {
          type: 'BinaryExpression',
          operator,
          left: expr,
          right,
        };
      }
      return expr;
    }
    parseUnary() {
      if (this.match('OPERATOR', '++', '--')) {
        const operator = this.previous().value;
        const argument = this.parseUnary();
        return {
          type: 'UpdateExpression',
          operator,
          argument,
          prefix: true,
        };
      }
      if (this.match('OPERATOR', '!', '-', '+')) {
        const operator = this.previous().value;
        const argument = this.parseUnary();
        return {
          type: 'UnaryExpression',
          operator,
          argument,
          prefix: true,
        };
      }
      return this.parsePostfix();
    }
    parsePostfix() {
      let expr = this.parseMember();
      if (this.match('OPERATOR', '++', '--')) {
        const operator = this.previous().value;
        return {
          type: 'UpdateExpression',
          operator,
          argument: expr,
          prefix: false,
        };
      }
      return expr;
    }
    parseMember() {
      let expr = this.parsePrimary();
      while (true) {
        if (this.match('PUNCTUATION', '.')) {
          const property = this.consume('IDENTIFIER');
          expr = {
            type: 'MemberExpression',
            object: expr,
            property: { type: 'Identifier', name: property.value },
            computed: false,
          };
        } else if (this.match('PUNCTUATION', '[')) {
          const property = this.parseExpression();
          this.consume('PUNCTUATION', ']');
          expr = {
            type: 'MemberExpression',
            object: expr,
            property,
            computed: true,
          };
        } else if (this.match('PUNCTUATION', '(')) {
          const args = this.parseArguments();
          expr = {
            type: 'CallExpression',
            callee: expr,
            arguments: args,
          };
        } else {
          break;
        }
      }
      return expr;
    }
    parseArguments() {
      const args = [];
      if (!this.check('PUNCTUATION', ')')) {
        do {
          args.push(this.parseExpression());
        } while (this.match('PUNCTUATION', ','));
      }
      this.consume('PUNCTUATION', ')');
      return args;
    }
    parsePrimary() {
      if (this.match('NUMBER')) {
        return { type: 'Literal', value: this.previous().value };
      }
      if (this.match('STRING')) {
        return { type: 'Literal', value: this.previous().value };
      }
      if (this.match('BOOLEAN')) {
        return { type: 'Literal', value: this.previous().value };
      }
      if (this.match('NULL')) {
        return { type: 'Literal', value: null };
      }
      if (this.match('UNDEFINED')) {
        return { type: 'Literal', value: void 0 };
      }
      if (this.match('IDENTIFIER')) {
        return { type: 'Identifier', name: this.previous().value };
      }
      if (this.match('PUNCTUATION', '(')) {
        const expr = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        return expr;
      }
      if (this.match('PUNCTUATION', '[')) {
        return this.parseArrayLiteral();
      }
      if (this.match('PUNCTUATION', '{')) {
        return this.parseObjectLiteral();
      }
      throw new Error(`Unexpected token: ${this.current().type} "${this.current().value}"`);
    }
    parseArrayLiteral() {
      const elements = [];
      while (!this.check('PUNCTUATION', ']') && !this.isAtEnd()) {
        elements.push(this.parseExpression());
        if (this.match('PUNCTUATION', ',')) {
          if (this.check('PUNCTUATION', ']')) {
            break;
          }
        } else {
          break;
        }
      }
      this.consume('PUNCTUATION', ']');
      return {
        type: 'ArrayExpression',
        elements,
      };
    }
    parseObjectLiteral() {
      const properties = [];
      while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
        let key;
        let computed = false;
        if (this.match('STRING')) {
          key = { type: 'Literal', value: this.previous().value };
        } else if (this.match('IDENTIFIER')) {
          const name = this.previous().value;
          key = { type: 'Identifier', name };
        } else if (this.match('PUNCTUATION', '[')) {
          key = this.parseExpression();
          computed = true;
          this.consume('PUNCTUATION', ']');
        } else {
          throw new Error('Expected property key');
        }
        this.consume('PUNCTUATION', ':');
        const value = this.parseExpression();
        properties.push({
          type: 'Property',
          key,
          value,
          computed,
          shorthand: false,
        });
        if (this.match('PUNCTUATION', ',')) {
          if (this.check('PUNCTUATION', '}')) {
            break;
          }
        } else {
          break;
        }
      }
      this.consume('PUNCTUATION', '}');
      return {
        type: 'ObjectExpression',
        properties,
      };
    }
    match(...args) {
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (i === 0 && args.length > 1) {
          const type = arg;
          for (let j = 1; j < args.length; j++) {
            if (this.check(type, args[j])) {
              this.advance();
              return true;
            }
          }
          return false;
        } else if (args.length === 1) {
          if (this.checkType(arg)) {
            this.advance();
            return true;
          }
          return false;
        }
      }
      return false;
    }
    check(type, value) {
      if (this.isAtEnd()) return false;
      if (value !== void 0) {
        return this.current().type === type && this.current().value === value;
      }
      return this.current().type === type;
    }
    checkType(type) {
      if (this.isAtEnd()) return false;
      return this.current().type === type;
    }
    advance() {
      if (!this.isAtEnd()) this.position++;
      return this.previous();
    }
    isAtEnd() {
      return this.current().type === 'EOF';
    }
    current() {
      return this.tokens[this.position];
    }
    previous() {
      return this.tokens[this.position - 1];
    }
    consume(type, value) {
      if (value !== void 0) {
        if (this.check(type, value)) return this.advance();
        throw new Error(
          `Expected ${type} "${value}" but got ${this.current().type} "${this.current().value}"`
        );
      }
      if (this.check(type)) return this.advance();
      throw new Error(`Expected ${type} but got ${this.current().type} "${this.current().value}"`);
    }
  };
  var Evaluator = class {
    evaluate({
      node,
      scope: scope2 = {},
      context = null,
      allowGlobal = false,
      forceBindingRootScopeToFunctions = true,
    }) {
      switch (node.type) {
        case 'Literal':
          return node.value;
        case 'Identifier':
          if (node.name in scope2) {
            const value2 = scope2[node.name];
            if (typeof value2 === 'function') {
              return value2.bind(scope2);
            }
            return value2;
          }
          if (allowGlobal && typeof globalThis[node.name] !== 'undefined') {
            const value2 = globalThis[node.name];
            if (typeof value2 === 'function') {
              return value2.bind(globalThis);
            }
            return value2;
          }
          throw new Error(`Undefined variable: ${node.name}`);
        case 'MemberExpression':
          const object = this.evaluate({
            node: node.object,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          if (object == null) {
            throw new Error('Cannot read property of null or undefined');
          }
          let memberValue;
          if (node.computed) {
            const property = this.evaluate({
              node: node.property,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            });
            memberValue = object[property];
          } else {
            memberValue = object[node.property.name];
          }
          if (typeof memberValue === 'function') {
            if (forceBindingRootScopeToFunctions) {
              return memberValue.bind(scope2);
            } else {
              return memberValue.bind(object);
            }
          }
          return memberValue;
        case 'CallExpression':
          const args = node.arguments.map((arg) =>
            this.evaluate({
              node: arg,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            })
          );
          if (node.callee.type === 'MemberExpression') {
            const obj = this.evaluate({
              node: node.callee.object,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            });
            let func;
            if (node.callee.computed) {
              const prop = this.evaluate({
                node: node.callee.property,
                scope: scope2,
                context,
                allowGlobal,
                forceBindingRootScopeToFunctions,
              });
              func = obj[prop];
            } else {
              func = obj[node.callee.property.name];
            }
            if (typeof func !== 'function') {
              throw new Error('Value is not a function');
            }
            return func.apply(obj, args);
          } else {
            if (node.callee.type === 'Identifier') {
              const name = node.callee.name;
              let func;
              if (name in scope2) {
                func = scope2[name];
              } else if (allowGlobal && typeof globalThis[name] !== 'undefined') {
                func = globalThis[name];
              } else {
                throw new Error(`Undefined variable: ${name}`);
              }
              if (typeof func !== 'function') {
                throw new Error('Value is not a function');
              }
              const thisContext = context !== null ? context : scope2;
              return func.apply(thisContext, args);
            } else {
              const callee = this.evaluate({
                node: node.callee,
                scope: scope2,
                context,
                allowGlobal,
                forceBindingRootScopeToFunctions,
              });
              if (typeof callee !== 'function') {
                throw new Error('Value is not a function');
              }
              return callee.apply(context, args);
            }
          }
        case 'UnaryExpression':
          const argument = this.evaluate({
            node: node.argument,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          switch (node.operator) {
            case '!':
              return !argument;
            case '-':
              return -argument;
            case '+':
              return +argument;
            default:
              throw new Error(`Unknown unary operator: ${node.operator}`);
          }
        case 'UpdateExpression':
          if (node.argument.type === 'Identifier') {
            const name = node.argument.name;
            if (!(name in scope2)) {
              throw new Error(`Undefined variable: ${name}`);
            }
            const oldValue = scope2[name];
            if (node.operator === '++') {
              scope2[name] = oldValue + 1;
            } else if (node.operator === '--') {
              scope2[name] = oldValue - 1;
            }
            return node.prefix ? scope2[name] : oldValue;
          } else if (node.argument.type === 'MemberExpression') {
            const obj = this.evaluate({
              node: node.argument.object,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            });
            const prop = node.argument.computed
              ? this.evaluate({
                  node: node.argument.property,
                  scope: scope2,
                  context,
                  allowGlobal,
                  forceBindingRootScopeToFunctions,
                })
              : node.argument.property.name;
            const oldValue = obj[prop];
            if (node.operator === '++') {
              obj[prop] = oldValue + 1;
            } else if (node.operator === '--') {
              obj[prop] = oldValue - 1;
            }
            return node.prefix ? obj[prop] : oldValue;
          }
          throw new Error('Invalid update expression target');
        case 'BinaryExpression':
          const left = this.evaluate({
            node: node.left,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          const right = this.evaluate({
            node: node.right,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          switch (node.operator) {
            case '+':
              return left + right;
            case '-':
              return left - right;
            case '*':
              return left * right;
            case '/':
              return left / right;
            case '%':
              return left % right;
            case '==':
              return left == right;
            case '!=':
              return left != right;
            case '===':
              return left === right;
            case '!==':
              return left !== right;
            case '<':
              return left < right;
            case '>':
              return left > right;
            case '<=':
              return left <= right;
            case '>=':
              return left >= right;
            case '&&':
              return left && right;
            case '||':
              return left || right;
            default:
              throw new Error(`Unknown binary operator: ${node.operator}`);
          }
        case 'ConditionalExpression':
          const test = this.evaluate({
            node: node.test,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          return test
            ? this.evaluate({
                node: node.consequent,
                scope: scope2,
                context,
                allowGlobal,
                forceBindingRootScopeToFunctions,
              })
            : this.evaluate({
                node: node.alternate,
                scope: scope2,
                context,
                allowGlobal,
                forceBindingRootScopeToFunctions,
              });
        case 'AssignmentExpression':
          const value = this.evaluate({
            node: node.right,
            scope: scope2,
            context,
            allowGlobal,
            forceBindingRootScopeToFunctions,
          });
          if (node.left.type === 'Identifier') {
            scope2[node.left.name] = value;
            return value;
          } else if (node.left.type === 'MemberExpression') {
            const obj = this.evaluate({
              node: node.left.object,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            });
            if (node.left.computed) {
              const prop = this.evaluate({
                node: node.left.property,
                scope: scope2,
                context,
                allowGlobal,
                forceBindingRootScopeToFunctions,
              });
              obj[prop] = value;
            } else {
              obj[node.left.property.name] = value;
            }
            return value;
          }
          throw new Error('Invalid assignment target');
        case 'ArrayExpression':
          return node.elements.map((el) =>
            this.evaluate({
              node: el,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            })
          );
        case 'ObjectExpression':
          const result = {};
          for (const prop of node.properties) {
            const key = prop.computed
              ? this.evaluate({
                  node: prop.key,
                  scope: scope2,
                  context,
                  allowGlobal,
                  forceBindingRootScopeToFunctions,
                })
              : prop.key.type === 'Identifier'
                ? prop.key.name
                : this.evaluate({
                    node: prop.key,
                    scope: scope2,
                    context,
                    allowGlobal,
                    forceBindingRootScopeToFunctions,
                  });
            const value2 = this.evaluate({
              node: prop.value,
              scope: scope2,
              context,
              allowGlobal,
              forceBindingRootScopeToFunctions,
            });
            result[key] = value2;
          }
          return result;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    }
  };
  function generateRuntimeFunction(expression) {
    try {
      const tokenizer = new Tokenizer(expression);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const evaluator = new Evaluator();
      return function (options = {}) {
        const {
          scope: scope2 = {},
          context = null,
          allowGlobal = false,
          forceBindingRootScopeToFunctions = false,
        } = options;
        return evaluator.evaluate({
          node: ast,
          scope: scope2,
          context,
          allowGlobal,
          forceBindingRootScopeToFunctions,
        });
      };
    } catch (error2) {
      throw new Error(`CSP Parser Error: ${error2.message}`);
    }
  }
  function cspEvaluator(el, expression) {
    let dataStack = generateDataStack(el);
    if (typeof expression === 'function') {
      return generateEvaluatorFromFunction(dataStack, expression);
    }
    let evaluator = generateEvaluator(el, expression, dataStack);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateDataStack(el) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    return [overriddenMagics, ...closestDataStack(el)];
  }
  function generateEvaluator(el, expression, dataStack) {
    return (receiver = () => {}, { scope: scope2 = {}, params = [] } = {}) => {
      let completeScope = mergeProxies([scope2, ...dataStack]);
      let evaluate2 = generateRuntimeFunction(expression);
      let returnValue = evaluate2({
        scope: completeScope,
        allowGlobal: false,
        forceBindingRootScopeToFunctions: true,
      });
      if (shouldAutoEvaluateFunctions && typeof returnValue === 'function') {
        let nextReturnValue = returnValue.apply(returnValue, params);
        if (nextReturnValue instanceof Promise) {
          nextReturnValue.then((i) => receiver(i));
        } else {
          receiver(nextReturnValue);
        }
      } else if (typeof returnValue === 'object' && returnValue instanceof Promise) {
        returnValue.then((i) => receiver(i));
      } else {
        receiver(returnValue);
      }
    };
  }
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
  }
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isBooleanAttr2 = /* @__PURE__ */ makeMap(
    specialBooleanAttrs +
      `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`
  );
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === '[object Map]';
  var isString = (val) => typeof val === 'string';
  var isSymbol = (val) => typeof val === 'symbol';
  var isObject = (val) => val !== null && typeof val === 'object';
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) =>
    isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
  var cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
  var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  var toHandlerKey = cacheStringFunction((str) => (str ? `on${capitalize(str)}` : ``));
  var hasChanged = (value, oldValue) =>
    value !== oldValue && (value === value || oldValue === oldValue);
  var targetMap = /* @__PURE__ */ new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = Symbol(true ? 'iterate' : '');
  var MAP_KEY_ITERATE_KEY = Symbol(true ? 'Map key iterate' : '');
  function isEffect(fn) {
    return fn && fn._isEffect === true;
  }
  function effect2(fn, options = EMPTY_OBJ) {
    if (isEffect(fn)) {
      fn = fn.raw;
    }
    const effect3 = createReactiveEffect(fn, options);
    if (!options.lazy) {
      effect3();
    }
    return effect3;
  }
  function stop(effect3) {
    if (effect3.active) {
      cleanup(effect3);
      if (effect3.options.onStop) {
        effect3.options.onStop();
      }
      effect3.active = false;
    }
  }
  var uid = 0;
  function createReactiveEffect(fn, options) {
    const effect3 = function reactiveEffect() {
      if (!effect3.active) {
        return fn();
      }
      if (!effectStack.includes(effect3)) {
        cleanup(effect3);
        try {
          enableTracking();
          effectStack.push(effect3);
          activeEffect = effect3;
          return fn();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect3.id = uid++;
    effect3.allowRecurse = !!options.allowRecurse;
    effect3._isEffect = true;
    effect3.active = true;
    effect3.raw = fn;
    effect3.deps = [];
    effect3.options = options;
    return effect3;
  }
  function cleanup(effect3) {
    const { deps } = effect3;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect3);
      }
      deps.length = 0;
    }
  }
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === void 0) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = /* @__PURE__ */ new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = /* @__PURE__ */ new Set()));
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target,
          type,
          key,
        });
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = /* @__PURE__ */ new Set();
    const add2 = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect3) => {
          if (effect3 !== activeEffect || effect3.allowRecurse) {
            effects.add(effect3);
          }
        });
      }
    };
    if (type === 'clear') {
      depsMap.forEach(add2);
    } else if (key === 'length' && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === 'length' || key2 >= newValue) {
          add2(dep);
        }
      });
    } else {
      if (key !== void 0) {
        add2(depsMap.get(key));
      }
      switch (type) {
        case 'add':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            add2(depsMap.get('length'));
          }
          break;
        case 'delete':
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case 'set':
          if (isMap(target)) {
            add2(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const run = (effect3) => {
      if (effect3.options.onTrigger) {
        effect3.options.onTrigger({
          effect: effect3,
          target,
          key,
          type,
          newValue,
          oldValue,
          oldTarget,
        });
      }
      if (effect3.options.scheduler) {
        effect3.options.scheduler(effect3);
      } else {
        effect3();
      }
    };
    effects.forEach(run);
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
      .map((key) => Symbol[key])
      .filter(isSymbol)
  );
  var get2 = /* @__PURE__ */ createGetter();
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach((key) => {
      instrumentations[key] = function (...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, 'get', i + '');
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((key) => {
      instrumentations[key] = function (...args) {
        pauseTracking();
        const res = toRaw(this)[key].apply(this, args);
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function createGetter(isReadonly = false, shallow = false) {
    return function get3(target, key, receiver) {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (
        key === '__v_raw' &&
        receiver ===
          (isReadonly
            ? shallow
              ? shallowReadonlyMap
              : readonlyMap
            : shallow
              ? shallowReactiveMap
              : reactiveMap
          ).get(target)
      ) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly) {
        track(target, 'get', key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive2(res);
      }
      return res;
    };
  }
  var set2 = /* @__PURE__ */ createSetter();
  function createSetter(shallow = false) {
    return function set3(target, key, value, receiver) {
      let oldValue = target[key];
      if (!shallow) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey =
        isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, 'add', key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, 'set', key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, 'has', key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, 'iterate', isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get: get2,
    set: set2,
    deleteProperty,
    has,
    ownKeys,
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      if (true) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
    deleteProperty(target, key) {
      if (true) {
        console.warn(
          `Delete operation on key "${String(key)}" failed: target is readonly.`,
          target
        );
      }
      return true;
    },
  };
  var toReactive = (value) => (isObject(value) ? reactive2(value) : value);
  var toReadonly = (value) => (isObject(value) ? readonly(value) : value);
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
    target =
      target[
        '__v_raw'
        /* RAW */
      ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'get', key);
    }
    !isReadonly && track(rawTarget, 'get', rawKey);
    const { has: has2 } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly = false) {
    const target =
      this[
        '__v_raw'
        /* RAW */
      ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, 'has', key);
    }
    !isReadonly && track(rawTarget, 'has', rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
    target =
      target[
        '__v_raw'
        /* RAW */
      ];
    !isReadonly && track(toRaw(target), 'iterate', ITERATE_KEY);
    return Reflect.get(target, 'size', target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, 'add', value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, 'add', key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, 'set', key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3 ? get3.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, 'delete', key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true ? (isMap(target) ? new Map(target) : new Set(target)) : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, 'clear', void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target =
        observed[
          '__v_raw'
          /* RAW */
        ];
      const rawTarget = toRaw(target);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, 'iterate', ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
      const target =
        this[
          '__v_raw'
          /* RAW */
        ];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
      const isKeyOnly = method === 'keys' && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, 'iterate', isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done
            ? { value, done }
            : {
                value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                done,
              };
        },
        // iterable protocol
        [Symbol.iterator]() {
          return this;
        },
      };
    };
  }
  function createReadonlyMethod(type) {
    return function (...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(
          `${capitalize(type)} operation ${key}failed: target is readonly.`,
          toRaw(this)
        );
      }
      return type === 'delete' ? false : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get$1(this, key);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false),
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get$1(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true),
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        'add'
        /* ADD */
      ),
      set: createReadonlyMethod(
        'set'
        /* SET */
      ),
      delete: createReadonlyMethod(
        'delete'
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        'clear'
        /* CLEAR */
      ),
      forEach: createForEach(true, false),
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        'add'
        /* ADD */
      ),
      set: createReadonlyMethod(
        'set'
        /* SET */
      ),
      delete: createReadonlyMethod(
        'delete'
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        'clear'
        /* CLEAR */
      ),
      forEach: createForEach(true, true),
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
      shallowInstrumentations2[method] = createIterableMethod(method, false, true);
      shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2,
    ];
  }
  var [
    mutableInstrumentations,
    readonlyInstrumentations,
    shallowInstrumentations,
    shallowReadonlyInstrumentations,
  ] = /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
      ? isReadonly
        ? shallowReadonlyInstrumentations
        : shallowInstrumentations
      : isReadonly
        ? readonlyInstrumentations
        : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === '__v_isReactive') {
        return !isReadonly;
      } else if (key === '__v_isReadonly') {
        return isReadonly;
      } else if (key === '__v_raw') {
        return target;
      }
      return Reflect.get(
        hasOwn(instrumentations, key) && key in target ? instrumentations : target,
        key,
        receiver
      );
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false),
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false),
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(
        `Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
      );
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case 'Object':
      case 'Array':
        return 1;
      case 'Map':
      case 'Set':
      case 'WeakMap':
      case 'WeakSet':
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value[
      '__v_skip'
      /* SKIP */
    ] || !Object.isExtensible(value)
      ? 0
      : targetTypeMap(toRawType(value));
  }
  function reactive2(target) {
    if (
      target &&
      target[
        '__v_isReadonly'
        /* IS_READONLY */
      ]
    ) {
      return target;
    }
    return createReactiveObject(
      target,
      false,
      mutableHandlers,
      mutableCollectionHandlers,
      reactiveMap
    );
  }
  function readonly(target) {
    return createReactiveObject(
      target,
      true,
      readonlyHandlers,
      readonlyCollectionHandlers,
      readonlyMap
    );
  }
  function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (true) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (
      target[
        '__v_raw'
        /* RAW */
      ] &&
      !(
        isReadonly &&
        target[
          '__v_isReactive'
          /* IS_REACTIVE */
        ]
      )
    ) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function toRaw(observed) {
    return (
      (observed &&
        toRaw(
          observed[
            '__v_raw'
            /* RAW */
          ]
        )) ||
      observed
    );
  }
  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }
  magic('nextTick', () => nextTick);
  magic('dispatch', (el) => dispatch.bind(dispatch, el));
  magic('watch', (el, { evaluateLater: evaluateLater2, cleanup: cleanup2 }) => (key, callback) => {
    let evaluate2 = evaluateLater2(key);
    let getter = () => {
      let value;
      evaluate2((i) => (value = i));
      return value;
    };
    let unwatch = watch(getter, callback);
    cleanup2(unwatch);
  });
  magic('store', getStores);
  magic('data', (el) => scope(el));
  magic('root', (el) => closestRoot(el));
  magic('refs', (el) => {
    if (el._x_refs_proxy) return el._x_refs_proxy;
    el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
    return el._x_refs_proxy;
  });
  function getArrayOfRefObject(el) {
    let refObjects = [];
    findClosest(el, (i) => {
      if (i._x_refs) refObjects.push(i._x_refs);
    });
    return refObjects;
  }
  var globalIdMemo = {};
  function findAndIncrementId(name) {
    if (!globalIdMemo[name]) globalIdMemo[name] = 0;
    return ++globalIdMemo[name];
  }
  function closestIdRoot(el, name) {
    return findClosest(el, (element) => {
      if (element._x_ids && element._x_ids[name]) return true;
    });
  }
  function setIdRoot(el, name) {
    if (!el._x_ids) el._x_ids = {};
    if (!el._x_ids[name]) el._x_ids[name] = findAndIncrementId(name);
  }
  magic('id', (el, { cleanup: cleanup2 }) => (name, key = null) => {
    let cacheKey = `${name}${key ? `-${key}` : ''}`;
    return cacheIdByNameOnElement(el, cacheKey, cleanup2, () => {
      let root = closestIdRoot(el, name);
      let id = root ? root._x_ids[name] : findAndIncrementId(name);
      return key ? `${name}-${id}-${key}` : `${name}-${id}`;
    });
  });
  interceptClone((from, to) => {
    if (from._x_id) {
      to._x_id = from._x_id;
    }
  });
  function cacheIdByNameOnElement(el, cacheKey, cleanup2, callback) {
    if (!el._x_id) el._x_id = {};
    if (el._x_id[cacheKey]) return el._x_id[cacheKey];
    let output = callback();
    el._x_id[cacheKey] = output;
    cleanup2(() => {
      delete el._x_id[cacheKey];
    });
    return output;
  }
  magic('el', (el) => el);
  warnMissingPluginMagic('Focus', 'focus', 'focus');
  warnMissingPluginMagic('Persist', 'persist', 'persist');
  function warnMissingPluginMagic(name, magicName, slug) {
    magic(magicName, (el) =>
      warn(
        `You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el
      )
    );
  }
  directive(
    'modelable',
    (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 }) => {
      let func = evaluateLater2(expression);
      let innerGet = () => {
        let result;
        func((i) => (result = i));
        return result;
      };
      let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
      let innerSet = (val) => evaluateInnerSet(() => {}, { scope: { __placeholder: val } });
      let initialValue = innerGet();
      innerSet(initialValue);
      queueMicrotask(() => {
        if (!el._x_model) return;
        el._x_removeModelListeners['default']();
        let outerGet = el._x_model.get;
        let outerSet = el._x_model.set;
        let releaseEntanglement = entangle(
          {
            get() {
              return outerGet();
            },
            set(value) {
              outerSet(value);
            },
          },
          {
            get() {
              return innerGet();
            },
            set(value) {
              innerSet(value);
            },
          }
        );
        cleanup2(releaseEntanglement);
      });
    }
  );
  directive('teleport', (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== 'template')
      warn('x-teleport can only be used on a <template> tag', el);
    let target = getTarget(expression);
    let clone2 = el.content.cloneNode(true).firstElementChild;
    el._x_teleport = clone2;
    clone2._x_teleportBack = el;
    el.setAttribute('data-teleport-template', true);
    clone2.setAttribute('data-teleport-target', true);
    if (el._x_forwardEvents) {
      el._x_forwardEvents.forEach((eventName) => {
        clone2.addEventListener(eventName, (e) => {
          e.stopPropagation();
          el.dispatchEvent(new e.constructor(e.type, e));
        });
      });
    }
    addScopeToNode(clone2, {}, el);
    let placeInDom = (clone3, target2, modifiers2) => {
      if (modifiers2.includes('prepend')) {
        target2.parentNode.insertBefore(clone3, target2);
      } else if (modifiers2.includes('append')) {
        target2.parentNode.insertBefore(clone3, target2.nextSibling);
      } else {
        target2.appendChild(clone3);
      }
    };
    mutateDom(() => {
      placeInDom(clone2, target, modifiers);
      skipDuringClone(() => {
        initTree(clone2);
      })();
    });
    el._x_teleportPutBack = () => {
      let target2 = getTarget(expression);
      mutateDom(() => {
        placeInDom(el._x_teleport, target2, modifiers);
      });
    };
    cleanup2(() =>
      mutateDom(() => {
        clone2.remove();
        destroyTree(clone2);
      })
    );
  });
  var teleportContainerDuringClone = document.createElement('div');
  function getTarget(expression) {
    let target = skipDuringClone(
      () => {
        return document.querySelector(expression);
      },
      () => {
        return teleportContainerDuringClone;
      }
    )();
    if (!target) warn(`Cannot find x-teleport element for selector: "${expression}"`);
    return target;
  }
  var handler = () => {};
  handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
    modifiers.includes('self') ? (el._x_ignoreSelf = true) : (el._x_ignore = true);
    cleanup2(() => {
      modifiers.includes('self') ? delete el._x_ignoreSelf : delete el._x_ignore;
    });
  };
  directive('ignore', handler);
  directive(
    'effect',
    skipDuringClone((el, { expression }, { effect: effect3 }) => {
      effect3(evaluateLater(el, expression));
    })
  );
  function on(el, event, modifiers, callback) {
    let listenerTarget = el;
    let handler4 = (e) => callback(e);
    let options = {};
    let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
    if (modifiers.includes('dot')) event = dotSyntax(event);
    if (modifiers.includes('camel')) event = camelCase2(event);
    if (modifiers.includes('passive')) options.passive = true;
    if (modifiers.includes('capture')) options.capture = true;
    if (modifiers.includes('window')) listenerTarget = window;
    if (modifiers.includes('document')) listenerTarget = document;
    if (modifiers.includes('debounce')) {
      let nextModifier = modifiers[modifiers.indexOf('debounce') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;
      handler4 = debounce(handler4, wait);
    }
    if (modifiers.includes('throttle')) {
      let nextModifier = modifiers[modifiers.indexOf('throttle') + 1] || 'invalid-wait';
      let wait = isNumeric(nextModifier.split('ms')[0]) ? Number(nextModifier.split('ms')[0]) : 250;
      handler4 = throttle(handler4, wait);
    }
    if (modifiers.includes('prevent'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.preventDefault();
        next(e);
      });
    if (modifiers.includes('stop'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.stopPropagation();
        next(e);
      });
    if (modifiers.includes('once')) {
      handler4 = wrapHandler(handler4, (next, e) => {
        next(e);
        listenerTarget.removeEventListener(event, handler4, options);
      });
    }
    if (modifiers.includes('away') || modifiers.includes('outside')) {
      listenerTarget = document;
      handler4 = wrapHandler(handler4, (next, e) => {
        if (el.contains(e.target)) return;
        if (e.target.isConnected === false) return;
        if (el.offsetWidth < 1 && el.offsetHeight < 1) return;
        if (el._x_isShown === false) return;
        next(e);
      });
    }
    if (modifiers.includes('self'))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.target === el && next(e);
      });
    if (isKeyEvent(event) || isClickEvent(event)) {
      handler4 = wrapHandler(handler4, (next, e) => {
        if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
          return;
        }
        next(e);
      });
    }
    listenerTarget.addEventListener(event, handler4, options);
    return () => {
      listenerTarget.removeEventListener(event, handler4, options);
    };
  }
  function dotSyntax(subject) {
    return subject.replace(/-/g, '.');
  }
  function camelCase2(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function isNumeric(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function kebabCase2(subject) {
    if ([' ', '_'].includes(subject)) return subject;
    return subject
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]/, '-')
      .toLowerCase();
  }
  function isKeyEvent(event) {
    return ['keydown', 'keyup'].includes(event);
  }
  function isClickEvent(event) {
    return ['contextmenu', 'click', 'mouse'].some((i) => event.includes(i));
  }
  function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((i) => {
      return ![
        'window',
        'document',
        'prevent',
        'stop',
        'once',
        'capture',
        'self',
        'away',
        'outside',
        'passive',
        'preserve-scroll',
      ].includes(i);
    });
    if (keyModifiers.includes('debounce')) {
      let debounceIndex = keyModifiers.indexOf('debounce');
      keyModifiers.splice(
        debounceIndex,
        isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1
      );
    }
    if (keyModifiers.includes('throttle')) {
      let debounceIndex = keyModifiers.indexOf('throttle');
      keyModifiers.splice(
        debounceIndex,
        isNumeric((keyModifiers[debounceIndex + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1
      );
    }
    if (keyModifiers.length === 0) return false;
    if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0])) return false;
    const systemKeyModifiers = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) =>
      keyModifiers.includes(modifier)
    );
    keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
    if (selectedSystemKeyModifiers.length > 0) {
      const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
        if (modifier === 'cmd' || modifier === 'super') modifier = 'meta';
        return e[`${modifier}Key`];
      });
      if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
        if (isClickEvent(e.type)) return false;
        if (keyToModifiers(e.key).includes(keyModifiers[0])) return false;
      }
    }
    return true;
  }
  function keyToModifiers(key) {
    if (!key) return [];
    key = kebabCase2(key);
    let modifierToKeyMap = {
      ctrl: 'control',
      slash: '/',
      space: ' ',
      spacebar: ' ',
      cmd: 'meta',
      esc: 'escape',
      up: 'arrow-up',
      down: 'arrow-down',
      left: 'arrow-left',
      right: 'arrow-right',
      period: '.',
      comma: ',',
      equal: '=',
      minus: '-',
      underscore: '_',
    };
    modifierToKeyMap[key] = key;
    return Object.keys(modifierToKeyMap)
      .map((modifier) => {
        if (modifierToKeyMap[modifier] === key) return modifier;
      })
      .filter((modifier) => modifier);
  }
  directive('model', (el, { modifiers, expression }, { effect: effect3, cleanup: cleanup2 }) => {
    let scopeTarget = el;
    if (modifiers.includes('parent')) {
      scopeTarget = el.parentNode;
    }
    let evaluateGet = evaluateLater(scopeTarget, expression);
    let evaluateSet;
    if (typeof expression === 'string') {
      evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
    } else if (typeof expression === 'function' && typeof expression() === 'string') {
      evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
    } else {
      evaluateSet = () => {};
    }
    let getValue = () => {
      let result;
      evaluateGet((value) => (result = value));
      return isGetterSetter(result) ? result.get() : result;
    };
    let setValue = (value) => {
      let result;
      evaluateGet((value2) => (result = value2));
      if (isGetterSetter(result)) {
        result.set(value);
      } else {
        evaluateSet(() => {}, {
          scope: { __placeholder: value },
        });
      }
    };
    if (typeof expression === 'string' && el.type === 'radio') {
      mutateDom(() => {
        if (!el.hasAttribute('name')) el.setAttribute('name', expression);
      });
    }
    let event =
      el.tagName.toLowerCase() === 'select' ||
      ['checkbox', 'radio'].includes(el.type) ||
      modifiers.includes('lazy')
        ? 'change'
        : 'input';
    let removeListener = isCloning
      ? () => {}
      : on(el, event, modifiers, (e) => {
          setValue(getInputValue(el, modifiers, e, getValue()));
        });
    if (modifiers.includes('fill')) {
      if (
        [void 0, null, ''].includes(getValue()) ||
        (isCheckbox(el) && Array.isArray(getValue())) ||
        (el.tagName.toLowerCase() === 'select' && el.multiple)
      ) {
        setValue(getInputValue(el, modifiers, { target: el }, getValue()));
      }
    }
    if (!el._x_removeModelListeners) el._x_removeModelListeners = {};
    el._x_removeModelListeners['default'] = removeListener;
    cleanup2(() => el._x_removeModelListeners['default']());
    if (el.form) {
      let removeResetListener = on(el.form, 'reset', [], (e) => {
        nextTick(
          () =>
            el._x_model && el._x_model.set(getInputValue(el, modifiers, { target: el }, getValue()))
        );
      });
      cleanup2(() => removeResetListener());
    }
    el._x_model = {
      get() {
        return getValue();
      },
      set(value) {
        setValue(value);
      },
    };
    el._x_forceModelUpdate = (value) => {
      if (value === void 0 && typeof expression === 'string' && expression.match(/\./)) value = '';
      window.fromModel = true;
      mutateDom(() => bind(el, 'value', value));
      delete window.fromModel;
    };
    effect3(() => {
      let value = getValue();
      if (modifiers.includes('unintrusive') && document.activeElement.isSameNode(el)) return;
      el._x_forceModelUpdate(value);
    });
  });
  function getInputValue(el, modifiers, event, currentValue) {
    return mutateDom(() => {
      if (event instanceof CustomEvent && event.detail !== void 0)
        return event.detail !== null && event.detail !== void 0 ? event.detail : event.target.value;
      else if (isCheckbox(el)) {
        if (Array.isArray(currentValue)) {
          let newValue = null;
          if (modifiers.includes('number')) {
            newValue = safeParseNumber(event.target.value);
          } else if (modifiers.includes('boolean')) {
            newValue = safeParseBoolean(event.target.value);
          } else {
            newValue = event.target.value;
          }
          return event.target.checked
            ? currentValue.includes(newValue)
              ? currentValue
              : currentValue.concat([newValue])
            : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
        } else {
          return event.target.checked;
        }
      } else if (el.tagName.toLowerCase() === 'select' && el.multiple) {
        if (modifiers.includes('number')) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseNumber(rawValue);
          });
        } else if (modifiers.includes('boolean')) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseBoolean(rawValue);
          });
        }
        return Array.from(event.target.selectedOptions).map((option) => {
          return option.value || option.text;
        });
      } else {
        let newValue;
        if (isRadio(el)) {
          if (event.target.checked) {
            newValue = event.target.value;
          } else {
            newValue = currentValue;
          }
        } else {
          newValue = event.target.value;
        }
        if (modifiers.includes('number')) {
          return safeParseNumber(newValue);
        } else if (modifiers.includes('boolean')) {
          return safeParseBoolean(newValue);
        } else if (modifiers.includes('trim')) {
          return newValue.trim();
        } else {
          return newValue;
        }
      }
    });
  }
  function safeParseNumber(rawValue) {
    let number = rawValue ? parseFloat(rawValue) : null;
    return isNumeric2(number) ? number : rawValue;
  }
  function checkedAttrLooseCompare2(valueA, valueB) {
    return valueA == valueB;
  }
  function isNumeric2(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function isGetterSetter(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      typeof value.get === 'function' &&
      typeof value.set === 'function'
    );
  }
  directive('cloak', (el) =>
    queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix('cloak'))))
  );
  addInitSelector(() => `[${prefix('init')}]`);
  directive(
    'init',
    skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
      if (typeof expression === 'string') {
        return !!expression.trim() && evaluate2(expression, {}, false);
      }
      return evaluate2(expression, {}, false);
    })
  );
  directive('text', (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.textContent = value;
        });
      });
    });
  });
  directive('html', (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.innerHTML = value;
          el._x_ignoreSelf = true;
          initTree(el);
          delete el._x_ignoreSelf;
        });
      });
    });
  });
  mapAttributes(startingWith(':', into(prefix('bind:'))));
  var handler2 = (
    el,
    { value, modifiers, expression, original },
    { effect: effect3, cleanup: cleanup2 }
  ) => {
    if (!value) {
      let bindingProviders = {};
      injectBindingProviders(bindingProviders);
      let getBindings = evaluateLater(el, expression);
      getBindings(
        (bindings) => {
          applyBindingsObject(el, bindings, original);
        },
        { scope: bindingProviders }
      );
      return;
    }
    if (value === 'key') return storeKeyForXFor(el, expression);
    if (
      el._x_inlineBindings &&
      el._x_inlineBindings[value] &&
      el._x_inlineBindings[value].extract
    ) {
      return;
    }
    let evaluate2 = evaluateLater(el, expression);
    effect3(() =>
      evaluate2((result) => {
        if (result === void 0 && typeof expression === 'string' && expression.match(/\./)) {
          result = '';
        }
        mutateDom(() => bind(el, value, result, modifiers));
      })
    );
    cleanup2(() => {
      el._x_undoAddedClasses && el._x_undoAddedClasses();
      el._x_undoAddedStyles && el._x_undoAddedStyles();
    });
  };
  handler2.inline = (el, { value, modifiers, expression }) => {
    if (!value) return;
    if (!el._x_inlineBindings) el._x_inlineBindings = {};
    el._x_inlineBindings[value] = { expression, extract: false };
  };
  directive('bind', handler2);
  function storeKeyForXFor(el, expression) {
    el._x_keyExpression = expression;
  }
  addRootSelector(() => `[${prefix('data')}]`);
  directive('data', (el, { expression }, { cleanup: cleanup2 }) => {
    if (shouldSkipRegisteringDataDuringClone(el)) return;
    expression = expression === '' ? '{}' : expression;
    let magicContext = {};
    injectMagics(magicContext, el);
    let dataProviderContext = {};
    injectDataProviders(dataProviderContext, magicContext);
    let data2 = evaluate(el, expression, { scope: dataProviderContext });
    if (data2 === void 0 || data2 === true) data2 = {};
    injectMagics(data2, el);
    let reactiveData = reactive(data2);
    initInterceptors(reactiveData);
    let undo = addScopeToNode(el, reactiveData);
    reactiveData['init'] && evaluate(el, reactiveData['init']);
    cleanup2(() => {
      reactiveData['destroy'] && evaluate(el, reactiveData['destroy']);
      undo();
    });
  });
  interceptClone((from, to) => {
    if (from._x_dataStack) {
      to._x_dataStack = from._x_dataStack;
      to.setAttribute('data-has-alpine-state', true);
    }
  });
  function shouldSkipRegisteringDataDuringClone(el) {
    if (!isCloning) return false;
    if (isCloningLegacy) return true;
    return el.hasAttribute('data-has-alpine-state');
  }
  directive('show', (el, { modifiers, expression }, { effect: effect3 }) => {
    let evaluate2 = evaluateLater(el, expression);
    if (!el._x_doHide)
      el._x_doHide = () => {
        mutateDom(() => {
          el.style.setProperty(
            'display',
            'none',
            modifiers.includes('important') ? 'important' : void 0
          );
        });
      };
    if (!el._x_doShow)
      el._x_doShow = () => {
        mutateDom(() => {
          if (el.style.length === 1 && el.style.display === 'none') {
            el.removeAttribute('style');
          } else {
            el.style.removeProperty('display');
          }
        });
      };
    let hide = () => {
      el._x_doHide();
      el._x_isShown = false;
    };
    let show = () => {
      el._x_doShow();
      el._x_isShown = true;
    };
    let clickAwayCompatibleShow = () => setTimeout(show);
    let toggle = once(
      (value) => (value ? show() : hide()),
      (value) => {
        if (typeof el._x_toggleAndCascadeWithTransitions === 'function') {
          el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
        } else {
          value ? clickAwayCompatibleShow() : hide();
        }
      }
    );
    let oldValue;
    let firstTime = true;
    effect3(() =>
      evaluate2((value) => {
        if (!firstTime && value === oldValue) return;
        if (modifiers.includes('immediate')) value ? clickAwayCompatibleShow() : hide();
        toggle(value);
        oldValue = value;
        firstTime = false;
      })
    );
  });
  directive('for', (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
    let iteratorNames = parseForExpression(expression);
    let evaluateItems = evaluateLater(el, iteratorNames.items);
    let evaluateKey = evaluateLater(
      el,
      // the x-bind:key expression is stored for our use instead of evaluated.
      el._x_keyExpression || 'index'
    );
    el._x_prevKeys = [];
    el._x_lookup = {};
    effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
    cleanup2(() => {
      Object.values(el._x_lookup).forEach((el2) =>
        mutateDom(() => {
          destroyTree(el2);
          el2.remove();
        })
      );
      delete el._x_prevKeys;
      delete el._x_lookup;
    });
  });
  function loop(el, iteratorNames, evaluateItems, evaluateKey) {
    let isObject2 = (i) => typeof i === 'object' && !Array.isArray(i);
    let templateEl = el;
    evaluateItems((items) => {
      if (isNumeric3(items) && items >= 0) {
        items = Array.from(Array(items).keys(), (i) => i + 1);
      }
      if (items === void 0) items = [];
      let lookup = el._x_lookup;
      let prevKeys = el._x_prevKeys;
      let scopes = [];
      let keys = [];
      if (isObject2(items)) {
        items = Object.entries(items).map(([key, value]) => {
          let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
          evaluateKey(
            (value2) => {
              if (keys.includes(value2)) warn('Duplicate key on x-for', el);
              keys.push(value2);
            },
            { scope: { index: key, ...scope2 } }
          );
          scopes.push(scope2);
        });
      } else {
        for (let i = 0; i < items.length; i++) {
          let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
          evaluateKey(
            (value) => {
              if (keys.includes(value)) warn('Duplicate key on x-for', el);
              keys.push(value);
            },
            { scope: { index: i, ...scope2 } }
          );
          scopes.push(scope2);
        }
      }
      let adds = [];
      let moves = [];
      let removes = [];
      let sames = [];
      for (let i = 0; i < prevKeys.length; i++) {
        let key = prevKeys[i];
        if (keys.indexOf(key) === -1) removes.push(key);
      }
      prevKeys = prevKeys.filter((key) => !removes.includes(key));
      let lastKey = 'template';
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let prevIndex = prevKeys.indexOf(key);
        if (prevIndex === -1) {
          prevKeys.splice(i, 0, key);
          adds.push([lastKey, i]);
        } else if (prevIndex !== i) {
          let keyInSpot = prevKeys.splice(i, 1)[0];
          let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
          prevKeys.splice(i, 0, keyForSpot);
          prevKeys.splice(prevIndex, 0, keyInSpot);
          moves.push([keyInSpot, keyForSpot]);
        } else {
          sames.push(key);
        }
        lastKey = key;
      }
      for (let i = 0; i < removes.length; i++) {
        let key = removes[i];
        if (!(key in lookup)) continue;
        mutateDom(() => {
          destroyTree(lookup[key]);
          lookup[key].remove();
        });
        delete lookup[key];
      }
      for (let i = 0; i < moves.length; i++) {
        let [keyInSpot, keyForSpot] = moves[i];
        let elInSpot = lookup[keyInSpot];
        let elForSpot = lookup[keyForSpot];
        let marker = document.createElement('div');
        mutateDom(() => {
          if (!elForSpot)
            warn(`x-for ":key" is undefined or invalid`, templateEl, keyForSpot, lookup);
          elForSpot.after(marker);
          elInSpot.after(elForSpot);
          elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
          marker.before(elInSpot);
          elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
          marker.remove();
        });
        elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
      }
      for (let i = 0; i < adds.length; i++) {
        let [lastKey2, index] = adds[i];
        let lastEl = lastKey2 === 'template' ? templateEl : lookup[lastKey2];
        if (lastEl._x_currentIfEl) lastEl = lastEl._x_currentIfEl;
        let scope2 = scopes[index];
        let key = keys[index];
        let clone2 = document.importNode(templateEl.content, true).firstElementChild;
        let reactiveScope = reactive(scope2);
        addScopeToNode(clone2, reactiveScope, templateEl);
        clone2._x_refreshXForScope = (newScope) => {
          Object.entries(newScope).forEach(([key2, value]) => {
            reactiveScope[key2] = value;
          });
        };
        mutateDom(() => {
          lastEl.after(clone2);
          skipDuringClone(() => initTree(clone2))();
        });
        if (typeof key === 'object') {
          warn('x-for key cannot be an object, it must be a string or an integer', templateEl);
        }
        lookup[key] = clone2;
      }
      for (let i = 0; i < sames.length; i++) {
        lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
      }
      templateEl._x_prevKeys = keys;
    });
  }
  function parseForExpression(expression) {
    let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    let stripParensRE = /^\s*\(|\)\s*$/g;
    let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    let inMatch = expression.match(forAliasRE);
    if (!inMatch) return;
    let res = {};
    res.items = inMatch[2].trim();
    let item = inMatch[1].replace(stripParensRE, '').trim();
    let iteratorMatch = item.match(forIteratorRE);
    if (iteratorMatch) {
      res.item = item.replace(forIteratorRE, '').trim();
      res.index = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.collection = iteratorMatch[2].trim();
      }
    } else {
      res.item = item;
    }
    return res;
  }
  function getIterationScopeVariables(iteratorNames, item, index, items) {
    let scopeVariables = {};
    if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
      let names = iteratorNames.item
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name, i) => {
        scopeVariables[name] = item[i];
      });
    } else if (
      /^\{.*\}$/.test(iteratorNames.item) &&
      !Array.isArray(item) &&
      typeof item === 'object'
    ) {
      let names = iteratorNames.item
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map((i) => i.trim());
      names.forEach((name) => {
        scopeVariables[name] = item[name];
      });
    } else {
      scopeVariables[iteratorNames.item] = item;
    }
    if (iteratorNames.index) scopeVariables[iteratorNames.index] = index;
    if (iteratorNames.collection) scopeVariables[iteratorNames.collection] = items;
    return scopeVariables;
  }
  function isNumeric3(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function handler3() {}
  handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
    let root = closestRoot(el);
    if (!root._x_refs) root._x_refs = {};
    root._x_refs[expression] = el;
    cleanup2(() => delete root._x_refs[expression]);
  };
  directive('ref', handler3);
  directive('if', (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== 'template')
      warn('x-if can only be used on a <template> tag', el);
    let evaluate2 = evaluateLater(el, expression);
    let show = () => {
      if (el._x_currentIfEl) return el._x_currentIfEl;
      let clone2 = el.content.cloneNode(true).firstElementChild;
      addScopeToNode(clone2, {}, el);
      mutateDom(() => {
        el.after(clone2);
        skipDuringClone(() => initTree(clone2))();
      });
      el._x_currentIfEl = clone2;
      el._x_undoIf = () => {
        mutateDom(() => {
          destroyTree(clone2);
          clone2.remove();
        });
        delete el._x_currentIfEl;
      };
      return clone2;
    };
    let hide = () => {
      if (!el._x_undoIf) return;
      el._x_undoIf();
      delete el._x_undoIf;
    };
    effect3(() =>
      evaluate2((value) => {
        value ? show() : hide();
      })
    );
    cleanup2(() => el._x_undoIf && el._x_undoIf());
  });
  directive('id', (el, { expression }, { evaluate: evaluate2 }) => {
    let names = evaluate2(expression);
    names.forEach((name) => setIdRoot(el, name));
  });
  interceptClone((from, to) => {
    if (from._x_ids) {
      to._x_ids = from._x_ids;
    }
  });
  mapAttributes(startingWith('@', into(prefix('on:'))));
  directive(
    'on',
    skipDuringClone((el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
      let evaluate2 = expression ? evaluateLater(el, expression) : () => {};
      if (el.tagName.toLowerCase() === 'template') {
        if (!el._x_forwardEvents) el._x_forwardEvents = [];
        if (!el._x_forwardEvents.includes(value)) el._x_forwardEvents.push(value);
      }
      let removeListener = on(el, value, modifiers, (e) => {
        evaluate2(() => {}, { scope: { $event: e }, params: [e] });
      });
      cleanup2(() => removeListener());
    })
  );
  warnMissingPluginDirective('Collapse', 'collapse', 'collapse');
  warnMissingPluginDirective('Intersect', 'intersect', 'intersect');
  warnMissingPluginDirective('Focus', 'trap', 'focus');
  warnMissingPluginDirective('Mask', 'mask', 'mask');
  function warnMissingPluginDirective(name, directiveName, slug) {
    directive(directiveName, (el) =>
      warn(
        `You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`,
        el
      )
    );
  }
  alpine_default.setEvaluator(cspEvaluator);
  alpine_default.setReactivityEngine({
    reactive: reactive2,
    effect: effect2,
    release: stop,
    raw: toRaw,
  });
  var src_default = alpine_default;
  var module_default = src_default;

  // node_modules/@alpinejs/persist/dist/module.esm.js
  function src_default2(Alpine2) {
    let persist = () => {
      let alias;
      let storage;
      try {
        storage = localStorage;
      } catch (e) {
        console.error(e);
        console.warn(
          'Alpine: $persist is using temporary storage since localStorage is unavailable.'
        );
        let dummy = /* @__PURE__ */ new Map();
        storage = {
          getItem: dummy.get.bind(dummy),
          setItem: dummy.set.bind(dummy),
        };
      }
      return Alpine2.interceptor(
        (initialValue, getter, setter, path, key) => {
          let lookup = alias || `_x_${path}`;
          let initial = storageHas(lookup, storage) ? storageGet(lookup, storage) : initialValue;
          setter(initial);
          Alpine2.effect(() => {
            let value = getter();
            storageSet(lookup, value, storage);
            setter(value);
          });
          return initial;
        },
        (func) => {
          ((func.as = (key) => {
            alias = key;
            return func;
          }),
            (func.using = (target) => {
              storage = target;
              return func;
            }));
        }
      );
    };
    Object.defineProperty(Alpine2, '$persist', { get: () => persist() });
    Alpine2.magic('persist', persist);
    Alpine2.persist = (key, { get: get3, set: set3 }, storage = localStorage) => {
      let initial = storageHas(key, storage) ? storageGet(key, storage) : get3();
      set3(initial);
      Alpine2.effect(() => {
        let value = get3();
        storageSet(key, value, storage);
        set3(value);
      });
    };
  }
  function storageHas(key, storage) {
    return storage.getItem(key) !== null;
  }
  function storageGet(key, storage) {
    let value = storage.getItem(key);
    if (value === void 0) return;
    return JSON.parse(value);
  }
  function storageSet(key, value, storage) {
    storage.setItem(key, JSON.stringify(value));
  }
  var module_default2 = src_default2;

  // node_modules/@alpinejs/intersect/dist/module.esm.js
  function src_default3(Alpine2) {
    Alpine2.directive(
      'intersect',
      Alpine2.skipDuringClone(
        (
          el,
          { value, expression, modifiers },
          { evaluateLater: evaluateLater2, cleanup: cleanup2 }
        ) => {
          let evaluate2 = evaluateLater2(expression);
          let options = {
            rootMargin: getRootMargin(modifiers),
            threshold: getThreshold(modifiers),
          };
          let observer2 = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting === (value === 'leave')) return;
              evaluate2();
              modifiers.includes('once') && observer2.disconnect();
            });
          }, options);
          observer2.observe(el);
          cleanup2(() => {
            observer2.disconnect();
          });
        }
      )
    );
  }
  function getThreshold(modifiers) {
    if (modifiers.includes('full')) return 0.99;
    if (modifiers.includes('half')) return 0.5;
    if (!modifiers.includes('threshold')) return 0;
    let threshold = modifiers[modifiers.indexOf('threshold') + 1];
    if (threshold === '100') return 1;
    if (threshold === '0') return 0;
    return Number(`.${threshold}`);
  }
  function getLengthValue(rawValue) {
    let match = rawValue.match(/^(-?[0-9]+)(px|%)?$/);
    return match ? match[1] + (match[2] || 'px') : void 0;
  }
  function getRootMargin(modifiers) {
    const key = 'margin';
    const fallback = '0px 0px 0px 0px';
    const index = modifiers.indexOf(key);
    if (index === -1) return fallback;
    let values = [];
    for (let i = 1; i < 5; i++) {
      values.push(getLengthValue(modifiers[index + i] || ''));
    }
    values = values.filter((v) => v !== void 0);
    return values.length ? values.join(' ').trim() : fallback;
  }
  var module_default3 = src_default3;

  // node_modules/@alpinejs/focus/dist/module.esm.js
  var candidateSelectors = [
    'input',
    'select',
    'textarea',
    'a[href]',
    'button',
    '[tabindex]:not(slot)',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    'details>summary:first-of-type',
    'details',
  ];
  var candidateSelector = /* @__PURE__ */ candidateSelectors.join(',');
  var NoElement = typeof Element === 'undefined';
  var matches = NoElement
    ? function () {}
    : Element.prototype.matches ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  var getRootNode =
    !NoElement && Element.prototype.getRootNode
      ? function (element) {
          return element.getRootNode();
        }
      : function (element) {
          return element.ownerDocument;
        };
  var getCandidates = function getCandidates2(el, includeContainer, filter) {
    var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
    if (includeContainer && matches.call(el, candidateSelector)) {
      candidates.unshift(el);
    }
    candidates = candidates.filter(filter);
    return candidates;
  };
  var getCandidatesIteratively = function getCandidatesIteratively2(
    elements,
    includeContainer,
    options
  ) {
    var candidates = [];
    var elementsToCheck = Array.from(elements);
    while (elementsToCheck.length) {
      var element = elementsToCheck.shift();
      if (element.tagName === 'SLOT') {
        var assigned = element.assignedElements();
        var content = assigned.length ? assigned : element.children;
        var nestedCandidates = getCandidatesIteratively2(content, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, nestedCandidates);
        } else {
          candidates.push({
            scope: element,
            candidates: nestedCandidates,
          });
        }
      } else {
        var validCandidate = matches.call(element, candidateSelector);
        if (
          validCandidate &&
          options.filter(element) &&
          (includeContainer || !elements.includes(element))
        ) {
          candidates.push(element);
        }
        var shadowRoot =
          element.shadowRoot || // check for an undisclosed shadow
          (typeof options.getShadowRoot === 'function' && options.getShadowRoot(element));
        var validShadowRoot = !options.shadowRootFilter || options.shadowRootFilter(element);
        if (shadowRoot && validShadowRoot) {
          var _nestedCandidates = getCandidatesIteratively2(
            shadowRoot === true ? element.children : shadowRoot.children,
            true,
            options
          );
          if (options.flatten) {
            candidates.push.apply(candidates, _nestedCandidates);
          } else {
            candidates.push({
              scope: element,
              candidates: _nestedCandidates,
            });
          }
        } else {
          elementsToCheck.unshift.apply(elementsToCheck, element.children);
        }
      }
    }
    return candidates;
  };
  var getTabindex = function getTabindex2(node, isScope) {
    if (node.tabIndex < 0) {
      if (
        (isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) &&
        isNaN(parseInt(node.getAttribute('tabindex'), 10))
      ) {
        return 0;
      }
    }
    return node.tabIndex;
  };
  var sortOrderedTabbables = function sortOrderedTabbables2(a, b) {
    return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
  };
  var isInput = function isInput2(node) {
    return node.tagName === 'INPUT';
  };
  var isHiddenInput = function isHiddenInput2(node) {
    return isInput(node) && node.type === 'hidden';
  };
  var isDetailsWithSummary = function isDetailsWithSummary2(node) {
    var r =
      node.tagName === 'DETAILS' &&
      Array.prototype.slice.apply(node.children).some(function (child) {
        return child.tagName === 'SUMMARY';
      });
    return r;
  };
  var getCheckedRadio = function getCheckedRadio2(nodes, form) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked && nodes[i].form === form) {
        return nodes[i];
      }
    }
  };
  var isTabbableRadio = function isTabbableRadio2(node) {
    if (!node.name) {
      return true;
    }
    var radioScope = node.form || getRootNode(node);
    var queryRadios = function queryRadios2(name) {
      return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
    };
    var radioSet;
    if (
      typeof window !== 'undefined' &&
      typeof window.CSS !== 'undefined' &&
      typeof window.CSS.escape === 'function'
    ) {
      radioSet = queryRadios(window.CSS.escape(node.name));
    } else {
      try {
        radioSet = queryRadios(node.name);
      } catch (err) {
        console.error(
          'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
          err.message
        );
        return false;
      }
    }
    var checked = getCheckedRadio(radioSet, node.form);
    return !checked || checked === node;
  };
  var isRadio2 = function isRadio22(node) {
    return isInput(node) && node.type === 'radio';
  };
  var isNonTabbableRadio = function isNonTabbableRadio2(node) {
    return isRadio2(node) && !isTabbableRadio(node);
  };
  var isZeroArea = function isZeroArea2(node) {
    var _node$getBoundingClie = node.getBoundingClientRect(),
      width = _node$getBoundingClie.width,
      height = _node$getBoundingClie.height;
    return width === 0 && height === 0;
  };
  var isHidden = function isHidden2(node, _ref) {
    var displayCheck = _ref.displayCheck,
      getShadowRoot = _ref.getShadowRoot;
    if (getComputedStyle(node).visibility === 'hidden') {
      return true;
    }
    var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
    var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
    if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
      return true;
    }
    var nodeRootHost = getRootNode(node).host;
    var nodeIsAttached =
      (nodeRootHost === null || nodeRootHost === void 0
        ? void 0
        : nodeRootHost.ownerDocument.contains(nodeRootHost)) || node.ownerDocument.contains(node);
    if (!displayCheck || displayCheck === 'full') {
      if (typeof getShadowRoot === 'function') {
        var originalNode = node;
        while (node) {
          var parentElement = node.parentElement;
          var rootNode = getRootNode(node);
          if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
            return isZeroArea(node);
          } else if (node.assignedSlot) {
            node = node.assignedSlot;
          } else if (!parentElement && rootNode !== node.ownerDocument) {
            node = rootNode.host;
          } else {
            node = parentElement;
          }
        }
        node = originalNode;
      }
      if (nodeIsAttached) {
        return !node.getClientRects().length;
      }
    } else if (displayCheck === 'non-zero-area') {
      return isZeroArea(node);
    }
    return false;
  };
  var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
      var parentNode = node.parentElement;
      while (parentNode) {
        if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
          for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children.item(i);
            if (child.tagName === 'LEGEND') {
              return matches.call(parentNode, 'fieldset[disabled] *')
                ? true
                : !child.contains(node);
            }
          }
          return true;
        }
        parentNode = parentNode.parentElement;
      }
    }
    return false;
  };
  var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
    if (
      node.disabled ||
      isHiddenInput(node) ||
      isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
      isDetailsWithSummary(node) ||
      isDisabledFromFieldset(node)
    ) {
      return false;
    }
    return true;
  };
  var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
    if (
      isNonTabbableRadio(node) ||
      getTabindex(node) < 0 ||
      !isNodeMatchingSelectorFocusable(options, node)
    ) {
      return false;
    }
    return true;
  };
  var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
    var tabIndex = parseInt(shadowHostNode.getAttribute('tabindex'), 10);
    if (isNaN(tabIndex) || tabIndex >= 0) {
      return true;
    }
    return false;
  };
  var sortByOrder = function sortByOrder2(candidates) {
    var regularTabbables = [];
    var orderedTabbables = [];
    candidates.forEach(function (item, i) {
      var isScope = !!item.scope;
      var element = isScope ? item.scope : item;
      var candidateTabindex = getTabindex(element, isScope);
      var elements = isScope ? sortByOrder2(item.candidates) : element;
      if (candidateTabindex === 0) {
        isScope
          ? regularTabbables.push.apply(regularTabbables, elements)
          : regularTabbables.push(element);
      } else {
        orderedTabbables.push({
          documentOrder: i,
          tabIndex: candidateTabindex,
          item,
          isScope,
          content: elements,
        });
      }
    });
    return orderedTabbables
      .sort(sortOrderedTabbables)
      .reduce(function (acc, sortable) {
        sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
        return acc;
      }, [])
      .concat(regularTabbables);
  };
  var tabbable = function tabbable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorTabbable.bind(null, options),
        flatten: false,
        getShadowRoot: options.getShadowRoot,
        shadowRootFilter: isValidShadowRootTabbable,
      });
    } else {
      candidates = getCandidates(
        el,
        options.includeContainer,
        isNodeMatchingSelectorTabbable.bind(null, options)
      );
    }
    return sortByOrder(candidates);
  };
  var focusable = function focusable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorFocusable.bind(null, options),
        flatten: true,
        getShadowRoot: options.getShadowRoot,
      });
    } else {
      candidates = getCandidates(
        el,
        options.includeContainer,
        isNodeMatchingSelectorFocusable.bind(null, options)
      );
    }
    return candidates;
  };
  var isTabbable = function isTabbable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error('No node provided');
    }
    if (matches.call(node, candidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorTabbable(options, node);
  };
  var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat('iframe').join(',');
  var isFocusable = function isFocusable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error('No node provided');
    }
    if (matches.call(node, focusableCandidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorFocusable(options, node);
  };
  function ownKeys2(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      (enumerableOnly &&
        (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })),
        keys.push.apply(keys, symbols));
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2
        ? ownKeys2(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
          : ownKeys2(Object(source)).forEach(function (key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var activeFocusTraps = /* @__PURE__ */ (function () {
    var trapQueue = [];
    return {
      activateTrap: function activateTrap(trap) {
        if (trapQueue.length > 0) {
          var activeTrap = trapQueue[trapQueue.length - 1];
          if (activeTrap !== trap) {
            activeTrap.pause();
          }
        }
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex === -1) {
          trapQueue.push(trap);
        } else {
          trapQueue.splice(trapIndex, 1);
          trapQueue.push(trap);
        }
      },
      deactivateTrap: function deactivateTrap(trap) {
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex !== -1) {
          trapQueue.splice(trapIndex, 1);
        }
        if (trapQueue.length > 0) {
          trapQueue[trapQueue.length - 1].unpause();
        }
      },
    };
  })();
  var isSelectableInput = function isSelectableInput2(node) {
    return (
      node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function'
    );
  };
  var isEscapeEvent = function isEscapeEvent2(e) {
    return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
  };
  var isTabEvent = function isTabEvent2(e) {
    return e.key === 'Tab' || e.keyCode === 9;
  };
  var delay = function delay2(fn) {
    return setTimeout(fn, 0);
  };
  var findIndex = function findIndex2(arr, fn) {
    var idx = -1;
    arr.every(function (value, i) {
      if (fn(value)) {
        idx = i;
        return false;
      }
      return true;
    });
    return idx;
  };
  var valueOrHandler = function valueOrHandler2(value) {
    for (
      var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
      _key < _len;
      _key++
    ) {
      params[_key - 1] = arguments[_key];
    }
    return typeof value === 'function' ? value.apply(void 0, params) : value;
  };
  var getActualTarget = function getActualTarget2(event) {
    return event.target.shadowRoot && typeof event.composedPath === 'function'
      ? event.composedPath()[0]
      : event.target;
  };
  var createFocusTrap = function createFocusTrap2(elements, userOptions) {
    var doc =
      (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
    var config = _objectSpread2(
      {
        returnFocusOnDeactivate: true,
        escapeDeactivates: true,
        delayInitialFocus: true,
      },
      userOptions
    );
    var state = {
      // containers given to createFocusTrap()
      // @type {Array<HTMLElement>}
      containers: [],
      // list of objects identifying tabbable nodes in `containers` in the trap
      // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
      //  is active, but the trap should never get to a state where there isn't at least one group
      //  with at least one tabbable node in it (that would lead to an error condition that would
      //  result in an error being thrown)
      // @type {Array<{
      //   container: HTMLElement,
      //   tabbableNodes: Array<HTMLElement>, // empty if none
      //   focusableNodes: Array<HTMLElement>, // empty if none
      //   firstTabbableNode: HTMLElement|null,
      //   lastTabbableNode: HTMLElement|null,
      //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
      // }>}
      containerGroups: [],
      // same order/length as `containers` list
      // references to objects in `containerGroups`, but only those that actually have
      //  tabbable nodes in them
      // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
      //  the same length
      tabbableGroups: [],
      nodeFocusedBeforeActivation: null,
      mostRecentlyFocusedNode: null,
      active: false,
      paused: false,
      // timer ID for when delayInitialFocus is true and initial focus in this trap
      //  has been delayed during activation
      delayInitialFocusTimer: void 0,
    };
    var trap;
    var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
      return configOverrideOptions && configOverrideOptions[optionName] !== void 0
        ? configOverrideOptions[optionName]
        : config[configOptionName || optionName];
    };
    var findContainerIndex = function findContainerIndex2(element) {
      return state.containerGroups.findIndex(function (_ref) {
        var container = _ref.container,
          tabbableNodes = _ref.tabbableNodes;
        return (
          container.contains(element) || // fall back to explicit tabbable search which will take into consideration any
          //  web components if the `tabbableOptions.getShadowRoot` option was used for
          //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
          //  look inside web components even if open)
          tabbableNodes.find(function (node) {
            return node === element;
          })
        );
      });
    };
    var getNodeForOption = function getNodeForOption2(optionName) {
      var optionValue = config[optionName];
      if (typeof optionValue === 'function') {
        for (
          var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;
          _key2 < _len2;
          _key2++
        ) {
          params[_key2 - 1] = arguments[_key2];
        }
        optionValue = optionValue.apply(void 0, params);
      }
      if (optionValue === true) {
        optionValue = void 0;
      }
      if (!optionValue) {
        if (optionValue === void 0 || optionValue === false) {
          return optionValue;
        }
        throw new Error(
          '`'.concat(optionName, '` was specified but was not a node, or did not return a node')
        );
      }
      var node = optionValue;
      if (typeof optionValue === 'string') {
        node = doc.querySelector(optionValue);
        if (!node) {
          throw new Error('`'.concat(optionName, '` as selector refers to no known node'));
        }
      }
      return node;
    };
    var getInitialFocusNode = function getInitialFocusNode2() {
      var node = getNodeForOption('initialFocus');
      if (node === false) {
        return false;
      }
      if (node === void 0) {
        if (findContainerIndex(doc.activeElement) >= 0) {
          node = doc.activeElement;
        } else {
          var firstTabbableGroup = state.tabbableGroups[0];
          var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
          node = firstTabbableNode || getNodeForOption('fallbackFocus');
        }
      }
      if (!node) {
        throw new Error('Your focus-trap needs to have at least one focusable element');
      }
      return node;
    };
    var updateTabbableNodes = function updateTabbableNodes2() {
      state.containerGroups = state.containers.map(function (container) {
        var tabbableNodes = tabbable(container, config.tabbableOptions);
        var focusableNodes = focusable(container, config.tabbableOptions);
        return {
          container,
          tabbableNodes,
          focusableNodes,
          firstTabbableNode: tabbableNodes.length > 0 ? tabbableNodes[0] : null,
          lastTabbableNode:
            tabbableNodes.length > 0 ? tabbableNodes[tabbableNodes.length - 1] : null,
          /**
           * Finds the __tabbable__ node that follows the given node in the specified direction,
           *  in this container, if any.
           * @param {HTMLElement} node
           * @param {boolean} [forward] True if going in forward tab order; false if going
           *  in reverse.
           * @returns {HTMLElement|undefined} The next tabbable node, if any.
           */
          nextTabbableNode: function nextTabbableNode(node) {
            var forward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
            var nodeIdx = focusableNodes.findIndex(function (n) {
              return n === node;
            });
            if (nodeIdx < 0) {
              return void 0;
            }
            if (forward) {
              return focusableNodes.slice(nodeIdx + 1).find(function (n) {
                return isTabbable(n, config.tabbableOptions);
              });
            }
            return focusableNodes
              .slice(0, nodeIdx)
              .reverse()
              .find(function (n) {
                return isTabbable(n, config.tabbableOptions);
              });
          },
        };
      });
      state.tabbableGroups = state.containerGroups.filter(function (group) {
        return group.tabbableNodes.length > 0;
      });
      if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus')) {
        throw new Error(
          'Your focus-trap must have at least one container with at least one tabbable node in it at all times'
        );
      }
    };
    var tryFocus = function tryFocus2(node) {
      if (node === false) {
        return;
      }
      if (node === doc.activeElement) {
        return;
      }
      if (!node || !node.focus) {
        tryFocus2(getInitialFocusNode());
        return;
      }
      node.focus({
        preventScroll: !!config.preventScroll,
      });
      state.mostRecentlyFocusedNode = node;
      if (isSelectableInput(node)) {
        node.select();
      }
    };
    var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
      var node = getNodeForOption('setReturnFocus', previousActiveElement);
      return node ? node : node === false ? false : previousActiveElement;
    };
    var checkPointerDown = function checkPointerDown2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target) >= 0) {
        return;
      }
      if (valueOrHandler(config.clickOutsideDeactivates, e)) {
        trap.deactivate({
          // if, on deactivation, we should return focus to the node originally-focused
          //  when the trap was activated (or the configured `setReturnFocus` node),
          //  then assume it's also OK to return focus to the outside node that was
          //  just clicked, causing deactivation, as long as that node is focusable;
          //  if it isn't focusable, then return focus to the original node focused
          //  on activation (or the configured `setReturnFocus` node)
          // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
          //  which will result in the outside click setting focus to the node
          //  that was clicked, whether it's focusable or not; by setting
          //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
          //  on activation (or the configured `setReturnFocus` node)
          returnFocus:
            config.returnFocusOnDeactivate && !isFocusable(target, config.tabbableOptions),
        });
        return;
      }
      if (valueOrHandler(config.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
    };
    var checkFocusIn = function checkFocusIn2(e) {
      var target = getActualTarget(e);
      var targetContained = findContainerIndex(target) >= 0;
      if (targetContained || target instanceof Document) {
        if (targetContained) {
          state.mostRecentlyFocusedNode = target;
        }
      } else {
        e.stopImmediatePropagation();
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    };
    var checkTab = function checkTab2(e) {
      var target = getActualTarget(e);
      updateTabbableNodes();
      var destinationNode = null;
      if (state.tabbableGroups.length > 0) {
        var containerIndex = findContainerIndex(target);
        var containerGroup = containerIndex >= 0 ? state.containerGroups[containerIndex] : void 0;
        if (containerIndex < 0) {
          if (e.shiftKey) {
            destinationNode =
              state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
          } else {
            destinationNode = state.tabbableGroups[0].firstTabbableNode;
          }
        } else if (e.shiftKey) {
          var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref2) {
            var firstTabbableNode = _ref2.firstTabbableNode;
            return target === firstTabbableNode;
          });
          if (
            startOfGroupIndex < 0 &&
            (containerGroup.container === target ||
              (isFocusable(target, config.tabbableOptions) &&
                !isTabbable(target, config.tabbableOptions) &&
                !containerGroup.nextTabbableNode(target, false)))
          ) {
            startOfGroupIndex = containerIndex;
          }
          if (startOfGroupIndex >= 0) {
            var destinationGroupIndex =
              startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
            var destinationGroup = state.tabbableGroups[destinationGroupIndex];
            destinationNode = destinationGroup.lastTabbableNode;
          }
        } else {
          var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
            var lastTabbableNode = _ref3.lastTabbableNode;
            return target === lastTabbableNode;
          });
          if (
            lastOfGroupIndex < 0 &&
            (containerGroup.container === target ||
              (isFocusable(target, config.tabbableOptions) &&
                !isTabbable(target, config.tabbableOptions) &&
                !containerGroup.nextTabbableNode(target)))
          ) {
            lastOfGroupIndex = containerIndex;
          }
          if (lastOfGroupIndex >= 0) {
            var _destinationGroupIndex =
              lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
            var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
            destinationNode = _destinationGroup.firstTabbableNode;
          }
        }
      } else {
        destinationNode = getNodeForOption('fallbackFocus');
      }
      if (destinationNode) {
        e.preventDefault();
        tryFocus(destinationNode);
      }
    };
    var checkKey = function checkKey2(e) {
      if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates, e) !== false) {
        e.preventDefault();
        trap.deactivate();
        return;
      }
      if (isTabEvent(e)) {
        checkTab(e);
        return;
      }
    };
    var checkClick = function checkClick2(e) {
      var target = getActualTarget(e);
      if (findContainerIndex(target) >= 0) {
        return;
      }
      if (valueOrHandler(config.clickOutsideDeactivates, e)) {
        return;
      }
      if (valueOrHandler(config.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    var addListeners = function addListeners2() {
      if (!state.active) {
        return;
      }
      activeFocusTraps.activateTrap(trap);
      state.delayInitialFocusTimer = config.delayInitialFocus
        ? delay(function () {
            tryFocus(getInitialFocusNode());
          })
        : tryFocus(getInitialFocusNode());
      doc.addEventListener('focusin', checkFocusIn, true);
      doc.addEventListener('mousedown', checkPointerDown, {
        capture: true,
        passive: false,
      });
      doc.addEventListener('touchstart', checkPointerDown, {
        capture: true,
        passive: false,
      });
      doc.addEventListener('click', checkClick, {
        capture: true,
        passive: false,
      });
      doc.addEventListener('keydown', checkKey, {
        capture: true,
        passive: false,
      });
      return trap;
    };
    var removeListeners = function removeListeners2() {
      if (!state.active) {
        return;
      }
      doc.removeEventListener('focusin', checkFocusIn, true);
      doc.removeEventListener('mousedown', checkPointerDown, true);
      doc.removeEventListener('touchstart', checkPointerDown, true);
      doc.removeEventListener('click', checkClick, true);
      doc.removeEventListener('keydown', checkKey, true);
      return trap;
    };
    trap = {
      get active() {
        return state.active;
      },
      get paused() {
        return state.paused;
      },
      activate: function activate(activateOptions) {
        if (state.active) {
          return this;
        }
        var onActivate = getOption(activateOptions, 'onActivate');
        var onPostActivate = getOption(activateOptions, 'onPostActivate');
        var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');
        if (!checkCanFocusTrap) {
          updateTabbableNodes();
        }
        state.active = true;
        state.paused = false;
        state.nodeFocusedBeforeActivation = doc.activeElement;
        if (onActivate) {
          onActivate();
        }
        var finishActivation = function finishActivation2() {
          if (checkCanFocusTrap) {
            updateTabbableNodes();
          }
          addListeners();
          if (onPostActivate) {
            onPostActivate();
          }
        };
        if (checkCanFocusTrap) {
          checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
          return this;
        }
        finishActivation();
        return this;
      },
      deactivate: function deactivate(deactivateOptions) {
        if (!state.active) {
          return this;
        }
        var options = _objectSpread2(
          {
            onDeactivate: config.onDeactivate,
            onPostDeactivate: config.onPostDeactivate,
            checkCanReturnFocus: config.checkCanReturnFocus,
          },
          deactivateOptions
        );
        clearTimeout(state.delayInitialFocusTimer);
        state.delayInitialFocusTimer = void 0;
        removeListeners();
        state.active = false;
        state.paused = false;
        activeFocusTraps.deactivateTrap(trap);
        var onDeactivate = getOption(options, 'onDeactivate');
        var onPostDeactivate = getOption(options, 'onPostDeactivate');
        var checkCanReturnFocus = getOption(options, 'checkCanReturnFocus');
        var returnFocus = getOption(options, 'returnFocus', 'returnFocusOnDeactivate');
        if (onDeactivate) {
          onDeactivate();
        }
        var finishDeactivation = function finishDeactivation2() {
          delay(function () {
            if (returnFocus) {
              tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
            }
            if (onPostDeactivate) {
              onPostDeactivate();
            }
          });
        };
        if (returnFocus && checkCanReturnFocus) {
          checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(
            finishDeactivation,
            finishDeactivation
          );
          return this;
        }
        finishDeactivation();
        return this;
      },
      pause: function pause() {
        if (state.paused || !state.active) {
          return this;
        }
        state.paused = true;
        removeListeners();
        return this;
      },
      unpause: function unpause() {
        if (!state.paused || !state.active) {
          return this;
        }
        state.paused = false;
        updateTabbableNodes();
        addListeners();
        return this;
      },
      updateContainerElements: function updateContainerElements(containerElements) {
        var elementsAsArray = [].concat(containerElements).filter(Boolean);
        state.containers = elementsAsArray.map(function (element) {
          return typeof element === 'string' ? doc.querySelector(element) : element;
        });
        if (state.active) {
          updateTabbableNodes();
        }
        return this;
      },
    };
    trap.updateContainerElements(elements);
    return trap;
  };
  function src_default4(Alpine2) {
    let lastFocused;
    let currentFocused;
    window.addEventListener('focusin', () => {
      lastFocused = currentFocused;
      currentFocused = document.activeElement;
    });
    Alpine2.magic('focus', (el) => {
      let within = el;
      return {
        __noscroll: false,
        __wrapAround: false,
        within(el2) {
          within = el2;
          return this;
        },
        withoutScrolling() {
          this.__noscroll = true;
          return this;
        },
        noscroll() {
          this.__noscroll = true;
          return this;
        },
        withWrapAround() {
          this.__wrapAround = true;
          return this;
        },
        wrap() {
          return this.withWrapAround();
        },
        focusable(el2) {
          return isFocusable(el2);
        },
        previouslyFocused() {
          return lastFocused;
        },
        lastFocused() {
          return lastFocused;
        },
        focused() {
          return currentFocused;
        },
        focusables() {
          if (Array.isArray(within)) return within;
          return focusable(within, { displayCheck: 'none' });
        },
        all() {
          return this.focusables();
        },
        isFirst(el2) {
          let els = this.all();
          return els[0] && els[0].isSameNode(el2);
        },
        isLast(el2) {
          let els = this.all();
          return els.length && els.slice(-1)[0].isSameNode(el2);
        },
        getFirst() {
          return this.all()[0];
        },
        getLast() {
          return this.all().slice(-1)[0];
        },
        getNext() {
          let list = this.all();
          let current = document.activeElement;
          if (list.indexOf(current) === -1) return;
          if (this.__wrapAround && list.indexOf(current) === list.length - 1) {
            return list[0];
          }
          return list[list.indexOf(current) + 1];
        },
        getPrevious() {
          let list = this.all();
          let current = document.activeElement;
          if (list.indexOf(current) === -1) return;
          if (this.__wrapAround && list.indexOf(current) === 0) {
            return list.slice(-1)[0];
          }
          return list[list.indexOf(current) - 1];
        },
        first() {
          this.focus(this.getFirst());
        },
        last() {
          this.focus(this.getLast());
        },
        next() {
          this.focus(this.getNext());
        },
        previous() {
          this.focus(this.getPrevious());
        },
        prev() {
          return this.previous();
        },
        focus(el2) {
          if (!el2) return;
          setTimeout(() => {
            if (!el2.hasAttribute('tabindex')) el2.setAttribute('tabindex', '0');
            el2.focus({ preventScroll: this.__noscroll });
          });
        },
      };
    });
    Alpine2.directive(
      'trap',
      Alpine2.skipDuringClone(
        (
          el,
          { expression, modifiers },
          { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 }
        ) => {
          let evaluator = evaluateLater2(expression);
          let oldValue = false;
          let options = {
            escapeDeactivates: false,
            allowOutsideClick: true,
            fallbackFocus: () => el,
          };
          let undoInert = () => {};
          if (modifiers.includes('noautofocus')) {
            options.initialFocus = false;
          } else {
            let autofocusEl = el.querySelector('[autofocus]');
            if (autofocusEl) options.initialFocus = autofocusEl;
          }
          if (modifiers.includes('inert')) {
            options.onPostActivate = () => {
              Alpine2.nextTick(() => {
                undoInert = setInert(el);
              });
            };
          }
          let trap = createFocusTrap(el, options);
          let undoDisableScrolling = () => {};
          const releaseFocus = () => {
            undoInert();
            undoInert = () => {};
            undoDisableScrolling();
            undoDisableScrolling = () => {};
            trap.deactivate({
              returnFocus: !modifiers.includes('noreturn'),
            });
          };
          effect3(() =>
            evaluator((value) => {
              if (oldValue === value) return;
              if (value && !oldValue) {
                if (modifiers.includes('noscroll')) undoDisableScrolling = disableScrolling();
                setTimeout(() => {
                  trap.activate();
                }, 15);
              }
              if (!value && oldValue) {
                releaseFocus();
              }
              oldValue = !!value;
            })
          );
          cleanup2(releaseFocus);
        },
        // When cloning, we only want to add aria-hidden attributes to the
        // DOM and not try to actually trap, as trapping can mess with the
        // live DOM and isn't just isolated to the cloned DOM.
        (el, { expression, modifiers }, { evaluate: evaluate2 }) => {
          if (modifiers.includes('inert') && evaluate2(expression)) setInert(el);
        }
      )
    );
  }
  function setInert(el) {
    let undos = [];
    crawlSiblingsUp(el, (sibling) => {
      let cache = sibling.hasAttribute('aria-hidden');
      sibling.setAttribute('aria-hidden', 'true');
      undos.push(() => cache || sibling.removeAttribute('aria-hidden'));
    });
    return () => {
      while (undos.length) undos.pop()();
    };
  }
  function crawlSiblingsUp(el, callback) {
    if (el.isSameNode(document.body) || !el.parentNode) return;
    Array.from(el.parentNode.children).forEach((sibling) => {
      if (sibling.isSameNode(el)) {
        crawlSiblingsUp(el.parentNode, callback);
      } else {
        callback(sibling);
      }
    });
  }
  function disableScrolling() {
    let overflow = document.documentElement.style.overflow;
    let paddingRight = document.documentElement.style.paddingRight;
    let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.documentElement.style.overflow = overflow;
      document.documentElement.style.paddingRight = paddingRight;
    };
  }
  var module_default4 = src_default4;

  // src/frontend/alpine-csp.ts
  module_default.plugin(module_default2);
  module_default.plugin(module_default3);
  module_default.plugin(module_default4);
  globalThis.Alpine = module_default;
  module_default.start();
  console.info('\u2705 Alpine.js CSP build loaded with plugins: persist, intersect, focus');
})();
/*! Bundled license information:

@alpinejs/focus/dist/module.esm.js:
  (*! Bundled license information:
  
  tabbable/dist/index.esm.js:
    (*!
    * tabbable 5.3.3
    * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
    *)
  
  focus-trap/dist/focus-trap.esm.js:
    (*!
    * focus-trap 6.9.4
    * @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
    *)
  *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL0BhbHBpbmVqcy9jc3AvZGlzdC9tb2R1bGUuZXNtLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AYWxwaW5lanMvcGVyc2lzdC9kaXN0L21vZHVsZS5lc20uanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0BhbHBpbmVqcy9pbnRlcnNlY3QvZGlzdC9tb2R1bGUuZXNtLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AYWxwaW5lanMvZm9jdXMvZGlzdC9tb2R1bGUuZXNtLmpzIiwgIi4uLy4uL3NyYy9mcm9udGVuZC9hbHBpbmUtY3NwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvc2NoZWR1bGVyLmpzXG52YXIgZmx1c2hQZW5kaW5nID0gZmFsc2U7XG52YXIgZmx1c2hpbmcgPSBmYWxzZTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGxhc3RGbHVzaGVkSW5kZXggPSAtMTtcbmZ1bmN0aW9uIHNjaGVkdWxlcihjYWxsYmFjaykge1xuICBxdWV1ZUpvYihjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBxdWV1ZUpvYihqb2IpIHtcbiAgaWYgKCFxdWV1ZS5pbmNsdWRlcyhqb2IpKVxuICAgIHF1ZXVlLnB1c2goam9iKTtcbiAgcXVldWVGbHVzaCgpO1xufVxuZnVuY3Rpb24gZGVxdWV1ZUpvYihqb2IpIHtcbiAgbGV0IGluZGV4ID0gcXVldWUuaW5kZXhPZihqb2IpO1xuICBpZiAoaW5kZXggIT09IC0xICYmIGluZGV4ID4gbGFzdEZsdXNoZWRJbmRleClcbiAgICBxdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xufVxuZnVuY3Rpb24gcXVldWVGbHVzaCgpIHtcbiAgaWYgKCFmbHVzaGluZyAmJiAhZmx1c2hQZW5kaW5nKSB7XG4gICAgZmx1c2hQZW5kaW5nID0gdHJ1ZTtcbiAgICBxdWV1ZU1pY3JvdGFzayhmbHVzaEpvYnMpO1xuICB9XG59XG5mdW5jdGlvbiBmbHVzaEpvYnMoKSB7XG4gIGZsdXNoUGVuZGluZyA9IGZhbHNlO1xuICBmbHVzaGluZyA9IHRydWU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBxdWV1ZVtpXSgpO1xuICAgIGxhc3RGbHVzaGVkSW5kZXggPSBpO1xuICB9XG4gIHF1ZXVlLmxlbmd0aCA9IDA7XG4gIGxhc3RGbHVzaGVkSW5kZXggPSAtMTtcbiAgZmx1c2hpbmcgPSBmYWxzZTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3JlYWN0aXZpdHkuanNcbnZhciByZWFjdGl2ZTtcbnZhciBlZmZlY3Q7XG52YXIgcmVsZWFzZTtcbnZhciByYXc7XG52YXIgc2hvdWxkU2NoZWR1bGUgPSB0cnVlO1xuZnVuY3Rpb24gZGlzYWJsZUVmZmVjdFNjaGVkdWxpbmcoY2FsbGJhY2spIHtcbiAgc2hvdWxkU2NoZWR1bGUgPSBmYWxzZTtcbiAgY2FsbGJhY2soKTtcbiAgc2hvdWxkU2NoZWR1bGUgPSB0cnVlO1xufVxuZnVuY3Rpb24gc2V0UmVhY3Rpdml0eUVuZ2luZShlbmdpbmUpIHtcbiAgcmVhY3RpdmUgPSBlbmdpbmUucmVhY3RpdmU7XG4gIHJlbGVhc2UgPSBlbmdpbmUucmVsZWFzZTtcbiAgZWZmZWN0ID0gKGNhbGxiYWNrKSA9PiBlbmdpbmUuZWZmZWN0KGNhbGxiYWNrLCB7IHNjaGVkdWxlcjogKHRhc2spID0+IHtcbiAgICBpZiAoc2hvdWxkU2NoZWR1bGUpIHtcbiAgICAgIHNjaGVkdWxlcih0YXNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFzaygpO1xuICAgIH1cbiAgfSB9KTtcbiAgcmF3ID0gZW5naW5lLnJhdztcbn1cbmZ1bmN0aW9uIG92ZXJyaWRlRWZmZWN0KG92ZXJyaWRlKSB7XG4gIGVmZmVjdCA9IG92ZXJyaWRlO1xufVxuZnVuY3Rpb24gZWxlbWVudEJvdW5kRWZmZWN0KGVsKSB7XG4gIGxldCBjbGVhbnVwMiA9ICgpID0+IHtcbiAgfTtcbiAgbGV0IHdyYXBwZWRFZmZlY3QgPSAoY2FsbGJhY2spID0+IHtcbiAgICBsZXQgZWZmZWN0UmVmZXJlbmNlID0gZWZmZWN0KGNhbGxiYWNrKTtcbiAgICBpZiAoIWVsLl94X2VmZmVjdHMpIHtcbiAgICAgIGVsLl94X2VmZmVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICAgICAgZWwuX3hfcnVuRWZmZWN0cyA9ICgpID0+IHtcbiAgICAgICAgZWwuX3hfZWZmZWN0cy5mb3JFYWNoKChpKSA9PiBpKCkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgZWwuX3hfZWZmZWN0cy5hZGQoZWZmZWN0UmVmZXJlbmNlKTtcbiAgICBjbGVhbnVwMiA9ICgpID0+IHtcbiAgICAgIGlmIChlZmZlY3RSZWZlcmVuY2UgPT09IHZvaWQgMClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgZWwuX3hfZWZmZWN0cy5kZWxldGUoZWZmZWN0UmVmZXJlbmNlKTtcbiAgICAgIHJlbGVhc2UoZWZmZWN0UmVmZXJlbmNlKTtcbiAgICB9O1xuICAgIHJldHVybiBlZmZlY3RSZWZlcmVuY2U7XG4gIH07XG4gIHJldHVybiBbd3JhcHBlZEVmZmVjdCwgKCkgPT4ge1xuICAgIGNsZWFudXAyKCk7XG4gIH1dO1xufVxuZnVuY3Rpb24gd2F0Y2goZ2V0dGVyLCBjYWxsYmFjaykge1xuICBsZXQgZmlyc3RUaW1lID0gdHJ1ZTtcbiAgbGV0IG9sZFZhbHVlO1xuICBsZXQgZWZmZWN0UmVmZXJlbmNlID0gZWZmZWN0KCgpID0+IHtcbiAgICBsZXQgdmFsdWUgPSBnZXR0ZXIoKTtcbiAgICBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgaWYgKCFmaXJzdFRpbWUpIHtcbiAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgY2FsbGJhY2sodmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgb2xkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGRWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgfSk7XG4gIHJldHVybiAoKSA9PiByZWxlYXNlKGVmZmVjdFJlZmVyZW5jZSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tdXRhdGlvbi5qc1xudmFyIG9uQXR0cmlidXRlQWRkZWRzID0gW107XG52YXIgb25FbFJlbW92ZWRzID0gW107XG52YXIgb25FbEFkZGVkcyA9IFtdO1xuZnVuY3Rpb24gb25FbEFkZGVkKGNhbGxiYWNrKSB7XG4gIG9uRWxBZGRlZHMucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBvbkVsUmVtb3ZlZChlbCwgY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgaWYgKCFlbC5feF9jbGVhbnVwcylcbiAgICAgIGVsLl94X2NsZWFudXBzID0gW107XG4gICAgZWwuX3hfY2xlYW51cHMucHVzaChjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2sgPSBlbDtcbiAgICBvbkVsUmVtb3ZlZHMucHVzaChjYWxsYmFjayk7XG4gIH1cbn1cbmZ1bmN0aW9uIG9uQXR0cmlidXRlc0FkZGVkKGNhbGxiYWNrKSB7XG4gIG9uQXR0cmlidXRlQWRkZWRzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gb25BdHRyaWJ1dGVSZW1vdmVkKGVsLCBuYW1lLCBjYWxsYmFjaykge1xuICBpZiAoIWVsLl94X2F0dHJpYnV0ZUNsZWFudXBzKVxuICAgIGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzID0ge307XG4gIGlmICghZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0pXG4gICAgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0gPSBbXTtcbiAgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBjbGVhbnVwQXR0cmlidXRlcyhlbCwgbmFtZXMpIHtcbiAgaWYgKCFlbC5feF9hdHRyaWJ1dGVDbGVhbnVwcylcbiAgICByZXR1cm47XG4gIE9iamVjdC5lbnRyaWVzKGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzKS5mb3JFYWNoKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKG5hbWVzID09PSB2b2lkIDAgfHwgbmFtZXMuaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGkpID0+IGkoKSk7XG4gICAgICBkZWxldGUgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV07XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIGNsZWFudXBFbGVtZW50KGVsKSB7XG4gIGVsLl94X2VmZmVjdHM/LmZvckVhY2goZGVxdWV1ZUpvYik7XG4gIHdoaWxlIChlbC5feF9jbGVhbnVwcz8ubGVuZ3RoKVxuICAgIGVsLl94X2NsZWFudXBzLnBvcCgpKCk7XG59XG52YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihvbk11dGF0ZSk7XG52YXIgY3VycmVudGx5T2JzZXJ2aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydE9ic2VydmluZ011dGF0aW9ucygpIHtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlIH0pO1xuICBjdXJyZW50bHlPYnNlcnZpbmcgPSB0cnVlO1xufVxuZnVuY3Rpb24gc3RvcE9ic2VydmluZ011dGF0aW9ucygpIHtcbiAgZmx1c2hPYnNlcnZlcigpO1xuICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gIGN1cnJlbnRseU9ic2VydmluZyA9IGZhbHNlO1xufVxudmFyIHF1ZXVlZE11dGF0aW9ucyA9IFtdO1xuZnVuY3Rpb24gZmx1c2hPYnNlcnZlcigpIHtcbiAgbGV0IHJlY29yZHMgPSBvYnNlcnZlci50YWtlUmVjb3JkcygpO1xuICBxdWV1ZWRNdXRhdGlvbnMucHVzaCgoKSA9PiByZWNvcmRzLmxlbmd0aCA+IDAgJiYgb25NdXRhdGUocmVjb3JkcykpO1xuICBsZXQgcXVldWVMZW5ndGhXaGVuVHJpZ2dlcmVkID0gcXVldWVkTXV0YXRpb25zLmxlbmd0aDtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGlmIChxdWV1ZWRNdXRhdGlvbnMubGVuZ3RoID09PSBxdWV1ZUxlbmd0aFdoZW5UcmlnZ2VyZWQpIHtcbiAgICAgIHdoaWxlIChxdWV1ZWRNdXRhdGlvbnMubGVuZ3RoID4gMClcbiAgICAgICAgcXVldWVkTXV0YXRpb25zLnNoaWZ0KCkoKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gbXV0YXRlRG9tKGNhbGxiYWNrKSB7XG4gIGlmICghY3VycmVudGx5T2JzZXJ2aW5nKVxuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICBzdG9wT2JzZXJ2aW5nTXV0YXRpb25zKCk7XG4gIGxldCByZXN1bHQgPSBjYWxsYmFjaygpO1xuICBzdGFydE9ic2VydmluZ011dGF0aW9ucygpO1xuICByZXR1cm4gcmVzdWx0O1xufVxudmFyIGlzQ29sbGVjdGluZyA9IGZhbHNlO1xudmFyIGRlZmVycmVkTXV0YXRpb25zID0gW107XG5mdW5jdGlvbiBkZWZlck11dGF0aW9ucygpIHtcbiAgaXNDb2xsZWN0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGZsdXNoQW5kU3RvcERlZmVycmluZ011dGF0aW9ucygpIHtcbiAgaXNDb2xsZWN0aW5nID0gZmFsc2U7XG4gIG9uTXV0YXRlKGRlZmVycmVkTXV0YXRpb25zKTtcbiAgZGVmZXJyZWRNdXRhdGlvbnMgPSBbXTtcbn1cbmZ1bmN0aW9uIG9uTXV0YXRlKG11dGF0aW9ucykge1xuICBpZiAoaXNDb2xsZWN0aW5nKSB7XG4gICAgZGVmZXJyZWRNdXRhdGlvbnMgPSBkZWZlcnJlZE11dGF0aW9ucy5jb25jYXQobXV0YXRpb25zKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGFkZGVkTm9kZXMgPSBbXTtcbiAgbGV0IHJlbW92ZWROb2RlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGxldCBhZGRlZEF0dHJpYnV0ZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBsZXQgcmVtb3ZlZEF0dHJpYnV0ZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG11dGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChtdXRhdGlvbnNbaV0udGFyZ2V0Ll94X2lnbm9yZU11dGF0aW9uT2JzZXJ2ZXIpXG4gICAgICBjb250aW51ZTtcbiAgICBpZiAobXV0YXRpb25zW2ldLnR5cGUgPT09IFwiY2hpbGRMaXN0XCIpIHtcbiAgICAgIG11dGF0aW9uc1tpXS5yZW1vdmVkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSAhPT0gMSlcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICghbm9kZS5feF9tYXJrZXIpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZW1vdmVkTm9kZXMuYWRkKG5vZGUpO1xuICAgICAgfSk7XG4gICAgICBtdXRhdGlvbnNbaV0uYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlICE9PSAxKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5oYXMobm9kZSkpIHtcbiAgICAgICAgICByZW1vdmVkTm9kZXMuZGVsZXRlKG5vZGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5feF9tYXJrZXIpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhZGRlZE5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG11dGF0aW9uc1tpXS50eXBlID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgbGV0IGVsID0gbXV0YXRpb25zW2ldLnRhcmdldDtcbiAgICAgIGxldCBuYW1lID0gbXV0YXRpb25zW2ldLmF0dHJpYnV0ZU5hbWU7XG4gICAgICBsZXQgb2xkVmFsdWUgPSBtdXRhdGlvbnNbaV0ub2xkVmFsdWU7XG4gICAgICBsZXQgYWRkMiA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFhZGRlZEF0dHJpYnV0ZXMuaGFzKGVsKSlcbiAgICAgICAgICBhZGRlZEF0dHJpYnV0ZXMuc2V0KGVsLCBbXSk7XG4gICAgICAgIGFkZGVkQXR0cmlidXRlcy5nZXQoZWwpLnB1c2goeyBuYW1lLCB2YWx1ZTogZWwuZ2V0QXR0cmlidXRlKG5hbWUpIH0pO1xuICAgICAgfTtcbiAgICAgIGxldCByZW1vdmUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghcmVtb3ZlZEF0dHJpYnV0ZXMuaGFzKGVsKSlcbiAgICAgICAgICByZW1vdmVkQXR0cmlidXRlcy5zZXQoZWwsIFtdKTtcbiAgICAgICAgcmVtb3ZlZEF0dHJpYnV0ZXMuZ2V0KGVsKS5wdXNoKG5hbWUpO1xuICAgICAgfTtcbiAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUobmFtZSkgJiYgb2xkVmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgYWRkMigpO1xuICAgICAgfSBlbHNlIGlmIChlbC5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcbiAgICAgICAgcmVtb3ZlKCk7XG4gICAgICAgIGFkZDIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZW1vdmVkQXR0cmlidXRlcy5mb3JFYWNoKChhdHRycywgZWwpID0+IHtcbiAgICBjbGVhbnVwQXR0cmlidXRlcyhlbCwgYXR0cnMpO1xuICB9KTtcbiAgYWRkZWRBdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJzLCBlbCkgPT4ge1xuICAgIG9uQXR0cmlidXRlQWRkZWRzLmZvckVhY2goKGkpID0+IGkoZWwsIGF0dHJzKSk7XG4gIH0pO1xuICBmb3IgKGxldCBub2RlIG9mIHJlbW92ZWROb2Rlcykge1xuICAgIGlmIChhZGRlZE5vZGVzLnNvbWUoKGkpID0+IGkuY29udGFpbnMobm9kZSkpKVxuICAgICAgY29udGludWU7XG4gICAgb25FbFJlbW92ZWRzLmZvckVhY2goKGkpID0+IGkobm9kZSkpO1xuICB9XG4gIGZvciAobGV0IG5vZGUgb2YgYWRkZWROb2Rlcykge1xuICAgIGlmICghbm9kZS5pc0Nvbm5lY3RlZClcbiAgICAgIGNvbnRpbnVlO1xuICAgIG9uRWxBZGRlZHMuZm9yRWFjaCgoaSkgPT4gaShub2RlKSk7XG4gIH1cbiAgYWRkZWROb2RlcyA9IG51bGw7XG4gIHJlbW92ZWROb2RlcyA9IG51bGw7XG4gIGFkZGVkQXR0cmlidXRlcyA9IG51bGw7XG4gIHJlbW92ZWRBdHRyaWJ1dGVzID0gbnVsbDtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3Njb3BlLmpzXG5mdW5jdGlvbiBzY29wZShub2RlKSB7XG4gIHJldHVybiBtZXJnZVByb3hpZXMoY2xvc2VzdERhdGFTdGFjayhub2RlKSk7XG59XG5mdW5jdGlvbiBhZGRTY29wZVRvTm9kZShub2RlLCBkYXRhMiwgcmVmZXJlbmNlTm9kZSkge1xuICBub2RlLl94X2RhdGFTdGFjayA9IFtkYXRhMiwgLi4uY2xvc2VzdERhdGFTdGFjayhyZWZlcmVuY2VOb2RlIHx8IG5vZGUpXTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBub2RlLl94X2RhdGFTdGFjayA9IG5vZGUuX3hfZGF0YVN0YWNrLmZpbHRlcigoaSkgPT4gaSAhPT0gZGF0YTIpO1xuICB9O1xufVxuZnVuY3Rpb24gY2xvc2VzdERhdGFTdGFjayhub2RlKSB7XG4gIGlmIChub2RlLl94X2RhdGFTdGFjaylcbiAgICByZXR1cm4gbm9kZS5feF9kYXRhU3RhY2s7XG4gIGlmICh0eXBlb2YgU2hhZG93Um9vdCA9PT0gXCJmdW5jdGlvblwiICYmIG5vZGUgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB7XG4gICAgcmV0dXJuIGNsb3Nlc3REYXRhU3RhY2sobm9kZS5ob3N0KTtcbiAgfVxuICBpZiAoIW5vZGUucGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gY2xvc2VzdERhdGFTdGFjayhub2RlLnBhcmVudE5vZGUpO1xufVxuZnVuY3Rpb24gbWVyZ2VQcm94aWVzKG9iamVjdHMpIHtcbiAgcmV0dXJuIG5ldyBQcm94eSh7IG9iamVjdHMgfSwgbWVyZ2VQcm94eVRyYXApO1xufVxudmFyIG1lcmdlUHJveHlUcmFwID0ge1xuICBvd25LZXlzKHsgb2JqZWN0cyB9KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0KG9iamVjdHMuZmxhdE1hcCgoaSkgPT4gT2JqZWN0LmtleXMoaSkpKVxuICAgICk7XG4gIH0sXG4gIGhhcyh7IG9iamVjdHMgfSwgbmFtZSkge1xuICAgIGlmIChuYW1lID09IFN5bWJvbC51bnNjb3BhYmxlcylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gb2JqZWN0cy5zb21lKFxuICAgICAgKG9iaikgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgbmFtZSkgfHwgUmVmbGVjdC5oYXMob2JqLCBuYW1lKVxuICAgICk7XG4gIH0sXG4gIGdldCh7IG9iamVjdHMgfSwgbmFtZSwgdGhpc1Byb3h5KSB7XG4gICAgaWYgKG5hbWUgPT0gXCJ0b0pTT05cIilcbiAgICAgIHJldHVybiBjb2xsYXBzZVByb3hpZXM7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0KFxuICAgICAgb2JqZWN0cy5maW5kKFxuICAgICAgICAob2JqKSA9PiBSZWZsZWN0LmhhcyhvYmosIG5hbWUpXG4gICAgICApIHx8IHt9LFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXNQcm94eVxuICAgICk7XG4gIH0sXG4gIHNldCh7IG9iamVjdHMgfSwgbmFtZSwgdmFsdWUsIHRoaXNQcm94eSkge1xuICAgIGNvbnN0IHRhcmdldCA9IG9iamVjdHMuZmluZChcbiAgICAgIChvYmopID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpXG4gICAgKSB8fCBvYmplY3RzW29iamVjdHMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvcj8uc2V0ICYmIGRlc2NyaXB0b3I/LmdldClcbiAgICAgIHJldHVybiBkZXNjcmlwdG9yLnNldC5jYWxsKHRoaXNQcm94eSwgdmFsdWUpIHx8IHRydWU7XG4gICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUpO1xuICB9XG59O1xuZnVuY3Rpb24gY29sbGFwc2VQcm94aWVzKCkge1xuICBsZXQga2V5cyA9IFJlZmxlY3Qub3duS2V5cyh0aGlzKTtcbiAgcmV0dXJuIGtleXMucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGFjY1trZXldID0gUmVmbGVjdC5nZXQodGhpcywga2V5KTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9pbnRlcmNlcHRvci5qc1xuZnVuY3Rpb24gaW5pdEludGVyY2VwdG9ycyhkYXRhMikge1xuICBsZXQgaXNPYmplY3QyID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheSh2YWwpICYmIHZhbCAhPT0gbnVsbDtcbiAgbGV0IHJlY3Vyc2UgPSAob2JqLCBiYXNlUGF0aCA9IFwiXCIpID0+IHtcbiAgICBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmopKS5mb3JFYWNoKChba2V5LCB7IHZhbHVlLCBlbnVtZXJhYmxlIH1dKSA9PiB7XG4gICAgICBpZiAoZW51bWVyYWJsZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IHZvaWQgMClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5fX3Zfc2tpcClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgbGV0IHBhdGggPSBiYXNlUGF0aCA9PT0gXCJcIiA/IGtleSA6IGAke2Jhc2VQYXRofS4ke2tleX1gO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5feF9pbnRlcmNlcHRvcikge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlLmluaXRpYWxpemUoZGF0YTIsIHBhdGgsIGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNPYmplY3QyKHZhbHVlKSAmJiB2YWx1ZSAhPT0gb2JqICYmICEodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgIHJlY3Vyc2UodmFsdWUsIHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiByZWN1cnNlKGRhdGEyKTtcbn1cbmZ1bmN0aW9uIGludGVyY2VwdG9yKGNhbGxiYWNrLCBtdXRhdGVPYmogPSAoKSA9PiB7XG59KSB7XG4gIGxldCBvYmogPSB7XG4gICAgaW5pdGlhbFZhbHVlOiB2b2lkIDAsXG4gICAgX3hfaW50ZXJjZXB0b3I6IHRydWUsXG4gICAgaW5pdGlhbGl6ZShkYXRhMiwgcGF0aCwga2V5KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sodGhpcy5pbml0aWFsVmFsdWUsICgpID0+IGdldChkYXRhMiwgcGF0aCksICh2YWx1ZSkgPT4gc2V0KGRhdGEyLCBwYXRoLCB2YWx1ZSksIHBhdGgsIGtleSk7XG4gICAgfVxuICB9O1xuICBtdXRhdGVPYmoob2JqKTtcbiAgcmV0dXJuIChpbml0aWFsVmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIGluaXRpYWxWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBpbml0aWFsVmFsdWUgIT09IG51bGwgJiYgaW5pdGlhbFZhbHVlLl94X2ludGVyY2VwdG9yKSB7XG4gICAgICBsZXQgaW5pdGlhbGl6ZSA9IG9iai5pbml0aWFsaXplLmJpbmQob2JqKTtcbiAgICAgIG9iai5pbml0aWFsaXplID0gKGRhdGEyLCBwYXRoLCBrZXkpID0+IHtcbiAgICAgICAgbGV0IGlubmVyVmFsdWUgPSBpbml0aWFsVmFsdWUuaW5pdGlhbGl6ZShkYXRhMiwgcGF0aCwga2V5KTtcbiAgICAgICAgb2JqLmluaXRpYWxWYWx1ZSA9IGlubmVyVmFsdWU7XG4gICAgICAgIHJldHVybiBpbml0aWFsaXplKGRhdGEyLCBwYXRoLCBrZXkpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqLmluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcbn1cbmZ1bmN0aW9uIGdldChvYmosIHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoXCIuXCIpLnJlZHVjZSgoY2FycnksIHNlZ21lbnQpID0+IGNhcnJ5W3NlZ21lbnRdLCBvYmopO1xufVxuZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSBcInN0cmluZ1wiKVxuICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAxKVxuICAgIG9ialtwYXRoWzBdXSA9IHZhbHVlO1xuICBlbHNlIGlmIChwYXRoLmxlbmd0aCA9PT0gMClcbiAgICB0aHJvdyBlcnJvcjtcbiAgZWxzZSB7XG4gICAgaWYgKG9ialtwYXRoWzBdXSlcbiAgICAgIHJldHVybiBzZXQob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgZWxzZSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB7fTtcbiAgICAgIHJldHVybiBzZXQob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MuanNcbnZhciBtYWdpY3MgPSB7fTtcbmZ1bmN0aW9uIG1hZ2ljKG5hbWUsIGNhbGxiYWNrKSB7XG4gIG1hZ2ljc1tuYW1lXSA9IGNhbGxiYWNrO1xufVxuZnVuY3Rpb24gaW5qZWN0TWFnaWNzKG9iaiwgZWwpIHtcbiAgbGV0IG1lbW9pemVkVXRpbGl0aWVzID0gZ2V0VXRpbGl0aWVzKGVsKTtcbiAgT2JqZWN0LmVudHJpZXMobWFnaWNzKS5mb3JFYWNoKChbbmFtZSwgY2FsbGJhY2tdKSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgYCQke25hbWV9YCwge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZWwsIG1lbW9pemVkVXRpbGl0aWVzKTtcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIGdldFV0aWxpdGllcyhlbCkge1xuICBsZXQgW3V0aWxpdGllcywgY2xlYW51cDJdID0gZ2V0RWxlbWVudEJvdW5kVXRpbGl0aWVzKGVsKTtcbiAgbGV0IHV0aWxzID0geyBpbnRlcmNlcHRvciwgLi4udXRpbGl0aWVzIH07XG4gIG9uRWxSZW1vdmVkKGVsLCBjbGVhbnVwMik7XG4gIHJldHVybiB1dGlscztcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL2Vycm9yLmpzXG5mdW5jdGlvbiB0cnlDYXRjaChlbCwgZXhwcmVzc2lvbiwgY2FsbGJhY2ssIC4uLmFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2soLi4uYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBoYW5kbGVFcnJvcihlLCBlbCwgZXhwcmVzc2lvbik7XG4gIH1cbn1cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycm9yMiwgZWwsIGV4cHJlc3Npb24gPSB2b2lkIDApIHtcbiAgZXJyb3IyID0gT2JqZWN0LmFzc2lnbihcbiAgICBlcnJvcjIgPz8geyBtZXNzYWdlOiBcIk5vIGVycm9yIG1lc3NhZ2UgZ2l2ZW4uXCIgfSxcbiAgICB7IGVsLCBleHByZXNzaW9uIH1cbiAgKTtcbiAgY29uc29sZS53YXJuKGBBbHBpbmUgRXhwcmVzc2lvbiBFcnJvcjogJHtlcnJvcjIubWVzc2FnZX1cblxuJHtleHByZXNzaW9uID8gJ0V4cHJlc3Npb246IFwiJyArIGV4cHJlc3Npb24gKyAnXCJcXG5cXG4nIDogXCJcIn1gLCBlbCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRocm93IGVycm9yMjtcbiAgfSwgMCk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9ldmFsdWF0b3IuanNcbnZhciBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnMgPSB0cnVlO1xuZnVuY3Rpb24gZG9udEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyhjYWxsYmFjaykge1xuICBsZXQgY2FjaGUgPSBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnM7XG4gIHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyA9IGZhbHNlO1xuICBsZXQgcmVzdWx0ID0gY2FsbGJhY2soKTtcbiAgc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zID0gY2FjaGU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBldmFsdWF0ZShlbCwgZXhwcmVzc2lvbiwgZXh0cmFzID0ge30pIHtcbiAgbGV0IHJlc3VsdDtcbiAgZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikoKHZhbHVlKSA9PiByZXN1bHQgPSB2YWx1ZSwgZXh0cmFzKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlTGF0ZXIoLi4uYXJncykge1xuICByZXR1cm4gdGhlRXZhbHVhdG9yRnVuY3Rpb24oLi4uYXJncyk7XG59XG52YXIgdGhlRXZhbHVhdG9yRnVuY3Rpb24gPSBub3JtYWxFdmFsdWF0b3I7XG5mdW5jdGlvbiBzZXRFdmFsdWF0b3IobmV3RXZhbHVhdG9yKSB7XG4gIHRoZUV2YWx1YXRvckZ1bmN0aW9uID0gbmV3RXZhbHVhdG9yO1xufVxuZnVuY3Rpb24gbm9ybWFsRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uKSB7XG4gIGxldCBvdmVycmlkZGVuTWFnaWNzID0ge307XG4gIGluamVjdE1hZ2ljcyhvdmVycmlkZGVuTWFnaWNzLCBlbCk7XG4gIGxldCBkYXRhU3RhY2sgPSBbb3ZlcnJpZGRlbk1hZ2ljcywgLi4uY2xvc2VzdERhdGFTdGFjayhlbCldO1xuICBsZXQgZXZhbHVhdG9yID0gdHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIiA/IGdlbmVyYXRlRXZhbHVhdG9yRnJvbUZ1bmN0aW9uKGRhdGFTdGFjaywgZXhwcmVzc2lvbikgOiBnZW5lcmF0ZUV2YWx1YXRvckZyb21TdHJpbmcoZGF0YVN0YWNrLCBleHByZXNzaW9uLCBlbCk7XG4gIHJldHVybiB0cnlDYXRjaC5iaW5kKG51bGwsIGVsLCBleHByZXNzaW9uLCBldmFsdWF0b3IpO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVFdmFsdWF0b3JGcm9tRnVuY3Rpb24oZGF0YVN0YWNrLCBmdW5jKSB7XG4gIHJldHVybiAocmVjZWl2ZXIgPSAoKSA9PiB7XG4gIH0sIHsgc2NvcGU6IHNjb3BlMiA9IHt9LCBwYXJhbXMgPSBbXSwgY29udGV4dCB9ID0ge30pID0+IHtcbiAgICBsZXQgcmVzdWx0ID0gZnVuYy5hcHBseShtZXJnZVByb3hpZXMoW3Njb3BlMiwgLi4uZGF0YVN0YWNrXSksIHBhcmFtcyk7XG4gICAgcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgcmVzdWx0KTtcbiAgfTtcbn1cbnZhciBldmFsdWF0b3JNZW1vID0ge307XG5mdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uRnJvbVN0cmluZyhleHByZXNzaW9uLCBlbCkge1xuICBpZiAoZXZhbHVhdG9yTWVtb1tleHByZXNzaW9uXSkge1xuICAgIHJldHVybiBldmFsdWF0b3JNZW1vW2V4cHJlc3Npb25dO1xuICB9XG4gIGxldCBBc3luY0Z1bmN0aW9uID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGFzeW5jIGZ1bmN0aW9uKCkge1xuICB9KS5jb25zdHJ1Y3RvcjtcbiAgbGV0IHJpZ2h0U2lkZVNhZmVFeHByZXNzaW9uID0gL15bXFxuXFxzXSppZi4qXFwoLipcXCkvLnRlc3QoZXhwcmVzc2lvbi50cmltKCkpIHx8IC9eKGxldHxjb25zdClcXHMvLnRlc3QoZXhwcmVzc2lvbi50cmltKCkpID8gYChhc3luYygpPT57ICR7ZXhwcmVzc2lvbn0gfSkoKWAgOiBleHByZXNzaW9uO1xuICBjb25zdCBzYWZlQXN5bmNGdW5jdGlvbiA9ICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IGZ1bmMyID0gbmV3IEFzeW5jRnVuY3Rpb24oXG4gICAgICAgIFtcIl9fc2VsZlwiLCBcInNjb3BlXCJdLFxuICAgICAgICBgd2l0aCAoc2NvcGUpIHsgX19zZWxmLnJlc3VsdCA9ICR7cmlnaHRTaWRlU2FmZUV4cHJlc3Npb259IH07IF9fc2VsZi5maW5pc2hlZCA9IHRydWU7IHJldHVybiBfX3NlbGYucmVzdWx0O2BcbiAgICAgICk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZnVuYzIsIFwibmFtZVwiLCB7XG4gICAgICAgIHZhbHVlOiBgW0FscGluZV0gJHtleHByZXNzaW9ufWBcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZ1bmMyO1xuICAgIH0gY2F0Y2ggKGVycm9yMikge1xuICAgICAgaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgZXhwcmVzc2lvbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9O1xuICBsZXQgZnVuYyA9IHNhZmVBc3luY0Z1bmN0aW9uKCk7XG4gIGV2YWx1YXRvck1lbW9bZXhwcmVzc2lvbl0gPSBmdW5jO1xuICByZXR1cm4gZnVuYztcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRXZhbHVhdG9yRnJvbVN0cmluZyhkYXRhU3RhY2ssIGV4cHJlc3Npb24sIGVsKSB7XG4gIGxldCBmdW5jID0gZ2VuZXJhdGVGdW5jdGlvbkZyb21TdHJpbmcoZXhwcmVzc2lvbiwgZWwpO1xuICByZXR1cm4gKHJlY2VpdmVyID0gKCkgPT4ge1xuICB9LCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgcGFyYW1zID0gW10sIGNvbnRleHQgfSA9IHt9KSA9PiB7XG4gICAgZnVuYy5yZXN1bHQgPSB2b2lkIDA7XG4gICAgZnVuYy5maW5pc2hlZCA9IGZhbHNlO1xuICAgIGxldCBjb21wbGV0ZVNjb3BlID0gbWVyZ2VQcm94aWVzKFtzY29wZTIsIC4uLmRhdGFTdGFja10pO1xuICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IGZ1bmMuY2FsbChjb250ZXh0LCBmdW5jLCBjb21wbGV0ZVNjb3BlKS5jYXRjaCgoZXJyb3IyKSA9PiBoYW5kbGVFcnJvcihlcnJvcjIsIGVsLCBleHByZXNzaW9uKSk7XG4gICAgICBpZiAoZnVuYy5maW5pc2hlZCkge1xuICAgICAgICBydW5JZlR5cGVPZkZ1bmN0aW9uKHJlY2VpdmVyLCBmdW5jLnJlc3VsdCwgY29tcGxldGVTY29wZSwgcGFyYW1zLCBlbCk7XG4gICAgICAgIGZ1bmMucmVzdWx0ID0gdm9pZCAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBydW5JZlR5cGVPZkZ1bmN0aW9uKHJlY2VpdmVyLCByZXN1bHQsIGNvbXBsZXRlU2NvcGUsIHBhcmFtcywgZWwpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IyKSA9PiBoYW5kbGVFcnJvcihlcnJvcjIsIGVsLCBleHByZXNzaW9uKSkuZmluYWxseSgoKSA9PiBmdW5jLnJlc3VsdCA9IHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgdmFsdWUsIHNjb3BlMiwgcGFyYW1zLCBlbCkge1xuICBpZiAoc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgbGV0IHJlc3VsdCA9IHZhbHVlLmFwcGx5KHNjb3BlMiwgcGFyYW1zKTtcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgcmVzdWx0LnRoZW4oKGkpID0+IHJ1bklmVHlwZU9mRnVuY3Rpb24ocmVjZWl2ZXIsIGksIHNjb3BlMiwgcGFyYW1zKSkuY2F0Y2goKGVycm9yMikgPT4gaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgdmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjZWl2ZXIocmVzdWx0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHZhbHVlLnRoZW4oKGkpID0+IHJlY2VpdmVyKGkpKTtcbiAgfSBlbHNlIHtcbiAgICByZWNlaXZlcih2YWx1ZSk7XG4gIH1cbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMuanNcbnZhciBwcmVmaXhBc1N0cmluZyA9IFwieC1cIjtcbmZ1bmN0aW9uIHByZWZpeChzdWJqZWN0ID0gXCJcIikge1xuICByZXR1cm4gcHJlZml4QXNTdHJpbmcgKyBzdWJqZWN0O1xufVxuZnVuY3Rpb24gc2V0UHJlZml4KG5ld1ByZWZpeCkge1xuICBwcmVmaXhBc1N0cmluZyA9IG5ld1ByZWZpeDtcbn1cbnZhciBkaXJlY3RpdmVIYW5kbGVycyA9IHt9O1xuZnVuY3Rpb24gZGlyZWN0aXZlKG5hbWUsIGNhbGxiYWNrKSB7XG4gIGRpcmVjdGl2ZUhhbmRsZXJzW25hbWVdID0gY2FsbGJhY2s7XG4gIHJldHVybiB7XG4gICAgYmVmb3JlKGRpcmVjdGl2ZTIpIHtcbiAgICAgIGlmICghZGlyZWN0aXZlSGFuZGxlcnNbZGlyZWN0aXZlMl0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFN0cmluZy5yYXdgQ2Fubm90IGZpbmQgZGlyZWN0aXZlIFxcYCR7ZGlyZWN0aXZlMn1cXGAuIFxcYCR7bmFtZX1cXGAgd2lsbCB1c2UgdGhlIGRlZmF1bHQgb3JkZXIgb2YgZXhlY3V0aW9uYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBvcyA9IGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YoZGlyZWN0aXZlMik7XG4gICAgICBkaXJlY3RpdmVPcmRlci5zcGxpY2UocG9zID49IDAgPyBwb3MgOiBkaXJlY3RpdmVPcmRlci5pbmRleE9mKFwiREVGQVVMVFwiKSwgMCwgbmFtZSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gZGlyZWN0aXZlRXhpc3RzKG5hbWUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRpcmVjdGl2ZUhhbmRsZXJzKS5pbmNsdWRlcyhuYW1lKTtcbn1cbmZ1bmN0aW9uIGRpcmVjdGl2ZXMoZWwsIGF0dHJpYnV0ZXMsIG9yaWdpbmFsQXR0cmlidXRlT3ZlcnJpZGUpIHtcbiAgYXR0cmlidXRlcyA9IEFycmF5LmZyb20oYXR0cmlidXRlcyk7XG4gIGlmIChlbC5feF92aXJ0dWFsRGlyZWN0aXZlcykge1xuICAgIGxldCB2QXR0cmlidXRlcyA9IE9iamVjdC5lbnRyaWVzKGVsLl94X3ZpcnR1YWxEaXJlY3RpdmVzKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7IG5hbWUsIHZhbHVlIH0pKTtcbiAgICBsZXQgc3RhdGljQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNPbmx5KHZBdHRyaWJ1dGVzKTtcbiAgICB2QXR0cmlidXRlcyA9IHZBdHRyaWJ1dGVzLm1hcCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICBpZiAoc3RhdGljQXR0cmlidXRlcy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09IGF0dHJpYnV0ZS5uYW1lKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IGB4LWJpbmQ6JHthdHRyaWJ1dGUubmFtZX1gLFxuICAgICAgICAgIHZhbHVlOiBgXCIke2F0dHJpYnV0ZS52YWx1ZX1cImBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfSk7XG4gICAgYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMuY29uY2F0KHZBdHRyaWJ1dGVzKTtcbiAgfVxuICBsZXQgdHJhbnNmb3JtZWRBdHRyaWJ1dGVNYXAgPSB7fTtcbiAgbGV0IGRpcmVjdGl2ZXMyID0gYXR0cmlidXRlcy5tYXAodG9UcmFuc2Zvcm1lZEF0dHJpYnV0ZXMoKG5ld05hbWUsIG9sZE5hbWUpID0+IHRyYW5zZm9ybWVkQXR0cmlidXRlTWFwW25ld05hbWVdID0gb2xkTmFtZSkpLmZpbHRlcihvdXROb25BbHBpbmVBdHRyaWJ1dGVzKS5tYXAodG9QYXJzZWREaXJlY3RpdmVzKHRyYW5zZm9ybWVkQXR0cmlidXRlTWFwLCBvcmlnaW5hbEF0dHJpYnV0ZU92ZXJyaWRlKSkuc29ydChieVByaW9yaXR5KTtcbiAgcmV0dXJuIGRpcmVjdGl2ZXMyLm1hcCgoZGlyZWN0aXZlMikgPT4ge1xuICAgIHJldHVybiBnZXREaXJlY3RpdmVIYW5kbGVyKGVsLCBkaXJlY3RpdmUyKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBhdHRyaWJ1dGVzT25seShhdHRyaWJ1dGVzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGF0dHJpYnV0ZXMpLm1hcCh0b1RyYW5zZm9ybWVkQXR0cmlidXRlcygpKS5maWx0ZXIoKGF0dHIpID0+ICFvdXROb25BbHBpbmVBdHRyaWJ1dGVzKGF0dHIpKTtcbn1cbnZhciBpc0RlZmVycmluZ0hhbmRsZXJzID0gZmFsc2U7XG52YXIgZGlyZWN0aXZlSGFuZGxlclN0YWNrcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgY3VycmVudEhhbmRsZXJTdGFja0tleSA9IFN5bWJvbCgpO1xuZnVuY3Rpb24gZGVmZXJIYW5kbGluZ0RpcmVjdGl2ZXMoY2FsbGJhY2spIHtcbiAgaXNEZWZlcnJpbmdIYW5kbGVycyA9IHRydWU7XG4gIGxldCBrZXkgPSBTeW1ib2woKTtcbiAgY3VycmVudEhhbmRsZXJTdGFja0tleSA9IGtleTtcbiAgZGlyZWN0aXZlSGFuZGxlclN0YWNrcy5zZXQoa2V5LCBbXSk7XG4gIGxldCBmbHVzaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIHdoaWxlIChkaXJlY3RpdmVIYW5kbGVyU3RhY2tzLmdldChrZXkpLmxlbmd0aClcbiAgICAgIGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZ2V0KGtleSkuc2hpZnQoKSgpO1xuICAgIGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZGVsZXRlKGtleSk7XG4gIH07XG4gIGxldCBzdG9wRGVmZXJyaW5nID0gKCkgPT4ge1xuICAgIGlzRGVmZXJyaW5nSGFuZGxlcnMgPSBmYWxzZTtcbiAgICBmbHVzaEhhbmRsZXJzKCk7XG4gIH07XG4gIGNhbGxiYWNrKGZsdXNoSGFuZGxlcnMpO1xuICBzdG9wRGVmZXJyaW5nKCk7XG59XG5mdW5jdGlvbiBnZXRFbGVtZW50Qm91bmRVdGlsaXRpZXMoZWwpIHtcbiAgbGV0IGNsZWFudXBzID0gW107XG4gIGxldCBjbGVhbnVwMiA9IChjYWxsYmFjaykgPT4gY2xlYW51cHMucHVzaChjYWxsYmFjayk7XG4gIGxldCBbZWZmZWN0MywgY2xlYW51cEVmZmVjdF0gPSBlbGVtZW50Qm91bmRFZmZlY3QoZWwpO1xuICBjbGVhbnVwcy5wdXNoKGNsZWFudXBFZmZlY3QpO1xuICBsZXQgdXRpbGl0aWVzID0ge1xuICAgIEFscGluZTogYWxwaW5lX2RlZmF1bHQsXG4gICAgZWZmZWN0OiBlZmZlY3QzLFxuICAgIGNsZWFudXA6IGNsZWFudXAyLFxuICAgIGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIuYmluZChldmFsdWF0ZUxhdGVyLCBlbCksXG4gICAgZXZhbHVhdGU6IGV2YWx1YXRlLmJpbmQoZXZhbHVhdGUsIGVsKVxuICB9O1xuICBsZXQgZG9DbGVhbnVwID0gKCkgPT4gY2xlYW51cHMuZm9yRWFjaCgoaSkgPT4gaSgpKTtcbiAgcmV0dXJuIFt1dGlsaXRpZXMsIGRvQ2xlYW51cF07XG59XG5mdW5jdGlvbiBnZXREaXJlY3RpdmVIYW5kbGVyKGVsLCBkaXJlY3RpdmUyKSB7XG4gIGxldCBub29wID0gKCkgPT4ge1xuICB9O1xuICBsZXQgaGFuZGxlcjQgPSBkaXJlY3RpdmVIYW5kbGVyc1tkaXJlY3RpdmUyLnR5cGVdIHx8IG5vb3A7XG4gIGxldCBbdXRpbGl0aWVzLCBjbGVhbnVwMl0gPSBnZXRFbGVtZW50Qm91bmRVdGlsaXRpZXMoZWwpO1xuICBvbkF0dHJpYnV0ZVJlbW92ZWQoZWwsIGRpcmVjdGl2ZTIub3JpZ2luYWwsIGNsZWFudXAyKTtcbiAgbGV0IGZ1bGxIYW5kbGVyID0gKCkgPT4ge1xuICAgIGlmIChlbC5feF9pZ25vcmUgfHwgZWwuX3hfaWdub3JlU2VsZilcbiAgICAgIHJldHVybjtcbiAgICBoYW5kbGVyNC5pbmxpbmUgJiYgaGFuZGxlcjQuaW5saW5lKGVsLCBkaXJlY3RpdmUyLCB1dGlsaXRpZXMpO1xuICAgIGhhbmRsZXI0ID0gaGFuZGxlcjQuYmluZChoYW5kbGVyNCwgZWwsIGRpcmVjdGl2ZTIsIHV0aWxpdGllcyk7XG4gICAgaXNEZWZlcnJpbmdIYW5kbGVycyA/IGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZ2V0KGN1cnJlbnRIYW5kbGVyU3RhY2tLZXkpLnB1c2goaGFuZGxlcjQpIDogaGFuZGxlcjQoKTtcbiAgfTtcbiAgZnVsbEhhbmRsZXIucnVuQ2xlYW51cHMgPSBjbGVhbnVwMjtcbiAgcmV0dXJuIGZ1bGxIYW5kbGVyO1xufVxudmFyIHN0YXJ0aW5nV2l0aCA9IChzdWJqZWN0LCByZXBsYWNlbWVudCkgPT4gKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICBpZiAobmFtZS5zdGFydHNXaXRoKHN1YmplY3QpKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2Uoc3ViamVjdCwgcmVwbGFjZW1lbnQpO1xuICByZXR1cm4geyBuYW1lLCB2YWx1ZSB9O1xufTtcbnZhciBpbnRvID0gKGkpID0+IGk7XG5mdW5jdGlvbiB0b1RyYW5zZm9ybWVkQXR0cmlidXRlcyhjYWxsYmFjayA9ICgpID0+IHtcbn0pIHtcbiAgcmV0dXJuICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICBsZXQgeyBuYW1lOiBuZXdOYW1lLCB2YWx1ZTogbmV3VmFsdWUgfSA9IGF0dHJpYnV0ZVRyYW5zZm9ybWVycy5yZWR1Y2UoKGNhcnJ5LCB0cmFuc2Zvcm0pID0+IHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm0oY2FycnkpO1xuICAgIH0sIHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgaWYgKG5ld05hbWUgIT09IG5hbWUpXG4gICAgICBjYWxsYmFjayhuZXdOYW1lLCBuYW1lKTtcbiAgICByZXR1cm4geyBuYW1lOiBuZXdOYW1lLCB2YWx1ZTogbmV3VmFsdWUgfTtcbiAgfTtcbn1cbnZhciBhdHRyaWJ1dGVUcmFuc2Zvcm1lcnMgPSBbXTtcbmZ1bmN0aW9uIG1hcEF0dHJpYnV0ZXMoY2FsbGJhY2spIHtcbiAgYXR0cmlidXRlVHJhbnNmb3JtZXJzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gb3V0Tm9uQWxwaW5lQXR0cmlidXRlcyh7IG5hbWUgfSkge1xuICByZXR1cm4gYWxwaW5lQXR0cmlidXRlUmVnZXgoKS50ZXN0KG5hbWUpO1xufVxudmFyIGFscGluZUF0dHJpYnV0ZVJlZ2V4ID0gKCkgPT4gbmV3IFJlZ0V4cChgXiR7cHJlZml4QXNTdHJpbmd9KFteOl4uXSspXFxcXGJgKTtcbmZ1bmN0aW9uIHRvUGFyc2VkRGlyZWN0aXZlcyh0cmFuc2Zvcm1lZEF0dHJpYnV0ZU1hcCwgb3JpZ2luYWxBdHRyaWJ1dGVPdmVycmlkZSkge1xuICByZXR1cm4gKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgIGxldCB0eXBlTWF0Y2ggPSBuYW1lLm1hdGNoKGFscGluZUF0dHJpYnV0ZVJlZ2V4KCkpO1xuICAgIGxldCB2YWx1ZU1hdGNoID0gbmFtZS5tYXRjaCgvOihbYS16QS1aMC05XFwtXzpdKykvKTtcbiAgICBsZXQgbW9kaWZpZXJzID0gbmFtZS5tYXRjaCgvXFwuW14uXFxdXSsoPz1bXlxcXV0qJCkvZykgfHwgW107XG4gICAgbGV0IG9yaWdpbmFsID0gb3JpZ2luYWxBdHRyaWJ1dGVPdmVycmlkZSB8fCB0cmFuc2Zvcm1lZEF0dHJpYnV0ZU1hcFtuYW1lXSB8fCBuYW1lO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlTWF0Y2ggPyB0eXBlTWF0Y2hbMV0gOiBudWxsLFxuICAgICAgdmFsdWU6IHZhbHVlTWF0Y2ggPyB2YWx1ZU1hdGNoWzFdIDogbnVsbCxcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzLm1hcCgoaSkgPT4gaS5yZXBsYWNlKFwiLlwiLCBcIlwiKSksXG4gICAgICBleHByZXNzaW9uOiB2YWx1ZSxcbiAgICAgIG9yaWdpbmFsXG4gICAgfTtcbiAgfTtcbn1cbnZhciBERUZBVUxUID0gXCJERUZBVUxUXCI7XG52YXIgZGlyZWN0aXZlT3JkZXIgPSBbXG4gIFwiaWdub3JlXCIsXG4gIFwicmVmXCIsXG4gIFwiZGF0YVwiLFxuICBcImlkXCIsXG4gIFwiYW5jaG9yXCIsXG4gIFwiYmluZFwiLFxuICBcImluaXRcIixcbiAgXCJmb3JcIixcbiAgXCJtb2RlbFwiLFxuICBcIm1vZGVsYWJsZVwiLFxuICBcInRyYW5zaXRpb25cIixcbiAgXCJzaG93XCIsXG4gIFwiaWZcIixcbiAgREVGQVVMVCxcbiAgXCJ0ZWxlcG9ydFwiXG5dO1xuZnVuY3Rpb24gYnlQcmlvcml0eShhLCBiKSB7XG4gIGxldCB0eXBlQSA9IGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YoYS50eXBlKSA9PT0gLTEgPyBERUZBVUxUIDogYS50eXBlO1xuICBsZXQgdHlwZUIgPSBkaXJlY3RpdmVPcmRlci5pbmRleE9mKGIudHlwZSkgPT09IC0xID8gREVGQVVMVCA6IGIudHlwZTtcbiAgcmV0dXJuIGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YodHlwZUEpIC0gZGlyZWN0aXZlT3JkZXIuaW5kZXhPZih0eXBlQik7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9kaXNwYXRjaC5qc1xuZnVuY3Rpb24gZGlzcGF0Y2goZWwsIG5hbWUsIGRldGFpbCA9IHt9KSB7XG4gIGVsLmRpc3BhdGNoRXZlbnQoXG4gICAgbmV3IEN1c3RvbUV2ZW50KG5hbWUsIHtcbiAgICAgIGRldGFpbCxcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAvLyBBbGxvd3MgZXZlbnRzIHRvIHBhc3MgdGhlIHNoYWRvdyBET00gYmFycmllci5cbiAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgIH0pXG4gICk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy93YWxrLmpzXG5mdW5jdGlvbiB3YWxrKGVsLCBjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIFNoYWRvd1Jvb3QgPT09IFwiZnVuY3Rpb25cIiAmJiBlbCBpbnN0YW5jZW9mIFNoYWRvd1Jvb3QpIHtcbiAgICBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKS5mb3JFYWNoKChlbDIpID0+IHdhbGsoZWwyLCBjYWxsYmFjaykpO1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgc2tpcCA9IGZhbHNlO1xuICBjYWxsYmFjayhlbCwgKCkgPT4gc2tpcCA9IHRydWUpO1xuICBpZiAoc2tpcClcbiAgICByZXR1cm47XG4gIGxldCBub2RlID0gZWwuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIHdoaWxlIChub2RlKSB7XG4gICAgd2Fsayhub2RlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgIG5vZGUgPSBub2RlLm5leHRFbGVtZW50U2libGluZztcbiAgfVxufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvd2Fybi5qc1xuZnVuY3Rpb24gd2FybihtZXNzYWdlLCAuLi5hcmdzKSB7XG4gIGNvbnNvbGUud2FybihgQWxwaW5lIFdhcm5pbmc6ICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2xpZmVjeWNsZS5qc1xudmFyIHN0YXJ0ZWQgPSBmYWxzZTtcbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICBpZiAoc3RhcnRlZClcbiAgICB3YXJuKFwiQWxwaW5lIGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgb24gdGhpcyBwYWdlLiBDYWxsaW5nIEFscGluZS5zdGFydCgpIG1vcmUgdGhhbiBvbmNlIGNhbiBjYXVzZSBwcm9ibGVtcy5cIik7XG4gIHN0YXJ0ZWQgPSB0cnVlO1xuICBpZiAoIWRvY3VtZW50LmJvZHkpXG4gICAgd2FybihcIlVuYWJsZSB0byBpbml0aWFsaXplLiBUcnlpbmcgdG8gbG9hZCBBbHBpbmUgYmVmb3JlIGA8Ym9keT5gIGlzIGF2YWlsYWJsZS4gRGlkIHlvdSBmb3JnZXQgdG8gYWRkIGBkZWZlcmAgaW4gQWxwaW5lJ3MgYDxzY3JpcHQ+YCB0YWc/XCIpO1xuICBkaXNwYXRjaChkb2N1bWVudCwgXCJhbHBpbmU6aW5pdFwiKTtcbiAgZGlzcGF0Y2goZG9jdW1lbnQsIFwiYWxwaW5lOmluaXRpYWxpemluZ1wiKTtcbiAgc3RhcnRPYnNlcnZpbmdNdXRhdGlvbnMoKTtcbiAgb25FbEFkZGVkKChlbCkgPT4gaW5pdFRyZWUoZWwsIHdhbGspKTtcbiAgb25FbFJlbW92ZWQoKGVsKSA9PiBkZXN0cm95VHJlZShlbCkpO1xuICBvbkF0dHJpYnV0ZXNBZGRlZCgoZWwsIGF0dHJzKSA9PiB7XG4gICAgZGlyZWN0aXZlcyhlbCwgYXR0cnMpLmZvckVhY2goKGhhbmRsZSkgPT4gaGFuZGxlKCkpO1xuICB9KTtcbiAgbGV0IG91dE5lc3RlZENvbXBvbmVudHMgPSAoZWwpID0+ICFjbG9zZXN0Um9vdChlbC5wYXJlbnRFbGVtZW50LCB0cnVlKTtcbiAgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGFsbFNlbGVjdG9ycygpLmpvaW4oXCIsXCIpKSkuZmlsdGVyKG91dE5lc3RlZENvbXBvbmVudHMpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgaW5pdFRyZWUoZWwpO1xuICB9KTtcbiAgZGlzcGF0Y2goZG9jdW1lbnQsIFwiYWxwaW5lOmluaXRpYWxpemVkXCIpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB3YXJuQWJvdXRNaXNzaW5nUGx1Z2lucygpO1xuICB9KTtcbn1cbnZhciByb290U2VsZWN0b3JDYWxsYmFja3MgPSBbXTtcbnZhciBpbml0U2VsZWN0b3JDYWxsYmFja3MgPSBbXTtcbmZ1bmN0aW9uIHJvb3RTZWxlY3RvcnMoKSB7XG4gIHJldHVybiByb290U2VsZWN0b3JDYWxsYmFja3MubWFwKChmbikgPT4gZm4oKSk7XG59XG5mdW5jdGlvbiBhbGxTZWxlY3RvcnMoKSB7XG4gIHJldHVybiByb290U2VsZWN0b3JDYWxsYmFja3MuY29uY2F0KGluaXRTZWxlY3RvckNhbGxiYWNrcykubWFwKChmbikgPT4gZm4oKSk7XG59XG5mdW5jdGlvbiBhZGRSb290U2VsZWN0b3Ioc2VsZWN0b3JDYWxsYmFjaykge1xuICByb290U2VsZWN0b3JDYWxsYmFja3MucHVzaChzZWxlY3RvckNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGFkZEluaXRTZWxlY3RvcihzZWxlY3RvckNhbGxiYWNrKSB7XG4gIGluaXRTZWxlY3RvckNhbGxiYWNrcy5wdXNoKHNlbGVjdG9yQ2FsbGJhY2spO1xufVxuZnVuY3Rpb24gY2xvc2VzdFJvb3QoZWwsIGluY2x1ZGVJbml0U2VsZWN0b3JzID0gZmFsc2UpIHtcbiAgcmV0dXJuIGZpbmRDbG9zZXN0KGVsLCAoZWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdG9ycyA9IGluY2x1ZGVJbml0U2VsZWN0b3JzID8gYWxsU2VsZWN0b3JzKCkgOiByb290U2VsZWN0b3JzKCk7XG4gICAgaWYgKHNlbGVjdG9ycy5zb21lKChzZWxlY3RvcikgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5mdW5jdGlvbiBmaW5kQ2xvc2VzdChlbCwgY2FsbGJhY2spIHtcbiAgaWYgKCFlbClcbiAgICByZXR1cm47XG4gIGlmIChjYWxsYmFjayhlbCkpXG4gICAgcmV0dXJuIGVsO1xuICBpZiAoZWwuX3hfdGVsZXBvcnRCYWNrKVxuICAgIGVsID0gZWwuX3hfdGVsZXBvcnRCYWNrO1xuICBpZiAoIWVsLnBhcmVudEVsZW1lbnQpXG4gICAgcmV0dXJuO1xuICByZXR1cm4gZmluZENsb3Nlc3QoZWwucGFyZW50RWxlbWVudCwgY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gaXNSb290KGVsKSB7XG4gIHJldHVybiByb290U2VsZWN0b3JzKCkuc29tZSgoc2VsZWN0b3IpID0+IGVsLm1hdGNoZXMoc2VsZWN0b3IpKTtcbn1cbnZhciBpbml0SW50ZXJjZXB0b3JzMiA9IFtdO1xuZnVuY3Rpb24gaW50ZXJjZXB0SW5pdChjYWxsYmFjaykge1xuICBpbml0SW50ZXJjZXB0b3JzMi5wdXNoKGNhbGxiYWNrKTtcbn1cbnZhciBtYXJrZXJEaXNwZW5zZXIgPSAxO1xuZnVuY3Rpb24gaW5pdFRyZWUoZWwsIHdhbGtlciA9IHdhbGssIGludGVyY2VwdCA9ICgpID0+IHtcbn0pIHtcbiAgaWYgKGZpbmRDbG9zZXN0KGVsLCAoaSkgPT4gaS5feF9pZ25vcmUpKVxuICAgIHJldHVybjtcbiAgZGVmZXJIYW5kbGluZ0RpcmVjdGl2ZXMoKCkgPT4ge1xuICAgIHdhbGtlcihlbCwgKGVsMiwgc2tpcCkgPT4ge1xuICAgICAgaWYgKGVsMi5feF9tYXJrZXIpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGludGVyY2VwdChlbDIsIHNraXApO1xuICAgICAgaW5pdEludGVyY2VwdG9yczIuZm9yRWFjaCgoaSkgPT4gaShlbDIsIHNraXApKTtcbiAgICAgIGRpcmVjdGl2ZXMoZWwyLCBlbDIuYXR0cmlidXRlcykuZm9yRWFjaCgoaGFuZGxlKSA9PiBoYW5kbGUoKSk7XG4gICAgICBpZiAoIWVsMi5feF9pZ25vcmUpXG4gICAgICAgIGVsMi5feF9tYXJrZXIgPSBtYXJrZXJEaXNwZW5zZXIrKztcbiAgICAgIGVsMi5feF9pZ25vcmUgJiYgc2tpcCgpO1xuICAgIH0pO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3lUcmVlKHJvb3QsIHdhbGtlciA9IHdhbGspIHtcbiAgd2Fsa2VyKHJvb3QsIChlbCkgPT4ge1xuICAgIGNsZWFudXBFbGVtZW50KGVsKTtcbiAgICBjbGVhbnVwQXR0cmlidXRlcyhlbCk7XG4gICAgZGVsZXRlIGVsLl94X21hcmtlcjtcbiAgfSk7XG59XG5mdW5jdGlvbiB3YXJuQWJvdXRNaXNzaW5nUGx1Z2lucygpIHtcbiAgbGV0IHBsdWdpbkRpcmVjdGl2ZXMgPSBbXG4gICAgW1widWlcIiwgXCJkaWFsb2dcIiwgW1wiW3gtZGlhbG9nXSwgW3gtcG9wb3Zlcl1cIl1dLFxuICAgIFtcImFuY2hvclwiLCBcImFuY2hvclwiLCBbXCJbeC1hbmNob3JdXCJdXSxcbiAgICBbXCJzb3J0XCIsIFwic29ydFwiLCBbXCJbeC1zb3J0XVwiXV1cbiAgXTtcbiAgcGx1Z2luRGlyZWN0aXZlcy5mb3JFYWNoKChbcGx1Z2luMiwgZGlyZWN0aXZlMiwgc2VsZWN0b3JzXSkgPT4ge1xuICAgIGlmIChkaXJlY3RpdmVFeGlzdHMoZGlyZWN0aXZlMikpXG4gICAgICByZXR1cm47XG4gICAgc2VsZWN0b3JzLnNvbWUoKHNlbGVjdG9yKSA9PiB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgd2FybihgZm91bmQgXCIke3NlbGVjdG9yfVwiLCBidXQgbWlzc2luZyAke3BsdWdpbjJ9IHBsdWdpbmApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9uZXh0VGljay5qc1xudmFyIHRpY2tTdGFjayA9IFtdO1xudmFyIGlzSG9sZGluZyA9IGZhbHNlO1xuZnVuY3Rpb24gbmV4dFRpY2soY2FsbGJhY2sgPSAoKSA9PiB7XG59KSB7XG4gIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICBpc0hvbGRpbmcgfHwgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZWxlYXNlTmV4dFRpY2tzKCk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgIHRpY2tTdGFjay5wdXNoKCgpID0+IHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgICByZXMoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5mdW5jdGlvbiByZWxlYXNlTmV4dFRpY2tzKCkge1xuICBpc0hvbGRpbmcgPSBmYWxzZTtcbiAgd2hpbGUgKHRpY2tTdGFjay5sZW5ndGgpXG4gICAgdGlja1N0YWNrLnNoaWZ0KCkoKTtcbn1cbmZ1bmN0aW9uIGhvbGROZXh0VGlja3MoKSB7XG4gIGlzSG9sZGluZyA9IHRydWU7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9jbGFzc2VzLmpzXG5mdW5jdGlvbiBzZXRDbGFzc2VzKGVsLCB2YWx1ZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc2V0Q2xhc3Nlc0Zyb21TdHJpbmcoZWwsIHZhbHVlLmpvaW4oXCIgXCIpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICByZXR1cm4gc2V0Q2xhc3Nlc0Zyb21PYmplY3QoZWwsIHZhbHVlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBzZXRDbGFzc2VzKGVsLCB2YWx1ZSgpKTtcbiAgfVxuICByZXR1cm4gc2V0Q2xhc3Nlc0Zyb21TdHJpbmcoZWwsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHNldENsYXNzZXNGcm9tU3RyaW5nKGVsLCBjbGFzc1N0cmluZykge1xuICBsZXQgc3BsaXQgPSAoY2xhc3NTdHJpbmcyKSA9PiBjbGFzc1N0cmluZzIuc3BsaXQoXCIgXCIpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IG1pc3NpbmdDbGFzc2VzID0gKGNsYXNzU3RyaW5nMikgPT4gY2xhc3NTdHJpbmcyLnNwbGl0KFwiIFwiKS5maWx0ZXIoKGkpID0+ICFlbC5jbGFzc0xpc3QuY29udGFpbnMoaSkpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGFkZENsYXNzZXNBbmRSZXR1cm5VbmRvID0gKGNsYXNzZXMpID0+IHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKC4uLmNsYXNzZXMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKC4uLmNsYXNzZXMpO1xuICAgIH07XG4gIH07XG4gIGNsYXNzU3RyaW5nID0gY2xhc3NTdHJpbmcgPT09IHRydWUgPyBjbGFzc1N0cmluZyA9IFwiXCIgOiBjbGFzc1N0cmluZyB8fCBcIlwiO1xuICByZXR1cm4gYWRkQ2xhc3Nlc0FuZFJldHVyblVuZG8obWlzc2luZ0NsYXNzZXMoY2xhc3NTdHJpbmcpKTtcbn1cbmZ1bmN0aW9uIHNldENsYXNzZXNGcm9tT2JqZWN0KGVsLCBjbGFzc09iamVjdCkge1xuICBsZXQgc3BsaXQgPSAoY2xhc3NTdHJpbmcpID0+IGNsYXNzU3RyaW5nLnNwbGl0KFwiIFwiKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBmb3JBZGQgPSBPYmplY3QuZW50cmllcyhjbGFzc09iamVjdCkuZmxhdE1hcCgoW2NsYXNzU3RyaW5nLCBib29sXSkgPT4gYm9vbCA/IHNwbGl0KGNsYXNzU3RyaW5nKSA6IGZhbHNlKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBmb3JSZW1vdmUgPSBPYmplY3QuZW50cmllcyhjbGFzc09iamVjdCkuZmxhdE1hcCgoW2NsYXNzU3RyaW5nLCBib29sXSkgPT4gIWJvb2wgPyBzcGxpdChjbGFzc1N0cmluZykgOiBmYWxzZSkuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgYWRkZWQgPSBbXTtcbiAgbGV0IHJlbW92ZWQgPSBbXTtcbiAgZm9yUmVtb3ZlLmZvckVhY2goKGkpID0+IHtcbiAgICBpZiAoZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGkpKSB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGkpO1xuICAgICAgcmVtb3ZlZC5wdXNoKGkpO1xuICAgIH1cbiAgfSk7XG4gIGZvckFkZC5mb3JFYWNoKChpKSA9PiB7XG4gICAgaWYgKCFlbC5jbGFzc0xpc3QuY29udGFpbnMoaSkpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5hZGQoaSk7XG4gICAgICBhZGRlZC5wdXNoKGkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgcmVtb3ZlZC5mb3JFYWNoKChpKSA9PiBlbC5jbGFzc0xpc3QuYWRkKGkpKTtcbiAgICBhZGRlZC5mb3JFYWNoKChpKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKGkpKTtcbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL3N0eWxlcy5qc1xuZnVuY3Rpb24gc2V0U3R5bGVzKGVsLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHNldFN0eWxlc0Zyb21PYmplY3QoZWwsIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gc2V0U3R5bGVzRnJvbVN0cmluZyhlbCwgdmFsdWUpO1xufVxuZnVuY3Rpb24gc2V0U3R5bGVzRnJvbU9iamVjdChlbCwgdmFsdWUpIHtcbiAgbGV0IHByZXZpb3VzU3R5bGVzID0ge307XG4gIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChba2V5LCB2YWx1ZTJdKSA9PiB7XG4gICAgcHJldmlvdXNTdHlsZXNba2V5XSA9IGVsLnN0eWxlW2tleV07XG4gICAgaWYgKCFrZXkuc3RhcnRzV2l0aChcIi0tXCIpKSB7XG4gICAgICBrZXkgPSBrZWJhYkNhc2Uoa2V5KTtcbiAgICB9XG4gICAgZWwuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZTIpO1xuICB9KTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgaWYgKGVsLnN0eWxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBzZXRTdHlsZXMoZWwsIHByZXZpb3VzU3R5bGVzKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIHNldFN0eWxlc0Zyb21TdHJpbmcoZWwsIHZhbHVlKSB7XG4gIGxldCBjYWNoZSA9IGVsLmdldEF0dHJpYnV0ZShcInN0eWxlXCIsIHZhbHVlKTtcbiAgZWwuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdmFsdWUpO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGVsLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGNhY2hlIHx8IFwiXCIpO1xuICB9O1xufVxuZnVuY3Rpb24ga2ViYWJDYXNlKHN1YmplY3QpIHtcbiAgcmV0dXJuIHN1YmplY3QucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgXCIkMS0kMlwiKS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvb25jZS5qc1xuZnVuY3Rpb24gb25jZShjYWxsYmFjaywgZmFsbGJhY2sgPSAoKSA9PiB7XG59KSB7XG4gIGxldCBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmICghY2FsbGVkKSB7XG4gICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmFsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtdHJhbnNpdGlvbi5qc1xuZGlyZWN0aXZlKFwidHJhbnNpdGlvblwiLCAoZWwsIHsgdmFsdWUsIG1vZGlmaWVycywgZXhwcmVzc2lvbiB9LCB7IGV2YWx1YXRlOiBldmFsdWF0ZTIgfSkgPT4ge1xuICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIilcbiAgICBleHByZXNzaW9uID0gZXZhbHVhdGUyKGV4cHJlc3Npb24pO1xuICBpZiAoZXhwcmVzc2lvbiA9PT0gZmFsc2UpXG4gICAgcmV0dXJuO1xuICBpZiAoIWV4cHJlc3Npb24gfHwgdHlwZW9mIGV4cHJlc3Npb24gPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmVnaXN0ZXJUcmFuc2l0aW9uc0Zyb21IZWxwZXIoZWwsIG1vZGlmaWVycywgdmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHJlZ2lzdGVyVHJhbnNpdGlvbnNGcm9tQ2xhc3NTdHJpbmcoZWwsIGV4cHJlc3Npb24sIHZhbHVlKTtcbiAgfVxufSk7XG5mdW5jdGlvbiByZWdpc3RlclRyYW5zaXRpb25zRnJvbUNsYXNzU3RyaW5nKGVsLCBjbGFzc1N0cmluZywgc3RhZ2UpIHtcbiAgcmVnaXN0ZXJUcmFuc2l0aW9uT2JqZWN0KGVsLCBzZXRDbGFzc2VzLCBcIlwiKTtcbiAgbGV0IGRpcmVjdGl2ZVN0b3JhZ2VNYXAgPSB7XG4gICAgXCJlbnRlclwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5kdXJpbmcgPSBjbGFzc2VzO1xuICAgIH0sXG4gICAgXCJlbnRlci1zdGFydFwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5zdGFydCA9IGNsYXNzZXM7XG4gICAgfSxcbiAgICBcImVudGVyLWVuZFwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5lbmQgPSBjbGFzc2VzO1xuICAgIH0sXG4gICAgXCJsZWF2ZVwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5kdXJpbmcgPSBjbGFzc2VzO1xuICAgIH0sXG4gICAgXCJsZWF2ZS1zdGFydFwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5zdGFydCA9IGNsYXNzZXM7XG4gICAgfSxcbiAgICBcImxlYXZlLWVuZFwiOiAoY2xhc3NlcykgPT4ge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5lbmQgPSBjbGFzc2VzO1xuICAgIH1cbiAgfTtcbiAgZGlyZWN0aXZlU3RvcmFnZU1hcFtzdGFnZV0oY2xhc3NTdHJpbmcpO1xufVxuZnVuY3Rpb24gcmVnaXN0ZXJUcmFuc2l0aW9uc0Zyb21IZWxwZXIoZWwsIG1vZGlmaWVycywgc3RhZ2UpIHtcbiAgcmVnaXN0ZXJUcmFuc2l0aW9uT2JqZWN0KGVsLCBzZXRTdHlsZXMpO1xuICBsZXQgZG9lc250U3BlY2lmeSA9ICFtb2RpZmllcnMuaW5jbHVkZXMoXCJpblwiKSAmJiAhbW9kaWZpZXJzLmluY2x1ZGVzKFwib3V0XCIpICYmICFzdGFnZTtcbiAgbGV0IHRyYW5zaXRpb25pbmdJbiA9IGRvZXNudFNwZWNpZnkgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwiaW5cIikgfHwgW1wiZW50ZXJcIl0uaW5jbHVkZXMoc3RhZ2UpO1xuICBsZXQgdHJhbnNpdGlvbmluZ091dCA9IGRvZXNudFNwZWNpZnkgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwib3V0XCIpIHx8IFtcImxlYXZlXCJdLmluY2x1ZGVzKHN0YWdlKTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImluXCIpICYmICFkb2VzbnRTcGVjaWZ5KSB7XG4gICAgbW9kaWZpZXJzID0gbW9kaWZpZXJzLmZpbHRlcigoaSwgaW5kZXgpID0+IGluZGV4IDwgbW9kaWZpZXJzLmluZGV4T2YoXCJvdXRcIikpO1xuICB9XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJvdXRcIikgJiYgIWRvZXNudFNwZWNpZnkpIHtcbiAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuZmlsdGVyKChpLCBpbmRleCkgPT4gaW5kZXggPiBtb2RpZmllcnMuaW5kZXhPZihcIm91dFwiKSk7XG4gIH1cbiAgbGV0IHdhbnRzQWxsID0gIW1vZGlmaWVycy5pbmNsdWRlcyhcIm9wYWNpdHlcIikgJiYgIW1vZGlmaWVycy5pbmNsdWRlcyhcInNjYWxlXCIpO1xuICBsZXQgd2FudHNPcGFjaXR5ID0gd2FudHNBbGwgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwib3BhY2l0eVwiKTtcbiAgbGV0IHdhbnRzU2NhbGUgPSB3YW50c0FsbCB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJzY2FsZVwiKTtcbiAgbGV0IG9wYWNpdHlWYWx1ZSA9IHdhbnRzT3BhY2l0eSA/IDAgOiAxO1xuICBsZXQgc2NhbGVWYWx1ZSA9IHdhbnRzU2NhbGUgPyBtb2RpZmllclZhbHVlKG1vZGlmaWVycywgXCJzY2FsZVwiLCA5NSkgLyAxMDAgOiAxO1xuICBsZXQgZGVsYXkgPSBtb2RpZmllclZhbHVlKG1vZGlmaWVycywgXCJkZWxheVwiLCAwKSAvIDFlMztcbiAgbGV0IG9yaWdpbiA9IG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBcIm9yaWdpblwiLCBcImNlbnRlclwiKTtcbiAgbGV0IHByb3BlcnR5ID0gXCJvcGFjaXR5LCB0cmFuc2Zvcm1cIjtcbiAgbGV0IGR1cmF0aW9uSW4gPSBtb2RpZmllclZhbHVlKG1vZGlmaWVycywgXCJkdXJhdGlvblwiLCAxNTApIC8gMWUzO1xuICBsZXQgZHVyYXRpb25PdXQgPSBtb2RpZmllclZhbHVlKG1vZGlmaWVycywgXCJkdXJhdGlvblwiLCA3NSkgLyAxZTM7XG4gIGxldCBlYXNpbmcgPSBgY3ViaWMtYmV6aWVyKDAuNCwgMC4wLCAwLjIsIDEpYDtcbiAgaWYgKHRyYW5zaXRpb25pbmdJbikge1xuICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZHVyaW5nID0ge1xuICAgICAgdHJhbnNmb3JtT3JpZ2luOiBvcmlnaW4sXG4gICAgICB0cmFuc2l0aW9uRGVsYXk6IGAke2RlbGF5fXNgLFxuICAgICAgdHJhbnNpdGlvblByb3BlcnR5OiBwcm9wZXJ0eSxcbiAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogYCR7ZHVyYXRpb25Jbn1zYCxcbiAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogZWFzaW5nXG4gICAgfTtcbiAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLnN0YXJ0ID0ge1xuICAgICAgb3BhY2l0eTogb3BhY2l0eVZhbHVlLFxuICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoJHtzY2FsZVZhbHVlfSlgXG4gICAgfTtcbiAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLmVuZCA9IHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06IGBzY2FsZSgxKWBcbiAgICB9O1xuICB9XG4gIGlmICh0cmFuc2l0aW9uaW5nT3V0KSB7XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5kdXJpbmcgPSB7XG4gICAgICB0cmFuc2Zvcm1PcmlnaW46IG9yaWdpbixcbiAgICAgIHRyYW5zaXRpb25EZWxheTogYCR7ZGVsYXl9c2AsXG4gICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IHByb3BlcnR5LFxuICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBgJHtkdXJhdGlvbk91dH1zYCxcbiAgICAgIHRyYW5zaXRpb25UaW1pbmdGdW5jdGlvbjogZWFzaW5nXG4gICAgfTtcbiAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLnN0YXJ0ID0ge1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogYHNjYWxlKDEpYFxuICAgIH07XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5lbmQgPSB7XG4gICAgICBvcGFjaXR5OiBvcGFjaXR5VmFsdWUsXG4gICAgICB0cmFuc2Zvcm06IGBzY2FsZSgke3NjYWxlVmFsdWV9KWBcbiAgICB9O1xuICB9XG59XG5mdW5jdGlvbiByZWdpc3RlclRyYW5zaXRpb25PYmplY3QoZWwsIHNldEZ1bmN0aW9uLCBkZWZhdWx0VmFsdWUgPSB7fSkge1xuICBpZiAoIWVsLl94X3RyYW5zaXRpb24pXG4gICAgZWwuX3hfdHJhbnNpdGlvbiA9IHtcbiAgICAgIGVudGVyOiB7IGR1cmluZzogZGVmYXVsdFZhbHVlLCBzdGFydDogZGVmYXVsdFZhbHVlLCBlbmQ6IGRlZmF1bHRWYWx1ZSB9LFxuICAgICAgbGVhdmU6IHsgZHVyaW5nOiBkZWZhdWx0VmFsdWUsIHN0YXJ0OiBkZWZhdWx0VmFsdWUsIGVuZDogZGVmYXVsdFZhbHVlIH0sXG4gICAgICBpbihiZWZvcmUgPSAoKSA9PiB7XG4gICAgICB9LCBhZnRlciA9ICgpID0+IHtcbiAgICAgIH0pIHtcbiAgICAgICAgdHJhbnNpdGlvbihlbCwgc2V0RnVuY3Rpb24sIHtcbiAgICAgICAgICBkdXJpbmc6IHRoaXMuZW50ZXIuZHVyaW5nLFxuICAgICAgICAgIHN0YXJ0OiB0aGlzLmVudGVyLnN0YXJ0LFxuICAgICAgICAgIGVuZDogdGhpcy5lbnRlci5lbmRcbiAgICAgICAgfSwgYmVmb3JlLCBhZnRlcik7XG4gICAgICB9LFxuICAgICAgb3V0KGJlZm9yZSA9ICgpID0+IHtcbiAgICAgIH0sIGFmdGVyID0gKCkgPT4ge1xuICAgICAgfSkge1xuICAgICAgICB0cmFuc2l0aW9uKGVsLCBzZXRGdW5jdGlvbiwge1xuICAgICAgICAgIGR1cmluZzogdGhpcy5sZWF2ZS5kdXJpbmcsXG4gICAgICAgICAgc3RhcnQ6IHRoaXMubGVhdmUuc3RhcnQsXG4gICAgICAgICAgZW5kOiB0aGlzLmxlYXZlLmVuZFxuICAgICAgICB9LCBiZWZvcmUsIGFmdGVyKTtcbiAgICAgIH1cbiAgICB9O1xufVxud2luZG93LkVsZW1lbnQucHJvdG90eXBlLl94X3RvZ2dsZUFuZENhc2NhZGVXaXRoVHJhbnNpdGlvbnMgPSBmdW5jdGlvbihlbCwgdmFsdWUsIHNob3csIGhpZGUpIHtcbiAgY29uc3QgbmV4dFRpY2syID0gZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSBcInZpc2libGVcIiA/IHJlcXVlc3RBbmltYXRpb25GcmFtZSA6IHNldFRpbWVvdXQ7XG4gIGxldCBjbGlja0F3YXlDb21wYXRpYmxlU2hvdyA9ICgpID0+IG5leHRUaWNrMihzaG93KTtcbiAgaWYgKHZhbHVlKSB7XG4gICAgaWYgKGVsLl94X3RyYW5zaXRpb24gJiYgKGVsLl94X3RyYW5zaXRpb24uZW50ZXIgfHwgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZSkpIHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIgJiYgKE9iamVjdC5lbnRyaWVzKGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZHVyaW5nKS5sZW5ndGggfHwgT2JqZWN0LmVudHJpZXMoZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5zdGFydCkubGVuZ3RoIHx8IE9iamVjdC5lbnRyaWVzKGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZW5kKS5sZW5ndGgpID8gZWwuX3hfdHJhbnNpdGlvbi5pbihzaG93KSA6IGNsaWNrQXdheUNvbXBhdGlibGVTaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24gPyBlbC5feF90cmFuc2l0aW9uLmluKHNob3cpIDogY2xpY2tBd2F5Q29tcGF0aWJsZVNob3coKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGVsLl94X2hpZGVQcm9taXNlID0gZWwuX3hfdHJhbnNpdGlvbiA/IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBlbC5feF90cmFuc2l0aW9uLm91dCgoKSA9PiB7XG4gICAgfSwgKCkgPT4gcmVzb2x2ZShoaWRlKSk7XG4gICAgZWwuX3hfdHJhbnNpdGlvbmluZyAmJiBlbC5feF90cmFuc2l0aW9uaW5nLmJlZm9yZUNhbmNlbCgoKSA9PiByZWplY3QoeyBpc0Zyb21DYW5jZWxsZWRUcmFuc2l0aW9uOiB0cnVlIH0pKTtcbiAgfSkgOiBQcm9taXNlLnJlc29sdmUoaGlkZSk7XG4gIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICBsZXQgY2xvc2VzdCA9IGNsb3Nlc3RIaWRlKGVsKTtcbiAgICBpZiAoY2xvc2VzdCkge1xuICAgICAgaWYgKCFjbG9zZXN0Ll94X2hpZGVDaGlsZHJlbilcbiAgICAgICAgY2xvc2VzdC5feF9oaWRlQ2hpbGRyZW4gPSBbXTtcbiAgICAgIGNsb3Nlc3QuX3hfaGlkZUNoaWxkcmVuLnB1c2goZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0VGljazIoKCkgPT4ge1xuICAgICAgICBsZXQgaGlkZUFmdGVyQ2hpbGRyZW4gPSAoZWwyKSA9PiB7XG4gICAgICAgICAgbGV0IGNhcnJ5ID0gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgZWwyLl94X2hpZGVQcm9taXNlLFxuICAgICAgICAgICAgLi4uKGVsMi5feF9oaWRlQ2hpbGRyZW4gfHwgW10pLm1hcChoaWRlQWZ0ZXJDaGlsZHJlbilcbiAgICAgICAgICBdKS50aGVuKChbaV0pID0+IGk/LigpKTtcbiAgICAgICAgICBkZWxldGUgZWwyLl94X2hpZGVQcm9taXNlO1xuICAgICAgICAgIGRlbGV0ZSBlbDIuX3hfaGlkZUNoaWxkcmVuO1xuICAgICAgICAgIHJldHVybiBjYXJyeTtcbiAgICAgICAgfTtcbiAgICAgICAgaGlkZUFmdGVyQ2hpbGRyZW4oZWwpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgaWYgKCFlLmlzRnJvbUNhbmNlbGxlZFRyYW5zaXRpb24pXG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuZnVuY3Rpb24gY2xvc2VzdEhpZGUoZWwpIHtcbiAgbGV0IHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gIGlmICghcGFyZW50KVxuICAgIHJldHVybjtcbiAgcmV0dXJuIHBhcmVudC5feF9oaWRlUHJvbWlzZSA/IHBhcmVudCA6IGNsb3Nlc3RIaWRlKHBhcmVudCk7XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uKGVsLCBzZXRGdW5jdGlvbiwgeyBkdXJpbmcsIHN0YXJ0OiBzdGFydDIsIGVuZCB9ID0ge30sIGJlZm9yZSA9ICgpID0+IHtcbn0sIGFmdGVyID0gKCkgPT4ge1xufSkge1xuICBpZiAoZWwuX3hfdHJhbnNpdGlvbmluZylcbiAgICBlbC5feF90cmFuc2l0aW9uaW5nLmNhbmNlbCgpO1xuICBpZiAoT2JqZWN0LmtleXMoZHVyaW5nKS5sZW5ndGggPT09IDAgJiYgT2JqZWN0LmtleXMoc3RhcnQyKS5sZW5ndGggPT09IDAgJiYgT2JqZWN0LmtleXMoZW5kKS5sZW5ndGggPT09IDApIHtcbiAgICBiZWZvcmUoKTtcbiAgICBhZnRlcigpO1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgdW5kb1N0YXJ0LCB1bmRvRHVyaW5nLCB1bmRvRW5kO1xuICBwZXJmb3JtVHJhbnNpdGlvbihlbCwge1xuICAgIHN0YXJ0KCkge1xuICAgICAgdW5kb1N0YXJ0ID0gc2V0RnVuY3Rpb24oZWwsIHN0YXJ0Mik7XG4gICAgfSxcbiAgICBkdXJpbmcoKSB7XG4gICAgICB1bmRvRHVyaW5nID0gc2V0RnVuY3Rpb24oZWwsIGR1cmluZyk7XG4gICAgfSxcbiAgICBiZWZvcmUsXG4gICAgZW5kKCkge1xuICAgICAgdW5kb1N0YXJ0KCk7XG4gICAgICB1bmRvRW5kID0gc2V0RnVuY3Rpb24oZWwsIGVuZCk7XG4gICAgfSxcbiAgICBhZnRlcixcbiAgICBjbGVhbnVwKCkge1xuICAgICAgdW5kb0R1cmluZygpO1xuICAgICAgdW5kb0VuZCgpO1xuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiBwZXJmb3JtVHJhbnNpdGlvbihlbCwgc3RhZ2VzKSB7XG4gIGxldCBpbnRlcnJ1cHRlZCwgcmVhY2hlZEJlZm9yZSwgcmVhY2hlZEVuZDtcbiAgbGV0IGZpbmlzaCA9IG9uY2UoKCkgPT4ge1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBpbnRlcnJ1cHRlZCA9IHRydWU7XG4gICAgICBpZiAoIXJlYWNoZWRCZWZvcmUpXG4gICAgICAgIHN0YWdlcy5iZWZvcmUoKTtcbiAgICAgIGlmICghcmVhY2hlZEVuZCkge1xuICAgICAgICBzdGFnZXMuZW5kKCk7XG4gICAgICAgIHJlbGVhc2VOZXh0VGlja3MoKTtcbiAgICAgIH1cbiAgICAgIHN0YWdlcy5hZnRlcigpO1xuICAgICAgaWYgKGVsLmlzQ29ubmVjdGVkKVxuICAgICAgICBzdGFnZXMuY2xlYW51cCgpO1xuICAgICAgZGVsZXRlIGVsLl94X3RyYW5zaXRpb25pbmc7XG4gICAgfSk7XG4gIH0pO1xuICBlbC5feF90cmFuc2l0aW9uaW5nID0ge1xuICAgIGJlZm9yZUNhbmNlbHM6IFtdLFxuICAgIGJlZm9yZUNhbmNlbChjYWxsYmFjaykge1xuICAgICAgdGhpcy5iZWZvcmVDYW5jZWxzLnB1c2goY2FsbGJhY2spO1xuICAgIH0sXG4gICAgY2FuY2VsOiBvbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgd2hpbGUgKHRoaXMuYmVmb3JlQ2FuY2Vscy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5iZWZvcmVDYW5jZWxzLnNoaWZ0KCkoKTtcbiAgICAgIH1cbiAgICAgIDtcbiAgICAgIGZpbmlzaCgpO1xuICAgIH0pLFxuICAgIGZpbmlzaFxuICB9O1xuICBtdXRhdGVEb20oKCkgPT4ge1xuICAgIHN0YWdlcy5zdGFydCgpO1xuICAgIHN0YWdlcy5kdXJpbmcoKTtcbiAgfSk7XG4gIGhvbGROZXh0VGlja3MoKTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBpZiAoaW50ZXJydXB0ZWQpXG4gICAgICByZXR1cm47XG4gICAgbGV0IGR1cmF0aW9uID0gTnVtYmVyKGdldENvbXB1dGVkU3R5bGUoZWwpLnRyYW5zaXRpb25EdXJhdGlvbi5yZXBsYWNlKC8sLiovLCBcIlwiKS5yZXBsYWNlKFwic1wiLCBcIlwiKSkgKiAxZTM7XG4gICAgbGV0IGRlbGF5ID0gTnVtYmVyKGdldENvbXB1dGVkU3R5bGUoZWwpLnRyYW5zaXRpb25EZWxheS5yZXBsYWNlKC8sLiovLCBcIlwiKS5yZXBsYWNlKFwic1wiLCBcIlwiKSkgKiAxZTM7XG4gICAgaWYgKGR1cmF0aW9uID09PSAwKVxuICAgICAgZHVyYXRpb24gPSBOdW1iZXIoZ2V0Q29tcHV0ZWRTdHlsZShlbCkuYW5pbWF0aW9uRHVyYXRpb24ucmVwbGFjZShcInNcIiwgXCJcIikpICogMWUzO1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBzdGFnZXMuYmVmb3JlKCk7XG4gICAgfSk7XG4gICAgcmVhY2hlZEJlZm9yZSA9IHRydWU7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGlmIChpbnRlcnJ1cHRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgc3RhZ2VzLmVuZCgpO1xuICAgICAgfSk7XG4gICAgICByZWxlYXNlTmV4dFRpY2tzKCk7XG4gICAgICBzZXRUaW1lb3V0KGVsLl94X3RyYW5zaXRpb25pbmcuZmluaXNoLCBkdXJhdGlvbiArIGRlbGF5KTtcbiAgICAgIHJlYWNoZWRFbmQgPSB0cnVlO1xuICAgIH0pO1xuICB9KTtcbn1cbmZ1bmN0aW9uIG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBrZXksIGZhbGxiYWNrKSB7XG4gIGlmIChtb2RpZmllcnMuaW5kZXhPZihrZXkpID09PSAtMSlcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIGNvbnN0IHJhd1ZhbHVlID0gbW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKGtleSkgKyAxXTtcbiAgaWYgKCFyYXdWYWx1ZSlcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIGlmIChrZXkgPT09IFwic2NhbGVcIikge1xuICAgIGlmIChpc05hTihyYXdWYWx1ZSkpXG4gICAgICByZXR1cm4gZmFsbGJhY2s7XG4gIH1cbiAgaWYgKGtleSA9PT0gXCJkdXJhdGlvblwiIHx8IGtleSA9PT0gXCJkZWxheVwiKSB7XG4gICAgbGV0IG1hdGNoID0gcmF3VmFsdWUubWF0Y2goLyhbMC05XSspbXMvKTtcbiAgICBpZiAobWF0Y2gpXG4gICAgICByZXR1cm4gbWF0Y2hbMV07XG4gIH1cbiAgaWYgKGtleSA9PT0gXCJvcmlnaW5cIikge1xuICAgIGlmIChbXCJ0b3BcIiwgXCJyaWdodFwiLCBcImxlZnRcIiwgXCJjZW50ZXJcIiwgXCJib3R0b21cIl0uaW5jbHVkZXMobW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKGtleSkgKyAyXSkpIHtcbiAgICAgIHJldHVybiBbcmF3VmFsdWUsIG1vZGlmaWVyc1ttb2RpZmllcnMuaW5kZXhPZihrZXkpICsgMl1dLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmF3VmFsdWU7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9jbG9uZS5qc1xudmFyIGlzQ2xvbmluZyA9IGZhbHNlO1xuZnVuY3Rpb24gc2tpcER1cmluZ0Nsb25lKGNhbGxiYWNrLCBmYWxsYmFjayA9ICgpID0+IHtcbn0pIHtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiBpc0Nsb25pbmcgPyBmYWxsYmFjayguLi5hcmdzKSA6IGNhbGxiYWNrKC4uLmFyZ3MpO1xufVxuZnVuY3Rpb24gb25seUR1cmluZ0Nsb25lKGNhbGxiYWNrKSB7XG4gIHJldHVybiAoLi4uYXJncykgPT4gaXNDbG9uaW5nICYmIGNhbGxiYWNrKC4uLmFyZ3MpO1xufVxudmFyIGludGVyY2VwdG9ycyA9IFtdO1xuZnVuY3Rpb24gaW50ZXJjZXB0Q2xvbmUoY2FsbGJhY2spIHtcbiAgaW50ZXJjZXB0b3JzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gY2xvbmVOb2RlKGZyb20sIHRvKSB7XG4gIGludGVyY2VwdG9ycy5mb3JFYWNoKChpKSA9PiBpKGZyb20sIHRvKSk7XG4gIGlzQ2xvbmluZyA9IHRydWU7XG4gIGRvbnRSZWdpc3RlclJlYWN0aXZlU2lkZUVmZmVjdHMoKCkgPT4ge1xuICAgIGluaXRUcmVlKHRvLCAoZWwsIGNhbGxiYWNrKSA9PiB7XG4gICAgICBjYWxsYmFjayhlbCwgKCkgPT4ge1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICBpc0Nsb25pbmcgPSBmYWxzZTtcbn1cbnZhciBpc0Nsb25pbmdMZWdhY3kgPSBmYWxzZTtcbmZ1bmN0aW9uIGNsb25lKG9sZEVsLCBuZXdFbCkge1xuICBpZiAoIW5ld0VsLl94X2RhdGFTdGFjaylcbiAgICBuZXdFbC5feF9kYXRhU3RhY2sgPSBvbGRFbC5feF9kYXRhU3RhY2s7XG4gIGlzQ2xvbmluZyA9IHRydWU7XG4gIGlzQ2xvbmluZ0xlZ2FjeSA9IHRydWU7XG4gIGRvbnRSZWdpc3RlclJlYWN0aXZlU2lkZUVmZmVjdHMoKCkgPT4ge1xuICAgIGNsb25lVHJlZShuZXdFbCk7XG4gIH0pO1xuICBpc0Nsb25pbmcgPSBmYWxzZTtcbiAgaXNDbG9uaW5nTGVnYWN5ID0gZmFsc2U7XG59XG5mdW5jdGlvbiBjbG9uZVRyZWUoZWwpIHtcbiAgbGV0IGhhc1J1blRocm91Z2hGaXJzdEVsID0gZmFsc2U7XG4gIGxldCBzaGFsbG93V2Fsa2VyID0gKGVsMiwgY2FsbGJhY2spID0+IHtcbiAgICB3YWxrKGVsMiwgKGVsMywgc2tpcCkgPT4ge1xuICAgICAgaWYgKGhhc1J1blRocm91Z2hGaXJzdEVsICYmIGlzUm9vdChlbDMpKVxuICAgICAgICByZXR1cm4gc2tpcCgpO1xuICAgICAgaGFzUnVuVGhyb3VnaEZpcnN0RWwgPSB0cnVlO1xuICAgICAgY2FsbGJhY2soZWwzLCBza2lwKTtcbiAgICB9KTtcbiAgfTtcbiAgaW5pdFRyZWUoZWwsIHNoYWxsb3dXYWxrZXIpO1xufVxuZnVuY3Rpb24gZG9udFJlZ2lzdGVyUmVhY3RpdmVTaWRlRWZmZWN0cyhjYWxsYmFjaykge1xuICBsZXQgY2FjaGUgPSBlZmZlY3Q7XG4gIG92ZXJyaWRlRWZmZWN0KChjYWxsYmFjazIsIGVsKSA9PiB7XG4gICAgbGV0IHN0b3JlZEVmZmVjdCA9IGNhY2hlKGNhbGxiYWNrMik7XG4gICAgcmVsZWFzZShzdG9yZWRFZmZlY3QpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgfTtcbiAgfSk7XG4gIGNhbGxiYWNrKCk7XG4gIG92ZXJyaWRlRWZmZWN0KGNhY2hlKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL2JpbmQuanNcbmZ1bmN0aW9uIGJpbmQoZWwsIG5hbWUsIHZhbHVlLCBtb2RpZmllcnMgPSBbXSkge1xuICBpZiAoIWVsLl94X2JpbmRpbmdzKVxuICAgIGVsLl94X2JpbmRpbmdzID0gcmVhY3RpdmUoe30pO1xuICBlbC5feF9iaW5kaW5nc1tuYW1lXSA9IHZhbHVlO1xuICBuYW1lID0gbW9kaWZpZXJzLmluY2x1ZGVzKFwiY2FtZWxcIikgPyBjYW1lbENhc2UobmFtZSkgOiBuYW1lO1xuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIFwidmFsdWVcIjpcbiAgICAgIGJpbmRJbnB1dFZhbHVlKGVsLCB2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3R5bGVcIjpcbiAgICAgIGJpbmRTdHlsZXMoZWwsIHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJjbGFzc1wiOlxuICAgICAgYmluZENsYXNzZXMoZWwsIHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzZWxlY3RlZFwiOlxuICAgIGNhc2UgXCJjaGVja2VkXCI6XG4gICAgICBiaW5kQXR0cmlidXRlQW5kUHJvcGVydHkoZWwsIG5hbWUsIHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBiaW5kQXR0cmlidXRlKGVsLCBuYW1lLCB2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuZnVuY3Rpb24gYmluZElucHV0VmFsdWUoZWwsIHZhbHVlKSB7XG4gIGlmIChpc1JhZGlvKGVsKSkge1xuICAgIGlmIChlbC5hdHRyaWJ1dGVzLnZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgIGVsLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuICAgIGlmICh3aW5kb3cuZnJvbU1vZGVsKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICBlbC5jaGVja2VkID0gc2FmZVBhcnNlQm9vbGVhbihlbC52YWx1ZSkgPT09IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IGNoZWNrZWRBdHRyTG9vc2VDb21wYXJlKGVsLnZhbHVlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzQ2hlY2tib3goZWwpKSB7XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpKSB7XG4gICAgICBlbC52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJib29sZWFuXCIgJiYgIVtudWxsLCB2b2lkIDBdLmluY2x1ZGVzKHZhbHVlKSkge1xuICAgICAgZWwudmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHZhbHVlLnNvbWUoKHZhbCkgPT4gY2hlY2tlZEF0dHJMb29zZUNvbXBhcmUodmFsLCBlbC52YWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9ICEhdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGVsLnRhZ05hbWUgPT09IFwiU0VMRUNUXCIpIHtcbiAgICB1cGRhdGVTZWxlY3QoZWwsIHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZWwudmFsdWUgPT09IHZhbHVlKVxuICAgICAgcmV0dXJuO1xuICAgIGVsLnZhbHVlID0gdmFsdWUgPT09IHZvaWQgMCA/IFwiXCIgOiB2YWx1ZTtcbiAgfVxufVxuZnVuY3Rpb24gYmluZENsYXNzZXMoZWwsIHZhbHVlKSB7XG4gIGlmIChlbC5feF91bmRvQWRkZWRDbGFzc2VzKVxuICAgIGVsLl94X3VuZG9BZGRlZENsYXNzZXMoKTtcbiAgZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcyA9IHNldENsYXNzZXMoZWwsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGJpbmRTdHlsZXMoZWwsIHZhbHVlKSB7XG4gIGlmIChlbC5feF91bmRvQWRkZWRTdHlsZXMpXG4gICAgZWwuX3hfdW5kb0FkZGVkU3R5bGVzKCk7XG4gIGVsLl94X3VuZG9BZGRlZFN0eWxlcyA9IHNldFN0eWxlcyhlbCwgdmFsdWUpO1xufVxuZnVuY3Rpb24gYmluZEF0dHJpYnV0ZUFuZFByb3BlcnR5KGVsLCBuYW1lLCB2YWx1ZSkge1xuICBiaW5kQXR0cmlidXRlKGVsLCBuYW1lLCB2YWx1ZSk7XG4gIHNldFByb3BlcnR5SWZDaGFuZ2VkKGVsLCBuYW1lLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBiaW5kQXR0cmlidXRlKGVsLCBuYW1lLCB2YWx1ZSkge1xuICBpZiAoW251bGwsIHZvaWQgMCwgZmFsc2VdLmluY2x1ZGVzKHZhbHVlKSAmJiBhdHRyaWJ1dGVTaG91bGRudEJlUHJlc2VydmVkSWZGYWxzeShuYW1lKSkge1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaXNCb29sZWFuQXR0cihuYW1lKSlcbiAgICAgIHZhbHVlID0gbmFtZTtcbiAgICBzZXRJZkNoYW5nZWQoZWwsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuZnVuY3Rpb24gc2V0SWZDaGFuZ2VkKGVsLCBhdHRyTmFtZSwgdmFsdWUpIHtcbiAgaWYgKGVsLmdldEF0dHJpYnV0ZShhdHRyTmFtZSkgIT0gdmFsdWUpIHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbHVlKTtcbiAgfVxufVxuZnVuY3Rpb24gc2V0UHJvcGVydHlJZkNoYW5nZWQoZWwsIHByb3BOYW1lLCB2YWx1ZSkge1xuICBpZiAoZWxbcHJvcE5hbWVdICE9PSB2YWx1ZSkge1xuICAgIGVsW3Byb3BOYW1lXSA9IHZhbHVlO1xuICB9XG59XG5mdW5jdGlvbiB1cGRhdGVTZWxlY3QoZWwsIHZhbHVlKSB7XG4gIGNvbnN0IGFycmF5V3JhcHBlZFZhbHVlID0gW10uY29uY2F0KHZhbHVlKS5tYXAoKHZhbHVlMikgPT4ge1xuICAgIHJldHVybiB2YWx1ZTIgKyBcIlwiO1xuICB9KTtcbiAgQXJyYXkuZnJvbShlbC5vcHRpb25zKS5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICBvcHRpb24uc2VsZWN0ZWQgPSBhcnJheVdyYXBwZWRWYWx1ZS5pbmNsdWRlcyhvcHRpb24udmFsdWUpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGNhbWVsQ2FzZShzdWJqZWN0KSB7XG4gIHJldHVybiBzdWJqZWN0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvLShcXHcpL2csIChtYXRjaCwgY2hhcikgPT4gY2hhci50b1VwcGVyQ2FzZSgpKTtcbn1cbmZ1bmN0aW9uIGNoZWNrZWRBdHRyTG9vc2VDb21wYXJlKHZhbHVlQSwgdmFsdWVCKSB7XG4gIHJldHVybiB2YWx1ZUEgPT0gdmFsdWVCO1xufVxuZnVuY3Rpb24gc2FmZVBhcnNlQm9vbGVhbihyYXdWYWx1ZSkge1xuICBpZiAoWzEsIFwiMVwiLCBcInRydWVcIiwgXCJvblwiLCBcInllc1wiLCB0cnVlXS5pbmNsdWRlcyhyYXdWYWx1ZSkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoWzAsIFwiMFwiLCBcImZhbHNlXCIsIFwib2ZmXCIsIFwibm9cIiwgZmFsc2VdLmluY2x1ZGVzKHJhd1ZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmF3VmFsdWUgPyBCb29sZWFuKHJhd1ZhbHVlKSA6IG51bGw7XG59XG52YXIgYm9vbGVhbkF0dHJpYnV0ZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXG4gIFwiYWxsb3dmdWxsc2NyZWVuXCIsXG4gIFwiYXN5bmNcIixcbiAgXCJhdXRvZm9jdXNcIixcbiAgXCJhdXRvcGxheVwiLFxuICBcImNoZWNrZWRcIixcbiAgXCJjb250cm9sc1wiLFxuICBcImRlZmF1bHRcIixcbiAgXCJkZWZlclwiLFxuICBcImRpc2FibGVkXCIsXG4gIFwiZm9ybW5vdmFsaWRhdGVcIixcbiAgXCJpbmVydFwiLFxuICBcImlzbWFwXCIsXG4gIFwiaXRlbXNjb3BlXCIsXG4gIFwibG9vcFwiLFxuICBcIm11bHRpcGxlXCIsXG4gIFwibXV0ZWRcIixcbiAgXCJub21vZHVsZVwiLFxuICBcIm5vdmFsaWRhdGVcIixcbiAgXCJvcGVuXCIsXG4gIFwicGxheXNpbmxpbmVcIixcbiAgXCJyZWFkb25seVwiLFxuICBcInJlcXVpcmVkXCIsXG4gIFwicmV2ZXJzZWRcIixcbiAgXCJzZWxlY3RlZFwiLFxuICBcInNoYWRvd3Jvb3RjbG9uYWJsZVwiLFxuICBcInNoYWRvd3Jvb3RkZWxlZ2F0ZXNmb2N1c1wiLFxuICBcInNoYWRvd3Jvb3RzZXJpYWxpemFibGVcIlxuXSk7XG5mdW5jdGlvbiBpc0Jvb2xlYW5BdHRyKGF0dHJOYW1lKSB7XG4gIHJldHVybiBib29sZWFuQXR0cmlidXRlcy5oYXMoYXR0ck5hbWUpO1xufVxuZnVuY3Rpb24gYXR0cmlidXRlU2hvdWxkbnRCZVByZXNlcnZlZElmRmFsc3kobmFtZSkge1xuICByZXR1cm4gIVtcImFyaWEtcHJlc3NlZFwiLCBcImFyaWEtY2hlY2tlZFwiLCBcImFyaWEtZXhwYW5kZWRcIiwgXCJhcmlhLXNlbGVjdGVkXCJdLmluY2x1ZGVzKG5hbWUpO1xufVxuZnVuY3Rpb24gZ2V0QmluZGluZyhlbCwgbmFtZSwgZmFsbGJhY2spIHtcbiAgaWYgKGVsLl94X2JpbmRpbmdzICYmIGVsLl94X2JpbmRpbmdzW25hbWVdICE9PSB2b2lkIDApXG4gICAgcmV0dXJuIGVsLl94X2JpbmRpbmdzW25hbWVdO1xuICByZXR1cm4gZ2V0QXR0cmlidXRlQmluZGluZyhlbCwgbmFtZSwgZmFsbGJhY2spO1xufVxuZnVuY3Rpb24gZXh0cmFjdFByb3AoZWwsIG5hbWUsIGZhbGxiYWNrLCBleHRyYWN0ID0gdHJ1ZSkge1xuICBpZiAoZWwuX3hfYmluZGluZ3MgJiYgZWwuX3hfYmluZGluZ3NbbmFtZV0gIT09IHZvaWQgMClcbiAgICByZXR1cm4gZWwuX3hfYmluZGluZ3NbbmFtZV07XG4gIGlmIChlbC5feF9pbmxpbmVCaW5kaW5ncyAmJiBlbC5feF9pbmxpbmVCaW5kaW5nc1tuYW1lXSAhPT0gdm9pZCAwKSB7XG4gICAgbGV0IGJpbmRpbmcgPSBlbC5feF9pbmxpbmVCaW5kaW5nc1tuYW1lXTtcbiAgICBiaW5kaW5nLmV4dHJhY3QgPSBleHRyYWN0O1xuICAgIHJldHVybiBkb250QXV0b0V2YWx1YXRlRnVuY3Rpb25zKCgpID0+IHtcbiAgICAgIHJldHVybiBldmFsdWF0ZShlbCwgYmluZGluZy5leHByZXNzaW9uKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZ2V0QXR0cmlidXRlQmluZGluZyhlbCwgbmFtZSwgZmFsbGJhY2spO1xufVxuZnVuY3Rpb24gZ2V0QXR0cmlidXRlQmluZGluZyhlbCwgbmFtZSwgZmFsbGJhY2spIHtcbiAgbGV0IGF0dHIgPSBlbC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gIGlmIChhdHRyID09PSBudWxsKVxuICAgIHJldHVybiB0eXBlb2YgZmFsbGJhY2sgPT09IFwiZnVuY3Rpb25cIiA/IGZhbGxiYWNrKCkgOiBmYWxsYmFjaztcbiAgaWYgKGF0dHIgPT09IFwiXCIpXG4gICAgcmV0dXJuIHRydWU7XG4gIGlmIChpc0Jvb2xlYW5BdHRyKG5hbWUpKSB7XG4gICAgcmV0dXJuICEhW25hbWUsIFwidHJ1ZVwiXS5pbmNsdWRlcyhhdHRyKTtcbiAgfVxuICByZXR1cm4gYXR0cjtcbn1cbmZ1bmN0aW9uIGlzQ2hlY2tib3goZWwpIHtcbiAgcmV0dXJuIGVsLnR5cGUgPT09IFwiY2hlY2tib3hcIiB8fCBlbC5sb2NhbE5hbWUgPT09IFwidWktY2hlY2tib3hcIiB8fCBlbC5sb2NhbE5hbWUgPT09IFwidWktc3dpdGNoXCI7XG59XG5mdW5jdGlvbiBpc1JhZGlvKGVsKSB7XG4gIHJldHVybiBlbC50eXBlID09PSBcInJhZGlvXCIgfHwgZWwubG9jYWxOYW1lID09PSBcInVpLXJhZGlvXCI7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9kZWJvdW5jZS5qc1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCkge1xuICBsZXQgdGltZW91dDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgIGNvbnN0IGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICB9O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvdGhyb3R0bGUuanNcbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIGxpbWl0KSB7XG4gIGxldCBpblRocm90dGxlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgIGlmICghaW5UaHJvdHRsZSkge1xuICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGluVGhyb3R0bGUgPSB0cnVlO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiBpblRocm90dGxlID0gZmFsc2UsIGxpbWl0KTtcbiAgICB9XG4gIH07XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9lbnRhbmdsZS5qc1xuZnVuY3Rpb24gZW50YW5nbGUoeyBnZXQ6IG91dGVyR2V0LCBzZXQ6IG91dGVyU2V0IH0sIHsgZ2V0OiBpbm5lckdldCwgc2V0OiBpbm5lclNldCB9KSB7XG4gIGxldCBmaXJzdFJ1biA9IHRydWU7XG4gIGxldCBvdXRlckhhc2g7XG4gIGxldCBpbm5lckhhc2g7XG4gIGxldCByZWZlcmVuY2UgPSBlZmZlY3QoKCkgPT4ge1xuICAgIGxldCBvdXRlciA9IG91dGVyR2V0KCk7XG4gICAgbGV0IGlubmVyID0gaW5uZXJHZXQoKTtcbiAgICBpZiAoZmlyc3RSdW4pIHtcbiAgICAgIGlubmVyU2V0KGNsb25lSWZPYmplY3Qob3V0ZXIpKTtcbiAgICAgIGZpcnN0UnVuID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBvdXRlckhhc2hMYXRlc3QgPSBKU09OLnN0cmluZ2lmeShvdXRlcik7XG4gICAgICBsZXQgaW5uZXJIYXNoTGF0ZXN0ID0gSlNPTi5zdHJpbmdpZnkoaW5uZXIpO1xuICAgICAgaWYgKG91dGVySGFzaExhdGVzdCAhPT0gb3V0ZXJIYXNoKSB7XG4gICAgICAgIGlubmVyU2V0KGNsb25lSWZPYmplY3Qob3V0ZXIpKTtcbiAgICAgIH0gZWxzZSBpZiAob3V0ZXJIYXNoTGF0ZXN0ICE9PSBpbm5lckhhc2hMYXRlc3QpIHtcbiAgICAgICAgb3V0ZXJTZXQoY2xvbmVJZk9iamVjdChpbm5lcikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgIH1cbiAgICB9XG4gICAgb3V0ZXJIYXNoID0gSlNPTi5zdHJpbmdpZnkob3V0ZXJHZXQoKSk7XG4gICAgaW5uZXJIYXNoID0gSlNPTi5zdHJpbmdpZnkoaW5uZXJHZXQoKSk7XG4gIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHJlbGVhc2UocmVmZXJlbmNlKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGNsb25lSWZPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKSA6IHZhbHVlO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvcGx1Z2luLmpzXG5mdW5jdGlvbiBwbHVnaW4oY2FsbGJhY2spIHtcbiAgbGV0IGNhbGxiYWNrcyA9IEFycmF5LmlzQXJyYXkoY2FsbGJhY2spID8gY2FsbGJhY2sgOiBbY2FsbGJhY2tdO1xuICBjYWxsYmFja3MuZm9yRWFjaCgoaSkgPT4gaShhbHBpbmVfZGVmYXVsdCkpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvc3RvcmUuanNcbnZhciBzdG9yZXMgPSB7fTtcbnZhciBpc1JlYWN0aXZlID0gZmFsc2U7XG5mdW5jdGlvbiBzdG9yZShuYW1lLCB2YWx1ZSkge1xuICBpZiAoIWlzUmVhY3RpdmUpIHtcbiAgICBzdG9yZXMgPSByZWFjdGl2ZShzdG9yZXMpO1xuICAgIGlzUmVhY3RpdmUgPSB0cnVlO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIHN0b3Jlc1tuYW1lXTtcbiAgfVxuICBzdG9yZXNbbmFtZV0gPSB2YWx1ZTtcbiAgaW5pdEludGVyY2VwdG9ycyhzdG9yZXNbbmFtZV0pO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmhhc093blByb3BlcnR5KFwiaW5pdFwiKSAmJiB0eXBlb2YgdmFsdWUuaW5pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgc3RvcmVzW25hbWVdLmluaXQoKTtcbiAgfVxufVxuZnVuY3Rpb24gZ2V0U3RvcmVzKCkge1xuICByZXR1cm4gc3RvcmVzO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvYmluZHMuanNcbnZhciBiaW5kcyA9IHt9O1xuZnVuY3Rpb24gYmluZDIobmFtZSwgYmluZGluZ3MpIHtcbiAgbGV0IGdldEJpbmRpbmdzID0gdHlwZW9mIGJpbmRpbmdzICE9PSBcImZ1bmN0aW9uXCIgPyAoKSA9PiBiaW5kaW5ncyA6IGJpbmRpbmdzO1xuICBpZiAobmFtZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICByZXR1cm4gYXBwbHlCaW5kaW5nc09iamVjdChuYW1lLCBnZXRCaW5kaW5ncygpKTtcbiAgfSBlbHNlIHtcbiAgICBiaW5kc1tuYW1lXSA9IGdldEJpbmRpbmdzO1xuICB9XG4gIHJldHVybiAoKSA9PiB7XG4gIH07XG59XG5mdW5jdGlvbiBpbmplY3RCaW5kaW5nUHJvdmlkZXJzKG9iaikge1xuICBPYmplY3QuZW50cmllcyhiaW5kcykuZm9yRWFjaCgoW25hbWUsIGNhbGxiYWNrXSkgPT4ge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIGFwcGx5QmluZGluZ3NPYmplY3QoZWwsIG9iaiwgb3JpZ2luYWwpIHtcbiAgbGV0IGNsZWFudXBSdW5uZXJzID0gW107XG4gIHdoaWxlIChjbGVhbnVwUnVubmVycy5sZW5ndGgpXG4gICAgY2xlYW51cFJ1bm5lcnMucG9wKCkoKTtcbiAgbGV0IGF0dHJpYnV0ZXMgPSBPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHsgbmFtZSwgdmFsdWUgfSkpO1xuICBsZXQgc3RhdGljQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNPbmx5KGF0dHJpYnV0ZXMpO1xuICBhdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5tYXAoKGF0dHJpYnV0ZSkgPT4ge1xuICAgIGlmIChzdGF0aWNBdHRyaWJ1dGVzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gYXR0cmlidXRlLm5hbWUpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBgeC1iaW5kOiR7YXR0cmlidXRlLm5hbWV9YCxcbiAgICAgICAgdmFsdWU6IGBcIiR7YXR0cmlidXRlLnZhbHVlfVwiYFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfSk7XG4gIGRpcmVjdGl2ZXMoZWwsIGF0dHJpYnV0ZXMsIG9yaWdpbmFsKS5tYXAoKGhhbmRsZSkgPT4ge1xuICAgIGNsZWFudXBSdW5uZXJzLnB1c2goaGFuZGxlLnJ1bkNsZWFudXBzKTtcbiAgICBoYW5kbGUoKTtcbiAgfSk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgd2hpbGUgKGNsZWFudXBSdW5uZXJzLmxlbmd0aClcbiAgICAgIGNsZWFudXBSdW5uZXJzLnBvcCgpKCk7XG4gIH07XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kYXRhcy5qc1xudmFyIGRhdGFzID0ge307XG5mdW5jdGlvbiBkYXRhKG5hbWUsIGNhbGxiYWNrKSB7XG4gIGRhdGFzW25hbWVdID0gY2FsbGJhY2s7XG59XG5mdW5jdGlvbiBpbmplY3REYXRhUHJvdmlkZXJzKG9iaiwgY29udGV4dCkge1xuICBPYmplY3QuZW50cmllcyhkYXRhcykuZm9yRWFjaCgoW25hbWUsIGNhbGxiYWNrXSkgPT4ge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmJpbmQoY29udGV4dCkoLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9hbHBpbmUuanNcbnZhciBBbHBpbmUgPSB7XG4gIGdldCByZWFjdGl2ZSgpIHtcbiAgICByZXR1cm4gcmVhY3RpdmU7XG4gIH0sXG4gIGdldCByZWxlYXNlKCkge1xuICAgIHJldHVybiByZWxlYXNlO1xuICB9LFxuICBnZXQgZWZmZWN0KCkge1xuICAgIHJldHVybiBlZmZlY3Q7XG4gIH0sXG4gIGdldCByYXcoKSB7XG4gICAgcmV0dXJuIHJhdztcbiAgfSxcbiAgdmVyc2lvbjogXCIzLjE1LjFcIixcbiAgZmx1c2hBbmRTdG9wRGVmZXJyaW5nTXV0YXRpb25zLFxuICBkb250QXV0b0V2YWx1YXRlRnVuY3Rpb25zLFxuICBkaXNhYmxlRWZmZWN0U2NoZWR1bGluZyxcbiAgc3RhcnRPYnNlcnZpbmdNdXRhdGlvbnMsXG4gIHN0b3BPYnNlcnZpbmdNdXRhdGlvbnMsXG4gIHNldFJlYWN0aXZpdHlFbmdpbmUsXG4gIG9uQXR0cmlidXRlUmVtb3ZlZCxcbiAgb25BdHRyaWJ1dGVzQWRkZWQsXG4gIGNsb3Nlc3REYXRhU3RhY2ssXG4gIHNraXBEdXJpbmdDbG9uZSxcbiAgb25seUR1cmluZ0Nsb25lLFxuICBhZGRSb290U2VsZWN0b3IsXG4gIGFkZEluaXRTZWxlY3RvcixcbiAgaW50ZXJjZXB0Q2xvbmUsXG4gIGFkZFNjb3BlVG9Ob2RlLFxuICBkZWZlck11dGF0aW9ucyxcbiAgbWFwQXR0cmlidXRlcyxcbiAgZXZhbHVhdGVMYXRlcixcbiAgaW50ZXJjZXB0SW5pdCxcbiAgc2V0RXZhbHVhdG9yLFxuICBtZXJnZVByb3hpZXMsXG4gIGV4dHJhY3RQcm9wLFxuICBmaW5kQ2xvc2VzdCxcbiAgb25FbFJlbW92ZWQsXG4gIGNsb3Nlc3RSb290LFxuICBkZXN0cm95VHJlZSxcbiAgaW50ZXJjZXB0b3IsXG4gIC8vIElOVEVSTkFMOiBub3QgcHVibGljIEFQSSBhbmQgaXMgc3ViamVjdCB0byBjaGFuZ2Ugd2l0aG91dCBtYWpvciByZWxlYXNlLlxuICB0cmFuc2l0aW9uLFxuICAvLyBJTlRFUk5BTFxuICBzZXRTdHlsZXMsXG4gIC8vIElOVEVSTkFMXG4gIG11dGF0ZURvbSxcbiAgZGlyZWN0aXZlLFxuICBlbnRhbmdsZSxcbiAgdGhyb3R0bGUsXG4gIGRlYm91bmNlLFxuICBldmFsdWF0ZSxcbiAgaW5pdFRyZWUsXG4gIG5leHRUaWNrLFxuICBwcmVmaXhlZDogcHJlZml4LFxuICBwcmVmaXg6IHNldFByZWZpeCxcbiAgcGx1Z2luLFxuICBtYWdpYyxcbiAgc3RvcmUsXG4gIHN0YXJ0LFxuICBjbG9uZSxcbiAgLy8gSU5URVJOQUxcbiAgY2xvbmVOb2RlLFxuICAvLyBJTlRFUk5BTFxuICBib3VuZDogZ2V0QmluZGluZyxcbiAgJGRhdGE6IHNjb3BlLFxuICB3YXRjaCxcbiAgd2FsayxcbiAgZGF0YSxcbiAgYmluZDogYmluZDJcbn07XG52YXIgYWxwaW5lX2RlZmF1bHQgPSBBbHBpbmU7XG5cbi8vIHBhY2thZ2VzL2NzcC9zcmMvcGFyc2VyLmpzXG52YXIgVG9rZW4gPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIHZhbHVlLCBzdGFydDIsIGVuZCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDI7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gIH1cbn07XG52YXIgVG9rZW5pemVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpbnB1dCkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICB0aGlzLnRva2VucyA9IFtdO1xuICB9XG4gIHRva2VuaXplKCkge1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2tpcFdoaXRlc3BhY2UoKTtcbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uID49IHRoaXMuaW5wdXQubGVuZ3RoKVxuICAgICAgICBicmVhaztcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHRoaXMuaXNEaWdpdChjaGFyKSkge1xuICAgICAgICB0aGlzLnJlYWROdW1iZXIoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0FscGhhKGNoYXIpIHx8IGNoYXIgPT09IFwiX1wiIHx8IGNoYXIgPT09IFwiJFwiKSB7XG4gICAgICAgIHRoaXMucmVhZElkZW50aWZpZXJPcktleXdvcmQoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIikge1xuICAgICAgICB0aGlzLnJlYWRTdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCIvXCIgJiYgdGhpcy5wZWVrKCkgPT09IFwiL1wiKSB7XG4gICAgICAgIHRoaXMuc2tpcExpbmVDb21tZW50KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWRPcGVyYXRvck9yUHVuY3R1YXRpb24oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJFT0ZcIiwgbnVsbCwgdGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIHJldHVybiB0aGlzLnRva2VucztcbiAgfVxuICBza2lwV2hpdGVzcGFjZSgpIHtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoICYmIC9cXHMvLnRlc3QodGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXSkpIHtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9XG4gIH1cbiAgc2tpcExpbmVDb21tZW50KCkge1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGggJiYgdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXSAhPT0gXCJcXG5cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIH1cbiAgfVxuICBpc0RpZ2l0KGNoYXIpIHtcbiAgICByZXR1cm4gL1swLTldLy50ZXN0KGNoYXIpO1xuICB9XG4gIGlzQWxwaGEoY2hhcikge1xuICAgIHJldHVybiAvW2EtekEtWl0vLnRlc3QoY2hhcik7XG4gIH1cbiAgaXNBbHBoYU51bWVyaWMoY2hhcikge1xuICAgIHJldHVybiAvW2EtekEtWjAtOV8kXS8udGVzdChjaGFyKTtcbiAgfVxuICBwZWVrKG9mZnNldCA9IDEpIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uICsgb2Zmc2V0XSB8fCBcIlwiO1xuICB9XG4gIHJlYWROdW1iZXIoKSB7XG4gICAgY29uc3Qgc3RhcnQyID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgaGFzRGVjaW1hbCA9IGZhbHNlO1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHRoaXMuaXNEaWdpdChjaGFyKSkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiLlwiICYmICFoYXNEZWNpbWFsKSB7XG4gICAgICAgIGhhc0RlY2ltYWwgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0MiwgdGhpcy5wb3NpdGlvbik7XG4gICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJOVU1CRVJcIiwgcGFyc2VGbG9hdCh2YWx1ZSksIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICB9XG4gIHJlYWRJZGVudGlmaWVyT3JLZXl3b3JkKCkge1xuICAgIGNvbnN0IHN0YXJ0MiA9IHRoaXMucG9zaXRpb247XG4gICAgd2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmlucHV0Lmxlbmd0aCAmJiB0aGlzLmlzQWxwaGFOdW1lcmljKHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl0pKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dC5zbGljZShzdGFydDIsIHRoaXMucG9zaXRpb24pO1xuICAgIGNvbnN0IGtleXdvcmRzID0gW1widHJ1ZVwiLCBcImZhbHNlXCIsIFwibnVsbFwiLCBcInVuZGVmaW5lZFwiLCBcIm5ld1wiLCBcInR5cGVvZlwiLCBcInZvaWRcIiwgXCJkZWxldGVcIiwgXCJpblwiLCBcImluc3RhbmNlb2ZcIl07XG4gICAgaWYgKGtleXdvcmRzLmluY2x1ZGVzKHZhbHVlKSkge1xuICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiQk9PTEVBTlwiLCB2YWx1ZSA9PT0gXCJ0cnVlXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJOVUxMXCIsIG51bGwsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIlVOREVGSU5FRFwiLCB2b2lkIDAsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJLRVlXT1JEXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJJREVOVElGSUVSXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9XG4gIH1cbiAgcmVhZFN0cmluZygpIHtcbiAgICBjb25zdCBzdGFydDIgPSB0aGlzLnBvc2l0aW9uO1xuICAgIGNvbnN0IHF1b3RlID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgbGV0IHZhbHVlID0gXCJcIjtcbiAgICBsZXQgZXNjYXBlZCA9IGZhbHNlO1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgY2FzZSBcIm5cIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXFxuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgdmFsdWUgKz0gXCJcdFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXFxyXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiXFxcXFwiOlxuICAgICAgICAgICAgdmFsdWUgKz0gXCJcXFxcXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIHF1b3RlOlxuICAgICAgICAgICAgdmFsdWUgKz0gcXVvdGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsdWUgKz0gY2hhcjtcbiAgICAgICAgfVxuICAgICAgICBlc2NhcGVkID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09PSBxdW90ZSkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiU1RSSU5HXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgKz0gY2hhcjtcbiAgICAgIH1cbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnRlcm1pbmF0ZWQgc3RyaW5nIHN0YXJ0aW5nIGF0IHBvc2l0aW9uICR7c3RhcnQyfWApO1xuICB9XG4gIHJlYWRPcGVyYXRvck9yUHVuY3R1YXRpb24oKSB7XG4gICAgY29uc3Qgc3RhcnQyID0gdGhpcy5wb3NpdGlvbjtcbiAgICBjb25zdCBjaGFyID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICBjb25zdCBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgY29uc3QgbmV4dE5leHQgPSB0aGlzLnBlZWsoMik7XG4gICAgaWYgKGNoYXIgPT09IFwiPVwiICYmIG5leHQgPT09IFwiPVwiICYmIG5leHROZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAzO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIj09PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiIVwiICYmIG5leHQgPT09IFwiPVwiICYmIG5leHROZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAzO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiE9PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiPVwiICYmIG5leHQgPT09IFwiPVwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiPT1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIiFcIiAmJiBuZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiE9XCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCI8XCIgJiYgbmV4dCA9PT0gXCI9XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCI8PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiPlwiICYmIG5leHQgPT09IFwiPVwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiPj1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIiZcIiAmJiBuZXh0ID09PSBcIiZcIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiYmXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCJ8XCIgJiYgbmV4dCA9PT0gXCJ8XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCJ8fFwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiK1wiICYmIG5leHQgPT09IFwiK1wiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiKytcIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIi1cIiAmJiBuZXh0ID09PSBcIi1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIi0tXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICBjb25zdCB0eXBlID0gXCIoKVtde30sLjs6P1wiLmluY2x1ZGVzKGNoYXIpID8gXCJQVU5DVFVBVElPTlwiIDogXCJPUEVSQVRPUlwiO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4odHlwZSwgY2hhciwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfVxuICB9XG59O1xudmFyIFBhcnNlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodG9rZW5zKSB7XG4gICAgdGhpcy50b2tlbnMgPSB0b2tlbnM7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cbiAgcGFyc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNBdEVuZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbXB0eSBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICB0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCI7XCIpO1xuICAgIGlmICghdGhpcy5pc0F0RW5kKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCB0b2tlbjogJHt0aGlzLmN1cnJlbnQoKS52YWx1ZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlQXNzaWdubWVudCgpO1xuICB9XG4gIHBhcnNlQXNzaWdubWVudCgpIHtcbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZVRlcm5hcnkoKTtcbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPVwiKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBhcnNlQXNzaWdubWVudCgpO1xuICAgICAgaWYgKGV4cHIudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgfHwgZXhwci50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IFwiQXNzaWdubWVudEV4cHJlc3Npb25cIixcbiAgICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICAgIG9wZXJhdG9yOiBcIj1cIixcbiAgICAgICAgICByaWdodDogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYXNzaWdubWVudCB0YXJnZXRcIik7XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlVGVybmFyeSgpIHtcbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZUxvZ2ljYWxPcigpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCI/XCIpKSB7XG4gICAgICBjb25zdCBjb25zZXF1ZW50ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiOlwiKTtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0OiBleHByLFxuICAgICAgICBjb25zZXF1ZW50LFxuICAgICAgICBhbHRlcm5hdGVcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlTG9naWNhbE9yKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZUxvZ2ljYWxBbmQoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwifHxcIikpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlTG9naWNhbEFuZCgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VMb2dpY2FsQW5kKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZUVxdWFsaXR5KCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIiYmXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUVxdWFsaXR5KCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZUVxdWFsaXR5KCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVJlbGF0aW9uYWwoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPT1cIiwgXCIhPVwiLCBcIj09PVwiLCBcIiE9PVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VSZWxhdGlvbmFsKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZVJlbGF0aW9uYWwoKSB7XG4gICAgbGV0IGV4cHIgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPFwiLCBcIj5cIiwgXCI8PVwiLCBcIj49XCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZUFkZGl0aXZlKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIitcIiwgXCItXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZU11bHRpcGxpY2F0aXZlKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIipcIiwgXCIvXCIsIFwiJVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VVbmFyeSgpIHtcbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiKytcIiwgXCItLVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCBhcmd1bWVudCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBhcmd1bWVudCxcbiAgICAgICAgcHJlZml4OiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiIVwiLCBcIi1cIiwgXCIrXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IGFyZ3VtZW50ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgYXJndW1lbnQsXG4gICAgICAgIHByZWZpeDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2VQb3N0Zml4KCk7XG4gIH1cbiAgcGFyc2VQb3N0Zml4KCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZU1lbWJlcigpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwiT1BFUkFUT1JcIiwgXCIrK1wiLCBcIi0tXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiVXBkYXRlRXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgYXJndW1lbnQ6IGV4cHIsXG4gICAgICAgIHByZWZpeDogZmFsc2VcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlTWVtYmVyKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVByaW1hcnkoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIi5cIikpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN1bWUoXCJJREVOVElGSUVSXCIpO1xuICAgICAgICBleHByID0ge1xuICAgICAgICAgIHR5cGU6IFwiTWVtYmVyRXhwcmVzc2lvblwiLFxuICAgICAgICAgIG9iamVjdDogZXhwcixcbiAgICAgICAgICBwcm9wZXJ0eTogeyB0eXBlOiBcIklkZW50aWZpZXJcIiwgbmFtZTogcHJvcGVydHkudmFsdWUgfSxcbiAgICAgICAgICBjb21wdXRlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiW1wiKSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKTtcbiAgICAgICAgZXhwciA9IHtcbiAgICAgICAgICB0eXBlOiBcIk1lbWJlckV4cHJlc3Npb25cIixcbiAgICAgICAgICBvYmplY3Q6IGV4cHIsXG4gICAgICAgICAgcHJvcGVydHksXG4gICAgICAgICAgY29tcHV0ZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiKFwiKSkge1xuICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgICAgICBleHByID0ge1xuICAgICAgICAgIHR5cGU6IFwiQ2FsbEV4cHJlc3Npb25cIixcbiAgICAgICAgICBjYWxsZWU6IGV4cHIsXG4gICAgICAgICAgYXJndW1lbnRzOiBhcmdzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VBcmd1bWVudHMoKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmICghdGhpcy5jaGVjayhcIlBVTkNUVUFUSU9OXCIsIFwiKVwiKSkge1xuICAgICAgZG8ge1xuICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHJlc3Npb24oKSk7XG4gICAgICB9IHdoaWxlICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIsXCIpKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKFwiUFVOQ1RVQVRJT05cIiwgXCIpXCIpO1xuICAgIHJldHVybiBhcmdzO1xuICB9XG4gIHBhcnNlUHJpbWFyeSgpIHtcbiAgICBpZiAodGhpcy5tYXRjaChcIk5VTUJFUlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJMaXRlcmFsXCIsIHZhbHVlOiB0aGlzLnByZXZpb3VzKCkudmFsdWUgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJTVFJJTkdcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiQk9PTEVBTlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJMaXRlcmFsXCIsIHZhbHVlOiB0aGlzLnByZXZpb3VzKCkudmFsdWUgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJOVUxMXCIpKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkxpdGVyYWxcIiwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJVTkRFRklORURcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdm9pZCAwIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiSURFTlRJRklFUlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJJZGVudGlmaWVyXCIsIG5hbWU6IHRoaXMucHJldmlvdXMoKS52YWx1ZSB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiKFwiKSkge1xuICAgICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIilcIik7XG4gICAgICByZXR1cm4gZXhwcjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIltcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlQXJyYXlMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCJ7XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZU9iamVjdExpdGVyYWwoKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHRva2VuOiAke3RoaXMuY3VycmVudCgpLnR5cGV9IFwiJHt0aGlzLmN1cnJlbnQoKS52YWx1ZX1cImApO1xuICB9XG4gIHBhcnNlQXJyYXlMaXRlcmFsKCkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gW107XG4gICAgd2hpbGUgKCF0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJdXCIpICYmICF0aGlzLmlzQXRFbmQoKSkge1xuICAgICAgZWxlbWVudHMucHVzaCh0aGlzLnBhcnNlRXhwcmVzc2lvbigpKTtcbiAgICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIsXCIpKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJdXCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIl1cIik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiQXJyYXlFeHByZXNzaW9uXCIsXG4gICAgICBlbGVtZW50c1xuICAgIH07XG4gIH1cbiAgcGFyc2VPYmplY3RMaXRlcmFsKCkge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBbXTtcbiAgICB3aGlsZSAoIXRoaXMuY2hlY2soXCJQVU5DVFVBVElPTlwiLCBcIn1cIikgJiYgIXRoaXMuaXNBdEVuZCgpKSB7XG4gICAgICBsZXQga2V5O1xuICAgICAgbGV0IGNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5tYXRjaChcIlNUUklOR1wiKSkge1xuICAgICAgICBrZXkgPSB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWF0Y2goXCJJREVOVElGSUVSXCIpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICAgIGtleSA9IHsgdHlwZTogXCJJZGVudGlmaWVyXCIsIG5hbWUgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiW1wiKSkge1xuICAgICAgICBrZXkgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICBjb21wdXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIHByb3BlcnR5IGtleVwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiOlwiKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIHR5cGU6IFwiUHJvcGVydHlcIixcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgY29tcHV0ZWQsXG4gICAgICAgIHNob3J0aGFuZDogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIixcIikpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2soXCJQVU5DVFVBVElPTlwiLCBcIn1cIikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwifVwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJPYmplY3RFeHByZXNzaW9uXCIsXG4gICAgICBwcm9wZXJ0aWVzXG4gICAgfTtcbiAgfVxuICBtYXRjaCguLi5hcmdzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhcmcgPSBhcmdzW2ldO1xuICAgICAgaWYgKGkgPT09IDAgJiYgYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBhcmc7XG4gICAgICAgIGZvciAobGV0IGogPSAxOyBqIDwgYXJncy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLmNoZWNrKHR5cGUsIGFyZ3Nbal0pKSB7XG4gICAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrVHlwZShhcmcpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2hlY2sodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodGhpcy5pc0F0RW5kKCkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQoKS50eXBlID09PSB0eXBlICYmIHRoaXMuY3VycmVudCgpLnZhbHVlID09PSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudCgpLnR5cGUgPT09IHR5cGU7XG4gIH1cbiAgY2hlY2tUeXBlKHR5cGUpIHtcbiAgICBpZiAodGhpcy5pc0F0RW5kKCkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudCgpLnR5cGUgPT09IHR5cGU7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNBdEVuZCgpKVxuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIHJldHVybiB0aGlzLnByZXZpb3VzKCk7XG4gIH1cbiAgaXNBdEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50KCkudHlwZSA9PT0gXCJFT0ZcIjtcbiAgfVxuICBjdXJyZW50KCkge1xuICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXTtcbiAgfVxuICBwcmV2aW91cygpIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiAtIDFdO1xuICB9XG4gIGNvbnN1bWUodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgaWYgKHRoaXMuY2hlY2sodHlwZSwgdmFsdWUpKVxuICAgICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICR7dHlwZX0gXCIke3ZhbHVlfVwiIGJ1dCBnb3QgJHt0aGlzLmN1cnJlbnQoKS50eXBlfSBcIiR7dGhpcy5jdXJyZW50KCkudmFsdWV9XCJgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hlY2sodHlwZSkpXG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAke3R5cGV9IGJ1dCBnb3QgJHt0aGlzLmN1cnJlbnQoKS50eXBlfSBcIiR7dGhpcy5jdXJyZW50KCkudmFsdWV9XCJgKTtcbiAgfVxufTtcbnZhciBFdmFsdWF0b3IgPSBjbGFzcyB7XG4gIGV2YWx1YXRlKHsgbm9kZSwgc2NvcGU6IHNjb3BlMiA9IHt9LCBjb250ZXh0ID0gbnVsbCwgYWxsb3dHbG9iYWwgPSBmYWxzZSwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgPSB0cnVlIH0pIHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSBcIkxpdGVyYWxcIjpcbiAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gICAgICBjYXNlIFwiSWRlbnRpZmllclwiOlxuICAgICAgICBpZiAobm9kZS5uYW1lIGluIHNjb3BlMikge1xuICAgICAgICAgIGNvbnN0IHZhbHVlMiA9IHNjb3BlMltub2RlLm5hbWVdO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTIuYmluZChzY29wZTIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFsdWUyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbGxvd0dsb2JhbCAmJiB0eXBlb2YgZ2xvYmFsVGhpc1tub2RlLm5hbWVdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUyID0gZ2xvYmFsVGhpc1tub2RlLm5hbWVdO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTIuYmluZChnbG9iYWxUaGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlMjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCB2YXJpYWJsZTogJHtub2RlLm5hbWV9YCk7XG4gICAgICBjYXNlIFwiTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBvYmplY3QgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlYWQgcHJvcGVydHkgb2YgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1lbWJlclZhbHVlO1xuICAgICAgICBpZiAobm9kZS5jb21wdXRlZCkge1xuICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICBtZW1iZXJWYWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVtYmVyVmFsdWUgPSBvYmplY3Rbbm9kZS5wcm9wZXJ0eS5uYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG1lbWJlclZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBpZiAoZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZS5iaW5kKHNjb3BlMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZS5iaW5kKG9iamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZTtcbiAgICAgIGNhc2UgXCJDYWxsRXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBhcmdzID0gbm9kZS5hcmd1bWVudHMubWFwKChhcmcpID0+IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBhcmcsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSk7XG4gICAgICAgIGlmIChub2RlLmNhbGxlZS50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmNhbGxlZS5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICBsZXQgZnVuYztcbiAgICAgICAgICBpZiAobm9kZS5jYWxsZWUuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3AgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jYWxsZWUucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICAgIGZ1bmMgPSBvYmpbcHJvcF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZ1bmMgPSBvYmpbbm9kZS5jYWxsZWUucHJvcGVydHkubmFtZV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLmNhbGxlZS5uYW1lO1xuICAgICAgICAgICAgbGV0IGZ1bmM7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiBzY29wZTIpIHtcbiAgICAgICAgICAgICAgZnVuYyA9IHNjb3BlMltuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsb3dHbG9iYWwgJiYgdHlwZW9mIGdsb2JhbFRoaXNbbmFtZV0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgZnVuYyA9IGdsb2JhbFRoaXNbbmFtZV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCB2YXJpYWJsZTogJHtuYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0aGlzQ29udGV4dCA9IGNvbnRleHQgIT09IG51bGwgPyBjb250ZXh0IDogc2NvcGUyO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpc0NvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsZWUgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jYWxsZWUsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2FsbGVlLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgY2FzZSBcIlVuYXJ5RXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBhcmd1bWVudCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmFyZ3VtZW50LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIHN3aXRjaCAobm9kZS5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgXCIhXCI6XG4gICAgICAgICAgICByZXR1cm4gIWFyZ3VtZW50O1xuICAgICAgICAgIGNhc2UgXCItXCI6XG4gICAgICAgICAgICByZXR1cm4gLWFyZ3VtZW50O1xuICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICByZXR1cm4gK2FyZ3VtZW50O1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdW5hcnkgb3BlcmF0b3I6ICR7bm9kZS5vcGVyYXRvcn1gKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIlVwZGF0ZUV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKG5vZGUuYXJndW1lbnQudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gbm9kZS5hcmd1bWVudC5uYW1lO1xuICAgICAgICAgIGlmICghKG5hbWUgaW4gc2NvcGUyKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgdmFyaWFibGU6ICR7bmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBzY29wZTJbbmFtZV07XG4gICAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiKytcIikge1xuICAgICAgICAgICAgc2NvcGUyW25hbWVdID0gb2xkVmFsdWUgKyAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5vcGVyYXRvciA9PT0gXCItLVwiKSB7XG4gICAgICAgICAgICBzY29wZTJbbmFtZV0gPSBvbGRWYWx1ZSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub2RlLnByZWZpeCA/IHNjb3BlMltuYW1lXSA6IG9sZFZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuYXJndW1lbnQudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgICBjb25zdCBvYmogPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hcmd1bWVudC5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICBjb25zdCBwcm9wID0gbm9kZS5hcmd1bWVudC5jb21wdXRlZCA/IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmFyZ3VtZW50LnByb3BlcnR5LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkgOiBub2RlLmFyZ3VtZW50LnByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvYmpbcHJvcF07XG4gICAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiKytcIikge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gb2xkVmFsdWUgKyAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5vcGVyYXRvciA9PT0gXCItLVwiKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBvbGRWYWx1ZSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub2RlLnByZWZpeCA/IG9ialtwcm9wXSA6IG9sZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdXBkYXRlIGV4cHJlc3Npb24gdGFyZ2V0XCIpO1xuICAgICAgY2FzZSBcIkJpbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmxlZnQsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5yaWdodCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgYWxsb3dHbG9iYWwsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICBzd2l0Y2ggKG5vZGUub3BlcmF0b3IpIHtcbiAgICAgICAgICBjYXNlIFwiK1wiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgKyByaWdodDtcbiAgICAgICAgICBjYXNlIFwiLVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgLSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiKlwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgKiByaWdodDtcbiAgICAgICAgICBjYXNlIFwiL1wiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgLyByaWdodDtcbiAgICAgICAgICBjYXNlIFwiJVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgJSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPT1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCIhPVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIj09PVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCIhPT1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9PSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPCByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPiByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPD1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0IDw9IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI+PVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPj0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIiYmXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAmJiByaWdodDtcbiAgICAgICAgICBjYXNlIFwifHxcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0IHx8IHJpZ2h0O1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gYmluYXJ5IG9wZXJhdG9yOiAke25vZGUub3BlcmF0b3J9YCk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgdGVzdCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLnRlc3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgcmV0dXJuIHRlc3QgPyB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jb25zZXF1ZW50LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkgOiB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hbHRlcm5hdGUsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLnJpZ2h0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIGlmIChub2RlLmxlZnQudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICBzY29wZTJbbm9kZS5sZWZ0Lm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUubGVmdC50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmxlZnQub2JqZWN0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgaWYgKG5vZGUubGVmdC5jb21wdXRlZCkge1xuICAgICAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmxlZnQucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvYmpbbm9kZS5sZWZ0LnByb3BlcnR5Lm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFzc2lnbm1lbnQgdGFyZ2V0XCIpO1xuICAgICAgY2FzZSBcIkFycmF5RXhwcmVzc2lvblwiOlxuICAgICAgICByZXR1cm4gbm9kZS5lbGVtZW50cy5tYXAoKGVsKSA9PiB0aGlzLmV2YWx1YXRlKHsgbm9kZTogZWwsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSk7XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIG5vZGUucHJvcGVydGllcykge1xuICAgICAgICAgIGNvbnN0IGtleSA9IHByb3AuY29tcHV0ZWQgPyB0aGlzLmV2YWx1YXRlKHsgbm9kZTogcHJvcC5rZXksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGFsbG93R2xvYmFsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSA6IHByb3Aua2V5LnR5cGUgPT09IFwiSWRlbnRpZmllclwiID8gcHJvcC5rZXkubmFtZSA6IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBwcm9wLmtleSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgYWxsb3dHbG9iYWwsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgIGNvbnN0IHZhbHVlMiA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBwcm9wLnZhbHVlLCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBhbGxvd0dsb2JhbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBub2RlIHR5cGU6ICR7bm9kZS50eXBlfWApO1xuICAgIH1cbiAgfVxufTtcbmZ1bmN0aW9uIGdlbmVyYXRlUnVudGltZUZ1bmN0aW9uKGV4cHJlc3Npb24pIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHRva2VucyA9IHRva2VuaXplci50b2tlbml6ZSgpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIodG9rZW5zKTtcbiAgICBjb25zdCBhc3QgPSBwYXJzZXIucGFyc2UoKTtcbiAgICBjb25zdCBldmFsdWF0b3IgPSBuZXcgRXZhbHVhdG9yKCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMgPSB7fSkge1xuICAgICAgY29uc3QgeyBzY29wZTogc2NvcGUyID0ge30sIGNvbnRleHQgPSBudWxsLCBhbGxvd0dsb2JhbCA9IGZhbHNlLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyA9IGZhbHNlIH0gPSBvcHRpb25zO1xuICAgICAgcmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZSh7IG5vZGU6IGFzdCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgYWxsb3dHbG9iYWwsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yMikge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ1NQIFBhcnNlciBFcnJvcjogJHtlcnJvcjIubWVzc2FnZX1gKTtcbiAgfVxufVxuXG4vLyBwYWNrYWdlcy9jc3Avc3JjL2V2YWx1YXRvci5qc1xuZnVuY3Rpb24gY3NwRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uKSB7XG4gIGxldCBkYXRhU3RhY2sgPSBnZW5lcmF0ZURhdGFTdGFjayhlbCk7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlRXZhbHVhdG9yRnJvbUZ1bmN0aW9uKGRhdGFTdGFjaywgZXhwcmVzc2lvbik7XG4gIH1cbiAgbGV0IGV2YWx1YXRvciA9IGdlbmVyYXRlRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uLCBkYXRhU3RhY2spO1xuICByZXR1cm4gdHJ5Q2F0Y2guYmluZChudWxsLCBlbCwgZXhwcmVzc2lvbiwgZXZhbHVhdG9yKTtcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRGF0YVN0YWNrKGVsKSB7XG4gIGxldCBvdmVycmlkZGVuTWFnaWNzID0ge307XG4gIGluamVjdE1hZ2ljcyhvdmVycmlkZGVuTWFnaWNzLCBlbCk7XG4gIHJldHVybiBbb3ZlcnJpZGRlbk1hZ2ljcywgLi4uY2xvc2VzdERhdGFTdGFjayhlbCldO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVFdmFsdWF0b3IoZWwsIGV4cHJlc3Npb24sIGRhdGFTdGFjaykge1xuICByZXR1cm4gKHJlY2VpdmVyID0gKCkgPT4ge1xuICB9LCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgcGFyYW1zID0gW10gfSA9IHt9KSA9PiB7XG4gICAgbGV0IGNvbXBsZXRlU2NvcGUgPSBtZXJnZVByb3hpZXMoW3Njb3BlMiwgLi4uZGF0YVN0YWNrXSk7XG4gICAgbGV0IGV2YWx1YXRlMiA9IGdlbmVyYXRlUnVudGltZUZ1bmN0aW9uKGV4cHJlc3Npb24pO1xuICAgIGxldCByZXR1cm5WYWx1ZSA9IGV2YWx1YXRlMih7XG4gICAgICBzY29wZTogY29tcGxldGVTY29wZSxcbiAgICAgIGFsbG93R2xvYmFsOiBmYWxzZSxcbiAgICAgIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyAmJiB0eXBlb2YgcmV0dXJuVmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgbGV0IG5leHRSZXR1cm5WYWx1ZSA9IHJldHVyblZhbHVlLmFwcGx5KHJldHVyblZhbHVlLCBwYXJhbXMpO1xuICAgICAgaWYgKG5leHRSZXR1cm5WYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgbmV4dFJldHVyblZhbHVlLnRoZW4oKGkpID0+IHJlY2VpdmVyKGkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlY2VpdmVyKG5leHRSZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmV0dXJuVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgcmV0dXJuVmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXR1cm5WYWx1ZS50aGVuKChpKSA9PiByZWNlaXZlcihpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY2VpdmVyKHJldHVyblZhbHVlKTtcbiAgICB9XG4gIH07XG59XG5cbi8vIG5vZGVfbW9kdWxlcy9AdnVlL3NoYXJlZC9kaXN0L3NoYXJlZC5lc20tYnVuZGxlci5qc1xuZnVuY3Rpb24gbWFrZU1hcChzdHIsIGV4cGVjdHNMb3dlckNhc2UpIHtcbiAgY29uc3QgbWFwID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGNvbnN0IGxpc3QgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlO1xuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlID8gKHZhbCkgPT4gISFtYXBbdmFsLnRvTG93ZXJDYXNlKCldIDogKHZhbCkgPT4gISFtYXBbdmFsXTtcbn1cbnZhciBzcGVjaWFsQm9vbGVhbkF0dHJzID0gYGl0ZW1zY29wZSxhbGxvd2Z1bGxzY3JlZW4sZm9ybW5vdmFsaWRhdGUsaXNtYXAsbm9tb2R1bGUsbm92YWxpZGF0ZSxyZWFkb25seWA7XG52YXIgaXNCb29sZWFuQXR0cjIgPSAvKiBAX19QVVJFX18gKi8gbWFrZU1hcChzcGVjaWFsQm9vbGVhbkF0dHJzICsgYCxhc3luYyxhdXRvZm9jdXMsYXV0b3BsYXksY29udHJvbHMsZGVmYXVsdCxkZWZlcixkaXNhYmxlZCxoaWRkZW4sbG9vcCxvcGVuLHJlcXVpcmVkLHJldmVyc2VkLHNjb3BlZCxzZWFtbGVzcyxjaGVja2VkLG11dGVkLG11bHRpcGxlLHNlbGVjdGVkYCk7XG52YXIgRU1QVFlfT0JKID0gdHJ1ZSA/IE9iamVjdC5mcmVlemUoe30pIDoge307XG52YXIgRU1QVFlfQVJSID0gdHJ1ZSA/IE9iamVjdC5mcmVlemUoW10pIDogW107XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIGhhc093biA9ICh2YWwsIGtleSkgPT4gaGFzT3duUHJvcGVydHkuY2FsbCh2YWwsIGtleSk7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG52YXIgaXNNYXAgPSAodmFsKSA9PiB0b1R5cGVTdHJpbmcodmFsKSA9PT0gXCJbb2JqZWN0IE1hcF1cIjtcbnZhciBpc1N0cmluZyA9ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCI7XG52YXIgaXNTeW1ib2wgPSAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcInN5bWJvbFwiO1xudmFyIGlzT2JqZWN0ID0gKHZhbCkgPT4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCI7XG52YXIgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIHRvVHlwZVN0cmluZyA9ICh2YWx1ZSkgPT4gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG52YXIgdG9SYXdUeXBlID0gKHZhbHVlKSA9PiB7XG4gIHJldHVybiB0b1R5cGVTdHJpbmcodmFsdWUpLnNsaWNlKDgsIC0xKTtcbn07XG52YXIgaXNJbnRlZ2VyS2V5ID0gKGtleSkgPT4gaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09IFwiTmFOXCIgJiYga2V5WzBdICE9PSBcIi1cIiAmJiBcIlwiICsgcGFyc2VJbnQoa2V5LCAxMCkgPT09IGtleTtcbnZhciBjYWNoZVN0cmluZ0Z1bmN0aW9uID0gKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHJldHVybiAoc3RyKSA9PiB7XG4gICAgY29uc3QgaGl0ID0gY2FjaGVbc3RyXTtcbiAgICByZXR1cm4gaGl0IHx8IChjYWNoZVtzdHJdID0gZm4oc3RyKSk7XG4gIH07XG59O1xudmFyIGNhbWVsaXplUkUgPSAvLShcXHcpL2c7XG52YXIgY2FtZWxpemUgPSBjYWNoZVN0cmluZ0Z1bmN0aW9uKChzdHIpID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogXCJcIik7XG59KTtcbnZhciBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2c7XG52YXIgaHlwaGVuYXRlID0gY2FjaGVTdHJpbmdGdW5jdGlvbigoc3RyKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgXCItJDFcIikudG9Mb3dlckNhc2UoKSk7XG52YXIgY2FwaXRhbGl6ZSA9IGNhY2hlU3RyaW5nRnVuY3Rpb24oKHN0cikgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpKTtcbnZhciB0b0hhbmRsZXJLZXkgPSBjYWNoZVN0cmluZ0Z1bmN0aW9uKChzdHIpID0+IHN0ciA/IGBvbiR7Y2FwaXRhbGl6ZShzdHIpfWAgOiBgYCk7XG52YXIgaGFzQ2hhbmdlZCA9ICh2YWx1ZSwgb2xkVmFsdWUpID0+IHZhbHVlICE9PSBvbGRWYWx1ZSAmJiAodmFsdWUgPT09IHZhbHVlIHx8IG9sZFZhbHVlID09PSBvbGRWYWx1ZSk7XG5cbi8vIG5vZGVfbW9kdWxlcy9AdnVlL3JlYWN0aXZpdHkvZGlzdC9yZWFjdGl2aXR5LmVzbS1idW5kbGVyLmpzXG52YXIgdGFyZ2V0TWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgZWZmZWN0U3RhY2sgPSBbXTtcbnZhciBhY3RpdmVFZmZlY3Q7XG52YXIgSVRFUkFURV9LRVkgPSBTeW1ib2wodHJ1ZSA/IFwiaXRlcmF0ZVwiIDogXCJcIik7XG52YXIgTUFQX0tFWV9JVEVSQVRFX0tFWSA9IFN5bWJvbCh0cnVlID8gXCJNYXAga2V5IGl0ZXJhdGVcIiA6IFwiXCIpO1xuZnVuY3Rpb24gaXNFZmZlY3QoZm4pIHtcbiAgcmV0dXJuIGZuICYmIGZuLl9pc0VmZmVjdCA9PT0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVmZmVjdDIoZm4sIG9wdGlvbnMgPSBFTVBUWV9PQkopIHtcbiAgaWYgKGlzRWZmZWN0KGZuKSkge1xuICAgIGZuID0gZm4ucmF3O1xuICB9XG4gIGNvbnN0IGVmZmVjdDMgPSBjcmVhdGVSZWFjdGl2ZUVmZmVjdChmbiwgb3B0aW9ucyk7XG4gIGlmICghb3B0aW9ucy5sYXp5KSB7XG4gICAgZWZmZWN0MygpO1xuICB9XG4gIHJldHVybiBlZmZlY3QzO1xufVxuZnVuY3Rpb24gc3RvcChlZmZlY3QzKSB7XG4gIGlmIChlZmZlY3QzLmFjdGl2ZSkge1xuICAgIGNsZWFudXAoZWZmZWN0Myk7XG4gICAgaWYgKGVmZmVjdDMub3B0aW9ucy5vblN0b3ApIHtcbiAgICAgIGVmZmVjdDMub3B0aW9ucy5vblN0b3AoKTtcbiAgICB9XG4gICAgZWZmZWN0My5hY3RpdmUgPSBmYWxzZTtcbiAgfVxufVxudmFyIHVpZCA9IDA7XG5mdW5jdGlvbiBjcmVhdGVSZWFjdGl2ZUVmZmVjdChmbiwgb3B0aW9ucykge1xuICBjb25zdCBlZmZlY3QzID0gZnVuY3Rpb24gcmVhY3RpdmVFZmZlY3QoKSB7XG4gICAgaWYgKCFlZmZlY3QzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfVxuICAgIGlmICghZWZmZWN0U3RhY2suaW5jbHVkZXMoZWZmZWN0MykpIHtcbiAgICAgIGNsZWFudXAoZWZmZWN0Myk7XG4gICAgICB0cnkge1xuICAgICAgICBlbmFibGVUcmFja2luZygpO1xuICAgICAgICBlZmZlY3RTdGFjay5wdXNoKGVmZmVjdDMpO1xuICAgICAgICBhY3RpdmVFZmZlY3QgPSBlZmZlY3QzO1xuICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGVmZmVjdFN0YWNrLnBvcCgpO1xuICAgICAgICByZXNldFRyYWNraW5nKCk7XG4gICAgICAgIGFjdGl2ZUVmZmVjdCA9IGVmZmVjdFN0YWNrW2VmZmVjdFN0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZWZmZWN0My5pZCA9IHVpZCsrO1xuICBlZmZlY3QzLmFsbG93UmVjdXJzZSA9ICEhb3B0aW9ucy5hbGxvd1JlY3Vyc2U7XG4gIGVmZmVjdDMuX2lzRWZmZWN0ID0gdHJ1ZTtcbiAgZWZmZWN0My5hY3RpdmUgPSB0cnVlO1xuICBlZmZlY3QzLnJhdyA9IGZuO1xuICBlZmZlY3QzLmRlcHMgPSBbXTtcbiAgZWZmZWN0My5vcHRpb25zID0gb3B0aW9ucztcbiAgcmV0dXJuIGVmZmVjdDM7XG59XG5mdW5jdGlvbiBjbGVhbnVwKGVmZmVjdDMpIHtcbiAgY29uc3QgeyBkZXBzIH0gPSBlZmZlY3QzO1xuICBpZiAoZGVwcy5sZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlcHNbaV0uZGVsZXRlKGVmZmVjdDMpO1xuICAgIH1cbiAgICBkZXBzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbnZhciBzaG91bGRUcmFjayA9IHRydWU7XG52YXIgdHJhY2tTdGFjayA9IFtdO1xuZnVuY3Rpb24gcGF1c2VUcmFja2luZygpIHtcbiAgdHJhY2tTdGFjay5wdXNoKHNob3VsZFRyYWNrKTtcbiAgc2hvdWxkVHJhY2sgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIGVuYWJsZVRyYWNraW5nKCkge1xuICB0cmFja1N0YWNrLnB1c2goc2hvdWxkVHJhY2spO1xuICBzaG91bGRUcmFjayA9IHRydWU7XG59XG5mdW5jdGlvbiByZXNldFRyYWNraW5nKCkge1xuICBjb25zdCBsYXN0ID0gdHJhY2tTdGFjay5wb3AoKTtcbiAgc2hvdWxkVHJhY2sgPSBsYXN0ID09PSB2b2lkIDAgPyB0cnVlIDogbGFzdDtcbn1cbmZ1bmN0aW9uIHRyYWNrKHRhcmdldCwgdHlwZSwga2V5KSB7XG4gIGlmICghc2hvdWxkVHJhY2sgfHwgYWN0aXZlRWZmZWN0ID09PSB2b2lkIDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGRlcHNNYXAgPSB0YXJnZXRNYXAuZ2V0KHRhcmdldCk7XG4gIGlmICghZGVwc01hcCkge1xuICAgIHRhcmdldE1hcC5zZXQodGFyZ2V0LCBkZXBzTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSk7XG4gIH1cbiAgbGV0IGRlcCA9IGRlcHNNYXAuZ2V0KGtleSk7XG4gIGlmICghZGVwKSB7XG4gICAgZGVwc01hcC5zZXQoa2V5LCBkZXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTtcbiAgfVxuICBpZiAoIWRlcC5oYXMoYWN0aXZlRWZmZWN0KSkge1xuICAgIGRlcC5hZGQoYWN0aXZlRWZmZWN0KTtcbiAgICBhY3RpdmVFZmZlY3QuZGVwcy5wdXNoKGRlcCk7XG4gICAgaWYgKGFjdGl2ZUVmZmVjdC5vcHRpb25zLm9uVHJhY2spIHtcbiAgICAgIGFjdGl2ZUVmZmVjdC5vcHRpb25zLm9uVHJhY2soe1xuICAgICAgICBlZmZlY3Q6IGFjdGl2ZUVmZmVjdCxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICB0eXBlLFxuICAgICAgICBrZXlcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gdHJpZ2dlcih0YXJnZXQsIHR5cGUsIGtleSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBvbGRUYXJnZXQpIHtcbiAgY29uc3QgZGVwc01hcCA9IHRhcmdldE1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGVmZmVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBjb25zdCBhZGQyID0gKGVmZmVjdHNUb0FkZCkgPT4ge1xuICAgIGlmIChlZmZlY3RzVG9BZGQpIHtcbiAgICAgIGVmZmVjdHNUb0FkZC5mb3JFYWNoKChlZmZlY3QzKSA9PiB7XG4gICAgICAgIGlmIChlZmZlY3QzICE9PSBhY3RpdmVFZmZlY3QgfHwgZWZmZWN0My5hbGxvd1JlY3Vyc2UpIHtcbiAgICAgICAgICBlZmZlY3RzLmFkZChlZmZlY3QzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBpZiAodHlwZSA9PT0gXCJjbGVhclwiKSB7XG4gICAgZGVwc01hcC5mb3JFYWNoKGFkZDIpO1xuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJsZW5ndGhcIiAmJiBpc0FycmF5KHRhcmdldCkpIHtcbiAgICBkZXBzTWFwLmZvckVhY2goKGRlcCwga2V5MikgPT4ge1xuICAgICAgaWYgKGtleTIgPT09IFwibGVuZ3RoXCIgfHwga2V5MiA+PSBuZXdWYWx1ZSkge1xuICAgICAgICBhZGQyKGRlcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwKSB7XG4gICAgICBhZGQyKGRlcHNNYXAuZ2V0KGtleSkpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJhZGRcIjpcbiAgICAgICAgaWYgKCFpc0FycmF5KHRhcmdldCkpIHtcbiAgICAgICAgICBhZGQyKGRlcHNNYXAuZ2V0KElURVJBVEVfS0VZKSk7XG4gICAgICAgICAgaWYgKGlzTWFwKHRhcmdldCkpIHtcbiAgICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoTUFQX0tFWV9JVEVSQVRFX0tFWSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0ludGVnZXJLZXkoa2V5KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoXCJsZW5ndGhcIikpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImRlbGV0ZVwiOlxuICAgICAgICBpZiAoIWlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpKTtcbiAgICAgICAgICBpZiAoaXNNYXAodGFyZ2V0KSkge1xuICAgICAgICAgICAgYWRkMihkZXBzTWFwLmdldChNQVBfS0VZX0lURVJBVEVfS0VZKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInNldFwiOlxuICAgICAgICBpZiAoaXNNYXAodGFyZ2V0KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgY29uc3QgcnVuID0gKGVmZmVjdDMpID0+IHtcbiAgICBpZiAoZWZmZWN0My5vcHRpb25zLm9uVHJpZ2dlcikge1xuICAgICAgZWZmZWN0My5vcHRpb25zLm9uVHJpZ2dlcih7XG4gICAgICAgIGVmZmVjdDogZWZmZWN0MyxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBrZXksXG4gICAgICAgIHR5cGUsXG4gICAgICAgIG5ld1ZhbHVlLFxuICAgICAgICBvbGRWYWx1ZSxcbiAgICAgICAgb2xkVGFyZ2V0XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVmZmVjdDMub3B0aW9ucy5zY2hlZHVsZXIpIHtcbiAgICAgIGVmZmVjdDMub3B0aW9ucy5zY2hlZHVsZXIoZWZmZWN0Myk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVmZmVjdDMoKTtcbiAgICB9XG4gIH07XG4gIGVmZmVjdHMuZm9yRWFjaChydW4pO1xufVxudmFyIGlzTm9uVHJhY2thYmxlS2V5cyA9IC8qIEBfX1BVUkVfXyAqLyBtYWtlTWFwKGBfX3Byb3RvX18sX192X2lzUmVmLF9faXNWdWVgKTtcbnZhciBidWlsdEluU3ltYm9scyA9IG5ldyBTZXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoU3ltYm9sKS5tYXAoKGtleSkgPT4gU3ltYm9sW2tleV0pLmZpbHRlcihpc1N5bWJvbCkpO1xudmFyIGdldDIgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlR2V0dGVyKCk7XG52YXIgcmVhZG9ubHlHZXQgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlR2V0dGVyKHRydWUpO1xudmFyIGFycmF5SW5zdHJ1bWVudGF0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVBcnJheUluc3RydW1lbnRhdGlvbnMoKTtcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5SW5zdHJ1bWVudGF0aW9ucygpIHtcbiAgY29uc3QgaW5zdHJ1bWVudGF0aW9ucyA9IHt9O1xuICBbXCJpbmNsdWRlc1wiLCBcImluZGV4T2ZcIiwgXCJsYXN0SW5kZXhPZlwiXS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpbnN0cnVtZW50YXRpb25zW2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICBjb25zdCBhcnIgPSB0b1Jhdyh0aGlzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdHJhY2soYXJyLCBcImdldFwiLCBpICsgXCJcIik7XG4gICAgICB9XG4gICAgICBjb25zdCByZXMgPSBhcnJba2V5XSguLi5hcmdzKTtcbiAgICAgIGlmIChyZXMgPT09IC0xIHx8IHJlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGFycltrZXldKC4uLmFyZ3MubWFwKHRvUmF3KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBbXCJwdXNoXCIsIFwicG9wXCIsIFwic2hpZnRcIiwgXCJ1bnNoaWZ0XCIsIFwic3BsaWNlXCJdLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGluc3RydW1lbnRhdGlvbnNba2V5XSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIHBhdXNlVHJhY2tpbmcoKTtcbiAgICAgIGNvbnN0IHJlcyA9IHRvUmF3KHRoaXMpW2tleV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICByZXNldFRyYWNraW5nKCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaW5zdHJ1bWVudGF0aW9ucztcbn1cbmZ1bmN0aW9uIGNyZWF0ZUdldHRlcihpc1JlYWRvbmx5ID0gZmFsc2UsIHNoYWxsb3cgPSBmYWxzZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0Myh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAoa2V5ID09PSBcIl9fdl9pc1JlYWN0aXZlXCIpIHtcbiAgICAgIHJldHVybiAhaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfaXNSZWFkb25seVwiKSB7XG4gICAgICByZXR1cm4gaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfcmF3XCIgJiYgcmVjZWl2ZXIgPT09IChpc1JlYWRvbmx5ID8gc2hhbGxvdyA/IHNoYWxsb3dSZWFkb25seU1hcCA6IHJlYWRvbmx5TWFwIDogc2hhbGxvdyA/IHNoYWxsb3dSZWFjdGl2ZU1hcCA6IHJlYWN0aXZlTWFwKS5nZXQodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0SXNBcnJheSA9IGlzQXJyYXkodGFyZ2V0KTtcbiAgICBpZiAoIWlzUmVhZG9ubHkgJiYgdGFyZ2V0SXNBcnJheSAmJiBoYXNPd24oYXJyYXlJbnN0cnVtZW50YXRpb25zLCBrZXkpKSB7XG4gICAgICByZXR1cm4gUmVmbGVjdC5nZXQoYXJyYXlJbnN0cnVtZW50YXRpb25zLCBrZXksIHJlY2VpdmVyKTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICBpZiAoaXNTeW1ib2woa2V5KSA/IGJ1aWx0SW5TeW1ib2xzLmhhcyhrZXkpIDogaXNOb25UcmFja2FibGVLZXlzKGtleSkpIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGlmICghaXNSZWFkb25seSkge1xuICAgICAgdHJhY2sodGFyZ2V0LCBcImdldFwiLCBrZXkpO1xuICAgIH1cbiAgICBpZiAoc2hhbGxvdykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKGlzUmVmKHJlcykpIHtcbiAgICAgIGNvbnN0IHNob3VsZFVud3JhcCA9ICF0YXJnZXRJc0FycmF5IHx8ICFpc0ludGVnZXJLZXkoa2V5KTtcbiAgICAgIHJldHVybiBzaG91bGRVbndyYXAgPyByZXMudmFsdWUgOiByZXM7XG4gICAgfVxuICAgIGlmIChpc09iamVjdChyZXMpKSB7XG4gICAgICByZXR1cm4gaXNSZWFkb25seSA/IHJlYWRvbmx5KHJlcykgOiByZWFjdGl2ZTIocmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cbnZhciBzZXQyID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZVNldHRlcigpO1xuZnVuY3Rpb24gY3JlYXRlU2V0dGVyKHNoYWxsb3cgPSBmYWxzZSkge1xuICByZXR1cm4gZnVuY3Rpb24gc2V0Myh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgbGV0IG9sZFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgaWYgKCFzaGFsbG93KSB7XG4gICAgICB2YWx1ZSA9IHRvUmF3KHZhbHVlKTtcbiAgICAgIG9sZFZhbHVlID0gdG9SYXcob2xkVmFsdWUpO1xuICAgICAgaWYgKCFpc0FycmF5KHRhcmdldCkgJiYgaXNSZWYob2xkVmFsdWUpICYmICFpc1JlZih2YWx1ZSkpIHtcbiAgICAgICAgb2xkVmFsdWUudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhhZEtleSA9IGlzQXJyYXkodGFyZ2V0KSAmJiBpc0ludGVnZXJLZXkoa2V5KSA/IE51bWJlcihrZXkpIDwgdGFyZ2V0Lmxlbmd0aCA6IGhhc093bih0YXJnZXQsIGtleSk7XG4gICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgaWYgKHRhcmdldCA9PT0gdG9SYXcocmVjZWl2ZXIpKSB7XG4gICAgICBpZiAoIWhhZEtleSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwgXCJhZGRcIiwga2V5LCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGhhc0NoYW5nZWQodmFsdWUsIG9sZFZhbHVlKSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwgXCJzZXRcIiwga2V5LCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgY29uc3QgaGFkS2V5ID0gaGFzT3duKHRhcmdldCwga2V5KTtcbiAgY29uc3Qgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSk7XG4gIGlmIChyZXN1bHQgJiYgaGFkS2V5KSB7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiZGVsZXRlXCIsIGtleSwgdm9pZCAwLCBvbGRWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGhhcyh0YXJnZXQsIGtleSkge1xuICBjb25zdCByZXN1bHQgPSBSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSk7XG4gIGlmICghaXNTeW1ib2woa2V5KSB8fCAhYnVpbHRJblN5bWJvbHMuaGFzKGtleSkpIHtcbiAgICB0cmFjayh0YXJnZXQsIFwiaGFzXCIsIGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG93bktleXModGFyZ2V0KSB7XG4gIHRyYWNrKHRhcmdldCwgXCJpdGVyYXRlXCIsIGlzQXJyYXkodGFyZ2V0KSA/IFwibGVuZ3RoXCIgOiBJVEVSQVRFX0tFWSk7XG4gIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0KTtcbn1cbnZhciBtdXRhYmxlSGFuZGxlcnMgPSB7XG4gIGdldDogZ2V0MixcbiAgc2V0OiBzZXQyLFxuICBkZWxldGVQcm9wZXJ0eSxcbiAgaGFzLFxuICBvd25LZXlzXG59O1xudmFyIHJlYWRvbmx5SGFuZGxlcnMgPSB7XG4gIGdldDogcmVhZG9ubHlHZXQsXG4gIHNldCh0YXJnZXQsIGtleSkge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFNldCBvcGVyYXRpb24gb24ga2V5IFwiJHtTdHJpbmcoa2V5KX1cIiBmYWlsZWQ6IHRhcmdldCBpcyByZWFkb25seS5gLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICBpZiAodHJ1ZSkge1xuICAgICAgY29uc29sZS53YXJuKGBEZWxldGUgb3BlcmF0aW9uIG9uIGtleSBcIiR7U3RyaW5nKGtleSl9XCIgZmFpbGVkOiB0YXJnZXQgaXMgcmVhZG9ubHkuYCwgdGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG52YXIgdG9SZWFjdGl2ZSA9ICh2YWx1ZSkgPT4gaXNPYmplY3QodmFsdWUpID8gcmVhY3RpdmUyKHZhbHVlKSA6IHZhbHVlO1xudmFyIHRvUmVhZG9ubHkgPSAodmFsdWUpID0+IGlzT2JqZWN0KHZhbHVlKSA/IHJlYWRvbmx5KHZhbHVlKSA6IHZhbHVlO1xudmFyIHRvU2hhbGxvdyA9ICh2YWx1ZSkgPT4gdmFsdWU7XG52YXIgZ2V0UHJvdG8gPSAodikgPT4gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih2KTtcbmZ1bmN0aW9uIGdldCQxKHRhcmdldCwga2V5LCBpc1JlYWRvbmx5ID0gZmFsc2UsIGlzU2hhbGxvdyA9IGZhbHNlKSB7XG4gIHRhcmdldCA9IHRhcmdldFtcbiAgICBcIl9fdl9yYXdcIlxuICAgIC8qIFJBVyAqL1xuICBdO1xuICBjb25zdCByYXdUYXJnZXQgPSB0b1Jhdyh0YXJnZXQpO1xuICBjb25zdCByYXdLZXkgPSB0b1JhdyhrZXkpO1xuICBpZiAoa2V5ICE9PSByYXdLZXkpIHtcbiAgICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiZ2V0XCIsIGtleSk7XG4gIH1cbiAgIWlzUmVhZG9ubHkgJiYgdHJhY2socmF3VGFyZ2V0LCBcImdldFwiLCByYXdLZXkpO1xuICBjb25zdCB7IGhhczogaGFzMiB9ID0gZ2V0UHJvdG8ocmF3VGFyZ2V0KTtcbiAgY29uc3Qgd3JhcCA9IGlzU2hhbGxvdyA/IHRvU2hhbGxvdyA6IGlzUmVhZG9ubHkgPyB0b1JlYWRvbmx5IDogdG9SZWFjdGl2ZTtcbiAgaWYgKGhhczIuY2FsbChyYXdUYXJnZXQsIGtleSkpIHtcbiAgICByZXR1cm4gd3JhcCh0YXJnZXQuZ2V0KGtleSkpO1xuICB9IGVsc2UgaWYgKGhhczIuY2FsbChyYXdUYXJnZXQsIHJhd0tleSkpIHtcbiAgICByZXR1cm4gd3JhcCh0YXJnZXQuZ2V0KHJhd0tleSkpO1xuICB9IGVsc2UgaWYgKHRhcmdldCAhPT0gcmF3VGFyZ2V0KSB7XG4gICAgdGFyZ2V0LmdldChrZXkpO1xuICB9XG59XG5mdW5jdGlvbiBoYXMkMShrZXksIGlzUmVhZG9ubHkgPSBmYWxzZSkge1xuICBjb25zdCB0YXJnZXQgPSB0aGlzW1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF07XG4gIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gIGNvbnN0IHJhd0tleSA9IHRvUmF3KGtleSk7XG4gIGlmIChrZXkgIT09IHJhd0tleSkge1xuICAgICFpc1JlYWRvbmx5ICYmIHRyYWNrKHJhd1RhcmdldCwgXCJoYXNcIiwga2V5KTtcbiAgfVxuICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiaGFzXCIsIHJhd0tleSk7XG4gIHJldHVybiBrZXkgPT09IHJhd0tleSA/IHRhcmdldC5oYXMoa2V5KSA6IHRhcmdldC5oYXMoa2V5KSB8fCB0YXJnZXQuaGFzKHJhd0tleSk7XG59XG5mdW5jdGlvbiBzaXplKHRhcmdldCwgaXNSZWFkb25seSA9IGZhbHNlKSB7XG4gIHRhcmdldCA9IHRhcmdldFtcbiAgICBcIl9fdl9yYXdcIlxuICAgIC8qIFJBVyAqL1xuICBdO1xuICAhaXNSZWFkb25seSAmJiB0cmFjayh0b1Jhdyh0YXJnZXQpLCBcIml0ZXJhdGVcIiwgSVRFUkFURV9LRVkpO1xuICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBcInNpemVcIiwgdGFyZ2V0KTtcbn1cbmZ1bmN0aW9uIGFkZCh2YWx1ZSkge1xuICB2YWx1ZSA9IHRvUmF3KHZhbHVlKTtcbiAgY29uc3QgdGFyZ2V0ID0gdG9SYXcodGhpcyk7XG4gIGNvbnN0IHByb3RvID0gZ2V0UHJvdG8odGFyZ2V0KTtcbiAgY29uc3QgaGFkS2V5ID0gcHJvdG8uaGFzLmNhbGwodGFyZ2V0LCB2YWx1ZSk7XG4gIGlmICghaGFkS2V5KSB7XG4gICAgdGFyZ2V0LmFkZCh2YWx1ZSk7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiYWRkXCIsIHZhbHVlLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBzZXQkMShrZXksIHZhbHVlKSB7XG4gIHZhbHVlID0gdG9SYXcodmFsdWUpO1xuICBjb25zdCB0YXJnZXQgPSB0b1Jhdyh0aGlzKTtcbiAgY29uc3QgeyBoYXM6IGhhczIsIGdldDogZ2V0MyB9ID0gZ2V0UHJvdG8odGFyZ2V0KTtcbiAgbGV0IGhhZEtleSA9IGhhczIuY2FsbCh0YXJnZXQsIGtleSk7XG4gIGlmICghaGFkS2V5KSB7XG4gICAga2V5ID0gdG9SYXcoa2V5KTtcbiAgICBoYWRLZXkgPSBoYXMyLmNhbGwodGFyZ2V0LCBrZXkpO1xuICB9IGVsc2UgaWYgKHRydWUpIHtcbiAgICBjaGVja0lkZW50aXR5S2V5cyh0YXJnZXQsIGhhczIsIGtleSk7XG4gIH1cbiAgY29uc3Qgb2xkVmFsdWUgPSBnZXQzLmNhbGwodGFyZ2V0LCBrZXkpO1xuICB0YXJnZXQuc2V0KGtleSwgdmFsdWUpO1xuICBpZiAoIWhhZEtleSkge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcImFkZFwiLCBrZXksIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChoYXNDaGFuZ2VkKHZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJzZXRcIiwga2V5LCB2YWx1ZSwgb2xkVmFsdWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gZGVsZXRlRW50cnkoa2V5KSB7XG4gIGNvbnN0IHRhcmdldCA9IHRvUmF3KHRoaXMpO1xuICBjb25zdCB7IGhhczogaGFzMiwgZ2V0OiBnZXQzIH0gPSBnZXRQcm90byh0YXJnZXQpO1xuICBsZXQgaGFkS2V5ID0gaGFzMi5jYWxsKHRhcmdldCwga2V5KTtcbiAgaWYgKCFoYWRLZXkpIHtcbiAgICBrZXkgPSB0b1JhdyhrZXkpO1xuICAgIGhhZEtleSA9IGhhczIuY2FsbCh0YXJnZXQsIGtleSk7XG4gIH0gZWxzZSBpZiAodHJ1ZSkge1xuICAgIGNoZWNrSWRlbnRpdHlLZXlzKHRhcmdldCwgaGFzMiwga2V5KTtcbiAgfVxuICBjb25zdCBvbGRWYWx1ZSA9IGdldDMgPyBnZXQzLmNhbGwodGFyZ2V0LCBrZXkpIDogdm9pZCAwO1xuICBjb25zdCByZXN1bHQgPSB0YXJnZXQuZGVsZXRlKGtleSk7XG4gIGlmIChoYWRLZXkpIHtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJkZWxldGVcIiwga2V5LCB2b2lkIDAsIG9sZFZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY2xlYXIoKSB7XG4gIGNvbnN0IHRhcmdldCA9IHRvUmF3KHRoaXMpO1xuICBjb25zdCBoYWRJdGVtcyA9IHRhcmdldC5zaXplICE9PSAwO1xuICBjb25zdCBvbGRUYXJnZXQgPSB0cnVlID8gaXNNYXAodGFyZ2V0KSA/IG5ldyBNYXAodGFyZ2V0KSA6IG5ldyBTZXQodGFyZ2V0KSA6IHZvaWQgMDtcbiAgY29uc3QgcmVzdWx0ID0gdGFyZ2V0LmNsZWFyKCk7XG4gIGlmIChoYWRJdGVtcykge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcImNsZWFyXCIsIHZvaWQgMCwgdm9pZCAwLCBvbGRUYXJnZXQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjcmVhdGVGb3JFYWNoKGlzUmVhZG9ubHksIGlzU2hhbGxvdykge1xuICByZXR1cm4gZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGNvbnN0IG9ic2VydmVkID0gdGhpcztcbiAgICBjb25zdCB0YXJnZXQgPSBvYnNlcnZlZFtcbiAgICAgIFwiX192X3Jhd1wiXG4gICAgICAvKiBSQVcgKi9cbiAgICBdO1xuICAgIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gICAgY29uc3Qgd3JhcCA9IGlzU2hhbGxvdyA/IHRvU2hhbGxvdyA6IGlzUmVhZG9ubHkgPyB0b1JlYWRvbmx5IDogdG9SZWFjdGl2ZTtcbiAgICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiaXRlcmF0ZVwiLCBJVEVSQVRFX0tFWSk7XG4gICAgcmV0dXJuIHRhcmdldC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB3cmFwKHZhbHVlKSwgd3JhcChrZXkpLCBvYnNlcnZlZCk7XG4gICAgfSk7XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGlzUmVhZG9ubHksIGlzU2hhbGxvdykge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXNbXG4gICAgICBcIl9fdl9yYXdcIlxuICAgICAgLyogUkFXICovXG4gICAgXTtcbiAgICBjb25zdCByYXdUYXJnZXQgPSB0b1Jhdyh0YXJnZXQpO1xuICAgIGNvbnN0IHRhcmdldElzTWFwID0gaXNNYXAocmF3VGFyZ2V0KTtcbiAgICBjb25zdCBpc1BhaXIgPSBtZXRob2QgPT09IFwiZW50cmllc1wiIHx8IG1ldGhvZCA9PT0gU3ltYm9sLml0ZXJhdG9yICYmIHRhcmdldElzTWFwO1xuICAgIGNvbnN0IGlzS2V5T25seSA9IG1ldGhvZCA9PT0gXCJrZXlzXCIgJiYgdGFyZ2V0SXNNYXA7XG4gICAgY29uc3QgaW5uZXJJdGVyYXRvciA9IHRhcmdldFttZXRob2RdKC4uLmFyZ3MpO1xuICAgIGNvbnN0IHdyYXAgPSBpc1NoYWxsb3cgPyB0b1NoYWxsb3cgOiBpc1JlYWRvbmx5ID8gdG9SZWFkb25seSA6IHRvUmVhY3RpdmU7XG4gICAgIWlzUmVhZG9ubHkgJiYgdHJhY2socmF3VGFyZ2V0LCBcIml0ZXJhdGVcIiwgaXNLZXlPbmx5ID8gTUFQX0tFWV9JVEVSQVRFX0tFWSA6IElURVJBVEVfS0VZKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gaXRlcmF0b3IgcHJvdG9jb2xcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHsgdmFsdWUsIGRvbmUgfSA9IGlubmVySXRlcmF0b3IubmV4dCgpO1xuICAgICAgICByZXR1cm4gZG9uZSA/IHsgdmFsdWUsIGRvbmUgfSA6IHtcbiAgICAgICAgICB2YWx1ZTogaXNQYWlyID8gW3dyYXAodmFsdWVbMF0pLCB3cmFwKHZhbHVlWzFdKV0gOiB3cmFwKHZhbHVlKSxcbiAgICAgICAgICBkb25lXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgLy8gaXRlcmFibGUgcHJvdG9jb2xcbiAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlUmVhZG9ubHlNZXRob2QodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zdCBrZXkgPSBhcmdzWzBdID8gYG9uIGtleSBcIiR7YXJnc1swXX1cIiBgIDogYGA7XG4gICAgICBjb25zb2xlLndhcm4oYCR7Y2FwaXRhbGl6ZSh0eXBlKX0gb3BlcmF0aW9uICR7a2V5fWZhaWxlZDogdGFyZ2V0IGlzIHJlYWRvbmx5LmAsIHRvUmF3KHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGUgPT09IFwiZGVsZXRlXCIgPyBmYWxzZSA6IHRoaXM7XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVJbnN0cnVtZW50YXRpb25zKCkge1xuICBjb25zdCBtdXRhYmxlSW5zdHJ1bWVudGF0aW9uczIgPSB7XG4gICAgZ2V0KGtleSkge1xuICAgICAgcmV0dXJuIGdldCQxKHRoaXMsIGtleSk7XG4gICAgfSxcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiBzaXplKHRoaXMpO1xuICAgIH0sXG4gICAgaGFzOiBoYXMkMSxcbiAgICBhZGQsXG4gICAgc2V0OiBzZXQkMSxcbiAgICBkZWxldGU6IGRlbGV0ZUVudHJ5LFxuICAgIGNsZWFyLFxuICAgIGZvckVhY2g6IGNyZWF0ZUZvckVhY2goZmFsc2UsIGZhbHNlKVxuICB9O1xuICBjb25zdCBzaGFsbG93SW5zdHJ1bWVudGF0aW9uczIgPSB7XG4gICAgZ2V0KGtleSkge1xuICAgICAgcmV0dXJuIGdldCQxKHRoaXMsIGtleSwgZmFsc2UsIHRydWUpO1xuICAgIH0sXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gc2l6ZSh0aGlzKTtcbiAgICB9LFxuICAgIGhhczogaGFzJDEsXG4gICAgYWRkLFxuICAgIHNldDogc2V0JDEsXG4gICAgZGVsZXRlOiBkZWxldGVFbnRyeSxcbiAgICBjbGVhcixcbiAgICBmb3JFYWNoOiBjcmVhdGVGb3JFYWNoKGZhbHNlLCB0cnVlKVxuICB9O1xuICBjb25zdCByZWFkb25seUluc3RydW1lbnRhdGlvbnMyID0ge1xuICAgIGdldChrZXkpIHtcbiAgICAgIHJldHVybiBnZXQkMSh0aGlzLCBrZXksIHRydWUpO1xuICAgIH0sXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gc2l6ZSh0aGlzLCB0cnVlKTtcbiAgICB9LFxuICAgIGhhcyhrZXkpIHtcbiAgICAgIHJldHVybiBoYXMkMS5jYWxsKHRoaXMsIGtleSwgdHJ1ZSk7XG4gICAgfSxcbiAgICBhZGQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJhZGRcIlxuICAgICAgLyogQUREICovXG4gICAgKSxcbiAgICBzZXQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJzZXRcIlxuICAgICAgLyogU0VUICovXG4gICAgKSxcbiAgICBkZWxldGU6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJkZWxldGVcIlxuICAgICAgLyogREVMRVRFICovXG4gICAgKSxcbiAgICBjbGVhcjogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcImNsZWFyXCJcbiAgICAgIC8qIENMRUFSICovXG4gICAgKSxcbiAgICBmb3JFYWNoOiBjcmVhdGVGb3JFYWNoKHRydWUsIGZhbHNlKVxuICB9O1xuICBjb25zdCBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMiA9IHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0JDEodGhpcywga2V5LCB0cnVlLCB0cnVlKTtcbiAgICB9LFxuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHNpemUodGhpcywgdHJ1ZSk7XG4gICAgfSxcbiAgICBoYXMoa2V5KSB7XG4gICAgICByZXR1cm4gaGFzJDEuY2FsbCh0aGlzLCBrZXksIHRydWUpO1xuICAgIH0sXG4gICAgYWRkOiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwiYWRkXCJcbiAgICAgIC8qIEFERCAqL1xuICAgICksXG4gICAgc2V0OiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwic2V0XCJcbiAgICAgIC8qIFNFVCAqL1xuICAgICksXG4gICAgZGVsZXRlOiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwiZGVsZXRlXCJcbiAgICAgIC8qIERFTEVURSAqL1xuICAgICksXG4gICAgY2xlYXI6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJjbGVhclwiXG4gICAgICAvKiBDTEVBUiAqL1xuICAgICksXG4gICAgZm9yRWFjaDogY3JlYXRlRm9yRWFjaCh0cnVlLCB0cnVlKVxuICB9O1xuICBjb25zdCBpdGVyYXRvck1ldGhvZHMgPSBbXCJrZXlzXCIsIFwidmFsdWVzXCIsIFwiZW50cmllc1wiLCBTeW1ib2wuaXRlcmF0b3JdO1xuICBpdGVyYXRvck1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgbXV0YWJsZUluc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGZhbHNlLCBmYWxzZSk7XG4gICAgcmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMlttZXRob2RdID0gY3JlYXRlSXRlcmFibGVNZXRob2QobWV0aG9kLCB0cnVlLCBmYWxzZSk7XG4gICAgc2hhbGxvd0luc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGZhbHNlLCB0cnVlKTtcbiAgICBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMlttZXRob2RdID0gY3JlYXRlSXRlcmFibGVNZXRob2QobWV0aG9kLCB0cnVlLCB0cnVlKTtcbiAgfSk7XG4gIHJldHVybiBbXG4gICAgbXV0YWJsZUluc3RydW1lbnRhdGlvbnMyLFxuICAgIHJlYWRvbmx5SW5zdHJ1bWVudGF0aW9uczIsXG4gICAgc2hhbGxvd0luc3RydW1lbnRhdGlvbnMyLFxuICAgIHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnMyXG4gIF07XG59XG52YXIgW211dGFibGVJbnN0cnVtZW50YXRpb25zLCByZWFkb25seUluc3RydW1lbnRhdGlvbnMsIHNoYWxsb3dJbnN0cnVtZW50YXRpb25zLCBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zXSA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVJbnN0cnVtZW50YXRpb25zKCk7XG5mdW5jdGlvbiBjcmVhdGVJbnN0cnVtZW50YXRpb25HZXR0ZXIoaXNSZWFkb25seSwgc2hhbGxvdykge1xuICBjb25zdCBpbnN0cnVtZW50YXRpb25zID0gc2hhbGxvdyA/IGlzUmVhZG9ubHkgPyBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zIDogc2hhbGxvd0luc3RydW1lbnRhdGlvbnMgOiBpc1JlYWRvbmx5ID8gcmVhZG9ubHlJbnN0cnVtZW50YXRpb25zIDogbXV0YWJsZUluc3RydW1lbnRhdGlvbnM7XG4gIHJldHVybiAodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSA9PiB7XG4gICAgaWYgKGtleSA9PT0gXCJfX3ZfaXNSZWFjdGl2ZVwiKSB7XG4gICAgICByZXR1cm4gIWlzUmVhZG9ubHk7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiX192X2lzUmVhZG9ubHlcIikge1xuICAgICAgcmV0dXJuIGlzUmVhZG9ubHk7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiX192X3Jhd1wiKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICByZXR1cm4gUmVmbGVjdC5nZXQoaGFzT3duKGluc3RydW1lbnRhdGlvbnMsIGtleSkgJiYga2V5IGluIHRhcmdldCA/IGluc3RydW1lbnRhdGlvbnMgOiB0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICB9O1xufVxudmFyIG11dGFibGVDb2xsZWN0aW9uSGFuZGxlcnMgPSB7XG4gIGdldDogLyogQF9fUFVSRV9fICovIGNyZWF0ZUluc3RydW1lbnRhdGlvbkdldHRlcihmYWxzZSwgZmFsc2UpXG59O1xudmFyIHJlYWRvbmx5Q29sbGVjdGlvbkhhbmRsZXJzID0ge1xuICBnZXQ6IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVJbnN0cnVtZW50YXRpb25HZXR0ZXIodHJ1ZSwgZmFsc2UpXG59O1xuZnVuY3Rpb24gY2hlY2tJZGVudGl0eUtleXModGFyZ2V0LCBoYXMyLCBrZXkpIHtcbiAgY29uc3QgcmF3S2V5ID0gdG9SYXcoa2V5KTtcbiAgaWYgKHJhd0tleSAhPT0ga2V5ICYmIGhhczIuY2FsbCh0YXJnZXQsIHJhd0tleSkpIHtcbiAgICBjb25zdCB0eXBlID0gdG9SYXdUeXBlKHRhcmdldCk7XG4gICAgY29uc29sZS53YXJuKGBSZWFjdGl2ZSAke3R5cGV9IGNvbnRhaW5zIGJvdGggdGhlIHJhdyBhbmQgcmVhY3RpdmUgdmVyc2lvbnMgb2YgdGhlIHNhbWUgb2JqZWN0JHt0eXBlID09PSBgTWFwYCA/IGAgYXMga2V5c2AgOiBgYH0sIHdoaWNoIGNhbiBsZWFkIHRvIGluY29uc2lzdGVuY2llcy4gQXZvaWQgZGlmZmVyZW50aWF0aW5nIGJldHdlZW4gdGhlIHJhdyBhbmQgcmVhY3RpdmUgdmVyc2lvbnMgb2YgYW4gb2JqZWN0IGFuZCBvbmx5IHVzZSB0aGUgcmVhY3RpdmUgdmVyc2lvbiBpZiBwb3NzaWJsZS5gKTtcbiAgfVxufVxudmFyIHJlYWN0aXZlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgc2hhbGxvd1JlYWN0aXZlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgcmVhZG9ubHlNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciBzaGFsbG93UmVhZG9ubHlNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHRhcmdldFR5cGVNYXAocmF3VHlwZSkge1xuICBzd2l0Y2ggKHJhd1R5cGUpIHtcbiAgICBjYXNlIFwiT2JqZWN0XCI6XG4gICAgY2FzZSBcIkFycmF5XCI6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlIFwiTWFwXCI6XG4gICAgY2FzZSBcIlNldFwiOlxuICAgIGNhc2UgXCJXZWFrTWFwXCI6XG4gICAgY2FzZSBcIldlYWtTZXRcIjpcbiAgICAgIHJldHVybiAyO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuZnVuY3Rpb24gZ2V0VGFyZ2V0VHlwZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWVbXG4gICAgXCJfX3Zfc2tpcFwiXG4gICAgLyogU0tJUCAqL1xuICBdIHx8ICFPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSA/IDAgOiB0YXJnZXRUeXBlTWFwKHRvUmF3VHlwZSh2YWx1ZSkpO1xufVxuZnVuY3Rpb24gcmVhY3RpdmUyKHRhcmdldCkge1xuICBpZiAodGFyZ2V0ICYmIHRhcmdldFtcbiAgICBcIl9fdl9pc1JlYWRvbmx5XCJcbiAgICAvKiBJU19SRUFET05MWSAqL1xuICBdKSB7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICByZXR1cm4gY3JlYXRlUmVhY3RpdmVPYmplY3QodGFyZ2V0LCBmYWxzZSwgbXV0YWJsZUhhbmRsZXJzLCBtdXRhYmxlQ29sbGVjdGlvbkhhbmRsZXJzLCByZWFjdGl2ZU1hcCk7XG59XG5mdW5jdGlvbiByZWFkb25seSh0YXJnZXQpIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlT2JqZWN0KHRhcmdldCwgdHJ1ZSwgcmVhZG9ubHlIYW5kbGVycywgcmVhZG9ubHlDb2xsZWN0aW9uSGFuZGxlcnMsIHJlYWRvbmx5TWFwKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVJlYWN0aXZlT2JqZWN0KHRhcmdldCwgaXNSZWFkb25seSwgYmFzZUhhbmRsZXJzLCBjb2xsZWN0aW9uSGFuZGxlcnMsIHByb3h5TWFwKSB7XG4gIGlmICghaXNPYmplY3QodGFyZ2V0KSkge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYHZhbHVlIGNhbm5vdCBiZSBtYWRlIHJlYWN0aXZlOiAke1N0cmluZyh0YXJnZXQpfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGlmICh0YXJnZXRbXG4gICAgXCJfX3ZfcmF3XCJcbiAgICAvKiBSQVcgKi9cbiAgXSAmJiAhKGlzUmVhZG9ubHkgJiYgdGFyZ2V0W1xuICAgIFwiX192X2lzUmVhY3RpdmVcIlxuICAgIC8qIElTX1JFQUNUSVZFICovXG4gIF0pKSB7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBjb25zdCBleGlzdGluZ1Byb3h5ID0gcHJveHlNYXAuZ2V0KHRhcmdldCk7XG4gIGlmIChleGlzdGluZ1Byb3h5KSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nUHJveHk7XG4gIH1cbiAgY29uc3QgdGFyZ2V0VHlwZSA9IGdldFRhcmdldFR5cGUodGFyZ2V0KTtcbiAgaWYgKHRhcmdldFR5cGUgPT09IDApIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHRhcmdldCwgdGFyZ2V0VHlwZSA9PT0gMiA/IGNvbGxlY3Rpb25IYW5kbGVycyA6IGJhc2VIYW5kbGVycyk7XG4gIHByb3h5TWFwLnNldCh0YXJnZXQsIHByb3h5KTtcbiAgcmV0dXJuIHByb3h5O1xufVxuZnVuY3Rpb24gdG9SYXcob2JzZXJ2ZWQpIHtcbiAgcmV0dXJuIG9ic2VydmVkICYmIHRvUmF3KG9ic2VydmVkW1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF0pIHx8IG9ic2VydmVkO1xufVxuZnVuY3Rpb24gaXNSZWYocikge1xuICByZXR1cm4gQm9vbGVhbihyICYmIHIuX192X2lzUmVmID09PSB0cnVlKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kbmV4dFRpY2suanNcbm1hZ2ljKFwibmV4dFRpY2tcIiwgKCkgPT4gbmV4dFRpY2spO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLyRkaXNwYXRjaC5qc1xubWFnaWMoXCJkaXNwYXRjaFwiLCAoZWwpID0+IGRpc3BhdGNoLmJpbmQoZGlzcGF0Y2gsIGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHdhdGNoLmpzXG5tYWdpYyhcIndhdGNoXCIsIChlbCwgeyBldmFsdWF0ZUxhdGVyOiBldmFsdWF0ZUxhdGVyMiwgY2xlYW51cDogY2xlYW51cDIgfSkgPT4gKGtleSwgY2FsbGJhY2spID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIyKGtleSk7XG4gIGxldCBnZXR0ZXIgPSAoKSA9PiB7XG4gICAgbGV0IHZhbHVlO1xuICAgIGV2YWx1YXRlMigoaSkgPT4gdmFsdWUgPSBpKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG4gIGxldCB1bndhdGNoID0gd2F0Y2goZ2V0dGVyLCBjYWxsYmFjayk7XG4gIGNsZWFudXAyKHVud2F0Y2gpO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHN0b3JlLmpzXG5tYWdpYyhcInN0b3JlXCIsIGdldFN0b3Jlcyk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGRhdGEuanNcbm1hZ2ljKFwiZGF0YVwiLCAoZWwpID0+IHNjb3BlKGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHJvb3QuanNcbm1hZ2ljKFwicm9vdFwiLCAoZWwpID0+IGNsb3Nlc3RSb290KGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHJlZnMuanNcbm1hZ2ljKFwicmVmc1wiLCAoZWwpID0+IHtcbiAgaWYgKGVsLl94X3JlZnNfcHJveHkpXG4gICAgcmV0dXJuIGVsLl94X3JlZnNfcHJveHk7XG4gIGVsLl94X3JlZnNfcHJveHkgPSBtZXJnZVByb3hpZXMoZ2V0QXJyYXlPZlJlZk9iamVjdChlbCkpO1xuICByZXR1cm4gZWwuX3hfcmVmc19wcm94eTtcbn0pO1xuZnVuY3Rpb24gZ2V0QXJyYXlPZlJlZk9iamVjdChlbCkge1xuICBsZXQgcmVmT2JqZWN0cyA9IFtdO1xuICBmaW5kQ2xvc2VzdChlbCwgKGkpID0+IHtcbiAgICBpZiAoaS5feF9yZWZzKVxuICAgICAgcmVmT2JqZWN0cy5wdXNoKGkuX3hfcmVmcyk7XG4gIH0pO1xuICByZXR1cm4gcmVmT2JqZWN0cztcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2lkcy5qc1xudmFyIGdsb2JhbElkTWVtbyA9IHt9O1xuZnVuY3Rpb24gZmluZEFuZEluY3JlbWVudElkKG5hbWUpIHtcbiAgaWYgKCFnbG9iYWxJZE1lbW9bbmFtZV0pXG4gICAgZ2xvYmFsSWRNZW1vW25hbWVdID0gMDtcbiAgcmV0dXJuICsrZ2xvYmFsSWRNZW1vW25hbWVdO1xufVxuZnVuY3Rpb24gY2xvc2VzdElkUm9vdChlbCwgbmFtZSkge1xuICByZXR1cm4gZmluZENsb3Nlc3QoZWwsIChlbGVtZW50KSA9PiB7XG4gICAgaWYgKGVsZW1lbnQuX3hfaWRzICYmIGVsZW1lbnQuX3hfaWRzW25hbWVdKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuZnVuY3Rpb24gc2V0SWRSb290KGVsLCBuYW1lKSB7XG4gIGlmICghZWwuX3hfaWRzKVxuICAgIGVsLl94X2lkcyA9IHt9O1xuICBpZiAoIWVsLl94X2lkc1tuYW1lXSlcbiAgICBlbC5feF9pZHNbbmFtZV0gPSBmaW5kQW5kSW5jcmVtZW50SWQobmFtZSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGlkLmpzXG5tYWdpYyhcImlkXCIsIChlbCwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiAobmFtZSwga2V5ID0gbnVsbCkgPT4ge1xuICBsZXQgY2FjaGVLZXkgPSBgJHtuYW1lfSR7a2V5ID8gYC0ke2tleX1gIDogXCJcIn1gO1xuICByZXR1cm4gY2FjaGVJZEJ5TmFtZU9uRWxlbWVudChlbCwgY2FjaGVLZXksIGNsZWFudXAyLCAoKSA9PiB7XG4gICAgbGV0IHJvb3QgPSBjbG9zZXN0SWRSb290KGVsLCBuYW1lKTtcbiAgICBsZXQgaWQgPSByb290ID8gcm9vdC5feF9pZHNbbmFtZV0gOiBmaW5kQW5kSW5jcmVtZW50SWQobmFtZSk7XG4gICAgcmV0dXJuIGtleSA/IGAke25hbWV9LSR7aWR9LSR7a2V5fWAgOiBgJHtuYW1lfS0ke2lkfWA7XG4gIH0pO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfaWQpIHtcbiAgICB0by5feF9pZCA9IGZyb20uX3hfaWQ7XG4gIH1cbn0pO1xuZnVuY3Rpb24gY2FjaGVJZEJ5TmFtZU9uRWxlbWVudChlbCwgY2FjaGVLZXksIGNsZWFudXAyLCBjYWxsYmFjaykge1xuICBpZiAoIWVsLl94X2lkKVxuICAgIGVsLl94X2lkID0ge307XG4gIGlmIChlbC5feF9pZFtjYWNoZUtleV0pXG4gICAgcmV0dXJuIGVsLl94X2lkW2NhY2hlS2V5XTtcbiAgbGV0IG91dHB1dCA9IGNhbGxiYWNrKCk7XG4gIGVsLl94X2lkW2NhY2hlS2V5XSA9IG91dHB1dDtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIGRlbGV0ZSBlbC5feF9pZFtjYWNoZUtleV07XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLyRlbC5qc1xubWFnaWMoXCJlbFwiLCAoZWwpID0+IGVsKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy9pbmRleC5qc1xud2Fybk1pc3NpbmdQbHVnaW5NYWdpYyhcIkZvY3VzXCIsIFwiZm9jdXNcIiwgXCJmb2N1c1wiKTtcbndhcm5NaXNzaW5nUGx1Z2luTWFnaWMoXCJQZXJzaXN0XCIsIFwicGVyc2lzdFwiLCBcInBlcnNpc3RcIik7XG5mdW5jdGlvbiB3YXJuTWlzc2luZ1BsdWdpbk1hZ2ljKG5hbWUsIG1hZ2ljTmFtZSwgc2x1Zykge1xuICBtYWdpYyhtYWdpY05hbWUsIChlbCkgPT4gd2FybihgWW91IGNhbid0IHVzZSBbJCR7bWFnaWNOYW1lfV0gd2l0aG91dCBmaXJzdCBpbnN0YWxsaW5nIHRoZSBcIiR7bmFtZX1cIiBwbHVnaW4gaGVyZTogaHR0cHM6Ly9hbHBpbmVqcy5kZXYvcGx1Z2lucy8ke3NsdWd9YCwgZWwpKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1tb2RlbGFibGUuanNcbmRpcmVjdGl2ZShcIm1vZGVsYWJsZVwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgZXZhbHVhdGVMYXRlcjogZXZhbHVhdGVMYXRlcjIsIGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgbGV0IGZ1bmMgPSBldmFsdWF0ZUxhdGVyMihleHByZXNzaW9uKTtcbiAgbGV0IGlubmVyR2V0ID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZnVuYygoaSkgPT4gcmVzdWx0ID0gaSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgbGV0IGV2YWx1YXRlSW5uZXJTZXQgPSBldmFsdWF0ZUxhdGVyMihgJHtleHByZXNzaW9ufSA9IF9fcGxhY2Vob2xkZXJgKTtcbiAgbGV0IGlubmVyU2V0ID0gKHZhbCkgPT4gZXZhbHVhdGVJbm5lclNldCgoKSA9PiB7XG4gIH0sIHsgc2NvcGU6IHsgXCJfX3BsYWNlaG9sZGVyXCI6IHZhbCB9IH0pO1xuICBsZXQgaW5pdGlhbFZhbHVlID0gaW5uZXJHZXQoKTtcbiAgaW5uZXJTZXQoaW5pdGlhbFZhbHVlKTtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGlmICghZWwuX3hfbW9kZWwpXG4gICAgICByZXR1cm47XG4gICAgZWwuX3hfcmVtb3ZlTW9kZWxMaXN0ZW5lcnNbXCJkZWZhdWx0XCJdKCk7XG4gICAgbGV0IG91dGVyR2V0ID0gZWwuX3hfbW9kZWwuZ2V0O1xuICAgIGxldCBvdXRlclNldCA9IGVsLl94X21vZGVsLnNldDtcbiAgICBsZXQgcmVsZWFzZUVudGFuZ2xlbWVudCA9IGVudGFuZ2xlKFxuICAgICAge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIG91dGVyR2V0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgIG91dGVyU2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBpbm5lckdldCgpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICBpbm5lclNldCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIGNsZWFudXAyKHJlbGVhc2VFbnRhbmdsZW1lbnQpO1xuICB9KTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LXRlbGVwb3J0LmpzXG5kaXJlY3RpdmUoXCJ0ZWxlcG9ydFwiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcInRlbXBsYXRlXCIpXG4gICAgd2FybihcIngtdGVsZXBvcnQgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIDx0ZW1wbGF0ZT4gdGFnXCIsIGVsKTtcbiAgbGV0IHRhcmdldCA9IGdldFRhcmdldChleHByZXNzaW9uKTtcbiAgbGV0IGNsb25lMiA9IGVsLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICBlbC5feF90ZWxlcG9ydCA9IGNsb25lMjtcbiAgY2xvbmUyLl94X3RlbGVwb3J0QmFjayA9IGVsO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRlbGVwb3J0LXRlbXBsYXRlXCIsIHRydWUpO1xuICBjbG9uZTIuc2V0QXR0cmlidXRlKFwiZGF0YS10ZWxlcG9ydC10YXJnZXRcIiwgdHJ1ZSk7XG4gIGlmIChlbC5feF9mb3J3YXJkRXZlbnRzKSB7XG4gICAgZWwuX3hfZm9yd2FyZEV2ZW50cy5mb3JFYWNoKChldmVudE5hbWUpID0+IHtcbiAgICAgIGNsb25lMi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgZS5jb25zdHJ1Y3RvcihlLnR5cGUsIGUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGFkZFNjb3BlVG9Ob2RlKGNsb25lMiwge30sIGVsKTtcbiAgbGV0IHBsYWNlSW5Eb20gPSAoY2xvbmUzLCB0YXJnZXQyLCBtb2RpZmllcnMyKSA9PiB7XG4gICAgaWYgKG1vZGlmaWVyczIuaW5jbHVkZXMoXCJwcmVwZW5kXCIpKSB7XG4gICAgICB0YXJnZXQyLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNsb25lMywgdGFyZ2V0Mik7XG4gICAgfSBlbHNlIGlmIChtb2RpZmllcnMyLmluY2x1ZGVzKFwiYXBwZW5kXCIpKSB7XG4gICAgICB0YXJnZXQyLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNsb25lMywgdGFyZ2V0Mi5uZXh0U2libGluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldDIuYXBwZW5kQ2hpbGQoY2xvbmUzKTtcbiAgICB9XG4gIH07XG4gIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgcGxhY2VJbkRvbShjbG9uZTIsIHRhcmdldCwgbW9kaWZpZXJzKTtcbiAgICBza2lwRHVyaW5nQ2xvbmUoKCkgPT4ge1xuICAgICAgaW5pdFRyZWUoY2xvbmUyKTtcbiAgICB9KSgpO1xuICB9KTtcbiAgZWwuX3hfdGVsZXBvcnRQdXRCYWNrID0gKCkgPT4ge1xuICAgIGxldCB0YXJnZXQyID0gZ2V0VGFyZ2V0KGV4cHJlc3Npb24pO1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBwbGFjZUluRG9tKGVsLl94X3RlbGVwb3J0LCB0YXJnZXQyLCBtb2RpZmllcnMpO1xuICAgIH0pO1xuICB9O1xuICBjbGVhbnVwMihcbiAgICAoKSA9PiBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgY2xvbmUyLnJlbW92ZSgpO1xuICAgICAgZGVzdHJveVRyZWUoY2xvbmUyKTtcbiAgICB9KVxuICApO1xufSk7XG52YXIgdGVsZXBvcnRDb250YWluZXJEdXJpbmdDbG9uZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5mdW5jdGlvbiBnZXRUYXJnZXQoZXhwcmVzc2lvbikge1xuICBsZXQgdGFyZ2V0ID0gc2tpcER1cmluZ0Nsb25lKCgpID0+IHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihleHByZXNzaW9uKTtcbiAgfSwgKCkgPT4ge1xuICAgIHJldHVybiB0ZWxlcG9ydENvbnRhaW5lckR1cmluZ0Nsb25lO1xuICB9KSgpO1xuICBpZiAoIXRhcmdldClcbiAgICB3YXJuKGBDYW5ub3QgZmluZCB4LXRlbGVwb3J0IGVsZW1lbnQgZm9yIHNlbGVjdG9yOiBcIiR7ZXhwcmVzc2lvbn1cImApO1xuICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlnbm9yZS5qc1xudmFyIGhhbmRsZXIgPSAoKSA9PiB7XG59O1xuaGFuZGxlci5pbmxpbmUgPSAoZWwsIHsgbW9kaWZpZXJzIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBtb2RpZmllcnMuaW5jbHVkZXMoXCJzZWxmXCIpID8gZWwuX3hfaWdub3JlU2VsZiA9IHRydWUgOiBlbC5feF9pZ25vcmUgPSB0cnVlO1xuICBjbGVhbnVwMigoKSA9PiB7XG4gICAgbW9kaWZpZXJzLmluY2x1ZGVzKFwic2VsZlwiKSA/IGRlbGV0ZSBlbC5feF9pZ25vcmVTZWxmIDogZGVsZXRlIGVsLl94X2lnbm9yZTtcbiAgfSk7XG59O1xuZGlyZWN0aXZlKFwiaWdub3JlXCIsIGhhbmRsZXIpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWVmZmVjdC5qc1xuZGlyZWN0aXZlKFwiZWZmZWN0XCIsIHNraXBEdXJpbmdDbG9uZSgoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MyB9KSA9PiB7XG4gIGVmZmVjdDMoZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikpO1xufSkpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvb24uanNcbmZ1bmN0aW9uIG9uKGVsLCBldmVudCwgbW9kaWZpZXJzLCBjYWxsYmFjaykge1xuICBsZXQgbGlzdGVuZXJUYXJnZXQgPSBlbDtcbiAgbGV0IGhhbmRsZXI0ID0gKGUpID0+IGNhbGxiYWNrKGUpO1xuICBsZXQgb3B0aW9ucyA9IHt9O1xuICBsZXQgd3JhcEhhbmRsZXIgPSAoY2FsbGJhY2syLCB3cmFwcGVyKSA9PiAoZSkgPT4gd3JhcHBlcihjYWxsYmFjazIsIGUpO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZG90XCIpKVxuICAgIGV2ZW50ID0gZG90U3ludGF4KGV2ZW50KTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImNhbWVsXCIpKVxuICAgIGV2ZW50ID0gY2FtZWxDYXNlMihldmVudCk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJwYXNzaXZlXCIpKVxuICAgIG9wdGlvbnMucGFzc2l2ZSA9IHRydWU7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJjYXB0dXJlXCIpKVxuICAgIG9wdGlvbnMuY2FwdHVyZSA9IHRydWU7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJ3aW5kb3dcIikpXG4gICAgbGlzdGVuZXJUYXJnZXQgPSB3aW5kb3c7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJkb2N1bWVudFwiKSlcbiAgICBsaXN0ZW5lclRhcmdldCA9IGRvY3VtZW50O1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZGVib3VuY2VcIikpIHtcbiAgICBsZXQgbmV4dE1vZGlmaWVyID0gbW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKFwiZGVib3VuY2VcIikgKyAxXSB8fCBcImludmFsaWQtd2FpdFwiO1xuICAgIGxldCB3YWl0ID0gaXNOdW1lcmljKG5leHRNb2RpZmllci5zcGxpdChcIm1zXCIpWzBdKSA/IE51bWJlcihuZXh0TW9kaWZpZXIuc3BsaXQoXCJtc1wiKVswXSkgOiAyNTA7XG4gICAgaGFuZGxlcjQgPSBkZWJvdW5jZShoYW5kbGVyNCwgd2FpdCk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInRocm90dGxlXCIpKSB7XG4gICAgbGV0IG5leHRNb2RpZmllciA9IG1vZGlmaWVyc1ttb2RpZmllcnMuaW5kZXhPZihcInRocm90dGxlXCIpICsgMV0gfHwgXCJpbnZhbGlkLXdhaXRcIjtcbiAgICBsZXQgd2FpdCA9IGlzTnVtZXJpYyhuZXh0TW9kaWZpZXIuc3BsaXQoXCJtc1wiKVswXSkgPyBOdW1iZXIobmV4dE1vZGlmaWVyLnNwbGl0KFwibXNcIilbMF0pIDogMjUwO1xuICAgIGhhbmRsZXI0ID0gdGhyb3R0bGUoaGFuZGxlcjQsIHdhaXQpO1xuICB9XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJwcmV2ZW50XCIpKVxuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwic3RvcFwiKSlcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIG5leHQoZSk7XG4gICAgfSk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJvbmNlXCIpKSB7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIG5leHQoZSk7XG4gICAgICBsaXN0ZW5lclRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyNCwgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImF3YXlcIikgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwib3V0c2lkZVwiKSkge1xuICAgIGxpc3RlbmVyVGFyZ2V0ID0gZG9jdW1lbnQ7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGlmIChlbC5jb250YWlucyhlLnRhcmdldCkpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChlLnRhcmdldC5pc0Nvbm5lY3RlZCA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChlbC5vZmZzZXRXaWR0aCA8IDEgJiYgZWwub2Zmc2V0SGVpZ2h0IDwgMSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGVsLl94X2lzU2hvd24gPT09IGZhbHNlKVxuICAgICAgICByZXR1cm47XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICB9XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJzZWxmXCIpKVxuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBlLnRhcmdldCA9PT0gZWwgJiYgbmV4dChlKTtcbiAgICB9KTtcbiAgaWYgKGlzS2V5RXZlbnQoZXZlbnQpIHx8IGlzQ2xpY2tFdmVudChldmVudCkpIHtcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgaWYgKGlzTGlzdGVuaW5nRm9yQVNwZWNpZmljS2V5VGhhdEhhc250QmVlblByZXNzZWQoZSwgbW9kaWZpZXJzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICB9XG4gIGxpc3RlbmVyVGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXI0LCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsaXN0ZW5lclRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyNCwgb3B0aW9ucyk7XG4gIH07XG59XG5mdW5jdGlvbiBkb3RTeW50YXgoc3ViamVjdCkge1xuICByZXR1cm4gc3ViamVjdC5yZXBsYWNlKC8tL2csIFwiLlwiKTtcbn1cbmZ1bmN0aW9uIGNhbWVsQ2FzZTIoc3ViamVjdCkge1xuICByZXR1cm4gc3ViamVjdC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLy0oXFx3KS9nLCAobWF0Y2gsIGNoYXIpID0+IGNoYXIudG9VcHBlckNhc2UoKSk7XG59XG5mdW5jdGlvbiBpc051bWVyaWMoc3ViamVjdCkge1xuICByZXR1cm4gIUFycmF5LmlzQXJyYXkoc3ViamVjdCkgJiYgIWlzTmFOKHN1YmplY3QpO1xufVxuZnVuY3Rpb24ga2ViYWJDYXNlMihzdWJqZWN0KSB7XG4gIGlmIChbXCIgXCIsIFwiX1wiXS5pbmNsdWRlcyhcbiAgICBzdWJqZWN0XG4gICkpXG4gICAgcmV0dXJuIHN1YmplY3Q7XG4gIHJldHVybiBzdWJqZWN0LnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csIFwiJDEtJDJcIikucmVwbGFjZSgvW19cXHNdLywgXCItXCIpLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBpc0tleUV2ZW50KGV2ZW50KSB7XG4gIHJldHVybiBbXCJrZXlkb3duXCIsIFwia2V5dXBcIl0uaW5jbHVkZXMoZXZlbnQpO1xufVxuZnVuY3Rpb24gaXNDbGlja0V2ZW50KGV2ZW50KSB7XG4gIHJldHVybiBbXCJjb250ZXh0bWVudVwiLCBcImNsaWNrXCIsIFwibW91c2VcIl0uc29tZSgoaSkgPT4gZXZlbnQuaW5jbHVkZXMoaSkpO1xufVxuZnVuY3Rpb24gaXNMaXN0ZW5pbmdGb3JBU3BlY2lmaWNLZXlUaGF0SGFzbnRCZWVuUHJlc3NlZChlLCBtb2RpZmllcnMpIHtcbiAgbGV0IGtleU1vZGlmaWVycyA9IG1vZGlmaWVycy5maWx0ZXIoKGkpID0+IHtcbiAgICByZXR1cm4gIVtcIndpbmRvd1wiLCBcImRvY3VtZW50XCIsIFwicHJldmVudFwiLCBcInN0b3BcIiwgXCJvbmNlXCIsIFwiY2FwdHVyZVwiLCBcInNlbGZcIiwgXCJhd2F5XCIsIFwib3V0c2lkZVwiLCBcInBhc3NpdmVcIiwgXCJwcmVzZXJ2ZS1zY3JvbGxcIl0uaW5jbHVkZXMoaSk7XG4gIH0pO1xuICBpZiAoa2V5TW9kaWZpZXJzLmluY2x1ZGVzKFwiZGVib3VuY2VcIikpIHtcbiAgICBsZXQgZGVib3VuY2VJbmRleCA9IGtleU1vZGlmaWVycy5pbmRleE9mKFwiZGVib3VuY2VcIik7XG4gICAga2V5TW9kaWZpZXJzLnNwbGljZShkZWJvdW5jZUluZGV4LCBpc051bWVyaWMoKGtleU1vZGlmaWVyc1tkZWJvdW5jZUluZGV4ICsgMV0gfHwgXCJpbnZhbGlkLXdhaXRcIikuc3BsaXQoXCJtc1wiKVswXSkgPyAyIDogMSk7XG4gIH1cbiAgaWYgKGtleU1vZGlmaWVycy5pbmNsdWRlcyhcInRocm90dGxlXCIpKSB7XG4gICAgbGV0IGRlYm91bmNlSW5kZXggPSBrZXlNb2RpZmllcnMuaW5kZXhPZihcInRocm90dGxlXCIpO1xuICAgIGtleU1vZGlmaWVycy5zcGxpY2UoZGVib3VuY2VJbmRleCwgaXNOdW1lcmljKChrZXlNb2RpZmllcnNbZGVib3VuY2VJbmRleCArIDFdIHx8IFwiaW52YWxpZC13YWl0XCIpLnNwbGl0KFwibXNcIilbMF0pID8gMiA6IDEpO1xuICB9XG4gIGlmIChrZXlNb2RpZmllcnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGtleU1vZGlmaWVycy5sZW5ndGggPT09IDEgJiYga2V5VG9Nb2RpZmllcnMoZS5rZXkpLmluY2x1ZGVzKGtleU1vZGlmaWVyc1swXSkpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBzeXN0ZW1LZXlNb2RpZmllcnMgPSBbXCJjdHJsXCIsIFwic2hpZnRcIiwgXCJhbHRcIiwgXCJtZXRhXCIsIFwiY21kXCIsIFwic3VwZXJcIl07XG4gIGNvbnN0IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzID0gc3lzdGVtS2V5TW9kaWZpZXJzLmZpbHRlcigobW9kaWZpZXIpID0+IGtleU1vZGlmaWVycy5pbmNsdWRlcyhtb2RpZmllcikpO1xuICBrZXlNb2RpZmllcnMgPSBrZXlNb2RpZmllcnMuZmlsdGVyKChpKSA9PiAhc2VsZWN0ZWRTeXN0ZW1LZXlNb2RpZmllcnMuaW5jbHVkZXMoaSkpO1xuICBpZiAoc2VsZWN0ZWRTeXN0ZW1LZXlNb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFjdGl2ZWx5UHJlc3NlZEtleU1vZGlmaWVycyA9IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmZpbHRlcigobW9kaWZpZXIpID0+IHtcbiAgICAgIGlmIChtb2RpZmllciA9PT0gXCJjbWRcIiB8fCBtb2RpZmllciA9PT0gXCJzdXBlclwiKVxuICAgICAgICBtb2RpZmllciA9IFwibWV0YVwiO1xuICAgICAgcmV0dXJuIGVbYCR7bW9kaWZpZXJ9S2V5YF07XG4gICAgfSk7XG4gICAgaWYgKGFjdGl2ZWx5UHJlc3NlZEtleU1vZGlmaWVycy5sZW5ndGggPT09IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgaWYgKGlzQ2xpY2tFdmVudChlLnR5cGUpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoa2V5VG9Nb2RpZmllcnMoZS5rZXkpLmluY2x1ZGVzKGtleU1vZGlmaWVyc1swXSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBrZXlUb01vZGlmaWVycyhrZXkpIHtcbiAgaWYgKCFrZXkpXG4gICAgcmV0dXJuIFtdO1xuICBrZXkgPSBrZWJhYkNhc2UyKGtleSk7XG4gIGxldCBtb2RpZmllclRvS2V5TWFwID0ge1xuICAgIFwiY3RybFwiOiBcImNvbnRyb2xcIixcbiAgICBcInNsYXNoXCI6IFwiL1wiLFxuICAgIFwic3BhY2VcIjogXCIgXCIsXG4gICAgXCJzcGFjZWJhclwiOiBcIiBcIixcbiAgICBcImNtZFwiOiBcIm1ldGFcIixcbiAgICBcImVzY1wiOiBcImVzY2FwZVwiLFxuICAgIFwidXBcIjogXCJhcnJvdy11cFwiLFxuICAgIFwiZG93blwiOiBcImFycm93LWRvd25cIixcbiAgICBcImxlZnRcIjogXCJhcnJvdy1sZWZ0XCIsXG4gICAgXCJyaWdodFwiOiBcImFycm93LXJpZ2h0XCIsXG4gICAgXCJwZXJpb2RcIjogXCIuXCIsXG4gICAgXCJjb21tYVwiOiBcIixcIixcbiAgICBcImVxdWFsXCI6IFwiPVwiLFxuICAgIFwibWludXNcIjogXCItXCIsXG4gICAgXCJ1bmRlcnNjb3JlXCI6IFwiX1wiXG4gIH07XG4gIG1vZGlmaWVyVG9LZXlNYXBba2V5XSA9IGtleTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG1vZGlmaWVyVG9LZXlNYXApLm1hcCgobW9kaWZpZXIpID0+IHtcbiAgICBpZiAobW9kaWZpZXJUb0tleU1hcFttb2RpZmllcl0gPT09IGtleSlcbiAgICAgIHJldHVybiBtb2RpZmllcjtcbiAgfSkuZmlsdGVyKChtb2RpZmllcikgPT4gbW9kaWZpZXIpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LW1vZGVsLmpzXG5kaXJlY3RpdmUoXCJtb2RlbFwiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGxldCBzY29wZVRhcmdldCA9IGVsO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwicGFyZW50XCIpKSB7XG4gICAgc2NvcGVUYXJnZXQgPSBlbC5wYXJlbnROb2RlO1xuICB9XG4gIGxldCBldmFsdWF0ZUdldCA9IGV2YWx1YXRlTGF0ZXIoc2NvcGVUYXJnZXQsIGV4cHJlc3Npb24pO1xuICBsZXQgZXZhbHVhdGVTZXQ7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGV2YWx1YXRlU2V0ID0gZXZhbHVhdGVMYXRlcihzY29wZVRhcmdldCwgYCR7ZXhwcmVzc2lvbn0gPSBfX3BsYWNlaG9sZGVyYCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgZXhwcmVzc2lvbigpID09PSBcInN0cmluZ1wiKSB7XG4gICAgZXZhbHVhdGVTZXQgPSBldmFsdWF0ZUxhdGVyKHNjb3BlVGFyZ2V0LCBgJHtleHByZXNzaW9uKCl9ID0gX19wbGFjZWhvbGRlcmApO1xuICB9IGVsc2Uge1xuICAgIGV2YWx1YXRlU2V0ID0gKCkgPT4ge1xuICAgIH07XG4gIH1cbiAgbGV0IGdldFZhbHVlID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZXZhbHVhdGVHZXQoKHZhbHVlKSA9PiByZXN1bHQgPSB2YWx1ZSk7XG4gICAgcmV0dXJuIGlzR2V0dGVyU2V0dGVyKHJlc3VsdCkgPyByZXN1bHQuZ2V0KCkgOiByZXN1bHQ7XG4gIH07XG4gIGxldCBzZXRWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZXZhbHVhdGVHZXQoKHZhbHVlMikgPT4gcmVzdWx0ID0gdmFsdWUyKTtcbiAgICBpZiAoaXNHZXR0ZXJTZXR0ZXIocmVzdWx0KSkge1xuICAgICAgcmVzdWx0LnNldCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2YWx1YXRlU2V0KCgpID0+IHtcbiAgICAgIH0sIHtcbiAgICAgICAgc2NvcGU6IHsgXCJfX3BsYWNlaG9sZGVyXCI6IHZhbHVlIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGVsLnR5cGUgPT09IFwicmFkaW9cIikge1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBpZiAoIWVsLmhhc0F0dHJpYnV0ZShcIm5hbWVcIikpXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShcIm5hbWVcIiwgZXhwcmVzc2lvbik7XG4gICAgfSk7XG4gIH1cbiAgbGV0IGV2ZW50ID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiIHx8IFtcImNoZWNrYm94XCIsIFwicmFkaW9cIl0uaW5jbHVkZXMoZWwudHlwZSkgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwibGF6eVwiKSA/IFwiY2hhbmdlXCIgOiBcImlucHV0XCI7XG4gIGxldCByZW1vdmVMaXN0ZW5lciA9IGlzQ2xvbmluZyA/ICgpID0+IHtcbiAgfSA6IG9uKGVsLCBldmVudCwgbW9kaWZpZXJzLCAoZSkgPT4ge1xuICAgIHNldFZhbHVlKGdldElucHV0VmFsdWUoZWwsIG1vZGlmaWVycywgZSwgZ2V0VmFsdWUoKSkpO1xuICB9KTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImZpbGxcIikpIHtcbiAgICBpZiAoW3ZvaWQgMCwgbnVsbCwgXCJcIl0uaW5jbHVkZXMoZ2V0VmFsdWUoKSkgfHwgaXNDaGVja2JveChlbCkgJiYgQXJyYXkuaXNBcnJheShnZXRWYWx1ZSgpKSB8fCBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic2VsZWN0XCIgJiYgZWwubXVsdGlwbGUpIHtcbiAgICAgIHNldFZhbHVlKFxuICAgICAgICBnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIHsgdGFyZ2V0OiBlbCB9LCBnZXRWYWx1ZSgpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVycylcbiAgICBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVycyA9IHt9O1xuICBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVyc1tcImRlZmF1bHRcIl0gPSByZW1vdmVMaXN0ZW5lcjtcbiAgY2xlYW51cDIoKCkgPT4gZWwuX3hfcmVtb3ZlTW9kZWxMaXN0ZW5lcnNbXCJkZWZhdWx0XCJdKCkpO1xuICBpZiAoZWwuZm9ybSkge1xuICAgIGxldCByZW1vdmVSZXNldExpc3RlbmVyID0gb24oZWwuZm9ybSwgXCJyZXNldFwiLCBbXSwgKGUpID0+IHtcbiAgICAgIG5leHRUaWNrKCgpID0+IGVsLl94X21vZGVsICYmIGVsLl94X21vZGVsLnNldChnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIHsgdGFyZ2V0OiBlbCB9LCBnZXRWYWx1ZSgpKSkpO1xuICAgIH0pO1xuICAgIGNsZWFudXAyKCgpID0+IHJlbW92ZVJlc2V0TGlzdGVuZXIoKSk7XG4gIH1cbiAgZWwuX3hfbW9kZWwgPSB7XG4gICAgZ2V0KCkge1xuICAgICAgcmV0dXJuIGdldFZhbHVlKCk7XG4gICAgfSxcbiAgICBzZXQodmFsdWUpIHtcbiAgICAgIHNldFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH07XG4gIGVsLl94X2ZvcmNlTW9kZWxVcGRhdGUgPSAodmFsdWUpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCAmJiB0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLm1hdGNoKC9cXC4vKSlcbiAgICAgIHZhbHVlID0gXCJcIjtcbiAgICB3aW5kb3cuZnJvbU1vZGVsID0gdHJ1ZTtcbiAgICBtdXRhdGVEb20oKCkgPT4gYmluZChlbCwgXCJ2YWx1ZVwiLCB2YWx1ZSkpO1xuICAgIGRlbGV0ZSB3aW5kb3cuZnJvbU1vZGVsO1xuICB9O1xuICBlZmZlY3QzKCgpID0+IHtcbiAgICBsZXQgdmFsdWUgPSBnZXRWYWx1ZSgpO1xuICAgIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJ1bmludHJ1c2l2ZVwiKSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmlzU2FtZU5vZGUoZWwpKVxuICAgICAgcmV0dXJuO1xuICAgIGVsLl94X2ZvcmNlTW9kZWxVcGRhdGUodmFsdWUpO1xuICB9KTtcbn0pO1xuZnVuY3Rpb24gZ2V0SW5wdXRWYWx1ZShlbCwgbW9kaWZpZXJzLCBldmVudCwgY3VycmVudFZhbHVlKSB7XG4gIHJldHVybiBtdXRhdGVEb20oKCkgPT4ge1xuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIEN1c3RvbUV2ZW50ICYmIGV2ZW50LmRldGFpbCAhPT0gdm9pZCAwKVxuICAgICAgcmV0dXJuIGV2ZW50LmRldGFpbCAhPT0gbnVsbCAmJiBldmVudC5kZXRhaWwgIT09IHZvaWQgMCA/IGV2ZW50LmRldGFpbCA6IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBlbHNlIGlmIChpc0NoZWNrYm94KGVsKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBsZXQgbmV3VmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibnVtYmVyXCIpKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBzYWZlUGFyc2VOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJib29sZWFuXCIpKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBzYWZlUGFyc2VCb29sZWFuKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldC5jaGVja2VkID8gY3VycmVudFZhbHVlLmluY2x1ZGVzKG5ld1ZhbHVlKSA/IGN1cnJlbnRWYWx1ZSA6IGN1cnJlbnRWYWx1ZS5jb25jYXQoW25ld1ZhbHVlXSkgOiBjdXJyZW50VmFsdWUuZmlsdGVyKChlbDIpID0+ICFjaGVja2VkQXR0ckxvb3NlQ29tcGFyZTIoZWwyLCBuZXdWYWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldC5jaGVja2VkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiICYmIGVsLm11bHRpcGxlKSB7XG4gICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibnVtYmVyXCIpKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGV2ZW50LnRhcmdldC5zZWxlY3RlZE9wdGlvbnMpLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgICAgbGV0IHJhd1ZhbHVlID0gb3B0aW9uLnZhbHVlIHx8IG9wdGlvbi50ZXh0O1xuICAgICAgICAgIHJldHVybiBzYWZlUGFyc2VOdW1iZXIocmF3VmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiYm9vbGVhblwiKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShldmVudC50YXJnZXQuc2VsZWN0ZWRPcHRpb25zKS5tYXAoKG9wdGlvbikgPT4ge1xuICAgICAgICAgIGxldCByYXdWYWx1ZSA9IG9wdGlvbi52YWx1ZSB8fCBvcHRpb24udGV4dDtcbiAgICAgICAgICByZXR1cm4gc2FmZVBhcnNlQm9vbGVhbihyYXdWYWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnQudGFyZ2V0LnNlbGVjdGVkT3B0aW9ucykubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbi52YWx1ZSB8fCBvcHRpb24udGV4dDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbmV3VmFsdWU7XG4gICAgICBpZiAoaXNSYWRpbyhlbCkpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBjdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm51bWJlclwiKSkge1xuICAgICAgICByZXR1cm4gc2FmZVBhcnNlTnVtYmVyKG5ld1ZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiYm9vbGVhblwiKSkge1xuICAgICAgICByZXR1cm4gc2FmZVBhcnNlQm9vbGVhbihuZXdWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInRyaW1cIikpIHtcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlLnRyaW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gc2FmZVBhcnNlTnVtYmVyKHJhd1ZhbHVlKSB7XG4gIGxldCBudW1iZXIgPSByYXdWYWx1ZSA/IHBhcnNlRmxvYXQocmF3VmFsdWUpIDogbnVsbDtcbiAgcmV0dXJuIGlzTnVtZXJpYzIobnVtYmVyKSA/IG51bWJlciA6IHJhd1ZhbHVlO1xufVxuZnVuY3Rpb24gY2hlY2tlZEF0dHJMb29zZUNvbXBhcmUyKHZhbHVlQSwgdmFsdWVCKSB7XG4gIHJldHVybiB2YWx1ZUEgPT0gdmFsdWVCO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljMihzdWJqZWN0KSB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheShzdWJqZWN0KSAmJiAhaXNOYU4oc3ViamVjdCk7XG59XG5mdW5jdGlvbiBpc0dldHRlclNldHRlcih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS5nZXQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsdWUuc2V0ID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtY2xvYWsuanNcbmRpcmVjdGl2ZShcImNsb2FrXCIsIChlbCkgPT4gcXVldWVNaWNyb3Rhc2soKCkgPT4gbXV0YXRlRG9tKCgpID0+IGVsLnJlbW92ZUF0dHJpYnV0ZShwcmVmaXgoXCJjbG9ha1wiKSkpKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaW5pdC5qc1xuYWRkSW5pdFNlbGVjdG9yKCgpID0+IGBbJHtwcmVmaXgoXCJpbml0XCIpfV1gKTtcbmRpcmVjdGl2ZShcImluaXRcIiwgc2tpcER1cmluZ0Nsb25lKChlbCwgeyBleHByZXNzaW9uIH0sIHsgZXZhbHVhdGU6IGV2YWx1YXRlMiB9KSA9PiB7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiAhIWV4cHJlc3Npb24udHJpbSgpICYmIGV2YWx1YXRlMihleHByZXNzaW9uLCB7fSwgZmFsc2UpO1xuICB9XG4gIHJldHVybiBldmFsdWF0ZTIoZXhwcmVzc2lvbiwge30sIGZhbHNlKTtcbn0pKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC10ZXh0LmpzXG5kaXJlY3RpdmUoXCJ0ZXh0XCIsIChlbCwgeyBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBldmFsdWF0ZUxhdGVyOiBldmFsdWF0ZUxhdGVyMiB9KSA9PiB7XG4gIGxldCBldmFsdWF0ZTIgPSBldmFsdWF0ZUxhdGVyMihleHByZXNzaW9uKTtcbiAgZWZmZWN0MygoKSA9PiB7XG4gICAgZXZhbHVhdGUyKCh2YWx1ZSkgPT4ge1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgZWwudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWh0bWwuanNcbmRpcmVjdGl2ZShcImh0bWxcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMsIGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIyIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIyKGV4cHJlc3Npb24pO1xuICBlZmZlY3QzKCgpID0+IHtcbiAgICBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgICAgZWwuX3hfaWdub3JlU2VsZiA9IHRydWU7XG4gICAgICAgIGluaXRUcmVlKGVsKTtcbiAgICAgICAgZGVsZXRlIGVsLl94X2lnbm9yZVNlbGY7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1iaW5kLmpzXG5tYXBBdHRyaWJ1dGVzKHN0YXJ0aW5nV2l0aChcIjpcIiwgaW50byhwcmVmaXgoXCJiaW5kOlwiKSkpKTtcbnZhciBoYW5kbGVyMiA9IChlbCwgeyB2YWx1ZSwgbW9kaWZpZXJzLCBleHByZXNzaW9uLCBvcmlnaW5hbCB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgbGV0IGJpbmRpbmdQcm92aWRlcnMgPSB7fTtcbiAgICBpbmplY3RCaW5kaW5nUHJvdmlkZXJzKGJpbmRpbmdQcm92aWRlcnMpO1xuICAgIGxldCBnZXRCaW5kaW5ncyA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICAgIGdldEJpbmRpbmdzKChiaW5kaW5ncykgPT4ge1xuICAgICAgYXBwbHlCaW5kaW5nc09iamVjdChlbCwgYmluZGluZ3MsIG9yaWdpbmFsKTtcbiAgICB9LCB7IHNjb3BlOiBiaW5kaW5nUHJvdmlkZXJzIH0pO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodmFsdWUgPT09IFwia2V5XCIpXG4gICAgcmV0dXJuIHN0b3JlS2V5Rm9yWEZvcihlbCwgZXhwcmVzc2lvbik7XG4gIGlmIChlbC5feF9pbmxpbmVCaW5kaW5ncyAmJiBlbC5feF9pbmxpbmVCaW5kaW5nc1t2YWx1ZV0gJiYgZWwuX3hfaW5saW5lQmluZGluZ3NbdmFsdWVdLmV4dHJhY3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBlZmZlY3QzKCgpID0+IGV2YWx1YXRlMigocmVzdWx0KSA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwICYmIHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGV4cHJlc3Npb24ubWF0Y2goL1xcLi8pKSB7XG4gICAgICByZXN1bHQgPSBcIlwiO1xuICAgIH1cbiAgICBtdXRhdGVEb20oKCkgPT4gYmluZChlbCwgdmFsdWUsIHJlc3VsdCwgbW9kaWZpZXJzKSk7XG4gIH0pKTtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIGVsLl94X3VuZG9BZGRlZENsYXNzZXMgJiYgZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcygpO1xuICAgIGVsLl94X3VuZG9BZGRlZFN0eWxlcyAmJiBlbC5feF91bmRvQWRkZWRTdHlsZXMoKTtcbiAgfSk7XG59O1xuaGFuZGxlcjIuaW5saW5lID0gKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSkgPT4ge1xuICBpZiAoIXZhbHVlKVxuICAgIHJldHVybjtcbiAgaWYgKCFlbC5feF9pbmxpbmVCaW5kaW5ncylcbiAgICBlbC5feF9pbmxpbmVCaW5kaW5ncyA9IHt9O1xuICBlbC5feF9pbmxpbmVCaW5kaW5nc1t2YWx1ZV0gPSB7IGV4cHJlc3Npb24sIGV4dHJhY3Q6IGZhbHNlIH07XG59O1xuZGlyZWN0aXZlKFwiYmluZFwiLCBoYW5kbGVyMik7XG5mdW5jdGlvbiBzdG9yZUtleUZvclhGb3IoZWwsIGV4cHJlc3Npb24pIHtcbiAgZWwuX3hfa2V5RXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtZGF0YS5qc1xuYWRkUm9vdFNlbGVjdG9yKCgpID0+IGBbJHtwcmVmaXgoXCJkYXRhXCIpfV1gKTtcbmRpcmVjdGl2ZShcImRhdGFcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGlmIChzaG91bGRTa2lwUmVnaXN0ZXJpbmdEYXRhRHVyaW5nQ2xvbmUoZWwpKVxuICAgIHJldHVybjtcbiAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24gPT09IFwiXCIgPyBcInt9XCIgOiBleHByZXNzaW9uO1xuICBsZXQgbWFnaWNDb250ZXh0ID0ge307XG4gIGluamVjdE1hZ2ljcyhtYWdpY0NvbnRleHQsIGVsKTtcbiAgbGV0IGRhdGFQcm92aWRlckNvbnRleHQgPSB7fTtcbiAgaW5qZWN0RGF0YVByb3ZpZGVycyhkYXRhUHJvdmlkZXJDb250ZXh0LCBtYWdpY0NvbnRleHQpO1xuICBsZXQgZGF0YTIgPSBldmFsdWF0ZShlbCwgZXhwcmVzc2lvbiwgeyBzY29wZTogZGF0YVByb3ZpZGVyQ29udGV4dCB9KTtcbiAgaWYgKGRhdGEyID09PSB2b2lkIDAgfHwgZGF0YTIgPT09IHRydWUpXG4gICAgZGF0YTIgPSB7fTtcbiAgaW5qZWN0TWFnaWNzKGRhdGEyLCBlbCk7XG4gIGxldCByZWFjdGl2ZURhdGEgPSByZWFjdGl2ZShkYXRhMik7XG4gIGluaXRJbnRlcmNlcHRvcnMocmVhY3RpdmVEYXRhKTtcbiAgbGV0IHVuZG8gPSBhZGRTY29wZVRvTm9kZShlbCwgcmVhY3RpdmVEYXRhKTtcbiAgcmVhY3RpdmVEYXRhW1wiaW5pdFwiXSAmJiBldmFsdWF0ZShlbCwgcmVhY3RpdmVEYXRhW1wiaW5pdFwiXSk7XG4gIGNsZWFudXAyKCgpID0+IHtcbiAgICByZWFjdGl2ZURhdGFbXCJkZXN0cm95XCJdICYmIGV2YWx1YXRlKGVsLCByZWFjdGl2ZURhdGFbXCJkZXN0cm95XCJdKTtcbiAgICB1bmRvKCk7XG4gIH0pO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfZGF0YVN0YWNrKSB7XG4gICAgdG8uX3hfZGF0YVN0YWNrID0gZnJvbS5feF9kYXRhU3RhY2s7XG4gICAgdG8uc2V0QXR0cmlidXRlKFwiZGF0YS1oYXMtYWxwaW5lLXN0YXRlXCIsIHRydWUpO1xuICB9XG59KTtcbmZ1bmN0aW9uIHNob3VsZFNraXBSZWdpc3RlcmluZ0RhdGFEdXJpbmdDbG9uZShlbCkge1xuICBpZiAoIWlzQ2xvbmluZylcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChpc0Nsb25pbmdMZWdhY3kpXG4gICAgcmV0dXJuIHRydWU7XG4gIHJldHVybiBlbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWhhcy1hbHBpbmUtc3RhdGVcIik7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtc2hvdy5qc1xuZGlyZWN0aXZlKFwic2hvd1wiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBpZiAoIWVsLl94X2RvSGlkZSlcbiAgICBlbC5feF9kb0hpZGUgPSAoKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eShcImRpc3BsYXlcIiwgXCJub25lXCIsIG1vZGlmaWVycy5pbmNsdWRlcyhcImltcG9ydGFudFwiKSA/IFwiaW1wb3J0YW50XCIgOiB2b2lkIDApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgaWYgKCFlbC5feF9kb1Nob3cpXG4gICAgZWwuX3hfZG9TaG93ID0gKCkgPT4ge1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgaWYgKGVsLnN0eWxlLmxlbmd0aCA9PT0gMSAmJiBlbC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZGlzcGxheVwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgbGV0IGhpZGUgPSAoKSA9PiB7XG4gICAgZWwuX3hfZG9IaWRlKCk7XG4gICAgZWwuX3hfaXNTaG93biA9IGZhbHNlO1xuICB9O1xuICBsZXQgc2hvdyA9ICgpID0+IHtcbiAgICBlbC5feF9kb1Nob3coKTtcbiAgICBlbC5feF9pc1Nob3duID0gdHJ1ZTtcbiAgfTtcbiAgbGV0IGNsaWNrQXdheUNvbXBhdGlibGVTaG93ID0gKCkgPT4gc2V0VGltZW91dChzaG93KTtcbiAgbGV0IHRvZ2dsZSA9IG9uY2UoXG4gICAgKHZhbHVlKSA9PiB2YWx1ZSA/IHNob3coKSA6IGhpZGUoKSxcbiAgICAodmFsdWUpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZWwuX3hfdG9nZ2xlQW5kQ2FzY2FkZVdpdGhUcmFuc2l0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGVsLl94X3RvZ2dsZUFuZENhc2NhZGVXaXRoVHJhbnNpdGlvbnMoZWwsIHZhbHVlLCBzaG93LCBoaWRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID8gY2xpY2tBd2F5Q29tcGF0aWJsZVNob3coKSA6IGhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG4gIGxldCBvbGRWYWx1ZTtcbiAgbGV0IGZpcnN0VGltZSA9IHRydWU7XG4gIGVmZmVjdDMoKCkgPT4gZXZhbHVhdGUyKCh2YWx1ZSkgPT4ge1xuICAgIGlmICghZmlyc3RUaW1lICYmIHZhbHVlID09PSBvbGRWYWx1ZSlcbiAgICAgIHJldHVybjtcbiAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiaW1tZWRpYXRlXCIpKVxuICAgICAgdmFsdWUgPyBjbGlja0F3YXlDb21wYXRpYmxlU2hvdygpIDogaGlkZSgpO1xuICAgIHRvZ2dsZSh2YWx1ZSk7XG4gICAgb2xkVmFsdWUgPSB2YWx1ZTtcbiAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgfSkpO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtZm9yLmpzXG5kaXJlY3RpdmUoXCJmb3JcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMsIGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgbGV0IGl0ZXJhdG9yTmFtZXMgPSBwYXJzZUZvckV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIGxldCBldmFsdWF0ZUl0ZW1zID0gZXZhbHVhdGVMYXRlcihlbCwgaXRlcmF0b3JOYW1lcy5pdGVtcyk7XG4gIGxldCBldmFsdWF0ZUtleSA9IGV2YWx1YXRlTGF0ZXIoXG4gICAgZWwsXG4gICAgLy8gdGhlIHgtYmluZDprZXkgZXhwcmVzc2lvbiBpcyBzdG9yZWQgZm9yIG91ciB1c2UgaW5zdGVhZCBvZiBldmFsdWF0ZWQuXG4gICAgZWwuX3hfa2V5RXhwcmVzc2lvbiB8fCBcImluZGV4XCJcbiAgKTtcbiAgZWwuX3hfcHJldktleXMgPSBbXTtcbiAgZWwuX3hfbG9va3VwID0ge307XG4gIGVmZmVjdDMoKCkgPT4gbG9vcChlbCwgaXRlcmF0b3JOYW1lcywgZXZhbHVhdGVJdGVtcywgZXZhbHVhdGVLZXkpKTtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIE9iamVjdC52YWx1ZXMoZWwuX3hfbG9va3VwKS5mb3JFYWNoKChlbDIpID0+IG11dGF0ZURvbShcbiAgICAgICgpID0+IHtcbiAgICAgICAgZGVzdHJveVRyZWUoZWwyKTtcbiAgICAgICAgZWwyLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICkpO1xuICAgIGRlbGV0ZSBlbC5feF9wcmV2S2V5cztcbiAgICBkZWxldGUgZWwuX3hfbG9va3VwO1xuICB9KTtcbn0pO1xuZnVuY3Rpb24gbG9vcChlbCwgaXRlcmF0b3JOYW1lcywgZXZhbHVhdGVJdGVtcywgZXZhbHVhdGVLZXkpIHtcbiAgbGV0IGlzT2JqZWN0MiA9IChpKSA9PiB0eXBlb2YgaSA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShpKTtcbiAgbGV0IHRlbXBsYXRlRWwgPSBlbDtcbiAgZXZhbHVhdGVJdGVtcygoaXRlbXMpID0+IHtcbiAgICBpZiAoaXNOdW1lcmljMyhpdGVtcykgJiYgaXRlbXMgPj0gMCkge1xuICAgICAgaXRlbXMgPSBBcnJheS5mcm9tKEFycmF5KGl0ZW1zKS5rZXlzKCksIChpKSA9PiBpICsgMSk7XG4gICAgfVxuICAgIGlmIChpdGVtcyA9PT0gdm9pZCAwKVxuICAgICAgaXRlbXMgPSBbXTtcbiAgICBsZXQgbG9va3VwID0gZWwuX3hfbG9va3VwO1xuICAgIGxldCBwcmV2S2V5cyA9IGVsLl94X3ByZXZLZXlzO1xuICAgIGxldCBzY29wZXMgPSBbXTtcbiAgICBsZXQga2V5cyA9IFtdO1xuICAgIGlmIChpc09iamVjdDIoaXRlbXMpKSB7XG4gICAgICBpdGVtcyA9IE9iamVjdC5lbnRyaWVzKGl0ZW1zKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBsZXQgc2NvcGUyID0gZ2V0SXRlcmF0aW9uU2NvcGVWYXJpYWJsZXMoaXRlcmF0b3JOYW1lcywgdmFsdWUsIGtleSwgaXRlbXMpO1xuICAgICAgICBldmFsdWF0ZUtleSgodmFsdWUyKSA9PiB7XG4gICAgICAgICAgaWYgKGtleXMuaW5jbHVkZXModmFsdWUyKSlcbiAgICAgICAgICAgIHdhcm4oXCJEdXBsaWNhdGUga2V5IG9uIHgtZm9yXCIsIGVsKTtcbiAgICAgICAgICBrZXlzLnB1c2godmFsdWUyKTtcbiAgICAgICAgfSwgeyBzY29wZTogeyBpbmRleDoga2V5LCAuLi5zY29wZTIgfSB9KTtcbiAgICAgICAgc2NvcGVzLnB1c2goc2NvcGUyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBzY29wZTIgPSBnZXRJdGVyYXRpb25TY29wZVZhcmlhYmxlcyhpdGVyYXRvck5hbWVzLCBpdGVtc1tpXSwgaSwgaXRlbXMpO1xuICAgICAgICBldmFsdWF0ZUtleSgodmFsdWUpID0+IHtcbiAgICAgICAgICBpZiAoa2V5cy5pbmNsdWRlcyh2YWx1ZSkpXG4gICAgICAgICAgICB3YXJuKFwiRHVwbGljYXRlIGtleSBvbiB4LWZvclwiLCBlbCk7XG4gICAgICAgICAga2V5cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSwgeyBzY29wZTogeyBpbmRleDogaSwgLi4uc2NvcGUyIH0gfSk7XG4gICAgICAgIHNjb3Blcy5wdXNoKHNjb3BlMik7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBhZGRzID0gW107XG4gICAgbGV0IG1vdmVzID0gW107XG4gICAgbGV0IHJlbW92ZXMgPSBbXTtcbiAgICBsZXQgc2FtZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXZLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0gcHJldktleXNbaV07XG4gICAgICBpZiAoa2V5cy5pbmRleE9mKGtleSkgPT09IC0xKVxuICAgICAgICByZW1vdmVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcHJldktleXMgPSBwcmV2S2V5cy5maWx0ZXIoKGtleSkgPT4gIXJlbW92ZXMuaW5jbHVkZXMoa2V5KSk7XG4gICAgbGV0IGxhc3RLZXkgPSBcInRlbXBsYXRlXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0ga2V5c1tpXTtcbiAgICAgIGxldCBwcmV2SW5kZXggPSBwcmV2S2V5cy5pbmRleE9mKGtleSk7XG4gICAgICBpZiAocHJldkluZGV4ID09PSAtMSkge1xuICAgICAgICBwcmV2S2V5cy5zcGxpY2UoaSwgMCwga2V5KTtcbiAgICAgICAgYWRkcy5wdXNoKFtsYXN0S2V5LCBpXSk7XG4gICAgICB9IGVsc2UgaWYgKHByZXZJbmRleCAhPT0gaSkge1xuICAgICAgICBsZXQga2V5SW5TcG90ID0gcHJldktleXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICBsZXQga2V5Rm9yU3BvdCA9IHByZXZLZXlzLnNwbGljZShwcmV2SW5kZXggLSAxLCAxKVswXTtcbiAgICAgICAgcHJldktleXMuc3BsaWNlKGksIDAsIGtleUZvclNwb3QpO1xuICAgICAgICBwcmV2S2V5cy5zcGxpY2UocHJldkluZGV4LCAwLCBrZXlJblNwb3QpO1xuICAgICAgICBtb3Zlcy5wdXNoKFtrZXlJblNwb3QsIGtleUZvclNwb3RdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhbWVzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICAgIGxhc3RLZXkgPSBrZXk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3Zlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGtleSA9IHJlbW92ZXNbaV07XG4gICAgICBpZiAoIShrZXkgaW4gbG9va3VwKSlcbiAgICAgICAgY29udGludWU7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBkZXN0cm95VHJlZShsb29rdXBba2V5XSk7XG4gICAgICAgIGxvb2t1cFtrZXldLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgICBkZWxldGUgbG9va3VwW2tleV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBba2V5SW5TcG90LCBrZXlGb3JTcG90XSA9IG1vdmVzW2ldO1xuICAgICAgbGV0IGVsSW5TcG90ID0gbG9va3VwW2tleUluU3BvdF07XG4gICAgICBsZXQgZWxGb3JTcG90ID0gbG9va3VwW2tleUZvclNwb3RdO1xuICAgICAgbGV0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBpZiAoIWVsRm9yU3BvdClcbiAgICAgICAgICB3YXJuKGB4LWZvciBcIjprZXlcIiBpcyB1bmRlZmluZWQgb3IgaW52YWxpZGAsIHRlbXBsYXRlRWwsIGtleUZvclNwb3QsIGxvb2t1cCk7XG4gICAgICAgIGVsRm9yU3BvdC5hZnRlcihtYXJrZXIpO1xuICAgICAgICBlbEluU3BvdC5hZnRlcihlbEZvclNwb3QpO1xuICAgICAgICBlbEZvclNwb3QuX3hfY3VycmVudElmRWwgJiYgZWxGb3JTcG90LmFmdGVyKGVsRm9yU3BvdC5feF9jdXJyZW50SWZFbCk7XG4gICAgICAgIG1hcmtlci5iZWZvcmUoZWxJblNwb3QpO1xuICAgICAgICBlbEluU3BvdC5feF9jdXJyZW50SWZFbCAmJiBlbEluU3BvdC5hZnRlcihlbEluU3BvdC5feF9jdXJyZW50SWZFbCk7XG4gICAgICAgIG1hcmtlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgZWxGb3JTcG90Ll94X3JlZnJlc2hYRm9yU2NvcGUoc2NvcGVzW2tleXMuaW5kZXhPZihrZXlGb3JTcG90KV0pO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbbGFzdEtleTIsIGluZGV4XSA9IGFkZHNbaV07XG4gICAgICBsZXQgbGFzdEVsID0gbGFzdEtleTIgPT09IFwidGVtcGxhdGVcIiA/IHRlbXBsYXRlRWwgOiBsb29rdXBbbGFzdEtleTJdO1xuICAgICAgaWYgKGxhc3RFbC5feF9jdXJyZW50SWZFbClcbiAgICAgICAgbGFzdEVsID0gbGFzdEVsLl94X2N1cnJlbnRJZkVsO1xuICAgICAgbGV0IHNjb3BlMiA9IHNjb3Blc1tpbmRleF07XG4gICAgICBsZXQga2V5ID0ga2V5c1tpbmRleF07XG4gICAgICBsZXQgY2xvbmUyID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZUVsLmNvbnRlbnQsIHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgbGV0IHJlYWN0aXZlU2NvcGUgPSByZWFjdGl2ZShzY29wZTIpO1xuICAgICAgYWRkU2NvcGVUb05vZGUoY2xvbmUyLCByZWFjdGl2ZVNjb3BlLCB0ZW1wbGF0ZUVsKTtcbiAgICAgIGNsb25lMi5feF9yZWZyZXNoWEZvclNjb3BlID0gKG5ld1Njb3BlKSA9PiB7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKG5ld1Njb3BlKS5mb3JFYWNoKChba2V5MiwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgcmVhY3RpdmVTY29wZVtrZXkyXSA9IHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBsYXN0RWwuYWZ0ZXIoY2xvbmUyKTtcbiAgICAgICAgc2tpcER1cmluZ0Nsb25lKCgpID0+IGluaXRUcmVlKGNsb25lMikpKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHdhcm4oXCJ4LWZvciBrZXkgY2Fubm90IGJlIGFuIG9iamVjdCwgaXQgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBpbnRlZ2VyXCIsIHRlbXBsYXRlRWwpO1xuICAgICAgfVxuICAgICAgbG9va3VwW2tleV0gPSBjbG9uZTI7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2FtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxvb2t1cFtzYW1lc1tpXV0uX3hfcmVmcmVzaFhGb3JTY29wZShzY29wZXNba2V5cy5pbmRleE9mKHNhbWVzW2ldKV0pO1xuICAgIH1cbiAgICB0ZW1wbGF0ZUVsLl94X3ByZXZLZXlzID0ga2V5cztcbiAgfSk7XG59XG5mdW5jdGlvbiBwYXJzZUZvckV4cHJlc3Npb24oZXhwcmVzc2lvbikge1xuICBsZXQgZm9ySXRlcmF0b3JSRSA9IC8sKFteLFxcfVxcXV0qKSg/OiwoW14sXFx9XFxdXSopKT8kLztcbiAgbGV0IHN0cmlwUGFyZW5zUkUgPSAvXlxccypcXCh8XFwpXFxzKiQvZztcbiAgbGV0IGZvckFsaWFzUkUgPSAvKFtcXHNcXFNdKj8pXFxzKyg/OmlufG9mKVxccysoW1xcc1xcU10qKS87XG4gIGxldCBpbk1hdGNoID0gZXhwcmVzc2lvbi5tYXRjaChmb3JBbGlhc1JFKTtcbiAgaWYgKCFpbk1hdGNoKVxuICAgIHJldHVybjtcbiAgbGV0IHJlcyA9IHt9O1xuICByZXMuaXRlbXMgPSBpbk1hdGNoWzJdLnRyaW0oKTtcbiAgbGV0IGl0ZW0gPSBpbk1hdGNoWzFdLnJlcGxhY2Uoc3RyaXBQYXJlbnNSRSwgXCJcIikudHJpbSgpO1xuICBsZXQgaXRlcmF0b3JNYXRjaCA9IGl0ZW0ubWF0Y2goZm9ySXRlcmF0b3JSRSk7XG4gIGlmIChpdGVyYXRvck1hdGNoKSB7XG4gICAgcmVzLml0ZW0gPSBpdGVtLnJlcGxhY2UoZm9ySXRlcmF0b3JSRSwgXCJcIikudHJpbSgpO1xuICAgIHJlcy5pbmRleCA9IGl0ZXJhdG9yTWF0Y2hbMV0udHJpbSgpO1xuICAgIGlmIChpdGVyYXRvck1hdGNoWzJdKSB7XG4gICAgICByZXMuY29sbGVjdGlvbiA9IGl0ZXJhdG9yTWF0Y2hbMl0udHJpbSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXMuaXRlbSA9IGl0ZW07XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uIGdldEl0ZXJhdGlvblNjb3BlVmFyaWFibGVzKGl0ZXJhdG9yTmFtZXMsIGl0ZW0sIGluZGV4LCBpdGVtcykge1xuICBsZXQgc2NvcGVWYXJpYWJsZXMgPSB7fTtcbiAgaWYgKC9eXFxbLipcXF0kLy50ZXN0KGl0ZXJhdG9yTmFtZXMuaXRlbSkgJiYgQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgIGxldCBuYW1lcyA9IGl0ZXJhdG9yTmFtZXMuaXRlbS5yZXBsYWNlKFwiW1wiLCBcIlwiKS5yZXBsYWNlKFwiXVwiLCBcIlwiKS5zcGxpdChcIixcIikubWFwKChpKSA9PiBpLnRyaW0oKSk7XG4gICAgbmFtZXMuZm9yRWFjaCgobmFtZSwgaSkgPT4ge1xuICAgICAgc2NvcGVWYXJpYWJsZXNbbmFtZV0gPSBpdGVtW2ldO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKC9eXFx7LipcXH0kLy50ZXN0KGl0ZXJhdG9yTmFtZXMuaXRlbSkgJiYgIUFycmF5LmlzQXJyYXkoaXRlbSkgJiYgdHlwZW9mIGl0ZW0gPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgbmFtZXMgPSBpdGVyYXRvck5hbWVzLml0ZW0ucmVwbGFjZShcIntcIiwgXCJcIikucmVwbGFjZShcIn1cIiwgXCJcIikuc3BsaXQoXCIsXCIpLm1hcCgoaSkgPT4gaS50cmltKCkpO1xuICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHNjb3BlVmFyaWFibGVzW25hbWVdID0gaXRlbVtuYW1lXTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzY29wZVZhcmlhYmxlc1tpdGVyYXRvck5hbWVzLml0ZW1dID0gaXRlbTtcbiAgfVxuICBpZiAoaXRlcmF0b3JOYW1lcy5pbmRleClcbiAgICBzY29wZVZhcmlhYmxlc1tpdGVyYXRvck5hbWVzLmluZGV4XSA9IGluZGV4O1xuICBpZiAoaXRlcmF0b3JOYW1lcy5jb2xsZWN0aW9uKVxuICAgIHNjb3BlVmFyaWFibGVzW2l0ZXJhdG9yTmFtZXMuY29sbGVjdGlvbl0gPSBpdGVtcztcbiAgcmV0dXJuIHNjb3BlVmFyaWFibGVzO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljMyhzdWJqZWN0KSB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheShzdWJqZWN0KSAmJiAhaXNOYU4oc3ViamVjdCk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtcmVmLmpzXG5mdW5jdGlvbiBoYW5kbGVyMygpIHtcbn1cbmhhbmRsZXIzLmlubGluZSA9IChlbCwgeyBleHByZXNzaW9uIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBsZXQgcm9vdCA9IGNsb3Nlc3RSb290KGVsKTtcbiAgaWYgKCFyb290Ll94X3JlZnMpXG4gICAgcm9vdC5feF9yZWZzID0ge307XG4gIHJvb3QuX3hfcmVmc1tleHByZXNzaW9uXSA9IGVsO1xuICBjbGVhbnVwMigoKSA9PiBkZWxldGUgcm9vdC5feF9yZWZzW2V4cHJlc3Npb25dKTtcbn07XG5kaXJlY3RpdmUoXCJyZWZcIiwgaGFuZGxlcjMpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlmLmpzXG5kaXJlY3RpdmUoXCJpZlwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcInRlbXBsYXRlXCIpXG4gICAgd2FybihcIngtaWYgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIDx0ZW1wbGF0ZT4gdGFnXCIsIGVsKTtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBsZXQgc2hvdyA9ICgpID0+IHtcbiAgICBpZiAoZWwuX3hfY3VycmVudElmRWwpXG4gICAgICByZXR1cm4gZWwuX3hfY3VycmVudElmRWw7XG4gICAgbGV0IGNsb25lMiA9IGVsLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGFkZFNjb3BlVG9Ob2RlKGNsb25lMiwge30sIGVsKTtcbiAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgZWwuYWZ0ZXIoY2xvbmUyKTtcbiAgICAgIHNraXBEdXJpbmdDbG9uZSgoKSA9PiBpbml0VHJlZShjbG9uZTIpKSgpO1xuICAgIH0pO1xuICAgIGVsLl94X2N1cnJlbnRJZkVsID0gY2xvbmUyO1xuICAgIGVsLl94X3VuZG9JZiA9ICgpID0+IHtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGRlc3Ryb3lUcmVlKGNsb25lMik7XG4gICAgICAgIGNsb25lMi5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgZGVsZXRlIGVsLl94X2N1cnJlbnRJZkVsO1xuICAgIH07XG4gICAgcmV0dXJuIGNsb25lMjtcbiAgfTtcbiAgbGV0IGhpZGUgPSAoKSA9PiB7XG4gICAgaWYgKCFlbC5feF91bmRvSWYpXG4gICAgICByZXR1cm47XG4gICAgZWwuX3hfdW5kb0lmKCk7XG4gICAgZGVsZXRlIGVsLl94X3VuZG9JZjtcbiAgfTtcbiAgZWZmZWN0MygoKSA9PiBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgdmFsdWUgPyBzaG93KCkgOiBoaWRlKCk7XG4gIH0pKTtcbiAgY2xlYW51cDIoKCkgPT4gZWwuX3hfdW5kb0lmICYmIGVsLl94X3VuZG9JZigpKTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlkLmpzXG5kaXJlY3RpdmUoXCJpZFwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGV2YWx1YXRlOiBldmFsdWF0ZTIgfSkgPT4ge1xuICBsZXQgbmFtZXMgPSBldmFsdWF0ZTIoZXhwcmVzc2lvbik7XG4gIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHNldElkUm9vdChlbCwgbmFtZSkpO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfaWRzKSB7XG4gICAgdG8uX3hfaWRzID0gZnJvbS5feF9pZHM7XG4gIH1cbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LW9uLmpzXG5tYXBBdHRyaWJ1dGVzKHN0YXJ0aW5nV2l0aChcIkBcIiwgaW50byhwcmVmaXgoXCJvbjpcIikpKSk7XG5kaXJlY3RpdmUoXCJvblwiLCBza2lwRHVyaW5nQ2xvbmUoKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGxldCBldmFsdWF0ZTIgPSBleHByZXNzaW9uID8gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikgOiAoKSA9PiB7XG4gIH07XG4gIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwidGVtcGxhdGVcIikge1xuICAgIGlmICghZWwuX3hfZm9yd2FyZEV2ZW50cylcbiAgICAgIGVsLl94X2ZvcndhcmRFdmVudHMgPSBbXTtcbiAgICBpZiAoIWVsLl94X2ZvcndhcmRFdmVudHMuaW5jbHVkZXModmFsdWUpKVxuICAgICAgZWwuX3hfZm9yd2FyZEV2ZW50cy5wdXNoKHZhbHVlKTtcbiAgfVxuICBsZXQgcmVtb3ZlTGlzdGVuZXIgPSBvbihlbCwgdmFsdWUsIG1vZGlmaWVycywgKGUpID0+IHtcbiAgICBldmFsdWF0ZTIoKCkgPT4ge1xuICAgIH0sIHsgc2NvcGU6IHsgXCIkZXZlbnRcIjogZSB9LCBwYXJhbXM6IFtlXSB9KTtcbiAgfSk7XG4gIGNsZWFudXAyKCgpID0+IHJlbW92ZUxpc3RlbmVyKCkpO1xufSkpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy9pbmRleC5qc1xud2Fybk1pc3NpbmdQbHVnaW5EaXJlY3RpdmUoXCJDb2xsYXBzZVwiLCBcImNvbGxhcHNlXCIsIFwiY29sbGFwc2VcIik7XG53YXJuTWlzc2luZ1BsdWdpbkRpcmVjdGl2ZShcIkludGVyc2VjdFwiLCBcImludGVyc2VjdFwiLCBcImludGVyc2VjdFwiKTtcbndhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKFwiRm9jdXNcIiwgXCJ0cmFwXCIsIFwiZm9jdXNcIik7XG53YXJuTWlzc2luZ1BsdWdpbkRpcmVjdGl2ZShcIk1hc2tcIiwgXCJtYXNrXCIsIFwibWFza1wiKTtcbmZ1bmN0aW9uIHdhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKG5hbWUsIGRpcmVjdGl2ZU5hbWUsIHNsdWcpIHtcbiAgZGlyZWN0aXZlKGRpcmVjdGl2ZU5hbWUsIChlbCkgPT4gd2FybihgWW91IGNhbid0IHVzZSBbeC0ke2RpcmVjdGl2ZU5hbWV9XSB3aXRob3V0IGZpcnN0IGluc3RhbGxpbmcgdGhlIFwiJHtuYW1lfVwiIHBsdWdpbiBoZXJlOiBodHRwczovL2FscGluZWpzLmRldi9wbHVnaW5zLyR7c2x1Z31gLCBlbCkpO1xufVxuXG4vLyBwYWNrYWdlcy9jc3Avc3JjL2luZGV4LmpzXG5hbHBpbmVfZGVmYXVsdC5zZXRFdmFsdWF0b3IoY3NwRXZhbHVhdG9yKTtcbmFscGluZV9kZWZhdWx0LnNldFJlYWN0aXZpdHlFbmdpbmUoeyByZWFjdGl2ZTogcmVhY3RpdmUyLCBlZmZlY3Q6IGVmZmVjdDIsIHJlbGVhc2U6IHN0b3AsIHJhdzogdG9SYXcgfSk7XG52YXIgc3JjX2RlZmF1bHQgPSBhbHBpbmVfZGVmYXVsdDtcblxuLy8gcGFja2FnZXMvY3NwL2J1aWxkcy9tb2R1bGUuanNcbnZhciBtb2R1bGVfZGVmYXVsdCA9IHNyY19kZWZhdWx0O1xuZXhwb3J0IHtcbiAgc3JjX2RlZmF1bHQgYXMgQWxwaW5lLFxuICBtb2R1bGVfZGVmYXVsdCBhcyBkZWZhdWx0XG59O1xuIiwgIi8vIHBhY2thZ2VzL3BlcnNpc3Qvc3JjL2luZGV4LmpzXG5mdW5jdGlvbiBzcmNfZGVmYXVsdChBbHBpbmUpIHtcbiAgbGV0IHBlcnNpc3QgPSAoKSA9PiB7XG4gICAgbGV0IGFsaWFzO1xuICAgIGxldCBzdG9yYWdlO1xuICAgIHRyeSB7XG4gICAgICBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICBjb25zb2xlLndhcm4oXCJBbHBpbmU6ICRwZXJzaXN0IGlzIHVzaW5nIHRlbXBvcmFyeSBzdG9yYWdlIHNpbmNlIGxvY2FsU3RvcmFnZSBpcyB1bmF2YWlsYWJsZS5cIik7XG4gICAgICBsZXQgZHVtbXkgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgc3RvcmFnZSA9IHtcbiAgICAgICAgZ2V0SXRlbTogZHVtbXkuZ2V0LmJpbmQoZHVtbXkpLFxuICAgICAgICBzZXRJdGVtOiBkdW1teS5zZXQuYmluZChkdW1teSlcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBBbHBpbmUuaW50ZXJjZXB0b3IoKGluaXRpYWxWYWx1ZSwgZ2V0dGVyLCBzZXR0ZXIsIHBhdGgsIGtleSkgPT4ge1xuICAgICAgbGV0IGxvb2t1cCA9IGFsaWFzIHx8IGBfeF8ke3BhdGh9YDtcbiAgICAgIGxldCBpbml0aWFsID0gc3RvcmFnZUhhcyhsb29rdXAsIHN0b3JhZ2UpID8gc3RvcmFnZUdldChsb29rdXAsIHN0b3JhZ2UpIDogaW5pdGlhbFZhbHVlO1xuICAgICAgc2V0dGVyKGluaXRpYWwpO1xuICAgICAgQWxwaW5lLmVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IGdldHRlcigpO1xuICAgICAgICBzdG9yYWdlU2V0KGxvb2t1cCwgdmFsdWUsIHN0b3JhZ2UpO1xuICAgICAgICBzZXR0ZXIodmFsdWUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5pdGlhbDtcbiAgICB9LCAoZnVuYykgPT4ge1xuICAgICAgZnVuYy5hcyA9IChrZXkpID0+IHtcbiAgICAgICAgYWxpYXMgPSBrZXk7XG4gICAgICAgIHJldHVybiBmdW5jO1xuICAgICAgfSwgZnVuYy51c2luZyA9ICh0YXJnZXQpID0+IHtcbiAgICAgICAgc3RvcmFnZSA9IHRhcmdldDtcbiAgICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWxwaW5lLCBcIiRwZXJzaXN0XCIsIHsgZ2V0OiAoKSA9PiBwZXJzaXN0KCkgfSk7XG4gIEFscGluZS5tYWdpYyhcInBlcnNpc3RcIiwgcGVyc2lzdCk7XG4gIEFscGluZS5wZXJzaXN0ID0gKGtleSwgeyBnZXQsIHNldCB9LCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlKSA9PiB7XG4gICAgbGV0IGluaXRpYWwgPSBzdG9yYWdlSGFzKGtleSwgc3RvcmFnZSkgPyBzdG9yYWdlR2V0KGtleSwgc3RvcmFnZSkgOiBnZXQoKTtcbiAgICBzZXQoaW5pdGlhbCk7XG4gICAgQWxwaW5lLmVmZmVjdCgoKSA9PiB7XG4gICAgICBsZXQgdmFsdWUgPSBnZXQoKTtcbiAgICAgIHN0b3JhZ2VTZXQoa2V5LCB2YWx1ZSwgc3RvcmFnZSk7XG4gICAgICBzZXQodmFsdWUpO1xuICAgIH0pO1xuICB9O1xufVxuZnVuY3Rpb24gc3RvcmFnZUhhcyhrZXksIHN0b3JhZ2UpIHtcbiAgcmV0dXJuIHN0b3JhZ2UuZ2V0SXRlbShrZXkpICE9PSBudWxsO1xufVxuZnVuY3Rpb24gc3RvcmFnZUdldChrZXksIHN0b3JhZ2UpIHtcbiAgbGV0IHZhbHVlID0gc3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIGlmICh2YWx1ZSA9PT0gdm9pZCAwKVxuICAgIHJldHVybjtcbiAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpO1xufVxuZnVuY3Rpb24gc3RvcmFnZVNldChrZXksIHZhbHVlLCBzdG9yYWdlKSB7XG4gIHN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59XG5cbi8vIHBhY2thZ2VzL3BlcnNpc3QvYnVpbGRzL21vZHVsZS5qc1xudmFyIG1vZHVsZV9kZWZhdWx0ID0gc3JjX2RlZmF1bHQ7XG5leHBvcnQge1xuICBtb2R1bGVfZGVmYXVsdCBhcyBkZWZhdWx0LFxuICBzcmNfZGVmYXVsdCBhcyBwZXJzaXN0XG59O1xuIiwgIi8vIHBhY2thZ2VzL2ludGVyc2VjdC9zcmMvaW5kZXguanNcbmZ1bmN0aW9uIHNyY19kZWZhdWx0KEFscGluZSkge1xuICBBbHBpbmUuZGlyZWN0aXZlKFwiaW50ZXJzZWN0XCIsIEFscGluZS5za2lwRHVyaW5nQ2xvbmUoKGVsLCB7IHZhbHVlLCBleHByZXNzaW9uLCBtb2RpZmllcnMgfSwgeyBldmFsdWF0ZUxhdGVyLCBjbGVhbnVwIH0pID0+IHtcbiAgICBsZXQgZXZhbHVhdGUgPSBldmFsdWF0ZUxhdGVyKGV4cHJlc3Npb24pO1xuICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgcm9vdE1hcmdpbjogZ2V0Um9vdE1hcmdpbihtb2RpZmllcnMpLFxuICAgICAgdGhyZXNob2xkOiBnZXRUaHJlc2hvbGQobW9kaWZpZXJzKVxuICAgIH07XG4gICAgbGV0IG9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICBlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZyA9PT0gKHZhbHVlID09PSBcImxlYXZlXCIpKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZXZhbHVhdGUoKTtcbiAgICAgICAgbW9kaWZpZXJzLmluY2x1ZGVzKFwib25jZVwiKSAmJiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICB9KTtcbiAgICB9LCBvcHRpb25zKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGVsKTtcbiAgICBjbGVhbnVwKCgpID0+IHtcbiAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9KTtcbiAgfSkpO1xufVxuZnVuY3Rpb24gZ2V0VGhyZXNob2xkKG1vZGlmaWVycykge1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZnVsbFwiKSlcbiAgICByZXR1cm4gMC45OTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImhhbGZcIikpXG4gICAgcmV0dXJuIDAuNTtcbiAgaWYgKCFtb2RpZmllcnMuaW5jbHVkZXMoXCJ0aHJlc2hvbGRcIikpXG4gICAgcmV0dXJuIDA7XG4gIGxldCB0aHJlc2hvbGQgPSBtb2RpZmllcnNbbW9kaWZpZXJzLmluZGV4T2YoXCJ0aHJlc2hvbGRcIikgKyAxXTtcbiAgaWYgKHRocmVzaG9sZCA9PT0gXCIxMDBcIilcbiAgICByZXR1cm4gMTtcbiAgaWYgKHRocmVzaG9sZCA9PT0gXCIwXCIpXG4gICAgcmV0dXJuIDA7XG4gIHJldHVybiBOdW1iZXIoYC4ke3RocmVzaG9sZH1gKTtcbn1cbmZ1bmN0aW9uIGdldExlbmd0aFZhbHVlKHJhd1ZhbHVlKSB7XG4gIGxldCBtYXRjaCA9IHJhd1ZhbHVlLm1hdGNoKC9eKC0/WzAtOV0rKShweHwlKT8kLyk7XG4gIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdICsgKG1hdGNoWzJdIHx8IFwicHhcIikgOiB2b2lkIDA7XG59XG5mdW5jdGlvbiBnZXRSb290TWFyZ2luKG1vZGlmaWVycykge1xuICBjb25zdCBrZXkgPSBcIm1hcmdpblwiO1xuICBjb25zdCBmYWxsYmFjayA9IFwiMHB4IDBweCAwcHggMHB4XCI7XG4gIGNvbnN0IGluZGV4ID0gbW9kaWZpZXJzLmluZGV4T2Yoa2V5KTtcbiAgaWYgKGluZGV4ID09PSAtMSlcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIGxldCB2YWx1ZXMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCA1OyBpKyspIHtcbiAgICB2YWx1ZXMucHVzaChnZXRMZW5ndGhWYWx1ZShtb2RpZmllcnNbaW5kZXggKyBpXSB8fCBcIlwiKSk7XG4gIH1cbiAgdmFsdWVzID0gdmFsdWVzLmZpbHRlcigodikgPT4gdiAhPT0gdm9pZCAwKTtcbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXMuam9pbihcIiBcIikudHJpbSgpIDogZmFsbGJhY2s7XG59XG5cbi8vIHBhY2thZ2VzL2ludGVyc2VjdC9idWlsZHMvbW9kdWxlLmpzXG52YXIgbW9kdWxlX2RlZmF1bHQgPSBzcmNfZGVmYXVsdDtcbmV4cG9ydCB7XG4gIG1vZHVsZV9kZWZhdWx0IGFzIGRlZmF1bHQsXG4gIHNyY19kZWZhdWx0IGFzIGludGVyc2VjdFxufTtcbiIsICIvLyBub2RlX21vZHVsZXMvdGFiYmFibGUvZGlzdC9pbmRleC5lc20uanNcbnZhciBjYW5kaWRhdGVTZWxlY3RvcnMgPSBbXCJpbnB1dFwiLCBcInNlbGVjdFwiLCBcInRleHRhcmVhXCIsIFwiYVtocmVmXVwiLCBcImJ1dHRvblwiLCBcIlt0YWJpbmRleF06bm90KHNsb3QpXCIsIFwiYXVkaW9bY29udHJvbHNdXCIsIFwidmlkZW9bY29udHJvbHNdXCIsICdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScsIFwiZGV0YWlscz5zdW1tYXJ5OmZpcnN0LW9mLXR5cGVcIiwgXCJkZXRhaWxzXCJdO1xudmFyIGNhbmRpZGF0ZVNlbGVjdG9yID0gLyogQF9fUFVSRV9fICovIGNhbmRpZGF0ZVNlbGVjdG9ycy5qb2luKFwiLFwiKTtcbnZhciBOb0VsZW1lbnQgPSB0eXBlb2YgRWxlbWVudCA9PT0gXCJ1bmRlZmluZWRcIjtcbnZhciBtYXRjaGVzID0gTm9FbGVtZW50ID8gZnVuY3Rpb24oKSB7XG59IDogRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyB8fCBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG52YXIgZ2V0Um9vdE5vZGUgPSAhTm9FbGVtZW50ICYmIEVsZW1lbnQucHJvdG90eXBlLmdldFJvb3ROb2RlID8gZnVuY3Rpb24oZWxlbWVudCkge1xuICByZXR1cm4gZWxlbWVudC5nZXRSb290Tm9kZSgpO1xufSA6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQub3duZXJEb2N1bWVudDtcbn07XG52YXIgZ2V0Q2FuZGlkYXRlcyA9IGZ1bmN0aW9uIGdldENhbmRpZGF0ZXMyKGVsLCBpbmNsdWRlQ29udGFpbmVyLCBmaWx0ZXIpIHtcbiAgdmFyIGNhbmRpZGF0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoZWwucXVlcnlTZWxlY3RvckFsbChjYW5kaWRhdGVTZWxlY3RvcikpO1xuICBpZiAoaW5jbHVkZUNvbnRhaW5lciAmJiBtYXRjaGVzLmNhbGwoZWwsIGNhbmRpZGF0ZVNlbGVjdG9yKSkge1xuICAgIGNhbmRpZGF0ZXMudW5zaGlmdChlbCk7XG4gIH1cbiAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuZmlsdGVyKGZpbHRlcik7XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcbnZhciBnZXRDYW5kaWRhdGVzSXRlcmF0aXZlbHkgPSBmdW5jdGlvbiBnZXRDYW5kaWRhdGVzSXRlcmF0aXZlbHkyKGVsZW1lbnRzLCBpbmNsdWRlQ29udGFpbmVyLCBvcHRpb25zKSB7XG4gIHZhciBjYW5kaWRhdGVzID0gW107XG4gIHZhciBlbGVtZW50c1RvQ2hlY2sgPSBBcnJheS5mcm9tKGVsZW1lbnRzKTtcbiAgd2hpbGUgKGVsZW1lbnRzVG9DaGVjay5sZW5ndGgpIHtcbiAgICB2YXIgZWxlbWVudCA9IGVsZW1lbnRzVG9DaGVjay5zaGlmdCgpO1xuICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiU0xPVFwiKSB7XG4gICAgICB2YXIgYXNzaWduZWQgPSBlbGVtZW50LmFzc2lnbmVkRWxlbWVudHMoKTtcbiAgICAgIHZhciBjb250ZW50ID0gYXNzaWduZWQubGVuZ3RoID8gYXNzaWduZWQgOiBlbGVtZW50LmNoaWxkcmVuO1xuICAgICAgdmFyIG5lc3RlZENhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzSXRlcmF0aXZlbHkyKGNvbnRlbnQsIHRydWUsIG9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMuZmxhdHRlbikge1xuICAgICAgICBjYW5kaWRhdGVzLnB1c2guYXBwbHkoY2FuZGlkYXRlcywgbmVzdGVkQ2FuZGlkYXRlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW5kaWRhdGVzLnB1c2goe1xuICAgICAgICAgIHNjb3BlOiBlbGVtZW50LFxuICAgICAgICAgIGNhbmRpZGF0ZXM6IG5lc3RlZENhbmRpZGF0ZXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2YWxpZENhbmRpZGF0ZSA9IG1hdGNoZXMuY2FsbChlbGVtZW50LCBjYW5kaWRhdGVTZWxlY3Rvcik7XG4gICAgICBpZiAodmFsaWRDYW5kaWRhdGUgJiYgb3B0aW9ucy5maWx0ZXIoZWxlbWVudCkgJiYgKGluY2x1ZGVDb250YWluZXIgfHwgIWVsZW1lbnRzLmluY2x1ZGVzKGVsZW1lbnQpKSkge1xuICAgICAgICBjYW5kaWRhdGVzLnB1c2goZWxlbWVudCk7XG4gICAgICB9XG4gICAgICB2YXIgc2hhZG93Um9vdCA9IGVsZW1lbnQuc2hhZG93Um9vdCB8fCAvLyBjaGVjayBmb3IgYW4gdW5kaXNjbG9zZWQgc2hhZG93XG4gICAgICB0eXBlb2Ygb3B0aW9ucy5nZXRTaGFkb3dSb290ID09PSBcImZ1bmN0aW9uXCIgJiYgb3B0aW9ucy5nZXRTaGFkb3dSb290KGVsZW1lbnQpO1xuICAgICAgdmFyIHZhbGlkU2hhZG93Um9vdCA9ICFvcHRpb25zLnNoYWRvd1Jvb3RGaWx0ZXIgfHwgb3B0aW9ucy5zaGFkb3dSb290RmlsdGVyKGVsZW1lbnQpO1xuICAgICAgaWYgKHNoYWRvd1Jvb3QgJiYgdmFsaWRTaGFkb3dSb290KSB7XG4gICAgICAgIHZhciBfbmVzdGVkQ2FuZGlkYXRlcyA9IGdldENhbmRpZGF0ZXNJdGVyYXRpdmVseTIoc2hhZG93Um9vdCA9PT0gdHJ1ZSA/IGVsZW1lbnQuY2hpbGRyZW4gOiBzaGFkb3dSb290LmNoaWxkcmVuLCB0cnVlLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMuZmxhdHRlbikge1xuICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaC5hcHBseShjYW5kaWRhdGVzLCBfbmVzdGVkQ2FuZGlkYXRlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FuZGlkYXRlcy5wdXNoKHtcbiAgICAgICAgICAgIHNjb3BlOiBlbGVtZW50LFxuICAgICAgICAgICAgY2FuZGlkYXRlczogX25lc3RlZENhbmRpZGF0ZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudHNUb0NoZWNrLnVuc2hpZnQuYXBwbHkoZWxlbWVudHNUb0NoZWNrLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59O1xudmFyIGdldFRhYmluZGV4ID0gZnVuY3Rpb24gZ2V0VGFiaW5kZXgyKG5vZGUsIGlzU2NvcGUpIHtcbiAgaWYgKG5vZGUudGFiSW5kZXggPCAwKSB7XG4gICAgaWYgKChpc1Njb3BlIHx8IC9eKEFVRElPfFZJREVPfERFVEFJTFMpJC8udGVzdChub2RlLnRhZ05hbWUpIHx8IG5vZGUuaXNDb250ZW50RWRpdGFibGUpICYmIGlzTmFOKHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiksIDEwKSkpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm9kZS50YWJJbmRleDtcbn07XG52YXIgc29ydE9yZGVyZWRUYWJiYWJsZXMgPSBmdW5jdGlvbiBzb3J0T3JkZXJlZFRhYmJhYmxlczIoYSwgYikge1xuICByZXR1cm4gYS50YWJJbmRleCA9PT0gYi50YWJJbmRleCA/IGEuZG9jdW1lbnRPcmRlciAtIGIuZG9jdW1lbnRPcmRlciA6IGEudGFiSW5kZXggLSBiLnRhYkluZGV4O1xufTtcbnZhciBpc0lucHV0ID0gZnVuY3Rpb24gaXNJbnB1dDIobm9kZSkge1xuICByZXR1cm4gbm9kZS50YWdOYW1lID09PSBcIklOUFVUXCI7XG59O1xudmFyIGlzSGlkZGVuSW5wdXQgPSBmdW5jdGlvbiBpc0hpZGRlbklucHV0Mihub2RlKSB7XG4gIHJldHVybiBpc0lucHV0KG5vZGUpICYmIG5vZGUudHlwZSA9PT0gXCJoaWRkZW5cIjtcbn07XG52YXIgaXNEZXRhaWxzV2l0aFN1bW1hcnkgPSBmdW5jdGlvbiBpc0RldGFpbHNXaXRoU3VtbWFyeTIobm9kZSkge1xuICB2YXIgciA9IG5vZGUudGFnTmFtZSA9PT0gXCJERVRBSUxTXCIgJiYgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG5vZGUuY2hpbGRyZW4pLnNvbWUoZnVuY3Rpb24oY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQudGFnTmFtZSA9PT0gXCJTVU1NQVJZXCI7XG4gIH0pO1xuICByZXR1cm4gcjtcbn07XG52YXIgZ2V0Q2hlY2tlZFJhZGlvID0gZnVuY3Rpb24gZ2V0Q2hlY2tlZFJhZGlvMihub2RlcywgZm9ybSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5vZGVzW2ldLmNoZWNrZWQgJiYgbm9kZXNbaV0uZm9ybSA9PT0gZm9ybSkge1xuICAgICAgcmV0dXJuIG5vZGVzW2ldO1xuICAgIH1cbiAgfVxufTtcbnZhciBpc1RhYmJhYmxlUmFkaW8gPSBmdW5jdGlvbiBpc1RhYmJhYmxlUmFkaW8yKG5vZGUpIHtcbiAgaWYgKCFub2RlLm5hbWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgcmFkaW9TY29wZSA9IG5vZGUuZm9ybSB8fCBnZXRSb290Tm9kZShub2RlKTtcbiAgdmFyIHF1ZXJ5UmFkaW9zID0gZnVuY3Rpb24gcXVlcnlSYWRpb3MyKG5hbWUpIHtcbiAgICByZXR1cm4gcmFkaW9TY29wZS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIicgKyBuYW1lICsgJ1wiXScpO1xuICB9O1xuICB2YXIgcmFkaW9TZXQ7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cuQ1NTICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cuQ1NTLmVzY2FwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmFkaW9TZXQgPSBxdWVyeVJhZGlvcyh3aW5kb3cuQ1NTLmVzY2FwZShub2RlLm5hbWUpKTtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgcmFkaW9TZXQgPSBxdWVyeVJhZGlvcyhub2RlLm5hbWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkxvb2tzIGxpa2UgeW91IGhhdmUgYSByYWRpbyBidXR0b24gd2l0aCBhIG5hbWUgYXR0cmlidXRlIGNvbnRhaW5pbmcgaW52YWxpZCBDU1Mgc2VsZWN0b3IgY2hhcmFjdGVycyBhbmQgbmVlZCB0aGUgQ1NTLmVzY2FwZSBwb2x5ZmlsbDogJXNcIiwgZXJyLm1lc3NhZ2UpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICB2YXIgY2hlY2tlZCA9IGdldENoZWNrZWRSYWRpbyhyYWRpb1NldCwgbm9kZS5mb3JtKTtcbiAgcmV0dXJuICFjaGVja2VkIHx8IGNoZWNrZWQgPT09IG5vZGU7XG59O1xudmFyIGlzUmFkaW8gPSBmdW5jdGlvbiBpc1JhZGlvMihub2RlKSB7XG4gIHJldHVybiBpc0lucHV0KG5vZGUpICYmIG5vZGUudHlwZSA9PT0gXCJyYWRpb1wiO1xufTtcbnZhciBpc05vblRhYmJhYmxlUmFkaW8gPSBmdW5jdGlvbiBpc05vblRhYmJhYmxlUmFkaW8yKG5vZGUpIHtcbiAgcmV0dXJuIGlzUmFkaW8obm9kZSkgJiYgIWlzVGFiYmFibGVSYWRpbyhub2RlKTtcbn07XG52YXIgaXNaZXJvQXJlYSA9IGZ1bmN0aW9uIGlzWmVyb0FyZWEyKG5vZGUpIHtcbiAgdmFyIF9ub2RlJGdldEJvdW5kaW5nQ2xpZSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHdpZHRoID0gX25vZGUkZ2V0Qm91bmRpbmdDbGllLndpZHRoLCBoZWlnaHQgPSBfbm9kZSRnZXRCb3VuZGluZ0NsaWUuaGVpZ2h0O1xuICByZXR1cm4gd2lkdGggPT09IDAgJiYgaGVpZ2h0ID09PSAwO1xufTtcbnZhciBpc0hpZGRlbiA9IGZ1bmN0aW9uIGlzSGlkZGVuMihub2RlLCBfcmVmKSB7XG4gIHZhciBkaXNwbGF5Q2hlY2sgPSBfcmVmLmRpc3BsYXlDaGVjaywgZ2V0U2hhZG93Um9vdCA9IF9yZWYuZ2V0U2hhZG93Um9vdDtcbiAgaWYgKGdldENvbXB1dGVkU3R5bGUobm9kZSkudmlzaWJpbGl0eSA9PT0gXCJoaWRkZW5cIikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBpc0RpcmVjdFN1bW1hcnkgPSBtYXRjaGVzLmNhbGwobm9kZSwgXCJkZXRhaWxzPnN1bW1hcnk6Zmlyc3Qtb2YtdHlwZVwiKTtcbiAgdmFyIG5vZGVVbmRlckRldGFpbHMgPSBpc0RpcmVjdFN1bW1hcnkgPyBub2RlLnBhcmVudEVsZW1lbnQgOiBub2RlO1xuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGVVbmRlckRldGFpbHMsIFwiZGV0YWlsczpub3QoW29wZW5dKSAqXCIpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIG5vZGVSb290SG9zdCA9IGdldFJvb3ROb2RlKG5vZGUpLmhvc3Q7XG4gIHZhciBub2RlSXNBdHRhY2hlZCA9IChub2RlUm9vdEhvc3QgPT09IG51bGwgfHwgbm9kZVJvb3RIb3N0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlUm9vdEhvc3Qub3duZXJEb2N1bWVudC5jb250YWlucyhub2RlUm9vdEhvc3QpKSB8fCBub2RlLm93bmVyRG9jdW1lbnQuY29udGFpbnMobm9kZSk7XG4gIGlmICghZGlzcGxheUNoZWNrIHx8IGRpc3BsYXlDaGVjayA9PT0gXCJmdWxsXCIpIHtcbiAgICBpZiAodHlwZW9mIGdldFNoYWRvd1Jvb3QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdmFyIG9yaWdpbmFsTm9kZSA9IG5vZGU7XG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICB2YXIgcGFyZW50RWxlbWVudCA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICAgICAgdmFyIHJvb3ROb2RlID0gZ2V0Um9vdE5vZGUobm9kZSk7XG4gICAgICAgIGlmIChwYXJlbnRFbGVtZW50ICYmICFwYXJlbnRFbGVtZW50LnNoYWRvd1Jvb3QgJiYgZ2V0U2hhZG93Um9vdChwYXJlbnRFbGVtZW50KSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHJldHVybiBpc1plcm9BcmVhKG5vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuYXNzaWduZWRTbG90KSB7XG4gICAgICAgICAgbm9kZSA9IG5vZGUuYXNzaWduZWRTbG90O1xuICAgICAgICB9IGVsc2UgaWYgKCFwYXJlbnRFbGVtZW50ICYmIHJvb3ROb2RlICE9PSBub2RlLm93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgICBub2RlID0gcm9vdE5vZGUuaG9zdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlID0gcGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZSA9IG9yaWdpbmFsTm9kZTtcbiAgICB9XG4gICAgaWYgKG5vZGVJc0F0dGFjaGVkKSB7XG4gICAgICByZXR1cm4gIW5vZGUuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRpc3BsYXlDaGVjayA9PT0gXCJub24temVyby1hcmVhXCIpIHtcbiAgICByZXR1cm4gaXNaZXJvQXJlYShub2RlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xudmFyIGlzRGlzYWJsZWRGcm9tRmllbGRzZXQgPSBmdW5jdGlvbiBpc0Rpc2FibGVkRnJvbUZpZWxkc2V0Mihub2RlKSB7XG4gIGlmICgvXihJTlBVVHxCVVRUT058U0VMRUNUfFRFWFRBUkVBKSQvLnRlc3Qobm9kZS50YWdOYW1lKSkge1xuICAgIHZhciBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIHdoaWxlIChwYXJlbnROb2RlKSB7XG4gICAgICBpZiAocGFyZW50Tm9kZS50YWdOYW1lID09PSBcIkZJRUxEU0VUXCIgJiYgcGFyZW50Tm9kZS5kaXNhYmxlZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudE5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSBwYXJlbnROb2RlLmNoaWxkcmVuLml0ZW0oaSk7XG4gICAgICAgICAgaWYgKGNoaWxkLnRhZ05hbWUgPT09IFwiTEVHRU5EXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzLmNhbGwocGFyZW50Tm9kZSwgXCJmaWVsZHNldFtkaXNhYmxlZF0gKlwiKSA/IHRydWUgOiAhY2hpbGQuY29udGFpbnMobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcGFyZW50Tm9kZSA9IHBhcmVudE5vZGUucGFyZW50RWxlbWVudDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbnZhciBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlID0gZnVuY3Rpb24gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZTIob3B0aW9ucywgbm9kZSkge1xuICBpZiAobm9kZS5kaXNhYmxlZCB8fCBpc0hpZGRlbklucHV0KG5vZGUpIHx8IGlzSGlkZGVuKG5vZGUsIG9wdGlvbnMpIHx8IC8vIEZvciBhIGRldGFpbHMgZWxlbWVudCB3aXRoIGEgc3VtbWFyeSwgdGhlIHN1bW1hcnkgZWxlbWVudCBnZXRzIHRoZSBmb2N1c1xuICBpc0RldGFpbHNXaXRoU3VtbWFyeShub2RlKSB8fCBpc0Rpc2FibGVkRnJvbUZpZWxkc2V0KG5vZGUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUgPSBmdW5jdGlvbiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUyKG9wdGlvbnMsIG5vZGUpIHtcbiAgaWYgKGlzTm9uVGFiYmFibGVSYWRpbyhub2RlKSB8fCBnZXRUYWJpbmRleChub2RlKSA8IDAgfHwgIWlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIGlzVmFsaWRTaGFkb3dSb290VGFiYmFibGUgPSBmdW5jdGlvbiBpc1ZhbGlkU2hhZG93Um9vdFRhYmJhYmxlMihzaGFkb3dIb3N0Tm9kZSkge1xuICB2YXIgdGFiSW5kZXggPSBwYXJzZUludChzaGFkb3dIb3N0Tm9kZS5nZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiKSwgMTApO1xuICBpZiAoaXNOYU4odGFiSW5kZXgpIHx8IHRhYkluZGV4ID49IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xudmFyIHNvcnRCeU9yZGVyID0gZnVuY3Rpb24gc29ydEJ5T3JkZXIyKGNhbmRpZGF0ZXMpIHtcbiAgdmFyIHJlZ3VsYXJUYWJiYWJsZXMgPSBbXTtcbiAgdmFyIG9yZGVyZWRUYWJiYWJsZXMgPSBbXTtcbiAgY2FuZGlkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICB2YXIgaXNTY29wZSA9ICEhaXRlbS5zY29wZTtcbiAgICB2YXIgZWxlbWVudCA9IGlzU2NvcGUgPyBpdGVtLnNjb3BlIDogaXRlbTtcbiAgICB2YXIgY2FuZGlkYXRlVGFiaW5kZXggPSBnZXRUYWJpbmRleChlbGVtZW50LCBpc1Njb3BlKTtcbiAgICB2YXIgZWxlbWVudHMgPSBpc1Njb3BlID8gc29ydEJ5T3JkZXIyKGl0ZW0uY2FuZGlkYXRlcykgOiBlbGVtZW50O1xuICAgIGlmIChjYW5kaWRhdGVUYWJpbmRleCA9PT0gMCkge1xuICAgICAgaXNTY29wZSA/IHJlZ3VsYXJUYWJiYWJsZXMucHVzaC5hcHBseShyZWd1bGFyVGFiYmFibGVzLCBlbGVtZW50cykgOiByZWd1bGFyVGFiYmFibGVzLnB1c2goZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9yZGVyZWRUYWJiYWJsZXMucHVzaCh7XG4gICAgICAgIGRvY3VtZW50T3JkZXI6IGksXG4gICAgICAgIHRhYkluZGV4OiBjYW5kaWRhdGVUYWJpbmRleCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXNTY29wZSxcbiAgICAgICAgY29udGVudDogZWxlbWVudHNcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvcmRlcmVkVGFiYmFibGVzLnNvcnQoc29ydE9yZGVyZWRUYWJiYWJsZXMpLnJlZHVjZShmdW5jdGlvbihhY2MsIHNvcnRhYmxlKSB7XG4gICAgc29ydGFibGUuaXNTY29wZSA/IGFjYy5wdXNoLmFwcGx5KGFjYywgc29ydGFibGUuY29udGVudCkgOiBhY2MucHVzaChzb3J0YWJsZS5jb250ZW50KTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCBbXSkuY29uY2F0KHJlZ3VsYXJUYWJiYWJsZXMpO1xufTtcbnZhciB0YWJiYWJsZSA9IGZ1bmN0aW9uIHRhYmJhYmxlMihlbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGNhbmRpZGF0ZXM7XG4gIGlmIChvcHRpb25zLmdldFNoYWRvd1Jvb3QpIHtcbiAgICBjYW5kaWRhdGVzID0gZ2V0Q2FuZGlkYXRlc0l0ZXJhdGl2ZWx5KFtlbF0sIG9wdGlvbnMuaW5jbHVkZUNvbnRhaW5lciwge1xuICAgICAgZmlsdGVyOiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUuYmluZChudWxsLCBvcHRpb25zKSxcbiAgICAgIGZsYXR0ZW46IGZhbHNlLFxuICAgICAgZ2V0U2hhZG93Um9vdDogb3B0aW9ucy5nZXRTaGFkb3dSb290LFxuICAgICAgc2hhZG93Um9vdEZpbHRlcjogaXNWYWxpZFNoYWRvd1Jvb3RUYWJiYWJsZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGVsLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZS5iaW5kKG51bGwsIG9wdGlvbnMpKTtcbiAgfVxuICByZXR1cm4gc29ydEJ5T3JkZXIoY2FuZGlkYXRlcyk7XG59O1xudmFyIGZvY3VzYWJsZSA9IGZ1bmN0aW9uIGZvY3VzYWJsZTIoZWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBjYW5kaWRhdGVzO1xuICBpZiAob3B0aW9ucy5nZXRTaGFkb3dSb290KSB7XG4gICAgY2FuZGlkYXRlcyA9IGdldENhbmRpZGF0ZXNJdGVyYXRpdmVseShbZWxdLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIHtcbiAgICAgIGZpbHRlcjogaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZS5iaW5kKG51bGwsIG9wdGlvbnMpLFxuICAgICAgZmxhdHRlbjogdHJ1ZSxcbiAgICAgIGdldFNoYWRvd1Jvb3Q6IG9wdGlvbnMuZ2V0U2hhZG93Um9vdFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGVsLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUuYmluZChudWxsLCBvcHRpb25zKSk7XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59O1xudmFyIGlzVGFiYmFibGUgPSBmdW5jdGlvbiBpc1RhYmJhYmxlMihub2RlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBub2RlIHByb3ZpZGVkXCIpO1xuICB9XG4gIGlmIChtYXRjaGVzLmNhbGwobm9kZSwgY2FuZGlkYXRlU2VsZWN0b3IpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvclRhYmJhYmxlKG9wdGlvbnMsIG5vZGUpO1xufTtcbnZhciBmb2N1c2FibGVDYW5kaWRhdGVTZWxlY3RvciA9IC8qIEBfX1BVUkVfXyAqLyBjYW5kaWRhdGVTZWxlY3RvcnMuY29uY2F0KFwiaWZyYW1lXCIpLmpvaW4oXCIsXCIpO1xudmFyIGlzRm9jdXNhYmxlID0gZnVuY3Rpb24gaXNGb2N1c2FibGUyKG5vZGUsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmICghbm9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG5vZGUgcHJvdmlkZWRcIik7XG4gIH1cbiAgaWYgKG1hdGNoZXMuY2FsbChub2RlLCBmb2N1c2FibGVDYW5kaWRhdGVTZWxlY3RvcikgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlKG9wdGlvbnMsIG5vZGUpO1xufTtcblxuLy8gbm9kZV9tb2R1bGVzL2ZvY3VzLXRyYXAvZGlzdC9mb2N1cy10cmFwLmVzbS5qc1xuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcbiAgICBlbnVtZXJhYmxlT25seSAmJiAoc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uKHN5bSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7XG4gICAgfSkpLCBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkMih0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gbnVsbCAhPSBhcmd1bWVudHNbaV0gPyBhcmd1bWVudHNbaV0gOiB7fTtcbiAgICBpICUgMiA/IG93bktleXMoT2JqZWN0KHNvdXJjZSksIHRydWUpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKSA6IG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG52YXIgYWN0aXZlRm9jdXNUcmFwcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdHJhcFF1ZXVlID0gW107XG4gIHJldHVybiB7XG4gICAgYWN0aXZhdGVUcmFwOiBmdW5jdGlvbiBhY3RpdmF0ZVRyYXAodHJhcCkge1xuICAgICAgaWYgKHRyYXBRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhY3RpdmVUcmFwID0gdHJhcFF1ZXVlW3RyYXBRdWV1ZS5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGFjdGl2ZVRyYXAgIT09IHRyYXApIHtcbiAgICAgICAgICBhY3RpdmVUcmFwLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB0cmFwSW5kZXggPSB0cmFwUXVldWUuaW5kZXhPZih0cmFwKTtcbiAgICAgIGlmICh0cmFwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRyYXBRdWV1ZS5wdXNoKHRyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJhcFF1ZXVlLnNwbGljZSh0cmFwSW5kZXgsIDEpO1xuICAgICAgICB0cmFwUXVldWUucHVzaCh0cmFwKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlYWN0aXZhdGVUcmFwOiBmdW5jdGlvbiBkZWFjdGl2YXRlVHJhcCh0cmFwKSB7XG4gICAgICB2YXIgdHJhcEluZGV4ID0gdHJhcFF1ZXVlLmluZGV4T2YodHJhcCk7XG4gICAgICBpZiAodHJhcEluZGV4ICE9PSAtMSkge1xuICAgICAgICB0cmFwUXVldWUuc3BsaWNlKHRyYXBJbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhcFF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHJhcFF1ZXVlW3RyYXBRdWV1ZS5sZW5ndGggLSAxXS51bnBhdXNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSgpO1xudmFyIGlzU2VsZWN0YWJsZUlucHV0ID0gZnVuY3Rpb24gaXNTZWxlY3RhYmxlSW5wdXQyKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZSAmJiBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJpbnB1dFwiICYmIHR5cGVvZiBub2RlLnNlbGVjdCA9PT0gXCJmdW5jdGlvblwiO1xufTtcbnZhciBpc0VzY2FwZUV2ZW50ID0gZnVuY3Rpb24gaXNFc2NhcGVFdmVudDIoZSkge1xuICByZXR1cm4gZS5rZXkgPT09IFwiRXNjYXBlXCIgfHwgZS5rZXkgPT09IFwiRXNjXCIgfHwgZS5rZXlDb2RlID09PSAyNztcbn07XG52YXIgaXNUYWJFdmVudCA9IGZ1bmN0aW9uIGlzVGFiRXZlbnQyKGUpIHtcbiAgcmV0dXJuIGUua2V5ID09PSBcIlRhYlwiIHx8IGUua2V5Q29kZSA9PT0gOTtcbn07XG52YXIgZGVsYXkgPSBmdW5jdGlvbiBkZWxheTIoZm4pIHtcbiAgcmV0dXJuIHNldFRpbWVvdXQoZm4sIDApO1xufTtcbnZhciBmaW5kSW5kZXggPSBmdW5jdGlvbiBmaW5kSW5kZXgyKGFyciwgZm4pIHtcbiAgdmFyIGlkeCA9IC0xO1xuICBhcnIuZXZlcnkoZnVuY3Rpb24odmFsdWUsIGkpIHtcbiAgICBpZiAoZm4odmFsdWUpKSB7XG4gICAgICBpZHggPSBpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIHJldHVybiBpZHg7XG59O1xudmFyIHZhbHVlT3JIYW5kbGVyID0gZnVuY3Rpb24gdmFsdWVPckhhbmRsZXIyKHZhbHVlKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJhbXMgPSBuZXcgQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHBhcmFtc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUuYXBwbHkodm9pZCAwLCBwYXJhbXMpIDogdmFsdWU7XG59O1xudmFyIGdldEFjdHVhbFRhcmdldCA9IGZ1bmN0aW9uIGdldEFjdHVhbFRhcmdldDIoZXZlbnQpIHtcbiAgcmV0dXJuIGV2ZW50LnRhcmdldC5zaGFkb3dSb290ICYmIHR5cGVvZiBldmVudC5jb21wb3NlZFBhdGggPT09IFwiZnVuY3Rpb25cIiA/IGV2ZW50LmNvbXBvc2VkUGF0aCgpWzBdIDogZXZlbnQudGFyZ2V0O1xufTtcbnZhciBjcmVhdGVGb2N1c1RyYXAgPSBmdW5jdGlvbiBjcmVhdGVGb2N1c1RyYXAyKGVsZW1lbnRzLCB1c2VyT3B0aW9ucykge1xuICB2YXIgZG9jID0gKHVzZXJPcHRpb25zID09PSBudWxsIHx8IHVzZXJPcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiB1c2VyT3B0aW9ucy5kb2N1bWVudCkgfHwgZG9jdW1lbnQ7XG4gIHZhciBjb25maWcgPSBfb2JqZWN0U3ByZWFkMih7XG4gICAgcmV0dXJuRm9jdXNPbkRlYWN0aXZhdGU6IHRydWUsXG4gICAgZXNjYXBlRGVhY3RpdmF0ZXM6IHRydWUsXG4gICAgZGVsYXlJbml0aWFsRm9jdXM6IHRydWVcbiAgfSwgdXNlck9wdGlvbnMpO1xuICB2YXIgc3RhdGUgPSB7XG4gICAgLy8gY29udGFpbmVycyBnaXZlbiB0byBjcmVhdGVGb2N1c1RyYXAoKVxuICAgIC8vIEB0eXBlIHtBcnJheTxIVE1MRWxlbWVudD59XG4gICAgY29udGFpbmVyczogW10sXG4gICAgLy8gbGlzdCBvZiBvYmplY3RzIGlkZW50aWZ5aW5nIHRhYmJhYmxlIG5vZGVzIGluIGBjb250YWluZXJzYCBpbiB0aGUgdHJhcFxuICAgIC8vIE5PVEU6IGl0J3MgcG9zc2libGUgdGhhdCBhIGdyb3VwIGhhcyBubyB0YWJiYWJsZSBub2RlcyBpZiBub2RlcyBnZXQgcmVtb3ZlZCB3aGlsZSB0aGUgdHJhcFxuICAgIC8vICBpcyBhY3RpdmUsIGJ1dCB0aGUgdHJhcCBzaG91bGQgbmV2ZXIgZ2V0IHRvIGEgc3RhdGUgd2hlcmUgdGhlcmUgaXNuJ3QgYXQgbGVhc3Qgb25lIGdyb3VwXG4gICAgLy8gIHdpdGggYXQgbGVhc3Qgb25lIHRhYmJhYmxlIG5vZGUgaW4gaXQgKHRoYXQgd291bGQgbGVhZCB0byBhbiBlcnJvciBjb25kaXRpb24gdGhhdCB3b3VsZFxuICAgIC8vICByZXN1bHQgaW4gYW4gZXJyb3IgYmVpbmcgdGhyb3duKVxuICAgIC8vIEB0eXBlIHtBcnJheTx7XG4gICAgLy8gICBjb250YWluZXI6IEhUTUxFbGVtZW50LFxuICAgIC8vICAgdGFiYmFibGVOb2RlczogQXJyYXk8SFRNTEVsZW1lbnQ+LCAvLyBlbXB0eSBpZiBub25lXG4gICAgLy8gICBmb2N1c2FibGVOb2RlczogQXJyYXk8SFRNTEVsZW1lbnQ+LCAvLyBlbXB0eSBpZiBub25lXG4gICAgLy8gICBmaXJzdFRhYmJhYmxlTm9kZTogSFRNTEVsZW1lbnR8bnVsbCxcbiAgICAvLyAgIGxhc3RUYWJiYWJsZU5vZGU6IEhUTUxFbGVtZW50fG51bGwsXG4gICAgLy8gICBuZXh0VGFiYmFibGVOb2RlOiAobm9kZTogSFRNTEVsZW1lbnQsIGZvcndhcmQ6IGJvb2xlYW4pID0+IEhUTUxFbGVtZW50fHVuZGVmaW5lZFxuICAgIC8vIH0+fVxuICAgIGNvbnRhaW5lckdyb3VwczogW10sXG4gICAgLy8gc2FtZSBvcmRlci9sZW5ndGggYXMgYGNvbnRhaW5lcnNgIGxpc3RcbiAgICAvLyByZWZlcmVuY2VzIHRvIG9iamVjdHMgaW4gYGNvbnRhaW5lckdyb3Vwc2AsIGJ1dCBvbmx5IHRob3NlIHRoYXQgYWN0dWFsbHkgaGF2ZVxuICAgIC8vICB0YWJiYWJsZSBub2RlcyBpbiB0aGVtXG4gICAgLy8gTk9URTogc2FtZSBvcmRlciBhcyBgY29udGFpbmVyc2AgYW5kIGBjb250YWluZXJHcm91cHNgLCBidXQgX19ub3QgbmVjZXNzYXJpbHlfX1xuICAgIC8vICB0aGUgc2FtZSBsZW5ndGhcbiAgICB0YWJiYWJsZUdyb3VwczogW10sXG4gICAgbm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uOiBudWxsLFxuICAgIG1vc3RSZWNlbnRseUZvY3VzZWROb2RlOiBudWxsLFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgcGF1c2VkOiBmYWxzZSxcbiAgICAvLyB0aW1lciBJRCBmb3Igd2hlbiBkZWxheUluaXRpYWxGb2N1cyBpcyB0cnVlIGFuZCBpbml0aWFsIGZvY3VzIGluIHRoaXMgdHJhcFxuICAgIC8vICBoYXMgYmVlbiBkZWxheWVkIGR1cmluZyBhY3RpdmF0aW9uXG4gICAgZGVsYXlJbml0aWFsRm9jdXNUaW1lcjogdm9pZCAwXG4gIH07XG4gIHZhciB0cmFwO1xuICB2YXIgZ2V0T3B0aW9uID0gZnVuY3Rpb24gZ2V0T3B0aW9uMihjb25maWdPdmVycmlkZU9wdGlvbnMsIG9wdGlvbk5hbWUsIGNvbmZpZ09wdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gY29uZmlnT3ZlcnJpZGVPcHRpb25zICYmIGNvbmZpZ092ZXJyaWRlT3B0aW9uc1tvcHRpb25OYW1lXSAhPT0gdm9pZCAwID8gY29uZmlnT3ZlcnJpZGVPcHRpb25zW29wdGlvbk5hbWVdIDogY29uZmlnW2NvbmZpZ09wdGlvbk5hbWUgfHwgb3B0aW9uTmFtZV07XG4gIH07XG4gIHZhciBmaW5kQ29udGFpbmVySW5kZXggPSBmdW5jdGlvbiBmaW5kQ29udGFpbmVySW5kZXgyKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gc3RhdGUuY29udGFpbmVyR3JvdXBzLmZpbmRJbmRleChmdW5jdGlvbihfcmVmKSB7XG4gICAgICB2YXIgY29udGFpbmVyID0gX3JlZi5jb250YWluZXIsIHRhYmJhYmxlTm9kZXMgPSBfcmVmLnRhYmJhYmxlTm9kZXM7XG4gICAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGVsZW1lbnQpIHx8IC8vIGZhbGwgYmFjayB0byBleHBsaWNpdCB0YWJiYWJsZSBzZWFyY2ggd2hpY2ggd2lsbCB0YWtlIGludG8gY29uc2lkZXJhdGlvbiBhbnlcbiAgICAgIC8vICB3ZWIgY29tcG9uZW50cyBpZiB0aGUgYHRhYmJhYmxlT3B0aW9ucy5nZXRTaGFkb3dSb290YCBvcHRpb24gd2FzIHVzZWQgZm9yXG4gICAgICAvLyAgdGhlIHRyYXAsIGVuYWJsaW5nIHNoYWRvdyBET00gc3VwcG9ydCBpbiB0YWJiYWJsZSAoYE5vZGUuY29udGFpbnMoKWAgZG9lc24ndFxuICAgICAgLy8gIGxvb2sgaW5zaWRlIHdlYiBjb21wb25lbnRzIGV2ZW4gaWYgb3BlbilcbiAgICAgIHRhYmJhYmxlTm9kZXMuZmluZChmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlID09PSBlbGVtZW50O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG4gIHZhciBnZXROb2RlRm9yT3B0aW9uID0gZnVuY3Rpb24gZ2V0Tm9kZUZvck9wdGlvbjIob3B0aW9uTmFtZSkge1xuICAgIHZhciBvcHRpb25WYWx1ZSA9IGNvbmZpZ1tvcHRpb25OYW1lXTtcbiAgICBpZiAodHlwZW9mIG9wdGlvblZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgcGFyYW1zID0gbmV3IEFycmF5KF9sZW4yID4gMSA/IF9sZW4yIC0gMSA6IDApLCBfa2V5MiA9IDE7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgcGFyYW1zW19rZXkyIC0gMV0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuICAgICAgb3B0aW9uVmFsdWUgPSBvcHRpb25WYWx1ZS5hcHBseSh2b2lkIDAsIHBhcmFtcyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25WYWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgb3B0aW9uVmFsdWUgPSB2b2lkIDA7XG4gICAgfVxuICAgIGlmICghb3B0aW9uVmFsdWUpIHtcbiAgICAgIGlmIChvcHRpb25WYWx1ZSA9PT0gdm9pZCAwIHx8IG9wdGlvblZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gb3B0aW9uVmFsdWU7XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgXCIuY29uY2F0KG9wdGlvbk5hbWUsIFwiYCB3YXMgc3BlY2lmaWVkIGJ1dCB3YXMgbm90IGEgbm9kZSwgb3IgZGlkIG5vdCByZXR1cm4gYSBub2RlXCIpKTtcbiAgICB9XG4gICAgdmFyIG5vZGUgPSBvcHRpb25WYWx1ZTtcbiAgICBpZiAodHlwZW9mIG9wdGlvblZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBub2RlID0gZG9jLnF1ZXJ5U2VsZWN0b3Iob3B0aW9uVmFsdWUpO1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImBcIi5jb25jYXQob3B0aW9uTmFtZSwgXCJgIGFzIHNlbGVjdG9yIHJlZmVycyB0byBubyBrbm93biBub2RlXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG4gIHZhciBnZXRJbml0aWFsRm9jdXNOb2RlID0gZnVuY3Rpb24gZ2V0SW5pdGlhbEZvY3VzTm9kZTIoKSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlRm9yT3B0aW9uKFwiaW5pdGlhbEZvY3VzXCIpO1xuICAgIGlmIChub2RlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gdm9pZCAwKSB7XG4gICAgICBpZiAoZmluZENvbnRhaW5lckluZGV4KGRvYy5hY3RpdmVFbGVtZW50KSA+PSAwKSB7XG4gICAgICAgIG5vZGUgPSBkb2MuYWN0aXZlRWxlbWVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmaXJzdFRhYmJhYmxlR3JvdXAgPSBzdGF0ZS50YWJiYWJsZUdyb3Vwc1swXTtcbiAgICAgICAgdmFyIGZpcnN0VGFiYmFibGVOb2RlID0gZmlyc3RUYWJiYWJsZUdyb3VwICYmIGZpcnN0VGFiYmFibGVHcm91cC5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgbm9kZSA9IGZpcnN0VGFiYmFibGVOb2RlIHx8IGdldE5vZGVGb3JPcHRpb24oXCJmYWxsYmFja0ZvY3VzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdXIgZm9jdXMtdHJhcCBuZWVkcyB0byBoYXZlIGF0IGxlYXN0IG9uZSBmb2N1c2FibGUgZWxlbWVudFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG4gIHZhciB1cGRhdGVUYWJiYWJsZU5vZGVzID0gZnVuY3Rpb24gdXBkYXRlVGFiYmFibGVOb2RlczIoKSB7XG4gICAgc3RhdGUuY29udGFpbmVyR3JvdXBzID0gc3RhdGUuY29udGFpbmVycy5tYXAoZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICB2YXIgdGFiYmFibGVOb2RlcyA9IHRhYmJhYmxlKGNvbnRhaW5lciwgY29uZmlnLnRhYmJhYmxlT3B0aW9ucyk7XG4gICAgICB2YXIgZm9jdXNhYmxlTm9kZXMgPSBmb2N1c2FibGUoY29udGFpbmVyLCBjb25maWcudGFiYmFibGVPcHRpb25zKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgdGFiYmFibGVOb2RlcyxcbiAgICAgICAgZm9jdXNhYmxlTm9kZXMsXG4gICAgICAgIGZpcnN0VGFiYmFibGVOb2RlOiB0YWJiYWJsZU5vZGVzLmxlbmd0aCA+IDAgPyB0YWJiYWJsZU5vZGVzWzBdIDogbnVsbCxcbiAgICAgICAgbGFzdFRhYmJhYmxlTm9kZTogdGFiYmFibGVOb2Rlcy5sZW5ndGggPiAwID8gdGFiYmFibGVOb2Rlc1t0YWJiYWJsZU5vZGVzLmxlbmd0aCAtIDFdIDogbnVsbCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbmRzIHRoZSBfX3RhYmJhYmxlX18gbm9kZSB0aGF0IGZvbGxvd3MgdGhlIGdpdmVuIG5vZGUgaW4gdGhlIHNwZWNpZmllZCBkaXJlY3Rpb24sXG4gICAgICAgICAqICBpbiB0aGlzIGNvbnRhaW5lciwgaWYgYW55LlxuICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2ZvcndhcmRdIFRydWUgaWYgZ29pbmcgaW4gZm9yd2FyZCB0YWIgb3JkZXI7IGZhbHNlIGlmIGdvaW5nXG4gICAgICAgICAqICBpbiByZXZlcnNlLlxuICAgICAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8dW5kZWZpbmVkfSBUaGUgbmV4dCB0YWJiYWJsZSBub2RlLCBpZiBhbnkuXG4gICAgICAgICAqL1xuICAgICAgICBuZXh0VGFiYmFibGVOb2RlOiBmdW5jdGlvbiBuZXh0VGFiYmFibGVOb2RlKG5vZGUpIHtcbiAgICAgICAgICB2YXIgZm9yd2FyZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcbiAgICAgICAgICB2YXIgbm9kZUlkeCA9IGZvY3VzYWJsZU5vZGVzLmZpbmRJbmRleChmdW5jdGlvbihuKSB7XG4gICAgICAgICAgICByZXR1cm4gbiA9PT0gbm9kZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAobm9kZUlkeCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChmb3J3YXJkKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9jdXNhYmxlTm9kZXMuc2xpY2Uobm9kZUlkeCArIDEpLmZpbmQoZnVuY3Rpb24obikge1xuICAgICAgICAgICAgICByZXR1cm4gaXNUYWJiYWJsZShuLCBjb25maWcudGFiYmFibGVPcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZm9jdXNhYmxlTm9kZXMuc2xpY2UoMCwgbm9kZUlkeCkucmV2ZXJzZSgpLmZpbmQoZnVuY3Rpb24obikge1xuICAgICAgICAgICAgcmV0dXJuIGlzVGFiYmFibGUobiwgY29uZmlnLnRhYmJhYmxlT3B0aW9ucyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgc3RhdGUudGFiYmFibGVHcm91cHMgPSBzdGF0ZS5jb250YWluZXJHcm91cHMuZmlsdGVyKGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICByZXR1cm4gZ3JvdXAudGFiYmFibGVOb2Rlcy5sZW5ndGggPiAwO1xuICAgIH0pO1xuICAgIGlmIChzdGF0ZS50YWJiYWJsZUdyb3Vwcy5sZW5ndGggPD0gMCAmJiAhZ2V0Tm9kZUZvck9wdGlvbihcImZhbGxiYWNrRm9jdXNcIikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdXIgZm9jdXMtdHJhcCBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIGNvbnRhaW5lciB3aXRoIGF0IGxlYXN0IG9uZSB0YWJiYWJsZSBub2RlIGluIGl0IGF0IGFsbCB0aW1lc1wiKTtcbiAgICB9XG4gIH07XG4gIHZhciB0cnlGb2N1cyA9IGZ1bmN0aW9uIHRyeUZvY3VzMihub2RlKSB7XG4gICAgaWYgKG5vZGUgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChub2RlID09PSBkb2MuYWN0aXZlRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIW5vZGUgfHwgIW5vZGUuZm9jdXMpIHtcbiAgICAgIHRyeUZvY3VzMihnZXRJbml0aWFsRm9jdXNOb2RlKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlLmZvY3VzKHtcbiAgICAgIHByZXZlbnRTY3JvbGw6ICEhY29uZmlnLnByZXZlbnRTY3JvbGxcbiAgICB9KTtcbiAgICBzdGF0ZS5tb3N0UmVjZW50bHlGb2N1c2VkTm9kZSA9IG5vZGU7XG4gICAgaWYgKGlzU2VsZWN0YWJsZUlucHV0KG5vZGUpKSB7XG4gICAgICBub2RlLnNlbGVjdCgpO1xuICAgIH1cbiAgfTtcbiAgdmFyIGdldFJldHVybkZvY3VzTm9kZSA9IGZ1bmN0aW9uIGdldFJldHVybkZvY3VzTm9kZTIocHJldmlvdXNBY3RpdmVFbGVtZW50KSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlRm9yT3B0aW9uKFwic2V0UmV0dXJuRm9jdXNcIiwgcHJldmlvdXNBY3RpdmVFbGVtZW50KTtcbiAgICByZXR1cm4gbm9kZSA/IG5vZGUgOiBub2RlID09PSBmYWxzZSA/IGZhbHNlIDogcHJldmlvdXNBY3RpdmVFbGVtZW50O1xuICB9O1xuICB2YXIgY2hlY2tQb2ludGVyRG93biA9IGZ1bmN0aW9uIGNoZWNrUG9pbnRlckRvd24yKGUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0QWN0dWFsVGFyZ2V0KGUpO1xuICAgIGlmIChmaW5kQ29udGFpbmVySW5kZXgodGFyZ2V0KSA+PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh2YWx1ZU9ySGFuZGxlcihjb25maWcuY2xpY2tPdXRzaWRlRGVhY3RpdmF0ZXMsIGUpKSB7XG4gICAgICB0cmFwLmRlYWN0aXZhdGUoe1xuICAgICAgICAvLyBpZiwgb24gZGVhY3RpdmF0aW9uLCB3ZSBzaG91bGQgcmV0dXJuIGZvY3VzIHRvIHRoZSBub2RlIG9yaWdpbmFsbHktZm9jdXNlZFxuICAgICAgICAvLyAgd2hlbiB0aGUgdHJhcCB3YXMgYWN0aXZhdGVkIChvciB0aGUgY29uZmlndXJlZCBgc2V0UmV0dXJuRm9jdXNgIG5vZGUpLFxuICAgICAgICAvLyAgdGhlbiBhc3N1bWUgaXQncyBhbHNvIE9LIHRvIHJldHVybiBmb2N1cyB0byB0aGUgb3V0c2lkZSBub2RlIHRoYXQgd2FzXG4gICAgICAgIC8vICBqdXN0IGNsaWNrZWQsIGNhdXNpbmcgZGVhY3RpdmF0aW9uLCBhcyBsb25nIGFzIHRoYXQgbm9kZSBpcyBmb2N1c2FibGU7XG4gICAgICAgIC8vICBpZiBpdCBpc24ndCBmb2N1c2FibGUsIHRoZW4gcmV0dXJuIGZvY3VzIHRvIHRoZSBvcmlnaW5hbCBub2RlIGZvY3VzZWRcbiAgICAgICAgLy8gIG9uIGFjdGl2YXRpb24gKG9yIHRoZSBjb25maWd1cmVkIGBzZXRSZXR1cm5Gb2N1c2Agbm9kZSlcbiAgICAgICAgLy8gTk9URTogYnkgc2V0dGluZyBgcmV0dXJuRm9jdXM6IGZhbHNlYCwgZGVhY3RpdmF0ZSgpIHdpbGwgZG8gbm90aGluZyxcbiAgICAgICAgLy8gIHdoaWNoIHdpbGwgcmVzdWx0IGluIHRoZSBvdXRzaWRlIGNsaWNrIHNldHRpbmcgZm9jdXMgdG8gdGhlIG5vZGVcbiAgICAgICAgLy8gIHRoYXQgd2FzIGNsaWNrZWQsIHdoZXRoZXIgaXQncyBmb2N1c2FibGUgb3Igbm90OyBieSBzZXR0aW5nXG4gICAgICAgIC8vICBgcmV0dXJuRm9jdXM6IHRydWVgLCB3ZSdsbCBhdHRlbXB0IHRvIHJlLWZvY3VzIHRoZSBub2RlIG9yaWdpbmFsbHktZm9jdXNlZFxuICAgICAgICAvLyAgb24gYWN0aXZhdGlvbiAob3IgdGhlIGNvbmZpZ3VyZWQgYHNldFJldHVybkZvY3VzYCBub2RlKVxuICAgICAgICByZXR1cm5Gb2N1czogY29uZmlnLnJldHVybkZvY3VzT25EZWFjdGl2YXRlICYmICFpc0ZvY3VzYWJsZSh0YXJnZXQsIGNvbmZpZy50YWJiYWJsZU9wdGlvbnMpXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHZhbHVlT3JIYW5kbGVyKGNvbmZpZy5hbGxvd091dHNpZGVDbGljaywgZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9O1xuICB2YXIgY2hlY2tGb2N1c0luID0gZnVuY3Rpb24gY2hlY2tGb2N1c0luMihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGdldEFjdHVhbFRhcmdldChlKTtcbiAgICB2YXIgdGFyZ2V0Q29udGFpbmVkID0gZmluZENvbnRhaW5lckluZGV4KHRhcmdldCkgPj0gMDtcbiAgICBpZiAodGFyZ2V0Q29udGFpbmVkIHx8IHRhcmdldCBpbnN0YW5jZW9mIERvY3VtZW50KSB7XG4gICAgICBpZiAodGFyZ2V0Q29udGFpbmVkKSB7XG4gICAgICAgIHN0YXRlLm1vc3RSZWNlbnRseUZvY3VzZWROb2RlID0gdGFyZ2V0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgdHJ5Rm9jdXMoc3RhdGUubW9zdFJlY2VudGx5Rm9jdXNlZE5vZGUgfHwgZ2V0SW5pdGlhbEZvY3VzTm9kZSgpKTtcbiAgICB9XG4gIH07XG4gIHZhciBjaGVja1RhYiA9IGZ1bmN0aW9uIGNoZWNrVGFiMihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGdldEFjdHVhbFRhcmdldChlKTtcbiAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgdmFyIGRlc3RpbmF0aW9uTm9kZSA9IG51bGw7XG4gICAgaWYgKHN0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBjb250YWluZXJJbmRleCA9IGZpbmRDb250YWluZXJJbmRleCh0YXJnZXQpO1xuICAgICAgdmFyIGNvbnRhaW5lckdyb3VwID0gY29udGFpbmVySW5kZXggPj0gMCA/IHN0YXRlLmNvbnRhaW5lckdyb3Vwc1tjb250YWluZXJJbmRleF0gOiB2b2lkIDA7XG4gICAgICBpZiAoY29udGFpbmVySW5kZXggPCAwKSB7XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gc3RhdGUudGFiYmFibGVHcm91cHNbc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIC0gMV0ubGFzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUgPSBzdGF0ZS50YWJiYWJsZUdyb3Vwc1swXS5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgIHZhciBzdGFydE9mR3JvdXBJbmRleCA9IGZpbmRJbmRleChzdGF0ZS50YWJiYWJsZUdyb3VwcywgZnVuY3Rpb24oX3JlZjIpIHtcbiAgICAgICAgICB2YXIgZmlyc3RUYWJiYWJsZU5vZGUgPSBfcmVmMi5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0ID09PSBmaXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydE9mR3JvdXBJbmRleCA8IDAgJiYgKGNvbnRhaW5lckdyb3VwLmNvbnRhaW5lciA9PT0gdGFyZ2V0IHx8IGlzRm9jdXNhYmxlKHRhcmdldCwgY29uZmlnLnRhYmJhYmxlT3B0aW9ucykgJiYgIWlzVGFiYmFibGUodGFyZ2V0LCBjb25maWcudGFiYmFibGVPcHRpb25zKSAmJiAhY29udGFpbmVyR3JvdXAubmV4dFRhYmJhYmxlTm9kZSh0YXJnZXQsIGZhbHNlKSkpIHtcbiAgICAgICAgICBzdGFydE9mR3JvdXBJbmRleCA9IGNvbnRhaW5lckluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydE9mR3JvdXBJbmRleCA+PSAwKSB7XG4gICAgICAgICAgdmFyIGRlc3RpbmF0aW9uR3JvdXBJbmRleCA9IHN0YXJ0T2ZHcm91cEluZGV4ID09PSAwID8gc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIC0gMSA6IHN0YXJ0T2ZHcm91cEluZGV4IC0gMTtcbiAgICAgICAgICB2YXIgZGVzdGluYXRpb25Hcm91cCA9IHN0YXRlLnRhYmJhYmxlR3JvdXBzW2Rlc3RpbmF0aW9uR3JvdXBJbmRleF07XG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gZGVzdGluYXRpb25Hcm91cC5sYXN0VGFiYmFibGVOb2RlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbGFzdE9mR3JvdXBJbmRleCA9IGZpbmRJbmRleChzdGF0ZS50YWJiYWJsZUdyb3VwcywgZnVuY3Rpb24oX3JlZjMpIHtcbiAgICAgICAgICB2YXIgbGFzdFRhYmJhYmxlTm9kZSA9IF9yZWYzLmxhc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldCA9PT0gbGFzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChsYXN0T2ZHcm91cEluZGV4IDwgMCAmJiAoY29udGFpbmVyR3JvdXAuY29udGFpbmVyID09PSB0YXJnZXQgfHwgaXNGb2N1c2FibGUodGFyZ2V0LCBjb25maWcudGFiYmFibGVPcHRpb25zKSAmJiAhaXNUYWJiYWJsZSh0YXJnZXQsIGNvbmZpZy50YWJiYWJsZU9wdGlvbnMpICYmICFjb250YWluZXJHcm91cC5uZXh0VGFiYmFibGVOb2RlKHRhcmdldCkpKSB7XG4gICAgICAgICAgbGFzdE9mR3JvdXBJbmRleCA9IGNvbnRhaW5lckluZGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXN0T2ZHcm91cEluZGV4ID49IDApIHtcbiAgICAgICAgICB2YXIgX2Rlc3RpbmF0aW9uR3JvdXBJbmRleCA9IGxhc3RPZkdyb3VwSW5kZXggPT09IHN0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCAtIDEgPyAwIDogbGFzdE9mR3JvdXBJbmRleCArIDE7XG4gICAgICAgICAgdmFyIF9kZXN0aW5hdGlvbkdyb3VwID0gc3RhdGUudGFiYmFibGVHcm91cHNbX2Rlc3RpbmF0aW9uR3JvdXBJbmRleF07XG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gX2Rlc3RpbmF0aW9uR3JvdXAuZmlyc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVzdGluYXRpb25Ob2RlID0gZ2V0Tm9kZUZvck9wdGlvbihcImZhbGxiYWNrRm9jdXNcIik7XG4gICAgfVxuICAgIGlmIChkZXN0aW5hdGlvbk5vZGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRyeUZvY3VzKGRlc3RpbmF0aW9uTm9kZSk7XG4gICAgfVxuICB9O1xuICB2YXIgY2hlY2tLZXkgPSBmdW5jdGlvbiBjaGVja0tleTIoZSkge1xuICAgIGlmIChpc0VzY2FwZUV2ZW50KGUpICYmIHZhbHVlT3JIYW5kbGVyKGNvbmZpZy5lc2NhcGVEZWFjdGl2YXRlcywgZSkgIT09IGZhbHNlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0cmFwLmRlYWN0aXZhdGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzVGFiRXZlbnQoZSkpIHtcbiAgICAgIGNoZWNrVGFiKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcbiAgdmFyIGNoZWNrQ2xpY2sgPSBmdW5jdGlvbiBjaGVja0NsaWNrMihlKSB7XG4gICAgdmFyIHRhcmdldCA9IGdldEFjdHVhbFRhcmdldChlKTtcbiAgICBpZiAoZmluZENvbnRhaW5lckluZGV4KHRhcmdldCkgPj0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodmFsdWVPckhhbmRsZXIoY29uZmlnLmNsaWNrT3V0c2lkZURlYWN0aXZhdGVzLCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodmFsdWVPckhhbmRsZXIoY29uZmlnLmFsbG93T3V0c2lkZUNsaWNrLCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgfTtcbiAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVyczIoKSB7XG4gICAgaWYgKCFzdGF0ZS5hY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYWN0aXZlRm9jdXNUcmFwcy5hY3RpdmF0ZVRyYXAodHJhcCk7XG4gICAgc3RhdGUuZGVsYXlJbml0aWFsRm9jdXNUaW1lciA9IGNvbmZpZy5kZWxheUluaXRpYWxGb2N1cyA/IGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5Rm9jdXMoZ2V0SW5pdGlhbEZvY3VzTm9kZSgpKTtcbiAgICB9KSA6IHRyeUZvY3VzKGdldEluaXRpYWxGb2N1c05vZGUoKSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIGNoZWNrRm9jdXNJbiwgdHJ1ZSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgY2hlY2tQb2ludGVyRG93biwge1xuICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIHBhc3NpdmU6IGZhbHNlXG4gICAgfSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGNoZWNrUG9pbnRlckRvd24sIHtcbiAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICBwYXNzaXZlOiBmYWxzZVxuICAgIH0pO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2hlY2tDbGljaywge1xuICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIHBhc3NpdmU6IGZhbHNlXG4gICAgfSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGNoZWNrS2V5LCB7XG4gICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgcGFzc2l2ZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gdHJhcDtcbiAgfTtcbiAgdmFyIHJlbW92ZUxpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyczIoKSB7XG4gICAgaWYgKCFzdGF0ZS5hY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsIGNoZWNrRm9jdXNJbiwgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgY2hlY2tQb2ludGVyRG93biwgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGNoZWNrUG9pbnRlckRvd24sIHRydWUpO1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2hlY2tDbGljaywgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGNoZWNrS2V5LCB0cnVlKTtcbiAgICByZXR1cm4gdHJhcDtcbiAgfTtcbiAgdHJhcCA9IHtcbiAgICBnZXQgYWN0aXZlKCkge1xuICAgICAgcmV0dXJuIHN0YXRlLmFjdGl2ZTtcbiAgICB9LFxuICAgIGdldCBwYXVzZWQoKSB7XG4gICAgICByZXR1cm4gc3RhdGUucGF1c2VkO1xuICAgIH0sXG4gICAgYWN0aXZhdGU6IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRlT3B0aW9ucykge1xuICAgICAgaWYgKHN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBvbkFjdGl2YXRlID0gZ2V0T3B0aW9uKGFjdGl2YXRlT3B0aW9ucywgXCJvbkFjdGl2YXRlXCIpO1xuICAgICAgdmFyIG9uUG9zdEFjdGl2YXRlID0gZ2V0T3B0aW9uKGFjdGl2YXRlT3B0aW9ucywgXCJvblBvc3RBY3RpdmF0ZVwiKTtcbiAgICAgIHZhciBjaGVja0NhbkZvY3VzVHJhcCA9IGdldE9wdGlvbihhY3RpdmF0ZU9wdGlvbnMsIFwiY2hlY2tDYW5Gb2N1c1RyYXBcIik7XG4gICAgICBpZiAoIWNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgIHVwZGF0ZVRhYmJhYmxlTm9kZXMoKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLmFjdGl2ZSA9IHRydWU7XG4gICAgICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0YXRlLm5vZGVGb2N1c2VkQmVmb3JlQWN0aXZhdGlvbiA9IGRvYy5hY3RpdmVFbGVtZW50O1xuICAgICAgaWYgKG9uQWN0aXZhdGUpIHtcbiAgICAgICAgb25BY3RpdmF0ZSgpO1xuICAgICAgfVxuICAgICAgdmFyIGZpbmlzaEFjdGl2YXRpb24gPSBmdW5jdGlvbiBmaW5pc2hBY3RpdmF0aW9uMigpIHtcbiAgICAgICAgaWYgKGNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgICAgICB9XG4gICAgICAgIGFkZExpc3RlbmVycygpO1xuICAgICAgICBpZiAob25Qb3N0QWN0aXZhdGUpIHtcbiAgICAgICAgICBvblBvc3RBY3RpdmF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgIGNoZWNrQ2FuRm9jdXNUcmFwKHN0YXRlLmNvbnRhaW5lcnMuY29uY2F0KCkpLnRoZW4oZmluaXNoQWN0aXZhdGlvbiwgZmluaXNoQWN0aXZhdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgZmluaXNoQWN0aXZhdGlvbigpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbiBkZWFjdGl2YXRlKGRlYWN0aXZhdGVPcHRpb25zKSB7XG4gICAgICBpZiAoIXN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBvcHRpb25zID0gX29iamVjdFNwcmVhZDIoe1xuICAgICAgICBvbkRlYWN0aXZhdGU6IGNvbmZpZy5vbkRlYWN0aXZhdGUsXG4gICAgICAgIG9uUG9zdERlYWN0aXZhdGU6IGNvbmZpZy5vblBvc3REZWFjdGl2YXRlLFxuICAgICAgICBjaGVja0NhblJldHVybkZvY3VzOiBjb25maWcuY2hlY2tDYW5SZXR1cm5Gb2N1c1xuICAgICAgfSwgZGVhY3RpdmF0ZU9wdGlvbnMpO1xuICAgICAgY2xlYXJUaW1lb3V0KHN0YXRlLmRlbGF5SW5pdGlhbEZvY3VzVGltZXIpO1xuICAgICAgc3RhdGUuZGVsYXlJbml0aWFsRm9jdXNUaW1lciA9IHZvaWQgMDtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgc3RhdGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIGFjdGl2ZUZvY3VzVHJhcHMuZGVhY3RpdmF0ZVRyYXAodHJhcCk7XG4gICAgICB2YXIgb25EZWFjdGl2YXRlID0gZ2V0T3B0aW9uKG9wdGlvbnMsIFwib25EZWFjdGl2YXRlXCIpO1xuICAgICAgdmFyIG9uUG9zdERlYWN0aXZhdGUgPSBnZXRPcHRpb24ob3B0aW9ucywgXCJvblBvc3REZWFjdGl2YXRlXCIpO1xuICAgICAgdmFyIGNoZWNrQ2FuUmV0dXJuRm9jdXMgPSBnZXRPcHRpb24ob3B0aW9ucywgXCJjaGVja0NhblJldHVybkZvY3VzXCIpO1xuICAgICAgdmFyIHJldHVybkZvY3VzID0gZ2V0T3B0aW9uKG9wdGlvbnMsIFwicmV0dXJuRm9jdXNcIiwgXCJyZXR1cm5Gb2N1c09uRGVhY3RpdmF0ZVwiKTtcbiAgICAgIGlmIChvbkRlYWN0aXZhdGUpIHtcbiAgICAgICAgb25EZWFjdGl2YXRlKCk7XG4gICAgICB9XG4gICAgICB2YXIgZmluaXNoRGVhY3RpdmF0aW9uID0gZnVuY3Rpb24gZmluaXNoRGVhY3RpdmF0aW9uMigpIHtcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHJldHVybkZvY3VzKSB7XG4gICAgICAgICAgICB0cnlGb2N1cyhnZXRSZXR1cm5Gb2N1c05vZGUoc3RhdGUubm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvblBvc3REZWFjdGl2YXRlKSB7XG4gICAgICAgICAgICBvblBvc3REZWFjdGl2YXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBpZiAocmV0dXJuRm9jdXMgJiYgY2hlY2tDYW5SZXR1cm5Gb2N1cykge1xuICAgICAgICBjaGVja0NhblJldHVybkZvY3VzKGdldFJldHVybkZvY3VzTm9kZShzdGF0ZS5ub2RlRm9jdXNlZEJlZm9yZUFjdGl2YXRpb24pKS50aGVuKGZpbmlzaERlYWN0aXZhdGlvbiwgZmluaXNoRGVhY3RpdmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBmaW5pc2hEZWFjdGl2YXRpb24oKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgaWYgKHN0YXRlLnBhdXNlZCB8fCAhc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgc3RhdGUucGF1c2VkID0gdHJ1ZTtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICB1bnBhdXNlOiBmdW5jdGlvbiB1bnBhdXNlKCkge1xuICAgICAgaWYgKCFzdGF0ZS5wYXVzZWQgfHwgIXN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHN0YXRlLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgICAgYWRkTGlzdGVuZXJzKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHVwZGF0ZUNvbnRhaW5lckVsZW1lbnRzOiBmdW5jdGlvbiB1cGRhdGVDb250YWluZXJFbGVtZW50cyhjb250YWluZXJFbGVtZW50cykge1xuICAgICAgdmFyIGVsZW1lbnRzQXNBcnJheSA9IFtdLmNvbmNhdChjb250YWluZXJFbGVtZW50cykuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgc3RhdGUuY29udGFpbmVycyA9IGVsZW1lbnRzQXNBcnJheS5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgPyBkb2MucXVlcnlTZWxlY3RvcihlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChzdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICB0cmFwLnVwZGF0ZUNvbnRhaW5lckVsZW1lbnRzKGVsZW1lbnRzKTtcbiAgcmV0dXJuIHRyYXA7XG59O1xuXG4vLyBwYWNrYWdlcy9mb2N1cy9zcmMvaW5kZXguanNcbmZ1bmN0aW9uIHNyY19kZWZhdWx0KEFscGluZSkge1xuICBsZXQgbGFzdEZvY3VzZWQ7XG4gIGxldCBjdXJyZW50Rm9jdXNlZDtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c2luXCIsICgpID0+IHtcbiAgICBsYXN0Rm9jdXNlZCA9IGN1cnJlbnRGb2N1c2VkO1xuICAgIGN1cnJlbnRGb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgfSk7XG4gIEFscGluZS5tYWdpYyhcImZvY3VzXCIsIChlbCkgPT4ge1xuICAgIGxldCB3aXRoaW4gPSBlbDtcbiAgICByZXR1cm4ge1xuICAgICAgX19ub3Njcm9sbDogZmFsc2UsXG4gICAgICBfX3dyYXBBcm91bmQ6IGZhbHNlLFxuICAgICAgd2l0aGluKGVsMikge1xuICAgICAgICB3aXRoaW4gPSBlbDI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIHdpdGhvdXRTY3JvbGxpbmcoKSB7XG4gICAgICAgIHRoaXMuX19ub3Njcm9sbCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcbiAgICAgIG5vc2Nyb2xsKCkge1xuICAgICAgICB0aGlzLl9fbm9zY3JvbGwgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICB3aXRoV3JhcEFyb3VuZCgpIHtcbiAgICAgICAgdGhpcy5fX3dyYXBBcm91bmQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICB3cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aXRoV3JhcEFyb3VuZCgpO1xuICAgICAgfSxcbiAgICAgIGZvY3VzYWJsZShlbDIpIHtcbiAgICAgICAgcmV0dXJuIGlzRm9jdXNhYmxlKGVsMik7XG4gICAgICB9LFxuICAgICAgcHJldmlvdXNseUZvY3VzZWQoKSB7XG4gICAgICAgIHJldHVybiBsYXN0Rm9jdXNlZDtcbiAgICAgIH0sXG4gICAgICBsYXN0Rm9jdXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIGxhc3RGb2N1c2VkO1xuICAgICAgfSxcbiAgICAgIGZvY3VzZWQoKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50Rm9jdXNlZDtcbiAgICAgIH0sXG4gICAgICBmb2N1c2FibGVzKCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh3aXRoaW4pKVxuICAgICAgICAgIHJldHVybiB3aXRoaW47XG4gICAgICAgIHJldHVybiBmb2N1c2FibGUod2l0aGluLCB7IGRpc3BsYXlDaGVjazogXCJub25lXCIgfSk7XG4gICAgICB9LFxuICAgICAgYWxsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mb2N1c2FibGVzKCk7XG4gICAgICB9LFxuICAgICAgaXNGaXJzdChlbDIpIHtcbiAgICAgICAgbGV0IGVscyA9IHRoaXMuYWxsKCk7XG4gICAgICAgIHJldHVybiBlbHNbMF0gJiYgZWxzWzBdLmlzU2FtZU5vZGUoZWwyKTtcbiAgICAgIH0sXG4gICAgICBpc0xhc3QoZWwyKSB7XG4gICAgICAgIGxldCBlbHMgPSB0aGlzLmFsbCgpO1xuICAgICAgICByZXR1cm4gZWxzLmxlbmd0aCAmJiBlbHMuc2xpY2UoLTEpWzBdLmlzU2FtZU5vZGUoZWwyKTtcbiAgICAgIH0sXG4gICAgICBnZXRGaXJzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKClbMF07XG4gICAgICB9LFxuICAgICAgZ2V0TGFzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsKCkuc2xpY2UoLTEpWzBdO1xuICAgICAgfSxcbiAgICAgIGdldE5leHQoKSB7XG4gICAgICAgIGxldCBsaXN0ID0gdGhpcy5hbGwoKTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBpZiAobGlzdC5pbmRleE9mKGN1cnJlbnQpID09PSAtMSlcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLl9fd3JhcEFyb3VuZCAmJiBsaXN0LmluZGV4T2YoY3VycmVudCkgPT09IGxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHJldHVybiBsaXN0WzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0W2xpc3QuaW5kZXhPZihjdXJyZW50KSArIDFdO1xuICAgICAgfSxcbiAgICAgIGdldFByZXZpb3VzKCkge1xuICAgICAgICBsZXQgbGlzdCA9IHRoaXMuYWxsKCk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgaWYgKGxpc3QuaW5kZXhPZihjdXJyZW50KSA9PT0gLTEpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5fX3dyYXBBcm91bmQgJiYgbGlzdC5pbmRleE9mKGN1cnJlbnQpID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGxpc3Quc2xpY2UoLTEpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0W2xpc3QuaW5kZXhPZihjdXJyZW50KSAtIDFdO1xuICAgICAgfSxcbiAgICAgIGZpcnN0KCkge1xuICAgICAgICB0aGlzLmZvY3VzKHRoaXMuZ2V0Rmlyc3QoKSk7XG4gICAgICB9LFxuICAgICAgbGFzdCgpIHtcbiAgICAgICAgdGhpcy5mb2N1cyh0aGlzLmdldExhc3QoKSk7XG4gICAgICB9LFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgdGhpcy5mb2N1cyh0aGlzLmdldE5leHQoKSk7XG4gICAgICB9LFxuICAgICAgcHJldmlvdXMoKSB7XG4gICAgICAgIHRoaXMuZm9jdXModGhpcy5nZXRQcmV2aW91cygpKTtcbiAgICAgIH0sXG4gICAgICBwcmV2KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpO1xuICAgICAgfSxcbiAgICAgIGZvY3VzKGVsMikge1xuICAgICAgICBpZiAoIWVsMilcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGlmICghZWwyLmhhc0F0dHJpYnV0ZShcInRhYmluZGV4XCIpKVxuICAgICAgICAgICAgZWwyLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiMFwiKTtcbiAgICAgICAgICBlbDIuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0aGlzLl9fbm9zY3JvbGwgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBBbHBpbmUuZGlyZWN0aXZlKFwidHJhcFwiLCBBbHBpbmUuc2tpcER1cmluZ0Nsb25lKFxuICAgIChlbCwgeyBleHByZXNzaW9uLCBtb2RpZmllcnMgfSwgeyBlZmZlY3QsIGV2YWx1YXRlTGF0ZXIsIGNsZWFudXAgfSkgPT4ge1xuICAgICAgbGV0IGV2YWx1YXRvciA9IGV2YWx1YXRlTGF0ZXIoZXhwcmVzc2lvbik7XG4gICAgICBsZXQgb2xkVmFsdWUgPSBmYWxzZTtcbiAgICAgIGxldCBvcHRpb25zID0ge1xuICAgICAgICBlc2NhcGVEZWFjdGl2YXRlczogZmFsc2UsXG4gICAgICAgIGFsbG93T3V0c2lkZUNsaWNrOiB0cnVlLFxuICAgICAgICBmYWxsYmFja0ZvY3VzOiAoKSA9PiBlbFxuICAgICAgfTtcbiAgICAgIGxldCB1bmRvSW5lcnQgPSAoKSA9PiB7XG4gICAgICB9O1xuICAgICAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm5vYXV0b2ZvY3VzXCIpKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdGlhbEZvY3VzID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgYXV0b2ZvY3VzRWwgPSBlbC5xdWVyeVNlbGVjdG9yKFwiW2F1dG9mb2N1c11cIik7XG4gICAgICAgIGlmIChhdXRvZm9jdXNFbClcbiAgICAgICAgICBvcHRpb25zLmluaXRpYWxGb2N1cyA9IGF1dG9mb2N1c0VsO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImluZXJ0XCIpKSB7XG4gICAgICAgIG9wdGlvbnMub25Qb3N0QWN0aXZhdGUgPSAoKSA9PiB7XG4gICAgICAgICAgQWxwaW5lLm5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHVuZG9JbmVydCA9IHNldEluZXJ0KGVsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGxldCB0cmFwID0gY3JlYXRlRm9jdXNUcmFwKGVsLCBvcHRpb25zKTtcbiAgICAgIGxldCB1bmRvRGlzYWJsZVNjcm9sbGluZyA9ICgpID0+IHtcbiAgICAgIH07XG4gICAgICBjb25zdCByZWxlYXNlRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIHVuZG9JbmVydCgpO1xuICAgICAgICB1bmRvSW5lcnQgPSAoKSA9PiB7XG4gICAgICAgIH07XG4gICAgICAgIHVuZG9EaXNhYmxlU2Nyb2xsaW5nKCk7XG4gICAgICAgIHVuZG9EaXNhYmxlU2Nyb2xsaW5nID0gKCkgPT4ge1xuICAgICAgICB9O1xuICAgICAgICB0cmFwLmRlYWN0aXZhdGUoe1xuICAgICAgICAgIHJldHVybkZvY3VzOiAhbW9kaWZpZXJzLmluY2x1ZGVzKFwibm9yZXR1cm5cIilcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgZWZmZWN0KCgpID0+IGV2YWx1YXRvcigodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKG9sZFZhbHVlID09PSB2YWx1ZSlcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2YWx1ZSAmJiAhb2xkVmFsdWUpIHtcbiAgICAgICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibm9zY3JvbGxcIikpXG4gICAgICAgICAgICB1bmRvRGlzYWJsZVNjcm9sbGluZyA9IGRpc2FibGVTY3JvbGxpbmcoKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRyYXAuYWN0aXZhdGUoKTtcbiAgICAgICAgICB9LCAxNSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWx1ZSAmJiBvbGRWYWx1ZSkge1xuICAgICAgICAgIHJlbGVhc2VGb2N1cygpO1xuICAgICAgICB9XG4gICAgICAgIG9sZFZhbHVlID0gISF2YWx1ZTtcbiAgICAgIH0pKTtcbiAgICAgIGNsZWFudXAocmVsZWFzZUZvY3VzKTtcbiAgICB9LFxuICAgIC8vIFdoZW4gY2xvbmluZywgd2Ugb25seSB3YW50IHRvIGFkZCBhcmlhLWhpZGRlbiBhdHRyaWJ1dGVzIHRvIHRoZVxuICAgIC8vIERPTSBhbmQgbm90IHRyeSB0byBhY3R1YWxseSB0cmFwLCBhcyB0cmFwcGluZyBjYW4gbWVzcyB3aXRoIHRoZVxuICAgIC8vIGxpdmUgRE9NIGFuZCBpc24ndCBqdXN0IGlzb2xhdGVkIHRvIHRoZSBjbG9uZWQgRE9NLlxuICAgIChlbCwgeyBleHByZXNzaW9uLCBtb2RpZmllcnMgfSwgeyBldmFsdWF0ZSB9KSA9PiB7XG4gICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiaW5lcnRcIikgJiYgZXZhbHVhdGUoZXhwcmVzc2lvbikpXG4gICAgICAgIHNldEluZXJ0KGVsKTtcbiAgICB9XG4gICkpO1xufVxuZnVuY3Rpb24gc2V0SW5lcnQoZWwpIHtcbiAgbGV0IHVuZG9zID0gW107XG4gIGNyYXdsU2libGluZ3NVcChlbCwgKHNpYmxpbmcpID0+IHtcbiAgICBsZXQgY2FjaGUgPSBzaWJsaW5nLmhhc0F0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIpO1xuICAgIHNpYmxpbmcuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgIHVuZG9zLnB1c2goKCkgPT4gY2FjaGUgfHwgc2libGluZy5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiKSk7XG4gIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHdoaWxlICh1bmRvcy5sZW5ndGgpXG4gICAgICB1bmRvcy5wb3AoKSgpO1xuICB9O1xufVxuZnVuY3Rpb24gY3Jhd2xTaWJsaW5nc1VwKGVsLCBjYWxsYmFjaykge1xuICBpZiAoZWwuaXNTYW1lTm9kZShkb2N1bWVudC5ib2R5KSB8fCAhZWwucGFyZW50Tm9kZSlcbiAgICByZXR1cm47XG4gIEFycmF5LmZyb20oZWwucGFyZW50Tm9kZS5jaGlsZHJlbikuZm9yRWFjaCgoc2libGluZykgPT4ge1xuICAgIGlmIChzaWJsaW5nLmlzU2FtZU5vZGUoZWwpKSB7XG4gICAgICBjcmF3bFNpYmxpbmdzVXAoZWwucGFyZW50Tm9kZSwgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhzaWJsaW5nKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gZGlzYWJsZVNjcm9sbGluZygpIHtcbiAgbGV0IG92ZXJmbG93ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLm92ZXJmbG93O1xuICBsZXQgcGFkZGluZ1JpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodDtcbiAgbGV0IHNjcm9sbGJhcldpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5wYWRkaW5nUmlnaHQgPSBgJHtzY3JvbGxiYXJXaWR0aH1weGA7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gb3ZlcmZsb3c7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnBhZGRpbmdSaWdodCA9IHBhZGRpbmdSaWdodDtcbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvZm9jdXMvYnVpbGRzL21vZHVsZS5qc1xudmFyIG1vZHVsZV9kZWZhdWx0ID0gc3JjX2RlZmF1bHQ7XG5leHBvcnQge1xuICBtb2R1bGVfZGVmYXVsdCBhcyBkZWZhdWx0LFxuICBzcmNfZGVmYXVsdCBhcyBmb2N1c1xufTtcbi8qISBCdW5kbGVkIGxpY2Vuc2UgaW5mb3JtYXRpb246XG5cbnRhYmJhYmxlL2Rpc3QvaW5kZXguZXNtLmpzOlxuICAoKiFcbiAgKiB0YWJiYWJsZSA1LjMuM1xuICAqIEBsaWNlbnNlIE1JVCwgaHR0cHM6Ly9naXRodWIuY29tL2ZvY3VzLXRyYXAvdGFiYmFibGUvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICAqKVxuXG5mb2N1cy10cmFwL2Rpc3QvZm9jdXMtdHJhcC5lc20uanM6XG4gICgqIVxuICAqIGZvY3VzLXRyYXAgNi45LjRcbiAgKiBAbGljZW5zZSBNSVQsIGh0dHBzOi8vZ2l0aHViLmNvbS9mb2N1cy10cmFwL2ZvY3VzLXRyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICAqKVxuKi9cbiIsICIvKipcbiAqIEFscGluZS5qcyBDU1AgQnVpbGQgLSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBjb21wbGlhbnRcbiAqXG4gKiBUaGlzIGJ1aWxkIGRvZXNuJ3QgcmVxdWlyZSAndW5zYWZlLWV2YWwnIGluIENTUCBoZWFkZXJzLlxuICogVXNlcyBAYWxwaW5lanMvY3NwIHdoaWNoIGNvbXBpbGVzIGV4cHJlc3Npb25zIGF0IGJ1aWxkIHRpbWUuXG4gKlxuICogUGx1Z2lucyBsb2FkZWQ6XG4gKiAtIEBhbHBpbmVqcy9wZXJzaXN0IC0gbG9jYWxTdG9yYWdlIHBlcnNpc3RlbmNlXG4gKiAtIEBhbHBpbmVqcy9pbnRlcnNlY3QgLSBJbnRlcnNlY3Rpb24gT2JzZXJ2ZXIgQVBJXG4gKiAtIEBhbHBpbmVqcy9mb2N1cyAtIEZvY3VzIG1hbmFnZW1lbnQgdXRpbGl0aWVzXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZSAtIEFscGluZS5qcyBwYWNrYWdlcyBkb24ndCBoYXZlIHByb3BlciBUeXBlU2NyaXB0IGRlZmluaXRpb25zXG5pbXBvcnQgQWxwaW5lIGZyb20gJ0BhbHBpbmVqcy9jc3AnO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBlcnNpc3QgZnJvbSAnQGFscGluZWpzL3BlcnNpc3QnO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IGludGVyc2VjdCBmcm9tICdAYWxwaW5lanMvaW50ZXJzZWN0Jztcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBmb2N1cyBmcm9tICdAYWxwaW5lanMvZm9jdXMnO1xuXG4vLyBSZWdpc3RlciBwbHVnaW5zIEJFRk9SRSBBbHBpbmUuc3RhcnQoKVxuQWxwaW5lLnBsdWdpbihwZXJzaXN0KTtcbkFscGluZS5wbHVnaW4oaW50ZXJzZWN0KTtcbkFscGluZS5wbHVnaW4oZm9jdXMpO1xuXG4vLyBFeHBvc2UgQWxwaW5lIGdsb2JhbGx5IGZvciBjb21wb25lbnRzIGFuZCBpbmxpbmUgc2NyaXB0c1xuZ2xvYmFsVGhpcy5BbHBpbmUgPSBBbHBpbmU7XG5cbi8vIFN0YXJ0IEFscGluZS5qc1xuQWxwaW5lLnN0YXJ0KCk7XG5cbmNvbnNvbGUuaW5mbygnXHUyNzA1IEFscGluZS5qcyBDU1AgYnVpbGQgbG9hZGVkIHdpdGggcGx1Z2luczogcGVyc2lzdCwgaW50ZXJzZWN0LCBmb2N1cycpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQ0EsTUFBSSxlQUFlO0FBQ25CLE1BQUksV0FBVztBQUNmLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxtQkFBbUI7QUFDdkIsV0FBUyxVQUFVLFVBQVU7QUFDM0IsYUFBUyxRQUFRO0FBQUEsRUFDbkI7QUFDQSxXQUFTLFNBQVMsS0FBSztBQUNyQixRQUFJLENBQUMsTUFBTSxTQUFTLEdBQUc7QUFDckIsWUFBTSxLQUFLLEdBQUc7QUFDaEIsZUFBVztBQUFBLEVBQ2I7QUFDQSxXQUFTLFdBQVcsS0FBSztBQUN2QixRQUFJLFFBQVEsTUFBTSxRQUFRLEdBQUc7QUFDN0IsUUFBSSxVQUFVLE1BQU0sUUFBUTtBQUMxQixZQUFNLE9BQU8sT0FBTyxDQUFDO0FBQUEsRUFDekI7QUFDQSxXQUFTLGFBQWE7QUFDcEIsUUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjO0FBQzlCLHFCQUFlO0FBQ2YscUJBQWUsU0FBUztBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNBLFdBQVMsWUFBWTtBQUNuQixtQkFBZTtBQUNmLGVBQVc7QUFDWCxhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLFlBQU0sQ0FBQyxFQUFFO0FBQ1QseUJBQW1CO0FBQUEsSUFDckI7QUFDQSxVQUFNLFNBQVM7QUFDZix1QkFBbUI7QUFDbkIsZUFBVztBQUFBLEVBQ2I7QUFHQSxNQUFJO0FBQ0osTUFBSTtBQUNKLE1BQUk7QUFDSixNQUFJO0FBQ0osTUFBSSxpQkFBaUI7QUFDckIsV0FBUyx3QkFBd0IsVUFBVTtBQUN6QyxxQkFBaUI7QUFDakIsYUFBUztBQUNULHFCQUFpQjtBQUFBLEVBQ25CO0FBQ0EsV0FBUyxvQkFBb0IsUUFBUTtBQUNuQyxlQUFXLE9BQU87QUFDbEIsY0FBVSxPQUFPO0FBQ2pCLGFBQVMsQ0FBQyxhQUFhLE9BQU8sT0FBTyxVQUFVLEVBQUUsV0FBVyxDQUFDLFNBQVM7QUFDcEUsVUFBSSxnQkFBZ0I7QUFDbEIsa0JBQVUsSUFBSTtBQUFBLE1BQ2hCLE9BQU87QUFDTCxhQUFLO0FBQUEsTUFDUDtBQUFBLElBQ0YsRUFBRSxDQUFDO0FBQ0gsVUFBTSxPQUFPO0FBQUEsRUFDZjtBQUNBLFdBQVMsZUFBZSxVQUFVO0FBQ2hDLGFBQVM7QUFBQSxFQUNYO0FBQ0EsV0FBUyxtQkFBbUIsSUFBSTtBQUM5QixRQUFJLFdBQVcsTUFBTTtBQUFBLElBQ3JCO0FBQ0EsUUFBSSxnQkFBZ0IsQ0FBQyxhQUFhO0FBQ2hDLFVBQUksa0JBQWtCLE9BQU8sUUFBUTtBQUNyQyxVQUFJLENBQUMsR0FBRyxZQUFZO0FBQ2xCLFdBQUcsYUFBNkIsb0JBQUksSUFBSTtBQUN4QyxXQUFHLGdCQUFnQixNQUFNO0FBQ3ZCLGFBQUcsV0FBVyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFBQSxRQUNsQztBQUFBLE1BQ0Y7QUFDQSxTQUFHLFdBQVcsSUFBSSxlQUFlO0FBQ2pDLGlCQUFXLE1BQU07QUFDZixZQUFJLG9CQUFvQjtBQUN0QjtBQUNGLFdBQUcsV0FBVyxPQUFPLGVBQWU7QUFDcEMsZ0JBQVEsZUFBZTtBQUFBLE1BQ3pCO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFDQSxXQUFPLENBQUMsZUFBZSxNQUFNO0FBQzNCLGVBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQ0EsV0FBUyxNQUFNLFFBQVEsVUFBVTtBQUMvQixRQUFJLFlBQVk7QUFDaEIsUUFBSTtBQUNKLFFBQUksa0JBQWtCLE9BQU8sTUFBTTtBQUNqQyxVQUFJLFFBQVEsT0FBTztBQUNuQixXQUFLLFVBQVUsS0FBSztBQUNwQixVQUFJLENBQUMsV0FBVztBQUNkLHVCQUFlLE1BQU07QUFDbkIsbUJBQVMsT0FBTyxRQUFRO0FBQ3hCLHFCQUFXO0FBQUEsUUFDYixDQUFDO0FBQUEsTUFDSCxPQUFPO0FBQ0wsbUJBQVc7QUFBQSxNQUNiO0FBQ0Esa0JBQVk7QUFBQSxJQUNkLENBQUM7QUFDRCxXQUFPLE1BQU0sUUFBUSxlQUFlO0FBQUEsRUFDdEM7QUFHQSxNQUFJLG9CQUFvQixDQUFDO0FBQ3pCLE1BQUksZUFBZSxDQUFDO0FBQ3BCLE1BQUksYUFBYSxDQUFDO0FBQ2xCLFdBQVMsVUFBVSxVQUFVO0FBQzNCLGVBQVcsS0FBSyxRQUFRO0FBQUEsRUFDMUI7QUFDQSxXQUFTLFlBQVksSUFBSSxVQUFVO0FBQ2pDLFFBQUksT0FBTyxhQUFhLFlBQVk7QUFDbEMsVUFBSSxDQUFDLEdBQUc7QUFDTixXQUFHLGNBQWMsQ0FBQztBQUNwQixTQUFHLFlBQVksS0FBSyxRQUFRO0FBQUEsSUFDOUIsT0FBTztBQUNMLGlCQUFXO0FBQ1gsbUJBQWEsS0FBSyxRQUFRO0FBQUEsSUFDNUI7QUFBQSxFQUNGO0FBQ0EsV0FBUyxrQkFBa0IsVUFBVTtBQUNuQyxzQkFBa0IsS0FBSyxRQUFRO0FBQUEsRUFDakM7QUFDQSxXQUFTLG1CQUFtQixJQUFJLE1BQU0sVUFBVTtBQUM5QyxRQUFJLENBQUMsR0FBRztBQUNOLFNBQUcsdUJBQXVCLENBQUM7QUFDN0IsUUFBSSxDQUFDLEdBQUcscUJBQXFCLElBQUk7QUFDL0IsU0FBRyxxQkFBcUIsSUFBSSxJQUFJLENBQUM7QUFDbkMsT0FBRyxxQkFBcUIsSUFBSSxFQUFFLEtBQUssUUFBUTtBQUFBLEVBQzdDO0FBQ0EsV0FBUyxrQkFBa0IsSUFBSSxPQUFPO0FBQ3BDLFFBQUksQ0FBQyxHQUFHO0FBQ047QUFDRixXQUFPLFFBQVEsR0FBRyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTTtBQUNqRSxVQUFJLFVBQVUsVUFBVSxNQUFNLFNBQVMsSUFBSSxHQUFHO0FBQzVDLGNBQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3hCLGVBQU8sR0FBRyxxQkFBcUIsSUFBSTtBQUFBLE1BQ3JDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNBLFdBQVMsZUFBZSxJQUFJO0FBQzFCLE9BQUcsWUFBWSxRQUFRLFVBQVU7QUFDakMsV0FBTyxHQUFHLGFBQWE7QUFDckIsU0FBRyxZQUFZLElBQUksRUFBRTtBQUFBLEVBQ3pCO0FBQ0EsTUFBSSxXQUFXLElBQUksaUJBQWlCLFFBQVE7QUFDNUMsTUFBSSxxQkFBcUI7QUFDekIsV0FBUywwQkFBMEI7QUFDakMsYUFBUyxRQUFRLFVBQVUsRUFBRSxTQUFTLE1BQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxtQkFBbUIsS0FBSyxDQUFDO0FBQ3hHLHlCQUFxQjtBQUFBLEVBQ3ZCO0FBQ0EsV0FBUyx5QkFBeUI7QUFDaEMsa0JBQWM7QUFDZCxhQUFTLFdBQVc7QUFDcEIseUJBQXFCO0FBQUEsRUFDdkI7QUFDQSxNQUFJLGtCQUFrQixDQUFDO0FBQ3ZCLFdBQVMsZ0JBQWdCO0FBQ3ZCLFFBQUksVUFBVSxTQUFTLFlBQVk7QUFDbkMsb0JBQWdCLEtBQUssTUFBTSxRQUFRLFNBQVMsS0FBSyxTQUFTLE9BQU8sQ0FBQztBQUNsRSxRQUFJLDJCQUEyQixnQkFBZ0I7QUFDL0MsbUJBQWUsTUFBTTtBQUNuQixVQUFJLGdCQUFnQixXQUFXLDBCQUEwQjtBQUN2RCxlQUFPLGdCQUFnQixTQUFTO0FBQzlCLDBCQUFnQixNQUFNLEVBQUU7QUFBQSxNQUM1QjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFVBQVUsVUFBVTtBQUMzQixRQUFJLENBQUM7QUFDSCxhQUFPLFNBQVM7QUFDbEIsMkJBQXVCO0FBQ3ZCLFFBQUksU0FBUyxTQUFTO0FBQ3RCLDRCQUF3QjtBQUN4QixXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksZUFBZTtBQUNuQixNQUFJLG9CQUFvQixDQUFDO0FBQ3pCLFdBQVMsaUJBQWlCO0FBQ3hCLG1CQUFlO0FBQUEsRUFDakI7QUFDQSxXQUFTLGlDQUFpQztBQUN4QyxtQkFBZTtBQUNmLGFBQVMsaUJBQWlCO0FBQzFCLHdCQUFvQixDQUFDO0FBQUEsRUFDdkI7QUFDQSxXQUFTLFNBQVMsV0FBVztBQUMzQixRQUFJLGNBQWM7QUFDaEIsMEJBQW9CLGtCQUFrQixPQUFPLFNBQVM7QUFDdEQ7QUFBQSxJQUNGO0FBQ0EsUUFBSSxhQUFhLENBQUM7QUFDbEIsUUFBSSxlQUErQixvQkFBSSxJQUFJO0FBQzNDLFFBQUksa0JBQWtDLG9CQUFJLElBQUk7QUFDOUMsUUFBSSxvQkFBb0Msb0JBQUksSUFBSTtBQUNoRCxhQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxLQUFLO0FBQ3pDLFVBQUksVUFBVSxDQUFDLEVBQUUsT0FBTztBQUN0QjtBQUNGLFVBQUksVUFBVSxDQUFDLEVBQUUsU0FBUyxhQUFhO0FBQ3JDLGtCQUFVLENBQUMsRUFBRSxhQUFhLFFBQVEsQ0FBQyxTQUFTO0FBQzFDLGNBQUksS0FBSyxhQUFhO0FBQ3BCO0FBQ0YsY0FBSSxDQUFDLEtBQUs7QUFDUjtBQUNGLHVCQUFhLElBQUksSUFBSTtBQUFBLFFBQ3ZCLENBQUM7QUFDRCxrQkFBVSxDQUFDLEVBQUUsV0FBVyxRQUFRLENBQUMsU0FBUztBQUN4QyxjQUFJLEtBQUssYUFBYTtBQUNwQjtBQUNGLGNBQUksYUFBYSxJQUFJLElBQUksR0FBRztBQUMxQix5QkFBYSxPQUFPLElBQUk7QUFDeEI7QUFBQSxVQUNGO0FBQ0EsY0FBSSxLQUFLO0FBQ1A7QUFDRixxQkFBVyxLQUFLLElBQUk7QUFBQSxRQUN0QixDQUFDO0FBQUEsTUFDSDtBQUNBLFVBQUksVUFBVSxDQUFDLEVBQUUsU0FBUyxjQUFjO0FBQ3RDLFlBQUksS0FBSyxVQUFVLENBQUMsRUFBRTtBQUN0QixZQUFJLE9BQU8sVUFBVSxDQUFDLEVBQUU7QUFDeEIsWUFBSSxXQUFXLFVBQVUsQ0FBQyxFQUFFO0FBQzVCLFlBQUksT0FBTyxNQUFNO0FBQ2YsY0FBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUU7QUFDekIsNEJBQWdCLElBQUksSUFBSSxDQUFDLENBQUM7QUFDNUIsMEJBQWdCLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLE9BQU8sR0FBRyxhQUFhLElBQUksRUFBRSxDQUFDO0FBQUEsUUFDckU7QUFDQSxZQUFJLFNBQVMsTUFBTTtBQUNqQixjQUFJLENBQUMsa0JBQWtCLElBQUksRUFBRTtBQUMzQiw4QkFBa0IsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUM5Qiw0QkFBa0IsSUFBSSxFQUFFLEVBQUUsS0FBSyxJQUFJO0FBQUEsUUFDckM7QUFDQSxZQUFJLEdBQUcsYUFBYSxJQUFJLEtBQUssYUFBYSxNQUFNO0FBQzlDLGVBQUs7QUFBQSxRQUNQLFdBQVcsR0FBRyxhQUFhLElBQUksR0FBRztBQUNoQyxpQkFBTztBQUNQLGVBQUs7QUFBQSxRQUNQLE9BQU87QUFDTCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLHNCQUFrQixRQUFRLENBQUMsT0FBTyxPQUFPO0FBQ3ZDLHdCQUFrQixJQUFJLEtBQUs7QUFBQSxJQUM3QixDQUFDO0FBQ0Qsb0JBQWdCLFFBQVEsQ0FBQyxPQUFPLE9BQU87QUFDckMsd0JBQWtCLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUM7QUFBQSxJQUMvQyxDQUFDO0FBQ0QsYUFBUyxRQUFRLGNBQWM7QUFDN0IsVUFBSSxXQUFXLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxJQUFJLENBQUM7QUFDekM7QUFDRixtQkFBYSxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztBQUFBLElBQ3JDO0FBQ0EsYUFBUyxRQUFRLFlBQVk7QUFDM0IsVUFBSSxDQUFDLEtBQUs7QUFDUjtBQUNGLGlCQUFXLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO0FBQUEsSUFDbkM7QUFDQSxpQkFBYTtBQUNiLG1CQUFlO0FBQ2Ysc0JBQWtCO0FBQ2xCLHdCQUFvQjtBQUFBLEVBQ3RCO0FBR0EsV0FBUyxNQUFNLE1BQU07QUFDbkIsV0FBTyxhQUFhLGlCQUFpQixJQUFJLENBQUM7QUFBQSxFQUM1QztBQUNBLFdBQVMsZUFBZSxNQUFNLE9BQU8sZUFBZTtBQUNsRCxTQUFLLGVBQWUsQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLGlCQUFpQixJQUFJLENBQUM7QUFDdEUsV0FBTyxNQUFNO0FBQ1gsV0FBSyxlQUFlLEtBQUssYUFBYSxPQUFPLENBQUMsTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUNqRTtBQUFBLEVBQ0Y7QUFDQSxXQUFTLGlCQUFpQixNQUFNO0FBQzlCLFFBQUksS0FBSztBQUNQLGFBQU8sS0FBSztBQUNkLFFBQUksT0FBTyxlQUFlLGNBQWMsZ0JBQWdCLFlBQVk7QUFDbEUsYUFBTyxpQkFBaUIsS0FBSyxJQUFJO0FBQUEsSUFDbkM7QUFDQSxRQUFJLENBQUMsS0FBSyxZQUFZO0FBQ3BCLGFBQU8sQ0FBQztBQUFBLElBQ1Y7QUFDQSxXQUFPLGlCQUFpQixLQUFLLFVBQVU7QUFBQSxFQUN6QztBQUNBLFdBQVMsYUFBYSxTQUFTO0FBQzdCLFdBQU8sSUFBSSxNQUFNLEVBQUUsUUFBUSxHQUFHLGNBQWM7QUFBQSxFQUM5QztBQUNBLE1BQUksaUJBQWlCO0FBQUEsSUFDbkIsUUFBUSxFQUFFLFFBQVEsR0FBRztBQUNuQixhQUFPLE1BQU07QUFBQSxRQUNYLElBQUksSUFBSSxRQUFRLFFBQVEsQ0FBQyxNQUFNLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxFQUFFLFFBQVEsR0FBRyxNQUFNO0FBQ3JCLFVBQUksUUFBUSxPQUFPO0FBQ2pCLGVBQU87QUFDVCxhQUFPLFFBQVE7QUFBQSxRQUNiLENBQUMsUUFBUSxPQUFPLFVBQVUsZUFBZSxLQUFLLEtBQUssSUFBSSxLQUFLLFFBQVEsSUFBSSxLQUFLLElBQUk7QUFBQSxNQUNuRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLElBQUksRUFBRSxRQUFRLEdBQUcsTUFBTSxXQUFXO0FBQ2hDLFVBQUksUUFBUTtBQUNWLGVBQU87QUFDVCxhQUFPLFFBQVE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLENBQUMsUUFBUSxRQUFRLElBQUksS0FBSyxJQUFJO0FBQUEsUUFDaEMsS0FBSyxDQUFDO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxFQUFFLFFBQVEsR0FBRyxNQUFNLE9BQU8sV0FBVztBQUN2QyxZQUFNLFNBQVMsUUFBUTtBQUFBLFFBQ3JCLENBQUMsUUFBUSxPQUFPLFVBQVUsZUFBZSxLQUFLLEtBQUssSUFBSTtBQUFBLE1BQ3pELEtBQUssUUFBUSxRQUFRLFNBQVMsQ0FBQztBQUMvQixZQUFNLGFBQWEsT0FBTyx5QkFBeUIsUUFBUSxJQUFJO0FBQy9ELFVBQUksWUFBWSxPQUFPLFlBQVk7QUFDakMsZUFBTyxXQUFXLElBQUksS0FBSyxXQUFXLEtBQUssS0FBSztBQUNsRCxhQUFPLFFBQVEsSUFBSSxRQUFRLE1BQU0sS0FBSztBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUNBLFdBQVMsa0JBQWtCO0FBQ3pCLFFBQUksT0FBTyxRQUFRLFFBQVEsSUFBSTtBQUMvQixXQUFPLEtBQUssT0FBTyxDQUFDLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsSUFBSSxRQUFRLElBQUksTUFBTSxHQUFHO0FBQ2hDLGFBQU87QUFBQSxJQUNULEdBQUcsQ0FBQyxDQUFDO0FBQUEsRUFDUDtBQUdBLFdBQVMsaUJBQWlCLE9BQU87QUFDL0IsUUFBSSxZQUFZLENBQUMsUUFBUSxPQUFPLFFBQVEsWUFBWSxDQUFDLE1BQU0sUUFBUSxHQUFHLEtBQUssUUFBUTtBQUNuRixRQUFJLFVBQVUsQ0FBQyxLQUFLLFdBQVcsT0FBTztBQUNwQyxhQUFPLFFBQVEsT0FBTywwQkFBMEIsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sV0FBVyxDQUFDLE1BQU07QUFDOUYsWUFBSSxlQUFlLFNBQVMsVUFBVTtBQUNwQztBQUNGLFlBQUksT0FBTyxVQUFVLFlBQVksVUFBVSxRQUFRLE1BQU07QUFDdkQ7QUFDRixZQUFJLE9BQU8sYUFBYSxLQUFLLE1BQU0sR0FBRyxRQUFRLElBQUksR0FBRztBQUNyRCxZQUFJLE9BQU8sVUFBVSxZQUFZLFVBQVUsUUFBUSxNQUFNLGdCQUFnQjtBQUN2RSxjQUFJLEdBQUcsSUFBSSxNQUFNLFdBQVcsT0FBTyxNQUFNLEdBQUc7QUFBQSxRQUM5QyxPQUFPO0FBQ0wsY0FBSSxVQUFVLEtBQUssS0FBSyxVQUFVLE9BQU8sRUFBRSxpQkFBaUIsVUFBVTtBQUNwRSxvQkFBUSxPQUFPLElBQUk7QUFBQSxVQUNyQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQ0EsV0FBTyxRQUFRLEtBQUs7QUFBQSxFQUN0QjtBQUNBLFdBQVMsWUFBWSxVQUFVLFlBQVksTUFBTTtBQUFBLEVBQ2pELEdBQUc7QUFDRCxRQUFJLE1BQU07QUFBQSxNQUNSLGNBQWM7QUFBQSxNQUNkLGdCQUFnQjtBQUFBLE1BQ2hCLFdBQVcsT0FBTyxNQUFNLEtBQUs7QUFDM0IsZUFBTyxTQUFTLEtBQUssY0FBYyxNQUFNLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksT0FBTyxNQUFNLEtBQUssR0FBRyxNQUFNLEdBQUc7QUFBQSxNQUMxRztBQUFBLElBQ0Y7QUFDQSxjQUFVLEdBQUc7QUFDYixXQUFPLENBQUMsaUJBQWlCO0FBQ3ZCLFVBQUksT0FBTyxpQkFBaUIsWUFBWSxpQkFBaUIsUUFBUSxhQUFhLGdCQUFnQjtBQUM1RixZQUFJLGFBQWEsSUFBSSxXQUFXLEtBQUssR0FBRztBQUN4QyxZQUFJLGFBQWEsQ0FBQyxPQUFPLE1BQU0sUUFBUTtBQUNyQyxjQUFJLGFBQWEsYUFBYSxXQUFXLE9BQU8sTUFBTSxHQUFHO0FBQ3pELGNBQUksZUFBZTtBQUNuQixpQkFBTyxXQUFXLE9BQU8sTUFBTSxHQUFHO0FBQUEsUUFDcEM7QUFBQSxNQUNGLE9BQU87QUFDTCxZQUFJLGVBQWU7QUFBQSxNQUNyQjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNBLFdBQVMsSUFBSSxLQUFLLE1BQU07QUFDdEIsV0FBTyxLQUFLLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxPQUFPLFlBQVksTUFBTSxPQUFPLEdBQUcsR0FBRztBQUFBLEVBQ3ZFO0FBQ0EsV0FBUyxJQUFJLEtBQUssTUFBTSxPQUFPO0FBQzdCLFFBQUksT0FBTyxTQUFTO0FBQ2xCLGFBQU8sS0FBSyxNQUFNLEdBQUc7QUFDdkIsUUFBSSxLQUFLLFdBQVc7QUFDbEIsVUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJO0FBQUEsYUFDUixLQUFLLFdBQVc7QUFDdkIsWUFBTTtBQUFBLFNBQ0g7QUFDSCxVQUFJLElBQUksS0FBSyxDQUFDLENBQUM7QUFDYixlQUFPLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLEdBQUcsS0FBSztBQUFBLFdBQzFDO0FBQ0gsWUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDaEIsZUFBTyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEtBQUs7QUFBQSxNQUMvQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsTUFBSSxTQUFTLENBQUM7QUFDZCxXQUFTLE1BQU0sTUFBTSxVQUFVO0FBQzdCLFdBQU8sSUFBSSxJQUFJO0FBQUEsRUFDakI7QUFDQSxXQUFTLGFBQWEsS0FBSyxJQUFJO0FBQzdCLFFBQUksb0JBQW9CLGFBQWEsRUFBRTtBQUN2QyxXQUFPLFFBQVEsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNO0FBQ25ELGFBQU8sZUFBZSxLQUFLLElBQUksSUFBSSxJQUFJO0FBQUEsUUFDckMsTUFBTTtBQUNKLGlCQUFPLFNBQVMsSUFBSSxpQkFBaUI7QUFBQSxRQUN2QztBQUFBLFFBQ0EsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxhQUFhLElBQUk7QUFDeEIsUUFBSSxDQUFDLFdBQVcsUUFBUSxJQUFJLHlCQUF5QixFQUFFO0FBQ3ZELFFBQUksUUFBUSxFQUFFLGFBQWEsR0FBRyxVQUFVO0FBQ3hDLGdCQUFZLElBQUksUUFBUTtBQUN4QixXQUFPO0FBQUEsRUFDVDtBQUdBLFdBQVMsU0FBUyxJQUFJLFlBQVksYUFBYSxNQUFNO0FBQ25ELFFBQUk7QUFDRixhQUFPLFNBQVMsR0FBRyxJQUFJO0FBQUEsSUFDekIsU0FBUyxHQUFHO0FBQ1Ysa0JBQVksR0FBRyxJQUFJLFVBQVU7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLFlBQVksUUFBUSxJQUFJLGFBQWEsUUFBUTtBQUNwRCxhQUFTLE9BQU87QUFBQSxNQUNkLFVBQVUsRUFBRSxTQUFTLDBCQUEwQjtBQUFBLE1BQy9DLEVBQUUsSUFBSSxXQUFXO0FBQUEsSUFDbkI7QUFDQSxZQUFRLEtBQUssNEJBQTRCLE9BQU8sT0FBTztBQUFBO0FBQUEsRUFFdkQsYUFBYSxrQkFBa0IsYUFBYSxVQUFVLEVBQUUsSUFBSSxFQUFFO0FBQzlELGVBQVcsTUFBTTtBQUNmLFlBQU07QUFBQSxJQUNSLEdBQUcsQ0FBQztBQUFBLEVBQ047QUFHQSxNQUFJLDhCQUE4QjtBQUNsQyxXQUFTLDBCQUEwQixVQUFVO0FBQzNDLFFBQUksUUFBUTtBQUNaLGtDQUE4QjtBQUM5QixRQUFJLFNBQVMsU0FBUztBQUN0QixrQ0FBOEI7QUFDOUIsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLFNBQVMsSUFBSSxZQUFZLFNBQVMsQ0FBQyxHQUFHO0FBQzdDLFFBQUk7QUFDSixrQkFBYyxJQUFJLFVBQVUsRUFBRSxDQUFDLFVBQVUsU0FBUyxPQUFPLE1BQU07QUFDL0QsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLGlCQUFpQixNQUFNO0FBQzlCLFdBQU8scUJBQXFCLEdBQUcsSUFBSTtBQUFBLEVBQ3JDO0FBQ0EsTUFBSSx1QkFBdUI7QUFDM0IsV0FBUyxhQUFhLGNBQWM7QUFDbEMsMkJBQXVCO0FBQUEsRUFDekI7QUFDQSxXQUFTLGdCQUFnQixJQUFJLFlBQVk7QUFDdkMsUUFBSSxtQkFBbUIsQ0FBQztBQUN4QixpQkFBYSxrQkFBa0IsRUFBRTtBQUNqQyxRQUFJLFlBQVksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO0FBQzFELFFBQUksWUFBWSxPQUFPLGVBQWUsYUFBYSw4QkFBOEIsV0FBVyxVQUFVLElBQUksNEJBQTRCLFdBQVcsWUFBWSxFQUFFO0FBQy9KLFdBQU8sU0FBUyxLQUFLLE1BQU0sSUFBSSxZQUFZLFNBQVM7QUFBQSxFQUN0RDtBQUNBLFdBQVMsOEJBQThCLFdBQVcsTUFBTTtBQUN0RCxXQUFPLENBQUMsV0FBVyxNQUFNO0FBQUEsSUFDekIsR0FBRyxFQUFFLE9BQU8sU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUN2RCxVQUFJLFNBQVMsS0FBSyxNQUFNLGFBQWEsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsTUFBTTtBQUNwRSwwQkFBb0IsVUFBVSxNQUFNO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0EsTUFBSSxnQkFBZ0IsQ0FBQztBQUNyQixXQUFTLDJCQUEyQixZQUFZLElBQUk7QUFDbEQsUUFBSSxjQUFjLFVBQVUsR0FBRztBQUM3QixhQUFPLGNBQWMsVUFBVTtBQUFBLElBQ2pDO0FBQ0EsUUFBSSxnQkFBZ0IsT0FBTyxlQUFlLGlCQUFpQjtBQUFBLElBQzNELENBQUMsRUFBRTtBQUNILFFBQUksMEJBQTBCLHFCQUFxQixLQUFLLFdBQVcsS0FBSyxDQUFDLEtBQUssaUJBQWlCLEtBQUssV0FBVyxLQUFLLENBQUMsSUFBSSxlQUFlLFVBQVUsVUFBVTtBQUM1SixVQUFNLG9CQUFvQixNQUFNO0FBQzlCLFVBQUk7QUFDRixZQUFJLFFBQVEsSUFBSTtBQUFBLFVBQ2QsQ0FBQyxVQUFVLE9BQU87QUFBQSxVQUNsQixrQ0FBa0MsdUJBQXVCO0FBQUEsUUFDM0Q7QUFDQSxlQUFPLGVBQWUsT0FBTyxRQUFRO0FBQUEsVUFDbkMsT0FBTyxZQUFZLFVBQVU7QUFBQSxRQUMvQixDQUFDO0FBQ0QsZUFBTztBQUFBLE1BQ1QsU0FBUyxRQUFRO0FBQ2Ysb0JBQVksUUFBUSxJQUFJLFVBQVU7QUFDbEMsZUFBTyxRQUFRLFFBQVE7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFDQSxRQUFJLE9BQU8sa0JBQWtCO0FBQzdCLGtCQUFjLFVBQVUsSUFBSTtBQUM1QixXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsNEJBQTRCLFdBQVcsWUFBWSxJQUFJO0FBQzlELFFBQUksT0FBTywyQkFBMkIsWUFBWSxFQUFFO0FBQ3BELFdBQU8sQ0FBQyxXQUFXLE1BQU07QUFBQSxJQUN6QixHQUFHLEVBQUUsT0FBTyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxRQUFRLElBQUksQ0FBQyxNQUFNO0FBQ3ZELFdBQUssU0FBUztBQUNkLFdBQUssV0FBVztBQUNoQixVQUFJLGdCQUFnQixhQUFhLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztBQUN2RCxVQUFJLE9BQU8sU0FBUyxZQUFZO0FBQzlCLFlBQUksVUFBVSxLQUFLLEtBQUssU0FBUyxNQUFNLGFBQWEsRUFBRSxNQUFNLENBQUMsV0FBVyxZQUFZLFFBQVEsSUFBSSxVQUFVLENBQUM7QUFDM0csWUFBSSxLQUFLLFVBQVU7QUFDakIsOEJBQW9CLFVBQVUsS0FBSyxRQUFRLGVBQWUsUUFBUSxFQUFFO0FBQ3BFLGVBQUssU0FBUztBQUFBLFFBQ2hCLE9BQU87QUFDTCxrQkFBUSxLQUFLLENBQUMsV0FBVztBQUN2QixnQ0FBb0IsVUFBVSxRQUFRLGVBQWUsUUFBUSxFQUFFO0FBQUEsVUFDakUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxXQUFXLFlBQVksUUFBUSxJQUFJLFVBQVUsQ0FBQyxFQUFFLFFBQVEsTUFBTSxLQUFLLFNBQVMsTUFBTTtBQUFBLFFBQzlGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsV0FBUyxvQkFBb0IsVUFBVSxPQUFPLFFBQVEsUUFBUSxJQUFJO0FBQ2hFLFFBQUksK0JBQStCLE9BQU8sVUFBVSxZQUFZO0FBQzlELFVBQUksU0FBUyxNQUFNLE1BQU0sUUFBUSxNQUFNO0FBQ3ZDLFVBQUksa0JBQWtCLFNBQVM7QUFDN0IsZUFBTyxLQUFLLENBQUMsTUFBTSxvQkFBb0IsVUFBVSxHQUFHLFFBQVEsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLFdBQVcsWUFBWSxRQUFRLElBQUksS0FBSyxDQUFDO0FBQUEsTUFDdkgsT0FBTztBQUNMLGlCQUFTLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0YsV0FBVyxPQUFPLFVBQVUsWUFBWSxpQkFBaUIsU0FBUztBQUNoRSxZQUFNLEtBQUssQ0FBQyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsSUFDL0IsT0FBTztBQUNMLGVBQVMsS0FBSztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUdBLE1BQUksaUJBQWlCO0FBQ3JCLFdBQVMsT0FBTyxVQUFVLElBQUk7QUFDNUIsV0FBTyxpQkFBaUI7QUFBQSxFQUMxQjtBQUNBLFdBQVMsVUFBVSxXQUFXO0FBQzVCLHFCQUFpQjtBQUFBLEVBQ25CO0FBQ0EsTUFBSSxvQkFBb0IsQ0FBQztBQUN6QixXQUFTLFVBQVUsTUFBTSxVQUFVO0FBQ2pDLHNCQUFrQixJQUFJLElBQUk7QUFDMUIsV0FBTztBQUFBLE1BQ0wsT0FBTyxZQUFZO0FBQ2pCLFlBQUksQ0FBQyxrQkFBa0IsVUFBVSxHQUFHO0FBQ2xDLGtCQUFRLEtBQUssT0FBTyw4QkFBOEIsVUFBVSxTQUFTLElBQUksNENBQTRDO0FBQ3JIO0FBQUEsUUFDRjtBQUNBLGNBQU0sTUFBTSxlQUFlLFFBQVEsVUFBVTtBQUM3Qyx1QkFBZSxPQUFPLE9BQU8sSUFBSSxNQUFNLGVBQWUsUUFBUSxTQUFTLEdBQUcsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLFdBQVMsZ0JBQWdCLE1BQU07QUFDN0IsV0FBTyxPQUFPLEtBQUssaUJBQWlCLEVBQUUsU0FBUyxJQUFJO0FBQUEsRUFDckQ7QUFDQSxXQUFTLFdBQVcsSUFBSSxZQUFZLDJCQUEyQjtBQUM3RCxpQkFBYSxNQUFNLEtBQUssVUFBVTtBQUNsQyxRQUFJLEdBQUcsc0JBQXNCO0FBQzNCLFVBQUksY0FBYyxPQUFPLFFBQVEsR0FBRyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxFQUFFLE1BQU0sTUFBTSxFQUFFO0FBQ2xHLFVBQUksbUJBQW1CLGVBQWUsV0FBVztBQUNqRCxvQkFBYyxZQUFZLElBQUksQ0FBQyxjQUFjO0FBQzNDLFlBQUksaUJBQWlCLEtBQUssQ0FBQyxTQUFTLEtBQUssU0FBUyxVQUFVLElBQUksR0FBRztBQUNqRSxpQkFBTztBQUFBLFlBQ0wsTUFBTSxVQUFVLFVBQVUsSUFBSTtBQUFBLFlBQzlCLE9BQU8sSUFBSSxVQUFVLEtBQUs7QUFBQSxVQUM1QjtBQUFBLFFBQ0Y7QUFDQSxlQUFPO0FBQUEsTUFDVCxDQUFDO0FBQ0QsbUJBQWEsV0FBVyxPQUFPLFdBQVc7QUFBQSxJQUM1QztBQUNBLFFBQUksMEJBQTBCLENBQUM7QUFDL0IsUUFBSSxjQUFjLFdBQVcsSUFBSSx3QkFBd0IsQ0FBQyxTQUFTLFlBQVksd0JBQXdCLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxPQUFPLHNCQUFzQixFQUFFLElBQUksbUJBQW1CLHlCQUF5Qix5QkFBeUIsQ0FBQyxFQUFFLEtBQUssVUFBVTtBQUN0UCxXQUFPLFlBQVksSUFBSSxDQUFDLGVBQWU7QUFDckMsYUFBTyxvQkFBb0IsSUFBSSxVQUFVO0FBQUEsSUFDM0MsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLGVBQWUsWUFBWTtBQUNsQyxXQUFPLE1BQU0sS0FBSyxVQUFVLEVBQUUsSUFBSSx3QkFBd0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLElBQUksQ0FBQztBQUFBLEVBQzdHO0FBQ0EsTUFBSSxzQkFBc0I7QUFDMUIsTUFBSSx5QkFBeUMsb0JBQUksSUFBSTtBQUNyRCxNQUFJLHlCQUF5QixPQUFPO0FBQ3BDLFdBQVMsd0JBQXdCLFVBQVU7QUFDekMsMEJBQXNCO0FBQ3RCLFFBQUksTUFBTSxPQUFPO0FBQ2pCLDZCQUF5QjtBQUN6QiwyQkFBdUIsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUNsQyxRQUFJLGdCQUFnQixNQUFNO0FBQ3hCLGFBQU8sdUJBQXVCLElBQUksR0FBRyxFQUFFO0FBQ3JDLCtCQUF1QixJQUFJLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDMUMsNkJBQXVCLE9BQU8sR0FBRztBQUFBLElBQ25DO0FBQ0EsUUFBSSxnQkFBZ0IsTUFBTTtBQUN4Qiw0QkFBc0I7QUFDdEIsb0JBQWM7QUFBQSxJQUNoQjtBQUNBLGFBQVMsYUFBYTtBQUN0QixrQkFBYztBQUFBLEVBQ2hCO0FBQ0EsV0FBUyx5QkFBeUIsSUFBSTtBQUNwQyxRQUFJLFdBQVcsQ0FBQztBQUNoQixRQUFJLFdBQVcsQ0FBQyxhQUFhLFNBQVMsS0FBSyxRQUFRO0FBQ25ELFFBQUksQ0FBQyxTQUFTLGFBQWEsSUFBSSxtQkFBbUIsRUFBRTtBQUNwRCxhQUFTLEtBQUssYUFBYTtBQUMzQixRQUFJLFlBQVk7QUFBQSxNQUNkLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULGVBQWUsY0FBYyxLQUFLLGVBQWUsRUFBRTtBQUFBLE1BQ25ELFVBQVUsU0FBUyxLQUFLLFVBQVUsRUFBRTtBQUFBLElBQ3RDO0FBQ0EsUUFBSSxZQUFZLE1BQU0sU0FBUyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDakQsV0FBTyxDQUFDLFdBQVcsU0FBUztBQUFBLEVBQzlCO0FBQ0EsV0FBUyxvQkFBb0IsSUFBSSxZQUFZO0FBQzNDLFFBQUksT0FBTyxNQUFNO0FBQUEsSUFDakI7QUFDQSxRQUFJLFdBQVcsa0JBQWtCLFdBQVcsSUFBSSxLQUFLO0FBQ3JELFFBQUksQ0FBQyxXQUFXLFFBQVEsSUFBSSx5QkFBeUIsRUFBRTtBQUN2RCx1QkFBbUIsSUFBSSxXQUFXLFVBQVUsUUFBUTtBQUNwRCxRQUFJLGNBQWMsTUFBTTtBQUN0QixVQUFJLEdBQUcsYUFBYSxHQUFHO0FBQ3JCO0FBQ0YsZUFBUyxVQUFVLFNBQVMsT0FBTyxJQUFJLFlBQVksU0FBUztBQUM1RCxpQkFBVyxTQUFTLEtBQUssVUFBVSxJQUFJLFlBQVksU0FBUztBQUM1RCw0QkFBc0IsdUJBQXVCLElBQUksc0JBQXNCLEVBQUUsS0FBSyxRQUFRLElBQUksU0FBUztBQUFBLElBQ3JHO0FBQ0EsZ0JBQVksY0FBYztBQUMxQixXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksZUFBZSxDQUFDLFNBQVMsZ0JBQWdCLENBQUMsRUFBRSxNQUFNLE1BQU0sTUFBTTtBQUNoRSxRQUFJLEtBQUssV0FBVyxPQUFPO0FBQ3pCLGFBQU8sS0FBSyxRQUFRLFNBQVMsV0FBVztBQUMxQyxXQUFPLEVBQUUsTUFBTSxNQUFNO0FBQUEsRUFDdkI7QUFDQSxNQUFJLE9BQU8sQ0FBQyxNQUFNO0FBQ2xCLFdBQVMsd0JBQXdCLFdBQVcsTUFBTTtBQUFBLEVBQ2xELEdBQUc7QUFDRCxXQUFPLENBQUMsRUFBRSxNQUFNLE1BQU0sTUFBTTtBQUMxQixVQUFJLEVBQUUsTUFBTSxTQUFTLE9BQU8sU0FBUyxJQUFJLHNCQUFzQixPQUFPLENBQUMsT0FBTyxjQUFjO0FBQzFGLGVBQU8sVUFBVSxLQUFLO0FBQUEsTUFDeEIsR0FBRyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xCLFVBQUksWUFBWTtBQUNkLGlCQUFTLFNBQVMsSUFBSTtBQUN4QixhQUFPLEVBQUUsTUFBTSxTQUFTLE9BQU8sU0FBUztBQUFBLElBQzFDO0FBQUEsRUFDRjtBQUNBLE1BQUksd0JBQXdCLENBQUM7QUFDN0IsV0FBUyxjQUFjLFVBQVU7QUFDL0IsMEJBQXNCLEtBQUssUUFBUTtBQUFBLEVBQ3JDO0FBQ0EsV0FBUyx1QkFBdUIsRUFBRSxLQUFLLEdBQUc7QUFDeEMsV0FBTyxxQkFBcUIsRUFBRSxLQUFLLElBQUk7QUFBQSxFQUN6QztBQUNBLE1BQUksdUJBQXVCLE1BQU0sSUFBSSxPQUFPLElBQUksY0FBYyxjQUFjO0FBQzVFLFdBQVMsbUJBQW1CLHlCQUF5QiwyQkFBMkI7QUFDOUUsV0FBTyxDQUFDLEVBQUUsTUFBTSxNQUFNLE1BQU07QUFDMUIsVUFBSSxZQUFZLEtBQUssTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxVQUFJLGFBQWEsS0FBSyxNQUFNLHFCQUFxQjtBQUNqRCxVQUFJLFlBQVksS0FBSyxNQUFNLHVCQUF1QixLQUFLLENBQUM7QUFDeEQsVUFBSSxXQUFXLDZCQUE2Qix3QkFBd0IsSUFBSSxLQUFLO0FBQzdFLGFBQU87QUFBQSxRQUNMLE1BQU0sWUFBWSxVQUFVLENBQUMsSUFBSTtBQUFBLFFBQ2pDLE9BQU8sYUFBYSxXQUFXLENBQUMsSUFBSTtBQUFBLFFBQ3BDLFdBQVcsVUFBVSxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsS0FBSyxFQUFFLENBQUM7QUFBQSxRQUNsRCxZQUFZO0FBQUEsUUFDWjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksVUFBVTtBQUNkLE1BQUksaUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxXQUFTLFdBQVcsR0FBRyxHQUFHO0FBQ3hCLFFBQUksUUFBUSxlQUFlLFFBQVEsRUFBRSxJQUFJLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDaEUsUUFBSSxRQUFRLGVBQWUsUUFBUSxFQUFFLElBQUksTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNoRSxXQUFPLGVBQWUsUUFBUSxLQUFLLElBQUksZUFBZSxRQUFRLEtBQUs7QUFBQSxFQUNyRTtBQUdBLFdBQVMsU0FBUyxJQUFJLE1BQU0sU0FBUyxDQUFDLEdBQUc7QUFDdkMsT0FBRztBQUFBLE1BQ0QsSUFBSSxZQUFZLE1BQU07QUFBQSxRQUNwQjtBQUFBLFFBQ0EsU0FBUztBQUFBO0FBQUEsUUFFVCxVQUFVO0FBQUEsUUFDVixZQUFZO0FBQUEsTUFDZCxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFHQSxXQUFTLEtBQUssSUFBSSxVQUFVO0FBQzFCLFFBQUksT0FBTyxlQUFlLGNBQWMsY0FBYyxZQUFZO0FBQ2hFLFlBQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxLQUFLLEtBQUssUUFBUSxDQUFDO0FBQzVEO0FBQUEsSUFDRjtBQUNBLFFBQUksT0FBTztBQUNYLGFBQVMsSUFBSSxNQUFNLE9BQU8sSUFBSTtBQUM5QixRQUFJO0FBQ0Y7QUFDRixRQUFJLE9BQU8sR0FBRztBQUNkLFdBQU8sTUFBTTtBQUNYLFdBQUssTUFBTSxVQUFVLEtBQUs7QUFDMUIsYUFBTyxLQUFLO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFHQSxXQUFTLEtBQUssWUFBWSxNQUFNO0FBQzlCLFlBQVEsS0FBSyxtQkFBbUIsT0FBTyxJQUFJLEdBQUcsSUFBSTtBQUFBLEVBQ3BEO0FBR0EsTUFBSSxVQUFVO0FBQ2QsV0FBUyxRQUFRO0FBQ2YsUUFBSTtBQUNGLFdBQUssNkdBQTZHO0FBQ3BILGNBQVU7QUFDVixRQUFJLENBQUMsU0FBUztBQUNaLFdBQUsscUlBQXFJO0FBQzVJLGFBQVMsVUFBVSxhQUFhO0FBQ2hDLGFBQVMsVUFBVSxxQkFBcUI7QUFDeEMsNEJBQXdCO0FBQ3hCLGNBQVUsQ0FBQyxPQUFPLFNBQVMsSUFBSSxJQUFJLENBQUM7QUFDcEMsZ0JBQVksQ0FBQyxPQUFPLFlBQVksRUFBRSxDQUFDO0FBQ25DLHNCQUFrQixDQUFDLElBQUksVUFBVTtBQUMvQixpQkFBVyxJQUFJLEtBQUssRUFBRSxRQUFRLENBQUMsV0FBVyxPQUFPLENBQUM7QUFBQSxJQUNwRCxDQUFDO0FBQ0QsUUFBSSxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLGVBQWUsSUFBSTtBQUNyRSxVQUFNLEtBQUssU0FBUyxpQkFBaUIsYUFBYSxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQzFHLGVBQVMsRUFBRTtBQUFBLElBQ2IsQ0FBQztBQUNELGFBQVMsVUFBVSxvQkFBb0I7QUFDdkMsZUFBVyxNQUFNO0FBQ2YsOEJBQXdCO0FBQUEsSUFDMUIsQ0FBQztBQUFBLEVBQ0g7QUFDQSxNQUFJLHdCQUF3QixDQUFDO0FBQzdCLE1BQUksd0JBQXdCLENBQUM7QUFDN0IsV0FBUyxnQkFBZ0I7QUFDdkIsV0FBTyxzQkFBc0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDO0FBQUEsRUFDL0M7QUFDQSxXQUFTLGVBQWU7QUFDdEIsV0FBTyxzQkFBc0IsT0FBTyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUM7QUFBQSxFQUM3RTtBQUNBLFdBQVMsZ0JBQWdCLGtCQUFrQjtBQUN6QywwQkFBc0IsS0FBSyxnQkFBZ0I7QUFBQSxFQUM3QztBQUNBLFdBQVMsZ0JBQWdCLGtCQUFrQjtBQUN6QywwQkFBc0IsS0FBSyxnQkFBZ0I7QUFBQSxFQUM3QztBQUNBLFdBQVMsWUFBWSxJQUFJLHVCQUF1QixPQUFPO0FBQ3JELFdBQU8sWUFBWSxJQUFJLENBQUMsWUFBWTtBQUNsQyxZQUFNLFlBQVksdUJBQXVCLGFBQWEsSUFBSSxjQUFjO0FBQ3hFLFVBQUksVUFBVSxLQUFLLENBQUMsYUFBYSxRQUFRLFFBQVEsUUFBUSxDQUFDO0FBQ3hELGVBQU87QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNIO0FBQ0EsV0FBUyxZQUFZLElBQUksVUFBVTtBQUNqQyxRQUFJLENBQUM7QUFDSDtBQUNGLFFBQUksU0FBUyxFQUFFO0FBQ2IsYUFBTztBQUNULFFBQUksR0FBRztBQUNMLFdBQUssR0FBRztBQUNWLFFBQUksQ0FBQyxHQUFHO0FBQ047QUFDRixXQUFPLFlBQVksR0FBRyxlQUFlLFFBQVE7QUFBQSxFQUMvQztBQUNBLFdBQVMsT0FBTyxJQUFJO0FBQ2xCLFdBQU8sY0FBYyxFQUFFLEtBQUssQ0FBQyxhQUFhLEdBQUcsUUFBUSxRQUFRLENBQUM7QUFBQSxFQUNoRTtBQUNBLE1BQUksb0JBQW9CLENBQUM7QUFDekIsV0FBUyxjQUFjLFVBQVU7QUFDL0Isc0JBQWtCLEtBQUssUUFBUTtBQUFBLEVBQ2pDO0FBQ0EsTUFBSSxrQkFBa0I7QUFDdEIsV0FBUyxTQUFTLElBQUksU0FBUyxNQUFNLFlBQVksTUFBTTtBQUFBLEVBQ3ZELEdBQUc7QUFDRCxRQUFJLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTO0FBQ3BDO0FBQ0YsNEJBQXdCLE1BQU07QUFDNUIsYUFBTyxJQUFJLENBQUMsS0FBSyxTQUFTO0FBQ3hCLFlBQUksSUFBSTtBQUNOO0FBQ0Ysa0JBQVUsS0FBSyxJQUFJO0FBQ25CLDBCQUFrQixRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxDQUFDO0FBQzdDLG1CQUFXLEtBQUssSUFBSSxVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsT0FBTyxDQUFDO0FBQzVELFlBQUksQ0FBQyxJQUFJO0FBQ1AsY0FBSSxZQUFZO0FBQ2xCLFlBQUksYUFBYSxLQUFLO0FBQUEsTUFDeEIsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFlBQVksTUFBTSxTQUFTLE1BQU07QUFDeEMsV0FBTyxNQUFNLENBQUMsT0FBTztBQUNuQixxQkFBZSxFQUFFO0FBQ2pCLHdCQUFrQixFQUFFO0FBQ3BCLGFBQU8sR0FBRztBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLDBCQUEwQjtBQUNqQyxRQUFJLG1CQUFtQjtBQUFBLE1BQ3JCLENBQUMsTUFBTSxVQUFVLENBQUMseUJBQXlCLENBQUM7QUFBQSxNQUM1QyxDQUFDLFVBQVUsVUFBVSxDQUFDLFlBQVksQ0FBQztBQUFBLE1BQ25DLENBQUMsUUFBUSxRQUFRLENBQUMsVUFBVSxDQUFDO0FBQUEsSUFDL0I7QUFDQSxxQkFBaUIsUUFBUSxDQUFDLENBQUMsU0FBUyxZQUFZLFNBQVMsTUFBTTtBQUM3RCxVQUFJLGdCQUFnQixVQUFVO0FBQzVCO0FBQ0YsZ0JBQVUsS0FBSyxDQUFDLGFBQWE7QUFDM0IsWUFBSSxTQUFTLGNBQWMsUUFBUSxHQUFHO0FBQ3BDLGVBQUssVUFBVSxRQUFRLGtCQUFrQixPQUFPLFNBQVM7QUFDekQsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFDSDtBQUdBLE1BQUksWUFBWSxDQUFDO0FBQ2pCLE1BQUksWUFBWTtBQUNoQixXQUFTLFNBQVMsV0FBVyxNQUFNO0FBQUEsRUFDbkMsR0FBRztBQUNELG1CQUFlLE1BQU07QUFDbkIsbUJBQWEsV0FBVyxNQUFNO0FBQzVCLHlCQUFpQjtBQUFBLE1BQ25CLENBQUM7QUFBQSxJQUNILENBQUM7QUFDRCxXQUFPLElBQUksUUFBUSxDQUFDLFFBQVE7QUFDMUIsZ0JBQVUsS0FBSyxNQUFNO0FBQ25CLGlCQUFTO0FBQ1QsWUFBSTtBQUFBLE1BQ04sQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLG1CQUFtQjtBQUMxQixnQkFBWTtBQUNaLFdBQU8sVUFBVTtBQUNmLGdCQUFVLE1BQU0sRUFBRTtBQUFBLEVBQ3RCO0FBQ0EsV0FBUyxnQkFBZ0I7QUFDdkIsZ0JBQVk7QUFBQSxFQUNkO0FBR0EsV0FBUyxXQUFXLElBQUksT0FBTztBQUM3QixRQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDeEIsYUFBTyxxQkFBcUIsSUFBSSxNQUFNLEtBQUssR0FBRyxDQUFDO0FBQUEsSUFDakQsV0FBVyxPQUFPLFVBQVUsWUFBWSxVQUFVLE1BQU07QUFDdEQsYUFBTyxxQkFBcUIsSUFBSSxLQUFLO0FBQUEsSUFDdkMsV0FBVyxPQUFPLFVBQVUsWUFBWTtBQUN0QyxhQUFPLFdBQVcsSUFBSSxNQUFNLENBQUM7QUFBQSxJQUMvQjtBQUNBLFdBQU8scUJBQXFCLElBQUksS0FBSztBQUFBLEVBQ3ZDO0FBQ0EsV0FBUyxxQkFBcUIsSUFBSSxhQUFhO0FBQzdDLFFBQUksUUFBUSxDQUFDLGlCQUFpQixhQUFhLE1BQU0sR0FBRyxFQUFFLE9BQU8sT0FBTztBQUNwRSxRQUFJLGlCQUFpQixDQUFDLGlCQUFpQixhQUFhLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxPQUFPO0FBQ3RILFFBQUksMEJBQTBCLENBQUMsWUFBWTtBQUN6QyxTQUFHLFVBQVUsSUFBSSxHQUFHLE9BQU87QUFDM0IsYUFBTyxNQUFNO0FBQ1gsV0FBRyxVQUFVLE9BQU8sR0FBRyxPQUFPO0FBQUEsTUFDaEM7QUFBQSxJQUNGO0FBQ0Esa0JBQWMsZ0JBQWdCLE9BQU8sY0FBYyxLQUFLLGVBQWU7QUFDdkUsV0FBTyx3QkFBd0IsZUFBZSxXQUFXLENBQUM7QUFBQSxFQUM1RDtBQUNBLFdBQVMscUJBQXFCLElBQUksYUFBYTtBQUM3QyxRQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsWUFBWSxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQU87QUFDbEUsUUFBSSxTQUFTLE9BQU8sUUFBUSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsYUFBYSxJQUFJLE1BQU0sT0FBTyxNQUFNLFdBQVcsSUFBSSxLQUFLLEVBQUUsT0FBTyxPQUFPO0FBQzNILFFBQUksWUFBWSxPQUFPLFFBQVEsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsT0FBTyxNQUFNLFdBQVcsSUFBSSxLQUFLLEVBQUUsT0FBTyxPQUFPO0FBQy9ILFFBQUksUUFBUSxDQUFDO0FBQ2IsUUFBSSxVQUFVLENBQUM7QUFDZixjQUFVLFFBQVEsQ0FBQyxNQUFNO0FBQ3ZCLFVBQUksR0FBRyxVQUFVLFNBQVMsQ0FBQyxHQUFHO0FBQzVCLFdBQUcsVUFBVSxPQUFPLENBQUM7QUFDckIsZ0JBQVEsS0FBSyxDQUFDO0FBQUEsTUFDaEI7QUFBQSxJQUNGLENBQUM7QUFDRCxXQUFPLFFBQVEsQ0FBQyxNQUFNO0FBQ3BCLFVBQUksQ0FBQyxHQUFHLFVBQVUsU0FBUyxDQUFDLEdBQUc7QUFDN0IsV0FBRyxVQUFVLElBQUksQ0FBQztBQUNsQixjQUFNLEtBQUssQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGLENBQUM7QUFDRCxXQUFPLE1BQU07QUFDWCxjQUFRLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQztBQUMxQyxZQUFNLFFBQVEsQ0FBQyxNQUFNLEdBQUcsVUFBVSxPQUFPLENBQUMsQ0FBQztBQUFBLElBQzdDO0FBQUEsRUFDRjtBQUdBLFdBQVMsVUFBVSxJQUFJLE9BQU87QUFDNUIsUUFBSSxPQUFPLFVBQVUsWUFBWSxVQUFVLE1BQU07QUFDL0MsYUFBTyxvQkFBb0IsSUFBSSxLQUFLO0FBQUEsSUFDdEM7QUFDQSxXQUFPLG9CQUFvQixJQUFJLEtBQUs7QUFBQSxFQUN0QztBQUNBLFdBQVMsb0JBQW9CLElBQUksT0FBTztBQUN0QyxRQUFJLGlCQUFpQixDQUFDO0FBQ3RCLFdBQU8sUUFBUSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxNQUFNLE1BQU07QUFDL0MscUJBQWUsR0FBRyxJQUFJLEdBQUcsTUFBTSxHQUFHO0FBQ2xDLFVBQUksQ0FBQyxJQUFJLFdBQVcsSUFBSSxHQUFHO0FBQ3pCLGNBQU0sVUFBVSxHQUFHO0FBQUEsTUFDckI7QUFDQSxTQUFHLE1BQU0sWUFBWSxLQUFLLE1BQU07QUFBQSxJQUNsQyxDQUFDO0FBQ0QsZUFBVyxNQUFNO0FBQ2YsVUFBSSxHQUFHLE1BQU0sV0FBVyxHQUFHO0FBQ3pCLFdBQUcsZ0JBQWdCLE9BQU87QUFBQSxNQUM1QjtBQUFBLElBQ0YsQ0FBQztBQUNELFdBQU8sTUFBTTtBQUNYLGdCQUFVLElBQUksY0FBYztBQUFBLElBQzlCO0FBQUEsRUFDRjtBQUNBLFdBQVMsb0JBQW9CLElBQUksT0FBTztBQUN0QyxRQUFJLFFBQVEsR0FBRyxhQUFhLFNBQVMsS0FBSztBQUMxQyxPQUFHLGFBQWEsU0FBUyxLQUFLO0FBQzlCLFdBQU8sTUFBTTtBQUNYLFNBQUcsYUFBYSxTQUFTLFNBQVMsRUFBRTtBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNBLFdBQVMsVUFBVSxTQUFTO0FBQzFCLFdBQU8sUUFBUSxRQUFRLG1CQUFtQixPQUFPLEVBQUUsWUFBWTtBQUFBLEVBQ2pFO0FBR0EsV0FBUyxLQUFLLFVBQVUsV0FBVyxNQUFNO0FBQUEsRUFDekMsR0FBRztBQUNELFFBQUksU0FBUztBQUNiLFdBQU8sV0FBVztBQUNoQixVQUFJLENBQUMsUUFBUTtBQUNYLGlCQUFTO0FBQ1QsaUJBQVMsTUFBTSxNQUFNLFNBQVM7QUFBQSxNQUNoQyxPQUFPO0FBQ0wsaUJBQVMsTUFBTSxNQUFNLFNBQVM7QUFBQSxNQUNoQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsWUFBVSxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sV0FBVyxXQUFXLEdBQUcsRUFBRSxVQUFVLFVBQVUsTUFBTTtBQUN6RixRQUFJLE9BQU8sZUFBZTtBQUN4QixtQkFBYSxVQUFVLFVBQVU7QUFDbkMsUUFBSSxlQUFlO0FBQ2pCO0FBQ0YsUUFBSSxDQUFDLGNBQWMsT0FBTyxlQUFlLFdBQVc7QUFDbEQsb0NBQThCLElBQUksV0FBVyxLQUFLO0FBQUEsSUFDcEQsT0FBTztBQUNMLHlDQUFtQyxJQUFJLFlBQVksS0FBSztBQUFBLElBQzFEO0FBQUEsRUFDRixDQUFDO0FBQ0QsV0FBUyxtQ0FBbUMsSUFBSSxhQUFhLE9BQU87QUFDbEUsNkJBQXlCLElBQUksWUFBWSxFQUFFO0FBQzNDLFFBQUksc0JBQXNCO0FBQUEsTUFDeEIsU0FBUyxDQUFDLFlBQVk7QUFDcEIsV0FBRyxjQUFjLE1BQU0sU0FBUztBQUFBLE1BQ2xDO0FBQUEsTUFDQSxlQUFlLENBQUMsWUFBWTtBQUMxQixXQUFHLGNBQWMsTUFBTSxRQUFRO0FBQUEsTUFDakM7QUFBQSxNQUNBLGFBQWEsQ0FBQyxZQUFZO0FBQ3hCLFdBQUcsY0FBYyxNQUFNLE1BQU07QUFBQSxNQUMvQjtBQUFBLE1BQ0EsU0FBUyxDQUFDLFlBQVk7QUFDcEIsV0FBRyxjQUFjLE1BQU0sU0FBUztBQUFBLE1BQ2xDO0FBQUEsTUFDQSxlQUFlLENBQUMsWUFBWTtBQUMxQixXQUFHLGNBQWMsTUFBTSxRQUFRO0FBQUEsTUFDakM7QUFBQSxNQUNBLGFBQWEsQ0FBQyxZQUFZO0FBQ3hCLFdBQUcsY0FBYyxNQUFNLE1BQU07QUFBQSxNQUMvQjtBQUFBLElBQ0Y7QUFDQSx3QkFBb0IsS0FBSyxFQUFFLFdBQVc7QUFBQSxFQUN4QztBQUNBLFdBQVMsOEJBQThCLElBQUksV0FBVyxPQUFPO0FBQzNELDZCQUF5QixJQUFJLFNBQVM7QUFDdEMsUUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLFNBQVMsSUFBSSxLQUFLLENBQUMsVUFBVSxTQUFTLEtBQUssS0FBSyxDQUFDO0FBQ2hGLFFBQUksa0JBQWtCLGlCQUFpQixVQUFVLFNBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUMzRixRQUFJLG1CQUFtQixpQkFBaUIsVUFBVSxTQUFTLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFDN0YsUUFBSSxVQUFVLFNBQVMsSUFBSSxLQUFLLENBQUMsZUFBZTtBQUM5QyxrQkFBWSxVQUFVLE9BQU8sQ0FBQyxHQUFHLFVBQVUsUUFBUSxVQUFVLFFBQVEsS0FBSyxDQUFDO0FBQUEsSUFDN0U7QUFDQSxRQUFJLFVBQVUsU0FBUyxLQUFLLEtBQUssQ0FBQyxlQUFlO0FBQy9DLGtCQUFZLFVBQVUsT0FBTyxDQUFDLEdBQUcsVUFBVSxRQUFRLFVBQVUsUUFBUSxLQUFLLENBQUM7QUFBQSxJQUM3RTtBQUNBLFFBQUksV0FBVyxDQUFDLFVBQVUsU0FBUyxTQUFTLEtBQUssQ0FBQyxVQUFVLFNBQVMsT0FBTztBQUM1RSxRQUFJLGVBQWUsWUFBWSxVQUFVLFNBQVMsU0FBUztBQUMzRCxRQUFJLGFBQWEsWUFBWSxVQUFVLFNBQVMsT0FBTztBQUN2RCxRQUFJLGVBQWUsZUFBZSxJQUFJO0FBQ3RDLFFBQUksYUFBYSxhQUFhLGNBQWMsV0FBVyxTQUFTLEVBQUUsSUFBSSxNQUFNO0FBQzVFLFFBQUlBLFNBQVEsY0FBYyxXQUFXLFNBQVMsQ0FBQyxJQUFJO0FBQ25ELFFBQUksU0FBUyxjQUFjLFdBQVcsVUFBVSxRQUFRO0FBQ3hELFFBQUksV0FBVztBQUNmLFFBQUksYUFBYSxjQUFjLFdBQVcsWUFBWSxHQUFHLElBQUk7QUFDN0QsUUFBSSxjQUFjLGNBQWMsV0FBVyxZQUFZLEVBQUUsSUFBSTtBQUM3RCxRQUFJLFNBQVM7QUFDYixRQUFJLGlCQUFpQjtBQUNuQixTQUFHLGNBQWMsTUFBTSxTQUFTO0FBQUEsUUFDOUIsaUJBQWlCO0FBQUEsUUFDakIsaUJBQWlCLEdBQUdBLE1BQUs7QUFBQSxRQUN6QixvQkFBb0I7QUFBQSxRQUNwQixvQkFBb0IsR0FBRyxVQUFVO0FBQUEsUUFDakMsMEJBQTBCO0FBQUEsTUFDNUI7QUFDQSxTQUFHLGNBQWMsTUFBTSxRQUFRO0FBQUEsUUFDN0IsU0FBUztBQUFBLFFBQ1QsV0FBVyxTQUFTLFVBQVU7QUFBQSxNQUNoQztBQUNBLFNBQUcsY0FBYyxNQUFNLE1BQU07QUFBQSxRQUMzQixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsTUFDYjtBQUFBLElBQ0Y7QUFDQSxRQUFJLGtCQUFrQjtBQUNwQixTQUFHLGNBQWMsTUFBTSxTQUFTO0FBQUEsUUFDOUIsaUJBQWlCO0FBQUEsUUFDakIsaUJBQWlCLEdBQUdBLE1BQUs7QUFBQSxRQUN6QixvQkFBb0I7QUFBQSxRQUNwQixvQkFBb0IsR0FBRyxXQUFXO0FBQUEsUUFDbEMsMEJBQTBCO0FBQUEsTUFDNUI7QUFDQSxTQUFHLGNBQWMsTUFBTSxRQUFRO0FBQUEsUUFDN0IsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLE1BQ2I7QUFDQSxTQUFHLGNBQWMsTUFBTSxNQUFNO0FBQUEsUUFDM0IsU0FBUztBQUFBLFFBQ1QsV0FBVyxTQUFTLFVBQVU7QUFBQSxNQUNoQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsV0FBUyx5QkFBeUIsSUFBSSxhQUFhLGVBQWUsQ0FBQyxHQUFHO0FBQ3BFLFFBQUksQ0FBQyxHQUFHO0FBQ04sU0FBRyxnQkFBZ0I7QUFBQSxRQUNqQixPQUFPLEVBQUUsUUFBUSxjQUFjLE9BQU8sY0FBYyxLQUFLLGFBQWE7QUFBQSxRQUN0RSxPQUFPLEVBQUUsUUFBUSxjQUFjLE9BQU8sY0FBYyxLQUFLLGFBQWE7QUFBQSxRQUN0RSxHQUFHLFNBQVMsTUFBTTtBQUFBLFFBQ2xCLEdBQUcsUUFBUSxNQUFNO0FBQUEsUUFDakIsR0FBRztBQUNELHFCQUFXLElBQUksYUFBYTtBQUFBLFlBQzFCLFFBQVEsS0FBSyxNQUFNO0FBQUEsWUFDbkIsT0FBTyxLQUFLLE1BQU07QUFBQSxZQUNsQixLQUFLLEtBQUssTUFBTTtBQUFBLFVBQ2xCLEdBQUcsUUFBUSxLQUFLO0FBQUEsUUFDbEI7QUFBQSxRQUNBLElBQUksU0FBUyxNQUFNO0FBQUEsUUFDbkIsR0FBRyxRQUFRLE1BQU07QUFBQSxRQUNqQixHQUFHO0FBQ0QscUJBQVcsSUFBSSxhQUFhO0FBQUEsWUFDMUIsUUFBUSxLQUFLLE1BQU07QUFBQSxZQUNuQixPQUFPLEtBQUssTUFBTTtBQUFBLFlBQ2xCLEtBQUssS0FBSyxNQUFNO0FBQUEsVUFDbEIsR0FBRyxRQUFRLEtBQUs7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxFQUNKO0FBQ0EsU0FBTyxRQUFRLFVBQVUscUNBQXFDLFNBQVMsSUFBSSxPQUFPLE1BQU0sTUFBTTtBQUM1RixVQUFNLFlBQVksU0FBUyxvQkFBb0IsWUFBWSx3QkFBd0I7QUFDbkYsUUFBSSwwQkFBMEIsTUFBTSxVQUFVLElBQUk7QUFDbEQsUUFBSSxPQUFPO0FBQ1QsVUFBSSxHQUFHLGtCQUFrQixHQUFHLGNBQWMsU0FBUyxHQUFHLGNBQWMsUUFBUTtBQUMxRSxXQUFHLGNBQWMsVUFBVSxPQUFPLFFBQVEsR0FBRyxjQUFjLE1BQU0sTUFBTSxFQUFFLFVBQVUsT0FBTyxRQUFRLEdBQUcsY0FBYyxNQUFNLEtBQUssRUFBRSxVQUFVLE9BQU8sUUFBUSxHQUFHLGNBQWMsTUFBTSxHQUFHLEVBQUUsVUFBVSxHQUFHLGNBQWMsR0FBRyxJQUFJLElBQUksd0JBQXdCO0FBQUEsTUFDclAsT0FBTztBQUNMLFdBQUcsZ0JBQWdCLEdBQUcsY0FBYyxHQUFHLElBQUksSUFBSSx3QkFBd0I7QUFBQSxNQUN6RTtBQUNBO0FBQUEsSUFDRjtBQUNBLE9BQUcsaUJBQWlCLEdBQUcsZ0JBQWdCLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUN0RSxTQUFHLGNBQWMsSUFBSSxNQUFNO0FBQUEsTUFDM0IsR0FBRyxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQ3RCLFNBQUcsb0JBQW9CLEdBQUcsaUJBQWlCLGFBQWEsTUFBTSxPQUFPLEVBQUUsMkJBQTJCLEtBQUssQ0FBQyxDQUFDO0FBQUEsSUFDM0csQ0FBQyxJQUFJLFFBQVEsUUFBUSxJQUFJO0FBQ3pCLG1CQUFlLE1BQU07QUFDbkIsVUFBSSxVQUFVLFlBQVksRUFBRTtBQUM1QixVQUFJLFNBQVM7QUFDWCxZQUFJLENBQUMsUUFBUTtBQUNYLGtCQUFRLGtCQUFrQixDQUFDO0FBQzdCLGdCQUFRLGdCQUFnQixLQUFLLEVBQUU7QUFBQSxNQUNqQyxPQUFPO0FBQ0wsa0JBQVUsTUFBTTtBQUNkLGNBQUksb0JBQW9CLENBQUMsUUFBUTtBQUMvQixnQkFBSSxRQUFRLFFBQVEsSUFBSTtBQUFBLGNBQ3RCLElBQUk7QUFBQSxjQUNKLElBQUksSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLElBQUksaUJBQWlCO0FBQUEsWUFDdEQsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7QUFDdEIsbUJBQU8sSUFBSTtBQUNYLG1CQUFPLElBQUk7QUFDWCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSw0QkFBa0IsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNO0FBQ2pDLGdCQUFJLENBQUMsRUFBRTtBQUNMLG9CQUFNO0FBQUEsVUFDVixDQUFDO0FBQUEsUUFDSCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFlBQVksSUFBSTtBQUN2QixRQUFJLFNBQVMsR0FBRztBQUNoQixRQUFJLENBQUM7QUFDSDtBQUNGLFdBQU8sT0FBTyxpQkFBaUIsU0FBUyxZQUFZLE1BQU07QUFBQSxFQUM1RDtBQUNBLFdBQVMsV0FBVyxJQUFJLGFBQWEsRUFBRSxRQUFRLE9BQU8sUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQ3pGLEdBQUcsUUFBUSxNQUFNO0FBQUEsRUFDakIsR0FBRztBQUNELFFBQUksR0FBRztBQUNMLFNBQUcsaUJBQWlCLE9BQU87QUFDN0IsUUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFLFdBQVcsS0FBSyxPQUFPLEtBQUssTUFBTSxFQUFFLFdBQVcsS0FBSyxPQUFPLEtBQUssR0FBRyxFQUFFLFdBQVcsR0FBRztBQUN6RyxhQUFPO0FBQ1AsWUFBTTtBQUNOO0FBQUEsSUFDRjtBQUNBLFFBQUksV0FBVyxZQUFZO0FBQzNCLHNCQUFrQixJQUFJO0FBQUEsTUFDcEIsUUFBUTtBQUNOLG9CQUFZLFlBQVksSUFBSSxNQUFNO0FBQUEsTUFDcEM7QUFBQSxNQUNBLFNBQVM7QUFDUCxxQkFBYSxZQUFZLElBQUksTUFBTTtBQUFBLE1BQ3JDO0FBQUEsTUFDQTtBQUFBLE1BQ0EsTUFBTTtBQUNKLGtCQUFVO0FBQ1Ysa0JBQVUsWUFBWSxJQUFJLEdBQUc7QUFBQSxNQUMvQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFVBQVU7QUFDUixtQkFBVztBQUNYLGdCQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLGtCQUFrQixJQUFJLFFBQVE7QUFDckMsUUFBSSxhQUFhLGVBQWU7QUFDaEMsUUFBSSxTQUFTLEtBQUssTUFBTTtBQUN0QixnQkFBVSxNQUFNO0FBQ2Qsc0JBQWM7QUFDZCxZQUFJLENBQUM7QUFDSCxpQkFBTyxPQUFPO0FBQ2hCLFlBQUksQ0FBQyxZQUFZO0FBQ2YsaUJBQU8sSUFBSTtBQUNYLDJCQUFpQjtBQUFBLFFBQ25CO0FBQ0EsZUFBTyxNQUFNO0FBQ2IsWUFBSSxHQUFHO0FBQ0wsaUJBQU8sUUFBUTtBQUNqQixlQUFPLEdBQUc7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNILENBQUM7QUFDRCxPQUFHLG1CQUFtQjtBQUFBLE1BQ3BCLGVBQWUsQ0FBQztBQUFBLE1BQ2hCLGFBQWEsVUFBVTtBQUNyQixhQUFLLGNBQWMsS0FBSyxRQUFRO0FBQUEsTUFDbEM7QUFBQSxNQUNBLFFBQVEsS0FBSyxXQUFXO0FBQ3RCLGVBQU8sS0FBSyxjQUFjLFFBQVE7QUFDaEMsZUFBSyxjQUFjLE1BQU0sRUFBRTtBQUFBLFFBQzdCO0FBQ0E7QUFDQSxlQUFPO0FBQUEsTUFDVCxDQUFDO0FBQUEsTUFDRDtBQUFBLElBQ0Y7QUFDQSxjQUFVLE1BQU07QUFDZCxhQUFPLE1BQU07QUFDYixhQUFPLE9BQU87QUFBQSxJQUNoQixDQUFDO0FBQ0Qsa0JBQWM7QUFDZCwwQkFBc0IsTUFBTTtBQUMxQixVQUFJO0FBQ0Y7QUFDRixVQUFJLFdBQVcsT0FBTyxpQkFBaUIsRUFBRSxFQUFFLG1CQUFtQixRQUFRLE9BQU8sRUFBRSxFQUFFLFFBQVEsS0FBSyxFQUFFLENBQUMsSUFBSTtBQUNyRyxVQUFJQSxTQUFRLE9BQU8saUJBQWlCLEVBQUUsRUFBRSxnQkFBZ0IsUUFBUSxPQUFPLEVBQUUsRUFBRSxRQUFRLEtBQUssRUFBRSxDQUFDLElBQUk7QUFDL0YsVUFBSSxhQUFhO0FBQ2YsbUJBQVcsT0FBTyxpQkFBaUIsRUFBRSxFQUFFLGtCQUFrQixRQUFRLEtBQUssRUFBRSxDQUFDLElBQUk7QUFDL0UsZ0JBQVUsTUFBTTtBQUNkLGVBQU8sT0FBTztBQUFBLE1BQ2hCLENBQUM7QUFDRCxzQkFBZ0I7QUFDaEIsNEJBQXNCLE1BQU07QUFDMUIsWUFBSTtBQUNGO0FBQ0Ysa0JBQVUsTUFBTTtBQUNkLGlCQUFPLElBQUk7QUFBQSxRQUNiLENBQUM7QUFDRCx5QkFBaUI7QUFDakIsbUJBQVcsR0FBRyxpQkFBaUIsUUFBUSxXQUFXQSxNQUFLO0FBQ3ZELHFCQUFhO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFDSDtBQUNBLFdBQVMsY0FBYyxXQUFXLEtBQUssVUFBVTtBQUMvQyxRQUFJLFVBQVUsUUFBUSxHQUFHLE1BQU07QUFDN0IsYUFBTztBQUNULFVBQU0sV0FBVyxVQUFVLFVBQVUsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyRCxRQUFJLENBQUM7QUFDSCxhQUFPO0FBQ1QsUUFBSSxRQUFRLFNBQVM7QUFDbkIsVUFBSSxNQUFNLFFBQVE7QUFDaEIsZUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLFFBQVEsY0FBYyxRQUFRLFNBQVM7QUFDekMsVUFBSSxRQUFRLFNBQVMsTUFBTSxZQUFZO0FBQ3ZDLFVBQUk7QUFDRixlQUFPLE1BQU0sQ0FBQztBQUFBLElBQ2xCO0FBQ0EsUUFBSSxRQUFRLFVBQVU7QUFDcEIsVUFBSSxDQUFDLE9BQU8sU0FBUyxRQUFRLFVBQVUsUUFBUSxFQUFFLFNBQVMsVUFBVSxVQUFVLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHO0FBQ2hHLGVBQU8sQ0FBQyxVQUFVLFVBQVUsVUFBVSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFBQSxNQUNuRTtBQUFBLElBQ0Y7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUdBLE1BQUksWUFBWTtBQUNoQixXQUFTLGdCQUFnQixVQUFVLFdBQVcsTUFBTTtBQUFBLEVBQ3BELEdBQUc7QUFDRCxXQUFPLElBQUksU0FBUyxZQUFZLFNBQVMsR0FBRyxJQUFJLElBQUksU0FBUyxHQUFHLElBQUk7QUFBQSxFQUN0RTtBQUNBLFdBQVMsZ0JBQWdCLFVBQVU7QUFDakMsV0FBTyxJQUFJLFNBQVMsYUFBYSxTQUFTLEdBQUcsSUFBSTtBQUFBLEVBQ25EO0FBQ0EsTUFBSSxlQUFlLENBQUM7QUFDcEIsV0FBUyxlQUFlLFVBQVU7QUFDaEMsaUJBQWEsS0FBSyxRQUFRO0FBQUEsRUFDNUI7QUFDQSxXQUFTLFVBQVUsTUFBTSxJQUFJO0FBQzNCLGlCQUFhLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQVk7QUFDWixvQ0FBZ0MsTUFBTTtBQUNwQyxlQUFTLElBQUksQ0FBQyxJQUFJLGFBQWE7QUFDN0IsaUJBQVMsSUFBSSxNQUFNO0FBQUEsUUFDbkIsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUNELGdCQUFZO0FBQUEsRUFDZDtBQUNBLE1BQUksa0JBQWtCO0FBQ3RCLFdBQVMsTUFBTSxPQUFPLE9BQU87QUFDM0IsUUFBSSxDQUFDLE1BQU07QUFDVCxZQUFNLGVBQWUsTUFBTTtBQUM3QixnQkFBWTtBQUNaLHNCQUFrQjtBQUNsQixvQ0FBZ0MsTUFBTTtBQUNwQyxnQkFBVSxLQUFLO0FBQUEsSUFDakIsQ0FBQztBQUNELGdCQUFZO0FBQ1osc0JBQWtCO0FBQUEsRUFDcEI7QUFDQSxXQUFTLFVBQVUsSUFBSTtBQUNyQixRQUFJLHVCQUF1QjtBQUMzQixRQUFJLGdCQUFnQixDQUFDLEtBQUssYUFBYTtBQUNyQyxXQUFLLEtBQUssQ0FBQyxLQUFLLFNBQVM7QUFDdkIsWUFBSSx3QkFBd0IsT0FBTyxHQUFHO0FBQ3BDLGlCQUFPLEtBQUs7QUFDZCwrQkFBdUI7QUFDdkIsaUJBQVMsS0FBSyxJQUFJO0FBQUEsTUFDcEIsQ0FBQztBQUFBLElBQ0g7QUFDQSxhQUFTLElBQUksYUFBYTtBQUFBLEVBQzVCO0FBQ0EsV0FBUyxnQ0FBZ0MsVUFBVTtBQUNqRCxRQUFJLFFBQVE7QUFDWixtQkFBZSxDQUFDLFdBQVcsT0FBTztBQUNoQyxVQUFJLGVBQWUsTUFBTSxTQUFTO0FBQ2xDLGNBQVEsWUFBWTtBQUNwQixhQUFPLE1BQU07QUFBQSxNQUNiO0FBQUEsSUFDRixDQUFDO0FBQ0QsYUFBUztBQUNULG1CQUFlLEtBQUs7QUFBQSxFQUN0QjtBQUdBLFdBQVMsS0FBSyxJQUFJLE1BQU0sT0FBTyxZQUFZLENBQUMsR0FBRztBQUM3QyxRQUFJLENBQUMsR0FBRztBQUNOLFNBQUcsY0FBYyxTQUFTLENBQUMsQ0FBQztBQUM5QixPQUFHLFlBQVksSUFBSSxJQUFJO0FBQ3ZCLFdBQU8sVUFBVSxTQUFTLE9BQU8sSUFBSSxVQUFVLElBQUksSUFBSTtBQUN2RCxZQUFRLE1BQU07QUFBQSxNQUNaLEtBQUs7QUFDSCx1QkFBZSxJQUFJLEtBQUs7QUFDeEI7QUFBQSxNQUNGLEtBQUs7QUFDSCxtQkFBVyxJQUFJLEtBQUs7QUFDcEI7QUFBQSxNQUNGLEtBQUs7QUFDSCxvQkFBWSxJQUFJLEtBQUs7QUFDckI7QUFBQSxNQUNGLEtBQUs7QUFBQSxNQUNMLEtBQUs7QUFDSCxpQ0FBeUIsSUFBSSxNQUFNLEtBQUs7QUFDeEM7QUFBQSxNQUNGO0FBQ0Usc0JBQWMsSUFBSSxNQUFNLEtBQUs7QUFDN0I7QUFBQSxJQUNKO0FBQUEsRUFDRjtBQUNBLFdBQVMsZUFBZSxJQUFJLE9BQU87QUFDakMsUUFBSSxRQUFRLEVBQUUsR0FBRztBQUNmLFVBQUksR0FBRyxXQUFXLFVBQVUsUUFBUTtBQUNsQyxXQUFHLFFBQVE7QUFBQSxNQUNiO0FBQ0EsVUFBSSxPQUFPLFdBQVc7QUFDcEIsWUFBSSxPQUFPLFVBQVUsV0FBVztBQUM5QixhQUFHLFVBQVUsaUJBQWlCLEdBQUcsS0FBSyxNQUFNO0FBQUEsUUFDOUMsT0FBTztBQUNMLGFBQUcsVUFBVSx3QkFBd0IsR0FBRyxPQUFPLEtBQUs7QUFBQSxRQUN0RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFdBQVcsV0FBVyxFQUFFLEdBQUc7QUFDekIsVUFBSSxPQUFPLFVBQVUsS0FBSyxHQUFHO0FBQzNCLFdBQUcsUUFBUTtBQUFBLE1BQ2IsV0FBVyxDQUFDLE1BQU0sUUFBUSxLQUFLLEtBQUssT0FBTyxVQUFVLGFBQWEsQ0FBQyxDQUFDLE1BQU0sTUFBTSxFQUFFLFNBQVMsS0FBSyxHQUFHO0FBQ2pHLFdBQUcsUUFBUSxPQUFPLEtBQUs7QUFBQSxNQUN6QixPQUFPO0FBQ0wsWUFBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQ3hCLGFBQUcsVUFBVSxNQUFNLEtBQUssQ0FBQyxRQUFRLHdCQUF3QixLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQUEsUUFDekUsT0FBTztBQUNMLGFBQUcsVUFBVSxDQUFDLENBQUM7QUFBQSxRQUNqQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFdBQVcsR0FBRyxZQUFZLFVBQVU7QUFDbEMsbUJBQWEsSUFBSSxLQUFLO0FBQUEsSUFDeEIsT0FBTztBQUNMLFVBQUksR0FBRyxVQUFVO0FBQ2Y7QUFDRixTQUFHLFFBQVEsVUFBVSxTQUFTLEtBQUs7QUFBQSxJQUNyQztBQUFBLEVBQ0Y7QUFDQSxXQUFTLFlBQVksSUFBSSxPQUFPO0FBQzlCLFFBQUksR0FBRztBQUNMLFNBQUcsb0JBQW9CO0FBQ3pCLE9BQUcsc0JBQXNCLFdBQVcsSUFBSSxLQUFLO0FBQUEsRUFDL0M7QUFDQSxXQUFTLFdBQVcsSUFBSSxPQUFPO0FBQzdCLFFBQUksR0FBRztBQUNMLFNBQUcsbUJBQW1CO0FBQ3hCLE9BQUcscUJBQXFCLFVBQVUsSUFBSSxLQUFLO0FBQUEsRUFDN0M7QUFDQSxXQUFTLHlCQUF5QixJQUFJLE1BQU0sT0FBTztBQUNqRCxrQkFBYyxJQUFJLE1BQU0sS0FBSztBQUM3Qix5QkFBcUIsSUFBSSxNQUFNLEtBQUs7QUFBQSxFQUN0QztBQUNBLFdBQVMsY0FBYyxJQUFJLE1BQU0sT0FBTztBQUN0QyxRQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssRUFBRSxTQUFTLEtBQUssS0FBSyxvQ0FBb0MsSUFBSSxHQUFHO0FBQ3RGLFNBQUcsZ0JBQWdCLElBQUk7QUFBQSxJQUN6QixPQUFPO0FBQ0wsVUFBSSxjQUFjLElBQUk7QUFDcEIsZ0JBQVE7QUFDVixtQkFBYSxJQUFJLE1BQU0sS0FBSztBQUFBLElBQzlCO0FBQUEsRUFDRjtBQUNBLFdBQVMsYUFBYSxJQUFJLFVBQVUsT0FBTztBQUN6QyxRQUFJLEdBQUcsYUFBYSxRQUFRLEtBQUssT0FBTztBQUN0QyxTQUFHLGFBQWEsVUFBVSxLQUFLO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQ0EsV0FBUyxxQkFBcUIsSUFBSSxVQUFVLE9BQU87QUFDakQsUUFBSSxHQUFHLFFBQVEsTUFBTSxPQUFPO0FBQzFCLFNBQUcsUUFBUSxJQUFJO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQ0EsV0FBUyxhQUFhLElBQUksT0FBTztBQUMvQixVQUFNLG9CQUFvQixDQUFDLEVBQUUsT0FBTyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDekQsYUFBTyxTQUFTO0FBQUEsSUFDbEIsQ0FBQztBQUNELFVBQU0sS0FBSyxHQUFHLE9BQU8sRUFBRSxRQUFRLENBQUMsV0FBVztBQUN6QyxhQUFPLFdBQVcsa0JBQWtCLFNBQVMsT0FBTyxLQUFLO0FBQUEsSUFDM0QsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFVBQVUsU0FBUztBQUMxQixXQUFPLFFBQVEsWUFBWSxFQUFFLFFBQVEsVUFBVSxDQUFDLE9BQU8sU0FBUyxLQUFLLFlBQVksQ0FBQztBQUFBLEVBQ3BGO0FBQ0EsV0FBUyx3QkFBd0IsUUFBUSxRQUFRO0FBQy9DLFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBQ0EsV0FBUyxpQkFBaUIsVUFBVTtBQUNsQyxRQUFJLENBQUMsR0FBRyxLQUFLLFFBQVEsTUFBTSxPQUFPLElBQUksRUFBRSxTQUFTLFFBQVEsR0FBRztBQUMxRCxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksQ0FBQyxHQUFHLEtBQUssU0FBUyxPQUFPLE1BQU0sS0FBSyxFQUFFLFNBQVMsUUFBUSxHQUFHO0FBQzVELGFBQU87QUFBQSxJQUNUO0FBQ0EsV0FBTyxXQUFXLFFBQVEsUUFBUSxJQUFJO0FBQUEsRUFDeEM7QUFDQSxNQUFJLG9CQUFvQyxvQkFBSSxJQUFJO0FBQUEsSUFDOUM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQztBQUNELFdBQVMsY0FBYyxVQUFVO0FBQy9CLFdBQU8sa0JBQWtCLElBQUksUUFBUTtBQUFBLEVBQ3ZDO0FBQ0EsV0FBUyxvQ0FBb0MsTUFBTTtBQUNqRCxXQUFPLENBQUMsQ0FBQyxnQkFBZ0IsZ0JBQWdCLGlCQUFpQixlQUFlLEVBQUUsU0FBUyxJQUFJO0FBQUEsRUFDMUY7QUFDQSxXQUFTLFdBQVcsSUFBSSxNQUFNLFVBQVU7QUFDdEMsUUFBSSxHQUFHLGVBQWUsR0FBRyxZQUFZLElBQUksTUFBTTtBQUM3QyxhQUFPLEdBQUcsWUFBWSxJQUFJO0FBQzVCLFdBQU8sb0JBQW9CLElBQUksTUFBTSxRQUFRO0FBQUEsRUFDL0M7QUFDQSxXQUFTLFlBQVksSUFBSSxNQUFNLFVBQVUsVUFBVSxNQUFNO0FBQ3ZELFFBQUksR0FBRyxlQUFlLEdBQUcsWUFBWSxJQUFJLE1BQU07QUFDN0MsYUFBTyxHQUFHLFlBQVksSUFBSTtBQUM1QixRQUFJLEdBQUcscUJBQXFCLEdBQUcsa0JBQWtCLElBQUksTUFBTSxRQUFRO0FBQ2pFLFVBQUksVUFBVSxHQUFHLGtCQUFrQixJQUFJO0FBQ3ZDLGNBQVEsVUFBVTtBQUNsQixhQUFPLDBCQUEwQixNQUFNO0FBQ3JDLGVBQU8sU0FBUyxJQUFJLFFBQVEsVUFBVTtBQUFBLE1BQ3hDLENBQUM7QUFBQSxJQUNIO0FBQ0EsV0FBTyxvQkFBb0IsSUFBSSxNQUFNLFFBQVE7QUFBQSxFQUMvQztBQUNBLFdBQVMsb0JBQW9CLElBQUksTUFBTSxVQUFVO0FBQy9DLFFBQUksT0FBTyxHQUFHLGFBQWEsSUFBSTtBQUMvQixRQUFJLFNBQVM7QUFDWCxhQUFPLE9BQU8sYUFBYSxhQUFhLFNBQVMsSUFBSTtBQUN2RCxRQUFJLFNBQVM7QUFDWCxhQUFPO0FBQ1QsUUFBSSxjQUFjLElBQUksR0FBRztBQUN2QixhQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sTUFBTSxFQUFFLFNBQVMsSUFBSTtBQUFBLElBQ3ZDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLFdBQVcsSUFBSTtBQUN0QixXQUFPLEdBQUcsU0FBUyxjQUFjLEdBQUcsY0FBYyxpQkFBaUIsR0FBRyxjQUFjO0FBQUEsRUFDdEY7QUFDQSxXQUFTLFFBQVEsSUFBSTtBQUNuQixXQUFPLEdBQUcsU0FBUyxXQUFXLEdBQUcsY0FBYztBQUFBLEVBQ2pEO0FBR0EsV0FBUyxTQUFTLE1BQU0sTUFBTTtBQUM1QixRQUFJO0FBQ0osV0FBTyxXQUFXO0FBQ2hCLFlBQU0sVUFBVSxNQUFNLE9BQU87QUFDN0IsWUFBTSxRQUFRLFdBQVc7QUFDdkIsa0JBQVU7QUFDVixhQUFLLE1BQU0sU0FBUyxJQUFJO0FBQUEsTUFDMUI7QUFDQSxtQkFBYSxPQUFPO0FBQ3BCLGdCQUFVLFdBQVcsT0FBTyxJQUFJO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBR0EsV0FBUyxTQUFTLE1BQU0sT0FBTztBQUM3QixRQUFJO0FBQ0osV0FBTyxXQUFXO0FBQ2hCLFVBQUksVUFBVSxNQUFNLE9BQU87QUFDM0IsVUFBSSxDQUFDLFlBQVk7QUFDZixhQUFLLE1BQU0sU0FBUyxJQUFJO0FBQ3hCLHFCQUFhO0FBQ2IsbUJBQVcsTUFBTSxhQUFhLE9BQU8sS0FBSztBQUFBLE1BQzVDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFHQSxXQUFTLFNBQVMsRUFBRSxLQUFLLFVBQVUsS0FBSyxTQUFTLEdBQUcsRUFBRSxLQUFLLFVBQVUsS0FBSyxTQUFTLEdBQUc7QUFDcEYsUUFBSSxXQUFXO0FBQ2YsUUFBSTtBQUNKLFFBQUk7QUFDSixRQUFJLFlBQVksT0FBTyxNQUFNO0FBQzNCLFVBQUksUUFBUSxTQUFTO0FBQ3JCLFVBQUksUUFBUSxTQUFTO0FBQ3JCLFVBQUksVUFBVTtBQUNaLGlCQUFTLGNBQWMsS0FBSyxDQUFDO0FBQzdCLG1CQUFXO0FBQUEsTUFDYixPQUFPO0FBQ0wsWUFBSSxrQkFBa0IsS0FBSyxVQUFVLEtBQUs7QUFDMUMsWUFBSSxrQkFBa0IsS0FBSyxVQUFVLEtBQUs7QUFDMUMsWUFBSSxvQkFBb0IsV0FBVztBQUNqQyxtQkFBUyxjQUFjLEtBQUssQ0FBQztBQUFBLFFBQy9CLFdBQVcsb0JBQW9CLGlCQUFpQjtBQUM5QyxtQkFBUyxjQUFjLEtBQUssQ0FBQztBQUFBLFFBQy9CLE9BQU87QUFBQSxRQUNQO0FBQUEsTUFDRjtBQUNBLGtCQUFZLEtBQUssVUFBVSxTQUFTLENBQUM7QUFDckMsa0JBQVksS0FBSyxVQUFVLFNBQVMsQ0FBQztBQUFBLElBQ3ZDLENBQUM7QUFDRCxXQUFPLE1BQU07QUFDWCxjQUFRLFNBQVM7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLGNBQWMsT0FBTztBQUM1QixXQUFPLE9BQU8sVUFBVSxXQUFXLEtBQUssTUFBTSxLQUFLLFVBQVUsS0FBSyxDQUFDLElBQUk7QUFBQSxFQUN6RTtBQUdBLFdBQVMsT0FBTyxVQUFVO0FBQ3hCLFFBQUksWUFBWSxNQUFNLFFBQVEsUUFBUSxJQUFJLFdBQVcsQ0FBQyxRQUFRO0FBQzlELGNBQVUsUUFBUSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUM7QUFBQSxFQUM1QztBQUdBLE1BQUksU0FBUyxDQUFDO0FBQ2QsTUFBSSxhQUFhO0FBQ2pCLFdBQVMsTUFBTSxNQUFNLE9BQU87QUFDMUIsUUFBSSxDQUFDLFlBQVk7QUFDZixlQUFTLFNBQVMsTUFBTTtBQUN4QixtQkFBYTtBQUFBLElBQ2Y7QUFDQSxRQUFJLFVBQVUsUUFBUTtBQUNwQixhQUFPLE9BQU8sSUFBSTtBQUFBLElBQ3BCO0FBQ0EsV0FBTyxJQUFJLElBQUk7QUFDZixxQkFBaUIsT0FBTyxJQUFJLENBQUM7QUFDN0IsUUFBSSxPQUFPLFVBQVUsWUFBWSxVQUFVLFFBQVEsTUFBTSxlQUFlLE1BQU0sS0FBSyxPQUFPLE1BQU0sU0FBUyxZQUFZO0FBQ25ILGFBQU8sSUFBSSxFQUFFLEtBQUs7QUFBQSxJQUNwQjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLFlBQVk7QUFDbkIsV0FBTztBQUFBLEVBQ1Q7QUFHQSxNQUFJLFFBQVEsQ0FBQztBQUNiLFdBQVMsTUFBTSxNQUFNLFVBQVU7QUFDN0IsUUFBSSxjQUFjLE9BQU8sYUFBYSxhQUFhLE1BQU0sV0FBVztBQUNwRSxRQUFJLGdCQUFnQixTQUFTO0FBQzNCLGFBQU8sb0JBQW9CLE1BQU0sWUFBWSxDQUFDO0FBQUEsSUFDaEQsT0FBTztBQUNMLFlBQU0sSUFBSSxJQUFJO0FBQUEsSUFDaEI7QUFDQSxXQUFPLE1BQU07QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUNBLFdBQVMsdUJBQXVCLEtBQUs7QUFDbkMsV0FBTyxRQUFRLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTTtBQUNsRCxhQUFPLGVBQWUsS0FBSyxNQUFNO0FBQUEsUUFDL0IsTUFBTTtBQUNKLGlCQUFPLElBQUksU0FBUztBQUNsQixtQkFBTyxTQUFTLEdBQUcsSUFBSTtBQUFBLFVBQ3pCO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxvQkFBb0IsSUFBSSxLQUFLLFVBQVU7QUFDOUMsUUFBSSxpQkFBaUIsQ0FBQztBQUN0QixXQUFPLGVBQWU7QUFDcEIscUJBQWUsSUFBSSxFQUFFO0FBQ3ZCLFFBQUksYUFBYSxPQUFPLFFBQVEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLEVBQUUsTUFBTSxNQUFNLEVBQUU7QUFDN0UsUUFBSSxtQkFBbUIsZUFBZSxVQUFVO0FBQ2hELGlCQUFhLFdBQVcsSUFBSSxDQUFDLGNBQWM7QUFDekMsVUFBSSxpQkFBaUIsS0FBSyxDQUFDLFNBQVMsS0FBSyxTQUFTLFVBQVUsSUFBSSxHQUFHO0FBQ2pFLGVBQU87QUFBQSxVQUNMLE1BQU0sVUFBVSxVQUFVLElBQUk7QUFBQSxVQUM5QixPQUFPLElBQUksVUFBVSxLQUFLO0FBQUEsUUFDNUI7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1QsQ0FBQztBQUNELGVBQVcsSUFBSSxZQUFZLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVztBQUNuRCxxQkFBZSxLQUFLLE9BQU8sV0FBVztBQUN0QyxhQUFPO0FBQUEsSUFDVCxDQUFDO0FBQ0QsV0FBTyxNQUFNO0FBQ1gsYUFBTyxlQUFlO0FBQ3BCLHVCQUFlLElBQUksRUFBRTtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUdBLE1BQUksUUFBUSxDQUFDO0FBQ2IsV0FBUyxLQUFLLE1BQU0sVUFBVTtBQUM1QixVQUFNLElBQUksSUFBSTtBQUFBLEVBQ2hCO0FBQ0EsV0FBUyxvQkFBb0IsS0FBSyxTQUFTO0FBQ3pDLFdBQU8sUUFBUSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU07QUFDbEQsYUFBTyxlQUFlLEtBQUssTUFBTTtBQUFBLFFBQy9CLE1BQU07QUFDSixpQkFBTyxJQUFJLFNBQVM7QUFDbEIsbUJBQU8sU0FBUyxLQUFLLE9BQU8sRUFBRSxHQUFHLElBQUk7QUFBQSxVQUN2QztBQUFBLFFBQ0Y7QUFBQSxRQUNBLFlBQVk7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNILENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDVDtBQUdBLE1BQUksU0FBUztBQUFBLElBQ1gsSUFBSSxXQUFXO0FBQ2IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLElBQUksVUFBVTtBQUNaLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxJQUFJLFNBQVM7QUFDWCxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsSUFBSSxNQUFNO0FBQ1IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLFNBQVM7QUFBQSxJQUNUO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQTtBQUFBLElBRUE7QUFBQTtBQUFBLElBRUEsT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsTUFBTTtBQUFBLEVBQ1I7QUFDQSxNQUFJLGlCQUFpQjtBQUdyQixNQUFJLFFBQVEsTUFBTTtBQUFBLElBQ2hCLFlBQVksTUFBTSxPQUFPLFFBQVEsS0FBSztBQUNwQyxXQUFLLE9BQU87QUFDWixXQUFLLFFBQVE7QUFDYixXQUFLLFFBQVE7QUFDYixXQUFLLE1BQU07QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUNBLE1BQUksWUFBWSxNQUFNO0FBQUEsSUFDcEIsWUFBWSxPQUFPO0FBQ2pCLFdBQUssUUFBUTtBQUNiLFdBQUssV0FBVztBQUNoQixXQUFLLFNBQVMsQ0FBQztBQUFBLElBQ2pCO0FBQUEsSUFDQSxXQUFXO0FBQ1QsYUFBTyxLQUFLLFdBQVcsS0FBSyxNQUFNLFFBQVE7QUFDeEMsYUFBSyxlQUFlO0FBQ3BCLFlBQUksS0FBSyxZQUFZLEtBQUssTUFBTTtBQUM5QjtBQUNGLGNBQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxRQUFRO0FBQ3JDLFlBQUksS0FBSyxRQUFRLElBQUksR0FBRztBQUN0QixlQUFLLFdBQVc7QUFBQSxRQUNsQixXQUFXLEtBQUssUUFBUSxJQUFJLEtBQUssU0FBUyxPQUFPLFNBQVMsS0FBSztBQUM3RCxlQUFLLHdCQUF3QjtBQUFBLFFBQy9CLFdBQVcsU0FBUyxPQUFPLFNBQVMsS0FBSztBQUN2QyxlQUFLLFdBQVc7QUFBQSxRQUNsQixXQUFXLFNBQVMsT0FBTyxLQUFLLEtBQUssTUFBTSxLQUFLO0FBQzlDLGVBQUssZ0JBQWdCO0FBQUEsUUFDdkIsT0FBTztBQUNMLGVBQUssMEJBQTBCO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQ0EsV0FBSyxPQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sTUFBTSxLQUFLLFVBQVUsS0FBSyxRQUFRLENBQUM7QUFDckUsYUFBTyxLQUFLO0FBQUEsSUFDZDtBQUFBLElBQ0EsaUJBQWlCO0FBQ2YsYUFBTyxLQUFLLFdBQVcsS0FBSyxNQUFNLFVBQVUsS0FBSyxLQUFLLEtBQUssTUFBTSxLQUFLLFFBQVEsQ0FBQyxHQUFHO0FBQ2hGLGFBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLElBQ0Esa0JBQWtCO0FBQ2hCLGFBQU8sS0FBSyxXQUFXLEtBQUssTUFBTSxVQUFVLEtBQUssTUFBTSxLQUFLLFFBQVEsTUFBTSxNQUFNO0FBQzlFLGFBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUSxNQUFNO0FBQ1osYUFBTyxRQUFRLEtBQUssSUFBSTtBQUFBLElBQzFCO0FBQUEsSUFDQSxRQUFRLE1BQU07QUFDWixhQUFPLFdBQVcsS0FBSyxJQUFJO0FBQUEsSUFDN0I7QUFBQSxJQUNBLGVBQWUsTUFBTTtBQUNuQixhQUFPLGdCQUFnQixLQUFLLElBQUk7QUFBQSxJQUNsQztBQUFBLElBQ0EsS0FBSyxTQUFTLEdBQUc7QUFDZixhQUFPLEtBQUssTUFBTSxLQUFLLFdBQVcsTUFBTSxLQUFLO0FBQUEsSUFDL0M7QUFBQSxJQUNBLGFBQWE7QUFDWCxZQUFNLFNBQVMsS0FBSztBQUNwQixVQUFJLGFBQWE7QUFDakIsYUFBTyxLQUFLLFdBQVcsS0FBSyxNQUFNLFFBQVE7QUFDeEMsY0FBTSxPQUFPLEtBQUssTUFBTSxLQUFLLFFBQVE7QUFDckMsWUFBSSxLQUFLLFFBQVEsSUFBSSxHQUFHO0FBQ3RCLGVBQUs7QUFBQSxRQUNQLFdBQVcsU0FBUyxPQUFPLENBQUMsWUFBWTtBQUN0Qyx1QkFBYTtBQUNiLGVBQUs7QUFBQSxRQUNQLE9BQU87QUFDTDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsWUFBTSxRQUFRLEtBQUssTUFBTSxNQUFNLFFBQVEsS0FBSyxRQUFRO0FBQ3BELFdBQUssT0FBTyxLQUFLLElBQUksTUFBTSxVQUFVLFdBQVcsS0FBSyxHQUFHLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxJQUNoRjtBQUFBLElBQ0EsMEJBQTBCO0FBQ3hCLFlBQU0sU0FBUyxLQUFLO0FBQ3BCLGFBQU8sS0FBSyxXQUFXLEtBQUssTUFBTSxVQUFVLEtBQUssZUFBZSxLQUFLLE1BQU0sS0FBSyxRQUFRLENBQUMsR0FBRztBQUMxRixhQUFLO0FBQUEsTUFDUDtBQUNBLFlBQU0sUUFBUSxLQUFLLE1BQU0sTUFBTSxRQUFRLEtBQUssUUFBUTtBQUNwRCxZQUFNLFdBQVcsQ0FBQyxRQUFRLFNBQVMsUUFBUSxhQUFhLE9BQU8sVUFBVSxRQUFRLFVBQVUsTUFBTSxZQUFZO0FBQzdHLFVBQUksU0FBUyxTQUFTLEtBQUssR0FBRztBQUM1QixZQUFJLFVBQVUsVUFBVSxVQUFVLFNBQVM7QUFDekMsZUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFdBQVcsVUFBVSxRQUFRLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxRQUNoRixXQUFXLFVBQVUsUUFBUTtBQUMzQixlQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sUUFBUSxNQUFNLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxRQUNqRSxXQUFXLFVBQVUsYUFBYTtBQUNoQyxlQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sYUFBYSxRQUFRLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxRQUN4RSxPQUFPO0FBQ0wsZUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFdBQVcsT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsUUFDckU7QUFBQSxNQUNGLE9BQU87QUFDTCxhQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sY0FBYyxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUN4RTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWE7QUFDWCxZQUFNLFNBQVMsS0FBSztBQUNwQixZQUFNLFFBQVEsS0FBSyxNQUFNLEtBQUssUUFBUTtBQUN0QyxXQUFLO0FBQ0wsVUFBSSxRQUFRO0FBQ1osVUFBSSxVQUFVO0FBQ2QsYUFBTyxLQUFLLFdBQVcsS0FBSyxNQUFNLFFBQVE7QUFDeEMsY0FBTSxPQUFPLEtBQUssTUFBTSxLQUFLLFFBQVE7QUFDckMsWUFBSSxTQUFTO0FBQ1gsa0JBQVEsTUFBTTtBQUFBLFlBQ1osS0FBSztBQUNILHVCQUFTO0FBQ1Q7QUFBQSxZQUNGLEtBQUs7QUFDSCx1QkFBUztBQUNUO0FBQUEsWUFDRixLQUFLO0FBQ0gsdUJBQVM7QUFDVDtBQUFBLFlBQ0YsS0FBSztBQUNILHVCQUFTO0FBQ1Q7QUFBQSxZQUNGLEtBQUs7QUFDSCx1QkFBUztBQUNUO0FBQUEsWUFDRjtBQUNFLHVCQUFTO0FBQUEsVUFDYjtBQUNBLG9CQUFVO0FBQUEsUUFDWixXQUFXLFNBQVMsTUFBTTtBQUN4QixvQkFBVTtBQUFBLFFBQ1osV0FBVyxTQUFTLE9BQU87QUFDekIsZUFBSztBQUNMLGVBQUssT0FBTyxLQUFLLElBQUksTUFBTSxVQUFVLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUNsRTtBQUFBLFFBQ0YsT0FBTztBQUNMLG1CQUFTO0FBQUEsUUFDWDtBQUNBLGFBQUs7QUFBQSxNQUNQO0FBQ0EsWUFBTSxJQUFJLE1BQU0sNENBQTRDLE1BQU0sRUFBRTtBQUFBLElBQ3RFO0FBQUEsSUFDQSw0QkFBNEI7QUFDMUIsWUFBTSxTQUFTLEtBQUs7QUFDcEIsWUFBTSxPQUFPLEtBQUssTUFBTSxLQUFLLFFBQVE7QUFDckMsWUFBTSxPQUFPLEtBQUssS0FBSztBQUN2QixZQUFNLFdBQVcsS0FBSyxLQUFLLENBQUM7QUFDNUIsVUFBSSxTQUFTLE9BQU8sU0FBUyxPQUFPLGFBQWEsS0FBSztBQUNwRCxhQUFLLFlBQVk7QUFDakIsYUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsTUFDdEUsV0FBVyxTQUFTLE9BQU8sU0FBUyxPQUFPLGFBQWEsS0FBSztBQUMzRCxhQUFLLFlBQVk7QUFDakIsYUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsTUFDdEUsV0FBVyxTQUFTLE9BQU8sU0FBUyxLQUFLO0FBQ3ZDLGFBQUssWUFBWTtBQUNqQixhQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxNQUFNLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUNyRSxXQUFXLFNBQVMsT0FBTyxTQUFTLEtBQUs7QUFDdkMsYUFBSyxZQUFZO0FBQ2pCLGFBQUssT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQ3JFLFdBQVcsU0FBUyxPQUFPLFNBQVMsS0FBSztBQUN2QyxhQUFLLFlBQVk7QUFDakIsYUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksTUFBTSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsTUFDckUsV0FBVyxTQUFTLE9BQU8sU0FBUyxLQUFLO0FBQ3ZDLGFBQUssWUFBWTtBQUNqQixhQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxNQUFNLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUNyRSxXQUFXLFNBQVMsT0FBTyxTQUFTLEtBQUs7QUFDdkMsYUFBSyxZQUFZO0FBQ2pCLGFBQUssT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQ3JFLFdBQVcsU0FBUyxPQUFPLFNBQVMsS0FBSztBQUN2QyxhQUFLLFlBQVk7QUFDakIsYUFBSyxPQUFPLEtBQUssSUFBSSxNQUFNLFlBQVksTUFBTSxRQUFRLEtBQUssUUFBUSxDQUFDO0FBQUEsTUFDckUsV0FBVyxTQUFTLE9BQU8sU0FBUyxLQUFLO0FBQ3ZDLGFBQUssWUFBWTtBQUNqQixhQUFLLE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxNQUFNLFFBQVEsS0FBSyxRQUFRLENBQUM7QUFBQSxNQUNyRSxXQUFXLFNBQVMsT0FBTyxTQUFTLEtBQUs7QUFDdkMsYUFBSyxZQUFZO0FBQ2pCLGFBQUssT0FBTyxLQUFLLElBQUksTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQ3JFLE9BQU87QUFDTCxhQUFLO0FBQ0wsY0FBTSxPQUFPLGNBQWMsU0FBUyxJQUFJLElBQUksZ0JBQWdCO0FBQzVELGFBQUssT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLE1BQU0sUUFBUSxLQUFLLFFBQVEsQ0FBQztBQUFBLE1BQy9EO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLFNBQVMsTUFBTTtBQUFBLElBQ2pCLFlBQVksUUFBUTtBQUNsQixXQUFLLFNBQVM7QUFDZCxXQUFLLFdBQVc7QUFBQSxJQUNsQjtBQUFBLElBQ0EsUUFBUTtBQUNOLFVBQUksS0FBSyxRQUFRLEdBQUc7QUFDbEIsY0FBTSxJQUFJLE1BQU0sa0JBQWtCO0FBQUEsTUFDcEM7QUFDQSxZQUFNLE9BQU8sS0FBSyxnQkFBZ0I7QUFDbEMsV0FBSyxNQUFNLGVBQWUsR0FBRztBQUM3QixVQUFJLENBQUMsS0FBSyxRQUFRLEdBQUc7QUFDbkIsY0FBTSxJQUFJLE1BQU0scUJBQXFCLEtBQUssUUFBUSxFQUFFLEtBQUssRUFBRTtBQUFBLE1BQzdEO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGtCQUFrQjtBQUNoQixhQUFPLEtBQUssZ0JBQWdCO0FBQUEsSUFDOUI7QUFBQSxJQUNBLGtCQUFrQjtBQUNoQixZQUFNLE9BQU8sS0FBSyxhQUFhO0FBQy9CLFVBQUksS0FBSyxNQUFNLFlBQVksR0FBRyxHQUFHO0FBQy9CLGNBQU0sUUFBUSxLQUFLLGdCQUFnQjtBQUNuQyxZQUFJLEtBQUssU0FBUyxnQkFBZ0IsS0FBSyxTQUFTLG9CQUFvQjtBQUNsRSxpQkFBTztBQUFBLFlBQ0wsTUFBTTtBQUFBLFlBQ04sTUFBTTtBQUFBLFlBQ04sVUFBVTtBQUFBLFlBQ1YsT0FBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQ0EsY0FBTSxJQUFJLE1BQU0sMkJBQTJCO0FBQUEsTUFDN0M7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsZUFBZTtBQUNiLFlBQU0sT0FBTyxLQUFLLGVBQWU7QUFDakMsVUFBSSxLQUFLLE1BQU0sZUFBZSxHQUFHLEdBQUc7QUFDbEMsY0FBTSxhQUFhLEtBQUssZ0JBQWdCO0FBQ3hDLGFBQUssUUFBUSxlQUFlLEdBQUc7QUFDL0IsY0FBTSxZQUFZLEtBQUssZ0JBQWdCO0FBQ3ZDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGlCQUFpQjtBQUNmLFVBQUksT0FBTyxLQUFLLGdCQUFnQjtBQUNoQyxhQUFPLEtBQUssTUFBTSxZQUFZLElBQUksR0FBRztBQUNuQyxjQUFNLFdBQVcsS0FBSyxTQUFTLEVBQUU7QUFDakMsY0FBTSxRQUFRLEtBQUssZ0JBQWdCO0FBQ25DLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGtCQUFrQjtBQUNoQixVQUFJLE9BQU8sS0FBSyxjQUFjO0FBQzlCLGFBQU8sS0FBSyxNQUFNLFlBQVksSUFBSSxHQUFHO0FBQ25DLGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFFBQVEsS0FBSyxjQUFjO0FBQ2pDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGdCQUFnQjtBQUNkLFVBQUksT0FBTyxLQUFLLGdCQUFnQjtBQUNoQyxhQUFPLEtBQUssTUFBTSxZQUFZLE1BQU0sTUFBTSxPQUFPLEtBQUssR0FBRztBQUN2RCxjQUFNLFdBQVcsS0FBSyxTQUFTLEVBQUU7QUFDakMsY0FBTSxRQUFRLEtBQUssZ0JBQWdCO0FBQ25DLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGtCQUFrQjtBQUNoQixVQUFJLE9BQU8sS0FBSyxjQUFjO0FBQzlCLGFBQU8sS0FBSyxNQUFNLFlBQVksS0FBSyxLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQ25ELGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFFBQVEsS0FBSyxjQUFjO0FBQ2pDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGdCQUFnQjtBQUNkLFVBQUksT0FBTyxLQUFLLG9CQUFvQjtBQUNwQyxhQUFPLEtBQUssTUFBTSxZQUFZLEtBQUssR0FBRyxHQUFHO0FBQ3ZDLGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFFBQVEsS0FBSyxvQkFBb0I7QUFDdkMsZUFBTztBQUFBLFVBQ0wsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLE1BQU07QUFBQSxVQUNOO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0Esc0JBQXNCO0FBQ3BCLFVBQUksT0FBTyxLQUFLLFdBQVc7QUFDM0IsYUFBTyxLQUFLLE1BQU0sWUFBWSxLQUFLLEtBQUssR0FBRyxHQUFHO0FBQzVDLGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFFBQVEsS0FBSyxXQUFXO0FBQzlCLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGFBQWE7QUFDWCxVQUFJLEtBQUssTUFBTSxZQUFZLE1BQU0sSUFBSSxHQUFHO0FBQ3RDLGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0EsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQ0EsVUFBSSxLQUFLLE1BQU0sWUFBWSxLQUFLLEtBQUssR0FBRyxHQUFHO0FBQ3pDLGNBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNqQyxjQUFNLFdBQVcsS0FBSyxXQUFXO0FBQ2pDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0EsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQ0EsYUFBTyxLQUFLLGFBQWE7QUFBQSxJQUMzQjtBQUFBLElBQ0EsZUFBZTtBQUNiLFVBQUksT0FBTyxLQUFLLFlBQVk7QUFDNUIsVUFBSSxLQUFLLE1BQU0sWUFBWSxNQUFNLElBQUksR0FBRztBQUN0QyxjQUFNLFdBQVcsS0FBSyxTQUFTLEVBQUU7QUFDakMsZUFBTztBQUFBLFVBQ0wsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxjQUFjO0FBQ1osVUFBSSxPQUFPLEtBQUssYUFBYTtBQUM3QixhQUFPLE1BQU07QUFDWCxZQUFJLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUNsQyxnQkFBTSxXQUFXLEtBQUssUUFBUSxZQUFZO0FBQzFDLGlCQUFPO0FBQUEsWUFDTCxNQUFNO0FBQUEsWUFDTixRQUFRO0FBQUEsWUFDUixVQUFVLEVBQUUsTUFBTSxjQUFjLE1BQU0sU0FBUyxNQUFNO0FBQUEsWUFDckQsVUFBVTtBQUFBLFVBQ1o7QUFBQSxRQUNGLFdBQVcsS0FBSyxNQUFNLGVBQWUsR0FBRyxHQUFHO0FBQ3pDLGdCQUFNLFdBQVcsS0FBSyxnQkFBZ0I7QUFDdEMsZUFBSyxRQUFRLGVBQWUsR0FBRztBQUMvQixpQkFBTztBQUFBLFlBQ0wsTUFBTTtBQUFBLFlBQ04sUUFBUTtBQUFBLFlBQ1I7QUFBQSxZQUNBLFVBQVU7QUFBQSxVQUNaO0FBQUEsUUFDRixXQUFXLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUN6QyxnQkFBTSxPQUFPLEtBQUssZUFBZTtBQUNqQyxpQkFBTztBQUFBLFlBQ0wsTUFBTTtBQUFBLFlBQ04sUUFBUTtBQUFBLFlBQ1IsV0FBVztBQUFBLFVBQ2I7QUFBQSxRQUNGLE9BQU87QUFDTDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGlCQUFpQjtBQUNmLFlBQU0sT0FBTyxDQUFDO0FBQ2QsVUFBSSxDQUFDLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUNuQyxXQUFHO0FBQ0QsZUFBSyxLQUFLLEtBQUssZ0JBQWdCLENBQUM7QUFBQSxRQUNsQyxTQUFTLEtBQUssTUFBTSxlQUFlLEdBQUc7QUFBQSxNQUN4QztBQUNBLFdBQUssUUFBUSxlQUFlLEdBQUc7QUFDL0IsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGVBQWU7QUFDYixVQUFJLEtBQUssTUFBTSxRQUFRLEdBQUc7QUFDeEIsZUFBTyxFQUFFLE1BQU0sV0FBVyxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU07QUFBQSxNQUN6RDtBQUNBLFVBQUksS0FBSyxNQUFNLFFBQVEsR0FBRztBQUN4QixlQUFPLEVBQUUsTUFBTSxXQUFXLE9BQU8sS0FBSyxTQUFTLEVBQUUsTUFBTTtBQUFBLE1BQ3pEO0FBQ0EsVUFBSSxLQUFLLE1BQU0sU0FBUyxHQUFHO0FBQ3pCLGVBQU8sRUFBRSxNQUFNLFdBQVcsT0FBTyxLQUFLLFNBQVMsRUFBRSxNQUFNO0FBQUEsTUFDekQ7QUFDQSxVQUFJLEtBQUssTUFBTSxNQUFNLEdBQUc7QUFDdEIsZUFBTyxFQUFFLE1BQU0sV0FBVyxPQUFPLEtBQUs7QUFBQSxNQUN4QztBQUNBLFVBQUksS0FBSyxNQUFNLFdBQVcsR0FBRztBQUMzQixlQUFPLEVBQUUsTUFBTSxXQUFXLE9BQU8sT0FBTztBQUFBLE1BQzFDO0FBQ0EsVUFBSSxLQUFLLE1BQU0sWUFBWSxHQUFHO0FBQzVCLGVBQU8sRUFBRSxNQUFNLGNBQWMsTUFBTSxLQUFLLFNBQVMsRUFBRSxNQUFNO0FBQUEsTUFDM0Q7QUFDQSxVQUFJLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUNsQyxjQUFNLE9BQU8sS0FBSyxnQkFBZ0I7QUFDbEMsYUFBSyxRQUFRLGVBQWUsR0FBRztBQUMvQixlQUFPO0FBQUEsTUFDVDtBQUNBLFVBQUksS0FBSyxNQUFNLGVBQWUsR0FBRyxHQUFHO0FBQ2xDLGVBQU8sS0FBSyxrQkFBa0I7QUFBQSxNQUNoQztBQUNBLFVBQUksS0FBSyxNQUFNLGVBQWUsR0FBRyxHQUFHO0FBQ2xDLGVBQU8sS0FBSyxtQkFBbUI7QUFBQSxNQUNqQztBQUNBLFlBQU0sSUFBSSxNQUFNLHFCQUFxQixLQUFLLFFBQVEsRUFBRSxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUUsS0FBSyxHQUFHO0FBQUEsSUFDdEY7QUFBQSxJQUNBLG9CQUFvQjtBQUNsQixZQUFNLFdBQVcsQ0FBQztBQUNsQixhQUFPLENBQUMsS0FBSyxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsS0FBSyxRQUFRLEdBQUc7QUFDekQsaUJBQVMsS0FBSyxLQUFLLGdCQUFnQixDQUFDO0FBQ3BDLFlBQUksS0FBSyxNQUFNLGVBQWUsR0FBRyxHQUFHO0FBQ2xDLGNBQUksS0FBSyxNQUFNLGVBQWUsR0FBRyxHQUFHO0FBQ2xDO0FBQUEsVUFDRjtBQUFBLFFBQ0YsT0FBTztBQUNMO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFDQSxXQUFLLFFBQVEsZUFBZSxHQUFHO0FBQy9CLGFBQU87QUFBQSxRQUNMLE1BQU07QUFBQSxRQUNOO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHFCQUFxQjtBQUNuQixZQUFNLGFBQWEsQ0FBQztBQUNwQixhQUFPLENBQUMsS0FBSyxNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsS0FBSyxRQUFRLEdBQUc7QUFDekQsWUFBSTtBQUNKLFlBQUksV0FBVztBQUNmLFlBQUksS0FBSyxNQUFNLFFBQVEsR0FBRztBQUN4QixnQkFBTSxFQUFFLE1BQU0sV0FBVyxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU07QUFBQSxRQUN4RCxXQUFXLEtBQUssTUFBTSxZQUFZLEdBQUc7QUFDbkMsZ0JBQU0sT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUM3QixnQkFBTSxFQUFFLE1BQU0sY0FBYyxLQUFLO0FBQUEsUUFDbkMsV0FBVyxLQUFLLE1BQU0sZUFBZSxHQUFHLEdBQUc7QUFDekMsZ0JBQU0sS0FBSyxnQkFBZ0I7QUFDM0IscUJBQVc7QUFDWCxlQUFLLFFBQVEsZUFBZSxHQUFHO0FBQUEsUUFDakMsT0FBTztBQUNMLGdCQUFNLElBQUksTUFBTSx1QkFBdUI7QUFBQSxRQUN6QztBQUNBLGFBQUssUUFBUSxlQUFlLEdBQUc7QUFDL0IsY0FBTSxRQUFRLEtBQUssZ0JBQWdCO0FBQ25DLG1CQUFXLEtBQUs7QUFBQSxVQUNkLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLFdBQVc7QUFBQSxRQUNiLENBQUM7QUFDRCxZQUFJLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUNsQyxjQUFJLEtBQUssTUFBTSxlQUFlLEdBQUcsR0FBRztBQUNsQztBQUFBLFVBQ0Y7QUFBQSxRQUNGLE9BQU87QUFDTDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQ0EsV0FBSyxRQUFRLGVBQWUsR0FBRztBQUMvQixhQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLE1BQU07QUFDYixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGNBQU0sTUFBTSxLQUFLLENBQUM7QUFDbEIsWUFBSSxNQUFNLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFDOUIsZ0JBQU0sT0FBTztBQUNiLG1CQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGdCQUFJLEtBQUssTUFBTSxNQUFNLEtBQUssQ0FBQyxDQUFDLEdBQUc7QUFDN0IsbUJBQUssUUFBUTtBQUNiLHFCQUFPO0FBQUEsWUFDVDtBQUFBLFVBQ0Y7QUFDQSxpQkFBTztBQUFBLFFBQ1QsV0FBVyxLQUFLLFdBQVcsR0FBRztBQUM1QixjQUFJLEtBQUssVUFBVSxHQUFHLEdBQUc7QUFDdkIsaUJBQUssUUFBUTtBQUNiLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsTUFBTSxNQUFNLE9BQU87QUFDakIsVUFBSSxLQUFLLFFBQVE7QUFDZixlQUFPO0FBQ1QsVUFBSSxVQUFVLFFBQVE7QUFDcEIsZUFBTyxLQUFLLFFBQVEsRUFBRSxTQUFTLFFBQVEsS0FBSyxRQUFRLEVBQUUsVUFBVTtBQUFBLE1BQ2xFO0FBQ0EsYUFBTyxLQUFLLFFBQVEsRUFBRSxTQUFTO0FBQUEsSUFDakM7QUFBQSxJQUNBLFVBQVUsTUFBTTtBQUNkLFVBQUksS0FBSyxRQUFRO0FBQ2YsZUFBTztBQUNULGFBQU8sS0FBSyxRQUFRLEVBQUUsU0FBUztBQUFBLElBQ2pDO0FBQUEsSUFDQSxVQUFVO0FBQ1IsVUFBSSxDQUFDLEtBQUssUUFBUTtBQUNoQixhQUFLO0FBQ1AsYUFBTyxLQUFLLFNBQVM7QUFBQSxJQUN2QjtBQUFBLElBQ0EsVUFBVTtBQUNSLGFBQU8sS0FBSyxRQUFRLEVBQUUsU0FBUztBQUFBLElBQ2pDO0FBQUEsSUFDQSxVQUFVO0FBQ1IsYUFBTyxLQUFLLE9BQU8sS0FBSyxRQUFRO0FBQUEsSUFDbEM7QUFBQSxJQUNBLFdBQVc7QUFDVCxhQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsQ0FBQztBQUFBLElBQ3RDO0FBQUEsSUFDQSxRQUFRLE1BQU0sT0FBTztBQUNuQixVQUFJLFVBQVUsUUFBUTtBQUNwQixZQUFJLEtBQUssTUFBTSxNQUFNLEtBQUs7QUFDeEIsaUJBQU8sS0FBSyxRQUFRO0FBQ3RCLGNBQU0sSUFBSSxNQUFNLFlBQVksSUFBSSxLQUFLLEtBQUssYUFBYSxLQUFLLFFBQVEsRUFBRSxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUUsS0FBSyxHQUFHO0FBQUEsTUFDeEc7QUFDQSxVQUFJLEtBQUssTUFBTSxJQUFJO0FBQ2pCLGVBQU8sS0FBSyxRQUFRO0FBQ3RCLFlBQU0sSUFBSSxNQUFNLFlBQVksSUFBSSxZQUFZLEtBQUssUUFBUSxFQUFFLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxLQUFLLEdBQUc7QUFBQSxJQUM3RjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLFlBQVksTUFBTTtBQUFBLElBQ3BCLFNBQVMsRUFBRSxNQUFNLE9BQU8sU0FBUyxDQUFDLEdBQUcsVUFBVSxNQUFNLGNBQWMsT0FBTyxtQ0FBbUMsS0FBSyxHQUFHO0FBQ25ILGNBQVEsS0FBSyxNQUFNO0FBQUEsUUFDakIsS0FBSztBQUNILGlCQUFPLEtBQUs7QUFBQSxRQUNkLEtBQUs7QUFDSCxjQUFJLEtBQUssUUFBUSxRQUFRO0FBQ3ZCLGtCQUFNLFNBQVMsT0FBTyxLQUFLLElBQUk7QUFDL0IsZ0JBQUksT0FBTyxXQUFXLFlBQVk7QUFDaEMscUJBQU8sT0FBTyxLQUFLLE1BQU07QUFBQSxZQUMzQjtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksZUFBZSxPQUFPLFdBQVcsS0FBSyxJQUFJLE1BQU0sYUFBYTtBQUMvRCxrQkFBTSxTQUFTLFdBQVcsS0FBSyxJQUFJO0FBQ25DLGdCQUFJLE9BQU8sV0FBVyxZQUFZO0FBQ2hDLHFCQUFPLE9BQU8sS0FBSyxVQUFVO0FBQUEsWUFDL0I7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxnQkFBTSxJQUFJLE1BQU0sdUJBQXVCLEtBQUssSUFBSSxFQUFFO0FBQUEsUUFDcEQsS0FBSztBQUNILGdCQUFNLFNBQVMsS0FBSyxTQUFTLEVBQUUsTUFBTSxLQUFLLFFBQVEsT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQztBQUN6SCxjQUFJLFVBQVUsTUFBTTtBQUNsQixrQkFBTSxJQUFJLE1BQU0sMkNBQTJDO0FBQUEsVUFDN0Q7QUFDQSxjQUFJO0FBQ0osY0FBSSxLQUFLLFVBQVU7QUFDakIsa0JBQU0sV0FBVyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssVUFBVSxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQzdILDBCQUFjLE9BQU8sUUFBUTtBQUFBLFVBQy9CLE9BQU87QUFDTCwwQkFBYyxPQUFPLEtBQUssU0FBUyxJQUFJO0FBQUEsVUFDekM7QUFDQSxjQUFJLE9BQU8sZ0JBQWdCLFlBQVk7QUFDckMsZ0JBQUksa0NBQWtDO0FBQ3BDLHFCQUFPLFlBQVksS0FBSyxNQUFNO0FBQUEsWUFDaEMsT0FBTztBQUNMLHFCQUFPLFlBQVksS0FBSyxNQUFNO0FBQUEsWUFDaEM7QUFBQSxVQUNGO0FBQ0EsaUJBQU87QUFBQSxRQUNULEtBQUs7QUFDSCxnQkFBTSxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQyxDQUFDO0FBQzVJLGNBQUksS0FBSyxPQUFPLFNBQVMsb0JBQW9CO0FBQzNDLGtCQUFNLE1BQU0sS0FBSyxTQUFTLEVBQUUsTUFBTSxLQUFLLE9BQU8sUUFBUSxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQzdILGdCQUFJO0FBQ0osZ0JBQUksS0FBSyxPQUFPLFVBQVU7QUFDeEIsb0JBQU0sT0FBTyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxVQUFVLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFDaEkscUJBQU8sSUFBSSxJQUFJO0FBQUEsWUFDakIsT0FBTztBQUNMLHFCQUFPLElBQUksS0FBSyxPQUFPLFNBQVMsSUFBSTtBQUFBLFlBQ3RDO0FBQ0EsZ0JBQUksT0FBTyxTQUFTLFlBQVk7QUFDOUIsb0JBQU0sSUFBSSxNQUFNLHlCQUF5QjtBQUFBLFlBQzNDO0FBQ0EsbUJBQU8sS0FBSyxNQUFNLEtBQUssSUFBSTtBQUFBLFVBQzdCLE9BQU87QUFDTCxnQkFBSSxLQUFLLE9BQU8sU0FBUyxjQUFjO0FBQ3JDLG9CQUFNLE9BQU8sS0FBSyxPQUFPO0FBQ3pCLGtCQUFJO0FBQ0osa0JBQUksUUFBUSxRQUFRO0FBQ2xCLHVCQUFPLE9BQU8sSUFBSTtBQUFBLGNBQ3BCLFdBQVcsZUFBZSxPQUFPLFdBQVcsSUFBSSxNQUFNLGFBQWE7QUFDakUsdUJBQU8sV0FBVyxJQUFJO0FBQUEsY0FDeEIsT0FBTztBQUNMLHNCQUFNLElBQUksTUFBTSx1QkFBdUIsSUFBSSxFQUFFO0FBQUEsY0FDL0M7QUFDQSxrQkFBSSxPQUFPLFNBQVMsWUFBWTtBQUM5QixzQkFBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsY0FDM0M7QUFDQSxvQkFBTSxjQUFjLFlBQVksT0FBTyxVQUFVO0FBQ2pELHFCQUFPLEtBQUssTUFBTSxhQUFhLElBQUk7QUFBQSxZQUNyQyxPQUFPO0FBQ0wsb0JBQU0sU0FBUyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssUUFBUSxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQ3pILGtCQUFJLE9BQU8sV0FBVyxZQUFZO0FBQ2hDLHNCQUFNLElBQUksTUFBTSx5QkFBeUI7QUFBQSxjQUMzQztBQUNBLHFCQUFPLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFBQSxZQUNuQztBQUFBLFVBQ0Y7QUFBQSxRQUNGLEtBQUs7QUFDSCxnQkFBTSxXQUFXLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxVQUFVLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFDN0gsa0JBQVEsS0FBSyxVQUFVO0FBQUEsWUFDckIsS0FBSztBQUNILHFCQUFPLENBQUM7QUFBQSxZQUNWLEtBQUs7QUFDSCxxQkFBTyxDQUFDO0FBQUEsWUFDVixLQUFLO0FBQ0gscUJBQU8sQ0FBQztBQUFBLFlBQ1Y7QUFDRSxvQkFBTSxJQUFJLE1BQU0sMkJBQTJCLEtBQUssUUFBUSxFQUFFO0FBQUEsVUFDOUQ7QUFBQSxRQUNGLEtBQUs7QUFDSCxjQUFJLEtBQUssU0FBUyxTQUFTLGNBQWM7QUFDdkMsa0JBQU0sT0FBTyxLQUFLLFNBQVM7QUFDM0IsZ0JBQUksRUFBRSxRQUFRLFNBQVM7QUFDckIsb0JBQU0sSUFBSSxNQUFNLHVCQUF1QixJQUFJLEVBQUU7QUFBQSxZQUMvQztBQUNBLGtCQUFNLFdBQVcsT0FBTyxJQUFJO0FBQzVCLGdCQUFJLEtBQUssYUFBYSxNQUFNO0FBQzFCLHFCQUFPLElBQUksSUFBSSxXQUFXO0FBQUEsWUFDNUIsV0FBVyxLQUFLLGFBQWEsTUFBTTtBQUNqQyxxQkFBTyxJQUFJLElBQUksV0FBVztBQUFBLFlBQzVCO0FBQ0EsbUJBQU8sS0FBSyxTQUFTLE9BQU8sSUFBSSxJQUFJO0FBQUEsVUFDdEMsV0FBVyxLQUFLLFNBQVMsU0FBUyxvQkFBb0I7QUFDcEQsa0JBQU0sTUFBTSxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssU0FBUyxRQUFRLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFDL0gsa0JBQU0sT0FBTyxLQUFLLFNBQVMsV0FBVyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssU0FBUyxVQUFVLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUMsSUFBSSxLQUFLLFNBQVMsU0FBUztBQUN0TCxrQkFBTSxXQUFXLElBQUksSUFBSTtBQUN6QixnQkFBSSxLQUFLLGFBQWEsTUFBTTtBQUMxQixrQkFBSSxJQUFJLElBQUksV0FBVztBQUFBLFlBQ3pCLFdBQVcsS0FBSyxhQUFhLE1BQU07QUFDakMsa0JBQUksSUFBSSxJQUFJLFdBQVc7QUFBQSxZQUN6QjtBQUNBLG1CQUFPLEtBQUssU0FBUyxJQUFJLElBQUksSUFBSTtBQUFBLFVBQ25DO0FBQ0EsZ0JBQU0sSUFBSSxNQUFNLGtDQUFrQztBQUFBLFFBQ3BELEtBQUs7QUFDSCxnQkFBTSxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxNQUFNLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFDckgsZ0JBQU0sUUFBUSxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQ3ZILGtCQUFRLEtBQUssVUFBVTtBQUFBLFlBQ3JCLEtBQUs7QUFDSCxxQkFBTyxPQUFPO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLE9BQU87QUFBQSxZQUNoQixLQUFLO0FBQ0gscUJBQU8sT0FBTztBQUFBLFlBQ2hCLEtBQUs7QUFDSCxxQkFBTyxPQUFPO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLE9BQU87QUFBQSxZQUNoQixLQUFLO0FBQ0gscUJBQU8sUUFBUTtBQUFBLFlBQ2pCLEtBQUs7QUFDSCxxQkFBTyxRQUFRO0FBQUEsWUFDakIsS0FBSztBQUNILHFCQUFPLFNBQVM7QUFBQSxZQUNsQixLQUFLO0FBQ0gscUJBQU8sU0FBUztBQUFBLFlBQ2xCLEtBQUs7QUFDSCxxQkFBTyxPQUFPO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLE9BQU87QUFBQSxZQUNoQixLQUFLO0FBQ0gscUJBQU8sUUFBUTtBQUFBLFlBQ2pCLEtBQUs7QUFDSCxxQkFBTyxRQUFRO0FBQUEsWUFDakIsS0FBSztBQUNILHFCQUFPLFFBQVE7QUFBQSxZQUNqQixLQUFLO0FBQ0gscUJBQU8sUUFBUTtBQUFBLFlBQ2pCO0FBQ0Usb0JBQU0sSUFBSSxNQUFNLDRCQUE0QixLQUFLLFFBQVEsRUFBRTtBQUFBLFVBQy9EO0FBQUEsUUFDRixLQUFLO0FBQ0gsZ0JBQU0sT0FBTyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssTUFBTSxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQ3JILGlCQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUUsTUFBTSxLQUFLLFlBQVksT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxXQUFXLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFBQSxRQUMvTyxLQUFLO0FBQ0gsZ0JBQU0sUUFBUSxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQ3ZILGNBQUksS0FBSyxLQUFLLFNBQVMsY0FBYztBQUNuQyxtQkFBTyxLQUFLLEtBQUssSUFBSSxJQUFJO0FBQ3pCLG1CQUFPO0FBQUEsVUFDVCxXQUFXLEtBQUssS0FBSyxTQUFTLG9CQUFvQjtBQUNoRCxrQkFBTSxNQUFNLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxLQUFLLFFBQVEsT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQztBQUMzSCxnQkFBSSxLQUFLLEtBQUssVUFBVTtBQUN0QixvQkFBTSxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxLQUFLLFVBQVUsT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQztBQUM5SCxrQkFBSSxJQUFJLElBQUk7QUFBQSxZQUNkLE9BQU87QUFDTCxrQkFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUk7QUFBQSxZQUNqQztBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGdCQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxRQUM3QyxLQUFLO0FBQ0gsaUJBQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU0sSUFBSSxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDLENBQUM7QUFBQSxRQUNySSxLQUFLO0FBQ0gsZ0JBQU0sU0FBUyxDQUFDO0FBQ2hCLHFCQUFXLFFBQVEsS0FBSyxZQUFZO0FBQ2xDLGtCQUFNLE1BQU0sS0FBSyxXQUFXLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxLQUFLLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUMsSUFBSSxLQUFLLElBQUksU0FBUyxlQUFlLEtBQUssSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFLE1BQU0sS0FBSyxLQUFLLE9BQU8sUUFBUSxTQUFTLGFBQWEsaUNBQWlDLENBQUM7QUFDL1Isa0JBQU0sU0FBUyxLQUFLLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxPQUFPLFFBQVEsU0FBUyxhQUFhLGlDQUFpQyxDQUFDO0FBQ3hILG1CQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ2hCO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQ0UsZ0JBQU0sSUFBSSxNQUFNLHNCQUFzQixLQUFLLElBQUksRUFBRTtBQUFBLE1BQ3JEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLHdCQUF3QixZQUFZO0FBQzNDLFFBQUk7QUFDRixZQUFNLFlBQVksSUFBSSxVQUFVLFVBQVU7QUFDMUMsWUFBTSxTQUFTLFVBQVUsU0FBUztBQUNsQyxZQUFNLFNBQVMsSUFBSSxPQUFPLE1BQU07QUFDaEMsWUFBTSxNQUFNLE9BQU8sTUFBTTtBQUN6QixZQUFNLFlBQVksSUFBSSxVQUFVO0FBQ2hDLGFBQU8sU0FBUyxVQUFVLENBQUMsR0FBRztBQUM1QixjQUFNLEVBQUUsT0FBTyxTQUFTLENBQUMsR0FBRyxVQUFVLE1BQU0sY0FBYyxPQUFPLG1DQUFtQyxNQUFNLElBQUk7QUFDOUcsZUFBTyxVQUFVLFNBQVMsRUFBRSxNQUFNLEtBQUssT0FBTyxRQUFRLFNBQVMsYUFBYSxpQ0FBaUMsQ0FBQztBQUFBLE1BQ2hIO0FBQUEsSUFDRixTQUFTLFFBQVE7QUFDZixZQUFNLElBQUksTUFBTSxxQkFBcUIsT0FBTyxPQUFPLEVBQUU7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFHQSxXQUFTLGFBQWEsSUFBSSxZQUFZO0FBQ3BDLFFBQUksWUFBWSxrQkFBa0IsRUFBRTtBQUNwQyxRQUFJLE9BQU8sZUFBZSxZQUFZO0FBQ3BDLGFBQU8sOEJBQThCLFdBQVcsVUFBVTtBQUFBLElBQzVEO0FBQ0EsUUFBSSxZQUFZLGtCQUFrQixJQUFJLFlBQVksU0FBUztBQUMzRCxXQUFPLFNBQVMsS0FBSyxNQUFNLElBQUksWUFBWSxTQUFTO0FBQUEsRUFDdEQ7QUFDQSxXQUFTLGtCQUFrQixJQUFJO0FBQzdCLFFBQUksbUJBQW1CLENBQUM7QUFDeEIsaUJBQWEsa0JBQWtCLEVBQUU7QUFDakMsV0FBTyxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixFQUFFLENBQUM7QUFBQSxFQUNuRDtBQUNBLFdBQVMsa0JBQWtCLElBQUksWUFBWSxXQUFXO0FBQ3BELFdBQU8sQ0FBQyxXQUFXLE1BQU07QUFBQSxJQUN6QixHQUFHLEVBQUUsT0FBTyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTTtBQUM5QyxVQUFJLGdCQUFnQixhQUFhLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztBQUN2RCxVQUFJLFlBQVksd0JBQXdCLFVBQVU7QUFDbEQsVUFBSSxjQUFjLFVBQVU7QUFBQSxRQUMxQixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixrQ0FBa0M7QUFBQSxNQUNwQyxDQUFDO0FBQ0QsVUFBSSwrQkFBK0IsT0FBTyxnQkFBZ0IsWUFBWTtBQUNwRSxZQUFJLGtCQUFrQixZQUFZLE1BQU0sYUFBYSxNQUFNO0FBQzNELFlBQUksMkJBQTJCLFNBQVM7QUFDdEMsMEJBQWdCLEtBQUssQ0FBQyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsUUFDekMsT0FBTztBQUNMLG1CQUFTLGVBQWU7QUFBQSxRQUMxQjtBQUFBLE1BQ0YsV0FBVyxPQUFPLGdCQUFnQixZQUFZLHVCQUF1QixTQUFTO0FBQzVFLG9CQUFZLEtBQUssQ0FBQyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsTUFDckMsT0FBTztBQUNMLGlCQUFTLFdBQVc7QUFBQSxNQUN0QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsV0FBUyxRQUFRLEtBQUssa0JBQWtCO0FBQ3RDLFVBQU0sTUFBc0IsdUJBQU8sT0FBTyxJQUFJO0FBQzlDLFVBQU0sT0FBTyxJQUFJLE1BQU0sR0FBRztBQUMxQixhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLFVBQUksS0FBSyxDQUFDLENBQUMsSUFBSTtBQUFBLElBQ2pCO0FBQ0EsV0FBTyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEdBQUc7QUFBQSxFQUNsRjtBQUNBLE1BQUksc0JBQXNCO0FBQzFCLE1BQUksaUJBQWlDLHdCQUFRLHNCQUFzQiw4SUFBOEk7QUFDak4sTUFBSSxZQUFZLE9BQU8sT0FBTyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDNUMsTUFBSSxZQUFZLE9BQU8sT0FBTyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDNUMsTUFBSSxpQkFBaUIsT0FBTyxVQUFVO0FBQ3RDLE1BQUksU0FBUyxDQUFDLEtBQUssUUFBUSxlQUFlLEtBQUssS0FBSyxHQUFHO0FBQ3ZELE1BQUksVUFBVSxNQUFNO0FBQ3BCLE1BQUksUUFBUSxDQUFDLFFBQVEsYUFBYSxHQUFHLE1BQU07QUFDM0MsTUFBSSxXQUFXLENBQUMsUUFBUSxPQUFPLFFBQVE7QUFDdkMsTUFBSSxXQUFXLENBQUMsUUFBUSxPQUFPLFFBQVE7QUFDdkMsTUFBSSxXQUFXLENBQUMsUUFBUSxRQUFRLFFBQVEsT0FBTyxRQUFRO0FBQ3ZELE1BQUksaUJBQWlCLE9BQU8sVUFBVTtBQUN0QyxNQUFJLGVBQWUsQ0FBQyxVQUFVLGVBQWUsS0FBSyxLQUFLO0FBQ3ZELE1BQUksWUFBWSxDQUFDLFVBQVU7QUFDekIsV0FBTyxhQUFhLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUFBLEVBQ3hDO0FBQ0EsTUFBSSxlQUFlLENBQUMsUUFBUSxTQUFTLEdBQUcsS0FBSyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sT0FBTyxLQUFLLFNBQVMsS0FBSyxFQUFFLE1BQU07QUFDM0csTUFBSSxzQkFBc0IsQ0FBQyxPQUFPO0FBQ2hDLFVBQU0sUUFBd0IsdUJBQU8sT0FBTyxJQUFJO0FBQ2hELFdBQU8sQ0FBQyxRQUFRO0FBQ2QsWUFBTSxNQUFNLE1BQU0sR0FBRztBQUNyQixhQUFPLFFBQVEsTUFBTSxHQUFHLElBQUksR0FBRyxHQUFHO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQ0EsTUFBSSxhQUFhO0FBQ2pCLE1BQUksV0FBVyxvQkFBb0IsQ0FBQyxRQUFRO0FBQzFDLFdBQU8sSUFBSSxRQUFRLFlBQVksQ0FBQyxHQUFHLE1BQU0sSUFBSSxFQUFFLFlBQVksSUFBSSxFQUFFO0FBQUEsRUFDbkUsQ0FBQztBQUNELE1BQUksY0FBYztBQUNsQixNQUFJLFlBQVksb0JBQW9CLENBQUMsUUFBUSxJQUFJLFFBQVEsYUFBYSxLQUFLLEVBQUUsWUFBWSxDQUFDO0FBQzFGLE1BQUksYUFBYSxvQkFBb0IsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUM7QUFDeEYsTUFBSSxlQUFlLG9CQUFvQixDQUFDLFFBQVEsTUFBTSxLQUFLLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNqRixNQUFJLGFBQWEsQ0FBQyxPQUFPLGFBQWEsVUFBVSxhQUFhLFVBQVUsU0FBUyxhQUFhO0FBRzdGLE1BQUksWUFBNEIsb0JBQUksUUFBUTtBQUM1QyxNQUFJLGNBQWMsQ0FBQztBQUNuQixNQUFJO0FBQ0osTUFBSSxjQUFjLE9BQU8sT0FBTyxZQUFZLEVBQUU7QUFDOUMsTUFBSSxzQkFBc0IsT0FBTyxPQUFPLG9CQUFvQixFQUFFO0FBQzlELFdBQVMsU0FBUyxJQUFJO0FBQ3BCLFdBQU8sTUFBTSxHQUFHLGNBQWM7QUFBQSxFQUNoQztBQUNBLFdBQVMsUUFBUSxJQUFJLFVBQVUsV0FBVztBQUN4QyxRQUFJLFNBQVMsRUFBRSxHQUFHO0FBQ2hCLFdBQUssR0FBRztBQUFBLElBQ1Y7QUFDQSxVQUFNLFVBQVUscUJBQXFCLElBQUksT0FBTztBQUNoRCxRQUFJLENBQUMsUUFBUSxNQUFNO0FBQ2pCLGNBQVE7QUFBQSxJQUNWO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLEtBQUssU0FBUztBQUNyQixRQUFJLFFBQVEsUUFBUTtBQUNsQixjQUFRLE9BQU87QUFDZixVQUFJLFFBQVEsUUFBUSxRQUFRO0FBQzFCLGdCQUFRLFFBQVEsT0FBTztBQUFBLE1BQ3pCO0FBQ0EsY0FBUSxTQUFTO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQ0EsTUFBSSxNQUFNO0FBQ1YsV0FBUyxxQkFBcUIsSUFBSSxTQUFTO0FBQ3pDLFVBQU0sVUFBVSxTQUFTLGlCQUFpQjtBQUN4QyxVQUFJLENBQUMsUUFBUSxRQUFRO0FBQ25CLGVBQU8sR0FBRztBQUFBLE1BQ1o7QUFDQSxVQUFJLENBQUMsWUFBWSxTQUFTLE9BQU8sR0FBRztBQUNsQyxnQkFBUSxPQUFPO0FBQ2YsWUFBSTtBQUNGLHlCQUFlO0FBQ2Ysc0JBQVksS0FBSyxPQUFPO0FBQ3hCLHlCQUFlO0FBQ2YsaUJBQU8sR0FBRztBQUFBLFFBQ1osVUFBRTtBQUNBLHNCQUFZLElBQUk7QUFDaEIsd0JBQWM7QUFDZCx5QkFBZSxZQUFZLFlBQVksU0FBUyxDQUFDO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLFlBQVEsS0FBSztBQUNiLFlBQVEsZUFBZSxDQUFDLENBQUMsUUFBUTtBQUNqQyxZQUFRLFlBQVk7QUFDcEIsWUFBUSxTQUFTO0FBQ2pCLFlBQVEsTUFBTTtBQUNkLFlBQVEsT0FBTyxDQUFDO0FBQ2hCLFlBQVEsVUFBVTtBQUNsQixXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsUUFBUSxTQUFTO0FBQ3hCLFVBQU0sRUFBRSxLQUFLLElBQUk7QUFDakIsUUFBSSxLQUFLLFFBQVE7QUFDZixlQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLGFBQUssQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLE1BQ3hCO0FBQ0EsV0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQ0EsTUFBSSxjQUFjO0FBQ2xCLE1BQUksYUFBYSxDQUFDO0FBQ2xCLFdBQVMsZ0JBQWdCO0FBQ3ZCLGVBQVcsS0FBSyxXQUFXO0FBQzNCLGtCQUFjO0FBQUEsRUFDaEI7QUFDQSxXQUFTLGlCQUFpQjtBQUN4QixlQUFXLEtBQUssV0FBVztBQUMzQixrQkFBYztBQUFBLEVBQ2hCO0FBQ0EsV0FBUyxnQkFBZ0I7QUFDdkIsVUFBTSxPQUFPLFdBQVcsSUFBSTtBQUM1QixrQkFBYyxTQUFTLFNBQVMsT0FBTztBQUFBLEVBQ3pDO0FBQ0EsV0FBUyxNQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ2hDLFFBQUksQ0FBQyxlQUFlLGlCQUFpQixRQUFRO0FBQzNDO0FBQUEsSUFDRjtBQUNBLFFBQUksVUFBVSxVQUFVLElBQUksTUFBTTtBQUNsQyxRQUFJLENBQUMsU0FBUztBQUNaLGdCQUFVLElBQUksUUFBUSxVQUEwQixvQkFBSSxJQUFJLENBQUM7QUFBQSxJQUMzRDtBQUNBLFFBQUksTUFBTSxRQUFRLElBQUksR0FBRztBQUN6QixRQUFJLENBQUMsS0FBSztBQUNSLGNBQVEsSUFBSSxLQUFLLE1BQXNCLG9CQUFJLElBQUksQ0FBQztBQUFBLElBQ2xEO0FBQ0EsUUFBSSxDQUFDLElBQUksSUFBSSxZQUFZLEdBQUc7QUFDMUIsVUFBSSxJQUFJLFlBQVk7QUFDcEIsbUJBQWEsS0FBSyxLQUFLLEdBQUc7QUFDMUIsVUFBSSxhQUFhLFFBQVEsU0FBUztBQUNoQyxxQkFBYSxRQUFRLFFBQVE7QUFBQSxVQUMzQixRQUFRO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsV0FBUyxRQUFRLFFBQVEsTUFBTSxLQUFLLFVBQVUsVUFBVSxXQUFXO0FBQ2pFLFVBQU0sVUFBVSxVQUFVLElBQUksTUFBTTtBQUNwQyxRQUFJLENBQUMsU0FBUztBQUNaO0FBQUEsSUFDRjtBQUNBLFVBQU0sVUFBMEIsb0JBQUksSUFBSTtBQUN4QyxVQUFNLE9BQU8sQ0FBQyxpQkFBaUI7QUFDN0IsVUFBSSxjQUFjO0FBQ2hCLHFCQUFhLFFBQVEsQ0FBQyxZQUFZO0FBQ2hDLGNBQUksWUFBWSxnQkFBZ0IsUUFBUSxjQUFjO0FBQ3BELG9CQUFRLElBQUksT0FBTztBQUFBLFVBQ3JCO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFDQSxRQUFJLFNBQVMsU0FBUztBQUNwQixjQUFRLFFBQVEsSUFBSTtBQUFBLElBQ3RCLFdBQVcsUUFBUSxZQUFZLFFBQVEsTUFBTSxHQUFHO0FBQzlDLGNBQVEsUUFBUSxDQUFDLEtBQUssU0FBUztBQUM3QixZQUFJLFNBQVMsWUFBWSxRQUFRLFVBQVU7QUFDekMsZUFBSyxHQUFHO0FBQUEsUUFDVjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsT0FBTztBQUNMLFVBQUksUUFBUSxRQUFRO0FBQ2xCLGFBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQztBQUFBLE1BQ3ZCO0FBQ0EsY0FBUSxNQUFNO0FBQUEsUUFDWixLQUFLO0FBQ0gsY0FBSSxDQUFDLFFBQVEsTUFBTSxHQUFHO0FBQ3BCLGlCQUFLLFFBQVEsSUFBSSxXQUFXLENBQUM7QUFDN0IsZ0JBQUksTUFBTSxNQUFNLEdBQUc7QUFDakIsbUJBQUssUUFBUSxJQUFJLG1CQUFtQixDQUFDO0FBQUEsWUFDdkM7QUFBQSxVQUNGLFdBQVcsYUFBYSxHQUFHLEdBQUc7QUFDNUIsaUJBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQztBQUFBLFVBQzVCO0FBQ0E7QUFBQSxRQUNGLEtBQUs7QUFDSCxjQUFJLENBQUMsUUFBUSxNQUFNLEdBQUc7QUFDcEIsaUJBQUssUUFBUSxJQUFJLFdBQVcsQ0FBQztBQUM3QixnQkFBSSxNQUFNLE1BQU0sR0FBRztBQUNqQixtQkFBSyxRQUFRLElBQUksbUJBQW1CLENBQUM7QUFBQSxZQUN2QztBQUFBLFVBQ0Y7QUFDQTtBQUFBLFFBQ0YsS0FBSztBQUNILGNBQUksTUFBTSxNQUFNLEdBQUc7QUFDakIsaUJBQUssUUFBUSxJQUFJLFdBQVcsQ0FBQztBQUFBLFVBQy9CO0FBQ0E7QUFBQSxNQUNKO0FBQUEsSUFDRjtBQUNBLFVBQU0sTUFBTSxDQUFDLFlBQVk7QUFDdkIsVUFBSSxRQUFRLFFBQVEsV0FBVztBQUM3QixnQkFBUSxRQUFRLFVBQVU7QUFBQSxVQUN4QixRQUFRO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUNBLFVBQUksUUFBUSxRQUFRLFdBQVc7QUFDN0IsZ0JBQVEsUUFBUSxVQUFVLE9BQU87QUFBQSxNQUNuQyxPQUFPO0FBQ0wsZ0JBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUNBLFlBQVEsUUFBUSxHQUFHO0FBQUEsRUFDckI7QUFDQSxNQUFJLHFCQUFxQyx3QkFBUSw2QkFBNkI7QUFDOUUsTUFBSSxpQkFBaUIsSUFBSSxJQUFJLE9BQU8sb0JBQW9CLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sUUFBUSxDQUFDO0FBQzFHLE1BQUksT0FBdUIsNkJBQWE7QUFDeEMsTUFBSSxjQUE4Qiw2QkFBYSxJQUFJO0FBQ25ELE1BQUksd0JBQXdDLDRDQUE0QjtBQUN4RSxXQUFTLDhCQUE4QjtBQUNyQyxVQUFNLG1CQUFtQixDQUFDO0FBQzFCLEtBQUMsWUFBWSxXQUFXLGFBQWEsRUFBRSxRQUFRLENBQUMsUUFBUTtBQUN0RCx1QkFBaUIsR0FBRyxJQUFJLFlBQVksTUFBTTtBQUN4QyxjQUFNLE1BQU0sTUFBTSxJQUFJO0FBQ3RCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSztBQUMzQyxnQkFBTSxLQUFLLE9BQU8sSUFBSSxFQUFFO0FBQUEsUUFDMUI7QUFDQSxjQUFNLE1BQU0sSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQzVCLFlBQUksUUFBUSxNQUFNLFFBQVEsT0FBTztBQUMvQixpQkFBTyxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssSUFBSSxLQUFLLENBQUM7QUFBQSxRQUNwQyxPQUFPO0FBQ0wsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUNELEtBQUMsUUFBUSxPQUFPLFNBQVMsV0FBVyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDN0QsdUJBQWlCLEdBQUcsSUFBSSxZQUFZLE1BQU07QUFDeEMsc0JBQWM7QUFDZCxjQUFNLE1BQU0sTUFBTSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sTUFBTSxJQUFJO0FBQzdDLHNCQUFjO0FBQ2QsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsYUFBYSxhQUFhLE9BQU8sVUFBVSxPQUFPO0FBQ3pELFdBQU8sU0FBUyxLQUFLLFFBQVEsS0FBSyxVQUFVO0FBQzFDLFVBQUksUUFBUSxrQkFBa0I7QUFDNUIsZUFBTyxDQUFDO0FBQUEsTUFDVixXQUFXLFFBQVEsa0JBQWtCO0FBQ25DLGVBQU87QUFBQSxNQUNULFdBQVcsUUFBUSxhQUFhLGNBQWMsYUFBYSxVQUFVLHFCQUFxQixjQUFjLFVBQVUscUJBQXFCLGFBQWEsSUFBSSxNQUFNLEdBQUc7QUFDL0osZUFBTztBQUFBLE1BQ1Q7QUFDQSxZQUFNLGdCQUFnQixRQUFRLE1BQU07QUFDcEMsVUFBSSxDQUFDLGNBQWMsaUJBQWlCLE9BQU8sdUJBQXVCLEdBQUcsR0FBRztBQUN0RSxlQUFPLFFBQVEsSUFBSSx1QkFBdUIsS0FBSyxRQUFRO0FBQUEsTUFDekQ7QUFDQSxZQUFNLE1BQU0sUUFBUSxJQUFJLFFBQVEsS0FBSyxRQUFRO0FBQzdDLFVBQUksU0FBUyxHQUFHLElBQUksZUFBZSxJQUFJLEdBQUcsSUFBSSxtQkFBbUIsR0FBRyxHQUFHO0FBQ3JFLGVBQU87QUFBQSxNQUNUO0FBQ0EsVUFBSSxDQUFDLFlBQVk7QUFDZixjQUFNLFFBQVEsT0FBTyxHQUFHO0FBQUEsTUFDMUI7QUFDQSxVQUFJLFNBQVM7QUFDWCxlQUFPO0FBQUEsTUFDVDtBQUNBLFVBQUksTUFBTSxHQUFHLEdBQUc7QUFDZCxjQUFNLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEdBQUc7QUFDeEQsZUFBTyxlQUFlLElBQUksUUFBUTtBQUFBLE1BQ3BDO0FBQ0EsVUFBSSxTQUFTLEdBQUcsR0FBRztBQUNqQixlQUFPLGFBQWEsU0FBUyxHQUFHLElBQUksVUFBVSxHQUFHO0FBQUEsTUFDbkQ7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFDQSxNQUFJLE9BQXVCLDZCQUFhO0FBQ3hDLFdBQVMsYUFBYSxVQUFVLE9BQU87QUFDckMsV0FBTyxTQUFTLEtBQUssUUFBUSxLQUFLLE9BQU8sVUFBVTtBQUNqRCxVQUFJLFdBQVcsT0FBTyxHQUFHO0FBQ3pCLFVBQUksQ0FBQyxTQUFTO0FBQ1osZ0JBQVEsTUFBTSxLQUFLO0FBQ25CLG1CQUFXLE1BQU0sUUFBUTtBQUN6QixZQUFJLENBQUMsUUFBUSxNQUFNLEtBQUssTUFBTSxRQUFRLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRztBQUN4RCxtQkFBUyxRQUFRO0FBQ2pCLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFDQSxZQUFNLFNBQVMsUUFBUSxNQUFNLEtBQUssYUFBYSxHQUFHLElBQUksT0FBTyxHQUFHLElBQUksT0FBTyxTQUFTLE9BQU8sUUFBUSxHQUFHO0FBQ3RHLFlBQU0sU0FBUyxRQUFRLElBQUksUUFBUSxLQUFLLE9BQU8sUUFBUTtBQUN2RCxVQUFJLFdBQVcsTUFBTSxRQUFRLEdBQUc7QUFDOUIsWUFBSSxDQUFDLFFBQVE7QUFDWCxrQkFBUSxRQUFRLE9BQU8sS0FBSyxLQUFLO0FBQUEsUUFDbkMsV0FBVyxXQUFXLE9BQU8sUUFBUSxHQUFHO0FBQ3RDLGtCQUFRLFFBQVEsT0FBTyxLQUFLLE9BQU8sUUFBUTtBQUFBLFFBQzdDO0FBQUEsTUFDRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNBLFdBQVMsZUFBZSxRQUFRLEtBQUs7QUFDbkMsVUFBTSxTQUFTLE9BQU8sUUFBUSxHQUFHO0FBQ2pDLFVBQU0sV0FBVyxPQUFPLEdBQUc7QUFDM0IsVUFBTSxTQUFTLFFBQVEsZUFBZSxRQUFRLEdBQUc7QUFDakQsUUFBSSxVQUFVLFFBQVE7QUFDcEIsY0FBUSxRQUFRLFVBQVUsS0FBSyxRQUFRLFFBQVE7QUFBQSxJQUNqRDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxJQUFJLFFBQVEsS0FBSztBQUN4QixVQUFNLFNBQVMsUUFBUSxJQUFJLFFBQVEsR0FBRztBQUN0QyxRQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxlQUFlLElBQUksR0FBRyxHQUFHO0FBQzlDLFlBQU0sUUFBUSxPQUFPLEdBQUc7QUFBQSxJQUMxQjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxRQUFRLFFBQVE7QUFDdkIsVUFBTSxRQUFRLFdBQVcsUUFBUSxNQUFNLElBQUksV0FBVyxXQUFXO0FBQ2pFLFdBQU8sUUFBUSxRQUFRLE1BQU07QUFBQSxFQUMvQjtBQUNBLE1BQUksa0JBQWtCO0FBQUEsSUFDcEIsS0FBSztBQUFBLElBQ0wsS0FBSztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDQSxNQUFJLG1CQUFtQjtBQUFBLElBQ3JCLEtBQUs7QUFBQSxJQUNMLElBQUksUUFBUSxLQUFLO0FBQ2YsVUFBSSxNQUFNO0FBQ1IsZ0JBQVEsS0FBSyx5QkFBeUIsT0FBTyxHQUFHLENBQUMsaUNBQWlDLE1BQU07QUFBQSxNQUMxRjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxlQUFlLFFBQVEsS0FBSztBQUMxQixVQUFJLE1BQU07QUFDUixnQkFBUSxLQUFLLDRCQUE0QixPQUFPLEdBQUcsQ0FBQyxpQ0FBaUMsTUFBTTtBQUFBLE1BQzdGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsTUFBSSxhQUFhLENBQUMsVUFBVSxTQUFTLEtBQUssSUFBSSxVQUFVLEtBQUssSUFBSTtBQUNqRSxNQUFJLGFBQWEsQ0FBQyxVQUFVLFNBQVMsS0FBSyxJQUFJLFNBQVMsS0FBSyxJQUFJO0FBQ2hFLE1BQUksWUFBWSxDQUFDLFVBQVU7QUFDM0IsTUFBSSxXQUFXLENBQUMsTUFBTSxRQUFRLGVBQWUsQ0FBQztBQUM5QyxXQUFTLE1BQU0sUUFBUSxLQUFLLGFBQWEsT0FBTyxZQUFZLE9BQU87QUFDakUsYUFBUztBQUFBLE1BQ1A7QUFBQTtBQUFBLElBRUY7QUFDQSxVQUFNLFlBQVksTUFBTSxNQUFNO0FBQzlCLFVBQU0sU0FBUyxNQUFNLEdBQUc7QUFDeEIsUUFBSSxRQUFRLFFBQVE7QUFDbEIsT0FBQyxjQUFjLE1BQU0sV0FBVyxPQUFPLEdBQUc7QUFBQSxJQUM1QztBQUNBLEtBQUMsY0FBYyxNQUFNLFdBQVcsT0FBTyxNQUFNO0FBQzdDLFVBQU0sRUFBRSxLQUFLLEtBQUssSUFBSSxTQUFTLFNBQVM7QUFDeEMsVUFBTSxPQUFPLFlBQVksWUFBWSxhQUFhLGFBQWE7QUFDL0QsUUFBSSxLQUFLLEtBQUssV0FBVyxHQUFHLEdBQUc7QUFDN0IsYUFBTyxLQUFLLE9BQU8sSUFBSSxHQUFHLENBQUM7QUFBQSxJQUM3QixXQUFXLEtBQUssS0FBSyxXQUFXLE1BQU0sR0FBRztBQUN2QyxhQUFPLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQztBQUFBLElBQ2hDLFdBQVcsV0FBVyxXQUFXO0FBQy9CLGFBQU8sSUFBSSxHQUFHO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQ0EsV0FBUyxNQUFNLEtBQUssYUFBYSxPQUFPO0FBQ3RDLFVBQU0sU0FBUztBQUFBLE1BQ2I7QUFBQTtBQUFBLElBRUY7QUFDQSxVQUFNLFlBQVksTUFBTSxNQUFNO0FBQzlCLFVBQU0sU0FBUyxNQUFNLEdBQUc7QUFDeEIsUUFBSSxRQUFRLFFBQVE7QUFDbEIsT0FBQyxjQUFjLE1BQU0sV0FBVyxPQUFPLEdBQUc7QUFBQSxJQUM1QztBQUNBLEtBQUMsY0FBYyxNQUFNLFdBQVcsT0FBTyxNQUFNO0FBQzdDLFdBQU8sUUFBUSxTQUFTLE9BQU8sSUFBSSxHQUFHLElBQUksT0FBTyxJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksTUFBTTtBQUFBLEVBQ2hGO0FBQ0EsV0FBUyxLQUFLLFFBQVEsYUFBYSxPQUFPO0FBQ3hDLGFBQVM7QUFBQSxNQUNQO0FBQUE7QUFBQSxJQUVGO0FBQ0EsS0FBQyxjQUFjLE1BQU0sTUFBTSxNQUFNLEdBQUcsV0FBVyxXQUFXO0FBQzFELFdBQU8sUUFBUSxJQUFJLFFBQVEsUUFBUSxNQUFNO0FBQUEsRUFDM0M7QUFDQSxXQUFTLElBQUksT0FBTztBQUNsQixZQUFRLE1BQU0sS0FBSztBQUNuQixVQUFNLFNBQVMsTUFBTSxJQUFJO0FBQ3pCLFVBQU0sUUFBUSxTQUFTLE1BQU07QUFDN0IsVUFBTSxTQUFTLE1BQU0sSUFBSSxLQUFLLFFBQVEsS0FBSztBQUMzQyxRQUFJLENBQUMsUUFBUTtBQUNYLGFBQU8sSUFBSSxLQUFLO0FBQ2hCLGNBQVEsUUFBUSxPQUFPLE9BQU8sS0FBSztBQUFBLElBQ3JDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLE1BQU0sS0FBSyxPQUFPO0FBQ3pCLFlBQVEsTUFBTSxLQUFLO0FBQ25CLFVBQU0sU0FBUyxNQUFNLElBQUk7QUFDekIsVUFBTSxFQUFFLEtBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxTQUFTLE1BQU07QUFDaEQsUUFBSSxTQUFTLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFDbEMsUUFBSSxDQUFDLFFBQVE7QUFDWCxZQUFNLE1BQU0sR0FBRztBQUNmLGVBQVMsS0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLElBQ2hDLFdBQVcsTUFBTTtBQUNmLHdCQUFrQixRQUFRLE1BQU0sR0FBRztBQUFBLElBQ3JDO0FBQ0EsVUFBTSxXQUFXLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFDdEMsV0FBTyxJQUFJLEtBQUssS0FBSztBQUNyQixRQUFJLENBQUMsUUFBUTtBQUNYLGNBQVEsUUFBUSxPQUFPLEtBQUssS0FBSztBQUFBLElBQ25DLFdBQVcsV0FBVyxPQUFPLFFBQVEsR0FBRztBQUN0QyxjQUFRLFFBQVEsT0FBTyxLQUFLLE9BQU8sUUFBUTtBQUFBLElBQzdDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLFlBQVksS0FBSztBQUN4QixVQUFNLFNBQVMsTUFBTSxJQUFJO0FBQ3pCLFVBQU0sRUFBRSxLQUFLLE1BQU0sS0FBSyxLQUFLLElBQUksU0FBUyxNQUFNO0FBQ2hELFFBQUksU0FBUyxLQUFLLEtBQUssUUFBUSxHQUFHO0FBQ2xDLFFBQUksQ0FBQyxRQUFRO0FBQ1gsWUFBTSxNQUFNLEdBQUc7QUFDZixlQUFTLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFBQSxJQUNoQyxXQUFXLE1BQU07QUFDZix3QkFBa0IsUUFBUSxNQUFNLEdBQUc7QUFBQSxJQUNyQztBQUNBLFVBQU0sV0FBVyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsSUFBSTtBQUNqRCxVQUFNLFNBQVMsT0FBTyxPQUFPLEdBQUc7QUFDaEMsUUFBSSxRQUFRO0FBQ1YsY0FBUSxRQUFRLFVBQVUsS0FBSyxRQUFRLFFBQVE7QUFBQSxJQUNqRDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxRQUFRO0FBQ2YsVUFBTSxTQUFTLE1BQU0sSUFBSTtBQUN6QixVQUFNLFdBQVcsT0FBTyxTQUFTO0FBQ2pDLFVBQU0sWUFBWSxPQUFPLE1BQU0sTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSTtBQUM3RSxVQUFNLFNBQVMsT0FBTyxNQUFNO0FBQzVCLFFBQUksVUFBVTtBQUNaLGNBQVEsUUFBUSxTQUFTLFFBQVEsUUFBUSxTQUFTO0FBQUEsSUFDcEQ7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsY0FBYyxZQUFZLFdBQVc7QUFDNUMsV0FBTyxTQUFTLFFBQVEsVUFBVSxTQUFTO0FBQ3pDLFlBQU0sV0FBVztBQUNqQixZQUFNLFNBQVM7QUFBQSxRQUNiO0FBQUE7QUFBQSxNQUVGO0FBQ0EsWUFBTSxZQUFZLE1BQU0sTUFBTTtBQUM5QixZQUFNLE9BQU8sWUFBWSxZQUFZLGFBQWEsYUFBYTtBQUMvRCxPQUFDLGNBQWMsTUFBTSxXQUFXLFdBQVcsV0FBVztBQUN0RCxhQUFPLE9BQU8sUUFBUSxDQUFDLE9BQU8sUUFBUTtBQUNwQyxlQUFPLFNBQVMsS0FBSyxTQUFTLEtBQUssS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLFFBQVE7QUFBQSxNQUNoRSxDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDQSxXQUFTLHFCQUFxQixRQUFRLFlBQVksV0FBVztBQUMzRCxXQUFPLFlBQVksTUFBTTtBQUN2QixZQUFNLFNBQVM7QUFBQSxRQUNiO0FBQUE7QUFBQSxNQUVGO0FBQ0EsWUFBTSxZQUFZLE1BQU0sTUFBTTtBQUM5QixZQUFNLGNBQWMsTUFBTSxTQUFTO0FBQ25DLFlBQU0sU0FBUyxXQUFXLGFBQWEsV0FBVyxPQUFPLFlBQVk7QUFDckUsWUFBTSxZQUFZLFdBQVcsVUFBVTtBQUN2QyxZQUFNLGdCQUFnQixPQUFPLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFDNUMsWUFBTSxPQUFPLFlBQVksWUFBWSxhQUFhLGFBQWE7QUFDL0QsT0FBQyxjQUFjLE1BQU0sV0FBVyxXQUFXLFlBQVksc0JBQXNCLFdBQVc7QUFDeEYsYUFBTztBQUFBO0FBQUEsUUFFTCxPQUFPO0FBQ0wsZ0JBQU0sRUFBRSxPQUFPLEtBQUssSUFBSSxjQUFjLEtBQUs7QUFDM0MsaUJBQU8sT0FBTyxFQUFFLE9BQU8sS0FBSyxJQUFJO0FBQUEsWUFDOUIsT0FBTyxTQUFTLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSztBQUFBLFlBQzdEO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQTtBQUFBLFFBRUEsQ0FBQyxPQUFPLFFBQVEsSUFBSTtBQUNsQixpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLHFCQUFxQixNQUFNO0FBQ2xDLFdBQU8sWUFBWSxNQUFNO0FBQ3ZCLFVBQUksTUFBTTtBQUNSLGNBQU0sTUFBTSxLQUFLLENBQUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxDQUFDLE9BQU87QUFDL0MsZ0JBQVEsS0FBSyxHQUFHLFdBQVcsSUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBK0IsTUFBTSxJQUFJLENBQUM7QUFBQSxNQUM3RjtBQUNBLGFBQU8sU0FBUyxXQUFXLFFBQVE7QUFBQSxJQUNyQztBQUFBLEVBQ0Y7QUFDQSxXQUFTLHlCQUF5QjtBQUNoQyxVQUFNLDJCQUEyQjtBQUFBLE1BQy9CLElBQUksS0FBSztBQUNQLGVBQU8sTUFBTSxNQUFNLEdBQUc7QUFBQSxNQUN4QjtBQUFBLE1BQ0EsSUFBSSxPQUFPO0FBQ1QsZUFBTyxLQUFLLElBQUk7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsS0FBSztBQUFBLE1BQ0w7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSO0FBQUEsTUFDQSxTQUFTLGNBQWMsT0FBTyxLQUFLO0FBQUEsSUFDckM7QUFDQSxVQUFNLDJCQUEyQjtBQUFBLE1BQy9CLElBQUksS0FBSztBQUNQLGVBQU8sTUFBTSxNQUFNLEtBQUssT0FBTyxJQUFJO0FBQUEsTUFDckM7QUFBQSxNQUNBLElBQUksT0FBTztBQUNULGVBQU8sS0FBSyxJQUFJO0FBQUEsTUFDbEI7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUjtBQUFBLE1BQ0EsU0FBUyxjQUFjLE9BQU8sSUFBSTtBQUFBLElBQ3BDO0FBQ0EsVUFBTSw0QkFBNEI7QUFBQSxNQUNoQyxJQUFJLEtBQUs7QUFDUCxlQUFPLE1BQU0sTUFBTSxLQUFLLElBQUk7QUFBQSxNQUM5QjtBQUFBLE1BQ0EsSUFBSSxPQUFPO0FBQ1QsZUFBTyxLQUFLLE1BQU0sSUFBSTtBQUFBLE1BQ3hCO0FBQUEsTUFDQSxJQUFJLEtBQUs7QUFDUCxlQUFPLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSTtBQUFBLE1BQ25DO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSDtBQUFBO0FBQUEsTUFFRjtBQUFBLE1BQ0EsS0FBSztBQUFBLFFBQ0g7QUFBQTtBQUFBLE1BRUY7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOO0FBQUE7QUFBQSxNQUVGO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTDtBQUFBO0FBQUEsTUFFRjtBQUFBLE1BQ0EsU0FBUyxjQUFjLE1BQU0sS0FBSztBQUFBLElBQ3BDO0FBQ0EsVUFBTSxtQ0FBbUM7QUFBQSxNQUN2QyxJQUFJLEtBQUs7QUFDUCxlQUFPLE1BQU0sTUFBTSxLQUFLLE1BQU0sSUFBSTtBQUFBLE1BQ3BDO0FBQUEsTUFDQSxJQUFJLE9BQU87QUFDVCxlQUFPLEtBQUssTUFBTSxJQUFJO0FBQUEsTUFDeEI7QUFBQSxNQUNBLElBQUksS0FBSztBQUNQLGVBQU8sTUFBTSxLQUFLLE1BQU0sS0FBSyxJQUFJO0FBQUEsTUFDbkM7QUFBQSxNQUNBLEtBQUs7QUFBQSxRQUNIO0FBQUE7QUFBQSxNQUVGO0FBQUEsTUFDQSxLQUFLO0FBQUEsUUFDSDtBQUFBO0FBQUEsTUFFRjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ047QUFBQTtBQUFBLE1BRUY7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMO0FBQUE7QUFBQSxNQUVGO0FBQUEsTUFDQSxTQUFTLGNBQWMsTUFBTSxJQUFJO0FBQUEsSUFDbkM7QUFDQSxVQUFNLGtCQUFrQixDQUFDLFFBQVEsVUFBVSxXQUFXLE9BQU8sUUFBUTtBQUNyRSxvQkFBZ0IsUUFBUSxDQUFDLFdBQVc7QUFDbEMsK0JBQXlCLE1BQU0sSUFBSSxxQkFBcUIsUUFBUSxPQUFPLEtBQUs7QUFDNUUsZ0NBQTBCLE1BQU0sSUFBSSxxQkFBcUIsUUFBUSxNQUFNLEtBQUs7QUFDNUUsK0JBQXlCLE1BQU0sSUFBSSxxQkFBcUIsUUFBUSxPQUFPLElBQUk7QUFDM0UsdUNBQWlDLE1BQU0sSUFBSSxxQkFBcUIsUUFBUSxNQUFNLElBQUk7QUFBQSxJQUNwRixDQUFDO0FBQ0QsV0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksQ0FBQyx5QkFBeUIsMEJBQTBCLHlCQUF5QiwrQkFBK0IsSUFBb0IsdUNBQXVCO0FBQzNKLFdBQVMsNEJBQTRCLFlBQVksU0FBUztBQUN4RCxVQUFNLG1CQUFtQixVQUFVLGFBQWEsa0NBQWtDLDBCQUEwQixhQUFhLDJCQUEyQjtBQUNwSixXQUFPLENBQUMsUUFBUSxLQUFLLGFBQWE7QUFDaEMsVUFBSSxRQUFRLGtCQUFrQjtBQUM1QixlQUFPLENBQUM7QUFBQSxNQUNWLFdBQVcsUUFBUSxrQkFBa0I7QUFDbkMsZUFBTztBQUFBLE1BQ1QsV0FBVyxRQUFRLFdBQVc7QUFDNUIsZUFBTztBQUFBLE1BQ1Q7QUFDQSxhQUFPLFFBQVEsSUFBSSxPQUFPLGtCQUFrQixHQUFHLEtBQUssT0FBTyxTQUFTLG1CQUFtQixRQUFRLEtBQUssUUFBUTtBQUFBLElBQzlHO0FBQUEsRUFDRjtBQUNBLE1BQUksNEJBQTRCO0FBQUEsSUFDOUIsS0FBcUIsNENBQTRCLE9BQU8sS0FBSztBQUFBLEVBQy9EO0FBQ0EsTUFBSSw2QkFBNkI7QUFBQSxJQUMvQixLQUFxQiw0Q0FBNEIsTUFBTSxLQUFLO0FBQUEsRUFDOUQ7QUFDQSxXQUFTLGtCQUFrQixRQUFRLE1BQU0sS0FBSztBQUM1QyxVQUFNLFNBQVMsTUFBTSxHQUFHO0FBQ3hCLFFBQUksV0FBVyxPQUFPLEtBQUssS0FBSyxRQUFRLE1BQU0sR0FBRztBQUMvQyxZQUFNLE9BQU8sVUFBVSxNQUFNO0FBQzdCLGNBQVEsS0FBSyxZQUFZLElBQUksa0VBQWtFLFNBQVMsUUFBUSxhQUFhLEVBQUUsOEpBQThKO0FBQUEsSUFDL1I7QUFBQSxFQUNGO0FBQ0EsTUFBSSxjQUE4QixvQkFBSSxRQUFRO0FBQzlDLE1BQUkscUJBQXFDLG9CQUFJLFFBQVE7QUFDckQsTUFBSSxjQUE4QixvQkFBSSxRQUFRO0FBQzlDLE1BQUkscUJBQXFDLG9CQUFJLFFBQVE7QUFDckQsV0FBUyxjQUFjLFNBQVM7QUFDOUIsWUFBUSxTQUFTO0FBQUEsTUFDZixLQUFLO0FBQUEsTUFDTCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUFBLE1BQ0wsS0FBSztBQUNILGVBQU87QUFBQSxNQUNUO0FBQ0UsZUFBTztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQ0EsV0FBUyxjQUFjLE9BQU87QUFDNUIsV0FBTztBQUFBLE1BQ0w7QUFBQTtBQUFBLElBRUYsS0FBSyxDQUFDLE9BQU8sYUFBYSxLQUFLLElBQUksSUFBSSxjQUFjLFVBQVUsS0FBSyxDQUFDO0FBQUEsRUFDdkU7QUFDQSxXQUFTLFVBQVUsUUFBUTtBQUN6QixRQUFJLFVBQVU7QUFBQSxNQUNaO0FBQUE7QUFBQSxJQUVGLEdBQUc7QUFDRCxhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU8scUJBQXFCLFFBQVEsT0FBTyxpQkFBaUIsMkJBQTJCLFdBQVc7QUFBQSxFQUNwRztBQUNBLFdBQVMsU0FBUyxRQUFRO0FBQ3hCLFdBQU8scUJBQXFCLFFBQVEsTUFBTSxrQkFBa0IsNEJBQTRCLFdBQVc7QUFBQSxFQUNyRztBQUNBLFdBQVMscUJBQXFCLFFBQVEsWUFBWSxjQUFjLG9CQUFvQixVQUFVO0FBQzVGLFFBQUksQ0FBQyxTQUFTLE1BQU0sR0FBRztBQUNyQixVQUFJLE1BQU07QUFDUixnQkFBUSxLQUFLLGtDQUFrQyxPQUFPLE1BQU0sQ0FBQyxFQUFFO0FBQUEsTUFDakU7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUk7QUFBQSxNQUNGO0FBQUE7QUFBQSxJQUVGLEtBQUssRUFBRSxjQUFjO0FBQUEsTUFDbkI7QUFBQTtBQUFBLElBRUYsSUFBSTtBQUNGLGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxnQkFBZ0IsU0FBUyxJQUFJLE1BQU07QUFDekMsUUFBSSxlQUFlO0FBQ2pCLGFBQU87QUFBQSxJQUNUO0FBQ0EsVUFBTSxhQUFhLGNBQWMsTUFBTTtBQUN2QyxRQUFJLGVBQWUsR0FBRztBQUNwQixhQUFPO0FBQUEsSUFDVDtBQUNBLFVBQU0sUUFBUSxJQUFJLE1BQU0sUUFBUSxlQUFlLElBQUkscUJBQXFCLFlBQVk7QUFDcEYsYUFBUyxJQUFJLFFBQVEsS0FBSztBQUMxQixXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsTUFBTSxVQUFVO0FBQ3ZCLFdBQU8sWUFBWSxNQUFNO0FBQUEsTUFDdkI7QUFBQTtBQUFBLElBRUYsQ0FBQyxLQUFLO0FBQUEsRUFDUjtBQUNBLFdBQVMsTUFBTSxHQUFHO0FBQ2hCLFdBQU8sUUFBUSxLQUFLLEVBQUUsY0FBYyxJQUFJO0FBQUEsRUFDMUM7QUFHQSxRQUFNLFlBQVksTUFBTSxRQUFRO0FBR2hDLFFBQU0sWUFBWSxDQUFDLE9BQU8sU0FBUyxLQUFLLFVBQVUsRUFBRSxDQUFDO0FBR3JELFFBQU0sU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLGdCQUFnQixTQUFTLFNBQVMsTUFBTSxDQUFDLEtBQUssYUFBYTtBQUM5RixRQUFJLFlBQVksZUFBZSxHQUFHO0FBQ2xDLFFBQUksU0FBUyxNQUFNO0FBQ2pCLFVBQUk7QUFDSixnQkFBVSxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzFCLGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxVQUFVLE1BQU0sUUFBUSxRQUFRO0FBQ3BDLGFBQVMsT0FBTztBQUFBLEVBQ2xCLENBQUM7QUFHRCxRQUFNLFNBQVMsU0FBUztBQUd4QixRQUFNLFFBQVEsQ0FBQyxPQUFPLE1BQU0sRUFBRSxDQUFDO0FBRy9CLFFBQU0sUUFBUSxDQUFDLE9BQU8sWUFBWSxFQUFFLENBQUM7QUFHckMsUUFBTSxRQUFRLENBQUMsT0FBTztBQUNwQixRQUFJLEdBQUc7QUFDTCxhQUFPLEdBQUc7QUFDWixPQUFHLGdCQUFnQixhQUFhLG9CQUFvQixFQUFFLENBQUM7QUFDdkQsV0FBTyxHQUFHO0FBQUEsRUFDWixDQUFDO0FBQ0QsV0FBUyxvQkFBb0IsSUFBSTtBQUMvQixRQUFJLGFBQWEsQ0FBQztBQUNsQixnQkFBWSxJQUFJLENBQUMsTUFBTTtBQUNyQixVQUFJLEVBQUU7QUFDSixtQkFBVyxLQUFLLEVBQUUsT0FBTztBQUFBLElBQzdCLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDVDtBQUdBLE1BQUksZUFBZSxDQUFDO0FBQ3BCLFdBQVMsbUJBQW1CLE1BQU07QUFDaEMsUUFBSSxDQUFDLGFBQWEsSUFBSTtBQUNwQixtQkFBYSxJQUFJLElBQUk7QUFDdkIsV0FBTyxFQUFFLGFBQWEsSUFBSTtBQUFBLEVBQzVCO0FBQ0EsV0FBUyxjQUFjLElBQUksTUFBTTtBQUMvQixXQUFPLFlBQVksSUFBSSxDQUFDLFlBQVk7QUFDbEMsVUFBSSxRQUFRLFVBQVUsUUFBUSxPQUFPLElBQUk7QUFDdkMsZUFBTztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFVBQVUsSUFBSSxNQUFNO0FBQzNCLFFBQUksQ0FBQyxHQUFHO0FBQ04sU0FBRyxTQUFTLENBQUM7QUFDZixRQUFJLENBQUMsR0FBRyxPQUFPLElBQUk7QUFDakIsU0FBRyxPQUFPLElBQUksSUFBSSxtQkFBbUIsSUFBSTtBQUFBLEVBQzdDO0FBR0EsUUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsU0FBUyxNQUFNLENBQUMsTUFBTSxNQUFNLFNBQVM7QUFDL0QsUUFBSSxXQUFXLEdBQUcsSUFBSSxHQUFHLE1BQU0sSUFBSSxHQUFHLEtBQUssRUFBRTtBQUM3QyxXQUFPLHVCQUF1QixJQUFJLFVBQVUsVUFBVSxNQUFNO0FBQzFELFVBQUksT0FBTyxjQUFjLElBQUksSUFBSTtBQUNqQyxVQUFJLEtBQUssT0FBTyxLQUFLLE9BQU8sSUFBSSxJQUFJLG1CQUFtQixJQUFJO0FBQzNELGFBQU8sTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFBQSxJQUNyRCxDQUFDO0FBQUEsRUFDSCxDQUFDO0FBQ0QsaUJBQWUsQ0FBQyxNQUFNLE9BQU87QUFDM0IsUUFBSSxLQUFLLE9BQU87QUFDZCxTQUFHLFFBQVEsS0FBSztBQUFBLElBQ2xCO0FBQUEsRUFDRixDQUFDO0FBQ0QsV0FBUyx1QkFBdUIsSUFBSSxVQUFVLFVBQVUsVUFBVTtBQUNoRSxRQUFJLENBQUMsR0FBRztBQUNOLFNBQUcsUUFBUSxDQUFDO0FBQ2QsUUFBSSxHQUFHLE1BQU0sUUFBUTtBQUNuQixhQUFPLEdBQUcsTUFBTSxRQUFRO0FBQzFCLFFBQUksU0FBUyxTQUFTO0FBQ3RCLE9BQUcsTUFBTSxRQUFRLElBQUk7QUFDckIsYUFBUyxNQUFNO0FBQ2IsYUFBTyxHQUFHLE1BQU0sUUFBUTtBQUFBLElBQzFCLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDVDtBQUdBLFFBQU0sTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUd0Qix5QkFBdUIsU0FBUyxTQUFTLE9BQU87QUFDaEQseUJBQXVCLFdBQVcsV0FBVyxTQUFTO0FBQ3RELFdBQVMsdUJBQXVCLE1BQU0sV0FBVyxNQUFNO0FBQ3JELFVBQU0sV0FBVyxDQUFDLE9BQU8sS0FBSyxtQkFBbUIsU0FBUyxtQ0FBbUMsSUFBSSwrQ0FBK0MsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUFBLEVBQzdKO0FBR0EsWUFBVSxhQUFhLENBQUMsSUFBSSxFQUFFLFdBQVcsR0FBRyxFQUFFLFFBQVEsU0FBUyxlQUFlLGdCQUFnQixTQUFTLFNBQVMsTUFBTTtBQUNwSCxRQUFJLE9BQU8sZUFBZSxVQUFVO0FBQ3BDLFFBQUksV0FBVyxNQUFNO0FBQ25CLFVBQUk7QUFDSixXQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDdEIsYUFBTztBQUFBLElBQ1Q7QUFDQSxRQUFJLG1CQUFtQixlQUFlLEdBQUcsVUFBVSxrQkFBa0I7QUFDckUsUUFBSSxXQUFXLENBQUMsUUFBUSxpQkFBaUIsTUFBTTtBQUFBLElBQy9DLEdBQUcsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLElBQUksRUFBRSxDQUFDO0FBQ3RDLFFBQUksZUFBZSxTQUFTO0FBQzVCLGFBQVMsWUFBWTtBQUNyQixtQkFBZSxNQUFNO0FBQ25CLFVBQUksQ0FBQyxHQUFHO0FBQ047QUFDRixTQUFHLHdCQUF3QixTQUFTLEVBQUU7QUFDdEMsVUFBSSxXQUFXLEdBQUcsU0FBUztBQUMzQixVQUFJLFdBQVcsR0FBRyxTQUFTO0FBQzNCLFVBQUksc0JBQXNCO0FBQUEsUUFDeEI7QUFBQSxVQUNFLE1BQU07QUFDSixtQkFBTyxTQUFTO0FBQUEsVUFDbEI7QUFBQSxVQUNBLElBQUksT0FBTztBQUNULHFCQUFTLEtBQUs7QUFBQSxVQUNoQjtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQ0osbUJBQU8sU0FBUztBQUFBLFVBQ2xCO0FBQUEsVUFDQSxJQUFJLE9BQU87QUFDVCxxQkFBUyxLQUFLO0FBQUEsVUFDaEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLGVBQVMsbUJBQW1CO0FBQUEsSUFDOUIsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUdELFlBQVUsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLFdBQVcsR0FBRyxFQUFFLFNBQVMsU0FBUyxNQUFNO0FBQzlFLFFBQUksR0FBRyxRQUFRLFlBQVksTUFBTTtBQUMvQixXQUFLLG1EQUFtRCxFQUFFO0FBQzVELFFBQUksU0FBUyxVQUFVLFVBQVU7QUFDakMsUUFBSSxTQUFTLEdBQUcsUUFBUSxVQUFVLElBQUksRUFBRTtBQUN4QyxPQUFHLGNBQWM7QUFDakIsV0FBTyxrQkFBa0I7QUFDekIsT0FBRyxhQUFhLDBCQUEwQixJQUFJO0FBQzlDLFdBQU8sYUFBYSx3QkFBd0IsSUFBSTtBQUNoRCxRQUFJLEdBQUcsa0JBQWtCO0FBQ3ZCLFNBQUcsaUJBQWlCLFFBQVEsQ0FBQyxjQUFjO0FBQ3pDLGVBQU8saUJBQWlCLFdBQVcsQ0FBQyxNQUFNO0FBQ3hDLFlBQUUsZ0JBQWdCO0FBQ2xCLGFBQUcsY0FBYyxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQUEsUUFDL0MsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUFBLElBQ0g7QUFDQSxtQkFBZSxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQzdCLFFBQUksYUFBYSxDQUFDLFFBQVEsU0FBUyxlQUFlO0FBQ2hELFVBQUksV0FBVyxTQUFTLFNBQVMsR0FBRztBQUNsQyxnQkFBUSxXQUFXLGFBQWEsUUFBUSxPQUFPO0FBQUEsTUFDakQsV0FBVyxXQUFXLFNBQVMsUUFBUSxHQUFHO0FBQ3hDLGdCQUFRLFdBQVcsYUFBYSxRQUFRLFFBQVEsV0FBVztBQUFBLE1BQzdELE9BQU87QUFDTCxnQkFBUSxZQUFZLE1BQU07QUFBQSxNQUM1QjtBQUFBLElBQ0Y7QUFDQSxjQUFVLE1BQU07QUFDZCxpQkFBVyxRQUFRLFFBQVEsU0FBUztBQUNwQyxzQkFBZ0IsTUFBTTtBQUNwQixpQkFBUyxNQUFNO0FBQUEsTUFDakIsQ0FBQyxFQUFFO0FBQUEsSUFDTCxDQUFDO0FBQ0QsT0FBRyxxQkFBcUIsTUFBTTtBQUM1QixVQUFJLFVBQVUsVUFBVSxVQUFVO0FBQ2xDLGdCQUFVLE1BQU07QUFDZCxtQkFBVyxHQUFHLGFBQWEsU0FBUyxTQUFTO0FBQUEsTUFDL0MsQ0FBQztBQUFBLElBQ0g7QUFDQTtBQUFBLE1BQ0UsTUFBTSxVQUFVLE1BQU07QUFDcEIsZUFBTyxPQUFPO0FBQ2Qsb0JBQVksTUFBTTtBQUFBLE1BQ3BCLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRixDQUFDO0FBQ0QsTUFBSSwrQkFBK0IsU0FBUyxjQUFjLEtBQUs7QUFDL0QsV0FBUyxVQUFVLFlBQVk7QUFDN0IsUUFBSSxTQUFTLGdCQUFnQixNQUFNO0FBQ2pDLGFBQU8sU0FBUyxjQUFjLFVBQVU7QUFBQSxJQUMxQyxHQUFHLE1BQU07QUFDUCxhQUFPO0FBQUEsSUFDVCxDQUFDLEVBQUU7QUFDSCxRQUFJLENBQUM7QUFDSCxXQUFLLGlEQUFpRCxVQUFVLEdBQUc7QUFDckUsV0FBTztBQUFBLEVBQ1Q7QUFHQSxNQUFJLFVBQVUsTUFBTTtBQUFBLEVBQ3BCO0FBQ0EsVUFBUSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsR0FBRyxFQUFFLFNBQVMsU0FBUyxNQUFNO0FBQzdELGNBQVUsU0FBUyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsT0FBTyxHQUFHLFlBQVk7QUFDdEUsYUFBUyxNQUFNO0FBQ2IsZ0JBQVUsU0FBUyxNQUFNLElBQUksT0FBTyxHQUFHLGdCQUFnQixPQUFPLEdBQUc7QUFBQSxJQUNuRSxDQUFDO0FBQUEsRUFDSDtBQUNBLFlBQVUsVUFBVSxPQUFPO0FBRzNCLFlBQVUsVUFBVSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsV0FBVyxHQUFHLEVBQUUsUUFBUSxRQUFRLE1BQU07QUFDL0UsWUFBUSxjQUFjLElBQUksVUFBVSxDQUFDO0FBQUEsRUFDdkMsQ0FBQyxDQUFDO0FBR0YsV0FBUyxHQUFHLElBQUksT0FBTyxXQUFXLFVBQVU7QUFDMUMsUUFBSSxpQkFBaUI7QUFDckIsUUFBSSxXQUFXLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDaEMsUUFBSSxVQUFVLENBQUM7QUFDZixRQUFJLGNBQWMsQ0FBQyxXQUFXLFlBQVksQ0FBQyxNQUFNLFFBQVEsV0FBVyxDQUFDO0FBQ3JFLFFBQUksVUFBVSxTQUFTLEtBQUs7QUFDMUIsY0FBUSxVQUFVLEtBQUs7QUFDekIsUUFBSSxVQUFVLFNBQVMsT0FBTztBQUM1QixjQUFRLFdBQVcsS0FBSztBQUMxQixRQUFJLFVBQVUsU0FBUyxTQUFTO0FBQzlCLGNBQVEsVUFBVTtBQUNwQixRQUFJLFVBQVUsU0FBUyxTQUFTO0FBQzlCLGNBQVEsVUFBVTtBQUNwQixRQUFJLFVBQVUsU0FBUyxRQUFRO0FBQzdCLHVCQUFpQjtBQUNuQixRQUFJLFVBQVUsU0FBUyxVQUFVO0FBQy9CLHVCQUFpQjtBQUNuQixRQUFJLFVBQVUsU0FBUyxVQUFVLEdBQUc7QUFDbEMsVUFBSSxlQUFlLFVBQVUsVUFBVSxRQUFRLFVBQVUsSUFBSSxDQUFDLEtBQUs7QUFDbkUsVUFBSSxPQUFPLFVBQVUsYUFBYSxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLGFBQWEsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7QUFDMUYsaUJBQVcsU0FBUyxVQUFVLElBQUk7QUFBQSxJQUNwQztBQUNBLFFBQUksVUFBVSxTQUFTLFVBQVUsR0FBRztBQUNsQyxVQUFJLGVBQWUsVUFBVSxVQUFVLFFBQVEsVUFBVSxJQUFJLENBQUMsS0FBSztBQUNuRSxVQUFJLE9BQU8sVUFBVSxhQUFhLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLE9BQU8sYUFBYSxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtBQUMxRixpQkFBVyxTQUFTLFVBQVUsSUFBSTtBQUFBLElBQ3BDO0FBQ0EsUUFBSSxVQUFVLFNBQVMsU0FBUztBQUM5QixpQkFBVyxZQUFZLFVBQVUsQ0FBQyxNQUFNLE1BQU07QUFDNUMsVUFBRSxlQUFlO0FBQ2pCLGFBQUssQ0FBQztBQUFBLE1BQ1IsQ0FBQztBQUNILFFBQUksVUFBVSxTQUFTLE1BQU07QUFDM0IsaUJBQVcsWUFBWSxVQUFVLENBQUMsTUFBTSxNQUFNO0FBQzVDLFVBQUUsZ0JBQWdCO0FBQ2xCLGFBQUssQ0FBQztBQUFBLE1BQ1IsQ0FBQztBQUNILFFBQUksVUFBVSxTQUFTLE1BQU0sR0FBRztBQUM5QixpQkFBVyxZQUFZLFVBQVUsQ0FBQyxNQUFNLE1BQU07QUFDNUMsYUFBSyxDQUFDO0FBQ04sdUJBQWUsb0JBQW9CLE9BQU8sVUFBVSxPQUFPO0FBQUEsTUFDN0QsQ0FBQztBQUFBLElBQ0g7QUFDQSxRQUFJLFVBQVUsU0FBUyxNQUFNLEtBQUssVUFBVSxTQUFTLFNBQVMsR0FBRztBQUMvRCx1QkFBaUI7QUFDakIsaUJBQVcsWUFBWSxVQUFVLENBQUMsTUFBTSxNQUFNO0FBQzVDLFlBQUksR0FBRyxTQUFTLEVBQUUsTUFBTTtBQUN0QjtBQUNGLFlBQUksRUFBRSxPQUFPLGdCQUFnQjtBQUMzQjtBQUNGLFlBQUksR0FBRyxjQUFjLEtBQUssR0FBRyxlQUFlO0FBQzFDO0FBQ0YsWUFBSSxHQUFHLGVBQWU7QUFDcEI7QUFDRixhQUFLLENBQUM7QUFBQSxNQUNSLENBQUM7QUFBQSxJQUNIO0FBQ0EsUUFBSSxVQUFVLFNBQVMsTUFBTTtBQUMzQixpQkFBVyxZQUFZLFVBQVUsQ0FBQyxNQUFNLE1BQU07QUFDNUMsVUFBRSxXQUFXLE1BQU0sS0FBSyxDQUFDO0FBQUEsTUFDM0IsQ0FBQztBQUNILFFBQUksV0FBVyxLQUFLLEtBQUssYUFBYSxLQUFLLEdBQUc7QUFDNUMsaUJBQVcsWUFBWSxVQUFVLENBQUMsTUFBTSxNQUFNO0FBQzVDLFlBQUksK0NBQStDLEdBQUcsU0FBUyxHQUFHO0FBQ2hFO0FBQUEsUUFDRjtBQUNBLGFBQUssQ0FBQztBQUFBLE1BQ1IsQ0FBQztBQUFBLElBQ0g7QUFDQSxtQkFBZSxpQkFBaUIsT0FBTyxVQUFVLE9BQU87QUFDeEQsV0FBTyxNQUFNO0FBQ1gscUJBQWUsb0JBQW9CLE9BQU8sVUFBVSxPQUFPO0FBQUEsSUFDN0Q7QUFBQSxFQUNGO0FBQ0EsV0FBUyxVQUFVLFNBQVM7QUFDMUIsV0FBTyxRQUFRLFFBQVEsTUFBTSxHQUFHO0FBQUEsRUFDbEM7QUFDQSxXQUFTLFdBQVcsU0FBUztBQUMzQixXQUFPLFFBQVEsWUFBWSxFQUFFLFFBQVEsVUFBVSxDQUFDLE9BQU8sU0FBUyxLQUFLLFlBQVksQ0FBQztBQUFBLEVBQ3BGO0FBQ0EsV0FBUyxVQUFVLFNBQVM7QUFDMUIsV0FBTyxDQUFDLE1BQU0sUUFBUSxPQUFPLEtBQUssQ0FBQyxNQUFNLE9BQU87QUFBQSxFQUNsRDtBQUNBLFdBQVMsV0FBVyxTQUFTO0FBQzNCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUFBLE1BQ2I7QUFBQSxJQUNGO0FBQ0UsYUFBTztBQUNULFdBQU8sUUFBUSxRQUFRLG1CQUFtQixPQUFPLEVBQUUsUUFBUSxTQUFTLEdBQUcsRUFBRSxZQUFZO0FBQUEsRUFDdkY7QUFDQSxXQUFTLFdBQVcsT0FBTztBQUN6QixXQUFPLENBQUMsV0FBVyxPQUFPLEVBQUUsU0FBUyxLQUFLO0FBQUEsRUFDNUM7QUFDQSxXQUFTLGFBQWEsT0FBTztBQUMzQixXQUFPLENBQUMsZUFBZSxTQUFTLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsRUFDeEU7QUFDQSxXQUFTLCtDQUErQyxHQUFHLFdBQVc7QUFDcEUsUUFBSSxlQUFlLFVBQVUsT0FBTyxDQUFDLE1BQU07QUFDekMsYUFBTyxDQUFDLENBQUMsVUFBVSxZQUFZLFdBQVcsUUFBUSxRQUFRLFdBQVcsUUFBUSxRQUFRLFdBQVcsV0FBVyxpQkFBaUIsRUFBRSxTQUFTLENBQUM7QUFBQSxJQUMxSSxDQUFDO0FBQ0QsUUFBSSxhQUFhLFNBQVMsVUFBVSxHQUFHO0FBQ3JDLFVBQUksZ0JBQWdCLGFBQWEsUUFBUSxVQUFVO0FBQ25ELG1CQUFhLE9BQU8sZUFBZSxXQUFXLGFBQWEsZ0JBQWdCLENBQUMsS0FBSyxnQkFBZ0IsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQUEsSUFDMUg7QUFDQSxRQUFJLGFBQWEsU0FBUyxVQUFVLEdBQUc7QUFDckMsVUFBSSxnQkFBZ0IsYUFBYSxRQUFRLFVBQVU7QUFDbkQsbUJBQWEsT0FBTyxlQUFlLFdBQVcsYUFBYSxnQkFBZ0IsQ0FBQyxLQUFLLGdCQUFnQixNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFBQSxJQUMxSDtBQUNBLFFBQUksYUFBYSxXQUFXO0FBQzFCLGFBQU87QUFDVCxRQUFJLGFBQWEsV0FBVyxLQUFLLGVBQWUsRUFBRSxHQUFHLEVBQUUsU0FBUyxhQUFhLENBQUMsQ0FBQztBQUM3RSxhQUFPO0FBQ1QsVUFBTSxxQkFBcUIsQ0FBQyxRQUFRLFNBQVMsT0FBTyxRQUFRLE9BQU8sT0FBTztBQUMxRSxVQUFNLDZCQUE2QixtQkFBbUIsT0FBTyxDQUFDLGFBQWEsYUFBYSxTQUFTLFFBQVEsQ0FBQztBQUMxRyxtQkFBZSxhQUFhLE9BQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLFNBQVMsQ0FBQyxDQUFDO0FBQ2pGLFFBQUksMkJBQTJCLFNBQVMsR0FBRztBQUN6QyxZQUFNLDhCQUE4QiwyQkFBMkIsT0FBTyxDQUFDLGFBQWE7QUFDbEYsWUFBSSxhQUFhLFNBQVMsYUFBYTtBQUNyQyxxQkFBVztBQUNiLGVBQU8sRUFBRSxHQUFHLFFBQVEsS0FBSztBQUFBLE1BQzNCLENBQUM7QUFDRCxVQUFJLDRCQUE0QixXQUFXLDJCQUEyQixRQUFRO0FBQzVFLFlBQUksYUFBYSxFQUFFLElBQUk7QUFDckIsaUJBQU87QUFDVCxZQUFJLGVBQWUsRUFBRSxHQUFHLEVBQUUsU0FBUyxhQUFhLENBQUMsQ0FBQztBQUNoRCxpQkFBTztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxXQUFTLGVBQWUsS0FBSztBQUMzQixRQUFJLENBQUM7QUFDSCxhQUFPLENBQUM7QUFDVixVQUFNLFdBQVcsR0FBRztBQUNwQixRQUFJLG1CQUFtQjtBQUFBLE1BQ3JCLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULFlBQVk7QUFBQSxNQUNaLE9BQU87QUFBQSxNQUNQLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULGNBQWM7QUFBQSxJQUNoQjtBQUNBLHFCQUFpQixHQUFHLElBQUk7QUFDeEIsV0FBTyxPQUFPLEtBQUssZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDckQsVUFBSSxpQkFBaUIsUUFBUSxNQUFNO0FBQ2pDLGVBQU87QUFBQSxJQUNYLENBQUMsRUFBRSxPQUFPLENBQUMsYUFBYSxRQUFRO0FBQUEsRUFDbEM7QUFHQSxZQUFVLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxXQUFXLEdBQUcsRUFBRSxRQUFRLFNBQVMsU0FBUyxTQUFTLE1BQU07QUFDNUYsUUFBSSxjQUFjO0FBQ2xCLFFBQUksVUFBVSxTQUFTLFFBQVEsR0FBRztBQUNoQyxvQkFBYyxHQUFHO0FBQUEsSUFDbkI7QUFDQSxRQUFJLGNBQWMsY0FBYyxhQUFhLFVBQVU7QUFDdkQsUUFBSTtBQUNKLFFBQUksT0FBTyxlQUFlLFVBQVU7QUFDbEMsb0JBQWMsY0FBYyxhQUFhLEdBQUcsVUFBVSxrQkFBa0I7QUFBQSxJQUMxRSxXQUFXLE9BQU8sZUFBZSxjQUFjLE9BQU8sV0FBVyxNQUFNLFVBQVU7QUFDL0Usb0JBQWMsY0FBYyxhQUFhLEdBQUcsV0FBVyxDQUFDLGtCQUFrQjtBQUFBLElBQzVFLE9BQU87QUFDTCxvQkFBYyxNQUFNO0FBQUEsTUFDcEI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxXQUFXLE1BQU07QUFDbkIsVUFBSTtBQUNKLGtCQUFZLENBQUMsVUFBVSxTQUFTLEtBQUs7QUFDckMsYUFBTyxlQUFlLE1BQU0sSUFBSSxPQUFPLElBQUksSUFBSTtBQUFBLElBQ2pEO0FBQ0EsUUFBSSxXQUFXLENBQUMsVUFBVTtBQUN4QixVQUFJO0FBQ0osa0JBQVksQ0FBQyxXQUFXLFNBQVMsTUFBTTtBQUN2QyxVQUFJLGVBQWUsTUFBTSxHQUFHO0FBQzFCLGVBQU8sSUFBSSxLQUFLO0FBQUEsTUFDbEIsT0FBTztBQUNMLG9CQUFZLE1BQU07QUFBQSxRQUNsQixHQUFHO0FBQUEsVUFDRCxPQUFPLEVBQUUsaUJBQWlCLE1BQU07QUFBQSxRQUNsQyxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFDQSxRQUFJLE9BQU8sZUFBZSxZQUFZLEdBQUcsU0FBUyxTQUFTO0FBQ3pELGdCQUFVLE1BQU07QUFDZCxZQUFJLENBQUMsR0FBRyxhQUFhLE1BQU07QUFDekIsYUFBRyxhQUFhLFFBQVEsVUFBVTtBQUFBLE1BQ3RDLENBQUM7QUFBQSxJQUNIO0FBQ0EsUUFBSSxRQUFRLEdBQUcsUUFBUSxZQUFZLE1BQU0sWUFBWSxDQUFDLFlBQVksT0FBTyxFQUFFLFNBQVMsR0FBRyxJQUFJLEtBQUssVUFBVSxTQUFTLE1BQU0sSUFBSSxXQUFXO0FBQ3hJLFFBQUksaUJBQWlCLFlBQVksTUFBTTtBQUFBLElBQ3ZDLElBQUksR0FBRyxJQUFJLE9BQU8sV0FBVyxDQUFDLE1BQU07QUFDbEMsZUFBUyxjQUFjLElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0FBQUEsSUFDdEQsQ0FBQztBQUNELFFBQUksVUFBVSxTQUFTLE1BQU0sR0FBRztBQUM5QixVQUFJLENBQUMsUUFBUSxNQUFNLEVBQUUsRUFBRSxTQUFTLFNBQVMsQ0FBQyxLQUFLLFdBQVcsRUFBRSxLQUFLLE1BQU0sUUFBUSxTQUFTLENBQUMsS0FBSyxHQUFHLFFBQVEsWUFBWSxNQUFNLFlBQVksR0FBRyxVQUFVO0FBQ2xKO0FBQUEsVUFDRSxjQUFjLElBQUksV0FBVyxFQUFFLFFBQVEsR0FBRyxHQUFHLFNBQVMsQ0FBQztBQUFBLFFBQ3pEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFDQSxRQUFJLENBQUMsR0FBRztBQUNOLFNBQUcsMEJBQTBCLENBQUM7QUFDaEMsT0FBRyx3QkFBd0IsU0FBUyxJQUFJO0FBQ3hDLGFBQVMsTUFBTSxHQUFHLHdCQUF3QixTQUFTLEVBQUUsQ0FBQztBQUN0RCxRQUFJLEdBQUcsTUFBTTtBQUNYLFVBQUksc0JBQXNCLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTTtBQUN4RCxpQkFBUyxNQUFNLEdBQUcsWUFBWSxHQUFHLFNBQVMsSUFBSSxjQUFjLElBQUksV0FBVyxFQUFFLFFBQVEsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFBQSxNQUN6RyxDQUFDO0FBQ0QsZUFBUyxNQUFNLG9CQUFvQixDQUFDO0FBQUEsSUFDdEM7QUFDQSxPQUFHLFdBQVc7QUFBQSxNQUNaLE1BQU07QUFDSixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsSUFBSSxPQUFPO0FBQ1QsaUJBQVMsS0FBSztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUNBLE9BQUcsc0JBQXNCLENBQUMsVUFBVTtBQUNsQyxVQUFJLFVBQVUsVUFBVSxPQUFPLGVBQWUsWUFBWSxXQUFXLE1BQU0sSUFBSTtBQUM3RSxnQkFBUTtBQUNWLGFBQU8sWUFBWTtBQUNuQixnQkFBVSxNQUFNLEtBQUssSUFBSSxTQUFTLEtBQUssQ0FBQztBQUN4QyxhQUFPLE9BQU87QUFBQSxJQUNoQjtBQUNBLFlBQVEsTUFBTTtBQUNaLFVBQUksUUFBUSxTQUFTO0FBQ3JCLFVBQUksVUFBVSxTQUFTLGFBQWEsS0FBSyxTQUFTLGNBQWMsV0FBVyxFQUFFO0FBQzNFO0FBQ0YsU0FBRyxvQkFBb0IsS0FBSztBQUFBLElBQzlCLENBQUM7QUFBQSxFQUNILENBQUM7QUFDRCxXQUFTLGNBQWMsSUFBSSxXQUFXLE9BQU8sY0FBYztBQUN6RCxXQUFPLFVBQVUsTUFBTTtBQUNyQixVQUFJLGlCQUFpQixlQUFlLE1BQU0sV0FBVztBQUNuRCxlQUFPLE1BQU0sV0FBVyxRQUFRLE1BQU0sV0FBVyxTQUFTLE1BQU0sU0FBUyxNQUFNLE9BQU87QUFBQSxlQUMvRSxXQUFXLEVBQUUsR0FBRztBQUN2QixZQUFJLE1BQU0sUUFBUSxZQUFZLEdBQUc7QUFDL0IsY0FBSSxXQUFXO0FBQ2YsY0FBSSxVQUFVLFNBQVMsUUFBUSxHQUFHO0FBQ2hDLHVCQUFXLGdCQUFnQixNQUFNLE9BQU8sS0FBSztBQUFBLFVBQy9DLFdBQVcsVUFBVSxTQUFTLFNBQVMsR0FBRztBQUN4Qyx1QkFBVyxpQkFBaUIsTUFBTSxPQUFPLEtBQUs7QUFBQSxVQUNoRCxPQUFPO0FBQ0wsdUJBQVcsTUFBTSxPQUFPO0FBQUEsVUFDMUI7QUFDQSxpQkFBTyxNQUFNLE9BQU8sVUFBVSxhQUFhLFNBQVMsUUFBUSxJQUFJLGVBQWUsYUFBYSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksYUFBYSxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixLQUFLLFFBQVEsQ0FBQztBQUFBLFFBQ3hMLE9BQU87QUFDTCxpQkFBTyxNQUFNLE9BQU87QUFBQSxRQUN0QjtBQUFBLE1BQ0YsV0FBVyxHQUFHLFFBQVEsWUFBWSxNQUFNLFlBQVksR0FBRyxVQUFVO0FBQy9ELFlBQUksVUFBVSxTQUFTLFFBQVEsR0FBRztBQUNoQyxpQkFBTyxNQUFNLEtBQUssTUFBTSxPQUFPLGVBQWUsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM5RCxnQkFBSSxXQUFXLE9BQU8sU0FBUyxPQUFPO0FBQ3RDLG1CQUFPLGdCQUFnQixRQUFRO0FBQUEsVUFDakMsQ0FBQztBQUFBLFFBQ0gsV0FBVyxVQUFVLFNBQVMsU0FBUyxHQUFHO0FBQ3hDLGlCQUFPLE1BQU0sS0FBSyxNQUFNLE9BQU8sZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXO0FBQzlELGdCQUFJLFdBQVcsT0FBTyxTQUFTLE9BQU87QUFDdEMsbUJBQU8saUJBQWlCLFFBQVE7QUFBQSxVQUNsQyxDQUFDO0FBQUEsUUFDSDtBQUNBLGVBQU8sTUFBTSxLQUFLLE1BQU0sT0FBTyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDOUQsaUJBQU8sT0FBTyxTQUFTLE9BQU87QUFBQSxRQUNoQyxDQUFDO0FBQUEsTUFDSCxPQUFPO0FBQ0wsWUFBSTtBQUNKLFlBQUksUUFBUSxFQUFFLEdBQUc7QUFDZixjQUFJLE1BQU0sT0FBTyxTQUFTO0FBQ3hCLHVCQUFXLE1BQU0sT0FBTztBQUFBLFVBQzFCLE9BQU87QUFDTCx1QkFBVztBQUFBLFVBQ2I7QUFBQSxRQUNGLE9BQU87QUFDTCxxQkFBVyxNQUFNLE9BQU87QUFBQSxRQUMxQjtBQUNBLFlBQUksVUFBVSxTQUFTLFFBQVEsR0FBRztBQUNoQyxpQkFBTyxnQkFBZ0IsUUFBUTtBQUFBLFFBQ2pDLFdBQVcsVUFBVSxTQUFTLFNBQVMsR0FBRztBQUN4QyxpQkFBTyxpQkFBaUIsUUFBUTtBQUFBLFFBQ2xDLFdBQVcsVUFBVSxTQUFTLE1BQU0sR0FBRztBQUNyQyxpQkFBTyxTQUFTLEtBQUs7QUFBQSxRQUN2QixPQUFPO0FBQ0wsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLGdCQUFnQixVQUFVO0FBQ2pDLFFBQUksU0FBUyxXQUFXLFdBQVcsUUFBUSxJQUFJO0FBQy9DLFdBQU8sV0FBVyxNQUFNLElBQUksU0FBUztBQUFBLEVBQ3ZDO0FBQ0EsV0FBUyx5QkFBeUIsUUFBUSxRQUFRO0FBQ2hELFdBQU8sVUFBVTtBQUFBLEVBQ25CO0FBQ0EsV0FBUyxXQUFXLFNBQVM7QUFDM0IsV0FBTyxDQUFDLE1BQU0sUUFBUSxPQUFPLEtBQUssQ0FBQyxNQUFNLE9BQU87QUFBQSxFQUNsRDtBQUNBLFdBQVMsZUFBZSxPQUFPO0FBQzdCLFdBQU8sVUFBVSxRQUFRLE9BQU8sVUFBVSxZQUFZLE9BQU8sTUFBTSxRQUFRLGNBQWMsT0FBTyxNQUFNLFFBQVE7QUFBQSxFQUNoSDtBQUdBLFlBQVUsU0FBUyxDQUFDLE9BQU8sZUFBZSxNQUFNLFVBQVUsTUFBTSxHQUFHLGdCQUFnQixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUdyRyxrQkFBZ0IsTUFBTSxJQUFJLE9BQU8sTUFBTSxDQUFDLEdBQUc7QUFDM0MsWUFBVSxRQUFRLGdCQUFnQixDQUFDLElBQUksRUFBRSxXQUFXLEdBQUcsRUFBRSxVQUFVLFVBQVUsTUFBTTtBQUNqRixRQUFJLE9BQU8sZUFBZSxVQUFVO0FBQ2xDLGFBQU8sQ0FBQyxDQUFDLFdBQVcsS0FBSyxLQUFLLFVBQVUsWUFBWSxDQUFDLEdBQUcsS0FBSztBQUFBLElBQy9EO0FBQ0EsV0FBTyxVQUFVLFlBQVksQ0FBQyxHQUFHLEtBQUs7QUFBQSxFQUN4QyxDQUFDLENBQUM7QUFHRixZQUFVLFFBQVEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxHQUFHLEVBQUUsUUFBUSxTQUFTLGVBQWUsZUFBZSxNQUFNO0FBQzVGLFFBQUksWUFBWSxlQUFlLFVBQVU7QUFDekMsWUFBUSxNQUFNO0FBQ1osZ0JBQVUsQ0FBQyxVQUFVO0FBQ25CLGtCQUFVLE1BQU07QUFDZCxhQUFHLGNBQWM7QUFBQSxRQUNuQixDQUFDO0FBQUEsTUFDSCxDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsRUFDSCxDQUFDO0FBR0QsWUFBVSxRQUFRLENBQUMsSUFBSSxFQUFFLFdBQVcsR0FBRyxFQUFFLFFBQVEsU0FBUyxlQUFlLGVBQWUsTUFBTTtBQUM1RixRQUFJLFlBQVksZUFBZSxVQUFVO0FBQ3pDLFlBQVEsTUFBTTtBQUNaLGdCQUFVLENBQUMsVUFBVTtBQUNuQixrQkFBVSxNQUFNO0FBQ2QsYUFBRyxZQUFZO0FBQ2YsYUFBRyxnQkFBZ0I7QUFDbkIsbUJBQVMsRUFBRTtBQUNYLGlCQUFPLEdBQUc7QUFBQSxRQUNaLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxFQUNILENBQUM7QUFHRCxnQkFBYyxhQUFhLEtBQUssS0FBSyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdEQsTUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sV0FBVyxZQUFZLFNBQVMsR0FBRyxFQUFFLFFBQVEsU0FBUyxTQUFTLFNBQVMsTUFBTTtBQUN6RyxRQUFJLENBQUMsT0FBTztBQUNWLFVBQUksbUJBQW1CLENBQUM7QUFDeEIsNkJBQXVCLGdCQUFnQjtBQUN2QyxVQUFJLGNBQWMsY0FBYyxJQUFJLFVBQVU7QUFDOUMsa0JBQVksQ0FBQyxhQUFhO0FBQ3hCLDRCQUFvQixJQUFJLFVBQVUsUUFBUTtBQUFBLE1BQzVDLEdBQUcsRUFBRSxPQUFPLGlCQUFpQixDQUFDO0FBQzlCO0FBQUEsSUFDRjtBQUNBLFFBQUksVUFBVTtBQUNaLGFBQU8sZ0JBQWdCLElBQUksVUFBVTtBQUN2QyxRQUFJLEdBQUcscUJBQXFCLEdBQUcsa0JBQWtCLEtBQUssS0FBSyxHQUFHLGtCQUFrQixLQUFLLEVBQUUsU0FBUztBQUM5RjtBQUFBLElBQ0Y7QUFDQSxRQUFJLFlBQVksY0FBYyxJQUFJLFVBQVU7QUFDNUMsWUFBUSxNQUFNLFVBQVUsQ0FBQyxXQUFXO0FBQ2xDLFVBQUksV0FBVyxVQUFVLE9BQU8sZUFBZSxZQUFZLFdBQVcsTUFBTSxJQUFJLEdBQUc7QUFDakYsaUJBQVM7QUFBQSxNQUNYO0FBQ0EsZ0JBQVUsTUFBTSxLQUFLLElBQUksT0FBTyxRQUFRLFNBQVMsQ0FBQztBQUFBLElBQ3BELENBQUMsQ0FBQztBQUNGLGFBQVMsTUFBTTtBQUNiLFNBQUcsdUJBQXVCLEdBQUcsb0JBQW9CO0FBQ2pELFNBQUcsc0JBQXNCLEdBQUcsbUJBQW1CO0FBQUEsSUFDakQsQ0FBQztBQUFBLEVBQ0g7QUFDQSxXQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxXQUFXLFdBQVcsTUFBTTtBQUMxRCxRQUFJLENBQUM7QUFDSDtBQUNGLFFBQUksQ0FBQyxHQUFHO0FBQ04sU0FBRyxvQkFBb0IsQ0FBQztBQUMxQixPQUFHLGtCQUFrQixLQUFLLElBQUksRUFBRSxZQUFZLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQ0EsWUFBVSxRQUFRLFFBQVE7QUFDMUIsV0FBUyxnQkFBZ0IsSUFBSSxZQUFZO0FBQ3ZDLE9BQUcsbUJBQW1CO0FBQUEsRUFDeEI7QUFHQSxrQkFBZ0IsTUFBTSxJQUFJLE9BQU8sTUFBTSxDQUFDLEdBQUc7QUFDM0MsWUFBVSxRQUFRLENBQUMsSUFBSSxFQUFFLFdBQVcsR0FBRyxFQUFFLFNBQVMsU0FBUyxNQUFNO0FBQy9ELFFBQUkscUNBQXFDLEVBQUU7QUFDekM7QUFDRixpQkFBYSxlQUFlLEtBQUssT0FBTztBQUN4QyxRQUFJLGVBQWUsQ0FBQztBQUNwQixpQkFBYSxjQUFjLEVBQUU7QUFDN0IsUUFBSSxzQkFBc0IsQ0FBQztBQUMzQix3QkFBb0IscUJBQXFCLFlBQVk7QUFDckQsUUFBSSxRQUFRLFNBQVMsSUFBSSxZQUFZLEVBQUUsT0FBTyxvQkFBb0IsQ0FBQztBQUNuRSxRQUFJLFVBQVUsVUFBVSxVQUFVO0FBQ2hDLGNBQVEsQ0FBQztBQUNYLGlCQUFhLE9BQU8sRUFBRTtBQUN0QixRQUFJLGVBQWUsU0FBUyxLQUFLO0FBQ2pDLHFCQUFpQixZQUFZO0FBQzdCLFFBQUksT0FBTyxlQUFlLElBQUksWUFBWTtBQUMxQyxpQkFBYSxNQUFNLEtBQUssU0FBUyxJQUFJLGFBQWEsTUFBTSxDQUFDO0FBQ3pELGFBQVMsTUFBTTtBQUNiLG1CQUFhLFNBQVMsS0FBSyxTQUFTLElBQUksYUFBYSxTQUFTLENBQUM7QUFDL0QsV0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUNELGlCQUFlLENBQUMsTUFBTSxPQUFPO0FBQzNCLFFBQUksS0FBSyxjQUFjO0FBQ3JCLFNBQUcsZUFBZSxLQUFLO0FBQ3ZCLFNBQUcsYUFBYSx5QkFBeUIsSUFBSTtBQUFBLElBQy9DO0FBQUEsRUFDRixDQUFDO0FBQ0QsV0FBUyxxQ0FBcUMsSUFBSTtBQUNoRCxRQUFJLENBQUM7QUFDSCxhQUFPO0FBQ1QsUUFBSTtBQUNGLGFBQU87QUFDVCxXQUFPLEdBQUcsYUFBYSx1QkFBdUI7QUFBQSxFQUNoRDtBQUdBLFlBQVUsUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLFdBQVcsR0FBRyxFQUFFLFFBQVEsUUFBUSxNQUFNO0FBQ3hFLFFBQUksWUFBWSxjQUFjLElBQUksVUFBVTtBQUM1QyxRQUFJLENBQUMsR0FBRztBQUNOLFNBQUcsWUFBWSxNQUFNO0FBQ25CLGtCQUFVLE1BQU07QUFDZCxhQUFHLE1BQU0sWUFBWSxXQUFXLFFBQVEsVUFBVSxTQUFTLFdBQVcsSUFBSSxjQUFjLE1BQU07QUFBQSxRQUNoRyxDQUFDO0FBQUEsTUFDSDtBQUNGLFFBQUksQ0FBQyxHQUFHO0FBQ04sU0FBRyxZQUFZLE1BQU07QUFDbkIsa0JBQVUsTUFBTTtBQUNkLGNBQUksR0FBRyxNQUFNLFdBQVcsS0FBSyxHQUFHLE1BQU0sWUFBWSxRQUFRO0FBQ3hELGVBQUcsZ0JBQWdCLE9BQU87QUFBQSxVQUM1QixPQUFPO0FBQ0wsZUFBRyxNQUFNLGVBQWUsU0FBUztBQUFBLFVBQ25DO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUNGLFFBQUksT0FBTyxNQUFNO0FBQ2YsU0FBRyxVQUFVO0FBQ2IsU0FBRyxhQUFhO0FBQUEsSUFDbEI7QUFDQSxRQUFJLE9BQU8sTUFBTTtBQUNmLFNBQUcsVUFBVTtBQUNiLFNBQUcsYUFBYTtBQUFBLElBQ2xCO0FBQ0EsUUFBSSwwQkFBMEIsTUFBTSxXQUFXLElBQUk7QUFDbkQsUUFBSSxTQUFTO0FBQUEsTUFDWCxDQUFDLFVBQVUsUUFBUSxLQUFLLElBQUksS0FBSztBQUFBLE1BQ2pDLENBQUMsVUFBVTtBQUNULFlBQUksT0FBTyxHQUFHLHVDQUF1QyxZQUFZO0FBQy9ELGFBQUcsbUNBQW1DLElBQUksT0FBTyxNQUFNLElBQUk7QUFBQSxRQUM3RCxPQUFPO0FBQ0wsa0JBQVEsd0JBQXdCLElBQUksS0FBSztBQUFBLFFBQzNDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFDQSxRQUFJO0FBQ0osUUFBSSxZQUFZO0FBQ2hCLFlBQVEsTUFBTSxVQUFVLENBQUMsVUFBVTtBQUNqQyxVQUFJLENBQUMsYUFBYSxVQUFVO0FBQzFCO0FBQ0YsVUFBSSxVQUFVLFNBQVMsV0FBVztBQUNoQyxnQkFBUSx3QkFBd0IsSUFBSSxLQUFLO0FBQzNDLGFBQU8sS0FBSztBQUNaLGlCQUFXO0FBQ1gsa0JBQVk7QUFBQSxJQUNkLENBQUMsQ0FBQztBQUFBLEVBQ0osQ0FBQztBQUdELFlBQVUsT0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLEdBQUcsRUFBRSxRQUFRLFNBQVMsU0FBUyxTQUFTLE1BQU07QUFDL0UsUUFBSSxnQkFBZ0IsbUJBQW1CLFVBQVU7QUFDakQsUUFBSSxnQkFBZ0IsY0FBYyxJQUFJLGNBQWMsS0FBSztBQUN6RCxRQUFJLGNBQWM7QUFBQSxNQUNoQjtBQUFBO0FBQUEsTUFFQSxHQUFHLG9CQUFvQjtBQUFBLElBQ3pCO0FBQ0EsT0FBRyxjQUFjLENBQUM7QUFDbEIsT0FBRyxZQUFZLENBQUM7QUFDaEIsWUFBUSxNQUFNLEtBQUssSUFBSSxlQUFlLGVBQWUsV0FBVyxDQUFDO0FBQ2pFLGFBQVMsTUFBTTtBQUNiLGFBQU8sT0FBTyxHQUFHLFNBQVMsRUFBRSxRQUFRLENBQUMsUUFBUTtBQUFBLFFBQzNDLE1BQU07QUFDSixzQkFBWSxHQUFHO0FBQ2YsY0FBSSxPQUFPO0FBQUEsUUFDYjtBQUFBLE1BQ0YsQ0FBQztBQUNELGFBQU8sR0FBRztBQUNWLGFBQU8sR0FBRztBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUNELFdBQVMsS0FBSyxJQUFJLGVBQWUsZUFBZSxhQUFhO0FBQzNELFFBQUksWUFBWSxDQUFDLE1BQU0sT0FBTyxNQUFNLFlBQVksQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUNoRSxRQUFJLGFBQWE7QUFDakIsa0JBQWMsQ0FBQyxVQUFVO0FBQ3ZCLFVBQUksV0FBVyxLQUFLLEtBQUssU0FBUyxHQUFHO0FBQ25DLGdCQUFRLE1BQU0sS0FBSyxNQUFNLEtBQUssRUFBRSxLQUFLLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQztBQUFBLE1BQ3REO0FBQ0EsVUFBSSxVQUFVO0FBQ1osZ0JBQVEsQ0FBQztBQUNYLFVBQUksU0FBUyxHQUFHO0FBQ2hCLFVBQUksV0FBVyxHQUFHO0FBQ2xCLFVBQUksU0FBUyxDQUFDO0FBQ2QsVUFBSSxPQUFPLENBQUM7QUFDWixVQUFJLFVBQVUsS0FBSyxHQUFHO0FBQ3BCLGdCQUFRLE9BQU8sUUFBUSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU07QUFDbEQsY0FBSSxTQUFTLDJCQUEyQixlQUFlLE9BQU8sS0FBSyxLQUFLO0FBQ3hFLHNCQUFZLENBQUMsV0FBVztBQUN0QixnQkFBSSxLQUFLLFNBQVMsTUFBTTtBQUN0QixtQkFBSywwQkFBMEIsRUFBRTtBQUNuQyxpQkFBSyxLQUFLLE1BQU07QUFBQSxVQUNsQixHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sS0FBSyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3ZDLGlCQUFPLEtBQUssTUFBTTtBQUFBLFFBQ3BCLENBQUM7QUFBQSxNQUNILE9BQU87QUFDTCxpQkFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxjQUFJLFNBQVMsMkJBQTJCLGVBQWUsTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLO0FBQ3pFLHNCQUFZLENBQUMsVUFBVTtBQUNyQixnQkFBSSxLQUFLLFNBQVMsS0FBSztBQUNyQixtQkFBSywwQkFBMEIsRUFBRTtBQUNuQyxpQkFBSyxLQUFLLEtBQUs7QUFBQSxVQUNqQixHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ3JDLGlCQUFPLEtBQUssTUFBTTtBQUFBLFFBQ3BCO0FBQUEsTUFDRjtBQUNBLFVBQUksT0FBTyxDQUFDO0FBQ1osVUFBSSxRQUFRLENBQUM7QUFDYixVQUFJLFVBQVUsQ0FBQztBQUNmLFVBQUksUUFBUSxDQUFDO0FBQ2IsZUFBUyxJQUFJLEdBQUcsSUFBSSxTQUFTLFFBQVEsS0FBSztBQUN4QyxZQUFJLE1BQU0sU0FBUyxDQUFDO0FBQ3BCLFlBQUksS0FBSyxRQUFRLEdBQUcsTUFBTTtBQUN4QixrQkFBUSxLQUFLLEdBQUc7QUFBQSxNQUNwQjtBQUNBLGlCQUFXLFNBQVMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLFNBQVMsR0FBRyxDQUFDO0FBQzFELFVBQUksVUFBVTtBQUNkLGVBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBSSxNQUFNLEtBQUssQ0FBQztBQUNoQixZQUFJLFlBQVksU0FBUyxRQUFRLEdBQUc7QUFDcEMsWUFBSSxjQUFjLElBQUk7QUFDcEIsbUJBQVMsT0FBTyxHQUFHLEdBQUcsR0FBRztBQUN6QixlQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUFBLFFBQ3hCLFdBQVcsY0FBYyxHQUFHO0FBQzFCLGNBQUksWUFBWSxTQUFTLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN2QyxjQUFJLGFBQWEsU0FBUyxPQUFPLFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwRCxtQkFBUyxPQUFPLEdBQUcsR0FBRyxVQUFVO0FBQ2hDLG1CQUFTLE9BQU8sV0FBVyxHQUFHLFNBQVM7QUFDdkMsZ0JBQU0sS0FBSyxDQUFDLFdBQVcsVUFBVSxDQUFDO0FBQUEsUUFDcEMsT0FBTztBQUNMLGdCQUFNLEtBQUssR0FBRztBQUFBLFFBQ2hCO0FBQ0Esa0JBQVU7QUFBQSxNQUNaO0FBQ0EsZUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLFFBQVEsS0FBSztBQUN2QyxZQUFJLE1BQU0sUUFBUSxDQUFDO0FBQ25CLFlBQUksRUFBRSxPQUFPO0FBQ1g7QUFDRixrQkFBVSxNQUFNO0FBQ2Qsc0JBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsaUJBQU8sR0FBRyxFQUFFLE9BQU87QUFBQSxRQUNyQixDQUFDO0FBQ0QsZUFBTyxPQUFPLEdBQUc7QUFBQSxNQUNuQjtBQUNBLGVBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDckMsWUFBSSxDQUFDLFdBQVcsVUFBVSxJQUFJLE1BQU0sQ0FBQztBQUNyQyxZQUFJLFdBQVcsT0FBTyxTQUFTO0FBQy9CLFlBQUksWUFBWSxPQUFPLFVBQVU7QUFDakMsWUFBSSxTQUFTLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLGtCQUFVLE1BQU07QUFDZCxjQUFJLENBQUM7QUFDSCxpQkFBSyx3Q0FBd0MsWUFBWSxZQUFZLE1BQU07QUFDN0Usb0JBQVUsTUFBTSxNQUFNO0FBQ3RCLG1CQUFTLE1BQU0sU0FBUztBQUN4QixvQkFBVSxrQkFBa0IsVUFBVSxNQUFNLFVBQVUsY0FBYztBQUNwRSxpQkFBTyxPQUFPLFFBQVE7QUFDdEIsbUJBQVMsa0JBQWtCLFNBQVMsTUFBTSxTQUFTLGNBQWM7QUFDakUsaUJBQU8sT0FBTztBQUFBLFFBQ2hCLENBQUM7QUFDRCxrQkFBVSxvQkFBb0IsT0FBTyxLQUFLLFFBQVEsVUFBVSxDQUFDLENBQUM7QUFBQSxNQUNoRTtBQUNBLGVBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEtBQUssQ0FBQztBQUM5QixZQUFJLFNBQVMsYUFBYSxhQUFhLGFBQWEsT0FBTyxRQUFRO0FBQ25FLFlBQUksT0FBTztBQUNULG1CQUFTLE9BQU87QUFDbEIsWUFBSSxTQUFTLE9BQU8sS0FBSztBQUN6QixZQUFJLE1BQU0sS0FBSyxLQUFLO0FBQ3BCLFlBQUksU0FBUyxTQUFTLFdBQVcsV0FBVyxTQUFTLElBQUksRUFBRTtBQUMzRCxZQUFJLGdCQUFnQixTQUFTLE1BQU07QUFDbkMsdUJBQWUsUUFBUSxlQUFlLFVBQVU7QUFDaEQsZUFBTyxzQkFBc0IsQ0FBQyxhQUFhO0FBQ3pDLGlCQUFPLFFBQVEsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNO0FBQ2xELDBCQUFjLElBQUksSUFBSTtBQUFBLFVBQ3hCLENBQUM7QUFBQSxRQUNIO0FBQ0Esa0JBQVUsTUFBTTtBQUNkLGlCQUFPLE1BQU0sTUFBTTtBQUNuQiwwQkFBZ0IsTUFBTSxTQUFTLE1BQU0sQ0FBQyxFQUFFO0FBQUEsUUFDMUMsQ0FBQztBQUNELFlBQUksT0FBTyxRQUFRLFVBQVU7QUFDM0IsZUFBSyxvRUFBb0UsVUFBVTtBQUFBLFFBQ3JGO0FBQ0EsZUFBTyxHQUFHLElBQUk7QUFBQSxNQUNoQjtBQUNBLGVBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDckMsZUFBTyxNQUFNLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixPQUFPLEtBQUssUUFBUSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFBQSxNQUNyRTtBQUNBLGlCQUFXLGNBQWM7QUFBQSxJQUMzQixDQUFDO0FBQUEsRUFDSDtBQUNBLFdBQVMsbUJBQW1CLFlBQVk7QUFDdEMsUUFBSSxnQkFBZ0I7QUFDcEIsUUFBSSxnQkFBZ0I7QUFDcEIsUUFBSSxhQUFhO0FBQ2pCLFFBQUksVUFBVSxXQUFXLE1BQU0sVUFBVTtBQUN6QyxRQUFJLENBQUM7QUFDSDtBQUNGLFFBQUksTUFBTSxDQUFDO0FBQ1gsUUFBSSxRQUFRLFFBQVEsQ0FBQyxFQUFFLEtBQUs7QUFDNUIsUUFBSSxPQUFPLFFBQVEsQ0FBQyxFQUFFLFFBQVEsZUFBZSxFQUFFLEVBQUUsS0FBSztBQUN0RCxRQUFJLGdCQUFnQixLQUFLLE1BQU0sYUFBYTtBQUM1QyxRQUFJLGVBQWU7QUFDakIsVUFBSSxPQUFPLEtBQUssUUFBUSxlQUFlLEVBQUUsRUFBRSxLQUFLO0FBQ2hELFVBQUksUUFBUSxjQUFjLENBQUMsRUFBRSxLQUFLO0FBQ2xDLFVBQUksY0FBYyxDQUFDLEdBQUc7QUFDcEIsWUFBSSxhQUFhLGNBQWMsQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUN6QztBQUFBLElBQ0YsT0FBTztBQUNMLFVBQUksT0FBTztBQUFBLElBQ2I7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsMkJBQTJCLGVBQWUsTUFBTSxPQUFPLE9BQU87QUFDckUsUUFBSSxpQkFBaUIsQ0FBQztBQUN0QixRQUFJLFdBQVcsS0FBSyxjQUFjLElBQUksS0FBSyxNQUFNLFFBQVEsSUFBSSxHQUFHO0FBQzlELFVBQUksUUFBUSxjQUFjLEtBQUssUUFBUSxLQUFLLEVBQUUsRUFBRSxRQUFRLEtBQUssRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO0FBQy9GLFlBQU0sUUFBUSxDQUFDLE1BQU0sTUFBTTtBQUN6Qix1QkFBZSxJQUFJLElBQUksS0FBSyxDQUFDO0FBQUEsTUFDL0IsQ0FBQztBQUFBLElBQ0gsV0FBVyxXQUFXLEtBQUssY0FBYyxJQUFJLEtBQUssQ0FBQyxNQUFNLFFBQVEsSUFBSSxLQUFLLE9BQU8sU0FBUyxVQUFVO0FBQ2xHLFVBQUksUUFBUSxjQUFjLEtBQUssUUFBUSxLQUFLLEVBQUUsRUFBRSxRQUFRLEtBQUssRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO0FBQy9GLFlBQU0sUUFBUSxDQUFDLFNBQVM7QUFDdEIsdUJBQWUsSUFBSSxJQUFJLEtBQUssSUFBSTtBQUFBLE1BQ2xDLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxxQkFBZSxjQUFjLElBQUksSUFBSTtBQUFBLElBQ3ZDO0FBQ0EsUUFBSSxjQUFjO0FBQ2hCLHFCQUFlLGNBQWMsS0FBSyxJQUFJO0FBQ3hDLFFBQUksY0FBYztBQUNoQixxQkFBZSxjQUFjLFVBQVUsSUFBSTtBQUM3QyxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsV0FBVyxTQUFTO0FBQzNCLFdBQU8sQ0FBQyxNQUFNLFFBQVEsT0FBTyxLQUFLLENBQUMsTUFBTSxPQUFPO0FBQUEsRUFDbEQ7QUFHQSxXQUFTLFdBQVc7QUFBQSxFQUNwQjtBQUNBLFdBQVMsU0FBUyxDQUFDLElBQUksRUFBRSxXQUFXLEdBQUcsRUFBRSxTQUFTLFNBQVMsTUFBTTtBQUMvRCxRQUFJLE9BQU8sWUFBWSxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxLQUFLO0FBQ1IsV0FBSyxVQUFVLENBQUM7QUFDbEIsU0FBSyxRQUFRLFVBQVUsSUFBSTtBQUMzQixhQUFTLE1BQU0sT0FBTyxLQUFLLFFBQVEsVUFBVSxDQUFDO0FBQUEsRUFDaEQ7QUFDQSxZQUFVLE9BQU8sUUFBUTtBQUd6QixZQUFVLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxHQUFHLEVBQUUsUUFBUSxTQUFTLFNBQVMsU0FBUyxNQUFNO0FBQzlFLFFBQUksR0FBRyxRQUFRLFlBQVksTUFBTTtBQUMvQixXQUFLLDZDQUE2QyxFQUFFO0FBQ3RELFFBQUksWUFBWSxjQUFjLElBQUksVUFBVTtBQUM1QyxRQUFJLE9BQU8sTUFBTTtBQUNmLFVBQUksR0FBRztBQUNMLGVBQU8sR0FBRztBQUNaLFVBQUksU0FBUyxHQUFHLFFBQVEsVUFBVSxJQUFJLEVBQUU7QUFDeEMscUJBQWUsUUFBUSxDQUFDLEdBQUcsRUFBRTtBQUM3QixnQkFBVSxNQUFNO0FBQ2QsV0FBRyxNQUFNLE1BQU07QUFDZix3QkFBZ0IsTUFBTSxTQUFTLE1BQU0sQ0FBQyxFQUFFO0FBQUEsTUFDMUMsQ0FBQztBQUNELFNBQUcsaUJBQWlCO0FBQ3BCLFNBQUcsWUFBWSxNQUFNO0FBQ25CLGtCQUFVLE1BQU07QUFDZCxzQkFBWSxNQUFNO0FBQ2xCLGlCQUFPLE9BQU87QUFBQSxRQUNoQixDQUFDO0FBQ0QsZUFBTyxHQUFHO0FBQUEsTUFDWjtBQUNBLGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxPQUFPLE1BQU07QUFDZixVQUFJLENBQUMsR0FBRztBQUNOO0FBQ0YsU0FBRyxVQUFVO0FBQ2IsYUFBTyxHQUFHO0FBQUEsSUFDWjtBQUNBLFlBQVEsTUFBTSxVQUFVLENBQUMsVUFBVTtBQUNqQyxjQUFRLEtBQUssSUFBSSxLQUFLO0FBQUEsSUFDeEIsQ0FBQyxDQUFDO0FBQ0YsYUFBUyxNQUFNLEdBQUcsYUFBYSxHQUFHLFVBQVUsQ0FBQztBQUFBLEVBQy9DLENBQUM7QUFHRCxZQUFVLE1BQU0sQ0FBQyxJQUFJLEVBQUUsV0FBVyxHQUFHLEVBQUUsVUFBVSxVQUFVLE1BQU07QUFDL0QsUUFBSSxRQUFRLFVBQVUsVUFBVTtBQUNoQyxVQUFNLFFBQVEsQ0FBQyxTQUFTLFVBQVUsSUFBSSxJQUFJLENBQUM7QUFBQSxFQUM3QyxDQUFDO0FBQ0QsaUJBQWUsQ0FBQyxNQUFNLE9BQU87QUFDM0IsUUFBSSxLQUFLLFFBQVE7QUFDZixTQUFHLFNBQVMsS0FBSztBQUFBLElBQ25CO0FBQUEsRUFDRixDQUFDO0FBR0QsZ0JBQWMsYUFBYSxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFlBQVUsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxXQUFXLFdBQVcsR0FBRyxFQUFFLFNBQVMsU0FBUyxNQUFNO0FBQy9GLFFBQUksWUFBWSxhQUFhLGNBQWMsSUFBSSxVQUFVLElBQUksTUFBTTtBQUFBLElBQ25FO0FBQ0EsUUFBSSxHQUFHLFFBQVEsWUFBWSxNQUFNLFlBQVk7QUFDM0MsVUFBSSxDQUFDLEdBQUc7QUFDTixXQUFHLG1CQUFtQixDQUFDO0FBQ3pCLFVBQUksQ0FBQyxHQUFHLGlCQUFpQixTQUFTLEtBQUs7QUFDckMsV0FBRyxpQkFBaUIsS0FBSyxLQUFLO0FBQUEsSUFDbEM7QUFDQSxRQUFJLGlCQUFpQixHQUFHLElBQUksT0FBTyxXQUFXLENBQUMsTUFBTTtBQUNuRCxnQkFBVSxNQUFNO0FBQUEsTUFDaEIsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFBQSxJQUM1QyxDQUFDO0FBQ0QsYUFBUyxNQUFNLGVBQWUsQ0FBQztBQUFBLEVBQ2pDLENBQUMsQ0FBQztBQUdGLDZCQUEyQixZQUFZLFlBQVksVUFBVTtBQUM3RCw2QkFBMkIsYUFBYSxhQUFhLFdBQVc7QUFDaEUsNkJBQTJCLFNBQVMsUUFBUSxPQUFPO0FBQ25ELDZCQUEyQixRQUFRLFFBQVEsTUFBTTtBQUNqRCxXQUFTLDJCQUEyQixNQUFNLGVBQWUsTUFBTTtBQUM3RCxjQUFVLGVBQWUsQ0FBQyxPQUFPLEtBQUssb0JBQW9CLGFBQWEsbUNBQW1DLElBQUksK0NBQStDLElBQUksSUFBSSxFQUFFLENBQUM7QUFBQSxFQUMxSztBQUdBLGlCQUFlLGFBQWEsWUFBWTtBQUN4QyxpQkFBZSxvQkFBb0IsRUFBRSxVQUFVLFdBQVcsUUFBUSxTQUFTLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUN0RyxNQUFJLGNBQWM7QUFHbEIsTUFBSSxpQkFBaUI7OztBQzNsSXJCLFdBQVNDLGFBQVlDLFNBQVE7QUFDM0IsUUFBSSxVQUFVLE1BQU07QUFDbEIsVUFBSTtBQUNKLFVBQUk7QUFDSixVQUFJO0FBQ0Ysa0JBQVU7QUFBQSxNQUNaLFNBQVMsR0FBRztBQUNWLGdCQUFRLE1BQU0sQ0FBQztBQUNmLGdCQUFRLEtBQUssZ0ZBQWdGO0FBQzdGLFlBQUksUUFBd0Isb0JBQUksSUFBSTtBQUNwQyxrQkFBVTtBQUFBLFVBQ1IsU0FBUyxNQUFNLElBQUksS0FBSyxLQUFLO0FBQUEsVUFDN0IsU0FBUyxNQUFNLElBQUksS0FBSyxLQUFLO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBQ0EsYUFBT0EsUUFBTyxZQUFZLENBQUMsY0FBYyxRQUFRLFFBQVEsTUFBTSxRQUFRO0FBQ3JFLFlBQUksU0FBUyxTQUFTLE1BQU0sSUFBSTtBQUNoQyxZQUFJLFVBQVUsV0FBVyxRQUFRLE9BQU8sSUFBSSxXQUFXLFFBQVEsT0FBTyxJQUFJO0FBQzFFLGVBQU8sT0FBTztBQUNkLFFBQUFBLFFBQU8sT0FBTyxNQUFNO0FBQ2xCLGNBQUksUUFBUSxPQUFPO0FBQ25CLHFCQUFXLFFBQVEsT0FBTyxPQUFPO0FBQ2pDLGlCQUFPLEtBQUs7QUFBQSxRQUNkLENBQUM7QUFDRCxlQUFPO0FBQUEsTUFDVCxHQUFHLENBQUMsU0FBUztBQUNYLGFBQUssS0FBSyxDQUFDLFFBQVE7QUFDakIsa0JBQVE7QUFDUixpQkFBTztBQUFBLFFBQ1QsR0FBRyxLQUFLLFFBQVEsQ0FBQyxXQUFXO0FBQzFCLG9CQUFVO0FBQ1YsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUNBLFdBQU8sZUFBZUEsU0FBUSxZQUFZLEVBQUUsS0FBSyxNQUFNLFFBQVEsRUFBRSxDQUFDO0FBQ2xFLElBQUFBLFFBQU8sTUFBTSxXQUFXLE9BQU87QUFDL0IsSUFBQUEsUUFBTyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUFDLE1BQUssS0FBQUMsS0FBSSxHQUFHLFVBQVUsaUJBQWlCO0FBQzlELFVBQUksVUFBVSxXQUFXLEtBQUssT0FBTyxJQUFJLFdBQVcsS0FBSyxPQUFPLElBQUlELEtBQUk7QUFDeEUsTUFBQUMsS0FBSSxPQUFPO0FBQ1gsTUFBQUYsUUFBTyxPQUFPLE1BQU07QUFDbEIsWUFBSSxRQUFRQyxLQUFJO0FBQ2hCLG1CQUFXLEtBQUssT0FBTyxPQUFPO0FBQzlCLFFBQUFDLEtBQUksS0FBSztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0EsV0FBUyxXQUFXLEtBQUssU0FBUztBQUNoQyxXQUFPLFFBQVEsUUFBUSxHQUFHLE1BQU07QUFBQSxFQUNsQztBQUNBLFdBQVMsV0FBVyxLQUFLLFNBQVM7QUFDaEMsUUFBSSxRQUFRLFFBQVEsUUFBUSxHQUFHO0FBQy9CLFFBQUksVUFBVTtBQUNaO0FBQ0YsV0FBTyxLQUFLLE1BQU0sS0FBSztBQUFBLEVBQ3pCO0FBQ0EsV0FBUyxXQUFXLEtBQUssT0FBTyxTQUFTO0FBQ3ZDLFlBQVEsUUFBUSxLQUFLLEtBQUssVUFBVSxLQUFLLENBQUM7QUFBQSxFQUM1QztBQUdBLE1BQUlDLGtCQUFpQko7OztBQzdEckIsV0FBU0ssYUFBWUMsU0FBUTtBQUMzQixJQUFBQSxRQUFPLFVBQVUsYUFBYUEsUUFBTyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxZQUFZLFVBQVUsR0FBRyxFQUFFLGVBQUFDLGdCQUFlLFNBQUFDLFNBQVEsTUFBTTtBQUN6SCxVQUFJQyxZQUFXRixlQUFjLFVBQVU7QUFDdkMsVUFBSSxVQUFVO0FBQUEsUUFDWixZQUFZLGNBQWMsU0FBUztBQUFBLFFBQ25DLFdBQVcsYUFBYSxTQUFTO0FBQUEsTUFDbkM7QUFDQSxVQUFJRyxZQUFXLElBQUkscUJBQXFCLENBQUMsWUFBWTtBQUNuRCxnQkFBUSxRQUFRLENBQUMsVUFBVTtBQUN6QixjQUFJLE1BQU0sb0JBQW9CLFVBQVU7QUFDdEM7QUFDRixVQUFBRCxVQUFTO0FBQ1Qsb0JBQVUsU0FBUyxNQUFNLEtBQUtDLFVBQVMsV0FBVztBQUFBLFFBQ3BELENBQUM7QUFBQSxNQUNILEdBQUcsT0FBTztBQUNWLE1BQUFBLFVBQVMsUUFBUSxFQUFFO0FBQ25CLE1BQUFGLFNBQVEsTUFBTTtBQUNaLFFBQUFFLFVBQVMsV0FBVztBQUFBLE1BQ3RCLENBQUM7QUFBQSxJQUNILENBQUMsQ0FBQztBQUFBLEVBQ0o7QUFDQSxXQUFTLGFBQWEsV0FBVztBQUMvQixRQUFJLFVBQVUsU0FBUyxNQUFNO0FBQzNCLGFBQU87QUFDVCxRQUFJLFVBQVUsU0FBUyxNQUFNO0FBQzNCLGFBQU87QUFDVCxRQUFJLENBQUMsVUFBVSxTQUFTLFdBQVc7QUFDakMsYUFBTztBQUNULFFBQUksWUFBWSxVQUFVLFVBQVUsUUFBUSxXQUFXLElBQUksQ0FBQztBQUM1RCxRQUFJLGNBQWM7QUFDaEIsYUFBTztBQUNULFFBQUksY0FBYztBQUNoQixhQUFPO0FBQ1QsV0FBTyxPQUFPLElBQUksU0FBUyxFQUFFO0FBQUEsRUFDL0I7QUFDQSxXQUFTLGVBQWUsVUFBVTtBQUNoQyxRQUFJLFFBQVEsU0FBUyxNQUFNLHFCQUFxQjtBQUNoRCxXQUFPLFFBQVEsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDLEtBQUssUUFBUTtBQUFBLEVBQ2pEO0FBQ0EsV0FBUyxjQUFjLFdBQVc7QUFDaEMsVUFBTSxNQUFNO0FBQ1osVUFBTSxXQUFXO0FBQ2pCLFVBQU0sUUFBUSxVQUFVLFFBQVEsR0FBRztBQUNuQyxRQUFJLFVBQVU7QUFDWixhQUFPO0FBQ1QsUUFBSSxTQUFTLENBQUM7QUFDZCxhQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSztBQUMxQixhQUFPLEtBQUssZUFBZSxVQUFVLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUFBLElBQ3hEO0FBQ0EsYUFBUyxPQUFPLE9BQU8sQ0FBQyxNQUFNLE1BQU0sTUFBTTtBQUMxQyxXQUFPLE9BQU8sU0FBUyxPQUFPLEtBQUssR0FBRyxFQUFFLEtBQUssSUFBSTtBQUFBLEVBQ25EO0FBR0EsTUFBSUMsa0JBQWlCTjs7O0FDdERyQixNQUFJLHFCQUFxQixDQUFDLFNBQVMsVUFBVSxZQUFZLFdBQVcsVUFBVSx3QkFBd0IsbUJBQW1CLG1CQUFtQixvREFBb0QsaUNBQWlDLFNBQVM7QUFDMU8sTUFBSSxvQkFBb0MsbUNBQW1CLEtBQUssR0FBRztBQUNuRSxNQUFJLFlBQVksT0FBTyxZQUFZO0FBQ25DLE1BQUksVUFBVSxZQUFZLFdBQVc7QUFBQSxFQUNyQyxJQUFJLFFBQVEsVUFBVSxXQUFXLFFBQVEsVUFBVSxxQkFBcUIsUUFBUSxVQUFVO0FBQzFGLE1BQUksY0FBYyxDQUFDLGFBQWEsUUFBUSxVQUFVLGNBQWMsU0FBUyxTQUFTO0FBQ2hGLFdBQU8sUUFBUSxZQUFZO0FBQUEsRUFDN0IsSUFBSSxTQUFTLFNBQVM7QUFDcEIsV0FBTyxRQUFRO0FBQUEsRUFDakI7QUFDQSxNQUFJLGdCQUFnQixTQUFTLGVBQWUsSUFBSSxrQkFBa0IsUUFBUTtBQUN4RSxRQUFJLGFBQWEsTUFBTSxVQUFVLE1BQU0sTUFBTSxHQUFHLGlCQUFpQixpQkFBaUIsQ0FBQztBQUNuRixRQUFJLG9CQUFvQixRQUFRLEtBQUssSUFBSSxpQkFBaUIsR0FBRztBQUMzRCxpQkFBVyxRQUFRLEVBQUU7QUFBQSxJQUN2QjtBQUNBLGlCQUFhLFdBQVcsT0FBTyxNQUFNO0FBQ3JDLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSwyQkFBMkIsU0FBUywwQkFBMEIsVUFBVSxrQkFBa0IsU0FBUztBQUNyRyxRQUFJLGFBQWEsQ0FBQztBQUNsQixRQUFJLGtCQUFrQixNQUFNLEtBQUssUUFBUTtBQUN6QyxXQUFPLGdCQUFnQixRQUFRO0FBQzdCLFVBQUksVUFBVSxnQkFBZ0IsTUFBTTtBQUNwQyxVQUFJLFFBQVEsWUFBWSxRQUFRO0FBQzlCLFlBQUksV0FBVyxRQUFRLGlCQUFpQjtBQUN4QyxZQUFJLFVBQVUsU0FBUyxTQUFTLFdBQVcsUUFBUTtBQUNuRCxZQUFJLG1CQUFtQiwwQkFBMEIsU0FBUyxNQUFNLE9BQU87QUFDdkUsWUFBSSxRQUFRLFNBQVM7QUFDbkIscUJBQVcsS0FBSyxNQUFNLFlBQVksZ0JBQWdCO0FBQUEsUUFDcEQsT0FBTztBQUNMLHFCQUFXLEtBQUs7QUFBQSxZQUNkLE9BQU87QUFBQSxZQUNQLFlBQVk7QUFBQSxVQUNkLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRixPQUFPO0FBQ0wsWUFBSSxpQkFBaUIsUUFBUSxLQUFLLFNBQVMsaUJBQWlCO0FBQzVELFlBQUksa0JBQWtCLFFBQVEsT0FBTyxPQUFPLE1BQU0sb0JBQW9CLENBQUMsU0FBUyxTQUFTLE9BQU8sSUFBSTtBQUNsRyxxQkFBVyxLQUFLLE9BQU87QUFBQSxRQUN6QjtBQUNBLFlBQUksYUFBYSxRQUFRO0FBQUEsUUFDekIsT0FBTyxRQUFRLGtCQUFrQixjQUFjLFFBQVEsY0FBYyxPQUFPO0FBQzVFLFlBQUksa0JBQWtCLENBQUMsUUFBUSxvQkFBb0IsUUFBUSxpQkFBaUIsT0FBTztBQUNuRixZQUFJLGNBQWMsaUJBQWlCO0FBQ2pDLGNBQUksb0JBQW9CLDBCQUEwQixlQUFlLE9BQU8sUUFBUSxXQUFXLFdBQVcsVUFBVSxNQUFNLE9BQU87QUFDN0gsY0FBSSxRQUFRLFNBQVM7QUFDbkIsdUJBQVcsS0FBSyxNQUFNLFlBQVksaUJBQWlCO0FBQUEsVUFDckQsT0FBTztBQUNMLHVCQUFXLEtBQUs7QUFBQSxjQUNkLE9BQU87QUFBQSxjQUNQLFlBQVk7QUFBQSxZQUNkLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRixPQUFPO0FBQ0wsMEJBQWdCLFFBQVEsTUFBTSxpQkFBaUIsUUFBUSxRQUFRO0FBQUEsUUFDakU7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxjQUFjLFNBQVMsYUFBYSxNQUFNLFNBQVM7QUFDckQsUUFBSSxLQUFLLFdBQVcsR0FBRztBQUNyQixXQUFLLFdBQVcsMEJBQTBCLEtBQUssS0FBSyxPQUFPLEtBQUssS0FBSyxzQkFBc0IsTUFBTSxTQUFTLEtBQUssYUFBYSxVQUFVLEdBQUcsRUFBRSxDQUFDLEdBQUc7QUFDN0ksZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQ0EsV0FBTyxLQUFLO0FBQUEsRUFDZDtBQUNBLE1BQUksdUJBQXVCLFNBQVMsc0JBQXNCLEdBQUcsR0FBRztBQUM5RCxXQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUU7QUFBQSxFQUN4RjtBQUNBLE1BQUksVUFBVSxTQUFTLFNBQVMsTUFBTTtBQUNwQyxXQUFPLEtBQUssWUFBWTtBQUFBLEVBQzFCO0FBQ0EsTUFBSSxnQkFBZ0IsU0FBUyxlQUFlLE1BQU07QUFDaEQsV0FBTyxRQUFRLElBQUksS0FBSyxLQUFLLFNBQVM7QUFBQSxFQUN4QztBQUNBLE1BQUksdUJBQXVCLFNBQVMsc0JBQXNCLE1BQU07QUFDOUQsUUFBSSxJQUFJLEtBQUssWUFBWSxhQUFhLE1BQU0sVUFBVSxNQUFNLE1BQU0sS0FBSyxRQUFRLEVBQUUsS0FBSyxTQUFTLE9BQU87QUFDcEcsYUFBTyxNQUFNLFlBQVk7QUFBQSxJQUMzQixDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLGtCQUFrQixTQUFTLGlCQUFpQixPQUFPLE1BQU07QUFDM0QsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxVQUFJLE1BQU0sQ0FBQyxFQUFFLFdBQVcsTUFBTSxDQUFDLEVBQUUsU0FBUyxNQUFNO0FBQzlDLGVBQU8sTUFBTSxDQUFDO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksa0JBQWtCLFNBQVMsaUJBQWlCLE1BQU07QUFDcEQsUUFBSSxDQUFDLEtBQUssTUFBTTtBQUNkLGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxhQUFhLEtBQUssUUFBUSxZQUFZLElBQUk7QUFDOUMsUUFBSSxjQUFjLFNBQVMsYUFBYSxNQUFNO0FBQzVDLGFBQU8sV0FBVyxpQkFBaUIsK0JBQStCLE9BQU8sSUFBSTtBQUFBLElBQy9FO0FBQ0EsUUFBSTtBQUNKLFFBQUksT0FBTyxXQUFXLGVBQWUsT0FBTyxPQUFPLFFBQVEsZUFBZSxPQUFPLE9BQU8sSUFBSSxXQUFXLFlBQVk7QUFDakgsaUJBQVcsWUFBWSxPQUFPLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQztBQUFBLElBQ3JELE9BQU87QUFDTCxVQUFJO0FBQ0YsbUJBQVcsWUFBWSxLQUFLLElBQUk7QUFBQSxNQUNsQyxTQUFTLEtBQUs7QUFDWixnQkFBUSxNQUFNLDRJQUE0SSxJQUFJLE9BQU87QUFDckssZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQ0EsUUFBSSxVQUFVLGdCQUFnQixVQUFVLEtBQUssSUFBSTtBQUNqRCxXQUFPLENBQUMsV0FBVyxZQUFZO0FBQUEsRUFDakM7QUFDQSxNQUFJTyxXQUFVLFNBQVNDLFVBQVMsTUFBTTtBQUNwQyxXQUFPLFFBQVEsSUFBSSxLQUFLLEtBQUssU0FBUztBQUFBLEVBQ3hDO0FBQ0EsTUFBSSxxQkFBcUIsU0FBUyxvQkFBb0IsTUFBTTtBQUMxRCxXQUFPRCxTQUFRLElBQUksS0FBSyxDQUFDLGdCQUFnQixJQUFJO0FBQUEsRUFDL0M7QUFDQSxNQUFJLGFBQWEsU0FBUyxZQUFZLE1BQU07QUFDMUMsUUFBSSx3QkFBd0IsS0FBSyxzQkFBc0IsR0FBRyxRQUFRLHNCQUFzQixPQUFPLFNBQVMsc0JBQXNCO0FBQzlILFdBQU8sVUFBVSxLQUFLLFdBQVc7QUFBQSxFQUNuQztBQUNBLE1BQUksV0FBVyxTQUFTLFVBQVUsTUFBTSxNQUFNO0FBQzVDLFFBQUksZUFBZSxLQUFLLGNBQWMsZ0JBQWdCLEtBQUs7QUFDM0QsUUFBSSxpQkFBaUIsSUFBSSxFQUFFLGVBQWUsVUFBVTtBQUNsRCxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksa0JBQWtCLFFBQVEsS0FBSyxNQUFNLCtCQUErQjtBQUN4RSxRQUFJLG1CQUFtQixrQkFBa0IsS0FBSyxnQkFBZ0I7QUFDOUQsUUFBSSxRQUFRLEtBQUssa0JBQWtCLHVCQUF1QixHQUFHO0FBQzNELGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxlQUFlLFlBQVksSUFBSSxFQUFFO0FBQ3JDLFFBQUksa0JBQWtCLGlCQUFpQixRQUFRLGlCQUFpQixTQUFTLFNBQVMsYUFBYSxjQUFjLFNBQVMsWUFBWSxNQUFNLEtBQUssY0FBYyxTQUFTLElBQUk7QUFDeEssUUFBSSxDQUFDLGdCQUFnQixpQkFBaUIsUUFBUTtBQUM1QyxVQUFJLE9BQU8sa0JBQWtCLFlBQVk7QUFDdkMsWUFBSSxlQUFlO0FBQ25CLGVBQU8sTUFBTTtBQUNYLGNBQUksZ0JBQWdCLEtBQUs7QUFDekIsY0FBSSxXQUFXLFlBQVksSUFBSTtBQUMvQixjQUFJLGlCQUFpQixDQUFDLGNBQWMsY0FBYyxjQUFjLGFBQWEsTUFBTSxNQUFNO0FBQ3ZGLG1CQUFPLFdBQVcsSUFBSTtBQUFBLFVBQ3hCLFdBQVcsS0FBSyxjQUFjO0FBQzVCLG1CQUFPLEtBQUs7QUFBQSxVQUNkLFdBQVcsQ0FBQyxpQkFBaUIsYUFBYSxLQUFLLGVBQWU7QUFDNUQsbUJBQU8sU0FBUztBQUFBLFVBQ2xCLE9BQU87QUFDTCxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFDQSxVQUFJLGdCQUFnQjtBQUNsQixlQUFPLENBQUMsS0FBSyxlQUFlLEVBQUU7QUFBQSxNQUNoQztBQUFBLElBQ0YsV0FBVyxpQkFBaUIsaUJBQWlCO0FBQzNDLGFBQU8sV0FBVyxJQUFJO0FBQUEsSUFDeEI7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUkseUJBQXlCLFNBQVMsd0JBQXdCLE1BQU07QUFDbEUsUUFBSSxtQ0FBbUMsS0FBSyxLQUFLLE9BQU8sR0FBRztBQUN6RCxVQUFJLGFBQWEsS0FBSztBQUN0QixhQUFPLFlBQVk7QUFDakIsWUFBSSxXQUFXLFlBQVksY0FBYyxXQUFXLFVBQVU7QUFDNUQsbUJBQVMsSUFBSSxHQUFHLElBQUksV0FBVyxTQUFTLFFBQVEsS0FBSztBQUNuRCxnQkFBSSxRQUFRLFdBQVcsU0FBUyxLQUFLLENBQUM7QUFDdEMsZ0JBQUksTUFBTSxZQUFZLFVBQVU7QUFDOUIscUJBQU8sUUFBUSxLQUFLLFlBQVksc0JBQXNCLElBQUksT0FBTyxDQUFDLE1BQU0sU0FBUyxJQUFJO0FBQUEsWUFDdkY7QUFBQSxVQUNGO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQ0EscUJBQWEsV0FBVztBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxrQ0FBa0MsU0FBUyxpQ0FBaUMsU0FBUyxNQUFNO0FBQzdGLFFBQUksS0FBSyxZQUFZLGNBQWMsSUFBSSxLQUFLLFNBQVMsTUFBTSxPQUFPO0FBQUEsSUFDbEUscUJBQXFCLElBQUksS0FBSyx1QkFBdUIsSUFBSSxHQUFHO0FBQzFELGFBQU87QUFBQSxJQUNUO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLGlDQUFpQyxTQUFTLGdDQUFnQyxTQUFTLE1BQU07QUFDM0YsUUFBSSxtQkFBbUIsSUFBSSxLQUFLLFlBQVksSUFBSSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsU0FBUyxJQUFJLEdBQUc7QUFDeEcsYUFBTztBQUFBLElBQ1Q7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksNEJBQTRCLFNBQVMsMkJBQTJCLGdCQUFnQjtBQUNsRixRQUFJLFdBQVcsU0FBUyxlQUFlLGFBQWEsVUFBVSxHQUFHLEVBQUU7QUFDbkUsUUFBSSxNQUFNLFFBQVEsS0FBSyxZQUFZLEdBQUc7QUFDcEMsYUFBTztBQUFBLElBQ1Q7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksY0FBYyxTQUFTLGFBQWEsWUFBWTtBQUNsRCxRQUFJLG1CQUFtQixDQUFDO0FBQ3hCLFFBQUksbUJBQW1CLENBQUM7QUFDeEIsZUFBVyxRQUFRLFNBQVMsTUFBTSxHQUFHO0FBQ25DLFVBQUksVUFBVSxDQUFDLENBQUMsS0FBSztBQUNyQixVQUFJLFVBQVUsVUFBVSxLQUFLLFFBQVE7QUFDckMsVUFBSSxvQkFBb0IsWUFBWSxTQUFTLE9BQU87QUFDcEQsVUFBSSxXQUFXLFVBQVUsYUFBYSxLQUFLLFVBQVUsSUFBSTtBQUN6RCxVQUFJLHNCQUFzQixHQUFHO0FBQzNCLGtCQUFVLGlCQUFpQixLQUFLLE1BQU0sa0JBQWtCLFFBQVEsSUFBSSxpQkFBaUIsS0FBSyxPQUFPO0FBQUEsTUFDbkcsT0FBTztBQUNMLHlCQUFpQixLQUFLO0FBQUEsVUFDcEIsZUFBZTtBQUFBLFVBQ2YsVUFBVTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsVUFDQSxTQUFTO0FBQUEsUUFDWCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUNELFdBQU8saUJBQWlCLEtBQUssb0JBQW9CLEVBQUUsT0FBTyxTQUFTLEtBQUssVUFBVTtBQUNoRixlQUFTLFVBQVUsSUFBSSxLQUFLLE1BQU0sS0FBSyxTQUFTLE9BQU8sSUFBSSxJQUFJLEtBQUssU0FBUyxPQUFPO0FBQ3BGLGFBQU87QUFBQSxJQUNULEdBQUcsQ0FBQyxDQUFDLEVBQUUsT0FBTyxnQkFBZ0I7QUFBQSxFQUNoQztBQUNBLE1BQUksV0FBVyxTQUFTLFVBQVUsSUFBSSxTQUFTO0FBQzdDLGNBQVUsV0FBVyxDQUFDO0FBQ3RCLFFBQUk7QUFDSixRQUFJLFFBQVEsZUFBZTtBQUN6QixtQkFBYSx5QkFBeUIsQ0FBQyxFQUFFLEdBQUcsUUFBUSxrQkFBa0I7QUFBQSxRQUNwRSxRQUFRLCtCQUErQixLQUFLLE1BQU0sT0FBTztBQUFBLFFBQ3pELFNBQVM7QUFBQSxRQUNULGVBQWUsUUFBUTtBQUFBLFFBQ3ZCLGtCQUFrQjtBQUFBLE1BQ3BCLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxtQkFBYSxjQUFjLElBQUksUUFBUSxrQkFBa0IsK0JBQStCLEtBQUssTUFBTSxPQUFPLENBQUM7QUFBQSxJQUM3RztBQUNBLFdBQU8sWUFBWSxVQUFVO0FBQUEsRUFDL0I7QUFDQSxNQUFJLFlBQVksU0FBUyxXQUFXLElBQUksU0FBUztBQUMvQyxjQUFVLFdBQVcsQ0FBQztBQUN0QixRQUFJO0FBQ0osUUFBSSxRQUFRLGVBQWU7QUFDekIsbUJBQWEseUJBQXlCLENBQUMsRUFBRSxHQUFHLFFBQVEsa0JBQWtCO0FBQUEsUUFDcEUsUUFBUSxnQ0FBZ0MsS0FBSyxNQUFNLE9BQU87QUFBQSxRQUMxRCxTQUFTO0FBQUEsUUFDVCxlQUFlLFFBQVE7QUFBQSxNQUN6QixDQUFDO0FBQUEsSUFDSCxPQUFPO0FBQ0wsbUJBQWEsY0FBYyxJQUFJLFFBQVEsa0JBQWtCLGdDQUFnQyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQUEsSUFDOUc7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksYUFBYSxTQUFTLFlBQVksTUFBTSxTQUFTO0FBQ25ELGNBQVUsV0FBVyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxNQUFNO0FBQ1QsWUFBTSxJQUFJLE1BQU0sa0JBQWtCO0FBQUEsSUFDcEM7QUFDQSxRQUFJLFFBQVEsS0FBSyxNQUFNLGlCQUFpQixNQUFNLE9BQU87QUFDbkQsYUFBTztBQUFBLElBQ1Q7QUFDQSxXQUFPLCtCQUErQixTQUFTLElBQUk7QUFBQSxFQUNyRDtBQUNBLE1BQUksNkJBQTZDLG1DQUFtQixPQUFPLFFBQVEsRUFBRSxLQUFLLEdBQUc7QUFDN0YsTUFBSSxjQUFjLFNBQVMsYUFBYSxNQUFNLFNBQVM7QUFDckQsY0FBVSxXQUFXLENBQUM7QUFDdEIsUUFBSSxDQUFDLE1BQU07QUFDVCxZQUFNLElBQUksTUFBTSxrQkFBa0I7QUFBQSxJQUNwQztBQUNBLFFBQUksUUFBUSxLQUFLLE1BQU0sMEJBQTBCLE1BQU0sT0FBTztBQUM1RCxhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU8sZ0NBQWdDLFNBQVMsSUFBSTtBQUFBLEVBQ3REO0FBR0EsV0FBU0UsU0FBUSxRQUFRLGdCQUFnQjtBQUN2QyxRQUFJLE9BQU8sT0FBTyxLQUFLLE1BQU07QUFDN0IsUUFBSSxPQUFPLHVCQUF1QjtBQUNoQyxVQUFJLFVBQVUsT0FBTyxzQkFBc0IsTUFBTTtBQUNqRCx5QkFBbUIsVUFBVSxRQUFRLE9BQU8sU0FBUyxLQUFLO0FBQ3hELGVBQU8sT0FBTyx5QkFBeUIsUUFBUSxHQUFHLEVBQUU7QUFBQSxNQUN0RCxDQUFDLElBQUksS0FBSyxLQUFLLE1BQU0sTUFBTSxPQUFPO0FBQUEsSUFDcEM7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLFdBQVMsZUFBZSxRQUFRO0FBQzlCLGFBQVMsSUFBSSxHQUFHLElBQUksVUFBVSxRQUFRLEtBQUs7QUFDekMsVUFBSSxTQUFTLFFBQVEsVUFBVSxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQztBQUNwRCxVQUFJLElBQUlBLFNBQVEsT0FBTyxNQUFNLEdBQUcsSUFBSSxFQUFFLFFBQVEsU0FBUyxLQUFLO0FBQzFELHdCQUFnQixRQUFRLEtBQUssT0FBTyxHQUFHLENBQUM7QUFBQSxNQUMxQyxDQUFDLElBQUksT0FBTyw0QkFBNEIsT0FBTyxpQkFBaUIsUUFBUSxPQUFPLDBCQUEwQixNQUFNLENBQUMsSUFBSUEsU0FBUSxPQUFPLE1BQU0sQ0FBQyxFQUFFLFFBQVEsU0FBUyxLQUFLO0FBQ2hLLGVBQU8sZUFBZSxRQUFRLEtBQUssT0FBTyx5QkFBeUIsUUFBUSxHQUFHLENBQUM7QUFBQSxNQUNqRixDQUFDO0FBQUEsSUFDSDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQ0EsV0FBUyxnQkFBZ0IsS0FBSyxLQUFLLE9BQU87QUFDeEMsUUFBSSxPQUFPLEtBQUs7QUFDZCxhQUFPLGVBQWUsS0FBSyxLQUFLO0FBQUEsUUFDOUI7QUFBQSxRQUNBLFlBQVk7QUFBQSxRQUNaLGNBQWM7QUFBQSxRQUNkLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNILE9BQU87QUFDTCxVQUFJLEdBQUcsSUFBSTtBQUFBLElBQ2I7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksbUJBQW1CLDRCQUFXO0FBQ2hDLFFBQUksWUFBWSxDQUFDO0FBQ2pCLFdBQU87QUFBQSxNQUNMLGNBQWMsU0FBUyxhQUFhLE1BQU07QUFDeEMsWUFBSSxVQUFVLFNBQVMsR0FBRztBQUN4QixjQUFJLGFBQWEsVUFBVSxVQUFVLFNBQVMsQ0FBQztBQUMvQyxjQUFJLGVBQWUsTUFBTTtBQUN2Qix1QkFBVyxNQUFNO0FBQUEsVUFDbkI7QUFBQSxRQUNGO0FBQ0EsWUFBSSxZQUFZLFVBQVUsUUFBUSxJQUFJO0FBQ3RDLFlBQUksY0FBYyxJQUFJO0FBQ3BCLG9CQUFVLEtBQUssSUFBSTtBQUFBLFFBQ3JCLE9BQU87QUFDTCxvQkFBVSxPQUFPLFdBQVcsQ0FBQztBQUM3QixvQkFBVSxLQUFLLElBQUk7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLGdCQUFnQixTQUFTLGVBQWUsTUFBTTtBQUM1QyxZQUFJLFlBQVksVUFBVSxRQUFRLElBQUk7QUFDdEMsWUFBSSxjQUFjLElBQUk7QUFDcEIsb0JBQVUsT0FBTyxXQUFXLENBQUM7QUFBQSxRQUMvQjtBQUNBLFlBQUksVUFBVSxTQUFTLEdBQUc7QUFDeEIsb0JBQVUsVUFBVSxTQUFTLENBQUMsRUFBRSxRQUFRO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsR0FBRTtBQUNGLE1BQUksb0JBQW9CLFNBQVMsbUJBQW1CLE1BQU07QUFDeEQsV0FBTyxLQUFLLFdBQVcsS0FBSyxRQUFRLFlBQVksTUFBTSxXQUFXLE9BQU8sS0FBSyxXQUFXO0FBQUEsRUFDMUY7QUFDQSxNQUFJLGdCQUFnQixTQUFTLGVBQWUsR0FBRztBQUM3QyxXQUFPLEVBQUUsUUFBUSxZQUFZLEVBQUUsUUFBUSxTQUFTLEVBQUUsWUFBWTtBQUFBLEVBQ2hFO0FBQ0EsTUFBSSxhQUFhLFNBQVMsWUFBWSxHQUFHO0FBQ3ZDLFdBQU8sRUFBRSxRQUFRLFNBQVMsRUFBRSxZQUFZO0FBQUEsRUFDMUM7QUFDQSxNQUFJLFFBQVEsU0FBUyxPQUFPLElBQUk7QUFDOUIsV0FBTyxXQUFXLElBQUksQ0FBQztBQUFBLEVBQ3pCO0FBQ0EsTUFBSSxZQUFZLFNBQVMsV0FBVyxLQUFLLElBQUk7QUFDM0MsUUFBSSxNQUFNO0FBQ1YsUUFBSSxNQUFNLFNBQVMsT0FBTyxHQUFHO0FBQzNCLFVBQUksR0FBRyxLQUFLLEdBQUc7QUFDYixjQUFNO0FBQ04sZUFBTztBQUFBLE1BQ1Q7QUFDQSxhQUFPO0FBQUEsSUFDVCxDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLGlCQUFpQixTQUFTLGdCQUFnQixPQUFPO0FBQ25ELGFBQVMsT0FBTyxVQUFVLFFBQVEsU0FBUyxJQUFJLE1BQU0sT0FBTyxJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLE9BQU8sTUFBTSxRQUFRO0FBQzVHLGFBQU8sT0FBTyxDQUFDLElBQUksVUFBVSxJQUFJO0FBQUEsSUFDbkM7QUFDQSxXQUFPLE9BQU8sVUFBVSxhQUFhLE1BQU0sTUFBTSxRQUFRLE1BQU0sSUFBSTtBQUFBLEVBQ3JFO0FBQ0EsTUFBSSxrQkFBa0IsU0FBUyxpQkFBaUIsT0FBTztBQUNyRCxXQUFPLE1BQU0sT0FBTyxjQUFjLE9BQU8sTUFBTSxpQkFBaUIsYUFBYSxNQUFNLGFBQWEsRUFBRSxDQUFDLElBQUksTUFBTTtBQUFBLEVBQy9HO0FBQ0EsTUFBSSxrQkFBa0IsU0FBUyxpQkFBaUIsVUFBVSxhQUFhO0FBQ3JFLFFBQUksT0FBTyxnQkFBZ0IsUUFBUSxnQkFBZ0IsU0FBUyxTQUFTLFlBQVksYUFBYTtBQUM5RixRQUFJLFNBQVMsZUFBZTtBQUFBLE1BQzFCLHlCQUF5QjtBQUFBLE1BQ3pCLG1CQUFtQjtBQUFBLE1BQ25CLG1CQUFtQjtBQUFBLElBQ3JCLEdBQUcsV0FBVztBQUNkLFFBQUksUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUdWLFlBQVksQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFjYixpQkFBaUIsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU1sQixnQkFBZ0IsQ0FBQztBQUFBLE1BQ2pCLDZCQUE2QjtBQUFBLE1BQzdCLHlCQUF5QjtBQUFBLE1BQ3pCLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFHUix3QkFBd0I7QUFBQSxJQUMxQjtBQUNBLFFBQUk7QUFDSixRQUFJLFlBQVksU0FBUyxXQUFXLHVCQUF1QixZQUFZLGtCQUFrQjtBQUN2RixhQUFPLHlCQUF5QixzQkFBc0IsVUFBVSxNQUFNLFNBQVMsc0JBQXNCLFVBQVUsSUFBSSxPQUFPLG9CQUFvQixVQUFVO0FBQUEsSUFDMUo7QUFDQSxRQUFJLHFCQUFxQixTQUFTLG9CQUFvQixTQUFTO0FBQzdELGFBQU8sTUFBTSxnQkFBZ0IsVUFBVSxTQUFTLE1BQU07QUFDcEQsWUFBSSxZQUFZLEtBQUssV0FBVyxnQkFBZ0IsS0FBSztBQUNyRCxlQUFPLFVBQVUsU0FBUyxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFJakMsY0FBYyxLQUFLLFNBQVMsTUFBTTtBQUNoQyxpQkFBTyxTQUFTO0FBQUEsUUFDbEIsQ0FBQztBQUFBLE1BQ0gsQ0FBQztBQUFBLElBQ0g7QUFDQSxRQUFJLG1CQUFtQixTQUFTLGtCQUFrQixZQUFZO0FBQzVELFVBQUksY0FBYyxPQUFPLFVBQVU7QUFDbkMsVUFBSSxPQUFPLGdCQUFnQixZQUFZO0FBQ3JDLGlCQUFTLFFBQVEsVUFBVSxRQUFRLFNBQVMsSUFBSSxNQUFNLFFBQVEsSUFBSSxRQUFRLElBQUksQ0FBQyxHQUFHLFFBQVEsR0FBRyxRQUFRLE9BQU8sU0FBUztBQUNuSCxpQkFBTyxRQUFRLENBQUMsSUFBSSxVQUFVLEtBQUs7QUFBQSxRQUNyQztBQUNBLHNCQUFjLFlBQVksTUFBTSxRQUFRLE1BQU07QUFBQSxNQUNoRDtBQUNBLFVBQUksZ0JBQWdCLE1BQU07QUFDeEIsc0JBQWM7QUFBQSxNQUNoQjtBQUNBLFVBQUksQ0FBQyxhQUFhO0FBQ2hCLFlBQUksZ0JBQWdCLFVBQVUsZ0JBQWdCLE9BQU87QUFDbkQsaUJBQU87QUFBQSxRQUNUO0FBQ0EsY0FBTSxJQUFJLE1BQU0sSUFBSSxPQUFPLFlBQVksOERBQThELENBQUM7QUFBQSxNQUN4RztBQUNBLFVBQUksT0FBTztBQUNYLFVBQUksT0FBTyxnQkFBZ0IsVUFBVTtBQUNuQyxlQUFPLElBQUksY0FBYyxXQUFXO0FBQ3BDLFlBQUksQ0FBQyxNQUFNO0FBQ1QsZ0JBQU0sSUFBSSxNQUFNLElBQUksT0FBTyxZQUFZLHVDQUF1QyxDQUFDO0FBQUEsUUFDakY7QUFBQSxNQUNGO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFDQSxRQUFJLHNCQUFzQixTQUFTLHVCQUF1QjtBQUN4RCxVQUFJLE9BQU8saUJBQWlCLGNBQWM7QUFDMUMsVUFBSSxTQUFTLE9BQU87QUFDbEIsZUFBTztBQUFBLE1BQ1Q7QUFDQSxVQUFJLFNBQVMsUUFBUTtBQUNuQixZQUFJLG1CQUFtQixJQUFJLGFBQWEsS0FBSyxHQUFHO0FBQzlDLGlCQUFPLElBQUk7QUFBQSxRQUNiLE9BQU87QUFDTCxjQUFJLHFCQUFxQixNQUFNLGVBQWUsQ0FBQztBQUMvQyxjQUFJLG9CQUFvQixzQkFBc0IsbUJBQW1CO0FBQ2pFLGlCQUFPLHFCQUFxQixpQkFBaUIsZUFBZTtBQUFBLFFBQzlEO0FBQUEsTUFDRjtBQUNBLFVBQUksQ0FBQyxNQUFNO0FBQ1QsY0FBTSxJQUFJLE1BQU0sOERBQThEO0FBQUEsTUFDaEY7QUFDQSxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksc0JBQXNCLFNBQVMsdUJBQXVCO0FBQ3hELFlBQU0sa0JBQWtCLE1BQU0sV0FBVyxJQUFJLFNBQVMsV0FBVztBQUMvRCxZQUFJLGdCQUFnQixTQUFTLFdBQVcsT0FBTyxlQUFlO0FBQzlELFlBQUksaUJBQWlCLFVBQVUsV0FBVyxPQUFPLGVBQWU7QUFDaEUsZUFBTztBQUFBLFVBQ0w7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsbUJBQW1CLGNBQWMsU0FBUyxJQUFJLGNBQWMsQ0FBQyxJQUFJO0FBQUEsVUFDakUsa0JBQWtCLGNBQWMsU0FBUyxJQUFJLGNBQWMsY0FBYyxTQUFTLENBQUMsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQVN2RixrQkFBa0IsU0FBUyxpQkFBaUIsTUFBTTtBQUNoRCxnQkFBSSxVQUFVLFVBQVUsU0FBUyxLQUFLLFVBQVUsQ0FBQyxNQUFNLFNBQVMsVUFBVSxDQUFDLElBQUk7QUFDL0UsZ0JBQUksVUFBVSxlQUFlLFVBQVUsU0FBUyxHQUFHO0FBQ2pELHFCQUFPLE1BQU07QUFBQSxZQUNmLENBQUM7QUFDRCxnQkFBSSxVQUFVLEdBQUc7QUFDZixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxTQUFTO0FBQ1gscUJBQU8sZUFBZSxNQUFNLFVBQVUsQ0FBQyxFQUFFLEtBQUssU0FBUyxHQUFHO0FBQ3hELHVCQUFPLFdBQVcsR0FBRyxPQUFPLGVBQWU7QUFBQSxjQUM3QyxDQUFDO0FBQUEsWUFDSDtBQUNBLG1CQUFPLGVBQWUsTUFBTSxHQUFHLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxTQUFTLEdBQUc7QUFDakUscUJBQU8sV0FBVyxHQUFHLE9BQU8sZUFBZTtBQUFBLFlBQzdDLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUNELFlBQU0saUJBQWlCLE1BQU0sZ0JBQWdCLE9BQU8sU0FBUyxPQUFPO0FBQ2xFLGVBQU8sTUFBTSxjQUFjLFNBQVM7QUFBQSxNQUN0QyxDQUFDO0FBQ0QsVUFBSSxNQUFNLGVBQWUsVUFBVSxLQUFLLENBQUMsaUJBQWlCLGVBQWUsR0FBRztBQUMxRSxjQUFNLElBQUksTUFBTSxxR0FBcUc7QUFBQSxNQUN2SDtBQUFBLElBQ0Y7QUFDQSxRQUFJLFdBQVcsU0FBUyxVQUFVLE1BQU07QUFDdEMsVUFBSSxTQUFTLE9BQU87QUFDbEI7QUFBQSxNQUNGO0FBQ0EsVUFBSSxTQUFTLElBQUksZUFBZTtBQUM5QjtBQUFBLE1BQ0Y7QUFDQSxVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssT0FBTztBQUN4QixrQkFBVSxvQkFBb0IsQ0FBQztBQUMvQjtBQUFBLE1BQ0Y7QUFDQSxXQUFLLE1BQU07QUFBQSxRQUNULGVBQWUsQ0FBQyxDQUFDLE9BQU87QUFBQSxNQUMxQixDQUFDO0FBQ0QsWUFBTSwwQkFBMEI7QUFDaEMsVUFBSSxrQkFBa0IsSUFBSSxHQUFHO0FBQzNCLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQ0EsUUFBSSxxQkFBcUIsU0FBUyxvQkFBb0IsdUJBQXVCO0FBQzNFLFVBQUksT0FBTyxpQkFBaUIsa0JBQWtCLHFCQUFxQjtBQUNuRSxhQUFPLE9BQU8sT0FBTyxTQUFTLFFBQVEsUUFBUTtBQUFBLElBQ2hEO0FBQ0EsUUFBSSxtQkFBbUIsU0FBUyxrQkFBa0IsR0FBRztBQUNuRCxVQUFJLFNBQVMsZ0JBQWdCLENBQUM7QUFDOUIsVUFBSSxtQkFBbUIsTUFBTSxLQUFLLEdBQUc7QUFDbkM7QUFBQSxNQUNGO0FBQ0EsVUFBSSxlQUFlLE9BQU8seUJBQXlCLENBQUMsR0FBRztBQUNyRCxhQUFLLFdBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFZZCxhQUFhLE9BQU8sMkJBQTJCLENBQUMsWUFBWSxRQUFRLE9BQU8sZUFBZTtBQUFBLFFBQzVGLENBQUM7QUFDRDtBQUFBLE1BQ0Y7QUFDQSxVQUFJLGVBQWUsT0FBTyxtQkFBbUIsQ0FBQyxHQUFHO0FBQy9DO0FBQUEsTUFDRjtBQUNBLFFBQUUsZUFBZTtBQUFBLElBQ25CO0FBQ0EsUUFBSSxlQUFlLFNBQVMsY0FBYyxHQUFHO0FBQzNDLFVBQUksU0FBUyxnQkFBZ0IsQ0FBQztBQUM5QixVQUFJLGtCQUFrQixtQkFBbUIsTUFBTSxLQUFLO0FBQ3BELFVBQUksbUJBQW1CLGtCQUFrQixVQUFVO0FBQ2pELFlBQUksaUJBQWlCO0FBQ25CLGdCQUFNLDBCQUEwQjtBQUFBLFFBQ2xDO0FBQUEsTUFDRixPQUFPO0FBQ0wsVUFBRSx5QkFBeUI7QUFDM0IsaUJBQVMsTUFBTSwyQkFBMkIsb0JBQW9CLENBQUM7QUFBQSxNQUNqRTtBQUFBLElBQ0Y7QUFDQSxRQUFJLFdBQVcsU0FBUyxVQUFVLEdBQUc7QUFDbkMsVUFBSSxTQUFTLGdCQUFnQixDQUFDO0FBQzlCLDBCQUFvQjtBQUNwQixVQUFJLGtCQUFrQjtBQUN0QixVQUFJLE1BQU0sZUFBZSxTQUFTLEdBQUc7QUFDbkMsWUFBSSxpQkFBaUIsbUJBQW1CLE1BQU07QUFDOUMsWUFBSSxpQkFBaUIsa0JBQWtCLElBQUksTUFBTSxnQkFBZ0IsY0FBYyxJQUFJO0FBQ25GLFlBQUksaUJBQWlCLEdBQUc7QUFDdEIsY0FBSSxFQUFFLFVBQVU7QUFDZCw4QkFBa0IsTUFBTSxlQUFlLE1BQU0sZUFBZSxTQUFTLENBQUMsRUFBRTtBQUFBLFVBQzFFLE9BQU87QUFDTCw4QkFBa0IsTUFBTSxlQUFlLENBQUMsRUFBRTtBQUFBLFVBQzVDO0FBQUEsUUFDRixXQUFXLEVBQUUsVUFBVTtBQUNyQixjQUFJLG9CQUFvQixVQUFVLE1BQU0sZ0JBQWdCLFNBQVMsT0FBTztBQUN0RSxnQkFBSSxvQkFBb0IsTUFBTTtBQUM5QixtQkFBTyxXQUFXO0FBQUEsVUFDcEIsQ0FBQztBQUNELGNBQUksb0JBQW9CLE1BQU0sZUFBZSxjQUFjLFVBQVUsWUFBWSxRQUFRLE9BQU8sZUFBZSxLQUFLLENBQUMsV0FBVyxRQUFRLE9BQU8sZUFBZSxLQUFLLENBQUMsZUFBZSxpQkFBaUIsUUFBUSxLQUFLLElBQUk7QUFDbk4sZ0NBQW9CO0FBQUEsVUFDdEI7QUFDQSxjQUFJLHFCQUFxQixHQUFHO0FBQzFCLGdCQUFJLHdCQUF3QixzQkFBc0IsSUFBSSxNQUFNLGVBQWUsU0FBUyxJQUFJLG9CQUFvQjtBQUM1RyxnQkFBSSxtQkFBbUIsTUFBTSxlQUFlLHFCQUFxQjtBQUNqRSw4QkFBa0IsaUJBQWlCO0FBQUEsVUFDckM7QUFBQSxRQUNGLE9BQU87QUFDTCxjQUFJLG1CQUFtQixVQUFVLE1BQU0sZ0JBQWdCLFNBQVMsT0FBTztBQUNyRSxnQkFBSSxtQkFBbUIsTUFBTTtBQUM3QixtQkFBTyxXQUFXO0FBQUEsVUFDcEIsQ0FBQztBQUNELGNBQUksbUJBQW1CLE1BQU0sZUFBZSxjQUFjLFVBQVUsWUFBWSxRQUFRLE9BQU8sZUFBZSxLQUFLLENBQUMsV0FBVyxRQUFRLE9BQU8sZUFBZSxLQUFLLENBQUMsZUFBZSxpQkFBaUIsTUFBTSxJQUFJO0FBQzNNLCtCQUFtQjtBQUFBLFVBQ3JCO0FBQ0EsY0FBSSxvQkFBb0IsR0FBRztBQUN6QixnQkFBSSx5QkFBeUIscUJBQXFCLE1BQU0sZUFBZSxTQUFTLElBQUksSUFBSSxtQkFBbUI7QUFDM0csZ0JBQUksb0JBQW9CLE1BQU0sZUFBZSxzQkFBc0I7QUFDbkUsOEJBQWtCLGtCQUFrQjtBQUFBLFVBQ3RDO0FBQUEsUUFDRjtBQUFBLE1BQ0YsT0FBTztBQUNMLDBCQUFrQixpQkFBaUIsZUFBZTtBQUFBLE1BQ3BEO0FBQ0EsVUFBSSxpQkFBaUI7QUFDbkIsVUFBRSxlQUFlO0FBQ2pCLGlCQUFTLGVBQWU7QUFBQSxNQUMxQjtBQUFBLElBQ0Y7QUFDQSxRQUFJLFdBQVcsU0FBUyxVQUFVLEdBQUc7QUFDbkMsVUFBSSxjQUFjLENBQUMsS0FBSyxlQUFlLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxPQUFPO0FBQzdFLFVBQUUsZUFBZTtBQUNqQixhQUFLLFdBQVc7QUFDaEI7QUFBQSxNQUNGO0FBQ0EsVUFBSSxXQUFXLENBQUMsR0FBRztBQUNqQixpQkFBUyxDQUFDO0FBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLFFBQUksYUFBYSxTQUFTLFlBQVksR0FBRztBQUN2QyxVQUFJLFNBQVMsZ0JBQWdCLENBQUM7QUFDOUIsVUFBSSxtQkFBbUIsTUFBTSxLQUFLLEdBQUc7QUFDbkM7QUFBQSxNQUNGO0FBQ0EsVUFBSSxlQUFlLE9BQU8seUJBQXlCLENBQUMsR0FBRztBQUNyRDtBQUFBLE1BQ0Y7QUFDQSxVQUFJLGVBQWUsT0FBTyxtQkFBbUIsQ0FBQyxHQUFHO0FBQy9DO0FBQUEsTUFDRjtBQUNBLFFBQUUsZUFBZTtBQUNqQixRQUFFLHlCQUF5QjtBQUFBLElBQzdCO0FBQ0EsUUFBSSxlQUFlLFNBQVMsZ0JBQWdCO0FBQzFDLFVBQUksQ0FBQyxNQUFNLFFBQVE7QUFDakI7QUFBQSxNQUNGO0FBQ0EsdUJBQWlCLGFBQWEsSUFBSTtBQUNsQyxZQUFNLHlCQUF5QixPQUFPLG9CQUFvQixNQUFNLFdBQVc7QUFDekUsaUJBQVMsb0JBQW9CLENBQUM7QUFBQSxNQUNoQyxDQUFDLElBQUksU0FBUyxvQkFBb0IsQ0FBQztBQUNuQyxVQUFJLGlCQUFpQixXQUFXLGNBQWMsSUFBSTtBQUNsRCxVQUFJLGlCQUFpQixhQUFhLGtCQUFrQjtBQUFBLFFBQ2xELFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxNQUNYLENBQUM7QUFDRCxVQUFJLGlCQUFpQixjQUFjLGtCQUFrQjtBQUFBLFFBQ25ELFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxNQUNYLENBQUM7QUFDRCxVQUFJLGlCQUFpQixTQUFTLFlBQVk7QUFBQSxRQUN4QyxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsTUFDWCxDQUFDO0FBQ0QsVUFBSSxpQkFBaUIsV0FBVyxVQUFVO0FBQUEsUUFDeEMsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNUO0FBQ0EsUUFBSSxrQkFBa0IsU0FBUyxtQkFBbUI7QUFDaEQsVUFBSSxDQUFDLE1BQU0sUUFBUTtBQUNqQjtBQUFBLE1BQ0Y7QUFDQSxVQUFJLG9CQUFvQixXQUFXLGNBQWMsSUFBSTtBQUNyRCxVQUFJLG9CQUFvQixhQUFhLGtCQUFrQixJQUFJO0FBQzNELFVBQUksb0JBQW9CLGNBQWMsa0JBQWtCLElBQUk7QUFDNUQsVUFBSSxvQkFBb0IsU0FBUyxZQUFZLElBQUk7QUFDakQsVUFBSSxvQkFBb0IsV0FBVyxVQUFVLElBQUk7QUFDakQsYUFBTztBQUFBLElBQ1Q7QUFDQSxXQUFPO0FBQUEsTUFDTCxJQUFJLFNBQVM7QUFDWCxlQUFPLE1BQU07QUFBQSxNQUNmO0FBQUEsTUFDQSxJQUFJLFNBQVM7QUFDWCxlQUFPLE1BQU07QUFBQSxNQUNmO0FBQUEsTUFDQSxVQUFVLFNBQVMsU0FBUyxpQkFBaUI7QUFDM0MsWUFBSSxNQUFNLFFBQVE7QUFDaEIsaUJBQU87QUFBQSxRQUNUO0FBQ0EsWUFBSSxhQUFhLFVBQVUsaUJBQWlCLFlBQVk7QUFDeEQsWUFBSSxpQkFBaUIsVUFBVSxpQkFBaUIsZ0JBQWdCO0FBQ2hFLFlBQUksb0JBQW9CLFVBQVUsaUJBQWlCLG1CQUFtQjtBQUN0RSxZQUFJLENBQUMsbUJBQW1CO0FBQ3RCLDhCQUFvQjtBQUFBLFFBQ3RCO0FBQ0EsY0FBTSxTQUFTO0FBQ2YsY0FBTSxTQUFTO0FBQ2YsY0FBTSw4QkFBOEIsSUFBSTtBQUN4QyxZQUFJLFlBQVk7QUFDZCxxQkFBVztBQUFBLFFBQ2I7QUFDQSxZQUFJLG1CQUFtQixTQUFTLG9CQUFvQjtBQUNsRCxjQUFJLG1CQUFtQjtBQUNyQixnQ0FBb0I7QUFBQSxVQUN0QjtBQUNBLHVCQUFhO0FBQ2IsY0FBSSxnQkFBZ0I7QUFDbEIsMkJBQWU7QUFBQSxVQUNqQjtBQUFBLFFBQ0Y7QUFDQSxZQUFJLG1CQUFtQjtBQUNyQiw0QkFBa0IsTUFBTSxXQUFXLE9BQU8sQ0FBQyxFQUFFLEtBQUssa0JBQWtCLGdCQUFnQjtBQUNwRixpQkFBTztBQUFBLFFBQ1Q7QUFDQSx5QkFBaUI7QUFDakIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLFlBQVksU0FBUyxXQUFXLG1CQUFtQjtBQUNqRCxZQUFJLENBQUMsTUFBTSxRQUFRO0FBQ2pCLGlCQUFPO0FBQUEsUUFDVDtBQUNBLFlBQUksVUFBVSxlQUFlO0FBQUEsVUFDM0IsY0FBYyxPQUFPO0FBQUEsVUFDckIsa0JBQWtCLE9BQU87QUFBQSxVQUN6QixxQkFBcUIsT0FBTztBQUFBLFFBQzlCLEdBQUcsaUJBQWlCO0FBQ3BCLHFCQUFhLE1BQU0sc0JBQXNCO0FBQ3pDLGNBQU0seUJBQXlCO0FBQy9CLHdCQUFnQjtBQUNoQixjQUFNLFNBQVM7QUFDZixjQUFNLFNBQVM7QUFDZix5QkFBaUIsZUFBZSxJQUFJO0FBQ3BDLFlBQUksZUFBZSxVQUFVLFNBQVMsY0FBYztBQUNwRCxZQUFJLG1CQUFtQixVQUFVLFNBQVMsa0JBQWtCO0FBQzVELFlBQUksc0JBQXNCLFVBQVUsU0FBUyxxQkFBcUI7QUFDbEUsWUFBSSxjQUFjLFVBQVUsU0FBUyxlQUFlLHlCQUF5QjtBQUM3RSxZQUFJLGNBQWM7QUFDaEIsdUJBQWE7QUFBQSxRQUNmO0FBQ0EsWUFBSSxxQkFBcUIsU0FBUyxzQkFBc0I7QUFDdEQsZ0JBQU0sV0FBVztBQUNmLGdCQUFJLGFBQWE7QUFDZix1QkFBUyxtQkFBbUIsTUFBTSwyQkFBMkIsQ0FBQztBQUFBLFlBQ2hFO0FBQ0EsZ0JBQUksa0JBQWtCO0FBQ3BCLCtCQUFpQjtBQUFBLFlBQ25CO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUNBLFlBQUksZUFBZSxxQkFBcUI7QUFDdEMsOEJBQW9CLG1CQUFtQixNQUFNLDJCQUEyQixDQUFDLEVBQUUsS0FBSyxvQkFBb0Isa0JBQWtCO0FBQ3RILGlCQUFPO0FBQUEsUUFDVDtBQUNBLDJCQUFtQjtBQUNuQixlQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0EsT0FBTyxTQUFTLFFBQVE7QUFDdEIsWUFBSSxNQUFNLFVBQVUsQ0FBQyxNQUFNLFFBQVE7QUFDakMsaUJBQU87QUFBQSxRQUNUO0FBQ0EsY0FBTSxTQUFTO0FBQ2Ysd0JBQWdCO0FBQ2hCLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFDQSxTQUFTLFNBQVMsVUFBVTtBQUMxQixZQUFJLENBQUMsTUFBTSxVQUFVLENBQUMsTUFBTSxRQUFRO0FBQ2xDLGlCQUFPO0FBQUEsUUFDVDtBQUNBLGNBQU0sU0FBUztBQUNmLDRCQUFvQjtBQUNwQixxQkFBYTtBQUNiLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFDQSx5QkFBeUIsU0FBUyx3QkFBd0IsbUJBQW1CO0FBQzNFLFlBQUksa0JBQWtCLENBQUMsRUFBRSxPQUFPLGlCQUFpQixFQUFFLE9BQU8sT0FBTztBQUNqRSxjQUFNLGFBQWEsZ0JBQWdCLElBQUksU0FBUyxTQUFTO0FBQ3ZELGlCQUFPLE9BQU8sWUFBWSxXQUFXLElBQUksY0FBYyxPQUFPLElBQUk7QUFBQSxRQUNwRSxDQUFDO0FBQ0QsWUFBSSxNQUFNLFFBQVE7QUFDaEIsOEJBQW9CO0FBQUEsUUFDdEI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFDQSxTQUFLLHdCQUF3QixRQUFRO0FBQ3JDLFdBQU87QUFBQSxFQUNUO0FBR0EsV0FBU0MsYUFBWUMsU0FBUTtBQUMzQixRQUFJO0FBQ0osUUFBSTtBQUNKLFdBQU8saUJBQWlCLFdBQVcsTUFBTTtBQUN2QyxvQkFBYztBQUNkLHVCQUFpQixTQUFTO0FBQUEsSUFDNUIsQ0FBQztBQUNELElBQUFBLFFBQU8sTUFBTSxTQUFTLENBQUMsT0FBTztBQUM1QixVQUFJLFNBQVM7QUFDYixhQUFPO0FBQUEsUUFDTCxZQUFZO0FBQUEsUUFDWixjQUFjO0FBQUEsUUFDZCxPQUFPLEtBQUs7QUFDVixtQkFBUztBQUNULGlCQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsbUJBQW1CO0FBQ2pCLGVBQUssYUFBYTtBQUNsQixpQkFBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFdBQVc7QUFDVCxlQUFLLGFBQWE7QUFDbEIsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxpQkFBaUI7QUFDZixlQUFLLGVBQWU7QUFDcEIsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxPQUFPO0FBQ0wsaUJBQU8sS0FBSyxlQUFlO0FBQUEsUUFDN0I7QUFBQSxRQUNBLFVBQVUsS0FBSztBQUNiLGlCQUFPLFlBQVksR0FBRztBQUFBLFFBQ3hCO0FBQUEsUUFDQSxvQkFBb0I7QUFDbEIsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxjQUFjO0FBQ1osaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxVQUFVO0FBQ1IsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxhQUFhO0FBQ1gsY0FBSSxNQUFNLFFBQVEsTUFBTTtBQUN0QixtQkFBTztBQUNULGlCQUFPLFVBQVUsUUFBUSxFQUFFLGNBQWMsT0FBTyxDQUFDO0FBQUEsUUFDbkQ7QUFBQSxRQUNBLE1BQU07QUFDSixpQkFBTyxLQUFLLFdBQVc7QUFBQSxRQUN6QjtBQUFBLFFBQ0EsUUFBUSxLQUFLO0FBQ1gsY0FBSSxNQUFNLEtBQUssSUFBSTtBQUNuQixpQkFBTyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxXQUFXLEdBQUc7QUFBQSxRQUN4QztBQUFBLFFBQ0EsT0FBTyxLQUFLO0FBQ1YsY0FBSSxNQUFNLEtBQUssSUFBSTtBQUNuQixpQkFBTyxJQUFJLFVBQVUsSUFBSSxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxHQUFHO0FBQUEsUUFDdEQ7QUFBQSxRQUNBLFdBQVc7QUFDVCxpQkFBTyxLQUFLLElBQUksRUFBRSxDQUFDO0FBQUEsUUFDckI7QUFBQSxRQUNBLFVBQVU7QUFDUixpQkFBTyxLQUFLLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDO0FBQUEsUUFDL0I7QUFBQSxRQUNBLFVBQVU7QUFDUixjQUFJLE9BQU8sS0FBSyxJQUFJO0FBQ3BCLGNBQUksVUFBVSxTQUFTO0FBQ3ZCLGNBQUksS0FBSyxRQUFRLE9BQU8sTUFBTTtBQUM1QjtBQUNGLGNBQUksS0FBSyxnQkFBZ0IsS0FBSyxRQUFRLE9BQU8sTUFBTSxLQUFLLFNBQVMsR0FBRztBQUNsRSxtQkFBTyxLQUFLLENBQUM7QUFBQSxVQUNmO0FBQ0EsaUJBQU8sS0FBSyxLQUFLLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFBQSxRQUN2QztBQUFBLFFBQ0EsY0FBYztBQUNaLGNBQUksT0FBTyxLQUFLLElBQUk7QUFDcEIsY0FBSSxVQUFVLFNBQVM7QUFDdkIsY0FBSSxLQUFLLFFBQVEsT0FBTyxNQUFNO0FBQzVCO0FBQ0YsY0FBSSxLQUFLLGdCQUFnQixLQUFLLFFBQVEsT0FBTyxNQUFNLEdBQUc7QUFDcEQsbUJBQU8sS0FBSyxNQUFNLEVBQUUsRUFBRSxDQUFDO0FBQUEsVUFDekI7QUFDQSxpQkFBTyxLQUFLLEtBQUssUUFBUSxPQUFPLElBQUksQ0FBQztBQUFBLFFBQ3ZDO0FBQUEsUUFDQSxRQUFRO0FBQ04sZUFBSyxNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDNUI7QUFBQSxRQUNBLE9BQU87QUFDTCxlQUFLLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFBQSxRQUMzQjtBQUFBLFFBQ0EsT0FBTztBQUNMLGVBQUssTUFBTSxLQUFLLFFBQVEsQ0FBQztBQUFBLFFBQzNCO0FBQUEsUUFDQSxXQUFXO0FBQ1QsZUFBSyxNQUFNLEtBQUssWUFBWSxDQUFDO0FBQUEsUUFDL0I7QUFBQSxRQUNBLE9BQU87QUFDTCxpQkFBTyxLQUFLLFNBQVM7QUFBQSxRQUN2QjtBQUFBLFFBQ0EsTUFBTSxLQUFLO0FBQ1QsY0FBSSxDQUFDO0FBQ0g7QUFDRixxQkFBVyxNQUFNO0FBQ2YsZ0JBQUksQ0FBQyxJQUFJLGFBQWEsVUFBVTtBQUM5QixrQkFBSSxhQUFhLFlBQVksR0FBRztBQUNsQyxnQkFBSSxNQUFNLEVBQUUsZUFBZSxLQUFLLFdBQVcsQ0FBQztBQUFBLFVBQzlDLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUNELElBQUFBLFFBQU8sVUFBVSxRQUFRQSxRQUFPO0FBQUEsTUFDOUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxVQUFVLEdBQUcsRUFBRSxRQUFBQyxTQUFRLGVBQUFDLGdCQUFlLFNBQUFDLFNBQVEsTUFBTTtBQUNyRSxZQUFJLFlBQVlELGVBQWMsVUFBVTtBQUN4QyxZQUFJLFdBQVc7QUFDZixZQUFJLFVBQVU7QUFBQSxVQUNaLG1CQUFtQjtBQUFBLFVBQ25CLG1CQUFtQjtBQUFBLFVBQ25CLGVBQWUsTUFBTTtBQUFBLFFBQ3ZCO0FBQ0EsWUFBSSxZQUFZLE1BQU07QUFBQSxRQUN0QjtBQUNBLFlBQUksVUFBVSxTQUFTLGFBQWEsR0FBRztBQUNyQyxrQkFBUSxlQUFlO0FBQUEsUUFDekIsT0FBTztBQUNMLGNBQUksY0FBYyxHQUFHLGNBQWMsYUFBYTtBQUNoRCxjQUFJO0FBQ0Ysb0JBQVEsZUFBZTtBQUFBLFFBQzNCO0FBQ0EsWUFBSSxVQUFVLFNBQVMsT0FBTyxHQUFHO0FBQy9CLGtCQUFRLGlCQUFpQixNQUFNO0FBQzdCLFlBQUFGLFFBQU8sU0FBUyxNQUFNO0FBQ3BCLDBCQUFZLFNBQVMsRUFBRTtBQUFBLFlBQ3pCLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRjtBQUNBLFlBQUksT0FBTyxnQkFBZ0IsSUFBSSxPQUFPO0FBQ3RDLFlBQUksdUJBQXVCLE1BQU07QUFBQSxRQUNqQztBQUNBLGNBQU0sZUFBZSxNQUFNO0FBQ3pCLG9CQUFVO0FBQ1Ysc0JBQVksTUFBTTtBQUFBLFVBQ2xCO0FBQ0EsK0JBQXFCO0FBQ3JCLGlDQUF1QixNQUFNO0FBQUEsVUFDN0I7QUFDQSxlQUFLLFdBQVc7QUFBQSxZQUNkLGFBQWEsQ0FBQyxVQUFVLFNBQVMsVUFBVTtBQUFBLFVBQzdDLENBQUM7QUFBQSxRQUNIO0FBQ0EsUUFBQUMsUUFBTyxNQUFNLFVBQVUsQ0FBQyxVQUFVO0FBQ2hDLGNBQUksYUFBYTtBQUNmO0FBQ0YsY0FBSSxTQUFTLENBQUMsVUFBVTtBQUN0QixnQkFBSSxVQUFVLFNBQVMsVUFBVTtBQUMvQixxQ0FBdUIsaUJBQWlCO0FBQzFDLHVCQUFXLE1BQU07QUFDZixtQkFBSyxTQUFTO0FBQUEsWUFDaEIsR0FBRyxFQUFFO0FBQUEsVUFDUDtBQUNBLGNBQUksQ0FBQyxTQUFTLFVBQVU7QUFDdEIseUJBQWE7QUFBQSxVQUNmO0FBQ0EscUJBQVcsQ0FBQyxDQUFDO0FBQUEsUUFDZixDQUFDLENBQUM7QUFDRixRQUFBRSxTQUFRLFlBQVk7QUFBQSxNQUN0QjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSUEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxVQUFVLEdBQUcsRUFBRSxVQUFBQyxVQUFTLE1BQU07QUFDL0MsWUFBSSxVQUFVLFNBQVMsT0FBTyxLQUFLQSxVQUFTLFVBQVU7QUFDcEQsbUJBQVMsRUFBRTtBQUFBLE1BQ2Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0EsV0FBUyxTQUFTLElBQUk7QUFDcEIsUUFBSSxRQUFRLENBQUM7QUFDYixvQkFBZ0IsSUFBSSxDQUFDLFlBQVk7QUFDL0IsVUFBSSxRQUFRLFFBQVEsYUFBYSxhQUFhO0FBQzlDLGNBQVEsYUFBYSxlQUFlLE1BQU07QUFDMUMsWUFBTSxLQUFLLE1BQU0sU0FBUyxRQUFRLGdCQUFnQixhQUFhLENBQUM7QUFBQSxJQUNsRSxDQUFDO0FBQ0QsV0FBTyxNQUFNO0FBQ1gsYUFBTyxNQUFNO0FBQ1gsY0FBTSxJQUFJLEVBQUU7QUFBQSxJQUNoQjtBQUFBLEVBQ0Y7QUFDQSxXQUFTLGdCQUFnQixJQUFJLFVBQVU7QUFDckMsUUFBSSxHQUFHLFdBQVcsU0FBUyxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ3RDO0FBQ0YsVUFBTSxLQUFLLEdBQUcsV0FBVyxRQUFRLEVBQUUsUUFBUSxDQUFDLFlBQVk7QUFDdEQsVUFBSSxRQUFRLFdBQVcsRUFBRSxHQUFHO0FBQzFCLHdCQUFnQixHQUFHLFlBQVksUUFBUTtBQUFBLE1BQ3pDLE9BQU87QUFDTCxpQkFBUyxPQUFPO0FBQUEsTUFDbEI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0EsV0FBUyxtQkFBbUI7QUFDMUIsUUFBSSxXQUFXLFNBQVMsZ0JBQWdCLE1BQU07QUFDOUMsUUFBSSxlQUFlLFNBQVMsZ0JBQWdCLE1BQU07QUFDbEQsUUFBSSxpQkFBaUIsT0FBTyxhQUFhLFNBQVMsZ0JBQWdCO0FBQ2xFLGFBQVMsZ0JBQWdCLE1BQU0sV0FBVztBQUMxQyxhQUFTLGdCQUFnQixNQUFNLGVBQWUsR0FBRyxjQUFjO0FBQy9ELFdBQU8sTUFBTTtBQUNYLGVBQVMsZ0JBQWdCLE1BQU0sV0FBVztBQUMxQyxlQUFTLGdCQUFnQixNQUFNLGVBQWU7QUFBQSxJQUNoRDtBQUFBLEVBQ0Y7QUFHQSxNQUFJQyxrQkFBaUJOOzs7QUN6OUJyQixpQkFBTyxPQUFPTyxlQUFPO0FBQ3JCLGlCQUFPLE9BQU9BLGVBQVM7QUFDdkIsaUJBQU8sT0FBT0EsZUFBSztBQUduQixhQUFXLFNBQVM7QUFHcEIsaUJBQU8sTUFBTTtBQUViLFVBQVEsS0FBSywyRUFBc0U7IiwKICAibmFtZXMiOiBbImRlbGF5IiwgInNyY19kZWZhdWx0IiwgIkFscGluZSIsICJnZXQiLCAic2V0IiwgIm1vZHVsZV9kZWZhdWx0IiwgInNyY19kZWZhdWx0IiwgIkFscGluZSIsICJldmFsdWF0ZUxhdGVyIiwgImNsZWFudXAiLCAiZXZhbHVhdGUiLCAib2JzZXJ2ZXIiLCAibW9kdWxlX2RlZmF1bHQiLCAiaXNSYWRpbyIsICJpc1JhZGlvMiIsICJvd25LZXlzIiwgInNyY19kZWZhdWx0IiwgIkFscGluZSIsICJlZmZlY3QiLCAiZXZhbHVhdGVMYXRlciIsICJjbGVhbnVwIiwgImV2YWx1YXRlIiwgIm1vZHVsZV9kZWZhdWx0IiwgIm1vZHVsZV9kZWZhdWx0Il0KfQo=
