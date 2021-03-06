import React from "react";
import {
	Form,
	InputNumber,
	Button,
	DatePicker,
	Select,
	Alert,
	Spin,
	Divider,
	Row,
	Col,
} from "antd";
import moment from "moment";
import RestApi from "../utils/RestApi";
const { Option } = Select;

class GameForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			compLoaded: false,
			players: [],
			competitions: [],
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

		new RestApi("/poker/competitions/").retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(
						new Error("Unable to retrieve competition list.")
					);
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					compLoaded: true,
					competitions: result,
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

	render() {
		if (this.state.error) {
			return <Alert type="error" message={this.state.error.message} />;
		} else if (!this.state.isLoaded || !this.state.compLoaded) {
			return <Spin />;
		} else {
			return (
				<Form
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					onFinish={this.props.onSubmit}
					onFinishFailed={this.props.onFail}
					initialValues={
						this.props.initialValues
							? this.props.initialValues
							: {
									date_played: moment(),
									game_number: 1,
									stake: 5,
									place_two_multiplier: 0,
									place_three_multiplier: 0,
									tables: "1",
									place_two_multiplier_custom: 3,
									place_three_multiplier_custom: 3,
									competition: [
										this.state.competitions
											.filter((comp) => comp.active)
											.sort((a, b) => a.order - b.order)[0].id,
									],
							  }
					}
					ref={this.props.formRef}
				>
					<Form.Item
						label="Competition"
						name="competition"
						rules={[
							{
								required: true,
								message: "You must provide at least one competition",
							},
						]}
					>
						<Select
							mode="multiple"
							placeholder="Select a competition"
							filterOption={(input, option) =>
								option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
							}
						>
							{this.state.competitions
								.sort((a, b) => a.order - b.order)
								.map((comp) => {
									if (comp.active) {
										return (
											<Option key={comp.id} value={comp.id}>
												{comp.name}
											</Option>
										);
									}
									return "";
								})}
						</Select>
					</Form.Item>
					<Form.Item
						label="Game Date"
						name="date_played"
						rules={[
							{
								required: true,
								message: "You must provide a date for the game",
							},
						]}
					>
						<DatePicker />
					</Form.Item>
					<Form.Item
						label="Game Number"
						name="game_number"
						rules={[
							{
								required: true,
								message: "You must provide a number for the game",
							},
						]}
					>
						<InputNumber min={1} />
					</Form.Item>
					<Form.Item
						label="Stake"
						name="stake"
						rules={[
							{
								required: true,
								message: "You must provide a stake for the game",
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
					<Form.Item label="2nd Place Return" name="place_two_multiplier">
						<Select>
							<Option key="0" value={0}>
								None
							</Option>
							<Option key="1" value={1}>
								Money Back
							</Option>
							<Option key="2" value={2}>
								Double Up
							</Option>
							<Option key="x" value="x">
								Cusom
							</Option>
						</Select>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues.place_two_multiplier !==
							currentValues.place_two_multiplier
						}
					>
						{({ getFieldValue }) => {
							if (getFieldValue("place_two_multiplier") === "x") {
								return (
									<Form.Item
										label="2nd Place Multiplier"
										name="place_two_multiplier_custom"
									>
										<InputNumber min={0} />
									</Form.Item>
								);
							}
							return null;
						}}
					</Form.Item>
					<Form.Item label="3nd Place Return" name="place_three_multiplier">
						<Select>
							<Option key="0" value={0}>
								None
							</Option>
							<Option key="1" value={1}>
								Money Back
							</Option>
							<Option key="2" value={2}>
								Double Up
							</Option>
							<Option key="x" value="x">
								Cusom
							</Option>
						</Select>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues.place_three_multiplier !==
							currentValues.place_three_multiplier
						}
					>
						{({ getFieldValue }) => {
							if (getFieldValue("place_three_multiplier") === "x") {
								return (
									<Form.Item
										label="3rd Place Multiplier"
										name="place_three_multiplier_custom"
									>
										<InputNumber min={0} />
									</Form.Item>
								);
							}
							return null;
						}}
					</Form.Item>
					{this.props.full ? (
						<div>
							<Form.Item
								label="Number of tables"
								name="tables"
								rules={[
									{
										required: true,
										message: "You must provide a number of tables",
									},
								]}
							>
								<Select onChange={this.props.changeTables}>
									<Option key="1" value="1">
										Single Table
									</Option>
									<Option key="2x1" value="2x1">
										Two Tables into Final Table
									</Option>
									<Option key="3x1" value="3x1">
										Three Tables into Final Table
									</Option>
									<Option key="4x1" value="4x1">
										Four Tables into Final Table
									</Option>
									<Option key="4x2x1" value="4x2x1">
										Four Tables into Two into Final Table
									</Option>
								</Select>
							</Form.Item>
							<Form.Item
								noStyle
								shouldUpdate={(prevValues, currentValues) =>
									prevValues.tables !== currentValues.tables
								}
							>
								{({ getFieldValue }) => {
									if (getFieldValue("tables") === "1") {
										return (
											<Form.Item
												label="Players"
												name="participants"
												rules={[
													{
														required: true,
														message: "You must provide a stake for the game",
													},
												]}
											>
												<Select
													mode="multiple"
													placeholder="Select some Players"
													filterOption={(input, option) =>
														option.children
															.toLowerCase()
															.indexOf(input.toLowerCase()) >= 0
													}
												>
													{this.state.players
														.sort((a, b) => a.name.localeCompare(b.name))
														.map((player) => {
															if (player.active) {
																return (
																	<Option key={player.id} value={player.id}>
																		{player.name}
																	</Option>
																);
															}
															return "";
														})}
												</Select>
											</Form.Item>
										);
									}
									return null;
								}}
							</Form.Item>
							<Form.Item
								noStyle
								shouldUpdate={(prevValues, currentValues) =>
									prevValues.tables !== currentValues.tables
								}
							>
								{({ getFieldValue }) => {
									if (getFieldValue("tables") !== "1") {
										let rows = [];
										Object.keys(this.props.designations)
											.sort((a, b) => parseInt(b) - parseInt(a))
											.forEach((level) => {
												let tables = [];
												this.props.designations[level].forEach(
													(designation) => {
														tables.push(
															<TableFormSection
																players={this.state.players}
																designation={designation}
																key={designation}
															/>
														);
													}
												);
												rows.push(
													<Row gutter={16} key={level}>
														{tables}
													</Row>
												);
											});
										return rows;
									}
									return null;
								}}
							</Form.Item>
						</div>
					) : (
						""
					)}
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
			);
		}
	}
}

export default GameForm;

class TableFormSection extends React.Component {
	render() {
		return (
			<Col xs={24} sm={24} md={12}>
				<Divider>Table {this.props.designation}</Divider>
				<Form.Item
					label={
						this.props.designation === "Final"
							? "Final Table Players"
							: "Table " + this.props.designation + " Players"
					}
					name={"participants_" + this.props.designation}
					rules={
						this.props.designation[0] === "1"
							? [
									{
										required: true,
										message: "You must choose some players for the table.",
									},
							  ]
							: []
					}
				>
					<Select
						mode="multiple"
						placeholder="Select some Players"
						filterOption={(input, option) =>
							option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
						}
					>
						{this.props.players.map((player) => {
							if (player.active) {
								return (
									<Option key={player.id} value={player.id}>
										{player.name}
									</Option>
								);
							}
							return "";
						})}
					</Select>
				</Form.Item>
				{this.props.designation !== "Final" ? (
					<Form.Item
						label="# Players to Progress"
						name={"progressing_" + this.props.designation}
						rules={[
							{
								required: true,
								message: "You must choose some players for the table.",
							},
						]}
					>
						<InputNumber min={1} />
					</Form.Item>
				) : (
					""
				)}
			</Col>
		);
	}
}
