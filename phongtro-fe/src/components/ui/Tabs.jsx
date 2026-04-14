import { useState } from 'react';

export const Tabs = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const childrenWithProps = React.Children.map(children, child => {
    if (child.type === TabsList) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    if (child.type === TabsContent) {
      return React.cloneElement(child, { activeTab });
    }
    return child;
  });
  return <div>{childrenWithProps}</div>;
};

export const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200">
    {React.Children.map(children, child => {
      if (child.type === TabsTrigger) {
        return React.cloneElement(child, { activeTab, setActiveTab });
      }
      return child;
    })}
  </div>
);

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button
    className={`px-4 py-2 text-sm font-medium focus:outline-none ${activeTab === value ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div className="pt-4">{children}</div>;
};