import React from "react";

import { Table, Space, Button, Input } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

class DataTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: "",
			searchedColumn: "",
		};
	}

	getColumnSearchProps = (dataIndex, Container, containerData) => ({
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
		render: (text, data) =>
			this.state.searchedColumn === dataIndex ? (
				<Container data={containerData ? containerData(data) : data}>
					<Highlighter
						highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
						searchWords={[this.state.searchText]}
						autoEscape
						textToHighlight={text.toString()}
					/>
				</Container>
			) : (
				<Container data={containerData ? containerData(data) : data}>
					{text}
				</Container>
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

	render() {
		let cols = [];
		this.props.columns.forEach((element) => {
			if (element.searchable) {
				element = {
					...element,
					...this.getColumnSearchProps(
						element.searchable,
						element.container,
						element.containerData
					),
				};
			}
			cols.push(element);
		});
		return (
			<Table
				loading={this.props.loading}
				dataSource={this.props.dataSource}
				columns={cols}
				rowKey={this.props.rowKey}
				bordered={this.props.bordered}
			/>
		);
	}
}

export default DataTable;
