var HostArray = function (local, arrayHosts) {
    this.local = local;
    this.arrayHosts = arrayHosts;
    this.image;
    this.arrayElements = [];
};

HostArray.prototype.setImage = function (img) {
    switch (img) {
        case 0:
            this.image = "./images/antena.png";
            break;
        case 0:
            this.image = "";
            break;
        case 0:
            this.image = "";
            break;
    }
};

HostArray.prototype.listaHost = function () {
    $("body").find(this.local).html("");
    var self = this;
    for (var i = 0; i < this.arrayHosts.length; i++) {
        this.arrayElements.push(
                new Host(
                        self.local,
                        self.arrayHosts[i].nomeAntena,
                        self.arrayHosts[i].latitude,
                        self.arrayHosts[i].longitude,
                        self.image).createAndAddToDivHost());
    }
    if (this.arrayHosts.length == 0) {
        $("body").find(this.local).append("<div class='jumbotron'><h2>N&atilde;o existem antenas ativas de momento</h2></div>");
    }
};