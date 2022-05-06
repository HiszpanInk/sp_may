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
            selectElement("orderType", "default");
            document.getElementById("orderType").disabled = true;
            document.getElementById("colouringType").disabled = true;
            document.getElementById("filterYearRangeMin").disabled = true;
            document.getElementById("filterYearRangeMax").disabled = true;
            document.getElementById("filterYearRangeMin").value = "";
            document.getElementById("filterYearRangeMax").value = "";
            selectElement("compareBy", "Year_Broadcast");
            selectElement("colouringType", "default");
            document.getElementById("compareBy").disabled = true;
            break;
        default:
            document.getElementById("filterYearRangeMin").disabled = false;
            document.getElementById("filterYearRangeMax").disabled = false;
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
    let mainDataItemsCount = (mainDataCopy['ID_Internal']).length;
    for (let i = 0; i < mainDataItemsCount; i++) {
        if(mainDataCopy['Avg_Rating'][i] == null) {
            mainDataCopy['Avg_Rating'][i] = 0;
        }
        if(mainDataCopy['Episodes_Count'][i] == null) {
            mainDataCopy['Episodes_Count'][i] = 0;
        }
        if(mainDataCopy['Viewers_Count'][i] == null) {
            mainDataCopy['Viewers_Count'][i] = 0;
        }
        if(mainDataCopy['Year_Broadcast'][i] == null) {
            mainDataCopy['Year_Broadcast'][i] = 0;
        }
    }

    let compareBy = document.getElementById('compareBy').value;
    let plotType = document.getElementById('plotType').value;
    let orderBy = document.getElementById('orderType').value;
    let colouringType = document.getElementById('colouringType').value;
    let itemsNum = (mainDataCopy['ID_Internal']).length;

    let data = [
        {
            title: null,
            y: null,
            x: null
        }
    ];
    let layout = {
        title: null,
        automargin: true,
        margin: {
            b: null
        },
        yaxis: {
            range: Array(),
            categoryorder: 'trace'
        },   
        xaxis: {
            range: Array(),
            categoryorder: 'trace'
        }
    };

    let primaryAxis;
    let dataAxis;
    let avgRating_CutRange;

    if(document.getElementById('additionalCheckboxSection').innerHTML != "") {
        if(document.getElementById('checkboxAverageRating').checked == true) {
            avgRating_CutRange = true;
        }
    
    }
    
    let title = null;
    switch(plotType) {
        case "bar":
            primaryAxis = "x";
            dataAxis = "y";
            data = [
                {
                    x: mainDataCopy['Title'],
                    y: mainDataCopy[compareBy],
                    type: 'bar',
                    marker: { 
                        color: null 
                    }
                }
            ];
            layout['margin']['b'] = 250;
            layout['xaxis']['ticks'] = "outside";
            layout['xaxis']['ticklen'] = 10;
            break;
        case "bar-vertical":
            primaryAxis = "y";
            dataAxis = "x";
            data = [
                {
                    y: mainDataCopy['Title'],
                    x: mainDataCopy[compareBy],
                    orientation: 'h',
                    type: 'bar',
                    marker: { 
                        color: null 
                    }
                }
            ];
            layout['margin']['l'] = 350;
            layout['xaxis']['ticks'] = "outside";
            layout['xaxis']['ticklen'] = 10;
            break;
        case "pie":
            let years = mainDataCopy['Year_Broadcast'];
            let years_counts = {};

            for (const num of years) {
                years_counts[num] = years_counts[num] ? years_counts[num] + 1 : 1;
            }
            primaryAxis = "x";
            dataAxis = "y";
            data = [{
                values: Object.values(years_counts),
                labels: Object.keys(years_counts),
                type: 'pie',
                marker: { 
                    color: null 
                }
            }];
            layout = {
                title: 'Ilość anime w bazie danych zagregowane według daty produkcji',
                automargin: true,
                margin: {b: 100}
            };
            break;
    }
    //część odpowiedzialna za filtry
    let title_filter = "";
    let filterYearRangeMin = parseInt(document.getElementById('filterYearRangeMin').value);
    let filterYearRangeMax = parseInt(document.getElementById('filterYearRangeMax').value);
    if(checkForYearRangeConflict(filterYearRangeMin, filterYearRangeMax)) {
        let toClearList = [];
        title_filter = " emitowanej";
        if((filterYearRangeMin != null || filterYearRangeMin != "") && (filterYearRangeMin >= 1850)) {
            for (let i = 0; i < itemsNum; i++) {
                if(Number(mainDataCopy['Year_Broadcast'][i]) < Number(filterYearRangeMin)) {        
                    toClearList.push(i);
                }
            }
            title_filter += ` od roku ${filterYearRangeMin}`;
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
            title_filter += ` do roku ${filterYearRangeMax}`;
        }
        for (const toClear of toClearList) {
            for (const [key, value] of Object.entries(mainDataCopy)) {
                delete value[toClear];
            }
        }
    }
    switch(compareBy) {
        case "Avg_Rating":
            let minRange = 0;
            if(avgRating_CutRange == true) {
                //bierzemy minimalną wartość, zaokrąglamy ją w dół i obniżamy o jeden
                minRange = Math.ceil(Math.min.apply(Math, Object.values(mainDataCopy['Avg_Rating']))) - 2;
                //jeżeli wartość wyżej będzie poniżej 0 (co raczej nie wystąpi ale na wszelki wypadek)
                //to wtedy ustawiamy dolny zakres na 0
                if(minRange < 0) minRange = 0;
            }
            
            layout[`${dataAxis}axis`]['range'] = [minRange, 10];
            title = "Średnia ocena";
            break;
        case "Viewers_Count":
            title = "Ilość widzów";
            break;
        case "Episodes_Count":
            title = "Ilość odcinków";
            break;
        case "Year_Broadcast":
            title = "Rok emisji";
            break;
    }
    title += " dla każdej serii anime z bazy danych";

    
    let dataAxisData = {};
    let first;
    let second;
    let sortingLength;
    let title_order = "";
    
    if(plotType == "bar-vertical") {
        layout[`${primaryAxis}axis`]['autorange'] = 'reversed';
    }
    switch(colouringType) {
        case "colourful":
            var colours = []; 
            for (let i = 0; i < (data[0]['x']).length; i++) colours.push(`rgba(${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, ${getRandomInt(3, 250)}, 1)`);
            data[0]['marker']['color'] = colours;
            break;
    }

    if(plotType != "pie") layout['title'] = title;
    var config = {
        responsive: true
    }  
    title += title_filter;
    title += title_order;
    
    switch(orderBy) {
        case "ascending":
            first = [...(data[0][dataAxis])];
            second = [...(data[0][primaryAxis])];
            sortingLength = first.length;
            for (let i = 0; i < sortingLength; i++) {
                dataAxisData[`${second[i]}`] = first[i];
            }
            //dataAxisData = (data[0][dataAxis]).entries();
            dataAxisData = Object.fromEntries(
                Object.entries(dataAxisData).sort(([,a],[,b]) => a-b)
            );
            
            data[0][dataAxis] = Object.values(dataAxisData); 
            data[0][primaryAxis] = Object.keys(dataAxisData); 

            title_order = "<br>Dane uporządkowane rosnąco";
            break;
        case "descending":
            first = [...(data[0][dataAxis])];
            second = [...(data[0][primaryAxis])];
            sortingLength = first.length;
            for (let i = 0; i < sortingLength; i++) {
                dataAxisData[`${second[i]}`] = first[i];
            }
            //dataAxisData = (data[0][dataAxis]).entries();
            dataAxisData = Object.fromEntries(
                Object.entries(dataAxisData).sort(([,a],[,b]) => a-b)
            );
            
            data[0][dataAxis] = (Object.values(dataAxisData)).reverse(); 
            data[0][primaryAxis] = (Object.keys(dataAxisData)).reverse(); 

            title_order = "<br>Dane uporządkowane malejąco";
            break;
    }
    if(plotType != "pie") {
        for (let i = 0; i < (data[0]['x']).length; i++) {
            if(data[0]['x'][i] == 'undefined' || typeof data[0]['x'][i] == 'undefined') {
                (data[0]['x']).splice(i, 1);
            }
        }
    
        for (let i = 0; i < (data[0]['y']).length; i++) {
            if(data[0]['y'][i] == 'undefined' || typeof data[0]['y'][i] == 'undefined') {
                (data[0]['y']).splice(i, 1);
            }
        }
    }
    switch(orderBy) {
        case "ascending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total ascending';
            break;
        case "descending":
            layout[`${primaryAxis}axis`]['categoryorder'] = 'total descending';
            break;
    }
    console.log(data);
    Plotly.newPlot('plotField', data, layout, config);
}