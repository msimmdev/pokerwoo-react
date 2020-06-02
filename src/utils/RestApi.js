import Cookies from "js-cookie";

class RestApi {
	constructor(resourse) {
		this.url = process.env.REACT_APP_BASE_API_URL + resourse;
		this.fetchParams = {
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"X-CSRFToken": Cookies.get("csrftoken"),
			},
		};
	}

	retrieve(props) {
		return fetch(this.url, this.fetchParams)
			.then((res) => (props.onRes ? props.onRes(res) : res))
			.then((res) => res.json())
			.then((result) => (props.onParse ? props.onParse(result) : result))
			.catch((error) => props.onError(error));
	}

	partialUpdate(props) {
		let params = {
			...this.fetchParams,
			...{ method: "PATCH", body: JSON.stringify(props.data) },
		};
		return fetch(this.url, params)
			.then((res) => (props.onRes ? props.onRes(res) : res))
			.then((res) => res.json())
			.then((result) => (props.onParse ? props.onParse(result) : result))
			.catch((error) => props.onError(error));
	}

	update(props) {
		let params = {
			...this.fetchParams,
			...{ method: "PUT", body: JSON.stringify(props.data) },
		};
		return fetch(this.url, params)
			.then((res) => (props.onRes ? props.onRes(res) : res))
			.then((res) => res.json())
			.then((result) => (props.onParse ? props.onParse(result) : result))
			.catch((error) => props.onError(error));
	}

	create(props) {
		let params = {
			...this.fetchParams,
			...{ method: "POST", body: JSON.stringify(props.data) },
		};
		return fetch(this.url, params)
			.then((res) => (props.onRes ? props.onRes(res) : res))
			.then((res) => res.json())
			.then((result) => (props.onParse ? props.onParse(result) : result))
			.catch((error) => props.onError(error));
	}

	delete(props) {
		let params = {
			...this.fetchParams,
			...{ method: "DELETE" },
		};
		return fetch(this.url, params)
			.then((res) => (props.onRes ? props.onRes(res) : res))
			.catch((error) => props.onError(error));
	}
}

export default RestApi;
