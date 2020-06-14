import React from "react";
import { Avatar, Space } from "antd";
import { Link } from "react-router-dom";

class PlayerName extends React.Component {
	render() {
		return (
			<Link to={"/players/" + this.props.data.id + "/"}>
				<Space>
					{this.props.data.avatar ? (
						<Avatar size="large" src={this.props.data.avatar} />
					) : (
						<Avatar
							size="large"
							style={{ color: "#ffffff", backgroundColor: "#ff322b" }}
						>
							{this.props.data.name[0]}
						</Avatar>
					)}
					{this.props.children}
				</Space>
			</Link>
		);
	}
}

export default PlayerName;
