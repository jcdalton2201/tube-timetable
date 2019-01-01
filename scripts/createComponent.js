const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const mkdirp = require('mkdirp');
const fs = require('fs');
class createComponent {
  constructor() {
    if(argv.name){
      let paths = argv.name.split('/');
      let name = argv.name;
      let dir='';
      if(paths.length > 1){
        name = paths[paths.length - 1];
        dir = `/${paths[0]}`;
      }
      console.log(chalk.green(`we are going to build component ${name}`));
      this._buildDir(name,dir);
      this._buildJS(name,dir);
      this._buildHTML(name,dir);
      this._buildSASS(name,dir);
      this._buildTest(name,dir);
    } else {
      console.log(chalk.red('Please add the argument --name=<<name>>'));
    }
  }
  _slug(name){
    return name.toLowerCase().split('-').map((item) => {
      return item.replace(/^\w/, c => c.toUpperCase())
    }).join('');

  }
  _buildDir(name,dir){
    mkdirp.sync(`src${dir}/tube-${name}`);
    mkdirp.sync(`spec${dir}/tube-${name}`);
    console.log(chalk.green(`we have created a file at src/tube-${name}`));
  }
  _buildJS(name,dir){
    const file = `src${dir}/tube-${name}/tube-${name}.js`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`
export class Tube${this._slug(name)} extends HTMLElement {
  constructor(){
    super();

  }
  render(){
    this.html(tempHtml);
  }

}
if(!customElements.get('tube-${name}')){
  customElements.define('tube-${name}', Tube${this._slug(name)});
}
`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created javascript file tube-${name}.js`));
  }
  _buildHTML(name,dir){
    const file = `src${dir}/tube-${name}/tube-${name}.html`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`<div>${name}</div>`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created html file tube-${name}.html`));
  }
  _buildTest(name,dir){
    const file = `spec${dir}/tube-${name}/tube-${name}-spec.js`;
    const writeStream = fs.createWriteStream(file);
    writeStream.write(`
import '../../../dist${dir}/tube-${name}';
describe('Test of ${this._slug(name)}', ()=>{
  let elem;
  afterEach(()=>{
    document.innerHTML = '';
  });
  beforeEach(()=>{
    elem = document.createElement('tube-${name}');
  });
  it('Test we can spec', ()=>{
    document.body.appendChild(elem);
    expect(!elem).toBeFalsy();
  });

});
`);
    writeStream.end();
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created spec file tube-${name}.js`));
  }
  _buildSASS(name,dir){
    const file = `src${dir}/tube-${name}/tube-${name}.scss`;
    const writeStream = fs.createWriteStream(file);
    fs.createReadStream(file)
      .pipe(writeStream);
    console.log(chalk.green(`we have created sass file tube-${name}.scss`));
  }
}
new createComponent();
