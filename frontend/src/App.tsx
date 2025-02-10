import { Route, BrowserRouter as Router, Routes } from 'react-router';
import HomeLayout from './component/HomeLayout';
import AppDashboard from './pages/AppDashboard';
import Create from './pages/Create';
import Home from './pages/Home';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="application/:id" element={<AppDashboard />} />
        </Route>

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;