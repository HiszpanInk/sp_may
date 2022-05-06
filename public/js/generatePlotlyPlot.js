function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
function selectElement(id, valueToSelect) {    
    let element = document.getElementById(id);
    element.value = valueToSelect;
}
function checkForYearRangeConflict(min, max) {
    if(isNaN(min) && isNaN(max)) {
        return false;
    } else if((isNaN(min)) && (max != null || max != 0 || max != "")) {
        return true;
    } else if((isNaN(max)) && (min != null || min != 0 || min != "")) {
        return true;
    } else if (min < max) {
        return true;
    } else {
        return false;
    }
}
function ratingCheckbox() {
    if(document.getElementById("compareBy").value == 'Avg_Rating') { 
        document.getElementById('additionalCheckboxSection').innerHTML = '<input class="form-check-input" type="checkbox" style="margin-right: 5px;" id="checkboxAverageRating" checked><label class="form-check-label" for="checkboxAverageRating"> Ograniczyć dolny zakres?</label>';
    } else {
        document.getElementById('additionalCheckboxSection').innerHTML = "";
    }
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
            break;
    }
}
//mainData pochodzi z tabeli anime, additionalData to dane z innych tabel które mają nazwy rzeczy które są w tabelce anime jako klucz obcy
//żeby używać additionalData trzebaby odkomentować 4 linijki w app.js tak żeby zaciągało dane z tamtych tabel
function generatePlot(mainData, additionalData) {
    let mainDataCopy = JSON.parse(JSON.stringify(mainData));
    let compareBy = document.getElementById('compareBy').value;
    let plotType = document.getElementById('plotType').value;
    let orderBy = document.getElementById('orderType').value;
    let colouringType = document.getElementById('colouringType').value;
    let itemsNum = (mainDataCopy['ID_Internal']).length;
    let data;
    let layout;
    let primaryAxis;
    let secondaryAxis;

    let avgRating_CutRange;
    if(document.getElementById('additionalCheckboxSection').innerHTML != "") {
        console.log(document.getElementById('checkboxAverageRating').checked);
        if(document.getElementById('checkboxAverageRating').checked == true) {
            avgRating_CutRange = true;
        }
    
    }


    //część odpowiedzialna za filtry
    let title_filter = "";
    let filterYearRangeMin = parseInt(document.getElementById('filterYearRangeMin').value);
    let filterYearRangeMax = parseInt(document.getElementById('filterYearRangeMax').value);
    if(checkForYearRangeConflict(filterYearRangeMin, filterYearRangeMax)) {
        let toClearList = [];
        title_filter = " emitowanego w latach";
        if((filterYearRangeMin != null || filterYearRangeMin != "") && (filterYearRangeMin >= 1850)) {
            for (let i = 0; i < itemsNum; i++) {
                if(Number(mainDataCopy['Year_Broadcast'][i]) < Number(filterYearRangeMin)) {        
                    toClearList.push(i);
                }
            }
            title_filter += ` od ${filterYearRangeMin}`;
        }
        for (const toClear of toClearList) {
            for (const [key, value] of Object.entries(mainDataCopy)) {
                delete value[toClear];
            }
        }
        toClearList = [];
        if((filterYearRangeMax != null || filterYearRangeMax != "") && (filterYearRangeMax <= 2200)) {
            for (let i = 0; i < itemsNum; i++) {
                if(Number(mainDataCopy['Year_Broadcast'][i]) > Number(filterYearRangeMax)) {        
                    toClearList.push(i);
                }
            }
            title_filter += ` do ${filterYearRangeMax}`;
        }
        for (const toClear of toClearList) {
            for (const [key, value] of Object.entries(mainDataCopy)) {
                delete value[toClear];
            }
        }
    }
    
    let title = null;
    switch(plotType) {
        case "bar":
            primaryAxis = "x";
            secondaryAxis = "y";
            data = [
                {
                  x: mainDataCopy['Title'],
                  y: mainDataCopy[compareBy],
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
                  y: mainDataCopy['Title'],
                  x: mainDataCopy[compareBy],
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
            let years = mainDataCopy['Year_Broadcast'];
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
            let minRange = 0;
            if(avgRating_CutRange == true) {
                //bierzemy minimalną wartość, zaokrąglamy ją w dół i obniżamy o jeden
                minRange = Math.ceil(Math.min.apply(Math, Object.values(mainDataCopy['Avg_Rating']))) - 1;
                //jeżeli wartość wyżej będzie poniżej 0 (co raczej nie wystąpi ale na wszelki wypadek)
                //to wtedy ustawiamy dolny zakres na 0
                if(minRange < 0) minRange = 0;
            }
            
            layout[`${secondaryAxis}axis`]['range'] = [minRange, 10];
            title = "Średnia ocena"
            break;
        case "Viewers_Count":
            title = "Ilość widzów"
            break;
        case "Episodes_Count":
            title = "Ilość odcinków"
            break;
        case "Year_Broadcast":
            title = "Rok emisji"
            break;
    
    }
    title += " dla każdej serii anime z bazy danych";
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
            for (let i = 0; i < (mainDataCopy['ID_Internal']).length; i++) colours.push(`rgba(${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, 1)`);
            data[0]['marker'] = { color: colours }
            break;
    }
    title += title_filter;
    if(plotType != "pie") layout['title'] = title;
    var config = {
        responsive: true
    }
    Plotly.newPlot('plotField', data, layout, config);
}