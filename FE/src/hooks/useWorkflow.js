import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import {
  triggerWorkflow,
  getLatestRun,
  getWorkflowArtifacts,
  downloadArtifact,
} from '../services/githubService';

export const useWorkflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [workflowStatus, setWorkflowStatus] = useState(null);

  const handleWorkflowSubmit = async (url) => {
    try {
      setIsLoading(true);
      setError(null);
      await triggerWorkflow(url);
      pollWorkflowStatus();
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const pollWorkflowStatus = useCallback(async () => {
    try {
      const run = await getLatestRun();
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
        setTimeout(pollWorkflowStatus, 5000);
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  const processArtifacts = async (artifactId) => {
    try {
      const zipBlob = await downloadArtifact(artifactId);
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipBlob);
      
      const imageFiles = [];
      for (const [filename, file] of Object.entries(contents.files)) {
        if (filename.endsWith('.png')) {
          const blob = await file.async('blob');
          const url = URL.createObjectURL(blob);
          imageFiles.push(url);
        }
      }
      setImages(imageFiles);
    } catch (error) {
      throw new Error('Failed to process artifacts: ' + error.message);
    }
  };

  // 開發模式下的測試功能
  const loadTestImages = useCallback(() => {
    const testImages = [
      '/charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_10s_window.png',
      '/charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_30s_window.png',
      '/charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_change_point_annotations_60s_window.png',
      '/charts/2024-11-22-Raden Ch. 儒烏風亭らでん ‐ ReGLOSS_highlighted_intervals.png',
    ];
    setImages(testImages);
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
