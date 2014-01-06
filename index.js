var fluid = require("infusion"),
    flock = fluid.require("flocking");

fluid.require("flocking-osc");

var colin = fluid.registerNamespace("colin");
fluid.registerNamespace("colin.oscFM");

fluid.defaults("colin.oscFM.knobController", {
    gradeNames: ["flock.io.osc.serial", "autoInit"],
    
    components: {
        oscSource: {
            options: {
                model: {
                    pots: [0, 0, 0, 0]
                }
            }
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
            value: 400,
            add: {
                id: "modulator",
                ugen: "flock.ugen.sin",
                freq: 124,
                mul: 100
            }
        },
        mul: {
            ugen: "flock.ugen.math",
            source: 307,
            div: 1024
        }
    }
});

fluid.defaults("colin.oscFM.app", {
    gradeNames: ["fluid.eventedComponent", "fluid.modelComponent", "autoInit"],
    
    components: {
        controller: {
            type: "colin.oscFM.knobController",
            options: {
                components: {
                    oscSource: {
                        options: {
                            modelListeners: {
                                "pots.0": {
                                    funcName: "{synth}.set",
                                    args: ["carrier.freq.value", "{change}.value"]
                                },
                    
                                "pots.1": {
                                    funcName: "{synth}.set",
                                    args: ["modulator.freq", "{change}.value"]
                                },
                    
                                "pots.2": {
                                    funcName: "{synth}.set",
                                    args: ["modulator.mul", "{change}.value"]
                                },
                                "pots.3": {
                                    funcName: "{synth}.set",
                                    args: ["carrier.mul.source", "{change}.value"]
                                }
                            }
                        }
                    }
                }
            }
        },
        
        synth: {
            type: "colin.oscFM.synth"
        }
    }
});

flock.init();
flock.enviro.shared.play();
colin.oscFM.app();
