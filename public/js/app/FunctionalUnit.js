define(function () {
    'use strict';

    function FunctionalUnit(cycleExecute, type) {
        this.cycles_execution = cycleExecute;
        this.type = type;
        this.current_cycle = 0;
        this.occupied = false;
        this.instruction = [];
    }


    //public methods.
    FunctionalUnit.prototype = (function () {

        return {

            execute: function (instr) {
                this.current_cycle = this.cycles_execution;
                this.instruction.push(instr);
                this.occupied = true;

            },

            isOccupied: function () {
                return this.occupied;
            },

            getType: function () {
                return this.type;
            },

            nextCycle: function () {
                if (this.occupied == true) {
                    this.current_cycle -= 1;
                    if (this.current_cycle == 0) {
                        this.occupied = false;
                    }
                }
            },

            getInstCompleted: function () {
                return this.instruction.pop();
            },

            hasInstruction: function () {
                if (this.instruction.length != 0) {
                    return true;
                }
                return false;
            },
            getId: function () {
                if (this.occupied == true) {
                    return this.instruction[0].getId();
                } else {
                    return "-";
                }
            },

            especulativesInstruction: function() {
              var out = [];
              this.instruction.forEach(function(i) {
                if (i) {
                  if ((i.getEspeculative() !== 0)) {
                    out.push(i);
                  }
                }
              });

              return out;
            },

            uncheckInstruction: function(tag) {
              var out = [];
              this.instruction.forEach(function(i) {
                if (!(i.getEspeculative() <= tag)) {
                  i.especulative -= 1;
                  if (i.especulative == 0) {
                    out.push(i);
                  }
                }
              });

              return out;
            }

        }
    })();

    return FunctionalUnit;
});