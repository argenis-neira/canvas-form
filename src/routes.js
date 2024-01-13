import Form from "./pages/index";
import Database from "./pages/visualize-submits"
import Error from "./pages/error404";

const PublicRoutes = [
  { path: "/form", element: <Form /> },
  { path: "/submits", element: <Database /> },
  { path: '/*', skipLazyLoad: true, element: <Error /> }
]

export { PublicRoutes }