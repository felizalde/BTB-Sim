/*
 Etapa IF
*/
import {TAKEN}  from 'es6!BTB/src/predictors/Predictor';
import {Simulator} from 'es6!BTB/src/Simulator';
import {EspeculativeManager} from 'es6!BTB/src/EspeculativeManager';

var setDependendencies = function (instruction, clones) {
    var currentInstruction,
      readRegisters = instruction.getOperands(),
      operand;

    const size = instruction.getId().substring(1, instruction.getId().length);

    //Busco desde el final hasta el principio.
    for (var i = clones.length - 1; i >= clones.length - size; i--) {
        currentInstruction = clones[i];
        instruction.setDependency(currentInstruction);
    }
};

export default class PhaseIF {

  constructor(type, mem) {
    this.clones = [];
    this.acc = 0;
    this.pc = 0;
    this.mem = mem;
    this.simulator = new Simulator(type);
    this.especulativeManager = new EspeculativeManager();
    this.blocked = false;
    this.isPrediction = true;
  }

  fetch() {
    let currentInstruction = this.getInstruction(this.pc);
    this.especulativeManager.process(currentInstruction);


    //Predigo si es branch.
    if (this.isBranch(currentInstruction)) {

      if (this.isPrediction) {
        //this.simulator.print();

        if (!this.simulator.isBranchInBTB(currentInstruction.getId())) {

          this.pc = this.pc + 1;
        }
        else {
          let pred = this.simulator.getPrediction(currentInstruction.getId());
          if (pred == TAKEN) {
            this.pc = this.simulator.getTarget(currentInstruction.getId());
          }else {
            this.pc = this.pc + 1;
          }
        }
        //this.simulator.print();
      } else {
          this.blocked = true;
          this.pc = this.pc + 1;
      }
    } else {
      if (this.isJump(currentInstruction)) {
        this.pc = parseInt(currentInstruction.writeRegister);
      } else {
          this.pc = this.pc + 1;
      }
    }

    return currentInstruction;
  }

  isBranch(instruction) {
    return (instruction.type == "beq_type");
  }

  isJump(instruction) {
    return (instruction.type == "jump");
  }

  getInstruction(pc) {
    var copy = this.mem[pc].clone(this.acc);
    copy.dependencies = [];
    setDependendencies(copy, this.clones);
    this.clones.push(copy);
    this.acc += 1;

    return copy;
  }

  hasInstruction() {
    return (this.pc < this.mem.length);
  }

  updatePC(pc) {
    this.pc = pc;
  }

  getEspeculativeManager(){
    return this.especulativeManager;
  }

  getSimulator() {
    return this.simulator;
  }

  setType(type) {
    if (type === 0) this.isPrediction = false;
    this.simulator = new Simulator(type);
  }

  isBlocked() {
    return this.blocked;
  }

  unblock() {
    this.blocked = false;
  }
}
