document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "e87ad9d755ad6ee678f1952e3c13a8e1";
  const Gemini_ApiKey = "AIzaSyAlrBl1tlhFTMU67FeWNI0h3fqMli9Qpuo";
  const tableBody = document.getElementById("table-body");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("city-search");
  const searchButton = document.getElementById("search-button");
  const chatBox = document.getElementById("chat-box");
  const chatInput = document.getElementById("chat-input");
  const sendButton = document.getElementById("send-button");

  let forecastData = [];
  let filteredData = [];
  const entriesPerPage = 10;

  // Default city
  let city = "London";

  // Fetch weather forecast data for the next 5 days
  function fetchForecast(city) {
    console.log(`Fetching forecast for: ${city}`); // Debug log
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`,
      type: "GET",
      success: function (data) {
        console.log("Fetched data:", data); // Debug log
        if (data.list && data.list.length > 0) {
          processForecastData(data.list);
        } else {
          console.error("No forecast data found");
          alert("No forecast data available for this city.");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error fetching forecast:", error);
        alert(
          "Failed to fetch forecast data. Please check your city name or API key."
        );
      },
    });
  }

  // Process the forecast data and store it in forecastData
  function processForecastData(data) {
    forecastData = data.map((entry) => {
      const date = new Date(entry.dt * 1000);
      const dayName = date.toLocaleString("en-US", { weekday: "long" });
      const dateString = date.toLocaleDateString("en-US");
      const timeString = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const temp = entry.main.temp;
      const weatherIcon = entry.weather[0].icon;

      return {
        day: dayName,
        date: dateString,
        time: timeString,
        temperature: temp.toFixed(2), // Ensure it's displayed as a string with 2 decimal places
        weatherIcon,
      };
    });

    console.log("Processed forecast data:", forecastData); // Debug log
    filteredData = [...forecastData]; // Initialize filtered data
    displayTableData(1);
  }

  // Display the forecast data in the table and handle pagination
  function displayTableData(page) {
    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    // Clear the existing table body
    tableBody.innerHTML = "";

    // Populate the table with data for the current page
    const currentData = filteredData.slice(startIndex, endIndex);
    currentData.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td class="border border-gray-300 p-2">${entry.day}</td>
                  <td class="border border-gray-300 p-2">${entry.date}</td>
                  <td class="border border-gray-300 p-2">${entry.time}</td>
                  <td class="border border-gray-300 p-2">${entry.temperature} °C</td>
                  <td class="border border-gray-300 p-2">
                      <img src="https://openweathermap.org/img/w/${entry.weatherIcon}.png" alt="Weather icon" class="w-10 h-10"/>
                  </td>
              `;
      tableBody.appendChild(row);
    });

    // Update pagination
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);
    updatePagination(page, totalPages);
  }

  // Update pagination controls
  function updatePagination(currentPage, totalPages) {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.innerText = i;
      pageButton.className = `border border-gray-300 px-3 py-1 rounded-md ${
        currentPage === i ? "bg-teal-700 text-white" : "text-teal-700"
      }`;
      pageButton.onclick = () => {
        displayTableData(i);
      };
      pagination.appendChild(pageButton);
    }
  }

  // Handle city search
  searchButton.addEventListener("click", () => {
    const newCity = searchInput.value.trim();
    if (newCity) {
      city = newCity;
      fetchForecast(city);
    } else {
      alert("Please enter a city name.");
    }
  });

  // Filter buttons functionality
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterType = button.id;

      switch (filterType) {
        case "filter-all":
          filteredData = [...forecastData]; // Show all data
          break;
        case "filter-cold":
          filteredData = forecastData.filter(
            (entry) => parseFloat(entry.temperature) < 15
          );
          break;
        case "filter-warm":
          filteredData = forecastData.filter(
            (entry) =>
              parseFloat(entry.temperature) >= 15 &&
              parseFloat(entry.temperature) <= 25
          );
          break;
        case "filter-hot":
          filteredData = forecastData.filter(
            (entry) => parseFloat(entry.temperature) > 25
          );
          break;
        default:
          filteredData = [...forecastData]; // Default to show all
      }
      displayTableData(1); // Reset to the first page after filtering
    });
  });

  // Add a message to the chat box
  function addMessageToChat(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.className = `mb-2 p-2 rounded-lg ${
      sender === "User"
        ? "bg-teal-700 text-white text-right"
        : "bg-gray-200 text-left"
    }`;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Chatbot functionality
  sendButton.addEventListener("click", () => {
    const userInput = chatInput.value.trim();
    if (userInput) {
      addMessageToChat("User", userInput);
      chatInput.value = "";
      getChatbotReply(userInput).then((botReply) => {
        addMessageToChat("Stormly", botReply);
      });
    }
  });

  // Function to get a response from the Gemini API
  async function getChatbotReply(userMessage) {
    console.log(`Sending query to Gemini: ${userMessage}`);

    // Check if the message contains weather-related keywords
    const weatherKeywords = ["weather", "temperature", "forecast", "Islamabad"];
    const isWeatherQuery = weatherKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );

    // If it's a weather query, respond with available data
    if (isWeatherQuery) {
      const today = new Date().toLocaleDateString();
      const cityForecast = forecastData.find((entry) => {
        const entryDate = new Date(entry.dt * 1000).toLocaleDateString();
        return entryDate === today;
      });

      if (cityForecast) {
        return `The weather in Islamabad today is ${cityForecast.temperature} °C.`;
      } else {
        return "I'm not sure about the weather right now. Please check back later.";
      }
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Gemini_ApiKey}`;
    console.log(`Requesting from Gemini API: ${geminiUrl}`);

    return $.ajax({
      url: geminiUrl,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
      }),
    })
      .then((response) => {
        console.log("Gemini API Response: ", response);

        if (response && response.candidates && response.candidates[0]) {
          const result =
            response.candidates[0].content.parts[0]?.text ||
            "I couldn't find an answer.";
          return result;
        } else {
          return "No valid response from the Gemini API.";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        return "Error processing your query.";
      });
  }

  // Initial fetch for default city
  fetchForecast(city);
});
