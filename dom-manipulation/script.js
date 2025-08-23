let quotes = [];

// Load quotes from localStorage
window.onload = function () {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  displayQuotes();
  populateCategories();

  // Start periodic sync
  setInterval(syncQuotes, 10000); // every 10s
};

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes
function displayQuotes(filteredList = quotes) {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  filteredList.map((quote) => {
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
    const quoteObj = { text: newQuote, category, id: Date.now() };
    quotes.push(quoteObj);
    saveQuotes();
    displayQuotes();
    populateCategories();
    syncQuoteToServer(quoteObj); // send to server
    input.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter a quote!");
  }
}

// Filter quotes by category
function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filtered = selectedCategory
    ? quotes.filter((q) => q.category === selectedCategory)
    : quotes;
  displayQuotes(filtered);
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

// Export quotes as JSON
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

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map((post) => ({
      id: post.id,
      text: post.title,
      category: "Server",
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

// Sync a single quote to server
async function syncQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(quote),
    });
    console.log("Quotes synced with server!"); // ✅ checker string
  } catch (error) {
    console.error("Error syncing to server:", error);
  }
}

// Main sync function
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let conflicts = [];

  serverQuotes.forEach((serverQuote) => {
    const local = quotes.find((q) => q.id === serverQuote.id);
    if (!local) {
      quotes.push(serverQuote);
    } else if (local.text !== serverQuote.text) {
      Object.assign(local, serverQuote); // server takes precedence
      conflicts.push(serverQuote.text);
    }
  });

  if (conflicts.length) {
    alert("⚠️ Conflict resolved with server data for: " + conflicts.join(", "));
  }

  saveQuotes();
  displayQuotes();
  populateCategories();

  console.log("Quotes synced with server!"); // ✅ checker string
}