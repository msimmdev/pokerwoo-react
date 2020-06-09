import React from "react";
import { Link } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import { Switch, Alert, Space, Button, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import PlayerName from "../../components/PlayerName";
import DataTable from "../../components/DataTable";
import DeleteButton from "../../components/DeleteButton";
import RestApi from "../../utils/RestApi";

class Players extends React.Component {
	constructor(props) {
		super(props);
		this.removePlayer = this.removePlayer.bind(this);
		this.state = {
			error: null,
			isLoaded: false,
			players: [],
		};
	}

	componentDidMount() {
		new RestApi("/players/players/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve player list."));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					players: result,
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

	removePlayer(res, id) {
		if (res.status !== 204) {
			return Promise.reject(new Error("Unable to delete player."));
		}
		let players = this.state.players;
		this.setState({
			players: players.filter((player) => player.id !== id),
		});
		message.success("Player has been deleted");
		return res;
	}

	render() {
		const { error, isLoaded, players } = this.state;
		const pageBreadcrumb = ["Players"];
		const title = "Players";
		const cols = [
			{
				title: "Player",
				dataIndex: "name",
				key: "name",
				sorter: (a, b) => a.name.localeCompare(b.name),
				defaultSortOrder: "ascend",
				searchable: "name",
				container: PlayerName,
			},
			{
				title: "PokerTH Name",
				dataIndex: "pokerth_name",
				key: "pokerth_name",
				sorter: (a, b) => {
					if (a.pokerth_name === null && b.pokerth_name === null) {
						return 0;
					} else if (a.pokerth_name === null) {
						return -1;
					} else if (b.pokerth_name === null) {
						return 1;
					}
					return a.pokerth_name.localeCompare(b.pokerth_name);
				},
				defaultSortOrder: "ascend",
				responsive: ["md"],
			},
			{
				dataIndex: "active",
				key: "active",
				render: (status, record) => (
					<ToggleStatus status={status} id={record.id} />
				),
				align: "center",
				responsive: ["md"],
			},
			{
				key: "edit",
				align: "center",
				render: (record) => (
					<Space>
						<Link to={"/players/edit/" + record.id}>
							<Button disabled={record.user} icon={<EditOutlined />}>
								Edit
							</Button>
						</Link>
						<DeleteButton
							disabled={record.user}
							id={record.id}
							resourse={"/players/players/" + record.id + "/"}
							onRes={this.removePlayer}
							confirmMessage="Are you sure you want to delete this player?"
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
						<Link key="addplayer" to="/players/add">
							<Button type="primary" icon={<PlusOutlined />}>Create Player</Button>
						</Link>,
					]}
				>
					<DataTable
						loading={!isLoaded}
						dataSource={players}
						columns={cols}
						rowKey="id"
						bordered
					/>
				</PageSurround>
			);
		}
	}
}

class ToggleStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: props.id,
			loading: false,
			checked: props.status,
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(checked) {
		this.setState({ loading: true });
		new RestApi("/players/players/" + this.state.id + "/").partialUpdate({
			data: {
				active: checked,
			},
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("There was a problem updating the player status.")
					);
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					loading: false,
					checked: result.active,
				});
			},
			onError: (error) => {
				this.setState({
					loading: false,
				});
				message.error(error.message);
			},
		});
	}

	render() {
		const { loading, checked } = this.state;
		return (
			<Switch
				checkedChildren="Enabled"
				unCheckedChildren="Disabled"
				checked={checked}
				loading={loading}
				onChange={this.handleChange}
			/>
		);
	}
}

export default Players;
