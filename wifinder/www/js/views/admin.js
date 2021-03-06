window.AdminView = Backbone.View.extend({
  chsckedTrue: "<span><i class='fa fa-power-off fa-2x' style='text-shadow: 2px 2px 2px #ccc; color: green;'></i></span>", //'<input type="checkbox" checked="true" disabled>',
  chsckedFalse: "<span><i class='fa  fa-circle-o-notch fa-2x' style='text-shadow: 2px 2px 2px #ccc; color: red;'></i></span>", //'<input type="checkbox" disabled>',
  socketAdmin: undefined,
  events: {
    "keyup #urlvendor": "checkvendorslist",
    "change #urlvendor": "checkvendorslist",
    "click #addlistvendors": function () {
      $("#linkurl").text($("#urlvendor").val());
      $(".closeModal").attr("disabled", false);
      $("#yesclick").attr("disabled", false);
      $("#linkurl").next().remove();
      $("#modalInsertUrl").show();
    },
    "click #yesclick": "addvendorslist",
    "click .removesite": "removeSite",
    "click .removesensor": "removeSensor",
    "click #removeok": "removeSensorSite",
    "click .closeModal": function () {
      $("#modalInsertUrl").hide();
      $("#modalRemove").hide();
      $("#linkurl").text("");
    }
  },
  initialize: function (skt) {
    this.socketAdmin = skt;
  },
  init: function () {
    var self = this;
    modem("GET",
        "/getsitesAndSensores",
        function (data) {
          var tableSite = '<table class="table table-bordered"><tbody>' +
              '<tr><th style="width: 10px">#</th><th>Site Name</th><th>Sensors</th><th></th></tr>';
          for (var i in data) {
            tableSite += '<tr><td class="center-vertical">' + (i * 1 + 1) + '</td> ' +
                '<td class="center-vertical site-name">' + data[i].db + '</td>' +
                '<td><table class="table table-bordered" data-numSensors="' + data[i].numSensor + '"><tbody>' +
                '<tr><th style="width: 10px">#</th><th>Sensor Name</th><th>Date</th><th>Active in Last 5 minutes</th><th></th></tr>';
            for (var j in data[i].sensors) {
              tableSite += '<tr><td>' + (j * 1 + 1) + '</td>' +
                  '<td class="center-vertical sensor-name" data-work="' + (checkSensorActive(data[i].sensors[j].data)) + '">' + data[i].sensors[j].nomeAntena + '</td>' +
                  '<td class="center-vertical">' + moment(data[i].sensors[j].data).format('YYYY/MM/DD HH:mm:ss') + '</td>' +
                  '<td class="center-vertical">' + ((checkSensorActive(data[i].sensors[j].data)) ? self.chsckedTrue : self.chsckedFalse) + '</td>' +
                  '<td class="center-vertical"><button class="btn btn-default removesensor">Remove Sensor</button></td></tr>';
            }
            tableSite += '</tbody></table></td><td class="center-vertical"><button class="btn btn-default removesite">Remove Site</button></td></tr>';
          }
          tableSite += '</tbody></table>';

          $("#tablelistSitesAndSensores").html(tableSite);
        },
        function (xhr, ajaxOptions, thrownError) {
          var json = JSON.parse(xhr.responseText);
          error_launch(json.message);
        }, {
      url: $("#urlvendor").val()
    }
    );

    $.AdminLTE.boxWidget.activate();
  },
  checkvendorslist: function () {
    var urlPattern = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i');
    if (urlPattern.test($("#urlvendor").val())) {
      $(".validUrl").children().removeClass("fa-times").addClass("fa-check");
      $("#addlistvendors").attr("disabled", false);
    } else {
      $(".validUrl").children().removeClass("fa-check").addClass("fa-times");
      $("#addlistvendors").attr("disabled", true);
    }

  },
  addvendorslist: function () {
    $(".closeModal").attr("disabled", true);
    $("#yesclick").attr("disabled", true);
    $('<p>Please wait a moment, the system insert values.<i class="fa fa-refresh fa-spin"></i></p>').insertAfter("#linkurl");
    modem("POST",
        "/addVendors",
        function (data) {
          $(".closeModal").attr("disabled", false);
          $("#linkurl").next().remove();
          $('<p> Inserted <i class="fa fa-arrow-right"></i> ' + data.inserted + '</p>').insertAfter("#linkurl");
          $("#urlvendor").val("").trigger("keyup");
        },
        function (xhr, ajaxOptions, thrownError) {
          var json = JSON.parse(xhr.responseText);
          error_launch(json.message);
        }, {
      url: $("#urlvendor").val()
    });
  },
  removeSite: function (e) {
    var row = $(e.currentTarget).closest("tr");
    var text = row.find(".site-name").text();
    $("#modalRemove .modal-body").html("<p>Remove this site?<br>" + text + "</p>");
    $("#modalRemove").data("sitename", text);
    $("#modalRemove").show();
    $(".closeModal").attr("disabled", false);
    $("#removeok").attr("disabled", false);
  },
  removeSensor: function (e) {
    var row = $(e.currentTarget).closest("tr");
    var text = row.find(".sensor-name").text();
    var row2 = $(e.currentTarget).parent().parent().parent().parent().parent().closest("tr");
    var text2 = row2.find(".site-name").text();
    console.log("sensor->" + text);
    var numsensor = $(e.currentTarget).parent().parent().parent().parent().data("numsensors");
    console.log(row.find(".sensor-name").data("work"));

    $(".closeModal").attr("disabled", false);
    $("#removeok").attr("disabled", false);
    if (numsensor > 1) {
      if (row.find(".sensor-name").data("work")) {
        $("#modalRemove .modal-body").html("<p>You can't remove '" + text + "' from '" + text2 + "' while it's running.</p>");
        $("#modalRemove").data("sitename", text2);
        $("#removeok").attr("disabled", true);
      } else {
        $("#modalRemove .modal-body").html("<p>Remove this sensor?<br>'" + text + "' in site '" + text2 + "'.</p>");
        $("#modalRemove").data("sitename", text2);
        $("#modalRemove").data("sensorname", text);
      }
    } else {
      $("#modalRemove .modal-body").html("<p>This site only contains a sensor '" + text + "'.<br>Remove the sensor '" + text + "' will also remove the site '" + text2 + "'.</p>");
      $("#modalRemove").data("sitename", text2);
    }
    $("#modalRemove").show();
  },
  removeSensorSite: function () {
    var self = this;
    $(".closeModal").attr("disabled", true);
    $("#removeok").attr("disabled", true);
    $('<p>Please wait a moment.<i class="fa fa-refresh fa-spin"></i></p>').insertAfter("#modalRemove .modal-body p");
    //problema a ir buscar na segunda vez
    console.log($("#modalRemove").data("sitename"), $("#modalRemove").data("sensorname"));
    if ($("#modalRemove").data("sensorname")) {
      modem("POST",
          "/removeSensor",
          function (data) {
            console.log(data);
            self.init();
            $(".closeModal").attr("disabled", false);
            $("#modalRemove").data("sitename", null);
            $("#modalRemove").data("sensorname", null);
            $("#modalRemove").hide();
          },
          function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
          }, {
        site: $("#modalRemove").data("sitename"),
        sensor: $("#modalRemove").data("sensorname")
      });
    } else {
      modem("POST",
          "/removeSite",
          function (data) {
            console.log(data);
            self.init();
            $(".closeModal").attr("disabled", false);
            $("#modalRemove").data("sitename", null);
            $("#modalRemove").attr("sensorname", null);
            $("#modalRemove").hide();
          },
          function (xhr, ajaxOptions, thrownError) {
            var json = JSON.parse(xhr.responseText);
            error_launch(json.message);
          }, {
        site: $("#modalRemove").data("sitename")
      });
    }
  },
  render: function () {
    $(this.el).html(this.template());
    return this;
  }
});
