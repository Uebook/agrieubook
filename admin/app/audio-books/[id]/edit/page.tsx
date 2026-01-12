'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function AudioBookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [audioBook, setAudioBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    authorId: '',
    description: '',
    duration: '',
    language: 'English',
    categoryId: '',
    status: 'pending',
  });

  const [coverImages, setCoverImages] = useState<File[]>([]);
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAudioBook();
    fetchAuthors();
    fetchCategories();
  }, [id]);

  const fetchAudioBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAudioBook(id);
      const book = response.audioBook;
      setAudioBook(book);
      setFormData({
        title: book.title || '',
        authorId: book.author_id || '',
        description: book.description || '',
        duration: book.duration || '',
        language: book.language || 'English',
        categoryId: book.category_id || '',
        status: book.status || 'pending',
      });
      if (book.cover_url) {
        setCoverImagePreviews([book.cover_url]);
      }
      if (book.audio_url) {
        setAudioPreview(book.audio_url);
      }
    } catch (err: any) {
      console.error('Error fetching audio book:', err);
      setError(err.message || 'Failed to load audio book');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await apiClient.getAuthors();
      setAuthors(response.authors || []);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
              <p className="text-gray-500">Loading audio book...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !audioBook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Audio Book Not Found'}
              </h2>
              <button
                onClick={() => router.push('/audio-books')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Audio Books
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
    const existingCount = audioBook?.cover_url ? 1 : 0;
    if (index < existingCount) {
      // Existing image (from URL) - just remove from preview
      setCoverImagePreviews(coverImagePreviews.filter((_, i) => i !== index));
    } else {
      // New file - remove from both arrays
      const fileIndex = index - existingCount;
      setCoverImages(coverImages.filter((_, i) => i !== fileIndex));
      setCoverImagePreviews(coverImagePreviews.filter((_, i) => i !== index));
    }
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
    setSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload new audio file if provided
      let audioUrl = audioBook.audio_url;
      if (audioFile) {
        setUploadProgress(10);
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        audioFormData.append('bucket', 'books');
        audioFormData.append('folder', 'audio-books/audio');
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
        audioUrl = audioUploadResult.url || audioUploadResult.path;
      }

      // Step 2: Upload new cover images if provided
      setUploadProgress(30);
      let coverUrl = audioBook.cover_url;
      if (coverImages.length > 0) {
        try {
          // Compress image before upload to avoid 413 errors
          const { compressImage } = await import('@/lib/utils/imageCompression');
          const compressedImage = await compressImage(coverImages[0], {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.7,
            maxSizeMB: 2,
          });
          
          const imageFormData = new FormData();
          imageFormData.append('file', compressedImage);
          imageFormData.append('bucket', 'books');
          imageFormData.append('folder', 'audio-books/covers');
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
          coverUrl = coverResult.url || coverResult.path;
        } catch (uploadError: any) {
          console.error('Cover image upload error:', uploadError);
          throw new Error(`Failed to upload cover image: ${uploadError.message}`);
        }
      }

      // Step 3: Update audio book record
      setUploadProgress(80);
      const audioBookData = {
        title: formData.title,
        author_id: formData.authorId,
        description: formData.description,
        duration: formData.duration,
        language: formData.language,
        category_id: formData.categoryId,
        status: formData.status,
        ...(audioUrl && { audio_url: audioUrl }),
        ...(coverUrl && { cover_url: coverUrl }),
      };

      await apiClient.updateAudioBook(id, audioBookData);
      setUploadProgress(100);

      alert('Audio book updated successfully!');
      router.push(`/audio-books/${id}`);
    } catch (error: any) {
      console.error('Error updating audio book:', error);
      alert(error.message || 'Failed to update audio book');
    } finally {
      setSubmitting(false);
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
              <h2 className="text-3xl font-bold text-gray-900">Edit Audio Book</h2>
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
                    Duration (e.g., 45:30) *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
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
                            {index >= (audioBook?.cover_url ? 1 : 0) && coverImages[index - (audioBook?.cover_url ? 1 : 0)] && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {coverImages[index - (audioBook?.cover_url ? 1 : 0)].name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File
                  </label>
                  <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer mb-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                    {audioFile ? 'Change Audio File' : 'Upload Audio File'}
                  </label>
                  {audioPreview && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {audioFile ? `📄 ${audioFile.name}` : `🔗 ${audioPreview}`}
                      </p>
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

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Audio Book'}
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

