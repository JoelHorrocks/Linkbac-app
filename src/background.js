'use strict';

import { Client } from "@notionhq/client";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === 'NOTION') {
    addToNotion(request.payload.message);
  }
});

async function addToNotion(message) {
  const notion = new Client({ auth: "NOTION_SECRET" })
  
  const databaseId = "DATABASE_ID"

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title:[
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
