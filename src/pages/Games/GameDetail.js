import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import { Spin, Alert, Row, Col, Descriptions, Space } from "antd";
import RestApi from "../../utils/RestApi";
import Moment from "react-moment";
import CurrencyFormat from "react-currency-format";
import PlayerName from "../../components/PlayerName";

class GameDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoaded: false,
			gameData: {},
		};
	}

	componentDidMount() {
		const id = this.props.match.params.gameid;
		new RestApi("/poker/games/" + id + "/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game."));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					gameData: result,
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
		let pageBreadcrumb = [{ name: "Games", link: "/games" }, "Game Detail"];
		let title = "Game Detail";
		if (!this.state.isLoaded) {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Spin />
				</PageSurround>
			);
		} else if (this.state.error) {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Alert message={this.state.error.message} type="error" />
				</PageSurround>
			);
		} else {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Row>
						<Col sm={24} md={12}>
							<Descriptions bordered title="Game Info">
								<Descriptions.Item label="ID">
									{this.state.gameData.id}
								</Descriptions.Item>
								<Descriptions.Item label="Date">
									<Moment format="DD/MM/YYYY">
										{this.state.gameData.date_played}
									</Moment>
								</Descriptions.Item>
								<Descriptions.Item label="Game Number">
									{this.state.gameData.game_number}
								</Descriptions.Item>
								<Descriptions.Item label="Stake">
									<CurrencyFormat
										thousandSeparator={true}
										prefix="£"
										value={this.state.gameData.stake / 100}
										displayType="text"
									/>
								</Descriptions.Item>
							</Descriptions>
						</Col>
						<Col sm={24} md={12}>
							<GameParticipantList gameid={this.state.gameData.id} />
						</Col>
					</Row>
				</PageSurround>
			);
		}
	}
}

class GameParticipantList extends React.Component {
	constructor(props) {
		super(props);
		this.gameid = props.gameid;
		this.state = {
			error: null,
			isLoaded: false,
			participants: props.participants || [],
			detailedParticipants: [],
		};
	}

	componentDidMount() {
		let p = [];
		if (!this.state.participants.length) {
			let participantPromise = new RestApi(
				"/poker/games/" + this.gameid + "/participants/"
			).retrieve({
				onRes: (res) => {
					if (res.status !== 200) {
						return Promise.reject(
							new Error("Unable to retrieve participant list.")
						);
					}
					return res;
				},
				onParse: (result) => {
					this.setState({
						participants: result,
					});
					console.log("parse");
				},
				onError: (error) => {
					this.setState({
						isLoaded: true,
						error,
					});
				},
			});
			p.push(participantPromise);
		}

		Promise.all(p).then(() => {
			if (!this.state.error) {
				console.log("check");
				let reqPromises = [];
				this.state.participants.forEach((element) => {
					let reqPromise = new RestApi(
						"/players/players/" + element.player_ref + "/"
					).retrieve({
						onRes: (res) => {
							if (res.status !== 200) {
								return Promise.reject(
									new Error("Unable to retrieve participant list.")
								);
							}
							return res;
						},
						onParse: (result) => {
							let pList = this.state.detailedParticipants;
							pList.push({ ...element, ...result });
							this.setState({
								detailedParticipants: pList,
							});
						},
						onError: (error) => {
							this.setState({
								isLoaded: true,
								error,
							});
						},
					});
					reqPromises.push(reqPromise);
				});
				Promise.all(reqPromises).then(() => {
					this.setState({
						isLoaded: true,
					});
				});
			}
		});
	}

	render() {
		if (this.state.isLoaded) {
			let displayList = [];
			console.log(this.state);
			this.state.detailedParticipants.forEach((player) => {
				displayList.push(
					<PlayerName key={player.id} data={player}>
						{player.name}
					</PlayerName>
				);
			});
			return <Space direction="vertical">{displayList}</Space>;
		} else {
			return <Spin />;
		}
	}
}

export default withRouter(GameDetail);
