import { IonApp, IonLoading, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { useAuth } from "./Hooks/useAuth";
import Menu from "./Components/Shared/Menu";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Index from "./Pages/Index/Index";
import Profile from "./Pages/Profile/Profile";
import AdminUsers from "./Pages/Admin/AdminUsers";
import { AdminRoute, PrivateRoute } from "./Routes/AppRoutes";

const Shell = () => {
  const { user, loading } = useAuth();

  if (loading) return <IonLoading isOpen message="Cargando TalentLink..." />;

  return (
    <>
      {user && <Menu />}
      <IonRouterOutlet id="main">
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <PrivateRoute exact path="/app/index" component={Index} />
        <PrivateRoute exact path="/app/profile" component={Profile} />
        <AdminRoute exact path="/app/admin/users" component={AdminUsers} />
        {/* Laura y Alex agregan aquí sus rutas */}

        <Route exact path="/">
          <Redirect to={user ? "/app/index" : "/login"} />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </IonRouterOutlet>
    </>
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