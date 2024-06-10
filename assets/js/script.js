const apiKey = `0859c7d7315bb3c27acac4f80f84a44b`;
const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=`;
const citySearchButton = document.querySelector('.city-button');
const citySearchInput = document.querySelector('.city-input');
const stateSearch = document.querySelector('.state-input');
const countrySearch = document.querySelector('.country-input');


   citySearchButton.addEventListener('click', function() {
    console.log('button clicked')
    let city = citySearchInput.value;
    let state = stateSearch.value;
    let country = countrySearch.value;
    console.log ('City:', city);
    console.log ('State:', state);
    console.log ('Country:', country);
    
    const limit = 1;
    let query = city;
    if (state) {
        query += `,${state}`;
    }
    if (country) {
        query += `,${country}`;
    }
    const cityApiUrl = `${cityUrl}${query}&limit=${limit}&appid=${apiKey}`;

    fetch(cityApiUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.length > 0) {
            const lat = data[0].lat
            const lon = data[0].lon
            console.log('lat:', lat, 'lon:', lon)
        } else {
            console.log ('City not found')
        }
    })
    .catch(function(error) {
        console.error('Error fetching the coordinates:', error);
    })

   });