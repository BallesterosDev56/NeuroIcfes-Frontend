const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class OpenAIService {
  /**
   * Start a new chat session with OpenAI
   * @param {string} subject - The subject of study
   * @returns {Promise<Object>} - The response from the server
   */
  async startChat(subject) {
    try {
      const response = await fetch(`${API_URL}/chat/openai/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ subject })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message to OpenAI with the current question context
   * @param {string} questionId - The ID of the current question
   * @param {string} message - The user's message
   * @param {number} timeSpent - Time spent on this question
   * @returns {Promise<Object>} - The response from the server
   */
  async sendMessage(questionId, message, timeSpent) {
    try {
      const response = await fetch(`${API_URL}/chat/openai/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId, message, timeSpent })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if the user's answer is correct
   * @param {string} questionId - The ID of the current question
   * @param {string} answer - The user's final answer
   * @returns {Promise<Object>} - The response including whether the answer is correct
   */
  async checkAnswer(questionId, answer) {
    try {
      const response = await fetch(`${API_URL}/chat/openai/check-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId, answer })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get the next question in the session
   * @param {string} subject - The current subject
   * @param {string} difficulty - The current difficulty level
   * @returns {Promise<Object>} - The next question
   */
  async getNextQuestion(subject, difficulty) {
    try {
      const response = await fetch(`${API_URL}/chat/openai/next-question?subject=${subject}&difficulty=${difficulty}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors from the API
   * @param {Error} error - The error object
   * @returns {Error} - A standardized error
   */
  handleError(error) {
    console.error('OpenAI Service Error:', error);
    if (error.message === 'Network response was not ok') {
      return new Error('Server error occurred');
    } else if (error.message === 'Failed to fetch') {
      return new Error('No response from server');
    } else {
      return error;
    }
  }
}

export default new OpenAIService(); 