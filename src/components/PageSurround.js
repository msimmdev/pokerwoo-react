import React from "react";
import { Breadcrumb, PageHeader } from "antd";
import { Link } from "react-router-dom";

class PageSurround extends React.Component {
	constructor(props) {
		super(props);
		this.handleBack = this.handleBack.bind(this);
		props.pageBreadcrumb.forEach(element => {
			if (typeof(element) === 'object') {
				this.backLink = element.link;
			}
		});
	}

	handleBack() {
		this.props.history.push(this.backLink);
	}

	render() {
		let breadcrumbList = [];
		if (typeof this.props.pageBreadcrumb === "object") {
			breadcrumbList = this.props.pageBreadcrumb.map((item) => {
				if (typeof(item) === 'object') {
					return <Breadcrumb.Item key={item.name}><Link to={item.link}>{item.name}</Link></Breadcrumb.Item>
				} else {
					return <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>
				}
			});
		}
		return (
			<div>
				<Breadcrumb style={{ margin: "16px 0" }}>{breadcrumbList}</Breadcrumb>
				<div className="site-layout-content">
					<PageHeader title={this.props.pageTitle} onBack={this.backLink ? this.handleBack : false}/>
					{this.props.children}
				</div>
			</div>
		);
	}
}

export default PageSurround;
