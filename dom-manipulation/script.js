let quotes = [];

// Load quotes from localStorage on startup
window.onload = function () {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  displayQuotes();
  populateCategories();

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

// Display quotes in the container (with filter support)
function displayQuotes() {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  const selectedCategory = document.getElementById("categoryFilter").value;

  // Use .map() to generate HTML for each quote
  quotes
    .filter(q => !selectedCategory || q.category === selectedCategory)
    .map((quote, index) => {
      const div = document.createElement("div");
      div.textContent = `${quote.text} (${quote.category})`;

      // Save last viewed quote in sessionStorage when clicked
      div.onclick = function () {
        sessionStorage.setItem("lastViewed", quote.text);
        alert("You clicked: " + quote.text);
      };

      container.appendChild(div);
    });
}

// Add a new quote
function addQuote() {
  const input = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  const newQuote = input.value.trim();
  const category = categoryInput.value.trim() || "General";

  if (newQuote) {
    quotes.push({ text: newQuote, category });
    saveQuotes();
    displayQuotes();
    populateCategories();
    input.value = "";
    categoryInput.value = "";
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
        populateCategories();
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

// ✅ Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = "<option value=''>All</option>";

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}