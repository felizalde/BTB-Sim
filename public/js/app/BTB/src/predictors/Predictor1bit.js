import {Predictor} from 'es6!BTB/src/predictors/Predictor';

export class Predictor1bit extends Predictor {
  constructor() {
    super();
    this.state = 0;
  }

  update(jump) {
    if ( jump === undefined ) return;
    this.state = jump;
  }

  getPrediction() {
      return this.state;
  }

  toString(){
    return `[${this.state}]`;
  }

}
