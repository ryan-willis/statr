import React, { Component, Fragment } from 'react';
import { Tab, Tabs as RawTabs } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

/**
 * Modules
 */
import Dispatcher from '../lib/dispatcher';
import BrowserTab from '../lib/tab';

/**
 * Components
 */
import Teams from '../components/teams';
import Error from '../components/error';

const Tabs = withStyles({
  indicator: {
    backgroundColor: '#004660'
  }
})(RawTabs);

const Loading = () => (<h2>Loading...</h2>);

/**
 * Container definition
 */
export default class Home extends Component {

  constructor (props) {
    super(props);
    this._timer = false;
    this._live = true;
  }

  state = {
    script_active: false,
    invalid_page: false,
    tab: 0
  };

  componentDidMount = () => {
    this._catch = Dispatcher.register(this._catcher);
  }

  componentWillUnmount = () => {
    Dispatcher.unregister(this._catch);
    if (this._live && this._timer !== false) {
      clearInterval(this._timer);
    }
  }

  getTeams = () => {
    BrowserTab.msg({code: 'GET_TEAMS'});
    if (this._live && this._timer === false) {
      this._timer = setInterval(this.getTeams, 1000);
    }
  }

  navigate = (ev, tab) => {
    this.setState({tab});
  }

  _catcher = (payload) => {
    switch (payload.code) {
      case 'CONTENTSCRIPT_ACTIVE': this.setState({script_active: true}, this.getTeams); break;
      case 'INVALID_PAGE': this.setState({invalid_page: true}); break;
      default: break;
    }
  }

  boop = () => {
    BrowserTab.msg({boo: 'per'});
  }

  render = () => {
    if (!this.state.script_active) {
      return <Loading />;
    }
    if (this.state.invalid_page) {
      return <Error />;
    }
    return (
      <Fragment>
        <Tabs value={this.state.tab} onChange={this.navigate}><Tab label='Standings' /></Tabs>
        <div>{this.state.tab === 0 ? <Teams /> : null}</div>
      </Fragment>
    );
  }
}
