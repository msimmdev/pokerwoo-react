import React from "react";
import { ReactComponent as TopScore2020 } from "../awards/top-score-2020.svg";
import { ReactComponent as GamesPlayed2020 } from "../awards/games-played-2020.svg";
import { ReactComponent as PlaceRate2020 } from "../awards/place-rate-2020.svg";
import { ReactComponent as WinRate2020 } from "../awards/win-rate-2020.svg";
import { Tooltip } from "antd";

class Award extends React.Component {

	render() {
		let returnVal = "";
		console.log(this.props.data);
		let size = 22;
		if (this.props.size === "large") {
			size = 100;
		}
		switch (this.props.data.award_key){
			case 'top-score-2020':
				returnVal = <TopScore2020 width={size} height={size} />;
				break;
			case 'games-played-2020':
				returnVal = <GamesPlayed2020 width={size} height={size} />;
				break;
			case 'place-rate-2020':
				returnVal = <PlaceRate2020 width={size} height={size} />;
				break;
			case 'win-rate-2020':
				returnVal = <WinRate2020 width={size} height={size} />;
				break;
			default:
				returnVal = "";
		}

		return <Tooltip title={this.props.data.name}>{returnVal}</Tooltip>;
	}
}

export default Award;