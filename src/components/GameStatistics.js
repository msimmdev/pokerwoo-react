import React from "react";
import { Link } from "react-router-dom";
import {
	Alert,
	Spin,
	Empty,
	Card,
	Row,
	Col,
	Statistic,
	Button,
	Space,
	Select,
} from "antd";
import { FundViewOutlined } from "@ant-design/icons";
import RestApi from "../utils/RestApi";
import { Award } from "./";

const { Option } = Select;

class GameStatistics extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			empty: false,
			stats: {},
			competitions: [],
			activeCompetition: null,
		};
		this.changeCompetition = this.changeCompetition.bind(this);
	}

	componentDidMount() {
		new RestApi("/poker/competitions/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("Unable to retrieve competition list.")
					);
				}
				return res;
			},
			onParse: (compRes) => {
				let activeComp = compRes
					.filter((a) => a.active)
					.sort((a, b) => a.order - b.order)[0];
				new RestApi(
					"/poker/stats/?player_ref=" +
						this.props.profileData.id +
						"&competition=" +
						activeComp.id
				).retrieve({
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(
								new Error("Unable to retrieve stats list.")
							);
						}
						return res;
					},
					onParse: (result) => {
						if (result.length > 0) {
							this.setState({
								isLoaded: true,
								stats: result[0],
								competitions: compRes,
								activeCompetition: activeComp,
							});
						} else {
							this.setState({
								isLoaded: true,
								empty: true,
								competitions: compRes,
								activeCompetition: activeComp,
							});
						}
					},
					onError: (error) => {
						this.setState({
							isLoaded: true,
							error,
						});
					},
				});
			},
			onError: (error) => {
				this.setState({
					compLoaded: true,
					error,
				});
			},
		});
	}

	changeCompetition(competitionId) {
		let comp = this.state.competitions.filter((a) => a.id === competitionId)[0];
		this.setState({
			isLoaded: false,
			activeCompetition: comp,
		});
		new RestApi(
			"/poker/stats/?player_ref=" +
				this.props.profileData.id +
				"&competition=" +
				competitionId
		).retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve stats list."));
				}
				return res;
			},
			onParse: (result) => {
				if (result.length > 0) {
					this.setState({
						isLoaded: true,
						stats: result[0],
						empty: false,
					});
				} else {
					this.setState({
						isLoaded: true,
						stats: null,
						empty: true,
					});
				}
			},
			onError: (error) => {
				console.error(error);
				this.setState({
					isLoaded: true,
					error,
				});
			},
		});
	}

	render() {
		if (this.state.error) {
			return <Alert type="error">{this.state.error.message}</Alert>;
		} else if (!this.state.isLoaded) {
			return <Spin />;
		} else {
			let awardList = [];
			if (this.props.profileData.awards.length > 0) {
				this.props.profileData.awards
					.sort((a, b) => new Date(b.granted) - new Date(a.granted))
					.forEach((award) => {
						awardList.push(
							<Award size="large" data={award} key={award.award_key} />
						);
					});
			}

			let select = "";
			if (this.state.competitions.length > 1) {
				let optionList = [];
				this.state.competitions.forEach((comp) => {
					optionList.push(
						<Option key={comp.id} value={comp.id}>
							{comp.name}
						</Option>
					);
				});
				select = (
					<Select
						key="compSelect"
						defaultValue={this.state.activeCompetition.id}
						onChange={this.changeCompetition}
					>
						{optionList}
					</Select>
				);
			}

			return (
				<Card
					title="Game Statistics"
					extra={[
						select,
						<Link key="leaderboard" to="/leaderboards">
							<Button icon={<FundViewOutlined />}>View Leaderboards</Button>
						</Link>,
					]}
				>
					{this.state.empty ? (
						<Empty />
					) : (
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Statistic
									title="Games Played"
									value={this.state.stats.games_played}
								/>
							</Col>
							<Col span={12}>
								<Statistic title="Score" value={this.state.stats.new_score} />
							</Col>
							<Col span={12}>
								<Statistic
									title="Games Won"
									value={this.state.stats.games_won}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Times Placed"
									value={this.state.stats.times_placed}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Win Rate"
									suffix="%"
									precision={2}
									value={this.state.stats.win_rate * 100}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Place Rate"
									suffix="%"
									precision={2}
									value={this.state.stats.place_rate * 100}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Net Winnings"
									prefix="£"
									precision={2}
									value={this.state.stats.net_winnings / 100}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Gain per Game"
									prefix="£"
									precision={2}
									value={this.state.stats.gain_per_game / 100}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Avg Rating"
									value={this.state.stats.average_rating}
									precision={2}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Avg. Placing"
									value={this.state.stats.average_placing}
									precision={2}
								/>
							</Col>
						</Row>
					)}
					{awardList.length > 0 ? (
						<Row>
							<Space>{awardList}</Space>
						</Row>
					) : (
						""
					)}
				</Card>
			);
		}
	}
}

export default GameStatistics;
