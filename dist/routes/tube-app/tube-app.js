import '../../widgets/tube-board/tube-board.js';
export class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.lineSize = 18;
    this.boardSize = 140;
    this.timeout = 60000;
    this.myWorker = new Worker('/tube-timetable/routes/tube-app/lineFetch.js');
    this.arrivalWorker = new Worker('/tube-timetable/routes/tube-app/arrivalFetch.js');
    this['_showLine'] = this['_showLine'].bind(this);
    this['_showArrival'] = this['_showArrival'].bind(this);
    this.myTimeout;
  }
  connectedCallback() {
    this.ref = {};
    this.render();
    this.root.querySelectorAll('[data-ref]').forEach((item)=>{
      this.ref[item.getAttribute('data-ref')] = item;
    });
    this.myWorker.postMessage('');
    this.myWorker.onmessage = this._showLine;
    this.arrivalWorker.onmessage = this._showArrival;
    this.arrivalWorker.postMessage('Backerloo');
    this._getLines();
    this.ref['lines-select'].addEventListener('change',()=>{
      clearTimeout(this.myTimeout);
      this._setLines(this.ref['lines-select'].value);
      this.arrivalWorker.postMessage(this.ref['lines-select'].value);
    });
  }

  render(){
    this.root.innerHTML = `<style>#line{display:grid;grid-template-columns:repeat(28, 50px);grid-gap:1px;margin:10px 0 0 0}#board{display:grid;grid-template-columns:repeat(28, 50px);grid-gap:1px;margin:10px 0 0 0}#text-display{display:grid;grid-template-columns:2fr 1fr;grid-column-gap:5px}nav{width:100%;display:flex;align-items:center;justify-content:center}nav h1{font-family:'Didact Gothic', sans-serif;font-size:3rem;text-shadow:#8e8e8e 1px 1px 2px}
</style><nav><h1>London Tube Timetable</h1></nav><div class="text-display"><select name="lines" id="lines" data-ref='lines-select'></select><button>send</button></div><div id="line" data-ref='line'><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap></div><div id="board" data-ref='board'><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap><tube-split-flap color='#ffd801' size='50px'></tube-split-flap></div>`;
  }
  _showLine(event){
    this.ref['lines-select'].innerHTML = event.data;
    console.log(event.data);
  }

  
  _showArrival(event){
    this._setBoard(event.data);
    this.myTimeout = setTimeout(()=>{
      this.arrivalWorker.postMessage(this.ref['lines-select'].value);
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
    this._setLines('Backerloo');
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
