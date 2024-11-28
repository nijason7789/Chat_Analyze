import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GithubActionForm from './components/GithubActionForm';
import LoadingSpinner from './components/LoadingSpinner';
import ImageGallery from './components/ImageGallery';
import { useWorkflow } from './hooks/useWorkflow';

const queryClient = new QueryClient();

function App() {
  const {
    isLoading,
    error,
    images,
    workflowStatus,
    handleWorkflowSubmit,
    loadTestImages,
  } = useWorkflow();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6 px-4">聊天室分析工具</h1>
          
          <div className="bg-white rounded-lg p-6 mb-4">
            <GithubActionForm onSubmit={handleWorkflowSubmit} isLoading={isLoading} />
          </div>

          {import.meta.env.DEV && (
            <div className="text-right mb-6 px-4">
              <button
                onClick={loadTestImages}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                載入測試圖片
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 mx-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner />
              {workflowStatus && (
                <p className="text-center text-gray-600 mt-4">
                  Workflow Status: {workflowStatus}
                </p>
              )}
            </div>
          )}

          {images.length > 0 && <ImageGallery images={images} />}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
