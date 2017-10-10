define(function () {
    'use strict';

    function ReservationStation() {
        this.instructions = [];

    }


    //public methods.
    ReservationStation.prototype = (function () {

        return {

            addInstruction: function (instr) {
                this.instructions.unshift(instr);
            },

            isBusy: function () {
                if (this.instructions.length == 0){
                    return false;
                } else {
                    return true;
                }
            },
            getSize: function () {
                return this.instructions.length;
            },

            print: function () {
                for (var i = 0; i < this.instructions.length; i++) {
                    console.log(this.instructions[i].getId());
                    // console.log(this.instructions[i] != []);

                }
            },
            getInstruction: function () {
                return this.instructions.pop();

            },
            getInstructionsById: function () {
                if (this.instructions.length == 1) {
                    return this.instructions[0].getId();
                }
                else {
                    return "-";
                }
            },

            invalidateInstruction: function(tag, manager) {
              const size = this.instructions.length;
              this.instructions = this.instructions.filter(function(i){
                const isFiltered = (i.getEspeculative() <= tag);
                if (!isFiltered) {
                    manager.removeIfBranch(i);
                }
                return isFiltered;
              });
              return (size != this.instructions.length);
            },

            uncheckInstruction: function(tag) {
              var out = [];
              this.instructions.forEach(function(i) {
                if (!(i.getEspeculative() <= tag)) {
                  i.especulative -= 1;
                  if (i.especulative == 0) {
                    out.push(i);
                  }
                }
              });

              return out;
            },

            especulativesInstruction: function() {
              var out = [];
              this.instructions.forEach(function(i) {
                if (i) {
                  if ((i.getEspeculative() !== 0)) {
                    out.push(i);
                  }
                }
              });

              return out;
            }

        }
    })();

    return ReservationStation;

});
