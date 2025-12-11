var selec=[]



async function inicializar() {


    await recogerData();

    for (var i = 0; i < sectores.length; i++)
        selec.push(true);
    selecTodo();

    // Asignar botón de volver aquí
    var btn = document.getElementById("btnVolverMapa");
    if (btn) {
        btn.onclick = function () {
            document.getElementById("graficoBarras").style.display = "none";
            document.getElementById("cloropletico").style.display = "block";
            document.getElementById("leyenda").style.display = "block";
            document.getElementById("checkboxesDiv").style.display = "flex";
            dibujarMapa(); // Re-dibuja el mapa en estado inicial
        }
    }
}


function selecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = true;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=true;
    document.getElementById("deselTodo").checked=false;

    dibujarMapa();
}

function deselecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = false;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=false;
    document.getElementById("selTodo").checked=false;

    dibujarMapa();
}

function cambioFiltros(i, checked){
    selec[i]=checked;
    if(checked)
        document.getElementById("deselTodo").checked=false;
    else
        document.getElementById("selTodo").checked=false;

    dibujarMapa();
}
