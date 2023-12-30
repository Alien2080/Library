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
    readBtn.onclick = toggleRead
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

function setupNavbar(user) {
    if (user) {
        loggedIn.classList.add('active')
        loggedOut.classList.remove('active')
    } else {
        loggedIn.classList.remove('active')
        loggedOut.classList.add('active')
    }
    loadingRing.classList.remove('active')
}

function setupAccountModal(user) {
    if (user) {
        accountModal.innerHTML = `
        <p>Logged in as</p>
        <p><strong>${user.email.split('@')[0]}</strong></p>`
    } else {
        accountModal.innerHTML = ''
    }
}

function openAddBookModal() {
    addBookForm.reset()
    addBookModal.classList.add('active')
    overlay.classList.add('active')
}

function closeAddBookModal() {
    addBookModal.classList.remove('active')
    overlay.classList.remove('active')
    errorMsg.classList.remove('active')
    errorMsg.textContent = ''
}

function openAccountModal() {
    accountModal.classList.add('active')
    overlay.classList.add('active')
}

function closeAccountModal() {
    accountModal.classList.remove('active')
    overlay.classList.remove('active')
}

function closeAllModals() {
    closeAddBookModal()
    closeAccountModal()
}

function handleKeyboardInput(e) {
    if (e.key === 'Escape') closeAllModals()
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

    if (auth.currentUser) {
        saveBookToDB(newBook)
    } else {
        library.addBook(newBook)
        saveLocal()
        updateBookGrid()
    }

    closeAddBookModal()
}


function toggleRead(e) {
    const title = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
        '"',
        ''
    )
    const book = library.getBook(title)

    if (auth.currentUser) {
        toggleBookIsReadDB(book)
    } else {
        book.isRead = !book.isRead
        saveLocal()
        updateBookGrid()
    }
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
// Auth
const auth = firebase.auth()

function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
}

function signOut() {
    auth.signOut()
}

function setupRealTimeListener() {
    unsubscribe = db
        .collection('library')
        .where('ownerID', '==', auth.currentUser.uid)
        .orderBy('createdAt')
        .onSnapshot((snapshot) => {
            library.books = snapshot.docs.map((doc) => new Book(
                doc.data().name,
                doc.data().author,
                doc.data().pages,
                doc.data().isRead
            ))
            updateBookGrid()
        })
}

function saveBookToDB(book) {
    db.collection('library').add({
        ownerID: auth.currentUser.uid,
        name: book.name,
        author: book.author,
        pages: book.pages,
        isRead: book.isRead,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
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
        .where('ownerID', '==', auth.currentUser.uid)
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

// Firebase and auth
const db = firebase.firestore()
let unsubscribe

const logInBtn = document.getElementById('logInBtn')
const logOutBtn = document.getElementById('logOutBtn')

const bookGrid = document.getElementById('bookGrid')
const accountBtn = document.getElementById('accountBtn')
const accountModal = document.getElementById('accountModal')
const addBookBtn = document.getElementById('addBookBtn')
const addBookModal = document.getElementById('addBookModal')
const errorMsg = document.getElementById('errorMsg')
const overlay = document.getElementById('overlay')
const addBookForm = document.getElementById('addBookForm')
const loggedIn = document.getElementById('loggedIn')
const loggedOut = document.getElementById('loggedOut')
const loadingRing = document.getElementById('loadingRing')

// Events.
overlay.onclick = closeAllModals
accountBtn.onclick = openAccountModal
addBookBtn.onclick = openAddBookModal
addBookForm.onsubmit = addBook
window.onkeydown = handleKeyboardInput
logInBtn.onclick = signIn
logOutBtn.onclick = signOut

// restoreLocal()
// getBooksFromDB()

auth.onAuthStateChanged(async (user) => {
    if (user) {
        setupRealTimeListener()
    } else {
        if (unsubscribe) unsubscribe()
        restoreLocal()
        updateBookGrid()
    }
    setupAccountModal(user)
    setupNavbar(user)
})