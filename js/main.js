var KiloWalk = KiloWalk || {};
/////////////////////////////////////////
// Fetch Data
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
      var circle = L.circle(devices[device].lat_long, 300, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          id: 'marker'
      }).addTo(map);
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
