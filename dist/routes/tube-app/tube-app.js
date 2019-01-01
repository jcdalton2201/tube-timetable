import '../../widgets/tube-board/tube-board.js';
export class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.lineSize = 18;
    this.boardSize = 140;
    this.timeout = 60000;
  }
  connectedCallback() {
    this.ref = {};
    this.render();
    this.root.querySelectorAll('[data-ref]').forEach((item)=>{
      this.ref[item.getAttribute('data-ref')] = item;
    });
    this._buildBoard();
    this._getLines();
    this.ref['lines-select'].addEventListener('change',()=>{
      this._setLine(this.ref['lines-select'].value);
    });

    setTimeout(()=>{
      this._getArrivals();
      this._loop();
    });
  }

  render(){
    this.root.innerHTML = `<style>#line{display:grid;grid-template-columns:repeat(28, 50px);grid-gap:1px;margin:10px 0 0 0}#board{display:grid;grid-template-columns:repeat(28, 50px);grid-gap:1px;margin:10px 0 0 0}#text-display{display:grid;grid-template-columns:2fr 1fr;grid-column-gap:5px}nav{width:100%;display:flex;align-items:center;justify-content:center}nav h1{font-family:'Didact Gothic', sans-serif;font-size:3rem;text-shadow:#8e8e8e 1px 1px 2px}
</style><nav><h1>London Tube Timetable</h1></nav><div class="text-display"><select name="lines" id="lines" data-ref='lines-select'></select><button>send</button></div><div id="line" data-ref='line'><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap><tube-split-flap color='red' size='50px'></tube-split-flap></div><div id="board" data-ref='board'></div>`;
  }
  _buildBoard(){
    let pageSplitFlap = new Array(this.boardSize).fill(' ');
    let board =  document.querySelector('.board');
    pageSplitFlap.forEach(()=>{
      let flap = document.createElement('tube-split-flap');
      this.ref['board'].appendChild(flap);
      flap.setAttribute('color','#ffd801');
      flap.setAttribute('size','50px');
    });
  }
  _compareVehicacles(a,b){
    if(a.vehicleId < b.vehicleId){
      return -1;
    }
    if(a.vehicleId > b.vehicleId){
      return 1;
    }
    return 0;
  }
  _getArrivals(){
    fetch('https://api.tfl.gov.uk/Mode/tube/Arrivals?count=1')
      .then(res=> res.json())
      .then((data)=> {
        data.sort(this._compareVehicacles);
        let linesData = data.filter((item)=>{
          if(this.ref['lines-select'].value){
            return item.lineName === this.ref['lines-select'].value;
          }
          
          return item.lineName === 'Bakerloo';
          // return item.stationName === 'Embankment Underground Station';
    
          
        });
        console.log(linesData);
        let text = linesData.slice(0, 5).map((item)=>{
          const line = item.stationName.substring(0,10);
          const platform = item.platformName.substring(item.platformName.length-1);
          const towards = item.towards.substring(0,11);
          const arrival = parseInt(item.timeToStation /60);
          return `${line.padEnd(10,' ')} ${platform} ${towards.padEnd(11,' ')} ${arrival.toString().padStart(2,' ')}M`;
        });
        this._setBoard(text.join(''));
        
      })
      .catch((error)=>{console.log(error)});
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
    fetch('https://api.tfl.gov.uk/Line/Mode/tube/Route?serviceTypes=Regular')
    .then(res=> res.json())
    .then((data)=>{
      data.map(item => item.name).forEach((item)=>{
        const option = document.createElement('option');
        option.value = item;
        option.innerText = item;
        this.ref['lines-select'].appendChild(option);
      });
    })
    .catch(error => console.log(error));
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
  _loop(){
    setTimeout(()=>{
      this._getArrivals();
      this._loop();
    },this.timeout);
  }

}
if(!customElements.get('tube-app')){
  customElements.define('tube-app', TubeApp);
}
