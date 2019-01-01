
import '../../../dist/widgets/tube-board';
describe('Test of Board', ()=>{
  let elem;
  afterEach(()=>{
    document.innerHTML = '';
  });
  beforeEach(()=>{
    elem = document.createElement('tube-board');
  });
  it('Test we can spec', ()=>{
    document.body.appendChild(elem);
    expect(!elem).toBeFalsy();
  });

});
