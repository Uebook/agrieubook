'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function CurriculumViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCurriculum();
  }, [id]);

  useEffect(() => {
    // Try to get signed URL for banner image if bucket is private
    if (curriculum?.banner_url) {
      console.log('Curriculum loaded, banner_url:', curriculum.banner_url);
      fetchSignedImageUrl();
    }
    // Try to get signed URL for PDF if bucket is private
    if (curriculum?.pdf_url) {
      fetchSignedPdfUrl();
    }
  }, [curriculum?.banner_url, curriculum?.pdf_url, id]);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCurriculum(id);
      setCurriculum(response.curriculum);
      setBannerImageUrl(response.curriculum?.banner_url || null);
      setPdfUrl(response.curriculum?.pdf_url || null);
    } catch (err: any) {
      console.error('Error fetching curriculum:', err);
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedImageUrl = async () => {
    try {
      console.log('Fetching signed image URL for curriculum:', id);
      // Try to get signed URL for the image (works even if bucket is private)
      const response = await fetch(`/api/curriculum/${id}/image`);
      console.log('Image endpoint response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Image endpoint response data:', data);
        if (data.imageUrl) {
          console.log('Got signed image URL:', data.imageUrl);
          setBannerImageUrl(data.imageUrl);
        } else {
          console.warn('No imageUrl in response, using original URL:', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Could not get signed URL:', errorData.error || response.statusText, errorData);
        // Keep using original URL - might work if bucket becomes public
      }
    } catch (err) {
      console.error('Error fetching signed image URL:', err);
      // Keep using original URL
    }
  };

  const fetchSignedPdfUrl = async () => {
    try {
      // Try to get signed URL for the PDF (works even if bucket is private)
      const response = await fetch(`/api/curriculum/${id}/download`);
      if (response.ok) {
        const data = await response.json();
        if (data.downloadUrl) {
          setPdfUrl(data.downloadUrl);
        }
      } else {
        console.warn('Could not get signed PDF URL, using original URL');
        // Keep using original URL - might work if bucket becomes public
      }
    } catch (err) {
      console.error('Error fetching signed PDF URL:', err);
      // Keep using original URL
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading curriculum...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Curriculum Not Found'}
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={fetchCurriculum}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push('/curriculum')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Back to Curriculum
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Curriculum Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/curriculum/${id}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                {(bannerImageUrl || curriculum.banner_url) ? (
                  <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={bannerImageUrl || curriculum.banner_url}
                      alt={curriculum.title}
                      className="w-full h-64 object-cover"
                      onError={async (e) => {
                        // If image fails to load, try to fetch signed URL if we haven't already
                        const target = e.target as HTMLImageElement;
                        const currentSrc = target.src;
                        
                        // If we're using the original URL and it failed, try to get signed URL
                        if (!bannerImageUrl && curriculum.banner_url && currentSrc === curriculum.banner_url) {
                          console.log('Image failed to load, attempting to fetch signed URL...');
                          try {
                            const response = await fetch(`/api/curriculum/${id}/image`);
                            if (response.ok) {
                              const data = await response.json();
                              if (data.imageUrl) {
                                console.log('Got signed URL on retry, updating image src');
                                target.src = data.imageUrl;
                                setBannerImageUrl(data.imageUrl);
                                return; // Don't show placeholder if we got a signed URL
                              }
                            }
                          } catch (err) {
                            console.error('Error fetching signed URL on retry:', err);
                          }
                        }
                        
                        // If all else fails, show placeholder
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.image-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'image-placeholder flex items-center justify-center w-full h-64 bg-gray-200 text-gray-500';
                          placeholder.innerHTML = `
                            <div class="text-center">
                              <div class="text-4xl mb-2">🖼️</div>
                              <div class="text-sm">Image not available</div>
                              <div class="text-xs mt-1">Please make the 'books' bucket public in Supabase</div>
                            </div>
                          `;
                          parent.appendChild(placeholder);
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully');
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm">No banner image</div>
                    </div>
                  </div>
                )}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{curriculum.title || 'Untitled'}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusBadge(curriculum.status || 'pending')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">State:</span>
                      <span className="ml-2 font-semibold text-gray-900">{curriculum.state_name || curriculum.state || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-semibold text-gray-900">{curriculum.language || 'English'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Published Date:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {curriculum.published_date 
                          ? new Date(curriculum.published_date).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    {curriculum.scheme_name && (
                      <div>
                        <span className="text-gray-600">Scheme:</span>
                        <span className="ml-2 font-semibold text-gray-900">{curriculum.scheme_name}</span>
                      </div>
                    )}
                    {curriculum.grade && (
                      <div>
                        <span className="text-gray-600">Grade:</span>
                        <span className="ml-2 font-semibold text-gray-900">{curriculum.grade}</span>
                      </div>
                    )}
                    {curriculum.subject && (
                      <div>
                        <span className="text-gray-600">Subject:</span>
                        <span className="ml-2 font-semibold text-gray-900">{curriculum.subject}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">PDF Document</h3>
                  {(pdfUrl || curriculum.pdf_url) ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <a
                          href={pdfUrl || curriculum.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          📄 View PDF
                        </a>
                        <a
                          href={pdfUrl || curriculum.pdf_url}
                          download
                          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          ⬇️ Download
                        </a>
                      </div>
                      {/* PDF Viewer */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                          src={`${pdfUrl || curriculum.pdf_url}#toolbar=1&navpanes=1&scrollbar=1`}
                          className="w-full h-full"
                          title="PDF Viewer"
                          onError={(e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            iframe.style.display = 'none';
                            const parent = iframe.parentElement;
                            if (parent && !parent.querySelector('.pdf-error')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'pdf-error flex items-center justify-center h-full bg-gray-100 text-gray-500 p-4';
                              errorDiv.innerHTML = `
                                <div class="text-center">
                                  <div class="text-4xl mb-2">📄</div>
                                  <div class="text-sm font-medium mb-1">PDF cannot be displayed</div>
                                  <div class="text-xs">Please use the "View PDF" or "Download" button above</div>
                                  <div class="text-xs mt-2 text-gray-400">Or make the 'books' bucket public in Supabase</div>
                                </div>
                              `;
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {pdfUrl ? 'Using signed URL (works with private buckets)' : 'Using public URL (bucket must be public)'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No PDF available</p>
                  )}
                </div>
              </div>

              {curriculum.description && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{curriculum.description}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








