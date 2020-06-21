import React from "react";
import { Link } from "react-router-dom";
import { Alert, Spin, Empty, Card, Row, Col, Statistic, Button } from "antd";
import { FundViewOutlined } from "@ant-design/icons";
import RestApi from "../utils/RestApi";

class GameStatistics extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			empty: false,
			stats: {},
		};
	}

	componentDidMount() {
		new RestApi(
			"/poker/stats/?player_ref=" + this.props.profileData.id
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
					});
				} else {
					this.setState({
						isLoaded: true,
						empty: true,
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
	}

	render() {
		if (this.state.error) {
			return <Alert type="error">{this.state.error.message}</Alert>;
		} else if (!this.state.isLoaded) {
			return <Spin />;
		} else {
			return (
				<Card
					title="Game Statistics"
					extra={[
						<Link key="leaderboard" to="/leaderboards">
							<Button icon={<FundViewOutlined />}>View Leaderboards</Button>
						</Link>,
					]}
				>
					this.state.empty ? <Empty /> :(
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<Statistic
								title="Games Played"
								value={this.state.stats.games_played}
							/>
						</Col>
						<Col span={12}>
							<Statistic title="Score" value={this.state.stats.score} />
						</Col>
						<Col span={12}>
							<Statistic title="Games Won" value={this.state.stats.games_won} />
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
					)
				</Card>
			);
		}
	}
}

export default GameStatistics;
