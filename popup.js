const BOX_SUPPORT_HOST = "support.box.com" // Box Support Site

const extract_box_support_url = (rawUrl) => {
    const url = new URL(rawUrl);
    if (url.host == BOX_SUPPORT_HOST && url.pathname.match(/\/hc\/ja\/articles\/[A-Za-z0-9]+-\S+/)) {
      newUrl = url.origin + url.pathname.replace(/(\/hc\/ja\/articles\/[A-Za-z0-9]+)(\-\S+)/, '$1');
      console.log(newUrl);
      return newUrl;
    } else {
      return rawUrl;
    }
  }

const Switch_Language = () => {
  chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {greeting:"switch_language"}, function(response){
      console.log(response.farewell);
    });
  });
}

const Get_URLnTitle = () => {
    // Get the current page's URL and Title
    // https://developer.chrome.com/extensions/tabs
    chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true },(tabs) => {
      let txt = '';
      let url = tabs[0].url;
      const title = tabs[0].title;

      // Checking Box Support Site
      // url = extract_box_support_url(url);

      // Decoding URL

      url = decodeURI(url);

      // store Title and URL to textarea and copy
      document.querySelector('#txt').value = '* ' + title + '\n' + url;
      copy();
    })
  }

// Copy to clipboad
// https://qiita.com/yukuduri/items/3f2159ab3cec95a1ba28

const copy = () => {
    const copyText = document.querySelector('#txt');
    copyText.select();
    document.execCommand('copy');
    console.log("Copied");
}

window.addEventListener('load',()=>{
    Get_URLnTitle();
    document.querySelector("#copy").addEventListener("click", copy);
    document.querySelector("#switch").addEventListener("click", Switch_Language)
  })