import React from "react";
import { Avatar, Space, Tooltip, Row, Col } from "antd";
import { Award } from "./";
import { Link } from "react-router-dom";

class PlayerName extends React.Component {
	render() {
		let awardList = [];
		if (this.props.data.awards.length > 0) {
			this.props.data.awards
				.sort((a, b) => new Date(b.granted) - new Date(a.granted))
				.forEach((award) => {
					awardList.push(
						<Award data={award} key={award.award_key} />
					);
				});
		}

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
					<Row>
						<Col span={24}>{this.props.children}</Col>
						{awardList.length > 0 ? (
							<Col span={24}>
								<Space>{awardList}</Space>
							</Col>
						) : (
							""
						)}
					</Row>
				</Space>
			</Link>
		);
	}
}

export default PlayerName;
