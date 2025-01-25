import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const remixStyles = [
    { id: 'professional', label: 'Professional', color: 'blue' },
    { id: 'casual', label: 'Casual', color: 'green' },
    { id: 'funny', label: 'Funny', color: 'purple' },
  ];

  const handleRemix = async (style) => {
    setIsLoading(true)
    // TODO: Implement API call
    setOutputText('Remixed: ' + inputText)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Content Remixer</h1>
      
      {/* Input Section */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          rows="6"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your content here..."
        />
      </div>

      {/* Remix Options */}
      <div className="flex gap-2 mb-4">
        {remixStyles.map((style) => (
          <button
            key={style.id}
            className={`px-4 py-2 bg-${style.color}-500 text-white rounded hover:bg-${style.color}-600 transition-colors`}
            onClick={() => handleRemix(style.id)}
            disabled={isLoading}
          >
            {style.label}
          </button>
        ))}
      </div>

      {/* Output Section */}
      <div className="border p-4 rounded min-h-[200px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{outputText}</div>
        )}
      </div>
    </div>
  )
}

export default App 