import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import { Spin, Alert, Row, Col, Descriptions, Table, Button } from "antd";
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
					extra={[
						<Button key='editgame'>Edit Game</Button>,
						<Button type='primary' key='completegame'>Complete Game</Button>
					]}
				>
					<Row gutter={16}>
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
							<GameParticipantList
								gameid={this.state.gameData.id}
								participants={this.state.gameData.participants}
							/>
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

	render() {
		if (this.state.error) {
			return <Alert type="error" message={this.state.error.message} />;
		} else if (this.state.isLoaded) {
			let cols = [
				{
					title: "Player",
					dataIndex: "name",
					key: "name",
					render: (value, record) => (
						<PlayerName key={record.id} data={record}>{value}</PlayerName>
					),
				},
			];
			return (
				<div>
					<div className="ant-descriptions-title">Game Players</div>
					<Table
						showHeader={false}
						columns={cols}
						dataSource={this.state.detailedParticipants}
						pagination={false}
						bordered={true}
					/>
				</div>
			);
		} else {
			return <Spin />;
		}
	}
}

export default withRouter(GameDetail);
