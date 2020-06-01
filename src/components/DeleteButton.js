import React from "react";
import { Button, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import RestApi from "../utils/RestApi";

class DeleteButton extends React.Component {
	constructor(props) {
		super(props);
		this.id = props.id;
		this.resourse = props.resourse;
		this.onRes = props.onRes;
		this.deletePlayer = this.deletePlayer.bind(this);
		this.state = {
			loading: false,
		};
	}

	deletePlayer() {
        console.log('delete');
		this.setState({ loading: true });
		new RestApi(this.resourse).delete({
			onRes: (res) => {
				this.setState({ loading: false });
				return this.onRes(res, this.id);
			},
			onError: (error) => {
				message.error(error.message);
			},
		});
	}

	render() {
		return (
			<Popconfirm
				placement="top"
				title={this.props.confirmMessage}
				onConfirm={this.deletePlayer}
				okText="Yes"
                cancelText="No"
                disabled={this.props.disabled}
			>
				<Button disabled={this.props.disabled} icon={<DeleteOutlined />} loading={this.state.loading}>
					{this.props.children}
				</Button>
			</Popconfirm>
		);
	}
}

export default DeleteButton;
