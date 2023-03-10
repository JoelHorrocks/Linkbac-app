'use strict';

import { Client } from "@notionhq/client";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
  else if(request.type === 'NOTION') {
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
        "Due": {
          date: {
            start: message["date"]
          }
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}
