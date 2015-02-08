// This helps avoid conflicts in case we inject 
// this script on the same page multiple times
// without reloading.
var injected = injected || (function(){

  // lots of random variables 
  var text_div;
  var popup_div;
  var numberOfCallsMade;
  var info_div1;
  var info_div2;
  var info_div3;

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

  var pref_descs = {};
  pref_descs["affordable"] = ["very affordable", "affordable", "expensive", "too expensive"];
  pref_descs["work"] = ["close to work", "good commute", "bad commute", "no commute"]; 
  pref_descs["school"] = ["nearby schools", "okay to schools", "far from schools", "no schools"];
  pref_descs["hospital"] = ["nearby hospitals", "okay to hospitals", "far from hospitals", "no hospitals"];
  pref_descs["safety"] = ["very safe area", "moderately safe", "not too safe area", "dangerous area"];
  pref_descs["groceries"] = ["nearby groceries", "okay groceries", "far groceries", "no groceries"];

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

  var zillowApiRequest = function(streetAddr, cityStateAddr, callback) {
    var xmlhttp = new XMLHttpRequest();

    var requestStr = "http://www.zillow.com/webservice/GetSearchResults.htm?";
    requestStr += "zws-id="+zillow_api_key;
    requestStr += "&address="+streetAddr;
    requestStr += "&citystatezip="+cityStateAddr; 
    requestStr += "&rentzestimate=true";

    //console.log("zillow request: "+requestStr);

    xmlhttp.open("GET", requestStr, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var apiData = parseXml(xmlhttp.responseText).documentElement;
          //console.log(apiData);
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
          //console.log(apiData);
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
    for (var i = 0; i < crimeDataObject.length; i++) {
      var mapID = crimeDataObject[i].precinct + "-" + crimeDataObject[i].sector;
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

  // =========================================== 
    // TODO make things break, have default parameters (at least 10)
    zillowRentEstimate = 500.0;
    timeToWorkSeconds = 30 * 60.0;
    schoolCount = 3;
    hospitalCount = 2;
    timeToGroceriesSeconds = 15 * 60.0;
    zipCrimeScore = 0.04;

// ==================================================================== 
// all of the API calls ever forever 

  var checkUpdateLocation = function(newLocationAddress, city, state, zipcode, rentPrice) {

    if ((newLocationAddress + " "+city+", "+state+" "+zipcode) == currentLocationAddress)
      return; 
    currentLocationAddress = newLocationAddress + " "+city+", "+state+" "+zipcode;

    var originAddr = personalData[currentData].workaddress[0]+", "+personalData[currentData].workaddress[1];

    // ====================================================== 
    // 'loading' UI 

    text_div.innerHTML = "<p>...</p>";
    popup_div.style.backgroundColor = "#bbb"; // grey

    info_div1.innerHTML = "<p>...</p>";
    info_div2.innerHTML = "<p>...</p>";
    info_div3.innerHTML = "<p>...</p>";

    info_div1.getElementsByTagName("p")[0].style.color = "#bbb";
    info_div2.getElementsByTagName("p")[0].style.color = "#bbb";
    info_div3.getElementsByTagName("p")[0].style.color = "#bbb";

    // =========================================== 
    // run the algorithms 

    numberOfCallsMade = 0; // reset numbers 
    numberOfCallsNeeded = 0; 

    var doneWithCallsUpdate = function() {
      //console.log("numberOfCallsMade: "+numberOfCallsMade+" - numberOfCallsNeeded: "+numberOfCallsNeeded);
      if (numberOfCallsMade < numberOfCallsNeeded)
        return;

      var scores = {};
      
      var rentPercentageRange = [0.33, 1.0]; // in percentage of income  
      var affordableScore = ((zillowRentEstimate / personalData[currentData].monthlyincome) - rentPercentageRange[0]) / (rentPercentageRange[1] - rentPercentageRange[0]);
      scores["affordable"] = Math.min(1.0, Math.max(0.0, affordableScore));

      var workTravelTimeRange = [15*60.0, 60*60.0]; // in seconds 
      var workScore = (timeToWorkSeconds - workTravelTimeRange[0]) / (workTravelTimeRange[1] - workTravelTimeRange[0]);
      scores["work"] = Math.min(1.0, Math.max(0.0, workScore));

      var schoolCountRange = [1, 5];
      var schoolScore = (schoolCount - schoolCountRange[0]) / (schoolCountRange[1] - schoolCountRange[0]);
      scores["school"] = Math.max(0, 1 - Math.min(1.0, schoolScore));

      var hospitalCountRange = [1, 5];
      var hospitalScore = (hospitalCount - hospitalCountRange[0]) / (hospitalCountRange[1] - hospitalCountRange[0]);
      scores["hospital"] = Math.max(0, 1 - Math.min(1.0, hospitalScore));

      var groceriesTravelTimeRange = [5*60.0, 30*60.0]; // in seconds 
      var groceriesScore = (timeToGroceriesSeconds - groceriesTravelTimeRange[0]) / (groceriesTravelTimeRange[1] - groceriesTravelTimeRange[0]);
      scores["groceries"] = Math.min(1.0, Math.max(0.0, groceriesScore));

      var crimePercentageRange = [0.5, 1.5]; // in percentage compared to city average  
      var safetyScore = ((zipCrimeScore / cityAverageCrimeScore) - crimePercentageRange[0]) / (crimePercentageRange[1] - crimePercentageRange[0]);
      scores["safety"] = Math.min(1.0, Math.max(0.0, safetyScore));

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

      console.log(scores);

      var totalScore = 100.0;
      for (var weightName in weights) {
        totalScore -= scores[weightName] * weights[weightName];
        console.log("calculating score... "+totalScore+" after "+weightName+" @ "+(scores[weightName] * weights[weightName]));
      }

      console.log(totalScore);

      // =========================================== 
      // update UI/UX accordingly 

      text_div.innerHTML = "<p>"+Math.ceil(totalScore)+"</p>";
      if (totalScore > 80) 
        popup_div.style.backgroundColor = "#18be5d"; // green 
      else if (totalScore > 60) 
        popup_div.style.backgroundColor = "#2695e3"; // blue 
      else
        popup_div.style.backgroundColor = "#e37426"; // orange

      var scoreThresHolds = [0.4, 0.6, 0.8];
      var colorTable = ["#18be5d", "#2695e3", "#e32636", "#e32636"];

      var innerHtmlUpdate = ["", "", ""];
      var innerHtmlValues = [0,0,0];
      for (var i = 0; i < 3; i++) {
        var prefName = personalData[currentData].priorities[i];

        var valueIndex = 0;
        for (var t = scoreThresHolds.length-1; t > 0; t--) {
          console.log("testing "+prefName+": "+(1.0 - scores[prefName])+" < "+scoreThresHolds[t]+" --> value: "+valueIndex);
          if (scoreThresHolds[t] > (1.0 - scores[prefName]))
            valueIndex += 1;
        }

        innerHtmlValues[i] = valueIndex;
        innerHtmlUpdate[i] = "<p>"+pref_descs[prefName][valueIndex]+"</p>";
      }

      if (scores["affordable"] > 0.8 || scores["affordable"] < 0.3) {
        prefName = "affordable";
        valueIndex = 0;
        for (var t = scoreThresHolds.length-1; t > 0; t--) {
          if (scoreThresHolds[t] > (1.0 - scores[prefName]))
            valueIndex += 1;
        }

        innerHtmlValues[2] = innerHtmlValues[1];
        innerHtmlValues[1] = innerHtmlValues[0];
        innerHtmlValues[0] = valueIndex;

        innerHtmlUpdate[2] = innerHtmlUpdate[1];
        innerHtmlUpdate[1] = innerHtmlUpdate[0];
        innerHtmlUpdate[0] = "<p>"+pref_descs[prefName][valueIndex]+"</p>";
      }

      info_div1.innerHTML = innerHtmlUpdate[0];
      info_div2.innerHTML = innerHtmlUpdate[1];
      info_div3.innerHTML = innerHtmlUpdate[2];

      info_div1.getElementsByTagName("p")[0].style.color = colorTable[innerHtmlValues[0]];
      info_div2.getElementsByTagName("p")[0].style.color = colorTable[innerHtmlValues[1]];
      info_div3.getElementsByTagName("p")[0].style.color = colorTable[innerHtmlValues[2]];
    }

    // ====================================================== 
    // fire off the calls 
    
    numberOfCallsNeeded += 1;
    googleApiRequest(originAddr, currentLocationAddress, function(dataObj){ 
      googleApiDataObject = dataObj; 

      if (googleApiDataObject.rows[0].elements[0].status == "OK") {
        timeToWork = googleApiDataObject.rows[0].elements[0].duration.text;
        timeToWorkSeconds = googleApiDataObject.rows[0].elements[0].duration.value;
      }
      else {
        timeToWork = "not found";
        timeToWorkSeconds = 9999999999;
      }
      numberOfCallsMade += 1;
      doneWithCallsUpdate();
    });

    var cityStateZip = city+"%2C+"+state+"+"+zipcode;
    cityStateZip.trim();
    cityStateZip = cityStateZip.split(' ').join('+');

    if (typeof rentPrice == 'undefined') {
      numberOfCallsNeeded += 1;
      zillowApiRequest(newLocationAddress, cityStateZip, function(dataObj){
        zillowDataObject = dataObj;
        if (zillowDataObject && zillowDataObject.getElementsByTagName("zestimate").length > 0)
          zillowRentEstimate = parseInt(zillowDataObject.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0].innerHTML);
        else 
          zillowRentEstimate = Math.random() * 1000.0 + 1000.0;

        if (zillowRentEstimate == NaN)
          zillowRentEstimate = Math.random() * 1000.0 + 1000.0;

        numberOfCallsMade += 1;
        doneWithCallsUpdate();
      });
    }
    else {
      zillowRentEstimate = rentPrice;
    }

    console.log("zillowRentEstimate: "+rentPrice);
/*
    numberOfCallsNeeded += 1;
    greatschoolsApiRequest(personalData[currentData].workaddress[0], "Seattle", "WA", function(dataObj){
      greatschoolsDataObject = dataObj;
      numberOfCallsMade += 1;
      doneWithCallsUpdate();
    });
*/  
    numberOfCallsNeeded += 1;
    googleGeoApiRequest(originAddr, function(dataObj){
      googleGeoApiDataObject = dataObj; 
      currLongitude = googleGeoApiDataObject.results[0].geometry.location.lng;
      currLatitude = googleGeoApiDataObject.results[0].geometry.location.lat;

      numberOfCallsMade += 1;

      numberOfCallsNeeded += 1;
      googlePlacesApiRequest(currLatitude, currLongitude, "hospital", function(dataObj){
        googlePlacesApiDataObject_hospital = dataObj;
        hospitalCount = googlePlacesApiDataObject_hospital.results.length;

        numberOfCallsMade += 1;
        doneWithCallsUpdate();
      });

      numberOfCallsNeeded += 1;
      googlePlacesApiRequest(currLatitude, currLongitude, "school", function(dataObj){
        googlePlacesApiDataObject_school = dataObj;
        schoolCount = googlePlacesApiDataObject_school.results.length;

        numberOfCallsMade += 1;
        doneWithCallsUpdate();
      });

      numberOfCallsNeeded += 1;
      googlePlacesApiRequest(currLatitude, currLongitude, "grocery_or_supermarket", function(dataObj){
        googlePlacesApiDataObject_groceries = dataObj;
        groceriesCount = googlePlacesApiDataObject_groceries.results.length;

        numberOfCallsMade += 1;
        doneWithCallsUpdate();
      });
    });
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
  user_fullname.className = "info-fulldetails-popup-title";
  user_fullname.id = "info-fulldetails-popup-title";
  user_fullname.innerHTML = "<p>Ruby</p>";
  fulldetails_div.appendChild(user_fullname);

  var user_prefs = document.createElement("div");
  user_prefs.className = "info-fulldetails-popup-labels";
  user_prefs.innerHTML = "<p><u>Preferences:</u></p>";
  user_prefs.style.top = "270px";
  fulldetails_div.appendChild(user_prefs);

  var div_span = document.createElement("span");
  fulldetails_div.appendChild(div_span);

  var user_prefs_div1 = document.createElement("div");
  user_prefs_div1.className = "info-link-description";
  user_prefs_div1.innerHTML = "<p>great school</p>";
  fulldetails_div.appendChild(user_prefs_div1);

  var user_prefs_div2 = document.createElement("div");
  user_prefs_div2.className = "info-link-description";
  user_prefs_div2.innerHTML = "<p>great school</p>";
  fulldetails_div.appendChild(user_prefs_div2);

  var user_prefs_div3 = document.createElement("div");
  user_prefs_div3.className = "info-link-description";
  user_prefs_div3.innerHTML = "<p>great school</p>";
  fulldetails_div.appendChild(user_prefs_div3);

  var user_work = document.createElement("div");
  user_work.className = "info-fulldetails-popup-labels";
  user_work.innerHTML = "<p><u>Work Location:</u><br>800 Occidental Avenue South<br>Seattle, WA 98134</p>";
  user_work.style.top = "430px";
  fulldetails_div.appendChild(user_work);

// ==========================================
// popups left 

  // create popup, this only happens once 
  popup_div = document.createElement("div");
  popup_div.className = "info-popup";
  popup_div.id = "info-popup";
  document.body.appendChild(popup_div);
  console.log("> loaded");

  text_div = document.createElement("div");
  text_div.className = "info-link-score";
  text_div.id = "info-link-score";
  text_div.innerHTML = "<p>...</p>";
  popup_div.appendChild(text_div);

  var div_span = document.createElement("span");
  popup_div.appendChild(div_span);

  info_div1 = document.createElement("div");
  info_div1.className = "info-link-description";
  info_div1.innerHTML = "<p>great school</p>";
  popup_div.appendChild(info_div1);

  info_div2 = document.createElement("div");
  info_div2.className = "info-link-description";
  info_div2.innerHTML = "<p>okay commute</p>";
  popup_div.appendChild(info_div2);

  info_div3 = document.createElement("div");
  info_div3.className = "info-link-description";
  info_div3.innerHTML = "<p>too expensive</p>";
  popup_div.appendChild(info_div3);

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
    var nodes = document.querySelectorAll(".zsg-content-header.addr, .mapAndAttrs > .mapbox, .slick-cell.l47.r47"); 
    //console.log("OnSubtreeModified, nodes selected: "+nodes.length);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      node.onmouseover = function(e) {
        var target;
        if (!e) var e = window.event;
        if (e.target) target = e.target;
        else if (e.srcElement) target = e.srcElement;

        console.log(target.classList);

        var popupDiv = document.getElementById("info-popup");
        if(popupDiv) {
          if(!popupDiv.classList.contains("show")) {
            popupDiv.classList.add("show");

            var addressStr = "Seattle, WA";
            var cityStr = "Seattle";
            var stateStr = "WA";
            var zipcodeStr = "98000";
            if(target.classList.contains("zsg-content-header")) {
              nodes = target.getElementsByTagName("h1");
              for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                addressStr = node.innerHTML.substring(0, node.innerHTML.indexOf(','));
                addressStr = addressStr.split(' ').join('+');
                zipcodeStr = node.innerHTML.substring(node.innerHTML.indexOf("Seattle, WA")+12, node.innerHTML.indexOf("</span>"));

                var prices = document.querySelectorAll(".main-row.home-summary-row");
                var actualPrice = null;
                for (var p = 0; p < prices.length; p++) {
                  var price = prices[p];
                  var priceSpan = price.getElementsByTagName("span")[0];
                  
                  if (priceSpan.innerHTML.indexOf("$") > -1)
                  {
                    actualPrice = priceSpan.innerHTML.substring(0, priceSpan.innerHTML.indexOf('<span')); 
                    actualPrice = actualPrice.replace("$","");
                    actualPrice = actualPrice.replace(",","");
                    actualPrice = parseInt(actualPrice, 10);
                  }
                }

                if (actualPrice)
                  checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, actualPrice); // TODO use real locations 
                else 
                  checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, 1300.0);
              }
            }
            
            if(target.classList.contains("addr_city")) {
              var node = target.parentNode;
              addressStr = node.innerHTML.substring(0, node.innerHTML.indexOf(','));
              addressStr = addressStr.split(' ').join('+');
              zipcodeStr = node.innerHTML.substring(node.innerHTML.indexOf("Seattle, WA")+12, node.innerHTML.indexOf("</span>"));

              var prices = document.querySelectorAll(".main-row.home-summary-row");
              var actualPrice = null;
              for (var p = 0; p < prices.length; p++) {
                var price = prices[p];
                var priceSpan = price.getElementsByTagName("span")[0];
                
                if (priceSpan.innerHTML.indexOf("$") > -1)
                {
                  actualPrice = priceSpan.innerHTML.substring(0, priceSpan.innerHTML.indexOf('<span')); 
                  actualPrice = actualPrice.replace("$","");
                  actualPrice = actualPrice.replace(",","");
                  actualPrice = parseInt(actualPrice, 10);
                }
              }

              if (actualPrice)
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, actualPrice); // TODO use real locations 
              else 
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, 1300.0);
            }

            if(target.classList.contains("mapaddress")) {
              var node = target;
              addressStr = node.innerHTML.substring(0, node.innerHTML.indexOf(','));
              addressStr = addressStr.split(' ').join('+');
              addressStr = addressStr.split('.').join('');
              zipcodeStr = "98122";

              var actualPrice = 1300.0;
              if (actualPrice)
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, actualPrice); // TODO use real locations 
              else 
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, 1300.0);
            }

            console.log("triggers! updating with ")
            if(target.classList.contains("l47")) {
              var node = target;
              addressStr = node.innerHTML;
              addressStr = addressStr.split(' ').join('+');
              zipcodeStr = "98122";

              console.log("triggers! updating with "+addressStr);

              var actualPrice = 1100.0;
              if (actualPrice)
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, actualPrice); // TODO use real locations 
              else 
                checkUpdateLocation(addressStr, cityStr, stateStr, zipcodeStr, 1300.0);
            }
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

  var mainContainer = document.querySelectorAll(".property-data-column, .grid-canvas");
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
  personalData["Ruby"].workaddress = ["400 Broad Street", "Seattle, WA 98109"];
  personalData["Ruby"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/mom.jpg";

  personalData["Charles"] = {};
  personalData["Charles"].firstname = "Charles";
  personalData["Charles"].profession = "Veteran";
  personalData["Charles"].priorities = ["hospital", "safety", "work"];
  personalData["Charles"].monthlyincome = 1500.0;
  personalData["Charles"].workaddress = ["800 Occidental Avenue South", "Seattle, WA 98134"];
  personalData["Charles"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/vet.jpg";

  var updateUserUI = function() {
    fulldetails_img.src = personalData[currentData].photo;
    photo_div_img.src = personalData[currentData].photo;

    user_fullname.innerHTML = "<p>"+personalData[currentData].firstname+"</p>";
    user_prefs_div1.innerHTML = "<p>"+pref_descs[personalData[currentData].priorities[0]][0]+"</p>";
    user_prefs_div2.innerHTML = "<p>"+pref_descs[personalData[currentData].priorities[1]][0]+"</p>";
    user_prefs_div3.innerHTML = "<p>"+pref_descs[personalData[currentData].priorities[2]][0]+"</p>";
    user_work.innerHTML = "<p><u>Work:</u><br>"+personalData[currentData].workaddress[0]+"<br>"+personalData[currentData].workaddress[1]+"</p>";

    // update the popup too 
    text_div.innerHTML = "<p>...</p>";
    popup_div.style.backgroundColor = "#bbb"; // grey

    info_div1.innerHTML = "<p>...</p>";
    info_div2.innerHTML = "<p>...</p>";
    info_div3.innerHTML = "<p>...</p>";

    info_div1.getElementsByTagName("p")[0].style.color = "#bbb";
    info_div2.getElementsByTagName("p")[0].style.color = "#bbb";
    info_div3.getElementsByTagName("p")[0].style.color = "#bbb";

    currentLocationAddress = ""; // reset location 
  }
  updateUserUI();

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

    if (e.keyCode == 75)
    {
      if(currentData == "Ruby")
        currentData = "Charles";
      else 
        currentData = "Ruby";

      updateUserUI();
    }
  }

  return true;
})();