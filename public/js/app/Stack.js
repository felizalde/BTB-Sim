define(['Instruction'], function (Instruction) {
    'use strict';

    var instructions = [];
    var acc = 0;

    var setDependendencies = function (instruction) {
        var currentInstruction,
          readRegisters = instruction.getOperands(),
          operand;

        //Busco desde el final hasta el principio.
        for (var i = instructions.length - 1; i >= 0; i--) {
            currentInstruction = instructions[i];
            instruction.setDependency(currentInstruction);
        }
    };

    return {
        addInstruction: function (instruction) {
            //Siempre agrega al final.
            setDependendencies(instruction);
            instructions.push(instruction);
        },

        getInstructions: function () {
            return instructions;
        },

        countInstructions: function () {
            return instructions.length;
        },

        getInstructionsAsQueue: function () {
            return true;
        },

        size: function () {
            return instructions.length;
        },
        clear: function() {
            instructions = [];
        },

        getBranchs : function () {
          var beq = [];
          for  (var i = instructions.length - 1; i >= 0; i--){
              if (instructions[i].getType() == "beq_type"){
                beq.push(instructions[i]);
              }
            }
          return beq;
        }
    }

});
