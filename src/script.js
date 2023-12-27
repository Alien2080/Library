class Book {
    constructor(
        name = 'Unknown',
        author = 'Unknown',
        pages = '0',
        isRead = false
    ) {
        this.name = name
        this.author = author
        this.pages = pages
        this.isRead = isRead
    }
}


class Library {
    constructor() {
        this.books = []
    }

    addBook(newBook) {
        if (!this.isInLibrary(newBook)) {
            this.books.push(newBook)
        }
    }

    removeBook(name) {
        this.books = this.books.filter((book) => book.name !== name)
    }

    getBook(name) {
        return this.books.find((book) => book.name === name)
    }

    isInLibrary(bookToCheck) {
        return this.books.some((b) => b.name === bookToCheck.name)
    }
}


// User Interface functions and global variables.
const bookGrid = document.getElementById('bookGrid')

function updateBookGrid() {
    resetBookGrid()
    for (let book of library.books) {
        createBookCard(book)
    }
}

function resetBookGrid() {
    bookGrid.innerHTML = ''
}

function createBookCard(book) {
    const bookCard = document.createElement('div')
    const name = document.createElement('p')
    const author = document.createElement('p')
    const pages = document.createElement('p')
    const buttonGroup = document.createElement('div')
    const readBtn = document.createElement('button')
    const removeBtn = document.createElement('button')

    bookCard.classList.add('book-card')
    buttonGroup.classList.add('button-group')
    readBtn.classList.add('btn')
    removeBtn.classList.add('btn')
    removeBtn.onclick = removeBook

    name.textContent = `"${book.name}"`
    author.textContent = book.author
    pages.textContent = `${book.pages} pages`
    removeBtn.textContent = 'Remove'

    if (book.isRead) {
        readBtn.textContent = 'Read'
        readBtn.classList.add('btn-light-green')
    } else {
        readBtn.textContent = 'Not read'
        readBtn.classList.add('btn-light-red')
    }

    bookCard.appendChild(name)
    bookCard.appendChild(author)
    bookCard.appendChild(pages)
    buttonGroup.appendChild(readBtn)
    buttonGroup.appendChild(removeBtn)
    bookCard.appendChild(buttonGroup)
    bookGrid.appendChild(bookCard)
}

function removeBook(e) {
    const name = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
        '"',
        ''
    )
    library.removeBook(name)
    updateBookGrid()
    saveLocal()
}


// Local Storage functions.
function saveLocal() {
    localStorage.setItem('library', JSON.stringify(library.books))
}

function restoreLocal() {
    const books = JSON.parse(localStorage.getItem('library'))
    if (books) {
        library.books = books.map((book) => JSONToBook(book))
    } else {
        library.books = []
    }
}


// Helper functions.
function JSONToBook(book) {
    return new Book(book.name, book.author, book.pages, book.isRead)
}


// Main script.
const library = new Library()

// Added hard coded values for testing.
restoreLocal()
// library.addBook(new Book('title', 'author', 13))
// library.addBook(new Book('title1', 'author', 13))
// library.addBook(new Book('title2', 'author', 13))
// library.addBook(new Book('title3', 'author', 13))
updateBookGrid()

