"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
//submit button 
const $searchForm = $("#searchForm");
const $query = $("#searchForm-term");

//This is my tvmaze.com search query. link
//http://api.tvmaze.com/search/shows?q=<search query>

//Thi sis my tvmaze.com show id http://api.tvmaze.com/shows/<show id>/episodes


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


//Locate the termdata.  searchForm-term.input = this is going to give the VALUE of the consumer search.
//create a params = q: consumers input api_key = 


async function getShowsByTerm(response){
  const showsearch = $query.value;
  $('#query').val('');

  try{
    let search = await axios.get('http://api.tvmaze.com/search/shows?', {
    url:"search/shows",
    method: "GET",     
    params: {
            q: showsearch,

        }
      });

      return search.data.map(result => {
        const show = result.show;
        return{
            id: show.id, 
            name: show.name,
            summary: show.summary,
            Image: show.image ? show.image.medium: MISSING_IMAGE_URL,
        };
      });
    } catch (error) {
    console.log('Error occured:', error);
    return [];
  }
  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

async function getEpisodesOfShow(id){
    try{
        const response = await axios.get('http://api.tvmaze.com/shows/<show id>/episodes');
        return response.data.map(episode => ({
            id:episode.id,
            name: episode.name,
            season: episode.season,
            numeber: episode.number
        }));
    } catch (error) {
        console.log('Error occured', error);
        return [];
    }
} 


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

async function getEpisodesOfShow(id) {
    try {
        const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
        return response.data.map(episode => ({
            id: episode.id,
            name: episode.name,
            season: episode.season,
            number: episode.number
        }));
    } catch (error) {
        console.log("Error occurred:", error);
        return [];
    }
}




async function populateEpisodes(episodes){
    $episodesList.empty();
    for(let episode of episodes){
        const $item = $(`<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
        </li>`);
        $episodesList.append($item);
    }
    $episodesArea.show();
}

async function episodesForShowAndDisplay(event){
    const showId = $(event.target).data('show-id');
    const episodes = await episodesForShowAndDisplay(showId);
    populateEpisodes(episodes);
}
$showsList.on('click', ".Show-getEpisodes", episodesForShowAndDisplay);