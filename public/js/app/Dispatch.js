define(['Instruction'], function (Instruction) {
    'use strict';

    function Dispatch(){
        this.currentCycle = 0;
        this.instructions = [];
        this.priority = -1;

    }


    //public methods.
    Dispatch.prototype = (function () {

        return {
            increaseCycle: function () {
                this.currentCycle += 1;
            },

            addInstruction: function (inst, priority) {
                // console.log("agregue al DISPATCH: "+inst);
                // console.log('Agregue a dispatch - ' +inst.getId() +
                             // ' - con especulative tag: ' + inst.getEspeculative());
                this.instructions.push(inst);
                this.priority = priority;
            },

            isBusy: function () {
                if (this.instructions.length == 0) {
                    return false;
                }
                else {
                    return true;
                }
            },

            isEmpty: function () {
                if (this.instructions.length == 1) {
                    return false;
                }
                else {
                    return true;
                }
            },

            getInstruction: function () {
                return this.instructions.shift();
            },
            print: function () {
                // console.log(this.instructions.length);
                for (var i = 0; i < this.instructions.length; i++) {
                    var e = (this.instructions[i].getEspeculative()) ? 'ESPECULATIVE' : null;
                    // console.log(this.instructions[i].getId());
                }
            },
            getGrade: function () {
                return this.size;
            },
            getId: function () {
                if (this.instructions.length == 1) {
                    return this.instructions[0].getId();
                }

                else {
                    return "-";
                }
            },
            getPriority: function () {
                return this.priority;
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
                if ((i.getEspeculative() !== 0)) {
                  out.push(i);
                }
              });

              return out;
            }
        }
    })();

    return Dispatch;

});
