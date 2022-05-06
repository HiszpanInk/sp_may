function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function selectElement(id, valueToSelect) {    
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
function piePlotSelection() {
    switch(document.getElementById("plotType").value) {
        case "pie":
            document.getElementById("orderType").disabled = true;
            document.getElementById("colouringType").disabled = true;
            selectElement("compareBy", "Year_Broadcast");
            document.getElementById("compareBy").disabled = true;
            break;
        default:
            document.getElementById("orderType").disabled = false;
            document.getElementById("colouringType").disabled = false;
            document.getElementById("compareBy").disabled = false;
            selectElement("compareBy", "Year_Broadcast");
            break;
    }
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
    let title = null;
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
                title: null,
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
                title: null,
                automargin: true,
                margin: {l: 350},
                yaxis: {
                    ticks: "outside", 
                    ticklen: 10
                },   
                xaxis: {}
            }
            break;
        case "pie":
            let years = mainData['Year_Broadcast'];
            let years_counts = {};

            for (const num of years) {
                years_counts[num] = years_counts[num] ? years_counts[num] + 1 : 1;
            }
            primaryAxis = "x";
            secondaryAxis = "y";
            data = [{
                values: Object.values(years_counts),
                labels: Object.keys(years_counts),
                type: 'pie'
              }];
            layout = {
                title: 'Ilość anime w bazie danych zagregowane według daty produkcji',
                automargin: true,
                margin: {b: 100},
            }
            break;
    }
    


    switch(compareBy) {
        case "Avg_Rating":
            //bierzemy minimalną wartość, zaokrąglamy ją w dół i obniżamy o jeden
            let minRange = Math.ceil(Math.min.apply(Math, Object.values(mainData['Avg_Rating']))) - 1;
            if(minRange < 0) minRange = 0;
            console.log(minRange);
            layout[`${secondaryAxis}axis`]['range'] = [minRange, 10];
            title = "Średnia ocena dla każdej serii anime w bazie"
            break;
        case "Viewers_Count":
            title = "Ilość widzów dla każdej serii anime w bazie"
            break;
        case "Episodes_Count":
            title = "Ilość odcinków dla każdej serii anime w bazie"
            break;
    
    }
    switch(orderBy) {
        case "ascending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total ascending';
            title += " uporządkowana rosnąco"
            break;
        case "descending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total descending';
            title += " uporządkowana malejąco"
            break;
    }
    if(plotType == "bar-vertical" && orderBy != "default") {
        layout[`${primaryAxis}axis`]['autorange'] = 'reversed';
    }
    switch(colouringType) {
        case "colourful":
            var colours = []; 
            for (let i = 0; i < (mainData['ID_Internal']).length; i++) colours.push(`rgba(${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, 1)`);
            data[0]['marker'] = { color: colours }
            break;
    }
    if(plotType != "pie") layout['title'] = title;
    var config = {
        responsive: true
    }
    Plotly.newPlot('plotField', data, layout, config);
}