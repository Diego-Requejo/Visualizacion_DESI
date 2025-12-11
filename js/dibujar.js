


function modificarLeyenda(maxRatio){
    var bajo = (maxRatio*0.25);
    var medio =(maxRatio*0.5);
    var medioAlto = (maxRatio*0.75);

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


function calcularRatio(nombreProvincia){
    var totalCom = 0;
    for(var i=0;i<selec.length;i++){
        if(selec[i])
            totalCom+=establecimientos[i+selec.length*prov.indexOf(nombreProvincia)]
    }
    var hab = habitantes[prov.indexOf(nombreProvincia)];

    return (totalCom / hab*10000);
}




function mostrarGraficoBarras(provincia, comercios) {

    document.getElementById("cloropletico").style.display = "none";
    document.getElementById("leyenda").style.display = "none";
    document.getElementById("checkboxesDiv").style.display = "none";


    document.getElementById("graficoBarras").style.display = "block";
    document.getElementById("tituloBarra").innerText = "Provincia: " + provincia;

    var dataProv = sectores.map((sector, i) => {
        let total = 0;
        comercios.forEach(d => {
            if (
                d.Provincia.toUpperCase() === provincia.toUpperCase() &&
                d["Sector comercial"].toUpperCase() === sector.toUpperCase() &&
                selec[i]
            ) {
                total += parseInt(d["Nº establecimientos"]);
            }
        });
        return {
            sector: sector,
            cantidad: total
        };
    });
    console.log(dataProv);
    var svg = d3.select("#barSvg");
    svg.selectAll("*").remove(); 

    var WIDTH = +svg.attr("width") - 100;
    var HEIGHT = +svg.attr("height") - 50;

    var x = d3.scaleBand()
        .domain(dataProv.map(d => d.sector))
        .range([50, WIDTH])
        .padding(0.2);

    var y = d3.scaleLinear()
        .domain([0, d3.max(dataProv, d => d.cantidad)])
        .range([HEIGHT, 20]);


    svg.append("g")
        .attr("transform", `translate(0,${HEIGHT})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(50,0)`)
        .call(d3.axisLeft(y));


    svg.selectAll("rect")
        .data(dataProv)
        .enter()
        .append("rect")
        .attr("x", d => x(d.sector))
        .attr("y", d => y(d.cantidad))
        .attr("width", x.bandwidth())
        .attr("height", d => HEIGHT - y(d.cantidad))
        .attr("fill", "#69b3a2");
}


function dibujarMapa(){
    console.log("Dibujando Mapa");
    d3.select("#cloropletico").selectAll("svg").remove();

    // Definimos area de dibujo
    var WIDTH = document.getElementById("cloropletico").offsetWidth;
    var HEIGHT = document.getElementById("cloropletico").offsetHeight;


// Creamos zona para el mapa
    var svgWidth = WIDTH;
    var svgHeight = HEIGHT-50;


     d3.json("provincias-CastillaYLeon.json").then(function(mapData){


         var svg = d3.select("#cloropletico")
             .append("svg")
             .attr("width",svgWidth)
             .attr("height",svgHeight);

         //Para ver los tipos de proyecciones predefinidas en D3 acceder a:
         //   https://d3-wiki.readthedocs.io/zh_CN/master/Geo-Projections/
         //   https://github.com/d3/d3-geo-projection/
         //  var projection = d3.geoMercator().scale(5000).translate([1000,4000]);


         var projection = d3.geoMercator();
         var geoPath = d3.geoPath(projection);

         // Calculo tamaño original, calculando los valores maximos y minimos de las coordenadas x e y del mapa
         // Se muestra por consola cada valor calculado.

         var Xmax = 0;
         var Xmin = WIDTH;
         var Ymax = 100;
         var Ymin = HEIGHT;
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
         var porcentajeAjuste = 0.95; // se ajusta el grafico a este porcentaje de la ventana
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
         var centroX = 180;
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

         var provincias = [];
         mapData.features.forEach(function(data){  //  no lo vamos a usar aqui, pero se
             //muestra como aÃ±adir un identificador a cada path
             provincias.push(data.properties.provincia);
         });


         var maxRatio = 0;


         //Hallar ratio comercios/10.000habitantes más alto
         prov.forEach(p => {
             let ratio = calcularRatio(p);
             if(ratio > maxRatio) maxRatio = ratio;
         });

         modificarLeyenda(maxRatio);



         svg.selectAll("path")
             .data(mapData.features)
             .enter()
             .append("path")
             .attr("id",function(data,i){return provincias[i];}) // AÃ±adimos identificador individual a cada path
             .attr("d", geoPath)
             .on("click",resaltaProvincia)
             .attr("fill", colorProvincia)
             .on("mouseover", handleMouseOver)
             .on("mouseout", handleMouseOut);

         /*Modificar para que cambie al gráfico de barras correspondiente*/
         function resaltaProvincia(evento) {
             var planoProvincia;
             mapData.features.forEach(function(data,j){
                 if (provincias[j]==evento.target.id) {
                     planoProvincia = data;
                 }
             });

             // Animación
             var escalaProvincia = escala * 5;

             var centroProvincia = geoPath.centroid(planoProvincia);
             var projectionProv = d3.geoMercator().scale(escalaProvincia);
             var geoPathProv = d3.geoPath(projectionProv);
             var centroProvinciaEsc = geoPathProv.centroid(planoProvincia);
             var transXProv = (centroProvincia[0]-centroProvinciaEsc[0])+offsetX;
             var transYProv = (centroProvincia[1]-centroProvinciaEsc[1])+offsetY;
             projectionProv = projectionProv.translate([transXProv, transYProv]);
             geoPathProv = d3.geoPath(projectionProv);

             d3.select(this).transition().duration(2000)
                 .attr("d", geoPathProv(planoProvincia))
                 .on("end", function() {
                     // Al terminar la animación, mostramos gráfico de barras
                     mostrarGraficoBarras(evento.target.id);
                 });
         }

         function colorProvincia(data, i){
             var provincia = provincias[i];
             //console.log(provincia);
             var ratio = calcularRatio(provincia);
             if(maxRatio===0) return "black";
             console.log(maxRatio);
             if (ratio > 0.75 * maxRatio) return "#a51b0b";      // Alto
             if (ratio > 0.5 * maxRatio) return "#ff0000";       // Medio-alto
             if (ratio > 0.25 * maxRatio) return "#ff7b5a";      // Medio
             return "#ffbfaa";
         }

         // Create Event Handlers for mouse
         /*Modificar para que muestre los datos*/
         function handleMouseOver(event, d) {
             if(maxRatio!==0) {
                 var provincia = d.properties.provincia;
                 var ratio = calcularRatio(provincia).toFixed(1);

                 svg.append("rect")
                     .attr("id", "r" + provincia)
                     .attr("x", event.offsetX + 10)
                     .attr("y", event.offsetY - 20)
                     .attr("width", 190)
                     .attr("height", 50)
                     .style("fill", "#FFFFDD")
                     .style("stroke", "black");

                 var tooltip = svg.append("text")
                     .attr("id", "t" + provincia)
                     .attr("x", event.offsetX + 20)
                     .attr("y", event.offsetY + 5);

                 tooltip.append("tspan")
                     .attr("x", event.offsetX + 20)
                     .attr("dy", 0)
                     .text(provincia + ": " + ratio + " comercios");

                 tooltip.append("tspan")
                     .attr("x", event.offsetX + 80)
                     .attr("dy", "1.2em")  // Espaciado entre líneas
                     .text("              / 10000 hab");
             }
         }


         function handleMouseOut(event, i) {
             d3.select("#t" + event.target.id).remove();  // Ahora sí existe
             d3.select("#r" + event.target.id).remove();
         }
     })
         .catch ((e)=> {
             d3.select("#grafico").append("svg").append("text").attr("x",30).attr("y",30).text("ERROR al cargar los datos");
             //console.log(e);
    });
}