import React from "react";
import { Avatar, Menu, Dropdown, Spin } from "antd";
import { Link } from "react-router-dom";

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
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/active_player/", {
            credentials: "include",
            headers: {
                Accept: 'application/json'
            }
		})
			.then((res) => res.json())
			.then(
				(result) => {
					this.setState({
						isLoaded: true,
						profileData: result,
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error,
					});
				}
			);
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
                        <Link to="/edit-profile">
                            Signed in as<br /><b>{profileData.name}</b>
                        </Link>
                    </Menu.Item> 
                    <Menu.Divider />
					<Menu.Item>
						<Link to="/edit-profile">Edit Profile</Link>
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
