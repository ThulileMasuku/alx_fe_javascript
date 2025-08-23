let quotes = [];

// Load quotes from localStorage when app starts
window.onload = function () {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  displayQuotes();

  // Example of sessionStorage usage
  const lastViewed = sessionStorage.getItem("lastViewed");
  if (lastViewed) {
    console.log("Last viewed quote:", lastViewed);
  }
};

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes in the container
function displayQuotes() {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  quotes.forEach((quote, index) => {
    const div = document.createElement("div");
    div.textContent = quote;

    // Save last viewed quote in sessionStorage when clicked
    div.onclick = function () {
      sessionStorage.setItem("lastViewed", quote);
      alert("You clicked: " + quote);
    };

    container.appendChild(div);
  });
}

// Add a new quote
function addQuote() {
  const input = document.getElementById("quoteInput");
  const newQuote = input.value.trim();

  if (newQuote) {
    quotes.push(newQuote);
    saveQuotes();
    displayQuotes();
    input.value = "";
  } else {
    alert("Please enter a quote!");
  }
}

// Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        displayQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (e) {
      alert("Error reading JSON file!");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}
