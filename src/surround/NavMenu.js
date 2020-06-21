import React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

class NavMenu extends React.Component {
	render() {
		return (
			<Menu
				mode="horizontal"
				selectedKeys={[this.props.selected]}
				style={{ height: "64px", border: "0" }}
			>
				<Menu.Item key="/">
					<Link to="/">Dashboard</Link>
				</Menu.Item>
				<Menu.Item key="/games">
					<Link to="/games">Games</Link>
				</Menu.Item>
				<Menu.Item key="/payments">
					<Link to="/payments">Payments</Link>
				</Menu.Item>
				<Menu.Item key="/players">
					<Link to="/players">Players</Link>
				</Menu.Item>
				<Menu.Item key="/schedule">
					<Link to="/schedule">Schedule</Link>
				</Menu.Item>
				<Menu.Item key="/leaderboards">
					<Link to="/leaderboards">Leaderboards</Link>
				</Menu.Item>
			</Menu>
		);
	}
}

export default NavMenu;
