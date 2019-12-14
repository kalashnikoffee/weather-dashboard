//DECLARE VARIABLES--------------------------------------------------------------

//WEATHER FACTORS
var TodaysHumidity = $("#todays-humidity"); //
var TodaysTemperature = $("#todays-temperature"); //
var TodaysWindSpeed = $("#todays-wind-speed"); //
var TodaysUvIndex = $("#todays-uv-index");  //
//USER INPUTS
var locationUserInput = $("#city-input"); //
var locationInputButton = $("#city-input-button"); //
//5 DAY FORECAST
var dayOneDisplay = $("#day-one-display"); //
var dayTwoDisplay = $("#day-two-display"); //
var dayThreeDisplay = $("#day-three-display"); //
var dayFourDisplay = $("#day-four-display"); //
var dayFiveDisplay = $("#day-five-display"); //
//MAIN FORECAST
var CityInfo = $("#main-city-info"); //
//SEARCH HISTORY / CLEAR
var searchHistoryBox = $("#previous-searches"); //
var searchHistory = []; //
var searchInput = ""; //
//TRANSITION ELEMENTS
var onLoad = $("#first-screen-load"); //
var weatherSearch = $("#weather-after-search"); //

//WEATHER ICON REFERENCE TABLE
//http://openweathermap.org/img/wn/10d@2x.png <<---10d bit is what reps the icon
// Day icon	Night icon	Description
// 01d.png 	01n.png 	clear sky
// 02d.png 	02n.png 	few clouds
// 03d.png 	03n.png 	scattered clouds
// 04d.png 	04n.png 	broken clouds
// 09d.png 	09n.png 	shower rain
// 10d.png 	10n.png 	rain
// 11d.png 	11n.png 	thunderstorm
// 13d.png 	13n.png 	snow
// 50d.png 	50n.png 	mist

//WEATHER ICONS
var iconURLBeg = "https://openweathermap.org/img/wn/"; //
var iconURLEnd = "@2x.png"; //



// FUNCTIONS ------------------------------------------------------------------
//-----------------------------------------------------------------------------
// CLEAR ALL FORECASTS
function clearForecast() {
   dayOneDisplay.empty();
   dayTwoDisplay.empty();
   dayThreeDisplay.empty();
   dayFourDisplay.empty();
   dayFiveDisplay.empty();
   CityInfo.empty();
};

//PULL FROM LOCAL STORAGE - SEARCH HISTORY ------------------------------------
function cityHistory() {
   searchHistory = JSON.parse(localStorage.getItem("city"));
   console.log("Previous Cities Working");
   console.log(searchHistory);
   if (searchHistory === null) {
      searchHistory = [];
   };
//CONT.. Moves recent search to top
searchHistory = searchHistory.reverse();
searchHistoryBox.empty();
//CONT.. 
for (var i = 0; i < searchHistory.length; i++) {
   var newPreviousCityDiv = $("<div>");
   newPreviousCityDiv = newPreviousCityDiv.attr("class", "previous-searches-button");
   newPreviousCityDiv.html(searchHistory[i]);
   searchHistoryBox.append(newPreviousCityDiv);
};

//EVENT LISTENER - CLICK TO GET WEATHER ---------------------------------------
$(".previous-searches-button").on("click", pullForecastInfo);
};

//STORE DATA
function dataStorage(event) {
   event.preventDefault();
   searchInput = locationUserInput.val();
   if (searchInput === "") {
      alert("You gotta type a city in the search my dude")
      return
   };
   console.log(searchHistory);
   searchHistory.push(searchInput);
   localStorage.setItem("city", JSON.stringify(searchHistory));
};

//--------------------------------------------------------------------------------------
//WEATHER GETTER FUNCTION
//THIS IS BY FAR THE STUPIDEST FUNCTION I'VE EVER WORKED ON
function todaysWeather(cityName) {
   var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=";
   var uviURL = "https://api.openweathermap.org/data/2.5/uvi?";
   var VDURL = "https://api.openweathermap.org/data/2.5/forecast?";
   var apiKey = "appid=621e13bedef34cbb0bd965d4dfed19ee";
   var queryURL = apiURL + cityName + "&" + apiKey;
   var lat = "";
   var long = "";
   var cityID = "";
   var cityNameText = "";
//--------------------------------
// if no previous searches -> show main search screen. if yes previous searches -> show most recent/future search
   if (cityName === undefined) {
      onLoad.css("display", "block");
      weatherSearch.css("display", "none");
      return;
   } else {
      onLoad.css("display", "none");
      weatherSearch.css("display", "block");

   };
//----------------------------------
   // this call sets the weather data for today
   $.ajax({
      url: queryURL,
      method: "GET"
   }).then(
      function (response) {

         console.log(response)
         // converting temperature from kelvin to fahrenheit
         var tempF = (response.main.temp - 273.15) * 1.80 + 32;

         // attaching temperature to text
         TodaysTemperature.text("Temperature: " + tempF.toFixed(2))

         // attaching humidity to text
         TodaysHumidity.text("Humidity: " + response.main.humidity + "%")

         //attaching wind speed
         TodaysWindSpeed.text("Wind speed: " + response.wind.speed)

         // assigning lat and long for the UV Index
         lat = "&lat=" + response.coord.lat;
         long = "&lon=" + response.coord.lon;
         cityID = "&id=" + response.id;

         // getting city name
         cityNameText = response.name;

         // get and setting today's date
         var todaysDate = new Date()
         console.log(todaysDate)
         var todaysMonth = todaysDate.getMonth() + 1
         var todaysDay = todaysDate.getDate();
         var todaysYear = todaysDate.getFullYear();

         var formattedToday = cityNameText + " (" + todaysMonth + "/" + todaysDay + "/" + todaysYear + ")"

         var todaysIcon = response.weather[0].icon
         var todaysIconURL = iconURLBeg + todaysIcon + iconURLEnd

         var todaysIconElement = $("<img>")
         todaysIconElement.attr("src", todaysIconURL)
         todaysIconElement.attr("class", "todays-icon")

         $("#main-city-info").append(formattedToday)
         $("#main-city-info").append(todaysIconElement)

      });
   // this sets the uv index for today.
   setTimeout(function () {
      var completeUviURL = uviURL + apiKey + lat + long;
      $.ajax({
         url: completeUviURL,
         method: "GET"
      }).then(
         function (response) {
            TodaysUvIndex.text("UV Index: " + response.value);
         })}, 800); //must be at least 400. 800 seems like the magic number

// -------------------------------------------------------
   // this call sets the weather data for five-day forecast - runs on a delay so that it doesn't return a 400 error when refreshing the page
   setTimeout(function () {
      var completeIdURL = VDURL + apiKey + cityID;
      $.ajax({
         url: completeIdURL,
         method: "GET"
      }).then(
         function (response) {
            var todaysDate = new Date();
            var currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 1);
            // DAY 1 -----------------------------------------------------------
            var month1 = currentDate.getMonth() + 1;
            var day1 = currentDate.getDate();
            var year1 = currentDate.getFullYear();
            // DAY 2 -----------------------------------------------------------
            currentDate.setDate(currentDate.getDate() + 1);
            var month2 = currentDate.getMonth() + 1;
            var day2 = currentDate.getDate();
            var year2 = currentDate.getFullYear();
            // DAY 3 ---------------------------------------------------------
            currentDate.setDate(currentDate.getDate() + 1);
            var month3 = currentDate.getMonth() + 1;
            var day3 = currentDate.getDate();
            var year3 = currentDate.getFullYear();
            // DAY 4 --------------------------------------------------------
            currentDate.setDate(currentDate.getDate() + 1);
            var month4 = currentDate.getMonth() + 1;
            var day4 = currentDate.getDate();
            var year4 = currentDate.getFullYear();
            // DAY 5 --------------------------------------------------------
            currentDate.setDate(currentDate.getDate() + 1);
            var month5 = currentDate.getMonth() + 1;
            var day5 = currentDate.getDate();
            var year5 = currentDate.getFullYear();
            // add em up ----------------------------------------------------
            var formattedDate1 = month1 + "/" + day1 + "/" + year1;
            var formattedDate2 = month2 + "/" + day2 + "/" + year2;
            var formattedDate3 = month3 + "/" + day3 + "/" + year3;
            var formattedDate4 = month4 + "/" + day4 + "/" + year4;
            var formattedDate5 = month5 + "/" + day5 + "/" + year5;
            // icons --------------------------------------------------------
            var icon1 = response.list[3].weather[0].icon;
            var icon2 = response.list[11].weather[0].icon;
            var icon3 = response.list[19].weather[0].icon;
            var icon4 = response.list[27].weather[0].icon;
            var icon5 = response.list[35].weather[0].icon;
            // icons2 -------------------------------------------------------
            var icon1URL = iconURLBeg + icon1 + "@2x.png"
            var icon2URL = iconURLBeg + icon2 + "@2x.png"
            var icon3URL = iconURLBeg + icon3 + "@2x.png"
            var icon4URL = iconURLBeg + icon4 + "@2x.png"
            var icon5URL = iconURLBeg + icon5 + "@2x.png"
            // icons3 ------------------------------------------------------
            var img1Element = $("<img>").attr("src", icon1URL);
            var img2Element = $("<img>").attr("src", icon2URL);
            var img3Element = $("<img>").attr("src", icon3URL);
            var img4Element = $("<img>").attr("src", icon4URL);
            var img5Element = $("<img>").attr("src", icon5URL);
            // make that shit Imperial! ------------------------------------
            var tempF1 = Math.round((response.list[3].main.temp - 273.15) * 1.80 + 32);
            var tempF2 = Math.round((response.list[11].main.temp - 273.15) * 1.80 + 32);
            var tempF3 = Math.round((response.list[19].main.temp - 273.15) * 1.80 + 32);
            var tempF4 = Math.round((response.list[27].main.temp - 273.15) * 1.80 + 32);
            var tempF5 = Math.round((response.list[35].main.temp - 273.15) * 1.80 + 32);
            // humidity ----------------------------------------------------
            var humidity1 = response.list[3].main.humidity;
            var humidity2 = response.list[11].main.humidity;
            var humidity3 = response.list[19].main.humidity;
            var humidity4 = response.list[27].main.humidity;
            var humidity5 = response.list[35].main.humidity;
            // display date on each forecast -------------------------------
            dayOneDisplay.append(formattedDate1 + "<br>");
            dayTwoDisplay.append(formattedDate2 + "<br>");
            dayThreeDisplay.append(formattedDate3 + "<br>");
            dayFourDisplay.append(formattedDate4 + "<br>");
            dayFiveDisplay.append(formattedDate5 + "<br>");
            // apply the icons ----------------------------------------------
            dayOneDisplay.append(img1Element);
            dayTwoDisplay.append(img2Element);
            dayThreeDisplay.append(img3Element);
            dayFourDisplay.append(img4Element);
            dayFiveDisplay.append(img5Element);
            // apply temp  -------------------------------------------------
            dayOneDisplay.append("<br>" + "Temperature: " + tempF1 + "<br>");
            dayTwoDisplay.append("<br>" + "Temperature: " + tempF2 + "<br>");
            dayThreeDisplay.append("<br>" + "Temperature: " + tempF3 + "<br>");
            dayFourDisplay.append("<br>" + "Temperature: " + tempF4 + "<br>");
            dayFiveDisplay.append("<br>" + "Temperature: " + tempF5 + "<br>");
            // apply humidity ----------------------------------------------
            dayOneDisplay.append("Humidity: " + humidity1 + "%");
            dayTwoDisplay.append("Humidity: " + humidity2 + "%");
            dayThreeDisplay.append("Humidity: " + humidity3 + "%");
            dayFourDisplay.append("Humidity: " + humidity4 + "%");
            dayFiveDisplay.append("Humidity: " + humidity5 + "%"); //% not showing up on display
         }
      )
   }, 800);
};

//USE THAT BIG MOFO AND CLEAR SHIT OUT
function pullForecastInfo(event) {
   event.preventDefault();
   clearForecast();
   var thisButtonsCity = $(this).text();
   todaysWeather(thisButtonsCity);
   console.log('MAKE IT RAIN');
};

function mainWeatherDisplay(event) {
   event.preventDefault();
   clearForecast();
   var userInput = locationUserInput.val();
   todaysWeather(userInput);
   searchHistory = [];
   cityHistory();
};

function clearSearch(event) {
   event.preventDefault();
   searchHistory = [];
   localStorage.setItem("city", JSON.stringify(searchHistory))
   searchHistoryBox.empty();
};

function initialLoad() {
   if (searchHistory.length === 0) {
      return
   } else {
      todaysWeather(searchHistory[0])
   }
};

// CALL HISTORY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
cityHistory();

// CALL IT ALL!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
initialLoad();
locationInputButton.on("click", dataStorage);
locationInputButton.on("click", mainWeatherDisplay);
$("#clear-button").on("click", clearSearch);

