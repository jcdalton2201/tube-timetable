function _compareVehicacles(a,b){
    if(a.vehicleId < b.vehicleId){
      return -1;
    }
    if(a.vehicleId > b.vehicleId){
      return 1;
    }
    return 0;
  }
onmessage = (event) =>{
    fetch('https://api.tfl.gov.uk/Mode/tube/Arrivals?count=1')
    .then(res=> res.json())
    .then((data)=> {
        data.sort(_compareVehicacles);
        let linesData = data.filter((item)=>{
            return item.lineName === event.data;
        });
        let text = linesData.slice(0, 5).map((item)=>{
            const line = item.stationName.substring(0,10);
            const platform = item.platformName.substring(item.platformName.length-1);
            const towards = item.towards.substring(0,11);
            const arrival = parseInt(item.timeToStation /60);
            return `${line.padEnd(10,' ')} ${platform} ${towards.padEnd(11,' ')} ${arrival.toString().padStart(2,' ')}M`;
        });
        postMessage(text.join(''));        
      })
      .catch((error)=>{console.log(error)});
}