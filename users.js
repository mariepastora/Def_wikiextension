// Defining global var
var tab_url; 

// Getting currentTab
function getCurrentTab(callback){
    tab_url;
    chrome.tabs.query({active:true, currentWindow:true},function(tab){
        tab_url = tab[0].url
        get_page(tab_url)
        callback(tab[0].url);
    });
};

// Chained function because chrome.tabs.query is asynchronous
function displayTab(tab){
  console.log(tab_url)
  return tab
}

// Another chained function

// Actual code nested
function get_page(url) {

  // Retrieving url
  url_tab = url.split("/wiki/")[1]

  // Creating list of all user names + edits + size of edits
  var all_user_names = []
  var number_edits = []
  var size_edits = []
  var table_here = document.getElementById("myTable")
  var block_logs = new Array()

  table_here.createTHead()


  // XHTML REQUEST
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {

    // Retrieving all usernames
    table = this.responseXML.getElementsByClassName("top-editors-table")[0]
    for (i=0, table.getElementsByClassName("sort-entry--username"); i< 20; i++){
        all_user_names.push(table.getElementsByClassName("sort-entry--username")[i].getAttribute("data-value"))
    }
    for (i=0, table.getElementsByClassName("sort-entry--edits"); i<20; i++){
      number_edits.push(table.getElementsByClassName("sort-entry--edits")[i].getAttribute("data-value"))
    }
    for (i=0, table.getElementsByClassName("sort-entry--added-bytes"); i<20; i++){
      size_edits.push(table.getElementsByClassName("sort-entry--added-bytes")[i].getAttribute("data-value"))
    }
    // Replacing them in HTML document

    for (i=0, all_user_names; i < all_user_names.length; i++){
      document.getElementsByClassName("link-user")[i].innerHTML = all_user_names[i]
      document.getElementsByClassName('link-user')[i].href = "https://en.wikipedia.org/wiki/User:" + all_user_names[i];
      document.getElementsByClassName("cell-2")[i].innerHTML = number_edits[i]
      document.getElementsByClassName("cell-3")[i].innerHTML = size_edits[i]
      //get link to block logs? doesn't work in html. 
      document.getElementsByClassName('block-log-link')[i].href = "https://en.wikipedia.org/w/index.php?title=Special:Log/block&page=" + all_user_names[i];
    }

  // Retrieve number of edits in the last month


  // Retrieve today's date
  var today = new Date();
  console.log(today)
  var mm = today.getMonth()
  var dd = today.getDate()
  var yyyy = today.getFullYear()
  var hour = today.getHours()
  var minutes = today.getMinutes()
  var seconds = today.getSeconds()


  if(dd<10) {
    dd = '0'+dd
  } 

  if(mm<10) {
    mm = '0'+mm
  } 

  if(hour<10) {
    hour = '0'+hour
  } 

  if(minutes<10) {
    minutes = '0'+minutes
  } 

  if(seconds<10) {
    seconds = '0'+seconds
  } 

  var a_month_ago = yyyy + '-' + mm + '-' + dd +'T' + hour + ':' + minutes + ':' + seconds + 'Z'
  console.log(a_month_ago)

  // API call to MediaWiki
  var getJSON = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
  };

  getJSON('https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&formatversion=2&rvprop=timestamp&rvlimit=max&rvend=' + a_month_ago + '&titles=' + url_tab,
  function(err, data) {
    if (err !== null) {
      console.log(err);
    } else {
      console.log(data);
      
      if (data.query.pages[0].hasOwnProperty('revisions')) {
        console.log(data.query.pages[0].revisions.length)
        document.getElementById('h5-span-last-month').innerHTML = data.query.pages[0].revisions.length; 
      } else {
        console.log('0');
        document.getElementById('h5-span-last-month').innerHTML = 0
      }

      }
      
    }
  )

  // Retrieve top contributors' block logs from MediaWiki API
  var getJSON = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
  };

  getJSON('https://en.wikipedia.org/w/api.php?action=query&format=json&list=users&usprop=blockinfo&ususers='+all_user_names[0]+'|'+all_user_names[1]+'|'+all_user_names[2]+'|'+all_user_names[3]+'|'+all_user_names[4]+'|'+all_user_names[5]+'|'+all_user_names[6]+'|'+all_user_names[7]+'|'+all_user_names[8]+'|'+all_user_names[9]+'|'+all_user_names[10]+'|'+all_user_names[11]+'|'+all_user_names[12]+'|'+all_user_names[13]+'|'+all_user_names[14]+'|'+all_user_names[15]+'|'+all_user_names[16]+'|'+all_user_names[17]+'|'+all_user_names[18]+'|'+all_user_names[19],
  function(err, data) {
    if (err !== null) {
      console.log(err);
    } else {
      console.log(data);
      for (i=0; i < 20; i++){
        if (data.query.users[i].hasOwnProperty('blockedtimestamp')) {
        console.log(data.query.users[i].name)
        document.getElementsByClassName("cell-4")[all_user_names.indexOf(data.query.users[i].name)].innerHTML = data.query.users[i].blockedtimestamp.split('T')[0]
        console.log(data.query.users[i].blockedtimestamp.split('T')[0])
      } else {
        document.getElementsByClassName("cell-4")[all_user_names.indexOf(data.query.users[i].name)].innerHTML = ' '

      }
      }
    }
  })

  // Scrape top contributors' userboxes from Wikipedia user pages
  var html_string = ''
  for (i=0, all_user_names; i < 20; i++){
      // Scraping userboxes
      var xhr = new XMLHttpRequest()
      xhr.onload = function() { //getting all userboxes of one user page. 
      var user_title = this.responseXML.getElementsByClassName("firstHeading")[0]
      var ubx_tables = this.responseXML.getElementsByClassName("wikipediauserbox")
        //output format: htmlcollection
      
      if (ubx_tables.length != 0) {
        html_string = html_string.concat("<h6>" + user_title.textContent.split(':')[1] + "</h6>")

        for (j=0, ubx_tables; j < ubx_tables.length; j++){
          html_string = html_string.concat(ubx_tables[j].innerHTML)

        }
      
      html_string = html_string.split('src="//').join('src="https://')
      html_string = html_string.split('<a href="/wiki').join('<a href="https://en.wikipedia.org/wiki')

      document.getElementById("ubx").innerHTML = html_string

      }

      } 
      

      xhr.open("GET", "https://en.wikipedia.org/wiki/User:" + all_user_names[i]);
      xhr.responseType = "document";
      xhr.send()


      // Reading HTML attributes of page retrieved
      function HTMLinXHR() {
        if (!window.XMLHttpRequest)
          return false;
        var req = new window.XMLHttpRequest();
        req.open('GET', window.location.href, false);
        try {
          req.responseType = 'document';
        } catch(e) {
          return true;
        }
        return false;
        }

  }

    clearScreen()


}


xhr.open("GET", "https://xtools.wmflabs.org/articleinfo/en.wikipedia.org/"+url_tab);
xhr.responseType = "document";
xhr.send();

// Reading HTML attributes of page retrieved
function HTMLinXHR() {
    if (!window.XMLHttpRequest)
      return false;
    var req = new window.XMLHttpRequest();
    req.open('GET', window.location.href, false);
    try {
      req.responseType = 'document';
    } catch(e) {
      return true;
    }
    return false;
}

// Request for getting page creation and number of edits

var getJSON = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
};

getJSON('https://xtools.wmflabs.org/api/page/articleinfo/en.wikipedia.org/'+url_tab,
  function(err, data) {
    if (err !== null) {
      console.log(err);
    } else {
      console.log(data);
        document.getElementById("h5-span-created").innerHTML = data.created_at
        document.getElementById("h5-span-author").innerHTML = data.author     
        document.getElementById('h5-span-author').href = "https://en.wikipedia.org/wiki/User:" + data.author; 
        document.getElementById("h5-span-contributions").innerHTML = data.revisions
        document.getElementById("h5-span-contributors").innerHTML = data.editors   

    }
  });

}

// Calling main function (resolve async issue)
getCurrentTab(displayTab)

function clearScreen() {
    var load_screen = document.getElementById("load_screen");
    document.body.removeChild(load_screen)
}


