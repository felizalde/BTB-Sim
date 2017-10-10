
import {BTB} from 'es6!BTB/src/BTB';

import {Predictor1bit} from 'es6!BTB/src/predictors/Predictor1bit';
import {Predictor2bit} from 'es6!BTB/src/predictors/Predictor2bit';
import {Predictor} from 'es6!BTB/src/predictors/Predictor';


export class Simulator {

  constructor(type) {
    this.type = type;
    this.BTB = new BTB();
    this.predictors = new Map();
  }

  isBranchInBTB(branch) {
    return this.BTB.hasBranch(branch);
  }

  getPrediction(branch) {
    return this.predictors.get(branch).getPrediction();
  }

  getTarget(branch) {
    return parseInt(this.BTB.getTarget(branch));
  }

  update(branch, state) {
    this.predictors.get(branch).update(state);
  }

  addBranch(branch) {

    if (!this.BTB.hasBranch(branch.getId())) {
      const offset = branch.writeRegister;
      const pc = branch.getId().substring(1,branch.getId().length);
      const target = parseInt(pc) + 1 + parseInt(offset);
      this.predictors.set(branch.getId(), this.factoryPredictor(this.type));
      this.BTB.update(branch.getId(), target);
    }
  }

  factoryPredictor(type) {
    if (type === 0) return new Predictor();
    if (type === 2) return new Predictor2bit();
    if (type === 1) return new Predictor1bit();
    console.log("Tipo de predictor incorrecto.")
    return new Predictor2bit();
  }

  print() {
    this.BTB.forEach((v, k, m) => {
      console.log(`| BRANCH: ${k} TARGET: ${v} | PREDICTOR: ${this.predictors.get(k).toString()}`);
    });
  }


  getBTB() {
    let arr = [];
    this.BTB.forEach((v, k, m) => {
      arr.push([k,v, this.predictors.get(k).toString()]);
    });

    return arr;
  }
}
