const fs = require("fs");
const prompt = require("prompt-sync")();
try {
    var filestemp = fs.readFileSync(process.argv[2], "utf8");
}catch(e){
    console.log("usage: node index.js [file]");
    console.log("\ncheck if you typed something wrong and try again");
    process.exit();
}
var files = "";
var file = filestemp.match(/([A-Z][a-z]?|\(|\)|\[|\]|\}|\{)[0-9]*/g);
if (file == null) {
    throwError(5);
}
var i = 0;
var vars = [];
var port = [0, 0, 0, 0];
var portNum = 0;
var layers = [];
var whlayers = [];
var list = {
    "(": function () {
        let j = i + 1;
        var layer = 0;
        while (file[j][0] != ")" || layer != 0) {
            if (file[j][0] == "(") layer++;
            if (file[j][0] == ")" && layer != 0) layer--;
            j++;
            if (j >= file.length) {
                throwError(4);
            }
        }
        layers.push([i, file[j].slice(1)]);
    },
    "[": function () {
        let j = i + 1;
        var layer = 0;
        while (file[j][0] != "]" || layer != 0) {
            if (file[j][0] == "[") layer++;
            if (file[j][0] == "]" && layer != 0) layer--;
            j++;
            if (j >= file.length) {
                throwError(4);
            }
        }
        whlayers.push([i, file[j].slice(1)]);
    },
    "{": function () {
        let j = i + 1;
        var layer = 0;
        while (file[j][0] != "}" || layer != 0) {
            if (file[j][0] == "{") layer++;
            if (file[j][0] == "}" && layer != 0) layer--;
            j++;
            if (j >= file.length) {
                throwError(4);
            }
        }
        if (!vars[port[0]]) {
            i = j;
        }
    },
    "H": function () {
        vars.push(0);
    },
    "I": function () {
        port[portNum]++;
        if (port[portNum] >= vars.length) {
            throwError(3);
        }
    },
    "O": function () {
        port[portNum]--;
        if (port[portNum] >= vars.length) {
            throwError(3);
        }
    },
    "C": function () {
        portNum++;
        if (portNum >= port.length) {
            throwError(1);
        }
    },
    "F": function () {
        portNum--;
        if (portNum < 0) {
            throwError(1);
        }
    },
    "Cl": function () {
        console.log(vars[port[0]]);
    },
    "Br": function () {
        if (port[0] >= vars.length) {
            throwError(3);
        }
        vars[port[0]]++;
    },
    "B": function () {
        if (port[0] < 0) {
            throwError(3);
        }
        vars[port[0]]--;
    },
    "Ca": function () {
        vars[port[0]] += vars[port[1]];
    },
    "Sc": function () {
        vars[port[0]] -= vars[port[1]];
    },
    "N": function () {
        vars[port[0]] *= vars[port[1]];
    },
    "Si": function () {
        if (port[1] == 0) {
            throwError(2);
        }
        vars[port[0]] /= vars[port[1]];
    },
    "Se": function () {
        if (port[1] == 0) {
            throwError(2);
        }
        vars[port[0]] %= vars[port[1]];
    },
    "As": function () {
        console.log({ portNum: portNum, vars: vars, port: port, layers: layers });
    },
    "Al": function () {
        vars[port[0]] = vars[port[0]] != vars[port[1]];
    },
    "K": function () {
        vars[port[0]] = vars[port[1]];
    },
    "Fe": function () {
        vars[port[0]] = !vars[port[0]];
    },
    "Ti": function () {
        vars[port[0]] = parseInt(prompt(">"));
        if(vars[port[0]] == null || isNaN(parseInt(vars[port[0]]))){
            throwError(6);
        }
    },
    "Co": function () {
       portNum = 0;
       port = [0,0,0,0];
    },
}
for (i; i < file.length; i++) {
    if (file[i][0] == ")") {
        if (layers[layers.length - 1][1] - 1 < 1) {
            layers.pop();
            continue;
        } else {
            i = layers[layers.length - 1][0];
            layers[layers.length - 1][1]--;
            continue;
        }
    }
    if (file[i][0] == "]") {
        if (vars[whlayers[whlayers.length - 1][1]] < 1) {
            whlayers.pop();
            continue;
        } else {
            i = whlayers[whlayers.length - 1][0];
            continue;
        }
    }
    if (file[i][0] == "}") {
        continue;
    }
    mv = file[i].match(/[0-9]+/g);
    mv = mv == null ? 1 : mv[0];
    if (list[file[i].match(/[^0123456789]+/g)[0]] == undefined) {
        throwError(0);
    }
    for (let lp = 0; lp < mv; lp++) {
        list[file[i].match(/[^0123456789]+/g)[0]]();
    }
}
function throwError(id, additional = "") {
    console.log(`ERROR AT INSTRUCTION ${i == undefined ? "??" : i} ( ${file == undefined ? "NULL" : file[i]} )!!\n\nREASON: ${[
            "UNKNOWN SYMBOL",                   // 0
            "ARG MEMORY READ/WRITE VIOLATION",  // 1
            "DIVIDE BY 0",                      // 2
            "TAPE MEMORY READ/WRITE VIOLATION", // 3
            "UNEXPECTED END OF FILE",           // 4
            "EMPTY PROGRAM",                    // 5
            "UNEXPECTED INPUT"                  // 6
        ][id]
        }`);
    process.exit();
}