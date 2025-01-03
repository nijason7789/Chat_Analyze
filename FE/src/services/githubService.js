import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'nijason7789';
const REPO_NAME = 'Chat_Analyze';
const WORKFLOW_ID = 'run_chat_analyze.yaml';

const githubApi = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

export const triggerWorkflow = async (url) => {
  try {
    const response = await githubApi.post(
      `/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`,
      {
        ref: 'main',
        inputs: {
          url: url,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to trigger workflow: ' + error.message);
  }
};

export const getLatestRun = async () => {
  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/runs?per_page=1`
    );
    return response.data.workflow_runs[0];
  } catch (error) {
    throw new Error('Failed to get workflow run: ' + error.message);
  }
};

export const getWorkflowArtifacts = async (runId) => {
  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/artifacts`
    );
    return response.data.artifacts;
  } catch (error) {
    throw new Error('Failed to get artifacts: ' + error.message);
  }
};

export const downloadArtifact = async (artifactId) => {
  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/actions/artifacts/${artifactId}/zip`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to download artifact: ' + error.message);
  }
};
