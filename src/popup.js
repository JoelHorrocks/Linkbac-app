'use strict';

import './popup.css';

(function () {
  function setupButtons() {
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
  }

  document.addEventListener('DOMContentLoaded', setupButtons);
})();
