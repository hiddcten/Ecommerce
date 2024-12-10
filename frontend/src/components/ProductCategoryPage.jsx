import React, { useState, useEffect } from "react";
// import { FiMenu, FiSearch, FiShoppingCart, FiFilter, FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";
import { FiShoppingCart, FiFilter, FiUser, FiSearch, FiEdit, FiMapPin, FiChevronDown } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaShoppingCart, FaTrash } from "react-icons/fa";
const ProductCategoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // const [cartItems, setCartItems] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBestSeller, setShowBestSeller] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);

  const categories1 = ["all", "electronics", "clothing", "books", "sports"];
  const brands = ["Brand A", "Brand B", "Brand C", "Brand D"];
  //Shopping Cart
  const [isHovered, setIsHovered] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      quantity: 2,
      image: "images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 299.99,
      quantity: 1,
      image: "images.unsplash.com/photo-1523275335684-37898b6baf30"
    },
    {
      id: 3,
      name: "Portable Power Bank",
      price: 49.99,
      quantity: 3,
      image: "images.unsplash.com/photo-1583394838336-acd977736f90"
    }
  ];

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Clear timeout when component unmounts
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    const newTimeoutId = setTimeout(() => {
      setIsHovered(false);
    }, 300);
    setTimeoutId(newTimeoutId);
  };

  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      category: "electronics",
      brand: "Brand A",
      image: "images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },
    {
      id: 2,
      name: "Classic Denim Jacket",
      price: 89.99,
      category: "clothing",
      brand: "Brand B",
      image: "images.unsplash.com/photo-1516762689617-e1cffcef479d"
    },
    {
      id: 3,
      name: "Bestseller Novel Collection",
      price: 49.99,
      category: "books",
      brand: "Brand C",
      image: "images.unsplash.com/photo-1512820790803-83ca734da794"
    },
    {
      id: 4,
      name: "Professional Tennis Racket",
      price: 159.99,
      category: "sports",
      brand: "Brand D",
      image: "images.unsplash.com/photo-1617083934555-ac7b4d664193"
    },
  ];

  const categories = [
    { id: 1, name: "Phones", image: "images.unsplash.com/photo-1511707171634-5f897ff02aa9" },
    { id: 2, name: "Laptops", image: "images.unsplash.com/photo-1496181133206-80ce9b88a853" },
    { id: 3, name: "Best Sellers", image: "images.unsplash.com/photo-1531297484001-80022131f5a1" },
    { id: 4, name: "New Arrivals", image: "images.unsplash.com/photo-1498049794561-7780e7231661" }
  ];

  const filteredProducts = products
    .filter(product => {
      return (
        (selectedCategory === "all" || product.category === selectedCategory) &&
        product.price <= priceRange
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900 text-white shadow-md z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-400">TechStore</h1>
              <div className="hidden md:flex space-x-6 relative">
                {categories1.map(category => (
                  <div
                    key={category.id}
                    className="relative group"
                    onMouseEnter={() => setShowCategoryDropdown(true)}
                    onMouseLeave={() => setShowCategoryDropdown(false)}
                  >
                    <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                      <span>{category.name}</span>
                      <FiChevronDown />
                    </button>
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 w-48 bg-white text-gray-900 shadow-lg rounded-lg py-2 mt-2 transform opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100">Sub Category 1</a>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100">Sub Category 2</a>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100">Sub Category 3</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* <div className="relative">
                <FiShoppingCart className="text-2xl" />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems}
                  </span>
                )}
              </div> */}
              <div className="relative">
                <div
                  className="p-2 cursor-pointer transform hover:scale-110 transition-transform duration-200"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="relative">
                    <FaShoppingCart className="text-2xl text-white hover:text-blue-400" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  </div>

                  {isHovered && (
                    <div className="absolute right-0 mt-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ease-in-out">
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}

                      <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800">Items in Cart</h2>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100"
                          >
                            <img
                              src={`https://${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1595246140520-1991cca1aaaa";
                              }}
                            />
                            <div className="ml-4 flex-grow">
                              <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span className="text-sm font-medium text-gray-800">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200">
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-lg font-bold text-gray-800">
                            ${calculateSubtotal().toFixed(2)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200">
                            View Cart
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200">
                            Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setShowLogin(true)} className="flex items-center space-x-2">
                <FiUser className="text-2xl" />
                <span>{isLoggedIn ? "John Doe" : "Login"}</span>
              </button>
              {/* <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`p-2 rounded ${isAdmin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}
              >
                {isAdmin ? "Admin" : "Customer"}
              </button> */}
            </div>
          </div>
        </div>
      </nav> 

      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <FiFilter
                  className="md:hidden h-6 w-6 cursor-pointer"
                  onClick={() => setShowFilters(!showFilters)}
                />
              </div>
              <div className={`${showFilters ? "block" : "hidden"} md:block space-y-6`}>
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-2">
                    {categories1.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === category ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-1">Up to ${priceRange}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Brands</h3>
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center space-x-2 mb-2">
                      <input type="checkbox" className="rounded text-blue-500" />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">{filteredProducts.length} products found</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <img
                    src={`https://${product.image}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.brand}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">${product.price}</span>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TechStore</h3>
              <p className="text-gray-400">Your one-stop shop for all things tech</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Use</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Return Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Tech Street</li>
                <li>Phone: (123) 456-7890</li>
                <li>Email: support@techstore.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <FaFacebook className="text-2xl hover:text-blue-500 cursor-pointer" />
                <FaGoogle className="text-2xl hover:text-red-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductCategoryPage;