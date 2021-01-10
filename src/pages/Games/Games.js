import React from "react";
import { Link } from "react-router-dom";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Space, Button, Popover, Tag, Spin, message } from "antd";
import {
	PageSurround,
	DataTable,
	DeleteButton,
	PlayerName,
	CompetitionList,
} from "../../components";
import RestApi from "../../utils/RestApi";
import CurrencyFormat from "react-currency-format";
import Moment from "react-moment";

class Games extends React.Component {
	constructor(props) {
		super(props);
		this.removeGame = this.removeGame.bind(this);
		this.state = {
			error: null,
			isLoaded: false,
			compLoaded: false,
			games: [],
			competitions: [],
		};
	}

	componentDidMount() {
		new RestApi("/poker/games/" + this.props.history.location.search).retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game list."));
				}
				return res;
			},
			onParse: (gameRes) => {
				this.setState({
					isLoaded: true,
					games: gameRes.reverse(),
				});
			},
			onError: (error) => {
				this.setState({
					isLoaded: true,
					error,
				});
			},
		});

		new RestApi("/poker/competitions/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve competition list."));
				}
				return res;
			},
			onParse: (compRes) => {
				this.setState({
					compLoaded: true,
					competitions: compRes,
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

	removeGame(res, id) {
		if (res.status !== 204) {
			return Promise.reject(new Error("Unable to delete game."));
		}
		let games = this.state.games;
		this.setState({
			games: games.filter((game) => game.id !== id),
		});
		message.success("Game has been deleted");
		return res;
	}

	render() {
		const { error, isLoaded, compLoaded, games } = this.state;
		const pageBreadcrumb = ["Games"];
		const title = "Games";
		const cols = [
			{
				title: "ID",
				dataIndex: "id",
				align: "center",
			},
			{
				title: "Date",
				dataIndex: "date_played",
				align: "center",
				render: (val) => <Moment format="DD/MM/YYYY">{val}</Moment>,
				sorter: (a, b) => {
					return a.date_played.localeCompare(b.date_played);
				},
				defaultSortOrder: "descend",
			},
			{
				title: "No.",
				dataIndex: "game_number",
				align: "center",
				sorter: (a, b) => a.game_number - b.game_number,
			},
			{
				title: "Stake",
				dataIndex: "stake",
				align: "center",
				responsive: ["md"],
				render: (val) => (
					<CurrencyFormat value={val / 100} displayType="text" prefix="£" />
				),
			},
			{
				title: "Players",
				key: "participants",
				align: "center",
				responsive: ["md"],
				render: (record) => (
					<Popover
						placement="top"
						content={
							<GameParticipantList
								gameid={this.gameid}
								participants={record.participants}
							/>
						}
					>
						{record.participants.length} <InfoCircleOutlined />
					</Popover>
				),
			},
			{
				title: "Tables",
				key: "tables",
				align: "center",
				responsive: ["md"],
				render: (record) => record.tables.length,
			},
			{
				title: "Status",
				key: "status",
				align: "center",
				responsive: ["md"],
				render: (record) =>
					record.complete ? (
						<Tag color="success">Complete</Tag>
					) : (
						<Tag color="warning">Incomplete</Tag>
					),
			},
			{
				title: "Competitions",
				align: "center",
				responsive: ["md"],
				render: (record) =>
					record.competitions.length > 0 ? (
						<CompetitionList
							competitionParticipants={record.competitions}
							competitions={this.state.competitions}
						/>
					) : (
						""
					),
			},
			{
				key: "edit",
				align: "center",
				render: (record) => (
					<Space>
						<Link to={"/games/detail/" + record.id}>
							<Button>View</Button>
						</Link>
						<DeleteButton
							id={record.id}
							resourse={"/poker/games/" + record.id + "/"}
							onRes={this.removeGame}
							confirmMessage="Are you sure you want to delete this game?"
						/>
					</Space>
				),
			},
		];

		if (error) {
			return (
				<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title}>
					<Alert type="error" message={error.message} />
				</PageSurround>
			);
		} else {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					extra={[
						<Link to="/games/add" key="addlink">
							<Button type="primary" icon={<PlusOutlined />}>
								Create Game
							</Button>
						</Link>,
					]}
				>
					<DataTable
						loading={!isLoaded || !compLoaded}
						dataSource={games}
						columns={cols}
						rowKey="id"
						bordered
					/>
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
		if (this.state.isLoaded) {
			let displayList = [];
			this.state.detailedParticipants.forEach((player) => {
				displayList.push(
					<PlayerName key={player.id} data={player}>
						{player.name}
					</PlayerName>
				);
			});
			return <Space direction="vertical">{displayList}</Space>;
		} else {
			return <Spin />;
		}
	}
}

export default Games;
