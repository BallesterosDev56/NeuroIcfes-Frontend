const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatService {
  async getChatHistory() {
    try {
      const response = await fetch(`${API_URL}/chat/history`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(questionId, message) {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ questionId, message })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContext(questionId) {
    try {
      const response = await fetch(`${API_URL}/chat/context/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.message === 'Network response was not ok') {
      return new Error('Server error occurred');
    } else if (error.message === 'Failed to fetch') {
      return new Error('No response from server');
    } else {
      return new Error('Error setting up request');
    }
  }
}

export const chatService = new ChatService(); 