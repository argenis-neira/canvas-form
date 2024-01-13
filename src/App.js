import {
  BrowserRouter as Router,
  useRoutes
} from "react-router-dom";
import { PublicRoutes } from './routes'
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  return useRoutes(PublicRoutes)
}

function App() {
  return (
    <div>
      <Router>
        <Main></Main>
      </Router>
    </div>
  );
}

export default App;
