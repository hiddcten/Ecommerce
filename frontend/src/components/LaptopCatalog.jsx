import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LaptopCatalog = () => {
  const [laptops, setLaptops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [filterPrice, setFilterPrice] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Laptop")
      .then(response => {
        console.log(response.data.products); // Debug: In ra response từ API
        setLaptops(response.data.products);
      })
      .catch(error => {
        setError("Error fetching laptops. Please try again.");
      });
  }, []);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(laptops.length / itemsPerPage);

  const handleSort = (criteria) => {
    let sortedLaptops = [...laptops];
    switch (criteria) {
      case "price-low":
        sortedLaptops.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sortedLaptops.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sortedLaptops.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default:
        sortedLaptops = [...laptops];
    }
    setLaptops(sortedLaptops);
    setSortBy(criteria);
    setCurrentPage(1);
  };

  const handleFilterPrice = (e) => {
    setFilterPrice(e.target.value);
    setCurrentPage(1);
  };

  const filteredLaptops = laptops.filter(laptop => {
    const matchesPriceFilter = filterPrice ? laptop.price <= parseFloat(filterPrice) : true;
    return matchesPriceFilter;
  });

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLaptops.slice(startIndex, endIndex);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="pt-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Laptop Catalog</h1>
          <div className="flex items-center space-x-4">
            <label htmlFor="sort" className="text-gray-700 font-medium">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="flex items-center mb-8">
          <input
            type="number"
            placeholder="Max price"
            value={filterPrice}
            onChange={handleFilterPrice}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
          <span className="ml-2 text-gray-700">USD</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {getCurrentPageItems().map((laptop) => (
    <div
      key={laptop._id}
      className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer"
      role="article"
      onClick={() => navigate(`/laptop/${laptop.slug}`)}
    >
      <img
        src={`http://localhost:5000${laptop.images[0]}`}
        alt={laptop.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&h=350";
        }}
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{laptop.name}</h2>
        <p className="text-gray-600 mb-4">{laptop.description}</p> {/* Thêm mô tả laptop */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-indigo-600">${laptop.price}</span>
          <div className="flex items-center justify-end w-full">
            <span className="text-gray-600 mr-2">{laptop.averageRating ? laptop.averageRating.toFixed(1) : 'No rating'}</span>
            <FaStar className="text-yellow-400 fill-current" /> {/* Hiển thị một ngôi sao */}
          </div>
        </div>
        <button
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
          aria-label={`Add ${laptop.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  ))}
</div>





        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <FaChevronLeft className="mr-2" /> Previous
          </button>
          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                aria-label={`Page ${index + 1}`}
                aria-current={currentPage === index + 1 ? "page" : undefined}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next <FaChevronRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaptopCatalog;
