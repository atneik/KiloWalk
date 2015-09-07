var KiloWalk = KiloWalk || {};
/////////////////////////////////////////
// Fetch Devices
/////////////////////////////////////////
KiloWalk.map = {
  sortObj: {  "published": -1 },
  numberOfDocs: 10,
  map: null,
  infoDevices: null,
  rawDevicesData: {},
  getData: function(callback){
    var url = "https://api.mongolab.com/api/1/databases/heroku_23wdtw34/collections/tiledata?s=" + encodeURIComponent(JSON.stringify(this.sortObj)) + "&l=" + this.numberOfDocs + "&apiKey=" + _API_KEY;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            console.log(data);
            callback.call(this, data);
        }
    }.bind(this);
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  },
  plot: function(data){
    var updateRawDevicesData = function(id, data){
      if(!this.rawDevicesData[id].data)
        this.rawDevicesData[id].data = [];
      this.rawDevicesData[id].data.push(
        { 
          "published": data.published, 
          "energy": data.energy, 
          "steps": data.steps, 
          "volts": data.volts, 
          "power": data.power
        }
      );
      this.infoDevices.updateBox(JSON.stringify(this.rawDevicesData));
    }.bind(this);

    for(var i = 0; i < data.length; i++){
      if(!this.rawDevicesData[data[i].deviceID]){
        this.rawDevicesData[data[i].deviceID] = {};
        this.rawDevicesData[data[i].deviceID].lat_long = data[i].lat_long;
      }
    }
    console.log(this.rawDevicesData);
    var first = true;
    var avgLat_long = [0, 0];
    var count = 0;
    for(device in this.rawDevicesData){
      avgLat_long[0] += this.rawDevicesData[device].lat_long[0];
      avgLat_long[1] += this.rawDevicesData[device].lat_long[1];
      count++;
    }
    if(count){
      avgLat_long[0] = avgLat_long[0] / count;
      avgLat_long[1] = avgLat_long[1] / count;
    }
    for(device in this.rawDevicesData){
      if(first){
        this.map = L.map('map').setView(avgLat_long, 12);
        L.tileLayer.provider('Stamen.Toner').addTo(this.map);

        this.infoDevices = new KiloWalk.InfoBox();
        this.infoDevices.render(this.map);
        
        first = false;
      }
      var device = new KiloWalk.Device(device, this.rawDevicesData[device].lat_long);
      device.plotOnMap(this.map);
      device.startUpdate(updateRawDevicesData);
    }
  },
  render: function(){
    this.getData(this.plot);
  }
}
/////////////////////////////////////////
// MAIN
/////////////////////////////////////////
KiloWalk.map.render();