import React from "react";
import CurrencyFormat from "react-currency-format";
import { Alert, Menu } from "antd";
import RestApi from "../utils/RestApi";
import { DataTable, PageSurround, PlayerName } from "../components";

const titles = {
	games_played: "Games Played",
	score: "Score",
	games_won: "Games Won",
	times_placed: "Times Placed",
	win_rate: "Win Rate",
	place_rate: "Place Rate",
	net_winnings: "Net Winnings",
	gain_per_game: "Gain per Game",
	average_rating: "Avg Rating",
	average_placing: "Avg Placing",
};

class LeaderBoards extends React.Component {
	constructor(props) {
		super(props);
		this.createBoardData = this.createBoardData.bind(this);
		this.changeBoard = this.changeBoard.bind(this);
		this.state = {
			error: null,
			isLoaded: false,
			activeBoard: "score",
			stats: [],
			players: [],
			leaderData: [],
		};
	}

	componentDidMount() {
		new RestApi("/players/players/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve stats list."));
				}
				return res;
			},
			onParse: (players) => {
				new RestApi("/poker/stats/").retrieve({
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(
								new Error("Unable to retrieve stats list.")
							);
						}
						return res;
					},
					onParse: (stats) => {
						let boardData = this.createBoardData(stats, players, this.state.activeBoard);
						this.setState({
							isLoaded: true,
							stats: stats,
							players: players,
							leaderData: boardData,
						});
					},
					onError: (error) => {
						console.error(error);
						this.setState({
							isLoaded: true,
							error,
						});
					},
				});
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

	createBoardData(stats, players, board) {
		let boardData = [];
		stats.sort((a, b) => b[board] - a[board]);
		let i = 1;

		stats.forEach((item) => {
			let playerData;
			players.forEach((player) => {
				if (player.id === item.player_ref) {
					playerData = player;
				}
			});

			boardData.push({
				currency:
				board === "net_winnings" ||
				board === "gain_per_game"
						? true
						: false,
				percentage:
				board === "win_rate" ||
				board=== "place_rate"
						? true
						: false,
				rank: i,
				playerName: playerData.name,
				player: playerData,
				dataPoint: item[board],
			});
			i++;
		});
		return boardData;
	}

	changeBoard(item) {
		let boardData = this.createBoardData(this.state.stats, this.state.players, item.key);
		this.setState({
			leaderData: boardData,
			activeBoard: item.key,
		});
	}

	render() {
		const pageBreadcrumb = ["Leaderboards"];
		const title = "Leaderboards";

		if (this.state.error) {
			return <Alert type="error">{this.state.error.message}</Alert>;
		} else {
			let cols = [
				{
					title: "Rank",
					dataIndex: "rank",
					sorter: (a, b) => a.rank - b.rank,
					defaultSortOrder: "ascend",
				},
				{
					title: "Player",
					dataIndex: "playerName",
					render: (value, record) => (
						<PlayerName data={record.player}>{value}</PlayerName>
					),
				},
				{
					title: titles[this.state.activeBoard],
					dataIndex: "dataPoint",
					render: (val, record) => {
						if (record.currency) {
							return (
								<CurrencyFormat
									value={val / 100}
									displayType="text"
									prefix="£"
								/>
							);
						} else if (record.percentage) {
							return parseFloat(val).toFixed(2) + " %";
						}

						return val;
					},
				},
			];

			return (
				<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title}>
					<Menu
						selectedKeys={[this.state.activeBoard]}
						onClick={this.changeBoard}
						mode="horizontal"
					>
						<Menu.Item key="score">Score</Menu.Item>
						<Menu.Item key="games_played">Games Played</Menu.Item>
						<Menu.Item key="games_won">Games Won</Menu.Item>
						<Menu.Item key="times_placed">Times Placed</Menu.Item>
						<Menu.Item key="win_rate">Win Rate</Menu.Item>
						<Menu.Item key="place_rate">Place Rate</Menu.Item>
						<Menu.Item key="net_winnings">Net Winnings</Menu.Item>
						<Menu.Item key="gain_per_game">Gain per Game</Menu.Item>
						<Menu.Item key="average_rating">Avg Rating</Menu.Item>
						<Menu.Item key="average_placing">Avg Placing</Menu.Item>
					</Menu>
					<DataTable
						loading={!this.state.isLoaded}
						dataSource={this.state.leaderData}
						columns={cols}
						rowKey="rank"
						showSorterTooltip={false}
						bordered
					/>
				</PageSurround>
			);
		}
	}
}

export default LeaderBoards;
