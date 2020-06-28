import React from "react";
import { Avatar, Space, Tooltip } from "antd";
import { Link } from "react-router-dom";

class PlayerName extends React.Component {
	render() {
		return (
			<Link to={"/players/" + this.props.data.id + "/"}>
				<Space>
					<Tooltip title={this.props.data.name}>
						{this.props.data.avatar ? (
							<Avatar
								size="large"
								src={this.props.data.avatar + "?width=40&height=40"}
							/>
						) : (
							<Avatar
								size="large"
								style={{ color: "#ffffff", backgroundColor: "#ff322b" }}
							>
								{this.props.data.name[0]}
							</Avatar>
						)}
					</Tooltip>
					{this.props.children}
				</Space>
			</Link>
		);
	}
}

export default PlayerName;
