import React from "react";
import PageSurround from "../../components/PageSurround";
import GameForm from "../../components/GameForm";
import { message } from "antd";
import RestApi from "../../utils/RestApi";

class AddGame extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.changeTables = this.changeTables.bind(this);
		this.state = {
			designations: {},
			isSaving: false,
		};
	}

	onSubmit(values) {
		let gameData = {
			date_played: values.date_played.format("YYYY-MM-DD"),
			game_number: values.game_number,
			stake: values.stake * 100,
			place_two_multiplier: values.place_two_multiplier,
			place_three_multiplier: values.place_three_multiplier,
		};
		if (gameData.place_two_multiplier === "x") {
			gameData.place_two_multiplier = values.place_two_multiplier_custom;
		}
		if (gameData.place_three_multiplier === "x") {
			gameData.place_three_multiplier = values.place_three_multiplier_custom;
		}

		this.setState({ isSaving: true });
		new RestApi("/poker/games/")
			.create({
				data: gameData,
				onRes: (res) => {
					if (res.status !== 201) {
						return Promise.reject(new Error("Unable to create game"));
					}
					return res;
				},
				onParse: (result) => {
					let gameId = result.id;

					if (values.tables !== "1") {
						let addedPlayers = {};
						let gameParticipants = [];
						Object.keys(this.state.designations).forEach((level) => {
							this.state.designations[level].forEach((designation) => {
								if (values["participants_" + designation]) {
									values["participants_" + designation].forEach((element) => {
										if (!addedPlayers[element]) {
											gameParticipants.push(element);
											addedPlayers[element] = 1;
										}
									});
								}
							});
						});
						let addedPlayerRefs = {};
						let participantPromises = [];
						gameParticipants.forEach((element) => {
							participantPromises.push(
								new RestApi("/poker/games/" + gameId + "/participants/").create(
									{
										data: { player_ref: element },
										onRes: (res) => {
											if (res.status !== 201) {
												return Promise.reject(
													new Error("Unable to add participants to game")
												);
											}
											return res;
										},
										onParse: (result) => {
											let gameParticipantId = result.id;
											addedPlayerRefs[element] = gameParticipantId;
										},
										onError: (error) => {
											this.setState({
												isSaving: false,
											});
											message.error(error.message);
										},
									}
								)
							);
						});
						Promise.all(participantPromises);
						let tablePromises = [];
						Object.keys(this.state.designations).forEach((level) => {
							this.state.designations[level].forEach((designation) => {
								tablePromises.push(
									new RestApi("/poker/games/" + gameId + "/tables/").create({
										data: {
											designation: designation,
											progressing: values["progressing_" + designation],
											level: level,
										},
										onRes: (res) => {
											if (res.status !== 201) {
												return Promise.reject(
													new Error("Unable to create table")
												);
											}
											return res;
										},
										onParse: (result) => {
											let tableId = result.id;
											if (values["participants_" + designation]) {
												let tableParticipantPromises = [];
												values["participants_" + designation].forEach(
													(element) => {
														if (addedPlayerRefs[element]) {
															let gameParticipantId = addedPlayerRefs[element];
															tableParticipantPromises.push(
																new RestApi(
																	"/poker/games/" +
																		gameId +
																		"/tables/" +
																		tableId +
																		"/participants/"
																).create({
																	data: { game_participant: gameParticipantId },
																	onRes: (res) => {
																		if (res.status !== 201) {
																			return Promise.reject(
																				new Error(
																					"Unable to add participants to table"
																				)
																			);
																		}
																		return res;
																	},
																	onError: (error) => {
																		this.setState({
																			isSaving: false,
																		});
																		message.error(error.message);
																	},
																})
															);
														}
													}
												);
												Promise.all(tableParticipantPromises);
											}
										},
										onError: (error) => {
											this.setState({
												isSaving: false,
											});
											message.error(error.message);
										},
									})
								);
							});
						});
						Promise.all(tablePromises);
					} else {
						let tablePromise = new RestApi(
							"/poker/games/" + gameId + "/tables/"
						).create({
							data: { designation: "Final" },
							onRes: (res) => {
								if (res.status !== 201) {
									return Promise.reject(new Error("Unable to create table"));
								}
								return res;
							},
							onParse: (result) => {
								let tableId = result.id;
								let participantPromises = [];
								values.participants.forEach((element) => {
									participantPromises.push(
										new RestApi(
											"/poker/games/" + gameId + "/participants/"
										).create({
											data: { player_ref: element },
											onRes: (res) => {
												if (res.status !== 201) {
													return Promise.reject(
														new Error("Unable to add participants to game")
													);
												}
												return res;
											},
											onParse: (result) => {
												let gameParticipantId = result.id;
												let p = new RestApi(
													"/poker/games/" +
														gameId +
														"/tables/" +
														tableId +
														"/participants/"
												).create({
													data: { game_participant: gameParticipantId },
												});
												Promise.all([p]);
											},
											onError: (error) => {
												this.setState({
													isSaving: false,
												});
												message.error(error.message);
											},
										})
									);
								});
								Promise.all(participantPromises);
							},
							onError: (error) => {
								this.setState({
									isSaving: false,
								});
								message.error(error.message);
							},
						});
						Promise.all([tablePromise]);
					}
				},
				onError: (error) => {
					this.setState({
						isSaving: false,
					});
					message.error(error.message);
				},
			})
			.then(() => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/games");
				message.success("Game has been created");
			});
	}

	changeTables(value) {
		let levels = value.split("x");
		let designations = {};
		for (let i = 0; i < levels.length; i++) {
			let storeLevel = levels.length - i;
			designations[storeLevel] = designations[storeLevel] || [];
			let levelTables = parseInt(levels[i]);
			if (i + 1 === levels.length) {
				designations[i].push("Final");
			} else {
				for (let j = 0; j < levelTables; j++) {
					designations[storeLevel].push(
						i + 1 + "-" + String.fromCharCode(65 + j)
					);
				}
			}
		}
		this.setState({
			designations: designations,
		});
	}

	render() {
		let pageBreadcrumb = [{ name: "Games", link: "/games" }, "Add Game"];
		let title = "Add Game";

		return (
			<PageSurround
				pageBreadcrumb={pageBreadcrumb}
				pageTitle={title}
				history={this.props.history}
			>
				<GameForm
					formRef={this.formRef}
					onSubmit={this.onSubmit}
					isSaving={this.state.isSaving}
					changeTables={this.changeTables}
					designations={this.state.designations}
					full={true}
				/>
			</PageSurround>
		);
	}
}

export default AddGame;
