// Ask before unload
// window.onbeforeunload = function(){
//   return 'Are you sure you want to leave?';
// };

var searchField = document.getElementById("search-field");
searchField.onkeypress = function(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    e.stopPropagation();

    if (searchField.value) {
      searchProfile();
    }

    return false;
  }
};

var navback = document.getElementById("navback");
navback.onclick = () => {
  hide("picker");
  show("homepage");
  // Clear the picker
  document.getElementById("evaluating").innerHTML = "";
}


function searchProfile() {
  console.log("Searching...");

  var username = document.getElementById("search-field").value;

  if (username) {
    // Let's get some yung data!
    getAnimeList(username);
  }
}

function getAnimeList(username) {
  var query = `
  query ($userName: String) {
    MediaListCollection(
      userName: $userName, 
      type: ANIME,
      status_in: [PLANNING],
      sort: MEDIA_ID
      ) {
      lists {
        entries {
          media {
            status
            format
            id
            title {
              userPreferred
            }
            coverImage {
              large
            }
          }
        }
        isCustomList
        status
      }
    }
  }
  `;

  var variables = {
    userName: username
  };

  var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

    fetch(url, options).then(handleResponse)
      .then(handleData)
      .catch(handleError);
}

function handleResponse(response) {
  return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
  });
}

function handleData(data) {
  // Obtain lists and filter based on current settings
  var lists = data.data.MediaListCollection.lists;
  lists = lists.filter((list) => (!list.isCustomList 
    // (list.status === "COMPLETED") ||
    // (list.status === "CURRENT" && shouldIncludeCurrent())
    ));

  // Now we're ready to incorporate the favorite picker!
  initializePicker(lists);
}

function handleError(error) {
  alert('User Not Found!');
  console.error(error);
}



/* Helper Functions */
function initializePicker(animeLists) {
  // We need to build a list of items for our favorite picker
  // The items will come from the passed anime lists from the user's profile
  var items = [];

  animeLists.forEach((list) => {addAnimeItems(list.entries, items)})

  console.log(items);

  // Construct the arguments for our picker
  var myPicker = new picker.Picker({
      items: items,
      defaultSettings: {
          minBatchSize: 2,
          maxBatchSize: 12
      },
      getItemElem: "TODO"
      // Add the getitemelem option thing here?
  });

  var pickerUI = new PickerUI(myPicker, {
      elements: {
          pick: "#pick",
          pass: "#pass",
          undo: "#undo",
          redo: "#redo",
          evaluating: "#evaluating",
          favorites: "#favorites"
      }
  });

  pickerUI.initialize();

  var sortable = new Sortable(pickerUI.elem.favorites.get(0), {
      draggable: '.item',
      animation: 100,
      onStart: function() {
          pickerUI.elem.favorites.addClass("sorting");
      },
      onEnd: function() {
          pickerUI.elem.favorites.removeClass("sorting");
      },
      onUpdate: function() {
          myPicker.setFavorites(pickerUI.elem.favorites.children().map(function() {
              return pickerUI.getItem(this);
          }).get());
          pickerUI.update(true);
      }
  });

  // Swap the views
  hide("homepage");
  show("picker");
}

function hide(id) {
  document.getElementById(id).classList.toggle("hidden", true);
}

function show(id) {
  document.getElementById(id).classList.toggle("hidden", false);
}

function addAnimeItems(list, items) {
  list.forEach((entry) => {
    var anime = entry.media;

    if (anime.status && anime.status !== "FINISHED") return;
    if (anime.format === "MOVIE") return;

    var newItem = {
      id: anime.id, 
      name: anime.title.userPreferred, 
      image: anime.coverImage.large,
    }

    items.push(newItem);
  })
}



function shouldIncludeCurrent() {
  return true;
}




/* Draft Query
MediaListCollection(
  userName:"AltiusAinge", 
  type:ANIME,
  status_in: [CURRENT, COMPLETED],
  sort: MEDIA_ID
  ) {
  lists {
    entries {
      media {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
      }
    }
    name
    isCustomList
    isSplitCompletedList
    status
  }
}
 */