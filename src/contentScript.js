'use strict';

import { textToEmoji } from './emoji-map.js';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  let title = document.getElementsByClassName("content-block-header")[0].innerText;
  let label = document.querySelectorAll(".label-and-due .label")[0].innerText;

  let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  let month = months.indexOf(document.getElementsByClassName("month")[0].innerText) + 1;
  let day = document.getElementsByClassName("day")[0].innerText;
  let date = new Date().getFullYear() + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);

  let criteria = []
  for(const i of document.querySelectorAll("a:has(+*[id^='core_criteria'])")) {
    criteria.push({"name": i.innerText.split(':')[0]})
  }

  if(criteria.length == 0) {
    criteria.push({"name": "N/A"})
  }

  // Handle subject string starting with "IB MYP" / "IB DP" in future, or use class IDs
  let subject = document.querySelectorAll(".with-indicators li a.active span")[0].innerText;

  let id = location.href.substring(location.href.lastIndexOf('/') + 1);

  let emoji = textToEmoji(title, subject);
  console.log(emoji);

  if (request.type == 'NOTION') {
    // Communicate with background file by sending a message

    chrome.storage.sync.get({
      savedClassMap: {}
    }, function (items) {
      if (Object.hasOwn(items.savedClassMap, subject)) {
        subject = items.savedClassMap[subject]
      }
      chrome.runtime.sendMessage(
        {
          type: 'NOTION',
          payload: {
            message: {"title": title, "emoji": emoji, "type": label, "class": subject.replace(/,/g, ''), "criteria": criteria, "date": date, "id": id },
          },
        }
      );
    })
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

// OAuth saving
function getUrlVars(ar){
  let vars = {};
  let parts = ar.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  let keyVal = vars;
  return vars;
  }

if(location.protocol + '//' + location.host + location.pathname == "https://storeimg.com/linkformb/oauth-done.php") {
  fetch("https://storeimg.com/linkformb/oauth-code.php?code=" + getUrlVars(location.href)["code"]).then((response) => response.json())
  .then((data) => {
    console.log(data)
    chrome.storage.sync.set({
      authToken: data["access_token"],
      botId: data["bot_id"],
      databaseTemplateId: data["duplicated_template_id"]
  }, function () {
    document.getElementById("loading").style.display = "none";
    document.getElementById("success").style.display = "block";
    if(data["duplicated_template_id"] === null){
      document.getElementById("success-text").innerHTML += "<br><p>As you didn't use the template, please set a database ID in options. (?)"
    }
  }); 
  });
}