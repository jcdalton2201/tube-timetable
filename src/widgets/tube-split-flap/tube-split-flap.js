
import {TubeBase} from '../tube-base/tube-base.js';
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
    this.html(tempHtml);
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
    elem.classList.add('flip-down')
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
    elem.classList.add('flip-bottom')
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
