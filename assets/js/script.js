const apiKey = `0859c7d7315bb3c27acac4f80f84a44b`;
const cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=`;
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

    // Manage search history in local
    let searchHistory = localStorage.getItem('searchHistory');
    if (searchHistory) {
        searchHistory = JSON.parse(searchHistory);
    } else {
        searchHistory = [];
    }
    // Add the query to search history
    const query = city + (state ? `, ${state}` : '') + (country ? `, ${country}` : '');
    if (searchHistory.indexOf(query) === -1) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    
    // Construct our Geocoding query
    const limit = 1;
    let queryStr = city;
    if (state) {
        queryStr += `,${state}`;
    }
    if (country) {
        queryStr += `,${country}`;
    }
    const cityApiUrl = `${cityUrl}${queryStr}&limit=${limit}&appid=${apiKey}`;

    // Fetch coords from Geocoding api
    fetch(cityApiUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data)
        if (data.length > 0) {
            const lat = data[0].lat
            const lon = data[0].lon
            // testing concatenating city name and state (if entered) for location
            const location = data[0].name + (data[0].state ? `, ${data[0].state}` : '');

            console.log('lat:', lat, 'lon:', lon, 'location:', location);

            // Fetch using our retrieved coords
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

            fetch(weatherApiUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(weatherData) {
                console.log(weatherData);
                const now = dayjs();
                const nowUnix = now.unix();
            
                let closestWeatherIndex = 0;
                // Initialize the minimum difference with the first element
                let minDiff = Math.abs(nowUnix - weatherData.list[0].dt); 
                // Loop through the weather data list to find the closest time
                for (let i = 1; i < weatherData.list.length; i++) { 
                    const diff = Math.abs(nowUnix - weatherData.list[i].dt);
                    if (diff < minDiff) { 
                        minDiff = diff;
                        closestWeatherIndex = i;
                    }
                }
            
                // Use the index of the closest time to get the weather data
                const closestWeather = weatherData.list[closestWeatherIndex]; 
                const temp = Math.round(closestWeather.main.temp); // Extract temperature, Math.Round to round temp to whole number
                const humidity = closestWeather.main.humidity; // Extract humidity
                const description = closestWeather.weather[0].description; // Extract description
                const windSpeed = closestWeather.wind.speed; // Extract wind speed
                const icon = closestWeather.weather[0].icon;

                console.log('Description:', description);
               
                // Update elements of current weather 
                document.getElementById('location').textContent = location;
                document.getElementById('temp').textContent = temp;
                document.getElementById('humidity').textContent = humidity;
                document.getElementById('description').textContent = description;
                document.getElementById('wind').textContent = windSpeed;
                const weatherIcon = document.getElementById('weather-icon');
                    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}.png`;
                    weatherIcon.style.display = 'block'; 
                document.getElementById('current-weather').style.display = 'block';

                // Create object to hold forecast data
                const dailyForecast = {};

                weatherData.list.forEach(function(weather) {
                    const date = dayjs.unix(weather.dt).format('YYYY-MM-DD');
                    // check if date is not in dailyForecast object, then initialize new object
                    if (dailyForecast[date] === undefined) {
                        dailyForecast[date] = {};
                        dailyForecast[date].high = weather.main.temp; //sets high temp for day
                        dailyForecast[date].low = weather.main.temp; //sets low temp for day
                        dailyForecast[date].icon = weather.weather[0].icon; // our weather icon
                        dailyForecast[date].description = weather.weather[0].description; // description
                        dailyForecast[date].wind = weather.wind.speed; //sets wind speed
                        dailyForecast[date].humidity = weather.main.humidity; //sets humidity
                    } else {
                        //Check if temperature is higher than recorded high, if so then update to our dailyForecast for that date
                        if (weather.main.temp > dailyForecast[date].high) {
                            dailyForecast[date].high = weather.main.temp;
                        }
                        //Check if temperature is lower than recorded low, if so then update to our dailyForecast for that date
                        if (weather.main.temp < dailyForecast[date].low) {
                            dailyForecast[date].low = weather.main.temp;
                        }
                    }
                });

                // Update html for 5-day forecast
                const sortedDates = Object.keys(dailyForecast).sort();

                for (let i = 0; i < 5; i++) {
                    const date = sortedDates[i];
                    if (date !== undefined) {
                    const forecast = dailyForecast[date];
                        document.querySelector('.day-' + (i + 1)).innerHTML = `
                            <p>${dayjs(date).format('dddd')}</p>
                            <p>High: ${Math.round(forecast.high)}F</p>
                            <p>Low: ${Math.round(forecast.low)}F</p>
                            <p>Wind: ${forecast.wind} MPH</p>
                            <p>Humidity: ${forecast.humidity}%</p>
                            <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
                        `;
                    }
                }

                })
                .catch(function(error) {
                    console.log(`Error fetching weather data`, error);
                });
        } else {
            console.log ('City not found')
        }
    })
    .catch(function(error) {
        console.error('Error fetching the coordinates:', error);
    })
    displaySearchHistory();
   });

   function displaySearchHistory() {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyContainer = document.querySelector('.search-history');
    historyContainer.innerHTML = '';

    searchHistory.forEach(city => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        cityButton.classList.add('button', 'is-info', 'city-history-button');
        historyContainer.appendChild(cityButton);

        cityButton.addEventListener('click', function () {
            // Trigger weather data fetch for this city
            citySearchInput.value = city.split(',')[0];
            stateSearch.value = city.split(',')[1] ? city.split(',')[1].trim() : '';
            countrySearch.value = city.split(',')[2] ? city.split(',')[2].trim() : '';
            citySearchButton.click();
        });
    });
}

// Call the function to display search history on page load
displaySearchHistory();
