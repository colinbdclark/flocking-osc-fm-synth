"use strict";

var fluid = require("infusion"),
    flock = fluid.require("flocking");

fluid.require("flocking-osc");
fluid.registerNamespace("colin.oscFM");

fluid.defaults("colin.oscFM.knobController", {
    gradeNames: ["flock.io.osc.messageSource", "autoInit"],

    model: {
        knobs: [0, 0, 0, 0]
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
            // TODO: This exposes the mapping directly in the target synth,
            // because it currently appears to be impossible to map a "value" unit generator
            // using the input mapper.
            value: 0.0,
            add: {
                id: "modulator",
                ugen: "flock.ugen.sin",
                freq: 124,
                mul: 100
            },
            mul: 1200
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
                    "carrier.freq.value": "knobs.0",
                    "carrier.mul": "knobs.3",
                    "modulator.freq": {
                        inputPath: "knobs.1",
                        // TODO: cacheTargetUGen is broken,
                        // since it expects the synthDef to already have the structure
                        // of the mapping (i.e. a "value property").
                        synthDef: {
                            ugen: "flock.ugen.value",
                            rate: "audio",
                            mul: 200,
                            add: 200
                        }
                    },
                    "modulator.mul": {
                        inputPath: "knobs.2",
                        synthDef: {
                            ugen: "flock.ugen.value",
                            rate: "audio",
                            mul: 400,
                            add: 400
                        }
                    }
                }
            }
        },

        controller: {
            type: "colin.oscFM.knobController",
            options: {
                modelListeners: {
                    "knobs.*": [
                        {
                            funcName: "{inputMapper}.set",
                            args: ["{change}.path", "{change}.value"]
                        }
                    ]
                }
            }
        }
    }
});
