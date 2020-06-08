import React from "react";

import { Row, Col, Divider, Spin } from "antd";
import { PlayerList } from "./";

class TableList extends React.Component {
	render() {
		if (this.props.isLoaded) {
			let renderList = [];
			let tableStruct = {};
			this.props.tableData
				.sort((a, b) => a.designation.localeCompare(b.designation))
				.forEach((table) => {
					tableStruct[table.level] = tableStruct[table.level] || [];
					tableStruct[table.level].push(table);
				});
			let i = 1;
			Object.keys(tableStruct)
				.sort((a, b) => parseInt(b) - parseInt(a))
				.forEach((level) => {
					let tableList = [];
					tableStruct[level].forEach((table) => {
						let tablePlayers = [];
						let otherPlayers = [];
						let players = [...this.props.playerData];
						players.forEach((player) => {
							let added = false;
							table.participants.forEach((participant) => {
								if (participant.game_participant === player.participantId) {
									let newPlayer = { ...player };
									newPlayer.tableParticipantId = participant.id;
									newPlayer.success = participant.success;
									tablePlayers.push(newPlayer);
									added = true;
								}
							});
							if (!added && player.active && player.participantId) {
								otherPlayers.push(player);
							}
						});

						tableList.push(
							<Col sm={24} md={12} key={table.id}>
								<PlayerList
									players={tablePlayers}
									validExtraPlayers={otherPlayers}
									label={table.designation}
									add={this.props.add}
									delete={this.props.delete}
									success={table.designation === 'Final' ? false : true}
									completedParticipants={this.props.completedParticipants}
									onSuccess={(player, isComplete) => this.props.onSuccess(player, isComplete, table)}
									addPlayer={(playerId) => {
										let participantId;
										players.forEach((player) => {
											if (player.id === playerId) {
												participantId = player.participantId;
											}
										});
										this.props.addPlayer(table.id, participantId);
									}}
									removePlayer={(res, playerId) => {
										let participantId;
										players.forEach((player) => {
											if (player.id === playerId) {
												participantId = player.participantId;
											}
										});
										this.props.removePlayer(res, table.id, participantId);
									}}
									removeResourse={
										this.props.tableResourse + table.id + "/participants/"
									}
									removeKey="tableParticipantId"
								/>
							</Col>
						);
					});
					renderList.push(
						<Row key={level} gutter={16}>
							<Divider>{"Group " + i + " Tables"}</Divider>
							{tableList}
						</Row>
					);
					i++;
				});
			return renderList;
		} else {
			return <Spin />;
		}
	}
}

export default TableList;
