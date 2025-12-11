var prov =[];
var habitantes = []
var sectores =[];
var establecimientos = [];

async function recogerData() {
    await recogerProvHab();
    await recogerSectEst();
}

async function recogerProvHab() {

    const data = await d3.csv("../data/habitantesProvincias.csv");

    data.forEach(function (d) {
        prov.push(d.PROVINCIA);
        habitantes.push(+d.HABITANTES);
    });

}

async function recogerSectEst() {
    const data = await d3.csv("../data/numeroEstablecimientos.csv");


    data.forEach(function (d) {
        if (!sectores.includes(d.Sector))
            sectores.push(d.Sector);
        establecimientos.push(+d.Establecimientos);
    });

}