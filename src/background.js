'use strict';

import { Client } from "@notionhq/client";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'NOTION') {
    chrome.storage.sync.get({
      authToken: "",
      botId: "",
      databaseId: "",
      databaseTemplateId: "",
      useNotionTemplate: true
    }, function (items) {
      addToNotion(request.payload.message, items);
    })
  }
  else if(request.type === 'LOGGEDIN') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.remove(tabs[0].id, function() { });
    });
    chrome.tabs.create({url: "onboarding.html?screen=screen-2"});
  }
  return true;
});

async function addToNotion(message, items) {
  const notion = new Client({ auth: items.authToken })

  let databaseId = "";
  // items.useNotionTemplate stores whether custom layout or built-in
  if (items.databaseTemplateId != "" && items.databaseTemplateId != null) {
    databaseId = items.databaseTemplateId;
  }
  else {
    databaseId = items.databaseId;
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              "text": {
                "content": message["title"]
              }
            }
          ]
        },
        "Type": {
          select: {
            name: message["type"]
          }
        },
        "Class": {
          select: {
            name: message["class"]
          }
        },
        "Criteria": {
          multi_select: message["criteria"]
        },
        "Due": {
          date: {
            start: message["date"]
          }
        },
        "ID": {
          number: parseInt(message["id"])
        }
      },
      icon: {
        type: "emoji",
        emoji: message["emoji"]
      }
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}