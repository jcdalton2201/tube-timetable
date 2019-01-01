/**
* TubeBase
*/
export class TubeBase extends HTMLElement {
  /**
   * Set initial value for boundAttributes
   * to bind attributes and properties together
   */
  static get boundAttributes() {
    return [];
  }

  /** Set default observed attributes to include boundAttributes */
  static get observedAttributes() {
    return [...this.boundAttributes];
  }

  constructor(shadowRoot = false) {
    super();

    if (shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    /** Additional actions during boundAttribute setters */
    this.updatedCallbacks = new Map();

    /* Save a reference to primary content as this.root */
    if (this.shadowRoot) {
      this.root = this.shadowRoot;
    } else {
      this.root = this;
    }

    /* Bind bound attribute keys to element properties */
    this.constructor.boundAttributes.forEach(attribute => {
      Object.defineProperty(this, attribute, {
        get: () => this.getAttribute(attribute),
        set: value => {
          if (value) {
            this.setAttribute(attribute, value);
          } else {
            this.removeAttribute(attribute);
          }

          /*
           * If an updated callback exists for this attribute,
           * call it from this call site
           */
          const updatedCallback = this.updatedCallbacks.get(attribute);
          if (updatedCallback && typeof updatedCallback === 'function') {
            Reflect.apply(updatedCallback, this, [value, attribute]);
          }
        }
      });
    });

    /** Listeners */
    this._listeners = new Map();

    /** Refs */
    this.refs = new Map();
  }

  /** Bind new attribute value to prop value for bound attributes */
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.constructor.boundAttributes.includes(name)) {
      if (this.hasAttribute(name) && oldValue !== newValue) {
        newValue === '' ? newValue = true : null;
        this[name] = newValue;
      } else if (!this.hasAttribute(name)) {
        this[name] = null;
      }
    }
  }

  /**
   * Bind method to this instance
   * @param {string} methodName
   * @return void
   */
  bindMethod(methodName) {
    this[methodName] = this[methodName].bind(this);
  }

  /**
   * Set up bindings
   * @param {Array<string>} methods - method names to bind
   * @return void
   */
  bindMethods(methods = []) {
    methods.forEach(method => this[method] = this[method].bind(this));
  }

  /** Default connectedCallback */
  connectedCallback() {
    this.render();
    this.connected();
  }

  /** Default disconnectedCallback */
  disconnectedCallback() {
    this._listeners.forEach((callback, eventName) =>
      this.removeEventListener(eventName, callback)
    );
    this.disconnected();
  }

  /**
   * Construct and dispatch a new CustomEvent
   * that is composed (traverses shadow boundary)
   * and that bubbles
   * @param {string} name - Event name to emit
   * @param {any} detail - The detail property of the CustomEvent
   * @return void
   */
  emitEvent(name, detail) {
    const customEvent = new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      isTrusted:true
    });
    this.dispatchEvent(customEvent);
  }

  /**
   * ES template tag used for parsing the
   * element's innerHTML. Use sparingly only
   * when you need a total rerender
   * @param {array<string>} strings
   * @param  {array<any>} values
   * @return void
   */
  html(strings, ...values) {
    const innerHTML = strings.map((string, index) => {
      return `${string ? string : ''}${values[index] !== undefined ? values[index] : ''}`;
    }
    ).join('');
    this.root.innerHTML = innerHTML;
    Array.from(this.root.querySelectorAll('[data-ref]'))
      .forEach(ref => this.refs.set(ref.dataset.ref, ref));
    this.postRender();
  }

  /**
   * Perform an action on event bubbling to this
   * @param {string} eventName
   * @param {function} callback
   * @return void
   */
  on(eventName, callback) {
    this._listeners.set(eventName, callback);
    this.root.addEventListener(eventName, callback);
  }

  /**
   * Return any root element with [data-ref]
   * equal to the first argument
   * @param {string} ref
   * @return {HTMLElement}
   */
  ref(ref = '') {
    return this.root.querySelector(`[data-ref="${ref}"]`);
  }

  /** Default methods so we don't need checks */
  connected() { }
  disconnected() { }
  render() { }
  postRender() { }
}
