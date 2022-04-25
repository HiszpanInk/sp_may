const http = require('http');
const express = require('express')
const fetch = require('node-fetch');
const app = express()

var { Liquid } = require('liquidjs');
var engine = new Liquid();


const hostname = '127.0.0.1';
const port = 3000;

function searchAnime(searchQuery) {
  let max_search_results = 10;
  fetch(`https://api.jikan.moe/v4/anime?page=1&q=${query}&limit=${max_search_results}`)
    .then(response => response.json())
    .then(data => {
      parsed_data = JSON.parse(data);
      return parsed_data;
  })
  .catch(err => { 
    console.log(err) 
    return "API ERROR (albo moja pomyłka przy funkcji pytającej api, lol)"
  
  })
}


app.get('/', function (req, res) {
  res.send('Hello World');
  
})

app.get('/searchAnime', function (req, res) {
  if (typeof req.query.searchQuery !== 'undefined') {
    // the variable is defined
    //generowanie strony jak ktoś zrobił zapytanie
    let api_request_response = searchAnime(req.searchQuery);
    //sprawdzamy czy zmienna jest tablicą, jeśli ją nie jest to sprawdzamy czy jest stringiem bo jeśli jest to wystąpił błąd
    if(Array.isArray(api_request_response)) {

    } else if ("abc") {
      //API coś się wtedy zrąbało
      console.log("abc");

    } else {
      //nieznany błąd
      console.log("")
    }

  } else {
    //generowanie strony jak ktoś chce wyszukać sobie przy pomocy tej strony (bo do tej strony można przekierować będzie ze strony głównej bo tam zrobię jakiś )
  }

  
  res.send('Hello World');
  
})

app.listen(port)
console.log(`Server running at http://${hostname}:${port}/`);