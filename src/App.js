import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout, Row, Col, Result, Spin } from "antd";
import NavMenu from "./surround/NavMenu";
import Profile from "./surround/Profile";
import Routes from "./Routes";
import RestApi from "./utils/RestApi";

import { ReactComponent as Logo } from "./pokerwoo.svg";

import "./App.less";
import "./fonts/saarland.ttf";

const { Header, Content, Footer } = Layout;

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			profileData: {},
		};
	}

	componentDidMount() {
		new RestApi("/players/active_player/").retrieve({
			onRes: (res) => {
				if (res.status === 404) {
					window.location.href = "http://localhost:8000/accounts/login/"; // TODO Change
					return Promise.reject(new Error("Unauthenticated"));
				} else if (res.status !== 200) {
					return Promise.reject(new Error("Unable to retrieve player."));
				}
				return res;
			},
			onParse: (result) => {
				this.setState({
					isLoaded: true,
					profileData: result,
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

	render() {
		if (this.state.error) {
			return (
				<Result
					status="500"
					title="500"
					subTitle="Sorry, something went wrong."
				/>
			);
		} else if (!this.state.isLoaded) {
			return <Spin />;
		} else {
			return (
				<Router>
					<div className="App">
						<Layout className="layout">
							<Header>
								<Row>
									<Col span={3}>
										<Logo className="main-logo" />
									</Col>
									<Col span={20}>
										<NavMenu />
									</Col>
									<Col span={1}>
										<Profile profileData={this.state.profileData} />
									</Col>
								</Row>
							</Header>
							<Content style={{ padding: "0 50px" }}>
								<Routes profileData={this.state.profileData} />
							</Content>
							<Footer style={{ textAlign: "center" }}>
								Copyright &copy; 2020 Michael Simm. All Rights Reserverd
							</Footer>
						</Layout>
					</div>
				</Router>
			);
		}
	}
}

export default App;
