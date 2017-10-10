define(["jquery"], function ($) {

    var
        generateTD = function(number, array, color) {
          for (var j=0; j < array.length; j++) {
            if (number == array[j].uniqueNumber) {
              return "<td style='color:"+color+";'>" +
               array[j].getId()
              + "<small><em>(" + array[j].uniqueNumber + ")</em></small>"
              + "</td>";
            }
          }
          return null;
        },
        generateHead = function (head) {
            var headRow = "<tr>";
            for (var i = 0; i < head.length; i++)
                headRow += "<th>" + head[i] + "</th>";

            return headRow + "</tr>";
        },
        generateRow = function(arr) {
          var row = "<tr>";
          for (var i = 0; i < arr.length; i++)
            row += "<td>" + arr[i] + "</td>";

          return row + "</tr>";
        },
        generateRowArr = function (arr, uncheckIns, checkIns) {
          var row = "<tr>";
          for (var i=0; i < arr.length; i++){
            if (arr[i] && !((arr[i] ==="-") || (arr[i] ==="i") || (arr[i] ==="f")
                            || (arr[i] ==="x") || (arr[i] ==="c"))) {
              var instNumber = arr[i].uniqueNumber;
                var td = null;
                if (uncheckIns && checkIns) {
                  td = generateTD(instNumber, uncheckIns, 'green');
                  if (!td) {
                    td = generateTD(instNumber, checkIns, 'red');
                  }
                }
                if (!td) {
                  row += "<td>"+
                   arr[i].getId()
                   +"<small><em>(" + arr[i].uniqueNumber + ")</em></small>"
                   +"</td>";
                } else {
                  row += td;
                }
            } else if (arr[i]){
              row += "<td>"+ arr[i] +"</td>";
            } else {
              row += "<td> - </td>";
            }
          }

          return row + "</tr>";
        },

        getBodyTable = function (id) {
            return $(id).children()[0];
        },
        generateBTB = function(size) {
          var rows;
          for (var i = 0; i<size; i++) {
            rows += generateRow(["-", "-", "-"]);
          }
          return rows;
        },

        formatType = function(type) {
          switch(type) {
              case "beq_type": return "B";
              case "multi_type": return "G";
              case "arith_int": return "AI";
              case "arith_float": return "AF";
              case "mem_float": return "MF";
              case "mem_int": return "MI";
              default: return "G";
            }
        },

        generateHeadUnits = function(fus) {
          headers = "<tr>"
          for (var i = 0; i < fus.length ; i++) {
            headers += `<th> UF<small><em>${formatType(fus[i].type)}</em></small></th>`
          }

          return headers + "</tr>";
      }


    function UiManager(ciclesTbId, dpId, rsTbId, fuTbId, robTbId,btbID) {
        this.ciclesTableId = ciclesTbId;
        this.dispatcherTableId = dpId;
        this.reservStationsTableId = rsTbId;
        this.functionalUnitiesTableId = fuTbId;
        this.robTableId = robTbId;
        this.btbTableId= btbID;
    }

    var getRobAsArray = function (iterations) {
        var columns = [];
        for (var i = 0; i < iterations * 2; i++) {
            columns[i] = (i % 2 == 0) ? "I" : "S";
        }

        return columns;
    }

    UiManager.prototype.constructTables = function (dp, rs, fu, bs) {
        this.dispatcher = dp;
        this.reservStations = rs;
        this.functionalUnities = fu;
        this.rob = rs.length + fu.length;

        $(getBodyTable(this.ciclesTableId)).html(generateHead(["Ciclos"]));
        $(getBodyTable(this.dispatcherTableId)).html(generateHead(this.dispatcher));
        $(getBodyTable(this.reservStationsTableId)).html(generateHead(this.reservStations));
        $(getBodyTable(this.functionalUnitiesTableId)).html(generateHeadUnits(this.functionalUnities));
        $(getBodyTable(this.robTableId)).html(generateHead(getRobAsArray(this.rob)));
        $(getBodyTable(this.btbTableId)).html(generateHead(["Dirección del Branch (BIA)","Dirección del Salto (BTA)","Estado del Predictor"]));
        $(getBodyTable(this.btbTableId)).append(generateBTB(bs));
    }

    var getRobRow = function (instructions, states) {
        var row = [];
        var counter = 0;
        for (var i = 0; i < instructions.length; i++) {
            // console.log(counter + " " + (counter + 1));
            row[counter] = instructions[i].instruction[0];
            row[counter + 1] = states[i];
            counter = counter + 2;
        }
        return row;
    };

    UiManager.prototype.addRows = function (cicle, dispatcherState, reservStationsQueue,
      functionalUnitiesCurrents, robInstructions, robStates, uncheckIns, checkIns) {
        $(getBodyTable(this.ciclesTableId)).append(generateRow([cicle]));

        $(getBodyTable(this.dispatcherTableId)).append(
            generateRowArr(dispatcherState, uncheckIns, checkIns)
        );

        $(getBodyTable(this.reservStationsTableId)).append(
            generateRowArr(reservStationsQueue, uncheckIns, checkIns)
        );

        $(getBodyTable(this.functionalUnitiesTableId)).append(
            generateRowArr(functionalUnitiesCurrents)
        );

        $(getBodyTable(this.robTableId)).append(
            generateRowArr(getRobRow(robInstructions, robStates), uncheckIns, checkIns)
        );
    };

   UiManager.prototype.updateBTB = function(btb){
    var i = btb.length;
    for (var i = 1; i <= btb.length; i++){
      $(this.btbTableId +' tr:nth-child('+ (i + 1) +')').html('<td>'+btb[i-1][0]+'</td><td>'+btb[i-1][1]+'</td><td>'+btb[i-1][2]+'</td>');
    }


    };

    var options = function(random) {
      var str = "";
      for (var i=1; i<11; i++) {
        if (i==random) {
          str += "<option selected value="+i+"\">" + i + "</option>"
        } else {
          str += "<option value="+i+"\">" + i + "</option>"
        }
    }
    return str;

    }

    UiManager.prototype.drawBranchs = function ( beqs ) {
      var str = "";
      for (var i=beqs.length - 1; i >= 0 ; i--){
        str += "<li><p><code>" + beqs[i] + "</code>" +
                "<select id=" +beqs[i].getId()+ '_random class="btn btn-sm btn-default">'
                +  options(Math.floor((Math.random() * 5) + 1)) +
                 "</select></p></li>"
      }
      //options(random)

        $("#branchs").html(str);


    }

    return UiManager;
});
