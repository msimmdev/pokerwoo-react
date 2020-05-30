import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Layout, Row, Col } from "antd";
import NavMenu from "./surround/NavMenu";
import Profile from "./surround/Profile";
import Routes from "./Routes";

import {ReactComponent as Logo} from "./pokerwoo.svg";

import "./App.less";
import './fonts/saarland.ttf'

const { Header, Content, Footer } = Layout;

function App() {
	return (
		<Router>
			<div className="App">
				<Layout className="layout">
					<Header>
						<Row>
							<Col span={3}>
								<Logo className="main-logo"/>
							</Col>
							<Col span={20}>
								<NavMenu />
							</Col>
							<Col span={1}>
								<Profile />
							</Col>
						</Row>
					</Header>
					<Content style={{ padding: '0 50px' }}>
						<Routes />
					</Content>
					<Footer style={{ textAlign: "center" }}>
						Copyright &copy; 2020 Michael Simm. All Rights Reserverd
					</Footer>
				</Layout>
			</div>
		</Router>
	);
}

export default App;
