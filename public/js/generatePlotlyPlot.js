//mainData pochodzi z tabeli anime, additionalData to dane z innych tabel które mają nazwy rzeczy które są w tabelce anime jako klucz obcy
function generatePlot(mainData, additionalData) {
    let compareBy = document.getElementById('compareBy').value;
    let plotType = document.getElementById('plotType').value;
    let orderBy = document.getElementById('orderType').value;
    var data;
    var layout;
    switch(plotType) {
        case "bar":
            dataAxis = "x";
            data = [
                {
                  x: mainData['Title'],
                  y: mainData[compareBy],
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
            dataAxis = "y";
            data = [
                {
                  y: mainData['Title'],
                  x: mainData[compareBy],
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
            layout[`${dataAxis}axis`]['categoryorder'] = 'total ascending';
            break;
        case "descending":
            layout[`${dataAxis}axis`]['categoryorder'] = 'total descending';
            break;
    }
    if(plotType == "bar-vertical" && orderBy != "default") {
        layout[`${dataAxis}axis`]['autorange'] = 'reversed';
    }
    console.log(layout);
    console.log(mainData);
    console.log(additionalData);
    
    var config = {
        responsive: true
    }
    Plotly.newPlot('plotField', data, layout, config);
}