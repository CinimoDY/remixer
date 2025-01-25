import { useState } from 'react'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async (style) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          style: style
        })
      })
      const data = await response.json()
      setOutputText(data.remixedText)
    } catch (error) {
      console.error('Error:', error)
    }
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
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => handleRemix('professional')}
          disabled={isLoading}
        >
          Professional
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => handleRemix('casual')}
          disabled={isLoading}
        >
          Casual
        </button>
      </div>

      {/* Output Section */}
      <div className="border p-4 rounded min-h-[200px]">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>{outputText}</div>
        )}
      </div>
    </div>
  )
}

export default App