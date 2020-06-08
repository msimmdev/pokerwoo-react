import React from "react";
import { Avatar, Menu, Dropdown } from "antd";
import { Link } from "react-router-dom";

class Profile extends React.Component {
	render() {
		const menu = (
			<Menu>
				<Menu.Item>
					<Link to={"/players/" + this.props.profileData.id}>
						Signed in as
						<br />
						<b>{this.props.profileData.name}</b>
					</Link>
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item>
					<Link to={"/players/edit/" + this.props.profileData.id}>
						Edit Profile
					</Link>
				</Menu.Item>
				<Menu.Item>
					<a href="/accounts/logout">Sign Out</a>
				</Menu.Item>
			</Menu>
		);
		return (
			<Dropdown overlay={menu}>
				<Avatar size="large" src={this.props.profileData.avatar} />
			</Dropdown>
		);
	}
}

export default Profile;
