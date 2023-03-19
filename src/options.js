'use strict';

import { makeConsoleLogger } from '@notionhq/client/build/src/logging';
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
        databaseId: dbId
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
        databaseId: ""
    }, function (items) {
        document.getElementById('service').value = items.chosenService;
        document.getElementById('template').checked = items.useNotionTemplate;
        document.getElementById('custom').checked = !items.useNotionTemplate;

        if(items.databaseTemplateId == "" || items.databaseTemplateId == null) {
            document.getElementById('template_notice').style.display = "none";
            document.getElementById('database_id').value = items.databaseId;
        }
        else {
            document.getElementById('database_id').style.display = "none";
        }

        if(items.authToken != "" && items.botId != ""){
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
                            'click', () => { document.location.href = "https://storeimg.com/linkformb/oauth.php"; })
                     }
                )})
        } else {
            document.getElementById("sign-in").addEventListener(
                'click', () => { document.location.href = "https://storeimg.com/linkformb/oauth.php"; })
        }

        classMap = items.savedClassMap;

        for(const i in classMap) {
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
            for(const i of elements) {
                span.appendChild(i)
            }
        
            document.getElementById("mappings").appendChild(span)
        }
    });
}

function map_class() {
    if(Object.hasOwn(classMap, document.getElementById("class").value)) {
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
    for(const i of elements) {
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