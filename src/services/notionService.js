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
        if(items.useNotionTemplate) {
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
    } else {
        // get all column headers in database, match with chosen column content
        const database = await notion.databases.retrieve({database_id: databaseId});
        const properties = database.properties;
        const columnHeaders = Object.keys(properties);
        // items.notionTemplate.split(",")
        const columnContents = items.notionTemplate.split(",");
        // if column array lengths are not equal, return error
        if (columnHeaders.length != columnContents.length) {
            return {success: false, error: "notion_column_sizes_not_equal"};
        }
        const columnContentDict = {};
        for (let i = 0; i < columnHeaders.length; i++) {
            columnContentDict[columnHeaders[i]] = message[columnContents[i].replace("${", "").replace("}", "")];
        }
        console.log(columnContentDict);
        // Create new row with column content, try to cast to correct type if possible (get them from database.properties)
        const propertiesDict = {};
        for (let i = 0; i < columnHeaders.length; i++) {
            const column = columnHeaders[i];
            const columnContent = columnContentDict[column];
            // if columnContent is null, do not add it to the propertiesDict
            if (columnContent == null) {
                continue;
            }
            const columnType = properties[column].type;
            if (columnType == "select") {
                propertiesDict[column] = {
                    "select": {
                        "name": columnContent
                    }
                }
            } else if (columnType == "multi_select") {
                propertiesDict[column] = {
                    "multi_select": columnContent
                }
            } else if (columnType == "date") {
                propertiesDict[column] = {
                    "date": {
                        "start": columnContent
                    }
                }
            } else if (columnType == "number") {
                propertiesDict[column] = {
                    "number": parseInt(columnContent)
                }
            } else if (columnType == "title") {
                propertiesDict[column] = {
                    "title": [
                        {
                            "text": {
                                "content": columnContent
                            }
                        }
                    ]
                }
            } else if (columnType == "rich_text") {
                propertiesDict[column] = {
                    "rich_text": [
                        {
                            "text": {
                                "content": columnContent
                            }
                        }
                    ]
                }
            } else {
                // leave empty, TODO: add more types
                propertiesDict[column] = {}
            }
        }
        console.log(propertiesDict);

        // attempt to update if entry already exists
        const queryResponse = await notion
            .databases
            .query({
                database_id: databaseId,
                filter: {
                    // find first ID column name
                    property: columnContents.find((element) => element.includes("ID")).replace("${", "").replace("}", ""),
                    number: {
                        equals: parseInt(message["id"])
                    }
                }
            })
        console.log(queryResponse)
        if (queryResponse.results.length == 0) {
            // entry does not exist, create new entry
        try {
            const addResponse = await notion
                .pages
                .create({
                    parent: {
                        database_id: databaseId
                    },
                    properties: propertiesDict,
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
        } catch (error) {
            console.error(error)
            return {success: false, error: error.body};
        }
    } else {
        try{ 
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
                        ...propertiesDict
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
     catch (error) {
        console.error(error)
        return {success: false, error: error.body};
    }
}
}}}}