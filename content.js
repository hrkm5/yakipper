const BOX_SUPPORT_HOST = "support.box.com" // Box Support Site
const BOX_DEVELOPER_HOST = "developer.box.com" // Box Developer Site
const JA_BOX_DEVELOPER_HOST = "developer.box.com/ja" // Japanese Box Developer Site
const BOX_DOCS_HOST = "docs.box.com" // Box Docs Site

const _PMSG = PopupMsg.getInstance();

const switch_language = () => {
  console.log("Retriving language...");
  if (document.location.host == BOX_SUPPORT_HOST && document.location.pathname.match(/\/hc\/ja\/*/)){
    let language = document.getElementsByTagName('link');
    for (const element of language) {
      if (element.getAttribute('hreflang') === 'en-us') {
        const redirect_url = element.getAttribute('href')
        location.href = redirect_url;
        console.log('Switched to English ' + redirect_url);
      }
    }
  } else if (document.location.host == BOX_SUPPORT_HOST && document.location.pathname.match(/\/hc\/en-us\/*/)){
    let language = document.getElementsByTagName('link')
    for (const element of language) {
      if (element.getAttribute('hreflang') === 'ja') {
        const redirect_url = element.getAttribute('href')
        location.href = redirect_url;
        console.log('Switched to Japanese ' + redirect_url);
      }
    }
  } else if (document.location.host == BOX_DEVELOPER_HOST) {
    const lang = document.documentElement.lang;
    if (lang === 'ja') {
      redirect_url = "https://" + BOX_DEVELOPER_HOST + document.location.pathname.replace(/^\/ja/, '');
      location.href = redirect_url;
      console.log('Switched to English ' + redirect_url);
    } else if (lang === 'en') {
      redirect_url = "https://" + JA_BOX_DEVELOPER_HOST + document.location.pathname;
      location.href = redirect_url;
      console.log('Switched to Japanese ' + redirect_url);
    }
  } else if (document.location.host == BOX_DOCS_HOST) {
    const lang = document.documentElement.lang;
    if (lang === 'ja') {
      redirect_url = "https://" + BOX_DOCS_HOST + document.location.pathname.replace(/^\/ja/, '/en');
      location.href = redirect_url;
      console.log('Switched to English ' + redirect_url);
    } else if (lang === 'en') {
      redirect_url = "https://" + BOX_DOCS_HOST + document.location.pathname.replace(/^\/en/, '/ja');
      location.href = redirect_url;
      console.log('Switched to Japanese ' + redirect_url);
    }
  }
  console.log('unavailable site');
}

/*
Copy_to_Clipboard() 

Yakipper is currently using Clipboard API
https://web.dev/async-clipboard/

From 87, Chrome started supporting text/html MIME :
https://www.chromestatus.com/feature/5357049665814528

Compatibility :
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#browser_compatibility
*/

const Copy_to_Clipboard = () => {
  let current_url = location.href
  let current_title = document.title

  // decodeURL if needed
  if (decodeURI(current_url).length < location.href.length) {
    current_url = decodeURI(current_url)
    console.log('decoded URL')
  }

  // Read from the cache, never await: the clipboard write has to stay inside
  // the user gesture chain.
  const template = YakipperSettings.activeTemplate();

  // if text is being selected, copy it to clilpboard as well
  if(window.getSelection().toString() != ""){
    // copy to clipboard
    async function copyPageUrl_Selectedtxt() {
      try {
        // Gather selected text and format
        let html = "";
        let textContent = "";
        let sel = window.getSelection();
        console.log(sel);

        if (sel.rangeCount) {
            const container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
            textContent = container.textContent;
        }

        const htmlPayload = YakipperSettings.renderPayload(
          template, { title: current_title, url: current_url, selection: html }, 'html');
        const textPayload = YakipperSettings.renderPayload(
          template, { title: current_title, url: current_url, selection: textContent }, 'text');

        // Write both flavors so plain-text targets get the same content.
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([htmlPayload], { type: "text/html" }),
            "text/plain": new Blob([textPayload], { type: "text/plain" })
          })
        ]);
        _showPopupMessage(textPayload);
        console.log('Page URL & selected text are copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    copyPageUrl_Selectedtxt().then(result => {
         console.log(result);
    });
  } else {
    async function copyPageUrl() {
      try {
        const textPayload = YakipperSettings.renderPayload(
          template, { title: current_title, url: current_url }, 'text');
        await navigator.clipboard.writeText(textPayload);
        console.log('Page URL is copied to clipboard');
        _showPopupMessage(textPayload);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    copyPageUrl().then(result => {
      console.log(result);
    });
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.greeting == "switch_language"){
      console.log("Got a swtich request")
      switch_language();
      sendResponse({farewell: "Complete"});
    } else if(request.greeting == "copy_clipboard") {
      console.log("content.js : Starting copy_to_clipboard()")
      Copy_to_Clipboard();
      sendResponse({farewell: "Complete"});
    }
});

// __msg is plain text; the popup renders HTML, so escape it first.
function _showPopupMessage(__msg, __style) {
  let header = "Copied to clipboard:\n\n";
  __msg = YakipperSettings.escapeHtml(header + __msg);

  _PMSG.showPopupMessage( __msg.replace(/\n/g, "<br />"),
      {},
      1500 );
}