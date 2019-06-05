console.log("YO DAWGGG");


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
              medium
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
  lists.filter((list) => (!list.isCustomList && 
    (list.status === "COMPLETED") ||
    (list.status === "CURRENT" && shouldIncludeCurrent())
    ));

  // Now we're ready to incorporate the favorite picker!
  initializePicker(lists);

  console.log("Intial Data:");
  console.log(data);
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
}

function addAnimeItems(list, items) {
  list.forEach((entry) => {
    var anime = entry.media;
    var newItem = {
      id: anime.id, 
      name: anime.title.userPreferred, 
      image: anime.coverImage.medium,
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
          medium
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