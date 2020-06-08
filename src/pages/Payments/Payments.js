import React from "react";
import { Link } from "react-router-dom";
import CurrencyFormat from "react-currency-format";
import Moment from "react-moment";
import queryString from "query-string";
import PageSurround from "../../components/PageSurround";
import { Alert, Tag, Button, Popconfirm, message } from "antd";
import { PoundOutlined, PlusOutlined } from "@ant-design/icons";
import PlayerName from "../../components/PlayerName";
import DataTable from "../../components/DataTable";
import RestApi from "../../utils/RestApi";

class Payments extends React.Component {
	constructor(props) {
		super(props);
		this.markPaid = this.markPaid.bind(this);
		this.state = {
			error: null,
			isLoaded: false,
			payments: [],
			games: [],
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
			onParse: (players) => {
				new RestApi(
					"/players/payment_obligation/" + this.props.location.search
				).retrieve({
					onRes: (res) => {
						if (res.status !== 200) {
							return Promise.reject(
								new Error("Unable to retrieve payment list.")
							);
						}
						return res;
					},
					onParse: (payResult) => {
						new RestApi("/poker/games/").retrieve({
							onRes: (res) => {
								if (res.status !== 200) {
									return Promise.reject(
										new Error("Unable to retrieve player list.")
									);
								}
								return res;
							},
							onParse: (games) => {
								payResult.forEach((payment) => {
									players.forEach((player) => {
										if (payment.payee === player.id) {
											payment.payeeDetail = player;
											payment.payeeName = player.name;
										}
										if (payment.payer === player.id) {
											payment.payerDetail = player;
											payment.payerName = player.name;
										}
									});
								});
								this.setState({
									isLoaded: true,
									payments: payResult,
									games: games,
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
			},
			onError: (error) => {
				this.setState({
					isLoaded: true,
					error,
				});
			},
		});
	}

	markPaid(id, status) {
		let updateData = {};
		if (status === "paid") {
			updateData.payment_confirmed = true;
			updateData.payment_sent = false;
		} else if (status === "sent") {
			updateData.payment_sent = true;
			updateData.payment_confirmed = false;
		}
		new RestApi("/players/payment_obligation/" + id + "/").partialUpdate({
			data: updateData,
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("There was a problem updating the payment")
					);
				}
				return res;
			},
			onParse: (result) => {
				this.setState((state) => {
					let newPayments = [];
					state.payments.forEach((payment) => {
						if (payment.id === id) {
							result.payeeDetail = payment.payeeDetail;
							result.payeeName = payment.payeeName;
							result.payerDetail = payment.payerDetail;
							result.payerName = payment.payerName;
							newPayments.push(result);
						} else {
							newPayments.push(payment);
						}
					});
					return { payments: newPayments };
				});
				message.success("Payment has been updated");
			},
			onError: (error) => {
				message.error(error.message);
			},
		});
	}

	render() {
		const pageBreadcrumb = ["Payments"];
		const title = "Payments";
		let playerFilter = this.state.players.map((item) => ({
			text: item.name,
			value: item.id + "",
		}));
		let defaultPayee = [];
		let defaultPayer = [];
		if (queryString.parse(this.props.location.search).mine === "payee") {
			defaultPayee.push(this.props.profileData.id + "");
		} else if (queryString.parse(this.props.location.search).mine === "payer") {
			defaultPayer.push(this.props.profileData.id + "");
		}
		const cols = [
			{
				title: "ID",
				dataIndex: "id",
				key: "id",
				sorter: (a, b) => a.id - b.id,
				defaultSortOrder: "descend",
			},
			{
				title: "Payer",
				dataIndex: "payerName",
				key: "payer",
				sorter: (a, b) => a.payerName.localeCompare(b.payerName),
				filters: playerFilter,
				onFilter: (value, record) => record.payer === parseInt(value),
				render: (value, record) => (
					<PlayerName data={record.payerDetail}>{value}</PlayerName>
				),
				defaultFilteredValue: defaultPayer,
			},
			{
				title: "Payee",
				dataIndex: "payeeName",
				key: "payee",
				sorter: (a, b) => a.payeeName.localeCompare(b.payeeName),
				filters: playerFilter,
				onFilter: (value, record) => record.payee === parseInt(value),
				render: (value, record) => (
					<PlayerName data={record.payeeDetail}>{value}</PlayerName>
				),
				defaultFilteredValue: defaultPayee,
			},
			{
				title: "Game",
				dataIndex: "game_ref",
				key: "game_ref",
				render: (gameId) => {
					let gList = this.state.games.filter((item) => item.id === gameId);
					let game = gList[0];
					return (
						<Link to={"/games/detail/" + game.id}>
							<Moment format="DD/MM/YYYY">{game.date_played}</Moment>
							{" #" + game.game_number}
						</Link>
					);
				},
			},
			{
				title: "Amount",
				key: "payment_amount",
				dataIndex: "payment_amount",
				align: "center",
				render: (val) => (
					<CurrencyFormat value={val / 100} displayType="text" prefix="£" />
				),
			},
			{
				title: "Status",
				key: "status",
				render: (record) =>
					record.payment_confirmed ? (
						<Tag color="success">Paid</Tag>
					) : record.payment_sent ? (
						<Tag color="warning">Sent</Tag>
					) : (
						<Tag color="error">Pending</Tag>
					),
				align: "center",
				filters: [
					{ text: "Paid", value: "paid" },
					{ text: "Sent", value: "sent" },
					{ text: "Pending", value: "pending" },
				],
				onFilter: (value, record) =>
					value === "paid"
						? record.payment_confirmed
						: value === "sent"
						? record.payment_sent
						: !record.payment_confirmed && !record.payment_sent,
				defaultFilteredValue: ["pending", "sent"],
			},
			{
				key: "edit",
				align: "center",
				render: (record) => {
					if (
						record.payee === this.props.profileData.id &&
						!record.payment_confirmed
					) {
						return (
							<Popconfirm
								placement="top"
								title="Are you sure you want to confirm receipt of this payment?"
								onConfirm={() => this.markPaid(record.id, "paid")}
								okText="Yes"
								cancelText="No"
							>
								<Button icon={<PoundOutlined />}>Confirm Payment</Button>
							</Popconfirm>
						);
					} else if (
						record.payer === this.props.profileData.id &&
						!record.payment_sent &&
						!record.payment_confirmed
					) {
						return (
							<Popconfirm
								placement="top"
								title="Are you sure you want to mark this payment as payment sent?"
								onConfirm={() => this.markPaid(record.id, "sent")}
								okText="Yes"
								cancelText="No"
							>
								<Button icon={<PoundOutlined />}>Payment Sent</Button>
							</Popconfirm>
						);
					}
					return "";
				},
			},
		];
		if (this.state.error) {
			return (
				<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title}>
					<Alert type="error" message={this.state.error.message} />
				</PageSurround>
			);
		} else {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					extra={[
						<Link key="addpayment" to="/payments/add">
							<Button icon={<PlusOutlined />}>Create Payment Request</Button>
						</Link>,
					]}
				>
					<DataTable
						loading={!this.state.isLoaded}
						dataSource={this.state.payments}
						columns={cols}
						rowKey="id"
						bordered
					/>
				</PageSurround>
			);
		}
	}
}

export default Payments;
