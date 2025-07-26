import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const APIConfigPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedKey = sessionStorage.getItem('openai-api-key');
    if (savedKey) {
      setIsKeySet(true);
      setApiKey('••••••••••••••••••••••••••••••••••••••••••••••••••••');
    }
  }, []);

  const validateApiKeyFormat = (key: string): boolean => {
    return key.startsWith('sk-') && key.length >= 51;
  };

  const handleSaveKey = () => {
    if (!apiKey || apiKey.includes('•')) {
      setMessage({ type: 'error', text: 'Please enter a valid API key.' });
      return;
    }

    if (!validateApiKeyFormat(apiKey)) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid key format. The key must start with "sk-" and have at least 51 characters.' 
      });
      return;
    }

    setIsValidating(true);
    
    try {
      sessionStorage.setItem('openai-api-key', apiKey);
      setIsKeySet(true);
      setApiKey('••••••••••••••••••••••••••••••••••••••••••••••••••••');
      setMessage({ 
        type: 'success', 
        text: 'API key saved successfully! You can now use AI features.' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving key. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveKey = () => {
    sessionStorage.removeItem('openai-api-key');
    setApiKey('');
    setIsKeySet(false);
    setMessage({ type: 'success', text: 'API key removed successfully.' });
  };

  const handleEditKey = () => {
    setApiKey('');
    setIsKeySet(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Configure OpenAI Key</h1>
            <p className="text-gray-600 mt-2">
              Configure your personal OpenAI API key to use AI features.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-blue-800 font-semibold">Important information:</h3>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• Your key will not be permanently stored on the server</li>
                  <li>• The key is kept only during this browser session</li>
                  <li>• You will need to enter the key again after closing the browser</li>
                  <li>• Your key is transmitted securely via HTTPS</li>
                </ul>
              </div>
            </div>
          </div>

          {message && (
            <div className={`rounded-lg p-4 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex">
                <svg className={`w-5 h-5 mt-0.5 mr-2 ${
                  message.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  disabled={isKeySet}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {isKeySet && (
                  <button
                    onClick={handleEditKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Get your key at{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>

            <div className="flex gap-4">
              {!isKeySet ? (
                <button
                  onClick={handleSaveKey}
                  disabled={isValidating || !apiKey}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Saving...' : 'Save Key'}
                </button>
              ) : (
                <button
                  onClick={handleRemoveKey}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove Key
                </button>
              )}
              
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to get your API key:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></li>
              <li>Sign in or create an account</li>
              <li>Go to the "API Keys" section</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key and paste it here</li>
            </ol>
            <p className="text-sm text-gray-500 mt-3">
              <strong>Note:</strong> Keep your key private and never share it publicly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIConfigPage;