import React from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import momentRaw from "moment";
import { Alert, Button, Space, Popover, message } from "antd";
import {
	EditOutlined,
	PlusOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import {
	PageSurround,
	PlayerName,
	DataTable,
	DeleteButton,
} from "../../components";
import RestApi from "../../utils/RestApi";

class Schedule extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			sessions: [],
			players: [],
		};
	}

	componentDidMount() {
		new RestApi("/schedule/sessions/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve schedule list."));
				}
				return res;
			},
			onParse: (sessions) => {
				new RestApi("/players/players/").retrieve({
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(
								new Error("Unable to retrieve player list.")
							);
						}
						return res;
					},
					onParse: (players) => {
						this.setState({
							isLoaded: true,
							sessions: sessions,
							players: players,
						});
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
					isLoaded: true,
					error,
				});
			},
		});
	}

	removeSchedule(res, id) {
		if (res.status !== 204) {
			return Promise.reject(new Error("Unable to delete sessions."));
		}
		let sessions = this.state.sessions;
		this.setState({
			sessions: sessions.filter((session) => session.id !== id),
		});
		message.success("Session has been deleted");
		return res;
	}

	render() {
		const pageBreadcrumb = ["Schedule"];
		const title = "Schedule";
		let playerFilter = this.state.players.map((item) => ({
			text: item.name,
			value: item.id + "",
		}));

		let sessions = this.state.sessions;
		sessions.forEach((session) => {
			this.state.players.forEach((player) => {
				session.players.forEach((sPlayer) => {
					if (sPlayer.player_ref === player.id) {
						sPlayer.playerDetail = player;
					}
				});
				if (session.createdby_player === player.id) {
					session.createdbyName = player.name;
					session.createdbyDetail = player;
				}
			});
		});

		const cols = [
			{
				title: "Suggested By",
				dataIndex: "createdbyName",
				key: "createdbyName",
				sorter: (a, b) => a.createdbyName.localeCompare(b.createdbyName),
				filters: playerFilter,
				onFilter: (value, record) =>
					record.createdby_player === parseInt(value),
				render: (value, record) => (
					<PlayerName data={record.createdbyDetail}>{value}</PlayerName>
				),
			},
			{
				title: "Date / Time",
				key: "schedule_date",
				dataIndex: "schedule_date",
				align: "center",
				sorter: (a, b) => new momentRaw(a.date).format('YYYYMMDD').localeCompare(new momentRaw(b.date).format('YYYYMMDD')),
				defaultSortOrder: "descend",
				render: (val) => <Moment format="DD/MM/YYYY hh:mm">{val}</Moment>,
			},
			{
				title: "Confirmed",
				key: "confirmed",
				align: "center",
				render: (record) => (
					<Popover
						placement="top"
						content={
							<Space direction="vertical">
								{record.players
									.filter((item) => item.attendance)
									.map((pItem) => (
										<PlayerName key={pItem.id} data={pItem.playerDetail}>
											{pItem.playerDetail.name}
										</PlayerName>
									))}
							</Space>
						}
					>
						{record.players.filter((item) => item.attendance).length}{" "}
						<InfoCircleOutlined />
					</Popover>
				),
			},
			{
				title: "Declined",
				key: "declined",
				align: "center",
				render: (record) => (
					<Popover
						placement="top"
						content={
							<Space direction="vertical">
								{record.players
									.filter((item) => !item.attendance)
									.map((pItem) => (
										<PlayerName key={pItem.id} data={pItem.playerDetail}>
											{pItem.playerDetail.name}
										</PlayerName>
									))}
							</Space>
						}
					>
						{record.players.filter((item) => !item.attendance).length}{" "}
						<InfoCircleOutlined />
					</Popover>
				),
			},
			{
				key: "edit",
				align: "center",
				render: (record) => (
					<Space>
						<Link to={"/schedule/edit/" + record.id}>
							<Button disabled={record.user} icon={<EditOutlined />}>
								Edit
							</Button>
						</Link>
						<DeleteButton
							id={record.id}
							resourse={"/schedule/sessions/" + record.id + "/"}
							onRes={this.removeSchedule}
							confirmMessage="Are you sure you want to delete this scheduled session?"
						/>
					</Space>
				),
			},
		];
		if (this.state.error) {
			return (
				<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title}>
					<Alert type="error" message={this.state.error.message} />
				</PageSurround>
			);
		} else {
			console.log(sessions);
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					extra={[
						<Link key="addschedule" to="/schedule/add">
							<Button type="primary" icon={<PlusOutlined />}>
								Schedule Session
							</Button>
						</Link>,
					]}
				>
					<DataTable
						loading={!this.state.isLoaded}
						dataSource={sessions}
						columns={cols}
						rowKey="id"
						bordered
					/>
				</PageSurround>
			);
		}
	}
}

export default Schedule;
