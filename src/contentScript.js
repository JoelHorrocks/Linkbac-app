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

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

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

  let subject = document.querySelectorAll("li a.active span")[0].innerText;

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
            message: {"title": title, "emoji": emoji, "type": label, "class": subject.replace(/,/g, ''), "criteria": criteria, "date": date },
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
