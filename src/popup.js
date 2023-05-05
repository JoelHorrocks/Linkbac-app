'use strict';

import './popup.css';

(function () {
    function setupPage() {
        document.getElementById('closebtn').addEventListener('click', () => {
            document.getElementById('alert').classList.add('hidden');
        });
        document
            .getElementById('sync')
            .addEventListener('click', () => {
                // show loading
                document.getElementById("loader").classList.remove("hidden");
                chrome
                    .tabs
                    .query({
                        active: true,
                        currentWindow: true
                    }, (tabs) => {
                        const tab = tabs[0];
                        chrome
                            .tabs
                            .sendMessage(tab.id, {
                                type: 'SYNC',
                                payload: {}
                            }, (response) => {
                                if(response.success) {
                                    document.getElementById("loader").classList.add("hidden");
                                    document.getElementById("checkmark").classList.remove("hidden");
                                    setTimeout(() => {
                                        document.getElementById("checkmark").classList.add("hidden-fade");
                                        setTimeout(() => {
                                            document.getElementById("checkmark").classList.add("hidden");
                                            document.getElementById("checkmark").classList.remove("hidden-fade");
                                        }, 200);
                                    }, 2000);
                                }
                                else {
                                    chrome.storage.sync.get({
                                        service: ""
                                    }, function (items) {
                                    document.getElementById("loader").classList.add("hidden");
                                    document.getElementById("cross").classList.remove("hidden");
                                    document.getElementById("alert").classList.remove("hidden");
                                    // Interpret Notion error messages
                                    if(items.service === "notion") {
                                    if(response.error.includes("invalid_request_url")) {
                                        document.getElementById("alert-text").innerText = "Sync failed. Please check your Notion database ID in the settings.";
                                    }
                                    else if(response.error.includes("unauthorized")) {
                                        document.getElementById("alert-text").innerText = "Sync failed. Your Notion auth token is invalid. Please sign out of Notion and back in again in settings.";
                                    }
                                    else if(response.error.includes("object_not_found")) {
                                        document.getElementById("alert-text").innerText = "Sync failed. Linkbac does not have access to your Notion database. Please sign out of Notion and back in again in settings and give the Linkbac integration access to your database.";
                                    }
                                    else if(response.error == undefined) {
                                        document.getElementById("alert-text").innerText = "Sync failed. Please check your internet connection and try again.";
                                    }
                                    else {
                                        document.getElementById("alert-text").innerText = "Sync failed. An unknown error occured. Please try again.";
                                    }
                                }
                                    setTimeout(() => {
                                        document.getElementById("cross").classList.add("hidden-fade");
                                        setTimeout(() => {
                                            document.getElementById("cross").classList.add("hidden");
                                            document.getElementById("cross").classList.remove("hidden-fade");
                                        }, 200);
                                    }, 2000);
                                    setTimeout(() => {
                                        document.getElementById("alert").classList.add("hidden-fade");
                                        setTimeout(() => {
                                            document.getElementById("alert").classList.add("hidden");
                                            document.getElementById("alert").classList.remove("hidden-fade");
                                        }
                                        , 200);
                                    }
                                    , 15000);
                                });
                            };
                        });
                    });
            });
        document
            .getElementById('settings')
            .addEventListener('click', function () {
                if (chrome.runtime.openOptionsPage) {
                    chrome
                        .runtime
                        .openOptionsPage();
                } else {
                    window.open(chrome.runtime.getURL('options.html'));
                }
            });
        // Check if the page is a task, the task overview page or another ManageBac page
        // that does not support expoting by requesting from the content script

        chrome
            .tabs
            .query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                const tab = tabs[0];
                if (tab.url.includes("core_tasks")) {
                    document
                        .getElementById('sync')
                        .style
                        .display = "block";
                    chrome.storage.sync.get({
                        service: ""
                    }, function (items) {
                        console.log(items.service)
                        if (items.service === "notion") {
                            document
                                .getElementById('sync-text')
                                .innerText = "Sync with Notion";
                        } else if (items.service === "google-sheets") {
                            document
                                .getElementById('sync-text')
                                .innerText = "Sync with Sheets";
                        } 
                    });
                } else if (tab.url.includes("tasks_and_deadlines")) {
                    document
                        .getElementById('sync')
                        .style
                        .display = "block";
                    chrome.storage.sync.get({
                        service: ""
                    }, function (items) {
                        if (items.service === "notion") {
                            document
                                .getElementById('sync-text')
                                .innerText = "Sync upcoming tasks with Notion";
                        } else if (items.service === "google-sheets") {
                            document
                                .getElementById('sync-text')
                                .innerText = "Sync upcoming tasks with Sheets";
                        }
                    });
                } else {
                    document
                        .getElementById('sync')
                        .style
                        .display = "none";
                }
            });
    }

    document.addEventListener('DOMContentLoaded', setupPage);
})();
