const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const messageElement = document.getElementById("message");

const newQuoteButton = document.getElementById("newQuote");
const copyButton = document.getElementById("copyQuote");
const downloadButton = document.getElementById("downloadQuote");

const historyElement = document.getElementById("history");
const favoritesElement = document.getElementById("favorites");
const searchInput = document.getElementById("searchInput");

let currentQuote = "";
let currentAuthor = "";


// Generate a new quote
async function generateQuote() {

    newQuoteButton.disabled = true;
    messageElement.textContent = "Fetching a new quote...";

    try {

        const response = await fetch("/get_quote");

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to generate quote.");
        }

        currentQuote = data.quote;
        currentAuthor = data.author;

        quoteElement.textContent = currentQuote;
        authorElement.textContent = "— " + currentAuthor;

        messageElement.textContent = "Quote generated and saved!";

        await loadHistory();
        await loadFavorites();

    } catch (error) {

        console.error("Quote generation error:", error);

        messageElement.textContent = error.message;

    } finally {

        newQuoteButton.disabled = false;

    }
}


// Load quote history
async function loadHistory() {

    try {

        const response = await fetch("/history");

        if (!response.ok) {
            throw new Error("Unable to load history.");
        }

        const history = await response.json();

        historyElement.replaceChildren();

        if (history.length === 0) {
            historyElement.textContent = "No quotes generated yet.";
            return;
        }

        history.forEach(item => {

            const card = document.createElement("div");
            card.className = "history-item";

            const quote = document.createElement("p");
            quote.textContent = '"' + item.quote + '"';

            const author = document.createElement("small");
            author.textContent = "— " + item.author;

            const date = document.createElement("small");
            date.textContent = new Date(
                item.created_at.replace(" ", "T")
            ).toLocaleString();

            const favoriteButton = document.createElement("button");

            favoriteButton.className = "favorite-btn";

            favoriteButton.textContent = item.is_favorite
                ? "❤️ Remove Favourite"
                : "🤍 Add Favourite";

            favoriteButton.addEventListener("click", async () => {

                try {

                    const response = await fetch(
                        "/favorite/" + item.id,
                        { method: "POST" }
                    );

                    if (!response.ok) {
                        throw new Error("Unable to update favourite.");
                    }

                    await loadHistory();
                    await loadFavorites();

                } catch (error) {

                    messageElement.textContent = error.message;

                }

            });

            const deleteButton = document.createElement("button");

            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteQuote(item.id);
            });

            card.append(
                quote,
                author,
                date,
                favoriteButton,
                deleteButton
            );

            historyElement.appendChild(card);

        });

        applySearch();

    } catch (error) {

        console.error(error);
        historyElement.textContent = error.message;

    }
}


// Load favourite quotes
async function loadFavorites() {

    try {

        const response = await fetch("/favorites");

        if (!response.ok) {
            throw new Error("Unable to load favourites.");
        }

        const favorites = await response.json();

        favoritesElement.replaceChildren();

        if (favorites.length === 0) {
            favoritesElement.textContent = "No favourite quotes yet.";
            return;
        }

        favorites.forEach(item => {

            const card = document.createElement("div");
            card.className = "history-item";

            const quote = document.createElement("p");
            quote.textContent = '"' + item.quote + '"';

            const author = document.createElement("small");
            author.textContent = "— " + item.author;

            card.append(quote, author);

            favoritesElement.appendChild(card);

        });

    } catch (error) {

        console.error(error);
        favoritesElement.textContent = error.message;

    }
}


// Delete a quote
async function deleteQuote(id) {

    try {

        const response = await fetch("/delete/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete quote.");
        }

        await loadHistory();
        await loadFavorites();

        messageElement.textContent = "Quote deleted successfully!";

    } catch (error) {

        messageElement.textContent = error.message;

    }
}


// Copy quote
copyButton.addEventListener("click", async () => {

    if (!currentQuote) {
        messageElement.textContent = "Generate a quote first!";
        return;
    }

    try {

        await navigator.clipboard.writeText(
            '"' + currentQuote + '" — ' + currentAuthor
        );

        messageElement.textContent = "Quote copied successfully!";

    } catch (error) {

        messageElement.textContent = "Unable to copy quote.";

    }

});


// Download quote
downloadButton.addEventListener("click", () => {

    if (!currentQuote) {
        messageElement.textContent = "Generate a quote first!";
        return;
    }

    const content =
        '"' + currentQuote + '"\n— ' + currentAuthor;

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "My_Quote.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    messageElement.textContent = "Download started!";

});


// Search history
function applySearch() {

    const searchValue = searchInput.value.toLowerCase();

    const cards = historyElement.querySelectorAll(".history-item");

    cards.forEach(card => {

        const text = card.textContent.toLowerCase();

        card.style.display = text.includes(searchValue)
            ? "block"
            : "none";

    });

}


// Event listeners
newQuoteButton.addEventListener("click", generateQuote);

searchInput.addEventListener("input", applySearch);


// Initial loading
loadHistory();
loadFavorites();