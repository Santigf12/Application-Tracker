import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import 'survey-core/defaultV2.min.css';
import AppDashboard from './pages/AppDashboard';
import CreateApplication from './pages/CreateApplication';
import Home from './pages/Home';
import './styles/app.css';

function App() {

  //Routes are defined here, login is the default route the rest are private routes that can only be accessed if the user is logged in
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/create' element={<CreateApplication />} />
        <Route path='/application/:id' element={<AppDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
