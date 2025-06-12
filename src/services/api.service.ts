const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GeneratePostResponse {
  content: string;
  isThread: boolean;
  threadParts?: string[];
  nextPostingTime?: {
    time: string;
    index: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  code: string;
  details?: unknown;
}

export interface PublishResponse {
  tweetIds: string[];
}

class ApiService {
  async generatePost(prompt: string, includeSchedule: boolean = true): Promise<GeneratePostResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, includeSchedule }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error as ApiError;
      }

      return response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        message: 'Failed to connect to the server',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async publishToTwitter(
    content: string,
    isThread: boolean,
    threadParts?: string[],
    mediaFile?: File
  ): Promise<PublishResponse> {
    try {
      let mediaData;
      if (mediaFile) {
        const base64 = await this.fileToBase64(mediaFile);
        mediaData = {
          data: base64,
          mimeType: mediaFile.type
        };
      }

      const response = await fetch(`${API_BASE_URL}/posts/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          isThread,
          threadParts,
          ...(mediaData && { mediaFile: mediaData })
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error as ApiError;
      }

      return response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        message: 'Failed to publish to Twitter',
        code: 'NETWORK_ERROR',
      };
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async getSchedule(): Promise<{ time: string; index: number; }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/schedule`);
      
      if (!response.ok) {
        const error = await response.json();
        throw error as ApiError;
      }

      return response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        statusCode: 500,
        message: 'Failed to connect to the server',
        code: 'NETWORK_ERROR',
      };
    }
  }
}

export const apiService = new ApiService(); 