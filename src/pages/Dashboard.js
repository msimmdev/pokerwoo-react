import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import {
	Alert,
	Spin,
	Row,
	Col,
	Card,
	Statistic,
	Radio,
	Space,
	Button,
	Typography,
	message,
} from "antd";
import { PageSurround, PlayerName } from "../components";
import RestApi from "../utils/RestApi";

const { Paragraph } = Typography;

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			players: [],
		};
	}

	componentDidMount() {
		new RestApi("/players/players/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve player list."));
				}
				return res;
			},
			onParse: (players) => {
				this.setState({
					isLoaded: true,
					players: players,
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
		let pageBreadcrumb = ["Dashboard"];
		let title = "Hi " + this.props.profileData.name + "!";
		if (this.state.error) {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Alert>{this.state.error.message}</Alert>
				</PageSurround>
			);
		} else if (!this.state.isLoaded) {
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
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Row gutter={[16, 16]}>
						<Col sm={24} md={12}>
							<NextSession
								profileData={this.props.profileData}
								players={this.state.players}
							/>
						</Col>
						<Col sm={24} md={12}>
							<Card title="Payment Overview" />
						</Col>
						<Col sm={24} md={12}>
							<Card title="Game Statistics" />
						</Col>
						<Col sm={24} md={12}>
							<Card title="Recent Games" />
						</Col>
					</Row>
				</PageSurround>
			);
		}
	}
}

class NotFoundError extends Error {}

class NextSession extends React.Component {
	constructor(props) {
		super(props);
		this.reply = this.reply.bind(this);
		this.state = {
			error: null,
			isLoaded: false,
			empty: false,
			sessionData: {},
			otherPlayers: [],
		};
	}

	componentDidMount() {
		new RestApi("/schedule/next/").retrieve({
			onRes: (res) => {
				if (res.status === 404) {
					return Promise.reject(new NotFoundError("No schedule found"));
				} else if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve schedule list."));
				}
				return res;
			},
			onParse: (session) => {
				let myPlayer;
				let otherPlayers = [];
				session.players.forEach((sPlayer) => {
					if (sPlayer.player_ref === this.props.profileData.id) {
						myPlayer = sPlayer;
					} else if (sPlayer.attendance) {
						this.props.players.forEach((player) => {
							if (sPlayer.player_ref === player.id) {
								otherPlayers.push(player);
							}
						});
					}
				});

				if (myPlayer) {
					this.setState({
						isLoaded: true,
						sessionData: session,
						myAttendance: myPlayer,
						otherPlayers: otherPlayers,
					});
				} else {
					this.setState({
						isLoaded: true,
						sessionData: session,
						otherPlayers: otherPlayers,
					});
				}
			},
			onError: (error) => {
				if (error instanceof NotFoundError) {
					this.setState({
						isLoaded: true,
						empty: true,
					});
				} else {
					this.setState({
						isLoaded: true,
						error,
					});
				}
			},
		});
	}

	reply(event) {
		let value = event.target.value;

		if (this.state.myAttendance) {
			let resource =
				"/schedule/sessions/" +
				this.state.sessionData.id +
				"/players/" +
				this.state.myAttendance.id +
				"/";
			if (value === "X") {
				new RestApi(resource).delete({
					onRes: (res) => {
						if (res.status === 204) {
							this.setState({ myAttendance: null });
							message.success("Attendance changed");
						} else {
							return Promise.reject(new Error("Unable to change attendance"));
						}
					},
					onError: (error) => {
						message.error(error.message);
					},
				});
			} else {
				new RestApi(resource).partialUpdate({
					data: {
						attendance: value === "Y" ? true : false,
					},
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(new Error("Unable to change attendance"));
						}
						return res;
					},
					onParse: (result) => {
						this.setState({ myAttendance: result });
						message.success("Attendance changed");
					},
					onError: (error) => {
						message.error(error.message);
					},
				});
			}
		} else {
			if (value === "Y" || value === "N") {
				new RestApi(
					"/schedule/sessions/" + this.state.sessionData.id + "/players/"
				).create({
					data: {
						player_ref: this.props.profileData.id,
						attendance: value === "Y" ? true : false,
					},
					onRes: (res) => {
						if (res.status !== 201) {
							return Promise.reject(new Error("Unable to change attendance"));
						}
						return res;
					},
					onParse: (result) => {
						this.setState({ myAttendance: result });
						message.success("Attendance changed");
					},
					onError: (error) => {
						message.error(error.message);
					},
				});
			}
		}
	}

	render() {
		if (this.state.error) {
			console.error(this.state.error);
			return <Alert type="error">{this.state.error.message}</Alert>;
		} else if (!this.state.isLoaded) {
			return <Spin />;
		} else if (this.state.empty) {
			return (
				<Card title="Next Session">
					<Paragraph>
						There are currently no upcoming scheduled sessions.
					</Paragraph>
					<Link to="/schedule/add">
						<Button>Create One</Button>
					</Link>
				</Card>
			);
		} else {
			let createdBy;
			this.props.players.forEach((player) => {
				if (this.state.sessionData.createdby_player === player.id) {
					createdBy = player;
				}
			});
			return (
				<Card title="Next Session">
					<Row gutter={16}>
						<Col span={12}>
							<Row gutter={[0, 16]}>
								<Col span={24}>
									<Statistic
										title="The next scheduled session is at"
										value={moment(this.state.sessionData.schedule_date).format(
											"DD/MM/YYYY HH:mm"
										)}
									/>
								</Col>
								<Col span={24}>
									<Statistic
										formatter={(value) => (
											<PlayerName data={createdBy}>{value}</PlayerName>
										)}
										valueStyle={{ fontSize: 14 }}
										title="Suggested By"
										value={createdBy.name}
									/>
								</Col>
							</Row>
						</Col>
						<Col span={12}>
							<Row gutter={[0, 16]}>
								<Col span={24}>
									<div className="ant-statistic-title">
										Are you going to play?
									</div>
									<div className="ant-statistic-content">
										<Radio.Group
											buttonStyle="solid"
											defaultValue={
												this.state.myAttendance
													? this.state.myAttendance.attendance
														? "Y"
														: "N"
													: "X"
											}
											onChange={this.reply}
										>
											<Radio.Button value="Y">Yes</Radio.Button>
											<Radio.Button value="N">No</Radio.Button>
											<Radio.Button value="X">Maybe</Radio.Button>
										</Radio.Group>
									</div>
								</Col>
								{this.state.otherPlayers.length ? (
									<Col span={24}>
										<div className="ant-statistic-title">
											Other Confirmed Players
										</div>
										<div className="ant-statistic-content">
											<Space>
												{this.state.otherPlayers.map((player) => (
													<PlayerName key={player.id} data={player} />
												))}
											</Space>
										</div>
									</Col>
								) : (
									""
								)}
							</Row>
						</Col>
					</Row>
				</Card>
			);
		}
	}
}

export default Dashboard;
