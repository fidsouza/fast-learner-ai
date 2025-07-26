import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI, vocabularyAPI } from '../services/api';
import { Lesson, Word } from '../types';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowLeftIcon,
  SpeakerWaveIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { WordModal } from '../components/WordModal';
import { TranslationPopup } from '../components/TranslationPopup';
import { VocabularyHighlighter, KnownVocabularyItem, HighlightMatch } from '../services/vocabularyHighlighting';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  // const [highlightedWordIndex, setHighlightedWordIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [saveButtonPosition, setSaveButtonPosition] = useState({x: 0, y: 0});
  // const [previewSelection, setPreviewSelection] = useState<{start: number, end: number} | null>(null);

  // Vocabulary highlighting state
  // const [knownVocabulary, setKnownVocabulary] = useState<KnownVocabularyItem[]>([]);
  const [highlightMatches, setHighlightMatches] = useState<HighlightMatch[]>([]);
  const [translationPopup, setTranslationPopup] = useState<{
    isVisible: boolean;
    text: string;
    translation: string;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    text: '',
    translation: '',
    position: { x: 0, y: 0 }
  });
  
  const highlighterRef = useRef(new VocabularyHighlighter());

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  useEffect(() => {
    if (lesson) {
      loadKnownVocabulary();
    }
  }, [lesson]);

  // useEffect(() => {
  //   if (lesson?.audio_sync_data && currentTime > 0) {
  //     updateHighlightedWord();
  //   }
  // }, [currentTime, lesson?.audio_sync_data]);

  const loadLesson = async () => {
    try {
      const response = await lessonsAPI.getById(id!);
      setLesson(response.lesson);
    } catch (error) {
      console.error('Error loading lesson:', error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadKnownVocabulary = async () => {
    try {
      const response = await vocabularyAPI.getKnown(lesson?.language);
      highlighterRef.current.setVocabulary(response.words);
      
      if (lesson?.content) {
        const matches = highlighterRef.current.findMatches(lesson.content);
        setHighlightMatches(matches);
      }
    } catch (error) {
      console.error('Error loading known vocabulary:', error);
    }
  };

  // const updateHighlightedWord = () => {
  //   if (!lesson?.audio_sync_data) return;

  //   const currentWordData = lesson.audio_sync_data.find(
  //     (data) => currentTime >= data.start_time && currentTime <= data.end_time
  //   );

  //   if (currentWordData) {
  //     setHighlightedWordIndex(currentWordData.word_index);
  //   }
  // };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // const handleWordClick = (word: string, wordIndex: number) => {
  //   setSelectedWord(word);
  //   setSelectedText(word);
  //   setSelectionRange(null);
  //   setIsWordModalOpen(true);
  // };

  const handleTextSelection = () => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowSaveButton(false);
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        setShowSaveButton(false);
        return;
      }

      // Close translation popup when selecting text
      setTranslationPopup(prev => ({ ...prev, isVisible: false }));

      // Show button for any text selection
      const range = selection.getRangeAt(0);
      const lessonContent = lesson?.content || '';
      
      // Calculate character indices in the lesson text
      const startIndex = getCharacterIndex(range.startContainer, range.startOffset, lessonContent);
      const endIndex = getCharacterIndex(range.endContainer, range.endOffset, lessonContent);
      
      setSelectedText(selectedText);
      setSelectionRange({ start: startIndex, end: endIndex });
      
      // Position the save button near the selection
      const rect = range.getBoundingClientRect();
      const containerRect = document.querySelector('[data-lesson-text]')?.getBoundingClientRect();
      if (containerRect) {
        setSaveButtonPosition({
          x: Math.max(10, rect.left - containerRect.left),
          y: rect.bottom - containerRect.top + 10
        });
      }
      
      setShowSaveButton(true);
    }, 100);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Handle double-click on individual words
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedWord = selection.toString().trim();
      if (!selectedWord.includes(' ')) {
        // Single word - use the word modal directly
        setSelectedWord(selectedWord);
        setSelectedText(selectedWord);
        setSelectionRange(null);
        setIsWordModalOpen(true);
        setShowSaveButton(false);
        setTranslationPopup(prev => ({ ...prev, isVisible: false }));
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Close translation popup when mouse moves during selection
    if (e.buttons === 1) { // Left mouse button is pressed (dragging)
      setTranslationPopup(prev => ({ ...prev, isVisible: false }));
    }
  };

  const getCharacterIndex = (container: Node, offset: number, fullText: string): number => {
    const textContainer = document.querySelector('[data-lesson-text]');
    if (!textContainer) return 0;

    try {
      // Create a range from the start of the text container to the selection point
      const range = document.createRange();
      range.setStart(textContainer.firstChild || textContainer, 0);
      range.setEnd(container, offset);
      
      // Get the text content of this range to calculate the character index
      const textBeforeSelection = range.toString();
      return textBeforeSelection.length;
    } catch (error) {
      console.error('Error calculating character index:', error);
      return 0;
    }
  };

  const handleSaveSentence = () => {
    if (selectedText) {
      setSelectedWord(selectedText);
      setIsWordModalOpen(true);
      setShowSaveButton(false);
    }
  };

  const handleDocumentClick = (e: MouseEvent) => {
    // Hide save button and popup if clicking outside the text area
    const target = e.target as Element;
    if (!target.closest('[data-lesson-text]') && !target.closest('button') && !target.closest('.vocabulary-highlight')) {
      setShowSaveButton(false);
      setTranslationPopup(prev => ({ ...prev, isVisible: false }));
      window.getSelection()?.removeAllRanges();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleSelectionChange = () => {
    // Additional handler for selection changes that might be missed by mouseUp
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString().trim();
      if (selectedText && selectedText.length > 0) {
        // Check if selection is within our text container
        const range = selection.getRangeAt(0);
        const textContainer = document.querySelector('[data-lesson-text]');
        if (textContainer && textContainer.contains(range.commonAncestorContainer)) {
          // Small delay to ensure the selection is stable
          setTimeout(() => {
            const currentSelection = window.getSelection();
            if (currentSelection && currentSelection.toString().trim() === selectedText) {
              handleTextSelection();
            }
          }, 50);
        }
      }
    }
  };

  const handleWordSaved = (word: Word) => {
    setIsWordModalOpen(false);
    setSelectedWord(null);
    setSelectedText('');
    setSelectionRange(null);
    setShowSaveButton(false);
    setTranslationPopup(prev => ({ ...prev, isVisible: false }));
    // Reload known vocabulary to update highlighting
    loadKnownVocabulary();
  };

  const handleHighlightedTextClick = (match: HighlightMatch, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = document.querySelector('[data-lesson-text]')?.getBoundingClientRect();
    
    if (containerRect) {
      setTranslationPopup({
        isVisible: true,
        text: match.text,
        translation: match.translation,
        position: {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top
        }
      });
    }
  };

  const closeTranslationPopup = () => {
    setTranslationPopup(prev => ({ ...prev, isVisible: false }));
  };

  const renderText = () => {
    if (!lesson) return null;

    const text = lesson.content;
    
    // If no matches, render the original text with word hover effects
    if (highlightMatches.length === 0) {
      const words = text.split(/(\s+)/);
      const wordSegments = words.map((segment, segmentIndex) => {
        if (segment.trim()) {
          // This is a word
          return (
            <span
              key={`no-match-word-${segmentIndex}`}
              style={{
                cursor: 'pointer',
                userSelect: 'text',
                borderRadius: '2px',
                padding: '1px',
                transition: 'background-color 0.1s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.4)'; // More visible blue
                e.currentTarget.style.setProperty('background-color', 'rgba(59, 130, 246, 0.4)', 'important');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
              }}
            >
              {segment}
            </span>
          );
        } else {
          // This is whitespace
          return (
            <span key={`no-match-space-${segmentIndex}`} style={{ cursor: 'text' }}>
              {segment}
            </span>
          );
        }
      });

      return (
        <div style={{ position: 'relative' }}>
          <div 
            style={{ 
              position: 'relative',
              zIndex: 1,
              userSelect: 'text',
              pointerEvents: 'auto',
              cursor: 'auto' // Let child elements define their own cursor
            }}
            onMouseUp={handleTextSelection}
            onMouseMove={handleMouseMove}
            onDoubleClick={handleDoubleClick}
          >
            {wordSegments}
          </div>
        </div>
      );
    }

    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort matches by start index to process them in order
    const sortedMatches = [...highlightMatches].sort((a, b) => a.startIndex - b.startIndex);

    sortedMatches.forEach((match, matchIndex) => {
      // Add text before this match
      if (match.startIndex > lastIndex) {
        const beforeText = text.slice(lastIndex, match.startIndex);
        if (beforeText) {
          // Split text into words for individual hover effects
          const words = beforeText.split(/(\s+)/);
          const wordSegments = words.map((segment, segmentIndex) => {
            if (segment.trim()) {
              // This is a word
              return (
                <span
                  key={`word-${matchIndex}-${segmentIndex}`}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'text',
                    borderRadius: '2px',
                    padding: '1px',
                    transition: 'background-color 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.4)'; // More visible blue
                    e.currentTarget.style.setProperty('background-color', 'rgba(59, 130, 246, 0.4)', 'important');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
                  }}
                >
                  {segment}
                </span>
              );
            } else {
              // This is whitespace
              return (
                <span key={`space-${matchIndex}-${segmentIndex}`} style={{ cursor: 'text' }}>
                  {segment}
                </span>
              );
            }
          });
          
          segments.push(...wordSegments);
        }
      }

      // Add the highlighted match
      segments.push(
        <span
          key={`match-${matchIndex}`}
          className="vocabulary-highlight"
          style={{
            backgroundColor: '#FFFACD', // Light yellow highlight
            borderRadius: '2px',
            padding: '1px 2px',
            border: '1px solid transparent',
            transition: 'all 0.1s ease',
            userSelect: 'text' // Allow text selection
          }}
          onClick={(e) => {
            // Only show popup if no text is selected
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
              handleHighlightedTextClick(match, e);
            }
          }}
          onMouseEnter={(e) => {
            // Only show hover effect if no text is being selected
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
              e.currentTarget.style.backgroundColor = '#FFF700';
              e.currentTarget.style.borderColor = '#E5E500';
            }
            // Force cursor styles directly
            e.currentTarget.style.setProperty('cursor', 'pointer', 'important');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFACD';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onMouseMove={(e) => {
            // Continuously enforce cursor during hover
            e.currentTarget.style.setProperty('cursor', 'pointer', 'important');
          }}
        >
          {match.text}
        </span>
      );

      lastIndex = match.endIndex;
    });

    // Add remaining text after last match
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex);
      if (afterText) {
        // Split text into words for individual hover effects
        const words = afterText.split(/(\s+)/);
        const wordSegments = words.map((segment, segmentIndex) => {
          if (segment.trim()) {
            // This is a word
            return (
              <span
                key={`after-word-${segmentIndex}`}
                style={{
                  cursor: 'pointer',
                  userSelect: 'text',
                  borderRadius: '2px',
                  padding: '1px',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.4)'; // More visible blue
                  e.currentTarget.style.setProperty('background-color', 'rgba(59, 130, 246, 0.4)', 'important');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
                }}
              >
                {segment}
              </span>
            );
          } else {
            // This is whitespace
            return (
              <span key={`after-space-${segmentIndex}`} style={{ cursor: 'text' }}>
                {segment}
              </span>
            );
          }
        });
        
        segments.push(...wordSegments);
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        <div 
          style={{ 
            position: 'relative',
            zIndex: 1,
            userSelect: 'text',
            pointerEvents: 'auto',
            cursor: 'auto' // Let child elements define their own cursor
          }}
          onMouseUp={handleTextSelection}
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
        >
          {segments}
        </div>
      </div>
    );
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lesson.language === 'english' ? 'English' : 'French'}
          </p>
        </div>

        {lesson.audio_url && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="flex-shrink-0 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6 ml-1" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
            </div>

            <audio
              ref={audioRef}
              src={lesson.audio_url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        )}

        <div className="px-6 py-8" style={{ position: 'relative' }}>
          <div className="prose max-w-none">
            <div 
              className="text-lg leading-relaxed text-gray-900"
              data-lesson-text
              style={{ 
                userSelect: 'text', 
                lineHeight: '1.8',
                position: 'relative',
                minHeight: '200px',
                whiteSpace: 'pre-wrap',
                cursor: 'default'
              }}
              onMouseUp={handleTextSelection}
              onDoubleClick={handleDoubleClick}
              onTouchEnd={handleTextSelection}
            >
              {renderText()}
            </div>
          </div>
          
          {/* Floating Save Button */}
          {showSaveButton && (
            <button
              onClick={handleSaveSentence}
              className="absolute px-3 py-1 rounded-md shadow-lg z-10 transition-colors text-sm"
              style={{
                left: `${saveButtonPosition.x}px`,
                top: `${saveButtonPosition.y}px`,
                backgroundColor: '#FEF3C7', // Soft yellow background
                color: '#92400E', // Dark yellow/brown text
                border: '1px solid #F59E0B', // Yellow border
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FDE68A'; // Slightly darker yellow on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3C7'; // Back to soft yellow
              }}
            >
              {selectedText && selectedText.includes(' ') ? 'Save Sentence' : 'Save Word'}
            </button>
          )}

          {/* Translation Popup */}
          <TranslationPopup
            text={translationPopup.text}
            translation={translationPopup.translation}
            position={translationPopup.position}
            onClose={closeTranslationPopup}
            isVisible={translationPopup.isVisible}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Known words and sentences appear highlighted in yellow. Click them to see the translation, or drag to select new text.
          </div>
        </div>
      </div>

      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        word={selectedWord || ''}
        language={lesson.language}
        lessonId={lesson.id}
        selectionRange={selectionRange}
        onWordSaved={handleWordSaved}
      />
    </div>
  );
};