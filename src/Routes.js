import React from "react";
import { Switch, Route } from "react-router-dom";
import {
	Players,
	Games,
	Dashboard,
	AddPlayer,
	EditPlayer,
	Profile,
	AddGame,
	GameDetail,
	EditGame,
	CompleteGame,
	Payments,
	AddPayment,
	Schedule,
	AddSchedule,
	EditSchedule,
	EditProfile,
} from "./pages";

const routes = [
	{
		path: "/players/add",
		component: AddPlayer,
	},
	{
		path: "/players/edit/:playerid",
		component: EditPlayer,
	},
	{
		path: "/players/profile",
		component: EditProfile,
	},
	{
		path: "/players/:playerid",
		component: Profile,
	},
	{
		path: "/players",
		component: Players,
	},
	{
		path: "/games/detail/:gameid",
		component: GameDetail,
	},
	{
		path: "/games/edit/:gameid",
		component: EditGame,
	},
	{
		path: "/games/complete/:gameid",
		component: CompleteGame,
	},
	{
		path: "/games/add",
		component: AddGame,
	},
	{
		path: "/games",
		component: Games,
	},
	{
		path: "/payments/add",
		component: AddPayment,
	},
	{
		path: "/payments",
		component: Payments,
	},
	{
		path: "/schedule/edit/:sessionid",
		component: EditSchedule,
	},
	{
		path: "/schedule/add",
		component: AddSchedule,
	},
	{
		path: "/schedule",
		component: Schedule,
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
			render={(routeProps) => {
				// pass the sub-routes down to keep nesting
				return (
					<route.component
						profileData={route.profileData}
						{...routeProps}
						routes={route.routes}
					/>
				);
			}}
		/>
	);
}

export default function Routes(props) {
	return (
		<Switch>
			{routes.map((route, i) => (
				<RouteWithSubRoutes
					profileData={props.profileData}
					key={i}
					{...route}
				/>
			))}
		</Switch>
	);
}
