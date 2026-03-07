function TailwindTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-4">
          Agar yeh text styled hai toh Tailwind kaam kar raha hai!
        </p>
        <div className="flex space-x-4">
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-success">
            Success Button
          </button>
        </div>
        <div className="mt-4">
          <input 
            type="text" 
            placeholder="Test Input" 
            className="input-field"
          />
        </div>
        <div className="mt-4 card">
          <p>Yeh ek card component hai</p>
        </div>
      </div>
    </div>
  );
}

export default TailwindTest;
