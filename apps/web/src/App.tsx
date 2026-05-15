import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Worlds } from '@/pages/Worlds';
import { Characters } from '@/pages/Characters';
import { Lore } from '@/pages/Lore';
import { Timeline } from '@/pages/Timeline';
import { Chat } from '@/pages/Chat';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/worlds" element={<Worlds />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/lore" element={<Lore />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Layout>
  );
}

export default App;
