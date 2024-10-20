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
    document.getElementById(
      "weather-widget"
    ).className = `p-4 rounded shadow ${bgColor}`;
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
      const temperatureChangeData = data.list.map((item) => item.main.temp);

      createTemperatureChart(temperatureData);
      createWeatherConditionChart(weatherConditionData);
      createTemperatureChangeChart(temperatureChangeData);
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

  function createTemperatureChangeChart(temperatureChangeData) {
    const ctx = document
      .getElementById("temperatureChangeChart")
      .getContext("2d");
    const temperatureChangeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: temperatureChangeData.map((_, index) => `Day ${index + 1}`),
        datasets: [
          {
            label: "Temperature Change (°C)",
            data: temperatureChangeData,
            backgroundColor: "rgba(255, 159, 64, 0.6)",
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
