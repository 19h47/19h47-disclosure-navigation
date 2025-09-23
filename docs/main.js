function g(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var c = { exports: {} }, y;
function x() {
  return y || (y = 1, (function(o, e) {
    (function(n, t) {
      o.exports = t();
    })(self, (() => (() => {
      var n = { d: (s, i) => {
        for (var u in i) n.o(i, u) && !n.o(s, u) && Object.defineProperty(s, u, { enumerable: !0, get: i[u] });
      }, o: (s, i) => Object.prototype.hasOwnProperty.call(s, i), r: (s) => {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(s, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(s, "__esModule", { value: !0 });
      } }, t = {};
      n.r(t), n.d(t, { default: () => d });
      const r = (s, i, u) => {
        s.preventDefault();
        const h = u + 1 > i.length - 1 ? 0 : u + 1;
        return i[h].focus(), h;
      }, l = (s, i, u) => {
        s.preventDefault();
        const h = 0 > u - 1 ? i.length - 1 : u - 1;
        return i[h].focus(), h;
      }, a = { ArrowUp: l, ArrowRight: r, ArrowDown: r, ArrowLeft: l, Home: (s, i) => (s.preventDefault(), i[0].focus(), 0), End: (s, i) => (s.preventDefault(), i[i.length - 1].focus(), i.length - 1), default: () => !1 }, d = (s, i = [], u = 0) => (a[s.key || s.code] || a.default)(s, i, u);
      return t;
    })()));
  })(c)), c.exports;
}
var w = x();
const p = /* @__PURE__ */ g(w), v = (o, e = {}, n = "") => {
  const t = new CustomEvent(`disclosure-navigation:${n}`, {
    bubbles: !1,
    cancelable: !0,
    detail: e
  });
  return o.dispatchEvent(t);
}, f = (o, e) => {
  e ? o.style.removeProperty("display") : o.style.setProperty("display", "none");
}, b = (o, e) => {
  o.querySelectorAll(
    'a, button, [tabindex]:not([tabindex="-1"])'
  ).forEach((t) => {
    e ? t.removeAttribute("tabindex") : t.setAttribute("tabindex", "-1");
  });
};
class E {
  constructor(e) {
    this.children = [], this.index = null, this.useArrowKeys = !0, this.handleFocusOut = (n) => {
      this.onBlur(n);
    }, this.handleButtonClick = (n) => {
      const { currentTarget: t } = n, r = this.buttons.indexOf(t), l = t.getAttribute("aria-expanded") === "true";
      this.toggle(r, !l);
    }, this.handleButtonKeydown = (n) => {
      var l, a;
      const { key: t } = n, r = this.buttons.indexOf(document.activeElement);
      return t === "Escape" ? this.toggle(this.index, !1) : this.useArrowKeys && this.index === r && t === "ArrowDown" ? (n.preventDefault(), (a = (l = this.children[this.index]) == null ? void 0 : l.querySelector("a")) == null ? void 0 : a.focus()) : this.useArrowKeys && p(n, this.buttons, r);
    }, this.handleKeydown = (n) => {
      var a, d;
      if (this.index === null)
        return !0;
      const { key: t } = n, r = [
        ...(a = this.children[this.index]) == null ? void 0 : a.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )
      ], l = r.findIndex((s) => s === document.activeElement);
      return t === "Escape" ? ((d = this.buttons[this.index]) == null || d.focus(), this.toggle(this.index, !1)) : this.useArrowKeys && p(n, r, l);
    }, this.el = e, this.buttons = [
      ...this.el.querySelectorAll("button[aria-expanded][aria-controls]")
    ];
  }
  init() {
    this.children = [], this.buttons.forEach((e) => {
      const n = (e.getAttribute("aria-controls") || "").split(" ");
      for (const t of n) {
        const r = this.el.querySelector(`#${t}`);
        r && (this.children.push(r), e.setAttribute("aria-expanded", "false"), f(r, !1), b(r, !1), r.addEventListener("keydown", this.handleKeydown), e.addEventListener("click", this.handleButtonClick), e.addEventListener("keydown", this.handleButtonKeydown));
      }
    }), this.el.addEventListener("focusout", this.handleFocusOut);
  }
  onBlur(e) {
    const { relatedTarget: n } = e;
    this.el.contains(n) || this.toggle(this.index, !1);
  }
  /**
   * Toggle
   *
   * @param {number|null} index
   * @param {boolean} expanded
   */
  toggle(e, n) {
    if (this.index !== e && this.index !== null) {
      const t = this.index;
      this.index = null, t !== null && this.buttons[t] && (this.buttons[t].setAttribute("aria-expanded", "false"), f(this.children[t], !1), b(this.children[t], !1), v(
        this.el,
        { index: t, button: this.buttons[t], child: this.children[t] },
        "close"
      ));
    }
    e !== null && this.children[e] && (this.buttons[e].setAttribute("aria-expanded", n ? "true" : "false"), f(this.children[e], n), b(this.children[e], n), v(
      this.el,
      { index: e, button: this.buttons[e], child: this.children[e] },
      n ? "open" : "close"
    )), this.index = n ? e : null;
  }
  destroy() {
    this.buttons.forEach((e, n) => {
      const t = (e.getAttribute("aria-controls") || "").split(" ");
      for (const r of t) {
        const l = this.el.querySelector(`#${r}`);
        l && l.removeEventListener("keydown", this.handleKeydown);
      }
      e.removeEventListener("click", this.handleButtonClick), e.removeEventListener("keydown", this.handleButtonKeydown);
    }), this.el.removeEventListener("focusout", this.handleFocusOut), this.children = [], this.index = null;
  }
}
export {
  E as default
};
