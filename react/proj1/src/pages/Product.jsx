import { useEffect, useMemo, useState } from 'react'

const API_URL = 'https://fakestoreapi.com/products'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
]

function getHighestPrice(productList) {
  return Math.ceil(Math.max(...productList.map((product) => product.price), 1000))
}

function Product() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [cart, setCart] = useState({})
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Products could not be loaded')
        }

        const data = await response.json()
        const nextHighestPrice = getHighestPrice(data)

        setProducts(data)
        setMaxPrice(nextHighestPrice)
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const highestPrice = useMemo(
    () => getHighestPrice(products),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return products
      .filter((product) => {
        const matchesSearch =
          product.title.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery)
        const matchesCategory = category === 'all' || product.category === category
        const matchesPrice = product.price <= maxPrice

        return matchesSearch && matchesCategory && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return b.rating.rate - a.rating.rate
        return b.rating.count - a.rating.count
      })
  }, [category, maxPrice, products, query, sortBy])

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((item) => item.id === Number(id))
          return product ? { ...product, quantity } : null
        })
        .filter(Boolean),
    [cart, products],
  )

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  function addToCart(productId) {
    setCart((currentCart) => ({
      ...currentCart,
      [productId]: (currentCart[productId] || 0) + 1,
    }))
    setIsCartOpen(true)
  }

  function updateQuantity(productId, nextQuantity) {
    setCart((currentCart) => {
      const nextCart = { ...currentCart }

      if (nextQuantity <= 0) {
        delete nextCart[productId]
      } else {
        nextCart[productId] = nextQuantity
      }

      return nextCart
    })
  }

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setSortBy('featured')
    setMaxPrice(highestPrice)
  }

  return (
    <main className="min-h-screen bg-[#eaeded] text-[#111827]">
      <header className="sticky top-0 z-30 bg-[#131921] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
          <div className="flex items-center justify-between gap-4">
            <a className="text-2xl font-bold tracking-tight" href="/">
              ShopZone
            </a>
            <button
              className="rounded bg-[#febd69] px-4 py-2 text-sm font-bold text-[#111827] md:hidden"
              onClick={() => setIsCartOpen(true)}
              type="button"
            >
              Cart ({cartCount})
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden rounded border-2 border-[#febd69] bg-white">
            <select
              className="w-28 bg-[#f3f3f3] px-2 text-sm text-[#111827] outline-none"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All' : item}
                </option>
              ))}
            </select>
            <input
              className="min-w-0 flex-1 px-4 py-2 text-[#111827] outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ShopZone"
              type="search"
              value={query}
            />
            <button
              className="bg-[#febd69] px-5 font-bold text-[#111827]"
              type="button"
            >
              Search
            </button>
          </div>

          <button
            className="hidden rounded px-4 py-2 text-left text-sm font-semibold hover:outline hover:outline-1 hover:outline-white md:block"
            onClick={() => setIsCartOpen(true)}
            type="button"
          >
            <span className="block text-xs text-gray-200">Returns</span>
            Cart ({cartCount})
          </button>
        </div>
      </header>

      <section className="bg-[#232f3e] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 text-sm">
          {categories.map((item) => (
            <button
              className={`rounded px-3 py-1 capitalize ${
                category === item ? 'bg-white text-[#111827]' : 'hover:outline hover:outline-1'
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#b12704]">
                Fake Store API deals
              </p>
              <h1 className="mt-1 text-3xl font-bold text-[#111827] md:text-4xl">
                Products for every cart
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Browse live products with category filters, search, sorting, price control,
                ratings, and a working cart.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              <label className="text-sm font-semibold">
                Sort by
                <select
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-normal"
                  onChange={(event) => setSortBy(event.target.value)}
                  value={sortBy}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Max price: ${maxPrice}
                <input
                  className="mt-3 w-full accent-[#b12704]"
                  max={highestPrice}
                  min="0"
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  type="range"
                  value={maxPrice}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-700">
            Showing <strong>{filteredProducts.length}</strong> of{' '}
            <strong>{products.length}</strong> products
          </p>
          <button
            className="rounded border border-gray-400 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-100"
            onClick={resetFilters}
            type="button"
          >
            Clear filters
          </button>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="h-80 animate-pulse bg-white p-4" key={index}>
                <div className="mx-auto h-36 w-32 rounded bg-gray-200" />
                <div className="mt-6 h-4 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-8 h-10 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Unable to load products</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                className="flex min-h-[430px] flex-col bg-white p-4 shadow-sm transition hover:shadow-lg"
                key={product.id}
              >
                <div className="flex h-48 items-center justify-center border-b border-gray-100 p-4">
                  <img
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                    src={product.image}
                  />
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {product.category}
                  </p>
                  <h2 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold">
                    {product.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-[#f59e0b]">★★★★★</span>
                    <span className="text-[#007185]">
                      {product.rating.rate} ({product.rating.count})
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    <span className="align-top text-sm">$</span>
                    {product.price.toFixed(2)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>
                  <button
                    className="mt-auto rounded-full bg-[#ffd814] px-4 py-2 text-sm font-semibold hover:bg-[#f7ca00]"
                    onClick={() => addToCart(product.id)}
                    type="button"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="mt-2 rounded-full bg-[#ffa41c] px-4 py-2 text-sm font-semibold hover:bg-[#fa8900]"
                    onClick={() => addToCart(product.id)}
                    type="button"
                  >
                    Buy Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsCartOpen(false)}>
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <p className="text-sm text-gray-600">{cartCount} items selected</p>
              </div>
              <button
                className="rounded border border-gray-300 px-3 py-1 text-sm font-semibold"
                onClick={() => setIsCartOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="rounded border border-dashed border-gray-300 p-8 text-center">
                  <h3 className="font-bold">Your cart is empty</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Add a product to see it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div className="flex gap-4 border-b pb-4" key={item.id}>
                      <img
                        alt={item.title}
                        className="h-20 w-20 object-contain"
                        src={item.image}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 font-bold">${item.price.toFixed(2)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="h-8 w-8 rounded border font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            className="h-8 w-8 rounded border font-bold"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            type="button"
                          >
                            +
                          </button>
                          <button
                            className="ml-auto text-sm font-semibold text-[#007185]"
                            onClick={() => updateQuantity(item.id, 0)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-5">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                className="w-full rounded-full bg-[#ffd814] px-4 py-3 font-bold hover:bg-[#f7ca00]"
                disabled={cartItems.length === 0}
                type="button"
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Product
