import React from "react";
import { Switch, Route } from "react-router-dom";
import { Players, Games, Dashboard, AddPlayer, EditPlayer, Profile } from "./pages";

const routes = [
	{
		path: '/players/add',
		component: AddPlayer
	},
	{
		path: '/players/edit/:playerid',
		component: EditPlayer
	},
	{
		path: '/players/:playerid',
		component: Profile
	},
	{
		path: "/players",
		component: Players,
	},
	{
		path: "/games",
		component: Games,
	},
	{
		path: "/",
		component: Dashboard,
	},
];

function RouteWithSubRoutes(route) {
	return (
	  <Route
		path={route.path}
		render={props => (
		  // pass the sub-routes down to keep nesting
		  <route.component {...props} routes={route.routes} />
		)}
	  />
	);
  }

export default function Routes() {
	return (
		<Switch>
			{routes.map((route, i) => (
				<RouteWithSubRoutes key={i} {...route} />
			))}
		</Switch>
	);
}
