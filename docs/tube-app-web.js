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
    // this.clickSound = new Audio('export.wav');
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

class Lines {
    constructor() {

    }
    stations() {
        return { 
            bakerloo: [
                "Baker Street Underground Station", "Charing Cross Underground Station", 
                "Elephant & Castle Underground Station", "Embankment Underground Station", 
                "Edgware Road (Bakerloo) Underground Station", "Harrow & Wealdstone Underground Station", 
                "Harlesden Underground Station", "Kenton Underground Station", "Kilburn Park Underground Station", 
                "Kensal Green Underground Station", "Lambeth North Underground Station", 
                "Maida Vale Underground Station", "Marylebone Underground Station", 
                "North Wembley Underground Station", "Oxford Circus Underground Station", 
                "Paddington Underground Station", "Piccadilly Circus Underground Station", 
                "Queen's Park Underground Station", "Regent's Park Underground Station", 
                "Stonebridge Park Underground Station", "South Kenton Underground Station", 
                "Willesden Junction Underground Station", "Warwick Avenue Underground Station", 
                "Waterloo Underground Station", "Wembley Central Underground Station"], 
            central: [
                "Barkingside Underground Station", "Buckhurst Hill Underground Station", 
                "Bethnal Green Underground Station", "Bond Street Underground Station", 
                "Bank Underground Station", "Chancery Lane Underground Station", 
                "Chigwell Underground Station", "Debden Underground Station", 
                "East Acton Underground Station", "Ealing Broadway Underground Station", 
                "Epping Underground Station", "Fairlop Underground Station", 
                "Greenford Underground Station", "Grange Hill Underground Station", 
                "Gants Hill Underground Station", "Holborn Underground Station", 
                "Hanger Lane Underground Station", "Hainault Underground Station", 
                "Holland Park Underground Station", "Loughton Underground Station", 
                "Lancaster Gate Underground Station", "Liverpool Street Underground Station", 
                "Leyton Underground Station", "Leytonstone Underground Station", 
                "Marble Arch Underground Station", "Mile End Underground Station", 
                "North Acton Underground Station", "Newbury Park Underground Station", 
                "Notting Hill Gate Underground Station", "Northolt Underground Station", 
                "Oxford Circus Underground Station", "Perivale Underground Station", 
                "Queensway Underground Station", "Redbridge Underground Station", 
                "Ruislip Gardens Underground Station", "Roding Valley Underground Station", 
                "Shepherd's Bush (Central) Underground Station", "Snaresbrook Underground Station", 
                "St. Paul's Underground Station", "South Ruislip Underground Station", "Stratford Underground Station", 
                "South Woodford Underground Station", "Tottenham Court Road Underground Station", "Theydon Bois Underground Station", 
                "White City Underground Station", "Woodford Underground Station", 
                "West Ruislip Underground Station", "Wanstead Underground Station", 
                "West Acton Underground Station"], 
            circle: ["Aldgate Underground Station", 
                "Barbican Underground Station", "Blackfriars Underground Station", "Baker Street Underground Station", 
                "Bayswater Underground Station", "Cannon Street Underground Station", 
                "Embankment Underground Station", "Edgware Road (Circle Line) Underground Station", 
                "Euston Square Underground Station", "Farringdon Underground Station", 
                "Goldhawk Road Underground Station", "Great Portland Street Underground Station", 
                "Gloucester Road Underground Station", "Hammersmith (H&C Line) Underground Station", 
                "High Street Kensington Underground Station", "King's Cross St. Pancras Underground Station", 
                "Ladbroke Grove Underground Station", "Latimer Road Underground Station", 
                "Liverpool Street Underground Station", "Moorgate Underground Station", 
                "Monument Underground Station", "Mansion House Underground Station", 
                "Notting Hill Gate Underground Station", "Paddington Underground Station", 
                "Paddington (H&C Line)-Underground", "Royal Oak Underground Station", 
                "Shepherd's Bush Market Underground Station", "St. James's Park Underground Station", 
                "South Kensington Underground Station", "Sloane Square Underground Station", 
                "Temple Underground Station", "Tower Hill Underground Station", "Victoria Underground Station", 
                "Wood Lane Underground Station", "Westminster Underground Station", "Westbourne Park Underground Station"], 
            district: ["Acton Town Underground Station", "Aldgate East Underground Station", "Bromley-by-Bow Underground Station", 
                "Becontree Underground Station", "Blackfriars Underground Station", "Barking Underground Station", 
                "Barons Court Underground Station", "Bow Road Underground Station", "Bayswater Underground Station", 
                "Cannon Street Underground Station", "Chiswick Park Underground Station", "Dagenham East Underground Station", 
                "Dagenham Heathway Underground Station", "Ealing Broadway Underground Station", "Ealing Common Underground Station", 
                "Earl's Court Underground Station", "East Ham Underground Station", "Embankment Underground Station", 
                "Elm Park Underground Station", "East Putney Underground Station", "Edgware Road (Circle Line) Underground Station", 
                "Fulham Broadway Underground Station", "Gunnersbury Underground Station", "Gloucester Road Underground Station", 
                "Hornchurch Underground Station", "Hammersmith (Dist&Picc Line) Underground Station", 
                "High Street Kensington Underground Station", "Kensington (Olympia) Underground Station", 
                "Kew Gardens Underground Station", "Mile End Underground Station", "Monument Underground Station", 
                "Mansion House Underground Station", "Notting Hill Gate Underground Station", 
                "Paddington Underground Station", "Plaistow Underground Station", "Parsons Green Underground Station", 
                "Putney Bridge Underground Station", "Richmond Underground Station", "Ravenscourt Park Underground Station", 
                "Stamford Brook Underground Station", "Southfields Underground Station", "Stepney Green Underground Station", 
                "St. James's Park Underground Station", "South Kensington Underground Station", "Sloane Square Underground Station", 
                "Temple Underground Station", "Turnham Green Underground Station", "Tower Hill Underground Station",
                "Upminster Bridge Underground Station", "Upton Park Underground Station", "Upminster Underground Station",
                "Upney Underground Station", "Victoria Underground Station", "West Brompton Underground Station", 
                "West Ham Underground Station", "Wimbledon Underground Station", "Wimbledon Park Underground Station", 
                "West Kensington Underground Station", "Whitechapel Underground Station", "Westminster Underground Station"],
            jubilee: [
                "Bermondsey Underground Station", "Bond Street Underground Station", "Baker Street Underground Station", 
                "Canning Town Underground Station", "Canons Park Underground Station", "Canada Water Underground Station", 
                "Canary Wharf Underground Station", "Dollis Hill Underground Station", "Finchley Road Underground Station", 
                "Green Park Underground Station", "Kilburn Underground Station", "Kingsbury Underground Station", 
                "London Bridge Underground Station", "Neasden Underground Station", "North Greenwich Underground Station", 
                "Queensbury Underground Station", "St. John's Wood Underground Station", "Stratford Underground Station", 
                "Stanmore Underground Station", "Swiss Cottage Underground Station", "Southwark Underground Station",
                "West Ham Underground Station", "West Hampstead Underground Station", "Willesden Green Underground Station", 
                "Waterloo Underground Station", "Westminster Underground Station", "Wembley Park Underground Station"],
            victoria: ["Blackhorse Road Underground Station", "Brixton Underground Station", "Euston Underground Station",
                "Finsbury Park Underground Station", "Green Park Underground Station", "Highbury & Islington Underground Station", 
                "King's Cross St. Pancras Underground Station", "Oxford Circus Underground Station", "Pimlico Underground Station", 
                "Stockwell Underground Station", "Seven Sisters Underground Station", "Tottenham Hale Underground Station", 
                "Victoria Underground Station", "Vauxhall Underground Station", "Warren Street Underground Station", 
                "Walthamstow Central Underground Station"],
            metropolitan: [
                "Aldgate Underground Station", "Amersham Underground Station", "Barbican Underground Station", 
                "Baker Street Underground Station", "Chalfont & Latimer Underground Station", "Chesham Underground Station", 
                "Croxley Underground Station", "Chorleywood Underground Station", "Eastcote Underground Station", 
                "Euston Square Underground Station", "Farringdon Underground Station", "Finchley Road Underground Station", 
                "Great Portland Street Underground Station", "Hillingdon Underground Station", "Harrow-on-the-Hill Underground Station", 
                "Ickenham Underground Station", "King's Cross St. Pancras Underground Station", "Liverpool Street Underground Station", 
                "Moorgate Underground Station", "Moor Park Underground Station", "North Harrow Underground Station", 
                "Northwick Park Underground Station", "Northwood Underground Station", "Northwood Hills Underground Station", 
                "Pinner Underground Station", "Preston Road Underground Station", "Rickmansworth Underground Station", 
                "Ruislip Manor Underground Station", "Ruislip Underground Station", "Rayners Lane Underground Station", 
                "Uxbridge Underground Station", "Watford Underground Station", "West Harrow Underground Station", 
                "Willesden Green Underground Station", "Wembley Park Underground Station"],
            northern: [
                "Archway Underground Station", "Angel Underground Station", "Balham Underground Station", 
                "Bank Underground Station", "Borough Underground Station", "Burnt Oak Underground Station", "Brent Cross Underground Station", 
                "Belsize Park Underground Station", "Chalk Farm Underground Station", "Charing Cross Underground Station", 
                "Colindale Underground Station", "Clapham Common Underground Station", "Clapham North Underground Station", 
                "Clapham South Underground Station", "Colliers Wood Underground Station", "Camden Town Underground Station", 
                "Elephant & Castle Underground Station", "East Finchley Underground Station", "Edgware Underground Station", 
                "Embankment Underground Station", "Euston Underground Station", "Finchley Central Underground Station", 
                "Goodge Street Underground Station", "Golders Green Underground Station", "High Barnet Underground Station", 
                "Hendon Central Underground Station", "Highgate Underground Station", "Hampstead Underground Station", 
                "Kennington Underground Station", "Kentish Town Underground Station", "King's Cross St. Pancras Underground Station", 
                "London Bridge Underground Station", "Leicester Square Underground Station", "Morden Underground Station", 
                "Moorgate Underground Station", "Mill Hill East Underground Station", "Mornington Crescent Underground Station", 
                "Old Street Underground Station", "Oval Underground Station", "Stockwell Underground Station", "South Wimbledon Underground Station", 
                "Totteridge & Whetstone Underground Station", "Tooting Bec Underground Station", "Tooting Broadway Underground Station", 
                "Tottenham Court Road Underground Station", "Tufnell Park Underground Station", "West Finchley Underground Station", 
                "Waterloo Underground Station", "Woodside Park Underground Station", "Warren Street Underground Station"], 
            piccadilly: [
                "Acton Town Underground Station", "Alperton Underground Station", "Arnos Grove Underground Station", "Arsenal Underground Station", 
                "Bounds Green Underground Station", "Boston Manor Underground Station", "Barons Court Underground Station", 
                "Caledonian Road Underground Station", "Covent Garden Underground Station", "Cockfosters Underground Station", 
                "Eastcote Underground Station", "Ealing Common Underground Station", "Earl's Court Underground Station", 
                "Finsbury Park Underground Station", "Green Park Underground Station", "Gloucester Road Underground Station", 
                "Holborn Underground Station", "Hillingdon Underground Station", "Hatton Cross Underground Station", 
                "Hyde Park Corner Underground Station", "Heathrow Terminal 4 Underground Station", "Heathrow Terminal 5 Underground Station", 
                "Heathrow Terminals 2 & 3 Underground Station", "Hammersmith (Dist&Picc Line) Underground Station", 
                "Hounslow Central Underground Station", "Hounslow East Underground Station", "Hounslow West Underground Station", 
                "Holloway Road Underground Station", "Ickenham Underground Station", "Knightsbridge Underground Station", 
                "King's Cross St. Pancras Underground Station", "Leicester Square Underground Station", "Manor House Underground Station", 
                "North Ealing Underground Station", "Northfields Underground Station", "Oakwood Underground Station", "Osterley Underground Station", 
                "Piccadilly Circus Underground Station", "Park Royal Underground Station", "Ruislip Manor Underground Station", 
                "Ruislip Underground Station", "Russell Square Underground Station", "Rayners Lane Underground Station", 
                "South Ealing Underground Station", "Southgate Underground Station", "South Harrow Underground Station", 
                "South Kensington Underground Station", "Sudbury Hill Underground Station", "Sudbury Town Underground Station", 
                "Turnham Green Underground Station", "Turnpike Lane Underground Station", "Uxbridge Underground Station", 
                "Wood Green Underground Station"] 
            }
    }
}

class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.lines = (new Lines()).stations();
    this.root = this.attachShadow({ mode: 'open' });
    this.lineSize = 18;
    this.boardSize = 140;
    this.timeout = 60000;
    this.size = '50px';
    this.resizeTimeout;
    this.myWorker = new Worker('/tube-timetable/routes/tube-app/lineFetch.js');
    this.arrivalWorker = new Worker('/tube-timetable/routes/tube-app/arrivalFetch.js');
    this['_showLine'] = this['_showLine'].bind(this);
    this['_showArrival'] = this['_showArrival'].bind(this);
    this['resizeThrottler'] = this['resizeThrottler'].bind(this);
    this['resizeHandler'] = this['resizeHandler'].bind(this);
    this.myTimeout;
    this.newSize = '0px';
    
  }
  connectedCallback() {
    this.size = parseInt(screen.width/27)+'px';
    this.ref = {};
    this.render();
    this.root.querySelectorAll('[data-ref]').forEach((item)=>{
      this.ref[item.getAttribute('data-ref')] = item;
    });
    this.myWorker.postMessage({option:Object.keys(this.lines),ref:'lines-select'});
    this.myWorker.onmessage = this._showLine;
    this._buildStation('bakerloo');
    this.arrivalWorker.onmessage = this._showArrival;
    this.arrivalWorker.postMessage('Bakerloo');
    this._getLines();
    this.arrivalWorker.postMessage('Baker Street Underground Station');

    this.ref['lines-select'].addEventListener('change',()=>{
      clearTimeout(this.myTimeout);
      this._buildStation(this.ref['lines-select'].value);
    });
    this.ref['station-select'].addEventListener('change',()=>{
      this._setLines(this.ref['station-select'].value.replace('Underground Station','').substring(0,18));
      this.arrivalWorker.postMessage(this.ref['station-select'].value);
    });
    window.addEventListener('resize',this.resizeThrottler);
  }
  resizeThrottler(){
    if ( !this.resizeTimeout ) {
      this.resizeTimeout = setTimeout(() => {
        this.resizeTimeout = null;
        this.resizeHandler();
     
       // The actualResizeHandler will execute at a rate of 15fps
       }, 66);
    }
  }
  resizeHandler(){
    console.log(parseInt(screen.width/27));
    
    if(this.newSize !== parseInt(screen.width/27)+'px'){
      this.newSize = parseInt(screen.width/27)+'px';
      this.root.querySelectorAll('tube-split-flap').forEach((item)=>{
        item.size = parseInt(screen.width/27)+'px';
      });
    }
    
  }
  render(){
    this.root.innerHTML = `<style>#line{display:grid;grid-template-columns:repeat(28, calc(100% / 29));grid-gap:1px;margin:10px 0 0 0}#board{display:grid;grid-template-columns:repeat(28, calc(100% / 29));grid-gap:1px;margin:10px 0 0 0}#text-display{display:grid;grid-template-columns:2fr 1fr;grid-column-gap:5px}nav{width:100%;display:flex;align-items:center;justify-content:center}nav h1{font-family:'Didact Gothic', sans-serif;font-size:3rem;text-shadow:#8e8e8e 1px 1px 2px}
</style><nav><h1>London Tube Timetable</h1></nav><div class="text-display"><select name="lines" id="lines" data-ref='lines-select'></select><select name="station" id="station" data-ref='station-select'></select><button>send</button></div><div id="line" data-ref='line'><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap><tube-split-flap color='red' size='${this.size}'></tube-split-flap></div><div id="board" data-ref='board'><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap><tube-split-flap color='#ffd801' size='${this.size}'></tube-split-flap></div>`;
  }
  _buildLines(){
    
  }
  _showLine(event){
    this.ref[event.data.ref].innerHTML = event.data.option;
  }
  _buildStation(line){
    this.myWorker.postMessage({option:this.lines[line],ref:'station-select'});
  }

  
  _showArrival(event){
    this._setBoard(event.data);
    this.myTimeout = setTimeout(()=>{
      this.arrivalWorker.postMessage(this.ref['station-select'].value);
    },this.timeout);
  }

  _setBoard(text){
    const elem = this.ref['board'].querySelectorAll('tube-split-flap');
    let items = new Array(this.boardSize).fill(' ');
    text.split('').forEach((char,index)=>{
      items[index] = char;
    });

    items.forEach((item,index)=>{
      elem.item(index).setLetter(item.toUpperCase());
    });
  }
  _getLines(){
    this._setLines('Baker Street'.substring(0,18));
  }
  _setLines(text){
    const splitFlaps = this.ref['line'].querySelectorAll('tube-split-flap');
    let blanks = new Array(this.lineSize).fill(' ');
    text.split('').forEach((char,index)=>{
      blanks[index] = char;
    });
    blanks.forEach((item,index)=>{
      splitFlaps.item(index).setLetter(item.toUpperCase());
    });
  }
}
if(!customElements.get('tube-app')){
  customElements.define('tube-app', TubeApp);
}

export { TubeApp };
