import React from "react";
import { withRouter } from "react-router-dom";
import moment from "moment";
import { PageSurround, ScheduleForm } from "../../components";
import { message, Spin, Alert } from "antd";
import RestApi from "../../utils/RestApi";

class EditSchedule extends React.Component {
	constructor(props) {
		super(props);
		this.formRef = React.createRef();
		this.onSubmit = this.onSubmit.bind(this);
		this.id = props.match.params.sessionid;
		this.state = {
			isLoaded: false,
			sessionData: {},
			isSaving: false,
		};
	}

	componentDidMount() {
		new RestApi('/schedule/sessions/' + this.id + '/').retrieve({
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error('Unable to retrieve session.'));
				}
				return res;
			},
			onParse: (result) => {
				console.log(result);
				result.schedule_date = moment(result.schedule_date);
				this.setState({
					isLoaded: true,
					sessionData: result,
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
		new RestApi('/schedule/sessions/' + this.id + '/').update({
			data: values,
			onRes: (res) => {
				if (res.status !== 200) {
					return Promise.reject(new Error('Unable to update session.'));
				}
				return res;
			},
			onParse: () => {
				this.setState({
					isSaving: false,
				});
				this.props.history.push("/schedule");
				message.success("Session has been updated");
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
		let pageBreadcrumb = [{ name: "Schedule", link: "/schedule" }, "Edit Session"];
		let title = "Edit Session";

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
					<ScheduleForm
						formRef={this.formRef}
						onSubmit={this.onSubmit}
						isSaving={this.state.isSaving}
						initialValues={this.state.sessionData}
					/>
				</PageSurround>
			);
		}
	}
}

export default withRouter(EditSchedule);
