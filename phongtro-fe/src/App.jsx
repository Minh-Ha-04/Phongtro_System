import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
// Các trang khác tạm thời chưa có, có thể thêm sau
// import Rooms from './pages/Rooms';
// import Tenants from './pages/Tenants';
// import Contracts from './pages/Contracts';
// import Invoices from './pages/Invoices';
// import Reports from './pages/Reports';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/rooms" element={<Rooms />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<Reports />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;