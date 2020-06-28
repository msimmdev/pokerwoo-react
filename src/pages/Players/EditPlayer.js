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
		this.id = props.playerId || props.match.params.playerid;
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
				if (result.avatar) {
					result.avatar = [ {
						thumburl: result.avatar,
						url: result.avatar,
						uid: 1,
					} ];
				} else {
					result.avatar = [];
				}
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
		if (values.avatar.length > 0) {
			let imgUrl = values.avatar[0].response.url;
			values.avatar = imgUrl;
		} else {
			delete values.avatar;
		}
		new RestApi('/players/players/' + this.id + '/').update({
			data: values,
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error('Unable to update player.'));
				}
				return res;
			},
			onParse: (data) => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/players");
				if (this.id === this.props.profileData.id) {
					this.props.updateProfile(data);
				}
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
