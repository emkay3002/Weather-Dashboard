document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1";
  const tableBody = document.getElementById("table-body");
  const pagination = document.getElementById("pagination");
  let forecastData = [];
  const entriesPerPage = 10;

  // Fetch weather forecast data for the next 5 days
  async function fetchForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found");
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
      alert("Failed to fetch forecast data. Please try again.");
    }
  }

  // Process the forecast data and store it in forecastData
  function processForecastData(data) {
    forecastData = data
      .map((entry) => ({
        date: new Date(entry.dt * 1000).toLocaleDateString(),
        temperature: entry.main.temp,
      }))
      .slice(0, 10); // Get only the first 10 entries
    renderTable();
    renderPagination();
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
                <td class="border border-gray-300 p-2">${item.date}</td>
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

  // Fetch the forecast for a default city when the page loads
  fetchForecast("London"); // Change "London" to any default city you want
});
