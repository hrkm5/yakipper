chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log(request.message);
    // get the switching link from element
    const dropdown = document.getElementsByClassName('dropdown-menu-end');
    const language_url = dropdown[0].getElementsByTagName('a')[0].getAttribute('href');
    console.log('Redirecting to' + language_url);
    location.href = language_url;
  });