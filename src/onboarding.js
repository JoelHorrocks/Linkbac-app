import './onboarding.css';

// Update and read URL parameters to find which screen to display so that the user can refresh the page and not lose their progress (and so OAuth can redirect back to the correct screen)
 document.addEventListener(
    "DOMContentLoaded",
    function () {
        var params = new URLSearchParams(window.location.search);
        var screen = params.get("screen");
        if (screen != null) {
            nextScreen(screen);
        }
        // If OAuth token is saved in Chrome extension storage, reflect that in the UI
        chrome.storage.sync.get({
            authToken: ""
          }, function (items) {
            if (items.authToken != "") {
                document.getElementById("notion-sign-in-text").remove();
                document.getElementById("notion-sign-in-button").innerHTML = "Signed in";
                document.getElementById("next-screen-2").disabled = false;
                document.getElementById("next-screen-2").classList.remove("opacity-50");
                document.getElementById("next-screen-2").classList.remove("cursor-default");
                document.getElementById("next-screen-2").classList.add("hover:bg-blue-600");
            }
        });
    },
)

function nextScreen(screen) {
    document.getElementById("screen-1").style.display = "none";
    document.getElementById("screen-2").style.display = "none";
    document.getElementById("screen-3").style.display = "none";
    document.getElementById(screen).style.display = "flex";
    history.pushState(null, null, "?screen=" + screen);
}

function selectService(service) {
    // TODO: make this a class, remove all classes from all elements, then add the class to the selected element

    let services = ["notion", "google-calendar", "google-sheets"];
    for(const i of services) {
        for (const j of document.getElementById(i).childNodes) {
            if(j.tagName == "P") {
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
    console.log(service);
}

document.getElementById("sign-in-notion").addEventListener("click", function () {
    document.location.href = 'https://storeimg.com/linkformb/oauth.php';
});

document.getElementById("next-screen-1").addEventListener("click", function () {
    nextScreen("screen-2");
});

document.getElementById("next-screen-2").addEventListener("click", function () {
    nextScreen("screen-3");

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
    
    checkNextScreen3Valid();
});

document.getElementById("notion").addEventListener("click", function () {
    selectService("notion");
});

document.getElementById("google-sheets").addEventListener("click", function () {
    selectService("google-sheets");
});

document.getElementById("google-calendar").addEventListener("click", function () {
    selectService("google-calendar");
});

// Allow selecting either custom template or built-in template using radio selection
document.getElementById("notion-template").addEventListener("click", function () {
    chrome.storage.sync.set({
        useNotionTemplate: true
    });
    checkNextScreen3Valid();
});

document.getElementById("custom-notion-database").addEventListener("click", function () {
    chrome.storage.sync.set({
        useNotionTemplate: false
    });
    checkNextScreen3Valid();
});

// Allow setting custom template ID
document.getElementById("notion-database-id").addEventListener("change", function () {
    chrome.storage.sync.set({
        databaseId: document.getElementById("notion-database-id").value
    });
    checkNextScreen3Valid();
});

document.getElementById("class-mapping").addEventListener("click", function () {
    document.getElementById("class-mapping-modal").style.display = "block";
});

var classMap = {}

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
    chrome.storage.sync.get({
        databaseTemplateId: ""
    }, function (items) {
        if (document.getElementById("notion-database-id").value != "" && (document.getElementById("notion-template").checked == true || document.getElementById("custom-notion-database").checked == true)) {
            document.getElementById("next-screen-3").disabled = false;
            document.getElementById("next-screen-3").classList.remove("opacity-50");
            document.getElementById("next-screen-3").classList.remove("cursor-default");
            document.getElementById("next-screen-3").classList.add("hover:bg-blue-600");
        } else if(items.databaseTemplateId != "" && items.databaseTemplateId != null) {
            document.getElementById("next-screen-3").disabled = false;
            document.getElementById("next-screen-3").classList.remove("opacity-50");
            document.getElementById("next-screen-3").classList.remove("cursor-default");
            document.getElementById("next-screen-3").classList.add("hover:bg-blue-600");
        } else {
            document.getElementById("next-screen-3").disabled = true;
            document.getElementById("next-screen-3").classList.add("opacity-50");
            document.getElementById("next-screen-3").classList.add("cursor-default");
            document.getElementById("next-screen-3").classList.remove("hover:bg-blue-600");
        }
    });
}