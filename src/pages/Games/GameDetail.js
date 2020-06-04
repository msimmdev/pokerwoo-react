import React from "react";
import { Link, withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import {
	Spin,
	Alert,
	Row,
	Col,
	Descriptions,
	Table,
	Button,
	Divider,
	message,
} from "antd";
import { EditOutlined, PlayCircleOutlined } from "@ant-design/icons";
import RestApi from "../../utils/RestApi";
import Moment from "react-moment";
import CurrencyFormat from "react-currency-format";
import PlayerName from "../../components/PlayerName";
import DeleteButton from "../../components/DeleteButton";

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
						<DeleteButton
							key="deletebutton"
							id={this.state.gameData.id}
							resourse={"/poker/games/" + this.state.gameData.id + "/"}
							onRes={() => {
								message.success("Game has been deleted");
								this.props.history.push("/games");
							}}
							confirmMessage="Are you sure you want to delete this game?"
						>
							Delete Game
						</DeleteButton>,
						<Link key="editlink" to={"/games/edit/" + this.state.gameData.id}>
							<Button icon={<EditOutlined />}>Edit Game</Button>
						</Link>,
						<Link
							key="completelink"
							to={"/games/complete/" + this.state.gameData.id}
						>
							<Button type="primary" icon={<PlayCircleOutlined />}>
								Complete Game
							</Button>
						</Link>,
					]}
				>
					<Row gutter={16}>
						<Col sm={24} md={12}>
							<Descriptions
								bordered
								title="Game Info"
								column={{ xs: 1, sm: 2 }}
							>
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
							<ParticipantList
								gameid={this.state.gameData.id}
								participants={this.state.gameData.participants}
							>
								Game Players
							</ParticipantList>
						</Col>
					</Row>
					{this.state.gameData.tables.length > 1 ? (
						<TableList
							tableIds={this.state.gameData.tables}
							gameId={this.state.gameData.id}
							gameParticipants={this.state.gameData.participants}
						/>
					) : (
						""
					)}
				</PageSurround>
			);
		}
	}
}

class ParticipantList extends React.Component {
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
						<PlayerName key={record.id} data={record}>
							{value}
						</PlayerName>
					),
				},
				{
					key: "remove",
					align: "center",
					render: (record) => (
						<DeleteButton
							key={record.id}
							id={record.id}
							resourse={this.props.removeResourse}
							onRes={this.props.onRemove}
							confirmMessage="Are you sure you want to remove this participant?"
						>
							Remove
						</DeleteButton>
					),
				},
			];
			return (
				<div>
					<Row>
						<Col span={12}>
							<div className="ant-descriptions-title">
								{this.props.children}
							</div>
						</Col>
						<Col span={12}>
							<Button style={{float: 'right'}}>Add Player</Button>
						</Col>
					</Row>
					<Table
						showHeader={false}
						columns={cols}
						dataSource={this.state.detailedParticipants}
						pagination={false}
						bordered={true}
						rowKey="id"
					/>
				</div>
			);
		} else {
			return <Spin />;
		}
	}
}

class TableList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			tableDetails: {},
		};
	}

	componentDidMount() {
		let reqPromises = [];
		this.props.tableIds.forEach((tableId) => {
			let reqPromise = new RestApi(
				"/poker/games/" + this.props.gameId + "/tables/" + tableId + "/"
			).retrieve({
				onRes: (res) => {
					if (res.status !== 200) {
						return Promise.reject(new Error("Unable to retrieve table."));
					}
					return res;
				},
				onParse: (result) => {
					let tables = this.state.tableDetails;
					tables[result.level] = tables[result.level] || [];
					tables[result.level].push(result);
					this.setState({
						tableDetails: tables,
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
			let displayList = [];
			let i = 1;
			Object.keys(this.state.tableDetails)
				.sort((a, b) => parseInt(b) - parseInt(a))
				.forEach((level) => {
					let gpList = [];
					this.state.tableDetails[level].forEach((table) => {
						let gameParticipants = [];
						table.participants.forEach((tp) => {
							this.props.gameParticipants.forEach((gp) => {
								if (gp.id === tp.game_participant) {
									gameParticipants.push(gp);
								}
							});
						});

						gpList.push(
							<Col key={table.id} sm={24} md={12}>
								<ParticipantList
									gameid={this.props.gameId}
									participants={gameParticipants}
								>
									{table.designation === "Final"
										? "Final Table"
										: "Table " + table.designation}
								</ParticipantList>
							</Col>
						);
					});

					displayList.push(
						<Row gutter={16} key={level}>
							<Divider>{"Group " + i + " Tables"}</Divider>
							{gpList}
						</Row>
					);
					i++;
				});
			return <div>{displayList}</div>;
		} else {
			return <Spin />;
		}
	}
}

export default withRouter(GameDetail);
