import { Route, BrowserRouter as Router, Routes } from 'react-router';
import HomeLayout from './component/HomeLayout';
import Home from './pages/Home';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;