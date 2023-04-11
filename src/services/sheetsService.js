export const sheetsService = {
    addToService: async function (message, items) {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            chrome.storage.sync.get({
                spreadsheetTemplate: "",
                spreadsheetName: "",
                spreadsheetId: ""
            }, function (items) {
                let newRow = items.spreadsheetTemplate.split(",").map((part) => {
                    let property = part.split("${")[1].split("}")[0];
                    return message[property];
                });

                let init = {
                    method: 'POST',
                    async: true,
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    'contentType': 'json',
                    body: JSON.stringify({
                        "majorDimension": "ROWS",
                        "values": [
                            newRow
                        ]
                    })
                };
                
            fetch(
                "https://sheets.googleapis.com/v4/spreadsheets/" + encodeURI(items.spreadsheetId) + "/values/" + encodeURI(items.spreadsheetName) + "!A%3AZ:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=SHEETS_KEY",
                init
            )
                .then((response) => response.json())
                .then(function (data) {
                    console.log(data)
                }
                );
        });
        });
    }

}



