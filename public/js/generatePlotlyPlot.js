function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
//mainData pochodzi z tabeli anime, additionalData to dane z innych tabel które mają nazwy rzeczy które są w tabelce anime jako klucz obcy
function generatePlot(mainData, additionalData) {
    let compareBy = document.getElementById('compareBy').value;
    let plotType = document.getElementById('plotType').value;
    let orderBy = document.getElementById('orderType').value;
    let colouringType = document.getElementById('colouringType').value;
    let data;
    let layout;
    let primaryAxis;
    let secondaryAxis;
    switch(plotType) {
        case "bar":
            primaryAxis = "x";
            secondaryAxis = "y";
            data = [
                {
                  x: mainData['Title'],
                  y: mainData[compareBy],
                  marker: { color: null },
                  type: 'bar'
                }
            ];
            layout = {
                //title: 'Wykresbc',
                automargin: true,
                margin: {b: 250},
                xaxis: {
                    ticks: "outside", 
                    ticklen: 10
                },   
                yaxis: {}
            }
            break;
        case "bar-vertical":
            primaryAxis = "y";
            secondaryAxis = "x";
            data = [
                {
                  y: mainData['Title'],
                  x: mainData[compareBy],
                  marker: { color: null },
                  orientation: 'h',
                  type: 'bar'
                }
            ];
            layout = {
                //title: 'Wykresbc',
                automargin: true,
                margin: {l: 350},
                yaxis: {
                    ticks: "outside", 
                    ticklen: 10
                },   
                xaxis: {}
            }
            break;
        case "bubble":
    }
    switch(orderBy) {
        case "ascending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total ascending';
            break;
        case "descending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total descending';
            break;
    }
    if(plotType == "bar-vertical" && orderBy != "default") {
        layout[`${primaryAxis}axis`]['autorange'] = 'reversed';
    }


    switch(compareBy) {
        case "Avg_Rating":
            //bierzemy minimalną wartość, zaokrąglamy ją w dół i obniżamy o jeden
            let minRange = Math.ceil(Math.min.apply(Math, Object.values(mainData['Avg_Rating']))) - 1;
            if(minRange < 0) minRange = 0;
            console.log(minRange);
            layout[`${secondaryAxis}axis`]['range'] = [minRange, 10];
            break;
    }
    switch(colouringType) {
        case "colourful":
            var colours = []; 
            for (let i = 0; i < (mainData['ID_Internal']).length; i++) colours.push(`rgba(${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, 1)`);
            data[0]['marker'] = { color: colours }
            break;
    }
    
    var config = {
        responsive: true
    }
    console.log(data);
    Plotly.newPlot('plotField', data, layout, config);
}