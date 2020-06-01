import React from "react";
import { Avatar, Menu, Dropdown, Spin } from "antd";
import { Link } from "react-router-dom";
import RestApi from "../utils/RestApi";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			profileData: {},
		};
	}

	componentDidMount() {
		new RestApi("/players/active_player/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve player."));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					playerData: result,
				});
			},
			onError: (error) => {
				this.setState({
					isLoaded: true,
					error,
				});
			},
		});
	}

	render() {
		const { error, isLoaded, profileData } = this.state;
		if (error) {
			return <div>Error: {error.message}</div>;
		} else if (!isLoaded) {
			return <Spin />;
		} else {
			const menu = (
				<Menu>
					<Menu.Item>
						<Link to={"/players/" + this.state.profileData.id}>
							Signed in as
							<br />
							<b>{profileData.name}</b>
						</Link>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item>
						<Link to={"/players/edit/" + this.state.profileData.id}>
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
					<Avatar size="large" src={profileData.avatar} />
				</Dropdown>
			);
		}
	}
}

export default Profile;
