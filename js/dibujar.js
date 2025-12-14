

/**
 * Función que cambia la leyenda dependiendo del ratio maximo en cada momento
 * 
 * @param maxRatio - Ratio maximo de comercios/10.000 habitantes
 */
function modificarLeyenda(maxRatio){
    var bajo = (maxRatio*0.40);
    var medio =(maxRatio*0.65);
    var medioAlto = (maxRatio*0.90);

    if(maxRatio===0)
        d3.selectAll("text").text("-")
    else{
        d3.select("#interBajo")
            .text("< "+bajo.toFixed(2));
        bajo+=0.01;
        d3.select("#interMedio")
            .text(bajo.toFixed(2)+" - "+medio.toFixed(2));
        medio+=0.01;
        d3.select("#interMedioalto")
            .text(medio.toFixed(2)+" - "+medioAlto.toFixed(2));
        medioAlto+=0.01;
        d3.select("#interAlto")
            .text("> "+medioAlto.toFixed(2));
    }




}


var escHab = 10000;
/**
 * Función que calcula el ratio de comercios por habitantes (eschab) para una provincia
 * 
 * @param nombreProvincia - Nombre de la provincia para la que se calcula el ratio
 */
function calcularRatio(nombreProvincia){
    var totalCom = 0;
    for(var i=0;i<selec.length;i++){
        if(selec[i])
            totalCom+=establecimientos[nombreProvincia][sectores[i]];
    }
    var hab = habitantes[prov.indexOf(nombreProvincia)];

    return (totalCom / hab*escHab);
}


/**
 * Función que muestra el gráfico de barras una vez la provincia es seleccionada.
 *
 * @param provincia - Nombre de la provincia seleccionada
 */
function dibujarGraficoBarras(provincia) {
    console.log("Mostrando grafico de barras para provincia: " + provincia);

    // Añadir provincia a la URL
    window.history.pushState({}, '', '?provincia=' + encodeURIComponent(provincia));

    document.getElementById("contenedorMapa").style.display = "none";
    document.getElementById("contenedorBarras").style.display = "flex";
    

    document.querySelector("h1").innerHTML = "Nº de comercios por sector<br>comercial en " + provincia;

    // Preparar datos usando la estructura de establecimientos
    var dataProv = sectores.map((sector, i) => {
        // Solo incluir si el sector está seleccionado
        let cantidad = 0;
        if (establecimientos[provincia] && establecimientos[provincia][sector]) {
            cantidad = establecimientos[provincia][sector];
        }
        return {
            sector: sector,
            cantidad: cantidad
        };
    }).filter(d => d.cantidad > 0) 
      .sort((a, b) => b.cantidad - a.cantidad);

    // Configurar SVG
    var svg = d3.select("#barSvg");
    svg.selectAll("*").remove();

    var margin = {top: 10, right: 30, bottom: 10, left: 235};

    var WIDTH = document.getElementById("barrasDiv").offsetWidth -  margin.left - margin.right;
    var HEIGHT = document.getElementById("barrasDiv").offsetHeight - margin.top - margin.bottom;

    // Crear grupo principal con márgenes
    var g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas
    var x = d3.scaleLinear()
        .domain([0, d3.max(dataProv, d => d.cantidad)])
        .range([0, WIDTH]);

    var y = d3.scaleBand()
        .domain(dataProv.map(d => d.sector))
        .range([0, HEIGHT])
        .padding(0.3);


    // Eje Y
    g.append("g")
        .attr("id", "graph")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "11px");

    // Barras
    g.selectAll(".bar")
        .data(dataProv)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.sector))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", "#ff0000ff")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .transition().delay(300).duration(2500).attr("width", d => x(d.cantidad));

    // Agregar valores encima de las barras (solo si la barra es visible)
    g.selectAll(".label")
        .data(dataProv)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", 15)
        .attr("y", d => y(d.sector) + y.bandwidth() / 2 + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "20spx")
        .style("font-weight", "bold")
        .text(d => d.cantidad)
        .transition().delay(300).duration(2500).attr("x", d => x(d.cantidad) + 15);
}

/**
 * Función que dibuja el mapa coroplético
 */
function dibujarMapa(){
    d3.select("#coropletico").selectAll("svg").remove();

    // Definimos area de dibujo
    var WIDTH = document.getElementById("coropletico").offsetWidth;
    var HEIGHT = document.getElementById("coropletico").offsetHeight;


// Creamos zona para el mapa
    var svgWidth = WIDTH;
    var svgHeight = HEIGHT-50;


     d3.json("provincias-CastillaYLeon.json").then(function(mapData){


         var svg = d3.select("#coropletico")
             .append("svg")
             .attr("width",svgWidth)
             .attr("height",svgHeight);

         var projection = d3.geoMercator();
         var geoPath = d3.geoPath(projection);

         // Calculo tamaño original, calculando los valores maximos y minimos de las coordenadas x e y del mapa
         // Se muestra por consola cada valor calculado.
         var Xmax = 0;
         var Xmin = WIDTH;
         var Ymax = 100;
         var Ymin = HEIGHT;
         mapData.features.forEach(function(data2,i){
             var bordeInfX = geoPath.bounds(data2)[0][0];
             if (bordeInfX < Xmin) {
                 Xmin = bordeInfX;
             }
             var bordeInfY = geoPath.bounds(data2)[0][1];
             if (bordeInfY < Ymin) {
                 Ymin = bordeInfY;
             }
             var bordeSupX = geoPath.bounds(data2)[1][0];
             if (bordeSupX > Xmax) {
                 Xmax = bordeSupX;
             }
             var bordeSupY = geoPath.bounds(data2)[1][1];
             if (bordeSupY > Ymax) {
                 Ymax = bordeSupY;
             }
         });

         // Calculo aumento escala, ajustando a las dimensiones del cuadro svg
         // El problema es ajustar un mapa con coordenadas longitud-latitud a pixeles en la pantalla
         // Ajustamos usando la proporcion (ancho/alto) "mas estrecha", para no desbordar.
         var porcentajeAjuste = 0.95; // se ajusta el grafico a este porcentaje de la ventana
         var proporcionX = svgWidth / (Xmax-Xmin); // se ve cuantas veces puedo aumentar en esta dimension
         var proporcionY = svgHeight / (Ymax-Ymin); // idem para Y

         if (proporcionX < proporcionY) { // ajusto al porcentaje maximo en la dimension X
             var escala = Math.floor((svgWidth*porcentajeAjuste)/(Xmax-Xmin));
         } else {  // ajusta al porcentaje maximo en la dimension Y
             var escala = Math.floor((svgHeight*porcentajeAjuste)/(Ymax-Ymin));
         }
         escala = escala*projection.scale(); // multiplico el aumento por la escala ya aplicada

         // Aplico Escala
         projection = d3.geoMercator().scale(escala);
         geoPath = d3.geoPath(projection);


         //  Se calcula el centro de cada path (provincia), y con estos el del centro del mapa,
         //ajustando este al centro del elemento svg
         var centroX = 180;
         var centroY = 0;
         var numPaths = mapData.features.length;
         mapData.features.forEach(function(data2,i){
             centroX = centroX + geoPath.centroid(data2)[0];
             centroY = centroY + geoPath.centroid(data2)[1];
         });
         centroX = centroX / numPaths;
         centroY = centroY / numPaths;


         var offsetX = projection.translate()[0];  // offset que se aplica por defecto y que hay que sumar para "quitarlo"
         var offsetY = projection.translate()[1];

         var transX = Math.floor((svgWidth/2)-centroX)+offsetX;
         var transY = Math.floor((svgHeight/2)-centroY)+offsetY;

         projection = projection.translate([transX,transY]);
         geoPath = d3.geoPath(projection);

         var provincias = [];
         mapData.features.forEach(function(data){ //añade un identificador a cada path
             provincias.push(data.properties.provincia);
         });


         //Hallar ratio comercios/10.000habitantes más alto
         var maxRatio = 0;
         prov.forEach(p => {
             let ratio = calcularRatio(p);
             if(ratio > maxRatio) maxRatio = ratio;
         });

         modificarLeyenda(maxRatio);


         //Añadimos y configuramos cada path
         svg.selectAll("path")
             .data(mapData.features)
             .enter()
             .append("path")
             .attr("id",function(data,i){return provincias[i];}) // Añadimos identificador individual a cada path
             .attr("d", geoPath)
             .attr("stroke", "#333333") //Añade un borde a cada provincia
             .on("click",resaltaProvincia) //Para cuando se haga click en una provincia
             .attr("fill", colorProvincia) //Para seleccionar de cada provincia color dependiendo del ratio
             .on("mouseover", handleMouseOver) //Para cuando pase el cursor por encima
             .on("mouseout", handleMouseOut); //Para cuando deje de pasar el cursor por encima

         /**
          * Muestra una animación antes de cambiar al gráfico de barras correspondiente
          *
          * @param evento - Evento que se genera al hacer click en una provincia
          */
         function resaltaProvincia(evento) {
             var planoProvincia;
             mapData.features.forEach(function(data,j){
                 if (provincias[j]==evento.target.id) {
                     planoProvincia = data;
                 }
             });

             // Animación
             var escalaProvincia = escala * 10;

             var centroProvincia = geoPath.centroid(planoProvincia);
             var projectionProv = d3.geoMercator().scale(escalaProvincia);
             var geoPathProv = d3.geoPath(projectionProv);
             var centroProvinciaEsc = geoPathProv.centroid(planoProvincia);
             var transXProv = (centroProvincia[0]-centroProvinciaEsc[0])+offsetX;
             var transYProv = (centroProvincia[1]-centroProvinciaEsc[1])+offsetY;
             projectionProv = projectionProv.translate([transXProv, transYProv]);
             geoPathProv = d3.geoPath(projectionProv);

             d3.selectAll("path").transition().duration(2000)
                 .attr("fill", "#AAF0D1")
                 .attr("d", geoPathProv)
                 .on("end", function() {
                     // Al terminar la animación, mostramos gráfico de barras
                     dibujarGraficoBarras(evento.target.id);
                 });

         }

         /**
          * Función que devuelve el color de cada provincia dependiendo del
          * ratio de comercios/10.000 habitantes de cada provincia
          *
          * @param data
          * @param i - Indice de la provincia en el array provincias
          * @return color - Color que se le asigna a la provincia
          */
         function colorProvincia(data, i){
             var provincia = provincias[i];
             //console.log(provincia);
             var ratio = calcularRatio(provincia);
             if(maxRatio===0) return "black";
             if (ratio > 0.90 * maxRatio) return "#a51b0b";      // Alto
             if (ratio > 0.65 * maxRatio) return "#ff0000";       // Medio-alto
             if (ratio > 0.40 * maxRatio) return "#ff7b5a";      // Medio
             return "#ffbfaa";
         }

         /**
          * Gestiona el evento de pasar el ratón mostrando una descripción emergente con información
          * sobre una provincia específica. Esta información incluye el nombre de la provincia y
          * la proporción de comercios/10.000 habitantes con los filtros aplicados.
          *
          * @param event - El objeto del evento de pasar el ratón.
          * @param d - El objeto de datos asociado al elemento sobre el que se pasa el ratón.
          *            Se espera que tenga una propiedad `properties` que contenga la `provincia`.
          */
         function handleMouseOver(event, d) {
             if(maxRatio!==0) {
                 var provincia = d.properties.provincia;
                 var ratio = calcularRatio(provincia).toFixed(1);
                 var posX, posY;
                 [posX, posY] = d3.pointer(event);
                 svg.append("rect")
                     .attr("id", "r" + provincia)
                     .attr("x", posX + 10)
                     .attr("y", posY - 20)
                     .attr("width", 190)
                     .attr("height", 50)
                     .style("fill", "#FFFFDD")
                     .style("stroke", "black");

                 var tooltip = svg.append("text")
                     .attr("id", "t" + provincia)
                     .attr("x", posX + 20)
                     .attr("y", posY + 5);

                 tooltip.append("tspan")
                     .attr("x", posX + 20)
                     .attr("dy", 0)
                     .text(provincia + ": " + ratio + " comercios");

                 tooltip.append("tspan")
                     .attr("x", posX+ 90)
                     .attr("dy", "1.2em")  // Espaciado entre líneas
                     .text("/" + escHab +" hab");
             }
         }

         /**
          * Gestiona el evento de ratón fuera eliminando el tooltip asociado con el objetivo del evento.
          *
          * @param event - El evento de ratón fuera activado por la interacción del usuario.
          * @param i - El índice o identificador asociado con el contexto del evento.
          */
         function handleMouseOut(event, i) {
             d3.select("#t" + event.target.id).remove();  // Ahora sí existe
             d3.select("#r" + event.target.id).remove();
         }
     })
         .catch ((e)=> {
             d3.select("#coropletico").append("svg").append("text").attr("x",30).attr("y",30).text("ERROR al cargar los datos");
             //console.log(e);
    });
}