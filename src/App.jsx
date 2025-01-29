import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { playGenerateSound, playSaveSound, playEditCompleteSound, playDeleteSound } from './sounds'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [parsedTweets, setParsedTweets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedTweets, setSavedTweets] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [editingTweet, setEditingTweet] = useState(null)
  const [editText, setEditText] = useState('')
  const [showHints, setShowHints] = useState(true)

  // Fetch saved tweets on component mount
  useEffect(() => {
    fetchSavedTweets()
  }, [])

  const fetchSavedTweets = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_tweets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedTweets(data || [])
    } catch (error) {
      console.error('Error fetching saved tweets:', error)
    }
  }

  const handleSaveTweet = async (tweet) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .insert([{ content: tweet }])

      if (error) throw error
      
      // Play save sound
      playSaveSound()
      
      // Refresh the saved tweets list
      await fetchSavedTweets()
    } catch (error) {
      console.error('Error saving tweet:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSavedTweet = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_tweets')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Play delete sound
      playDeleteSound()
      
      // Refresh the saved tweets list
      await fetchSavedTweets()
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }

  const handleEditClick = (tweet) => {
    setEditingTweet(tweet)
    setEditText(tweet.content)
  }

  const handleCancelEdit = () => {
    setEditingTweet(null)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!editingTweet) return

    try {
      const { error } = await supabase
        .from('saved_tweets')
        .update({ content: editText })
        .eq('id', editingTweet.id)

      if (error) throw error
      
      // Play edit complete sound
      playEditCompleteSound()
      
      // Refresh the saved tweets list
      await fetchSavedTweets()
      handleCancelEdit()
    } catch (error) {
      console.error('Error updating tweet:', error)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === '?') {
      e.preventDefault();
      setShowHints(prev => !prev);
    }
  };

  // Function to parse numbered tweets
  const parseTweets = (text) => {
    if (!text) return [];
    // Match lines that start with a number followed by a dot and space
    const tweets = text.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\.\s/.test(line))
      .map(line => line.replace(/^\d+\.\s/, ''));
    return tweets;
  };

  const handleTweetClick = (tweet) => {
    const tweetText = encodeURIComponent(tweet);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleRemix = async () => {
    setIsLoading(true);
    setError(null);
    setParsedTweets([]);
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to remix content');
      }

      setOutputText(data.remixedText);
      setParsedTweets(parseTweets(data.remixedText));
      
      // Play generate sound
      playGenerateSound()
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error.message);
      setOutputText('');
    } finally {
      setIsLoading(false);
    }
  };

  const getTweetCharCount = (tweet) => {
    return tweet.length;
  };

  // Function to calculate textarea height based on content
  const getTextareaHeight = (text) => {
    const lineHeight = 20; // Approximate line height in pixels
    const padding = 32; // Total vertical padding
    const lines = text.split('\n').length;
    const heightByContent = Math.max(lines * lineHeight + padding, 160);
    return heightByContent;
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-text-primary font-dos p-2 sm:p-4">
      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* DOS-style Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-center text-theme-text-highlight whitespace-nowrap overflow-x-auto">
              <span className="hidden sm:inline">╔═══════════════════╗</span>
              <span className="inline sm:hidden">╔═══════╗</span>
              <br />
              <span className="hidden sm:inline">║  Content Remixer  ║</span>
              <span className="inline sm:hidden">║ Remixer ║</span>
              <br />
              <span className="hidden sm:inline">╚═══════════════════╝</span>
              <span className="inline sm:hidden">╚═══════╝</span>
            </h1>
            <p className="text-center mt-2 text-theme-text-secondary text-sm sm:text-base">
              D:\APPS\REMIXER&gt; Generate Tweets from longer Posts
            </p>
          </div>
          
          {/* Main Terminal Window */}
          <div className="p-2 sm:p-4">
            {/* Input Section */}
            <div className="mb-4 sm:mb-6">
              <label className="block mb-2 text-theme-text-highlight text-sm sm:text-base">
                D:\INPUT&gt;
              </label>
              <div className="relative">
                <textarea
                  className="w-full p-2 bg-theme-background border-2 border-theme-border-default text-theme-text-primary 
                            font-dos resize-none focus:outline-none focus:border-theme-border-focus
                            min-h-[120px] text-sm sm:text-base"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your content here..."
                  disabled={isLoading}
                />
                <span className="absolute bottom-2 right-2 animate-pulse text-theme-text-primary">█</span>
              </div>
            </div>

            {/* Remix Button */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <button
                className="px-4 sm:px-6 py-2 border-2 border-theme-border-default 
                          text-theme-text-highlight text-sm sm:text-base
                          hover:bg-theme-text-primary hover:text-theme-background
                          transition-colors disabled:opacity-50 
                          disabled:cursor-not-allowed"
                onClick={handleRemix}
                disabled={isLoading || !inputText.trim()}
              >
                [Remix Content]
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 sm:mb-6 p-2 border-2 border-theme-error text-theme-error text-sm sm:text-base">
                ERROR: {error}
              </div>
            )}

            {/* Output Section */}
            <div>
              <label className="block mb-2 text-theme-text-highlight text-sm sm:text-base">
                D:\OUTPUT&gt; Generated tweets:
              </label>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[120px]">
                    <div className="animate-pulse text-theme-text-secondary text-sm sm:text-base">
                      Processing request...
                      <br />
                      Please wait...
                    </div>
                  </div>
                ) : parsedTweets.length > 0 ? (
                  parsedTweets.map((tweet, index) => (
                    <div 
                      key={index}
                      className="p-2 sm:p-3 border-2 border-theme-border-default hover:border-theme-border-focus
                               transition-colors bg-theme-background"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-theme-text-secondary shrink-0 text-sm sm:text-base">{index + 1}.</span>
                          <p className="text-theme-text-primary flex-1 text-sm sm:text-base">{tweet}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 mt-1 gap-2 border-t border-theme-border-default">
                          <span className="text-theme-text-secondary text-xs sm:text-sm">
                            {getTweetCharCount(tweet)} chars
                          </span>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleSaveTweet(tweet)}
                              className="flex-1 sm:flex-none px-3 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors whitespace-nowrap"
                              disabled={isSaving}
                            >
                              [Save]
                            </button>
                            <button
                              onClick={() => handleTweetClick(tweet)}
                              className="flex-1 sm:flex-none px-3 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors whitespace-nowrap"
                            >
                              [Tweet]
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : outputText ? (
                  <div className="whitespace-pre-wrap text-sm sm:text-base">{outputText}</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-theme-text-secondary text-sm sm:text-base">
            Don't just be, press a key :D
          </div>
        </div>

        {/* Mobile Sidebar Toggle */}
        <div className="fixed bottom-4 right-4 lg:hidden z-10">
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="px-3 py-2 border-2 border-theme-border-default
                     text-theme-text-highlight text-sm
                     hover:bg-theme-text-primary hover:text-theme-background
                     transition-colors whitespace-nowrap bg-theme-background"
          >
            [{isSidebarVisible ? 'Hide Saved' : 'Show Saved'}]
          </button>
        </div>

        {/* Sidebar Container */}
        <div className={`
          fixed lg:relative top-0 right-0 h-full lg:h-auto
          transition-all duration-300 ease-in-out
          ${isSidebarVisible ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          z-20 lg:z-auto
        `}>
          {/* Desktop Sidebar Toggle */}
          <div className="hidden lg:block">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="px-2 py-1 border-2 border-theme-border-default
                       text-theme-text-highlight text-sm mb-2
                       hover:bg-theme-text-primary hover:text-theme-background
                       transition-colors whitespace-nowrap self-end"
            >
              [{isSidebarVisible ? '<<' : '>>'}]
            </button>
          </div>

          {/* Saved Tweets Panel */}
          <div className={`
            w-[80vw] sm:w-[400px] lg:w-80 h-full lg:h-auto
            border-2 border-theme-border-default
            bg-theme-background
            p-4 flex flex-col
            transition-all duration-300 ease-in-out
            ${isSidebarVisible ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:p-0 lg:border-0'}
          `}>
            <h2 className="text-lg sm:text-xl text-theme-text-highlight mb-4 border-b-2 border-theme-border-default pb-2">
              D:\SAVED&gt; Saved Tweets
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {savedTweets.map((tweet) => (
                <div 
                  key={tweet.id}
                  className="p-2 sm:p-3 border-2 border-theme-border-default hover:border-theme-border-focus
                           transition-colors bg-theme-background"
                >
                  <div className="flex flex-col gap-2">
                    {editingTweet?.id === tweet.id ? (
                      <div className="flex flex-col gap-2">
                        {showHints && (
                          <div className="text-theme-text-secondary text-xs border-2 border-theme-border-default p-2 mb-2">
                            <div className="flex justify-between items-start mb-1">
                              <p>╔════ Keyboard Shortcuts ════╗</p>
                              <button
                                onClick={() => setShowHints(false)}
                                className="text-theme-text-highlight hover:text-theme-error ml-4"
                              >
                                [x]
                              </button>
                            </div>
                            <div className="pl-2">
                              <p>• Ctrl+Enter - Save changes</p>
                              <p>• Esc - Cancel editing</p>
                            </div>
                            <p>╚═══════════════════════════╝</p>
                          </div>
                        )}
                        <div className="relative">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              handleEditKeyDown(e);
                              if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            style={{ height: `${getTextareaHeight(editText)}px` }}
                            className="w-full p-2 bg-theme-background border-2 border-theme-border-default 
                                     text-theme-text-primary font-dos resize-none focus:outline-none 
                                     focus:border-theme-border-focus text-sm sm:text-base
                                     overflow-y-auto transition-all duration-200"
                            autoFocus
                          />
                          <div className="absolute bottom-2 right-2 flex items-center gap-2">
                            <span className="text-theme-text-secondary text-xs">
                              {getTweetCharCount(editText)} chars
                            </span>
                            <span className="animate-pulse text-theme-text-primary">█</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-theme-border-default pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-theme-text-secondary text-xs">
                              {showHints ? '↑ Pro tips above' : '[?] Press ? for help'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors"
                            >
                              [Cancel]
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-2 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors"
                            >
                              [Save]
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-theme-text-primary break-words text-sm sm:text-base">{tweet.content}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 mt-1 gap-2 border-t border-theme-border-default">
                          <span className="text-theme-text-secondary text-xs sm:text-sm">
                            {getTweetCharCount(tweet.content)} chars
                          </span>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleEditClick(tweet)}
                              className="flex-1 sm:flex-none px-2 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors"
                            >
                              [Edit]
                            </button>
                            <button
                              onClick={() => handleTweetClick(tweet.content)}
                              className="flex-1 sm:flex-none px-2 py-1 border-2 border-theme-border-default
                                       text-theme-text-highlight text-sm
                                       hover:bg-theme-text-primary hover:text-theme-background
                                       transition-colors"
                            >
                              [Tweet]
                            </button>
                            <button
                              onClick={() => handleDeleteSavedTweet(tweet.id)}
                              className="flex-1 sm:flex-none px-2 py-1 border-2 border-theme-border-default
                                       text-theme-error text-sm
                                       hover:bg-theme-error hover:text-theme-background
                                       transition-colors"
                            >
                              [Del]
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {savedTweets.length === 0 && (
                <div className="text-theme-text-secondary text-center p-4 text-sm sm:text-base">
                  No saved tweets yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 