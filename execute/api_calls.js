

function login(API_URL,CLIENT_ID,CLIENT_SECRET) {

	return fetch(API_URL + '/login?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET, 
		{"method": "post"})
	.then(function(response) {
		return response.json();
	})
	.then(function(json) {
		return json.access_token;
	})
	.catch(function(err) {
		console.log('err')
	});
}

function create_query(API_URL, token,slug,dynamic_query,chart_type) {
	var body = {
		"model": "sql__"+slug,
		"view": "sql_runner_query",
		"fields": ["sql_runner_query.detail*"]
	};
	if (dynamic_query) { 
		body.dynamic_fields = JSON.stringify(dynamic_query.dynamic_fields);
		body.fields = dynamic_query.selected
		body.sorts = dynamic_query.sorts
	}
		if (chart_type) { 
		body.vis_config = {"type": chart_type}
	};
	var options = {
		"method": "post",
		"headers": { "Authorization": "token " + token },
		"body": JSON.stringify(body)
	}
	return fetch(API_URL + "/queries", options, JSON.stringify(body))
	.then(function(response) {
		return response.json();
	})
	.then(function(json){
		return json.id
	})
}

function run_query(API_URL, token, query_id){
	var options = {
		"method": "get",
		"headers": { "Authorization": "token " + token }
	}

	return fetch(API_URL + "/queries/"+query_id+"/run/json_detail", options)
	.then(function(response) {
		return response.json()
	})
	.then(function(response) {

		var fields = response.fields.dimensions;
		console.log(fields);

		var dynamic_fields = [];
		var selected = [];
		var sorts = [];

		for (var i = 0; i < fields.length; i++) {
			if (fields[i].is_numeric) {
				var temp = {
					"measure": "",
					"based_on": "",
					"expression": "",
					"label": "",
					"type": "sum",
					"_kind_hint": "measure",
					"_type_hint": "number"
				} 
				temp.measure = "field"+i;
				temp.based_on = fields[i].name;
				temp.label = fields[i].label;
				dynamic_fields.push(temp);
				selected.push(temp.measure);
			} else {
				selected.push(fields[i].name);
				if (selected.length == 1) {
					sorts.push(fields[i].name);
				}
			}
		}
		return {"selected": selected, "dynamic_fields": dynamic_fields, "sorts": sorts};
	})
}

function add_element_to_dashboard (API_URL, token, dashboard_id, query_id) {
	var body = {
		"dashboard_id": dashboard_id,
		"query_id": query_id,
		"type": "vis",
		"title": "SQL Query Element"
	}
	var options = {
		"method": "post",
		"headers": { "Authorization": "token " + token },
		"body": JSON.stringify(body)
	}
	return fetch(API_URL + "/dashboard_elements", options);
}


chrome.storage.sync.get(['chart_type','dashboard_default','api_key','api_secret', 'api_url', 'host'], function(items){
	var path= items.host+'/sql/';
	var API_URL = items.api_url;
	var	CLIENT_ID = items.api_key;
	var	CLIENT_SECRET = items.api_secret;


	var ACCESS_TOKEN;
	var QUERY_ID;
	var QUERY_ID_DYNAMIC;
	var url_position = window.location.href.indexOf(path)
	var hash_position = window.location.href.indexOf("#")


var sql_slug = window.location.href.substring(path.length + url_position, hash_position)
	console.log(items)
	console.log(path,path.length)
	console.log(sql_slug)
var dashboard_id = window.location.hash.split(',')[0].substring(1)
var chart_type = window.location.hash.split(',')[1]

login(API_URL,CLIENT_ID,CLIENT_SECRET).then(function(access_token) {
	ACCESS_TOKEN = access_token;
	return access_token;
})
.then(function(access_token) {
	create_query(API_URL,access_token,sql_slug)
	.then(function(query_id){
		QUERY_ID = query_id;
		return QUERY_ID;
	})
	.then(function(){
		run_query(API_URL, ACCESS_TOKEN, QUERY_ID)
		.then(function(dynamics_fields){
			create_query(API_URL, ACCESS_TOKEN, sql_slug, dynamics_fields, chart_type)
			.then(function(query_id){
				QUERY_ID_DYNAMIC = query_id
				return query_id
			})
			.then(function(){
				add_element_to_dashboard(API_URL, ACCESS_TOKEN, dashboard_id, QUERY_ID_DYNAMIC)
				.then(function(){
					alert('Success');
				})
			})
		})
	})
})
});



