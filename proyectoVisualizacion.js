
var selec=[]


function inicializar(){
    for(var i=0;i<23;i++)
        selec.push(true);
    selecTodo();
}

function selecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = true;
        sector.dispatchEvent(new Event('change'));
    })
    document.getElementById("deselTodo").checked=false;
}

function deselecTodo(){
    document.getElementsByName("sector").forEach(sector => {
        sector.checked = false;
        sector.dispatchEvent(new Event('change'));
    })
    document.getElementById("selTodo").checked=false;
}

function cambioFiltros(i, checked){
    selec[i]=checked;
    if(checked)
        document.getElementById("deselTodo").checked=false;
    else
        document.getElementById("selTodo").checked=false;
    dibujarMapa();
}

function dibujarMapa(){
    console.log("Dibujando Mapa");

    // Definimos area de dibujo
    var WIDTH = document.getElementById("cloropletico").offsetWidth;
    var HEIGHT = document.getElementById("cloropletico").offsetHeight;
    console.log("ancho: " + WIDTH);
    console.log("alto: " + HEIGHT);

// Creamos zona para el mapa
    var svgWidth = WIDTH;
    var svgHeight = HEIGHT-50;

    var tipoMapa=3;

    d3.json("provincias-CastillaYLeon.json")
        .then((mapData)=>{

            var svg = d3.select("#cloropletico")
                .append("svg")
                .attr("width",svgWidth)
                .attr("height",svgHeight);

            //Para ver los tipos de proyecciones predefinidas en D3 acceder a:
            //   https://d3-wiki.readthedocs.io/zh_CN/master/Geo-Projections/
            //   https://github.com/d3/d3-geo-projection/
            //  var projection = d3.geoMercator().scale(5000).translate([1000,4000]);

            switch (tipoMapa) {

                // MAPA SIN MODIFICAR VALORES ARIGINALES
                // Opcion de mapa basico. Sin atributos al generar los "paths"
                case 0:
                    var projection = d3.geoMercator();
                    var geoPath = d3.geoPath(projection);

                    svg.selectAll("path")
                        .data(mapData.features)
                        .enter()
                        .append("path")
                        .attr("d", geoPath)
                        .attr("fill", "blue");
                    break;

                // MAPA AJUSTANDO TAMAÑO Y AÑADIR INTERACCION
                // La mayoria de operaciones son las mismas en ambos casos.
                // Al añadir el elemento SVG al final diferenciaremos entre ambas
                case 1:
                case 2:
                case 3:
                    var projection = d3.geoMercator();
                    var geoPath = d3.geoPath(projection);

                    // Calculo tamaño original, calculando los valores maximos y minimos de las coordenadas x e y del mapa
                    // Se muestra por consola cada valor calculado.

                    var Xmax = 0;
                    var Xmin = WIDTH;
                    var Ymax = 100;
                    var Ymin = HEIGHT;
                    numPaths = mapData.features.length;
                    mapData.features.forEach(function(data2,i){
                        //console.log("Provincia: " + data2.properties.provincia);
                        var bordeInfX = geoPath.bounds(data2)[0][0];
                        //console.log("Borde Inf X: " + bordeInfX);
                        if (bordeInfX < Xmin) {
                            Xmin = bordeInfX;
                        }
                        var bordeInfY = geoPath.bounds(data2)[0][1];
                        //console.log("Borde Inf Y: " + bordeInfY);
                        if (bordeInfY < Ymin) {
                            Ymin = bordeInfY;
                        }
                        var bordeSupX = geoPath.bounds(data2)[1][0];
                        //console.log("Borde Sup X: " + bordeSupX);
                        if (bordeSupX > Xmax) {
                            Xmax = bordeSupX;
                        }
                        var bordeSupY = geoPath.bounds(data2)[1][1];
                        //console.log("Borde Sup Y: " + bordeSupY);
                        if (bordeSupY > Ymax) {
                            Ymax = bordeSupY;
                        }
                    });
                    //console.log("Xmax: " + Xmax);
                    //console.log("Xmin: " + Xmin);
                    //console.log("Ymax: " + Ymax);
                    //console.log("Ymin: " + Ymin);

                    // Calculo aumento escala, ajustando a las dimensiones del cuadro svg
                    // El problema es ajustar un mapa con coordenadas longitud-latitud a pixeles en la pantalla
                    // Ajustamos usando la proporcion (ancho/alto) "mas estrecha", para no desbordar.
                    var porcentajeAjuste = 0.8; // se ajusta el grafico a este porcentaje de la ventana
                    var proporcionX = svgWidth / (Xmax-Xmin); // se ve cuantas veces puedo aumentar en esta dimension
                    var proporcionY = svgHeight / (Ymax-Ymin); // idem para Y
                    //console.log("Prop x: " + proporcionX);
                    //console.log("Prop y: " + proporcionY);
                    if (proporcionX < proporcionY) { // ajusto al porcentaje maximo en la dimension X
                        var escala = Math.floor((svgWidth*porcentajeAjuste)/(Xmax-Xmin));
                    } else {  // ajust al porcentaje maximo en la dimension Y
                        var escala = Math.floor((svgHeight*porcentajeAjuste)/(Ymax-Ymin));
                    }
                    escala = escala*projection.scale(); // multiplico el aumento por la escala ya aplicada
                    //console.log("Escala: " + escala);
                    //console.log("Escala por defecto: " + projection.scale());
                    // Aplico Escala
                    projection = d3.geoMercator().scale(escala);
                    geoPath = d3.geoPath(projection);

                    //  Al ajustar la escala, como d3 lo escala usando longitud y latitud, el mapa se puede
                    //ir de la pantalla. Se puede ver esto, comentando el codigo que esta a continuacion
                    //y viendo los valores del path en el "Inspector" de las herramientas de administracion.
                    //Se dejan los calculos de los bordes de cada provincia para poder ver el efecto indicado
                    //por consola

                    //  Se calcula el centro de cada path (provincia), y con estos el del centro del mapa,
                    //ajustando este al centro del elemento svg
                    var centroX = 0;
                    var centroY = 0;
                    var numPaths = mapData.features.length;
                    mapData.features.forEach(function(data2,i){
                        //console.log("Provincia: " + data2.properties.provincia);
                        centroX = centroX + geoPath.centroid(data2)[0];
                        //console.log("centroX: " + geoPath.centroid(data2)[0]);
                        centroY = centroY + geoPath.centroid(data2)[1];
                        //console.log("centroY: " + geoPath.centroid(data2)[1]);
                        var bordeInfX = geoPath.bounds(data2)[0][0];
                        //console.log("Borde Inf X: " + bordeInfX);
                        var bordeInfY = geoPath.bounds(data2)[0][1];
                        //console.log("Borde Inf Y: " + bordeInfY);
                        var bordeSupX = geoPath.bounds(data2)[1][0];
                        //console.log("Borde Sup X: " + bordeSupX);
                        var bordeSupY = geoPath.bounds(data2)[1][1];
                        //console.log("Borde Sup Y: " + bordeSupY);
                    });
                    centroX = centroX / numPaths;
                    centroY = centroY / numPaths;
                    //console.log("CentroX final: " + centroX);
                    //console.log("CentroY final: " + centroY);

                    var offsetX = projection.translate()[0];  // offset que se aplica por defecto y que hay que sumar para "quitarlo"
                    var offsetY = projection.translate()[1];
                    //console.log("offset por defecto: " + projection.translate());
                    var transX = Math.floor((svgWidth/2)-centroX)+offsetX;
                    var transY = Math.floor((svgHeight/2)-centroY)+offsetY;
                    //console.log("Trans X: " + transX);
                    //console.log("Trans Y: " + transY);

                    projection = projection.translate([transX,transY]);
                    geoPath = d3.geoPath(projection);

                    if (tipoMapa == 1) { // sin interaccion
                        svg.selectAll("path")
                            .data(mapData.features)
                            .enter()
                            .append("path")
                            .attr("d", geoPath)
                            .attr("fill", "red")
                            .attr("stoke", "black")
                        ;
                    } else {  // con interaccion (resaltar provincia)
                        var provincias = [];
                        mapData.features.forEach(function(data){  //  no lo vamos a usar aqui, pero se
                            //muestra como aÃ±adir un identificador a cada path
                            provincias.push(data.properties.provincia);
                        });
                        if(tipoMapa == 2){
                            svg.selectAll("path")
                                .data(mapData.features)
                                .enter()
                                .append("path")
                                .attr("id",function(data,i){return provincias[i];}) // AÃ±adimos identificador individual a cada path
                                .attr("d", geoPath)
                                .on("click",resaltaProvincia);
                        }else{
                            svg.selectAll("path")
                                .data(mapData.features)
                                .enter()
                                .append("path")
                                .attr("id",function(data,i){return provincias[i];}) // AÃ±adimos identificador individual a cada path
                                .attr("d", geoPath)
                                .attr("fill", colorProvincia);
                        }

                    }

                    //   CAMBIADO EN V6, YA QUE EL TRATAMIENTO DE EVENTOS ES UNA DE LAS COSAS QUE HA SIDO MODIFICADA
                function resaltaProvincia(evento) {
                    var planoProvincia;
                    mapData.features.forEach(function(data,j){
                        if (provincias[j]==evento.target.id) { // tambien se podia haber hecho con this.id.
                            // "this" contiene el objeto del dom clicado
                            planoProvincia = data;  // nos quedamos con los datos de la provincia a resaltar
                        }
                    });
                    var escalaProvincia;
                    var color;
                    if (d3.select(this).attr("class") == null) {  // primer clic
                        escalaProvincia = escala*1.3;
                        color = "red";
                    } else {  // segundo clic
                        d3.select(this).attr("class",null);
                        escalaProvincia = escala;
                        color = "black";
                    }
                    var centroProvincia = geoPath.centroid(planoProvincia); // guardamos posicion original

                    var projectionProv = d3.geoMercator().scale(escalaProvincia);//.translate([transX,transY]); //.center(centroProvincia);
                    var geoPathProv = d3.geoPath(projectionProv);
                    var centroProvinciaEsc = geoPathProv.centroid(planoProvincia);

                    //  Al reescalar cambian los valores de proyeccion. Tenemos que volver a calcular
                    //y aplicar la transformacion para que la provincia ampliada quede en la misma posicion
                    var transXProv = (centroProvincia[0]-centroProvinciaEsc[0])+offsetX;
                    var transYProv = (centroProvincia[1]-centroProvinciaEsc[1])+offsetY;

                    projectionProv = projectionProv.translate([transXProv,transYProv]);
                    geoPathProv = d3.geoPath(projectionProv);

                    d3.select(this).transition().delay(0).duration(2000)
                        .attr("class","clic")
                        .style("fill", color)
                        .attr("d",geoPathProv(planoProvincia));
                }

                function colorProvincia(data, i){
                    if(provincias[i] === "León")
                        return "brown";
                    else if(provincias[i]==="Palencia")
                        return "orange";
                    else if(provincias[i]==="Burgos")
                        return "yellow";
                    else if(provincias[i]==="Salamanca")
                        return "green";
                    else if(provincias[i]==="Segovia")
                        return "blue";
                    else if(provincias[i]==="Ávila")
                        return "grey";
                    else if(provincias[i]==="Zamora")
                        return "red";
                    else if(provincias[i]==="Valladolid")
                        return "purple";
                    else
                        return "pink";

                    if (i%2===0) {
                        return "blue";
                    }else
                        return "red";
                }
                    break;


                default:
                    svg.append("text").attr("x",30).attr("y",30).text("ERROR: opcion no implementada");
            }
        })
        .catch ((e)=> {
            d3.select("#grafico").append("svg").append("text").attr("x",30).attr("y",30).text("ERROR al cargar los datos");
            //console.log(e);
        });
}