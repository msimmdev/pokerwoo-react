import React from 'react';
import { Table, Spin, Tag, Breadcrumb } from 'antd';

class Players extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false,
			players: [],
		};
	}

	componentDidMount() {
		fetch(process.env.REACT_APP_BASE_API_URL + "/players/players/", {
            credentials: "include",
            headers: {
                Accept: 'application/json'
            }
		})
			.then((res) => res.json())
			.then(
				(result) => {
					this.setState({
						isLoaded: true,
						players: result,
					});
				},
				(error) => {
					this.setState({
						isLoaded: true,
						error,
					});
				}
			);
    }
    
    render() {
        const { error, isLoaded, players } = this.state;
        const cols = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'PokerTH Name',
                dataIndex: 'pokerth_name',
                key: 'pokerth_name'
            },
            {
                title: 'Account Status',
                dataIndex: 'active',
                key: 'active',
                render: status => <StatusTag status={status} />
            }
        ];
		if (error) {
			return <div>Error: {error.message}</div>;
		} else if (!isLoaded) {
			return <Spin />;
		} else {
            return (
                <div>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Players</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="site-layout-content">
                        <Table dataSource={players} columns={cols} bordered />
                    </div>
                </div>
            );
        }
    }
}

class StatusTag extends React.Component {
    render() {
        if (this.props.status) {
            return <Tag color="success">Enabled</Tag>;
        }
        return <Tag color="error">Disabled</Tag>;
    }
}

export default Players;