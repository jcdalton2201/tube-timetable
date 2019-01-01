/**
* TubeBase
*/
class TubeBase extends HTMLElement {
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

class TubeSplitFlap extends TubeBase {
  static get boundAttributes() {
    return ['size','background-color','color'];
  }
  static get letters(){
    return [' ','A','B','C','D','E','F','G','H','I','J',
  'K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
'1','2','3','4','5','6','7','8','9','0','.','!','\'','\&'];
  }
  constructor(){
    super(true);
    this.currentLocation = 0;
    this.bindMethods(['nextChar','flipBottom','flipTop','replaceNext','step']);
    this.animating = false;
    this.speed = 50;
    this.updatedCallbacks.set('background-color', this._setBackGroundColor);
    this.updatedCallbacks.set('color', this._setColor);
    this.updatedCallbacks.set('size', this._setSize);
  }
  connected(){
    super.connected();
    this.ref('current').innerText = this.getLetter(this.currentLocation);
    this.ref('bottom').innerText = this.getLetter(this.currentLocation);
    this.ref('next-bottom').innerText = this.getLetter(this.currentLocation +1);
    this.ref('next').innerText = this.getLetter(this.currentLocation +1);
    this.ref('wrapper').addEventListener('click',this.nextChar);
    this.clickSound = new Audio('export.wav');
  }
  nextChar(event){
    this.flipTop();
  }
  render(){
    this.html`<style>#wrapper{position:relative;max-width:100px;height:100px;line-height:100px;font-size:100px;font-family:Monospace;text-align:center;color:#fff}#wrapper #current{position:relative;height:50%;width:100%;background-color:#000;border-radius:10px 10px 0 0;overflow:hidden;z-index:0;transform-origin:bottom}#wrapper #bottom{position:absolute;top:0;height:100%;width:100%;background-color:#000;border-radius:10px;overflow:hidden;z-index:0;transform-origin:bottom;clip-path:polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)}#wrapper #next-bottom{position:absolute;top:0;height:100%;width:100%;background-color:#000;border-radius:10px 10px 10px 10px;overflow:hidden;z-index:0;transform-origin:center;clip-path:polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%);transform:rotateX(-90deg)}#wrapper #next{position:absolute;height:100%;width:100%;border-radius:10px 10px 10px 10px;top:0;background-color:#000;transform-origin:center;clip-path:polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%);z-index:-1}#wrapper .flip-down{transform:rotateX(-90deg)}#wrapper .flip-bottom{transform:rotateX(0deg)}
</style><div id='wrapper' data-ref='wrapper'><div id="current" data-ref='current'></div><div id="bottom" data-ref='bottom'></div><div id="next-bottom" data-ref='next-bottom'></div><div id="next" data-ref='next'></div></div>`;
  }
  getLetter(num){
    if(num > this.constructor.letters.length -1){
      num = 0;
    }
    return this.constructor.letters[num];
  }
  flipTop(){
    this.ref('wrapper').removeEventListener('click',this.nextChar);
    // this.clickSound.play();
    this.animating = true;
    let elem = this.ref('current');
    elem.classList.add('flip-down');
    let animation = elem.animate([
      {
        transform: `rotateX(0deg)`
      },
      {
        transform: `rotateX(-90deg)`
      }
    ],{
      duration:this.speed,
      easing: 'cubic-bezier(0,0,0.32,1)'
    });
    animation.onfinish = this.flipBottom;
  }
  step(){
    if(this.requestedLetter !== this.getLetter(this.currentLocation)){
      if(!this.animating){
        this.flipTop();
      }
      window.requestAnimationFrame(this.step);
    }
  }
  setLetter(letter){
    this.requestedLetter = letter;
    window.requestAnimationFrame(this.step);
  }
  replaceNext(){
    this.ref('next').innerText = this.getLetter(this.currentLocation + 1);
    this.ref('bottom').innerText = this.getLetter(this.currentLocation + 1);
    this.ref('current').classList.remove('flip-down');
    this.ref('next-bottom').classList.remove('flip-bottom');
    this.currentLocation = this.currentLocation +1;
    if(this.currentLocation > this.constructor.letters.length -1){
      this.currentLocation = 0;
    }
    this.ref('next-bottom').innerText = this.getLetter(this.currentLocation + 1);
    this.ref('next').innerText = this.getLetter(this.currentLocation + 1);
    this.animating = false;
    this.ref('wrapper').addEventListener('click',this.nextChar);
  }
  flipBottom(){
    this.ref('current').innerText = this.getLetter(this.currentLocation + 1);
    let elem = this.ref('next-bottom');
    elem.classList.add('flip-bottom');
    let animation = elem.animate([
      {
        transform: `rotateX(-90deg)`
      },
      {
        transform: `rotateX(0deg)`
      }
    ],{
      duration:this.speed,
      easing: 'cubic-bezier(0,0,0.32,1)'
    });
    animation.onfinish = this.replaceNext;
  }
  _setColor(){
    this.ref('next').style.color = this.getAttribute('color');
    this.ref('bottom').style.color = this.getAttribute('color');
    this.ref('current').style.color = this.getAttribute('color');
    this.ref('next-bottom').style.color = this.getAttribute('color');
  }
  _setBackGroundColor(){
    this.ref('next').style.backgroundColor = this.getAttribute('background-color');
    this.ref('bottom').style.backgroundColor = this.getAttribute('background-color');
    this.ref('current').style.backgroundColor = this.getAttribute('background-color');
    this.ref('next-bottom').style.backgroundColor = this.getAttribute('background-color');
    
  }
  _setSize(){
    this.ref('wrapper').style.maxWidth = this.getAttribute('size');
    this.ref('wrapper').style.height = this.getAttribute('size');
    this.ref('wrapper').style.lineHeight = this.getAttribute('size');
    this.ref('wrapper').style.fontSize = this.getAttribute('size');
  }
}
if(!customElements.get('tube-split-flap')){
  customElements.define('tube-split-flap', TubeSplitFlap);
}

class TubeBoard extends TubeBase {
  constructor(){
    super();

  }
  render(){
    this.html`<style></style><div>board</div>`;
  }

}
if(!customElements.get('tube-board')){
  customElements.define('tube-board', TubeBoard);
}

class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.render();
  }

  render(){
    this.root.innerHTML = `<style></style><tube-board></tube-board>`;
  }

}
if(!customElements.get('tube-app')){
  customElements.define('tube-app', TubeApp);
}

export { TubeApp };
