import '../../widgets/tube-board/tube-board.js';
import {Lines} from '../../utils/lines.js';
export class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.lines = (new Lines()).stations();
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
  }

  render(){
    this.root.innerHTML = tempHtml;
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
