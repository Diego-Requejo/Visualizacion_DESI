var selec=[]


//Funcion que inicializa el mapa cloropletico
//Cambia al mapa cloropletico cuando se selecciona el boton de volver al mapa desde el grafico de barras
async function inicializar() {


    await recogerData();

    for (var i = 0; i < sectores.length; i++)
        selec.push(true);
    selecTodo();

    // Asignar botón de volver aquí
    var btn = document.getElementById("btnVolverMapa");
    if (btn) {
        btn.onclick = function () {
            document.getElementById("contenedorBarras").style.display = "none";
            document.getElementById("contenedorMapa").style.display = "flex";
            
            document.querySelector("h1").innerHTML = "Distribución de comercios por <br> sectores en las provincias de CyL";
            dibujarMapa(); // Re-dibuja el mapa en estado inicial
        }
    }
}

//Funcion que implementa el checkbox de seleccionar todo
function selecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = true;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=true;
    document.getElementById("deselTodo").checked=false;

    dibujarMapa();
}
//Funcion que implementa el checkbox de deseleccionar todo
function deselecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = false;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=false;
    document.getElementById("selTodo").checked=false;

    dibujarMapa();
}
//Funcion que implementa el cambio de filtros cuando se selecciona o deselecciona una checkbox de comercio
function cambioFiltros(i, checked){
    selec[i]=checked;
    if(checked)
        document.getElementById("deselTodo").checked=false;
    else
        document.getElementById("selTodo").checked=false;

    dibujarMapa();
}
