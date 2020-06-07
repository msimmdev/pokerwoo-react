import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import GameForm from "../../components/GameForm";
import { message, Spin, Alert } from "antd";
import RestApi from "../../utils/RestApi";
import moment from "moment";

class EditGame extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.id = props.match.params.gameid;
		this.state = {
			isLoaded: false,
			gameData: {},
			isSaving: false,
		};
	}

	componentDidMount() {
		new RestApi("/poker/games/" + this.id + "/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game."));
				}
				return res;
			},
			onParse: (result) => {
				result.date_played = moment(result.date_played);
				result.place_two_multiplier = parseInt(result.place_two_multiplier);
				result.place_three_multiplier = parseInt(result.place_three_multiplier);
				result.place_three_multiplier_custom = parseInt(
					result.place_three_multiplier
				);
				result.place_two_multiplier_custom = parseInt(
					result.place_two_multiplier
				);
				result.stake = result.stake / 100;
				if (
					result.place_three_multiplier !== 0 &&
					result.place_three_multiplier !== 1 &&
					result.place_three_multiplier !== 2
				) {
					result.place_three_multiplier = "x";
				}
				if (
					result.place_two_multiplier !== 0 &&
					result.place_two_multiplier !== 1 &&
					result.place_two_multiplier !== 2
				) {
					result.place_two_multiplier = "x";
				}
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

	onSubmit(values) {
		this.setState({ isSaving: true });
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
		new RestApi("/poker/games/" + this.id + "/").update({
			data: gameData,
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to update game."));
				}
				return res;
			},
			onParse: () => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/games/detail/" + this.id);
				message.success("Game has been updated");
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
		let pageBreadcrumb = [
			{ name: "Games", link: "/games" },
			{ name: "Game Detail", link: "/games/detail/" + this.id },
			"Edit Game",
		];
		let title = "Edit Game";

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
					<Alert type='error' message={this.state.error.message} />
				</PageSurround>
			);
        } else {
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
						initialValues={this.state.gameData}
					/>
				</PageSurround>
			);
		}
	}
}

export default withRouter(EditGame);
