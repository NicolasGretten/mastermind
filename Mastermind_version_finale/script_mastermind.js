class EventEmitter {
    constructor() {
        this._events = {};
        if (this.constructor === EventEmitter) {
            throw new Error('Cannot instanciate abstract class');
        }
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    once(evt, listener) {
        const fct = (a) => {
            let arr = this._events[evt].filter(it => it != fct);
            return ((arr.length > 0) ? (this._events[evt] = arr) : (delete this._events[evt])) ||
                listener(a);
        }
        return this.on(evt, fct);
    }
    emit(evt, ...arg) {
        (this._events[evt] || []).slice().forEach(lsn => lsn((arg.length == 1 ? arg[0] : arg)));
        return this;
    }
    connect(evt, target, evtTarget) {
        return this.on(evt, (a) => {
            target.emit(evtTarget, a);
        });
    }
    countEvent() {
        return Object.keys(this._events).length;
    }
    countListener(evt) {
        return (this._events[evt] || []).length;
    }
    removeAllListeners(evt) {
        delete this._events[evt];
        return this;
    }
    resetEvent() {
        this._events = {};
        return this;
    }
    static attachEvent(evt, src, target) {
        if (!(src instanceof EventEmitter) || !(target instanceof EventEmitter)) {
            throw "attachEventError : src and target must be inherited from EventEmitter";
        }
        return src.on(evt, (a) => {
            target.emit(evt, a);
        });
    }
    static detachEvent(evt, target) {
        if (!(target instanceof EventEmitter)) {
            throw "detachEventError : target must be inherited from EventEmitter";
        }
        return target.removeAllListeners(evt);
    }
    static bind(evtSrc, src, evtTarget, target) {
        if (!(src instanceof EventEmitter) || !(target instanceof EventEmitter)) {
            throw "bindError : src and target must be inherited from EventEmitter";
        }
        return src.on(evtSrc, (a) => {
            target.emit(evtTarget, a);
        });
    }
}
const color = ["red", "blue", "yellow", "green", "orange"];
const colorDeviner = [];
const colorToGuess = [{
    colorUn: "",
    colorDeux: "",
    colorTrois: "",
    colorQuatre: "",
    colorCinq: ""
}];
class View extends EventEmitter {
    constructor(colonne, ligne) {
        super();
        this.col = colonne;
        this.ligne = ligne;

        var plateaux = document.getElementById("plateauxJeux");
        var tbl = document.createElement("table");
        var tblBody = document.createElement("tbody");
        for (var i = 0; i < this.ligne; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < this.col; j++) {
                var cell = document.createElement("td");
                row.appendChild(cell);
                cell.dataset.idcell = j;
                cell.setAttribute("width", "50");
                cell.setAttribute("height", "50");
                cell.setAttribute("name", "cel");
                cell.setAttribute("id", "plateaux-" + i + "-" + j);
                cell.setAttribute("col", j);
            }
            tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        plateaux.appendChild(tbl);
        tbl.setAttribute("border", "1");
        var pionsNb = document.getElementById("pionsNoirBlanc");
        var tbl = document.createElement("table");
        var tblBody = document.createElement("tbody");
        for (var i = 0; i < this.ligne; i++) {
            var row = document.createElement("tr");

            for (var j = 0; j < 1; j++) {
                var cell = document.createElement("td");
                var ltbl = document.createElement("table")

                for (var g = 0; g < 2; g++) {
                    var tr = document.createElement("tr");
                    for (var k = 0; k < 2; k++) {
                        var td = document.createElement("td");
                        row.appendChild(cell);
                        cell.setAttribute("width", "50");
                        cell.setAttribute("height", "50");
                        cell.setAttribute("class", "pion" + i);
                        ltbl.appendChild(tr)
                        tr.appendChild(td);
                        td.setAttribute("width", "20");
                        td.setAttribute("height", "20");
                        ltbl.style.borderCollapse = "separate";
                        td.style.borderSpacing = "5px";
                        td.setAttribute("id", i + "-" + g + "-" + k);
                        td.style.borderRadius = "150px";
                        cell.appendChild(ltbl);

                    }
                }
            }

            tblBody.appendChild(row);
        }

        tbl.appendChild(tblBody);
        pionsNb.appendChild(tbl);
        var boutons = document.getElementById("boutons");
        var tbl = document.createElement("table");
        var tblBody = document.createElement("tbody");
        for (var i = 0; i < this.ligne; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < 1; j++) {
                var cell = document.createElement("td");
                var btn = document.createElement("button");
                btn.dataset.btncol = i;
                btn.setAttribute("class", "btn btn-primary m-a");
                btn.setAttribute("id", "btn-" + i);
                btn.innerHTML = "Ok";
                btn.style.fontSize = "8px";
                cell.appendChild(btn);
                row.appendChild(cell);
                cell.setAttribute("width", "50");
                cell.setAttribute("height", "50");
                cell.setAttribute("class", "text-center");
            }
            tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        boutons.appendChild(tbl);
    }
}
class Controller extends EventEmitter {
    constructor(ligne) {
        super();
        this.ligne = ligne;
        var btn = [];
        for (var lb = [], i = 0; i < this.ligne; i++) {
            lb[i] = 0;
        }
        for (var spanb = [], i = 0; i < this.ligne; i++) {
            spanb[i] = document.getElementById("black-" + [i]);
        }
        for (var i = 0; i < this.ligne; i++) {
            btn[i] = document.getElementById("btn-" + i);
        }
        let cel = document.getElementsByName("cel");
        var o = 0;
        for (let m = 0; m < cel.length; m++) {
            cel[m].onclick = (e) => {
                this.emit("stockage", {
                    target: e.target
                });
                o++;
                if (o == 5) {
                    o = 0;
                }
                for (let n = 0; n < color.length; n++) {
                    e.target.classList = color[o];
                }
            }
        }
        for (i = 0; i < this.ligne; i++) {
            btn[i].onclick = (e) => {
                this.emit("btnpresser", {
                    target: e.target.id
                });
            }
        }
    }
    stockage() {
        this.on("stockage", (e) => {
            line[parseInt(e.target.dataset.idcell)] = e.target;
        });
        this.on("btnpresser", (e) => {
            line = [];
        })
    }
    restart() {
        var btnRestart = document.getElementById("btnRestart");
        btnRestart.onclick = (e) => {
            document.location.reload();
        };
    }
    verification() {
        this.on("verification", (e) => {
            var btncolonne = e.btncol;
            if (line[0].id == "plateaux-11-0" && line[0].className !== colorToGuess.colorUn ||
                line[1].id == "plateaux-11-1" && line[1].className !== colorToGuess.colorDeux ||
                line[2].id == "plateaux-11-2" && line[2].className !== colorToGuess.colorTrois ||
                line[3].id == "plateaux-11-3" && line[3].className !== colorToGuess.colorQuatre ||
                line[4].id == "plateaux-11-4" && line[4].className !== colorToGuess.colorCinq
            ) {
                alert("perdu")
            };
            if (this.ligne == 5) {
                if (line[0].id == "plateaux-4-0" && line[0].className !== colorToGuess.colorUn ||
                    line[1].id == "plateaux-4-1" && line[1].className !== colorToGuess.colorDeux ||
                    line[2].id == "plateaux-4-2" && line[2].className !== colorToGuess.colorTrois ||
                    line[3].id == "plateaux-4-3" && line[3].className !== colorToGuess.colorQuatre ||
                    line[4].id == "plateaux-4-4" && line[4].className !== colorToGuess.colorCinq
                ) {
                    alert("perdu")
                }
            };
            if (line[0] == null) {
                alert("la première colonne n'est pas remplie !");
            };
            if (line[1] == null) {
                alert("la deuxième colonne n'est pas remplie !");
            };
            if (line[2] == null) {
                alert("la troisième colonne n'est pas remplie !");
            };
            if (line[3] == null) {
                alert("la quatrième colonne n'est pas remplie !");
            };
            if (line[4] == null) {
                alert("la cinquième colonne n'est pas remplie !");
            };
            if (
                line[0].className == colorToGuess.colorUn &&
                line[1].className == colorToGuess.colorDeux &&
                line[2].className == colorToGuess.colorTrois &&
                line[3].className == colorToGuess.colorQuatre &&
                line[4].className == colorToGuess.colorCinq) {
                alert("gagner ! ");
            } else {
                var pw = 0;
                var pb = 0;
                if (line[0].className == colorToGuess.colorUn) {
                    pb++;
                }
                if (line[1].className == colorToGuess.colorDeux) {
                    pb++;
                }
                if (line[2].className == colorToGuess.colorTrois) {
                    pb++;
                }
                if (line[3].className == colorToGuess.colorQuatre) {
                    pb++;
                }
                if (line[4].className == colorToGuess.colorCinq) {
                    pb++;
                }
                if (line[0].className == colorToGuess.colorDeux ||
                    line[0].className == colorToGuess.colorTrois ||
                    line[0].className == colorToGuess.colorQuatre ||
                    line[0].className == colorToGuess.colorCinq) {
                    pw++;
                }
                if (line[1].className == colorToGuess.colorUn ||
                    line[1].className == colorToGuess.colorTrois ||
                    line[1].className == colorToGuess.colorQuatre ||
                    line[1].className == colorToGuess.colorCinq) {
                    pw++;
                }
                if (line[2].className == colorToGuess.colorDeux ||
                    line[2].className == colorToGuess.colorUn ||
                    line[2].className == colorToGuess.colorQuatre ||
                    line[2].className == colorToGuess.colorCinq) {
                    pw++;
                }
                if (line[3].className == colorToGuess.colorDeux ||
                    line[3].className == colorToGuess.colorTrois ||
                    line[3].className == colorToGuess.colorUn ||
                    line[3].className == colorToGuess.colorCinq) {
                    pw++;
                }
                if (line[4].className == colorToGuess.colorDeux ||
                    line[4].className == colorToGuess.colorTrois ||
                    line[4].className == colorToGuess.colorQuatre ||
                    line[4].className == colorToGuess.colorUn) {
                    pw++;
                }
                this.emit("totalPionBlanc", {
                    pw: pw,
                    btncol: btncolonne,
                });
                this.emit("totalPionNoir", {
                    pb: pb,
                    btncol: btncolonne,
                });
            }

        });

    }
    btnOkPresser() {
        this.on("btnpresser", (e) => {
            const el = document.getElementById(e.target);
            this.emit("verification", {
                btncol: parseInt(el.dataset.btncol),
            });
            el.remove();

        });
    }
    pionNoir() {
        this.on("totalPionNoir", (e) => {
            var pbUn = document.getElementById(e.btncol + "-0-0");
            var pbDeux = document.getElementById(e.btncol + "-0-1");
            if (e.pb == 1) {
                pbUn.style.backgroundColor = "black";
            };
            if (e.pb >= 2) {
                pbUn.style.backgroundColor = "black";
                pbDeux.style.backgroundColor = "black";
            };
        });
    }
    pionBlanc() {
        this.on("totalPionBlanc", (e) => {

            var pwUn = document.getElementById(e.btncol + "-1-0");
            var pwDeux = document.getElementById(e.btncol + "-1-1");
            if (e.pw == 1) {
                pwUn.style.backgroundColor = "white";
            };
            if (e.pw >= 2) {
                pwUn.style.backgroundColor = "white";
                pwDeux.style.backgroundColor = "white";
            };
        });
    }
}

function facileSolo() {
    this.view = new View(5, 12);
    this.controller = new Controller(12);
    this.controller.restart();
    this.controller.verification();
    this.controller.btnOkPresser();
    this.controller.stockage();
    this.controller.pionNoir();
    this.controller.pionBlanc();
    var btnFacileSolo = document.getElementById("btnFacileSolo");
    var btnDifficileSolo = document.getElementById("btnDifficileSolo");
    var btnFacileMulti = document.getElementById("btnFacileMulti");
    var btnDifficileMulti = document.getElementById("btnDifficileMulti");
    btnFacileSolo.remove();
    btnDifficileSolo.remove()
    btnFacileMulti.remove();
    btnDifficileMulti.remove();
    colorToGuess.colorUn = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorDeux = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorTrois = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorQuatre = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorCinq = color[Math.floor(Math.random() * Math.floor(5))];
}

function facileMulti() {
    this.view = new View(5, 12);
    this.controller = new Controller(12);
    this.controller.restart();
    this.controller.verification();
    this.controller.btnOkPresser();
    this.controller.stockage();
    this.controller.pionNoir();
    this.controller.pionBlanc();
    var btnFacileSolo = document.getElementById("btnFacileSolo");
    var btnDifficileSolo = document.getElementById("btnDifficileSolo");
    var btnFacileMulti = document.getElementById("btnFacileMulti");
    var btnDifficileMulti = document.getElementById("btnDifficileMulti");
    btnFacileSolo.remove();
    btnDifficileSolo.remove()
    btnFacileMulti.remove();
    btnDifficileMulti.remove();
    colorToGuess.colorUn = prompt("Qu'elle est la Première couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorDeux = prompt("Qu'elle est la Deuxième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorTrois = prompt("Qu'elle est la Troisième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorQuatre = prompt("Qu'elle est la Quatrième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorCinq = prompt("Qu'elle est la Cinquième couleur ? choissisez entre red, blue, green, yellow, orange");
    while (colorToGuess.colorUn !== "red" && colorToGuess.colorUn !== "blue" && colorToGuess.colorUn !== "green" &&
        colorToGuess.colorUn !== "yellow" && colorToGuess.colorUn !== "orange") {
        colorToGuess.colorUn = prompt("Fautes de frappe, recommencer.Qu'elle est la Première couleur ? choissisez entre red, blue, green, yellow, orange");

    }
    while (colorToGuess.colorDeux !== "red" && colorToGuess.colorDeux !== "blue" && colorToGuess.colorDeux !== "yellow" &&
        colorToGuess.colorDeux !== "green" && colorToGuess.colorDeux !== "orange") {
        colorToGuess.colorDeux = prompt("Fautes de frappe, recommencer.Qu'elle est la Deuxième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorTrois !== "red" && colorToGuess.colorTrois !== "blue" && colorToGuess.colorTrois !== "green" &&
        colorToGuess.colorTrois !== "yellow" && colorToGuess.colorTrois !== "orange") {
        colorToGuess.colorTrois = prompt("Fautes de frappe, recommencer.Qu'elle est la Troisième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorQuatre !== "red" && colorToGuess.colorQuatre !== "blue" && colorToGuess.colorQuatre !== "green" &&
        colorToGuess.colorQuatre !== "yellow" && colorToGuess.colorQuatre !== "orange") {
        colorToGuess.colorQuatre = prompt("Fautes de frappe, recommencer.Qu'elle est la Quatrième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorCinq !== "red" && colorToGuess.colorCinq !== "blue" && colorToGuess.colorCinq !== "green" &&
        colorToGuess.colorCinq !== "yellow" && colorToGuess.colorCinq !== "orange") {
        colorToGuess.colorCinq = prompt("Fautes de frappe, recommencer.Qu'elle est la Cinquième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
}

function difficileSolo() {
    this.view = new View(5, 5);
    this.controller = new Controller(5, 5);
    this.controller.restart();
    this.controller.verification();
    this.controller.btnOkPresser();
    this.controller.stockage();
    this.controller.pionNoir();
    this.controller.pionBlanc();
    var btnFacileSolo = document.getElementById("btnFacileSolo");
    var btnDifficileSolo = document.getElementById("btnDifficileSolo");
    var btnFacileMulti = document.getElementById("btnFacileMulti");
    var btnDifficileMulti = document.getElementById("btnDifficileMulti");
    btnFacileSolo.remove();
    btnDifficileSolo.remove()
    btnFacileMulti.remove();
    btnDifficileMulti.remove();
    colorToGuess.colorUn = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorDeux = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorTrois = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorQuatre = color[Math.floor(Math.random() * Math.floor(5))];
    colorToGuess.colorCinq = color[Math.floor(Math.random() * Math.floor(5))];
}

function difficileMulti() {
    this.view = new View(5, 5);
    this.controller = new Controller(5, 5);
    this.controller.restart();
    this.controller.verification();
    this.controller.btnOkPresser();
    this.controller.stockage();
    this.controller.pionNoir();
    this.controller.pionBlanc();
    var btnFacileSolo = document.getElementById("btnFacileSolo");
    var btnDifficileSolo = document.getElementById("btnDifficileSolo");
    var btnFacileMulti = document.getElementById("btnFacileMulti");
    var btnDifficileMulti = document.getElementById("btnDifficileMulti");
    btnFacileSolo.remove();
    btnDifficileSolo.remove()
    btnFacileMulti.remove();
    btnDifficileMulti.remove();
    colorToGuess.colorUn = prompt("Qu'elle est la Première couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorDeux = prompt("Qu'elle est la Deuxième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorTrois = prompt("Qu'elle est la Troisième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorQuatre = prompt("Qu'elle est la Quatrième couleur ? choissisez entre red, blue, green, yellow, orange");
    colorToGuess.colorCinq = prompt("Qu'elle est la Cinquième couleur ? choissisez entre red, blue, green, yellow, orange");
    while (colorToGuess.colorUn !== "red" && colorToGuess.colorUn !== "blue" && colorToGuess.colorUn !== "green" &&
        colorToGuess.colorUn !== "yellow" && colorToGuess.colorUn !== "orange") {
        colorToGuess.colorUn = prompt("Fautes de frappe, recommencer.Qu'elle est la Première couleur ? choissisez entre red, blue, green, yellow, orange");

    }
    while (colorToGuess.colorDeux !== "red" && colorToGuess.colorDeux !== "blue" && colorToGuess.colorDeux !== "yellow" &&
        colorToGuess.colorDeux !== "green" && colorToGuess.colorDeux !== "orange") {
        colorToGuess.colorDeux = prompt("Fautes de frappe, recommencer.Qu'elle est la Deuxième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorTrois !== "red" && colorToGuess.colorTrois !== "blue" && colorToGuess.colorTrois !== "green" &&
        colorToGuess.colorTrois !== "yellow" && colorToGuess.colorTrois !== "orange") {
        colorToGuess.colorTrois = prompt("Fautes de frappe, recommencer.Qu'elle est la Troisième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorQuatre !== "red" && colorToGuess.colorQuatre !== "blue" && colorToGuess.colorQuatre !== "green" &&
        colorToGuess.colorQuatre !== "yellow" && colorToGuess.colorQuatre !== "orange") {
        colorToGuess.colorQuatre = prompt("Fautes de frappe, recommencer.Qu'elle est la Quatrième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
    while (colorToGuess.colorCinq !== "red" && colorToGuess.colorCinq !== "blue" && colorToGuess.colorCinq !== "green" &&
        colorToGuess.colorCinq !== "yellow" && colorToGuess.colorCinq !== "orange") {
        colorToGuess.colorCinq = prompt("Fautes de frappe, recommencer.Qu'elle est la Cinquième couleur ? choissisez entre red, blue, green, yellow, orange");
    }
}
var line = [];