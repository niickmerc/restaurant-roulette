const express = require('express');
const app = express();
const path = require('path');
const yelp = require('yelp-fusion');
const colors = require('colors');
const ejs = require('ejs');

const apiKey = '6xRLOT2hzxA37NUpkb0rsyv92fqMhNv8O_c-2_PC04Ryt--xS5xQUQru2A8orO8EojnhSO5mjsUyFUvGFr0MSosv6b4FDMItXK60QMwRmqb7U4yMZ4M_Et_NOTU_YnYx';
const clientId = 'k0nxX4jW8f0f45dVAD5_tQ';

const handleHome = (req, res) => {
    res.render('home.ejs', {showResult:false, noResult:false}); 
}

const handleSearch = async (req, res) => {
    console.log("Restaurant-rouletting...".cyan);
    const {body : {terms, location, radius}} = req;
    console.log(req.body);

    const searchRequest = {
        term: terms,
        location: location,
        radius: parseInt(radius)*1000, 
        open_now: true,
        categories: "restaurants, All",
        limit: 10
      };

    try {
        await makeRequest(searchRequest, res);
    } catch (e) {
        res.render('home', {showResult: false, noResult: true});
        console.log("No restaurants found with given parameters.".yellow);
    }
}

// -----------------------------------------------------
// Set-up port:
const portNum = 3000;
app.listen(portNum, () => {
    console.log("LISTENING ON PORT " + portNum);
});

// set EJS: default assume template exist in /views
app.set('view engine', 'ejs');
// setting path to be universally accessible
app.set('views', path.join(__dirname, '/views'));
// static assets location:
app.use(express.static('public')); 
app.use(express.urlencoded({extended : true})); // parses html form and translate into JS object

// GET requests:
app.get("/", handleHome);

// POST requests:
app.post("/", handleSearch);

// -----------------------------------------------------
// FUNCTIONS:

// genGoogleLink
// @signature: int int => str
// EFFECTS: Returns Google-Maps link to given place.
function genGoogleLink(x, y, place) {
    var link = "https://www.google.com/maps/search/?api=1&query=";
    link = link + String(x) + "%2C" + String(y) + "%2C+" + String(place);
    return link;
}

// makeRequest
// @signature searchRequest-obj response-obj => void
// EFFECTS: Makes an API request given a searchRequest object and renders response.
async function makeRequest(searchRequest, res) {
    const client = yelp.client(apiKey);
    const response = await client.search(searchRequest);
    const count = Object.keys(response.jsonBody.businesses).length;
    const randomResult = Math.floor(Math.random() * count);
    const result = await response.jsonBody.businesses[randomResult];

    const restaurantURL = await genGoogleLink(result.coordinates.latitude, result.coordinates.longitude, result.name);
    const name = (result.name);
    const image = (result.image_url);
    const rating = (result.rating);
    const price = (result.price);
    const location_array = result.location.display_address;
    let address = "";
    for (let i = 0; i < (location_array.length - 1); i++) {
        address += location_array[i] + " ";
    }
    console.log(name);
    console.log(address);
    console.log(price);
    console.log(restaurantURL);
    console.log(rating);
    const starRating = "⭐".repeat(parseInt(rating));
    console.log(starRating);
    
    res.render('home', {
        showResult: true, noResult: false,
        name, image, address, price, restaurantURL, starRating
    });
    console.log("Restaurant located!".cyan);
}
