/*
 * Interface para los diferentes predictors.
 */

export const TAKEN = 1;
export const NOT_TAKEN = 0;


export class Predictor {

	update(){}
	getPrediction(){}
	toString(){
		return 'Sin predicción';
	}
}