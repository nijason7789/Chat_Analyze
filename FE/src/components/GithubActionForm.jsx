import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaGithub } from 'react-icons/fa';

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
    <form onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          輸入直播網址
        </label>
        <input
          type="url"
          name="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FaGithub className="mr-2 h-5 w-5" />
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
