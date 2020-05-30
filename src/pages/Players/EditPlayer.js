import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import PlayerForm from "../../components/PlayerForm";
import Cookies from "js-cookie";
import { message, Spin } from "antd";

class EditPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.state = {
			isLoaded: false,
			playerData: {},
			isSaving: false,
		};
	}

	componentDidMount() {
		const id = this.props.match.params.playerid;
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/players/" + id + "/", {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"X-CSRFToken": Cookies.get("csrftoken"),
			},
		})
			.then((res) => res.json())
			.then(
				(result) => {
                    if (result.avatar) {
                        result.avatar = [{ uid: 1, url: result.avatar,  }];
                    }
					this.setState({
						isLoaded: true,
						playerData: result,
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
				this.props.history.push("/players");
				message.success("Player has been updated");
			} else {
				message.error("There was a problem updating the player");
			}
		});
	}

	render() {
		let pageBreadcrumb = [{ name: "Players", link: "/players" }, "Edit Player"];
		let title = "Edit Player";

		if (!this.state.isLoaded) {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Spin />
				</PageSurround>
			);
		} else {
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
						initialValues={this.state.playerData}
					/>
				</PageSurround>
			);
		}
	}
}

export default withRouter(EditPlayer);
