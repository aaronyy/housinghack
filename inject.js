// This helps avoid conflicts in case we inject 
// this script on the same page multiple times
// without reloading.
var injected = injected || (function(){

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

  var mainContainer = document.querySelectorAll(".property-data-column");
  for (var i = 0; i < mainContainer.length; i++) {
    var container = mainContainer[i];
    container.addEventListener("DOMSubtreeModified", OnSubtreeModified, false);
  }

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

  var currentData = "Ruby";
  var personalData = {};
  personalData["Ruby"] = {};
  personalData["Ruby"].firstname = "Ruby";
  personalData["Ruby"].profession = "Mom";
  personalData["Ruby"].priorities = ["School", "Safe", "Work"];
  personalData["Ruby"].monthlyincome = 2000;
  personalData["Ruby"].workaddress = ["800 Occidental Avenue South", "Seattle, WA 98134"];
  personalData["Ruby"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/mom.jpg";

  personalData["Oliver"] = {};
  personalData["Oliver"].firstname = "Oliver";
  personalData["Oliver"].profession = "Veteran";
  personalData["Oliver"].priorities = ["Hospital", "Affordable", "Work"];
  personalData["Oliver"].monthlyincome = 1500;
  personalData["Oliver"].workaddress = ["400 Broad Street", "Seattle, WA 98109"];
  personalData["Oliver"].photo = "https://s3-us-west-2.amazonaws.com/roominnate.com/imgs/vet.jpg";

  fulldetails_img.src = personalData[currentData].photo;
  photo_div_img.src = personalData[currentData].photo;

  window.onkeydown = function(e) {
    if (e.keyCode == 32)
    {
      if(fulldetails_div.classList.contains("show")) {
        fulldetails_div.classList.remove("show");
      }
      else {
        fulldetails_div.classList.add("show");
      }
    }

    if (e.keyCode == 37)
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