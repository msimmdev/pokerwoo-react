import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import Cookies from "js-cookie";
import { Spin, Descriptions, Space, Avatar, Tag } from "antd";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoaded: false,
			playerData: {},
		};
	}

	componentDidMount() {
		const id = this.props.match.params.playerid;
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/players/" + id + "/", {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"X-CSRFToken": Cookies.get("csrftoken"),
			},
		})
			.then((res) => res.json())
			.then(
				(result) => {
					this.setState({
						isLoaded: true,
						playerData: result,
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
		if (!this.state.isLoaded) {
			let pageBreadcrumb = [{ name: "Players", link: "/players" }, "Profile"];
			let title = "Profile";
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Spin />
				</PageSurround>
			);
		} else {
			let pageBreadcrumb = [
				{ name: "Players", link: "/players" },
				this.state.playerData.name,
			];
			let title = (
				<Space>
					<Avatar size="large" src={this.state.playerData.avatar} />
					{this.state.playerData.name}
				</Space>
			);
			let hasPaymentInfo = false;
			[
				"payment_link",
				"payment_name",
				"bank_account_number",
				"bank_sort_code",
			].forEach((item) => {
				if (this.state.playerData[item]) {
					hasPaymentInfo = true;
				}
			});

			let paymentDescriptions = (
				<Descriptions bordered title="Payment Info">
					{this.state.playerData.payment_link ? (
						<Descriptions.Item label="Payment Link">
							{this.state.playerData.payment_link}
						</Descriptions.Item>
					) : (
						""
					)}
					{this.state.playerData.payment_name ? (
						<Descriptions.Item label="Payment Name">
							{this.state.playerData.payment_name}
						</Descriptions.Item>
					) : (
						""
					)}
					{this.state.playerData.bank_account_number ? (
						<Descriptions.Item label="Bank Account No">
							{this.state.playerData.bank_account_number}
						</Descriptions.Item>
					) : (
						""
					)}
					{this.state.playerData.bank_sort_code ? (
						<Descriptions.Item label="Bank Sort Code">
							{this.state.playerData.bank_sort_code}
						</Descriptions.Item>
					) : (
						""
					)}
				</Descriptions>
			);

			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Space direction="vertical">
						<Descriptions bordered title="Player Info">
							<Descriptions.Item label="Name">
								{this.state.playerData.name}
							</Descriptions.Item>
							{this.state.playerData.pokerth_name ? (
								<Descriptions.Item label="PokerTH Name">
									{this.state.playerData.pokerth_name}
								</Descriptions.Item>
							) : (
								""
							)}
							<Descriptions.Item label="Status">
								{this.state.playerData.active ? (
									<Tag color="success">Enabled</Tag>
								) : (
									<Tag color="error">Disabled</Tag>
								)}
							</Descriptions.Item>
						</Descriptions>
						{hasPaymentInfo ? paymentDescriptions : ""}
					</Space>
				</PageSurround>
			);
		}
	}
}

export default withRouter(Profile);
