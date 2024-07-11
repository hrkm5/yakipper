const BOX_SUPPORT_HOST = "support.box.com" // Box Support Site
const BOX_DEVELOPER_HOST = "developer.box.com" // Box Developer Site
const JA_BOX_DEVELOPER_HOST = "ja.developer.box.com" // Japanese Box Developer Site

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
  } else if (document.location.host == BOX_DEVELOPER_HOST){
    redirect_url = "https://" + JA_BOX_DEVELOPER_HOST + document.location.pathname;
    location.href = redirect_url;
    console.log('Switched to Japanese ' + redirect_url);
  } else if (document.location.host == JA_BOX_DEVELOPER_HOST) {
    redirect_url = "https://" + BOX_DEVELOPER_HOST + document.location.pathname;
    location.href = redirect_url;
    console.log('Switched to English ' + redirect_url);
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
  let currenct_title = document.title

  // decodeURL if needed
  if (decodeURI(current_url).length < location.href.length) {
    current_url = decodeURI(current_url)
    console.log('decoded URL')
  }

  const urlntitle = '* ' + currenct_title + '\n' + current_url;

  // if text is being selected, copy it to clilpboard as well
  if(window.getSelection().toString() != ""){
    // copy to clipboard
    async function copyPageUrl_Selectedtxt() {
      try {
        // Gather selected text and format
        let html = "";
        let sel = window.getSelection();
        console.log(sel);

        if (sel.rangeCount) {
            const container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
        // Write to clipboard 
        const blob = new Blob(['* ' + currenct_title + '<br/>' + current_url + '<br/>' + html],{type : "text/html"});
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
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
        await navigator.clipboard.writeText(urlntitle);
        console.log('Page URL is copied to clipboard');
        _showPopupMessage(urlntitle);
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

function _showPopupMessage(__msg, __style) {
  let header = "Copied to clipboard:\n\n";
  __msg = header + __msg;
  let line = __msg.split("\n").length;
  //let line = __msg.length / 60;
  let baseheight = 23;
  let height = baseheight * line;
  if(height<(baseheight*2)) height = baseheight * 2;//70;

  let style = {"height": height+"px", "width":"500px", "font-size": "13px", "color":"white", "background-color":"dimgray", "vertical-align":"middle", "padding-left":"15px"};

  if(__style) {
      for(const [key, value] of Object.entries(__style)) {
          style[key] = value;
      }
  }

  _PMSG.showPopupMessage( __msg.replace(/\n/g, "<br />"), 
      style,
      1500 );
}