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


// User Interface.

// Functions.
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
    removeBookFromDB(name)
}

function openAddBookModal() {
    addBookForm.reset()
    addBookModal.classList.add('active')
}

function closeAddBookModal() {
    addBookModal.classList.remove('active')
    // overlay.classList.remove('active')
    errorMsg.classList.remove('active')
    errorMsg.textContent = ''
}

function handleKeyboardInput(e) {
    if (e.key === 'Escape') {
        closeAddBookModal()
    }
}

function getBookFromInputForm() {
    const name = document.getElementById('name').value
    const author = document.getElementById('author').value
    const pages = document.getElementById('pages').value
    const isRead = document.getElementById('isRead').value

    return new Book(name, author, pages, isRead)
}


function addBook(e) {
    e.preventDefault()
    const newBook = getBookFromInputForm()

    if (library.isInLibrary(newBook)) {
        errorMsg.textContent = 'This book already exists in your library'
        errorMsg.classList.add('active')
        return
    }

    library.addBook(newBook)
    saveLocal()
    saveBookToDB(newBook)
    updateBookGrid()
    closeAddBookModal()
}


// Local Storage functions.
function saveLocal() {
    // Replace the entire library reference with the new library.
    localStorage.setItem('library', JSON.stringify(library.books))
}

function restoreLocal() {
    const books = JSON.parse(localStorage.getItem('library'))
    if (books) {
        library.books = books.map((book) => JSONToBook(book))
    } else {
        library.books = []
    }
    updateBookGrid()
}

// FireStore.
function saveBookToDB(book) {
    db.collection('library').add({
            name: book.name,
            author: book.author,
            pages: book.pages,
            isRead: book.isRead
    })
}

async function removeBookFromDB(name) {
    db.collection('library').doc(await getBookIDFromName(name)).delete()
    updateBookGrid()
}

async function getBookIDFromName(name) {
    const snapshot = await db
        .collection('library')
        .where('name', '==', name)
        .get()
    const bookID = snapshot.docs.map((doc) => doc.id).join('')
    return bookID
}

async function getBooksFromDB() {
    let snapshot = await db.collection('library').get()

    library.books = snapshot.docs.map((doc) => new Book(
        doc.data().name,
        doc.data().author,
        doc.data().pages,
        doc.data().isRead
    ))

    updateBookGrid()
}


// Helper functions.
function JSONToBook(book) {
    return new Book(book.name, book.author, book.pages, book.isRead)
}


// Main script.
// Global variables.
const library = new Library()

const db = firebase.firestore();

const bookGrid = document.getElementById('bookGrid')
const addBookBtn = document.getElementById('addBookBtn')
const addBookModal = document.getElementById('addBookModal')
const addBookForm = document.getElementById('addBookForm')

// Events.
addBookBtn.onclick = openAddBookModal
addBookForm.onsubmit = addBook
window.onkeydown = handleKeyboardInput

// restoreLocal()
getBooksFromDB()
