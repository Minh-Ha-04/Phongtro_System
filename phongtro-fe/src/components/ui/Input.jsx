export const Input = ({ label, error, ...props }) => (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`} {...props} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );