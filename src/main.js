/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';

import Dispatcher from './lib/dispatcher';

import Home from './containers/home';

chrome.runtime.onMessage.addListener(message => {
  console.info(message);
  Dispatcher.dispatch(message);
});

const rootEl = document.getElementById('app');

const render = () => {
  ReactDOM.render(<Home />, rootEl);
};

render();

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
    const tab = tabs[0];
    if (tab.url.indexOf('fantasy.espn.com/baseball/league/standings') !== -1) {
      chrome.tabs.executeScript(tab.id, {file: 'scripts/content.js'});
    } else {
      Dispatcher.dispatch({
        code: 'INVALID_PAGE'
      });
    }
  });
});
