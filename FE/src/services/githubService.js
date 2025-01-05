import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'nijason7789';
const REPO_NAME = 'Chat_Analyze';
const WORKFLOW_ID = 'run_chat_analyze.yaml';
const ARTIFACT_PREFIX = 'generated-images';

const githubApi = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

const generateTrackingId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getRepoPath = (path) => `/repos/${REPO_OWNER}/${REPO_NAME}${path}`;

export const triggerWorkflow = async (url) => {
  try {
    const trackingId = generateTrackingId();
    await githubApi.post(
      getRepoPath(`/actions/workflows/${WORKFLOW_ID}/dispatches`),
      {
        ref: 'feat/add_FE',
        inputs: {
          url,
          tracking_id: trackingId,
        },
      }
    );
    return { trackingId };
  } catch (error) {
    throw new Error('Failed to trigger workflow: ' + error.message);
  }
};

export const getRunByTrackingId = async (trackingId) => {
  try {
    const response = await githubApi.get(
      getRepoPath(`/actions/workflows/${WORKFLOW_ID}/runs?per_page=3`)
    );
    
    for (const run of response.data.workflow_runs) {
      if (run.event !== 'workflow_dispatch') continue;
      
      const artifactsResponse = await githubApi.get(
        getRepoPath(`/actions/runs/${run.id}/artifacts`)
      );
      
      const hasMatchingArtifact = artifactsResponse.data.artifacts.some(
        artifact => artifact.name === `${ARTIFACT_PREFIX}-${trackingId}`
      );
      
      if (hasMatchingArtifact) return run;
    }
    
    return null;
  } catch (error) {
    throw new Error('Failed to get workflow run: ' + error.message);
  }
};

export const getWorkflowArtifacts = async (runId) => {
  try {
    const response = await githubApi.get(
      getRepoPath(`/actions/runs/${runId}/artifacts`)
    );
    return response.data.artifacts;
  } catch (error) {
    throw new Error('Failed to get artifacts: ' + error.message);
  }
};

export const downloadArtifact = async (artifactId) => {
  try {
    const response = await githubApi.get(
      getRepoPath(`/actions/artifacts/${artifactId}/zip`),
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to download artifact: ' + error.message);
  }
};
