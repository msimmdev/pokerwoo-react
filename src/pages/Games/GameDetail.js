import React from "react";
import { Link, withRouter } from "react-router-dom";
import Moment from "react-moment";
import CurrencyFormat from "react-currency-format";
import {
	PageSurround,
	DeleteButton,
	TableList,
	PlayerList,
} from "../../components";
import RestApi from "../../utils/RestApi";
import {
	Spin,
	Alert,
	Button,
	Row,
	Col,
	Descriptions,
	Tag,
	message,
} from "antd";
import { EditOutlined, PlayCircleOutlined } from "@ant-design/icons";

class GameDetail extends React.Component {
	constructor(props) {
		super(props);
		this.id = props.match.params.gameid;
		this.addPlayerToGame = this.addPlayerToGame.bind(this);
		this.removePlayerFromGame = this.removePlayerFromGame.bind(this);
		this.addPlayerToTable = this.addPlayerToTable.bind(this);
		this.removePlayerFromTable = this.removePlayerFromTable.bind(this);
		this.onSuccess = this.onSuccess.bind(this);

		this.state = {
			isLoaded: false,
			tables: [],
			tablesLoaded: false,
		};
	}

	componentDidMount() {
		const id = this.id;
		// Get the basic game details.
		new RestApi("/poker/games/" + id + "/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game."));
				}
				return res;
			},
			onParse: (gameResult) => {
				// Get the list of players.
				new RestApi("/players/players/").retrieve({
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(
								new Error("Unable to retrieve player list.")
							);
						}
						return res;
					},
					onParse: (playerResult) => {
						this.setState({
							isLoaded: true,
							gameData: gameResult,
							players: playerResult,
						});
					},
					onError: (error) => {
						throw error;
					},
				});

				// Get the details of each table and add to the tables array.
				gameResult.tables.forEach((tableId) => {
					new RestApi(
						"/poker/games/" + gameResult.id + "/tables/" + tableId + "/"
					).retrieve({
						onRes: (res) => {
							if (res.status !== 200) {
								return Promise.reject(new Error("Unable to retrieve table."));
							}
							return res;
						},
						onParse: (tableResult) => {
							this.setState((state) => {
								let newTables = state.tables;
								newTables.push(tableResult);
								let loadState = false;
								if (newTables.length === gameResult.tables.length) {
									loadState = true;
								}
								return {
									tables: newTables,
									tablesLoaded: loadState,
								};
							});
						},
						onError: (error) => {
							throw error;
						},
					});
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

	addPlayerToGame(playerId) {
		return new RestApi(
			"/poker/games/" + this.state.gameData.id + "/participants/"
		).create({
			data: { player_ref: playerId },
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(new Error("Unable to add participant to game"));
				}
				return res;
			},
			onParse: (result) => {
				let gd = this.state.gameData;
				gd.participants.push(result);
				this.setState({ gameData: gd });
				message.success("Player has been added to the game.");
			},
			onError: (error) => {
				message.error(error.message);
			},
		});
	}

	removePlayerFromGame(res, id) {
		if (res.status === 204) {
			this.setState((state) => {
				let gd = state.gameData;
				let newParticipants = [];
				let removedParticipant;
				gd.participants.forEach((participant) => {
					if (participant.player_ref === id) {
						removedParticipant = participant.id;
					} else {
						newParticipants.push(participant);
					}
				});
				gd.participants = newParticipants;
				let tables = state.tables;
				tables.forEach((table) => {
					let newTableParticipants = [];
					table.participants.forEach((participant) => {
						if (participant.game_participant !== removedParticipant) {
							newTableParticipants.push(participant);
						}
					});
					table.participants = newTableParticipants;
				});
				let players = state.players;
				players.forEach((player) => {
					if (player.id === id) {
						player.participantId = null;
					}
				});
				return { gameData: gd, tables: tables, players: players };
			});
			message.success("Player has been removed from game");
		} else {
			throw new Error("Unable to remove player from game");
		}
	}

	addPlayerToTable(tableId, GameParticipantId) {
		return new RestApi(
			"/poker/games/" +
				this.state.gameData.id +
				"/tables/" +
				tableId +
				"/participants/"
		).create({
			data: { game_participant: GameParticipantId },
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(
						new Error("Unable to add participant to table")
					);
				}
				return res;
			},
			onParse: (result) => {
				this.setState((state) => {
					let tables = state.tables;
					tables.forEach((table) => {
						if (table.id === tableId) {
							table.participants.push(result);
						}
					});
					return { tables: tables };
				});
				message.success("Player has been added to the table.");
			},
			onError: (error) => {
				message.error(error.message);
			},
		});
	}

	removePlayerFromTable(res, tableId, id) {
		if (res.status === 204) {
			this.setState((state) => {
				let tables = [];
				state.tables.forEach((table) => {
					if (table.id === tableId) {
						let participants = [];
						table.participants.forEach((participant) => {
							if (participant.game_participant !== id) {
								participants.push(participant);
							}
						});
						table.participants = participants;
					}
					tables.push(table);
				});
				return { tables: tables };
			});
			message.success("Player has been removed from table");
		} else {
			throw new Error("Unable to remove player from table");
		}
	}

	onSuccess(player, isSuccess, table) {
		new RestApi(
			"/poker/games/" +
				this.id +
				"/tables/" +
				table.id +
				"/participants/" +
				player.tableParticipantId +
				"/"
		).partialUpdate({
			data: {
				success: isSuccess,
			},
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("There was a problem updating the table participant")
					);
				}
				return res;
			},
			onError: (error) => {
				message.error(error.message);
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
			let extraButtons = [
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
			];

			if (!this.state.gameData.complete) {
				extraButtons.push(
					<Link
						key="completelink"
						to={"/games/complete/" + this.state.gameData.id}
					>
						<Button type="primary" icon={<PlayCircleOutlined />}>
							Complete Game
						</Button>
					</Link>
				);
			}

			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
					extra={extraButtons}
				>
					<Row gutter={16}>
						<Col sm={24} md={12}>
							<GameInfo data={this.state.gameData} />
						</Col>
						<Col sm={24} md={12}>
							<GamePlayerInfo
								addPlayer={this.addPlayerToGame}
								removePlayer={this.removePlayerFromGame}
								removeResourse={
									"/poker/games/" + this.state.gameData.id + "/participants/"
								}
								participants={this.state.gameData.participants}
								playerData={this.state.players}
								complete={this.state.gameData.complete}
							/>
						</Col>
					</Row>
					{this.state.gameData.tables.length > 1 ? (
						<TableList
							tableData={this.state.tables}
							playerData={this.state.players}
							isLoaded={this.state.tablesLoaded}
							addPlayer={this.addPlayerToTable}
							removePlayer={this.removePlayerFromTable}
							onSuccess={this.onSuccess}
							tableResourse={
								"/poker/games/" + this.state.gameData.id + "/tables/"
							}
							delete={true}
							add={true}
						/>
					) : (
						""
					)}
				</PageSurround>
			);
		}
	}
}

class GameInfo extends React.Component {
	render() {
		return (
			<Descriptions bordered title="Game Info" column={{ xs: 1, sm: 2 }}>
				<Descriptions.Item label="ID">{this.props.data.id}</Descriptions.Item>
				<Descriptions.Item label="Date">
					<Moment format="DD/MM/YYYY">{this.props.data.date_played}</Moment>
				</Descriptions.Item>
				<Descriptions.Item label="Game Number">
					{this.props.data.game_number}
				</Descriptions.Item>
				<Descriptions.Item label="Stake">
					<CurrencyFormat
						thousandSeparator={true}
						prefix="£"
						value={this.props.data.stake / 100}
						displayType="text"
					/>
				</Descriptions.Item>
				<Descriptions.Item label="Tables">
					{this.props.data.tables.length}
				</Descriptions.Item>
				<Descriptions.Item label="Status">
					{this.props.data.complete ? (
						<Tag color="success">Complete</Tag>
					) : (
						<Tag color="warning">Incomplete</Tag>
					)}
				</Descriptions.Item>
			</Descriptions>
		);
	}
}

class GamePlayerInfo extends React.Component {
	render() {
		let players = [];
		let extraPlayers = [];
		this.props.playerData.forEach((player) => {
			let added = false;
			this.props.participants.forEach((participant) => {
				if (player.id === participant.player_ref) {
					player.participantId = participant.id;
					player.place = participant.place;
					players.push(player);
					added = true;
				}
			});
			if (!added && player.active) {
				extraPlayers.push(player);
			}
		});

		if (this.props.complete) {
			players.sort((a, b) => a.place - b.place);
		}

		return (
			<PlayerList
				players={players}
				validExtraPlayers={extraPlayers}
				label="Game Players"
				addPlayer={this.props.addPlayer}
				removeResourse={this.props.removeResourse}
				removePlayer={this.props.removePlayer}
				removeKey="participantId"
				delete={true}
				success={false}
				add={true}
				place={true}
			/>
		);
	}
}

export default withRouter(GameDetail);
