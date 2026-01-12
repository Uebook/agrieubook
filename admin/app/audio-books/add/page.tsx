'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function AddAudioBookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    description: '',
    duration: '',
    language: 'English',
    categoryId: '',
  });
  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch authors on mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await apiClient.getAuthors();
        setAuthors(response.authors || []);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };
    fetchAuthors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCoverImageRemove = (index: number) => {
    setCoverImages(coverImages.filter((_, i) => i !== index));
    setCoverImagePreviews(coverImagePreviews.filter((_, i) => i !== index));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile) {
      alert('Please upload an audio file');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload audio file
      setUploadProgress(10);
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);
      audioFormData.append('bucket', 'books'); // Use existing 'books' bucket
      audioFormData.append('folder', 'audio-books/audio'); // Organize in audio-books subfolder
      audioFormData.append('fileName', audioFile.name);
      audioFormData.append('fileType', audioFile.type || 'audio/mpeg');
      
      const uploadResponse = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/upload`, {
        method: 'POST',
        body: audioFormData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload audio file');
      }
      
      const audioUploadResult = await uploadResponse.json();
      const audioUrl = audioUploadResult.url || audioUploadResult.path;

      // Step 2: Upload cover images (with compression)
      setUploadProgress(30);
      const coverImageUrls: string[] = [];
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
          
          const imageFormData = new FormData();
          imageFormData.append('file', compressedImage);
          imageFormData.append('bucket', 'books'); // Use existing 'books' bucket
          imageFormData.append('folder', 'audio-books/covers'); // Organize in audio-books subfolder
          imageFormData.append('fileName', compressedImage.name);
          imageFormData.append('fileType', compressedImage.type || 'image/jpeg');
          
          const coverUploadResponse = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/upload`, {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!coverUploadResponse.ok) {
            throw new Error('Failed to upload cover image');
          }
          
          const coverResult = await coverUploadResponse.json();
          coverImageUrls.push(coverResult.url || coverResult.path);
          setUploadProgress(30 + (i + 1) * (50 / coverImages.length));
        } catch (uploadError: any) {
          console.error(`Cover image ${i + 1} upload error:`, uploadError);
          // Continue with other images even if one fails
        }
      }

      // Step 3: Create audio book record
      setUploadProgress(80);
      const audioBookData = {
        title: formData.title,
        author_id: formData.authorId,
        description: formData.description,
        duration: formData.duration,
        language: formData.language,
        category_id: formData.categoryId,
        audio_url: audioUrl,
        cover_url: coverImageUrls[0] || null,
      };

      await apiClient.createAudioBook(audioBookData);
      setUploadProgress(100);

      alert('Audio book added successfully!');
      router.push('/audio-books');
    } catch (error: any) {
      console.error('Error adding audio book:', error);
      alert(`Error: ${error.message || 'Failed to add audio book'}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Add New Audio Book</h2>
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
                    Title *
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
                    Duration (e.g., 45:30) *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="45:30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
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
                        onChange={handleCoverImageAdd}
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
                              onClick={() => handleCoverImageRemove(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{coverImages[index].name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File *
                  </label>
                  <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer mb-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      required
                      className="hidden"
                    />
                    {audioFile ? 'Change Audio File' : 'Upload Audio File'}
                  </label>
                  {audioPreview && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">📄 {audioPreview}</p>
                      {audioFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading && (
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
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Audio Book'}
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

