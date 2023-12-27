class Book {
    constructor(name, author, pages) {
        this.name = name
        this.author = author
        this.pages = pages
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

    // removeBook

    // getBooks

    isInLibrary(bookToCheck) {
        return this.books.some((b) => b.name === bookToCheck.name)
    }   
}

const library = new Library()

// Added for testing.
library.addBook(new Book('title', 'autor', 13))
library.addBook(new Book('title1', 'autor', 13))
library.addBook(new Book('title2', 'autor', 13))
library.addBook(new Book('title3', 'autor', 13))

// UI stuff.
const bookGrid = document.getElementById('bookGrid')

// update grid for testing with dummy data.
updateBookGrid()

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
    const title = document.createElement('p')
    const author = document.createElement('p')
    const pages = document.createElement('p')
    const buttonGroup = document.createElement('div')
    const readBtn = document.createElement('button')
    const removeBtn = document.createElement('button')
  
    bookCard.classList.add('book-card')
    buttonGroup.classList.add('button-group')
    readBtn.classList.add('btn')
    removeBtn.classList.add('btn')
    // readBtn.onclick = toggleRead
    // removeBtn.onclick = removeBook
  
    title.textContent = `"${book.name}"`
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
  
    bookCard.appendChild(title)
    bookCard.appendChild(author)
    bookCard.appendChild(pages)
    buttonGroup.appendChild(readBtn)
    buttonGroup.appendChild(removeBtn)
    bookCard.appendChild(buttonGroup)
    bookGrid.appendChild(bookCard)
  }
