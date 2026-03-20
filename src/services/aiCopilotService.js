import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AI_CHAT_ENDPOINT = 'http://localhost:5000/api/ai/chat';

export function getStoredUserId() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  if (!storedUser?.token) {
    return undefined;
  }

  try {
    const decodedToken = jwtDecode(storedUser.token);
    return decodedToken?.userId;
  } catch (error) {
    return undefined;
  }
}

export async function sendCopilotMessage(message) {
  const payload = {
    message,
  };
  const userId = getStoredUserId();

  if (userId !== undefined) {
    payload.userId = userId;
  }

  const response = await axios.post(AI_CHAT_ENDPOINT, payload);
  return response.data;
}
