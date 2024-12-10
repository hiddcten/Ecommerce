import React from 'react';
import { FaFacebook, FaGoogle } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TechStore</h3>
            <p className="text-gray-400">Tech from universe</p>
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
              <li>District 7, Ho Chi Minh City</li>
              <li>Phone: 0123456789</li>
              <li>Email: BTV@tired.com</li>
            </ul>
          </div>
          <div>
  <h4 className="font-bold mb-4">Follow Us</h4>
  <div className="flex space-x-4">
    <a href="https://www.facebook.com/binh.hinb" target="_blank" rel="noopener noreferrer">
      <FaFacebook className="text-2xl hover:text-blue-500 cursor-pointer" />
    </a>
    <a href="https://www.tdtu.edu.vn/" target="_blank" rel="noopener noreferrer">
      <FaGoogle className="text-2xl hover:text-red-500 cursor-pointer" />
    </a>
  </div>
</div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
