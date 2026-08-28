const Switch_Language = () => {
  chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {greeting:"switch_language"}, function(response){
      console.log(response.farewell);
    });
  });
}

const Open_Settings = () => {
  chrome.runtime.openOptionsPage();
}

window.addEventListener('load',()=>{
    document.querySelector("#switch").addEventListener("click", Switch_Language)
    document.querySelector("#settings").addEventListener("click", Open_Settings)
  })