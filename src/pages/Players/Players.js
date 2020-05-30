import React from "react";
import PageSurround from "../../components/PageSurround";
import Cookies from "js-cookie";
import {
	Table,
	Switch,
	Avatar,
	Alert,
	Space,
	Button,
	Input,
	message,
} from "antd";
import Highlighter from "react-highlight-words";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

class Players extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: "",
			searchedColumn: "",
			error: null,
			isLoaded: false,
			players: [],
		};
	}

	getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={(node) => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) =>
						setSelectedKeys(e.target.value ? [e.target.value] : [])
					}
					onPressEnter={() =>
						this.handleSearch(selectedKeys, confirm, dataIndex)
					}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button
						onClick={() => this.handleReset(clearFilters)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilter: (value, record) => {
			return record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase());
		},
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: (text) =>
			this.state.searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
					searchWords={[this.state.searchText]}
					autoEscape
					textToHighlight={text.toString()}
				/>
			) : (
				text
			),
	});

	handleSearch = (selectedKeys, confirm, dataIndex) => {
		confirm();
		this.setState({
			searchText: selectedKeys[0],
			searchedColumn: dataIndex,
		});
	};

	handleReset = (clearFilters) => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	componentDidMount() {
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/players/", {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"X-CSRFToken": Cookies.get("csrftoken"),
			},
		})
			.then((res) => res.json())
			.then(
				(result) => {
					this.setState({
						isLoaded: true,
						players: result,
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error,
					});
				}
			);
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
				render: (name, record) => (
					<Link to={"/players/" + record.id + "/"}>
						<Space>
							<Avatar size="large" src={record.avatar} />
							{name}
						</Space>
					</Link>
				),
				...this.getColumnSearchProps("name"),
			},
			{
				title: "PokerTH Name",
				dataIndex: "pokerth_name",
				key: "pokerth_name",
				sorter: (a, b) => {
					console.log(a.pokerth_name === null);
					console.log(b.pokerth_name === null);
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
			},
			{
				dataIndex: "active",
				key: "active",
				render: (status, record) => (
					<ToggleStatus status={status} id={record.id} />
				),
				align: "center",
			},
			{
				key: "edit",
				align: "center",
				render: (record) => (
					<Link to={"/players/edit/" + record.id}>
						<Button disabled={record.user} icon={<EditOutlined />}>
							Edit
						</Button>
					</Link>
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
						<Link to="/players/add">
							<Button>Add Player</Button>
						</Link>
						<Table
							loading={!isLoaded}
							dataSource={players}
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
		fetch(
			process.env.REACT_APP_BASE_API_URL +
				"/players/players/" +
				this.state.id +
				"/",
			{
				credentials: "include",
				method: "PATCH",
				body: JSON.stringify({
					active: checked,
				}),
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"X-CSRFToken": Cookies.get("csrftoken"),
				},
			}
		)
			.then((res) => res.json())
			.then(
				(result) => {
					this.setState({
						loading: false,
						checked: result.active,
					});
				},
				(error) => {
					this.setState({
						loading: false,
					});
					message.error("Could not change state of user.");
				}
			);
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
