/* global chrome */

import jQuery from 'jquery';

let debugging = true;

const log = {
  debug: function() {
    if (debugging) console.log.apply(null, arguments);
  },
  info: function() {
    console.log.apply(null, arguments);
  }
};

const getTeams = () => {
  const batterFields = [];
  const pitcherFields = [];

  let isPitchingField = false;

  const seasonPointsTable = jQuery('div.season--points--table > section > div > div > div > table');
  const seasonStatsTable  = jQuery('div.season--stats--table > section > div > div > div > table');
  const ownerTable        = jQuery('div.season--stats--table > section > div > table:nth-child(1)');

  const batterFieldsCount = seasonPointsTable.find('colgroup:nth-child(1)')[0].getAttribute('span');
  const pitcherFieldsCount = seasonPointsTable.find('colgroup:nth-child(2)')[0].getAttribute('span');
  log.debug('batterFieldsCount', batterFieldsCount);
  log.debug('pitcherFieldsCount', pitcherFieldsCount);

  seasonPointsTable.find('thead tr th span').each((i, el) => {
    if (i == batterFieldsCount) {
      isPitchingField = true;
    }
    if (isPitchingField) {
      pitcherFields.push(el.innerText);
    } else {
      batterFields.push(el.innerText);
    }
  });

  log.debug('batterFields', batterFields);
  log.debug('pitcherFields', pitcherFields);

  const teamInfo = [];
  const allTeamTotals = [];
  const allTeamStats = [];

  const inner = (a, b) => { return b.innerText; };

  ownerTable.find('div.team__column__content').each((i, el) => {
    // do the team work while we're here
    const teamName = jQuery(el).find('a span')[0].title;
    const ownerName = jQuery(el).find('> span')[0].innerText.match(/\((.+)\)/)[1];
    teamInfo.push({teamName, ownerName});
  });

  seasonPointsTable.find('tbody tr').each((i, el) => {
    const teamTotals = jQuery(el).find('div.points-by-stat').map(inner).get();
    allTeamTotals.push(teamTotals);
  });

  log.debug('allTeamTotals', allTeamTotals);

  seasonStatsTable.find('tbody tr').each((i, el) => {
    const teamStats = jQuery(el).find('div.stat-value').map(inner).get();
    allTeamStats.push(teamStats);
  });

  const allFields = batterFields.concat(pitcherFields);

  const teams = allTeamTotals.map((totals, x) => {
    const team = Object.assign({ stats: {
      batting: {totals: {}, counts: {}},
      pitching: {totals: {}, counts: {}}
    }}, teamInfo[x]);
    totals.forEach((stat, y) => {
      if (y >= batterFields.length) {
        team.stats.pitching.totals[allFields[y]] = stat;
        team.stats.pitching.counts[allFields[y]] = allTeamStats[x][y];
      } else {
        team.stats.batting.totals[allFields[y]] = stat;
        team.stats.batting.counts[allFields[y]] = allTeamStats[x][y];
      }
    });
    return team;
  });

  return teams;
};

const currentView = () => {
  const isDaily = jQuery('button.Button--active:contains(Daily Stats)').length > 0;
  const isRealTime = jQuery('button.Button--active:contains(Season Stats)').length > 0;
  return isDaily ? 'daily' : (isRealTime ? 'realtime' : 'season');
};

const sendTeams = () => {
  chrome.runtime.sendMessage({ code: 'TEAMS', teams: getTeams(), view: currentView() });
};

if (!window._x_statr_active) {
  chrome.runtime.onMessage.addListener((message) => {
    console.info(message);
    switch (message.code) {
      case 'GET_TEAMS':
        sendTeams();
      break;
      default:
      break;
    }
  });
  window._x_statr_active = true;
}

//sendTeams();
chrome.runtime.sendMessage({ code: 'CONTENTSCRIPT_ACTIVE' });
