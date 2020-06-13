import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout, Row, Col, Result, Spin } from "antd";
import NavMenu from "./surround/NavMenu";
import Profile from "./surround/Profile";
import Routes from "./Routes";
import RestApi from "./utils/RestApi";

import { ReactComponent as Logo } from "./pokerwoo.svg";
import { ReactComponent as Icon } from "./pokerwoo-icon.svg";

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
									<Col
										xxl={4}
										xl={5}
										lg={6}
										md={7}
										sm={3}
										xs={4}
										style={{ textAlign: "center" }}
									>
										<Logo className="main-logo" />
										<Icon className="main-icon" />
									</Col>
									<Col xxl={19} xl={18} lg={17} md={16} sm={20} xs={17}>
										<Switch>
											<Route path="/games">
												<NavMenu selected="/games" />
											</Route>
											<Route path="/payments">
												<NavMenu selected="/payments" />
											</Route>
											<Route path="/players">
												<NavMenu selected="/players" />
											</Route>
											<Route path="/schedule">
												<NavMenu selected="/schedule" />
											</Route>
											<Route path="/">
												<NavMenu selected="/" />
											</Route>
										</Switch>
									</Col>
									<Col xxl={1} xl={1} lg={1} md={1} sm={1} xs={3}>
										<Profile profileData={this.state.profileData} />
									</Col>
								</Row>
							</Header>
							<Content className="site-content">
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
