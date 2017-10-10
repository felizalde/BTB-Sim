define(['Instruction', 'RobColum'], function (Instruction, RobColum) {
    'use strict';

    function Rob(size, orderList, grade) {
        this.grade = grade;
        this.size = size;

        this.instructions = [];
        // console.log("tamaño del rob:" + size);
        for (var i = 0; i < size; i++) {
            this.instructions.push(new RobColum());
        }

        this.states = inicialize(orderList);
        this.orderInstructions = orderList;

        this.instrucCompletedCurrentCycle = [];
        this.instrucFinalizedCurrentCycle = [];
        this.instrucIssuedCurrentCycle = [];
        this.instrucExeCurrentCycle = [];
    }


    var getPosInstr = function (id, orderInstructions) {
        for (var i = 0; i < orderInstructions.length; i++) {
            if (orderInstructions[i] == id) {
                return i;
            }
        }
        return null;
    }

    var isCompleteI = function (inst, instructions, states) {
        for (var i = 0; i < instructions.length; i++) {
          var instInColumn = instructions[i].instruction[0];
          if (instInColumn) {
            if (inst.uniqueNumber > instInColumn.uniqueNumber) {
                if (states[instInColumn.uniqueNumber] != "c") {
                  return false;
                }
              }
          }
        }
        return true;

    }

    var inicialize = function (orderList) {
        var states = [];
        for (var index = 0; index < orderList.length; index++) {
            states[orderList[index]] = "-";
        }
        return states;
    }

    //public methods.
    Rob.prototype = (function () {

        return {


            size: function () {
                return this.size;
            },

            addInstruction: function (instr) {
                this.states[instr.uniqueNumber] = "i";
                for (var i = 0; i < this.instructions.length; i++) {
                    if (!this.instructions[i].isBusy()) {
                        this.instructions[i].addInstruction(instr);
                        break;
                    }
                }

                this.instrucIssuedCurrentCycle.push(instr.getId());
            },

            isBusy: function () {
                for (var i = 0; i < this.instructions.length; i++) {
                    if (!this.instructions[i].isBusy()) {
                        return false;
                    }
                }
                return true;
            },

            getInstructions: function () {
                return this.instructions;
            },

            setStateExe: function (id) {
                this.states[id] = "x";
                this.instrucExeCurrentCycle.push(id);
            },
            setStateFinal: function (id) {
                this.states[id] = "f";
                this.instrucFinalizedCurrentCycle.push(id);
            },
            removeStatesCompleted: function () {
                var count = 0;
                for (var i = 0; (i < this.instructions.length) && (count < this.grade); i++) {
                  //  console.log("Estado completados: ");
                    var tmp = this.instructions[i].instruction[0];
                    if (tmp) {
                    // console.log((this.states[this.instructions[i].getId()] == "f") + "  " + (isComplete(this.instructions[i].getId(), this.orderInstructions, this.states)))
                        if ((this.states[tmp.uniqueNumber] == "f") && (isCompleteI(tmp, this.instructions, this.states))) {
                            this.states[tmp.uniqueNumber] = "c";
                            this.instrucCompletedCurrentCycle.push(this.instructions[i].getId());
                            var o = this.instructions[i].getInstruction();
                            o = null;
                            count += 1;
                        }
                    }
                }
            },
            setCycle: function () {
                this.instrucCompletedCurrentCycle = [];
                this.instrucFinalizedCurrentCycle = [];
                this.instrucIssuedCurrentCycle = [];
                this.instrucExeCurrentCycle = [];
            },

            print: function () {
                // console.log(this.instructions.length);
                for (var i in this.states) {
                    // console.log(i + ": " + this.states[i]);
                }
            },

            getRobInstructions: function () {
                var state = [];
                for (var i = 0; i < this.instructions.length; i++)
                    state[i] = this.instructions[i];
                return state;
            },

            getRobStates: function () {
                var state = [];
                for (var i = 0; i < this.instructions.length; i++)
                    if (this.instructions[i].getId() == "-") {
                        state[i] = "-";
                    } else {
                        state[i] = this.states[this.instructions[i].instruction[0].uniqueNumber];
                    }

                return state;
            },

            isComplete: function () {
                for (var i = 0; i < this.instructions.length; i++)
                    if (this.instructions[i].getId() !== "-") {
                        return false;
                    }
                return true;
            },

            invalidateInstruction: function (tag, magicEvaluation) {
              const size = this.instructions.length;
              this.instructions.forEach(function(i){
                // I son RobColum - i.instruction[0] es la instruccion
                if (!i.instruction[0]) return;
                let isFiltered = (i.instruction[0].getEspeculative() <= tag);
                if (!isFiltered) {
                  if (this === undefined) return;
                  if ((this.instrucExeCurrentCycle.length > 0) &&
                    (this.instrucExeCurrentCycle.indexOf(i.getId()) !== -1)) {
                  //  console.log('Soy ' + i.getId() + ' borrame cuando se complete.');
                  } else {
                    var ins = i.getInstruction(); // saco la instruccion
                    if ((ins.type == 'beq_type') && (this.states[ins.uniqueNumber] == 'f')) {
                        magicEvaluation.resetLastAction(ins); // if ins is beq_type
                    }
                  }
                }
              }, this);

              return true;
            },

            uncheckInstruction: function(tag) {
              var out = [];
              this.instructions.forEach(function(i) {
                if (!i.instruction[0]) return;
                if (!(i.instruction[0].getEspeculative() <= tag)) {
                  i.instruction[0].especulative = 0;
                  out.push(i.instruction[0]);
                }
              });

              return out;

            }




        }
    })();

    return Rob;

});
