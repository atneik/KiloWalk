var KiloWalk = KiloWalk || {};
/////////////////////////////////////////
// Fetch Devices
/////////////////////////////////////////
KiloWalk.map = {
  sortObj: {  "published": -1 },
  numberOfDocs: 10,
  getData: function(callback){
    var url = "https://api.mongolab.com/api/1/databases/heroku_23wdtw34/collections/sensordata?s=" + encodeURIComponent(JSON.stringify(this.sortObj)) + "&l=" + this.numberOfDocs + "&apiKey=" + _API_KEY;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            console.log(data);
            callback(data);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  },
  plot: function(data){
    var devices = {};
    for(var i = 0; i < data.length; i++){
      if(!devices[data[i].deviceID]){
        devices[data[i].deviceID] = {};
        devices[data[i].deviceID].lat_long = data[i].lat_long;
      }
    }
    console.log(devices);
    var first = true;
    var map;
    var avgLat_long = [0, 0];
    var count = 0;
    for(device in devices){
      avgLat_long[0] += devices[device].lat_long[0];
      avgLat_long[1] += devices[device].lat_long[1];
      count++;
    }
    if(count){
      avgLat_long[0] = avgLat_long[0] / count;
      avgLat_long[1] = avgLat_long[1] / count;
    }
    for(device in devices){
      if(first){
        map = L.map('map').setView(avgLat_long, 12);
        L.tileLayer.provider('Stamen.Toner').addTo(map);
        first = false;
      }
      var device = new KiloWalk.Device(device, devices[device].lat_long);
      device.plotOnMap(map);
      device.startUpdate();
    }
  },
  render: function(){
    this.getData(this.plot);
  }
}
/////////////////////////////////////////
// Device class
/////////////////////////////////////////
KiloWalk.Device = function(deviceID, deviceLat_long) {
  this.deviceID = deviceID;
  this.lat_long = deviceLat_long;
  this.circle = null;
  this.update = false;
  this.data = [];

  this.refreshDevice = function(){
    console.log(this.data);
  }
  this.addLatestDataPoint = function(){
    if(this.update){
      var sortObj = { "published": -1 };
      var queryObj = { "deviceID": this.deviceID};
      var url = "https://api.mongolab.com/api/1/databases/heroku_23wdtw34/collections/sensordata" + 
          "?s=" + encodeURIComponent(JSON.stringify(sortObj)) + 
          "&q=" + encodeURIComponent(JSON.stringify(queryObj)) +
          "&l=1&apiKey=" + _API_KEY;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              var data = JSON.parse(xmlhttp.responseText);
              if(this.data.length === 0 || this.data[this.data.length - 1]["_id"]["$oid"] != data[0]["_id"]["$oid"]){
                this.data.push(data[0]);
                this.refreshDevice();
              } else {
                console.log(this.deviceID,"-no new data");
              }
              setTimeout(function(){ this.addLatestDataPoint() }.bind(this), 3000);
          }
      }.bind(this);
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    }
  }
}
KiloWalk.Device.prototype.plotOnMap = function(map){
  this.circle = L.circle(this.lat_long, 300, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          id: 'marker',
          deviceID: this.deviceID
      }).addTo(map);
}
KiloWalk.Device.prototype.startUpdate = function(){
  this.update = true;
  this.addLatestDataPoint();
}
KiloWalk.Device.prototype.stopUpdate = function(){
  this.update = false;
}

/////////////////////////////////////////
// MAIN
/////////////////////////////////////////
KiloWalk.map.render();
