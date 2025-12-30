'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { dummyCurriculums } from '@/lib/dummyData';

const indianStates = [
  { id: 'up', name: 'Uttar Pradesh' },
  { id: 'mh', name: 'Maharashtra' },
  { id: 'dl', name: 'Delhi' },
  { id: 'ka', name: 'Karnataka' },
  { id: 'tn', name: 'Tamil Nadu' },
];

export default function CurriculumEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const curriculum = dummyCurriculums.find(c => c.id === id);

  const [formData, setFormData] = useState(curriculum ? {
    title: curriculum.title,
    state: curriculum.state,
    language: curriculum.language,
    description: curriculum.description,
    status: curriculum.status,
  } : {
    title: '',
    state: '',
    language: 'English',
    description: '',
    status: 'pending',
  });

  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [bannerImagePreviews, setBannerImagePreviews] = useState<string[]>([curriculum?.banner || ''].filter(Boolean));
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>(curriculum?.pdfUrl || '');
  const [loading, setLoading] = useState(false);

  if (!curriculum) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Curriculum Not Found</h2>
              <button
                onClick={() => router.push('/curriculum')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Curriculum
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

  const handleBannerImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setBannerImages([...bannerImages, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handleBannerImageRemove = (index: number) => {
    const existingCount = curriculum?.banner ? 1 : 0;
    if (index < existingCount) {
      // Existing image (from URL) - just remove from preview
      setBannerImagePreviews(bannerImagePreviews.filter((_, i) => i !== index));
    } else {
      // New file - remove from both arrays
      const fileIndex = index - existingCount;
      setBannerImages(bannerImages.filter((_, i) => i !== fileIndex));
      setBannerImagePreviews(bannerImagePreviews.filter((_, i) => i !== index));
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
    setLoading(true);

    setTimeout(() => {
      alert('Curriculum updated successfully!');
      router.push(`/curriculum/${id}`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Edit Curriculum</h2>
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
                            {index >= (curriculum?.banner ? 1 : 0) && bannerImages[index - (curriculum?.banner ? 1 : 0)] && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {bannerImages[index - (curriculum?.banner ? 1 : 0)].name}
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
                    PDF Document
                  </label>
                  <label className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer mb-2">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                    {pdfFile ? 'Change PDF File' : 'Upload PDF File'}
                  </label>
                  {pdfPreview && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {pdfFile ? `📄 ${pdfFile.name}` : `🔗 ${pdfPreview}`}
                      </p>
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
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Curriculum'}
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

