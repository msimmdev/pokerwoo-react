import React from "react";
import { Avatar, Space } from "antd";
import { Link } from "react-router-dom";

class PlayerName extends React.Component {
	render() {
		return (
			<Link to={"/players/" + this.props.data.id + "/"}>
				<Space>
					<Avatar size="large" src={this.props.data.avatar} />
					{this.props.children}
				</Space>
			</Link>
		);
	}
}

export default PlayerName;
