const Loader = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  )
}

export default Loader