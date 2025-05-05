const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ProgressService {
  async getProgress() {
    try {
      const response = await fetch(`${API_URL}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSubjectProgress(subject) {
    try {
      const response = await fetch(`${API_URL}/progress/${subject}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getLearningPath() {
    try {
      const response = await fetch(`${API_URL}/progress/learning-path`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecommendations() {
    try {
      const response = await fetch(`${API_URL}/progress/recommendations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return new Error('No response from server');
    }
    return error;
  }
}

export default new ProgressService(); 