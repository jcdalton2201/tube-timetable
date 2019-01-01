import '../../widgets/tube-split-flap/tube-split-flap.js';
import {TubeBase} from '../tube-base/tube-base.js';
export class TubeBoard extends TubeBase {
  constructor(){
    super();

  }
  render(){
    this.html(tempHtml);
  }

}
if(!customElements.get('tube-board')){
  customElements.define('tube-board', TubeBoard);
}
