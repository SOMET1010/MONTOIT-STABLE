import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from '@/app/routes';

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
  },
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
