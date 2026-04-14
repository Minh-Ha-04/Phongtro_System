export const Select = ({ label, options, error, ...props }) => (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className={`w-full border rounded-lg p-2 ${error ? 'border-red-500' : 'border-gray-300'}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );