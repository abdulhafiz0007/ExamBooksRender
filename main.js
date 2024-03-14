// DOM elements 
const elBooksList = document.querySelector(".js-books-list");
const elBooksTemplate = document.querySelector(".js-books-template").content;
const elBookmarkedTemplate = document.querySelector(".js-bookmarked-template").content;
const elBookedMoviesCountBadge = document.querySelector(".js-booked-books-count");
const elBookmarkList = document.querySelector(".saved-books-list");


// Form elements 
const elBooksForm = document.querySelector(".js-books-form");
const elBooksSearchInput = elBooksForm.querySelector(".js-search-input");
const elBooksSortedSelect = elBooksForm.querySelector(".js-sorted-select");
const elBooksLanguageSelect = elBooksForm.querySelector(".js-books-language-select");
const elBooksMinYearInput = elBooksForm.querySelector(".js-minYear-input");
const elBooksMaxYearInput = elBooksForm.querySelector(".js-maxYear-input");


// bookarmark Array 
const bookmarkBooksArr = JSON.parse(window.localStorage.getItem("selectedBook")) || [];


// Render Books function 
const booksDocumentFragment = document.createDocumentFragment();
function renderBooks (arr, node, regex = "") {
    
    node.innerHTML = "";
    arr.forEach(book => {
        
        const booksTemplateNodes =  elBooksTemplate.cloneNode(true);
        booksTemplateNodes.querySelector(".book-image").src = book.imageLink;
        
        if(regex.source != "(?:)" && regex){
            
            booksTemplateNodes.querySelector(".book-title").innerHTML = book.title.replace(regex, match => `<mark class="d-inline-block p-0 bg-warning text-light rounded-2">
            ${match}</mark>`);
            booksTemplateNodes.querySelector(".book-author").innerHTML = book.author.replace(regex, match => `<mark class="d-inline-block p-0 bg-warning text-light rounded-2">
            ${match}</mark>`);
            
            
        } else {
            booksTemplateNodes.querySelector(".book-title").textContent = book.title;
            booksTemplateNodes.querySelector(".book-author").textContent = book.author;
        }
        
        booksTemplateNodes.querySelector(".book-publish-year").textContent = book.year;
        booksTemplateNodes.querySelector(".book-page").textContent = book.pages;
        booksTemplateNodes.querySelector(".book-written-language").textContent = book.language;
        booksTemplateNodes.querySelector(".book-wikipedia-link").href = book.link;
        booksTemplateNodes.querySelector(".books-bookmark-btn").dataset.link = book.link;
        
        if(bookmarkBooksArr.some(item => item.title == book.title)){
            booksTemplateNodes.querySelector(".books-bookmark-btn").textContent = "Bookmarked";
        } else {
            booksTemplateNodes.querySelector(".books-bookmark-btn").textContent = "Bookmark";
        }
        
        booksDocumentFragment.appendChild(booksTemplateNodes)
        
    })
    
    node.appendChild(booksDocumentFragment);
    
}



// Unique Languages Array 
const languagesArr = [];

for (const item of books) {
    const booklanguage = item.language;
    if(!languagesArr.includes(booklanguage)) {
        languagesArr.push(booklanguage)
    }
}

languagesArr.forEach(item => {
    const newItem = document.createElement("option");
    newItem.value = item.toLowerCase();
    newItem.textContent = item;
    elBooksLanguageSelect.appendChild(newItem);
});


// function for checking the bookmark count 
function checkBookmarkArrayCount() {
    if(!bookmarkBooksArr.length) {
        elBookedMoviesCountBadge.classList.add("d-none");
    } else {
        elBookedMoviesCountBadge.classList.remove("d-none");
        elBookedMoviesCountBadge.textContent = bookmarkBooksArr.length;
    }
}


// function for rendering the bookmark list 
function bookmarkBooksRenderFn(arr, node) {
    
    const bookmarkDocFragment = document.createDocumentFragment();
    node.innerHTML = "";
    
    arr.forEach((booked) => {
        
        const bookmarkTemplateNodes = elBookmarkedTemplate.cloneNode(true);
        
        bookmarkTemplateNodes.querySelector(".book-image").src = booked.imageLink;
        bookmarkTemplateNodes.querySelector(".book-title").textContent = booked.title;
        bookmarkTemplateNodes.querySelector(".book-author").textContent = booked.author;
        bookmarkTemplateNodes.querySelector(".book-publish-year").textContent = booked.year;
        bookmarkTemplateNodes.querySelector(".book-page").textContent = booked.pages;
        bookmarkTemplateNodes.querySelector(".book-written-language").textContent = booked.language;
        bookmarkTemplateNodes.querySelector(".saved-book-delete-btn").dataset.link = booked.link;
        
        bookmarkDocFragment.appendChild(bookmarkTemplateNodes);
        
    });
    
    node.appendChild(bookmarkDocFragment);
    
};


// function for deleting the bookmarked item 
function deleteBookmarkedBookFn(id, target = "") {
    target.textContent = "Bookmark";
    
    bookmarkBooksArr.splice(id, 1);
    
    window.localStorage.setItem("selectedBook", JSON.stringify(bookmarkBooksArr));
    checkBookmarkArrayCount();
}


// pushing the saved books to bookmark Array 
elBooksList.addEventListener("click", function(evt){
    
    if(evt.target.matches(".books-bookmark-btn")){
        
        const btnBookedId = evt.target.dataset.link;
        
        const findSelectedBook = books.find(item => {
            return item.link == btnBookedId;
        });
        
        const uniqueBookmarkBookIndex = bookmarkBooksArr.findIndex(item => {
            return item.link == btnBookedId;
        });
        
        if(uniqueBookmarkBookIndex === -1){
            
            bookmarkBooksArr.push(findSelectedBook);
            
            bookmarkBooksRenderFn(bookmarkBooksArr, elBookmarkList);
            
            evt.target.textContent = "Bookmarked";
            
            window.localStorage.setItem("selectedBook", JSON.stringify(bookmarkBooksArr));
            
            checkBookmarkArrayCount();
            
        } else {
            deleteBookmarkedBookFn(uniqueBookmarkBookIndex, evt.target);
            bookmarkBooksRenderFn(bookmarkBooksArr, elBookmarkList);
        }
    }
    
});


elBookmarkList.addEventListener("click", function(evt){
    
    if(evt.target.matches(".saved-book-delete-btn")) {
        
        const deleteBookedBookLink = evt.target.dataset.link;
        
        const uniqueBookmarkBookIndex = bookmarkBooksArr.findIndex(item => {
            return item.link == deleteBookedBookLink;
        });
        
        deleteBookmarkedBookFn(uniqueBookmarkBookIndex, evt.target);
        
        checkBookmarkArrayCount();
        
        bookmarkBooksRenderFn(bookmarkBooksArr, elBookmarkList);
        
        renderBooks(books, elBooksList);
        
    }
    
});


// function for filtering the array 
function resultSearchedBooks (searchValue) {
    
    const searchedBooks = books.filter(item => {
        
        const selectedLanguageVal = elBooksLanguageSelect.value;
        const regexSelectedLanguage = new RegExp(selectedLanguageVal, "gi");
        const filteredBooks = (item.title.match(searchValue) || item.author.match(searchValue)) && (selectedLanguageVal == "all" || item.language.match(regexSelectedLanguage)) 
        && (elBooksMinYearInput.value == "" || item.year >= Number(elBooksMinYearInput.value)) && (elBooksMaxYearInput.value == "" || item.year <= elBooksMaxYearInput.value)
        
        return filteredBooks
        
    });
    
    return searchedBooks
    
};


// function for sorting the array 
function sortedBooks (arr, sortedValue) {
    
    arr.sort((a, b) => {
        if (sortedValue == "a-z") {
            return a.title[0].toLowerCase().charCodeAt(0) - b.title.toLowerCase().charCodeAt(0)
        } else if (sortedValue == "z-a") {
            return b.title[0].toLowerCase().charCodeAt(0) - a.title.toLowerCase().charCodeAt(0)
        } else if (sortedValue == "min-year") {
            return a.year - b.year
        } else if (sortedValue == "max-year") {
            return b.year - a.year
        } else if (sortedValue == "min-page") {
            return a.pages - b.pages
        } else if (sortedValue == "max-page") {
            return b.pages - a.pages
        }
    });
    
};


// function for submitting the form 
function handleSubmitFunction (evt) {
    evt.preventDefault();
    
    const searchInputVal = elBooksSearchInput.value;
    const regexSearchedTitle = new RegExp (searchInputVal, "gi");
    
    const searchedBooks = resultSearchedBooks(regexSearchedTitle);
    
    if(searchedBooks.length > 0) {
        sortedBooks(searchedBooks, elBooksSortedSelect.value);
        renderBooks(searchedBooks, elBooksList, regexSearchedTitle);
    } else {
        alert("This book is not found!")
    }
}

// final subimt process 
elBooksForm.addEventListener("submit", handleSubmitFunction);

renderBooks(books, elBooksList);
checkBookmarkArrayCount();
bookmarkBooksRenderFn(bookmarkBooksArr, elBookmarkList);




