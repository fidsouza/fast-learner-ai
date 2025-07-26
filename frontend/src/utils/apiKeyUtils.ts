export const isApiKeyConfigured = (): boolean => {
  const apiKey = sessionStorage.getItem('openai-api-key');
  return !!(apiKey && apiKey.length > 0);
};

export const getApiKeyErrorMessage = (): string => {
  return 'To use AI features, you need to configure your OpenAI API key. Go to "Settings > Configure OpenAI Key" in the menu.';
};

export const showApiKeyRequiredAlert = (): void => {
  alert(getApiKeyErrorMessage());
};

export const validateApiKeyBeforeAction = (actionName: string = 'esta ação'): boolean => {
  if (!isApiKeyConfigured()) {
    alert(`To ${actionName}, you need to configure your OpenAI API key first. Go to "Settings > Configure OpenAI Key" in the menu.`);
    return false;
  }
  return true;
};