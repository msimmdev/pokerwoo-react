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
		this.state = {
			isSaving: false,
		};
	}

	onSubmit(values) {
        console.log(values);
        let gameData = {
            date_played: values.date_played.format('YYYY-MM-DD'),
            game_number: values.game_number,
            stake: values.stake * 100,
            place_two_multiplier: values.place_two_multiplier,
            place_three_multiplier: values.place_three_multiplier,
        };
        if (gameData.place_two_multiplier === 'x') {
            gameData.place_two_multiplier = values.place_two_multiplier_custom;
        }
        if (gameData.place_three_multiplier === 'x') {
            gameData.place_three_multiplier = values.place_three_multiplier_custom;
        }
        console.log(gameData);

		this.setState({ isSaving: true });
		new RestApi('/poker/games/').create({
			data: gameData,
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(new Error('Unable to create game'));
				}
				return res;
			},
			onParse: (result) => {
                let gameId = result.id;
                let gameUrl= result.url;

                if (values.tables > 1) {
                    for(let i = 0; i < values.tables; i++) {
                        let designation = String.fromCharCode(65 + i);
                        new RestApi('/poker/games/' + gameId + '/tables/').create({
                            data: { designation: designation , game: gameUrl },
                            onRes: (res) => {
                                if (res.status !== 201) {
                                    return Promise.reject(new Error('Unable to create table'));
                                }
                                return res;
                            },
                            onError: (error) => {
                                this.setState({
                                    isSaving: false,
                                });
                                message.error(error.message);
                            }
                        });
                    }
                } else {
                    new RestApi('/poker/games/' + gameId + '/tables/').create({
                        data: { designation: 'A' , game: gameUrl },
                        onRes: (res) => {
                            if (res.status !== 201) {
                                return Promise.reject(new Error('Unable to create table'));
                            }
                            return res;
                        },
                        onParse: (result) => {
                            let tableId = result.id;
                            let tableUrl = result.url;
                            values.participants.forEach(element => {
                                new RestApi('/poker/games/' + gameId + '/tables/' + tableId).create({
                                    data: { player_ref: element, table: tableUrl},
                                    onRes: (res) => {
                                        if (res.status !== 201) {
                                            return Promise.reject(new Error('Unable to add participants to game'));
                                        }
                                        return res;
                                    },
                                    onError: (error) => {
                                        this.setState({
                                            isSaving: false,
                                        });
                                        message.error(error.message);
                                    }
                                });
                            });
                        },
                        onError: (error) => {
                            this.setState({
                                isSaving: false,
                            });
                            message.error(error.message);
                        }
                    });
                }
                values.participants.forEach(element => {
                    new RestApi('/poker/games/' + gameId + '/participants/').create({
                        data: { player_ref: element, game: gameurl},
                        onRes: (res) => {
                            if (res.status !== 201) {
                                return Promise.reject(new Error('Unable to add participants to game'));
                            }
                            return res;
                        },
                        onError: (error) => {
                            this.setState({
                                isSaving: false,
                            });
                            message.error(error.message);
                        }
                    });
                });
				//this.setState({
				//	isSaving: false,
				//});
				//this.props.history.push("/games");
				//message.success("Game has been created");
			},
			onError: (error) => {
				this.setState({
					isSaving: false,
				});
				message.error(error.message);
			},
        });
	}

	render() {
		let pageBreadcrumb = [{ name: "Games", link: "/games" }, "Add Game"];
		let title = "Add Game";

		return (
			<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title} history={this.props.history}>
				<GameForm
					formRef={this.formRef}
					onSubmit={this.onSubmit}
					isSaving={this.state.isSaving}
				/>
			</PageSurround>
		);
	}
}

export default AddGame;
