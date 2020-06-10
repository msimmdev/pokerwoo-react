import React from "react";
import moment from "moment";
import { Form, Input, Button, DatePicker } from "antd";

const { TextArea } = Input;

class ScheduleForm extends React.Component {
	render() {
		return (
			<Form
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={this.props.onSubmit}
				onFinishFailed={this.props.onFail}
				initialValues={
					this.props.initialValues
						? this.props.initialValues
						: {
								schedule_date: moment(
									moment().format("YYYY-MM-DD") + " 19:30:00",
									"YYYY-MM-DD HH:mm:ss"
								),
						  }
				}
				ref={this.props.formRef}
			>
				<Form.Item
					label="Date"
					name="schedule_date"
					rules={[
						{
							required: true,
							message: "You must provide a value for the date",
						},
					]}
				>
					<DatePicker showTime={{ minuteStep: 15 }} format="DD/MM/YYYY HH:mm" />
				</Form.Item>
				<Form.Item label="Description" name="description">
					<TextArea rows={4} />
				</Form.Item>
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Button
						type="primary"
						htmlType="submit"
						loading={this.props.isSaving}
					>
						Save
					</Button>
				</Form.Item>
			</Form>
		);
	}
}

export default ScheduleForm;
