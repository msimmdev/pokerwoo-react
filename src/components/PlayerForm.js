import React from "react";
import { Form, Input, Button, Upload, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";

class PlayerForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showUpload: (!props.initialValues || props.initialValues.avatar.length === 0 ? true : false),
		};
	}

	normFile(e) {
		if (Array.isArray(e)) {
			return e;
		}

		return e && e.fileList;
	}

	render() {
		return (
			<Form
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={this.props.onSubmit}
				onFinishFailed={this.props.onFail}
				initialValues={
					this.props.initialValues ? this.props.initialValues : { active: true }
				}
				ref={this.props.formRef}
			>
				<Form.Item
					label="Name"
					name="name"
					rules={[
						{
							required: true,
							message: "You must provide a value for the name of the player",
						},
						{
							max: 255,
							message: "No more than 255 characters are permitted",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="PokerTH Name"
					name="pokerth_name"
					rules={[
						{
							max: 255,
							message: "No more than 255 characters are permitted",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Avatar"
					name="avatar"
					valuePropName="fileList"
					getValueFromEvent={this.normFile}
				>
					<Upload
						name="avatarupload"
						listType="picture-card"
						className="avatar-uploader"
						action={process.env.REACT_APP_BASE_API_URL + "/upload/avatar/"}
						accept="image/*"
						multiple={false}
						withCredentials={true}
						onRemove={() => this.setState({ showUpload: true })}
						beforeUpload={() => this.setState({ showUpload: false })}
					>
						{this.state.showUpload ? (
							<div>
								<PlusOutlined />
								<div className="ant-upload-text">Upload</div>
							</div>
						) : null}
					</Upload>
				</Form.Item>
				<Form.Item
					label="Payment Link"
					name="payment_link"
					rules={[
						{
							max: 255,
							message: "No more than 255 characters are permitted",
						},
						{
							type: "url",
							message: "You must provide a valid URL for the payment link",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Payment Name"
					name="payment_name"
					rules={[
						{
							max: 255,
							message: "No more than 255 characters are permitted",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Bank Account Number"
					name="bank_account_number"
					rules={[
						{
							max: 30,
							message: "No more than 30 characters are permitted",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Bank Sort Code"
					name="bank_sort_code"
					rules={[
						{
							max: 6,
							message: "No more than 6 characters are permitted",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="Enabled"
					name="active"
					valuePropName="checked"
					rules={[
						{
							type: "boolean",
						},
					]}
				>
					<Switch defaultChecked={true} />
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

export default PlayerForm;
