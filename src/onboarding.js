import './onboarding.css';
import {Client} from '@notionhq/client';

let selectedService = "";

function debounce(callback, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(function () { callback.apply(this, args); }, wait);
    };
}

// Update and read URL parameters to find which screen to display so that the user can refresh the page and not lose their progress (and so OAuth can redirect back to the correct screen)
document.addEventListener(
    "DOMContentLoaded",
    function () {
        var params = new URLSearchParams(window.location.search);
        var screen = params.get("screen");
        if (screen != null) {
            chrome.storage.sync.get({
                service: ""
            }, function (items) {
                if (items.service != "") {
                    selectService(items.service);
                }
                nextScreen(screen);
            });
        }
        
        chrome.storage.sync.get({
            service: ""
        }, function (items) {
            if(items.service == "notion") {

        chrome.storage.sync.get({
            authToken: ""
        }, function (items) {
            if (items.authToken != "") {
                document.getElementById("sign-in-text").remove();
                document.getElementById("notion-sign-in-button").innerHTML = "Signed in";
                document.getElementById("sign-in-notion").style.display = "block";
                document.getElementById("next-screen-2").disabled = false;
                document.getElementById("next-screen-2").classList.remove("opacity-50");
                document.getElementById("next-screen-2").classList.remove("cursor-default");
                document.getElementById("next-screen-2").classList.add("hover:bg-lime-800");
            }
        });
            }
            else if(items.service == "google-sheets") {

        // Check if user is signed in to Google Sheets without prompting them to sign in
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
            if (token != null) {
                updateSignInStatus(true);
            }
        });
    }
        });
    }
);

function nextScreen(screen) {
    document.getElementById("screen-1").style.display = "none";
    document.getElementById("screen-2").style.display = "none";
    document.getElementById("screen-3").style.display = "none";
    document.getElementById(screen).style.display = "flex";
    history.pushState(null, null, "?screen=" + screen);
}

function selectService(service) {
    selectedService = service;
    // TODO: make this a class, remove all classes from all elements, then add the class to the selected element
    // , "google-calendar"
    let services = ["notion", "google-sheets"];
    for (const i of services) {
        for (const j of document.getElementById(i).childNodes) {
            if (j.tagName == "P") {
                j.classList.remove("text-blue-500");
            }
        }
    }

    // Set service text inside span to blue
    for (var i = 0; i < document.getElementById(service).childNodes.length; i++) {
        if (document.getElementById(service).childNodes[i].tagName == "P") {
            document.getElementById(service).childNodes[i].classList.add("text-blue-500");
        }
    }

    chrome.storage.sync.set({
        service: service
    }, function () {
        console.log("Service set to " + service);
    });

    // un disable next button
    document.getElementById("next-screen-1").disabled = false;
    document.getElementById("next-screen-1").classList.remove("opacity-50");
    document.getElementById("next-screen-1").classList.remove("cursor-default");
    document.getElementById("next-screen-1").classList.add("hover:bg-lime-800");

    console.log(service);
}

document.getElementById("sign-in-notion").addEventListener("click", function () {
    document.location.href = 'https://linkbac.app/oauth/oauth.php';
});

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        if (document.getElementById("sign-in-text") != null) {
            document.getElementById("sign-in-text").remove();
        }
        document.getElementById("sheets-sign-in-button").innerHTML = "Signed in";
        document.getElementById("calendar-sign-in-button").innerHTML = "Signed in";
        document.getElementById("next-screen-2").disabled = false;
        document.getElementById("next-screen-2").classList.remove("opacity-50");
        document.getElementById("next-screen-2").classList.remove("cursor-default");
        document.getElementById("next-screen-2").classList.add("hover:bg-lime-800");
    }
}

document.getElementById("sign-in-sheets").addEventListener("click", function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (token != null) {
            updateSignInStatus(true);
        }
    });
});

document.getElementById("next-screen-1").addEventListener("click", function () {
    nextScreen("screen-2");

    if (selectedService == "notion") {
        document.getElementById("sign-in-notion").style.display = "block";
    } else if (selectedService == "google-sheets") {
        document.getElementById("sign-in-sheets").style.display = "block";
    } else {
        document.getElementById("sign-in-calendar").style.display = "block";
    }
});

document.getElementById("next-screen-2").addEventListener("click", function () {
    nextScreen("screen-3");

    if (selectedService == "notion") {
        document.getElementById("notion-conditional").style.display = "block";

        // Hide custom-template-conditional if user is not using custom template
        chrome.storage.sync.get({
            databaseTemplateId: ""
        }, function (items) {
            if (items.databaseTemplateId == "" || items.databaseTemplateId == null) {
                document.getElementById("custom-template-conditional").style.display = "block";
            } else {
                document.getElementById("custom-template-conditional").style.display = "none";
            }
        });
    } else if (selectedService == "google-sheets") {
        document.getElementById("sheets-conditional").style.display = "block";
    } else {
        document.getElementById("calendar-conditional").style.display = "block";
    }


    checkNextScreen3Valid();
});

document.getElementById("notion").addEventListener("click", function () {
    selectService("notion");
});

document.getElementById("google-sheets").addEventListener("click", function () {
    selectService("google-sheets");
});

/*document.getElementById("google-calendar").addEventListener("click", function () {
    selectService("google-calendar");
});*/

// Allow selecting either custom template or built-in template using radio selection
document.getElementById("notion-template").addEventListener("click", function () {
    chrome.storage.sync.set({
        useNotionTemplate: true
    });
    document.getElementById("notion-custom-conditional").style.display = "none";
    checkNextScreen3Valid();
});


function displayNotionPreview(headers, items) {
    document.getElementById("notion-table").innerHTML = "";

    // show in table
    let tr = document.createElement("tr")
    document.getElementById("notion-table").appendChild(tr)
    let options = document.createElement("tr")
    document.getElementById("notion-table").appendChild(options)

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

    let selects = options.getElementsByTagName("select")
    for (const i of selects) {
        if (items.notionTemplate.split(",").length == selects.length) {
            let values = items.notionTemplate.split(",")
            i.value = values[Array.from(selects).indexOf(i)].replace("${", "").replace("}", "")
        }
        i.addEventListener("change", function () {
            // log comma separated values of all selects
            let values = ""
            for (const j of selects) {
                values += "${" + j.value + "},"
            }

            chrome.storage.sync.set({
                notionTemplate: values.substring(0, values.length - 1)
            });

            // Warn the user if no ID column is selected
            if (values.indexOf("${id}") == -1) {
                document.getElementById("notion-id-warning").style.display = "block";
            }
            else {
                document.getElementById("notion-id-warning").style.display = "none";
            }
        });
    }
}

document.getElementById("custom-notion-database").addEventListener("click", function () {
    chrome.storage.sync.set({
        useNotionTemplate: false
    });
    document.getElementById("notion-custom-conditional").style.display = "block";
    chrome.storage.sync.get({
        authToken: "",
        databaseId: "",
        notionTemplate: ""
    }, function (items) {
        if(items.databaseId == "") {
    const notion = new Client({ auth: items.authToken });
    notion.databases.retrieve({ database_id: items.databaseId })
        .then(response => {
            let properties = response.properties;
            properties = Object.keys(properties).map(key => properties[key].name);
            console.log(properties);
            document.getElementById("notion-table-error").innerHTML = "";
            displayNotionPreview(properties, items);
        }
        )
    }
    else {
        document.getElementById("notion-table-error").innerHTML = "Please enter your Notion database ID.";
    }
    });
    checkNextScreen3Valid();
});

// Allow setting custom template ID
document.getElementById("notion-database-id").addEventListener("change", function () {
    chrome.storage.sync.set({
        databaseId: document.getElementById("notion-database-id").value
    });
    chrome.storage.sync.get({
        authToken: "",
        databaseId: "",
        notionTemplate: "",
        useNotionTemplate: true
    }, function (items) {
        if(items.useNotionTemplate == false && items.databaseId != "") {
            const notion = new Client({ auth: items.authToken });
            notion.databases.retrieve({ database_id: items.databaseId })
                .then(response => {
                    let properties = response.properties;
                    properties = Object.keys(properties).map(key => properties[key].name);
                    console.log(properties);
                    document.getElementById("notion-table-error").innerHTML = "";
                    displayNotionPreview(properties, items);
                }
                )
        }
    });
    checkNextScreen3Valid();
});

document.getElementById("class-mapping").addEventListener("click", function () {
    document.getElementById("class-mapping-modal").style.display = "block";
});

var classMap = {}

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
}

document.getElementById("map").addEventListener("click", map_class);
document.getElementById("add-class-mapping").addEventListener("click", function () {
    chrome.storage.sync.set({
        savedClassMap: classMap
    }, function () {
        // TODO: Update status to let user know options were saved.
        document.getElementById("class-mapping-modal").style.display = "none";
    });
});
document.getElementById("close-class-mapping-modal").addEventListener("click", function () {
    document.getElementById("class-mapping-modal").style.display = "none";
});

document.getElementById("next-screen-3").addEventListener("click", function () {
    nextScreen("screen-4");
});

function checkNextScreen3Valid() {
    if(selectedService == "notion") {
        chrome.storage.sync.get({
            databaseTemplateId: ""
        }, function (items) {
            if (document.getElementById("notion-database-id").value != "" && (document.getElementById("notion-template").checked == true || document.getElementById("custom-notion-database").checked == true)) {
                document.getElementById("next-screen-3").disabled = false;
                document.getElementById("next-screen-3").classList.remove("opacity-50");
                document.getElementById("next-screen-3").classList.remove("cursor-default");
                document.getElementById("next-screen-3").classList.add("hover:bg-lime-800");
            } else if (items.databaseTemplateId != "" && items.databaseTemplateId != null) {
                document.getElementById("next-screen-3").disabled = false;
                document.getElementById("next-screen-3").classList.remove("opacity-50");
                document.getElementById("next-screen-3").classList.remove("cursor-default");
                document.getElementById("next-screen-3").classList.add("hover:bg-lime-800");
            } else {
                document.getElementById("next-screen-3").disabled = true;
                document.getElementById("next-screen-3").classList.add("opacity-50");
                document.getElementById("next-screen-3").classList.add("cursor-default");
                document.getElementById("next-screen-3").classList.remove("hover:bg-blue-600");
            }
        });
    }
    else if (selectedService == "google-sheets") {
        // get table, check if number of select inputs is more than 0, and if so, make sure one is set to ID. if so, enable next button
        let table = document.getElementById("sheet-table")
        let select = table.getElementsByTagName("select")
        let idSelected = false
        for (let i = 0; i < select.length; i++) {
            if (select[i].value == "id") {
                idSelected = true
            }
        }
        if (idSelected) {
            document.getElementById("next-screen-3").disabled = false;
            document.getElementById("next-screen-3").classList.remove("opacity-50");
            document.getElementById("next-screen-3").classList.remove("cursor-default");
            document.getElementById("next-screen-3").classList.add("hover:bg-blue-600");
        }
    }
}

document.getElementById("sheets-spreadsheet-id").addEventListener("keyup", debounce(() => {
    chrome.storage.sync.set({
        spreadsheetId: document.getElementById("sheets-spreadsheet-id").value
    });
    updateSpreadsheetPreview();
    //checkNextScreen3Valid();
}, 1000));

document.getElementById("sheets-spreadsheet-name").addEventListener("keyup", debounce(() => {
    chrome.storage.sync.set({
        spreadsheetName: document.getElementById("sheets-spreadsheet-name").value
    });
    updateSpreadsheetPreview();
}, 1000));

function updateSpreadsheetPreview() {
    document.getElementById("sheets-loader").style.display = "block";
    document.getElementById("sheet-table-error").innerText = "";
    document.getElementById("sheet-table").innerHTML = "";
    if (document.getElementById("sheets-spreadsheet-id").value == "") {
        document.getElementById("sheets-loader").style.display = "none";
        document.getElementById("sheet-table-error").innerText = "Please enter spreadsheet ID";
        return;
    }
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        chrome.storage.sync.get({
            spreadsheetId: "",
            spreadsheetName: ""
        }, function (items) {
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
            // get spreadsheet from sheets api
            fetch(
                'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '?key=SHEETS_KEY',
                init
            )
                .then((response) => {
                    if (response.status != 200) {
                        document.getElementById("sheets-loader").style.display = "none";
                        document.getElementById("sheet-table-error").innerText = "Error retrieving spreadsheet. Please check the spreadsheet ID, make sure you have completed the 'Open with Link for MB' process and try again.";
                    }
                    return response.json();
                })
                .then((json) => {
                    if (json.sheets.length > 1) {
                        document.getElementById("sheet-name-conditional").style.display = "block";

                        if (items.spreadsheetName != "" && document.getElementById("sheets-spreadsheet-name").value != "") {
                            // get sheet from sheets api
                            fetch(
                                'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '/values/' + items.spreadsheetName + '?key=SHEETS_KEY',
                                init
                            )
                                .then((response) => {
                                    if (response.status != 200) {
                                        document.getElementById("sheets-loader").style.display = "none";
                                        document.getElementById("sheet-table-error").innerText = "Error retrieving sheet. Please check the sheet name and try again.";
                                    }
                                    return response.json();
                                })
                                .then((json) => {
                                    document.getElementById("sheets-loader").style.display = "none";
                                    if (json.values == undefined) {
                                        document.getElementById("sheet-table-error").innerText = "No rows found in sheet. Please check the sheet name and try again.";
                                        return;
                                    }
                                    else if (json.values[0].length == 0) {
                                        document.getElementById("sheet-table-error").innerText = "No header row found in sheet. Please create a header row in the sheet in the top row.";
                                        return;
                                    }
                                    let rows = json.values;
                                    displaySpreadsheetPreview(rows);
                                    document.getElementById("sheet-table-error").innerText = "";
                                })
                        }
                        else if (items.spreadsheetName == "" || document.getElementById("sheets-spreadsheet-name").value == "") {
                            document.getElementById("sheets-loader").style.display = "none";
                            document.getElementById("sheet-table").innerHTML = "";
                            document.getElementById("sheet-table-error").innerText = "Please enter a sheet name.";
                        }
                    }
                    else {
                        document.getElementById("sheet-name-conditional").style.display = "none";
                        fetch(
                            'https://sheets.googleapis.com/v4/spreadsheets/' + items.spreadsheetId + '/values/' + json.sheets[0].properties.title + '?key=SHEETS_KEY',
                            init
                        )
                            .then((response) => {
                                if (response.status != 200) {
                                    document.getElementById("sheets-loader").style.display = "none";
                                    document.getElementById("sheet-table-error").innerText = "Error retrieving sheet. Please check the sheet name and try again.";
                                }
                                return response.json();
                            }
                            )
                            .then((json) => {
                                document.getElementById("sheets-loader").style.display = "none";
                                if (json.values == undefined) {
                                    document.getElementById("sheet-table-error").innerText = "No rows found in sheet. Please create a header row in the sheet.";
                                    return;
                                }
                                else if (json.values[0].length == 0) {
                                    document.getElementById("sheet-table-error").innerText = "No header row found in sheet. Please create a header row in the sheet in the top row.";
                                    return;
                                }
                                let rows = json.values;
                                displaySpreadsheetPreview(rows);
                                document.getElementById("sheet-table-error").innerText = "";
                            })

                    }
                }
                )

        });
    });
}

function displaySpreadsheetPreview(rows) {
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
        i.addEventListener("change", function () {
            // log comma separated values of all selects
            let values = ""
            for (const j of selects) {
                values += "${" + j.value + "},"
            }

            chrome.storage.sync.set({
                spreadsheetTemplate: values.substring(0, values.length - 1)
            });
            checkNextScreen3Valid();
        });
    }
    document.getElementById("sheets-loader").style.display = "none";
}

document.getElementById("refresh-sheet").addEventListener("click", function () {
    updateSpreadsheetPreview();
});

function updateNotionPreview() {
    // clear preview
    document.getElementById("notion-table").innerHTML = "";
    chrome.storage.sync.get({
        authToken: "",
        databaseId: "",
        notionTemplate: ""
    }, function (items) {
    const notion = new Client({ auth: items.authToken });
    notion.databases.retrieve({ database_id: items.databaseId })
        .then(response => {
            let properties = response.properties;
            properties = Object.keys(properties).map(key => properties[key].name);
            console.log(properties);
            document.getElementById("notion-table-error").innerHTML = "";
            displayNotionPreview(properties, items);
        }
        )
    });
}

document.getElementById("refresh-notion").addEventListener("click", function () {
    updateNotionPreview();
});
