import React from "react";
import { Link } from "react-router-dom";
import { Alert, Space, Button, Popover, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import PageSurround from "../../components/PageSurround";
import DataTable from "../../components/DataTable";
import DeleteButton from "../../components/DeleteButton";
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
			games: [],
		};
	}

	componentDidMount() {
		new RestApi("/poker/games/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve game list."));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					games: result,
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

	removeGame(res, id) {
		if (res.status !== 204) {
			return Promise.reject(new Error("Unable to delete game."));
		}
		let games = this.state.games;
		this.setState({
			games: games.filter((game) => game.id !== id),
		});
		message.success("Player has been deleted");
		return res;
	}

	render() {
		const { error, isLoaded, games } = this.state;
		const pageBreadcrumb = ["Games"];
		const title = "Games";
		const cols = [
			{
				title: "ID",
				dataIndex: "id",
			},
			{
				title: "Date",
				dataIndex: "date_played",
				render: (val) => <Moment format="DD/MM/YYYY">{val}</Moment>,
			},
			{
				title: "Number",
				dataIndex: "game_number",
			},
			{
				title: "Stake",
				dataIndex: "stake",
				render: (val) => (
					<CurrencyFormat
						value={val / 100}
						displayType="text"
						prefix="£"
					/>
				),
			},
			{
				title: "Players",
				key: "participants",
				render: (record) => <GameParticipantCount gameid={record.id} />,
			},
			{
				key: "edit",
				align: "center",
				render: (record) => (
					<Space>
						<Link to={"/games/edit/" + record.id}>
							<Button disabled={record.user} icon={<EditOutlined />}>
								Edit
							</Button>
						</Link>
						<DeleteButton
							disabled={record.user}
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
				<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title}>
					<Space direction="vertical">
						<Link to="/games/add">
							<Button>Add Game</Button>
						</Link>
						<DataTable
							loading={!isLoaded}
							dataSource={games}
							columns={cols}
							rowKey="id"
							bordered
						/>
					</Space>
				</PageSurround>
			);
		}
	}
}

class GameParticipantCount extends React.Component {
	constructor(props) {
		super(props);
		this.gameid = props.gameid;
		this.state = {
			error: null,
			isLoaded: false,
			participants: [],
		};
	}

	componentDidMount() {
		new RestApi("/poker/games/" + this.gameid + "/participants/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("Unable to retrieve participant list.")
					);
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					participants: result,
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
		return (
			<Popover
                content={
					<GameParticipantList
						gameid={this.gameid}
						participants={this.state.participants}
					/>
				}
			>
				{this.state.participants.length}
			</Popover>
		);
	}
}

class GameParticipantList extends React.Component  {
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
        if (!this.state.participants.length) {
            new RestApi("/poker/games/" + this.gameid + "/participants/").retrieve({
                onRes: (res) => {
                    if (res.status !== 200) {
                        return Promise.reject(
                            new Error("Unable to retrieve participant list.")
                        );
                    }
                    return res;
                },
                onParse: (result) => {
                    this.setState({
                        participants: result,
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

        if (!this.state.error) {
            this.state.participants.forEach(element => {
                new RestApi("/players/players/" + element.player_ref + "/").retrieve({
                    onRes: (res) => {
                        if (res.status !== 200) {
                            return Promise.reject(
                                new Error("Unable to retrieve participant list.")
                            );
                        }
                        return res;
                    },
                    onParse: (result) => {
                        this.setState({
                            detailedParticipants: this.state.detailedParticipants.push(...element, ...result)
                        });
                    },
                    onError: (error) => {
                        this.setState({
                            isLoaded: true,
                            error,
                        });
                    },
                });
            });
        }
    }
    
    render() {
        return '1';
    }
}

export default Games;
