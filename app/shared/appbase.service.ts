import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
declare var Appbase;

@Injectable()

export class AppbaseService {
	constructor(private http: Http) {}
	public requestParam: any = {
		url: null,
		auth: null
	};
	public config: any = {
		username: null,
		password: null
	};
	public appbaseRef: any;
	public resultStream: any = null;
	setAppbase(config: any) {
		this.config.username = config.username;
		this.config.password = config.password;
		this.requestParam.pureurl = config.url;
		if (config.appname) {
			this.requestParam.url = config.url + '/' + config.appname;
		} else {
			this.requestParam.url = config.url;
		}

		let appbaseRef: any = {
			url: "https://scalr.api.appbase.io",
			app: config.appname
		}
		
		if (config.username) {
			appbaseRef.credentials = `${config.username}:${config.password}`;
			this.requestParam.auth = "Basic " + btoa(config.username + ':' + config.password);
		};

		this.appbaseRef = new Appbase(appbaseRef);
	}
	get(path: string) {
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		var request_url = this.requestParam.url.replace(this.config.username + ':' + this.config.password + '@', '');
		var request_path = request_url + path + '/';
		return this.http.get(request_path, { headers: headers }).toPromise();
	}
	getMappings() {
		var self = this;
		return new Promise((resolve, reject) => {
			getRequest('/_mapping').then(function(res) {
				let mappingData = res.json();
				getRequest('/_alias').then(function(res) {
					let aliasData = res.json();
					for (let index in aliasData) {
						for (let alias in aliasData[index].aliases) {
							mappingData[alias] = mappingData[index];
						}
					}
					resolve(mappingData);
				}).catch(function(e) {
					resolve(mappingData);
				});
			}).catch(function(e) {
				reject(e);
			})
		});

		function getRequest(path) {
			let headersObj: any = {
				'Content-Type': 'application/json;charset=UTF-8'
			};
			
			if (self.requestParam.auth) {
				headersObj.Authorization = self.requestParam.auth
			}
	
			// let headers = new Headers(headersObj);
			let headers = new Headers();
			var request_url = self.requestParam.url.replace(self.config.username + ':' + self.config.password + '@', '');
			var request_path = request_url + path + '/';
			console.log(request_path);
			return self.http.get(request_path, { headers: headers }).toPromise();
		}
	}
	getVersion() {
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		console.log('this.requestParam.auth', this.requestParam.auth);
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		var request_url = this.requestParam.url.replace(this.config.username + ':' + this.config.password + '@', '');
		var request_path = request_url + '/_settings?human';
		console.log(request_path);
		return this.http.get(request_path, { headers: headers }).toPromise()
	}
	post(path: string, data: any) {
		let requestData = JSON.stringify(data);
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		return this.http.post(this.requestParam.url + path, requestData, { headers: headers }).toPromise()
	}
	posturl(url: string, data: any) {
		let requestData = JSON.stringify(data);
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		return this.http.post(url, requestData, { headers: headers }).toPromise()
	}
	put(path: string, data: any) {
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		return this.http.put(this.requestParam.url + path, data, { headers: headers }).toPromise()
	}
	delete(path: string) {
		let headersObj: any = {
			'Content-Type': 'application/json;charset=UTF-8'
		};
		
		if (this.requestParam.auth) {
			headersObj.Authorization = this.requestParam.auth
		}

		// let headers = new Headers(headersObj);
		let headers = new Headers();
		return this.http.delete(this.requestParam.url + path, { headers: headers }).toPromise()
	}
	public handleError(error: any) {
		console.error('An error occurred', error);
	}
	getIndices(url: string) {
		var temp_config = this.filterurl(url);
		this.setAppbase(temp_config);
		return this.get('/_stats/indices');
	}
	filterurl(url: string) {
		if (url) {
			var obj = {
				username: null,
				password: null,
				url: url
			};
			var urlsplit = url.split(':');
			try {
				obj.username = urlsplit[1].replace('//', '');
				var httpPrefix = url.split('://');
				if (urlsplit[2]) {
					var pwsplit = urlsplit[2].split('@');
					obj.password = pwsplit[0];
					if (url.indexOf('@') !== -1) {
						obj.url = httpPrefix[0] + '://' + pwsplit[1];
						if (urlsplit[3]) {
							obj.url += ':' + urlsplit[3];
						}
					}
				}
			} catch (e) {
				console.log(e);
			}
			return obj;
		} else {
			return null;
		}
	}
	searchStream(type, body) {
		if (this.resultStream) {
			this.resultStream.stop();
		}
		this.resultStream = this.appbaseRef.searchStream({
			type: type,
			body: body
		});
		return this.resultStream;
	}
}
