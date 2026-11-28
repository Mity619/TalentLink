import type { ComponentType } from "react";
import { Redirect, Route, type RouteProps } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";

type GuardProps = Omit<RouteProps, "component" | "render"> & {
  component: ComponentType<any>;
};

export const PrivateRoute = ({ component: Component, ...rest }: GuardProps) => {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => (user ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );
};

export const AdminRoute = ({ component: Component, ...rest }: GuardProps) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.rol === "admin";
  return (
    <Route
      {...rest}
      render={(props) =>
        !user ? (
          <Redirect to="/login" />
        ) : isAdmin ? (
          <Component {...props} />
        ) : (
          <Redirect to="/app/index" />
        )
      }
    />
  );
};