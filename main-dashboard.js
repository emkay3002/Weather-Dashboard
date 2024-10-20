document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1";
  const cityInput = document.getElementById("city-input");
  const getWeatherButton = document.getElementById("get-weather");
  const toggleUnitButton = document.getElementById("toggle-unit");

  let isCelsius = true; // Track the current temperature unit

  getWeatherButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
      fetchForecast(city);
    } else {
      alert("Please enter a city name");
    }
  });

  async function fetchWeather(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      updateWidget(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("Failed to fetch weather data. Please try again.");
    }
  }

  function updateWidget(data) {
    const { name } = data;
    const { description, icon } = data.weather[0];
    const { temp, humidity } = data.main; // Include humidity

    const cityName = document.getElementById("city-name");
    const weatherDescription = document.getElementById("weather-description");
    const temperatureValue = document.getElementById("temp-value");
    const weatherHumidity = document.getElementById("weather-humidity");
    const weatherIcon = document.getElementById("weather-icon");

    cityName.textContent = `Weather in: ${name}`;
    weatherDescription.textContent = `Description: ${description}`;
    temperatureValue.textContent = temp.toFixed(1); // Display temperature in current unit
    weatherHumidity.textContent = `Humidity: ${humidity}%`;

    weatherIcon.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = description;

    changeBackground(description);
  }

  // Toggle between Celsius and Fahrenheit
  toggleUnitButton.addEventListener("click", () => {
    isCelsius = !isCelsius; // Toggle the unit
    const temperatureText = document.getElementById("temperature");

    // Get the current temperature displayed
    let currentTemp = parseFloat(
      document.getElementById("temp-value").textContent
    );
    if (isCelsius) {
      temperatureText.innerHTML = `Temperature: <span id="temp-value">${currentTemp.toFixed(
        1
      )}</span> °C`;
      toggleUnitButton.textContent = "Switch to °F";
    } else {
      const fahrenheitTemp = (currentTemp * 9) / 5 + 32;
      temperatureText.innerHTML = `Temperature: <span id="temp-value">${fahrenheitTemp.toFixed(
        1
      )}</span> °F`;
      toggleUnitButton.textContent = "Switch to °C";
    }
  });

  function changeBackground(condition) {
    let backgroundImage;
    switch (condition) {
      case "clear sky":
        backgroundImage = "url('assets/weather/clear.jpg')";
        break;
      case "few clouds":
        backgroundImage = "url('assets/weather/cloudy.webp')";
        break;
      case "scattered clouds":
        backgroundImage = "url('assets/weather/hazy.jpg')";
        break;
      case "overcast clouds":
        backgroundImage = "url('assets/weather/hazy.jpg')";
        break;
      case "rain":
        backgroundImage = "url('assets/weather/rainy.webp')";
        break;
      case "thunderstorm":
        backgroundImage = "url('assets/weather/storm.webp')";
        break;
      case "light rain":
        backgroundImage = "url('assets/weather/rainy.webp')";
        break;
      case "smoke":
        backgroundImage = "url('assets/weather/smoke.jpg')";
        break;
      case "snow":
        backgroundImage = "url('assets/weather/snow.webp')";
        break;
      default:
        backgroundImage = "url('assets/weather/clear.jpg')";
        break;
    }

    const weatherWidget = document.getElementById("weather-widget");
    weatherWidget.style.backgroundImage = backgroundImage;
    weatherWidget.style.backgroundSize = "cover";
    weatherWidget.style.backgroundPosition = "center";
    weatherWidget.style.backgroundRepeat = "no-repeat";
  }

  async function fetchForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Forecast not found");
      }
      const data = await response.json();
      const temperatureData = data.list.map((item) => item.main.temp);
      const weatherConditionData = data.list.map(
        (item) => item.weather[0].main
      );

      createTemperatureChart(temperatureData);
      createWeatherConditionChart(weatherConditionData);
      createTemperatureChangeChart(temperatureData);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      alert("Failed to fetch forecast data. Please try again.");
    }
  }

  function createTemperatureChart(temperatureData) {
    const ctx = document.getElementById("temperatureChart").getContext("2d");
    const temperatureChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: temperatureData.map((_, index) => `Day ${index + 1}`),
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatureData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Temperature (°C)",
            },
          },
        },
      },
    });
  }

  function createWeatherConditionChart(weatherConditionData) {
    const ctx = document
      .getElementById("weatherConditionChart")
      .getContext("2d");
    const conditionCount = weatherConditionData.reduce((acc, condition) => {
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(conditionCount);
    const data = Object.values(conditionCount);

    const weatherConditionChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  }

  function createTemperatureChangeChart(temperatureData) {
    const ctx = document
      .getElementById("temperatureChangeChart")
      .getContext("2d");
    const temperatureChangeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: temperatureData.map((_, index) => `Day ${index + 1}`),
        datasets: [
          {
            label: "Temperature Change (°C)",
            data: temperatureData.map((temp, index) =>
              index === 0 ? 0 : temp - temperatureData[index - 1]
            ),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Temperature Change (°C)",
            },
          },
        },
      },
    });
  }
});
