import '../../widgets/tube-board/tube-board.js';
export class TubeApp extends HTMLElement {
  constructor(){
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.render();
  }

  render(){
    this.root.innerHTML = tempHtml;
  }

}
if(!customElements.get('tube-app')){
  customElements.define('tube-app', TubeApp);
}
