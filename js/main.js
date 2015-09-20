var KiloWalk = KiloWalk || {};
/////////////////////////////////////////
// Fetch Devices
/////////////////////////////////////////
KiloWalk.map = {
  sortObj: {  "published": -1 },
  numberOfDocs: 50,
  map: null,
  infoDevices: null,
  rawDevicesData: {},
  getData: function(callback){
    if(typeof _API_KEY == "undefined")
      _API_KEY = Utility.getQueryParams(document.location.search).apiKey;
    var dateNow = new Date();
    queryObj = { "published": { '$gt': (new Date(dateNow.getUTCFullYear(), dateNow.getMonth(), dateNow.getDate(), 0, 0 , 0)).toISOString() }};
    var url = "https://api.mongolab.com/api/1/databases/heroku_23wdtw34/collections/tiledata?s=" + 
        encodeURIComponent(JSON.stringify(this.sortObj)) + 
        "&l=" + this.numberOfDocs + 
        "&q=" + encodeURIComponent(JSON.stringify(queryObj)) +
        "&apiKey=" + _API_KEY;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            console.log('Got ' + data.length + ' data points');
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
          "power": data.power,
          "energy_t": data.energy_t
        }
      );
      //console.log(this.rawDevicesData);
      if(this.infoDevices)
        this.infoDevices.updateBox(this.rawDevicesData);
    }.bind(this);

    var deviceClickHandler = function(deviceID){
      console.log(deviceID);
      //$("."+"mdl-card__dataViz_" + deviceID).toggleClass('cardMediaHide');
      //$("."+"mdl-card__dataViz_" + deviceID).toggleClass('cardMediaShow');
    }

    for(var i = 0; i < data.length; i++){
      if(!this.rawDevicesData[data[i].deviceID]){
        this.rawDevicesData[data[i].deviceID] = {};
        this.rawDevicesData[data[i].deviceID].lat_long = data[i].lat_long;
        this.rawDevicesData[data[i].deviceID].installID = data[i].installID;
      }
      updateRawDevicesData(data[i].deviceID, data[i]);
    }

    //console.log(this.rawDevicesData);
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
      device.plotOnMap(this.map, deviceClickHandler);
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