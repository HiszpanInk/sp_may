//mainData pochodzi z tabeli anime, additionalData to dane z innych tabel które mają nazwy rzeczy które są w tabelce anime jako klucz obcy
function generatePlot(mainData, additionalData) {
    let compareBy = document.getElementById('compareBy').value;
    let plotType = document.getElementById('plotType').value;
    let orderBy = document.getElementById('orderType').value;
    console.log(mainData);
    console.log(additionalData);
    var data = [
        {
          x: mainData['Title'],
          y: mainData[compareBy],
          type: 'bar'
        }
      ];
    Plotly.newPlot('plotField', data);
}