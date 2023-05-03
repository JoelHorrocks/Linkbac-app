'use strict';

import './options.css';

var classMap = {}

// Saves options to chrome.storage
function save_options() {
    var service = document.getElementById('service').value;

    // TODO: auto detect + allow changing
    var useNotionTemplate = document.getElementById('template').checked;

    var dbId = document.getElementById('database_id').value;

    // If off, allow setting custom database ID. If on, check if database is given. If not, ask for ID.

    chrome.storage.sync.set({
        chosenService: service,
        useNotionTemplate: useNotionTemplate,
        savedClassMap: classMap,
        databaseId: dbId,
        spreadsheetId: document.getElementById('sheets-spreadsheet-id').value,
        spreadsheetName: document.getElementById('sheets-spreadsheet-name').value,
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        chosenService: 'Notion',
        useNotionTemplate: true,
        savedClassMap: {},
        authToken: "",
        botId: "",
        databaseTemplateId: "",
        databaseId: "",
        service: "",
        spreadsheetId: "",
        spreadsheetName: "",
        spreadsheetTemplate: ""
    }, function (items) {
        document.getElementById('service').value = items.chosenService;
        document.getElementById('template').checked = items.useNotionTemplate;
        document.getElementById('custom').checked = !items.useNotionTemplate;

        if (items.databaseTemplateId == "" || items.databaseTemplateId == null) {
            document.getElementById('template_notice').style.display = "none";
            document.getElementById('database_id').value = items.databaseId;
        }
        else {
            document.getElementById('database_id').style.display = "none";
        }

        if (items.authToken != "" && items.botId != "") {
            document.getElementById("sign-in").innerHTML = "Sign out";
            document.getElementById("sign-in").addEventListener(
                'click', () => {
                    chrome.storage.sync.set({
                        authToken: "",
                        botId: "",
                        databaseId: ""
                    }, function () {
                        document.getElementById("sign-in").innerHTML = "Sign in";
                        document.getElementById("sign-in").addEventListener(
                            'click', () => { document.location.href = "https://linkbac.app/oauth/oauth.php"; })
                    }
                    )
                })
        } else {
            document.getElementById("sign-in").addEventListener(
                'click', () => { document.location.href = "https://linkbac.app/oauth/oauth.php"; })
        }

        classMap = items.savedClassMap;

        for (const i in classMap) {
            let className = i;
            let classValue = classMap[i];

            let span = document.createElement("span")
            let classInput = document.createElement("input")
            classInput.value = i

            let valueInput = document.createElement("input")
            valueInput.value = classMap[i]

            classInput.addEventListener('change', () => {
                delete classMap[className];
                className = classInput.value;
                classMap[className] = classValue;
                save_options();
            })
            valueInput.addEventListener('change', () => {
                classMap[className] = valueInput.value;
                save_options();
            })

            let deleteButton = document.createElement("button")
            deleteButton.innerText = "Delete"

            deleteButton.addEventListener('click', () => {
                delete classMap[className];
                span.remove();
                save_options();
            })

            let elements = [classInput, valueInput, deleteButton, document.createElement("br")]
            for (const i of elements) {
                span.appendChild(i)
            }

            document.getElementById("mappings").appendChild(span)
        }

        document.getElementById("service").value = items.service;

        if (items.service == "notion") {
            document.getElementById("notion-conditional").style.display = "block";
        }
        else if (items.service == "google-sheets") {
            document.getElementById("sheets-conditional").style.display = "block";
            document.getElementById("sign-in").style.display = "none";

            document.getElementById("sheets-spreadsheet-id").value = items.spreadsheetId;
            document.getElementById("sheets-spreadsheet-name").value = items.spreadsheetName;

            chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
                const init = {
                    method: 'GET',
                    async: true,
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    cache: 'default'
                };

                document.getElementById("sheets-spreadsheet-id").addEventListener('change', () => {
                    // If new spreadsheet only has one sheet, hide sheet name input and set sheet value to the only sheet name
                    fetch(
                        'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '?key=SHEETS_KEY',
                        init
                    )
                        .then((response) => {
                            return response.json();
                        })
                        .then((json) => {
                            if (json.sheets.length == 1) {
                                document.getElementById("sheet-name-conditional").style.display = "none";
                                document.getElementById("sheets-sheet-name").value = json.sheets[0].properties.title;
                                save_options();

                                document.getElementById("sheet-name-conditional").style.display = "block";
                                // show preview of spreadsheet of chosen sheet
                                fetch(
                                    'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '/values/' + items.spreadsheetName + '?key=SHEETS_KEY',
                                    init
                                )
                                    .then((response) => {
                                        return response.json();
                                    }
                                    )
                                    .then((json) => {
                                        displaySpreadsheetPreview(json.values, items);
                                    });
                            }
                            else {
                                document.getElementById("sheet-name-conditional").style.display = "block";
                                save_options();
                            }
                        });
                })

                // Check if spreadsheet has more than one sheet, if so show sheet name input
                fetch(
                    'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '?key=SHEETS_KEY',
                    init
                )
                    .then((response) => {
                        return response.json();
                    }
                    )
                    .then((json) => {
                        if (json.sheets.length > 1) {
                            document.getElementById("sheet-name-conditional").style.display = "block";
                            // show preview of spreadsheet of chosen sheet
                            fetch(
                                'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '/values/' + items.spreadsheetName + '?key=SHEETS_KEY',
                                init
                            )
                                .then((response) => {
                                    return response.json();
                                }
                                )
                                .then((json) => {
                                    displaySpreadsheetPreview(json.values, items);
                                });
                        }
                        else {
                            displaySpreadsheetPreview(json.sheets[0].data[0].rowData, items);
                        }
                    });

                document.getElementById("sheets-spreadsheet-name").addEventListener('change', () => {
                    save_options();
                    fetch(
                        'https://sheets.googleapis.com/v4/spreadsheets/' + document.getElementById("sheets-spreadsheet-id").value + '/values/' + document.getElementById("sheets-spreadsheet-name").value + '?key=SHEETS_KEY',
                        init
                    )
                        .then((response) => {
                            return response.json();
                        }
                        )
                        .then((json) => {
                            displaySpreadsheetPreview(json.values, items);
                        });
                });

            });
        }

    });
}

function displaySpreadsheetPreview(rows, items) {
    document.getElementById("sheet-table").innerHTML = "";

    let headers = rows[0];

    // show in table
    let tr = document.createElement("tr")
    document.getElementById("sheet-table").appendChild(tr)
    let options = document.createElement("tr")
    document.getElementById("sheet-table").appendChild(options)

    for (const i of headers) {
        let th = document.createElement("th")
        th.innerText = i
        tr.appendChild(th)
        let option = document.createElement("td")
        let select = document.createElement("select")

        let selectOptions = [
            { value: "none", text: "None" }, 
            { value: "id", text: "ID" }, 
            { value: "title", text: "Title" }, 
            { value: "description", text: "Description" },
            { value: "type", text: "Type" }, 
            { value: "class", text: "Class" }, 
            { value: "criteria", text: "Criteria" }, 
            { value: "date", text: "Date" }, 
            { value: "emoji", text: "Emoji" }
        ]

        for (const j of selectOptions) {
            let option = document.createElement("option")
            option.value = j.value
            option.innerText = j.text
            select.appendChild(option)
        }

        option.appendChild(select)
        options.appendChild(option)
    }

    // add event listeners to select
    let selects = options.getElementsByTagName("select")
    for (const i of selects) {
        if (items.spreadsheetTemplate.split(",").length == selects.length) {
            let values = items.spreadsheetTemplate.split(",")
            i.value = values[Array.from(selects).indexOf(i)].replace("${", "").replace("}", "")
        }
        i.addEventListener("change", function () {
            // log comma separated values of all selects
            let values = ""
            for (const j of selects) {
                values += "${" + j.value + "},"
            }

            chrome.storage.sync.set({
                spreadsheetTemplate: values.substring(0, values.length - 1)
            });

            // Warn the user if no ID column is selected
            if (values.indexOf("${id}") == -1) {
                document.getElementById("id-warning").style.display = "block";
            }
            else {
                document.getElementById("id-warning").style.display = "none";
            }

            checkNextScreen3Valid();
        });
    }
    document.getElementById("sheets-loader").style.display = "none";
}

function map_class() {
    if (Object.hasOwn(classMap, document.getElementById("class").value)) {
        alert("Class already mapped!")
        return;
    }

    let className = document.getElementById("class").value;
    let classValue = document.getElementById("class-value").value;

    document.getElementById("class").value = "";
    document.getElementById("class-value").value = "";

    classMap[className] = classValue

    let span = document.createElement("span")
    let classInput = document.createElement("input")
    classInput.value = className

    let valueInput = document.createElement("input")
    valueInput.value = classValue

    classInput.addEventListener('change', () => {
        delete classMap[className];
        className = classInput.value;
        classMap[className] = classValue;
        save_options();
    })
    valueInput.addEventListener('change', () => {
        classMap[className] = valueInput.value;
        save_options();
    })

    let deleteButton = document.createElement("button")
    deleteButton.innerText = "Delete"

    deleteButton.addEventListener('click', () => {
        delete classMap[className];
        span.remove();
        save_options();
    })

    let elements = [classInput, valueInput, deleteButton, document.createElement("br")]
    for (const i of elements) {
        span.appendChild(i)
    }

    document.getElementById("mappings").appendChild(span)
    save_options();
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('map').addEventListener('click',
    map_class)
document.getElementById('service').addEventListener('change',
    save_options)
document.getElementById('template').addEventListener('change',
    save_options)
document.getElementById('custom').addEventListener('change',
    save_options)
document.getElementById('database_id').addEventListener('change',
    save_options)