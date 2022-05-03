const hostname = '127.0.0.1';
const port = 3000;

const http = require('http');
const path = require('path');
const express = require('express')
const fetch = require('node-fetch');

const util = require("util"); 

const app = express()

var { Liquid } = require('liquidjs');
var engine = new Liquid({
  root: path.resolve(__dirname, 'views/'),  // root for layouts/includes lookup
  extname: '.liquid'          // used for layouts/includes, defaults ""
});
// register liquid engine
app.engine('liquid', engine.express()); 
app.set('views', './views');            // specify the views directory
app.set('view engine', 'liquid'); 
app.use(express.static(path.join(__dirname, 'public')));




var mysql = require('mysql');
const { stat } = require('fs');

var db_con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "p_mal_v"
});

db_con.connect((err) => {
  if(err){
      throw err;
  }
  console.log('MySQL Connection established');
});
// DZIĘKUJĘ TEMU PANU https://medium.com/fullstackwebdev/a-guide-to-mysql-with-node-js-fc4f6abce33b
db_con.query = util.promisify(db_con.query).bind(db_con);


//kod zarąbany z: https://dmitripavlutin.com/timeout-fetch-request/
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}


async function searchAnime(searchQuery) {
  let max_search_results = 10;
  //const response = await fetch(`https://api.jikan.moe/v4/anime?page=1&q=${searchQuery}&limit=${max_search_results}`)
  try {
    const response = await fetchWithTimeout(`https://api.jikan.moe/v4/anime?page=1&q=${searchQuery}&limit=${max_search_results}`, {
      timeout: 6000
    });
    const data = await response.json();
    return data;
  } catch (error) {
    // Timeouts if the request takes longer than specified ammount of time
    //console.log(error.name === 'AbortError');
    return "API 'Jikan' nie odpowiada.";
  }
}

//to jest funkcja potrzebna przy tych tabelkach w następnej funckji
//służy do znajdywania w tabelach status, type i season odpowiednich nazw po polsku
async function getFieldTranslationForTable(table, value) {
    var data = await db_con.query(`SELECT Name_PL FROM ${table} WHERE Name="${value}"`);
    if(!data || data.length == 0) {
      data = "Nie podano";
      return data;
    } else {
      console.log(data);
      data = data[0]["Name_PL"];

      console.log(data);
      if(typeof data !== 'string') {
        data = "Brak danych";
        console.log("[ERROR] MySQL database is not responsing or is not responding correctly (maybe this part of program is written badly)")
      }
      return data;
    }
    
}
async function createSearchResultsTable(searchResultsData) {
  let html_table = "";

  html_table += '<table class="table table-bordered">';


  html_table += '<thead class="thead-dark"><tr>';

  html_table += "<th>Grafika</th>";
  html_table += "<th>Tytuł</th>";
  html_table += "<th>Status</th>";
  html_table += "<th>Średnia ocena</th>";
  html_table += "<th>Liczba widzów</th>";
  html_table += "<th>Liczba odcinków</th>";
  html_table += "<th>Typ</th>";
  html_table += "<th>Sezon</th>";
  html_table += "<th>Gatunek</th>";
  html_table += "<th>Akcje</th>";

  html_table += "</thead></tr>";
  
  for (const [key, value] of Object.entries(searchResultsData)) {
    var status_name = await getFieldTranslationForTable("status", value['status']);
    var type_name = await getFieldTranslationForTable("type", value['type']);
    var season_name = `${value['year']} - ${await getFieldTranslationForTable("season", value['season'])}`;

    html_table += `<tr>`;

    html_table += `<td><img src='${value['images']['jpg']}' alt='Grafika dla tytułu ${value['title']}'></td>`;
    html_table += `<td>${value['title']}</td>`;
    html_table += `<td>${status_name}</td>`;
    html_table += `<td>${value['score']}</td>`;
    html_table += `<td>${value['members']}</td>`;
    html_table += `<td>${value['episodes']}</td>`;
    html_table += `<td>${type_name}</td>`;
    html_table += `<td>${season_name}</td>`;
    html_table += `<td>${value['genres']}</td>`;
    html_table += `<td><form method="GET" action="/addAnime"><br><button type="submit" value="${value["mal_id"]}" class="btn btn-secondary">${value['title']}</button><br><br><a href="https://myanimelist.net/anime/${value["mal_id"]}" target="_blank"><button>Link do MALa</button></a></td>`;
    
    html_table += `</tr>`;
  }
  html_table += "</table>";

  return html_table;
}

app.get('/', function (req, res) {
  res.send('Hello World');
})

app.get('/searchAnime', async function (req, res) {
  if (typeof req.query.searchQuery !== 'undefined') {
    // the variable is defined, generowanie strony jak ktoś zrobił zapytanie
    let api_request_response = await searchAnime(req.query.searchQuery);
    //sprawdzamy czy zmienna jest tablicą, jeśli ją nie jest to sprawdzamy czy jest stringiem bo jeśli jest to wystąpił błąd
    if(typeof api_request_response == 'object') {
      if(Object.values(api_request_response)[1] !== 'HttpException') {
        //i tutaj trzeba będzie przerobić te dane na tabelkę do HTMLa i tym się będzie zajmowała funkcja createSearchResultsTable
        let paragraph_content = createSearchResultsTable(Object.values(api_request_response["data"]));
        
        res.render('db_default_view', {subsite_title: `Wyniki wyszukiwania dla frazy "${req.query.searchQuery}"`, paragraph_content: paragraph_content});
      } else if (Object.values(api_request_response)[1] == 'HttpException')
      //błąd typu 404 
        res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: `Wystąpił błąd typu HTTP przy próbie zapytania do API. Kod błędu: ${Object.values(api_request_response)[0]}`});
    } else {
      //nieznany błąd
      let paragraph_content = "Wystąpił nieznany błąd przy próbie wystosowania zapytania do API. Możliwe iż jest ono niedostępne w tym momencie."
      res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: paragraph_content});
    }

  } else {
    //generowanie strony jak ktoś chce wyszukać sobie przy pomocy tej strony 
    //(bo do tej strony można przekierować będzie ze strony głównej bo tam zrobię jakiś )
    let paragraph_content = '<form method="GET" action="/searchAnime"><input class="form-control" name="search_content" type="text" style="width: 20%" placeholder="Search"><br><input type="submit" value="Szukaj" class="btn btn-secondary"></form>'
    res.render('db_default_view', {subsite_title: 'Szukaj tytułu', paragraph_content: paragraph_content});
  }
})

app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);