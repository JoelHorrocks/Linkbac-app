'use strict';

import {Client} from "@notionhq/client";

// With background scripts you can communicate with popup and contentScript
// files. For more information on background script, See
// https://developer.chrome.com/extensions/background_pages

chrome
    .runtime
    .onMessage
    .addListener((request, sender, sendResponse) => {
        if (request.type === 'NOTION') {
            chrome
                .storage
                .sync
                .get({
                    authToken: "",
                    botId: "",
                    databaseId: "",
                    databaseTemplateId: "",
                    useNotionTemplate: true
                }, function (items) {
                    addToNotion(request.payload.message, items);
                } // Bulk add tasks to Notion
                )
        } else if (request.type === 'BULKNOTION') {
            chrome
                .storage
                .sync
                .get({
                    authToken: "",
                    botId: "",
                    databaseId: "",
                    databaseTemplateId: "",
                    useNotionTemplate: true
                }, function (items) {
                    for (let i = 0; i < request.payload.message.length; i++) {
                        // Spread out the requests to avoid rate limiting
                        setTimeout(() => {
                            addToNotion(request.payload.message[i], items);
                        }, 1500 * i);
                    }
                })
        } else if (request.type === 'LOGGEDIN') {
            chrome
                .tabs
                .query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome
                        .tabs
                        .remove(tabs[0].id, function () {});
                });
            chrome
                .tabs
                .create({url: "onboarding.html?screen=screen-2"});
        }
        return true;
    });

async function addToNotion(message, items) {
    const notion = new Client({auth: items.authToken})

    let databaseId = "";
    // items.useNotionTemplate stores whether custom layout or built-in
    if (items.databaseTemplateId != "" && items.databaseTemplateId != null) {
        databaseId = items.databaseTemplateId;
    } else {
        databaseId = items.databaseId;
    }

    // Update task if a task with its ID is already in the Notion database
    if (message["id"] != null) {
        try {
            const queryResponse = await notion
                .databases
                .query({
                    database_id: databaseId,
                    filter: {
                        property: "ID",
                        number: {
                            equals: parseInt(message["id"])
                        }
                    }
                })

            try {
                if (queryResponse.results.length === 0) {
                    const addResponse = await notion
                        .pages
                        .create({
                            parent: {
                                database_id: databaseId
                            },
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
                    console.log(addResponse)
                    console.log("Success! Entry added.")
                } else {
                    // Use fetch to update the page instead of the Notion API client because the
                    // client page updating function does not work correctly (returns 400)

                    const pageId = queryResponse.results[0].id;

                    const requestOptions = {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Notion-Version': '2022-02-22',
                            'Authorization': `Bearer ${items.authToken}`
                        },
                        body: JSON.stringify({
                            "properties": {
                                "title": {
                                    "title": [
                                        {
                                            "text": {
                                                "content": message["title"]
                                            }
                                        }
                                    ]
                                },
                                "Type": {
                                    "select": {
                                        "name": message["type"]
                                    }
                                },
                                "Criteria": {
                                    "multi_select": message["criteria"]
                                },
                                "Due": {
                                    "date": {
                                        "start": message["date"]
                                    }
                                }
                            }
                        })
                    };

                    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, requestOptions);
                    if (response.status != 200) {
                        console.error("Error updating page: " + response.status);
                    } else {
                        console.log(updateResponse)
                        console.log("Success! Entry updated.")
                    }
                }
            } catch (error) {
                console.error(error.body)
            }
        } catch (error) {
            console.error(error.body)
        }
    }
}