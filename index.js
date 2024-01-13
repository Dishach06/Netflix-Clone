//consts
const apiKey = "a240a6b42e7ac545e0d36a4e38dfc104";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`
    , fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`
    , fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apiKey}&language=en.US`
    , searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyCNt6n2AtAXJsAXz8zEgCo1bjv-pe06340`,
}


// boots up the app
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSection();

}

function fetchTrendingMovies() {
    fetchAndBuildMovieSection(apiPaths.fetchTrending, 'Trending Now')
        .then(list => {
            const randomIndex = parseInt(Math.random() * list.length);
            buildBannerSection(list[randomIndex]);
        }).catch(err => {
            console.error(err);
        });
}

function buildBannerSection(movie) {
    const bannerCont = document.getElementById('banner-section');
    bannerCont.style.backgroundImage = `url( '${imgPath}${movie.backdrop_path}')`;

    const div = document.createElement('div');

    div.innerHTML = `
            <h2 class="banner_title">${movie.title}</h2>
            <p class="banner_info">Trending in movies | Release - ${movie.release_date}</p>
            <p class="banner_overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0, 200).trim() + '...' : movie.overview}</p>
            <div class="action_buttons_cont">
                <button class="action_button"> <i class="fa-solid fa-play"> &nbsp;&nbsp; Play </i></button>
                <button class="action_button"><i class="fa-solid fa-circle-info">  &nbsp;&nbsp; More info </i></button>
            </div>
            `;
    div.className = "banner-content container";
    bannerCont.append(div);

}

function fetchAndBuildAllSection() {
    fetch(apiPaths.fetchAllCategories)
        .then(res => res.json())
        .then(res => {
            const categories = res.genres;
            if (Array.isArray(categories) && categories.length) {
                categories.forEach(category => {
                    fetchAndBuildMovieSection(
                        apiPaths.fetchMoviesList(category.id),
                        category.name
                    );
                });
            }
            // console.table(movies);
        })
        .catch(err => console.error(err));
}

function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName)
    return fetch(fetchUrl)
        .then(res => res.json())
        .then(res => {
            //console.table(res.results)
            const movies = res.results;
            if (Array.isArray(movies) && movies.length) {
                buildMoviesSection(movies.slice(0, 6), categoryName);
            }
            return movies;
        })
        .catch(err => console.error(err))
}

function buildMoviesSection(list, categoryName) {
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');

    const moviesListHTML = list.map(item => {
        return `
        <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title}', 'yt${item.id}')"> 
        <img class="movie-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.title}"/>
        <div class="iframe-wrap" id="yt${item.id}"></div>
        </div> `;
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName} <span class="explore-nudge">Explore All</span></h2>
        <div class="movies-row">
          ${moviesListHTML}
    </div>
    `

    const div = document.createElement('div');
    div.className = "movies-section"
    div.innerHTML = moviesSectionHTML;

    //append html into movies container
    moviesCont.append(div);

}

function searchMovieTrailer(movieName, iframId) {
    if (!movieName) return;

    fetch(apiPaths.searchOnYoutube(movieName))
        .then(res => res.json())
        .then(res => {
            const bestResult = res.items[0];

            const elements = document.getElementById(iframId);
            console.log(elements, iframId);

            const div = document.createElement('div');
            div.innerHTML = `<iframe width="245px" height="150px" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>`

            elements.append(div);
        })
        .catch(err => console.log(err));
}

window.addEventListener('load', function () {
    init();
    window.addEventListener('scroll', function () {
        //heder ui update
        const header = document.getElementById('header');
        if (window.scrollY > 5) header.classList.add('black-bg')
        else header.classList.remove("black-bg");
    })
})