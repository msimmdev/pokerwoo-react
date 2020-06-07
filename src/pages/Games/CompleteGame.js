import React from "react";
import { withRouter } from "react-router-dom";
import { PageSurround, TableList, PlayerList } from "../../components";
import {
	Alert,
	Spin,
	Button,
	Steps,
	Row,
	Col,
	Typography,
	message,
} from "antd";
import { StepForwardOutlined } from "@ant-design/icons";
import RestApi from "../../utils/RestApi";

const { Step } = Steps;
const { Paragraph } = Typography;

class CompleteGame extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.id = props.match.params.gameid;
		this.stageForward = this.stageForward.bind(this);
		this.stageBack = this.stageBack.bind(this);
		this.onComplete = this.onComplete.bind(this);
		this.onPlace = this.onPlace.bind(this);
		this.onPayee = this.onPayee.bind(this);
		this.onBalance = this.onBalance.bind(this);
		this.state = {
			isLoaded: false,
			gameData: {},
			singleTable: true,
			tables: [],
			tablesLoaded: false,
			completedParticipants: [],
			places: {},
		};
	}

	componentDidMount() {
		const id = this.props.match.params.gameid;
		// Get the basic game details.
		new RestApi("/poker/games/" + id + "/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game."));
				}
				return res;
			},
			onParse: (gameResult) => {
				let stage = "placing";
				let singleTable = true;
				if (gameResult.tables.length > 1) {
					singleTable = false;
					stage = "tables";
				}

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
						playerResult.forEach((player) => {
							gameResult.participants.forEach((participant) => {
								if (player.id === participant.player_ref) {
									player.participantId = participant.id;
								}
							});
						});
						this.setState({
							isLoaded: true,
							gameData: gameResult,
							players: playerResult,
							singleTable: singleTable,
							stage: stage,
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
								let completedParticipants = state.completedParticipants;
								let newTables = state.tables;
								newTables.push(tableResult);
								let loadState = false;
								if (newTables.length === gameResult.tables.length) {
									loadState = true;
								}
								if (tableResult.designation === "Final") {
									completedParticipants = tableResult.participants.map(
										(item) => item.game_participant
									);
								}
								return {
									tables: newTables,
									tablesLoaded: loadState,
									completedParticipants: completedParticipants,
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

	stageForward() {
		if (this.state.stage === "tables") {
			this.setState({ stage: "placing" });
		} else if (this.state.stage === "placing") {
			let hasPlaceOne = false;
			let hasPlaceTwo = false;
			let hasPlaceThree = false;
			Object.values(this.state.places).forEach((value) => {
				if (value === 1) {
					hasPlaceOne = true;
				} else if (value === 2) {
					hasPlaceTwo = true;
				} else if (value === 3) {
					hasPlaceThree = true;
				}
			});
			if (hasPlaceOne && hasPlaceTwo && hasPlaceThree) {
				this.setState({ stage: "payment" });
			} else {
				message.error("You must provide a first, second and third place.");
			}
		} else if (this.state.stage === "payment") {
			this.setState({ stage: "complete" });
			console.log(this.state);
		}
	}

	stageBack() {
		if (this.state.stage === "placing" && !this.state.singleTable) {
			this.setState({ stage: "tables" });
		} else if (
			this.state.stage === "placing" ||
			this.state.stage === "tables"
		) {
			this.props.history.push("/games/detail/" + this.id);
		} else if (this.state.stage === "payment") {
			this.setState({ stage: "placing" });
		}
	}

	onComplete(player, isComplete) {
		if (isComplete) {
			let existing = false;
			let completed = [];
			this.state.completedParticipants.forEach((participantId) => {
				if (player.participantId === participantId) {
					existing = true;
				}
				completed.push(participantId);
			});
			if (!existing) {
				completed.push(player.participantId);
			}
			this.setState({ completedParticipants: completed });
		} else {
			let completed = [];
			this.state.completedParticipants.forEach((participantId) => {
				if (player.participantId !== participantId) {
					completed.push(participantId);
				}
			});

			this.setState({ completedParticipants: completed });
		}
	}

	onPlace(player, place) {
		this.setState((state) => {
			let places = state.places;
			places[player.id] = place;
			return { places: places };
		});
	}

	onBalance(player, balance) {

	}

	onPayee(player, payee) {

	}

	render() {
		let pageBreadcrumb = [
			{ name: "Games", link: "/games" },
			{ name: "Game Detail", link: "/games/detail/" + this.id },
			"Complete Game",
		];
		let title = "Complete Game";

		let stepTitles = {
			tables: "Table Winners",
			placing: "Game Winners",
			payment: "Payment Arrangements",
			complete: "Game Completion",
		};

		let steps = ["tables", "placing", "payment", "complete"];
		if (this.state.singleTable) {
			steps = steps.splice(1);
		}

		let currentStep = steps.indexOf(this.state.stage);
		let stepItems = [];
		steps.forEach((step) => {
			stepItems.push(<Step key={step} title={stepTitles[step]} />);
		});

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
					<Alert type="error" message={this.state.error.message} />
				</PageSurround>
			);
		} else {
			let content;
			if (this.state.stage === "tables") {
				content = (
					<TableList
						tableData={this.state.tables.filter(
							(item) => item.designation !== "Final"
						)}
						playerData={this.state.players}
						isLoaded={this.state.tablesLoaded}
						completedParticipants={this.state.completedParticipants}
						onComplete={this.onComplete}
						delete={false}
						complete={true}
						add={false}
					/>
				);
			} else if (this.state.stage === "placing") {
				let players = [];
				this.state.players.forEach((player) => {
					if (player.participantId) {
						players.push(player);
					}
				});
				content = (
					<Row gutter={16}>
						<Col sm={24} md={12}>
							<Paragraph>Some Text</Paragraph>
						</Col>
						<Col sm={24} md={12}>
							<PlayerList
								players={players}
								delete={false}
								complete={false}
								add={false}
								place={false}
								setPlace={true}
								onPlace={this.onPlace}
								places={this.state.places}
							/>
						</Col>
					</Row>
				);
			} else if (this.state.stage === "payment") {
				let players = [];
				let firstPlace = [];
				let pot = 0;
				this.state.players.forEach((player) => {
					if (player.participantId) {
						player.allocated = 0;
						players.push(player);
						if (this.state.places[player.id] === 1) {
							firstPlace.push(player);
							player.balance = 0;
						} else if (this.state.places[player.id] === 2 && this.state.gameData.place_two_multiplier > 0) {
							player.balance = (this.state.gameData.stake * (this.state.gameData.place_two_multiplier - 1));
						} else if (this.state.places[player.id] === 3 && this.state.gameData.place_three_multiplier > 0) {
							player.balance = (this.state.gameData.stake * (this.state.gameData.place_three_multiplier - 1));
						} else {
							player.balance = (this.state.gameData.stake * -1);
						}
						pot -= player.balance;
					}
				});

				let winnerBalance = pot / firstPlace.length;
				firstPlace.forEach((player) => {
					player.balance = winnerBalance;
				});
				
				let toPay = [];
				players.sort((a,b) => a.balance - b.balance).forEach((player) => {
					if (player.balance < 0) {
						toPay.push(player);
					} else if (player.balance - player.allocated > 0) {
						while (player.balance - player.allocated > 0 && toPay.length > 0) {
							let payer = toPay.shift()
							payer.payee = player.id;
							player.allocated += this.state.gameData.stake;
						}
					}
				});

				content = (
					<Row gutter={16}>
						<Col sm={24} md={24}>
							<PlayerList
								players={players.sort((a,b) => this.state.places[a.id] - this.state.places[b.id])}
								places={this.state.places}
								delete={false}
								complete={false}
								add={false}
								place={true}
								setPlace={false}
								setBalance={true}
								onPayee={this.onPayee}
								onBalance={this.onBalance}
							/>
						</Col>
					</Row>
				);
			} else if (this.state.stage === "complete") {
				content = <Spin />;
			}
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
					customBack={this.stageBack}
					extra={[
						<Button
							key="continue"
							type="primary"
							icon={<StepForwardOutlined />}
							onClick={this.stageForward}
						>
							Continue
						</Button>,
					]}
				>
					<Steps current={currentStep}>{stepItems}</Steps>
					{content}
				</PageSurround>
			);
		}
	}
}

export default withRouter(CompleteGame);
