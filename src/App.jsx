import axios from 'axios'
import { useState, useEffect } from 'react'
import Bin from './assets/bin.svg'
import Edit from './assets/edit.svg'
import Add from './assets/add.svg'
import Search from './assets/search.svg'

const App = () => {
  const [form, setForm] = useState({
    id: null,
    bookName: '',
    bookPrice: ''
  })
  const [searchId, setSearchId] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [books, setBooks] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)

  // Create an axios instance
  const ax = axios.create({
    baseURL: 'http://localhost:4000'
  })

  // Get all books
  const getBooks = async () => {
    try {
      setLoading(true)
      if(!searchId) {
        const response = await ax.get('/books')
        setBooks(response.data)
        setLoading(false)
        return
      }
      const responseById = await ax.get(`/books?id=${searchId}`)
      const responseByName = await ax.get(`/books?name=${searchId}`)
      const responseByPrice = await ax.get(`/books?price=${searchId}`)
      const combinedResults = [
        ...responseById.data,
        ...responseByName.data,   
        ...responseByPrice.data
      ]
      // Remove duplicates
      const uniqueResults = Array.from(new Set(combinedResults.map(b => b.id)))
        .map(id => {
          return combinedResults.find(b => b.id === id)
        })
      
      setBooks(uniqueResults)
      setLoading(false)
    } catch (error) {
      console.log(error.message)
    }
  }

  // Upsert a new book (create or update)
  const upsertBook = async () => {
    try {
      if (!form.bookName || !form.bookPrice) {
        setTimedInfo(
          () => setError('Book name and price are required.'),
          () => setError(null)
        )
        return
      }

      if (editMode) {
        const response = await ax.put(`/books/${form.id}`, {
          name: form.bookName,
          price: form.bookPrice
        })
        setBooks(books.map((book) => book.id === form.id ? response.data : book))
        handleClearForm()
        setTimedInfo(
          () => setMessage("Book updated successfully."),
          () => setMessage(null)
        )
        return
      }

      if (!editMode) {
        const response = await ax.post("/books", {
          name: form.bookName,
          price: form.bookPrice
        })
        handleClearForm()
        setBooks([...books, response.data])
        setTimedInfo(
          () => setMessage("Book created successfully."),
          () => setMessage(null)
        )
        return
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // Delete a book by id
  const deleteBook = async (id) => {
    try {
      const response = await ax.delete(`/books/${id}`)
      setBooks(books.filter((book) => book.id !== id))
      setTimedInfo(
        () => setMessage("Book deleted successfully."),
        () => setMessage(null)
      )
    } catch (error) {
      console.log(error.message)
    }
  }

  // Handle form input changes
  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm({
      ...form,
      [name]: value
    })
  }

  // Prefill form for updating a book
  const handlePrefillForm = (book) => {
    setForm({
      id: book.id,
      bookName: book.name,
      bookPrice: book.price
    })
    setEditMode(true)
  }

  // Clear the form and exit edit mode if applicable
  const handleClearForm = () => {
    setEditMode(false)
    setForm({
      id: null,
      bookName: '',
      bookPrice: ''
    })
  }

  // Handle search id input change
  const handleUpdateSearchId = (event) => {
    setSearchId(event.target.value)
  }

  // Utility: set timed info messages
  const setTimedInfo = (before, after, duration = 3000) => {
    before()
    setTimeout(() => {
      after()
    }, duration)
  }

  // Get all books on component mount and when searchId changes
  useEffect(() => {
    getBooks()
  }, [searchId])

  return (
    <div className='container mx-auto min-h-screen p-2 relative'>
      {message && <span className='absolute top-2 left-1/2 bg-emerald-300 p-2 rounded-md'>{message}</span>}
      {error && <span className='absolute top-4 left-1/2 bg-red-200 p-2 rounded-md'>{error}</span>}
      {/* Display all books */}
      <table className='w-full text-left border-separate border-spacing-3'>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Book Name</th>
            <th>Book Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody className=''>
          {/* Create a new book form */}
          <tr className=''>
            <td className='flex gap-4'>
              <button type='button' className='flex gap-2'>
                <img src={Search} alt="Create" className='w-6 h-6' />
              </button>
              <input type="text" id='id' onChange={handleUpdateSearchId} name='id' className='bg-white/10 w-full' />
            </td>
            <td>
              <input type="text" value={form.bookName} onChange={handleFormChange} name='bookName' className='bg-white/20 w-full' />
            </td>
            <td>
              <input type="number" min="0" max="10000" value={form.bookPrice} onChange={handleFormChange} name='bookPrice' className='bg-white/20 w-full' />
            </td>
            <td className='flex gap-4'>
              <button type='button' onClick={upsertBook} className='flex gap-2 cursor-pointer'>
                <img src={Add} alt="Create or Update" className='w-6 h-6' />
                {editMode ? '' : 'Create'}
              </button>
              {editMode && (<button type='button' onClick={handleClearForm} className='cursor-pointer'> Cancel </button>)}
            </td>
          </tr>
          {loading && (
            <tr>
              <td colSpan="4" className='text-center'>Loading...</td>
            </tr>
          )}
          {!loading && !books.length && (
            <tr>
              <td colSpan="4" className='text-center'>No books found.</td>
            </tr>
          )}
          { !loading &&
            books.map((book) => (
              <tr key={book.id} className=''>
                <td>{book.id}</td>
                <td>{book.name}</td>
                <td>{book.price}</td>
                <td className='flex gap-4'>
                  {editMode && form.id === book.id ?
                    (<span>Editing...</span>) :
                    <>
                      <button type='button' onClick={() => handlePrefillForm(book)}>
                        <img src={Edit} alt="Update" className='w-6 h-6 cursor-pointer' />
                      </button>
                      <button type='button' onClick={() => deleteBook(book.id)}>
                        <img src={Bin} alt="Delete" className='w-6 h-6 cursor-pointer' />
                      </button>
                    </>
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default App  