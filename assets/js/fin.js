!(function (e) {
  "function" == typeof define && define.amd ? define(e) : e();
})(function () {
  "use strict";
  var e = Object.defineProperty,
    t = (t, n, i) =>
      ((t, n, i) =>
        n in t
          ? e(t, n, {
              enumerable: !0,
              configurable: !0,
              writable: !0,
              value: i,
            })
          : (t[n] = i))(t, "symbol" != typeof n ? n + "" : n, i);
  const n = new (class {
    constructor({ isParent: e }) {
      t(this, "isParent"),
        t(this, "customTargetWindow"),
        t(this, "customTargetOrigin"),
        t(this, "handlers", {}),
        t(this, "pending"),
        (this.isParent = e),
        (this.pending = new Map()),
        this.listen();
    }
    get targetWindow() {
      var e;
      return this.customTargetWindow
        ? this.customTargetWindow
        : "undefined" != typeof window
        ? this.isParent
          ? null == (e = document.querySelector("#editor-iframe"))
            ? void 0
            : e.contentWindow
          : window.parent
        : void 0;
    }
    get targetOrigin() {
      return this.customTargetOrigin ? this.customTargetOrigin : "*";
    }
    allowOrigin(e) {
      return (
        !!(
          /yourware\.so/.test(e) ||
          /youware\.com/.test(e) ||
          /localhost|127\.0\.0\.1/.test(e)
        ) || !!/csb\.app/.test(e)
      );
    }
    setTarget(e) {
      (this.customTargetWindow = e.window),
        (this.customTargetOrigin = e.origin);
    }
    sendEvent(e, t = 3, n = 1e3) {
      const i = Date.now() + Math.random().toString(36).substring(2),
        s = { id: i, ...e },
        o = (e = 0) => {
          var r;
          null == (r = this.targetWindow) ||
            r.postMessage(s, this.targetOrigin);
          const a = setTimeout(() => {
            if (e >= t)
              return (
                this.pending.delete(i),
                void console.error("Message failed after retries:", s)
              );
            o(e + 1);
          }, n * 2 ** e);
          this.pending.set(i, { timer: a, attempt: e });
        };
      o();
    }
    listen() {
      window.addEventListener("message", (e) => {
        var t, n, i, s;
        if (
          this.allowOrigin(e.origin) &&
          (null == (t = e.data) ? void 0 : t.event) &&
          (e.data.id || e.data.originalId)
        )
          if (
            (this.customTargetOrigin || this.setTarget({ origin: e.origin }),
            "ack" !== e.data.event)
          )
            null == (n = this.targetWindow) ||
              n.postMessage({ event: "ack", originalId: e.data.id }, e.origin),
              null == (s = (i = this.handlers)[e.data.event]) ||
                s.call(i, e.data.data);
          else {
            const { originalId: t } = e.data,
              n = this.pending.get(t);
            n && (clearTimeout(n.timer), this.pending.delete(t));
          }
      });
    }
    onEvent(e, t) {
      this.handlers[e] = t;
    }
  })({ isParent: !1 });
  class i {
    constructor() {
      t(this, "container"),
        t(this, "target", null),
        t(this, "visible", !1),
        t(this, "BORDER_WIDTH", 1),
        t(this, "resizeObserver"),
        t(this, "mutationObserver"),
        t(
          this,
          "updatePosition",
          (function (e, t) {
            let n;
            return function (...i) {
              n || (e.apply(this, i), (n = !0), setTimeout(() => (n = !1), t));
            };
          })(() => {
            if (!this.target) return;
            const e = this.target.getBoundingClientRect(),
              t = window.getComputedStyle(this.target);
            (this.container.style.boxSizing = "content-box"),
              (this.container.style.top =
                e.top + window.scrollY - this.BORDER_WIDTH + "px"),
              (this.container.style.left =
                e.left + window.scrollX - this.BORDER_WIDTH + "px"),
              (this.container.style.width = `${e.width}px`),
              (this.container.style.height = `${e.height}px`),
              (this.container.style.borderRadius = t.borderRadius);
          }, 16)
        ),
        (this.container = document.createElement("div")),
        (this.container.style.position = "absolute"),
        (this.container.style.pointerEvents = "none"),
        (this.container.style.zIndex = "9999"),
        this.setupObservers();
    }
    setupObservers() {
      (this.resizeObserver = new ResizeObserver(this.updatePosition)),
        (this.mutationObserver = new MutationObserver(this.updatePosition)),
        window.addEventListener("resize", this.updatePosition);
    }
    show(e) {
      var t, n;
      (this.target = e),
        this.updatePosition(),
        document.body.appendChild(this.container),
        (this.visible = !0),
        this.target &&
          (null == (t = this.resizeObserver) || t.observe(this.target),
          null == (n = this.mutationObserver) ||
            n.observe(this.target, {
              attributes: !0,
              childList: !0,
              subtree: !0,
            }));
    }
    cleanup() {
      var e, t, n;
      this.target &&
        (null == (e = this.resizeObserver) || e.unobserve(this.target)),
        this.container.remove(),
        (this.target = null),
        (this.visible = !1),
        null == (t = this.resizeObserver) || t.disconnect(),
        null == (n = this.mutationObserver) || n.disconnect(),
        window.removeEventListener("resize", this.updatePosition);
    }
    isVisible() {
      return this.visible;
    }
    getTarget() {
      return this.target;
    }
  }
  class s extends i {
    constructor() {
      super(),
        (this.container.className = "editor-hover-overlay"),
        (this.container.style.border = "1px dashed #55644A"),
        (this.container.style.backgroundColor = "rgba(85, 100, 74, 0.12)");
    }
  }
  class o extends i {
    constructor() {
      super(),
        t(this, "tagElement"),
        (this.container.className = "editor-selection-overlay"),
        (this.container.style.border = "1px solid #55644A"),
        (this.container.style.backgroundColor = "rgba(85, 100, 74, 0.12)"),
        (this.tagElement = document.createElement("div")),
        (this.tagElement.className = "editor-element-tag"),
        (this.tagElement.style.position = "absolute"),
        (this.tagElement.style.top = "-34px"),
        (this.tagElement.style.left = "-2px"),
        (this.tagElement.style.padding = "2px 8px"),
        (this.tagElement.style.backgroundColor = "#55644A"),
        (this.tagElement.style.color = "#fff"),
        (this.tagElement.style.borderRadius = "6px"),
        this.container.appendChild(this.tagElement);
    }
    show(e) {
      super.show(e), (this.tagElement.textContent = e.tagName.toLowerCase());
    }
  }
  class r {
    constructor(e) {
      t(this, "element"),
        t(this, "overlay"),
        t(this, "onChange"),
        (this.element = e),
        (this.overlay = new a()),
        this.overlay.show(this.element);
    }
    handleElement() {}
    cleanup() {
      this.overlay.cleanup();
    }
  }
  class a extends o {
    constructor() {
      super();
    }
  }
  function l(e) {
    return new r(e);
  }
  function h(e) {
    if (!e) return "";
    if (e === document.documentElement) return "/html";
    let t = "",
      n = e;
    for (; n && n.nodeType === Node.ELEMENT_NODE; ) {
      let e = 1,
        i = n.previousElementSibling;
      for (; i; )
        i.nodeName === n.nodeName && e++, (i = i.previousElementSibling);
      const s = n.nodeName.toLowerCase();
      let o = "";
      (o = n.id
        ? `[@id="${n.id}"]`
        : n.className &&
          "string" == typeof n.className &&
          "" !== n.className.trim()
        ? `[@class="${n.className}"]`
        : e > 1
        ? `[${e}]`
        : ""),
        (t = `/${s}${o}${t}`),
        (n = n.parentElement);
    }
    return t;
  }
  class d {
    constructor() {
      t(this, "hoverOverlay"),
        t(this, "elementDecorators", []),
        t(this, "handleMouseOver", (e) => {
          const t = e.target;
          this.elementDecorators.some((e) => e.element === t) ||
            this.hoverOverlay.show(t);
        }),
        t(this, "handleMouseOut", (e) => {
          this.hoverOverlay.cleanup();
        }),
        t(this, "handleClick", (e) => {
          e.preventDefault(), e.stopPropagation();
          const t = e.target;
          if (e.metaKey || e.ctrlKey) {
            const e = this.elementDecorators.findIndex((e) => e.element === t);
            -1 !== e
              ? (this.elementDecorators[e].cleanup(),
                this.elementDecorators.splice(e, 1))
              : this.elementDecorators.push(l(t));
          } else {
            if (
              -1 !== this.elementDecorators.findIndex((e) => e.element === t) &&
              1 === this.elementDecorators.length
            )
              return;
            this.elementDecorators.forEach((e) => e.cleanup()),
              (this.elementDecorators.length = 0);
            const e = l(t);
            this.elementDecorators.push(e), e.handleElement();
          }
          n.sendEvent({
            event: "edit_select_elements",
            data: {
              elements: this.elementDecorators.map((e) => {
                var t;
                return {
                  urlPath: window.location.pathname,
                  xpath: h(e.element),
                  outerHtml:
                    (null == (t = e.element.outerHTML) ? void 0 : t.length) <
                    800
                      ? e.element.outerHTML
                      : "",
                  tagName: e.element.tagName.toLowerCase(),
                };
              }),
            },
          });
        }),
        t(this, "preventDefault", (e) => {
          e.preventDefault(), e.stopPropagation();
        }),
        (this.hoverOverlay = new s()),
        this.bindEvents();
    }
    bindEvents() {
      document.addEventListener("mouseover", this.handleMouseOver),
        document.addEventListener("mouseout", this.handleMouseOut),
        document.addEventListener("click", this.handleClick, !0),
        document.addEventListener("submit", this.preventDefault, !0),
        document.addEventListener("touchstart", this.preventDefault, !0),
        document.addEventListener("touchend", this.preventDefault, !0),
        n.onEvent("edit_cancel_selection", (e) => {
          if (e.xpath) {
            const t = this.elementDecorators.findIndex(
              (t) => h(t.element) === e.xpath
            );
            -1 !== t &&
              (this.elementDecorators[t].cleanup(),
              this.elementDecorators.splice(t, 1));
          } else
            this.elementDecorators.forEach((e) => e.cleanup()),
              (this.elementDecorators.length = 0);
        });
    }
    cleanup() {
      var e;
      document.removeEventListener("mouseover", this.handleMouseOver),
        document.removeEventListener("mouseout", this.handleMouseOut),
        document.removeEventListener("click", this.handleClick, !0),
        document.removeEventListener("submit", this.preventDefault, !0),
        document.removeEventListener("touchstart", this.preventDefault, !0),
        document.removeEventListener("touchend", this.preventDefault, !0),
        null == (e = this.hoverOverlay) || e.cleanup(),
        this.elementDecorators.forEach((e) => e.cleanup()),
        (this.elementDecorators.length = 0);
    }
  }
  const c = new (class {
      constructor() {
        t(this, "manager", null), t(this, "style", null);
      }
      setEnabled(e) {
        e
          ? this.manager || (this.initializeStyles(), (this.manager = new d()))
          : this.destroy();
      }
      initializeStyles() {
        this.style ||
          ((this.style = document.createElement("style")),
          (this.style.textContent =
            "\n        * {\n          caret-color: #FF5530;\n        }\n\n        [contenteditable] {\n          outline: 0px solid transparent;\n        }\n      "),
          document.head.appendChild(this.style));
      }
      destroy() {
        this.style && (this.style.remove(), (this.style = null)),
          this.manager && (this.manager.cleanup(), (this.manager = null));
      }
    })(),
    u = "navigation_state";
  const m = new (class {
    constructor() {
      t(this, "currentURL", "");
    }
    init() {
      n.onEvent("navigation_control", this.handleNavigationControl),
        this.initURLChangeDetection();
    }
    handleNavigationControl(e) {
      switch (e.action) {
        case "back":
          window.history.back();
          break;
        case "forward":
          window.history.forward();
          break;
        case "refresh":
          window.location.reload();
      }
    }
    initURLChangeDetection() {
      this.currentURL = document.location.href;
      const e = document.querySelector("body");
      this.sendNavigationState();
      const t = new MutationObserver(() => {
        this.currentURL !== document.location.href &&
          ((this.currentURL = document.location.href),
          this.sendNavigationState(),
          this.sendNavigationState());
      });
      e && t.observe(e, { childList: !0, subtree: !0 });
    }
    sendNavigationState() {
      var e, t;
      const i = {
        canGoBack:
          (null == (e = null == window ? void 0 : window.navigation)
            ? void 0
            : e.canGoBack) ?? !0,
        canGoForward:
          (null == (t = null == window ? void 0 : window.navigation)
            ? void 0
            : t.canGoForward) ?? !0,
        currentUrl: document.location.href,
      };
      n.sendEvent({ event: u, data: i });
    }
  })();
  new (class {
    constructor() {
      t(this, "isDocumentLoaded", !1),
        t(this, "isEditingEnabled", !1),
        m.init(),
        "loading" === document.readyState
          ? document.addEventListener("DOMContentLoaded", () =>
              this.onDocumentLoaded()
            )
          : this.onDocumentLoaded();
    }
    onDocumentLoaded() {
      (this.isDocumentLoaded = !0),
        n.sendEvent({ event: "request_config" }),
        n.onEvent("config_update", (e) => {
          (this.isEditingEnabled = !!e.canEdit),
            c.setEnabled(this.isEditingEnabled && this.isDocumentLoaded);
        }),
        c.setEnabled(this.isEditingEnabled && this.isDocumentLoaded);
    }
  })();
});
