import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
  const { keyword } = useParams();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (keyword) {
      axios.get(`http://localhost:5000/api/products/search?keyword=${keyword}`)
        .then(response => {
          if (response.data.success) {
            setProducts(response.data.products);
          } else {
            setError(response.data.message || "No products found.");
          }
        })
        .catch(error => {
          setError("Can't find any items with that keyword.");
          console.error(error);
        });
    }
  }, [keyword]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Item Found</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="pt-20 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results for "{keyword}"</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentPageItems().map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 cursor-pointer"
              role="article"
              onClick={() => navigate(`/product-detail/${product.slug}`)} // Điều chỉnh đường dẫn ở đây
            >
              <img
                src={`http://localhost:5000${product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&h=350";
                }}
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex justify-between items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                </div>
                <button
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
                  aria-label={`Add ${product.name} to cart`}
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

export default SearchResults;
