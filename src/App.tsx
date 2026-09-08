import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthBootstrap } from '@/pages/commons/AuthBootstrap';
import { router } from '@/router';
import { ViewModeProvider } from '@/context/ViewModeContext';

export default function App() {
  return (
    <ViewModeProvider>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ViewModeProvider>
  );
}