// The ruleset layer of the Community Mod 12 package on a port that is already built (tools/community-mod.js runs the same at its end):
//   SDK=<imperivm-resurrected/sdk> node tools/community-layer.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
require("./lib/community-layer-run.js")({ ROOT, SDK: process.env.SDK || path.join(ROOT, "..", "imperivm-resurrected", "sdk") });
