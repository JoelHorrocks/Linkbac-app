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
                    service: ""
                }, function (items) {
                    if(items.service === "notion") {
                        notionService.addToService(request.payload.message, items);
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
                            if(items.service === "notion") {
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
                        .remove(tabs[0].id, function () {});
                });
            chrome
                .tabs
                .create({url: "onboarding.html?screen=screen-2"});
        }
        //return true;
    });