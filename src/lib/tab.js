
class Tab {
  constructor () {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      Object.keys(tabs[0]).forEach(key => {
        this[key] = tabs[0][key];
      });
    });
  }
  msg = (payload) => {
    chrome.tabs.sendMessage(this.id, payload);
  }
}

export default new Tab();
