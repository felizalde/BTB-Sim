import {TAKEN, NOT_TAKEN} from "es6!BTB/src/predictors/Predictor";

export default class MagicEvaluation {
  constructor() {
    this.count = 0;
    this.branchs = new Map();
    this.setup = new Map();
  }

  getAction(instruction) {
  	const id = instruction.getId();
  	let count = this.branchs.get(id);    
    if (count > 0) {
      count -= 1;
      this.branchs.set(id, count);
      return TAKEN;
    } else {
      this.branchs.set(id, this.setup.get(id));
      return NOT_TAKEN;
    }
  }

  put(id, random) {
  	if (id) {
      this.setup.set(id, random);
  		this.branchs.set(id, random);
  	}
  }

  // Reset last action predicted for a beq when was executed speculatively.
  resetLastAction(instruction) {
    const id = instruction.getId();
    if (this.branchs.has(id)) {      
      let count = this.branchs.get(id) + 1;
      if (count <= this.setup.get(id)) {
        this.branchs.set(id, count);
      } else {
        this.branchs.set(id, 0);
      }
    }
  }
}
