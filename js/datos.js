var prov =[];
var habitantes = []
var sectores =[];
var establecimientos = {};

async function recogerData() {
    await recogerProvHab();
    await recogerSectEst();
    console.log(establecimientos);
}

async function recogerProvHab() {

    const data = await d3.csv("data/habitantesProvincias.csv");

    data.forEach(function (d) {
        prov.push(d.PROVINCIA);
        habitantes.push(+d.HABITANTES);
    });

}

async function recogerSectEst() {
    const data = await d3.csv("data/numeroEstablecimientos.csv");


    data.forEach(function (d) {
        if (!sectores.includes(d.Sector))
            sectores.push(d.Sector);
        // Crear estructura de diccionario
        // Si la provincia no existe, crearla
        if (!establecimientos[d.Provincia]) {
            establecimientos[d.Provincia] = {};
        }

        // Asignar el valor: establecimientos[Provincia][Sector] = numero
        establecimientos[d.Provincia][d.Sector] = +d.Establecimientos;
    });

}