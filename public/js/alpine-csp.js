'use strict';
(() => {
  var Xe = !1,
    Qe = !1,
    W = [],
    Ge = -1;
  function Mn(e) {
    Fn(e);
  }
  function Fn(e) {
    (W.includes(e) || W.push(e), Dn());
  }
  function Ln(e) {
    let t = W.indexOf(e);
    t !== -1 && t > Ge && W.splice(t, 1);
  }
  function Dn() {
    !Qe && !Xe && ((Xe = !0), queueMicrotask(Un));
  }
  function Un() {
    ((Xe = !1), (Qe = !0));
    for (let e = 0; e < W.length; e++) (W[e](), (Ge = e));
    ((W.length = 0), (Ge = -1), (Qe = !1));
  }
  var te,
    Q,
    re,
    Zt,
    et = !0;
  function $n(e) {
    ((et = !1), e(), (et = !0));
  }
  function jn(e) {
    ((te = e.reactive),
      (re = e.release),
      (Q = (t) =>
        e.effect(t, {
          scheduler: (r) => {
            et ? Mn(r) : r();
          },
        })),
      (Zt = e.raw));
  }
  function Lt(e) {
    Q = e;
  }
  function Kn(e) {
    let t = () => {};
    return [
      (n) => {
        let i = Q(n);
        return (
          e._x_effects ||
            ((e._x_effects = new Set()),
            (e._x_runEffects = () => {
              e._x_effects.forEach((s) => s());
            })),
          e._x_effects.add(i),
          (t = () => {
            i !== void 0 && (e._x_effects.delete(i), re(i));
          }),
          i
        );
      },
      () => {
        t();
      },
    ];
  }
  function Xt(e, t) {
    let r = !0,
      n,
      i = Q(() => {
        let s = e();
        (JSON.stringify(s),
          r
            ? (n = s)
            : queueMicrotask(() => {
                (t(s, n), (n = s));
              }),
          (r = !1));
      });
    return () => re(i);
  }
  var Qt = [],
    Gt = [],
    er = [];
  function Bn(e) {
    er.push(e);
  }
  function pt(e, t) {
    typeof t == 'function'
      ? (e._x_cleanups || (e._x_cleanups = []), e._x_cleanups.push(t))
      : ((t = e), Gt.push(t));
  }
  function tr(e) {
    Qt.push(e);
  }
  function rr(e, t, r) {
    (e._x_attributeCleanups || (e._x_attributeCleanups = {}),
      e._x_attributeCleanups[t] || (e._x_attributeCleanups[t] = []),
      e._x_attributeCleanups[t].push(r));
  }
  function nr(e, t) {
    e._x_attributeCleanups &&
      Object.entries(e._x_attributeCleanups).forEach(([r, n]) => {
        (t === void 0 || t.includes(r)) &&
          (n.forEach((i) => i()), delete e._x_attributeCleanups[r]);
      });
  }
  function zn(e) {
    for (e._x_effects?.forEach(Ln); e._x_cleanups?.length; ) e._x_cleanups.pop()();
  }
  var ht = new MutationObserver(bt),
    vt = !1;
  function gt() {
    (ht.observe(document, { subtree: !0, childList: !0, attributes: !0, attributeOldValue: !0 }),
      (vt = !0));
  }
  function ir() {
    (qn(), ht.disconnect(), (vt = !1));
  }
  var ce = [];
  function qn() {
    let e = ht.takeRecords();
    ce.push(() => e.length > 0 && bt(e));
    let t = ce.length;
    queueMicrotask(() => {
      if (ce.length === t) for (; ce.length > 0; ) ce.shift()();
    });
  }
  function A(e) {
    if (!vt) return e();
    ir();
    let t = e();
    return (gt(), t);
  }
  var _t = !1,
    Te = [];
  function Hn() {
    _t = !0;
  }
  function Wn() {
    ((_t = !1), bt(Te), (Te = []));
  }
  function bt(e) {
    if (_t) {
      Te = Te.concat(e);
      return;
    }
    let t = [],
      r = new Set(),
      n = new Map(),
      i = new Map();
    for (let s = 0; s < e.length; s++)
      if (
        !e[s].target._x_ignoreMutationObserver &&
        (e[s].type === 'childList' &&
          (e[s].removedNodes.forEach((a) => {
            a.nodeType === 1 && a._x_marker && r.add(a);
          }),
          e[s].addedNodes.forEach((a) => {
            if (a.nodeType === 1) {
              if (r.has(a)) {
                r.delete(a);
                return;
              }
              a._x_marker || t.push(a);
            }
          })),
        e[s].type === 'attributes')
      ) {
        let a = e[s].target,
          o = e[s].attributeName,
          u = e[s].oldValue,
          c = () => {
            (n.has(a) || n.set(a, []), n.get(a).push({ name: o, value: a.getAttribute(o) }));
          },
          l = () => {
            (i.has(a) || i.set(a, []), i.get(a).push(o));
          };
        a.hasAttribute(o) && u === null ? c() : a.hasAttribute(o) ? (l(), c()) : l();
      }
    (i.forEach((s, a) => {
      nr(a, s);
    }),
      n.forEach((s, a) => {
        Qt.forEach((o) => o(a, s));
      }));
    for (let s of r) t.some((a) => a.contains(s)) || Gt.forEach((a) => a(s));
    for (let s of t) s.isConnected && er.forEach((a) => a(s));
    ((t = null), (r = null), (n = null), (i = null));
  }
  function sr(e) {
    return ne(Z(e));
  }
  function _e(e, t, r) {
    return (
      (e._x_dataStack = [t, ...Z(r || e)]),
      () => {
        e._x_dataStack = e._x_dataStack.filter((n) => n !== t);
      }
    );
  }
  function Z(e) {
    return e._x_dataStack
      ? e._x_dataStack
      : typeof ShadowRoot == 'function' && e instanceof ShadowRoot
        ? Z(e.host)
        : e.parentNode
          ? Z(e.parentNode)
          : [];
  }
  function ne(e) {
    return new Proxy({ objects: e }, Vn);
  }
  var Vn = {
    ownKeys({ objects: e }) {
      return Array.from(new Set(e.flatMap((t) => Object.keys(t))));
    },
    has({ objects: e }, t) {
      return t == Symbol.unscopables
        ? !1
        : e.some((r) => Object.prototype.hasOwnProperty.call(r, t) || Reflect.has(r, t));
    },
    get({ objects: e }, t, r) {
      return t == 'toJSON' ? Jn : Reflect.get(e.find((n) => Reflect.has(n, t)) || {}, t, r);
    },
    set({ objects: e }, t, r, n) {
      let i = e.find((a) => Object.prototype.hasOwnProperty.call(a, t)) || e[e.length - 1],
        s = Object.getOwnPropertyDescriptor(i, t);
      return s?.set && s?.get ? s.set.call(n, r) || !0 : Reflect.set(i, t, r);
    },
  };
  function Jn() {
    return Reflect.ownKeys(this).reduce((t, r) => ((t[r] = Reflect.get(this, r)), t), {});
  }
  function ar(e) {
    let t = (n) => typeof n == 'object' && !Array.isArray(n) && n !== null,
      r = (n, i = '') => {
        Object.entries(Object.getOwnPropertyDescriptors(n)).forEach(
          ([s, { value: a, enumerable: o }]) => {
            if (o === !1 || a === void 0 || (typeof a == 'object' && a !== null && a.__v_skip))
              return;
            let u = i === '' ? s : `${i}.${s}`;
            typeof a == 'object' && a !== null && a._x_interceptor
              ? (n[s] = a.initialize(e, u, s))
              : t(a) && a !== n && !(a instanceof Element) && r(a, u);
          }
        );
      };
    return r(e);
  }
  function or(e, t = () => {}) {
    let r = {
      initialValue: void 0,
      _x_interceptor: !0,
      initialize(n, i, s) {
        return e(
          this.initialValue,
          () => Yn(n, i),
          (a) => tt(n, i, a),
          i,
          s
        );
      },
    };
    return (
      t(r),
      (n) => {
        if (typeof n == 'object' && n !== null && n._x_interceptor) {
          let i = r.initialize.bind(r);
          r.initialize = (s, a, o) => {
            let u = n.initialize(s, a, o);
            return ((r.initialValue = u), i(s, a, o));
          };
        } else r.initialValue = n;
        return r;
      }
    );
  }
  function Yn(e, t) {
    return t.split('.').reduce((r, n) => r[n], e);
  }
  function tt(e, t, r) {
    if ((typeof t == 'string' && (t = t.split('.')), t.length === 1)) e[t[0]] = r;
    else {
      if (t.length === 0) throw error;
      return (e[t[0]] || (e[t[0]] = {}), tt(e[t[0]], t.slice(1), r));
    }
  }
  var ur = {};
  function F(e, t) {
    ur[e] = t;
  }
  function Se(e, t) {
    let r = Zn(t);
    return (
      Object.entries(ur).forEach(([n, i]) => {
        Object.defineProperty(e, `$${n}`, {
          get() {
            return i(t, r);
          },
          enumerable: !1,
        });
      }),
      e
    );
  }
  function Zn(e) {
    let [t, r] = vr(e),
      n = { interceptor: or, ...t };
    return (pt(e, r), n);
  }
  function cr(e, t, r, ...n) {
    try {
      return r(...n);
    } catch (i) {
      ge(i, e, t);
    }
  }
  function ge(e, t, r = void 0) {
    ((e = Object.assign(e ?? { message: 'No error message given.' }, { el: t, expression: r })),
      console.warn(
        `Alpine Expression Error: ${e.message}

${
  r
    ? 'Expression: "' +
      r +
      `"

`
    : ''
}`,
        t
      ),
      setTimeout(() => {
        throw e;
      }, 0));
  }
  var pe = !0;
  function lr(e) {
    let t = pe;
    pe = !1;
    let r = e();
    return ((pe = t), r);
  }
  function V(e, t, r = {}) {
    let n;
    return (P(e, t)((i) => (n = i), r), n);
  }
  function P(...e) {
    return fr(...e);
  }
  var fr = Qn;
  function Xn(e) {
    fr = e;
  }
  function Qn(e, t) {
    let r = {};
    Se(r, e);
    let n = [r, ...Z(e)],
      i = typeof t == 'function' ? dr(n, t) : ei(n, t, e);
    return cr.bind(null, e, t, i);
  }
  function dr(e, t) {
    return (r = () => {}, { scope: n = {}, params: i = [], context: s } = {}) => {
      let a = t.apply(ne([n, ...e]), i);
      Ne(r, a);
    };
  }
  var We = {};
  function Gn(e, t) {
    if (We[e]) return We[e];
    let r = Object.getPrototypeOf(async function () {}).constructor,
      n =
        /^[\n\s]*if.*\(.*\)/.test(e.trim()) || /^(let|const)\s/.test(e.trim())
          ? `(async()=>{ ${e} })()`
          : e,
      s = (() => {
        try {
          let a = new r(
            ['__self', 'scope'],
            `with (scope) { __self.result = ${n} }; __self.finished = true; return __self.result;`
          );
          return (Object.defineProperty(a, 'name', { value: `[Alpine] ${e}` }), a);
        } catch (a) {
          return (ge(a, t, e), Promise.resolve());
        }
      })();
    return ((We[e] = s), s);
  }
  function ei(e, t, r) {
    let n = Gn(t, r);
    return (i = () => {}, { scope: s = {}, params: a = [], context: o } = {}) => {
      ((n.result = void 0), (n.finished = !1));
      let u = ne([s, ...e]);
      if (typeof n == 'function') {
        let c = n.call(o, n, u).catch((l) => ge(l, r, t));
        n.finished
          ? (Ne(i, n.result, u, a, r), (n.result = void 0))
          : c
              .then((l) => {
                Ne(i, l, u, a, r);
              })
              .catch((l) => ge(l, r, t))
              .finally(() => (n.result = void 0));
      }
    };
  }
  function Ne(e, t, r, n, i) {
    if (pe && typeof t == 'function') {
      let s = t.apply(r, n);
      s instanceof Promise ? s.then((a) => Ne(e, a, r, n)).catch((a) => ge(a, i, t)) : e(s);
    } else typeof t == 'object' && t instanceof Promise ? t.then((s) => e(s)) : e(t);
  }
  var mt = 'x-';
  function ie(e = '') {
    return mt + e;
  }
  function ti(e) {
    mt = e;
  }
  var Ce = {};
  function S(e, t) {
    return (
      (Ce[e] = t),
      {
        before(r) {
          if (!Ce[r]) {
            console.warn(
              String.raw`Cannot find directive \`${r}\`. \`${e}\` will use the default order of execution`
            );
            return;
          }
          let n = H.indexOf(r);
          H.splice(n >= 0 ? n : H.indexOf('DEFAULT'), 0, e);
        },
      }
    );
  }
  function ri(e) {
    return Object.keys(Ce).includes(e);
  }
  function yt(e, t, r) {
    if (((t = Array.from(t)), e._x_virtualDirectives)) {
      let s = Object.entries(e._x_virtualDirectives).map(([o, u]) => ({ name: o, value: u })),
        a = pr(s);
      ((s = s.map((o) =>
        a.find((u) => u.name === o.name) ? { name: `x-bind:${o.name}`, value: `"${o.value}"` } : o
      )),
        (t = t.concat(s)));
    }
    let n = {};
    return t
      .map(br((s, a) => (n[s] = a)))
      .filter(yr)
      .map(si(n, r))
      .sort(ai)
      .map((s) => ii(e, s));
  }
  function pr(e) {
    return Array.from(e)
      .map(br())
      .filter((t) => !yr(t));
  }
  var rt = !1,
    de = new Map(),
    hr = Symbol();
  function ni(e) {
    rt = !0;
    let t = Symbol();
    ((hr = t), de.set(t, []));
    let r = () => {
        for (; de.get(t).length; ) de.get(t).shift()();
        de.delete(t);
      },
      n = () => {
        ((rt = !1), r());
      };
    (e(r), n());
  }
  function vr(e) {
    let t = [],
      r = (o) => t.push(o),
      [n, i] = Kn(e);
    return (
      t.push(i),
      [
        { Alpine: be, effect: n, cleanup: r, evaluateLater: P.bind(P, e), evaluate: V.bind(V, e) },
        () => t.forEach((o) => o()),
      ]
    );
  }
  function ii(e, t) {
    let r = () => {},
      n = Ce[t.type] || r,
      [i, s] = vr(e);
    rr(e, t.original, s);
    let a = () => {
      e._x_ignore ||
        e._x_ignoreSelf ||
        (n.inline && n.inline(e, t, i), (n = n.bind(n, e, t, i)), rt ? de.get(hr).push(n) : n());
    };
    return ((a.runCleanups = s), a);
  }
  var gr =
      (e, t) =>
      ({ name: r, value: n }) => (r.startsWith(e) && (r = r.replace(e, t)), { name: r, value: n }),
    _r = (e) => e;
  function br(e = () => {}) {
    return ({ name: t, value: r }) => {
      let { name: n, value: i } = mr.reduce((s, a) => a(s), { name: t, value: r });
      return (n !== t && e(n, t), { name: n, value: i });
    };
  }
  var mr = [];
  function xt(e) {
    mr.push(e);
  }
  function yr({ name: e }) {
    return xr().test(e);
  }
  var xr = () => new RegExp(`^${mt}([^:^.]+)\\b`);
  function si(e, t) {
    return ({ name: r, value: n }) => {
      let i = r.match(xr()),
        s = r.match(/:([a-zA-Z0-9\-_:]+)/),
        a = r.match(/\.[^.\]]+(?=[^\]]*$)/g) || [],
        o = t || e[r] || r;
      return {
        type: i ? i[1] : null,
        value: s ? s[1] : null,
        modifiers: a.map((u) => u.replace('.', '')),
        expression: n,
        original: o,
      };
    };
  }
  var nt = 'DEFAULT',
    H = [
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
      nt,
      'teleport',
    ];
  function ai(e, t) {
    let r = H.indexOf(e.type) === -1 ? nt : e.type,
      n = H.indexOf(t.type) === -1 ? nt : t.type;
    return H.indexOf(r) - H.indexOf(n);
  }
  function he(e, t, r = {}) {
    e.dispatchEvent(new CustomEvent(t, { detail: r, bubbles: !0, composed: !0, cancelable: !0 }));
  }
  function X(e, t) {
    if (typeof ShadowRoot == 'function' && e instanceof ShadowRoot) {
      Array.from(e.children).forEach((i) => X(i, t));
      return;
    }
    let r = !1;
    if ((t(e, () => (r = !0)), r)) return;
    let n = e.firstElementChild;
    for (; n; ) (X(n, t, !1), (n = n.nextElementSibling));
  }
  function R(e, ...t) {
    console.warn(`Alpine Warning: ${e}`, ...t);
  }
  var Dt = !1;
  function oi() {
    (Dt &&
      R(
        'Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.'
      ),
      (Dt = !0),
      document.body ||
        R(
          "Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?"
        ),
      he(document, 'alpine:init'),
      he(document, 'alpine:initializing'),
      gt(),
      Bn((t) => U(t, X)),
      pt((t) => ae(t)),
      tr((t, r) => {
        yt(t, r).forEach((n) => n());
      }));
    let e = (t) => !ke(t.parentElement, !0);
    (Array.from(document.querySelectorAll(Ar().join(',')))
      .filter(e)
      .forEach((t) => {
        U(t);
      }),
      he(document, 'alpine:initialized'),
      setTimeout(() => {
        fi();
      }));
  }
  var wt = [],
    wr = [];
  function Er() {
    return wt.map((e) => e());
  }
  function Ar() {
    return wt.concat(wr).map((e) => e());
  }
  function Or(e) {
    wt.push(e);
  }
  function Tr(e) {
    wr.push(e);
  }
  function ke(e, t = !1) {
    return se(e, (r) => {
      if ((t ? Ar() : Er()).some((i) => r.matches(i))) return !0;
    });
  }
  function se(e, t) {
    if (e) {
      if (t(e)) return e;
      if ((e._x_teleportBack && (e = e._x_teleportBack), !!e.parentElement))
        return se(e.parentElement, t);
    }
  }
  function ui(e) {
    return Er().some((t) => e.matches(t));
  }
  var Sr = [];
  function ci(e) {
    Sr.push(e);
  }
  var li = 1;
  function U(e, t = X, r = () => {}) {
    se(e, (n) => n._x_ignore) ||
      ni(() => {
        t(e, (n, i) => {
          n._x_marker ||
            (r(n, i),
            Sr.forEach((s) => s(n, i)),
            yt(n, n.attributes).forEach((s) => s()),
            n._x_ignore || (n._x_marker = li++),
            n._x_ignore && i());
        });
      });
  }
  function ae(e, t = X) {
    t(e, (r) => {
      (zn(r), nr(r), delete r._x_marker);
    });
  }
  function fi() {
    [
      ['ui', 'dialog', ['[x-dialog], [x-popover]']],
      ['anchor', 'anchor', ['[x-anchor]']],
      ['sort', 'sort', ['[x-sort]']],
    ].forEach(([t, r, n]) => {
      ri(r) ||
        n.some((i) => {
          if (document.querySelector(i)) return (R(`found "${i}", but missing ${t} plugin`), !0);
        });
    });
  }
  var it = [],
    Et = !1;
  function At(e = () => {}) {
    return (
      queueMicrotask(() => {
        Et ||
          setTimeout(() => {
            st();
          });
      }),
      new Promise((t) => {
        it.push(() => {
          (e(), t());
        });
      })
    );
  }
  function st() {
    for (Et = !1; it.length; ) it.shift()();
  }
  function di() {
    Et = !0;
  }
  function Ot(e, t) {
    return Array.isArray(t)
      ? Ut(e, t.join(' '))
      : typeof t == 'object' && t !== null
        ? pi(e, t)
        : typeof t == 'function'
          ? Ot(e, t())
          : Ut(e, t);
  }
  function Ut(e, t) {
    let r = (s) => s.split(' ').filter(Boolean),
      n = (s) =>
        s
          .split(' ')
          .filter((a) => !e.classList.contains(a))
          .filter(Boolean),
      i = (s) => (
        e.classList.add(...s),
        () => {
          e.classList.remove(...s);
        }
      );
    return ((t = t === !0 ? (t = '') : t || ''), i(n(t)));
  }
  function pi(e, t) {
    let r = (o) => o.split(' ').filter(Boolean),
      n = Object.entries(t)
        .flatMap(([o, u]) => (u ? r(o) : !1))
        .filter(Boolean),
      i = Object.entries(t)
        .flatMap(([o, u]) => (u ? !1 : r(o)))
        .filter(Boolean),
      s = [],
      a = [];
    return (
      i.forEach((o) => {
        e.classList.contains(o) && (e.classList.remove(o), a.push(o));
      }),
      n.forEach((o) => {
        e.classList.contains(o) || (e.classList.add(o), s.push(o));
      }),
      () => {
        (a.forEach((o) => e.classList.add(o)), s.forEach((o) => e.classList.remove(o)));
      }
    );
  }
  function Pe(e, t) {
    return typeof t == 'object' && t !== null ? hi(e, t) : vi(e, t);
  }
  function hi(e, t) {
    let r = {};
    return (
      Object.entries(t).forEach(([n, i]) => {
        ((r[n] = e.style[n]), n.startsWith('--') || (n = gi(n)), e.style.setProperty(n, i));
      }),
      setTimeout(() => {
        e.style.length === 0 && e.removeAttribute('style');
      }),
      () => {
        Pe(e, r);
      }
    );
  }
  function vi(e, t) {
    let r = e.getAttribute('style', t);
    return (
      e.setAttribute('style', t),
      () => {
        e.setAttribute('style', r || '');
      }
    );
  }
  function gi(e) {
    return e.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function at(e, t = () => {}) {
    let r = !1;
    return function () {
      r ? t.apply(this, arguments) : ((r = !0), e.apply(this, arguments));
    };
  }
  S('transition', (e, { value: t, modifiers: r, expression: n }, { evaluate: i }) => {
    (typeof n == 'function' && (n = i(n)),
      n !== !1 && (!n || typeof n == 'boolean' ? bi(e, r, t) : _i(e, n, t)));
  });
  function _i(e, t, r) {
    (Nr(e, Ot, ''),
      {
        enter: (i) => {
          e._x_transition.enter.during = i;
        },
        'enter-start': (i) => {
          e._x_transition.enter.start = i;
        },
        'enter-end': (i) => {
          e._x_transition.enter.end = i;
        },
        leave: (i) => {
          e._x_transition.leave.during = i;
        },
        'leave-start': (i) => {
          e._x_transition.leave.start = i;
        },
        'leave-end': (i) => {
          e._x_transition.leave.end = i;
        },
      }[r](t));
  }
  function bi(e, t, r) {
    Nr(e, Pe);
    let n = !t.includes('in') && !t.includes('out') && !r,
      i = n || t.includes('in') || ['enter'].includes(r),
      s = n || t.includes('out') || ['leave'].includes(r);
    (t.includes('in') && !n && (t = t.filter((y, E) => E < t.indexOf('out'))),
      t.includes('out') && !n && (t = t.filter((y, E) => E > t.indexOf('out'))));
    let a = !t.includes('opacity') && !t.includes('scale'),
      o = a || t.includes('opacity'),
      u = a || t.includes('scale'),
      c = o ? 0 : 1,
      l = u ? le(t, 'scale', 95) / 100 : 1,
      v = le(t, 'delay', 0) / 1e3,
      g = le(t, 'origin', 'center'),
      m = 'opacity, transform',
      p = le(t, 'duration', 150) / 1e3,
      b = le(t, 'duration', 75) / 1e3,
      h = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    (i &&
      ((e._x_transition.enter.during = {
        transformOrigin: g,
        transitionDelay: `${v}s`,
        transitionProperty: m,
        transitionDuration: `${p}s`,
        transitionTimingFunction: h,
      }),
      (e._x_transition.enter.start = { opacity: c, transform: `scale(${l})` }),
      (e._x_transition.enter.end = { opacity: 1, transform: 'scale(1)' })),
      s &&
        ((e._x_transition.leave.during = {
          transformOrigin: g,
          transitionDelay: `${v}s`,
          transitionProperty: m,
          transitionDuration: `${b}s`,
          transitionTimingFunction: h,
        }),
        (e._x_transition.leave.start = { opacity: 1, transform: 'scale(1)' }),
        (e._x_transition.leave.end = { opacity: c, transform: `scale(${l})` })));
  }
  function Nr(e, t, r = {}) {
    e._x_transition ||
      (e._x_transition = {
        enter: { during: r, start: r, end: r },
        leave: { during: r, start: r, end: r },
        in(n = () => {}, i = () => {}) {
          ot(
            e,
            t,
            { during: this.enter.during, start: this.enter.start, end: this.enter.end },
            n,
            i
          );
        },
        out(n = () => {}, i = () => {}) {
          ot(
            e,
            t,
            { during: this.leave.during, start: this.leave.start, end: this.leave.end },
            n,
            i
          );
        },
      });
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function (e, t, r, n) {
    let i = document.visibilityState === 'visible' ? requestAnimationFrame : setTimeout,
      s = () => i(r);
    if (t) {
      e._x_transition && (e._x_transition.enter || e._x_transition.leave)
        ? e._x_transition.enter &&
          (Object.entries(e._x_transition.enter.during).length ||
            Object.entries(e._x_transition.enter.start).length ||
            Object.entries(e._x_transition.enter.end).length)
          ? e._x_transition.in(r)
          : s()
        : e._x_transition
          ? e._x_transition.in(r)
          : s();
      return;
    }
    ((e._x_hidePromise = e._x_transition
      ? new Promise((a, o) => {
          (e._x_transition.out(
            () => {},
            () => a(n)
          ),
            e._x_transitioning &&
              e._x_transitioning.beforeCancel(() => o({ isFromCancelledTransition: !0 })));
        })
      : Promise.resolve(n)),
      queueMicrotask(() => {
        let a = Cr(e);
        a
          ? (a._x_hideChildren || (a._x_hideChildren = []), a._x_hideChildren.push(e))
          : i(() => {
              let o = (u) => {
                let c = Promise.all([u._x_hidePromise, ...(u._x_hideChildren || []).map(o)]).then(
                  ([l]) => l?.()
                );
                return (delete u._x_hidePromise, delete u._x_hideChildren, c);
              };
              o(e).catch((u) => {
                if (!u.isFromCancelledTransition) throw u;
              });
            });
      }));
  };
  function Cr(e) {
    let t = e.parentNode;
    if (t) return t._x_hidePromise ? t : Cr(t);
  }
  function ot(e, t, { during: r, start: n, end: i } = {}, s = () => {}, a = () => {}) {
    if (
      (e._x_transitioning && e._x_transitioning.cancel(),
      Object.keys(r).length === 0 && Object.keys(n).length === 0 && Object.keys(i).length === 0)
    ) {
      (s(), a());
      return;
    }
    let o, u, c;
    mi(e, {
      start() {
        o = t(e, n);
      },
      during() {
        u = t(e, r);
      },
      before: s,
      end() {
        (o(), (c = t(e, i)));
      },
      after: a,
      cleanup() {
        (u(), c());
      },
    });
  }
  function mi(e, t) {
    let r,
      n,
      i,
      s = at(() => {
        A(() => {
          ((r = !0),
            n || t.before(),
            i || (t.end(), st()),
            t.after(),
            e.isConnected && t.cleanup(),
            delete e._x_transitioning);
        });
      });
    ((e._x_transitioning = {
      beforeCancels: [],
      beforeCancel(a) {
        this.beforeCancels.push(a);
      },
      cancel: at(function () {
        for (; this.beforeCancels.length; ) this.beforeCancels.shift()();
        s();
      }),
      finish: s,
    }),
      A(() => {
        (t.start(), t.during());
      }),
      di(),
      requestAnimationFrame(() => {
        if (r) return;
        let a =
            Number(getComputedStyle(e).transitionDuration.replace(/,.*/, '').replace('s', '')) *
            1e3,
          o = Number(getComputedStyle(e).transitionDelay.replace(/,.*/, '').replace('s', '')) * 1e3;
        (a === 0 && (a = Number(getComputedStyle(e).animationDuration.replace('s', '')) * 1e3),
          A(() => {
            t.before();
          }),
          (n = !0),
          requestAnimationFrame(() => {
            r ||
              (A(() => {
                t.end();
              }),
              st(),
              setTimeout(e._x_transitioning.finish, a + o),
              (i = !0));
          }));
      }));
  }
  function le(e, t, r) {
    if (e.indexOf(t) === -1) return r;
    let n = e[e.indexOf(t) + 1];
    if (!n || (t === 'scale' && isNaN(n))) return r;
    if (t === 'duration' || t === 'delay') {
      let i = n.match(/([0-9]+)ms/);
      if (i) return i[1];
    }
    return t === 'origin' &&
      ['top', 'right', 'left', 'center', 'bottom'].includes(e[e.indexOf(t) + 2])
      ? [n, e[e.indexOf(t) + 2]].join(' ')
      : n;
  }
  var K = !1;
  function z(e, t = () => {}) {
    return (...r) => (K ? t(...r) : e(...r));
  }
  function yi(e) {
    return (...t) => K && e(...t);
  }
  var Ir = [];
  function Re(e) {
    Ir.push(e);
  }
  function xi(e, t) {
    (Ir.forEach((r) => r(e, t)),
      (K = !0),
      kr(() => {
        U(t, (r, n) => {
          n(r, () => {});
        });
      }),
      (K = !1));
  }
  var ut = !1;
  function wi(e, t) {
    (t._x_dataStack || (t._x_dataStack = e._x_dataStack),
      (K = !0),
      (ut = !0),
      kr(() => {
        Ei(t);
      }),
      (K = !1),
      (ut = !1));
  }
  function Ei(e) {
    let t = !1;
    U(e, (n, i) => {
      X(n, (s, a) => {
        if (t && ui(s)) return a();
        ((t = !0), i(s, a));
      });
    });
  }
  function kr(e) {
    let t = Q;
    (Lt((r, n) => {
      let i = t(r);
      return (re(i), () => {});
    }),
      e(),
      Lt(t));
  }
  function Pr(e, t, r, n = []) {
    switch (
      (e._x_bindings || (e._x_bindings = te({})),
      (e._x_bindings[t] = r),
      (t = n.includes('camel') ? ki(t) : t),
      t)
    ) {
      case 'value':
        Ai(e, r);
        break;
      case 'style':
        Ti(e, r);
        break;
      case 'class':
        Oi(e, r);
        break;
      case 'selected':
      case 'checked':
        Si(e, t, r);
        break;
      default:
        Rr(e, t, r);
        break;
    }
  }
  function Ai(e, t) {
    if (Lr(e))
      (e.attributes.value === void 0 && (e.value = t),
        window.fromModel &&
          (typeof t == 'boolean' ? (e.checked = Oe(e.value) === t) : (e.checked = $t(e.value, t))));
    else if (Tt(e))
      Number.isInteger(t)
        ? (e.value = t)
        : !Array.isArray(t) && typeof t != 'boolean' && ![null, void 0].includes(t)
          ? (e.value = String(t))
          : Array.isArray(t)
            ? (e.checked = t.some((r) => $t(r, e.value)))
            : (e.checked = !!t);
    else if (e.tagName === 'SELECT') Ii(e, t);
    else {
      if (e.value === t) return;
      e.value = t === void 0 ? '' : t;
    }
  }
  function Oi(e, t) {
    (e._x_undoAddedClasses && e._x_undoAddedClasses(), (e._x_undoAddedClasses = Ot(e, t)));
  }
  function Ti(e, t) {
    (e._x_undoAddedStyles && e._x_undoAddedStyles(), (e._x_undoAddedStyles = Pe(e, t)));
  }
  function Si(e, t, r) {
    (Rr(e, t, r), Ci(e, t, r));
  }
  function Rr(e, t, r) {
    [null, void 0, !1].includes(r) && Ri(t)
      ? e.removeAttribute(t)
      : (Mr(t) && (r = t), Ni(e, t, r));
  }
  function Ni(e, t, r) {
    e.getAttribute(t) != r && e.setAttribute(t, r);
  }
  function Ci(e, t, r) {
    e[t] !== r && (e[t] = r);
  }
  function Ii(e, t) {
    let r = [].concat(t).map((n) => n + '');
    Array.from(e.options).forEach((n) => {
      n.selected = r.includes(n.value);
    });
  }
  function ki(e) {
    return e.toLowerCase().replace(/-(\w)/g, (t, r) => r.toUpperCase());
  }
  function $t(e, t) {
    return e == t;
  }
  function Oe(e) {
    return [1, '1', 'true', 'on', 'yes', !0].includes(e)
      ? !0
      : [0, '0', 'false', 'off', 'no', !1].includes(e)
        ? !1
        : e
          ? !!e
          : null;
  }
  var Pi = new Set([
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
  function Mr(e) {
    return Pi.has(e);
  }
  function Ri(e) {
    return !['aria-pressed', 'aria-checked', 'aria-expanded', 'aria-selected'].includes(e);
  }
  function Mi(e, t, r) {
    return e._x_bindings && e._x_bindings[t] !== void 0 ? e._x_bindings[t] : Fr(e, t, r);
  }
  function Fi(e, t, r, n = !0) {
    if (e._x_bindings && e._x_bindings[t] !== void 0) return e._x_bindings[t];
    if (e._x_inlineBindings && e._x_inlineBindings[t] !== void 0) {
      let i = e._x_inlineBindings[t];
      return ((i.extract = n), lr(() => V(e, i.expression)));
    }
    return Fr(e, t, r);
  }
  function Fr(e, t, r) {
    let n = e.getAttribute(t);
    return n === null
      ? typeof r == 'function'
        ? r()
        : r
      : n === ''
        ? !0
        : Mr(t)
          ? !![t, 'true'].includes(n)
          : n;
  }
  function Tt(e) {
    return e.type === 'checkbox' || e.localName === 'ui-checkbox' || e.localName === 'ui-switch';
  }
  function Lr(e) {
    return e.type === 'radio' || e.localName === 'ui-radio';
  }
  function Dr(e, t) {
    let r;
    return function () {
      let n = this,
        i = arguments,
        s = function () {
          ((r = null), e.apply(n, i));
        };
      (clearTimeout(r), (r = setTimeout(s, t)));
    };
  }
  function Ur(e, t) {
    let r;
    return function () {
      let n = this,
        i = arguments;
      r || (e.apply(n, i), (r = !0), setTimeout(() => (r = !1), t));
    };
  }
  function $r({ get: e, set: t }, { get: r, set: n }) {
    let i = !0,
      s,
      a,
      o = Q(() => {
        let u = e(),
          c = r();
        if (i) (n(Ve(u)), (i = !1));
        else {
          let l = JSON.stringify(u),
            v = JSON.stringify(c);
          l !== s ? n(Ve(u)) : l !== v && t(Ve(c));
        }
        ((s = JSON.stringify(e())), (a = JSON.stringify(r())));
      });
    return () => {
      re(o);
    };
  }
  function Ve(e) {
    return typeof e == 'object' ? JSON.parse(JSON.stringify(e)) : e;
  }
  function Li(e) {
    (Array.isArray(e) ? e : [e]).forEach((r) => r(be));
  }
  var q = {},
    jt = !1;
  function Di(e, t) {
    if ((jt || ((q = te(q)), (jt = !0)), t === void 0)) return q[e];
    ((q[e] = t),
      ar(q[e]),
      typeof t == 'object' &&
        t !== null &&
        t.hasOwnProperty('init') &&
        typeof t.init == 'function' &&
        q[e].init());
  }
  function Ui() {
    return q;
  }
  var jr = {};
  function $i(e, t) {
    let r = typeof t != 'function' ? () => t : t;
    return e instanceof Element ? Kr(e, r()) : ((jr[e] = r), () => {});
  }
  function ji(e) {
    return (
      Object.entries(jr).forEach(([t, r]) => {
        Object.defineProperty(e, t, {
          get() {
            return (...n) => r(...n);
          },
        });
      }),
      e
    );
  }
  function Kr(e, t, r) {
    let n = [];
    for (; n.length; ) n.pop()();
    let i = Object.entries(t).map(([a, o]) => ({ name: a, value: o })),
      s = pr(i);
    return (
      (i = i.map((a) =>
        s.find((o) => o.name === a.name) ? { name: `x-bind:${a.name}`, value: `"${a.value}"` } : a
      )),
      yt(e, i, r).map((a) => {
        (n.push(a.runCleanups), a());
      }),
      () => {
        for (; n.length; ) n.pop()();
      }
    );
  }
  var Br = {};
  function Ki(e, t) {
    Br[e] = t;
  }
  function Bi(e, t) {
    return (
      Object.entries(Br).forEach(([r, n]) => {
        Object.defineProperty(e, r, {
          get() {
            return (...i) => n.bind(t)(...i);
          },
          enumerable: !1,
        });
      }),
      e
    );
  }
  var zi = {
      get reactive() {
        return te;
      },
      get release() {
        return re;
      },
      get effect() {
        return Q;
      },
      get raw() {
        return Zt;
      },
      version: '3.15.1',
      flushAndStopDeferringMutations: Wn,
      dontAutoEvaluateFunctions: lr,
      disableEffectScheduling: $n,
      startObservingMutations: gt,
      stopObservingMutations: ir,
      setReactivityEngine: jn,
      onAttributeRemoved: rr,
      onAttributesAdded: tr,
      closestDataStack: Z,
      skipDuringClone: z,
      onlyDuringClone: yi,
      addRootSelector: Or,
      addInitSelector: Tr,
      interceptClone: Re,
      addScopeToNode: _e,
      deferMutations: Hn,
      mapAttributes: xt,
      evaluateLater: P,
      interceptInit: ci,
      setEvaluator: Xn,
      mergeProxies: ne,
      extractProp: Fi,
      findClosest: se,
      onElRemoved: pt,
      closestRoot: ke,
      destroyTree: ae,
      interceptor: or,
      transition: ot,
      setStyles: Pe,
      mutateDom: A,
      directive: S,
      entangle: $r,
      throttle: Ur,
      debounce: Dr,
      evaluate: V,
      initTree: U,
      nextTick: At,
      prefixed: ie,
      prefix: ti,
      plugin: Li,
      magic: F,
      store: Di,
      start: oi,
      clone: wi,
      cloneNode: xi,
      bound: Mi,
      $data: sr,
      watch: Xt,
      walk: X,
      data: Ki,
      bind: $i,
    },
    be = zi,
    C = class {
      constructor(e, t, r, n) {
        ((this.type = e), (this.value = t), (this.start = r), (this.end = n));
      }
    },
    qi = class {
      constructor(e) {
        ((this.input = e), (this.position = 0), (this.tokens = []));
      }
      tokenize() {
        for (
          ;
          this.position < this.input.length &&
          (this.skipWhitespace(), !(this.position >= this.input.length));

        ) {
          let e = this.input[this.position];
          this.isDigit(e)
            ? this.readNumber()
            : this.isAlpha(e) || e === '_' || e === '$'
              ? this.readIdentifierOrKeyword()
              : e === '"' || e === "'"
                ? this.readString()
                : e === '/' && this.peek() === '/'
                  ? this.skipLineComment()
                  : this.readOperatorOrPunctuation();
        }
        return (this.tokens.push(new C('EOF', null, this.position, this.position)), this.tokens);
      }
      skipWhitespace() {
        for (; this.position < this.input.length && /\s/.test(this.input[this.position]); )
          this.position++;
      }
      skipLineComment() {
        for (
          ;
          this.position < this.input.length &&
          this.input[this.position] !==
            `
`;

        )
          this.position++;
      }
      isDigit(e) {
        return /[0-9]/.test(e);
      }
      isAlpha(e) {
        return /[a-zA-Z]/.test(e);
      }
      isAlphaNumeric(e) {
        return /[a-zA-Z0-9_$]/.test(e);
      }
      peek(e = 1) {
        return this.input[this.position + e] || '';
      }
      readNumber() {
        let e = this.position,
          t = !1;
        for (; this.position < this.input.length; ) {
          let n = this.input[this.position];
          if (this.isDigit(n)) this.position++;
          else if (n === '.' && !t) ((t = !0), this.position++);
          else break;
        }
        let r = this.input.slice(e, this.position);
        this.tokens.push(new C('NUMBER', parseFloat(r), e, this.position));
      }
      readIdentifierOrKeyword() {
        let e = this.position;
        for (
          ;
          this.position < this.input.length && this.isAlphaNumeric(this.input[this.position]);

        )
          this.position++;
        let t = this.input.slice(e, this.position);
        [
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
        ].includes(t)
          ? t === 'true' || t === 'false'
            ? this.tokens.push(new C('BOOLEAN', t === 'true', e, this.position))
            : t === 'null'
              ? this.tokens.push(new C('NULL', null, e, this.position))
              : t === 'undefined'
                ? this.tokens.push(new C('UNDEFINED', void 0, e, this.position))
                : this.tokens.push(new C('KEYWORD', t, e, this.position))
          : this.tokens.push(new C('IDENTIFIER', t, e, this.position));
      }
      readString() {
        let e = this.position,
          t = this.input[this.position];
        this.position++;
        let r = '',
          n = !1;
        for (; this.position < this.input.length; ) {
          let i = this.input[this.position];
          if (n) {
            switch (i) {
              case 'n':
                r += `
`;
                break;
              case 't':
                r += '	';
                break;
              case 'r':
                r += '\r';
                break;
              case '\\':
                r += '\\';
                break;
              case t:
                r += t;
                break;
              default:
                r += i;
            }
            n = !1;
          } else if (i === '\\') n = !0;
          else if (i === t) {
            (this.position++, this.tokens.push(new C('STRING', r, e, this.position)));
            return;
          } else r += i;
          this.position++;
        }
        throw new Error(`Unterminated string starting at position ${e}`);
      }
      readOperatorOrPunctuation() {
        let e = this.position,
          t = this.input[this.position],
          r = this.peek(),
          n = this.peek(2);
        if (t === '=' && r === '=' && n === '=')
          ((this.position += 3), this.tokens.push(new C('OPERATOR', '===', e, this.position)));
        else if (t === '!' && r === '=' && n === '=')
          ((this.position += 3), this.tokens.push(new C('OPERATOR', '!==', e, this.position)));
        else if (t === '=' && r === '=')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '==', e, this.position)));
        else if (t === '!' && r === '=')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '!=', e, this.position)));
        else if (t === '<' && r === '=')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '<=', e, this.position)));
        else if (t === '>' && r === '=')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '>=', e, this.position)));
        else if (t === '&' && r === '&')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '&&', e, this.position)));
        else if (t === '|' && r === '|')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '||', e, this.position)));
        else if (t === '+' && r === '+')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '++', e, this.position)));
        else if (t === '-' && r === '-')
          ((this.position += 2), this.tokens.push(new C('OPERATOR', '--', e, this.position)));
        else {
          this.position++;
          let i = '()[]{},.;:?'.includes(t) ? 'PUNCTUATION' : 'OPERATOR';
          this.tokens.push(new C(i, t, e, this.position));
        }
      }
    },
    Hi = class {
      constructor(e) {
        ((this.tokens = e), (this.position = 0));
      }
      parse() {
        if (this.isAtEnd()) throw new Error('Empty expression');
        let e = this.parseExpression();
        if ((this.match('PUNCTUATION', ';'), !this.isAtEnd()))
          throw new Error(`Unexpected token: ${this.current().value}`);
        return e;
      }
      parseExpression() {
        return this.parseAssignment();
      }
      parseAssignment() {
        let e = this.parseTernary();
        if (this.match('OPERATOR', '=')) {
          let t = this.parseAssignment();
          if (e.type === 'Identifier' || e.type === 'MemberExpression')
            return { type: 'AssignmentExpression', left: e, operator: '=', right: t };
          throw new Error('Invalid assignment target');
        }
        return e;
      }
      parseTernary() {
        let e = this.parseLogicalOr();
        if (this.match('PUNCTUATION', '?')) {
          let t = this.parseExpression();
          this.consume('PUNCTUATION', ':');
          let r = this.parseExpression();
          return { type: 'ConditionalExpression', test: e, consequent: t, alternate: r };
        }
        return e;
      }
      parseLogicalOr() {
        let e = this.parseLogicalAnd();
        for (; this.match('OPERATOR', '||'); ) {
          let t = this.previous().value,
            r = this.parseLogicalAnd();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseLogicalAnd() {
        let e = this.parseEquality();
        for (; this.match('OPERATOR', '&&'); ) {
          let t = this.previous().value,
            r = this.parseEquality();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseEquality() {
        let e = this.parseRelational();
        for (; this.match('OPERATOR', '==', '!=', '===', '!=='); ) {
          let t = this.previous().value,
            r = this.parseRelational();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseRelational() {
        let e = this.parseAdditive();
        for (; this.match('OPERATOR', '<', '>', '<=', '>='); ) {
          let t = this.previous().value,
            r = this.parseAdditive();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseAdditive() {
        let e = this.parseMultiplicative();
        for (; this.match('OPERATOR', '+', '-'); ) {
          let t = this.previous().value,
            r = this.parseMultiplicative();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseMultiplicative() {
        let e = this.parseUnary();
        for (; this.match('OPERATOR', '*', '/', '%'); ) {
          let t = this.previous().value,
            r = this.parseUnary();
          e = { type: 'BinaryExpression', operator: t, left: e, right: r };
        }
        return e;
      }
      parseUnary() {
        if (this.match('OPERATOR', '++', '--')) {
          let e = this.previous().value,
            t = this.parseUnary();
          return { type: 'UpdateExpression', operator: e, argument: t, prefix: !0 };
        }
        if (this.match('OPERATOR', '!', '-', '+')) {
          let e = this.previous().value,
            t = this.parseUnary();
          return { type: 'UnaryExpression', operator: e, argument: t, prefix: !0 };
        }
        return this.parsePostfix();
      }
      parsePostfix() {
        let e = this.parseMember();
        return this.match('OPERATOR', '++', '--')
          ? { type: 'UpdateExpression', operator: this.previous().value, argument: e, prefix: !1 }
          : e;
      }
      parseMember() {
        let e = this.parsePrimary();
        for (;;)
          if (this.match('PUNCTUATION', '.')) {
            let t = this.consume('IDENTIFIER');
            e = {
              type: 'MemberExpression',
              object: e,
              property: { type: 'Identifier', name: t.value },
              computed: !1,
            };
          } else if (this.match('PUNCTUATION', '[')) {
            let t = this.parseExpression();
            (this.consume('PUNCTUATION', ']'),
              (e = { type: 'MemberExpression', object: e, property: t, computed: !0 }));
          } else if (this.match('PUNCTUATION', '(')) {
            let t = this.parseArguments();
            e = { type: 'CallExpression', callee: e, arguments: t };
          } else break;
        return e;
      }
      parseArguments() {
        let e = [];
        if (!this.check('PUNCTUATION', ')'))
          do e.push(this.parseExpression());
          while (this.match('PUNCTUATION', ','));
        return (this.consume('PUNCTUATION', ')'), e);
      }
      parsePrimary() {
        if (this.match('NUMBER')) return { type: 'Literal', value: this.previous().value };
        if (this.match('STRING')) return { type: 'Literal', value: this.previous().value };
        if (this.match('BOOLEAN')) return { type: 'Literal', value: this.previous().value };
        if (this.match('NULL')) return { type: 'Literal', value: null };
        if (this.match('UNDEFINED')) return { type: 'Literal', value: void 0 };
        if (this.match('IDENTIFIER')) return { type: 'Identifier', name: this.previous().value };
        if (this.match('PUNCTUATION', '(')) {
          let e = this.parseExpression();
          return (this.consume('PUNCTUATION', ')'), e);
        }
        if (this.match('PUNCTUATION', '[')) return this.parseArrayLiteral();
        if (this.match('PUNCTUATION', '{')) return this.parseObjectLiteral();
        throw new Error(`Unexpected token: ${this.current().type} "${this.current().value}"`);
      }
      parseArrayLiteral() {
        let e = [];
        for (
          ;
          !this.check('PUNCTUATION', ']') &&
          !this.isAtEnd() &&
          (e.push(this.parseExpression()), this.match('PUNCTUATION', ','));

        )
          if (this.check('PUNCTUATION', ']')) break;
        return (this.consume('PUNCTUATION', ']'), { type: 'ArrayExpression', elements: e });
      }
      parseObjectLiteral() {
        let e = [];
        for (; !this.check('PUNCTUATION', '}') && !this.isAtEnd(); ) {
          let t,
            r = !1;
          if (this.match('STRING')) t = { type: 'Literal', value: this.previous().value };
          else if (this.match('IDENTIFIER'))
            t = { type: 'Identifier', name: this.previous().value };
          else if (this.match('PUNCTUATION', '['))
            ((t = this.parseExpression()), (r = !0), this.consume('PUNCTUATION', ']'));
          else throw new Error('Expected property key');
          this.consume('PUNCTUATION', ':');
          let n = this.parseExpression();
          if (
            (e.push({ type: 'Property', key: t, value: n, computed: r, shorthand: !1 }),
            this.match('PUNCTUATION', ','))
          ) {
            if (this.check('PUNCTUATION', '}')) break;
          } else break;
        }
        return (this.consume('PUNCTUATION', '}'), { type: 'ObjectExpression', properties: e });
      }
      match(...e) {
        for (let t = 0; t < e.length; t++) {
          let r = e[t];
          if (t === 0 && e.length > 1) {
            let n = r;
            for (let i = 1; i < e.length; i++) if (this.check(n, e[i])) return (this.advance(), !0);
            return !1;
          } else if (e.length === 1) return this.checkType(r) ? (this.advance(), !0) : !1;
        }
        return !1;
      }
      check(e, t) {
        return this.isAtEnd()
          ? !1
          : t !== void 0
            ? this.current().type === e && this.current().value === t
            : this.current().type === e;
      }
      checkType(e) {
        return this.isAtEnd() ? !1 : this.current().type === e;
      }
      advance() {
        return (this.isAtEnd() || this.position++, this.previous());
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
      consume(e, t) {
        if (t !== void 0) {
          if (this.check(e, t)) return this.advance();
          throw new Error(
            `Expected ${e} "${t}" but got ${this.current().type} "${this.current().value}"`
          );
        }
        if (this.check(e)) return this.advance();
        throw new Error(`Expected ${e} but got ${this.current().type} "${this.current().value}"`);
      }
    },
    Wi = class {
      evaluate({
        node: e,
        scope: t = {},
        context: r = null,
        allowGlobal: n = !1,
        forceBindingRootScopeToFunctions: i = !0,
      }) {
        switch (e.type) {
          case 'Literal':
            return e.value;
          case 'Identifier':
            if (e.name in t) {
              let p = t[e.name];
              return typeof p == 'function' ? p.bind(t) : p;
            }
            if (n && typeof globalThis[e.name] < 'u') {
              let p = globalThis[e.name];
              return typeof p == 'function' ? p.bind(globalThis) : p;
            }
            throw new Error(`Undefined variable: ${e.name}`);
          case 'MemberExpression':
            let s = this.evaluate({
              node: e.object,
              scope: t,
              context: r,
              allowGlobal: n,
              forceBindingRootScopeToFunctions: i,
            });
            if (s == null) throw new Error('Cannot read property of null or undefined');
            let a;
            if (e.computed) {
              let p = this.evaluate({
                node: e.property,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              });
              a = s[p];
            } else a = s[e.property.name];
            return typeof a == 'function' ? (i ? a.bind(t) : a.bind(s)) : a;
          case 'CallExpression':
            let o = e.arguments.map((p) =>
              this.evaluate({
                node: p,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              })
            );
            if (e.callee.type === 'MemberExpression') {
              let p = this.evaluate({
                  node: e.callee.object,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                }),
                b;
              if (e.callee.computed) {
                let h = this.evaluate({
                  node: e.callee.property,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                });
                b = p[h];
              } else b = p[e.callee.property.name];
              if (typeof b != 'function') throw new Error('Value is not a function');
              return b.apply(p, o);
            } else if (e.callee.type === 'Identifier') {
              let p = e.callee.name,
                b;
              if (p in t) b = t[p];
              else if (n && typeof globalThis[p] < 'u') b = globalThis[p];
              else throw new Error(`Undefined variable: ${p}`);
              if (typeof b != 'function') throw new Error('Value is not a function');
              let h = r !== null ? r : t;
              return b.apply(h, o);
            } else {
              let p = this.evaluate({
                node: e.callee,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              });
              if (typeof p != 'function') throw new Error('Value is not a function');
              return p.apply(r, o);
            }
          case 'UnaryExpression':
            let u = this.evaluate({
              node: e.argument,
              scope: t,
              context: r,
              allowGlobal: n,
              forceBindingRootScopeToFunctions: i,
            });
            switch (e.operator) {
              case '!':
                return !u;
              case '-':
                return -u;
              case '+':
                return +u;
              default:
                throw new Error(`Unknown unary operator: ${e.operator}`);
            }
          case 'UpdateExpression':
            if (e.argument.type === 'Identifier') {
              let p = e.argument.name;
              if (!(p in t)) throw new Error(`Undefined variable: ${p}`);
              let b = t[p];
              return (
                e.operator === '++' ? (t[p] = b + 1) : e.operator === '--' && (t[p] = b - 1),
                e.prefix ? t[p] : b
              );
            } else if (e.argument.type === 'MemberExpression') {
              let p = this.evaluate({
                  node: e.argument.object,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                }),
                b = e.argument.computed
                  ? this.evaluate({
                      node: e.argument.property,
                      scope: t,
                      context: r,
                      allowGlobal: n,
                      forceBindingRootScopeToFunctions: i,
                    })
                  : e.argument.property.name,
                h = p[b];
              return (
                e.operator === '++' ? (p[b] = h + 1) : e.operator === '--' && (p[b] = h - 1),
                e.prefix ? p[b] : h
              );
            }
            throw new Error('Invalid update expression target');
          case 'BinaryExpression':
            let c = this.evaluate({
                node: e.left,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              }),
              l = this.evaluate({
                node: e.right,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              });
            switch (e.operator) {
              case '+':
                return c + l;
              case '-':
                return c - l;
              case '*':
                return c * l;
              case '/':
                return c / l;
              case '%':
                return c % l;
              case '==':
                return c == l;
              case '!=':
                return c != l;
              case '===':
                return c === l;
              case '!==':
                return c !== l;
              case '<':
                return c < l;
              case '>':
                return c > l;
              case '<=':
                return c <= l;
              case '>=':
                return c >= l;
              case '&&':
                return c && l;
              case '||':
                return c || l;
              default:
                throw new Error(`Unknown binary operator: ${e.operator}`);
            }
          case 'ConditionalExpression':
            return this.evaluate({
              node: e.test,
              scope: t,
              context: r,
              allowGlobal: n,
              forceBindingRootScopeToFunctions: i,
            })
              ? this.evaluate({
                  node: e.consequent,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                })
              : this.evaluate({
                  node: e.alternate,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                });
          case 'AssignmentExpression':
            let g = this.evaluate({
              node: e.right,
              scope: t,
              context: r,
              allowGlobal: n,
              forceBindingRootScopeToFunctions: i,
            });
            if (e.left.type === 'Identifier') return ((t[e.left.name] = g), g);
            if (e.left.type === 'MemberExpression') {
              let p = this.evaluate({
                node: e.left.object,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              });
              if (e.left.computed) {
                let b = this.evaluate({
                  node: e.left.property,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                });
                p[b] = g;
              } else p[e.left.property.name] = g;
              return g;
            }
            throw new Error('Invalid assignment target');
          case 'ArrayExpression':
            return e.elements.map((p) =>
              this.evaluate({
                node: p,
                scope: t,
                context: r,
                allowGlobal: n,
                forceBindingRootScopeToFunctions: i,
              })
            );
          case 'ObjectExpression':
            let m = {};
            for (let p of e.properties) {
              let b = p.computed
                  ? this.evaluate({
                      node: p.key,
                      scope: t,
                      context: r,
                      allowGlobal: n,
                      forceBindingRootScopeToFunctions: i,
                    })
                  : p.key.type === 'Identifier'
                    ? p.key.name
                    : this.evaluate({
                        node: p.key,
                        scope: t,
                        context: r,
                        allowGlobal: n,
                        forceBindingRootScopeToFunctions: i,
                      }),
                h = this.evaluate({
                  node: p.value,
                  scope: t,
                  context: r,
                  allowGlobal: n,
                  forceBindingRootScopeToFunctions: i,
                });
              m[b] = h;
            }
            return m;
          default:
            throw new Error(`Unknown node type: ${e.type}`);
        }
      }
    };
  function Vi(e) {
    try {
      let r = new qi(e).tokenize(),
        i = new Hi(r).parse(),
        s = new Wi();
      return function (a = {}) {
        let {
          scope: o = {},
          context: u = null,
          allowGlobal: c = !1,
          forceBindingRootScopeToFunctions: l = !1,
        } = a;
        return s.evaluate({
          node: i,
          scope: o,
          context: u,
          allowGlobal: c,
          forceBindingRootScopeToFunctions: l,
        });
      };
    } catch (t) {
      throw new Error(`CSP Parser Error: ${t.message}`);
    }
  }
  function Ji(e, t) {
    let r = Yi(e);
    if (typeof t == 'function') return dr(r, t);
    let n = Zi(e, t, r);
    return cr.bind(null, e, t, n);
  }
  function Yi(e) {
    let t = {};
    return (Se(t, e), [t, ...Z(e)]);
  }
  function Zi(e, t, r) {
    return (n = () => {}, { scope: i = {}, params: s = [] } = {}) => {
      let a = ne([i, ...r]),
        u = Vi(t)({ scope: a, allowGlobal: !1, forceBindingRootScopeToFunctions: !0 });
      if (pe && typeof u == 'function') {
        let c = u.apply(u, s);
        c instanceof Promise ? c.then((l) => n(l)) : n(c);
      } else typeof u == 'object' && u instanceof Promise ? u.then((c) => n(c)) : n(u);
    };
  }
  function zr(e, t) {
    let r = Object.create(null),
      n = e.split(',');
    for (let i = 0; i < n.length; i++) r[n[i]] = !0;
    return t ? (i) => !!r[i.toLowerCase()] : (i) => !!r[i];
  }
  var Xi = 'itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly',
    wa = zr(
      Xi +
        ',async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected'
    ),
    Qi = Object.freeze({}),
    Ea = Object.freeze([]),
    Gi = Object.prototype.hasOwnProperty,
    Me = (e, t) => Gi.call(e, t),
    J = Array.isArray,
    ve = (e) => qr(e) === '[object Map]',
    es = (e) => typeof e == 'string',
    St = (e) => typeof e == 'symbol',
    Fe = (e) => e !== null && typeof e == 'object',
    ts = Object.prototype.toString,
    qr = (e) => ts.call(e),
    Hr = (e) => qr(e).slice(8, -1),
    Nt = (e) => es(e) && e !== 'NaN' && e[0] !== '-' && '' + parseInt(e, 10) === e,
    Le = (e) => {
      let t = Object.create(null);
      return (r) => t[r] || (t[r] = e(r));
    },
    rs = /-(\w)/g,
    Aa = Le((e) => e.replace(rs, (t, r) => (r ? r.toUpperCase() : ''))),
    ns = /\B([A-Z])/g,
    Oa = Le((e) => e.replace(ns, '-$1').toLowerCase()),
    Wr = Le((e) => e.charAt(0).toUpperCase() + e.slice(1)),
    Ta = Le((e) => (e ? `on${Wr(e)}` : '')),
    Vr = (e, t) => e !== t && (e === e || t === t),
    ct = new WeakMap(),
    fe = [],
    L,
    Y = Symbol('iterate'),
    lt = Symbol('Map key iterate');
  function is(e) {
    return e && e._isEffect === !0;
  }
  function ss(e, t = Qi) {
    is(e) && (e = e.raw);
    let r = us(e, t);
    return (t.lazy || r(), r);
  }
  function as(e) {
    e.active && (Jr(e), e.options.onStop && e.options.onStop(), (e.active = !1));
  }
  var os = 0;
  function us(e, t) {
    let r = function () {
      if (!r.active) return e();
      if (!fe.includes(r)) {
        Jr(r);
        try {
          return (ls(), fe.push(r), (L = r), e());
        } finally {
          (fe.pop(), Yr(), (L = fe[fe.length - 1]));
        }
      }
    };
    return (
      (r.id = os++),
      (r.allowRecurse = !!t.allowRecurse),
      (r._isEffect = !0),
      (r.active = !0),
      (r.raw = e),
      (r.deps = []),
      (r.options = t),
      r
    );
  }
  function Jr(e) {
    let { deps: t } = e;
    if (t.length) {
      for (let r = 0; r < t.length; r++) t[r].delete(e);
      t.length = 0;
    }
  }
  var ee = !0,
    Ct = [];
  function cs() {
    (Ct.push(ee), (ee = !1));
  }
  function ls() {
    (Ct.push(ee), (ee = !0));
  }
  function Yr() {
    let e = Ct.pop();
    ee = e === void 0 ? !0 : e;
  }
  function M(e, t, r) {
    if (!ee || L === void 0) return;
    let n = ct.get(e);
    n || ct.set(e, (n = new Map()));
    let i = n.get(r);
    (i || n.set(r, (i = new Set())),
      i.has(L) ||
        (i.add(L),
        L.deps.push(i),
        L.options.onTrack && L.options.onTrack({ effect: L, target: e, type: t, key: r })));
  }
  function B(e, t, r, n, i, s) {
    let a = ct.get(e);
    if (!a) return;
    let o = new Set(),
      u = (l) => {
        l &&
          l.forEach((v) => {
            (v !== L || v.allowRecurse) && o.add(v);
          });
      };
    if (t === 'clear') a.forEach(u);
    else if (r === 'length' && J(e))
      a.forEach((l, v) => {
        (v === 'length' || v >= n) && u(l);
      });
    else
      switch ((r !== void 0 && u(a.get(r)), t)) {
        case 'add':
          J(e) ? Nt(r) && u(a.get('length')) : (u(a.get(Y)), ve(e) && u(a.get(lt)));
          break;
        case 'delete':
          J(e) || (u(a.get(Y)), ve(e) && u(a.get(lt)));
          break;
        case 'set':
          ve(e) && u(a.get(Y));
          break;
      }
    let c = (l) => {
      (l.options.onTrigger &&
        l.options.onTrigger({
          effect: l,
          target: e,
          key: r,
          type: t,
          newValue: n,
          oldValue: i,
          oldTarget: s,
        }),
        l.options.scheduler ? l.options.scheduler(l) : l());
    };
    o.forEach(c);
  }
  var fs = zr('__proto__,__v_isRef,__isVue'),
    Zr = new Set(
      Object.getOwnPropertyNames(Symbol)
        .map((e) => Symbol[e])
        .filter(St)
    ),
    ds = Xr(),
    ps = Xr(!0),
    Kt = hs();
  function hs() {
    let e = {};
    return (
      ['includes', 'indexOf', 'lastIndexOf'].forEach((t) => {
        e[t] = function (...r) {
          let n = w(this);
          for (let s = 0, a = this.length; s < a; s++) M(n, 'get', s + '');
          let i = n[t](...r);
          return i === -1 || i === !1 ? n[t](...r.map(w)) : i;
        };
      }),
      ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((t) => {
        e[t] = function (...r) {
          cs();
          let n = w(this)[t].apply(this, r);
          return (Yr(), n);
        };
      }),
      e
    );
  }
  function Xr(e = !1, t = !1) {
    return function (n, i, s) {
      if (i === '__v_isReactive') return !e;
      if (i === '__v_isReadonly') return e;
      if (i === '__v_raw' && s === (e ? (t ? Is : tn) : t ? Cs : en).get(n)) return n;
      let a = J(n);
      if (!e && a && Me(Kt, i)) return Reflect.get(Kt, i, s);
      let o = Reflect.get(n, i, s);
      return (St(i) ? Zr.has(i) : fs(i)) || (e || M(n, 'get', i), t)
        ? o
        : ft(o)
          ? !a || !Nt(i)
            ? o.value
            : o
          : Fe(o)
            ? e
              ? rn(o)
              : Rt(o)
            : o;
    };
  }
  var vs = gs();
  function gs(e = !1) {
    return function (r, n, i, s) {
      let a = r[n];
      if (!e && ((i = w(i)), (a = w(a)), !J(r) && ft(a) && !ft(i))) return ((a.value = i), !0);
      let o = J(r) && Nt(n) ? Number(n) < r.length : Me(r, n),
        u = Reflect.set(r, n, i, s);
      return (r === w(s) && (o ? Vr(i, a) && B(r, 'set', n, i, a) : B(r, 'add', n, i)), u);
    };
  }
  function _s(e, t) {
    let r = Me(e, t),
      n = e[t],
      i = Reflect.deleteProperty(e, t);
    return (i && r && B(e, 'delete', t, void 0, n), i);
  }
  function bs(e, t) {
    let r = Reflect.has(e, t);
    return ((!St(t) || !Zr.has(t)) && M(e, 'has', t), r);
  }
  function ms(e) {
    return (M(e, 'iterate', J(e) ? 'length' : Y), Reflect.ownKeys(e));
  }
  var ys = { get: ds, set: vs, deleteProperty: _s, has: bs, ownKeys: ms },
    xs = {
      get: ps,
      set(e, t) {
        return (
          console.warn(`Set operation on key "${String(t)}" failed: target is readonly.`, e),
          !0
        );
      },
      deleteProperty(e, t) {
        return (
          console.warn(`Delete operation on key "${String(t)}" failed: target is readonly.`, e),
          !0
        );
      },
    },
    It = (e) => (Fe(e) ? Rt(e) : e),
    kt = (e) => (Fe(e) ? rn(e) : e),
    Pt = (e) => e,
    De = (e) => Reflect.getPrototypeOf(e);
  function ye(e, t, r = !1, n = !1) {
    e = e.__v_raw;
    let i = w(e),
      s = w(t);
    (t !== s && !r && M(i, 'get', t), !r && M(i, 'get', s));
    let { has: a } = De(i),
      o = n ? Pt : r ? kt : It;
    if (a.call(i, t)) return o(e.get(t));
    if (a.call(i, s)) return o(e.get(s));
    e !== i && e.get(t);
  }
  function xe(e, t = !1) {
    let r = this.__v_raw,
      n = w(r),
      i = w(e);
    return (
      e !== i && !t && M(n, 'has', e),
      !t && M(n, 'has', i),
      e === i ? r.has(e) : r.has(e) || r.has(i)
    );
  }
  function we(e, t = !1) {
    return ((e = e.__v_raw), !t && M(w(e), 'iterate', Y), Reflect.get(e, 'size', e));
  }
  function Bt(e) {
    e = w(e);
    let t = w(this);
    return (De(t).has.call(t, e) || (t.add(e), B(t, 'add', e, e)), this);
  }
  function zt(e, t) {
    t = w(t);
    let r = w(this),
      { has: n, get: i } = De(r),
      s = n.call(r, e);
    s ? Gr(r, n, e) : ((e = w(e)), (s = n.call(r, e)));
    let a = i.call(r, e);
    return (r.set(e, t), s ? Vr(t, a) && B(r, 'set', e, t, a) : B(r, 'add', e, t), this);
  }
  function qt(e) {
    let t = w(this),
      { has: r, get: n } = De(t),
      i = r.call(t, e);
    i ? Gr(t, r, e) : ((e = w(e)), (i = r.call(t, e)));
    let s = n ? n.call(t, e) : void 0,
      a = t.delete(e);
    return (i && B(t, 'delete', e, void 0, s), a);
  }
  function Ht() {
    let e = w(this),
      t = e.size !== 0,
      r = ve(e) ? new Map(e) : new Set(e),
      n = e.clear();
    return (t && B(e, 'clear', void 0, void 0, r), n);
  }
  function Ee(e, t) {
    return function (n, i) {
      let s = this,
        a = s.__v_raw,
        o = w(a),
        u = t ? Pt : e ? kt : It;
      return (!e && M(o, 'iterate', Y), a.forEach((c, l) => n.call(i, u(c), u(l), s)));
    };
  }
  function Ae(e, t, r) {
    return function (...n) {
      let i = this.__v_raw,
        s = w(i),
        a = ve(s),
        o = e === 'entries' || (e === Symbol.iterator && a),
        u = e === 'keys' && a,
        c = i[e](...n),
        l = r ? Pt : t ? kt : It;
      return (
        !t && M(s, 'iterate', u ? lt : Y),
        {
          next() {
            let { value: v, done: g } = c.next();
            return g ? { value: v, done: g } : { value: o ? [l(v[0]), l(v[1])] : l(v), done: g };
          },
          [Symbol.iterator]() {
            return this;
          },
        }
      );
    };
  }
  function j(e) {
    return function (...t) {
      {
        let r = t[0] ? `on key "${t[0]}" ` : '';
        console.warn(`${Wr(e)} operation ${r}failed: target is readonly.`, w(this));
      }
      return e === 'delete' ? !1 : this;
    };
  }
  function ws() {
    let e = {
        get(s) {
          return ye(this, s);
        },
        get size() {
          return we(this);
        },
        has: xe,
        add: Bt,
        set: zt,
        delete: qt,
        clear: Ht,
        forEach: Ee(!1, !1),
      },
      t = {
        get(s) {
          return ye(this, s, !1, !0);
        },
        get size() {
          return we(this);
        },
        has: xe,
        add: Bt,
        set: zt,
        delete: qt,
        clear: Ht,
        forEach: Ee(!1, !0),
      },
      r = {
        get(s) {
          return ye(this, s, !0);
        },
        get size() {
          return we(this, !0);
        },
        has(s) {
          return xe.call(this, s, !0);
        },
        add: j('add'),
        set: j('set'),
        delete: j('delete'),
        clear: j('clear'),
        forEach: Ee(!0, !1),
      },
      n = {
        get(s) {
          return ye(this, s, !0, !0);
        },
        get size() {
          return we(this, !0);
        },
        has(s) {
          return xe.call(this, s, !0);
        },
        add: j('add'),
        set: j('set'),
        delete: j('delete'),
        clear: j('clear'),
        forEach: Ee(!0, !0),
      };
    return (
      ['keys', 'values', 'entries', Symbol.iterator].forEach((s) => {
        ((e[s] = Ae(s, !1, !1)),
          (r[s] = Ae(s, !0, !1)),
          (t[s] = Ae(s, !1, !0)),
          (n[s] = Ae(s, !0, !0)));
      }),
      [e, r, t, n]
    );
  }
  var [Es, As, Os, Ts] = ws();
  function Qr(e, t) {
    let r = t ? (e ? Ts : Os) : e ? As : Es;
    return (n, i, s) =>
      i === '__v_isReactive'
        ? !e
        : i === '__v_isReadonly'
          ? e
          : i === '__v_raw'
            ? n
            : Reflect.get(Me(r, i) && i in n ? r : n, i, s);
  }
  var Ss = { get: Qr(!1, !1) },
    Ns = { get: Qr(!0, !1) };
  function Gr(e, t, r) {
    let n = w(r);
    if (n !== r && t.call(e, n)) {
      let i = Hr(e);
      console.warn(
        `Reactive ${i} contains both the raw and reactive versions of the same object${i === 'Map' ? ' as keys' : ''}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
      );
    }
  }
  var en = new WeakMap(),
    Cs = new WeakMap(),
    tn = new WeakMap(),
    Is = new WeakMap();
  function ks(e) {
    switch (e) {
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
  function Ps(e) {
    return e.__v_skip || !Object.isExtensible(e) ? 0 : ks(Hr(e));
  }
  function Rt(e) {
    return e && e.__v_isReadonly ? e : nn(e, !1, ys, Ss, en);
  }
  function rn(e) {
    return nn(e, !0, xs, Ns, tn);
  }
  function nn(e, t, r, n, i) {
    if (!Fe(e)) return (console.warn(`value cannot be made reactive: ${String(e)}`), e);
    if (e.__v_raw && !(t && e.__v_isReactive)) return e;
    let s = i.get(e);
    if (s) return s;
    let a = Ps(e);
    if (a === 0) return e;
    let o = new Proxy(e, a === 2 ? n : r);
    return (i.set(e, o), o);
  }
  function w(e) {
    return (e && w(e.__v_raw)) || e;
  }
  function ft(e) {
    return !!(e && e.__v_isRef === !0);
  }
  F('nextTick', () => At);
  F('dispatch', (e) => he.bind(he, e));
  F('watch', (e, { evaluateLater: t, cleanup: r }) => (n, i) => {
    let s = t(n),
      o = Xt(() => {
        let u;
        return (s((c) => (u = c)), u);
      }, i);
    r(o);
  });
  F('store', Ui);
  F('data', (e) => sr(e));
  F('root', (e) => ke(e));
  F('refs', (e) => (e._x_refs_proxy || (e._x_refs_proxy = ne(Rs(e))), e._x_refs_proxy));
  function Rs(e) {
    let t = [];
    return (
      se(e, (r) => {
        r._x_refs && t.push(r._x_refs);
      }),
      t
    );
  }
  var Je = {};
  function sn(e) {
    return (Je[e] || (Je[e] = 0), ++Je[e]);
  }
  function Ms(e, t) {
    return se(e, (r) => {
      if (r._x_ids && r._x_ids[t]) return !0;
    });
  }
  function Fs(e, t) {
    (e._x_ids || (e._x_ids = {}), e._x_ids[t] || (e._x_ids[t] = sn(t)));
  }
  F('id', (e, { cleanup: t }) => (r, n = null) => {
    let i = `${r}${n ? `-${n}` : ''}`;
    return Ls(e, i, t, () => {
      let s = Ms(e, r),
        a = s ? s._x_ids[r] : sn(r);
      return n ? `${r}-${a}-${n}` : `${r}-${a}`;
    });
  });
  Re((e, t) => {
    e._x_id && (t._x_id = e._x_id);
  });
  function Ls(e, t, r, n) {
    if ((e._x_id || (e._x_id = {}), e._x_id[t])) return e._x_id[t];
    let i = n();
    return (
      (e._x_id[t] = i),
      r(() => {
        delete e._x_id[t];
      }),
      i
    );
  }
  F('el', (e) => e);
  an('Focus', 'focus', 'focus');
  an('Persist', 'persist', 'persist');
  function an(e, t, r) {
    F(t, (n) =>
      R(
        `You can't use [$${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${r}`,
        n
      )
    );
  }
  S('modelable', (e, { expression: t }, { effect: r, evaluateLater: n, cleanup: i }) => {
    let s = n(t),
      a = () => {
        let l;
        return (s((v) => (l = v)), l);
      },
      o = n(`${t} = __placeholder`),
      u = (l) => o(() => {}, { scope: { __placeholder: l } }),
      c = a();
    (u(c),
      queueMicrotask(() => {
        if (!e._x_model) return;
        e._x_removeModelListeners.default();
        let l = e._x_model.get,
          v = e._x_model.set,
          g = $r(
            {
              get() {
                return l();
              },
              set(m) {
                v(m);
              },
            },
            {
              get() {
                return a();
              },
              set(m) {
                u(m);
              },
            }
          );
        i(g);
      }));
  });
  S('teleport', (e, { modifiers: t, expression: r }, { cleanup: n }) => {
    e.tagName.toLowerCase() !== 'template' &&
      R('x-teleport can only be used on a <template> tag', e);
    let i = Wt(r),
      s = e.content.cloneNode(!0).firstElementChild;
    ((e._x_teleport = s),
      (s._x_teleportBack = e),
      e.setAttribute('data-teleport-template', !0),
      s.setAttribute('data-teleport-target', !0),
      e._x_forwardEvents &&
        e._x_forwardEvents.forEach((o) => {
          s.addEventListener(o, (u) => {
            (u.stopPropagation(), e.dispatchEvent(new u.constructor(u.type, u)));
          });
        }),
      _e(s, {}, e));
    let a = (o, u, c) => {
      c.includes('prepend')
        ? u.parentNode.insertBefore(o, u)
        : c.includes('append')
          ? u.parentNode.insertBefore(o, u.nextSibling)
          : u.appendChild(o);
    };
    (A(() => {
      (a(s, i, t),
        z(() => {
          U(s);
        })());
    }),
      (e._x_teleportPutBack = () => {
        let o = Wt(r);
        A(() => {
          a(e._x_teleport, o, t);
        });
      }),
      n(() =>
        A(() => {
          (s.remove(), ae(s));
        })
      ));
  });
  var Ds = document.createElement('div');
  function Wt(e) {
    let t = z(
      () => document.querySelector(e),
      () => Ds
    )();
    return (t || R(`Cannot find x-teleport element for selector: "${e}"`), t);
  }
  var on = () => {};
  on.inline = (e, { modifiers: t }, { cleanup: r }) => {
    (t.includes('self') ? (e._x_ignoreSelf = !0) : (e._x_ignore = !0),
      r(() => {
        t.includes('self') ? delete e._x_ignoreSelf : delete e._x_ignore;
      }));
  };
  S('ignore', on);
  S(
    'effect',
    z((e, { expression: t }, { effect: r }) => {
      r(P(e, t));
    })
  );
  function dt(e, t, r, n) {
    let i = e,
      s = (u) => n(u),
      a = {},
      o = (u, c) => (l) => c(u, l);
    if (
      (r.includes('dot') && (t = Us(t)),
      r.includes('camel') && (t = $s(t)),
      r.includes('passive') && (a.passive = !0),
      r.includes('capture') && (a.capture = !0),
      r.includes('window') && (i = window),
      r.includes('document') && (i = document),
      r.includes('debounce'))
    ) {
      let u = r[r.indexOf('debounce') + 1] || 'invalid-wait',
        c = Ie(u.split('ms')[0]) ? Number(u.split('ms')[0]) : 250;
      s = Dr(s, c);
    }
    if (r.includes('throttle')) {
      let u = r[r.indexOf('throttle') + 1] || 'invalid-wait',
        c = Ie(u.split('ms')[0]) ? Number(u.split('ms')[0]) : 250;
      s = Ur(s, c);
    }
    return (
      r.includes('prevent') &&
        (s = o(s, (u, c) => {
          (c.preventDefault(), u(c));
        })),
      r.includes('stop') &&
        (s = o(s, (u, c) => {
          (c.stopPropagation(), u(c));
        })),
      r.includes('once') &&
        (s = o(s, (u, c) => {
          (u(c), i.removeEventListener(t, s, a));
        })),
      (r.includes('away') || r.includes('outside')) &&
        ((i = document),
        (s = o(s, (u, c) => {
          e.contains(c.target) ||
            (c.target.isConnected !== !1 &&
              ((e.offsetWidth < 1 && e.offsetHeight < 1) || (e._x_isShown !== !1 && u(c))));
        }))),
      r.includes('self') &&
        (s = o(s, (u, c) => {
          c.target === e && u(c);
        })),
      (Ks(t) || un(t)) &&
        (s = o(s, (u, c) => {
          Bs(c, r) || u(c);
        })),
      i.addEventListener(t, s, a),
      () => {
        i.removeEventListener(t, s, a);
      }
    );
  }
  function Us(e) {
    return e.replace(/-/g, '.');
  }
  function $s(e) {
    return e.toLowerCase().replace(/-(\w)/g, (t, r) => r.toUpperCase());
  }
  function Ie(e) {
    return !Array.isArray(e) && !isNaN(e);
  }
  function js(e) {
    return [' ', '_'].includes(e)
      ? e
      : e
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[_\s]/, '-')
          .toLowerCase();
  }
  function Ks(e) {
    return ['keydown', 'keyup'].includes(e);
  }
  function un(e) {
    return ['contextmenu', 'click', 'mouse'].some((t) => e.includes(t));
  }
  function Bs(e, t) {
    let r = t.filter(
      (s) =>
        ![
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
        ].includes(s)
    );
    if (r.includes('debounce')) {
      let s = r.indexOf('debounce');
      r.splice(s, Ie((r[s + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }
    if (r.includes('throttle')) {
      let s = r.indexOf('throttle');
      r.splice(s, Ie((r[s + 1] || 'invalid-wait').split('ms')[0]) ? 2 : 1);
    }
    if (r.length === 0 || (r.length === 1 && Vt(e.key).includes(r[0]))) return !1;
    let i = ['ctrl', 'shift', 'alt', 'meta', 'cmd', 'super'].filter((s) => r.includes(s));
    return (
      (r = r.filter((s) => !i.includes(s))),
      !(
        i.length > 0 &&
        i.filter((a) => ((a === 'cmd' || a === 'super') && (a = 'meta'), e[`${a}Key`])).length ===
          i.length &&
        (un(e.type) || Vt(e.key).includes(r[0]))
      )
    );
  }
  function Vt(e) {
    if (!e) return [];
    e = js(e);
    let t = {
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
    return (
      (t[e] = e),
      Object.keys(t)
        .map((r) => {
          if (t[r] === e) return r;
        })
        .filter((r) => r)
    );
  }
  S('model', (e, { modifiers: t, expression: r }, { effect: n, cleanup: i }) => {
    let s = e;
    t.includes('parent') && (s = e.parentNode);
    let a = P(s, r),
      o;
    typeof r == 'string'
      ? (o = P(s, `${r} = __placeholder`))
      : typeof r == 'function' && typeof r() == 'string'
        ? (o = P(s, `${r()} = __placeholder`))
        : (o = () => {});
    let u = () => {
        let g;
        return (a((m) => (g = m)), Jt(g) ? g.get() : g);
      },
      c = (g) => {
        let m;
        (a((p) => (m = p)), Jt(m) ? m.set(g) : o(() => {}, { scope: { __placeholder: g } }));
      };
    typeof r == 'string' &&
      e.type === 'radio' &&
      A(() => {
        e.hasAttribute('name') || e.setAttribute('name', r);
      });
    let l =
        e.tagName.toLowerCase() === 'select' ||
        ['checkbox', 'radio'].includes(e.type) ||
        t.includes('lazy')
          ? 'change'
          : 'input',
      v = K
        ? () => {}
        : dt(e, l, t, (g) => {
            c(Ye(e, t, g, u()));
          });
    if (
      (t.includes('fill') &&
        ([void 0, null, ''].includes(u()) ||
          (Tt(e) && Array.isArray(u())) ||
          (e.tagName.toLowerCase() === 'select' && e.multiple)) &&
        c(Ye(e, t, { target: e }, u())),
      e._x_removeModelListeners || (e._x_removeModelListeners = {}),
      (e._x_removeModelListeners.default = v),
      i(() => e._x_removeModelListeners.default()),
      e.form)
    ) {
      let g = dt(e.form, 'reset', [], (m) => {
        At(() => e._x_model && e._x_model.set(Ye(e, t, { target: e }, u())));
      });
      i(() => g());
    }
    ((e._x_model = {
      get() {
        return u();
      },
      set(g) {
        c(g);
      },
    }),
      (e._x_forceModelUpdate = (g) => {
        (g === void 0 && typeof r == 'string' && r.match(/\./) && (g = ''),
          (window.fromModel = !0),
          A(() => Pr(e, 'value', g)),
          delete window.fromModel);
      }),
      n(() => {
        let g = u();
        (t.includes('unintrusive') && document.activeElement.isSameNode(e)) ||
          e._x_forceModelUpdate(g);
      }));
  });
  function Ye(e, t, r, n) {
    return A(() => {
      if (r instanceof CustomEvent && r.detail !== void 0)
        return r.detail !== null && r.detail !== void 0 ? r.detail : r.target.value;
      if (Tt(e))
        if (Array.isArray(n)) {
          let i = null;
          return (
            t.includes('number')
              ? (i = Ze(r.target.value))
              : t.includes('boolean')
                ? (i = Oe(r.target.value))
                : (i = r.target.value),
            r.target.checked ? (n.includes(i) ? n : n.concat([i])) : n.filter((s) => !zs(s, i))
          );
        } else return r.target.checked;
      else {
        if (e.tagName.toLowerCase() === 'select' && e.multiple)
          return t.includes('number')
            ? Array.from(r.target.selectedOptions).map((i) => {
                let s = i.value || i.text;
                return Ze(s);
              })
            : t.includes('boolean')
              ? Array.from(r.target.selectedOptions).map((i) => {
                  let s = i.value || i.text;
                  return Oe(s);
                })
              : Array.from(r.target.selectedOptions).map((i) => i.value || i.text);
        {
          let i;
          return (
            Lr(e) ? (r.target.checked ? (i = r.target.value) : (i = n)) : (i = r.target.value),
            t.includes('number')
              ? Ze(i)
              : t.includes('boolean')
                ? Oe(i)
                : t.includes('trim')
                  ? i.trim()
                  : i
          );
        }
      }
    });
  }
  function Ze(e) {
    let t = e ? parseFloat(e) : null;
    return qs(t) ? t : e;
  }
  function zs(e, t) {
    return e == t;
  }
  function qs(e) {
    return !Array.isArray(e) && !isNaN(e);
  }
  function Jt(e) {
    return (
      e !== null && typeof e == 'object' && typeof e.get == 'function' && typeof e.set == 'function'
    );
  }
  S('cloak', (e) => queueMicrotask(() => A(() => e.removeAttribute(ie('cloak')))));
  Tr(() => `[${ie('init')}]`);
  S(
    'init',
    z((e, { expression: t }, { evaluate: r }) =>
      typeof t == 'string' ? !!t.trim() && r(t, {}, !1) : r(t, {}, !1)
    )
  );
  S('text', (e, { expression: t }, { effect: r, evaluateLater: n }) => {
    let i = n(t);
    r(() => {
      i((s) => {
        A(() => {
          e.textContent = s;
        });
      });
    });
  });
  S('html', (e, { expression: t }, { effect: r, evaluateLater: n }) => {
    let i = n(t);
    r(() => {
      i((s) => {
        A(() => {
          ((e.innerHTML = s), (e._x_ignoreSelf = !0), U(e), delete e._x_ignoreSelf);
        });
      });
    });
  });
  xt(gr(':', _r(ie('bind:'))));
  var cn = (
    e,
    { value: t, modifiers: r, expression: n, original: i },
    { effect: s, cleanup: a }
  ) => {
    if (!t) {
      let u = {};
      (ji(u),
        P(e, n)(
          (l) => {
            Kr(e, l, i);
          },
          { scope: u }
        ));
      return;
    }
    if (t === 'key') return Hs(e, n);
    if (e._x_inlineBindings && e._x_inlineBindings[t] && e._x_inlineBindings[t].extract) return;
    let o = P(e, n);
    (s(() =>
      o((u) => {
        (u === void 0 && typeof n == 'string' && n.match(/\./) && (u = ''),
          A(() => Pr(e, t, u, r)));
      })
    ),
      a(() => {
        (e._x_undoAddedClasses && e._x_undoAddedClasses(),
          e._x_undoAddedStyles && e._x_undoAddedStyles());
      }));
  };
  cn.inline = (e, { value: t, modifiers: r, expression: n }) => {
    t &&
      (e._x_inlineBindings || (e._x_inlineBindings = {}),
      (e._x_inlineBindings[t] = { expression: n, extract: !1 }));
  };
  S('bind', cn);
  function Hs(e, t) {
    e._x_keyExpression = t;
  }
  Or(() => `[${ie('data')}]`);
  S('data', (e, { expression: t }, { cleanup: r }) => {
    if (Ws(e)) return;
    t = t === '' ? '{}' : t;
    let n = {};
    Se(n, e);
    let i = {};
    Bi(i, n);
    let s = V(e, t, { scope: i });
    ((s === void 0 || s === !0) && (s = {}), Se(s, e));
    let a = te(s);
    ar(a);
    let o = _e(e, a);
    (a.init && V(e, a.init),
      r(() => {
        (a.destroy && V(e, a.destroy), o());
      }));
  });
  Re((e, t) => {
    e._x_dataStack &&
      ((t._x_dataStack = e._x_dataStack), t.setAttribute('data-has-alpine-state', !0));
  });
  function Ws(e) {
    return K ? (ut ? !0 : e.hasAttribute('data-has-alpine-state')) : !1;
  }
  S('show', (e, { modifiers: t, expression: r }, { effect: n }) => {
    let i = P(e, r);
    (e._x_doHide ||
      (e._x_doHide = () => {
        A(() => {
          e.style.setProperty('display', 'none', t.includes('important') ? 'important' : void 0);
        });
      }),
      e._x_doShow ||
        (e._x_doShow = () => {
          A(() => {
            e.style.length === 1 && e.style.display === 'none'
              ? e.removeAttribute('style')
              : e.style.removeProperty('display');
          });
        }));
    let s = () => {
        (e._x_doHide(), (e._x_isShown = !1));
      },
      a = () => {
        (e._x_doShow(), (e._x_isShown = !0));
      },
      o = () => setTimeout(a),
      u = at(
        (v) => (v ? a() : s()),
        (v) => {
          typeof e._x_toggleAndCascadeWithTransitions == 'function'
            ? e._x_toggleAndCascadeWithTransitions(e, v, a, s)
            : v
              ? o()
              : s();
        }
      ),
      c,
      l = !0;
    n(() =>
      i((v) => {
        (!l && v === c) || (t.includes('immediate') && (v ? o() : s()), u(v), (c = v), (l = !1));
      })
    );
  });
  S('for', (e, { expression: t }, { effect: r, cleanup: n }) => {
    let i = Js(t),
      s = P(e, i.items),
      a = P(e, e._x_keyExpression || 'index');
    ((e._x_prevKeys = []),
      (e._x_lookup = {}),
      r(() => Vs(e, i, s, a)),
      n(() => {
        (Object.values(e._x_lookup).forEach((o) =>
          A(() => {
            (ae(o), o.remove());
          })
        ),
          delete e._x_prevKeys,
          delete e._x_lookup);
      }));
  });
  function Vs(e, t, r, n) {
    let i = (a) => typeof a == 'object' && !Array.isArray(a),
      s = e;
    r((a) => {
      (Ys(a) && a >= 0 && (a = Array.from(Array(a).keys(), (h) => h + 1)),
        a === void 0 && (a = []));
      let o = e._x_lookup,
        u = e._x_prevKeys,
        c = [],
        l = [];
      if (i(a))
        a = Object.entries(a).map(([h, y]) => {
          let E = Yt(t, y, h, a);
          (n(
            (N) => {
              (l.includes(N) && R('Duplicate key on x-for', e), l.push(N));
            },
            { scope: { index: h, ...E } }
          ),
            c.push(E));
        });
      else
        for (let h = 0; h < a.length; h++) {
          let y = Yt(t, a[h], h, a);
          (n(
            (E) => {
              (l.includes(E) && R('Duplicate key on x-for', e), l.push(E));
            },
            { scope: { index: h, ...y } }
          ),
            c.push(y));
        }
      let v = [],
        g = [],
        m = [],
        p = [];
      for (let h = 0; h < u.length; h++) {
        let y = u[h];
        l.indexOf(y) === -1 && m.push(y);
      }
      u = u.filter((h) => !m.includes(h));
      let b = 'template';
      for (let h = 0; h < l.length; h++) {
        let y = l[h],
          E = u.indexOf(y);
        if (E === -1) (u.splice(h, 0, y), v.push([b, h]));
        else if (E !== h) {
          let N = u.splice(h, 1)[0],
            I = u.splice(E - 1, 1)[0];
          (u.splice(h, 0, I), u.splice(E, 0, N), g.push([N, I]));
        } else p.push(y);
        b = y;
      }
      for (let h = 0; h < m.length; h++) {
        let y = m[h];
        y in o &&
          (A(() => {
            (ae(o[y]), o[y].remove());
          }),
          delete o[y]);
      }
      for (let h = 0; h < g.length; h++) {
        let [y, E] = g[h],
          N = o[y],
          I = o[E],
          x = document.createElement('div');
        (A(() => {
          (I || R('x-for ":key" is undefined or invalid', s, E, o),
            I.after(x),
            N.after(I),
            I._x_currentIfEl && I.after(I._x_currentIfEl),
            x.before(N),
            N._x_currentIfEl && N.after(N._x_currentIfEl),
            x.remove());
        }),
          I._x_refreshXForScope(c[l.indexOf(E)]));
      }
      for (let h = 0; h < v.length; h++) {
        let [y, E] = v[h],
          N = y === 'template' ? s : o[y];
        N._x_currentIfEl && (N = N._x_currentIfEl);
        let I = c[E],
          x = l[E],
          f = document.importNode(s.content, !0).firstElementChild,
          d = te(I);
        (_e(f, d, s),
          (f._x_refreshXForScope = (_) => {
            Object.entries(_).forEach(([T, O]) => {
              d[T] = O;
            });
          }),
          A(() => {
            (N.after(f), z(() => U(f))());
          }),
          typeof x == 'object' &&
            R('x-for key cannot be an object, it must be a string or an integer', s),
          (o[x] = f));
      }
      for (let h = 0; h < p.length; h++) o[p[h]]._x_refreshXForScope(c[l.indexOf(p[h])]);
      s._x_prevKeys = l;
    });
  }
  function Js(e) {
    let t = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
      r = /^\s*\(|\)\s*$/g,
      n = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
      i = e.match(n);
    if (!i) return;
    let s = {};
    s.items = i[2].trim();
    let a = i[1].replace(r, '').trim(),
      o = a.match(t);
    return (
      o
        ? ((s.item = a.replace(t, '').trim()),
          (s.index = o[1].trim()),
          o[2] && (s.collection = o[2].trim()))
        : (s.item = a),
      s
    );
  }
  function Yt(e, t, r, n) {
    let i = {};
    return (
      /^\[.*\]$/.test(e.item) && Array.isArray(t)
        ? e.item
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((a) => a.trim())
            .forEach((a, o) => {
              i[a] = t[o];
            })
        : /^\{.*\}$/.test(e.item) && !Array.isArray(t) && typeof t == 'object'
          ? e.item
              .replace('{', '')
              .replace('}', '')
              .split(',')
              .map((a) => a.trim())
              .forEach((a) => {
                i[a] = t[a];
              })
          : (i[e.item] = t),
      e.index && (i[e.index] = r),
      e.collection && (i[e.collection] = n),
      i
    );
  }
  function Ys(e) {
    return !Array.isArray(e) && !isNaN(e);
  }
  function ln() {}
  ln.inline = (e, { expression: t }, { cleanup: r }) => {
    let n = ke(e);
    (n._x_refs || (n._x_refs = {}), (n._x_refs[t] = e), r(() => delete n._x_refs[t]));
  };
  S('ref', ln);
  S('if', (e, { expression: t }, { effect: r, cleanup: n }) => {
    e.tagName.toLowerCase() !== 'template' && R('x-if can only be used on a <template> tag', e);
    let i = P(e, t),
      s = () => {
        if (e._x_currentIfEl) return e._x_currentIfEl;
        let o = e.content.cloneNode(!0).firstElementChild;
        return (
          _e(o, {}, e),
          A(() => {
            (e.after(o), z(() => U(o))());
          }),
          (e._x_currentIfEl = o),
          (e._x_undoIf = () => {
            (A(() => {
              (ae(o), o.remove());
            }),
              delete e._x_currentIfEl);
          }),
          o
        );
      },
      a = () => {
        e._x_undoIf && (e._x_undoIf(), delete e._x_undoIf);
      };
    (r(() =>
      i((o) => {
        o ? s() : a();
      })
    ),
      n(() => e._x_undoIf && e._x_undoIf()));
  });
  S('id', (e, { expression: t }, { evaluate: r }) => {
    r(t).forEach((i) => Fs(e, i));
  });
  Re((e, t) => {
    e._x_ids && (t._x_ids = e._x_ids);
  });
  xt(gr('@', _r(ie('on:'))));
  S(
    'on',
    z((e, { value: t, modifiers: r, expression: n }, { cleanup: i }) => {
      let s = n ? P(e, n) : () => {};
      e.tagName.toLowerCase() === 'template' &&
        (e._x_forwardEvents || (e._x_forwardEvents = []),
        e._x_forwardEvents.includes(t) || e._x_forwardEvents.push(t));
      let a = dt(e, t, r, (o) => {
        s(() => {}, { scope: { $event: o }, params: [o] });
      });
      i(() => a());
    })
  );
  Ue('Collapse', 'collapse', 'collapse');
  Ue('Intersect', 'intersect', 'intersect');
  Ue('Focus', 'trap', 'focus');
  Ue('Mask', 'mask', 'mask');
  function Ue(e, t, r) {
    S(t, (n) =>
      R(
        `You can't use [x-${t}] without first installing the "${e}" plugin here: https://alpinejs.dev/plugins/${r}`,
        n
      )
    );
  }
  be.setEvaluator(Ji);
  be.setReactivityEngine({ reactive: Rt, effect: ss, release: as, raw: w });
  var Zs = be,
    oe = Zs;
  function Xs(e) {
    let t = () => {
      let r, n;
      try {
        n = localStorage;
      } catch (i) {
        (console.error(i),
          console.warn(
            'Alpine: $persist is using temporary storage since localStorage is unavailable.'
          ));
        let s = new Map();
        n = { getItem: s.get.bind(s), setItem: s.set.bind(s) };
      }
      return e.interceptor(
        (i, s, a, o, u) => {
          let c = r || `_x_${o}`,
            l = fn(c, n) ? dn(c, n) : i;
          return (
            a(l),
            e.effect(() => {
              let v = s();
              (pn(c, v, n), a(v));
            }),
            l
          );
        },
        (i) => {
          ((i.as = (s) => ((r = s), i)), (i.using = (s) => ((n = s), i)));
        }
      );
    };
    (Object.defineProperty(e, '$persist', { get: () => t() }),
      e.magic('persist', t),
      (e.persist = (r, { get: n, set: i }, s = localStorage) => {
        let a = fn(r, s) ? dn(r, s) : n();
        (i(a),
          e.effect(() => {
            let o = n();
            (pn(r, o, s), i(o));
          }));
      }));
  }
  function fn(e, t) {
    return t.getItem(e) !== null;
  }
  function dn(e, t) {
    let r = t.getItem(e);
    if (r !== void 0) return JSON.parse(r);
  }
  function pn(e, t, r) {
    r.setItem(e, JSON.stringify(t));
  }
  var hn = Xs;
  function Qs(e) {
    e.directive(
      'intersect',
      e.skipDuringClone(
        (t, { value: r, expression: n, modifiers: i }, { evaluateLater: s, cleanup: a }) => {
          let o = s(n),
            u = { rootMargin: ta(i), threshold: Gs(i) },
            c = new IntersectionObserver((l) => {
              l.forEach((v) => {
                v.isIntersecting !== (r === 'leave') && (o(), i.includes('once') && c.disconnect());
              });
            }, u);
          (c.observe(t),
            a(() => {
              c.disconnect();
            }));
        }
      )
    );
  }
  function Gs(e) {
    if (e.includes('full')) return 0.99;
    if (e.includes('half')) return 0.5;
    if (!e.includes('threshold')) return 0;
    let t = e[e.indexOf('threshold') + 1];
    return t === '100' ? 1 : t === '0' ? 0 : +`.${t}`;
  }
  function ea(e) {
    let t = e.match(/^(-?[0-9]+)(px|%)?$/);
    return t ? t[1] + (t[2] || 'px') : void 0;
  }
  function ta(e) {
    let t = 'margin',
      r = '0px 0px 0px 0px',
      n = e.indexOf(t);
    if (n === -1) return r;
    let i = [];
    for (let s = 1; s < 5; s++) i.push(ea(e[n + s] || ''));
    return ((i = i.filter((s) => s !== void 0)), i.length ? i.join(' ').trim() : r);
  }
  var vn = Qs;
  var En = [
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
    ],
    Be = En.join(','),
    An = typeof Element > 'u',
    G = An
      ? function () {}
      : Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector,
    Mt =
      !An && Element.prototype.getRootNode
        ? function (e) {
            return e.getRootNode();
          }
        : function (e) {
            return e.ownerDocument;
          },
    On = function (t, r, n) {
      var i = Array.prototype.slice.apply(t.querySelectorAll(Be));
      return (r && G.call(t, Be) && i.unshift(t), (i = i.filter(n)), i);
    },
    Tn = function e(t, r, n) {
      for (var i = [], s = Array.from(t); s.length; ) {
        var a = s.shift();
        if (a.tagName === 'SLOT') {
          var o = a.assignedElements(),
            u = o.length ? o : a.children,
            c = e(u, !0, n);
          n.flatten ? i.push.apply(i, c) : i.push({ scope: a, candidates: c });
        } else {
          var l = G.call(a, Be);
          l && n.filter(a) && (r || !t.includes(a)) && i.push(a);
          var v = a.shadowRoot || (typeof n.getShadowRoot == 'function' && n.getShadowRoot(a)),
            g = !n.shadowRootFilter || n.shadowRootFilter(a);
          if (v && g) {
            var m = e(v === !0 ? a.children : v.children, !0, n);
            n.flatten ? i.push.apply(i, m) : i.push({ scope: a, candidates: m });
          } else s.unshift.apply(s, a.children);
        }
      }
      return i;
    },
    Sn = function (t, r) {
      return t.tabIndex < 0 &&
        (r || /^(AUDIO|VIDEO|DETAILS)$/.test(t.tagName) || t.isContentEditable) &&
        isNaN(parseInt(t.getAttribute('tabindex'), 10))
        ? 0
        : t.tabIndex;
    },
    ra = function (t, r) {
      return t.tabIndex === r.tabIndex
        ? t.documentOrder - r.documentOrder
        : t.tabIndex - r.tabIndex;
    },
    Nn = function (t) {
      return t.tagName === 'INPUT';
    },
    na = function (t) {
      return Nn(t) && t.type === 'hidden';
    },
    ia = function (t) {
      var r =
        t.tagName === 'DETAILS' &&
        Array.prototype.slice.apply(t.children).some(function (n) {
          return n.tagName === 'SUMMARY';
        });
      return r;
    },
    sa = function (t, r) {
      for (var n = 0; n < t.length; n++) if (t[n].checked && t[n].form === r) return t[n];
    },
    aa = function (t) {
      if (!t.name) return !0;
      var r = t.form || Mt(t),
        n = function (o) {
          return r.querySelectorAll('input[type="radio"][name="' + o + '"]');
        },
        i;
      if (typeof window < 'u' && typeof window.CSS < 'u' && typeof window.CSS.escape == 'function')
        i = n(window.CSS.escape(t.name));
      else
        try {
          i = n(t.name);
        } catch (a) {
          return (
            console.error(
              'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
              a.message
            ),
            !1
          );
        }
      var s = sa(i, t.form);
      return !s || s === t;
    },
    oa = function (t) {
      return Nn(t) && t.type === 'radio';
    },
    ua = function (t) {
      return oa(t) && !aa(t);
    },
    gn = function (t) {
      var r = t.getBoundingClientRect(),
        n = r.width,
        i = r.height;
      return n === 0 && i === 0;
    },
    ca = function (t, r) {
      var n = r.displayCheck,
        i = r.getShadowRoot;
      if (getComputedStyle(t).visibility === 'hidden') return !0;
      var s = G.call(t, 'details>summary:first-of-type'),
        a = s ? t.parentElement : t;
      if (G.call(a, 'details:not([open]) *')) return !0;
      var o = Mt(t).host,
        u = o?.ownerDocument.contains(o) || t.ownerDocument.contains(t);
      if (!n || n === 'full') {
        if (typeof i == 'function') {
          for (var c = t; t; ) {
            var l = t.parentElement,
              v = Mt(t);
            if (l && !l.shadowRoot && i(l) === !0) return gn(t);
            t.assignedSlot
              ? (t = t.assignedSlot)
              : !l && v !== t.ownerDocument
                ? (t = v.host)
                : (t = l);
          }
          t = c;
        }
        if (u) return !t.getClientRects().length;
      } else if (n === 'non-zero-area') return gn(t);
      return !1;
    },
    la = function (t) {
      if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(t.tagName))
        for (var r = t.parentElement; r; ) {
          if (r.tagName === 'FIELDSET' && r.disabled) {
            for (var n = 0; n < r.children.length; n++) {
              var i = r.children.item(n);
              if (i.tagName === 'LEGEND')
                return G.call(r, 'fieldset[disabled] *') ? !0 : !i.contains(t);
            }
            return !0;
          }
          r = r.parentElement;
        }
      return !1;
    },
    ze = function (t, r) {
      return !(r.disabled || na(r) || ca(r, t) || ia(r) || la(r));
    },
    Ft = function (t, r) {
      return !(ua(r) || Sn(r) < 0 || !ze(t, r));
    },
    fa = function (t) {
      var r = parseInt(t.getAttribute('tabindex'), 10);
      return !!(isNaN(r) || r >= 0);
    },
    da = function e(t) {
      var r = [],
        n = [];
      return (
        t.forEach(function (i, s) {
          var a = !!i.scope,
            o = a ? i.scope : i,
            u = Sn(o, a),
            c = a ? e(i.candidates) : o;
          u === 0
            ? a
              ? r.push.apply(r, c)
              : r.push(o)
            : n.push({ documentOrder: s, tabIndex: u, item: i, isScope: a, content: c });
        }),
        n
          .sort(ra)
          .reduce(function (i, s) {
            return (s.isScope ? i.push.apply(i, s.content) : i.push(s.content), i);
          }, [])
          .concat(r)
      );
    },
    pa = function (t, r) {
      r = r || {};
      var n;
      return (
        r.getShadowRoot
          ? (n = Tn([t], r.includeContainer, {
              filter: Ft.bind(null, r),
              flatten: !1,
              getShadowRoot: r.getShadowRoot,
              shadowRootFilter: fa,
            }))
          : (n = On(t, r.includeContainer, Ft.bind(null, r))),
        da(n)
      );
    },
    Cn = function (t, r) {
      r = r || {};
      var n;
      return (
        r.getShadowRoot
          ? (n = Tn([t], r.includeContainer, {
              filter: ze.bind(null, r),
              flatten: !0,
              getShadowRoot: r.getShadowRoot,
            }))
          : (n = On(t, r.includeContainer, ze.bind(null, r))),
        n
      );
    },
    $e = function (t, r) {
      if (((r = r || {}), !t)) throw new Error('No node provided');
      return G.call(t, Be) === !1 ? !1 : Ft(r, t);
    },
    ha = En.concat('iframe').join(','),
    Ke = function (t, r) {
      if (((r = r || {}), !t)) throw new Error('No node provided');
      return G.call(t, ha) === !1 ? !1 : ze(r, t);
    };
  function _n(e, t) {
    var r = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      (t &&
        (n = n.filter(function (i) {
          return Object.getOwnPropertyDescriptor(e, i).enumerable;
        })),
        r.push.apply(r, n));
    }
    return r;
  }
  function bn(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t] != null ? arguments[t] : {};
      t % 2
        ? _n(Object(r), !0).forEach(function (n) {
            va(e, n, r[n]);
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
          : _n(Object(r)).forEach(function (n) {
              Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
            });
    }
    return e;
  }
  function va(e, t, r) {
    return (
      t in e
        ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
        : (e[t] = r),
      e
    );
  }
  var mn = (function () {
      var e = [];
      return {
        activateTrap: function (r) {
          if (e.length > 0) {
            var n = e[e.length - 1];
            n !== r && n.pause();
          }
          var i = e.indexOf(r);
          (i === -1 || e.splice(i, 1), e.push(r));
        },
        deactivateTrap: function (r) {
          var n = e.indexOf(r);
          (n !== -1 && e.splice(n, 1), e.length > 0 && e[e.length - 1].unpause());
        },
      };
    })(),
    ga = function (t) {
      return t.tagName && t.tagName.toLowerCase() === 'input' && typeof t.select == 'function';
    },
    _a = function (t) {
      return t.key === 'Escape' || t.key === 'Esc' || t.keyCode === 27;
    },
    ba = function (t) {
      return t.key === 'Tab' || t.keyCode === 9;
    },
    yn = function (t) {
      return setTimeout(t, 0);
    },
    xn = function (t, r) {
      var n = -1;
      return (
        t.every(function (i, s) {
          return r(i) ? ((n = s), !1) : !0;
        }),
        n
      );
    },
    me = function (t) {
      for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
        n[i - 1] = arguments[i];
      return typeof t == 'function' ? t.apply(void 0, n) : t;
    },
    je = function (t) {
      return t.target.shadowRoot && typeof t.composedPath == 'function'
        ? t.composedPath()[0]
        : t.target;
    },
    ma = function (t, r) {
      var n = r?.document || document,
        i = bn({ returnFocusOnDeactivate: !0, escapeDeactivates: !0, delayInitialFocus: !0 }, r),
        s = {
          containers: [],
          containerGroups: [],
          tabbableGroups: [],
          nodeFocusedBeforeActivation: null,
          mostRecentlyFocusedNode: null,
          active: !1,
          paused: !1,
          delayInitialFocusTimer: void 0,
        },
        a,
        o = function (f, d, _) {
          return f && f[d] !== void 0 ? f[d] : i[_ || d];
        },
        u = function (f) {
          return s.containerGroups.findIndex(function (d) {
            var _ = d.container,
              T = d.tabbableNodes;
            return (
              _.contains(f) ||
              T.find(function (O) {
                return O === f;
              })
            );
          });
        },
        c = function (f) {
          var d = i[f];
          if (typeof d == 'function') {
            for (var _ = arguments.length, T = new Array(_ > 1 ? _ - 1 : 0), O = 1; O < _; O++)
              T[O - 1] = arguments[O];
            d = d.apply(void 0, T);
          }
          if ((d === !0 && (d = void 0), !d)) {
            if (d === void 0 || d === !1) return d;
            throw new Error(
              '`'.concat(f, '` was specified but was not a node, or did not return a node')
            );
          }
          var k = d;
          if (typeof d == 'string' && ((k = n.querySelector(d)), !k))
            throw new Error('`'.concat(f, '` as selector refers to no known node'));
          return k;
        },
        l = function () {
          var f = c('initialFocus');
          if (f === !1) return !1;
          if (f === void 0)
            if (u(n.activeElement) >= 0) f = n.activeElement;
            else {
              var d = s.tabbableGroups[0],
                _ = d && d.firstTabbableNode;
              f = _ || c('fallbackFocus');
            }
          if (!f) throw new Error('Your focus-trap needs to have at least one focusable element');
          return f;
        },
        v = function () {
          if (
            ((s.containerGroups = s.containers.map(function (f) {
              var d = pa(f, i.tabbableOptions),
                _ = Cn(f, i.tabbableOptions);
              return {
                container: f,
                tabbableNodes: d,
                focusableNodes: _,
                firstTabbableNode: d.length > 0 ? d[0] : null,
                lastTabbableNode: d.length > 0 ? d[d.length - 1] : null,
                nextTabbableNode: function (O) {
                  var k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0,
                    D = _.findIndex(function ($) {
                      return $ === O;
                    });
                  if (!(D < 0))
                    return k
                      ? _.slice(D + 1).find(function ($) {
                          return $e($, i.tabbableOptions);
                        })
                      : _.slice(0, D)
                          .reverse()
                          .find(function ($) {
                            return $e($, i.tabbableOptions);
                          });
                },
              };
            })),
            (s.tabbableGroups = s.containerGroups.filter(function (f) {
              return f.tabbableNodes.length > 0;
            })),
            s.tabbableGroups.length <= 0 && !c('fallbackFocus'))
          )
            throw new Error(
              'Your focus-trap must have at least one container with at least one tabbable node in it at all times'
            );
        },
        g = function x(f) {
          if (f !== !1 && f !== n.activeElement) {
            if (!f || !f.focus) {
              x(l());
              return;
            }
            (f.focus({ preventScroll: !!i.preventScroll }),
              (s.mostRecentlyFocusedNode = f),
              ga(f) && f.select());
          }
        },
        m = function (f) {
          var d = c('setReturnFocus', f);
          return d || (d === !1 ? !1 : f);
        },
        p = function (f) {
          var d = je(f);
          if (!(u(d) >= 0)) {
            if (me(i.clickOutsideDeactivates, f)) {
              a.deactivate({ returnFocus: i.returnFocusOnDeactivate && !Ke(d, i.tabbableOptions) });
              return;
            }
            me(i.allowOutsideClick, f) || f.preventDefault();
          }
        },
        b = function (f) {
          var d = je(f),
            _ = u(d) >= 0;
          _ || d instanceof Document
            ? _ && (s.mostRecentlyFocusedNode = d)
            : (f.stopImmediatePropagation(), g(s.mostRecentlyFocusedNode || l()));
        },
        h = function (f) {
          var d = je(f);
          v();
          var _ = null;
          if (s.tabbableGroups.length > 0) {
            var T = u(d),
              O = T >= 0 ? s.containerGroups[T] : void 0;
            if (T < 0)
              f.shiftKey
                ? (_ = s.tabbableGroups[s.tabbableGroups.length - 1].lastTabbableNode)
                : (_ = s.tabbableGroups[0].firstTabbableNode);
            else if (f.shiftKey) {
              var k = xn(s.tabbableGroups, function (qe) {
                var He = qe.firstTabbableNode;
                return d === He;
              });
              if (
                (k < 0 &&
                  (O.container === d ||
                    (Ke(d, i.tabbableOptions) &&
                      !$e(d, i.tabbableOptions) &&
                      !O.nextTabbableNode(d, !1))) &&
                  (k = T),
                k >= 0)
              ) {
                var D = k === 0 ? s.tabbableGroups.length - 1 : k - 1,
                  $ = s.tabbableGroups[D];
                _ = $.lastTabbableNode;
              }
            } else {
              var ue = xn(s.tabbableGroups, function (qe) {
                var He = qe.lastTabbableNode;
                return d === He;
              });
              if (
                (ue < 0 &&
                  (O.container === d ||
                    (Ke(d, i.tabbableOptions) &&
                      !$e(d, i.tabbableOptions) &&
                      !O.nextTabbableNode(d))) &&
                  (ue = T),
                ue >= 0)
              ) {
                var Pn = ue === s.tabbableGroups.length - 1 ? 0 : ue + 1,
                  Rn = s.tabbableGroups[Pn];
                _ = Rn.firstTabbableNode;
              }
            }
          } else _ = c('fallbackFocus');
          _ && (f.preventDefault(), g(_));
        },
        y = function (f) {
          if (_a(f) && me(i.escapeDeactivates, f) !== !1) {
            (f.preventDefault(), a.deactivate());
            return;
          }
          if (ba(f)) {
            h(f);
            return;
          }
        },
        E = function (f) {
          var d = je(f);
          u(d) >= 0 ||
            me(i.clickOutsideDeactivates, f) ||
            me(i.allowOutsideClick, f) ||
            (f.preventDefault(), f.stopImmediatePropagation());
        },
        N = function () {
          if (s.active)
            return (
              mn.activateTrap(a),
              (s.delayInitialFocusTimer = i.delayInitialFocus
                ? yn(function () {
                    g(l());
                  })
                : g(l())),
              n.addEventListener('focusin', b, !0),
              n.addEventListener('mousedown', p, { capture: !0, passive: !1 }),
              n.addEventListener('touchstart', p, { capture: !0, passive: !1 }),
              n.addEventListener('click', E, { capture: !0, passive: !1 }),
              n.addEventListener('keydown', y, { capture: !0, passive: !1 }),
              a
            );
        },
        I = function () {
          if (s.active)
            return (
              n.removeEventListener('focusin', b, !0),
              n.removeEventListener('mousedown', p, !0),
              n.removeEventListener('touchstart', p, !0),
              n.removeEventListener('click', E, !0),
              n.removeEventListener('keydown', y, !0),
              a
            );
        };
      return (
        (a = {
          get active() {
            return s.active;
          },
          get paused() {
            return s.paused;
          },
          activate: function (f) {
            if (s.active) return this;
            var d = o(f, 'onActivate'),
              _ = o(f, 'onPostActivate'),
              T = o(f, 'checkCanFocusTrap');
            (T || v(),
              (s.active = !0),
              (s.paused = !1),
              (s.nodeFocusedBeforeActivation = n.activeElement),
              d && d());
            var O = function () {
              (T && v(), N(), _ && _());
            };
            return T ? (T(s.containers.concat()).then(O, O), this) : (O(), this);
          },
          deactivate: function (f) {
            if (!s.active) return this;
            var d = bn(
              {
                onDeactivate: i.onDeactivate,
                onPostDeactivate: i.onPostDeactivate,
                checkCanReturnFocus: i.checkCanReturnFocus,
              },
              f
            );
            (clearTimeout(s.delayInitialFocusTimer),
              (s.delayInitialFocusTimer = void 0),
              I(),
              (s.active = !1),
              (s.paused = !1),
              mn.deactivateTrap(a));
            var _ = o(d, 'onDeactivate'),
              T = o(d, 'onPostDeactivate'),
              O = o(d, 'checkCanReturnFocus'),
              k = o(d, 'returnFocus', 'returnFocusOnDeactivate');
            _ && _();
            var D = function () {
              yn(function () {
                (k && g(m(s.nodeFocusedBeforeActivation)), T && T());
              });
            };
            return k && O ? (O(m(s.nodeFocusedBeforeActivation)).then(D, D), this) : (D(), this);
          },
          pause: function () {
            return s.paused || !s.active ? this : ((s.paused = !0), I(), this);
          },
          unpause: function () {
            return !s.paused || !s.active ? this : ((s.paused = !1), v(), N(), this);
          },
          updateContainerElements: function (f) {
            var d = [].concat(f).filter(Boolean);
            return (
              (s.containers = d.map(function (_) {
                return typeof _ == 'string' ? n.querySelector(_) : _;
              })),
              s.active && v(),
              this
            );
          },
        }),
        a.updateContainerElements(t),
        a
      );
    };
  function ya(e) {
    let t, r;
    (window.addEventListener('focusin', () => {
      ((t = r), (r = document.activeElement));
    }),
      e.magic('focus', (n) => {
        let i = n;
        return {
          __noscroll: !1,
          __wrapAround: !1,
          within(s) {
            return ((i = s), this);
          },
          withoutScrolling() {
            return ((this.__noscroll = !0), this);
          },
          noscroll() {
            return ((this.__noscroll = !0), this);
          },
          withWrapAround() {
            return ((this.__wrapAround = !0), this);
          },
          wrap() {
            return this.withWrapAround();
          },
          focusable(s) {
            return Ke(s);
          },
          previouslyFocused() {
            return t;
          },
          lastFocused() {
            return t;
          },
          focused() {
            return r;
          },
          focusables() {
            return Array.isArray(i) ? i : Cn(i, { displayCheck: 'none' });
          },
          all() {
            return this.focusables();
          },
          isFirst(s) {
            let a = this.all();
            return a[0] && a[0].isSameNode(s);
          },
          isLast(s) {
            let a = this.all();
            return a.length && a.slice(-1)[0].isSameNode(s);
          },
          getFirst() {
            return this.all()[0];
          },
          getLast() {
            return this.all().slice(-1)[0];
          },
          getNext() {
            let s = this.all(),
              a = document.activeElement;
            if (s.indexOf(a) !== -1)
              return this.__wrapAround && s.indexOf(a) === s.length - 1
                ? s[0]
                : s[s.indexOf(a) + 1];
          },
          getPrevious() {
            let s = this.all(),
              a = document.activeElement;
            if (s.indexOf(a) !== -1)
              return this.__wrapAround && s.indexOf(a) === 0 ? s.slice(-1)[0] : s[s.indexOf(a) - 1];
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
          focus(s) {
            s &&
              setTimeout(() => {
                (s.hasAttribute('tabindex') || s.setAttribute('tabindex', '0'),
                  s.focus({ preventScroll: this.__noscroll }));
              });
          },
        };
      }),
      e.directive(
        'trap',
        e.skipDuringClone(
          (n, { expression: i, modifiers: s }, { effect: a, evaluateLater: o, cleanup: u }) => {
            let c = o(i),
              l = !1,
              v = { escapeDeactivates: !1, allowOutsideClick: !0, fallbackFocus: () => n },
              g = () => {};
            if (s.includes('noautofocus')) v.initialFocus = !1;
            else {
              let h = n.querySelector('[autofocus]');
              h && (v.initialFocus = h);
            }
            s.includes('inert') &&
              (v.onPostActivate = () => {
                e.nextTick(() => {
                  g = wn(n);
                });
              });
            let m = ma(n, v),
              p = () => {},
              b = () => {
                (g(),
                  (g = () => {}),
                  p(),
                  (p = () => {}),
                  m.deactivate({ returnFocus: !s.includes('noreturn') }));
              };
            (a(() =>
              c((h) => {
                l !== h &&
                  (h &&
                    !l &&
                    (s.includes('noscroll') && (p = xa()),
                    setTimeout(() => {
                      m.activate();
                    }, 15)),
                  !h && l && b(),
                  (l = !!h));
              })
            ),
              u(b));
          },
          (n, { expression: i, modifiers: s }, { evaluate: a }) => {
            s.includes('inert') && a(i) && wn(n);
          }
        )
      ));
  }
  function wn(e) {
    let t = [];
    return (
      In(e, (r) => {
        let n = r.hasAttribute('aria-hidden');
        (r.setAttribute('aria-hidden', 'true'),
          t.push(() => n || r.removeAttribute('aria-hidden')));
      }),
      () => {
        for (; t.length; ) t.pop()();
      }
    );
  }
  function In(e, t) {
    e.isSameNode(document.body) ||
      !e.parentNode ||
      Array.from(e.parentNode.children).forEach((r) => {
        r.isSameNode(e) ? In(e.parentNode, t) : t(r);
      });
  }
  function xa() {
    let e = document.documentElement.style.overflow,
      t = document.documentElement.style.paddingRight,
      r = window.innerWidth - document.documentElement.clientWidth;
    return (
      (document.documentElement.style.overflow = 'hidden'),
      (document.documentElement.style.paddingRight = `${r}px`),
      () => {
        ((document.documentElement.style.overflow = e),
          (document.documentElement.style.paddingRight = t));
      }
    );
  }
  var kn = ya;
  oe.plugin(hn);
  oe.plugin(vn);
  oe.plugin(kn);
  globalThis.Alpine = oe;
  oe.start();
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
