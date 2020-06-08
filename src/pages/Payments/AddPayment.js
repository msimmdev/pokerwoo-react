import React from "react";
import Moment from "react-moment";
import PageSurround from "../../components/PageSurround";
import { Form, Select, InputNumber, Button, message } from "antd";
import RestApi from "../../utils/RestApi";

const { Option } = Select;

class AddPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.state = {
			games: [],
			players: [],
			isSaving: false,
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
						this.setState({
							isLoaded: true,
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
	}

	onSubmit(values) {
		this.setState({ isSaving: true });
		values.payment_amount = values.payment_amount * 100;
		new RestApi("/players/payment_obligation/").create({
			data: values,
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(new Error("Unable to create payment request."));
				}
				return res;
			},
			onParse: () => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/payments");
				message.success("Payment request has been created");
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
			{ name: "Payments", link: "/payments" },
			"Create Payment Request",
		];
		let title = "Create Payment Request";

		return (
			<PageSurround
				pageBreadcrumb={pageBreadcrumb}
				pageTitle={title}
				history={this.props.history}
			>
				<Form
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					onFinish={this.onSubmit}
					ref={this.formRef}
				>
					<Form.Item
						name="payer"
						label="Payer"
						rules={[{ required: true, message: "You must select a player" }]}
					>
						<Select
							placeholder="Choose a player"
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.state.players.map((player) => (
								<Option key={player.id} value={player.id}>
									{player.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="payee"
						label="Payee"
						rules={[{ required: true, message: "You must select a player" }]}
					>
						<Select
							placeholder="Choose a player"
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.state.players.map((player) => (
								<Option key={player.id} value={player.id}>
									{player.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="game_ref"
						label="Game"
						rules={[{ required: true, message: "You must select a player" }]}
					>
						<Select
							placeholder="Choose a game"
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.state.games.map((game) => (
								<Option key={game.id} value={game.id}>
									<Moment format="DD/MM/YYYY">{game.date_played}</Moment>
									{" #" + game.game_number}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						label="Amount"
						name="payment_amount"
						rules={[
							{
								required: true,
								message: "You must provide an amount for the payment",
							},
						]}
					>
						<InputNumber
							min={1}
							formatter={(value) =>
								`£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
							}
							parser={(value) => value.replace(/£\s?|(,*)/g, "")}
						/>
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button
							type="primary"
							htmlType="submit"
							loading={this.props.isSaving}
						>
							Save
						</Button>
					</Form.Item>
				</Form>
			</PageSurround>
		);
	}
}

export default AddPlayer;
