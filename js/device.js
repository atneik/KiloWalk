var KiloWalk = KiloWalk || {};
/////////////////////////////////////////
// Device class
/////////////////////////////////////////
KiloWalk.Device = function(deviceID, deviceLat_long) {
  this.deviceID = deviceID;
  this.lat_long = deviceLat_long;
  this.circle = null;
  this.update = false;
  this.updateCallback = null;
  this.data = [];

  this.addLatestDataPoint = function(){
    if(this.update){
      if(typeof _API_KEY == "undefined")
        _API_KEY = Utility.getQueryParams(document.location.search).apiKey;
      var sortObj = { "published": -1 };
      var queryObj = { "deviceID": this.deviceID};
      var url = "https://api.mongolab.com/api/1/databases/heroku_23wdtw34/collections/tiledata" + 
          "?s=" + encodeURIComponent(JSON.stringify(sortObj)) + 
          "&q=" + encodeURIComponent(JSON.stringify(queryObj)) +
          "&l=1&apiKey=" + _API_KEY;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              var data = JSON.parse(xmlhttp.responseText);
              if(this.data.length === 0 || this.data[this.data.length - 1]["_id"]["$oid"] != data[0]["_id"]["$oid"]){
                this.data.push(data[0]);
                this.updateCallback(this.deviceID, data[0]);
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
KiloWalk.Device.prototype.plotOnMap = function(map, callback){
  this.circle = L.circle(this.lat_long, 300, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          id: 'marker',
          deviceID: this.deviceID
      }).addTo(map);

  this.circle.on('click', function(e) {
    console.log(this.data);
    callback(this.deviceID);
  }.bind(this));
}
KiloWalk.Device.prototype.startUpdate = function(callback){
  this.update = true;
  this.updateCallback = callback;
  this.addLatestDataPoint();
}
KiloWalk.Device.prototype.stopUpdate = function(){
  this.update = false;
}