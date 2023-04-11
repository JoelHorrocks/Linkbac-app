'use strict';

import './popup.css';

(function () {
    function setupPage() {
        document
            .getElementById('sync')
            .addEventListener('click', () => {
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
                                console.log('Sent signal to contentScript to add to service');
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
                                .getElementById('sync')
                                .innerText = "Sync with Notion";
                        } else if (items.service === "google-sheets") {
                            document
                                .getElementById('sync')
                                .innerText = "Sync with Sheets";
                        } else if (items.service === "google-calendar") {
                            document
                                .getElementById('sync')
                                .innerText = "Sync with Calendar";
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
                                .getElementById('sync')
                                .innerText = "Sync upcoming tasks with Notion";
                        } else if (items.service === "google-sheets") {
                            document
                                .getElementById('sync')
                                .innerText = "Sync upcoming tasks with Sheets";
                        } else if (items.service === "google-calendar") {
                            document
                                .getElementById('sync')
                                .innerText = "Sync upcoming tasks with Calendar";
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
