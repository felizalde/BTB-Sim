define(["Instruction", "FunctionalUnit", "Dispatch", "ReOrderBuffer", "ReservationStation", "Stack", "es6!BTB/src/PhaseIF", "es6!BTB/src/MagicEvaluation"], function (Instruction, FuntionalUnit, Dispatch, Rob, ReservationStation, Stack, PhaseIF, MagicEvaluation) {
    'use strict';

    function Gestionator(stack, dispatchSize, rsSize, fu) {

        this.phaseIF = new PhaseIF(2, stack);
        this.branchEvaluator = new MagicEvaluation();
        this.especulativeManager = this.phaseIF.getEspeculativeManager();
        this.simulator = this.phaseIF.getSimulator();

        this.desmarcar = [];
        this.especulatives = [];

        this.stack = stack;
        this.inOrderStack = [];
        for (var i = 0; i < this.stack.length; i++) {
            this.inOrderStack.push(this.stack[i].getId());
        }

        this.dispatch = [];
        for (var i = 0; i < dispatchSize; i++) {
            this.dispatch.push(new Dispatch());
        }

        this.functional_units = fu;

        this.reservation_station = [];
        for (var i = 0; i < rsSize; i++) {
            this.reservation_station.push(new ReservationStation());
        }

        // console.log(rsSize + fu.length);

        this.rob = new Rob(rsSize + fu.length, this.inOrderStack, dispatchSize);
        this.currentCycle = 0;
        this.count = 0;
    }

    //
    //seguir aca, verificar si las unidades estan disponibles y son del mismo tipo que la instruccion
    var isExecutable = function (iu, instruction, functional_units) {

        for (var index_fu = iu; index_fu < functional_units.length; index_fu++) {
            if (functional_units[index_fu].getType() == instruction.getType() || functional_units[index_fu].getType() == "multi_type") {
                return index_fu;
            }
        }
        return -1; //todas las unidades funcionales estan ocupadas
    }

    var execute_cycle = function (functional_units) {
        for (var i = 0; i < functional_units.length; i++) {
            functional_units[i].nextCycle();
        }
    }

    var reservationStationsBusy = function (rs) {
        for (var i in rs) {
            if (!rs[i].isBusy()) {
                return false;
            }
        }
        return true;
    }

    var isEmpty = function (rs) {
        for (var i in rs) {
            if (rs[i].isBusy()) {
                return false;
            }
        }
        return true;
    }

    var getInstruction = function (ds) {

        var least = 10000;
        var index_l = -1;
        for (var i = 0; i < ds.length; i++) {
            if (ds[i].isBusy() && (ds[i].getPriority() < least)) {
                index_l = i;
                least = ds[i].getPriority();
            }
        }
        // console.log("indice: " + index_l);
        return ds[index_l].getInstruction();
    }



    Gestionator.prototype = (function () {
        return {

            nextCycle: function () {

                this.desmarcar = [];
                this.especulatives = [];

                this.rob.setCycle();

                //console.log(this.inOrderStack);

                // console.log("ciclo: " + this.currentCycle);

                execute_cycle(this.functional_units);
                this.currentCycle += 1;

                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO ROB
                //me fijo las instrucciones que se ejecutaron

                this.rob.removeStatesCompleted();

                for (var i = 0; i < this.functional_units.length; i++) {
                    if (!this.functional_units[i].isOccupied()) {
                        if (this.functional_units[i].hasInstruction()) {
                            var instrFinal = this.functional_units[i].getInstCompleted();
                            if (instrFinal.getType() == "beq_type") {

                              var action = this.branchEvaluator.getAction(instrFinal);
                              this.simulator.addBranch(instrFinal);

                              if (this.phaseIF.isPrediction) {

                                  //Si predije bien
                                  if (this.simulator.getPrediction(instrFinal.getId()) == action) {
                                    //TODO: FALTA EN ROB.

                                    var uncheckDispatch = [];
                                    var uncheckRS = [];
                                    var uncheckUF = [];
                                    this.dispatch.forEach((d) => {
                                      uncheckDispatch = uncheckDispatch.concat(
                                            d.uncheckInstruction(instrFinal.getEspeculative()));
                                    });
                                    this.reservation_station.forEach((rs) => {
                                      uncheckRS= uncheckRS.concat(
                                            rs.uncheckInstruction(instrFinal.getEspeculative()));
                                    });

                                    this.functional_units.forEach((uf) => {
                                        uncheckUF = uncheckUF.concat(
                                            uf.uncheckInstruction(instrFinal.getEspeculative()));
                                    })

                                    this.desmarcar = this.desmarcar.concat(uncheckDispatch, uncheckRS, uncheckUF);
                                  } else {

                                    //Invalido instrucciones.
                                    this.rob.invalidateInstruction(instrFinal.getEspeculative(), this.branchEvaluator);
                                    // console.log('Salto tag: ' + instrFinal.getEspeculative());
                                    this.dispatch.forEach((d) => {
                                        d.invalidateInstruction(instrFinal.getEspeculative(), this.especulativeManager);
                                    });
                                    this.reservation_station.forEach((rs) => {
                                        rs.invalidateInstruction(instrFinal.getEspeculative(), this.especulativeManager);
                                    });



                                    //Actualizo PC
                                    if (action == 1) {
                                      // Si salté a direccion de salto.
                                      this.phaseIF.updatePC(this.simulator.getTarget(instrFinal.getId()));
                                    } else {
                                      // Si no salté a instruccion siguiente al salto.
                                      this.phaseIF.updatePC(parseInt(instrFinal.getId().slice(1, instrFinal.getId().length)) + 1);
                                    }

                                  }
                              } else {
                                    //Actualizo PC
                                    if (action == 1) {
                                      // Si salté a direccion de salto.
                                      this.phaseIF.updatePC(this.simulator.getTarget(instrFinal.getId()));
                                    } else {
                                      // Si no salté a instruccion siguiente al salto.
                                      this.phaseIF.updatePC(parseInt(instrFinal.getId().slice(1, instrFinal.getId().length)) + 1);
                                    }

                              }
                              //Actualizo el simulator
                              this.simulator.update(instrFinal.getId(), action);

                              //Le digo al especulative Manager que el salto se ejecutó.
                              this.especulativeManager.setFinish();
                              this.phaseIF.unblock();
                              // console.log('TERMINE DE EVALUAR SALTO');

                            }
                            instrFinal.setExecute();
                            this.rob.setStateFinal(instrFinal.uniqueNumber);
                        }
                    }
                }



                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS ESTACIONES DE RESERVA
                while (!isEmpty(this.dispatch) && !reservationStationsBusy(this.reservation_station) && !this.rob.isBusy()) {
                    for (var index = 0; index < this.reservation_station.length; index++) {
                        if (!this.reservation_station[index].isBusy() && !isEmpty(this.dispatch)) {
                            if (!this.rob.isBusy()) {
                                var instruc = getInstruction(this.dispatch);
                                // console.log('1-UPDATE ER ' + index + instruc.getId())
                                this.reservation_station[index].addInstruction(instruc);
                                // console.log(this.reservation_station[index].isBusy());
                                this.rob.addInstruction(instruc);
                            }
                        }
                    }
                }


                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS UNIDADES FUNCIONALES

                for (var index = 0; index < this.reservation_station.length; index++) {
                    if (this.reservation_station[index].isBusy()) {
                        //primero verifico las dependencias,
                        // y luego con la funcion isExecutable verifico si hay espacio en las unidades funcionales
                        //console.log("Entre a mirar las estaciones de reserva");
                        var currentInstr = this.reservation_station[index].getInstruction();

                        if (currentInstr) {     

                            var canExecute = true;
                            var executed = false;
                            // verifico si la instruccion se puede ejecutar.
                            var dependencias = currentInstr.getDependencies();
                            if (currentInstr.uniqueNumber == 25) console.log(dependencias);
                            for (var index_d = 0; index_d < dependencias.length; index_d++) {
                                if (!dependencias[index_d].isExecute()) {
                                    canExecute = false;
                                }
                            }


                            if (canExecute) {

                                var iu = isExecutable(0, currentInstr, this.functional_units);

                                while (iu !== -1) {                            
                                    if (!this.functional_units[iu].isOccupied()) {
                                            this.functional_units[iu].execute(currentInstr);
                                            this.rob.setStateExe(currentInstr.uniqueNumber);
                                            iu = -1;
                                            executed = true;
                                    } else {
                                            iu = isExecutable(iu + 1, currentInstr, this.functional_units);
                                    }
                                }
                                if (!executed) {
                                    this.reservation_station[index].addInstruction(currentInstr);
                                    }
                            } else {
                                this.reservation_station[index].addInstruction(currentInstr);
                            }
                        }
                    }
                }
                
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS ESTACIONES DE RESERVA
                while (!isEmpty(this.dispatch) && !reservationStationsBusy(this.reservation_station) && !this.rob.isBusy()) {
                    for (var index = 0; index < this.reservation_station.length; index++) {
                        if (!this.reservation_station[index].isBusy() && !isEmpty(this.dispatch)) {
                            if (!this.rob.isBusy()) {
                                var instruc = getInstruction(this.dispatch);
                                // console.log('2-UPDATE ER ' + index + instruc.getId())
                                this.reservation_station[index].addInstruction(instruc);
                                // console.log(this.reservation_station[index].isBusy());
                                this.rob.addInstruction(instruc);
                            }
                        }
                    }
                }


                ///////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO DISPATCH
                //DISPATCH

                // --

                var i = 0;
                while ((i < this.dispatch.length) && this.phaseIF.hasInstruction() && !this.phaseIF.isBlocked()) {
                  if (!this.dispatch[i].isBusy()) {
                    var inst = this.phaseIF.fetch();
                    if (!this.phaseIF.isJump(inst)) {
                        this.dispatch[i].addInstruction(inst, this.count);
                        this.count += 1;
                    }


                  }
                  i++;
                }




                // console.log("Dispatch");
                for (var index = 0; index < this.dispatch.length; index++) {
                    this.especulatives = this.especulatives.concat(this.dispatch[index].especulativesInstruction())
                    // console.log(this.dispatch[index].getId());
                }

                // console.log("ER");
                //this.reservation_station.print();
                for (var index = 0; index < this.reservation_station.length; index++) {

                    this.especulatives = this.especulatives.concat(this.reservation_station[index].especulativesInstruction())
                    // console.log(this.reservation_station[index].getInstructionsById());
                }

                for (var index = 0; index < this.functional_units.length; index++) {
                    this.especulatives = this.especulatives.concat(this.functional_units[index].especulativesInstruction());
                }

                for (var index = 0; index < this.rob.instructions.length; index++) {
                    this.especulatives = this.especulatives.concat(this.rob.instructions[index].getEspeculative());
                }

                // console.log("ROB");
                // this.rob.print();

            },

            getDispatcherState: function () {
                var state = [];
                for (var i in this.dispatch) {
                    state.push(this.dispatch[i].instructions[0]);
                }
                return state;
            },
            getCurrentCycle: function () {
                return this.currentCycle - 1;
            },
            getReservStationsState: function () {
                var state = [];
                for (var i in this.reservation_station) {
                    state.push(this.reservation_station[i].instructions[0]);
                }
                return state;
            },
            getFunctionalUnitsState: function () {
                var state = [];
                for (var i = 0; i < this.functional_units.length; i++) {
                    if (this.functional_units[i].instruction[0]){
                      state.push(this.functional_units[i].instruction[0])
                    } else {
                      state.push('-');
                    }
                }
                return state;
            },
            getRobInstructions: function () {
                return this.rob.getRobInstructions();
            },
            getRobStates: function () {
                return this.rob.getRobStates();
            },
            getBTB: function () {
                return this.simulator.getBTB();
            },
            isFullyProcessed: function () {
                let emptys = true;
                this.dispatch.forEach((d) => {
                    if (!d.isEmpty()) emptys=false;
                });
                return (this.rob.isComplete() && emptys && (this.currentCycle !== 0));
            },
            setRandoms: function(randoms) {
                if (randoms) {
                    randoms.forEach((arr) => {
                        this.branchEvaluator.put(arr[0], arr[1]);
                    })
                }
            },
            setTypeSimulator: function(type) {
                this.phaseIF.setType(type);
                this.simulator = this.phaseIF.getSimulator(); 
            }


        }




    })();

    return Gestionator;
});
