"use strict";

var fluid = require("infusion"),
    loader = fluid.getLoader(__dirname),
    flock = fluid.registerNamespace("flock"),
    colin;

loader.require("./lib/app.js");
colin = fluid.registerNamespace("colin");

flock.init();
flock.enviro.shared.play();
colin.oscFM.app();
