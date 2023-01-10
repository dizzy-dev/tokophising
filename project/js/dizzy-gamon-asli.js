// Setting
var config = {
// Allow dates in ticket URLs.
  postsDatePrefix: false,

// short URL just to enter the site,
// but not in its general operation.
  accessOnly: false,

  // Usar API v3 de Blogger.
  useApiV3: false,
  apiKey: "BLOGGER-API-V3"
}

var postsOrPages = ["pages", "posts"],
    blogId = "<data:blog.blogId/>",
    urlTotal, fetchIndex = 1,
    ampChar = "&amp;"[0],
    secondRequest = true,
    feedPriority = 0,
    nextPageToken;

// urlVal ();
// Validate if the URL corresponds to a post / page, 
// if not, or if it corresponds to the index.
function urlVal() {
  var url = window.location.pathname;
  var length = url.length;
  var urlEnd = url.substring(length - 5);
  if (urlEnd === ".html") return 0;
  else if (length > 1) return 1;
  else return 2;
}

// urlMod (); 
// Modify the URL by removing the date or the "/ p /" as well as the ".html".
function urlMod() {
  var url = window.location.pathname;
  if (url.substring(1, 2) === "p") {
    url = url.substring(url.indexOf("/",1) + 1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../" + url);
  } else {
    if (!config.postsDatePrefix) url = url.substring(url.indexOf("/",7) + 1);
    else url = url.substring(1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../../" + url);
  }
}

// urlSearch (url, database);
// Look for a specific url in the database, if found,
// then it will direct to her.
function urlSearch(url, database) {
  var pathname = url + ".html";
  database.forEach(function(element) {
    var search = element.search(pathname);
    if (search !== -1) window.location = element;
  });
}

// urlManager (database, id);
// Run a URL validation, to determine with the result
// the action to perform (modify it or find it in the blog feed).
function urlManager() {
  var validation = urlVal();
  if (validation === 0) {
    if (!config.accessOnly) urlMod();
  } else if (validation === 1) {
    fetchData(postsOrPages[feedPriority], 1);
  } else if (validation === 2) {
    if (!config.accessOnly) history.replaceState(null, null, "/");
  }
}

// fetchData ();
// Make a request for blog data.
function fetchData(postsOrPages, index) {
  var script = document.createElement("script");
  if (config.useApiV3) {
    var jsonUrl = "https://www.googleapis.com/blogger/v3/blogs/" + blogId + "/" + postsOrPages +
                  "?key=" + config.apiKey + "#maxResults=500#fields=nextPageToken%2Citems(url)#callback=parseData";
    if (nextPageToken) jsonUrl += "#pageToken=" + nextPageToken;
    nextPageToken = undefined;
  } else {
    var jsonUrl = window.location.protocol + "//" + window.location.hostname + "/feeds/" + postsOrPages +
                  "/summary?start-index=" + index + "#max-results=150#orderby=published#alt=json-in-script#callback=parseData";
  }
  jsonUrl = jsonUrl.replace(/#/g, ampChar);
  script.type = "text/javascript";
  script.src = jsonUrl;
  document.getElementsByTagName("head")[0].appendChild(script);
}

// parseData ();
// Get data in JSON format, classify it
// and send them to compare the current URL.
function parseData(json) {
  var database = [];

  if (!config.useApiV3) {
    if (!urlTotal) {
      urlTotal = parseInt(json.feed.openSearch$totalResults.$t);
    }

    try {
      json.feed.entry.forEach(function(element, index) {
        var entry = json.feed.entry[index];
        entry.link.forEach(function(element, index) {
          if (entry.link[index].rel === "alternate") database.push(entry.link[index].href);
        });
      });
    } catch(e) {}
  } else {
    try {
      json.items.forEach(function(element, index) {
        database.push(element.url);
      });
    } catch(e) {}
    nextPageToken = json.nextPageToken;
  }

  urlSearch(window.location.pathname, database);

  if (urlTotal > 150) {
    fetchIndex += 150;
    urlTotal -= 150;
    fetchData(postsOrPages[feedPriority], fetchIndex);
  } else if (nextPageToken) {
    fetchData(postsOrPages[feedPriority]);
  } else if(secondRequest) {
    nextPageToken = undefined;
    urlTotal = 0;
    fetchIndex = 1;
    secondRequest = false;
    if (feedPriority === 0) {
      feedPriority = 1;
      fetchData("posts", 1);
    } else if(feedPriority === 1) {
      feedPriority = 0;
      fetchData("pages", 1);
    }
  }
}

// bloggerJS ();
// Start BloggerJS.
// You can receive as a parameter the search order for the URLs,
// that is, if it will start to compare against pages or posts.
// 0 or empty = Pages, 1 = Entries.
function bloggerJS(priority) {
  if (priority) feedPriority = priority;
  urlManager();
}

bloggerJS();
