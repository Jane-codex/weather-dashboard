
 window.addEventListener("DOMContentLoaded", () => {
   const locationEl = document.getElementById("location");
   const tempEl = document.getElementById("temperature");
   const conditionEl = document.getElementById("condition");
   const forecastContainer = document.getElementById("forecast-container");


   let searchHistory = [];


   let isCelsius= "true"; // Default Celsius
   let lastWeatherData = null;


   function formatTemperature(tempCelsius) {
    if (isCelsius) {
      return `${tempCelsius.toFixed(1)}°C`;
    } else {
      const tempFahrenheit = (tempCelsius * 9) / 5 + 32;
         return `${tempFahrenheit.toFixed(1)}°C`;
    }
    
   }


   let currentWeatherData = null; // will store the last fetched weathwe data
   

  const apiKey = "8a09f182dc5569190e1b2903a7b83de1";
               
      function getWeather(lat, lon) {
        console.log("Fetching weather for:", lat, lon);

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=matric`)
           
        .then(res => res.json())
        .then(data => {

          console.log("Weather API data:", data);
          console.log("Full weather data:", data.weather);



          locationEl.textContent = data.name;
          tempEl.textContent =`${data.main.temp.toFixed(1)}°C`;

          const condition = data.weather[0].description.toLowerCase().trim();
           console.log("Weather condition description:", condition);

           const conditionEl = document.getElementById("condition");
          
           conditionEl.textContent = condition;

            generateSuggestion(condition);


             //Call forecast function
             getForecast(lat, lon);
        })
        .catch(err => {
          console.error("Error fetching weather data", err);
        });
      }
       function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
          
           .then(res => res.json())
           .then(data => {
              forecastContainer.innerHTML = "";

              for (let i = 0; i < data.list.length; i += 8) {
                            const item = data.list[i];
                            const date = new Date(item.dt * 1000);
                            const icon = item.weather[0].icon;
                            const temp = item.main.temp.toFixed(1);
                            const desc = item.weather[0].main;

                            const card = document.createElement("div");

                            card.classList.add("forecast-day");
                              card.innerHTML = `
                              <p>${date.toDateString().slice(0, 3)}</p>
                                 <img 
                                 src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                                 <p>${temp}°C</p>
                                 <p>${desc}</p>`;

            forecastContainer.appendChild(card);     
              }
           })
           .catch(err => {
            console.error("Error fecthing forecast:", err);
           });
       }

               
          function getWeatherByCity(city) {
           /*  const apiKey =  */
             fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
                      .then(res => res.json())
                      .then (data => {
                        console.log("Weather API data:", data);
                        if (data.cod !== 200) {
                          alert(`City not found: ${city}`);
                          return;
                        }

                          const lat = data.coord.lat;
                          const lon = data.coord.lon;

                          
                        
                          lastWeatherData = data;

                          displayCurrentWeather(data);
                         /*  getWeatherWithAlerts(lat, lon); */



                         const condition = data.weather[0].description.toLowerCase().trim();
                         generateSuggestion(condition);
                       



                          locationEl.textContent = data.name;
                          tempEl.textContent = `${data.main.temp.toFixed(1)}°C`;
                          conditionEl.textContent = data.weather[0].description;
                          getForecast(lat, lon);
                      })
                      .catch(err => {
                        alert("City not found. Please try again.");
                          console.error("Error fetching weather by city:", err);
                      });


                         
                      function displayCurrentWeather(data) {



                        const locationEl = document.getElementById("location");
                        const tempEl = document.getElementById("temperature");
                        const conditionEl = document.getElementById("condition");
                        

                        const cityName = data.name;

                            const temperature = formatTemperature(data.main.temp);
                            document.getElementById("temperature").textContent = temperature;

                        /* const temperatureValue = data.main.temp;
                        const temperature = formatTemperature(temperatureValue); */

                        const condition = data.weather[0].description;

                        locationEl.textContent = cityName;

                       /*  tempEl.textContent = temperature;
                        tempEl.dataset.value = temperature; */

                        conditionEl.textContent = condition;
                         saveToHistory(cityName, temperature, condition);
                        
                      }    
                     
                               // Render history to the UI
                                    function renderHistory() {
                                    const historyList = document.getElementById("history-list");
                                    const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

                                    /* console.log("Rendering history:", history) */

                                    historyList.innerHTML = ""; // Clear existing items

                                    history.forEach(entry => {
                                      const li = document.createElement("li");
                                    li.textContent = `${entry.city} - ${entry.temperature} - ${entry.condition}`;
                                    li.addEventListener("click", () => {

                                      getWeatherByCity(entry.city); // Optional: search again on click
                                    });
                                    historyList.appendChild(li);
                                   
                               });
                                    }
                                         
                                    function clearHistory() {
                                      localStorage.removeItem("weatherHistory");
                                      renderHistory();
                                    }
                
                             // Save data to localStorage history
                             function saveToHistory(city, temperature, condition) {
                              const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

                              //Add the latest search to the beginning of the array
                                history.unshift({ city, temperature, condition});

                                // Limit history to the last 5 searches
                                  if (history.length > 5) {
                                    history.pop();
                                  }

                                    localStorage.setItem("weatherHistory", JSON.stringify(history));

                                    console.log("Saved to history:", history);
                                    renderHistory(); // Update the UI
                                }

                                    document.addEventListener("DOMContentLoaded", renderHistory);
                                    document.getElementById("clear-history-btn").addEventListener("click", () => {
                                      const confirmClear = confirm("🧹 Are you sure you want to clear your search history?");
                                      if (confirmClear) {
                                        localStorage.removeItem("weatherHistory");
                                        renderHistory();
                                        alert("✅ History cleared!");
                                      }
                                    });



                                    document.getElementById("toggle-unit").addEventListener("click", () => {
                                      isCelsius = !isCelsius;

                                      if (lastWeatherData) {

                                        displayCurrentWeather(lastWeatherData);
                                      }
                                    });

                                   
                          }

                                 function initApp() {
                                      if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                                 position => {
                                                    const lat = position.coords.latitude;
                                                  const lon = position.coords.longitude;

                                            console.log("Weather coordinates:", lat, lon);
                 

                                                       getWeather(lat, lon);
                                                        },
                                                        () => {
                                                    alert("Unable to retrieve your location.");
                                                          }
                                                             );
                                                             } else {
                                                              alert("Geolocation is not supported by this browser.");
                                                               }
                                                           }

           // search button handler
           document.getElementById("search-btn")
           .addEventListener("click", () => {
              const city = document.getElementById("city-input")
              .value.trim();
              if (city) {
                  getWeatherByCity(city);
              }

           });

           function getWeatherByCoordinates(lat, lon) {
           /*  const apiKey =  */
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=matric`;

            fetch(url)
            .then((res) => res.json())
            .then((data) => {
               console.log("Weather from coordinates:", data); // function that shows the weather on the screen
            })
             .catch((error) => {
              console.log("Error fetching weather:", error);
             });
           }




           function 
           generateSuggestion(condition) {
             const weather = condition.toLowerCase();
             let suggestion = "Enjoy your day!";

             console.log("Received weather condition", weather);
             
             if (weather.includes("rain")) {
              
              suggestion = "It's rainy - take an umbrella ☔";

             } else if (weather.includes("overcast")) {
              suggestion = "Cloudy skies - might be a bit gloomy ☁️";
                
             } else if (weather.includes("cloud")) {
              suggestion = "Some clouds around- Enjoy the breeze!";
             
             } else if (weather.includes("broken")) {
              suggestion = "Partly cloudy today- You might catch some sun ☀️";

             } else if (weather.includes("clear")) {
                 suggestion = "Clear skies - perfect for going out 😊";

             } else if (weather.includes("snow")) {
                  suggestion = "Snow is expected stay warm ❄️🧥";

             } else if (weather.includes("storm")) {
                  suggestion = "Stormy weather better stay indoors ⛈️";

             } else if (weather.includes("sun")) {
                suggestion = "Sunny day - don't forget your sunglasses 😎";
             }

                const suggestionText = document.getElementById("suggestion-text");

                  if(suggestionText) {
                      suggestionText.textContent = suggestion;
                      console.log("Suggestion updated to:", suggestion);
                  } else {
                    console.log("Could not find #suggestion-text element");
                  }
              
              
           }

      
              
              const mapIframe = document.getElementById("weatherMap");
                const mapLink = document.getElementById("mapLink");
               /*  const appid =  "ApiKey" */
            

              // Initial location and zoom
              const lat = 6.5244; //Lagos latitude
              const lon = 3.3792; // lagos longitude
              const zoom = 5;

              const layer = "temperature";

              const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=true&layer=${layer}&lat=${lat}&lon=${lon}&zoom=${zoom}&appid=${apiKey}`;
               
               if (mapIframe) {
                   mapIframe.src = mapUrl;
                     }

                     // external link
                     if (mapLink) {
                       mapLink.href = mapUrl;
                       mapLink.target = "_blank";
                          }
              

             
          
          initApp();
      });



























































































/* const API_KEY = "c31c954d60e9dd607320d7875db6017d";

//user's location
if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    console.log("Golocation is not supported.");
}

function showPosition(position) {
  const lat = 
  position.coords.latitude;
   const lon = 
   position.coords.longitude;
   getWeather(lat, lon);
}

function showError(error) {
  console.log("Error getting location:", error);
}


async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    console.log(data);

    document.getElementById("weather").innerHTML = `
      <p><strong>Location:</strong> ${data.name}</p>
      <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
      <p><strong>Condition:</strong> ${data.weather[0].description}</p>
    `;
  } catch (error) {
    console.error("Error:", error.message);
  }
} */




















































































































/* // API key
const apiKey = 
   "c31c954d60e9dd607320d7875db6017d";

    // Base URL for the Weather API
    const baseUrl = "https://api.weatherapi.com/v1/current.json";

// Get user's location
if (navigator.geolocation) {

  navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
  console.log("Geolocation is not supported by this browser.");
}

function showPosition(position) {
  const latitude = 
  position.coords.latitude;
    const longitude = 
    position.coords.longitude;
    console.log("Latitude: " + latitude + ", Longitude: " + longitude);

    // Call weather API using the lat and lon coordinates
    getWeather(latitude, longitude);
    
}

  // Error handling for geolocation
 function showError(error) {
  switch(error.code) {
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
         break;
         case error.TIMEOUT:
          console.log("The request to get user location timed out.");
            break;
            case error.UNKNOWN_ERROR:
              console.log("An unknown error occured.");
                 break;
  }
}

// Function to get Weather data from API
  async function getWeather(lat, lon) {
  try {
    const response = await fetch(`${baseUrl}/current.json?key=${apiKey}&q=${location}`);
    const data = await response.json();

    // Update HTML with weather info
    document.getElementById("#city").textContent = data.location.name;

    document.getElementById("#temp").textContent = data.current.temp_c + "°C";

    document.getElementById("#condition").textContent = data.current.condition.text;

    document.getElementById("#icon").src = data.current.condition.icon;

    document.getElementById("#icon").alt = data.current.condition.text;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

/* // Call the function to get weather for Lagos (you can change to any city)
getWeather("Lagos"); */

  
  
  
     