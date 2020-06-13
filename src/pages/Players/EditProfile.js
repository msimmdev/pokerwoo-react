import React from "react";
import EditPlayer from "./EditPlayer";

class EditProfile extends React.Component {
	render() {
		return (
			<EditPlayer
				{...this.props}
				playerId={this.props.profileData.id}
			/>
		);
	}
}

export default EditProfile;
