const BOX_SUPPORT_HOST = "support.box.com" // Box Support Site
const BOX_DEVELOPER_HOST = "developer.box.com" // Box Developer Site
const JA_BOX_DEVELOPER_HOST = "ja.developer.box.com" // Japanese Box Developer Site

const switch_language = () => {
  console.log("Retriving language...");
  if (document.location.host == BOX_SUPPORT_HOST && document.location.pathname.match(/\/hc\/ja\/*/)){
    let language = document.getElementsByTagName('link');
    for (const element of language) {
      if (element.getAttribute('hreflang') === 'en') {
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
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.greeting == "switch_language"){
      console.log("Got a swtich request")
      switch_language();
      sendResponse({farewell: "Complete"});
    }
});