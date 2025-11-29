import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolView from './pages/ToolView';
import AgentPlayground from './pages/AgentPlayground';
import ContextSidebar from './components/ContextSidebar';
import { ProjectProvider } from './context/ProjectContext';
import './App.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Layout>
          <ContextSidebar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tool/:id" element={<ToolView />} />
            <Route path="/playground" element={<AgentPlayground />} />
          </Routes>
        </Layout>
      </Router>
    </ProjectProvider>
  );
}

export default App;
