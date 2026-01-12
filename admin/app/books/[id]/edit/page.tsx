'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function BookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<any>(null);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    summary: '',
    price: '',
    originalPrice: '',
    pages: '',
    language: 'English',
    categoryId: '',
    isbn: '',
    isFree: false,
    status: 'pending',
  });

  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([]);
  const [existingCoverImages, setExistingCoverImages] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>('');

  // Fetch book, authors, and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch book
        const bookResponse = await apiClient.getBook(id);
        const bookData = bookResponse.book;
        setBook(bookData);

        // Set form data from book
        setFormData({
          title: bookData.title || '',
          authorId: bookData.author_id || bookData.author?.id || '',
          summary: bookData.summary || '',
          price: bookData.price?.toString() || '0',
          originalPrice: bookData.original_price?.toString() || bookData.price?.toString() || '0',
          pages: bookData.pages?.toString() || '',
          language: bookData.language || 'English',
          categoryId: bookData.category_id || bookData.category?.id || '',
          isbn: bookData.isbn || '',
          isFree: bookData.is_free || false,
          status: bookData.status || 'pending',
        });

        // Set existing cover images
        if (bookData.cover_images && Array.isArray(bookData.cover_images)) {
          setExistingCoverImages(bookData.cover_images);
          setCoverImagePreviews(bookData.cover_images);
        } else if (bookData.cover_image_url) {
          setExistingCoverImages([bookData.cover_image_url]);
          setCoverImagePreviews([bookData.cover_image_url]);
        }

        // Set PDF preview if exists
        if (bookData.pdf_url) {
          setPdfPreview('Current PDF file');
        }

        // Fetch authors
        const authorsResponse = await apiClient.getAuthors();
        setAuthors(authorsResponse.authors || []);

        // Fetch categories
        const categoriesResponse = await apiClient.getCategories();
        setCategories(categoriesResponse.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load book data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setCoverImages([...coverImages, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handleImageRemove = (index: number) => {
    // Check if it's an existing image (URL) or new file
    if (index < existingCoverImages.length) {
      // Remove existing image
      const newExisting = existingCoverImages.filter((_, i) => i !== index);
      setExistingCoverImages(newExisting);
      setCoverImagePreviews(coverImagePreviews.filter((_, i) => i !== index));
    } else {
      // Remove new file
      const fileIndex = index - existingCoverImages.length;
      setCoverImages(coverImages.filter((_, i) => i !== fileIndex));
      setCoverImagePreviews(coverImagePreviews.filter((_, i) => i !== index));
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfPreview(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress(0);

    try {
      let pdfUrl = book?.pdf_url || null;
      let coverImageUrls = [...existingCoverImages];

      // Step 1: Upload new PDF file if provided
      if (pdfFile) {
        setUploadProgress(10);
        try {
          const pdfUploadResult = await apiClient.uploadFile(pdfFile, 'books', 'pdfs');
          pdfUrl = pdfUploadResult.url || pdfUploadResult.path;
        } catch (uploadError: any) {
          console.error('PDF upload error:', uploadError);
          throw new Error(`Failed to upload PDF: ${uploadError.message || 'Unknown error'}`);
        }
      }

      // Step 2: Upload new cover images if provided (with compression)
      if (coverImages.length > 0) {
        setUploadProgress(30);
        for (let i = 0; i < coverImages.length; i++) {
          try {
            // Compress image before upload to avoid 413 errors
            const { compressImage } = await import('@/lib/utils/imageCompression');
            const compressedImage = await compressImage(coverImages[i], {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.7,
              maxSizeMB: 2,
            });
            const coverResult = await apiClient.uploadFile(compressedImage, 'books', 'covers');
            const coverUrl = coverResult.url || coverResult.path;
            coverImageUrls.push(coverUrl);
            setUploadProgress(30 + (i + 1) * (50 / coverImages.length));
          } catch (uploadError: any) {
            console.error(`Cover image ${i + 1} upload error:`, uploadError);
            // Continue with other images even if one fails
          }
        }
      }

      // Step 3: Update book record
      setUploadProgress(80);
      const bookData = {
        title: formData.title,
        author_id: formData.authorId,
        summary: formData.summary,
        price: parseFloat(formData.price) || 0,
        original_price: parseFloat(formData.originalPrice) || parseFloat(formData.price) || 0,
        pages: formData.pages ? parseInt(formData.pages) : null,
        language: formData.language,
        category_id: formData.categoryId,
        isbn: formData.isbn || null,
        is_free: formData.isFree,
        status: formData.status,
        pdf_url: pdfUrl,
        cover_image_url: coverImageUrls[0] || null,
        cover_images: coverImageUrls,
      };

      await apiClient.updateBook(id, bookData);
      setUploadProgress(100);

      alert('Book updated successfully!');
      router.push(`/books/${id}`);
    } catch (error: any) {
      console.error('Error updating book:', error);
      alert(`Error: ${error.message || 'Failed to update book'}`);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <p className="text-gray-600">Loading book data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
              <button
                onClick={() => router.push('/books')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Books
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Edit Book</h2>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <select
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>{author.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Free Book</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary *
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File {!book.pdf_url && '*'}
                  </label>
                  <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer mb-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                    {pdfFile ? 'Change PDF File' : pdfPreview ? 'Change PDF File' : 'Upload PDF File'}
                  </label>
                  {pdfPreview && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">📄 {pdfPreview}</p>
                      {pdfFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Images
                  </label>
                  <div className="space-y-4">
                    <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageAdd}
                        className="hidden"
                      />
                      + Add Cover Image(s)
                    </label>
                    {coverImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {coverImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Cover ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                            {index >= existingCoverImages.length && coverImages[index - existingCoverImages.length] && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {coverImages[index - existingCoverImages.length].name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {saving && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                    <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Book'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
