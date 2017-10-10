define(function () {
    'use strict';

    function RobColum() {
        this.instruction = [];
    }


    //public methods.
    RobColum.prototype = (function () {

        return {

            addInstruction: function (inst) {
                this.instruction.push(inst);
            },

            getInstruction: function () {
                if (this.instruction.length == 1) {
                    return this.instruction.pop();
                }
                else {
                    // console.log("ROB VACIO.");
                }
            },

            isBusy: function () {
                if (this.instruction.length == 1) {
                    return true;
                }
                else {
                    return false;
                }
            },
            getId: function () {
                if (this.instruction.length > 0) {
                    return this.instruction[0].getId();
                } else {
                    return "-";
                }
            },

            getEspeculative: function() {
            var out = [];
            this.instruction.forEach(function(i) {
                if ((i.getEspeculative() !== 0)) {
                  out.push(i);
                }
            });
            
            return out;
            }
        }

    })();

    return RobColum;
});
