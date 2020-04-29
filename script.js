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

const ANILIST = 'anilist';
const MAL = 'mal';

const LIST_STATUS_PLANNING = 'planning';
const LIST_STATUS_ON_HOLD = 'on_hold';

const LIST_STATUSES = [
  {
    label: 'Planning',
    value: LIST_STATUS_PLANNING,
  },
  {
    label: 'On Hold',
    value: LIST_STATUS_ON_HOLD,
  },
]


const AIRING_STATUS_AIRING = 'airing';
const AIRING_STATUS_COMPLETE = 'complete';

const AIRING_STATUSES = [
  {
    label: 'Complete',
    value: AIRING_STATUS_COMPLETE,
  },
  {
    label: 'Airing',
    value: AIRING_STATUS_AIRING,
  },
]

const FORMAT_TV = 'tv';
const FORMAT_TV_SHORT = 'tv_short';
const FORMAT_MOVIE = 'movie';
const FORMAT_OVA = 'ova';
const FORMAT_ONA = 'ona';
const FORMAT_SPECIAL = 'special';

const MEDIA_FORMATS = [
  {
    label: 'TV',
    value: FORMAT_TV,
  },
  {
    label: 'TV Shorts',
    value: FORMAT_TV_SHORT,
  },
  {
    label: 'Movies',
    value: FORMAT_MOVIE,
  },
  {
    label: 'OVAs',
    value: FORMAT_OVA,
  },
  {
    label: 'ONAs',
    value: FORMAT_ONA,
  },
  {
    label: 'Specials',
    value: FORMAT_SPECIAL,
  },
]



const SiteEnums = {
  listStatus: {
    [ANILIST]: {
      [LIST_STATUS_PLANNING]: 'PLANNING',
      [LIST_STATUS_ON_HOLD]: 'PAUSED',
    },
    [MAL]: {
      [LIST_STATUS_PLANNING]: 6,
      [LIST_STATUS_ON_HOLD]: 3,
    },
  },
  airingStatus: {
    [ANILIST]: {
      [AIRING_STATUS_AIRING]: 'RELEASING',
      [AIRING_STATUS_COMPLETE]: 'FINISHED',
    },
    [MAL]: {
      [AIRING_STATUS_AIRING]: 1,
      [AIRING_STATUS_COMPLETE]: 2,
    },
  },
  mediaFormat: {
    [ANILIST]: {
      [FORMAT_TV]: 'TV',
      [FORMAT_TV_SHORT]: 'TV_SHORT',
      [FORMAT_MOVIE]: 'MOVIE',
      [FORMAT_OVA]: 'OVA',
      [FORMAT_ONA]: 'ONA',
      [FORMAT_SPECIAL]: 'SPECIAL',
    },
    [MAL]: {
      [FORMAT_TV]: 'TV',
      [FORMAT_MOVIE]: 'Movie',
      [FORMAT_OVA]: 'OVA',
      [FORMAT_ONA]: 'ONA',
      [FORMAT_SPECIAL]: 'Special',
    },
  }
}



const AppData = {
  siteName: {
    [ANILIST]: 'Anilist',
    [MAL]: 'MyAnimeList',
  },
  url: {
    [ANILIST]: {
      base: 'https://graphql.anilist.co',
      options: '',
    },
    [MAL]: {
      base: 'https://api.jikan.moe/v3/user/',
      options: '/animelist/all',
    }
  },
  requestMethod: {
    [ANILIST]: 'POST',
    [MAL]: 'GET',
  },
  buildRequestBody: {
    [ANILIST]: buildPostBody_anilist,
    [MAL]: undefined,
  },


  mapData: {
    [ANILIST]: mapData_anilist,
    [MAL]: mapData_mal,
  },


  filterMappings: {
    /* List Status Enum Mapping */
    [SiteEnums.listStatus[ANILIST][LIST_STATUS_PLANNING]]: LIST_STATUS_PLANNING,
    [SiteEnums.listStatus[ANILIST][LIST_STATUS_ON_HOLD]]: LIST_STATUS_ON_HOLD,

    [SiteEnums.listStatus[MAL][LIST_STATUS_PLANNING]]: LIST_STATUS_PLANNING,
    [SiteEnums.listStatus[MAL][LIST_STATUS_ON_HOLD]]: LIST_STATUS_ON_HOLD,

    /* Airing Status Enum Mapping */
    [SiteEnums.airingStatus[ANILIST][AIRING_STATUS_AIRING]]: AIRING_STATUS_AIRING,
    [SiteEnums.airingStatus[ANILIST][AIRING_STATUS_COMPLETE]]: AIRING_STATUS_COMPLETE,

    [SiteEnums.airingStatus[MAL][AIRING_STATUS_AIRING]]: AIRING_STATUS_AIRING,
    [SiteEnums.airingStatus[MAL][AIRING_STATUS_COMPLETE]]: AIRING_STATUS_COMPLETE,

    /* Media Format Enum Mapping */
    [SiteEnums.mediaFormat[ANILIST][FORMAT_TV]]: FORMAT_TV,
    [SiteEnums.mediaFormat[ANILIST][FORMAT_TV_SHORT]]: FORMAT_TV_SHORT,
    [SiteEnums.mediaFormat[ANILIST][FORMAT_MOVIE]]: FORMAT_MOVIE,
    [SiteEnums.mediaFormat[ANILIST][FORMAT_OVA]]: FORMAT_OVA,
    [SiteEnums.mediaFormat[ANILIST][FORMAT_ONA]]: FORMAT_ONA,
    [SiteEnums.mediaFormat[ANILIST][FORMAT_SPECIAL]]: FORMAT_SPECIAL,

    [SiteEnums.mediaFormat[MAL][FORMAT_TV]]: FORMAT_TV,
    [SiteEnums.mediaFormat[MAL][FORMAT_MOVIE]]: FORMAT_MOVIE,
    [SiteEnums.mediaFormat[MAL][FORMAT_OVA]]: FORMAT_OVA,
    [SiteEnums.mediaFormat[MAL][FORMAT_ONA]]: FORMAT_ONA,
    [SiteEnums.mediaFormat[MAL][FORMAT_SPECIAL]]: FORMAT_SPECIAL,



  }

  // TODO: put variable callbacks in here and everything I guess
}


/* Application State */
var activeSite = ANILIST;

// Populate the filters
function initializeFilter(filterItems, defaultOption){
  var filterState = {};

  filterItems.forEach((item) => filterState[item.value] = false);
  filterState[defaultOption] = true;

  return filterState;
}

// Enable only PTW by default
var activeListStatuses = initializeFilter(LIST_STATUSES, LIST_STATUS_PLANNING);
// Enable only completed shows by default
var activeAiringStatuses = initializeFilter(AIRING_STATUSES, AIRING_STATUS_COMPLETE);
// Enable only TV by default
var activeMediaFormats = initializeFilter(MEDIA_FORMATS, FORMAT_TV);

// idk if I want to go a step further and put these guys in an array
// I mean after all it's only like
// 3 things
// lol it won't be that bad



initializeUI();
updateUI();

function searchProfile() {
  console.log("Searching...");

  var username = document.getElementById("search-field").value;

  if (username) {
    // Let's get some yung data!
    getAnimeList(username);
  }
}

function createURL(username) {
  var url =  AppData.url[activeSite].base;

  if (activeSite === MAL) {
    // Interpolate username between the base url and the jikan API options
    url = `${url}${username}${AppData.url[activeSite].options}`
  }

  return url;
}

function createOptions(username) {
  var options = {
    method: AppData.requestMethod[activeSite],
  };

  if (AppData.buildRequestBody[activeSite]) {
    // Create the body given the active site configuration
    options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    options.body = AppData.buildRequestBody[activeSite](username);
  }

  return options;
}

function getAnimeList(username) {
  var url = createURL(username);
  var options = createOptions(username);

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
  // Filter data using function based on state here
  const anime = AppData.mapData[activeSite](data);

  console.log(anime);

  // initializePicker(anime);
}

function handleError(error, message = 'Unable to retrieve list data!') {
  alert(message);
  console.error(error);
}



/* State Update Functions */
function setActiveSite(site) {
  if (site !== ANILIST && site !== MAL) {
    RETURN;
  }

  activeSite = site;

  updateUI();
}

function updateUI() {
  // Update search text :)
  document.getElementById('search-field').setAttribute('placeholder', buildPlaceholder());

  // And don't forget those buttons, my guy!
  document.querySelectorAll('[id^="button"]').forEach((element) => element.classList.remove('active'));
  document.getElementById(`button-${activeSite}`).classList.add('active');

  // Ensure filter checked status reflects application state
  updateFilterUI(LIST_STATUSES, activeListStatuses);
  updateFilterUI(AIRING_STATUSES, activeAiringStatuses);
  updateFilterUI(MEDIA_FORMATS, activeMediaFormats);

}

function updateFilterUI(filterItems, filterGroup) {
  filterItems.forEach((item) => {
    let id = createFilterID(item.value);
    let input = document.getElementById(id);

    input.checked = filterGroup[item.value];
  })
}

function initializeUI() {
  // Build Filter UI
  let filterContainer = document.getElementById('filter-container');

  filterContainer.appendChild(buildFilterBlock('List Status', LIST_STATUSES, activeListStatuses));

  filterContainer.appendChild(buildFilterBlock('Airing Status', AIRING_STATUSES, activeAiringStatuses));

  filterContainer.appendChild(buildFilterBlock('Media Type', MEDIA_FORMATS, activeMediaFormats));

}

function buildFilterBlock(title, filterItems, filterGroup) {
  // Uhh, so I guess I want like a heading for these guys or something?
  // Actually let's whip out a draft of something real quick
  let filterBlock = document.createElement('div');
  filterBlock.classList.add('filter-block');

  let filterHeader = document.createElement('h2');
  filterHeader.appendChild(document.createTextNode(title));

  // Add the header to the block
  filterBlock.appendChild(filterHeader);

  // Add in the items as children
  // Might even want to wrap these guys in a container eventually?  the way of the div?
  filterItems.forEach((item) => {
    let filterItem = buildFilterItem(item, filterGroup);

    filterBlock.appendChild(filterItem);
  })

  return filterBlock;
}

function buildFilterItem(item, filterGroup) {
  let filterToggle = document.createElement('label');
  filterToggle.classList.add('filter-toggle');

  let filterInput = document.createElement('input');
  filterInput.setAttribute('type', 'checkbox');
  filterInput.classList.add('filter-input');
  filterInput.id = createFilterID(item.value);
  // Wire up the callback
  filterInput.onchange = () => toggleFilter(filterGroup, item.value);

  let filterLabel = document.createTextNode(item.label);

  // Compose our homies
  filterToggle.appendChild(filterInput);
  filterToggle.appendChild(filterLabel);

  return filterToggle;
}


function buildPlaceholder() {
  return `${AppData.siteName[activeSite]} Username...`;
}




/* Helper Functions */
function toggleFilter(filterGroup, filterKey) {
  // Check each of our filter guys, I guess?
  if (filterGroup.hasOwnProperty(filterKey)) {
    filterGroup[filterKey] = !filterGroup[filterKey];
  }
}

function createFilterID(filterKey) {
  return `filter-${filterKey}`
}

function mapData_anilist(data) {
  let mapped = [];

  let lists = data.data.MediaListCollection.lists;
  lists = lists.filter((list) => (!list.isCustomList));

  console.log(lists);

  lists.forEach((list) => (
    list.entries.forEach((entry) => {
      let anime = entry.media;

      // Filter out based on format and status
      let airingStatus = AppData.filterMappings[anime.status];
      let format = AppData.filterMappings[anime.format];

      if (activeAiringStatuses[airingStatus] &&
          activeMediaFormats[format]) {

        // Filters all apply, we're gucci!
        mapped.push({
          id: anime.id,
          name: anime.title.userPreferred, 
          image: anime.coverImage.large,
          url: anime.siteUrl,
        });
      }

    }
  )));

  return mapped;
}

function mapData_mal(data) {
  let animeList = data.anime;

  let mapped = [];

  animeList.forEach((anime) => {
    // Here's where we selectively include things based on airing status and media type
    let listStatus = AppData.filterMappings[anime.watching_status];
    let airingStatus = AppData.filterMappings[anime.airing_status];
    let format = AppData.filterMappings[anime.type];

    if (activeListStatuses[listStatus] &&
        activeAiringStatuses[airingStatus] &&
        activeMediaFormats[format]) {

      mapped.push({
        id: anime.mal_id,
        name: anime.title,
        image: anime.image_url,
        url: anime.url,
      });
    }
    
  });

  return mapped;
}


function buildPostBody_anilist(username) {
  // TODO: only request the statuses we actually care about
  // TODO: update queried fields to make our lives easier, dude

  var statusLabels = SiteEnums.listStatus[ANILIST];
  var requestStatuses = [];
  Object.keys(activeListStatuses).forEach((status) => {
    // If the status is enabled, add it to our local array
    if (activeListStatuses[status]) {
      requestStatuses.push(statusLabels[status])
    }
  });

  console.log(`Making Query for ${activeSite} user [${username}]`);
  console.log(`Enabled statuses: ${requestStatuses}`);


  var query = `
  query ($userName: String) {
    MediaListCollection(
      userName: $userName, 
      type: ANIME,
      status_in: [${requestStatuses}],
      sort: MEDIA_ID
      ) {
        lists {
          entries {
            media {
              id
              siteUrl
              title {
                userPreferred
              }
              coverImage {
                large
              }
              status
              format
            }
          }
          name
          isCustomList
          isSplitCompletedList
          status
        }
    }
  }
  `;

  var variables = {
    userName: username
  };

  return JSON.stringify({
    query: query,
    variables: variables
  });
}


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

