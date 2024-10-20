document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1";
  const cityInput = document.getElementById("city-input");
  const getWeatherButton = document.getElementById("get-weather");

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
    const { temp } = data.main;

    const cityName = document.getElementById("city-name");
    const weatherDescription = document.getElementById("weather-description");
    const temperature = document.getElementById("temperature");
    const weatherIcon = document.getElementById("weather-icon");

    cityName.textContent = `Weather in: ${name}`;
    weatherDescription.textContent = `Description: ${description}`;
    temperature.textContent = `${temp} °C`;

    weatherIcon.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = description;

    changeBackground(description);
  }

  function changeBackground(condition) {
    let bgColor;
    switch (condition) {
      case "clear sky":
        bgColor = "bg-blue-400";
        break;
      case "few clouds":
        bgColor = "bg-blue-300";
        break;
      case "scattered clouds":
      case "overcast clouds":
        bgColor = "bg-gray-400";
        break;
      case "rain":
        bgColor = "bg-gray-600";
        break;
      case "thunderstorm":
        bgColor = "bg-gray-800";
        break;
      case "snow":
        bgColor = "bg-white";
        break;
      default:
        bgColor = "bg-gray-100";
        break;
    }
    document.getElementById("weather-widget").classList.add(bgColor);
  }

  async function fetchForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const forecastData = await response.json();
      if (forecastData.list && forecastData.list.length > 0) {
        processForecastData(forecastData.list);
      } else {
        console.error("No forecast data found");
        alert("No forecast data available for this city.");
      }
    } catch (error) {
      console.error("Error fetching forecast:", error);
      alert("Failed to fetch forecast data. Please try again.");
    }
  }

  function processForecastData(data) {
    const labels = [];
    const temperatureData = [];
    const weatherConditions = [];

    data.forEach((entry) => {
      const date = new Date(entry.dt * 1000).toLocaleDateString();
      labels.push(date);
      temperatureData.push(entry.main.temp);
      weatherConditions.push(entry.weather[0].description);
    });

    updateCharts(labels, temperatureData, weatherConditions);
  }

  function updateCharts(labels, temperatureData, weatherConditions) {
    if (typeof Chart === "undefined") {
      console.error("Chart.js failed to load.");
      return;
    }

    // Temperature Chart (Bar Chart with Delay Animation)
    new Chart(document.getElementById("temperatureChart"), {
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
        animation: {
          delay: (context) => {
            if (context.type === "data" && context.mode === "default") {
              return context.dataIndex * 100; // Delay for each bar
            }
            return 0; // No delay for other animation types
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Weather Condition Chart (Doughnut Chart with Delay Animation)
    const weatherConditionCounts = weatherConditions.reduce(
      (acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      },
      {}
    );

    new Chart(document.getElementById("weatherConditionChart"), {
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
        animation: {
          delay: (context) => {
            if (context.type === "data" && context.mode === "default") {
              return context.dataIndex * 100; // Delay for each segment
            }
            return 0; // No delay for other animation types
          },
        },
      },
    });

    // Temperature Change Chart (Line Chart with Drop Animation)
    new Chart(document.getElementById("temperatureChangeChart"), {
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
            tension: 0.4, // Smooth the line
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          onComplete: function () {
            this.tooltip._active = [];
            this.tooltip.update();
            this.draw();
          },
          delay: (context) => {
            if (context.type === "data" && context.mode === "default") {
              return context.dataIndex * 100; // Delay for each point
            }
            return 0; // No delay for other animation types
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
});
