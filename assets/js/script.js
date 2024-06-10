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
        console.log(data)
        if (data.length > 0) {
            const lat = data[0].lat
            const lon = data[0].lon
            console.log('lat:', lat, 'lon:', lon)

            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
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
                        closestWeatherIndex = i; // Update the index of the closest time
                    }
                }
            
                // Use the index of the closest time to get the weather data
                const closestWeather = weatherData.list[closestWeatherIndex]; 
                const temp = closestWeather.main.temp; // Extract temperature
                const humidity = closestWeather.main.humidity; // Extract humidity
                const description = closestWeather.weather[0].description; // Extract description
                const icon = closestWeather.weather[0].icon; // Extract icon
                const windSpeed = closestWeather.wind.speed; // Extract wind speed
            
                // Log the extracted data
                console.log('Temperature:', temp);
                console.log('Humidity:', humidity);
                console.log('Description:', description);
                console.log('Icon:', icon);
                console.log('Wind Speed:', windSpeed);
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

   });


    