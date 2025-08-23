let quotes = [];

// --------------------
// Initialization
// --------------------
window.onload = async function () {
  // Load quotes from localStorage
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) quotes = JSON.parse(storedQuotes);

  // Build dynamic UI
  createAddQuoteForm();
  createFilterDropdown();
  createQuoteContainer();
  createRandomQuoteButton();

  displayQuotes();
  populateCategories();

  // Restore last selected category filter
  const lastFilter = localStorage.getItem("lastSelectedCategory");
  if (lastFilter) {
    const select = document.getElementById("categoryFilter");
    select.value = lastFilter;
    filterQuotes();
  }

  // Restore last viewed quote from sessionStorage
  const lastViewed = sessionStorage.getItem("lastViewed");
  if (lastViewed) alert("Last viewed quote: " + lastViewed);

  // Bind Export / Import buttons
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  // Start server sync every 10 seconds
  setInterval(syncQuotes, 10000);
};

// --------------------
// Dynamic UI Creation
// --------------------
function createAddQuoteForm() {
  const container = document.getElementById("appContainer");

  const h2 = document.createElement("h2");
  h2.textContent = "Add a New Quote";
  container.appendChild(h2);

  const quoteInput = document.createElement("input");
  quoteInput.id = "quoteInput";
  quoteInput.placeholder = "Enter a quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "categoryInput";
  categoryInput.placeholder = "Enter category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

function createFilterDropdown() {
  const container = document.getElementById("appContainer");

  const h2 = document.createElement("h2");
  h2.textContent = "Filter Quotes";
  container.appendChild(h2);

  const label = document.createElement("label");
  label.textContent = "Filter by category: ";
  label.htmlFor = "categoryFilter";

  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.addEventListener("change", filterQuotes);

  container.appendChild(label);
  container.appendChild(select);
}

function createQuoteContainer() {
  const container = document.getElementById("appContainer");

  const h2 = document.createElement("h2");
  h2.textContent = "Quotes";
  container.appendChild(h2);

  const quoteContainer = document.createElement("div");
  quoteContainer.id = "quoteContainer";
  container.appendChild(quoteContainer);
}

function createRandomQuoteButton() {
  const container = document.getElementById("appContainer");
  const btn = document.createElement("button");
  btn.textContent = "Show Random Quote";
  btn.addEventListener("click", showRandomQuote);
  container.appendChild(btn);
}

// --------------------
// Core Functions
// --------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function displayQuotes(filteredList = quotes) {
  const container = document.getElementById("quoteContainer");
  container.innerHTML = "";

  filteredList.forEach(q => {
    const div = document.createElement("div");
    div.textContent = `${q.text} (${q.category})`;
    div.onclick = () => {
      sessionStorage.setItem("lastViewed", q.text);
      alert("You clicked: " + q.text);
    };
    container.appendChild(div);
  });
}

function addQuote() {
  const quoteInput = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim() || "General";

  if (!text) return alert("Please enter a quote!");

  const newQuote = { text, category, id: Date.now() };
  quotes.push(newQuote);

  saveQuotes();         // Persist to localStorage
  displayQuotes();      // Update DOM
  populateCategories(); // Update dropdown to include new category
  filterQuotes();       // Apply current filter if any
  syncQuoteToServer(newQuote);

  quoteInput.value = "";
  categoryInput.value = "";
}

function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const selectedCategory = select.value;

  // Save last selected filter
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const filtered = selectedCategory ? quotes.filter(q => q.category === selectedCategory) : quotes;
  displayQuotes(filtered);
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const currentValue = select.value; // preserve current selection
  select.innerHTML = "<option value=''>All Categories</option>";

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore previous selection if it exists
  if (currentValue) select.value = currentValue;
}

function showRandomQuote() {
  if (!quotes.length) return alert("No quotes available!");
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  sessionStorage.setItem("lastViewed", quote.text);
  alert(`Random Quote: ${quote.text} (${quote.category})`);
}

// --------------------
// JSON Import / Export
// --------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) return alert("Invalid JSON format.");
      quotes.push(...imported);
      saveQuotes();        // Persist imported quotes
      displayQuotes();     // Update DOM
      populateCategories();// Update dropdown
      filterQuotes();      // Apply current filter
      alert("Quotes imported successfully!");
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --------------------
// Server Sync & Conflict
// --------------------
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    return data.slice(0, 5).map(p => ({ id: p.id, text: p.title, category: "Server" }));
  } catch {
    return [];
  }
}

async function syncQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote synced with server!");
  } catch {}
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const conflicts = [];

  serverQuotes.forEach(sq => {
    const local = quotes.find(q => q.id === sq.id);
    if (!local) quotes.push(sq);
    else if (local.text !== sq.text) {
      Object.assign(local, sq); // Server takes precedence
      conflicts.push(sq.text);
    }
  });

  if (conflicts.length) alert("Conflict resolved: " + conflicts.join(", "));
  saveQuotes();
  displayQuotes();
  populateCategories();
}
