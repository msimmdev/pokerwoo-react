import React from "react";
import PageSurround from "../../components/PageSurround";
import PlayerForm from "../../components/PlayerForm";
import Cookies from "js-cookie";
import { message } from "antd";

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
		console.log(values);
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/players/", {
			credentials: "include",
			method: "POST",
			body: JSON.stringify(values),
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-CSRFToken": Cookies.get("csrftoken"),
			},
		}).then((res) => {
			this.setState({
				isSaving: false,
			});
			if (res.status === 201) {
                this.props.history.push('/players');
                message.success("Player has been added");
			} else {
				message.error("There was a problem adding the player");
			}
		});
	}

	render() {
		let pageBreadcrumb = [{ name: "Players", link: "/players" }, "Add Player"];
		let title = "Add Player";

		return (
			<PageSurround pageBreadcrumb={pageBreadcrumb} pageTitle={title} history={this.props.history}>
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
