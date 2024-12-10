import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import { FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import slugify from 'slugify'; // Thêm slugify


const ProductEditPage = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    tags: "",
    images: [],
    isAvailable: true,
    variants: [
      {
        color: "",
        size: "",
        stock: "",
        specs: "" // Thêm specs vào state
      },
    ],
    createdAt: new Date().toISOString(),
  });
  
  
  
  
  
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [originalSlug, setOriginalSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Laptop",
    "Phone",
    "Tablet",
    "Console",
    "Accessory"
  ];

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get(`http://localhost:5000/api/products/slug/${id}`);
        const product = productResponse.data.product;
        const variantsWithSpecsAsString = product.variants.map(variant => ({
          ...variant,
          specs: variant.specs.map(spec => `${spec.label}: ${spec.value}`).join(', ')
        }));
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          tags: product.tags.join(', '),
          images: product.images,
          isAvailable: product.isAvailable,
          variants: variantsWithSpecsAsString.length ? variantsWithSpecsAsString : [
            {
              color: "",
              size: "",
              stock: "",
              specs: ""
            },
          ],
          stock: calculateTotalStock(variantsWithSpecsAsString.length ? variantsWithSpecsAsString : [
            {
              color: "",
              size: "",
              stock: "",
              specs: ""
            },
          ]),
          createdAt: product.createdAt,
        });
        setPreviewImages(product.images.map(image => `http://localhost:5000${image}`));
        setOriginalSlug(product.slug); // Lưu slug gốc
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
  
    fetchData();
  }, [id]);
  
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.description)
      newErrors.description = "Product description is required";
    if (!formData.price || isNaN(formData.price))
      newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.tags || formData.tags.length === 0)
      newErrors.tags = "At least one tag is required";
  
    formData.variants.forEach((variant, index) => {
      if (!variant.color)
        newErrors[`variant${index}color`] = "Color is required";
      if (!variant.size) newErrors[`variant${index}size`] = "Size is required";
      if (!variant.stock || isNaN(variant.stock))
        newErrors[`variant${index}stock`] = "Valid stock quantity is required";
      if (!variant.specs)
        newErrors[`variant${index}specs`] = "Specifications are required"; // Thêm kiểm tra cho specs
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  

  const handleTagsChange = (e) => {
    setFormData({ ...formData, tags: e.target.value });
  };
  
  
  
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviewImages);
  };
  
  

  const handleImageUpload = (e) => {
    setIsLoading(true);
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
    setIsLoading(false);
  };
  
  

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviewImages);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };
  
  
  
  
  

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          color: "",
          size: "",
          stock: "",
          specs: "" // Thêm specs vào biến thể mới
        },
      ],
    });
  };
  

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const formDataCopy = { ...formData };
  
        const slug = slugify(formDataCopy.name, { lower: true, strict: true });
        formDataCopy.slug = slug;
  
        const uploadedImageUrls = [];
        for (const image of formData.images) {
          if (typeof image === "object") {
            const formDataImage = new FormData();
            formDataImage.append("image", image);
  
            const uploadResponse = await axios.post('http://localhost:5000/api/uploads/upload', formDataImage, {
              headers: { "Content-Type": "multipart/form-data" },
            });
  
            uploadedImageUrls.push(uploadResponse.data.url);
          } else {
            uploadedImageUrls.push(image);
          }
        }
  
        formDataCopy.images = uploadedImageUrls;
        formDataCopy.variants = formDataCopy.variants || [];
        formDataCopy.stock = calculateTotalStock(formDataCopy.variants);
        formDataCopy.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
  
        // Chuyển đổi specs từ chuỗi thành mảng các đối tượng
        formDataCopy.variants.forEach(variant => {
          if (variant.specs && typeof variant.specs === "string") {
            const specsArray = variant.specs.split(",").map(spec => {
              const [label, specValue] = spec.split(":").map(item => item.trim());
              return { label, value: specValue };
            });
            variant.specs = specsArray;
          }
        });
  
        console.log('Updating product data:', formDataCopy);
        const response = await axios.put(`http://localhost:5000/api/products/slug/${originalSlug}`, formDataCopy); 
        console.log("Form submitted:", response.data);
  
        if (slug !== originalSlug) {
          window.location.href = `/admin/edit-product/${slug}`;
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  
  
  
  const calculateTotalStock = (variants) => {
    if (!Array.isArray(variants)) {
      return 0;
    }
    return variants.reduce((acc, variant) => acc + (parseInt(variant.stock, 10) || 0), 0);
  };
  
  
  
  

  // Format the date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 mt-12">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.name ? "border-red-500" : ""}`}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p
                  className="mt-1 text-sm text-red-600"
                  id="name-error"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
  <label
    htmlFor="price"
    className="block text-sm font-medium text-gray-700"
  >
    Price
  </label>
  <input
    type="number"
    id="price"
    value={formData.price}
    onChange={(e) =>
      setFormData({ ...formData, price: e.target.value })
    }
    step="0.01" // Thêm thuộc tính này để cho phép số thực
    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.price ? "border-red-500" : ""}`}
    aria-invalid={errors.price ? "true" : "false"}
    aria-describedby={errors.price ? "price-error" : undefined}
  />
  {errors.price && (
    <p
      className="mt-1 text-sm text-red-600"
      id="price-error"
      role="alert"
    >
      {errors.price}
    </p>
  )}
</div>

          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.description ? "border-red-500" : ""}`}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p
                className="mt-1 text-sm text-red-600"
                id="description-error"
                role="alert"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.category ? "border-red-500" : ""}`}
                aria-invalid={errors.category ? "true" : "false"}
                aria-describedby={errors.category ? "category-error" : undefined}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p
                  className="mt-1 text-sm text-red-600"
                  id="category-error"
                  role="alert"
                >
                  {errors.category}
                </p>
              )}
            </div>

            <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Enter tags, separated by commas"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.tags ? "border-red-500" : ""}`}
                  aria-invalid={errors.tags ? "true" : "false"}
                  aria-describedby={errors.tags ? "tags-error" : undefined}
                />
                {errors.tags && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="tags-error"
                    role="alert"
                  >
                    {errors.tags}
                  </p>
                )}
              </div>
              
              

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created At
              </label>
              <input
                type="text"
                value={formatDate(formData.createdAt)}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Stock
              </label>
              <div className="mt-1 p-3 bg-gray-100 rounded-md">
              {calculateTotalStock(formData.variants)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Product Availability
              </span>
            </label>
          </div>




          <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Product Images
  </label>
  <div className="flex flex-wrap gap-4">
    {previewImages.map((preview, index) => (
      <div
        key={index}
        className="relative w-24 h-24 border rounded-lg overflow-hidden"
      >
        <img
          src={preview}
          alt={`Product preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => handleRemoveImage(index)}
          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    ))}
    <label className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
      <input
        type="file"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
      <FiUpload className="text-gray-400" size={24} />
    </label>
  </div>
  {isLoading && (
    <div className="mt-4 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )}
</div>

            

<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-gray-800">Variants</h2>
    <button
      type="button"
      onClick={addVariant}
      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
    >
      <FiPlus className="mr-2" /> Add Variant
    </button>
  </div>

  {formData.variants.map((variant, index) => (
  <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Size</label>
        <input
          type="text"
          placeholder="Size"
          value={variant.size}
          onChange={(e) => handleVariantChange(index, "size", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="text"
          placeholder="Color"
          value={variant.color}
          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock</label>
        <input
          type="number"
          placeholder="Stock"
          value={variant.stock}
          min="0"
          onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors[`variant${index}stock`] ? "border-red-500" : ""}`}
        />
        {errors[`variant${index}stock`] && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors[`variant${index}stock`]}
          </p>
        )}
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Specifications (comma-separated)
      </label>
      <textarea
        placeholder="e.g., CPU: Intel i7, RAM: 16GB, Storage: 512GB SSD"
        value={variant.specs && Array.isArray(variant.specs) 
          ? variant.specs.map(spec => `${spec.label}: ${spec.value}`).join(', ') 
          : variant.specs || ""}
        onChange={(e) => handleVariantChange(index, "specs", e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        rows="3"
      />
    </div>

    <button
      type="button"
      onClick={() => removeVariant(index)}
      className="mt-2 p-2 text-red-600 hover:text-red-800"
    >
      <FiTrash2 />
    </button>
  </div>
))}

</div>


          <div className="flex items-center justify-end space-x-4">
            <Link
              to="/admin"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {isSubmitting ? (
                <>
                  <BiLoaderAlt className="animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditPage;
