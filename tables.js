document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1"; // Ensure this is your valid API key
  const tableBody = document.getElementById("table-body");
  const pagination = document.getElementById("pagination");
  const city = "London"; // Change to a city you want to fetch
  let forecastData = [];
  const entriesPerPage = 10; // Show 10 entries per page

  // Fetch weather forecast data for the next 5 days
  async function fetchForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.list && data.list.length > 0) {
        processForecastData(data.list);
      } else {
        console.error("No forecast data found");
        alert("No forecast data available for this city.");
      }
    } catch (error) {
      console.error("Error fetching forecast:", error);
      alert(
        "Failed to fetch forecast data. Please check your city name or API key."
      );
    }
  }

  // Process the forecast data and store it in forecastData
  function processForecastData(data) {
    const dailyTemperatures = {}; // Reset for each fetch

    // Gather temperatures for each day and time
    data.forEach((entry) => {
      const date = new Date(entry.dt * 1000);
      const dayName = date.toLocaleString("en-US", { weekday: "long" });
      const dateKey = date.toISOString().split("T")[0]; // Key by date

      if (!dailyTemperatures[dateKey]) {
        dailyTemperatures[dateKey] = { day: dayName, temps: [] };
      }
      dailyTemperatures[dateKey].temps.push({
        time: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temp: entry.main.temp,
      });
    });

    // Flatten data to create entries for each temperature reading
    forecastData = [];
    for (const [date, { day, temps }] of Object.entries(dailyTemperatures)) {
      temps.forEach(({ time, temp }) => {
        forecastData.push({
          date,
          day,
          time,
          temperature: temp.toFixed(1), // Store formatted temperature
        });
      });
    }

    renderTable(); // Render the first page of the table
    renderPagination(); // Render pagination controls
  }

  // Render the forecast data into the table
  function renderTable(page = 1) {
    tableBody.innerHTML = "";
    const start = (page - 1) * entriesPerPage;
    const end = start + entriesPerPage;

    const dataToDisplay = forecastData.slice(start, end);
    dataToDisplay.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td class="border border-gray-300 p-2">${item.day}</td>
                <td class="border border-gray-300 p-2">${item.date}</td>
                <td class="border border-gray-300 p-2">${item.time}</td>
                <td class="border border-gray-300 p-2">${item.temperature} °C</td>
            `;
      tableBody.appendChild(row);
    });
  }

  // Render pagination buttons
  function renderPagination() {
    pagination.innerHTML = "";
    const pageCount = Math.ceil(forecastData.length / entriesPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.className =
        "border border-gray-300 px-4 py-2 mx-1 hover:bg-gray-200";
      button.addEventListener("click", () => {
        renderTable(i);
      });
      pagination.appendChild(button);
    }
  }

  // Fetch the forecast for the default city when the page loads
  fetchForecast(city);
});
