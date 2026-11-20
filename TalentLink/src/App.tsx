import { IonApp, IonLoading, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { useAuth } from "./Hooks/useAuth";

// Páginas Públicas
import Welcome from "./Pages/Welcome/Welcome";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";

// Layout Privado (Tabs)
import Tabs from "./Components/Shared/Tabs";

// Páginas de Admin (Ocupan pantalla completa)
import AdminUsers from "./Pages/Admin/AdminUsers";
import { AdminRoute } from "./Routes/AppRoutes";

const Shell = () => {
  const { user, loading } = useAuth();

  if (loading) return <IonLoading isOpen message="Cargando..." />;

  return (
    <IonRouterOutlet>
      <Route exact path="/welcome" component={Welcome} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      
      {/* La app principal (con las tabs) */}
      <Route path="/app" render={() => user ? <Tabs /> : <Redirect to="/login" />} />
      
      {/* Panel de Admin (sin tabs inferiores, se abre como página completa) */}
      <AdminRoute exact path="/admin/users" component={AdminUsers} />

      <Route exact path="/">
        <Redirect to={user ? "/app/index" : "/welcome"} />
      </Route>
    </IonRouterOutlet>
  );
};

const App = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;