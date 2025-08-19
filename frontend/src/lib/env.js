// Environment configuration
export const config = {
	openAI: {
	  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
	  model: 'gpt-4o-realtime-preview-2024-10-01',
	  voice: 'alloy'
	},
	audio: {
	  sampleRate: 24000,
	  channels: 1,
	  format: 'pcm16'
	}
  };
  
  // Helper to set API key in localStorage
  export const setOpenAIApiKey = (key) => {
	localStorage.setItem('openai_api_key', key);
	window.location.reload(); // Reload to apply the new key
  };
  
  // Helper to check if API key is configured
  export const hasOpenAIApiKey = () => {
	return !!(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
  }; 