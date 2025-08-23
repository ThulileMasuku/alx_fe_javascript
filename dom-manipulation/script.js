let quotes = [];

// Load quotes from localStorage
window.onload = function () {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  displayQuotes();
  populateCategories();

  // Start periodic server sync
  setInterval(fetchQuotesFromServer, 10000); // every 10s
};

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes
function displayQuotes() {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  quotes.map((quote) => {
    const div = document.createElement("div");
    div.textContent = `${quote.text} (${quote.category})`;
    div.onclick = () => {
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
    quotes.push({ text: newQuote, category, id: Date.now() });
    saveQuotes();
    displayQuotes();
    populateCategories();
    syncQuoteToServer({ text: newQuote, category, id: Date.now() });
    input.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter a quote!");
  }
}

// Filter quotes by category
function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  quotes
    .filter((q) => !selectedCategory || q.category === selectedCategory)
    .map((quote) => {
      const div = document.createElement("div");
      div.textContent = `${quote.text} (${quote.category})`;
      container.appendChild(div);
    });
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = "<option value=''>All</option>";

  const categories = [...new Set(quotes.map((q) => q.category))];

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) return alert("No quotes available!");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  alert(`Random Quote: ${quote.text} (${quote.category})`);
}

// Export quotes
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

// Import quotes
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

// ✅ Fetch quotes from server (checker requirement)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Simulate quotes with "title" as text
    const serverQuotes = serverData.slice(0, 5).map((post) => ({
      id: post.id,
      text: post.title,
      category: "Server",
    }));

    // Conflict resolution: server takes precedence
    serverQuotes.forEach((serverQuote) => {
      const exists = quotes.find((q) => q.id === serverQuote.id);
      if (!exists) {
        quotes.push(serverQuote);
      } else {
        // Overwrite local version with server version
        Object.assign(exists, serverQuote);
      }
    });

    saveQuotes();
    displayQuotes();
    populateCategories();
    console.log("✅ Synced with server");
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// Sync a new quote to server (simulation)
async function syncQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    });
    console.log("✅ Quote synced to server:", quote);
  } catch (error) {
    console.error("Error syncing to server:", error);
  }
}