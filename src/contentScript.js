'use strict';

import { textToEmoji } from './emojiMap.js';

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

  // If url contains core_tasks
  if(request.type === 'SYNC') {
  if(location.href.includes("core_tasks")) {
    chrome.storage.sync.get({
      savedClassMap: {}
    }, function (items) {
      chrome.runtime.sendMessage(
        {
          type: 'SYNC',
          payload: {
            message: importCoreTasks(document, items, location.href.substring(location.href.lastIndexOf('/') + 1))
          },
        }
      );
    })
  }
  else if(location.href.includes("tasks_and_deadlines")) {
    chrome.storage.sync.get({
      savedClassMap: {}
    }, function (items) {
      importUpcomingTasks(items).then((result) => {
        console.log(result)
      chrome.runtime.sendMessage(
        {
          type: 'BULKSYNC',
          payload: {
            message: result
          },
        }
      );
      });
    })
  }
}
  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

function importCoreTasks(doc, items, id) {

  let title = doc.getElementsByClassName("content-block-header")[0].innerText;
  let description = doc.getElementsByClassName("fr-element").length == 0 ? null : Array.from(doc.getElementsByClassName("fr-element")[0].getElementsByTagName("p")).map(x => x.innerText).join("\n");
  let label = doc.querySelectorAll(".label-and-due .label")[0].innerText;

  let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  let month = months.indexOf(doc.getElementsByClassName("month")[0].innerText.toUpperCase()) + 1;
  let day = doc.getElementsByClassName("day")[0].innerText;
  let date = new Date().getFullYear() + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);

  let criteria = []
  for(const i of doc.querySelectorAll("a:has(+*[id^='core_criteria'])")) {
    criteria.push({"name": i.innerText.split(':')[0]})
  }

  if(criteria.length == 0) {
    criteria.push({"name": "N/A"})
  }

  // Handle subject string starting with "IB MYP" / "IB DP" in future, or use class IDs
  let subject = doc.querySelectorAll(".with-indicators li a.active span")[0].innerText;

  if (Object.hasOwn(items.savedClassMap, subject)) {
    subject = items.savedClassMap[subject]
  }

  let emoji = textToEmoji(title, subject);
  console.log(emoji);
  
  return {"title": title, "description": description, "emoji": emoji, "type": label, "class": subject.replace(/,/g, ''), "criteria": criteria, "date": date, "id": id };
}

async function importUpcomingTasks(items) {
  // Press "show more" (inside upcoming class div) button until all tasks are loaded
  while(document.querySelectorAll(".content-block .upcoming-tasks .show-more-link").length > 0) {
    document.querySelectorAll(".content-block .upcoming-tasks .show-more-link a")[0].click();
    await new Promise(r => setTimeout(r, 1000));
  }

  let urls = [];
  for(const i of document.querySelectorAll(".content-block .upcoming-tasks > div")) {
    urls.push(i.querySelectorAll("a")[0].href);
  }

  let tasks = [];

  // Get tasks from all URLs with Fetch (async) + return result (along with url)
  const results = await Promise.all(urls.map(async url => {
    const response = await fetch(url);
    return {url, response};
  }
  ));

  for(const i of results) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(await i.response.text(), "text/html");
    tasks.push(importCoreTasks(doc, items, i.url.substring(i.url.lastIndexOf('/') + 1)));
  }
  
  return tasks;
}


// OAuth saving
function getUrlVars(ar){
  let vars = {};
  let parts = ar.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  let keyVal = vars;
  return vars;
  }

if(location.protocol + '//' + location.host + location.pathname == "https://linkbac.app/oauth/oauth-done.php") {
  fetch("https://linkbac.app/oauth/oauth-code.php?code=" + getUrlVars(location.href)["code"]).then((response) => response.json())
  .then((data) => {
    console.log(data)
    chrome.storage.sync.set({
      authToken: data["access_token"],
      botId: data["bot_id"],
      databaseTemplateId: data["duplicated_template_id"]
  }, function () {
    document.getElementById("loading").style.display = "none";
    // Send a message to background script
    // TODO: detect if sent from onboarding page or popup
    chrome.runtime.sendMessage(
      {
        type: 'LOGGEDIN',
      }
    );
  }); 
  });
}