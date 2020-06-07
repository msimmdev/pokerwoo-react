import React from "react";
import { withRouter } from "react-router-dom";
import PageSurround from "../../components/PageSurround";
import PlayerForm from "../../components/PlayerForm";
import { message, Spin, Alert } from "antd";
import RestApi from "../../utils/RestApi";

class EditPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.id = props.match.params.playerid;
		this.state = {
			isLoaded: false,
			playerData: {},
			isSaving: false,
		};
	}

	componentDidMount() {
		new RestApi('/players/players/' + this.id + '/').retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error('Unable to retrieve player.'));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					playerData: result,
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
		new RestApi('/players/players/' + this.id + '/').update({
			data: values,
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error('Unable to retrieve player.'));
				}
				return res;
			},
			onParse: () => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/players");
				message.success("Player has been updated");
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
		} else if (this.state.error) {
			return (
				<PageSurround
					pageBreadcrumb={pageBreadcrumb}
					pageTitle={title}
					history={this.props.history}
				>
					<Alert type='error' message={this.state.error.message} />
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
