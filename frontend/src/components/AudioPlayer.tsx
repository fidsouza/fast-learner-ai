import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

interface AudioPlayerProps {
  src: string;
  text?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Audio failed to load');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {text && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleProgressChange}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-800"
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="w-5 h-5" />
            ) : (
              <SpeakerWaveIcon className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4f46e5;
            cursor: pointer;
          }
          
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4f46e5;
            cursor: pointer;
            border: none;
          }
        `
      }} />
    </div>
  );
};

export default AudioPlayer;