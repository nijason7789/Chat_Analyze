import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaGithub } from 'react-icons/fa';
import styles from './GithubActionForm.module.css';

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
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.inputGroup}>
        <label htmlFor="url" className={styles.formLabel}>
          輸入直播網址
        </label>
        <input
          type="text"
          name="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className={styles.formInput}
          required
        />
      </div>
      <div className={styles.marginTopMedium}>
        <button
          type="submit"
          disabled={isLoading}
          className={isLoading ? `${styles.submitButton} ${styles.opacity50} ${styles.cursorNotAllowed}` : styles.submitButton}
        >
          <FaGithub className={styles.githubIcon} />
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
