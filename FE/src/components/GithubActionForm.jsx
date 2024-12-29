import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaGithub } from 'react-icons/fa';
import '../styles/GithubActionForm.css';

export default function GithubActionForm({ onSubmit, isLoading = false }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="space-y-2">
        <label htmlFor="url" className="form-label">
          輸入直播網址
        </label>
        <input
          type="url"
          name="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="form-input"
          required
        />
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`submit-button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaGithub className="github-icon" />
          {isLoading ? '處理中...' : '分析聊天室'}
        </button>
      </div>
    </form>
  );
}

GithubActionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};
