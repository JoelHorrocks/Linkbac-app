'use strict';

import { notionService } from './services/notionService.js';
import { sheetsService } from './services/sheetsService.js';

// With background scripts you can communicate with popup and contentScript
// files. For more information on background script, See
// https://developer.chrome.com/extensions/background_pages

chrome
    .runtime
    .onMessage
    .addListener((request, sender, sendResponse) => {
        if (request.type === 'SYNC') {
            chrome
                .storage
                .sync
                .get({
                    authToken: "",
                    botId: "",
                    databaseId: "",
                    databaseTemplateId: "",
                    useNotionTemplate: true,
                    notionTemplate: "",
                    service: ""
                }, function (items) {
                    if (items.service === "notion") {
                        (async () => {
                            let response = await notionService.addToService(request.payload.message, items);
                            console.log(response);
                            sendResponse(response);
                        })();
                    } else if (items.service === "google-sheets") {
                        sheetsService.addToService(request.payload.message, items);
                    }
                }
                )
        } else if (request.type === 'BULKSYNC') {
            chrome
                .storage
                .sync
                .get({
                    authToken: "",
                    botId: "",
                    databaseId: "",
                    databaseTemplateId: "",
                    useNotionTemplate: true,
                    service: ""
                }, function (items) {
                    for (let i = 0; i < request.payload.message.length; i++) {
                        // Spread out the requests to avoid rate limiting
                        setTimeout(() => {
                            if (items.service === "notion") {
                                notionService.addToService(request.payload.message[i], items);
                            } else if (items.service === "google-sheets") {
                                sheetsService.addToService(request.payload.message[i], items);
                            }
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
                        .remove(tabs[0].id, function () { });
                });
                // Get whether to send user back to onboarding or options
                chrome
                .storage
                .sync
                .get({
                    onboardingDone: false
                }, function (items) {
                    if (!items.onboardingDone) {
                        chrome
                            .tabs
                            .create({ url: "onboarding.html?screen=screen-2" });
                    } else {
                        chrome
                            .tabs
                            .create({ url: "options.html" });
                    }
                })
        }
        return true;
    });

    chrome.runtime.onInstalled.addListener(function (object) {
        let internalUrl = chrome.runtime.getURL("onboarding.html");
    
        if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            chrome.tabs.create({ url: internalUrl }, function (tab) {
                console.log("New tab launched with " + internalUrl);
            });
        }
    });