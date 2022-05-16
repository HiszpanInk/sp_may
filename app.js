const hostname = '127.0.0.1';
const port = 3000;

const http = require('http');
const path = require('path');
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const util = require("util"); 
const bcrypt = require('bcrypt');

//https://www.npmjs.com/package/table-sort-js
const app = express()
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
  cookie: {
    loggedin: false
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


var mysql = require('mysql');
const { stat } = require('fs');

//I don't set passwords here only because it is a school project

var db_con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "p_mal_v"
});


var db_con_loginSys = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "p_mal_v_login"
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


async function searchAnime(searchQuery, searchResultsMaxNum, sortBy, sortMethod, filterByAiring) {
  let max_search_results = 15;
  if(typeof searchResultsMaxNum != "undefined") max_search_results = searchResultsMaxNum;
  let searchURL = `https://api.jikan.moe/v4/anime?page=1&q=${searchQuery}&limit=${max_search_results}`;

  if(sortBy != "" && typeof sortBy != "undefined" && sortMethod != "" && typeof sortMethod != "undefined") searchURL = `https://api.jikan.moe/v4/anime?page=1&q=${searchQuery}&limit=${max_search_results}&order_by=${sortBy}&sort=${sortMethod}`;
  if(filterByAiring != "" && typeof filterByAiring != "undefined") searchURL += `&status=${filterByAiring}`;
  try {
    const response = await fetchWithTimeout(searchURL, {
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

async function getAnimeDataById(animeID) {
  try {
    const response = await fetchWithTimeout(`https://api.jikan.moe/v4/anime/${animeID}`, {
      timeout: 6000
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return "API 'Jikan' nie odpowiada.";
  }
}




//to jest funkcja potrzebna przy tych tabelkach w następnej funckji
//służy do znajdywania w tabelach status, type i season odpowiednich nazw po polsku
async function getInternalIDByName(table, value) {
  var data = await db_con.query("SELECT ID FROM ?? WHERE `Name`=?", [ table, value ]);
  if(!data || data.length == 0 || data == null) {
    if(value != "Nie podano" && value != null) console.log(`Brakująca wartość w tabeli ${table}:${value}`);
    data = "";
    return data;
  } else {
    data = data[0]["ID"];
    if(typeof data !== 'string' && typeof data !== 'number') {
      data = "";
      console.log("[ERROR] MySQL database is not responsing or is not responding correctly (maybe this part of program is written badly)")
    }
    return data;
  }
}

async function addAnimeToInternalDB(data) {
  //najpierw należy sprawdzić czy tej serii nie ma już w bazie danych
  var checkAnimeExists = await db_con.query("SELECT ID_Internal FROM anime WHERE ID_MAL=?", [ data['mal_id'] ]);
  if(typeof checkAnimeExists[0] == "undefined") {
    let required_data = {
      'title' : data['title'], 
      'mal_id' : data['mal_id'], 
      'status' : data['status'], 
      'season' : data['season'], 
      'image' : data['images']['jpg']['image_url'], 
      'type' : data['type'], 
      'score' : data['score'], 
      'members' : data['members'], 
      'episodes' : data['episodes'], 
      'year' : data['year'], 
      'genre' : data['genres']
    };
    //trzeba ID znaleźć z tabelek genre, season, type, status
    if(required_data['season'] != "" || typeof required_data['season'] != "undefined" || required_data['season'] != null) required_data['season'] = await getInternalIDByName('season', required_data['season']);
    if(required_data['type'] != "" || typeof required_data['type'] != "undefined" || required_data['type'] != null) required_data['type'] = await getInternalIDByName('type', required_data['type']);
    if(required_data['status'] != "" || typeof required_data['status'] != "undefined" || required_data['status'] != null) required_data['status'] = await getInternalIDByName('status', required_data['status']);
  
    if(typeof required_data['genre'] == "undefined" || required_data['genre'] == null || Object.keys(required_data['genre']).length == 0) {
      required_data['genre'] = "";
    } else {
      required_data['genre'] = required_data['genre'][0]['name'];
      required_data['genre'] = await getInternalIDByName("genre", required_data['genre']);
    }  
      
  
    if(required_data['year'] == null || required_data['year'] == "") {
      var newValue_year = (data['aired']['from']).substring(0, 4);
      if(typeof newValue_year != "undefined" && newValue_year != null) {
        required_data['year'] = newValue_year;
      }
    }
  
    if(typeof required_data['status'] == "undefined" || required_data['status'] == null) required_data['score'] = "";
  
    for (const [key, value] of Object.entries(required_data)) {
      if(required_data[key] == "" || required_data[key] == null) {
        required_data[key] = "NULL";
      } else if (value != "") {
        required_data[key] = `'${required_data[key]}'`;
      }
    }
    //console.log(`INSERT INTO anime(ID_MAL, Title, Status_ID, Avg_Rating, Viewers_Count, Episodes_Count, Year_Broadcast, Season, Type, Genre, Image_URL) VALUES (${required_data['mal_id']},${required_data['title']},${required_data['status']},${required_data['score']},${required_data['members']},${required_data['episodes']},${required_data['year']},${required_data['season']},${required_data['type']},${required_data['genre']},${required_data['image']})`);
    await db_con.query("INSERT INTO anime (ID_MAL, Title, Status_ID, Avg_Rating, Viewers_Count, Episodes_Count, Year_Broadcast, Season, Type, Genre, Image_URL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ required_data['mal_id'], required_data['title'], required_data['status'], required_data['score'], required_data['members'], required_data['episodes'], required_data['year'], required_data['season'], required_data['type'], required_data['genre'], required_data['image']]);
    return "";
  } else {
    //to anime jest już u nas w bazie
    return [data['title'], "this anime already exists in database!"]
  }
}


async function removeAnimeFromInternalDB(animeInternalID) {
  await db_con.query("DELETE FROM `anime` WHERE `ID_Internal`=?", [animeInternalID]);
}

//to jest funkcja potrzebna przy tych tabelkach w następnej funckji
//służy do znajdywania w tabelach status, type i season odpowiednich nazw po polsku
//table - tabelka, value - wartość po której szukamy, searchBy - kolumna po której szukamy
async function getFieldTranslationForTable(table, searchBy, value) {
  var data = await db_con.query("SELECT Name_PL FROM ?? WHERE ??=?", [ table, searchBy, value]);
  //var data = await db_con.query(`SELECT Name_PL FROM ${table} WHERE ${searchBy}="${value}"`);
  if(!data || data.length == 0 || data == null) {
    if(value != "Nie podano" && value != null) console.log(`Brakująca wartość w tabeli ${table}:${value}`);
    return data;
  } else {
    data = data[0]["Name_PL"];
    if(typeof data !== 'string') {
      data = "Brak danych";
      console.log("[ERROR] MySQL database is not responsing or is not responding correctly (maybe this part of program is written badly)")
    }
    return data;
  }
}
async function createSearchResultsTable(searchResultsData) {
  let html_table = "";

  html_table += '<table class="table-sort remember-sort table table-bordered table-arrows">';


  html_table += '<thead class="thead-dark"><tr>';

  html_table += `<th class="data-sort">Grafika</th>`;
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
  let index = 1;
  for (const [key, value] of Object.entries(searchResultsData)) {
    let required_data = {
      'title' : value['title'], 
      'mal_id' : value['mal_id'], 
      'status' : value['status'], 
      'season' : value['season'], 
      'image' : value['images']['jpg']['image_url'], 
      'type' : value['type'], 
      'score' : value['score'], 
      'members' : value['members'], 
      'episodes' : value['episodes'], 
      'year' : value['year'], 
      'genre' : value['genres']
    };
    var genre = "";
    if(typeof required_data['genre'] == "undefined" || required_data['genre'] == null || Object.keys(required_data['genre']).length == 0) {
      genre = "Nie podano";
    } else {
      required_data['genre'] = required_data['genre'][0]['name'];
      genre = await getFieldTranslationForTable("genre", "Name", required_data['genre']);
    }  
    

    if(required_data['year'] == null || required_data['year'] == "") {
      var newValue_year = "";
      if(value['aired']['from'] == null || value['aired']['from'] == "" || value['aired'] == null || value['aired'] == "") {
        newValue_year = "Nie podano";
      } else {
        newValue_year = (value['aired']['from']).substring(0, 4);
      }
      if(typeof newValue_year != "undefined" && newValue_year != null) {
        required_data['year'] = newValue_year;
      }
    }
    for (const [key, value] of Object.entries(required_data)) {
      if(value == null || value == "") {
        required_data[key] = "Nie podano";
      }
    }

    var status_name = await getFieldTranslationForTable("status", "Name", required_data['status']);
    var type_name = await getFieldTranslationForTable("type", "Name", required_data['type']);

    var year_season_name = "";
    var season_name = await getFieldTranslationForTable("season", "Name", required_data['season']);

    //yes, this part is messy and stupid but I don't really have time for perfectionism, so if it works - great!
    if ((!season_name || season_name.length == 0 || season_name == null || season_name == "") && (!required_data['year'] || required_data['year'].length == 0 || required_data['year'] == null || required_data['year'] == "")) {
      year_season_name = "Brak danych";
    } else {
      if(!season_name || season_name.length == 0 || season_name == null || season_name == "") {
        year_season_name = `${required_data['year']}`;
      } else if (!required_data['year'] || required_data['year'].length == 0 || required_data['year'] == null || required_data['year'] == "") {
        year_season_name = `${season_name}`;
      } else {
        year_season_name = `${required_data['year']} - ${season_name}`;
      }
    }

    html_table += `<tr>`;

    html_table += `<td data-sort="${index}"><img src='${required_data['image']}' alt='Grafika dla tytułu ${required_data['title']}'></td>`;
    html_table += `<td>${required_data['title']}</td>`;
    html_table += `<td>${status_name}</td>`;
    html_table += `<td>${required_data['score']}</td>`;
    html_table += `<td>${required_data['members']}</td>`;
    html_table += `<td>${required_data['episodes']}</td>`;
    html_table += `<td>${type_name}</td>`;
    html_table += `<td>${year_season_name}</td>`;
    html_table += `<td>${genre}</td>`;
    html_table += `<td><form method="GET" action="/addAnime"><button type="submit" value="${required_data["mal_id"]}" name="anime_mal_id" class="btn btn-secondary">Dodaj do bazy danych</button></form><br><br><a href="https://myanimelist.net/anime/${required_data["mal_id"]}" target="_blank"><button class="btn btn-secondary">Link do MALa</button></a></td>`;
    
    html_table += `</tr>`;
    index = index + 1;
  }
  html_table += "</table>";
  //dodanie możliwości sortowania tabelki
  return html_table;
}


async function createSearchResultsTableFromInternalDB() {
  let data = await db_con.query("SELECT * FROM anime;");
  let html_table = "";

  html_table += '<table class="table table-bordered table-sort remember-sort table-bordered table-arrows">';


  html_table += '<thead class="thead-dark"><tr>';

  html_table += `<th class="data-sort">Grafika</th>`;
  html_table += "<th>Tytuł</th>";
  html_table += '<th>Status</th>';
  html_table += '<th>Średnia ocena</th>';
  html_table += '<th>Liczba widzów</th>';
  html_table += '<th>Liczba odcinków</th>';
  html_table += "<th>Typ</th>";
  html_table += '<th class="th-sm">Sezon</th>';
  html_table += "<th>Gatunek</th>";
  html_table += "<th>Akcje</th>";

  html_table += "</thead></tr>";
  
 
  for (const [key, value] of Object.entries(data)) {
    let required_data = {
      'internal_id' : value['ID_Internal'], 
      'mal_id' : value['ID_MAL'], 
      'title' : value['Title'],
      'status' : value['Status_ID'], //fk
      'season' : value['Season'], //fk
      'image' : value['Image_URL'], 
      'type' : value['Type'], //fk
      'score' : value['Avg_Rating'], 
      'members' : value['Viewers_Count'], 
      'episodes' : value['Episodes_Count'], 
      'year' : value['Year_Broadcast'], 
      'genre' : value['Genre'] //fk
    };
    var genre = "";
    if(typeof required_data['genre'] != "undefined" && required_data['genre'] != null && Object.keys(required_data['genre']).length == 0) genre = await getFieldTranslationForTable("genre", "ID", required_data['genre']);

    var status_name = await getFieldTranslationForTable("status", "ID", required_data['status']);
    var type_name = await getFieldTranslationForTable("type", "ID", required_data['type']);

    var year_season_name = "";
    var season_name = await getFieldTranslationForTable("season", "ID", required_data['season']);

    //yes, this part is messy and stupid but I don't really have time for perfectionism, so if it works - great!
    if ((!season_name || season_name.length == 0 || season_name == null || season_name == "") && (!required_data['year'] || required_data['year'].length == 0 || required_data['year'] == null || required_data['year'] == "")) {
      year_season_name = "Brak danych";
    } else {
      if(!season_name || season_name.length == 0 || season_name == null || season_name == "") {
        year_season_name = `${required_data['year']}`;
      } else if (!required_data['year'] || required_data['year'].length == 0 || required_data['year'] == null || required_data['year'] == "") {
        year_season_name = `${season_name}`;
      } else {
        year_season_name = `${required_data['year']} - ${season_name}`;
      }
    }
    for (const [key, value] of Object.entries(required_data)) {
      if(value == null || value == "") {
        required_data[key] = "Nie podano";
      }
    }

    html_table += `<tr>`;

    html_table += `<td data-sort="${required_data["internal_id"]}"><img src='${required_data['image']}' alt='Grafika dla tytułu ${required_data['title']}'></td>`;
    html_table += `<td>${required_data['title']}</td>`;
    html_table += `<td>${status_name}</td>`;
    html_table += `<td>${required_data['score']}</td>`;
    html_table += `<td>${required_data['members']}</td>`;
    html_table += `<td>${required_data['episodes']}</td>`;
    html_table += `<td>${type_name}</td>`;
    html_table += `<td>${year_season_name}</td>`;
    html_table += `<td>${genre}</td>`;
    html_table += `<td><form method="GET" action="/removeAnime"><button type="submit" value="${required_data["internal_id"]}" name="anime_internal_id" class="btn btn-secondary">Usuń z bazy danych</button></form><br><br><a href="https://myanimelist.net/anime/${required_data["mal_id"]}" target="_blank"><button class="btn btn-secondary">Link do MALa</button></a></td>`;
    
    html_table += `</tr>`; 
  }
 
  html_table += "</table>";
  return html_table;
}

async function refreshStatisticsInInternalDB() {
  let anime_mal_id_list = await db_con.query("SELECT ID_Internal, ID_MAL FROM anime");
  let ifErrorOccurred = false;
  await sleep(500);
  for (const [key, value] of Object.entries(anime_mal_id_list)) {
    let id_data_set = [key, value][1];
    let anime_MAL_updated_data = "";
    try {
      const response = await fetchWithTimeout(`https://api.jikan.moe/v4/anime/${id_data_set['ID_MAL']}`, {timeout: 6000});
      const data = await response.json();
      anime_MAL_updated_data = data;
    } catch (error) {
      anime_MAL_updated_data = "API 'Jikan' nie odpowiada.";
      ifErrorOccurred = true;
    }
    if(ifErrorOccurred == true) {
      break;
    }
    let required_data = {
      Avg_Rating : null,
      Viewers_Count : null,
      Episodes_Count : null,
      Status_ID : null
    };
    if(typeof anime_MAL_updated_data['data']['score'] != "undefined") required_data['Avg_Rating'] = anime_MAL_updated_data['data']['score'];
    if(typeof anime_MAL_updated_data['data']['members'] != "undefined") required_data['Viewers_Count'] = anime_MAL_updated_data['data']['members'];
    if(typeof anime_MAL_updated_data['data']['episodes'] != "undefined") required_data['Episodes_Count'] = anime_MAL_updated_data['data']['episodes'];
    if(typeof anime_MAL_updated_data['data']['status'] != "undefined") required_data['Status_ID'] = anime_MAL_updated_data['data']['status'];
    required_data['Status_ID'] = await getInternalIDByName("status", required_data['Status_ID']);

    for (const [key, value] of Object.entries(required_data)) {
      if(value == null || value == "") {
        required_data[key] = "NULL";
      } else {
        required_data[key] = `'${required_data[key]}'`;
      }
    }
    //await db_con.query(`UPDATE anime SET Avg_Rating=${required_data['Avg_Rating']}, Viewers_Count=${required_data['Viewers_Count']}, Episodes_Count=${required_data['Episodes_Count']}, Status_ID=${required_data['Status_ID']} WHERE ID_Internal=${id_data_set['ID_Internal']}`);
    await db_con.query("UPDATE anime SET `Avg_Rating`=?, `Viewers_Count`=?, `Episodes_Count`=?, `Status_ID`=? WHERE `ID_Internal`=?", [ required_data['Avg_Rating'], required_data['Viewers_Count'], required_data['Episodes_Count'], required_data['Status_ID'], id_data_set['ID_Internal'] ]);
    await sleep(1000);
  }
}

function ConvertInternalDB_Data_ForPlot(SQL_Data) {
  finalData = {
    Title: [],//dane do osi x
    Avg_Rating: [], //dane główne
    Viewers_Count: [], //dane główne
    Episodes_Count: [], //dane główne
    Year_Broadcast: [], //dane główne
    Genre: [], //filtry
    Status_ID: [], //filtry
    Type: [], //filtry
    ID_Internal: [] //dane pomocnicze
  }
  let entry;
  let entryIndex;
  for (const [key, value] of Object.entries(SQL_Data)) {
    entryIndex = [key, value][0];
    entry = [key, value][1];
  
    finalData['Title'][entryIndex] = entry['Title'];
    finalData['Avg_Rating'][entryIndex] = entry['Avg_Rating'];
    finalData['Viewers_Count'][entryIndex] = entry['Viewers_Count'];
    finalData['Episodes_Count'][entryIndex] = entry['Episodes_Count'];
    finalData['Genre'][entryIndex] = entry['Genre'];
    finalData['Year_Broadcast'][entryIndex] = entry['Year_Broadcast'];
    finalData['Status_ID'][entryIndex] = entry['Status_ID'];
    finalData['Type'][entryIndex] = entry['Type'];
    finalData['ID_Internal'][entryIndex] = entry['ID_Internal'];
  }
  return finalData;
}
























app.get('/login_page', function (req, res) {
  if(typeof req.query.comm != 'undefined') {
    let popup_communicate = "Wstąpił nieznany błąd";
    let popup_type = "";
    switch(req.query.comm) {
      case "notLoggedIn":
        popup_communicate = "Musisz się zalogować!";
        popup_type = "Błąd!";
        break;
      case "registered":
        popup_type = "Informacja"
        popup_communicate = "Rejestracja powiodła się. Możesz się teraz zalogować";
        break;
      case "loggedOut":
        popup_type = "Informacja"
        popup_communicate = "Wylogowano.";
        break;
    }
    let popup_content = `<div class="py-2">
      <div class="modal" id="test">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">${popup_type}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <p>${popup_communicate}</p>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                  </div>
              </div>
          </div>
      </div>
      </div>
      <script>
      var myModal = new bootstrap.Modal(document.getElementById('test'), {})
      myModal.toggle()
      </script>`;
    res.render('login_view', { subsite_title: 'Logowanie', mode_name_1: "logowania", mode_name_2 : "Zaloguj", action : "login" , register : `<a href="/register_page">Zarejestruj się</a>`, optional_popup : popup_content});
  } else {
    res.render('login_view', { subsite_title: 'Logowanie', mode_name_1: "logowania", mode_name_2 : "Zaloguj", action : "login" , register : `<a href="/register_page">Zarejestruj się</a>`});
  }
  })

app.post('/login', function(req, res) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db_con_loginSys.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
      let hash = results[0]['password'];
			if (results.length > 0) {
        bcrypt.compare(password, hash, function (err, result) {
          if(result == true) {
            
            // Authenticate the user
            req.session.loggedin = true;
            req.session.username = username;
            // Redirect to home page
            res.redirect('/about');
          }
          });
			} else {
				res.redirect('/login_page');
			}			
		});
	} else {
		res.redirect('/login_page');
	}
});

app.get('/logout', function (req, res) {
  req.session.loggedin = false;
  req.session.username = "";
  res.redirect('/login_page?comm=loggedOut');
});

app.get('/register_page', function (req, res) {
  if(typeof req.query.comm != 'undefined') {
    let popup_communicate = "Podczas rejestracji wystąpił nieznany błąd";
    switch(req.query.comm) {
      case "usernameTaken":
        popup_communicate = "Ta nazwa użytkownika jest już zajęta!";
        break;
      case "emptyFields":
        popup_communicate = "Nie uzupełniono wszystkich potrzebnych pól";
        break;
    }
    let popup_content = `<div class="py-2">
      <div class="modal" id="test">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Błąd!</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <p>${popup_communicate}</p>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                  </div>
              </div>
          </div>
      </div>
      </div>
      <script>
      var myModal = new bootstrap.Modal(document.getElementById('test'), {})
      myModal.toggle()
      </script>`;
    res.render('login_view', { subsite_title: 'Rejestracja', mode_name_1: "rejestracji", mode_name_2 : "Zarejestruj", action : "register", register : `<a href="/login_page">Zaloguj się</a>`, optional_popup : popup_content});
  } else {
    res.render('login_view', { subsite_title: 'Rejestracja', mode_name_1: "rejestracji", mode_name_2 : "Zarejestruj", register : `<a href="/login_page">Zaloguj się</a>`, action : "register"});
  }
})

app.post('/register', function(req, res) {
    // Capture the input fields
    let username = req.body.username;
    let password = req.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
      // Execute SQL query that'll select the account from the database based on the specified username and password
      db_con_loginSys.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account does not exists
        if (results.length == 0) {
          // create the user
          bcrypt.hash(password, 10, function (err, hash) {
            db_con_loginSys.query('INSERT INTO users (`username`, `password`) VALUES (?, ?);', [username, hash], function(error, results, fields) {
                if (error) throw error;
            });
          });
          console.log(`Zarejestrowano użytkownika ${username}`)
          res.redirect('/login_page?comm=registered');
        } else {
          res.redirect('/register_page?comm=usernameTaken');
        }			
      });
    } else {
      res.redirect('/register_page?comm=emptyFields');
  }
});

app.get('/', function (req, res) {
  if (req.session.loggedin) {
    res.redirect('/list');
  } else {
    res.redirect('/login_page?comm=notLoggedIn');
  }
})

app.get('/list', async function (req, res) {
  
  if (req.session.loggedin) {
    let paragraph_content = "";
    paragraph_content += await createSearchResultsTableFromInternalDB();
    paragraph_content += "<a class='bottom_buttons' href='/refreshAnimeStatistics'><button class='btn btn-info'>Odśwież statystyki</button></a>";
    let popup_html = "";
    if(typeof req.query.popup !== 'undefined' || typeof req.query.alreadyAddedAnimePopup !== 'undefined') {
      if(req.query.popup == 'true') {
        popup_html = `<div class="py-2">
        <div class="modal" id="test">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Informacja</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Statystyki w bazie danych zostały zaktualizowane</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <script>
        var myModal = new bootstrap.Modal(document.getElementById('test'), {})
        myModal.toggle()
        </script>`
        res.render('db_default_view', {subsite_title: 'Lista', paragraph_content: paragraph_content, optional_popup: popup_html});
      } else if (req.query.alreadyAddedAnimePopup == 'true') {
        popup_html = `<div class="py-2">
        <div class="modal" id="test">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Błąd!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Anime "${req.query.animeTitle}" już istnieje w bazie danych!</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <script>
        var myModal = new bootstrap.Modal(document.getElementById('test'), {})
        myModal.toggle()
        </script>`
        res.render('db_default_view', {subsite_title: 'Lista', paragraph_content: paragraph_content, optional_popup: popup_html});
      } else {
        res.render('db_default_view', {subsite_title: 'Lista', paragraph_content: paragraph_content});
      } 
    } else {
      res.render('db_default_view', {subsite_title: 'Lista', paragraph_content: paragraph_content});
    }
  } else {
    res.redirect('/login_page?comm=notLoggedIn');
  }
});

app.get('/searchAnime', async function (req, res) {
  if (req.session.loggedin) {
    if (typeof req.query.searchQuery !== 'undefined') {
      // the variable is defined, generowanie strony jak ktoś zrobił zapytanie
      let api_request_response = await searchAnime(req.query.searchQuery, req.query.searchResultsNum, req.query.orderSearchBy, req.query.orderMethod, req.query.filterByAiring);
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
      let paragraph_content = `
      <form method="GET" action="/searchAnime">
      <input class="form-control" name="searchQuery" type="text" style="width: 20%" placeholder="Search">
      Maksymalna liczba wyników: <input class="form-control" name="searchResultsNum" type="number" min="1" max="60" value="15" style="width: 20%" placeholder="Docelowa maksymalna liczba wyników"><br><input type="submit" value="Szukaj" class="btn btn-secondary">
      <br><br>Sortuj wartości po:<select id="orderSearchBy" class="form-select advanced-search" name="orderSearchBy">
                      <option value="" selected>Domyślnie</option>
                      <option value="title">Tytule</option>
                      <option value="members">Liczbie widzów</option>
                      <option value="score">Średniej ocenie</option>
                      <option value="start_date">Okresie emisji</option>
                      <option value="popularity">Popularności</option>
                      <option value="rank">Randze</option>
                  </select>
                  <select id="orderMethod" class="form-select advanced-search" name="orderMethod">
                      <option value="desc"selected>Malejąco</option>
                      <option value="asc">Rosnąco</option>
                  </select><br>
      Filtruj po statusie emisji <select id="filterByAiring" class="form-select advanced-search" name="filterByAiring">
                                  <option value="" selected>Nie</option>
                                  <option value="airing">W trakcie emisji</option>
                                  <option value="complete">Emisja zakończona</option>
                                  <option value="upcoming">Emisji nierozpoczęta</option>
                              </select>
      </form>`
      res.render('db_default_view', {subsite_title: 'Szukaj tytułu', paragraph_content: paragraph_content});
    } 
  } else {
    res.redirect('/login_page?comm=notLoggedIn');
  }
});

app.get('/addAnime', async function (req, res) {
  if (req.session.loggedin) {
    if (typeof req.query.anime_mal_id !== 'undefined') {
      if(req.query.anime_mal_id != "") {
        // the variable is defined, generowanie strony jak ktoś zrobił zapytanie
        let api_request_response = await getAnimeDataById(req.query.anime_mal_id);
        //sprawdzamy czy zmienna jest obiektem, jeśli ją nie jest to sprawdzamy czy jest stringiem bo jeśli jest to wystąpił błąd
        if(typeof api_request_response == 'object') {
          if(Object.values(api_request_response)[1] !== 'HttpException') {
            let response_addToDB = await addAnimeToInternalDB(api_request_response["data"]);
            if(response_addToDB == "") {
              res.redirect('/list');
            } else {
              res.redirect(`/list?alreadyAddedAnimePopup=true&animeTitle=${response_addToDB[0]}`);
              
            }
            
          } else if (Object.values(api_request_response)[1] == 'HttpException') {
          //błąd typu 404 
            res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: `Wystąpił błąd typu HTTP przy próbie zapytania do API. Kod błędu: ${Object.values(api_request_response)[0]}`});
          } else if (Object.values(api_request_response)[1] == 'BadResponseException'){
            res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: `Wystąpił błąd typu HTTP przy próbie zapytania do API. Kod błędu: ${Object.values(api_request_response)[0]}. Dodatkowe informacje: ${Object.values(api_request_response)[2]}`});
          } else {
            res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: 'Wystąpił nieznany błąd'});
          }
        } else {
          //nieznany błąd
          let paragraph_content = "Wystąpił nieznany błąd przy próbie wystosowania zapytania do API. Możliwe iż jest ono niedostępne w tym momencie."
          res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: paragraph_content});
        }
      } else {
        res.redirect('/searchAnime');
      } 
    }
  } else {
    res.redirect('/searchAnime');
  }
})

app.get('/removeAnime', async function (req, res) {
  if (req.session.loggedin) {
    if (typeof req.query.anime_internal_id !== 'undefined') {
      if(req.query.anime_internal_id != "") {
        await removeAnimeFromInternalDB(req.query.anime_internal_id);
      } 
    } 
    res.redirect('/list');
  } else {
    // Not logged in
    res.redirect('/login_page?comm=notLoggedIn');
  }
})

app.get('/refreshAnimeStatistics', async function (req, res) {
  if (req.session.loggedin) {
    await refreshStatisticsInInternalDB();
    res.redirect('/list?popup=true');
  } else {
    // Not logged in
    res.redirect('/login_page?comm=notLoggedIn');
  }
})

app.get('/animeStatisticsVisualisations', async function (req, res) {
  if (req.session.loggedin) {
    //Załadowywanie danych z bazy danych
    let status_names = "";
    let type_names = "";
    let genre_names = "";
    let season_names = "";


    let anime_data = await db_con.query("SELECT `ID_Internal`, `Title`, `Status_ID`, `Avg_Rating`, `Viewers_Count`, `Episodes_Count`, `Year_Broadcast`, `Season`, `Type`, `Genre` FROM `anime`;");
    //jako iż te dane są nieużywane nie zaciągam ich
    /*status_names = await db_con.query("SELECT `ID`, `Name_PL` FROM `status`;");
    type_names = await db_con.query("SELECT `ID`, `Name_PL` FROM `type`;");
    genre_names = await db_con.query("SELECT `ID`, `Name_PL` FROM `genre`;");
    season_names = await db_con.query("SELECT `ID`, `Name_PL` FROM `season`;");*/
    let DB_Data = await ConvertInternalDB_Data_ForPlot(anime_data);

    let additionalAnimeDataRaw = {
      status: status_names,
      type: type_names,
      genre: genre_names,
      season: season_names
    }
    let additionalAnimeData = {
      status: [],
      type: [],
      genre: [],
      season: []
    }
    for (const [key_outer, value_outer] of Object.entries(additionalAnimeDataRaw)) {
      for (const [key, value] of Object.entries([key_outer, value_outer][1])) {
        additionalAnimeData[key_outer][value['ID']] = value['Name_PL'];
      }
    }
  


    let additional_external_head_content_toload = '';
    additional_external_head_content_toload += '<link type="text/css" href="css/stats.css" rel="stylesheet">';
    additional_external_head_content_toload += '<script src="https://cdn.plot.ly/plotly-2.12.0.min.js"></script>';
    additional_external_head_content_toload += '<script src="js/generatePlotlyPlot.js"></script>';
    additional_external_head_content_toload += `<script>
      let animeData = JSON.parse('${JSON.stringify(DB_Data)}');
      let additionalAnimeData = JSON.parse('${JSON.stringify(additionalAnimeData)}');
    </script>`;

    res.render('statistics_view', {additional_external_js_toload: additional_external_head_content_toload, subsite_title: 'Statystyki' });
    
  } else {
    res.redirect('/login_page?comm=notLoggedIn');
  }
});

app.get('/about', async function (req, res) {
    if (req.session.loggedin) {
      // Output username
      res.render('about_view', { subsite_title: "O stronie", username : req.session.username });
    } else {
      // Not logged in
      res.redirect('/login_page?comm=notLoggedIn');
    }
});

app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);
