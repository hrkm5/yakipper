const BOX_SUPPORT_HOST = "support.box.com" // Box Support Site

const switch_language = () => {
  console.log("Retriving language...");
  if (document.location.host == BOX_SUPPORT_HOST && document.location.pathname.match(/\/hc\/ja\/*/)){
    let language = document.getElementsByTagName('link');
    for (const element of language) {
      if (element.getAttribute('hreflang') === 'en') {
        const language_url = element.getAttribute('href')
        console.log('Switching to English ' + language_url);
        location.href = language_url;
      }
    }
  } else {
    let language = document.getElementsByTagName('link')
    for (const element of language) {
      if (element.getAttribute('hreflang') === 'ja') {
        const language_url = element.getAttribute('href')
        console.log('Switching to Japanese ' + language_url);
        location.href = language_url;
      }
    }
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