import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GithubActionForm from './components/GithubActionForm';
import LoadingSpinner from './components/LoadingSpinner';
import ImageGallery from './components/ImageGallery';
import { useWorkflow } from './hooks/useWorkflow';
import styles from './App.module.css';
import ErrorIcon from './assets/icons/ErrorIcon.svg';

const queryClient = new QueryClient();

const App = () => {
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
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>聊天室分析工具</h1>
          <div className={styles.formContainer}>
            <GithubActionForm onSubmit={handleWorkflowSubmit} isLoading={isLoading} />
          </div>
          {import.meta.env.DEV && (
            <div className={styles.testButtonContainer}>
              <button
                onClick={loadTestImages}
                className={styles.testButton}
              >
                載入測試圖片
              </button>
            </div>
          )}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorContent}>
                <div className={styles.errorIconContainer}>
                  <img src={ErrorIcon} className={styles.errorIcon} alt="Error" />
                </div>
                <div className={styles.errorMessage}>
                  <p className={styles.errorText}>{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.galleryContainer}>
          {isLoading && (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              {workflowStatus && (
                <p className={styles.loadingStatus}>
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
