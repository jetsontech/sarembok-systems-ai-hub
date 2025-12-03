import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolView from './pages/ToolView';
import AgentPlayground from './pages/AgentPlayground';
import Nexus365 from './components/Nexus365';
import ContextSidebar from './components/ContextSidebar';
import { ProjectProvider } from './context/ProjectContext';
import './App.css';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Routes>
          {/* Nexus365 has its own layout, so it's outside the main Layout */}
          <Route path="/nexus" element={<Nexus365 />} />

          {/* All other routes use the main Layout */}
          <Route path="/*" element={
            <Layout>
              <ContextSidebar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tool/:id" element={<ToolView />} />
                <Route path="/playground" element={<AgentPlayground />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;
