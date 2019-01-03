onmessage = (event) =>{
    console.log(event.data);
    // fetch('https://api.tfl.gov.uk/Line/Mode/tube/Route?serviceTypes=Regular')
    // .then(res=> res.json())
    // .then((data)=>{
      const opt = event.data.option.map((item)=>{
        return `<option value='${item}'>${item}</option>`;
      });
      postMessage({option:opt.join(''),ref:event.data.ref});

}