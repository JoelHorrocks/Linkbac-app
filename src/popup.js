'use strict';

import './popup.css';

(function () {
  function setupPage() {
    document.getElementById('notion').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'NOTION',
          payload: {},
        },
        (response) => {
          console.log('Sent signal to contentScript to add to notion');
        }
      );
      });
    });
    document.getElementById('settings').addEventListener('click', function() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
      // Check if the page is a task, the task overview page or another ManageBac page that does not support expoting by requesting from the content script

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if(tab.url.includes("core_tasks")) {
        document.getElementById('notion').style.display = "block";
      }
      else if(tab.url.includes("tasks_and_deadlines")) {
        document.getElementById('notion').style.display = "block";
        document.getElementById('notion').innerText = "Add upcoming tasks to Notion";
      }
      else {
        document.getElementById('notion').style.display = "none";
      }
    });
  }


  document.addEventListener('DOMContentLoaded', setupPage);
})();
