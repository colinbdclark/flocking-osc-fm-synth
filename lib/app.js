"use strict";

var fluid = require("infusion"),
    flock = fluid.require("flocking");

fluid.require("flocking-osc");
fluid.registerNamespace("colin.oscFM");

fluid.defaults("colin.oscFM.knobController", {
    gradeNames: ["flock.io.osc.messageSource", "autoInit"],
    
    model: {
        pots: [0, 0, 0, 0]
    },
    
    components: {
        transport: {
            type: "flock.io.serial"            
        }
    }
});

fluid.defaults("colin.oscFM.synth", {
    gradeNames: ["flock.synth", "autoInit"],

    synthDef: {
        id: "carrier",
        ugen: "flock.ugen.sin",
        freq: {
            ugen: "flock.ugen.value",
            rate: "audio",
            value: 400,
            add: {
                id: "modulator",
                ugen: "flock.ugen.sin",
                freq: {
                    ugen: "flock.ugen.value",
                    rate: "audio",
                    value: 124
                },
                mul: 100
            }
        },
        mul: 0.3
    }
});

fluid.defaults("colin.oscFM.app", {
    gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
    
    components: {
        synth: {
            type: "colin.oscFM.synth"
        },
        
        inputMapper: {
            type: "flock.synth.inputMapper",
            options: {
                components: {
                    synth: "{synth}"
                },
                
                inputMap: {
                    "carrier.freq.value": "pots.0",
                    "modulator.freq": "pots.1",
                    "modulator.mul": "pots.2" ,
                    "carrier.mul": {
                        inputPath: "pots.3",
                        outputPath: "source",
                        cacheTargetUGen: true,
                        synthDef: {
                            ugen: "flock.ugen.math",
                            rate: "audio",
                            source: {
                                ugen: "flock.ugen.value",
                                rate: "control",
                                value: 1200
                            },
                            div: 4095
                        }
                    }
                }
            }
        },
        
        controller: {
            type: "colin.oscFM.knobController",
            options: {
                modelListeners: {
                    "pots.*": {
                        funcName: "{inputMapper}.set",
                        args: ["{change}.path", "{change}.value"]
                    }
                }
            }
        }
    }
});
