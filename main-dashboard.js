document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1"; // Replace with your OpenWeather API key
  const weatherWidget = document.getElementById("weather-widget");
  const cityName = document.getElementById("city-name");
  const weatherDescription = document.getElementById("weather-description");
  const temperature = document.getElementById("temperature");
  const weatherIcon = document.getElementById("weather-icon");
  const cityInput = document.getElementById("city-input");
  const getWeatherButton = document.getElementById("get-weather");

  // Handle fetching and displaying weather data
  getWeatherButton.addEventListener("click", () => {
    const city = cityInput.value;
    fetchWeather(city);
    fetchForecast(city);
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
      alert(error.message);
    }
  }

  function updateWidget(data) {
    const { name } = data;
    const { description, icon } = data.weather[0];
    const { temp } = data.main;

    cityName.textContent = `Weather in: ${name}`;
    weatherDescription.textContent = `Description: ${description}`;
    temperature.textContent = `Temperature: ${temp} °C`;

    weatherIcon.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = description;

    changeBackground(description);
  }

  function changeBackground(condition) {
    let backgroundImage;

    switch (condition.toLowerCase()) {
      case "clear sky":
        backgroundImage = "url('assets/weather/sunny.jpg')";
        break;
      case "few clouds":
        backgroundImage = "url('assets/weather/hazy.jpg')";
        break;
      case "scattered clouds":
      case "overcast clouds":
        backgroundImage = "url('assets/weather/hazy.jpg')";
        break;
      case "rain":
      case "light rain":
      case "moderate rain":
        backgroundImage = "url('assets/weather/rainy.jpg')";
        break;
      case "thunderstorm":
        backgroundImage = "url('assets/weather/storm.jpg')";
        break;
      case "snow":
        backgroundImage = "url('assets/weather/snow.jpg')";
        break;
      case "mist":
      case "fog":
        backgroundImage = "url('assets/weather/misty.jpg')";
        break;
      default:
        backgroundImage = "url('assets/weather/clear.jpg')";
        break;
    }

    weatherWidget.style.backgroundImage = backgroundImage;
    weatherWidget.style.backgroundSize = "cover";
    weatherWidget.style.backgroundPosition = "center";
    weatherWidget.style.color = condition.includes("snow") ? "black" : "white";
  }

  // Load Chart.js
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  document.head.appendChild(script);

  script.onload = () => {
    const temperatureCtx = document
      .getElementById("temperatureChart")
      .getContext("2d");
    const weatherConditionCtx = document
      .getElementById("weatherConditionChart")
      .getContext("2d");
    const temperatureChangeCtx = document
      .getElementById("temperatureChangeChart")
      .getContext("2d");

    const temperatureData = [];
    const weatherConditions = [];
    const labels = [];

    async function fetchForecast(city) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
          throw new Error("City not found");
        }
        const data = await response.json();
        processForecastData(data);
      } catch (error) {
        alert(error.message);
      }
    }

    function processForecastData(data) {
      const dailyData = data.list.filter((entry) =>
        entry.dt_txt.endsWith("12:00:00")
      );
      dailyData.forEach((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        labels.push(date);
        temperatureData.push(entry.main.temp);
        weatherConditions.push(entry.weather[0].description);
      });
      updateCharts();
    }

    function updateCharts() {
      new Chart(temperatureCtx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatureData,
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      const weatherConditionCounts = weatherConditions.reduce(
        (acc, condition) => {
          acc[condition] = (acc[condition] || 0) + 1;
          return acc;
        },
        {}
      );
      new Chart(weatherConditionCtx, {
        type: "doughnut",
        data: {
          labels: Object.keys(weatherConditionCounts),
          datasets: [
            {
              label: "Weather Conditions",
              data: Object.values(weatherConditionCounts),
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(153, 102, 255, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      new Chart(temperatureChangeCtx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature Change (°C)",
              data: temperatureData,
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  };
});
