import { useState, useEffect } from 'react';
import { aiService } from '~/lib/ai';

type AIProvider = 'gemini';

interface ProviderInfo {
  name: string;
  description: string;
  free: boolean;
  quality: 'Basic' | 'Good' | 'Excellent';
  setupUrl: string;
}

const providerInfo: Record<AIProvider, ProviderInfo> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s powerful AI with free tier',
    free: true,
    quality: 'Excellent',
    setupUrl: 'https://makersuite.google.com/app/apikey'
  }
};

export function AIProviderStatus() {
  const [providerStatus, setProviderStatus] = useState<Record<AIProvider, boolean>>({
    gemini: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProviders = () => {
      try {
        const status = aiService.getProviderStatus();
        setProviderStatus(status);
      } catch (error) {
        console.error('Error checking AI provider status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProviders();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-white font-medium mb-2">AI Provider Status</h3>
        <div className="text-white/70 text-sm">Checking provider status...</div>
      </div>
    );
  }

  const availableProviders = Object.entries(providerStatus).filter(([, available]) => available);
  const activeProvider = availableProviders[0]?.[0] as AIProvider | undefined;

  if (!activeProvider) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          AI Provider Required
        </h3>
        <div className="text-white/90 text-sm mb-3">
          Google Gemini API key is required for resume analysis.
        </div>
        <a 
          href={providerInfo.gemini.setupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Get your free Gemini API key →
        </a>
      </div>
    );
  }

  const provider = providerInfo[activeProvider];

  return (
    <div className="bg-green-500/10 backdrop-blur-sm rounded-lg p-4 border border-green-500/30 drop-shadow-2xl">
      <h3 className="text-black font-medium mb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        AI Provider Active
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-black/90 text-sm font-medium">{provider.name}</span>
          <div className="flex items-center gap-2">
            {provider.free && (
              <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">
                Free Tier
              </span>
            )}
            <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded">
              {provider.quality}
            </span>
          </div>
        </div>
        <p className="text-black/70 text-sm">{provider.description}</p>
      </div>
    </div>
  );
}
