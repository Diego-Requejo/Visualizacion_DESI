//VARIABLES GLOBAL que almacenan el estado de los filtros (true=seleccionado, false=deseleccionado)
var selec=[];

/**
 * Función que inicializa la página, recoge los datos y los guarda en variables globales.
 * Finalmente, dibuja el mapa o el gráfico de barra según corresponda.
 */

async function inicializar() {


    await recogerData();

    for (var i = 0; i < sectores.length; i++)
        selec.push(true);


    // Comprobar si hay provincia en la URL
    const params = new URLSearchParams(window.location.search);
    const provincia = params.get('provincia');

    if (provincia) {
        dibujarGraficoBarras(provincia);
    }else
        selecTodo();

}

/**
 * Cambia al mapa coroplético cuando se pulsa el boton de volver al mapa desde el grafico de barras
 */
function botonVolver(){
    // Limpiar la URL
    window.history.pushState({}, '', window.location.pathname);

    document.getElementById("contenedorBarras").style.display = "none";
    document.getElementById("contenedorMapa").style.display = "flex";

    document.querySelector("h1").innerHTML = "Distribución de comercios por <br> sectores en las provincias de CyL";
    dibujarMapa(); // Re-dibuja el mapa en estado inicial
}

/**
 * Función que implementa la acción de seleccionar el checkbox de "Seleccionar todo"
 */
function selecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = true;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=true;
    document.getElementById("selTodo").checked=true;
    document.getElementById("deselTodo").checked=false;

    dibujarMapa();
}
/**
 * Función que implementa la acción de seleccionar el checkbox de "Deseleccionar todo"
 */
function deselecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = false;
    })
    for(var i=0;i<selec.length;i++)
        selec[i]=false;
    document.getElementById("selTodo").checked=false;

    dibujarMapa();
}

/**
 * Función que implementa el cambio de filtros cuando se selecciona o deselecciona una checkbox de sector.
 *
 * @param i - indice del sector en el vector selec
 * @param checked - valor del checkbox (true=seleccionado, false=deseleccionado)
 */
function cambioFiltros(i, checked){
    selec[i]=checked;
    if(checked)
        document.getElementById("deselTodo").checked=false;
    else
        document.getElementById("selTodo").checked=false;

    dibujarMapa();
}

let resizeTimeout;
/**
 * Detecta cuándo cambia el tamaño de la ventana y redibuja la visualización activa
 * con un pequeño retardo para esperar a que se termine de redimensionar antes de redibujar.
 */
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const contenedorMapa = document.getElementById("contenedorMapa");
        const contenedorBarras = document.getElementById("contenedorBarras");

        if (contenedorMapa.style.display !== "none") {
            dibujarMapa();
        } else if (contenedorBarras.style.display !== "none") {
            const params = new URLSearchParams(window.location.search);
            const provincia = params.get('provincia');
            if (provincia) {
                dibujarGraficoBarras(provincia);
            }
        }
    }, 250); // Espera 250ms después de que el usuario termine de redimensionar
});
