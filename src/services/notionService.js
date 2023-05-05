import {Client} from "@notionhq/client";

export const notionService = {
    addToService: async function (message, items) {
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
                            },
                            children: [
                                // if message["description"] is null, do not add a description, otherwise add it
                                message["description"] != null
                                    ? {
                                        object: "block",
                                        type: "paragraph",
                                        paragraph: {
                                            rich_text : [
                                                {
                                                    type: "text",
                                                    text: {
                                                        content: message["description"]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                    : {}
                            ]
                        })
                    console.log(addResponse)
                    console.log("Success! Entry added.")
                    return {success: true};
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
                        return {success: false, error: response.status};
                    } else {
                        console.log("Success! Entry updated.")
                        return {success: true};
                    }
                }
            } catch (error) {
                console.error(error)
                return {success: false, error: error.body};
            }
        } catch (error) {
            console.error(error)
            return {success: false, error: error.body};
        }
    }
}}