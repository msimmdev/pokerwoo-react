import React from "react";
import { PageSurround, ScheduleForm } from "../../components";
import { message } from "antd";
import RestApi from "../../utils/RestApi";

class AddSchedule extends React.Component {
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
		new RestApi("/schedule/sessions/").create({
			data: { ...values, ...{ createdby_player: this.props.profileData.id } },
			onRes: (res) => {
				if (res.status !== 201) {
					return Promise.reject(new Error("Unable to create session."));
				}
				return res;
			},
			onParse: (result) => {
				new RestApi("/schedule/sessions/" + result.id + "/players/").create({
					data: { player_ref: this.props.profileData.id, attendance: true },
					onRes: (res) => {
						if (res.status !== 201) {
							return Promise.reject(new Error("Unable to create session."));
						}
						return res;
					},
					onParse: () => {
						this.setState({
							isSaving: false,
						});
						this.props.history.push("/schedule");
						message.success("Session has been created");
					},
					onError: (error) => {
						throw error;
					},
				})
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
			{ name: "Schedule", link: "/schedule" },
			"Schedule Session",
		];
		let title = "Schedule Session";

		return (
			<PageSurround
				pageBreadcrumb={pageBreadcrumb}
				pageTitle={title}
				history={this.props.history}
			>
				<ScheduleForm
					formRef={this.formRef}
					onSubmit={this.onSubmit}
					isSaving={this.state.isSaving}
				/>
			</PageSurround>
		);
	}
}

export default AddSchedule;
