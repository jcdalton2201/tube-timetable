onmessage = (event) =>{
    fetch('https://api.tfl.gov.uk/Line/Mode/tube/Route?serviceTypes=Regular')
    .then(res=> res.json())
    .then((data)=>{
      const opt = data.map(item => item.name).map((item)=>{
        return `<option value='${item}'>${item}</option>`;
      });
      postMessage(opt.join(''));
    })
}