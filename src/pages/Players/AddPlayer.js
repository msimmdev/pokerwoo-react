import React from "react";
import PageSurround from "../../components/PageSurround";
import PlayerForm from "../../components/PlayerForm";
import { message } from "antd";
import RestApi from "../../utils/RestApi";

class AddPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.state = {
			isSaving: false,
		};
	}

	onSubmit(values) {
		this.setState({ isSaving: true });
		if (values.avatar.length > 0) {
			let imgUrl = values.avatar[0].response.url;
			values.avatar = imgUrl;
		} else {
			delete values.avatar;
		}
		new RestApi("/players/players/").create({
			data: values,
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(new Error("Unable to create player."));
				}
				return res;
			},
			onParse: () => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/players");
				message.success("Player has been created");
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
			{ name: "Players", link: "/players" },
			"Create Player",
		];
		let title = "Create Player";

		return (
			<PageSurround
				pageBreadcrumb={pageBreadcrumb}
				pageTitle={title}
				history={this.props.history}
			>
				<PlayerForm
					formRef={this.formRef}
					onSubmit={this.onSubmit}
					isSaving={this.state.isSaving}
				/>
			</PageSurround>
		);
	}
}

export default AddPlayer;
