import React from "react";

import {
	Row,
	Col,
	Table,
	Modal,
	Button,
	Form,
	Select,
	Switch,
	InputNumber,
} from "antd";
import { DeleteButton, PlayerName } from "./";

const { Option } = Select;

class PlayerList extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.state = {
			addVisible: false,
		};
	}

	render() {
		let cols = [];

		if (this.props.place) {
			cols.push({
				key: "place",
				align: "center",
				render: (record) =>
					this.props.places
						? this.props.places[record.id] === 0
							? "-"
							: record.place
						: record.place === 0
						? "-"
						: record.place,
			});
		}

		cols.push({
			title: "Player",
			dataIndex: "name",
			key: "name",
			render: (value, record) => (
				<PlayerName key={record.id} data={record}>
					{value}
				</PlayerName>
			),
		});

		if (this.props.success) {
			let completed = {};
			if (this.props.completedParticipants) {
				this.props.completedParticipants.forEach((participantId) => {
					completed[participantId] = true;
				});
			}
			cols.push({
				key: "success",
				align: "center",
				render: (record) => (
					<Switch
						key={record.id}
						id={record.id}
						checkedChildren="Progressed"
						unCheckedChildren="Eliminated"
						defaultChecked={completed[record.participantId] || record.success}
						onChange={(checked) => this.props.onSuccess(record, checked)}
					/>
				),
			});
		}

		if (this.props.setPlace) {
			cols.push({
				key: "setplace",
				align: "center",
				render: (record) => (
					<InputNumber
						key={record.id}
						onChange={(value) => this.props.onPlace(record, value)}
					/>
				),
			});
		}

		if (this.props.setBalance) {
			let payeeOptions = [];
			this.props.players.forEach((player) => {
				if (player.balance > 0) {
					payeeOptions.push(
						<Option key={player.id} value={player.id}>
							{player.name}
						</Option>
					);
				}
			});
			cols.push(
				{
					key: "setbalance",
					align: "center",
					render: (record) => (
						<InputNumber
							defaultValue={record.balance / 100}
							key={record.id}
							formatter={(value) =>
								`£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
							}
							parser={(value) => value.replace(/£\s?|(,*)/g, "")}
							onChange={(value) => this.props.onBalance(record, value)}
						/>
					),
				},
				{
					key: "setpayee",
					align: "center",
					render: (record) => {
						if (record.balance < 0) {
							return (
								<Select
									placeholder="Select a Player"
									onChange={(value) => this.props.onPayee(record, value)}
									defaultValue={record.payee}
									key={record.id}
								>
									{payeeOptions}
								</Select>
							);
						}
						return "";
					},
				}
			);
		}

		if (this.props.delete) {
			cols.push({
				key: "remove",
				align: "center",
				render: (record) => (
					<DeleteButton
						key={record.id}
						id={record.id}
						resourse={
							this.props.removeResourse + record[this.props.removeKey] + "/"
						}
						onRes={this.props.removePlayer}
						confirmMessage="Are you sure you want to remove this player?"
					>
						Remove
					</DeleteButton>
				),
			});
		}

		return (
			<div>
				<Row>
					<Col span={12}>
						<div className="ant-descriptions-title">{this.props.label}</div>
					</Col>
					{this.props.add && this.props.validExtraPlayers.length > 0 ? (
						<Col span={12}>
							<Button
								style={{ float: "right" }}
								onClick={() => this.setState({ addVisible: true })}
							>
								Add Player
							</Button>
							<Modal
								visible={this.state.addVisible}
								title="Add Player"
								okText="Add"
								cancelText="Cancel"
								onOk={() =>
									this.formRef.current
										.validateFields()
										.then((values) => this.props.addPlayer(values.player))
										.then(() => this.setState({ addVisible: false }))
										.then(() =>
											this.formRef.current.setFieldsValue({ player: null })
										)
								}
								onCancel={() => this.setState({ addVisible: false })}
							>
								<Form ref={this.formRef} layout="vertical" name="add_form">
									<Form.Item
										name="player"
										label="Player"
										rules={[
											{ required: true, message: "You must select a player" },
										]}
									>
										<Select
											placeholder="Choose a player"
											filterOption={(input, option) =>
												option.children
													.toLowerCase()
													.indexOf(input.toLowerCase()) >= 0
											}
										>
											{this.props.validExtraPlayers.map((player) => (
												<Option key={player.id} value={player.id}>
													{player.name}
												</Option>
											))}
										</Select>
									</Form.Item>
								</Form>
							</Modal>
						</Col>
					) : (
						""
					)}
				</Row>
				<Table
					showHeader={false}
					columns={cols}
					dataSource={this.props.players}
					pagination={false}
					bordered={true}
					rowKey="id"
				/>
			</div>
		);
	}
}

export default PlayerList;
