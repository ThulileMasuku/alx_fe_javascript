// Array of initial quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Humor" }
];

// Select DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available.</em>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>"${quote.text}"</strong> — <em>${quote.category}</em>`;
}

// Function to add a new quote
function addQuote(textInput, categoryInput) {
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Both quote and category are required!");
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Function to dynamically create the Add Quote Form
function createAddQuoteForm(parent) {
  const formDiv = document.createElement('div');

  const textInput = document.createElement('input');
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement('input');
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement('button');
  addButton.textContent = "Add Quote";

  // Event listener for dynamically created button
  addButton.addEventListener('click', () => addQuote(textInput, categoryInput));

  // Append inputs and button to form div
  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  // Append form to the parent element
  parent.appendChild(formDiv);
}

// Initialize the dynamic form
createAddQuoteForm(document.body);

// Event listener for showing random quotes
newQuoteBtn.addEventListener('click', showRandomQuote);
