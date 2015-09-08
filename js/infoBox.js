var KiloWalk = KiloWalk || {};
KiloWalk.InfoBox = function(){
	this.info = L.control();
    
    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    
    // method that we will use to update the control based on feature properties passed
    this.info.update = function (data) {
        this._div.innerHTML = ''
        this._div.appendChild(this.dataVisComponent(data));
    };

    this.info.dataVisComponent = function (data) {
        var component = document.createElement("div");

        if(data){
            for(device in data){
                if(data[device].data){
                    var dataSize = data[device].data.length;

                    var card = document.createElement("div");
                    card.className = "mdl-card";

                    var cardTitle = document.createElement("div");
                    cardTitle.className = "mdl-card__title";
                    cardTitle.innerHTML = data[device].installID;

                    var cardTitleText = document.createElement("h2");
                    cardTitleText.innerHTML = data[device].installID;
                    //cardTitle.appendChild(cardTitleText);

                    var cardText = document.createElement("div");
                    cardText.className = "mdl-card__supporting-text";
                    cardText.innerHTML = JSON.stringify(data[device].data[dataSize - 1]);
                    
                    card.appendChild(cardTitle);
                    card.appendChild(cardText);
                    component.appendChild(card);
                }
            }
        /*
        <div class="mdl-card">
          <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">title Text Goes Here</h2>
          </div>
          <div class="mdl-card__media">
            <img src="photo.jpg" width="220" height="140" border="0" alt="" style="padding:20px;">
          </div>
          <div class="mdl-card__supporting-text">
            This text might describe the photo and provide further information, such as where and
            when it was taken.
          </div>
          <div class="mdl-card__actions">
            <a href="(URL or function)">Related Action</a>
          </div>
      </div>
      */
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