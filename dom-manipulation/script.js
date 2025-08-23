let quotes = [];

// Load quotes from localStorage
window.onload = async function () {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }

  displayQuotes();
  populateCategories();

  // Restore last viewed quote if exists
  const lastViewed = sessionStorage.getItem("lastViewed");
  if (lastViewed) alert("Last viewed quote: " + lastViewed);

  // Start periodic sync with server
  setInterval(syncQuotes, 10000); // every 10 seconds
};

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes in the container
function displayQuotes(filteredList = quotes) {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  filteredList.forEach((quote) => {
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
  const quoteInput = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim() || "General";

  if (!text) return alert("Please enter a quote!");

  const quoteObj = { text, category, id: Date.now() };
  quotes.push(quoteObj);

  saveQuotes();
  displayQuotes();
  populateCategories();
  syncQuoteToServer(quoteObj);

  quoteInput.value = "";
  categoryInput.value = "";
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
  if (!quotes.length) return alert("No quotes available!");
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  alert(`Random Quote: ${randomQuote.text} (${randomQuote.category})`);
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
  fileReader.onload = function (evt) {
    try {
      const importedQuotes = JSON.parse(evt.target.result);
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

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();

    return data.slice(0, 5).map((post) => ({
      id: post.id,
      text: post.title,
      category: "Server",
    }));
  } catch (e) {
    console.error("Error fetching server quotes:", e);
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
    console.log("Quote synced with server!");
  } catch (e) {
    console.error("Error syncing quote to server:", e);
  }
}

// Periodic sync with conflict resolution
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const conflicts = [];

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
    alert("⚠️ Conflict resolved for: " + conflicts.join(", "));
  }

  saveQuotes();
  displayQuotes();
  populateCategories();
  console.log("Quotes synced with server!");
}
