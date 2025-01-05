import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import {
  triggerWorkflow,
  getRunByTrackingId,
  getWorkflowArtifacts,
  downloadArtifact,
} from '../services/githubService';

const POLLING_INTERVAL = 5000;
const TEST_IMAGES = [
  '/test_charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_10s_window.png',
  '/test_charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_30s_window.png',
  '/test_charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_60s_window.png',
  '/test_charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_highlighted_intervals.png',
];

export const useWorkflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState(null);

  const processArtifacts = async (artifactId) => {
    try {
      const zipBlob = await downloadArtifact(artifactId);
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipBlob);
      
      const imageFiles = await Promise.all(
        Object.entries(contents.files)
          .filter(([filename]) => filename.endsWith('.png'))
          .map(async ([_, file]) => {
            const blob = await file.async('blob');
            return URL.createObjectURL(blob);
          })
      );
      
      setImages(imageFiles);
    } catch (error) {
      throw new Error('Failed to process artifacts: ' + error.message);
    }
  };

  const pollWorkflowStatus = useCallback(async (trackingId) => {
    if (!trackingId) return;

    try {
      const run = await getRunByTrackingId(trackingId);
      
      if (!run) {
        setTimeout(() => pollWorkflowStatus(trackingId), POLLING_INTERVAL);
        return;
      }

      setWorkflowStatus(run.status);

      if (run.status === 'completed') {
        if (run.conclusion === 'success') {
          const artifacts = await getWorkflowArtifacts(run.id);
          if (artifacts.length > 0) {
            await processArtifacts(artifacts[0].id);
          }
        } else {
          throw new Error('Workflow failed');
        }
        setIsLoading(false);
      } else {
        setTimeout(() => pollWorkflowStatus(trackingId), POLLING_INTERVAL);
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  const handleWorkflowSubmit = async (url) => {
    try {
      setIsLoading(true);
      setError(null);
      setImages([]);
      
      const { trackingId } = await triggerWorkflow(url);
      pollWorkflowStatus(trackingId);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const loadTestImages = useCallback(() => {
    setImages(TEST_IMAGES);
  }, []);

  return {
    isLoading,
    error,
    images,
    workflowStatus,
    handleWorkflowSubmit,
    loadTestImages,
  };
};
