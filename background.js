
chrome.commands.onCommand.addListener(function(command) {
    if (command == "toggel-switch-language") {
        // call switch language
        chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id,{greeting: "switch_language"}, function(response) {
            console.log(response.farewell);
          });
        });
        console.log('Command:', command);
    }
    else if (command == "toggle-copy-to-clipboard") {
        // call copy2clipboard
        chrome.tabs.query( {active:true, currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {greeting:"copy_clipboard"}, function(response){
            console.log(response.farewell);
          });
        });
        console.log('Command:', command);
    }
});