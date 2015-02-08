// This helps avoid conflicts in case we inject 
// this script on the same page multiple times
// without reloading.
var injected = injected || (function(){

  // lots of variables 
  var currentData = "Ruby";
  var personalData = {};

  var zipCodeMap = {};
  zipCodeMap["98115"] = "N-U";
  zipCodeMap["98105"] = "N_U";
  zipCodeMap["98103"] = "N-B";
  zipCodeMap["98117"] = "N-J";
  zipCodeMap["98107"] = "N-B";
  zipCodeMap["98112"] = "E-C";
  zipCodeMap["98102"] = "E-C";
  zipCodeMap["98109"] = "W-Q";
  zipCodeMap["98119"] = "W-Q";
  zipCodeMap["98199"] = "W-Q";
  zipCodeMap["98144"] = "S-R";
  zipCodeMap["98121"] = "W-D";
  zipCodeMap["98101"] = "W-M";
  zipCodeMap["98154"] = "W-K";
  zipCodeMap["98104"] = "W-K";
  zipCodeMap["98134"] = "S-O";
  zipCodeMap["98116"] = "SW-W";
  zipCodeMap["98126"] = "SW-W";
  zipCodeMap["98106"] = "SW-F";
  zipCodeMap["98108"] = "SW-O";
  zipCodeMap["98118"] = "SW-R";

// ==========================================================
// XML parser 

var parseXml;

if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined" &&
       new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

// ========================================================== 
// API requests 
  
  var google_api_key = "AIzaSyAoysksNa9gcxgFXLS0Y1DPOY-i3e1tvaU";
  var zillow_api_key = "X1-ZWz1az0cc5ybrf_8jmj2";
  var greatschools_api_key = "ubxujm3l2auftgaeysnblgxx";

  var googleApiRequest = function(origin, dist, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "https://maps.googleapis.com/maps/api/distancematrix/json?";
    requestStr += "origins="+origin;
    requestStr += "&destinations="+dist;
    requestStr += "&mode=transit";
    requestStr += "&key="+google_api_key;

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = JSON.parse(xmlhttp.responseText);
          //console.log(xmlhttp.responseText);
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

  // https://maps.googleapis.com/maps/api/geocode/json?address= &key 
  var googleGeoApiRequest = function(origin, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "https://maps.googleapis.com/maps/api/geocode/json?";
    requestStr += "address="+origin;
    requestStr += "&key="+google_api_key;

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = JSON.parse(xmlhttp.responseText);
          //console.log(xmlhttp.responseText);
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

  // https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius;=500&types;=food&name;=cruise&key;=AddYourOwnKeyHere
  var googlePlacesApiRequest = function(lat, lng, types, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    requestStr += "location="+lat+","+lng;
    requestStr += "&radius=4000";
    requestStr += "&types="+types;
    requestStr += "&key="+google_api_key;

    console.log(requestStr);

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = JSON.parse(xmlhttp.responseText);
          console.log(xmlhttp.responseText);
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

  var zillowApiRequest = function(streetAddr, cityStateAddr, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "http://www.zillow.com/webservice/GetSearchResults.htm?";
    requestStr += "zws-id="+zillow_api_key;
    requestStr += "&address="+streetAddr;
    requestStr += "&citystatezip="+cityStateAddr; 
    requestStr += "&rentzestimate=true";

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = parseXml(xmlhttp.responseText).documentElement;
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

  var greatschoolsApiRequest = function(streetAddr, city, state, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "http://api.greatschools.org/schools/nearby?";
    requestStr += "key="+greatschools_api_key;
    requestStr += "&address="+streetAddr;
    requestStr += "&city="+city;
    requestStr += "&state="+state; 
    requestStr += "&schoolType=public-charter&levelCode=elementary-schools&minimumSchools=1&radius=5&limit=5";

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = parseXml(xmlhttp.responseText).documentElement;
          console.log(apiData);
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

  var seattleCrimeApiRequest = function(callback) {
    var requestStr = "https://data.seattle.gov/resource/3xqu-vnum.json";

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = JSON.parse(xmlhttp.responseText);
          //console.log(xmlhttp.responseText);
          callback(apiData);
      }
    }
    xmlhttp.send();
  }

// ========================================================== 
// local API data for current location 
  
  var currentLocationAddress = "";

  var googleApiDataObject = null;
  var timeToWork = "";
  var timeToWorkSeconds = 0;

  var zillowDataObject = null; 
  var zillowRentEstimate = 0;

  var greatschoolsDataObject = null; 

  var googleGeoApiDataObject = null; 
  var currLongitude = 0;
  var currLatitude = 0;

  var googlePlacesApiDataObject_hospital = null; 
  var googlePlacesApiDataObject_school = null;
  var googlePlacesApiDataObject_groceries = null;

  var hospitalCount = 0;
  var schoolCount = 0;
  var timeToGroceriesSeconds = 0;

  var crimeDataObject = null;
  var crimeTable = {};
  var crimeTotal = 0; 
  var cityAverageCrimeScore = 0.0;

  seattleCrimeApiRequest(function(dataObj) {
    crimeDataObject = dataObj;
    console.log(crimeDataObject.length);
    for (var i = 0; i < crimeDataObject.length; i++) {
      var mapID = crimeDataObject[i].precinct + "-" + crimeDataObject[i].sector;
      console.log(mapID);
      if (!(mapID in crimeTable))
        crimeTable[mapID] = 0.0;
      crimeTable[mapID] += parseInt(crimeDataObject[i].stat_value);
      crimeTotal += parseInt(crimeDataObject[i].stat_value);
    }

    var highest = 0.0;
    var lowest = 1.0;
    for (var mapID in crimeTable) {
      crimeTable[mapID] /= crimeTotal;
      if (crimeTable[mapID] > highest)
        highest = crimeTable[mapID];
      if (crimeTable[mapID] < lowest)
        lowest = crimeTable[mapID];
    }

    cityAverageCrimeScore = (highest + lowest) / 2.0; // hack 
  });

  var checkUpdateLocation = function(newLocationAddress) {
    if (newLocationAddress == currentLocationAddress)
      return; 
    currentLocationAddress = newLocationAddress;

    var originAddr = personalData[currentData].workaddress[0]+", "+personalData[currentData].workaddress[1];
/*
    googleApiRequest(originAddr, currentLocationAddress, function(dataObj){ 
      googleApiDataObject = dataObj; 
      timeToWork = googleApiDataObject.rows[0].elements[0].duration.text;
      timeToWorkSeconds = googleApiDataObject.rows[0].elements[0].duration.value;
      longitude = googleApiDataObject.rows[0].elements[0].duration.value;
      latitude = googleApiDataObject.rows[0].elements[0].duration.value;
    });
/*
    zillowApiRequest(personalData[currentData].workaddress[0], personalData[currentData].workaddress[1], function(dataObj){
      zillowDataObject = dataObj;
      rentZestimate = parseInt(zillowDataObject.getElementsByTagName("rentzestimate")[0].getElementsByTagName("amount")[0].innerHTML);
    });

    greatschoolsApiRequest(personalData[currentData].workaddress[0], "Seattle", "WA", function(dataObj){
      greatschoolsDataObject = dataObj;
    });

    googleGeoApiRequest(originAddr, function(dataObj){
      googleGeoApiDataObject = dataObj; 
      currLongitude = googleGeoApiDataObject.results[0].geometry.location.lng;
      currLatitude = googleGeoApiDataObject.results[0].geometry.location.lat;
      console.log("lng: "+currLongitude+", lat: "+currLatitude);

      googlePlacesApiRequest(currLatitude, currLongitude, "hospital", function(dataObj){
        googlePlacesApiDataObject_hospital = dataObj;
      });

      googlePlacesApiRequest(currLatitude, currLongitude, "school", function(dataObj){
        googlePlacesApiDataObject_school = dataObj;
      });

      googlePlacesApiRequest(currLatitude, currLongitude, "grocery_or_supermarket", function(dataObj){
        googlePlacesApiDataObject_groceries = dataObj;
      });
    });
*/
    // TODO make things break, have default parameters (at least 10)
    zillowRentEstimate = 1500.0;
    timeToWorkSeconds = 30 * 60.0;
    schoolCount = 3;
    hospitalCount = 2;
    timeToGroceriesSeconds = 15 * 60.0;
    zipCrimeScore = 0.04;

    // =========================================== 
    // run the algorithms 

    var weights = {};

    weights["affordable"] = [50.0, 75.0]; 
    weights["work"] = [10.0, 30.0]; 
    weights["school"] = [5.0, 30.0]; 
    weights["hospital"] = [5.0, 30.0]; 
    weights["safety"] = [15.0, 30.0]; 
    weights["groceries"] = [5.0, 30.0]; 

    for (var weightName in weights) {
      if(personalData[currentData].priorities.indexOf(weightName) > -1)
        weights[weightName] = weights[weightName][1];
      else 
        weights[weightName] = weights[weightName][0];
    }

    var scores = {};
    
    var rentPercentageRange = [0.33, 1.0]; // in percentage of income  
    var affordableScore = ((zillowRentEstimate / personalData[currentData].monthlyincome) - rentPercentageRange[0]) / (rentPercentageRange[1] - rentPercentageRange[0]);
    scores["affordable"] = Math.max(0.0, affordableScore);

    var workTravelTimeRange = [15*60.0, 60*60.0]; // in seconds 
    var workScore = (timeToWorkSeconds - workTravelTimeRange[0]) / (workTravelTimeRange[1] - workTravelTimeRange[0]);
    scores["work"] = Math.max(0.0, workScore);

    var schoolCountRange = [1, 5];
    var schoolScore = (schoolCount - schoolCountRange[0]) / (schoolCountRange[1] - schoolCountRange[0]);
    scores["school"] = Math.max(0.0, schoolScore);

    var hospitalCountRange = [1, 5];
    var hospitalScore = (hospitalCount - hospitalCountRange[0]) / (hospitalCountRange[1] - hospitalCountRange[0]);
    scores["hospital"] = Math.max(0.0, hospitalScore);

    var groceriesTravelTimeRange = [5*60.0, 30*60.0]; // in seconds 
    var groceriesScore = (timeToGroceriesSeconds - groceriesTravelTimeRange[0]) / (groceriesTravelTimeRange[1] - groceriesTravelTimeRange[0]);
    scores["groceries"] = Math.max(0.0, groceriesScore);

    var crimePercentageRange = [0.5, 1.5]; // in percentage compared to city average  
    var safetyScore = ((zipCrimeScore / cityAverageCrimeScore) - crimePercentageRange[0]) / (crimePercentageRange[1] - crimePercentageRange[0]);
    scores["safety"] = Math.max(0.0, safetyScore);

    console.log(scores);
    console.log(weights);

    var totalScore = 100.0;
    for (var weightName in weights) {
      totalScore -= scores[weightName] * weights[weightName];
    }

    console.log(totalScore);

    // update UI/UX accordingly 
  }

// ========================================================== 
// details popup 

  var fulldetails_div = document.createElement("div");
  fulldetails_div.className = "info-fulldetails-popup";
  fulldetails_div.id = "info-fulldetails-popup";
  document.body.appendChild(fulldetails_div);

  var fulldetails_img = document.createElement("img");
  fulldetails_img.className = "info-fulldetails-popup-img";
  fulldetails_img.id = "info-fulldetails-popup-img";
  fulldetails_div.appendChild(fulldetails_img);

  var user_fullname = document.createElement("div");
  user_fullname.innerHTML = "<br><br><br><br><br><br><br><p>Susie</p>";
  fulldetails_div.appendChild(user_fullname);

  var user_prefs = document.createElement("div");
  user_prefs.innerHTML = "<br><p><u>Preferences:</u><br>Schools<br>Work<br>Safe</p>";
  fulldetails_div.appendChild(user_prefs);

  var user_work = document.createElement("div");
  user_work.innerHTML = "<br><p><u>Work:</u><br>800 Occidental Avenue South<br>Seattle, WA 98134</p>";
  fulldetails_div.appendChild(user_work);

// ==========================================
// popups left 

  // create popup, this only happens once 
  var popup_div = document.createElement("div");
  popup_div.className = "info-popup";
  popup_div.id = "info-popup";
  document.body.appendChild(popup_div);
  console.log("loaded");

  var text_div = document.createElement("div");
  text_div.className = "info-link-score";
  text_div.id = "info-link-score";
  text_div.innerHTML = "<p>92</p>";
  popup_div.appendChild(text_div);

  var info_div = document.createElement("div");
  info_div.className = "info-link-description";
  info_div.id = "info-link-description";
  info_div.innerHTML = "<p>+Great Schools<br>+Good Work<br>+Great Safety</p>";
  popup_div.appendChild(info_div);

  var photo_div = document.createElement("div");
  photo_div.className = "info-photo-popup";
  photo_div.id = "info-photo-popup";
  document.body.appendChild(photo_div);

  var photo_div_img = document.createElement("img");
  photo_div_img.className = "info-photo-popup-img";
  photo_div_img.id = "info-photo-popup-img";
  photo_div.appendChild(photo_div_img);

  var justAdded = true; 

// ==========================================
// main add listener logic 

  function OnSubtreeModified() {
    var nodes = document.querySelectorAll(".zsg-content-header.addr, .mapAndAttrs > .mapbox"); 
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      node.onmousemove = function(e) {
        var target;
        if (!e) var e = window.event;
        if (e.target) target = e.target;
        else if (e.srcElement) target = e.srcElement;

        var popupDiv = document.getElementById("info-popup");
        if(popupDiv) {
          if(!popupDiv.classList.contains("show")) {
            popupDiv.classList.add("show");

            checkUpdateLocation("Seattle, WA");
          }
        }

        popupDiv = document.getElementById("info-photo-popup");
        if(popupDiv) {
          if(!popupDiv.classList.contains("show")) {
            popupDiv.classList.add("show");
          }
        }
      }

      node.onmouseout = function(e) {
        var popupDiv = document.getElementById("info-popup");
        if(popupDiv) {
          if(popupDiv.classList.contains("show")) {
            popupDiv.classList.remove("show");
          }
        }

        popupDiv = document.getElementById("info-photo-popup");
        if(popupDiv) {
          if(popupDiv.classList.contains("show")) {
            popupDiv.classList.remove("show");
          }
        }
      }
    }
  }

// ==========================================
// objects that get changed 

  var mainContainer = document.querySelectorAll(".property-data-column");
  for (var i = 0; i < mainContainer.length; i++) {
    var container = mainContainer[i];
    container.addEventListener("DOMSubtreeModified", OnSubtreeModified, false);
  }

// ==========================================
// random plugin stuff 

  // An object that will contain the "methods"
  // we can use from our event script.
  var methods = {};

  // Return all of the background-color values
  methods.testInject = function(){

    OnSubtreeModified();

    if (justAdded)
      justAdded = false;
    else if (document.contains(popup_div))
    {
      document.body.removeChild(popup_div);
      document.body.removeChild(photo_div);
      document.body.removeChild(fulldetails_div);
    }
    else 
    {
      document.body.appendChild(popup_div);
      document.body.appendChild(photo_div);
      document.body.appendChild(fulldetails_div);
    }

    var colors = [];
    return Object.getOwnPropertyNames(colors).sort(function (a, b) {
      return colors[b] - colors[a];
    });
  }

  // This tells the script to listen for
  // messages from our extension.
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var data = {};
    // If the method the extension has requested
    // exists, call it and assign its response
    // to data.
    if (methods.hasOwnProperty(request.method))
      data = methods[request.method]();
    // Send the response back to our extension.
    sendResponse({ data: data });
    return true;
  });


// ==========================================
// hardcoded sample data 

  personalData["Ruby"] = {};
  personalData["Ruby"].firstname = "Ruby";
  personalData["Ruby"].profession = "Mom";
  personalData["Ruby"].priorities = ["school", "safety", "work"];
  personalData["Ruby"].monthlyincome = 2000.0;
  personalData["Ruby"].workaddress = ["800 Occidental Avenue South", "Seattle, WA 98134"];
  personalData["Ruby"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/mom.jpg";

  personalData["Oliver"] = {};
  personalData["Oliver"].firstname = "Oliver";
  personalData["Oliver"].profession = "Veteran";
  personalData["Oliver"].priorities = ["hospital", "affordable", "work"];
  personalData["Oliver"].monthlyincome = 1500.0;
  personalData["Oliver"].workaddress = ["400 Broad Street", "Seattle, WA 98109"];
  personalData["Oliver"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/vet.jpg";

  fulldetails_img.src = personalData[currentData].photo;
  photo_div_img.src = personalData[currentData].photo;

// ==========================================
// keyboard operations 

  window.onkeydown = function(e) {
    if (e.keyCode == 77)
    {
      if(fulldetails_div.classList.contains("show")) {
        fulldetails_div.classList.remove("show");
      }
      else {
        fulldetails_div.classList.add("show");
      }
    }

    if (e.keyCode == 78)
    {
      if(currentData == "Ruby")
        currentData = "Oliver";
      else 
        currentData = "Ruby";

      fulldetails_img.src = personalData[currentData].photo;
      photo_div_img.src = personalData[currentData].photo;

      var prefstring = "<br><p><u>Preferences:</u>";
      for (var i = 0; i < personalData[currentData].priorities.length; i++) {
        prefstring += "<br>"+personalData[currentData].priorities[i];
      }
      prefstring += "</p>";
      user_prefs.innerHTML = prefstring;
      user_work.innerHTML = "<br><p><u>Work:</u><br>"+personalData[currentData].workaddress[0]+"<br>"+personalData[currentData].workaddress[1]+"</p>";
    }
  }

  return true;
})();