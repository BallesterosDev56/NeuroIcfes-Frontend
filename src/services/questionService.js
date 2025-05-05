const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class QuestionService {
  async getQuestions(subject, difficulty) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_URL}/questions/subject/${subject}?difficulty=${difficulty}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch questions');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async submitAnswer(questionId, answer) {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answer })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No response from server');
      }
      throw error;
    }
  }

  async getSocraticPrompt(questionId, userResponse) {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}/socratic-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userResponse })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No response from server');
      }
      throw error;
    }
  }

  // Admin functions
  async createQuestion(questionData) {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No response from server');
      }
      throw error;
    }
  }

  async updateQuestion(questionId, questionData) {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No response from server');
      }
      throw error;
    }
  }

  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${API_URL}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No response from server');
      }
      throw error;
    }
  }
}

export const questionService = new QuestionService(); 