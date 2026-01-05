'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { dummyCurriculums } from '@/lib/dummyData';

export default function CurriculumViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const curriculum = dummyCurriculums.find(c => c.id === id);

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

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
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
                <img
                  src={curriculum.banner}
                  alt={curriculum.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{curriculum.title}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  {getStatusBadge(curriculum.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">State:</span>
                      <span className="ml-2 font-medium">{curriculum.stateName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-medium">{curriculum.language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Published Date:</span>
                      <span className="ml-2 font-medium">{new Date(curriculum.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">PDF Document</h3>
                  <a
                    href={curriculum.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    📄 Download PDF
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{curriculum.description}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








