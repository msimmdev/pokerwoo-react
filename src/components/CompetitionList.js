import React from "react";
import { Tag, Space } from "antd";

class CompetitionList extends React.Component {
	render() {
		let compList = [];
		this.props.competitionParticipants.forEach((part) => {
			this.props.competitions.forEach((comp) => {
				if (comp.id === part.competition) {
					compList.push(<Tag key={comp.id}>{comp.name}</Tag>);
				}
			});
		});
		return <Space>{compList}</Space>;
	}
}

export default CompetitionList;
