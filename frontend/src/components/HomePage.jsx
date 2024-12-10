import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiUser, FiSearch } from "react-icons/fi";
import { FaStar, FaFacebook, FaShoppingCart, FaTrash } from "react-icons/fa";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentLaptopPage, setCurrentLaptopPage] = useState(0);
  const [currentPhonePage, setCurrentPhonePage] = useState(0);
  const [currentTabletPage, setCurrentTabletPage] = useState(0);
  const [currentConsolePage, setCurrentConsolePage] = useState(0);
  const [currentAccessoryPage, setCurrentAccessoryPage] = useState(0);
  const [laptops, setLaptops] = useState([]);
  const [phones, setPhones] = useState([]);
  const [tablets, setTablets] = useState([]);
  const [consoles, setConsoles] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);

  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const productsPerPage = 4;

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Laptop")
      .then(response => {
        setLaptops(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the laptops!", error);
      });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Phone")
      .then(response => {
        setPhones(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the phones!", error);
      });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Tablet")
      .then(response => {
        setTablets(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the tablets!", error);
      });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Console")
      .then(response => {
        setConsoles(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the consoles!", error);
      });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/category?category=Accessory")
      .then(response => {
        setAccessories(response.data.products);
      })
      .catch(error => {
        console.error("There was an error fetching the accessories!", error);
      });
  }, []);

  const bannerSlides = [
    {
      id: 1,
      image: "images.unsplash.com/photo-1531297484001-80022131f5a1",
      title: "Latest Tech Deals"
    },
    {
      id: 2,
      image: "images.unsplash.com/photo-1498049794561-7780e7231661",
      title: "New Arrivals"
    },
    {
      id: 3,
      image: "images.unsplash.com/photo-1496181133206-80ce9b88a853",
      title: "Special Offers"
    }
  ];

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/featured")
      .then(response => {
        setFeaturedProducts(response.data.products);
      })
      .catch(error => {
        setError("Error fetching featured products. Please try again.");
        console.error('Error fetching featured products:', error); // Thêm logging chi tiết
      });
  }, []);

  const handleSearch = () => {
    navigate(`/search/${searchKeyword}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleNextPage = (setCurrentPage, currentPage, items) => {
    setCurrentPage((prevPage) => (prevPage + 1) % Math.ceil(items.length / productsPerPage));
  };

  const handlePrevPage = (setCurrentPage, currentPage, items) => {
    setCurrentPage((prevPage) => (prevPage - 1 + Math.ceil(items.length / productsPerPage)) % Math.ceil(items.length / productsPerPage));
  };

  const getCurrentProducts = (items, currentPage) => {
    return items.slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage);
  };

  const ProductDetail = ({ product }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-4/5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center space-x-8">
          {/* Cột Ảnh */}
          <div className="w-1/2 flex justify-center">
            <div className="grid grid-cols-2 gap-4">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={`https://${image}`}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
  
          {/* Cột Thông tin sản phẩm */}
          <div className="w-1/2 flex flex-col items-center justify-center">
            {/* Tiêu đề */}
            <h2 className="text-3xl font-bold mb-4 text-center">{product.name}</h2>
            
            {/* Giá sản phẩm */}
            <p className="text-2xl text-blue-600 mb-4 text-center">{product.price}</p>
  
            {/* Mô tả sản phẩm */}
            <p className="text-gray-600 mb-6 text-center">{product.description}</p>
  
            {/* Số lượng */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <label className="text-lg font-semibold">Quantity:</label>
              <input type="number" min="1" defaultValue="1" className="w-20 p-2 border rounded" />
            </div>
  
            {/* Nút thêm vào giỏ hàng và mua ngay */}
            <div className="space-x-4 flex justify-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Add to Cart
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Buy Now
              </button>
            </div>
          </div>
        </div>
  
        {/* Nút đóng */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <div className="flex items-center justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchKeyword} // Liên kết với state từ khóa
            onChange={(e) => setSearchKeyword(e.target.value)} // Cập nhật state từ khóa
            onKeyDown={handleKeyDown} // Thêm sự kiện onKeyDown
            className="w-3/4 md:w-1/2 p-4 pl-10 rounded-lg border"
          />
          <button
            className="ml-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleSearch} // Gọi hàm xử lý tìm kiếm khi nhấp vào nút
          >
            <FiSearch className="text-xl" />
          </button>
        </div>
      </div>

            {/* Banner Slider */}
            <div className="relative h-96">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={`https://${slide.image}`}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full"
        >
          <BsChevronLeft />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full"
        >
          <BsChevronRight />
        </button>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Categories</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/laptop" className="bg-blue-200 rounded-lg shadow-md flex items-center justify-center h-48 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold">Laptops</h3>
              </div>
            </Link>
            <Link to="/phone" className="bg-green-200 rounded-lg shadow-md flex items-center justify-center h-48 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold">Phones</h3>
              </div>
            </Link>
            <Link to="/console" className="bg-yellow-200 rounded-lg shadow-md flex items-center justify-center h-48 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold">Consoles</h3>
              </div>
            </Link>
            <Link to="/accessory" className="bg-red-200 rounded-lg shadow-md flex items-center justify-center h-48 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center">
                <h3 className="text-xl font-bold">Accessories</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
<div className="container mx-auto px-4 py-12">
  <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {getCurrentProducts(featuredProducts, currentPage).map(product => (
        <Link to={`/product-detail/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <img
            src={`http://localhost:5000${product.images[0]}`}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">${product.price}</p>
            <div className="flex items-center justify-end">
              <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
              <FaStar className="text-yellow-400 fill-current" />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Buy Now
            </button>
          </div>
        </Link>
      ))}
    </div>
    <div className="flex justify-end space-x-4 mt-4">
      <button onClick={() => handlePrevPage(setCurrentPage, currentPage, featuredProducts)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
      <button onClick={() => handleNextPage(setCurrentPage, currentPage, featuredProducts)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
    </div>
  </div>
</div>


      {/* Laptops */}
      <div className="container mx-auto px-4 py-12 bg-blue-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-left">Laptops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCurrentProducts(laptops, currentLaptopPage).map(product => (
            <Link to={`/laptop/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer">
              <img
                src={`http://localhost:5000${product.images && product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
                  <FaStar className="text-yellow-400 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => handlePrevPage(setCurrentLaptopPage, currentLaptopPage, laptops)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
          <button onClick={() => handleNextPage(setCurrentLaptopPage, currentLaptopPage, laptops)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>

      {/* Phones */}
      <div className="container mx-auto px-4 py-12 bg-green-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-left">Phones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCurrentProducts(phones, currentPhonePage).map(product => (
            <Link to={`/phone/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer">
              <img
                src={`http://localhost:5000${product.images && product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
                  <FaStar className="text-yellow-400 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
        <button onClick={() => handlePrevPage(setCurrentPhonePage, currentPhonePage, phones)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
          <button onClick={() => handleNextPage(setCurrentPhonePage, currentPhonePage, phones)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>

      {/* Tablets */}
      <div className="container mx-auto px-4 py-12 bg-yellow-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-left">Tablets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCurrentProducts(tablets, currentTabletPage).map(product => (
            <Link to={`/tablet/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer">
              <img
                src={`http://localhost:5000${product.images && product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
                  <FaStar className="text-yellow-400 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => handlePrevPage(setCurrentTabletPage, currentTabletPage, tablets)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
          <button onClick={() => handleNextPage(setCurrentTabletPage, currentTabletPage, tablets)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>

      {/* Consoles */}
      <div className="container mx-auto px-4 py-12 bg-red-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-left">Consoles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCurrentProducts(consoles, currentConsolePage).map(product => (
            <Link to={`/console/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer">
              <img
                src={`http://localhost:5000${product.images && product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
                  <FaStar className="text-yellow-400 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => handlePrevPage(setCurrentConsolePage, currentConsolePage, consoles)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
          <button onClick={() => handleNextPage(setCurrentConsolePage, currentConsolePage, consoles)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>

      {/* Accessories */}
      <div className="container mx-auto px-4 py-12 bg-purple-50 rounded-lg">
        <h2 className="text-3xl font-bold mb-8 text-left">Accessories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getCurrentProducts(accessories, currentAccessoryPage).map(product => (
            <Link to={`/accessory/${product.slug}`} key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 relative cursor-pointer">
              <img
                src={`http://localhost:5000${product.images && product.images[0]}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price}</p>
                <div className="flex items-center justify-end">
                  <span className="text-gray-600 mr-2">{product.averageRating ? product.averageRating.toFixed(1) : 'No rating'}</span>
                  <FaStar className="text-yellow-400 fill-current" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => handlePrevPage(setCurrentAccessoryPage, currentAccessoryPage, accessories)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Previous</button>
          <button onClick={() => handleNextPage(setCurrentAccessoryPage, currentAccessoryPage, accessories)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
