import {TAKEN, NOT_TAKEN, Predictor} from "es6!BTB/src/predictors/Predictor"

export class Predictor2bit extends Predictor{
  constructor() {
    super();
    this.state = [0, 1];
  }

  update(jump) {
    console.log(`update predictor: ${jump} -> [${this.state[0]},${this.state[1]}] `)

    if ( jump === undefined ) return;

    if (this.state[0] === NOT_TAKEN) {
      if (this.state[1] === NOT_TAKEN) { //Estoy en estado SNT
        this.state[1] = jump;
      } else { //Estoy en estado SPNT
        this.state[0] = jump;
        this.state[1] = NOT_TAKEN;
      }
    } else {
      if (this.state[1] === TAKEN) { //Estoy en estado ST
        this.state[1] = jump;
      } else { //Estoy en estado SPT
        this.state[0] = jump;
        this.state[1] = TAKEN;
      }
    }

    console.log(`updated: [${this.state[0]}, ${this.state[1]}]`)

    }

  getPrediction() {
    // [1,x] -> tomado
    // [0,X] -> no tomado.
    return this.state[0];
  }

  toString() {
    return `[${this.state[0]},${this.state[1]}]`;
  }

}
