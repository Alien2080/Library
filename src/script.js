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


class UI {
    constructor(library) {
        this.library = library
        this.bookGrid = document.getElementById('bookGrid')
    }

    updateBookGrid() {
        this.resetBookGrid()
        for (let book of this.library.books) {
          this.createBookCard(book)
        }
    }

    resetBookGrid() {
        bookGrid.innerHTML = ''
    }

    createBookCard(book) {
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
        // readBtn.onclick = toggleRead
        removeBtn.onclick = this.removeBook
      
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
        this.bookGrid.appendChild(bookCard)
    }
    
    removeBook(e) {
        const name = e.target.parentNode.parentNode.firstChild.innerHTML.replaceAll(
          '"',
          ''
        )
        ui.library.removeBook(name)
        ui.updateBookGrid()
    } 
}


// Main script start.
const ui = new UI(new Library())

// Added hard coded values for testing.
ui.library.addBook(new Book('title', 'autor', 13))
ui.library.addBook(new Book('title1', 'autor', 13))
ui.library.addBook(new Book('title2', 'autor', 13))
ui.library.addBook(new Book('title3', 'autor', 13))

ui.updateBookGrid()
