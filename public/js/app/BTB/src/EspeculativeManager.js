

export class EspeculativeManager {
  constructor() {
    this.branchQueue = []; // fila sasltos anidados
    this.current = -1;
  }

  setCurrentBranch(branch){
    this.current = branch;
  }

  process(instruction){
    if (this.isModeEspeculative()) {
      instruction.setEspeculative(this.branchQueue.length);
    }
    if (instruction.type == "beq_type") {
       this.current = instruction.getId();
       this.branchQueue.unshift(this.current);
     }
  }

  isModeEspeculative() {
    return (this.branchQueue.length > 0);
  }

  setFinish(){
    this.current = this.branchQueue.pop();
  }

  removeIfBranch(inst) {
    if (inst.type == "beq_type") {
      this.current = this.branchQueue.pop();
    }
  }

}
