'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

const indianStates = [
  { id: 'up', name: 'Uttar Pradesh' },
  { id: 'mh', name: 'Maharashtra' },
  { id: 'dl', name: 'Delhi' },
  { id: 'ka', name: 'Karnataka' },
  { id: 'tn', name: 'Tamil Nadu' },
  { id: 'gj', name: 'Gujarat' },
  { id: 'rj', name: 'Rajasthan' },
  { id: 'wb', name: 'West Bengal' },
  { id: 'ap', name: 'Andhra Pradesh' },
  { id: 'ts', name: 'Telangana' },
];

export default function AddCurriculumPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    state: '',
    language: 'English',
    description: '',
    status: 'pending',
  });
  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [bannerImagePreviews, setBannerImagePreviews] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const newFiles = Array.from(files);
        
        // Validate file types
        const validFiles = newFiles.filter(file => {
          if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not an image. Please select image files only.`);
            return false;
          }
          // Check file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return false;
          }
          return true;
        });
        
        if (validFiles.length === 0) {
          e.target.value = '';
          return;
        }
        
        setBannerImages([...bannerImages, ...validFiles]);
        
        // Create previews
        validFiles.forEach((file, index) => {
          try {
            const reader = new FileReader();
            reader.onerror = (error) => {
              console.error('Error reading file:', file.name, error);
              // Don't show alert for preview errors, just log and continue
              // The file is still valid and can be uploaded
            };
            reader.onloadend = () => {
              if (reader.result) {
                setBannerImagePreviews(prev => [...prev, reader.result as string]);
              } else {
                // If preview fails, add a placeholder
                setBannerImagePreviews(prev => [...prev, '']);
              }
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Error creating preview for file:', file.name, error);
            // Don't block upload if preview fails - add placeholder
            setBannerImagePreviews(prev => [...prev, '']);
          }
        });
      } catch (error) {
        console.error('Error handling banner images:', error);
        alert('Failed to select images. Please try again.');
      }
    }
    e.target.value = '';
  };

  const handleBannerImageRemove = (index: number) => {
    setBannerImages(bannerImages.filter((_, i) => i !== index));
    setBannerImagePreviews(bannerImagePreviews.filter((_, i) => i !== index));
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
    
    if (!pdfFile) {
      alert('Please upload a PDF file');
      return;
    }
    
    setLoading(true);

    try {
      // Step 1: Upload PDF file
      const pdfFormData = new FormData();
      pdfFormData.append('file', pdfFile);
      pdfFormData.append('bucket', 'books'); // Use existing 'books' bucket
      pdfFormData.append('folder', 'curriculum/pdfs'); // Organize in curriculum subfolder
      pdfFormData.append('fileName', pdfFile.name);
      pdfFormData.append('fileType', pdfFile.type || 'application/pdf');
      
      const pdfUploadResponse = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/upload`, {
        method: 'POST',
        body: pdfFormData,
      });
      
      if (!pdfUploadResponse.ok) {
        const errorData = await pdfUploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload PDF file');
      }
      
      const pdfResult = await pdfUploadResponse.json();
      
      // Check if result has error
      if (pdfResult.error) {
        throw new Error(pdfResult.error);
      }
      
      const pdfUrl = pdfResult.url || pdfResult.path || pdfResult.publicUrl;
      if (!pdfUrl) {
        throw new Error('PDF upload succeeded but no URL returned');
      }

      // Step 2: Upload banner images
      const bannerUrls: string[] = [];
      for (let i = 0; i < bannerImages.length; i++) {
        try {
          const bannerFormData = new FormData();
          bannerFormData.append('file', bannerImages[i]);
          bannerFormData.append('bucket', 'books'); // Use existing 'books' bucket (same as PDFs)
          bannerFormData.append('folder', 'curriculum/banners'); // Organize in curriculum subfolder
          bannerFormData.append('fileName', bannerImages[i].name);
          bannerFormData.append('fileType', bannerImages[i].type || 'image/jpeg');
          
          const bannerUploadResponse = await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/upload`, {
            method: 'POST',
            body: bannerFormData,
          });
          
          if (!bannerUploadResponse.ok) {
            const errorData = await bannerUploadResponse.json().catch(() => ({ 
              error: `HTTP ${bannerUploadResponse.status}: ${bannerUploadResponse.statusText}` 
            }));
            throw new Error(errorData.error || `Failed to upload banner image: ${bannerImages[i].name}`);
          }
          
          const bannerResult = await bannerUploadResponse.json();
          
          // Check if result has error
          if (bannerResult.error) {
            throw new Error(bannerResult.error);
          }
          
          const bannerUrl = bannerResult.url || bannerResult.path || bannerResult.publicUrl;
          if (!bannerUrl) {
            throw new Error('Upload succeeded but no URL returned');
          }
          
          bannerUrls.push(bannerUrl);
        } catch (uploadError: any) {
          console.error(`Error uploading banner image ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload banner image "${bannerImages[i].name}": ${uploadError.message || uploadError.error || 'Unknown error'}`);
        }
      }

      // Step 3: Create curriculum record
      const selectedState = indianStates.find(s => s.id === formData.state);
      const curriculumData = {
        title: formData.title,
        description: formData.description || null,
        state: formData.state,
        state_name: selectedState?.name || formData.state,
        language: formData.language,
        pdf_url: pdfUrl,
        banner_url: bannerUrls[0] || null,
        // Note: cover_image_url is not in the schema, using banner_url instead
        published_date: new Date().toISOString().split('T')[0], // Format as DATE (YYYY-MM-DD)
        status: formData.status,
      };
      
      console.log('Creating curriculum with data:', curriculumData);

      const response = await apiClient.createCurriculum(curriculumData);
      
      if (response.curriculum) {
        alert('Curriculum added successfully!');
        router.push('/curriculum');
      } else {
        throw new Error('Curriculum creation returned no data');
      }
    } catch (error: any) {
      console.error('Error adding curriculum:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to add curriculum';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
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
              <h2 className="text-3xl font-bold text-gray-900">Add New Curriculum</h2>
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
                    placeholder="e.g., PM Kisan Yojana Guidelines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state.id} value={state.id}>{state.name}</option>
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
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Images
                  </label>
                  <div className="space-y-4">
                    <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleBannerImageAdd}
                        className="hidden"
                      />
                      + Add Banner Image(s)
                    </label>
                    {bannerImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {bannerImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Banner ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleBannerImageRemove(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{bannerImages[index].name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF Document *
                  </label>
                  <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer mb-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfChange}
                      required
                      className="hidden"
                    />
                    {pdfFile ? 'Change PDF File' : 'Upload PDF File'}
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
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter curriculum description..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Curriculum'}
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

