var KiloWalk = KiloWalk || {};
KiloWalk.InfoBox = function(){
	this.info = L.control();
  this.info.componentState = {};
    
    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    
    // method that we will use to update the control based on feature properties passed
    this.info.update = function (data) {
        this._div.innerHTML = ''
        this._div.appendChild(this.dataVisComponent(data));
        if(data){
            for(device in data){
                if(data[device].data){
                    appendSVGVis("mdl-card__dataViz_" + device, data[device].data);
                }
            }
        }
            function appendSVGVis(areaId, formattedData) {
                //console.log(areaId, formattedData);
                var data = [];
                for(var i = Math.max(formattedData.length - 25, 0); i < formattedData.length; i++){
                    data.push({'energy': formattedData[i].energy, published: i})
                }
                var margin = {top: 20, right: 20, bottom: 30, left: 40},
                    width = 460 - margin.left - margin.right,
                    height = 300 - margin.top - margin.bottom;

                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(5);

                var svg = d3.select("."+areaId).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .style("z-index", "100");

                  x.domain(data.map(function(d) { return d.published; }));
                  y.domain([0, d3.max(data, function(d) { return d.energy; })]);

                  svg.append("g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + height + ")")
                      .call(xAxis);

                  svg.append("g")
                      .attr("class", "y axis")
                      .call(yAxis)
                    .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("y", 6)
                      .attr("dy", ".71em")
                      .style("text-anchor", "end")
                      .text("energy");

                  svg.selectAll(".bar")
                      .data(data)
                      .enter().append("rect")
                      .attr("class", "bar")
                      .attr("x", function(d) { return x(d.published); })
                      .attr("width", x.rangeBand())
                      .attr("y", function(d) { return y(d.energy); })
                      .attr("height", function(d) { return height - y(d.energy); });
                

                function type(d) {
                  d.energy = +d.energy;
                  return d;
                }
            }
    };

    this.info.dataVisComponent = function (data) {
        var component = document.createElement("div");
        if(data){
            for(device in data){
                if(data[device].data){

                    if(!this.componentState[device])
                      this.componentState[device] = {};
                    if(!this.componentState[device].displayState)
                      this.componentState[device].displayState = 'cardMediaHide';

                    var dataSize = data[device].data.length;
                    var totalEnergy = data[device].data[dataSize - 1]['energy_t'];
                     console.log(totalEnergy);
                    /*
                    for(var i=0; i<dataSize; i++){
                      totalEnergy += data[device].data[i].energy;
                    }
                    */
                    var card = document.createElement("div");
                    card.className = "mdl-card";

                    var cardTitle = document.createElement("div");
                    cardTitle.className = "mdl-card__title";

                    var cardTitleLeft = document.createElement("div");
                    cardTitleLeft.className = "mdl-card__title_left";
                    cardTitleLeft.innerHTML = data[device].installID;
                    cardTitle.appendChild(cardTitleLeft);

                    cardTitleRight = document.createElement("div");
                    cardTitleRight.className = "mdl-card__title_right";
                    cardTitleRight.innerHTML = (totalEnergy/1000).toFixed(2) + " KJ";
                    cardTitle.appendChild(cardTitleRight);

                    var cardMedia = document.createElement("div");
                    cardMedia.className = "mdl-card__dataViz_" + device + " " + this.componentState[device].displayState;
                    
                    $(cardTitle).click((function(event, device, that){ 
                      event.stopPropagation();
                      return function(){
                        if(that.componentState[device].displayState == 'cardMediaHide')
                          that.componentState[device].displayState = 'cardMediaShow';
                        else
                          that.componentState[device].displayState = 'cardMediaHide';
                        $("."+"mdl-card__dataViz_" + device).toggleClass('cardMediaHide');
                        $("."+"mdl-card__dataViz_" + device).toggleClass('cardMediaShow');
                      }
                    })(event, device, this));

                    $(card).dblclick(function(event){
                      event.stopPropagation();
                    });

                    var cardText = document.createElement("div");
                    cardText.className = "mdl-card__supporting-text";
                    //cardText.innerHTML = JSON.stringify(data[device].data[dataSize - 1]);

                    card.appendChild(cardTitle);
                    card.appendChild(cardMedia);
                    //card.appendChild(cardText);
                    component.appendChild(card);
                }
            }
        }
        return component;
    }
}

KiloWalk.InfoBox.prototype.render = function (map){
   	this.info.addTo(map);
}

KiloWalk.InfoBox.prototype.updateBox = function (content){
   	this.info.update(content);
}