const http = require('http');
const path = require('path');
const express = require('express')
const fetch = require('node-fetch');
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


const hostname = '127.0.0.1';
const port = 3000;



async function searchAnime(searchQuery) {
  let max_search_results = 10;
  const response = await fetch(`https://api.jikan.moe/v4/anime?page=1&q=${searchQuery}&limit=${max_search_results}`)
  const data = await response.json();
  //let data_array = JSON.parse(data)
  return data;
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
        paragraph_content = Object.values(api_request_response);
        console.log(paragraph_content[1]);
        //i tutaj trzeba będzie przerobić te dane na tabelkę do HTMLa
        res.render('db_default_view', {subsite_title: `Wyniki wyszukiwania dla frazy "${req.query.searchQuery}"`, paragraph_content: "bruh"});
      } else if (Object.values(api_request_response)[1] == 'HttpException')
      //błąd typu 404 
        res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: `Wystąpił błąd typu HTTP przy próbie zapytania do API. Kod błędu: ${Object.values(api_request_response)[0]}`});
    } else {
      //nieznany błąd
      res.render('db_default_view', {subsite_title: "Błąd", paragraph_content: "Wystąpił nieznany błąd przy próbie wystosowania zapytania do API"});
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