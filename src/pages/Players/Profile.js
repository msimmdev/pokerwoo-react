import React from "react";
import { withRouter } from "react-router-dom";
import { PageSurround, GameStatistics, DeleteButton } from "../../components";
import {
	Spin,
	Descriptions,
	Space,
	Avatar,
	Tag,
	Button,
	Row,
	Col,
	message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import RestApi from "../../utils/RestApi";

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
		new RestApi("/players/players/" + id + "/").retrieve({
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
					{this.state.playerData.avatar ? (
						<Avatar
							size="large"
							src={this.state.playerData.avatar + "?width=40&height=40"}
						/>
					) : (
						<Avatar
							size="large"
							style={{ color: "#ffffff", backgroundColor: "#ff322b" }}
						>
							{this.state.playerData.name[0]}
						</Avatar>
					)}
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
				<Descriptions bordered title="Payment Info" column={{ xs: 1, sm: 2 }}>
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
					extra={[
						<DeleteButton
							id={this.state.playerData.id}
							key="deletebutton"
							resourse={"/players/players/" + this.state.playerData.id + "/"}
							onRes={() => {
								message.success("Game has been deleted");
								this.props.history.push("/players");
							}}
							confirmMessage="Are you sure you want to delete this player?"
						>
							Delete Player
						</DeleteButton>,
						<Link
							key="editlink"
							to={"/players/edit/" + this.state.playerData.id}
						>
							<Button icon={<EditOutlined />}>Edit Player</Button>
						</Link>,
					]}
				>
					<Row gutter={16}>
						<Col sm={24} md={12}>
							<img
								src={this.state.playerData.avatar + "?width=500"}
								width="100%"
								style={{ padding: "30px" }}
								alt="Avatar"
							/>
						</Col>
						<Col sm={24} md={12}>
							<Descriptions
								bordered
								title="Player Info"
								column={{ xs: 1, sm: 2 }}
							>
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
							<br />
							{hasPaymentInfo ? paymentDescriptions : ""}
						</Col>
						<Col sm={24} md={12}>
						<GameStatistics
								profileData={this.props.profileData}
								history={this.props.history}
							/>
						</Col>
					</Row>
				</PageSurround>
			);
		}
	}
}

export default withRouter(Profile);
