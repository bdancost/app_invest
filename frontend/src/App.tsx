import { PageContainer } from "./components/layout/PageContainer";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <PageContainer>
      <Header />
      <Dashboard />
    </PageContainer>
  );
}

export default App;
